import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAttemptReport extends Document {
  _id: mongoose.Types.ObjectId;
  attempt: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  assessment: mongoose.Types.ObjectId;
  reportVersion: number;
  scoringConfigVersion: number;
  scoringEngineVersion: string;
  payload: Record<string, any>;
  cohortSnapshot?: Record<string, any>;
  dataCompleteness: 'full' | 'partial';
  generatedAt: Date;
  generatedBy: 'system' | 'recompute' | 'backfill';
  supersededBy?: mongoose.Types.ObjectId;
  reviewerNotes?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  isCurrent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AttemptReportSchema = new Schema<IAttemptReport>(
  {
    attempt: {
      type: Schema.Types.ObjectId,
      ref: 'Attempt',
      required: [true, 'Attempt reference is required'],
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    assessment: {
      type: Schema.Types.ObjectId,
      ref: 'Assessment',
      required: [true, 'Assessment reference is required'],
      index: true,
    },
    reportVersion: {
      type: Number,
      required: true,
      default: 1,
    },
    scoringConfigVersion: {
      type: Number,
      required: true,
      default: 1,
    },
    scoringEngineVersion: {
      type: String,
      required: true,
      default: '1.0.0',
    },
    payload: {
      type: Schema.Types.Mixed,
      required: true,
    },
    cohortSnapshot: {
      type: Schema.Types.Mixed,
    },
    dataCompleteness: {
      type: String,
      enum: ['full', 'partial'],
      default: 'full',
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    generatedBy: {
      type: String,
      enum: ['system', 'recompute', 'backfill'],
      default: 'system',
    },
    supersededBy: {
      type: Schema.Types.ObjectId,
      ref: 'AttemptReport',
    },
    reviewerNotes: {
      type: String,
      default: '',
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    isCurrent: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

AttemptReportSchema.index({ attempt: 1, reportVersion: 1 }, { unique: true });
AttemptReportSchema.index({ attempt: 1, isCurrent: 1 });
AttemptReportSchema.index({ user: 1, generatedAt: -1 });

const AttemptReport: Model<IAttemptReport> =
  mongoose.models.AttemptReport || mongoose.model<IAttemptReport>('AttemptReport', AttemptReportSchema);

export default AttemptReport;
