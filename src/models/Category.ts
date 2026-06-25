import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;      // Internal identifier (e.g., 'poster')
  label: string;     // Display name (e.g., 'Posters')
  slug: string;      // URL routing slug (e.g., 'posters')
  description: string;
  icon: string;      // React Icon name string (e.g., 'FiFileText')
  colorClass: string; // Tailwind class text string
  bgLight: string;   // Light background Tailwind utility class text string
  createdAt: Date;
}

const CategorySchema: Schema = new Schema({
  name: { type: String, required: true, unique: true, lowercase: true, trim: true },
  label: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, required: true },
  icon: { type: String, default: 'FiLayers' },
  colorClass: { type: String, default: 'text-blue-500 border-blue-500/20' },
  bgLight: { type: String, default: 'bg-blue-500/10' }
}, { timestamps: true });

export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);