import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import Product from '@/models/Product';
import Analytics from '@/models/Analytics';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';
import { isAdminAuthorized } from '@/lib/auth';

function startOfDay(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

export async function GET(request: NextRequest) {
  try {
    if (!isAdminAuthorized(request)) return unauthorizedResponse();
    await dbConnect();

    const now = new Date();
    const todayStart = startOfDay(now);
    const weekStart = daysAgo(7);
    const monthStart = daysAgo(30);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const paidOrders = await Order.find({ paymentStatus: 'paid' }).lean();
    const allOrders = await Order.find({}).lean();
    const users = await User.find({ role: 'customer' }).lean();
    const products = await Product.find({ isArchived: { $ne: true } }).lean();

    const sumRevenue = (orders: typeof paidOrders, since?: Date) =>
      orders
        .filter((o) => !since || new Date(o.createdAt) >= since)
        .reduce((s, o) => s + o.totalAmount, 0);

    const countByStatus = (status: string) =>
      allOrders.filter((o) => o.deliveryStatus === status).length;

    const newCustomersWeek = users.filter((u) => new Date(u.createdAt) >= weekStart).length;
    const returningCustomers = users.filter((u) => {
      const userOrders = allOrders.filter((o) => o.userEmail === u.email);
      return userOrders.length > 1;
    }).length;

    const lowStock = products.flatMap((p) =>
      p.variants
        .filter((v) => v.stockCount <= 10)
        .map((v) => ({ productId: String(p._id), title: p.title, sku: v.sku, stock: v.stockCount }))
    );

    // Revenue chart — last 30 days
    const revenueChart = Array.from({ length: 30 }, (_, i) => {
      const date = daysAgo(29 - i);
      const dayStart = startOfDay(date);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      const dayOrders = paidOrders.filter((o) => {
        const d = new Date(o.createdAt);
        return d >= dayStart && d < dayEnd;
      });
      return {
        date: dayStart.toISOString().slice(0, 10),
        revenue: dayOrders.reduce((s, o) => s + o.totalAmount, 0),
        orders: dayOrders.length,
      };
    });

    // Orders by status chart
    const statusCounts = [
      'PLACED', 'CONFIRMED', 'PROCESSING', 'PRINTING', 'FRAMING',
      'QUALITY_CHECK', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED',
    ].map((status) => ({ status, count: countByStatus(status) }));

    // Category revenue
    const categoryMap: Record<string, number> = {};
    for (const order of paidOrders) {
      for (const item of order.items) {
        categoryMap[item.category] = (categoryMap[item.category] || 0) + item.price * item.quantity;
      }
    }
    const categoryChart = Object.entries(categoryMap).map(([category, revenue]) => ({
      category,
      revenue,
    }));

    // Top products by quantity sold
    const productSales: Record<string, { title: string; qty: number; revenue: number }> = {};
    for (const order of paidOrders) {
      for (const item of order.items) {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { title: item.title, qty: 0, revenue: 0 };
        }
        productSales[item.productId].qty += item.quantity;
        productSales[item.productId].revenue += item.price * item.quantity;
      }
    }
    const topProducts = Object.entries(productSales)
      .map(([id, data]) => ({ productId: id, ...data }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10);

    const [pageviews, addToCart, clickBuy, customUploads] = await Promise.all([
      Analytics.countDocuments({ eventType: 'pageview' }),
      Analytics.countDocuments({ eventType: 'add_to_cart' }),
      Analytics.countDocuments({ eventType: 'click_buy' }),
      Analytics.countDocuments({ eventType: 'custom_upload' }),
    ]);

    const conversionRate = pageviews > 0 ? ((clickBuy / pageviews) * 100).toFixed(2) : '0';

    return successResponse({
      revenue: {
        today: sumRevenue(paidOrders, todayStart),
        week: sumRevenue(paidOrders, weekStart),
        month: sumRevenue(paidOrders, monthStart),
        year: sumRevenue(paidOrders, yearStart),
      },
      orders: {
        total: allOrders.length,
        pending: countByStatus('PLACED') + countByStatus('CONFIRMED'),
        processing: countByStatus('PROCESSING') + countByStatus('PRINTING') + countByStatus('FRAMING') + countByStatus('QUALITY_CHECK'),
        shipped: countByStatus('SHIPPED') + countByStatus('IN_TRANSIT') + countByStatus('OUT_FOR_DELIVERY'),
        delivered: countByStatus('DELIVERED'),
        cancelled: countByStatus('CANCELLED'),
      },
      customers: {
        total: users.length,
        newThisWeek: newCustomersWeek,
        returning: returningCustomers,
      },
      products: {
        total: products.length,
        trending: products.filter((p) => p.isTrending).length,
        bestSellers: products.filter((p) => p.isBestSeller).length,
        lowStock: lowStock.length,
      },
      analytics: {
        pageviews,
        addToCart,
        clickBuy,
        customUploads,
        conversionRate: parseFloat(conversionRate),
      },
      charts: {
        revenue: revenueChart,
        orderStatus: statusCounts,
        categories: categoryChart,
        topProducts,
      },
      lowStockAlerts: lowStock.slice(0, 20),
    });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Server error', 500);
  }
}
