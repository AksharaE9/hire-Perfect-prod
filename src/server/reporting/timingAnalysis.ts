import { AttemptInput, ScoringConfigRule } from './types';

export interface TimingAnalysisResult {
  available: boolean;
  unreliableQuestionCount: number;
  totalSeconds: number;
  timeLimitSeconds: number;
  timeUsedPercent: number;
  medianSecondsPerQuestion: number;
  rushedCount: number;
  rushedIncorrectCount: number;
  longDwellCount: number;
  finalStretch: {
    earlierAccuracy: number;
    finalAccuracy: number;
    dropNoted: boolean;
    note?: string;
  } | null;
  answerChanges: {
    total: number;
    toCorrect: number;
    toIncorrect: number;
  };
  observations: string[];
}

function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 !== 0) {
    return sorted[mid];
  }
  return Number(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(1));
}

export function computeTimingAnalysis(
  input: AttemptInput,
  config: ScoringConfigRule
): TimingAnalysisResult {
  const { questions, answers, durationLimitSeconds, totalSessionSeconds } = input;
  const rushedLimit = config.rushedAnswerSeconds ?? 8;
  const dwellMultiplier = config.longDwellMultiplier ?? 3.0;

  const answerMap = new Map(answers.map((a) => [a.questionId, a]));

  const timeLimitSeconds = durationLimitSeconds > 0 ? durationLimitSeconds : 3000;
  const totalSeconds = totalSessionSeconds > 0 ? totalSessionSeconds : 0;
  const timeUsedPercent = Number(Math.min(100, (totalSeconds / timeLimitSeconds) * 100).toFixed(1));

  const validTimes: number[] = [];
  let unreliableCount = 0;
  let rushedCount = 0;
  let rushedIncorrectCount = 0;
  let changeTotal = 0;
  let toCorrect = 0;
  let toIncorrect = 0;

  // First pass: collect times and calculate answer changes
  for (const q of questions) {
    const a = answerMap.get(q.id);
    if (!a) continue;

    if (a.timingUnreliable) {
      unreliableCount++;
    }

    if (typeof a.secondsSpent === 'number' && a.secondsSpent > 0) {
      validTimes.push(a.secondsSpent);

      const isAnswered =
        a.selectedOption !== null &&
        a.selectedOption !== undefined &&
        a.selectedOption !== '';
      const isCorrect = isAnswered && Number(a.selectedOption) === Number(q.correctAnswer);

      if (a.secondsSpent <= rushedLimit && isAnswered) {
        rushedCount++;
        if (!isCorrect) {
          rushedIncorrectCount++;
        }
      }
    }

    // Answer changes
    if (a.changeCount && a.changeCount > 0) {
      changeTotal += a.changeCount;
      const currentCorrect = Number(a.selectedOption) === Number(q.correctAnswer);
      if (a.previousOptions && a.previousOptions.length > 0) {
        const lastPrev = a.previousOptions[a.previousOptions.length - 1].option;
        const prevCorrect = Number(lastPrev) === Number(q.correctAnswer);
        if (!prevCorrect && currentCorrect) {
          toCorrect++;
        } else if (prevCorrect && !currentCorrect) {
          toIncorrect++;
        }
      }
    }
  }

  const medianSeconds = calculateMedian(validTimes);
  const longDwellThreshold = medianSeconds > 0 ? medianSeconds * dwellMultiplier : 120;

  let longDwellCount = 0;
  for (const time of validTimes) {
    if (time >= longDwellThreshold) {
      longDwellCount++;
    }
  }

  // Final stretch accuracy analysis (if >= 20 questions)
  let finalStretch: TimingAnalysisResult['finalStretch'] = null;
  const totalQ = questions.length;

  if (totalQ >= 20) {
    const tailCount = Math.max(3, Math.round(totalQ * ((config.timePressureTailPercent ?? 15) / 100)));
    const splitIndex = totalQ - tailCount;

    let earlyCorrect = 0;
    let earlyTotal = 0;
    let lateCorrect = 0;
    let lateTotal = 0;

    for (let i = 0; i < totalQ; i++) {
      const q = questions[i];
      const a = answerMap.get(q.id);
      const isCorrect = a && Number(a.selectedOption) === Number(q.correctAnswer);

      if (i < splitIndex) {
        earlyTotal++;
        if (isCorrect) earlyCorrect++;
      } else {
        lateTotal++;
        if (isCorrect) lateCorrect++;
      }
    }

    const earlyAcc = earlyTotal > 0 ? (earlyCorrect / earlyTotal) * 100 : 0;
    const lateAcc = lateTotal > 0 ? (lateCorrect / lateTotal) * 100 : 0;
    const drop = earlyAcc - lateAcc;
    const dropNoted = drop >= 20.0;

    finalStretch = {
      earlierAccuracy: Number(earlyAcc.toFixed(1)),
      finalAccuracy: Number(lateAcc.toFixed(1)),
      dropNoted,
      note: dropNoted
        ? 'Accuracy fell in the final questions, which often indicates time pressure.'
        : undefined,
    };
  }

  // Observations
  const observations: string[] = [];

  if (medianSeconds > 0) {
    observations.push(`Median time spent per question was ${Math.round(medianSeconds)} seconds.`);
  }

  if (rushedCount > 0) {
    observations.push(
      `${rushedCount} ${rushedCount === 1 ? 'question was' : 'questions were'} answered rapidly in under ${rushedLimit}s${
        rushedIncorrectCount > 0 ? ` (${rushedIncorrectCount} incorrect)` : ''
      }.`
    );
  } else {
    observations.push('No rushed answers detected; pacing remained deliberate throughout.');
  }

  if (longDwellCount > 0) {
    observations.push(
      `${longDwellCount} ${longDwellCount === 1 ? 'question involved' : 'questions involved'} deep dwell time exceeding 3× the median pace.`
    );
  }

  if (changeTotal > 0) {
    observations.push(
      `Candidate changed answers ${changeTotal} ${changeTotal === 1 ? 'time' : 'times'} (${toCorrect} switched to correct, ${toIncorrect} switched to incorrect).`
    );
  }

  if (finalStretch && finalStretch.dropNoted) {
    observations.push(finalStretch.note!);
  }

  const available = validTimes.length > 0 || totalSeconds > 0;

  return {
    available,
    unreliableQuestionCount: unreliableCount,
    totalSeconds,
    timeLimitSeconds,
    timeUsedPercent,
    medianSecondsPerQuestion: medianSeconds,
    rushedCount,
    rushedIncorrectCount,
    longDwellCount,
    finalStretch,
    answerChanges: {
      total: changeTotal,
      toCorrect,
      toIncorrect,
    },
    observations,
  };
}
