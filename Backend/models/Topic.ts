import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITopic extends Document {
  _id: mongoose.Types.ObjectId;
  categorySlug: string;
  name: string;
  slug: string;
  displayOrder: number;
  focusAreas: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TopicSchema = new Schema<ITopic>(
  {
    categorySlug: { type: String, required: true, index: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    displayOrder: { type: Number, default: 0 },
    focusAreas: { type: [String], default: [] },
  },
  { timestamps: true }
);

TopicSchema.index({ categorySlug: 1, slug: 1 }, { unique: true });

const Topic: Model<ITopic> =
  mongoose.models.Topic || mongoose.model<ITopic>('Topic', TopicSchema);

export default Topic;
