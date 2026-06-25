import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISettings extends Document {
  siteName: string;
  logo: string;
  favicon: string;
  contactEmail: string;
  contactPhone: string;
  whatsapp: string;
  address: string;
  socialLinks: { instagram?: string; facebook?: string; twitter?: string; youtube?: string };
  footerContent: string;
  seoDefaults: { title: string; description: string; keywords: string[] };
  paymentSettings: { codEnabled: boolean; razorpayEnabled: boolean };
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>({
  siteName: { type: String, default: 'Elegant Walls' },
  logo: { type: String, default: '' },
  favicon: { type: String, default: '' },
  contactEmail: { type: String, default: 'elegantwalls.prints@gmail.com' },
  contactPhone: { type: String, default: '' },
  whatsapp: { type: String, default: '919876543210' },
  address: { type: String, default: '' },
  socialLinks: {
    instagram: { type: String, default: 'https://www.instagram.com/elgant.walls/' },
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
    youtube: { type: String, default: '' },
  },
  footerContent: { type: String, default: '' },
  seoDefaults: {
    title: { type: String, default: 'Elegant Walls | Premium Wall Decor India' },
    description: { type: String, default: 'Premium wall posters, photo frames, canvas prints & custom prints.' },
    keywords: { type: [String], default: ['wall decor', 'photo frames', 'posters', 'canvas prints'] },
  },
  paymentSettings: {
    codEnabled: { type: Boolean, default: true },
    razorpayEnabled: { type: Boolean, default: true },
  },
  updatedAt: { type: Date, default: Date.now },
});

const Settings: Model<ISettings> =
  mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
export default Settings;
