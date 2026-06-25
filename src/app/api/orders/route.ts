import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Analytics from '@/models/Analytics';
import Coupon from '@/models/Coupon';
import ShippingSettings from '@/models/ShippingSettings';
import {
  mapCartToOrderItems,
  verifyCartPrices,
  decrementInventory,
  generateOrderNumber,
  getInitialTrackingEvents,
  computeCheckoutTotal,
} from '@/lib/orders';
import { parseAddress } from '@/lib/utils';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from '@/lib/api-response';
import { isAdminAuthorized } from '@/lib/auth';
import type { CartItem, ShippingDetails } from '@/types';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const id = new URL(request.url).searchParams.get('id');

    if (id) {
      const order = await Order.findById(id).lean();
      if (!order) return notFoundResponse('Order not found');
      return successResponse(order);
    }

    if (!isAdminAuthorized(request)) return unauthorizedResponse();
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    return successResponse(orders);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Server error', 500);
  }
}
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const {
      sessionId,
      cartItems,
      cartTotal,
      email,
      couponApplied,
      shippingDetails,
      customerDetails, // Backward compatibility fallback
      discountAmount = 0,
      paymentMethod = 'cod',
    } = body as {
      sessionId?: string;
      cartItems: CartItem[];
      cartTotal: number;
      shippingDetails?: ShippingDetails;
      customerDetails?: { name: string; phone: string; address: string };
      email: string;
      couponApplied?: string;
      discountAmount?: number;
      paymentMethod?: string;
    };

    if (!cartItems?.length) return errorResponse('Cart is empty');
    if (!email) return errorResponse('Missing checkout information.');

    // ⚡ Normalize the incoming data object safely
    const rawShipping = shippingDetails || customerDetails;
    if (!rawShipping || !rawShipping.name || !rawShipping.phone || !rawShipping.address) {
      return errorResponse('Complete destination shipping information is required.');
    }

    // Parse values from the address string ONLY if structured fields aren't already provided by the frontend
    const parsed = parseAddress(rawShipping.address);
    const finalCity = (rawShipping as any).city || parsed.city;
const finalState = (rawShipping as any).state || parsed.state;
const finalPincode = (rawShipping as any).pincode || parsed.pincode;

    // Strict validation check to catch errors before hitting Mongoose database validation crashes
    if (!finalCity || !finalState || !finalPincode) {
      return errorResponse('Destination City, State, and Pincode parameters are required.');
    }

    const config = await ShippingSettings.findOne({ key: 'global_shipping' }).lean() || {
      freeShippingThreshold: 500,
      standardShippingFee: 80,
      gstRate: 18,
      estimatedDeliveryDays: '3 to 5 working days'
    };

    const { subtotal, error: priceError } = await verifyCartPrices(cartItems);
    if (priceError) return errorResponse(priceError);
    
    let discount = discountAmount;
    if (couponApplied) {
      const coupon = await Coupon.findOne({ code: couponApplied.toUpperCase(), isActive: true });
      if (coupon && subtotal >= coupon.minOrderValue) {
        discount =
          coupon.discountType === 'percentage'
            ? Math.round((subtotal * coupon.discountValue) / 100)
            : Math.min(coupon.discountValue, subtotal);
      }
    }
    const amountAfterDiscount = subtotal - discount;
    const shippingFee = amountAfterDiscount >= config.freeShippingThreshold ? 0 : config.standardShippingFee;
    const gstAmount = Math.round(amountAfterDiscount * (config.gstRate / 100));

    const expectedTotal = computeCheckoutTotal(subtotal, discount);
    if (Math.abs(expectedTotal - cartTotal) > 1) {
      return errorResponse('Order total mismatch. Please refresh and try again.');
    }

    const orderNumber = await generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      userEmail: email || 'guest@elegantwalls.com',
      items: mapCartToOrderItems(cartItems),
      
      subtotal: subtotal,
      gst: gstAmount,
      shippingFee: shippingFee,
      discountAmount: discount,
      totalAmount: cartTotal,
      
      couponApplied,
      shippingDetails: {
        name: rawShipping.name,
        phone: rawShipping.phone,
        address: rawShipping.address,
        city: finalCity,
        state: finalState,
        pincode: finalPincode,
      },
      paymentMethod: (paymentMethod === 'cod' ? 'cod' : 'razorpay'),
      paymentStatus: 'pending',
      trackingEvents: getInitialTrackingEvents(),
    });

    await decrementInventory(cartItems);

    if (sessionId) {
      await Analytics.create({
        eventType: 'click_buy',
        sessionId,
        details: { orderId: order._id, orderNumber, totalAmount: cartTotal },
      });
    }

    return successResponse({ orderId: order._id, orderNumber, message: 'Order initiated.' });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Server error', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!isAdminAuthorized(request)) return unauthorizedResponse();
    await dbConnect();
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return errorResponse('Missing ID');
    const body = await request.json();
    const order = await Order.findByIdAndUpdate(id, body, { new: true });
    if (!order) return notFoundResponse('Order not found');
    return successResponse(order);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Bad request', 400);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!isAdminAuthorized(request)) return unauthorizedResponse();
    await dbConnect();
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return errorResponse('Missing ID');
    const order = await Order.findByIdAndDelete(id);
    if (!order) return notFoundResponse('Order not found');
    return successResponse({ message: 'Order deleted' });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Bad request', 400);
  }
}