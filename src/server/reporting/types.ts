export const SCORING_ENGINE_VERSION = '1.0.0';

export interface ScoringConfigRule {
  id?: string;
  version: number;
  marksPerCorrect: number;
  negativeMarking: number;
  marksForUnanswered: number;
  difficultyWeighting: boolean;
  difficultyWeights: {
    easy: number;
    medium: number;
    hard: number;
  };
  passThresholdPercent: number;
  revealCorrectAnswersToCandidate: boolean;
  bands: Array<{
    key: 'expert' | 'proficient' | 'developing' | 'foundational';
    label: string;
    minPercent: number;
    maxPercent: number;
    description: string;
  }>;
  minQuestionsPerTopic: number;
  minCohortForPercentile: number;
  rushedAnswerSeconds: number;
  longDwellMultiplier: number;
  timePressureTailPercent: number;
  questionTimeoutSeconds: number;
}

export const defaultScoringConfig: ScoringConfigRule = {
  version: 1,
  marksPerCorrect: 1,
  negativeMarking: 0,
  marksForUnanswered: 0,
  difficultyWeighting: false,
  difficultyWeights: { easy: 1.0, medium: 1.25, hard: 1.5 },
  passThresholdPercent: 60,
  revealCorrectAnswersToCandidate: false,
  bands: [
    {
      key: 'expert',
      label: 'Expert',
      minPercent: 85,
      maxPercent: 100,
      description: 'Strong command across the assessment, including the harder questions.',
    },
    {
      key: 'proficient',
      label: 'Proficient',
      minPercent: 70,
      maxPercent: 84.9,
      description: 'Solid working knowledge with a few gaps.',
    },
    {
      key: 'developing',
      label: 'Developing',
      minPercent: 55,
      maxPercent: 69.9,
      description: 'Understands the basics; several areas need work.',
    },
    {
      key: 'foundational',
      label: 'Foundational',
      minPercent: 0,
      maxPercent: 54.9,
      description: 'Early-stage knowledge in this area.',
    },
  ],
  minQuestionsPerTopic: 4,
  minCohortForPercentile: 30,
  rushedAnswerSeconds: 8,
  longDwellMultiplier: 3.0,
  timePressureTailPercent: 15,
  questionTimeoutSeconds: 600,
};

export interface QuestionData {
  id: string;
  position: number;
  text: string;
  options: string[];
  correctAnswer: number;
  points: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  topicId?: string;
  topicName?: string;
  tags?: string[];
}

export interface AnswerData {
  questionId: string;
  positionShown: number;
  selectedOption: number | string | null;
  firstSeenAt?: Date | string;
  answeredAt?: Date | string;
  secondsSpent: number;
  timingUnreliable?: boolean;
  changeCount?: number;
  previousOptions?: Array<{ option: any; timestamp: Date | string }>;
  wasReached?: boolean;
  wasFlaggedForReview?: boolean;
}

export interface ProctoringEventData {
  id?: string;
  type: string;
  label?: string;
  startedAt: Date | string;
  durationSeconds?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
  metadata?: Record<string, any>;
}

export interface CohortStatsData {
  completedCount: number;
  meanPercent: number;
  medianPercent: number;
  stddevPercent: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
}

export interface AttemptInput {
  attemptId: string;
  assessmentId: string;
  assessmentName: string;
  categoryName: string;
  candidateName: string;
  candidateId?: string;
  startedAt: Date | string;
  submittedAt?: Date | string;
  durationLimitSeconds: number;
  totalSessionSeconds: number;
  wasAutoSubmitted: boolean;
  status: 'completed' | 'terminated' | 'in_progress';
  questions: QuestionData[];
  answers: AnswerData[];
  proctoringEvents: ProctoringEventData[];
  cohortStats?: CohortStatsData | null;
  topicFocusAreaMap?: Record<string, string[]>;
  reportVersion?: number;
  dataCompleteness?: 'full' | 'partial';
}

export interface AttemptReport {
  meta: {
    attemptId: string;
    assessmentId: string;
    assessmentName: string;
    categoryName: string;
    candidateName: string;
    submittedAt: string;
    durationSeconds: number;
    timeLimitSeconds: number;
    wasAutoSubmitted: boolean;
    reportVersion: number;
    scoringConfigVersion: number;
    scoringEngineVersion: string;
    dataCompleteness: 'full' | 'partial';
  };
  score: {
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
  };
  topics: {
    available: boolean;
    unavailableReason: string | null;
    items: Array<{
      topicId: string;
      name: string;
      questionCount: number;
      correct: number;
      percentage: number | null;
      lowConfidence: boolean;
      suppressedReason?: string;
    }>;
    strengths: string[];
    gaps: string[];
  };
  timing: {
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
  };
  comparison: {
    available: boolean;
    unavailableReason: string | null;
    cohortCount: number;
    percentile: number | null;
    meanPercent: number | null;
    cutPoints: {
      p25: number;
      p50: number;
      p75: number;
      p90: number;
    } | null;
  };
  integrity: {
    tier: 'clean' | 'review' | 'major';
    summaryLine: string;
    coverage: {
      proctoringActiveSeconds: number;
      attemptSeconds: number;
      coveragePercent: number;
      gaps: Array<{ from: string; to: string; reason: string }>;
    };
    counts: Record<string, number>;
    events: Array<{
      type: string;
      label: string;
      startedAt: string;
      durationSeconds: number;
      severity: 'low' | 'medium' | 'high' | 'critical';
    }>;
  };
  questions: Array<{
    position: number;
    questionId: string;
    topicName: string;
    difficulty: 'easy' | 'medium' | 'hard';
    questionText: string;
    selectedOptionIndex: number | null;
    selectedOptionLabel: string | null;
    correctOptionIndex?: number;
    correctOptionLabel?: string;
    isCorrect: boolean;
    isAnswered: boolean;
    wasReached: boolean;
    secondsSpent: number;
    changeCount: number;
    timingUnreliable: boolean;
  }>;
  reliability: {
    statement: string;
    caveats: string[];
  };
  recommendations: Array<{
    topicName: string;
    focusAreas: string[];
  }>;
}
