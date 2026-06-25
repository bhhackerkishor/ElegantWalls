import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from '@/lib/api-response';
import { isAdminAuthorized } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    if (!isAdminAuthorized(request)) return unauthorizedResponse();
    await dbConnect();
    const id = new URL(request.url).searchParams.get('id');

    if (id) {
      const user = await User.findById(id).lean();
      if (!user) return notFoundResponse('Customer not found');
      const orders = await Order.find({ userEmail: user.email }).sort({ createdAt: -1 }).lean();
      const totalSpend = orders
        .filter((o) => o.paymentStatus === 'paid')
        .reduce((s, o) => s + o.totalAmount, 0);
      const lastOrder = orders[0];
      return successResponse({
        user,
        orders,
        stats: {
          totalOrders: orders.length,
          totalSpend,
          lifetimeValue: totalSpend,
          lastPurchase: lastOrder?.createdAt || null,
          averageOrderValue: orders.length ? Math.round(totalSpend / orders.length) : 0,
        },
      });
    }

    const users = await User.find({ role: 'customer' }).sort({ createdAt: -1 }).lean();
    const enriched = await Promise.all(
      users.map(async (u) => {
        const orders = await Order.find({ userEmail: u.email, paymentStatus: 'paid' }).lean();
        const totalSpend = orders.reduce((s, o) => s + o.totalAmount, 0);
        return {
          ...u,
          _id: String(u._id),
          totalOrders: orders.length,
          totalSpend,
          lastPurchase: orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]?.createdAt,
        };
      })
    );

    return successResponse(enriched);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Server error', 500);
  }
}
