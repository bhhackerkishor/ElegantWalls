import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Coupon from '@/models/Coupon';
import ShippingSettings from '@/models/ShippingSettings'; // Import Settings model
import Razorpay from 'razorpay';
import {
  mapCartToOrderItems,
  verifyCartPrices,
  generateOrderNumber,
  getInitialTrackingEvents,
  computeCheckoutTotal,
} from '@/lib/orders';
import { successResponse, errorResponse } from '@/lib/api-response';
import type { CartItem, ShippingDetails } from '@/types';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { email, cartItems, shippingDetails, couponApplied, paymentMethod } = await request.json() as {
      email: string;
      cartItems: CartItem[];
      shippingDetails: ShippingDetails;
      couponApplied?: string;
      paymentMethod?: string;
    };
    
    if (!email || !cartItems?.length || !shippingDetails) {
      return errorResponse('Missing checkout information.');
    }

    // 1. Fetch Dynamic Admin Settings (with safe code fallbacks)
    const config = await ShippingSettings.findOne({ key: 'global_shipping' }).lean() || {
      freeShippingThreshold: 500,
      standardShippingFee: 80,
      gstRate: 18,
      estimatedDeliveryDays: '3 to 5 working days'
    };

    // Verify stock and price constraints
    const { subtotal, error: priceError } = await verifyCartPrices(cartItems);
    if (priceError) return errorResponse(priceError);

    // 2. Handle Coupon Deduction Calculations
    let discountAmount = 0;
    if (couponApplied) {
      const coupon = await Coupon.findOne({ code: couponApplied.toUpperCase(), isActive: true });
      if (coupon && subtotal >= coupon.minOrderValue) {
        discountAmount =
          coupon.discountType === 'percentage'
            ? Math.round((subtotal * coupon.discountValue) / 100)
            : Math.min(coupon.discountValue, subtotal);
      }
    }

    // 3. Run Live Administrative Calculations
    const amountAfterDiscount = subtotal - discountAmount;
    
    // Evaluate live shipping tiers
    const shippingFee = amountAfterDiscount >= config.freeShippingThreshold ? 0 : config.standardShippingFee;
    
    // Evaluate dynamic tax rates
    const gstAmount = Math.round(amountAfterDiscount * (config.gstRate / 100));
    
    // Accumulate actual final total
    const finalSettledAmount = amountAfterDiscount + gstAmount + shippingFee;

    const orderNumber = await generateOrderNumber();

    // 4. Record Permanently into Mongoose Model
    const order = await Order.create({
      orderNumber,
      userEmail: email,
      items: mapCartToOrderItems(cartItems),
      
      // Breakdown logs stored directly to prevent breakdown shifting during config updates
      subtotal: subtotal,
      discountAmount: discountAmount,
      gst: gstAmount,
      shippingFee: shippingFee,
      totalAmount: finalSettledAmount,
      
      couponApplied,
      shippingDetails,
      deliveryTimeline: config.estimatedDeliveryDays,
      paymentMethod: (paymentMethod === 'cod' ? 'cod' : 'razorpay') as 'razorpay' | 'cod',
      paymentStatus: 'pending',
      trackingEvents: getInitialTrackingEvents(),
    });

    // 5. Initialize Electronic Razorpay Transaction Node
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return errorResponse('Razorpay credentials missing from core environmental flags.', 500);
    }
    
    const instance = new Razorpay({ key_id: keyId, key_secret: keySecret });
    
    const razorpayOrder = await instance.orders.create({
      amount: finalSettledAmount * 100, // Amount represented in native paise configurations
      currency: 'INR',
      receipt: order._id.toString(),
    });
    
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    return successResponse({
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: finalSettledAmount,
      currency: 'INR',
      keyId,
    });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Server error', 500);
  }
}