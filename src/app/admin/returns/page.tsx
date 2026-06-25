'use client';

import { useEffect, useState } from 'react';
import { DataTable } from '@/components/admin/ConfirmDialog';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useAdminApi } from '@/hooks/useAdminApi';
import { useToast } from '@/components/admin/ToastProvider';
import type { Order } from '@/types';
import { formatPrice } from '@/lib/utils';

export default function AdminReturnsPage() {
  const { get, put } = useAdminApi();
  const { toast } = useToast();
  const [cancellations, setCancellations] = useState<Order[]>([]);
  const [returns, setReturns] = useState<Order[]>([]);

  const load = async () => {
    const [c, r] = await Promise.all([
      get<Order[]>('/api/admin/returns?type=cancellations'),
      get<Order[]>('/api/admin/returns?type=returns'),
    ]);
    if (c.success && c.data) setCancellations(c.data);
    if (r.success && r.data) setReturns(r.data);
  };
  useEffect(() => { load(); }, []);

  const handleAction = async (id: string, action: 'cancellation' | 'return', status: string) => {
    await put(`/api/admin/returns?id=${id}`, { action, status });
    toast(`${action} ${status}`);
    load();
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-bold mb-3">Cancellation Requests</h3>
        <DataTable headers={['Order', 'Customer', 'Reason', 'Status', 'Actions']}>
          {cancellations.map((o) => (
            <tr key={o._id}>
              <td className="px-4 py-3 font-medium">{o.orderNumber}</td>
              <td className="px-4 py-3 text-sm">{o.userEmail}</td>
              <td className="px-4 py-3 text-sm">{o.cancellationRequest?.reason}</td>
              <td className="px-4 py-3"><Badge>{o.cancellationRequest?.status}</Badge></td>
              <td className="px-4 py-3 flex gap-2">
                {o.cancellationRequest?.status === 'pending' && (<><Button size="sm" onClick={() => handleAction(o._id, 'cancellation', 'approved')}>Approve</Button><Button size="sm" variant="secondary" onClick={() => handleAction(o._id, 'cancellation', 'rejected')}>Reject</Button></>)}
              </td>
            </tr>
          ))}
        </DataTable>
      </div>
      <div>
        <h3 className="font-bold mb-3">Return Requests</h3>
        <DataTable headers={['Order', 'Customer', 'Total', 'Reason', 'Status', 'Actions']}>
          {returns.map((o) => (
            <tr key={o._id}>
              <td className="px-4 py-3 font-medium">{o.orderNumber}</td>
              <td className="px-4 py-3 text-sm">{o.userEmail}</td>
              <td className="px-4 py-3">{formatPrice(o.totalAmount)}</td>
              <td className="px-4 py-3 text-sm">{o.returnRequest?.reason}</td>
              <td className="px-4 py-3"><Badge>{o.returnRequest?.status}</Badge></td>
              <td className="px-4 py-3 flex gap-2">
                {o.returnRequest?.status === 'requested' && (<><Button size="sm" onClick={() => handleAction(o._id, 'return', 'approved')}>Approve</Button><Button size="sm" onClick={() => handleAction(o._id, 'return', 'refunded')}>Refund</Button><Button size="sm" variant="secondary" onClick={() => handleAction(o._id, 'return', 'rejected')}>Reject</Button></>)}
              </td>
            </tr>
          ))}
        </DataTable>
      </div>
    </div>
  );
}
