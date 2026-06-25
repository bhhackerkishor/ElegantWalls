import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IShippingSettings extends Document {
  key: string; // Used to fetch specific profiles e.g., "global_shipping"
  freeShippingThreshold: number;
  standardShippingFee: number;
  gstRate: number;
  estimatedDeliveryDays: string;
  codEnabled: boolean;
  razorpayEnabled: boolean;
  updatedAt: Date;
}

const ShippingSettingsSchema = new Schema<IShippingSettings>({
  key: { type: String, required: true, unique: true, default: 'global_shipping' },
  freeShippingThreshold: { type: Number, default: 500 },
  standardShippingFee: { type: Number, default: 80 },
  gstRate: { type: Number, default: 18 },
  estimatedDeliveryDays: { type: String, default: '3 to 5 working days' },
  codEnabled: { type: Boolean, default: true },
  razorpayEnabled: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now },
});

const ShippingSettings: Model<IShippingSettings> =
  mongoose.models.ShippingSettings ||
  mongoose.model<IShippingSettings>('ShippingSettings', ShippingSettingsSchema);

export default ShippingSettings;
