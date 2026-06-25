import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { getUserFromRequest } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    await dbConnect();
    const { orderId, reason } = await request.json();
    if (!orderId || !reason) return errorResponse('Order ID and reason required');

    const order = await Order.findOne({ _id: orderId, userEmail: user.email });
    if (!order) return notFoundResponse('Order not found');

    if (order.deliveryStatus !== 'DELIVERED') {
      return errorResponse('Returns can only be requested after delivery');
    }

    order.returnRequest = {
      isRequested: true,
      reason,
      status: 'requested',
      requestedAt: new Date(),
    };
    await order.save();
    return successResponse(order);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Server error', 500);
  }
}
