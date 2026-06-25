'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import StatCard from '@/components/admin/StatCard';
import { DataTable } from '@/components/admin/ConfirmDialog';
import { useAdminApi } from '@/hooks/useAdminApi';
import { formatPrice } from '@/lib/utils';
import type { Order } from '@/types';
import type { UserProfile } from '@/types';

export default function AdminCustomerDetailPage() {
  const { id } = useParams();
  const { get } = useAdminApi();
  const [data, setData] = useState<{
    user: UserProfile;
    orders: Order[];
    stats: { totalOrders: number; totalSpend: number; lifetimeValue: number; lastPurchase: string | null; averageOrderValue: number };
  } | null>(null);

  useEffect(() => {
    if (id) get(`/api/admin/customers?id=${id}`).then((res) => { if (res.success) setData(res.data as typeof data); });
  }, [id, get]);

  if (!data) return <div className="animate-pulse h-40 bg-background-secondary rounded-xl" />;

  return (
    <div className="space-y-6">
      <Link href="/admin/customers" className="text-sm text-accent hover:underline">← Back to Customers</Link>
      <h2 className="text-2xl font-bold">{data.user.email}</h2>
      <p className="text-foreground-secondary">{data.user.name} · {data.user.phone}</p>
      <p className="text-sm">{data.user.address}, {data.user.city}, {data.user.state} {data.user.zipCode}</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Orders" value={data.stats.totalOrders} />
        <StatCard label="Total Spend" value={formatPrice(data.stats.totalSpend)} />
        <StatCard label="Lifetime Value" value={formatPrice(data.stats.lifetimeValue)} />
        <StatCard label="Avg Order" value={formatPrice(data.stats.averageOrderValue)} />
      </div>

      <DataTable headers={['Order', 'Date', 'Total', 'Status']}>
        {data.orders.map((o) => (
          <tr key={o._id}>
            <td className="px-4 py-3"><Link href={`/admin/orders/${o._id}`} className="text-accent hover:underline">{o.orderNumber}</Link></td>
            <td className="px-4 py-3 text-sm">{new Date(o.createdAt).toLocaleDateString()}</td>
            <td className="px-4 py-3">{formatPrice(o.totalAmount)}</td>
            <td className="px-4 py-3 text-sm">{o.deliveryStatus}</td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
