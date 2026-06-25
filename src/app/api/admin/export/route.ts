import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import Product from '@/models/Product';
import { errorResponse, unauthorizedResponse } from '@/lib/api-response';
import { isAdminAuthorized } from '@/lib/auth';
import { toCsv } from '@/lib/admin/export-csv';

export async function GET(request: NextRequest) {
  try {
    if (!isAdminAuthorized(request)) return unauthorizedResponse();
    await dbConnect();

    const type = new URL(request.url).searchParams.get('type') || 'orders';

    let csv = '';
    let filename = 'export.csv';

    if (type === 'orders') {
      const orders = await Order.find().sort({ createdAt: -1 }).lean();
      csv = toCsv(
        orders.map((o) => ({
          orderNumber: o.orderNumber,
          email: o.userEmail,
          total: o.totalAmount,
          paymentStatus: o.paymentStatus,
          deliveryStatus: o.deliveryStatus,
          paymentMethod: o.paymentMethod,
          createdAt: new Date(o.createdAt).toISOString(),
        }))
      );
      filename = 'orders.csv';
    } else if (type === 'customers') {
      const users = await User.find({ role: 'customer' }).lean();
      csv = toCsv(
        users.map((u) => ({
          email: u.email,
          name: u.name,
          phone: u.phone,
          city: u.city,
          state: u.state,
          marketingEmails: u.marketingEmails,
          createdAt: new Date(u.createdAt).toISOString(),
        }))
      );
      filename = 'customers.csv';
    } else if (type === 'products') {
      const products = await Product.find().lean();
      csv = toCsv(
        products.map((p) => ({
          title: p.title,
          slug: p.slug,
          category: p.category,
          variants: p.variants.length,
          isBestSeller: p.isBestSeller,
          isTrending: p.isTrending,
          isArchived: p.isArchived ?? false,
        }))
      );
      filename = 'products.csv';
    } else if (type === 'revenue') {
      const orders = await Order.find({ paymentStatus: 'paid' }).sort({ createdAt: -1 }).lean();
      csv = toCsv(
        orders.map((o) => ({
          orderNumber: o.orderNumber,
          email: o.userEmail,
          total: o.totalAmount,
          discount: o.discountAmount,
          coupon: o.couponApplied || '',
          createdAt: new Date(o.createdAt).toISOString(),
        }))
      );
      filename = 'revenue.csv';
    } else {
      return errorResponse('Invalid export type');
    }

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Server error', 500);
  }
}
