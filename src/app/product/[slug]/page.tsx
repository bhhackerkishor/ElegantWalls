'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/CartDrawer';
import Container from '@/components/ui/Container';
import Badge from '@/components/ui/Badge';
import VariantSelector from '@/components/product/VariantSelector';
import ProductCard from '@/components/product/ProductCard';
import ProductReviews from '@/components/product/ProductReviews';
import ProductConfigurator from '@/components/preview/ProductConfigurator';
import { useProductConfiguration } from '@/hooks/useProductConfiguration';
import type { Product } from '@/types';
import { PRODUCT_CATEGORIES } from '@/lib/constants';
import { formatPrice, getStartingPrice } from '@/lib/utils';

function ProductDetailContent({
  product,
  recommendations,
}: {
  product: Product;
  recommendations: Product[];
}) {
  const config = useProductConfiguration(product);
  const categoryLabel = PRODUCT_CATEGORIES[product.category]?.label;

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
  <div className="lg:sticky lg:top-[130px] lg:self-start">
    <ProductConfigurator product={product} config={config} />
    
    {/* Explicit Luxury Contrast Disclaimer Block */}
    <div className="
  mt-5
  rounded-2xl
  border
  border-[var(--glass-border)]
  bg-[var(--glass-bg)]
  backdrop-blur-xl
  px-6 py-5
  shadow-[0_8px_30px_rgba(0,0,0,0.04)]
  transition-all
  duration-500
">
  <div className="flex items-start gap-4">
    
    {/* Icon */}
    <div className="
      flex h-8 w-8 shrink-0 items-center justify-center
      rounded-full
      bg-[var(--accent-light)]
      border border-[var(--border)]
    ">
      <svg
        className="h-4 w-4 text-[var(--accent)]"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.7"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8.25h.008v.008H12V8.25zm-.75 3h1.5v4.5h-1.5v-4.5zM12 21a9 9 0 100-18 9 9 0 000 18z"
        />
      </svg>
    </div>

    <div className="space-y-2">
      <h4 className="
        font-serif
        text-sm
        tracking-wide
        text-[var(--foreground)]
      ">
        Perspective Note
      </h4>

      <p className="
        text-[13px]
        leading-[1.8]
        font-normal
        tracking-[0.01em]
        text-[var(--foreground-secondary)]
      ">
        This interactive canvas serves as a visual approximation of
        scale, proportion, and structural depth. Final handcrafted
        dimensions, refined beveling, and museum-grade print depth
        specifications will be precisely aligned with our production
        standards.
      </p>
    </div>
  </div>
</div>
  </div>



        <div>
          <Badge>{categoryLabel}</Badge>
          {product.isBestSeller && <Badge className="ml-2">Best Seller</Badge>}
          <h1 className="text-3xl md:text-4xl font-display font-bold mt-3">{product.title}</h1>
          <p className="text-foreground-secondary mt-3 leading-relaxed">{product.description}</p>
          <p className="text-sm text-foreground-secondary mt-2">
            From {formatPrice(getStartingPrice(product))}
          </p>
          <div className="mt-8">
            <VariantSelector product={product} config={config} />
          </div>
        </div>
      </div>

      <ProductReviews productId={product._id} />

      {recommendations.length > 0 && (
        <section className="mt-20">
          <h2 className="text-2xl font-display font-bold mb-6">You May Also Like</h2>
          <div className="product-grid">
            {recommendations.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/products?slug=${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setProduct(data.data);
          fetch('/api/recently-viewed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: data.data._id }),
          }).catch(() => {});
          fetch(`/api/recommendations?productId=${data.data._id}`)
            .then((r) => r.json())
            .then((rec) => {
              if (rec.success) setRecommendations(rec.data);
            });
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="pt-[115px] min-h-screen flex items-center justify-center">Loading...</div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <Container className="pt-[115px] py-20 text-center">
          <h1 className="text-2xl font-bold">Product not found</h1>
          <Link href="/" className="text-accent mt-4 inline-block">
            Back to Home
          </Link>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="pt-[115px] min-h-screen">
        <Container className="py-10">
          <ProductDetailContent product={product} recommendations={recommendations} />
        </Container>
      </main>
      <Footer />
    </>
  );
}
