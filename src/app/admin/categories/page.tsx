'use client';
import React, {
  useEffect,
  useState,
  useCallback
} from 'react';
import { useAdminApi } from '@/hooks/useAdminApi';
import { useToast } from '@/components/admin/ToastProvider';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import * as Icons from 'react-icons/fi';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiFolder } from 'react-icons/fi';

interface CategoryDoc {
  _id?: string;
  name: string;
  label: string;
  slug: string;
  description: string;
  icon: string;
  colorClass: string;
  bgLight: string;
}

export default function AdminCategoriesCRUDPage() {
  const { get, post, put, del } = useAdminApi();
  const { toast } = useToast();

  const [categories, setCategories] = useState<CategoryDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState<CategoryDoc>({
    name: '', label: '', slug: '', description: '',
    icon: 'FiLayers', colorClass: 'text-accent border-accent/20', bgLight: 'bg-accent/10'
  });

  const fetchCategories = useCallback(async () => {
  setLoading(true);

  const res = await get<CategoryDoc[]>('/api/categories');

  if (res.success && Array.isArray(res.data)) {
    setCategories(res.data);
  } else {
    toast('Failed syncing structural data grids from cloud.', 'error');
  }

  setLoading(false);
}, [get, toast]);
  

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const openUpsertWorkspace = (target?: CategoryDoc) => {
    if (target) {
      setForm({ ...target });
    } else {
      setForm({
        name: '', label: '', slug: '', description: '',
        icon: 'FiLayers', colorClass: 'text-accent border-accent/20', bgLight: 'bg-accent/10'
      });
    }
    setModalOpen(true);
  };

  const handleLabelChange = (text: string) => {
    const rawKey = text.toLowerCase().replace(/[^a-z0-9]+/g, '');
    const cleanSlug = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setForm(p => ({ ...p, label: text, name: rawKey, slug: cleanSlug }));
  };

  const submitFormPayload = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const isEdit = !!form._id;
    const res = isEdit 
      ? await put(`/api/categories?id=${form._id}`, form)
      : await post('/api/categories', form);

    if (res.success) {
      toast(`Category successfully ${isEdit ? 'synchronized' : 'registered'}!`, 'success');
      setModalOpen(false);
      fetchCategories();
    } else {
      toast(res.error || 'Server rejected category transaction.', 'error');
    }
    setSaving(false);
  };

  const dropCategoryDocument = async (id: string) => {
    if (!confirm('Are you absolutely sure you want to drop this category configuration?')) return;
    const res = await del(`/api/categories?id=${id}`);
    if (res.success) {
      toast('Document context dropped from cluster structures.', 'success');
      fetchCategories();
    } else {
      toast(res.error || 'Drop routine block failure rejection.', 'error');
    }
  };

  if (loading) {
    return <div className="py-24 text-center text-xs tracking-widest text-foreground-secondary animate-pulse">Decompressing cloud categorization taxonomy schemas...</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 text-foreground bg-background transition-colors duration-300 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-xl font-display font-black tracking-tight text-foreground">Dynamic Catalog Architecture</h1>
          <p className="text-xs text-foreground-secondary mt-1">Live configuration grids reading directly from database collections cluster structures.</p>
        </div>
        <Button size="sm" onClick={() => openUpsertWorkspace()} className="bg-accent hover:bg-accent/95 text-background flex items-center gap-1.5 font-bold h-10 text-xs rounded-xl self-start sm:self-center transition-all shadow-xs">
          <FiPlus size={14} /> Add New Cluster Group
        </Button>
      </div>

      {/* 🧱 TILES MAP LAYOUT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => {
          const IconComponent = (Icons as any)[cat.icon] || Icons.FiLayers;
          return (
            <div key={cat._id} className="group relative p-6 bg-card-bg hover:bg-card-bg-hover border border-border rounded-2xl flex flex-col justify-between transition-all shadow-xs">
              <div>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className={`p-2.5 rounded-xl border border-border/40 ${cat.colorClass} ${cat.bgLight}`}>
                    <IconComponent size={18} />
                  </div>
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openUpsertWorkspace(cat)} className="p-1.5 rounded-lg border border-border bg-background text-foreground-secondary hover:text-accent transition-colors"><FiEdit2 size={11} /></button>
                    <button onClick={() => cat._id && dropCategoryDocument(cat._id)} className="p-1.5 rounded-lg border border-border bg-background text-foreground-secondary hover:text-error transition-colors"><FiTrash2 size={11} /></button>
                  </div>
                </div>
                <h3 className="font-bold text-sm text-foreground">{cat.label}</h3>
                <p className="text-xs text-foreground-secondary mt-1.5 leading-relaxed min-h-[36px]">{cat.description}</p>
              </div>
              <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between font-mono text-[10px]">
                <span className="text-foreground-secondary uppercase font-bold">Key: {cat.name}</span>
                <span className="text-accent font-medium bg-accent-light px-2 py-0.5 rounded-md">/{cat.slug}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 📦 SOLID OPAQUE MODAL WORKSPACE OVERLAY */}
      {modalOpen && (
        <div className="fixed inset-0 z-150 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          {/* Forced opaque layer using your CSS background token colors over fallback clean sheets */}
          <div className="bg-background border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl relative text-xs text-foreground animate-in zoom-in-95 duration-200">
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-foreground-secondary hover:text-foreground p-1 transition-colors"><FiX size={16} /></button>
            <h2 className="text-sm font-bold flex items-center gap-2 mb-4 border-b border-border pb-2.5"><FiFolder className="text-accent" /> {form._id ? 'Modify Catalog Key Node' : 'Register New Catalog Cluster'}</h2>
            
            <form onSubmit={submitFormPayload} className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wide text-foreground-secondary">Category Label Display Name</label>
                <input type="text" required value={form.label} onChange={(e) => handleLabelChange(e.target.value)} placeholder="e.g., Canvas Prints" className="w-full h-10 px-3 border border-border rounded-xl bg-background-secondary text-foreground outline-none focus:border-accent transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wide text-foreground-secondary">System DB Key Name</label>
                  <input type="text" disabled value={form.name} className="w-full h-10 px-3 border border-border/80 rounded-xl bg-background/50 text-foreground-secondary font-mono outline-none opacity-70" />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wide text-foreground-secondary">Route Path URL Slug</label>
                  <input type="text" disabled value={form.slug} className="w-full h-10 px-3 border border-border/80 rounded-xl bg-background/50 text-foreground-secondary font-mono outline-none opacity-70" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wide text-foreground-secondary">Editorial Subtext Description</label>
                <textarea rows={3} required value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief summary of variants included under this taxonomic bracket..." className="w-full p-3 border border-border rounded-xl bg-background-secondary text-foreground outline-none focus:border-accent transition-colors resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wide text-foreground-secondary">Icon Component Target</label>
                  <input type="text" value={form.icon} onChange={(e) => setForm(p => ({ ...p, icon: e.target.value }))} placeholder="e.g., FiLayers" className="w-full h-10 px-3 border border-border rounded-xl bg-background-secondary text-foreground font-mono outline-none focus:border-accent transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wide text-foreground-secondary">Tailwind Class Accent</label>
                  <input type="text" value={form.colorClass} onChange={(e) => setForm(p => ({ ...p, colorClass: e.target.value }))} placeholder="e.g., text-accent" className="w-full h-10 px-3 border border-border rounded-xl bg-background-secondary text-foreground font-mono outline-none focus:border-accent transition-colors" />
                </div>
              </div>
              <Button type="submit" loading={saving} className="w-full bg-accent hover:bg-accent/90 text-background font-bold h-11 rounded-xl mt-3 transition-colors shadow-xs">Synchronize to Database Cluster</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}