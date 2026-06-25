import type { CartItem, Product, ProductVariant } from '@/types';
import { DEFAULT_SHIPPING } from './constants';

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getStartingPrice(product: Product): number {
  if (!product.variants?.length) return 0;
  return Math.min(...product.variants.map((v) => v.price));
}

export function getVariantBySku(product: Product, sku: string): ProductVariant | undefined {
  return product.variants.find((v) => v.sku === sku);
}

export function generateSku(
  productSlug: string,
  size: string,
  frame: string,
  material: string,
  orientation: string
): string {
  const parts = [productSlug, size, frame, material, orientation]
    .map((p) => p.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
    .filter(Boolean);
  return parts.join('-').slice(0, 80);
}

export function calculateOrderTotals(
  subtotal: number,
  discount = 0,
  settings = DEFAULT_SHIPPING
): { subtotal: number; discount: number; gst: number; shipping: number; total: number } {
  const afterDiscount = Math.max(0, subtotal - discount);
  const gst = Math.round((afterDiscount * settings.gstRate) / 100);
  const shipping = afterDiscount >= settings.freeShippingThreshold ? 0 : settings.standardShippingFee;
  const total = afterDiscount + gst + shipping;
  return { subtotal, discount, gst, shipping, total };
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function parseAddress(fullAddress: string): {
  address: string;
  city: string;
  state: string;
  pincode: string;
} {
  const pincodeMatch = fullAddress.match(/\b(\d{6})\b/);
  const pincode = pincodeMatch?.[1] || '';
  const parts = fullAddress.split(',').map((p) => p.trim());
  return {
    address: parts[0] || fullAddress,
    city: parts[1] || '',
    state: parts[2]?.replace(/\d{6}/, '').trim() || '',
    pincode,
  };
}

export function cartItemKey(item: Pick<CartItem, 'productId' | 'sku' | 'customImage'>): string {
  return `${item.productId}:${item.sku}:${item.customImage || ''}`;
}

export function getDeliveryStageIndex(status: string): number {
  const stages = [
    'PLACED',
    'CONFIRMED',
    'PROCESSING',
    'PRINTING',
    'FRAMING',
    'QUALITY_CHECK',
    'PACKED',
    'SHIPPED',
    'IN_TRANSIT',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
  ];
  const idx = stages.indexOf(status);
  return idx >= 0 ? idx : 0;
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}
