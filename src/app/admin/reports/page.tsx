'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import StatCard from '@/components/admin/StatCard';
import { useAdminApi } from '@/hooks/useAdminApi';
import { formatPrice } from '@/lib/utils';

export default function AdminReportsPage() {
  const { get, exportCsv } = useAdminApi();
  const [stats, setStats] = useState<{ revenue: { month: number; year: number }; orders: { total: number }; customers: { total: number } } | null>(null);

  useEffect(() => {
    get('/api/admin/dashboard').then((r) => { if (r.success) setStats(r.data as typeof stats); });
  }, [get]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={() => exportCsv('orders')}>Export Orders</Button>
        <Button variant="secondary" size="sm" onClick={() => exportCsv('customers')}>Export Customers</Button>
        <Button variant="secondary" size="sm" onClick={() => exportCsv('products')}>Export Products</Button>
        <Button variant="secondary" size="sm" onClick={() => exportCsv('revenue')}>Export Revenue</Button>
      </div>
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Monthly Revenue" value={formatPrice(stats.revenue.month)} />
          <StatCard label="Yearly Revenue" value={formatPrice(stats.revenue.year)} />
          <StatCard label="Total Orders" value={stats.orders.total} />
          <StatCard label="Total Customers" value={stats.customers.total} />
        </div>
      )}
    </div>
  );
}
