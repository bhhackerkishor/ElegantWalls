import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBanner extends Document {
  title: string;
  subtitle?: string;
  image: string;
  link: string;
  isActive: boolean;
  type: 'hero' | 'promotional' | 'category';
  sortOrder: number;
  createdAt: Date;
}

const BannerSchema = new Schema<IBanner>({
  title: { type: String, required: true },
  subtitle: { type: String },
  image: { type: String, required: true },
  link: { type: String, default: '/' },
  isActive: { type: Boolean, default: true },
  type: { type: String, enum: ['hero', 'promotional', 'category'], default: 'hero' },
  sortOrder: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const Banner: Model<IBanner> = mongoose.models.Banner || mongoose.model<IBanner>('Banner', BannerSchema);
export default Banner;
