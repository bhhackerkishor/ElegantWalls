import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVariant {
  sku: string;
  size: string; // e.g. "A4 Size", "Medium (8x10 in)"
  frame: string; // e.g. "Natural Oak Finish", "Midnight Black", "None"
  material: string; // e.g. "Matte Paper", "Canvas Print", "Glossy Film", "Vinyl Sticker"
  orientation: string; // e.g. "Portrait", "Landscape", "Square"
  price: number;
  stockCount: number;
}

export interface IProduct extends Document {
  title: string;
  slug: string;
  shortDescription: string;
  collections: string[]; // e.g., ['anime', 'featured', 'sale']
  description: string;
  category: 'poster' | 'frame' | 'sticker' | 'canvas' | 'custom';
  subcategory: string;
  seoMetaTitle: string;
  seoMetaDescription: string;
  image: string;
  images: string[];
  videos: string[];
  variants: IVariant[];
  isBestSeller: boolean;
  isTrending: boolean;
  isArchived?: boolean;
  seoKeywords?: string[];
  relatedProducts?: string[];
  frequentlyBoughtTogether?: string[];
  createdAt: Date;
}

const VariantSchema = new Schema<IVariant>({
  sku: { type: String, required: true },
  size: { type: String, required: true },
  frame: { type: String, required: true },
  material: { type: String, required: true },
  orientation: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  stockCount: { type: Number, required: true, default: 100, min: 0 },
});

const ProductSchema = new Schema<IProduct>({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  shortDescription: { type: String, default: '' },
  description: { type: String, required: true },
  subcategory: { type: String, default: '' },
  seoMetaTitle: { type: String, default: '' },
  seoMetaDescription: { type: String, default: '' },
  category: { 
    type: String, 
    required: true, 
    enum: ['poster', 'frame', 'sticker', 'canvas', 'custom'],
    default: 'poster'
  },
  // Add this to your ProductSchema
  collections: { type: [String], default: [] },
  image: { type: String, required: true },
  images: { type: [String], default: [] },
  videos: { type: [String], default: [] },
  variants: [VariantSchema],
  isBestSeller: { type: Boolean, default: false },
  isTrending: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
  seoKeywords: { type: [String], default: [] },
  relatedProducts: { type: [String], default: [] },
  frequentlyBoughtTogether: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
});

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
export default Product;
export type { IVariant as ProductVariant };
export type { IProduct as ProductDoc };
