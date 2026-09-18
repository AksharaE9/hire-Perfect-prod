import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAssessmentStats extends Document {
  _id: mongoose.Types.ObjectId;
  assessment: mongoose.Types.ObjectId;
  completedCount: number;
  meanPercent: number;
  medianPercent: number;
  stddevPercent: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  lastCalculatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AssessmentStatsSchema = new Schema<IAssessmentStats>(
  {
    assessment: {
      type: Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true,
      unique: true,
      index: true,
    },
    completedCount: { type: Number, default: 0 },
    meanPercent: { type: Number, default: 0 },
    medianPercent: { type: Number, default: 0 },
    stddevPercent: { type: Number, default: 0 },
    p25: { type: Number, default: 0 },
    p50: { type: Number, default: 0 },
    p75: { type: Number, default: 0 },
    p90: { type: Number, default: 0 },
    lastCalculatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const AssessmentStats: Model<IAssessmentStats> =
  mongoose.models.AssessmentStats || mongoose.model<IAssessmentStats>('AssessmentStats', AssessmentStatsSchema);

export default AssessmentStats;
