'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import StatCard from '@/components/admin/StatCard';
import { useAdminApi } from '@/hooks/useAdminApi';
import type { AnalyticsData } from '@/types';

const RevenueChart = dynamic(() => import('@/components/admin/charts/RevenueChart'), { ssr: false });

export default function AdminAnalyticsPage() {
  const { get } = useAdminApi();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [dashboard, setDashboard] = useState<{ charts: { revenue: Array<{ date: string; revenue: number; orders: number }> }; analytics: { conversionRate: number } } | null>(null);

  useEffect(() => {
    Promise.all([
      get<AnalyticsData>('/api/analytics'),
      get('/api/admin/dashboard'),
    ]).then(([a, d]) => {
      if (a.success && a.data) setAnalytics(a.data);
      if (d.success && d.data) setDashboard(d.data as typeof dashboard);
    });
  }, [get]);

  if (!analytics) return <div className="animate-pulse h-40 bg-background-secondary rounded-xl" />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Product Views" value={analytics.metrics.pageviews.toLocaleString()} />
        <StatCard label="Add to Cart" value={analytics.metrics.addToCart.toLocaleString()} />
        <StatCard label="Checkout Started" value={analytics.metrics.clickBuy.toLocaleString()} />
        <StatCard label="Conversion Rate" value={`${dashboard?.analytics.conversionRate ?? 0}%`} />
      </div>
      {dashboard?.charts.revenue && (
        <div className="p-5 bg-card-bg border border-border rounded-xl">
          <h3 className="font-bold mb-4">Revenue Growth</h3>
          <RevenueChart data={dashboard.charts.revenue} />
        </div>
      )}
      <div className="p-5 bg-card-bg border border-border rounded-xl">
        <h3 className="font-bold mb-4">Recent Events</h3>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {analytics.recentEvents?.slice(0, 30).map((e, i) => (
            <div key={i} className="flex justify-between text-sm py-2 border-b border-border">
              <span className="font-medium">{e.eventType}</span>
              <span className="text-foreground-secondary">{new Date(e.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
