import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHomepageSection extends Document {
  key: string;
  label: string;
  enabled: boolean;
  sortOrder: number;
  config: Record<string, unknown>;
  updatedAt: Date;
}

const HomepageSectionSchema = new Schema<IHomepageSection>({
  key: { type: String, required: true, unique: true },
  label: { type: String, required: true },
  enabled: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  config: { type: Schema.Types.Mixed, default: {} },
  updatedAt: { type: Date, default: Date.now },
});

const HomepageSection: Model<IHomepageSection> =
  mongoose.models.HomepageSection || mongoose.model<IHomepageSection>('HomepageSection', HomepageSectionSchema);
export default HomepageSection;

export const DEFAULT_HOMEPAGE_SECTIONS = [
  { key: 'hero', label: 'Hero Banner', sortOrder: 0 },
  { key: 'categories', label: 'Category Section', sortOrder: 1 },
  { key: 'featured', label: 'Featured Products', sortOrder: 2 },
  { key: 'trending', label: 'Trending Products', sortOrder: 3 },
  { key: 'testimonials', label: 'Testimonials', sortOrder: 4 },
  { key: 'instagram', label: 'Instagram Feed', sortOrder: 5 },
  { key: 'faq', label: 'FAQ', sortOrder: 6 },
];
