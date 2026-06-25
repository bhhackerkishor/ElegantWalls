'use client';

import { useEffect, useState } from 'react';
import StatCard from '@/components/admin/StatCard';
import { useAdminApi } from '@/hooks/useAdminApi';
import { formatPrice } from '@/lib/utils';
import type { Coupon } from '@/types';

export default function AdminMarketingPage() {
  const { get } = useAdminApi();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [dashboard, setDashboard] = useState<{ charts: { topProducts: Array<{ title: string; qty: number; revenue: number }> }; customers: { total: number }; analytics: { addToCart: number } } | null>(null);

  useEffect(() => {
    Promise.all([get<Coupon[]>('/api/coupons'), get('/api/admin/dashboard')]).then(([c, d]) => {
      if (c.success && c.data) setCoupons(c.data);
      if (d.success) setDashboard(d.data as typeof dashboard);
    });
  }, [get]);

  const subscribers = dashboard?.customers.total ?? 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Email Subscribers" value={subscribers} />
        <StatCard label="Abandoned Carts (est.)" value={Math.max(0, (dashboard?.analytics.addToCart ?? 0) - (dashboard?.charts.topProducts.reduce((s, p) => s + p.qty, 0) ?? 0))} />
        <StatCard label="Active Coupons" value={coupons.filter((c) => c.isActive).length} />
      </div>
      <div className="p-5 bg-card-bg border border-border rounded-xl">
        <h3 className="font-bold mb-4">Coupon Performance</h3>
        <div className="space-y-2">
          {coupons.map((c) => (
            <div key={c._id} className="flex justify-between text-sm py-2 border-b border-border">
              <span className="font-medium">{c.code}</span>
              <span>{(c as Coupon & { usageCount?: number }).usageCount ?? 0} uses · {formatPrice((c as Coupon & { revenueGenerated?: number }).revenueGenerated ?? 0)}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="p-5 bg-card-bg border border-border rounded-xl">
        <h3 className="font-bold mb-4">Top Selling Products</h3>
        <div className="space-y-2">
          {dashboard?.charts.topProducts.slice(0, 10).map((p, i) => (
            <div key={i} className="flex justify-between text-sm py-2 border-b border-border">
              <span>{p.title}</span>
              <span>{p.qty} sold · {formatPrice(p.revenue)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
