import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReview extends Document {
  productId: string;
  userEmail: string;
  customerName: string;
  rating: number; // 1 to 5
  comment: string;
  approved: boolean;
  photos: string[];
  isFeatured: boolean;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  productId: { type: String, required: true },
  userEmail: { type: String, required: true, lowercase: true, trim: true },
  customerName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  approved: { type: Boolean, default: false },
  photos: { type: [String], default: [] },
  isFeatured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Review: Model<IReview> = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
export default Review;
