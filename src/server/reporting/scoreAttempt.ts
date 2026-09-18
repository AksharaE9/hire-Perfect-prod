import { AttemptInput, ScoringConfigRule, AttemptReport } from './types';

export interface ScoreCalculationResult {
  rawScore: number;
  maxScore: number;
  percentage: number;
  weightedPercentage: number | null;
  weightingSkippedReason: string | null;
  band: {
    key: 'expert' | 'proficient' | 'developing' | 'foundational';
    label: string;
    description: string;
  };
  passThresholdPercent: number | null;
  passed: boolean | null;
  counts: {
    total: number;
    correct: number;
    incorrect: number;
    unanswered: number;
    notReached: number;
  };
  methodology: {
    marksPerCorrect: number;
    negativeMarking: number;
    difficultyWeighted: boolean;
    passThreshold: number;
  };
}

export function scoreAttempt(
  input: AttemptInput,
  config: ScoringConfigRule
): ScoreCalculationResult {
  const { questions, answers } = input;
  const answerMap = new Map(answers.map((a) => [a.questionId, a]));

  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;
  let notReachedCount = 0;

  let rawScore = 0;
  let maxScore = 0;

  // Track weighted components
  let hasUntaggedDifficulty = false;
  let weightedEarnedSum = 0;
  let weightedMaxSum = 0;

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const a = answerMap.get(q.id);

    const questionPoints = typeof q.points === 'number' && q.points > 0 ? q.points : 1;
    const marksForCorrect = (config.marksPerCorrect ?? 1.0) * questionPoints;
    maxScore += marksForCorrect;

    // Difficulty weighting check
    const diff = q.difficulty;
    const diffWeight =
      diff === 'easy'
        ? config.difficultyWeights?.easy ?? 1.0
        : diff === 'medium'
        ? config.difficultyWeights?.medium ?? 1.25
        : diff === 'hard'
        ? config.difficultyWeights?.hard ?? 1.5
        : null;

    if (diffWeight === null) {
      hasUntaggedDifficulty = true;
    }

    if (!a) {
      // Not reached
      notReachedCount++;
      // 0 marks awarded
      continue;
    }

    const wasReached = a.wasReached !== false;
    const isAnswered =
      a.selectedOption !== null &&
      a.selectedOption !== undefined &&
      a.selectedOption !== '';

    if (!wasReached) {
      notReachedCount++;
      continue;
    }

    if (!isAnswered) {
      unansweredCount++;
      rawScore += config.marksForUnanswered ?? 0;
      if (diffWeight !== null) {
        weightedEarnedSum += (config.marksForUnanswered ?? 0) * diffWeight;
        weightedMaxSum += marksForCorrect * diffWeight;
      }
      continue;
    }

    // Question was answered
    const selectedNumeric = Number(a.selectedOption);
    const correctNumeric = Number(q.correctAnswer);
    const isCorrect = selectedNumeric === correctNumeric;

    if (isCorrect) {
      correctCount++;
      rawScore += marksForCorrect;
      if (diffWeight !== null) {
        weightedEarnedSum += marksForCorrect * diffWeight;
        weightedMaxSum += marksForCorrect * diffWeight;
      }
    } else {
      incorrectCount++;
      const penalty = (config.negativeMarking ?? 0) * questionPoints;
      rawScore -= penalty;
      if (diffWeight !== null) {
        weightedEarnedSum -= penalty * diffWeight;
        weightedMaxSum += marksForCorrect * diffWeight;
      }
    }
  }

  // Prevent negative raw score
  rawScore = Math.max(0, Number(rawScore.toFixed(2)));
  maxScore = Math.max(1, Number(maxScore.toFixed(2)));

  const percentage = Number(Math.min(100, Math.max(0, (rawScore / maxScore) * 100)).toFixed(1));

  // Difficulty Weighted Score
  let weightedPercentage: number | null = null;
  let weightingSkippedReason: string | null = null;

  if (config.difficultyWeighting) {
    if (hasUntaggedDifficulty) {
      weightedPercentage = null;
      weightingSkippedReason = 'untagged_questions';
    } else if (weightedMaxSum > 0) {
      const calcWeighted = (weightedEarnedSum / weightedMaxSum) * 100;
      weightedPercentage = Number(Math.min(100, Math.max(0, calcWeighted)).toFixed(1));
    }
  }

  // Band Mapping
  const bands = config.bands || [];
  let matchedBand = bands.find((b) => percentage >= b.minPercent && percentage <= b.maxPercent);

  if (!matchedBand) {
    if (percentage >= 85) {
      matchedBand = {
        key: 'expert',
        label: 'Expert',
        minPercent: 85,
        maxPercent: 100,
        description: 'Strong command across all assessment topics, consistently solving high-complexity problems.',
      };
    } else if (percentage >= 70) {
      matchedBand = {
        key: 'proficient',
        label: 'Proficient',
        minPercent: 70,
        maxPercent: 84.9,
        description: 'Solid working domain knowledge with minor gaps in specialized areas.',
      };
    } else if (percentage >= 55) {
      matchedBand = {
        key: 'developing',
        label: 'Developing',
        minPercent: 55,
        maxPercent: 69.9,
        description: 'Foundational grasp of core principles; several sub-skills require further study.',
      };
    } else {
      matchedBand = {
        key: 'foundational',
        label: 'Foundational',
        minPercent: 0,
        maxPercent: 54.9,
        description: 'Early-stage familiarity with introductory concepts in this discipline.',
      };
    }
  }

  const passThreshold = config.passThresholdPercent ?? 60.0;
  const passed = passThreshold !== null ? percentage >= passThreshold : null;

  return {
    rawScore,
    maxScore,
    percentage,
    weightedPercentage,
    weightingSkippedReason,
    band: {
      key: matchedBand.key,
      label: matchedBand.label,
      description: matchedBand.description,
    },
    passThresholdPercent: passThreshold,
    passed,
    counts: {
      total: questions.length,
      correct: correctCount,
      incorrect: incorrectCount,
      unanswered: unansweredCount,
      notReached: notReachedCount,
    },
    methodology: {
      marksPerCorrect: config.marksPerCorrect ?? 1.0,
      negativeMarking: config.negativeMarking ?? 0.0,
      difficultyWeighted: Boolean(config.difficultyWeighting && !hasUntaggedDifficulty),
      passThreshold,
    },
  };
}
