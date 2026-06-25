'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion,Variants, AnimatePresence, LayoutGroup } from 'framer-motion';
import { 
  FiArrowLeft, FiEye, FiCloudLightning, FiSave, FiPlus, 
  FiTrash2, FiMaximize2, FiImage, FiCompass, FiTag, 
  FiActivity, FiPackage, FiBarChart2, FiAlertCircle, FiCheckCircle,
  FiFileText, FiFilm, FiHelpCircle, FiGlobe, FiCornerDownRight,
  FiLayers
} from 'react-icons/fi';

import Button from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { useAdminApi } from '@/hooks/useAdminApi';
import { useToast } from '@/components/admin/ToastProvider';
import { PRODUCT_CATEGORIES } from '@/lib/constants';
import type { Product, ProductVariant } from '@/types';

// ==========================================
// 🛠️ DESIGN SYSTEM CONFIGURATION & UI SUB-COMPONENTS
// ==========================================

const cardEntrance: Variants = {
  initial: { 
    opacity: 0, 
    y: 15 
  },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.4, 
      ease: [0.16, 1, 0.3, 1]
    } 
  },
  exit: { 
    opacity: 0, 
    y: -10, 
    transition: { 
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    } 
  }
};

const itemAnimation = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.15 } }
};

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}


function GlassCard({ children, className = '', ...props }: GlassCardProps) {
  
  const { onDrag, onDragStart, onDragEnd, onDragCapture, ...safeProps } = props as any;

  return (
    <motion.div
      variants={cardEntrance}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`bg-[var(--card-bg)] border border-[var(--border)] rounded-[24px] p-5 shadow-sm backdrop-blur-md hover:bg-[var(--card-bg-hover)] transition-all duration-300 w-full ${className}`}
      // 🟢 Spread safe props that won't conflict with Framer motion type configurations
      {...safeProps} 
    >
      {children}
    </motion.div>
  );
}

interface SectionHeaderProps {
  icon: React.ComponentType<{ className?: string; size?: number }>;
  title: string;
  description?: string;
}

function SectionHeader({ icon: Icon, title, description }: SectionHeaderProps) {
  return (
    <div className="flex items-start gap-3 mb-4 border-b border-[var(--border)] pb-3">
      <div className="p-2 bg-[var(--accent-light)] text-[var(--accent)] rounded-xl mt-0.5">
        <Icon size={16} />
      </div>
      <div>
        <h3 className="text-sm font-bold tracking-tight text-[var(--foreground)]">{title}</h3>
        {description && <p className="text-[11px] text-[var(--foreground-secondary)] mt-0.5 leading-normal">{description}</p>}
      </div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
}

function MetricCard({ label, value, subtext, icon: Icon }: MetricCardProps) {
  return (
    <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-3.5 flex flex-col justify-between shadow-xs transition-all hover:border-[var(--accent)]">
      <div className="flex justify-between items-start gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-secondary)]">{label}</span>
        <div className="text-[var(--foreground-secondary)] opacity-70"><Icon size={14} /></div>
      </div>
      <div className="mt-2.5">
        <h4 className="text-lg font-bold font-mono tracking-tight text-[var(--foreground)]">{value}</h4>
        {subtext && <p className="text-[9px] text-[var(--foreground-secondary)] mt-0.5 truncate">{subtext}</p>}
      </div>
    </div>
  );
}

// ==========================================
// 🚀 CORE APP EDITOR CONTAINER MODULE
// ==========================================

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const { get, put, post } = useAdminApi();
  
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Field Binder State Core Blocks
  const [form, setForm] = useState({
    title: '',
    slug: '',
    shortDescription: '',
    description: '',
    category: 'poster',
    subcategory: '',
    image: '',
    images: [] as string[],
    videos: [] as string[],
    seoMetaTitle: '',
    seoMetaDescription: '',
    seoKeywords: [] as string[],
    isBestSeller: false,
    isTrending: false,
    isArchived: false,
    status: 'active' as 'draft' | 'active' | 'archived',
    visibility: 'public' as 'public' | 'private' | 'hidden'
  });

  const [variants, setVariants] = useState<ProductVariant[]>([]);
  
  // Local Controller Helper State Binders
  const [newImageInput, setNewImageInput] = useState('');
  const [newKeywordInput, setNewKeywordInput] = useState('');

  // Hydrate Database States on Initialization Context Bounds
  useEffect(() => {
  if (!id) return;
  
  // If the parameter is exactly 'new', bypass the API fetch and reset states
  if (id === 'new') {
    setForm({
      title: '',
      slug: '',
      shortDescription: '',
      description: '',
      category: 'poster',
      subcategory: '',
      image: '',
      images: [],
      videos: [],
      seoMetaTitle: '',
      seoMetaDescription: '',
      seoKeywords: [],
      isBestSeller: false,
      isTrending: false,
      isArchived: false,
      status: 'draft', // Clear default for brand new creations
      visibility: 'public'
    });
    setVariants([]);
    setLoading(false);
    return;
  }
  
  const loadProductData = async () => {
    setLoading(true);
    try {
      const res = await get<any>(`/api/products?id=${id}`);
const p = res?.data || (res as any)?.product || res;
      
      if (p) {
        setForm({
          title: p.title || '',
          slug: p.slug || '',
          shortDescription: p.shortDescription || '',
          description: p.description || '',
          category: p.category || 'poster',
          subcategory: p.subcategory || '',
          image: p.image || (p.images && p.images[0]) || '',
          images: Array.isArray(p.images) ? p.images : [],
          videos: Array.isArray(p.videos) ? p.videos : [],
          seoKeywords: Array.isArray(p.seoKeywords) ? p.seoKeywords : [],
          seoMetaTitle: p.seoMetaTitle || '',
          seoMetaDescription: p.seoMetaDescription || '',
          isBestSeller: !!p.isBestSeller,
          isTrending: !!p.isTrending,
          isArchived: !!p.isArchived,
          status: p.isArchived ? 'archived' : p.status || 'active',
          visibility: p.visibility || 'public'
        });
        setVariants(Array.isArray(p.variants) ? p.variants : []);
      } else {
        toast('Target artwork configuration empty.', 'error');
        router.push('/admin/products');
      }
    } catch (err) {
      console.error(err);
      toast('Failed retrieving product context.', 'error');
    } finally {
      setLoading(false);
    }
  };

  loadProductData();
}, [id]);

  // Handle Automatic Route Slug Configuration Engines
  const handleTitleChange = (val: string) => {
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setForm(prev => ({ ...prev, title: val, slug: generatedSlug }));
  };

  // Automated Inventory Analytics Compute Pipes
  const inventoryAnalytics = useMemo(() => {
    if (!variants.length) {
      return { totalVariants: 0, totalStock: 0, lowStockSku: 'None', highStockSku: 'None', avgPrice: 0 };
    }
    const totalVariants = variants.length;
    const totalStock = variants.reduce((sum, v) => sum + (v.stockCount || 0), 0);
    const avgPrice = variants.reduce((sum, v) => sum + (v.price || 0), 0) / totalVariants;

    const sortedByStock = [...variants].sort((a, b) => (a.stockCount || 0) - (b.stockCount || 0));
    const lowStockSku = sortedByStock[0]?.sku || 'N/A';
    const highStockSku = sortedByStock[sortedByStock.length - 1]?.sku || 'N/A';

    return { totalVariants, totalStock, lowStockSku, highStockSku, avgPrice };
  }, [variants]);

  // Variant Matrix Multi-row Mutator Pipes
  const handleVariantUpdate = (idx: number, field: keyof ProductVariant, value: any) => {
    setVariants(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const addVariantItem = () => {
    const fresh: ProductVariant = {
      sku: `${form.slug || 'art'}-${Date.now().toString().slice(-4)}`,
      size: 'A4 Size',
      frame: 'None',
      material: 'Matte Paper',
      orientation: 'Portrait',
      price: 499,
      stockCount: 100
    };
    setVariants(prev => [...prev, fresh]);
  };

  const removeVariantItem = (idx: number) => {
    setVariants(prev => prev.filter((_, i) => i !== idx));
  };

  // Keyword Matrix Hooks
  const handleAddKeyword = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newKeywordInput.trim()) {
      e.preventDefault();
      if (!form.seoKeywords.includes(newKeywordInput.trim())) {
        setForm(p => ({ ...p, seoKeywords: [...p.seoKeywords, newKeywordInput.trim()] }));
      }
      setNewKeywordInput('');
    }
  };

  // Form Pipeline Payload Submissions
  const saveProductConfig = async (overrideStatus?: 'draft' | 'active' | 'archived') => {
  setSaving(true);
  const currentStatus = overrideStatus || form.status;
  const finalPayload = {
    ...form,
    status: currentStatus,
    isArchived: currentStatus === 'archived',
    variants
  };

    const isNew = id === 'new';
  
  // Choose the route strategy dynamically
  const res = isNew 
    ? await post('/api/products', finalPayload) 
    : await put(`/api/products?id=${id}`, finalPayload);

  if (res.success) {
    toast(isNew ? 'New artwork registered successfully!' : 'Catalog document synchronized.', 'success');
    
    // If we just made a new product, redirect them to its specific edit page so they don't accidentally create duplicates
   if (isNew && (res.data as any)?._id) {
  router.push(`/admin/products/edit/${(res.data as any)._id}`);
}
  } else {
    toast(res.error || 'Server rejected configuration payload structural properties.', 'error');
  }
  setSaving(false);
};

  if (loading) {
    return (
      <div className="py-24 text-center text-xs font-semibold tracking-widest text-[var(--foreground-secondary)] animate-pulse">
        Decompressing configuration metrics layer...
      </div>
    );
  }

  return (
    <form 
      onSubmit={(e) => { e.preventDefault(); saveProductConfig(); }}
      className="space-y-6 pb-24 relative w-full text-[var(--foreground)] min-w-0"
    >
      
      {/* ==========================================
          👑 STICKY GLASSMORPHISM ACTION BAR
          ========================================== */}
      <div className="sticky top-0 z-50 w-full backdrop-blur-lg bg-[var(--glass-bg)] border-b border-[var(--glass-border)] py-3 px-4 sm:px-6 transition-all duration-300 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button 
            type="button"
            onClick={() => router.push('/admin/products')}
            className="p-2 border border-[var(--border)] rounded-xl bg-[var(--card-bg)] hover:bg-[var(--background-secondary)] text-[var(--foreground)] transition-all duration-200"
          >
            <FiArrowLeft size={14} />
          </button>
          <div className="min-w-0">
            <h2 className="text-[10px] font-bold font-mono text-[var(--foreground-secondary)] uppercase tracking-wider flex items-center gap-1">
              Store Engine Core <FiCornerDownRight size={10} />
            </h2>
            <h1 className="text-sm font-bold font-display truncate text-[var(--foreground)] mt-0.5 max-w-[140px] sm:max-w-[280px]">
              {form.title || 'Untitled Artwork Configuration'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Link href={`/product/${form.slug}`} target="_blank">
            <Button size="sm" variant={"outline" as any} className="text-xs h-9 border-[var(--border)] bg-[var(--card-bg)] text-[var(--foreground)] hidden sm:flex gap-1">
              <FiEye size={13} /> Live Preview
            </Button>
          </Link>

          <Button 
            type="button" 
            size="sm" 
            variant={"outline" as any}
            onClick={() => saveProductConfig('draft')}
            className="text-xs h-9 border-[var(--border)] text-[var(--foreground)] bg-transparent hover:bg-[var(--background-secondary)]"
          >
            Save Draft
          </Button>

          <Button 
            type="submit" 
            size="sm" 
            loading={saving}
            className="text-xs h-9 font-bold px-4 bg-[var(--accent)] text-[var(--background)] shadow-sm flex items-center gap-1.5"
          >
            <FiCloudLightning size={13} /> Publish Configuration
          </Button>
        </div>
      </div>

      {/* ==========================================
          🧱 MAIN SYNCED RESPONSIVE GRID GRID
          ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
        
        {/* LEFT COMPONENT COLUMN (7 Streams out of 12) */}
        <div className="grid grid-cols-1 gap-6 lg:col-span-7 w-full min-w-0">
          
          {/* CARD 1: GENERAL SPECIFICATIONS */}
          <GlassCard>
            <SectionHeader 
              icon={FiFileText} 
              title="Product Specifications Hub" 
              description="Core titles, description matrix parameters, and automatic URL path handling structures." 
            />
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-bold uppercase text-[var(--foreground-secondary)]">Artwork Display Title</label>
                    <span className="text-[10px] text-[var(--foreground-secondary)] font-mono">{form.title.length}/70</span>
                  </div>
                  <input 
                    type="text"
                    maxLength={70}
                    value={form.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g., Midnight Tamil Nadu Pillar Painting"
                    className="w-full text-xs px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--background)] text-[var(--foreground)] outline-none focus:border-[var(--accent)] transition-all font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-[var(--foreground-secondary)]">System Core Route Slug</label>
                  <input 
                    type="text"
                    disabled
                    value={form.slug}
                    placeholder="auto-generated-slug-path"
                    className="w-full text-xs px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--background-secondary)] text-[var(--foreground-secondary)] outline-none font-mono opacity-80"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold uppercase text-[var(--foreground-secondary)]">Short Abstract Snippet</label>
                  <span className="text-[10px] text-[var(--foreground-secondary)] font-mono">{form.shortDescription.length}/160</span>
                </div>
                <input 
                  type="text"
                  maxLength={160}
                  value={form.shortDescription}
                  onChange={(e) => setForm(p => ({ ...p, shortDescription: e.target.value }))}
                  placeholder="Brief 2-line preview note shown on collection cards..."
                  className="w-full text-xs px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--background)] text-[var(--foreground)] outline-none focus:border-[var(--accent)] transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-[var(--foreground-secondary)]">Deep Editorial Catalog Description</label>
                <textarea 
                  rows={5}
                  value={form.description}
                  onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Write detailed information about the craftsmanship, traditional roots, framing materials, and specific production parameters..."
                  className="w-full text-xs p-3 border border-[var(--border)] rounded-xl bg-[var(--background)] text-[var(--foreground)] outline-none focus:border-[var(--accent)] transition-all leading-relaxed"
                />
              </div>
            </div>
          </GlassCard>

          {/* CARD 2: MEDIA GALLERY MANAGER */}
          <GlassCard>
            <SectionHeader 
              icon={FiImage} 
              title="Visual Content Repositories" 
              description="Manage catalog presentation images and immersive promotional short video resources." 
            />
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-[var(--foreground-secondary)]">Primary Poster Cover Link</label>
                  <input 
                    type="text"
                    value={form.image}
                    onChange={(e) => setForm(p => ({ ...p, image: e.target.value }))}
                    placeholder="Paste primary absolute layout image URL..."
                    className="w-full text-xs px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--background)] text-[var(--foreground)] outline-none focus:border-[var(--accent)] transition-all font-mono"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-[var(--foreground-secondary)]">Append Showcase Secondary Image</label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={newImageInput}
                      onChange={(e) => setNewImageInput(e.target.value)}
                      placeholder="Paste supplementary asset link..."
                      className="w-full text-xs px-3 py-1.5 border border-[var(--border)] rounded-xl bg-[var(--background)] text-[var(--foreground)] outline-none focus:border-[var(--accent)] transition-all font-mono"
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        if (newImageInput.trim()) {
                          setForm(p => ({ ...p, images: [...p.images, newImageInput.trim()] }));
                          setNewImageInput('');
                        }
                      }}
                      className="px-3 bg-[var(--accent-light)] text-[var(--accent)] border border-[var(--border)] text-xs rounded-xl font-bold hover:bg-[var(--accent)] hover:text-[var(--background)] transition-all"
                    >
                      Push
                    </button>
                  </div>
                </div>
              </div>

              {form.images.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase text-[var(--foreground-secondary)] tracking-wider">Secondary Carousel Sub-elements</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <LayoutGroup id="gallery-matrix">
                      {form.images.map((imgUrl, i) => (
                        <motion.div 
                          key={i} 
                          variants={itemAnimation}
                          layout
                          className="relative group aspect-[4/5] rounded-xl overflow-hidden bg-[var(--background-secondary)] border border-[var(--border)] shadow-xs"
                        >
                          <img src={imgUrl} alt="Sub Asset Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                            <button 
                              type="button"
                              onClick={() => setForm(p => ({ ...p, image: imgUrl }))}
                              className="p-1.5 bg-white text-neutral-900 rounded-md text-[10px] font-bold hover:scale-105 transition-transform"
                            >
                              Cover
                            </button>
                            <button 
                              type="button"
                              onClick={() => setForm(p => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }))}
                              className="p-1.5 bg-red-600 text-white rounded-md hover:scale-105 transition-transform"
                            >
                              <FiTrash2 size={11} />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </LayoutGroup>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>

          {/* CARD 3: VARIANT CARD MATRIX */}
          <GlassCard>
            <div className="flex justify-between items-center border-b border-[var(--border)] pb-3 mb-4">
              <h3 className="text-sm font-bold tracking-tight text-[var(--foreground)]">Variant Matrix</h3>
              <button 
                type="button"
                onClick={addVariantItem}
                className="px-2.5 py-1.5 bg-[var(--accent)] text-[var(--background)] rounded-xl text-xs font-bold shadow-xs hover:opacity-90 flex items-center gap-1 transition-all"
              >
                <FiPlus size={12} /> Add Card
              </button>
            </div>

            {variants.length === 0 ? (
              <div className="p-8 border border-dashed border-[var(--border)] rounded-2xl text-center bg-[var(--background-secondary)]/30">
                <p className="text-xs text-[var(--foreground-secondary)]">No item variants assigned yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LayoutGroup id="variants-matrix">
                  <AnimatePresence mode="popLayout">
                    {variants.map((v, idx) => (
                      <motion.div 
                        key={idx}
                        variants={cardEntrance}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        layout
                        className="bg-[var(--background)] border border-[var(--border)] p-4 rounded-2xl space-y-3 relative hover:border-[var(--accent)] transition-colors"
                      >
                        <div className="flex justify-between items-center border-b border-[var(--border)] pb-1.5">
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-[var(--background-secondary)] text-[var(--foreground-secondary)]">
                            Variant #{idx + 1}
                          </span>
                          <button 
                            type="button"
                            onClick={() => removeVariantItem(idx)}
                            className="text-[var(--foreground-secondary)] hover:text-[var(--error)] p-1 transition-colors"
                          >
                            <FiTrash2 size={13} />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-0.5">
                            <label className="text-[9px] font-bold uppercase text-[var(--foreground-secondary)]">SKU</label>
                            <input 
                              type="text"
                              value={v.sku}
                              onChange={(e) => handleVariantUpdate(idx, 'sku', e.target.value)}
                              className="w-full text-xs px-2 py-1 border border-[var(--border)] rounded-lg bg-[var(--card-bg)] text-[var(--foreground)] font-mono outline-none focus:border-[var(--accent)]"
                            />
                          </div>
                          <div className="space-y-0.5">
                            <label className="text-[9px] font-bold uppercase text-[var(--foreground-secondary)]">Size</label>
                            <input 
                              type="text"
                              value={v.size}
                              onChange={(e) => handleVariantUpdate(idx, 'size', e.target.value)}
                              className="w-full text-xs px-2 py-1 border border-[var(--border)] rounded-lg bg-[var(--card-bg)] text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                            />
                          </div>
                          <div className="space-y-0.5">
                            <label className="text-[9px] font-bold uppercase text-[var(--foreground-secondary)]">Price</label>
                            <input 
                              type="number"
                              value={v.price}
                              onChange={(e) => handleVariantUpdate(idx, 'price', parseFloat(e.target.value) || 0)}
                              className="w-full text-xs px-2 py-1 border border-[var(--border)] rounded-lg bg-[var(--card-bg)] text-[var(--foreground)] font-mono outline-none focus:border-[var(--accent)]"
                            />
                          </div>
                          <div className="space-y-0.5">
                            <label className="text-[9px] font-bold uppercase text-[var(--foreground-secondary)]">Stock</label>
                            <input 
                              type="number"
                              value={v.stockCount}
                              onChange={(e) => handleVariantUpdate(idx, 'stockCount', parseInt(e.target.value, 10) || 0)}
                              className="w-full text-xs px-2 py-1 border border-[var(--border)] rounded-lg bg-[var(--card-bg)] text-[var(--foreground)] font-mono outline-none focus:border-[var(--accent)]"
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </LayoutGroup>
              </div>
            )}
          </GlassCard>

        </div>

        {/* RIGHT STICKY SIDEBAR COLUMN (5 Streams out of 12) */}
        <div className="grid grid-cols-1 gap-6 lg:col-span-5 w-full min-w-0 lg:sticky lg:top-20">
          
          {/* CARD 4: LIVE PREVIEW ACCORDION CARD */}
          <GlassCard className="overflow-hidden !p-0">
            <div className="relative aspect-[16/10] bg-[var(--background-secondary)] w-full border-b border-[var(--border)]">
              {form.image ? (
                <img src={form.image} alt="Live Preview Frame" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-[var(--foreground-secondary)] gap-1">
                  <FiImage size={20} className="opacity-40" />
                  <span className="text-[10px] font-mono uppercase">Awaiting Image Link</span>
                </div>
              )}
              <div className="absolute top-3 right-3">
                <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 bg-[var(--background)] border border-[var(--border)] rounded-md shadow-xs text-[var(--accent)]">
                  {form.status}
                </span>
              </div>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-[var(--foreground)] truncate">{form.title || 'Untitled Artwork Blueprint'}</h4>
                  <span className="text-[9px] text-[var(--foreground-secondary)] font-medium bg-[var(--background-secondary)] px-1.5 py-0.5 rounded-md border border-[var(--border)] capitalize mt-1 inline-block">
                    {form.category}
                  </span>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[9px] text-[var(--foreground-secondary)] uppercase font-bold">Starting At</p>
                  <p className="text-xs font-bold font-mono text-[var(--accent)] mt-0.5">
                    ₹{variants.length ? Math.min(...variants.map(v => v.price || 0)) : '0'}
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* CARD 5: PUBLISH STATUS CONTROLS */}
          <GlassCard>
            <SectionHeader icon={FiActivity} title="Lifecycle Status" />
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-secondary)]">Status Level</label>
                <div className="grid grid-cols-3 gap-1 bg-[var(--background)] border border-[var(--border)] p-1 rounded-xl">
                  {(['draft', 'active', 'archived'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, status: st, isArchived: st === 'archived' }))}
                      className={`text-[10px] font-bold py-1.5 rounded-lg capitalize transition-all ${
                        form.status === st 
                          ? 'bg-[var(--accent)] text-[var(--background)] shadow-xs' 
                          : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'
                      }`}
                    >
                      {st}
                    </button>
                    ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[var(--border)]">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-[var(--foreground-secondary)]">Category Taxonomy</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full text-xs px-2.5 py-2 border border-[var(--border)] rounded-xl bg-[var(--background)] text-[var(--foreground)] outline-none focus:border-[var(--accent)] font-medium cursor-pointer"
                  >
                    {Object.entries(PRODUCT_CATEGORIES).map(([key, item]) => (
                      <option key={key} value={key} className="capitalize">{item.label || key}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-[var(--foreground-secondary)]">Subcategory Theme</label>
                  <input 
                    type="text"
                    value={form.subcategory}
                    onChange={(e) => setForm(p => ({ ...p, subcategory: e.target.value }))}
                    placeholder="Theme tags..."
                    className="w-full text-xs px-2.5 py-2 border border-[var(--border)] rounded-xl bg-[var(--background)] text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2 border-t border-[var(--border)]">
                <label className="flex items-center gap-2 text-xs font-semibold text-[var(--foreground)] cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={form.isBestSeller}
                    onChange={(e) => setForm(p => ({ ...p, isBestSeller: e.target.checked }))}
                    className="rounded border-[var(--border)] accent-[var(--accent)] h-4 w-4"
                  />
                  Flag as <span className="text-[var(--success)] font-bold">Best Seller</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-[var(--foreground)] cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={form.isTrending}
                    onChange={(e) => setForm(p => ({ ...p, isTrending: e.target.checked }))}
                    className="rounded border-[var(--border)] accent-[var(--accent)] h-4 w-4"
                  />
                  Flag as <span className="text-[var(--accent)] font-bold">Trending Item</span>
                </label>
              </div>
            </div>
          </GlassCard>

          {/* CARD 6: RECONCILED INVENTORY METRICS */}
          <GlassCard>
            <SectionHeader icon={FiBarChart2} title="Live Storage Calculations" />
            <div className="grid grid-cols-2 gap-3">
              <MetricCard label="Total SKUs" value={inventoryAnalytics.totalVariants} icon={FiLayers} />
              <MetricCard label="Total Stock" value={inventoryAnalytics.totalStock} icon={FiPackage} />
            </div>
          </GlassCard>

          {/* CARD 7: SEO SEARCH ENGINE TAG PANELS */}
          <GlassCard>
            <SectionHeader icon={FiCompass} title="SEO Metadata Optimization" />
            <div className="space-y-3">
              <div className="space-y-1">
                <input 
                  type="text"
                  maxLength={60}
                  value={form.seoMetaTitle}
                  onChange={(e) => setForm(p => ({ ...p, seoMetaTitle: e.target.value }))}
                  placeholder="SEO Target Title String Metadata"
                  className="w-full text-xs px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--background)] text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="space-y-1">
                <input 
                  type="text"
                  maxLength={160}
                  value={form.seoMetaDescription}
                  onChange={(e) => setForm(p => ({ ...p, seoMetaDescription: e.target.value }))}
                  placeholder="SEO Snippet Description Copy Text"
                  className="w-full text-xs px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--background)] text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="block text-[9px] font-bold uppercase text-[var(--foreground-secondary)]">Discovery Keywords</label>
                <input 
                  type="text"
                  value={newKeywordInput}
                  onChange={(e) => setNewKeywordInput(e.target.value)}
                  onKeyDown={handleAddKeyword}
                  placeholder="Press enter to add tokens..."
                  className="w-full text-xs px-3 py-1.5 border border-[var(--border)] rounded-xl bg-[var(--background)] text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                />
                <div className="flex flex-wrap gap-1 mt-1">
                  {form.seoKeywords.map((tag) => (
                    <span key={tag} className="text-[9px] font-mono px-2 py-0.5 bg-[var(--background-secondary)] border border-[var(--border)] rounded-md flex items-center gap-1 text-[var(--foreground-secondary)]">
                      {tag}
                      <button type="button" onClick={() => setForm(p => ({ ...p, seoKeywords: p.seoKeywords.filter(k => k !== tag) }))} className="hover:text-[var(--error)] font-bold">×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>

        </div>

      </div>
    </form>
  );
}