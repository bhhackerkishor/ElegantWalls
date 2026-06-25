'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiSearch } from 'react-icons/fi';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/CartDrawer';
import Container from '@/components/ui/Container';
import Badge from '@/components/ui/Badge';
import ProductCard from '@/components/product/ProductCard';
import type { Product, ProductCategory } from '@/types';
import { PRODUCT_CATEGORIES, SIZE_OPTIONS, MATERIAL_OPTIONS } from '@/lib/constants';

interface CategoryPageProps {
  category: ProductCategory;
}

export default function CategoryPage({ category }: CategoryPageProps) {
  const meta = PRODUCT_CATEGORIES[category];
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [materialFilter, setMaterialFilter] = useState('');
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    const params = new URLSearchParams({ category, sort });
    if (search) params.set('search', search);
    if (sizeFilter) params.set('size', sizeFilter);
    if (materialFilter) params.set('material', materialFilter);

    setLoading(true);
    fetch(`/api/products?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setProducts(data.data.products || data.data);
      })
      .finally(() => setLoading(false));
  }, [category, search, sizeFilter, materialFilter, sort]);

  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="pt-[115px] min-h-screen">
        <section className="py-16 bg-gradient-to-br from-accent-light to-background border-b border-border">
          <Container className="text-center">
            <Badge>{meta.label}</Badge>
            <h1 className="text-4xl md:text-5xl font-display font-extrabold mt-3">{meta.label}</h1>
            <p className="text-foreground-secondary mt-3 max-w-xl mx-auto">{meta.description}</p>
          </Container>
        </section>

        <Container className="py-10">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-secondary" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-3 rounded-sm border border-border bg-card-bg outline-none focus:border-accent"
              />
            </div>
            <select value={sizeFilter} onChange={(e) => setSizeFilter(e.target.value)} className="px-4 py-3 rounded-sm border border-border bg-card-bg">
              <option value="">All Sizes</option>
              {SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={materialFilter} onChange={(e) => setMaterialFilter(e.target.value)} className="px-4 py-3 rounded-sm border border-border bg-card-bg">
              <option value="">All Materials</option>
              {MATERIAL_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="px-4 py-3 rounded-sm border border-border bg-card-bg">
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="bestseller">Best Sellers</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-20 text-foreground-secondary">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-foreground-secondary mb-4">No products found.</p>
              <Link href="/" className="text-accent font-semibold">Back to Home</Link>
            </div>
          ) : (
            <div className="product-grid">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </>
  );
}
