import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserCartItem {
  productId: string;
  sku: string;
  title: string;
  category: string;
  price: number;
  quantity: number;
  size: string;
  frame: string;
  material: string;
  orientation: string;
  customImage?: string;
}

export type UserRole = 'customer' | 'admin';

export interface IUser extends Document {
  email: string;
  role: UserRole;
  otp?: string | null;
  otpExpiry?: Date | null;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  marketingEmails: boolean;
  wishlist: string[];
  recentlyViewed: string[];
  cart: IUserCartItem[];
  createdAt: Date;
}

const UserCartItemSchema = new Schema<IUserCartItem>({
  productId: { type: String, required: true },
  sku: { type: String, required: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  size: { type: String, required: true },
  frame: { type: String, required: true },
  material: { type: String, required: true },
  orientation: { type: String, required: true },
  customImage: { type: String },
});

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Please provide an email address.'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer',
  },
  otp: {
    type: String,
    default: null,
  },
  otpExpiry: {
    type: Date,
    default: null,
  },
  name: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    default: '',
  },
  address: {
    type: String,
    default: '',
  },
  city: {
    type: String,
    default: '',
  },
  state: {
    type: String,
    default: '',
  },
  zipCode: {
    type: String,
    default: '',
  },
  marketingEmails: {
    type: Boolean,
    default: true,
  },
  wishlist: [{ type: String }],
  recentlyViewed: [{ type: String }],
  cart: [UserCartItemSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
