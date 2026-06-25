'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FiSearch, FiDownload, FiArchive, FiCopy, FiExternalLink, 
  FiPlus, FiPackage, FiLayers, FiAlertCircle, FiCheckCircle, FiEdit3
} from 'react-icons/fi';
import { DataTable } from '@/components/admin/ConfirmDialog';
import EmptyState from '@/components/admin/EmptyState';
import { TableSkeleton } from '@/components/admin/SkeletonLoader';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useAdminApi } from '@/hooks/useAdminApi';
import { useToast } from '@/components/admin/ToastProvider';
import type { Product } from '@/types';
import { PRODUCT_CATEGORIES } from '@/lib/constants';
import { formatPrice, getStartingPrice } from '@/lib/utils';

export default function AdminProductsPage() {
  const { get, post, put, exportCsv } = useAdminApi();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirm, setConfirm] = useState<{ id: string; action: 'archive' | 'delete' } | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await get<{ products: Product[] }>('/api/products?limit=200');
    if (res.success && res.data) {
      setProducts(res.data.products ?? []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (category && p.category !== category) return false;
      if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.slug.toLowerCase().includes(search.toLowerCase())) return false;
      if ((p as any).isArchived) return false;
      return true;
    });
  }, [products, search, category]);

  const metrics = useMemo(() => {
    return filtered.reduce((acc, p) => {
      const totalStock = p.variants?.reduce((sum, v) => sum + (v.stockCount || 0), 0) || 0;
      if (totalStock === 0) acc.outOfStock += 1;
      else if (totalStock < 20) acc.lowStock += 1;
      
      if (p.isBestSeller) acc.bestsellers += 1;
      return acc;
    }, { outOfStock: 0, lowStock: 0, bestsellers: 0 });
  }, [filtered]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(p => p._id)));
    }
  };

  const handleArchive = async (id: string) => {
    const res = await put(`/api/products?id=${id}`, { isArchived: true });
    if (res.success) {
      toast('Product archived successfully.');
      setConfirm(null);
      load();
    } else {
      toast(res.error || 'Failed to archive product.', 'error');
    }
  };

  const handleDuplicate = async (product: Product) => {
    const { _id: _, createdAt: _c, ...rest } = product;
    const res = await post('/api/products', {
      ...rest,
      title: `${product.title} (Copy)`,
      slug: `${product.slug}-copy-${Date.now()}`,
    });
    if (res.success) toast('Product duplicated successfully.');
    else toast(res.error || 'Failed to duplicate product.', 'error');
    load();
  };

  const bulkArchive = async () => {
    let succeeded = 0;
    for (const id of selected) {
      const res = await put(`/api/products?id=${id}`, { isArchived: true });
      if (res.success) succeeded++;
    }
    toast(`${succeeded} products archived successfully.`);
    setSelected(new Set());
    load();
  };

  if (loading) return <TableSkeleton rows={8} />;

  return (
    <div className="space-y-6 text-[var(--foreground)]">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[var(--border)] pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)]">Products</h1>
          <p className="text-xs font-medium text-[var(--foreground-secondary)] mt-0.5">Manage stock levels, pricing, information options, and shop categories.</p>
        </div>
        <Link href="/admin/products/edit/new">
          <Button size="sm" className="text-xs font-bold gap-1.5 px-5 py-2.5 rounded-full bg-[var(--foreground)] text-[var(--background)] shadow-sm">
            <FiPlus size={14} /> Add Product
          </Button>
        </Link>
      </div>

      {/* Stats KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-[var(--background-secondary)] text-[var(--foreground)] rounded-xl"><FiPackage size={16} /></div>
          <div>
            <p className="text-[10px] text-[var(--foreground-secondary)] uppercase tracking-wider font-bold">Total Products</p>
            <p className="text-lg font-bold mt-0.5">{filtered.length}</p>
          </div>
        </div>
        <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl"><FiCheckCircle size={16} /></div>
          <div>
            <p className="text-[10px] text-[var(--foreground-secondary)] uppercase tracking-wider font-bold">Bestsellers</p>
            <p className="text-lg font-bold mt-0.5 text-emerald-600 dark:text-emerald-400">{metrics.bestsellers}</p>
          </div>
        </div>
        <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl"><FiAlertCircle size={16} /></div>
          <div>
            <p className="text-[10px] text-[var(--foreground-secondary)] uppercase tracking-wider font-bold">Low Stock</p>
            <p className="text-lg font-bold mt-0.5 text-amber-600 dark:text-amber-400">{metrics.lowStock}</p>
          </div>
        </div>
        <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl"><FiArchive size={16} /></div>
          <div>
            <p className="text-[10px] text-[var(--foreground-secondary)] uppercase tracking-wider font-bold">Out of Stock</p>
            <p className="text-lg font-bold mt-0.5 text-rose-600 dark:text-rose-400">{metrics.outOfStock}</p>
          </div>
        </div>
      </div>

      {/* Search Filters & Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-[var(--card-bg)] border border-[var(--border)] p-4 rounded-2xl shadow-sm">
        <div className="flex flex-wrap gap-2 flex-1 w-full">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-secondary)]" size={14} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, tags, or item handle code..."
              className="w-full pl-9 pr-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--background)] text-xs outline-none text-[var(--foreground)] focus:border-[var(--foreground)] transition-colors"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--background)] text-xs font-semibold text-[var(--foreground-secondary)] outline-none focus:border-[var(--foreground)] cursor-pointer transition-colors"
          >
            <option value="">All Categories</option>
            {Object.entries(PRODUCT_CATEGORIES).map(([k, v]) => (
              <option key={k} value={k} className="capitalize">{v.label || k}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 w-full md:w-auto justify-end border-t md:border-t-0 border-[var(--border)] pt-3 md:pt-0">
          {selected.size > 0 && (
            <Button variant="secondary" size="sm" onClick={bulkArchive} className="text-xs h-9 rounded-full border-rose-500/20 text-rose-600 hover:bg-rose-500/5 px-4 font-bold">
              <FiArchive size={13} className="mr-1" /> Archive Selected ({selected.size})
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={() => exportCsv('products')} className="text-xs h-9 rounded-full bg-transparent text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--background-secondary)] px-4 font-bold transition-colors">
            <FiDownload size={13} className="mr-1" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Products Table Area */}
      {filtered.length === 0 ? (
        <EmptyState title="No products found" description="Try adjusting your filters or search terms." />
      ) : (
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden">
          <DataTable headers={[
            <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleSelectAll} className="cursor-pointer accent-[var(--foreground)]" />as any,
            'Product Info',
            'Category',
            'Variants',
            'Base Price',
            'Stock Count',
            'Actions'
          ]}>
            {filtered.map((p) => {
              const totalStock = p.variants?.reduce((sum, v) => sum + (v.stockCount || 0), 0) || 0;
              const hasLowStock = totalStock > 0 && totalStock < 20;

              return (
                <tr key={p._id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--background-secondary)]/30 transition-colors group">
                  <td className="px-4 py-4">
                    <input type="checkbox" checked={selected.has(p._id)} onChange={() => toggleSelect(p._id)} className="cursor-pointer accent-[var(--foreground)]" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-12 bg-[var(--background-secondary)] rounded-xl overflow-hidden border border-[var(--border)] flex-shrink-0">
                        {p.image ? (
                          <Image 
                            src={p.image} 
                            alt={p.title} 
                            fill 
                            className="object-cover"
                            sizes="40px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[var(--foreground-secondary)]"><FiLayers size={14} /></div>
                        )}
                      </div>
                      <div className="space-y-0.5 max-w-[220px]">
                        <p className="font-bold text-xs text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors truncate">{p.title}</p>
                        <p className="text-[10px] font-mono text-[var(--foreground-secondary)] truncate">{p.slug}</p>
                        <div className="flex gap-1 items-center flex-wrap pt-0.5">
                          {p.isBestSeller && <Badge className="text-[9px] font-bold px-2 py-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 rounded-full">Bestseller</Badge>}
                          {p.isTrending && <Badge className="text-[9px] font-bold px-2 py-0 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 rounded-full">Trending</Badge>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs font-bold capitalize text-[var(--foreground-secondary)]">
                    {p.category}
                  </td>
                  <td className="px-4 py-4 text-xs">
                    <span className="font-mono bg-[var(--background-secondary)] px-2 py-0.5 rounded-full border border-[var(--border)] text-[var(--foreground-secondary)] font-semibold text-[10px]">
                      {p.variants?.length || 0} setups
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs font-bold text-[var(--foreground)] font-mono">
                    {formatPrice(getStartingPrice(p))}
                  </td>
                  <td className="px-4 py-4 text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          totalStock === 0 ? 'bg-rose-500' : hasLowStock ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} />
                        <span className="font-mono font-bold text-[var(--foreground)]">{totalStock} units</span>
                      </div>
                      <span className="text-[10px] font-medium text-[var(--foreground-secondary)] block">
                        {totalStock === 0 ? 'Out of Stock' : hasLowStock ? 'Low Stock' : 'In Stock'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <Link 
                        href={`/admin/products/edit/${p._id}`} 
                        className="p-2 rounded-lg text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--background-secondary)] transition-colors"
                        title="Edit Item"
                      >
                        <FiEdit3 size={14} />
                      </Link>
                      <Link 
                        href={`/product/${p.slug}`} 
                        target="_blank" 
                        className="p-2 rounded-lg text-[var(--foreground-secondary)] hover:text-emerald-500 hover:bg-emerald-500/5 transition-colors" 
                        title="View Preview"
                      >
                        <FiExternalLink size={14} />
                      </Link>
                      <button 
                        type="button" 
                        onClick={() => handleDuplicate(p)} 
                        className="p-2 rounded-lg text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--background-secondary)] cursor-pointer transition-colors" 
                        title="Duplicate Item"
                      >
                        <FiCopy size={14} />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setConfirm({ id: p._id, action: 'archive' })} 
                        className="p-2 rounded-lg text-[var(--foreground-secondary)] hover:text-rose-500 hover:bg-rose-500/5 cursor-pointer transition-colors" 
                        title="Archive Item"
                      >
                        <FiArchive size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </DataTable>
        </div>
      )}

      {/* Archive Modal Drawer dialog */}
      <ConfirmDialog
        open={!!confirm}
        title="Archive Product"
        message="Are you sure you want to archive this product? It will instantly be removed from the public shop view but kept in your dashboard history logs."
        confirmLabel="Archive"
        onConfirm={() => confirm && handleArchive(confirm.id)}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}