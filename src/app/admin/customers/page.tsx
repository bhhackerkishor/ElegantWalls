'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { FiSearch, FiDownload } from 'react-icons/fi';
import { DataTable } from '@/components/admin/ConfirmDialog';
import EmptyState from '@/components/admin/EmptyState';
import { TableSkeleton } from '@/components/admin/SkeletonLoader';
import Button from '@/components/ui/Button';
import { useAdminApi } from '@/hooks/useAdminApi';
import { formatPrice } from '@/lib/utils';

interface CustomerRow {
  _id: string;
  email: string;
  name: string;
  phone: string;
  totalOrders: number;
  totalSpend: number;
  lastPurchase?: string;
}

export default function AdminCustomersPage() {
  const { get, exportCsv } = useAdminApi();
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    get<CustomerRow[]>('/api/admin/customers').then((res) => {
      if (res.success && res.data) setCustomers(res.data);
      setLoading(false);
    });
  }, [get]);

  const filtered = useMemo(() => {
    if (!search) return customers;
    const q = search.toLowerCase();
    return customers.filter((c) => c.email.toLowerCase().includes(q) || c.name?.toLowerCase().includes(q));
  }, [customers, search]);

  if (loading) return <TableSkeleton rows={8} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 justify-between">
        <div className="relative flex-1 max-w-sm">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-secondary" size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers…" className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-background text-sm" />
        </div>
        <Button variant="secondary" size="sm" onClick={() => exportCsv('customers')}><FiDownload size={14} /> Export</Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No customers found" />
      ) : (
        <DataTable headers={['Customer', 'Phone', 'Orders', 'Total Spend', 'Last Purchase', 'Actions']}>
          {filtered.map((c) => (
            <tr key={c._id} className="hover:bg-background-secondary/30">
              <td className="px-4 py-3"><p className="font-medium">{c.email}</p><p className="text-xs text-foreground-secondary">{c.name || '—'}</p></td>
              <td className="px-4 py-3 text-sm">{c.phone || '—'}</td>
              <td className="px-4 py-3">{c.totalOrders}</td>
              <td className="px-4 py-3 font-medium">{formatPrice(c.totalSpend)}</td>
              <td className="px-4 py-3 text-sm">{c.lastPurchase ? new Date(c.lastPurchase).toLocaleDateString() : '—'}</td>
              <td className="px-4 py-3"><Link href={`/admin/customers/${c._id}`} className="text-accent text-sm hover:underline">View</Link></td>
            </tr>
          ))}
        </DataTable>
      )}
    </div>
  );
}
