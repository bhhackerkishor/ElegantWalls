import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITrackingEvent {
  status: string;
  description?: string;
  location?: string;
  timestamp: Date;
}

export interface IOrderItem {
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

export interface IShippingDetails {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  userEmail: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  items: IOrderItem[];
  
  // Amount breakdown (added from schema update)
  subtotal: number;
  gst: number;
  shippingFee: number;
  totalAmount: number;
  
  couponApplied?: string;
  discountAmount: number;
  
  shippingDetails: IShippingDetails;
  paymentMethod: 'razorpay' | 'cod';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  deliveryStatus: 
    | 'PLACED'
    | 'CONFIRMED'
    | 'PROCESSING'
    | 'PRINTING'
    | 'FRAMING'
    | 'QUALITY_CHECK'
    | 'SHIPPED'
    | 'IN_TRANSIT'
    | 'OUT_FOR_DELIVERY'
    | 'DELIVERED'
    | 'PACKED'
    | 'CANCELLED';
  deliveryTimeline: string;
  adminNotes?: string;
  customerNotes?: string;
  trackingNumber?: string;
  courierPartner?: string;
  trackingEvents: ITrackingEvent[];
  
  cancellationRequest?: {
    isRequested: boolean;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    requestedAt?: Date;
  };
  
  returnRequest?: {
    isRequested: boolean;
    reason: string;
    status: 'none' | 'requested' | 'approved' | 'rejected' | 'refunded';
    requestedAt?: Date;
  };
  
  createdAt: Date;
}

const TrackingEventSchema = new Schema<ITrackingEvent>({
  status: { type: String, required: true },
  description: { type: String },
  location: { type: String, default: 'Facility Hub' },
  timestamp: { type: Date, default: Date.now },
});

const OrderItemSchema = new Schema<IOrderItem>({
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

const ShippingDetailsSchema = new Schema<IShippingDetails>({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
});

const OrderSchema = new Schema<IOrder>({
  orderNumber: { type: String, required: true, unique: true },
  userEmail: { type: String, required: true, lowercase: true, trim: true },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  items: [OrderItemSchema],
  
  // Amount breakdown
  gst: { type: Number, required: true, default: 0 },
  shippingFee: { type: Number, required: true, default: 0 },
  subtotal: { type: Number, required: true, default: 0 },
  totalAmount: { type: Number, required: true },
  
  couponApplied: { type: String },
  discountAmount: { type: Number, default: 0 },
  
  shippingDetails: { type: ShippingDetailsSchema, required: true },
  paymentMethod: { type: String, enum: ['razorpay', 'cod'], default: 'razorpay' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  
  deliveryStatus: {
    type: String,
    enum: [
      'PLACED',
      'CONFIRMED',
      'PROCESSING',
      'PRINTING',
      'FRAMING',
      'QUALITY_CHECK',
      'SHIPPED',
      'IN_TRANSIT',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'PACKED',
      'CANCELLED',
    ],
    default: 'PLACED',
  },
  deliveryTimeline: { type: String, default: '3 to 5 working days' },
  adminNotes: { type: String, default: '' },
  customerNotes: { type: String, default: '' },
  trackingNumber: { type: String },
  courierPartner: { type: String },
  trackingEvents: [TrackingEventSchema],
  
  cancellationRequest: {
    isRequested: { type: Boolean, default: false },
    reason: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    requestedAt: { type: Date },
  },
  returnRequest: {
    isRequested: { type: Boolean, default: false },
    reason: { type: String, default: '' },
    status: { type: String, enum: ['none', 'requested', 'approved', 'rejected', 'refunded'], default: 'none' },
    requestedAt: { type: Date },
  },
  createdAt: { type: Date, default: Date.now },
});

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
export type { IOrderItem as OrderItemDoc };
export type { IOrder as OrderDoc };
export type { IShippingDetails as OrderShippingDetails };
export type { ITrackingEvent as OrderTrackingEvent };