import type { DeliveryStatus, ProductCategory } from '@/types';

export const SITE_NAME = 'Elegant Walls';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://elegantwalls.in';
export const SITE_DESCRIPTION =
  'Premium wall posters, photo frames, canvas prints, wall stickers & custom prints. Design your memory wall with custom sizes. Delivery across India.';

export const WHATSAPP_NUMBER = '919876543210';
export const SUPPORT_EMAIL = 'elegantwalls.prints@gmail.com';
export const INSTAGRAM_URL = 'https://www.instagram.com/elgant.walls/';

// ⭐ UPGRADED CORE TAXONOMY ENGINE CONFIGURATION
export const PRODUCT_CATEGORIES: Record<
  ProductCategory,
  { 
    label: string; 
    slug: string; 
    description: string; 
    icon: string; 
    colorClass: string; 
    bgLight: string 
  }
> = {
  poster: {
    label: 'Posters',
    slug: 'posters',
    description: 'Premium matte & glossy wall posters in custom sizes',
    icon: 'FiFileText',
    colorClass: 'text-blue-500 border-blue-500/20',
    bgLight: 'bg-blue-500/10'
  },
  frame: {
    label: 'Photo Frames',
    slug: 'photo-frames',
    description: 'Handcrafted oak, walnut & premium photo frames',
    icon: 'FiPackage',
    colorClass: 'text-amber-500 border-amber-500/20',
    bgLight: 'bg-amber-500/10'
  },
  sticker: {
    label: 'Wall Stickers',
    slug: 'wall-stickers',
    description: 'Removable vinyl wall stickers & decals',
    icon: 'FiTag',
    colorClass: 'text-emerald-500 border-emerald-500/20',
    bgLight: 'bg-emerald-500/10'
  },
  canvas: {
    label: 'Canvas Prints',
    slug: 'canvas-prints',
    description: 'Gallery-wrap canvas prints with vibrant colors',
    icon: 'FiLayers',
    colorClass: 'text-purple-500 border-purple-500/20',
    bgLight: 'bg-purple-500/10'
  },
  custom: {
    label: 'Custom Prints',
    slug: 'custom-prints',
    description: 'Upload your photos for custom wall art',
    icon: 'FiCompass',
    colorClass: 'text-rose-500 border-rose-500/20',
    bgLight: 'bg-rose-500/10'
  },
};

export const ORDER_TRACKING_STAGES: Array<{
  key: DeliveryStatus;
  label: string;
  description: string;
}> = [
  { key: 'PLACED', label: 'Order Placed', description: 'Your order has been received' },
  { key: 'CONFIRMED', label: 'Confirmed', description: 'Payment verified & order confirmed' },
  { key: 'PROCESSING', label: 'Processing', description: 'Order is being prepared' },
  { key: 'PRINTING', label: 'Printing', description: 'Your design is being printed' },
  { key: 'FRAMING', label: 'Framing', description: 'Frame assembly in progress' },
  { key: 'QUALITY_CHECK', label: 'Quality Check', description: 'Final quality inspection' },
  { key: 'PACKED', label: 'Packed', description: 'Order packed and ready to ship' },
  { key: 'SHIPPED', label: 'Shipped', description: 'Handed to courier partner' },
  { key: 'IN_TRANSIT', label: 'In Transit', description: 'Package is on the way' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', description: 'Arriving today' },
  { key: 'DELIVERED', label: 'Delivered', description: 'Successfully delivered' },
  { key: 'CANCELLED', label: 'Cancelled', description: 'Order was cancelled' },
];

export const DEFAULT_SHIPPING = {
  freeShippingThreshold: 500,
  standardShippingFee: 80,
  gstRate: 18,
  estimatedDeliveryDays: '3 to 5 working days',
};

export const SIZE_OPTIONS = ['A4 Size', 'A3 Size', 'Medium (8x10 in)', 'Large (12x15 in)', 'Huge (12x18 in)'];
export const FRAME_OPTIONS = ['None', 'Natural Oak Finish', 'Midnight Black', 'Royal Gold', 'Dark Walnut'];
export const MATERIAL_OPTIONS = ['Matte Paper', 'Glossy Film', 'Canvas Print', 'Vinyl Sticker', 'Premium Cardstock'];
export const ORIENTATION_OPTIONS = ['Portrait', 'Landscape', 'Square'];

export const FAQ_ITEMS = [
  { q: 'What is your delivery timeline?', a: 'We deliver across all of India in 3 to 5 working days.' },
  { q: 'Can I customize frame sizes?', a: 'Yes! Choose a product and select dimensions or upload image tokens.' },
  { q: 'What materials do you use?', a: '280+ GSM double-matte cardstock with high-fidelity production finishes.' },
  { q: 'What is your return policy?', a: 'We offer 100% free replacements for transit damage.' }
];

export const TRUST_BADGES = [
  { icon: 'FiTruck', label: 'Free Shipping', sub: 'On orders above ₹500' },
  { icon: 'FiShield', label: 'Secure Payments', sub: 'Razorpay & COD' },
  { icon: 'FiRefreshCw', label: 'Easy Returns', sub: 'Damage replacement' },
  { icon: 'FiAward', label: 'Premium Quality', sub: 'Handcrafted frames' },
];

export const INSTAGRAM_GALLERY = [
  'https://www.instagram.com/stories/highlights/17946421310938178/',
  'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=400',
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=400',
  'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=400',
  'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=400',
  'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=400',
];