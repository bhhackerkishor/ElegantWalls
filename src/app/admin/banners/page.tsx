'use client';

import { useEffect, useState } from 'react';
import { DataTable } from '@/components/admin/ConfirmDialog';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAdminApi } from '@/hooks/useAdminApi';
import { useToast } from '@/components/admin/ToastProvider';
import type { Banner } from '@/types';

export default function AdminBannersPage() {
  const { get, post, put, del } = useAdminApi();
  const { toast } = useToast();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [form, setForm] = useState({ title: '', subtitle: '', image: '', link: '/', type: 'hero' as const, sortOrder: 0 });

  const load = () => get<Banner[]>('/api/banners?all=true').then((r) => { if (r.success && r.data) setBanners(r.data); });
  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6">
      <div className="p-5 bg-card-bg border border-border rounded-xl grid sm:grid-cols-2 gap-3">
        <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <Input label="Subtitle" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
        <Input label="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
        <Input label="Link" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
        <div><label className="text-xs font-semibold">Type</label><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'hero' })} className="w-full mt-1 px-3 py-2 border border-border rounded-lg text-sm"><option value="hero">Hero</option><option value="promotional">Promotional</option><option value="category">Category</option></select></div>
        <Button onClick={async () => { await post('/api/banners', { ...form, isActive: true }); toast('Banner created'); load(); }} className="self-end">Add Banner</Button>
      </div>
      <DataTable headers={['Title', 'Type', 'Active', 'Actions']}>
        {banners.map((b) => (
          <tr key={b._id}>
            <td className="px-4 py-3"><p className="font-medium">{b.title}</p><p className="text-xs text-foreground-secondary">{b.subtitle}</p></td>
            <td className="px-4 py-3 capitalize">{(b as Banner & { type?: string }).type || 'hero'}</td>
            <td className="px-4 py-3"><Badge className={b.isActive ? 'bg-success/10 text-success' : ''}>{b.isActive ? 'Active' : 'Inactive'}</Badge></td>
            <td className="px-4 py-3 flex gap-2">
              <Button size="sm" variant="ghost" onClick={async () => { await put(`/api/banners?id=${b._id}`, { isActive: !b.isActive }); load(); }}>Toggle</Button>
              <Button size="sm" variant="ghost" onClick={async () => { await del(`/api/banners?id=${b._id}`); toast('Deleted'); load(); }}>Delete</Button>
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
