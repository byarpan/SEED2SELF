import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  _id: mongoose.Types.ObjectId;
  targetUserId: mongoose.Types.ObjectId;
  reviewerId: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema<IReview>(
  {
    targetUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    reviewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, default: '' },
  },
  {
    timestamps: true,
  }
);

export const Review =
  mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

export default Review;
