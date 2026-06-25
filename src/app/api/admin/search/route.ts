import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Order from '@/models/Order';
import User from '@/models/User';
import Coupon from '@/models/Coupon';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';
import { isAdminAuthorized } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    if (!isAdminAuthorized(request)) return unauthorizedResponse();
    await dbConnect();

    const q = new URL(request.url).searchParams.get('q')?.trim().toLowerCase() || '';
    if (!q || q.length < 2) {
      return successResponse({ products: [], orders: [], customers: [], coupons: [] });
    }

    const [products, orders, customers, coupons] = await Promise.all([
      Product.find({
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { slug: { $regex: q, $options: 'i' } },
        ],
      })
        .select('title slug category image')
        .limit(8)
        .lean(),
      Order.find({
        $or: [
          { orderNumber: { $regex: q, $options: 'i' } },
          { userEmail: { $regex: q, $options: 'i' } },
        ],
      })
        .select('orderNumber userEmail totalAmount deliveryStatus')
        .limit(8)
        .lean(),
      User.find({
        $or: [
          { email: { $regex: q, $options: 'i' } },
          { name: { $regex: q, $options: 'i' } },
        ],
      })
        .select('email name role')
        .limit(8)
        .lean(),
      Coupon.find({ code: { $regex: q, $options: 'i' } })
        .select('code discountType discountValue isActive')
        .limit(8)
        .lean(),
    ]);

    return successResponse({
      products: products.map((p) => ({ ...p, _id: String(p._id), href: `/admin/products?id=${p._id}` })),
      orders: orders.map((o) => ({ ...o, _id: String(o._id), href: `/admin/orders/${o._id}` })),
      customers: customers.map((u) => ({ ...u, _id: String(u._id), href: `/admin/customers/${u._id}` })),
      coupons: coupons.map((c) => ({ ...c, _id: String(c._id), href: `/admin/coupons` })),
    });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Server error', 500);
  }
}
