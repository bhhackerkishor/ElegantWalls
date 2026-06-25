'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { FiDollarSign, FiShoppingBag, FiUsers, FiPackage, FiAlertTriangle } from 'react-icons/fi';
import StatCard from '@/components/admin/StatCard';
import { DashboardSkeleton } from '@/components/admin/SkeletonLoader';
import { useAdminApi } from '@/hooks/useAdminApi';
import { formatPrice } from '@/lib/utils';

const RevenueChart = dynamic(() => import('@/components/admin/charts/RevenueChart'), { ssr: false, loading: () => <div className="h-72 animate-pulse bg-background-secondary rounded-xl" /> });
const OrdersChart = dynamic(() => import('@/components/admin/charts/OrdersChart'), { ssr: false, loading: () => <div className="h-72 animate-pulse bg-background-secondary rounded-xl" /> });
const CategoryChart = dynamic(() => import('@/components/admin/charts/CategoryChart'), { ssr: false, loading: () => <div className="h-72 animate-pulse bg-background-secondary rounded-xl" /> });
const TopProductsChart = dynamic(() => import('@/components/admin/charts/TopProductsChart'), { ssr: false, loading: () => <div className="h-72 animate-pulse bg-background-secondary rounded-xl" /> });

interface DashboardData {
  revenue: { today: number; week: number; month: number; year: number };
  orders: { total: number; pending: number; processing: number; shipped: number; delivered: number; cancelled: number };
  customers: { total: number; newThisWeek: number; returning: number };
  products: { total: number; trending: number; bestSellers: number; lowStock: number };
  analytics: { pageviews: number; addToCart: number; clickBuy: number; conversionRate: number };
  charts: {
    revenue: Array<{ date: string; revenue: number; orders: number }>;
    orderStatus: Array<{ status: string; count: number }>;
    categories: Array<{ category: string; revenue: number }>;
    topProducts: Array<{ productId: string; title: string; qty: number; revenue: number }>;
  };
  lowStockAlerts: Array<{ productId: string; title: string; sku: string; stock: number }>;
}

export default function AdminDashboardPage() {
  const { get } = useAdminApi();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    get<DashboardData>('/api/admin/dashboard').then((res) => {
      if (res.success && res.data) setData(res.data);
    });
  }, [get]);

  if (!data) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      {/* Revenue */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today's Revenue" value={formatPrice(data.revenue.today)} icon={FiDollarSign} />
        <StatCard label="Weekly Revenue" value={formatPrice(data.revenue.week)} icon={FiDollarSign} />
        <StatCard label="Monthly Revenue" value={formatPrice(data.revenue.month)} icon={FiDollarSign} />
        <StatCard label="Yearly Revenue" value={formatPrice(data.revenue.year)} icon={FiDollarSign} />
      </div>

      {/* Orders & Customers */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Pending Orders" value={data.orders.pending} icon={FiShoppingBag} />
        <StatCard label="Processing" value={data.orders.processing} icon={FiShoppingBag} />
        <StatCard label="Shipped" value={data.orders.shipped} icon={FiShoppingBag} />
        <StatCard label="Delivered" value={data.orders.delivered} icon={FiShoppingBag} />
        <StatCard label="Cancelled" value={data.orders.cancelled} icon={FiShoppingBag} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Customers" value={data.customers.total} icon={FiUsers} />
        <StatCard label="New This Week" value={data.customers.newThisWeek} icon={FiUsers} />
        <StatCard label="Returning" value={data.customers.returning} icon={FiUsers} />
        <StatCard label="Low Stock Items" value={data.products.lowStock} icon={FiAlertTriangle} />
      </div>

      {/* Analytics funnel */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Page Views" value={data.analytics.pageviews.toLocaleString()} />
        <StatCard label="Add to Cart" value={data.analytics.addToCart.toLocaleString()} />
        <StatCard label="Purchases" value={data.analytics.clickBuy.toLocaleString()} />
        <StatCard label="Conversion Rate" value={`${data.analytics.conversionRate}%`} />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-5 bg-card-bg border border-border rounded-xl">
          <h3 className="font-bold mb-4">Revenue (30 days)</h3>
          <RevenueChart data={data.charts.revenue} />
        </div>
        <div className="p-5 bg-card-bg border border-border rounded-xl">
          <h3 className="font-bold mb-4">Orders by Status</h3>
          <OrdersChart data={data.charts.orderStatus} />
        </div>
        <div className="p-5 bg-card-bg border border-border rounded-xl">
          <h3 className="font-bold mb-4">Revenue by Category</h3>
          <CategoryChart data={data.charts.categories} />
        </div>
        <div className="p-5 bg-card-bg border border-border rounded-xl">
          <h3 className="font-bold mb-4">Top Products</h3>
          <TopProductsChart data={data.charts.topProducts} />
        </div>
      </div>

      {/* Low stock alerts */}
      {data.lowStockAlerts.length > 0 && (
        <div className="p-5 bg-card-bg border border-border rounded-xl">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <FiPackage className="text-accent" /> Low Stock Alerts
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {data.lowStockAlerts.map((item) => (
              <div key={item.sku} className="p-3 border border-border rounded-lg text-sm">
                <p className="font-medium truncate">{item.title}</p>
                <p className="text-foreground-secondary text-xs mt-0.5">{item.sku}</p>
                <p className="text-error font-bold mt-1">{item.stock} left</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
