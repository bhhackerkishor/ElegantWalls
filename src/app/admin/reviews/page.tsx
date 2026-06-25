'use client';

import { useEffect, useState } from 'react';
import { DataTable } from '@/components/admin/ConfirmDialog';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useAdminApi } from '@/hooks/useAdminApi';
import { useToast } from '@/components/admin/ToastProvider';
import type { Review } from '@/types';

export default function AdminReviewsPage() {
  const { get, put, del } = useAdminApi();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);

  const load = () => get<Review[]>('/api/reviews?all=true').then((r) => { if (r.success && r.data) setReviews(r.data); });
  useEffect(() => { load(); }, []);

  return (
    <DataTable headers={['Customer', 'Rating', 'Comment', 'Status', 'Actions']}>
      {reviews.map((r) => (
        <tr key={r._id}>
          <td className="px-4 py-3"><p className="font-medium">{r.customerName}</p><p className="text-xs text-foreground-secondary">{r.userEmail}</p></td>
          <td className="px-4 py-3">{r.rating}★</td>
          <td className="px-4 py-3 text-sm max-w-xs truncate">{r.comment}</td>
          <td className="px-4 py-3"><Badge className={r.approved ? 'bg-success/10 text-success' : ''}>{r.approved ? 'Approved' : 'Pending'}</Badge></td>
          <td className="px-4 py-3 flex gap-2">
            {!r.approved && <Button size="sm" onClick={async () => { await put(`/api/reviews?id=${r._id}`, { approved: true }); toast('Approved'); load(); }}>Approve</Button>}
            <Button size="sm" variant="ghost" onClick={async () => { await put(`/api/reviews?id=${r._id}`, { isFeatured: !(r as Review & { isFeatured?: boolean }).isFeatured }); load(); }}>Feature</Button>
            <Button size="sm" variant="ghost" onClick={async () => { await del(`/api/reviews?id=${r._id}`); toast('Deleted'); load(); }}>Delete</Button>
          </td>
        </tr>
      ))}
    </DataTable>
  );
}
