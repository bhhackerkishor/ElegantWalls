import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { generateInvoiceHtml } from '@/lib/invoice';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const orderId = new URL(request.url).searchParams.get('orderId');
    if (!orderId) return errorResponse('Order ID required');

    const order = await Order.findById(orderId).lean();
    if (!order) return notFoundResponse('Order not found');

    const html = generateInvoiceHtml(JSON.parse(JSON.stringify(order)) as import('@/types').Order);
    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Server error', 500);
  }
}
