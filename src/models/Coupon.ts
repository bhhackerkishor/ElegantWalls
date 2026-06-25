import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  discountType: 'percentage' | 'amount';
  discountValue: number;
  minOrderValue: number;
  isActive: boolean;
  usageCount: number;
  maxUsage?: number;
  revenueGenerated: number;
  startsAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
}

const CouponSchema = new Schema<ICoupon>({
  code: {
    type: String,
    required: [true, 'Please provide a coupon code.'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  discountType: {
    type: String,
    required: true,
    enum: ['percentage', 'amount'],
    default: 'percentage',
  },
  discountValue: {
    type: Number,
    required: [true, 'Please provide a discount value.'],
  },
  minOrderValue: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  usageCount: { type: Number, default: 0 },
  maxUsage: { type: Number },
  revenueGenerated: { type: Number, default: 0 },
  startsAt: { type: Date },
  expiresAt: { type: Date },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Coupon: Model<ICoupon> = mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', CouponSchema);
export default Coupon;