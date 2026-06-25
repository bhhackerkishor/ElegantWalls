import { NextRequest } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Analytics from '@/models/Analytics';
import { decrementInventory } from '@/lib/orders';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      sessionId,
    } = body;

    const order = await Order.findById(orderId);
    if (!order) return errorResponse('Order not found', 404);

    
    const sign = crypto
    .createHmac(
      'sha256',
      process.env.RAZORPAY_KEY_SECRET!
    )
    .update(
      `${razorpayOrderId}|${razorpayPaymentId}`
    )
    .digest('hex');
  
  if (sign !== razorpaySignature) {
    return errorResponse(
      'Invalid payment signature',
      400
    );
  }

    order.paymentStatus = 'paid';
    order.deliveryStatus = 'CONFIRMED';
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    order.trackingEvents.push({
      status: 'Payment Confirmed',
      description: 'Online payment verified successfully.',
      location: 'Payment Gateway',
      timestamp: new Date(),
    });
    await order.save();

    await decrementInventory(
      order.items.map((item) => ({
        productId: item.productId,
        sku: item.sku,
        title: item.title,
        category: item.category as 'poster',
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        frame: item.frame,
        material: item.material,
        orientation: item.orientation,
        image: '',
      }))
    );

    if (sessionId) {
      await Analytics.create({
        eventType: 'click_buy',
        sessionId,
        details: { orderId: order._id, paymentId: razorpayPaymentId, paid: true },
      });
    }

    return successResponse({ order });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Server error', 500);
  }
}
