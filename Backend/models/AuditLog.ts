import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuditLog extends Document {
  _id: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  action: string;
  attemptId?: mongoose.Types.ObjectId;
  reportId?: mongoose.Types.ObjectId;
  description?: string;
  actor?: { id: string; name: string; email: string; role: string };
  severity?: 'info' | 'warning' | 'critical';
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp?: Date;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    action: {
      type: String,
      required: true,
      index: true,
    },
    attemptId: { type: Schema.Types.ObjectId, ref: 'Attempt', index: true },
    reportId: { type: Schema.Types.ObjectId, ref: 'AttemptReport' },
    description: { type: String },
    actor: { type: Schema.Types.Mixed },
    severity: { type: String, enum: ['info', 'warning', 'critical'], default: 'info' },
    metadata: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

export default AuditLog;
