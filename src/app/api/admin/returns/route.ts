import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from '@/lib/api-response';
import { isAdminAuthorized } from '@/lib/auth';
import { logAdminAction } from '@/lib/admin/audit';

export async function GET(request: NextRequest) {
  try {
    if (!isAdminAuthorized(request)) return unauthorizedResponse();
    await dbConnect();
    const type = new URL(request.url).searchParams.get('type');

    if (type === 'cancellations') {
      const orders = await Order.find({ 'cancellationRequest.isRequested': true })
        .sort({ 'cancellationRequest.requestedAt': -1 })
        .lean();
      return successResponse(orders);
    }

    if (type === 'returns') {
      const orders = await Order.find({ 'returnRequest.isRequested': true })
        .sort({ 'returnRequest.requestedAt': -1 })
        .lean();
      return successResponse(orders);
    }

    return errorResponse('Invalid type');
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
    const { action, status } = await request.json();

    const order = await Order.findById(id);
    if (!order) return notFoundResponse('Order not found');

    if (action === 'cancellation') {
      order.cancellationRequest = {
        ...order.cancellationRequest,
        isRequested: true,
        status,
      } as typeof order.cancellationRequest;
      if (status === 'approved') {
        order.deliveryStatus = 'CANCELLED';
        order.paymentStatus = order.paymentStatus === 'paid' ? 'refunded' : order.paymentStatus;
      }
    } else if (action === 'return') {
      order.returnRequest = {
        ...order.returnRequest,
        isRequested: true,
        status,
      } as typeof order.returnRequest;
      if (status === 'refunded') {
        order.paymentStatus = 'refunded';
      }
    }

    await order.save();
    await logAdminAction(request, `${action}_${status}`, 'order', id);
    return successResponse(order);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Bad request', 400);
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isAdminAuthorized(request)) return unauthorizedResponse();
    await dbConnect();
    const { orderIds, deliveryStatus } = await request.json();
    if (!orderIds?.length || !deliveryStatus) return errorResponse('Missing orderIds or deliveryStatus');

    await Order.updateMany({ _id: { $in: orderIds } }, { deliveryStatus });
    await logAdminAction(request, 'bulk_status_update', 'order', undefined, { orderIds, deliveryStatus });
    return successResponse({ message: `${orderIds.length} orders updated` });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Bad request', 400);
  }
}
