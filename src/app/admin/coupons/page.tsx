'use client';

import { useEffect, useState } from 'react';
import { DataTable } from '@/components/admin/ConfirmDialog';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAdminApi } from '@/hooks/useAdminApi';
import { useToast } from '@/components/admin/ToastProvider';
import { formatPrice } from '@/lib/utils';
import type { Coupon } from '@/types';
import { FiPercent, FiPlus, FiGrid, FiCalendar } from 'react-icons/fi';

export default function AdminCouponsPage() {
  const { get, post, put, del } = useAdminApi();
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [form, setForm] = useState({ 
    code: '', 
    discountType: 'percentage', 
    discountValue: 10, 
    minOrderValue: 0, 
    maxUsage: 100, 
    expiresAt: '' 
  });

  const load = () => get<Coupon[]>('/api/coupons').then((r) => { 
    if (r.success && r.data) setCoupons(r.data); 
  });

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    if (!form.code.trim()) {
      toast('Please enter a coupon code', 'error');
      return;
    }
    const res = await post('/api/coupons', { 
      ...form, 
      isActive: true, 
      expiresAt: form.expiresAt || undefined 
    });
    if (res.success) { 
      toast('Coupon created successfully.', 'success'); 
      load(); 
      setForm({ code: '', discountType: 'percentage', discountValue: 10, minOrderValue: 0, maxUsage: 100, expiresAt: '' }); 
    } else {
      toast(res.error || 'Failed to create coupon.', 'error'); 
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-[var(--foreground)]">
      
      {/* 🎟️ CREATION BUILDER INTERFACE */}
      <div className="p-6 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-secondary)] flex items-center gap-2 border-b border-[var(--border)] pb-3">
          <FiPercent className="text-amber-500 dark:text-amber-400" /> Create Promotional Campaign
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
          <Input 
            label="Campaign Code" 
            placeholder="E.G. SAVE20"
            value={form.code} 
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} 
          />
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--foreground-secondary)]/80 uppercase tracking-wider text-[10px]">Discount Formula</label>
            <select 
              value={form.discountType} 
              onChange={(e) => setForm({ ...form, discountType: e.target.value })} 
              className="w-full h-10 px-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-xs font-semibold text-[var(--foreground)] outline-none focus:border-[var(--foreground)] transition-colors shadow-inner appearance-none"
            >
              <option value="percentage">Percentage Off (%)</option>
              <option value="amount">Fixed Cash Discount (Flat)</option>
            </select>
          </div>

          <Input 
            label="Discount Value" 
            type="number" 
            value={form.discountValue} 
            onChange={(e) => setForm({ ...form, discountValue: +e.target.value })} 
          />
          <Input 
            label="Minimum Purchase Requirement" 
            type="number" 
            value={form.minOrderValue} 
            onChange={(e) => setForm({ ...form, minOrderValue: +e.target.value })} 
          />
          <Input 
            label="Total Redemption Limit" 
            type="number" 
            value={form.maxUsage} 
            onChange={(e) => setForm({ ...form, maxUsage: +e.target.value })} 
          />
          <Input 
            label="Expiration Target" 
            type="date" 
            value={form.expiresAt} 
            onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} 
          />
        </div>

        <div className="pt-2 flex justify-end">
          <Button 
            onClick={create} 
            className="bg-[var(--foreground)] hover:bg-[var(--foreground)]/90 text-[var(--background)] font-bold h-10 px-5 rounded-xl transition-all flex items-center gap-2 text-xs shadow-sm"
          >
            <FiPlus size={14} /> Provision Code
          </Button>
        </div>
      </div>

      {/* 📊 CAMPAIGN RECORDS DATA TABLE */}
      <div className="p-6 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-secondary)] flex items-center gap-2 pb-1">
          <FiGrid className="text-amber-500 dark:text-amber-400" /> Active Marketing Ledger
        </h3>
        
        <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--background)]/30">
          <DataTable headers={['Code', 'Discount Benefit', 'Min Order Req.', 'Redemption Velocity', 'Generated Gross Value', 'Expiration', 'State', 'Operational Controls']}>
            {coupons.map((c) => (
              <tr key={c._id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--background-secondary)]/20 transition-colors">
                <td className="px-4 py-3.5 font-bold text-[var(--foreground)] font-mono text-sm tracking-wide">{c.code}</td>
                <td className="px-4 py-3.5 text-xs font-semibold">
                  {c.discountType === 'percentage' ? (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">{c.discountValue}% Off</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold">{formatPrice(c.discountValue)} Off</span>
                  )}
                </td>
                <td className="px-4 py-3.5 text-xs font-medium text-[var(--foreground-secondary)]">{formatPrice(c.minOrderValue)}</td>
                <td className="px-4 py-3.5 text-xs font-mono font-semibold text-[var(--foreground-secondary)]">
                  {((c as any).usageCount ?? 0)} <span className="text-[var(--foreground-secondary)]/40">/</span> {((c as any).maxUsage ?? '∞')}
                </td>
                <td className="px-4 py-3.5 text-xs font-bold text-[var(--foreground)] font-mono">{formatPrice(((c as any).revenueGenerated ?? 0))}</td>
                
                {/* 📅 EXPIRES AT COLUMN */}
                <td className="px-4 py-3.5 text-xs font-medium text-[var(--foreground-secondary)]">
                  {c.expiresAt ? (
                    <span className="flex items-center gap-1 font-semibold text-[var(--foreground)]">
                      <FiCalendar size={12} className="text-[var(--foreground-secondary)]/60" />
                      {new Date(c.expiresAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wide bg-neutral-500/10 text-neutral-500 border border-neutral-500/10 px-1.5 py-0.5 rounded">Permanent</span>
                  )}
                </td>

                <td className="px-4 py-3.5 text-xs">
                  <Badge className={c.isActive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-md font-bold text-[10px]' : 'bg-neutral-500/10 text-neutral-500 border border-neutral-500/20 rounded-md font-bold text-[10px]'}>
                    {c.isActive ? 'Live' : 'Paused'}
                  </Badge>
                </td>
                <td className="px-4 py-3.5 text-xs">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={async () => { 
                      await put(`/api/coupons?id=${c._id}`, { isActive: !c.isActive }); 
                      load(); 
                    }}
                    className={`h-7 px-3 rounded-lg text-[11px] font-bold border transition-all ${
                      c.isActive 
                        ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border-transparent' 
                        : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 border-transparent'
                    }`}
                  >
                    {c.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                </td>
              </tr>
            ))}
          </DataTable>
        </div>
      </div>

    </div>
  );
}