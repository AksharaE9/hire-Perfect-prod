import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAttemptAnswer extends Document {
  _id: mongoose.Types.ObjectId;
  attempt: mongoose.Types.ObjectId;
  question: mongoose.Types.ObjectId;
  positionShown: number;
  selectedOption: string | number | null;
  isCorrect?: boolean;
  marksAwarded: number;
  firstSeenAt: Date;
  answeredAt?: Date;
  secondsSpent: number;
  timingUnreliable: boolean;
  changeCount: number;
  previousOptions: Array<{
    option: string | number | null;
    timestamp: Date;
  }>;
  wasReached: boolean;
  wasFlaggedForReview: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AttemptAnswerSchema = new Schema<IAttemptAnswer>(
  {
    attempt: {
      type: Schema.Types.ObjectId,
      ref: 'Attempt',
      required: [true, 'Attempt reference is required'],
      index: true,
    },
    question: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: [true, 'Question reference is required'],
      index: true,
    },
    positionShown: {
      type: Number,
      required: true,
    },
    selectedOption: {
      type: Schema.Types.Mixed,
      default: null,
    },
    isCorrect: {
      type: Boolean,
      default: false,
    },
    marksAwarded: {
      type: Number,
      default: 0,
    },
    firstSeenAt: {
      type: Date,
      default: Date.now,
    },
    answeredAt: {
      type: Date,
    },
    secondsSpent: {
      type: Number,
      default: 0,
    },
    timingUnreliable: {
      type: Boolean,
      default: false,
    },
    changeCount: {
      type: Number,
      default: 0,
    },
    previousOptions: [
      {
        option: Schema.Types.Mixed,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    wasReached: {
      type: Boolean,
      default: true,
    },
    wasFlaggedForReview: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

AttemptAnswerSchema.index({ attempt: 1, question: 1 }, { unique: true });
AttemptAnswerSchema.index({ attempt: 1, positionShown: 1 });

const AttemptAnswer: Model<IAttemptAnswer> =
  mongoose.models.AttemptAnswer || mongoose.model<IAttemptAnswer>('AttemptAnswer', AttemptAnswerSchema);

export default AttemptAnswer;
