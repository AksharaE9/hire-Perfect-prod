import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProficiencyBand {
  key: 'expert' | 'proficient' | 'developing' | 'foundational';
  label: string;
  minPercent: number;
  maxPercent: number;
  description: string;
}

export interface IScoringConfig extends Document {
  _id: mongoose.Types.ObjectId;
  version: number;
  effectiveFrom: Date;
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
  bands: IProficiencyBand[];
  minQuestionsPerTopic: number;
  minCohortForPercentile: number;
  rushedAnswerSeconds: number;
  longDwellMultiplier: number;
  timePressureTailPercent: number;
  questionTimeoutSeconds: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProficiencyBandSchema = new Schema<IProficiencyBand>(
  {
    key: { type: String, enum: ['expert', 'proficient', 'developing', 'foundational'], required: true },
    label: { type: String, required: true },
    minPercent: { type: Number, required: true },
    maxPercent: { type: Number, required: true },
    description: { type: String, required: true },
  },
  { _id: false }
);

export const DEFAULT_SCORING_CONFIG_VALUES = {
  version: 1,
  effectiveFrom: new Date('2026-01-01'),
  marksPerCorrect: 1.0,
  negativeMarking: 0.0,
  marksForUnanswered: 0.0,
  difficultyWeighting: false,
  difficultyWeights: {
    easy: 1.0,
    medium: 1.25,
    hard: 1.5,
  },
  passThresholdPercent: 60.0,
  revealCorrectAnswersToCandidate: false,
  bands: [
    {
      key: 'expert' as const,
      label: 'Expert',
      minPercent: 85.0,
      maxPercent: 100.0,
      description: 'Strong command across all assessment topics, consistently solving high-complexity problems.',
    },
    {
      key: 'proficient' as const,
      label: 'Proficient',
      minPercent: 70.0,
      maxPercent: 84.9,
      description: 'Solid working domain knowledge with minor gaps in specialized areas.',
    },
    {
      key: 'developing' as const,
      label: 'Developing',
      minPercent: 55.0,
      maxPercent: 69.9,
      description: 'Foundational grasp of core principles; several sub-skills require further study.',
    },
    {
      key: 'foundational' as const,
      label: 'Foundational',
      minPercent: 0.0,
      maxPercent: 54.9,
      description: 'Early-stage familiarity with introductory concepts in this discipline.',
    },
  ],
  minQuestionsPerTopic: 4,
  minCohortForPercentile: 30,
  rushedAnswerSeconds: 8,
  longDwellMultiplier: 3.0,
  timePressureTailPercent: 15,
  questionTimeoutSeconds: 600,
};

const ScoringConfigSchema = new Schema<IScoringConfig>(
  {
    version: { type: Number, required: true, unique: true, index: true },
    effectiveFrom: { type: Date, default: Date.now },
    marksPerCorrect: { type: Number, default: 1.0 },
    negativeMarking: { type: Number, default: 0.0 },
    marksForUnanswered: { type: Number, default: 0.0 },
    difficultyWeighting: { type: Boolean, default: false },
    difficultyWeights: {
      easy: { type: Number, default: 1.0 },
      medium: { type: Number, default: 1.25 },
      hard: { type: Number, default: 1.5 },
    },
    passThresholdPercent: { type: Number, default: 60.0 },
    revealCorrectAnswersToCandidate: { type: Boolean, default: false },
    bands: { type: [ProficiencyBandSchema], default: DEFAULT_SCORING_CONFIG_VALUES.bands },
    minQuestionsPerTopic: { type: Number, default: 4 },
    minCohortForPercentile: { type: Number, default: 30 },
    rushedAnswerSeconds: { type: Number, default: 8 },
    longDwellMultiplier: { type: Number, default: 3.0 },
    timePressureTailPercent: { type: Number, default: 15 },
    questionTimeoutSeconds: { type: Number, default: 600 },
  },
  { timestamps: true }
);

const ScoringConfig: Model<IScoringConfig> =
  mongoose.models.ScoringConfig || mongoose.model<IScoringConfig>('ScoringConfig', ScoringConfigSchema);

export default ScoringConfig;
