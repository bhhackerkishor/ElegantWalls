import type { CartItem } from '@/types';
import type { IOrderItem } from '@/models/Order';
import Product from '@/models/Product';
import { calculateOrderTotals } from './utils';
import { DEFAULT_SHIPPING } from './constants';

export function mapCartToOrderItems(cartItems: CartItem[]): IOrderItem[] {
  return cartItems.map((item) => ({
    productId: item.productId,
    sku: item.sku,
    title: item.title,
    category: item.category,
    price: item.price,
    quantity: item.quantity,
    size: item.size,
    frame: item.frame,
    material: item.material,
    orientation: item.orientation,
    customImage: item.customImage,
  }));
}

export async function verifyCartPrices(cartItems: CartItem[]): Promise<{
  subtotal: number;
  error?: string;
}> {
  let subtotal = 0;

  for (const item of cartItems) {
    const product = await Product.findById(item.productId);
    if (!product) {
      return { subtotal: 0, error: `Product ${item.title} not found.` };
    }

    const variant = product.variants.find((v) => v.sku === item.sku);
    if (!variant) {
      return { subtotal: 0, error: `Invalid variant for ${item.title}.` };
    }

    if (variant.stockCount < item.quantity) {
      return { subtotal: 0, error: `${item.title} has insufficient stock.` };
    }

    subtotal += variant.price * item.quantity;
  }

  return { subtotal };
}

export async function decrementInventory(cartItems: CartItem[]): Promise<void> {
  for (const item of cartItems) {
    await Product.updateOne(
      { _id: item.productId, 'variants.sku': item.sku },
      { $inc: { 'variants.$.stockCount': -item.quantity } }
    );
  }
}

export function computeCheckoutTotal(
  subtotal: number,
  discount = 0,
  settings = DEFAULT_SHIPPING
): number {
  return calculateOrderTotals(subtotal, discount, settings).total;
}

export async function generateOrderNumber(): Promise<string> {
  const Order = (await import('@/models/Order')).default;
  const lastOrder = await Order.findOne().sort({ createdAt: -1 });
  let nextNum = 1;
  if (lastOrder?.orderNumber) {
    const lastNum = parseInt(lastOrder.orderNumber.replace('EW2026', ''), 10);
    if (!isNaN(lastNum)) nextNum = lastNum + 1;
  }
  return 'EW2026' + String(nextNum).padStart(5, '0');
}

export function getInitialTrackingEvents() {
  return [
    {
      status: 'Order Placed',
      description: 'Thank you! Your order has been placed.',
      location: 'D2C Gateway Hub',
      timestamp: new Date(),
    },
  ];
}
