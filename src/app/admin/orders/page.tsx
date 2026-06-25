'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { FiSearch, FiDownload, FiEye } from 'react-icons/fi';
import { DataTable } from '@/components/admin/ConfirmDialog';
import EmptyState from '@/components/admin/EmptyState';
import { TableSkeleton } from '@/components/admin/SkeletonLoader';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useAdminApi } from '@/hooks/useAdminApi';
import { useToast } from '@/components/admin/ToastProvider';
import type { Order } from '@/types';
import { formatPrice } from '@/lib/utils';
import { ORDER_TRACKING_STAGES } from '@/lib/constants';

export default function AdminOrdersPage() {
  const { get, put, post, exportCsv } = useAdminApi();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState('');

  const load = async () => {
    setLoading(true);
    const res = await get<Order[]>('/api/orders');
    if (res.success && res.data) setOrders(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter && o.deliveryStatus !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return o.orderNumber.toLowerCase().includes(q) || o.userEmail.toLowerCase().includes(q);
      }
      return true;
    });
  }, [orders, search, statusFilter]);

  const updateStatus = async (id: string, deliveryStatus: string) => {
    await put(`/api/orders?id=${id}`, { deliveryStatus });
    toast('Order status updated');
    load();
  };

  const bulkUpdate = async () => {
    if (!bulkStatus || selected.size === 0) return;
    await post('/api/admin/returns', { orderIds: [...selected], deliveryStatus: bulkStatus });
    toast(`${selected.size} orders updated`);
    setSelected(new Set());
    load();
  };

  if (loading) return <TableSkeleton rows={8} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-secondary" size={16} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search orders…" className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-background text-sm" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-border rounded-lg bg-background text-sm">
            <option value="">All Statuses</option>
            {ORDER_TRACKING_STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>
        <div className="flex gap-2 items-center">
          {selected.size > 0 && (
            <>
              <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)} className="px-3 py-2 border border-border rounded-lg bg-background text-sm">
                <option value="">Bulk status…</option>
                {ORDER_TRACKING_STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
              <Button size="sm" onClick={bulkUpdate} disabled={!bulkStatus}>Apply</Button>
            </>
          )}
          <Button variant="secondary" size="sm" onClick={() => exportCsv('orders')}><FiDownload size={14} /> Export</Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No orders found" />
      ) : (
        <DataTable headers={['', 'Order', 'Customer', 'Total', 'Payment', 'Status', 'Actions']}>
          {filtered.map((o) => (
            <tr key={o._id} className="hover:bg-background-secondary/30">
              <td className="px-4 py-3"><input type="checkbox" checked={selected.has(o._id)} onChange={() => setSelected((p) => { const n = new Set(p); n.has(o._id) ? n.delete(o._id) : n.add(o._id); return n; })} /></td>
              <td className="px-4 py-3"><p className="font-medium">{o.orderNumber}</p><p className="text-xs text-foreground-secondary">{new Date(o.createdAt).toLocaleDateString()}</p></td>
              <td className="px-4 py-3 text-sm">{o.userEmail}</td>
              <td className="px-4 py-3 font-medium">{formatPrice(o.totalAmount)}</td>
              <td className="px-4 py-3"><Badge className={o.paymentStatus === 'paid' ? 'bg-success/10 text-success' : ''}>{o.paymentStatus}</Badge></td>
              <td className="px-4 py-3">
                <select value={o.deliveryStatus} onChange={(e) => updateStatus(o._id, e.target.value)} className="px-2 py-1 border border-border rounded text-xs bg-background">
                  {ORDER_TRACKING_STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </td>
              <td className="px-4 py-3">
                <Link href={`/admin/orders/${o._id}`} className="p-1.5 rounded hover:bg-background-secondary inline-flex"><FiEye size={14} /></Link>
                <a href={`/api/invoice?orderId=${o._id}`} target="_blank" className="p-1.5 rounded hover:bg-background-secondary inline-flex ml-1 text-xs">Invoice</a>
              </td>
            </tr>
          ))}
        </DataTable>
      )}
    </div>
  );
}
