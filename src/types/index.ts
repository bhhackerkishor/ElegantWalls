export type ProductCategory = 'poster' | 'frame' | 'sticker' | 'canvas' | 'custom';

export type PaymentMethod = 'razorpay' | 'cod';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type DeliveryStatus =
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

export type CancellationStatus = 'pending' | 'approved' | 'rejected';
export type ReturnStatus = 'none' | 'requested' | 'approved' | 'rejected' | 'refunded';

export interface ProductVariant {
  sku: string;
  size: string;
  frame: string;
  material: string;
  orientation: string;
  price: number;
  stockCount: number;
}

export type UserRole = 'customer' | 'admin';

export interface Product {
  _id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  description: string;
  category: ProductCategory;
  subcategory?: string;
  seoMetaTitle?: string;
  seoMetaDescription?: string;
  image: string;
  images: string[];
  videos: string[];
  variants: ProductVariant[];
  isBestSeller: boolean;
  isTrending: boolean;
  createdAt?: string;
}

export interface CartItem {
  productId: string;
  sku: string;
  title: string;
  category: ProductCategory;
  price: number;
  quantity: number;
  size: string;
  frame: string;
  material: string;
  orientation: string;
  image: string;
  customImage?: string;
}

export interface ShippingDetails {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface TrackingEvent {
  status: string;
  description?: string;
  location?: string;
  timestamp: string | Date;
}

export interface OrderItem {
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

export interface Order {
  _id: string;
  orderNumber: string;
  userEmail: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  items: OrderItem[];
  totalAmount: number;
  subtotal:number;
  gst:number;
  shippingFee:number;
  couponApplied?: string;
  discountAmount: number;
  shippingDetails: ShippingDetails;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  deliveryStatus: DeliveryStatus;
  deliveryTimeline: string;
  trackingNumber?: string;
  courierPartner?: string;
  trackingEvents: TrackingEvent[];
  cancellationRequest?: {
    isRequested: boolean;
    reason: string;
    status: CancellationStatus;
    requestedAt?: string;
  };
  returnRequest?: {
    isRequested: boolean;
    reason: string;
    status: ReturnStatus;
    requestedAt?: string;
  };
  createdAt: string;
}

export interface UserProfile {
  _id: string;
  email: string;
  role?: UserRole;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  marketingEmails: boolean;
  wishlist: string[];
  cart: CartItem[];
  createdAt?: string;
}

export interface Banner {
  _id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  isActive: boolean;
}

export interface Coupon {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  isActive: boolean;
  expiresAt: Date;
}

export interface Review {
  _id: string;
  productId: string;
  userEmail: string;
  customerName: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: string;
}

export interface AnalyticsMetrics {
  pageviews: number;
  addToCart: number;
  clickBuy: number;
  customUploads: number;
}

export interface AnalyticsData {
  metrics: AnalyticsMetrics;
  recentEvents: Array<{ eventType: string; sessionId: string; details: Record<string, unknown>; createdAt: string }>;
  aggregates: Array<{ _id: string; count: number }>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ProductFilters {
  category?: ProductCategory;
  search?: string;
  slug?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  material?: string;
  frame?: string;
  orientation?: string;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'bestseller';
  page?: number;
  limit?: number;
}

export interface ISupportTicket {
  _id: string;
  ticketNumber: string;
  status: 'open' | 'pending' | 'resolved'; // Update these to match your actual logic
  subject: string;
  messages: {
    sender: string;
    message: string;
    timestamp: string | number | Date;
  }[];
  updatedAt:Date;
  // ... any other properties your ticket has
}

export interface SearchResult {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ShippingSettings {
  freeShippingThreshold: number;
  standardShippingFee: number;
  gstRate: number;
  estimatedDeliveryDays: string;
}

export type Theme = 'light' | 'dark';
