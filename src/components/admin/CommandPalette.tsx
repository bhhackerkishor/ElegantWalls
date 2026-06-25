'use client';

import { memo, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch, FiPackage, FiShoppingBag, FiUsers, FiTag } from 'react-icons/fi';
import { useAdminApi } from '@/hooks/useAdminApi';
import { formatPrice } from '@/lib/utils';

interface SearchResult {
  products: Array<{ _id: string; title: string; category: string; href: string }>;
  orders: Array<{ _id: string; orderNumber: string; userEmail: string; totalAmount: number; href: string }>;
  customers: Array<{ _id: string; email: string; name: string; href: string }>;
  coupons: Array<{ _id: string; code: string; href: string }>;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { get } = useAdminApi();
  const router = useRouter();

  const search = useCallback(
    async (q: string) => {
      if (q.length < 2) { setResults(null); return; }
      setLoading(true);
      const res = await get<SearchResult>(`/api/admin/search?q=${encodeURIComponent(q)}`);
      if (res.success && res.data) setResults(res.data);
      setLoading(false);
    },
    [get]
  );

  useEffect(() => {
    const timer = setTimeout(() => search(query), 250);
    return () => clearTimeout(timer);
  }, [query, search]);

  useEffect(() => {
    if (!open) { setQuery(''); setResults(null); }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (open) onClose();
      }
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const navigate = (href: string) => {
    router.push(href);
    onClose();
  };

  const sections = results
    ? [
        { label: 'Products', icon: FiPackage, items: results.products.map((p) => ({ id: p._id, label: p.title, sub: p.category, href: p.href })) },
        { label: 'Orders', icon: FiShoppingBag, items: results.orders.map((o) => ({ id: o._id, label: o.orderNumber, sub: `${o.userEmail} · ${formatPrice(o.totalAmount)}`, href: o.href })) },
        { label: 'Customers', icon: FiUsers, items: results.customers.map((c) => ({ id: c._id, label: c.email, sub: c.name, href: c.href })) },
        { label: 'Coupons', icon: FiTag, items: results.coupons.map((c) => ({ id: c._id, label: c.code, sub: 'Coupon', href: c.href })) },
      ].filter((s) => s.items.length > 0)
    : [];

  return (
    <div className="fixed inset-0 z-[300] flex items-start justify-center pt-[15vh] px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-background border border-border rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 border-b border-border">
          <FiSearch className="text-foreground-secondary" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, orders, customers, coupons…"
            className="flex-1 py-4 bg-transparent outline-none text-sm"
          />
          <kbd className="text-[10px] px-1.5 py-0.5 rounded border border-border text-foreground-secondary">ESC</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {loading && <p className="p-4 text-sm text-foreground-secondary">Searching…</p>}
          {!loading && query.length >= 2 && sections.length === 0 && (
            <p className="p-4 text-sm text-foreground-secondary">No results for &ldquo;{query}&rdquo;</p>
          )}
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.label}>
                <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-foreground-secondary bg-background-secondary/50">
                  {section.label}
                </p>
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigate(item.href)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent-light/50 text-left cursor-pointer"
                  >
                    <Icon size={16} className="text-accent shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      {item.sub && <p className="text-xs text-foreground-secondary">{item.sub}</p>}
                    </div>
                  </button>
                ))}
              </div>
            );
          })}
          {query.length < 2 && (
            <p className="p-4 text-sm text-foreground-secondary">Type at least 2 characters to search</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(CommandPalette);
