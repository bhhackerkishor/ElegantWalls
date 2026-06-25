'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaWhatsapp } from 'react-icons/fa';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/CartDrawer';
import Container from '@/components/ui/Container';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ProductCard from '@/components/product/ProductCard';
import MovingReels from '@/components/MovingReels';
import TrustBadges from '@/components/home/TrustBadges';
import FAQSection from '@/components/home/FAQSection';
import InstagramGallery from '@/components/home/InstagramGallery';
import HeroSection from '@/components/home/HeroSection';
//import CollectionsPage from '@/components/home/CollectionsPage';
import type { Product, Banner } from '@/types';
import { WHATSAPP_NUMBER } from '@/lib/constants';

function HomeContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [bannerIdx, setBannerIdx] = useState(0);

  useEffect(() => {
    setLoading(true);

    // Build the query string dynamically from whatever is present in the browser URL bar
    const queryObj: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      queryObj[key] = value;
    });

    // Default configuration: If no specific searchParams filters are supplied, we clear limits 
    // to match your original structure logic.
    if (!queryObj.limit) queryObj.limit = '50'; 

    const queryString = new URLSearchParams(queryObj).toString();

    Promise.all([
      fetch(`/api/products?${queryString}`).then((r) => r.json()),
      fetch('/api/banners').then((r) => r.json()),
    ])
      .then(([prodData, bannerData]) => {
        if (prodData.success) {
          // Robustly parse the paginated data scheme returned by your GET route
          const list = prodData.data?.products || prodData.data || [];
          setProducts(Array.isArray(list) ? list : []);
        }
        if (bannerData.success) {
          setBanners(bannerData.data || []);
        }
      })
      .catch((err) => console.error('Error fetching home content data:', err))
      .finally(() => setLoading(false));
  }, [searchParams]); // Re-runs instantly whenever any URL parameter changes

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setBannerIdx((p) => (p + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  // Derive sub-arrays based on current filter states safely
  const posters = products.filter((p) => p.category === 'poster').slice(0, 4);
  const frames = products.filter((p) => p.category === 'frame').slice(0, 4);

  return (
    <>
      <Navbar />
      <CartDrawer />
      
      <HeroSection />
      <MovingReels />
      

      {/* --- FEATURED POSTERS --- */}
      <section className="py-20 border-b border-border">
        <Container>
          <div className="flex justify-between items-end mb-8">
            <div>
              <Badge>Featured Posters</Badge>
              <h2 className="text-3xl font-display mt-2">Wall Posters & Prints</h2>
            </div>
            <Link href="/posters">
              <Button variant="secondary" size="sm">View All →</Button>
            </Link>
          </div>
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <p className="text-foreground-secondary animate-pulse text-sm font-medium tracking-wide">
                Curating artwork layout...
              </p>
            </div>
          ) : posters.length === 0 ? (
            <p className="text-center py-12 text-sm text-foreground-secondary">
              No matching art prints found for this collection criteria.
            </p>
          ) : (
            <div className="product-grid">
              {posters.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* --- FEATURED FRAMES --- */}
      <section className="py-20 border-b border-border">
        <Container>
          <div className="flex justify-between items-end mb-8">
            <div>
              <Badge>Featured Frames</Badge>
              <h2 className="text-3xl font-display mt-2">Premium Photo Frames</h2>
            </div>
            <Link href="/photo-frames">
              <Button variant="secondary" size="sm">View All →</Button>
            </Link>
          </div>
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <p className="text-foreground-secondary animate-pulse text-sm font-medium tracking-wide">
                Assembling frames...
              </p>
            </div>
          ) : frames.length === 0 ? (
            <p className="text-center py-12 text-sm text-foreground-secondary">
              No premium frames matching active criteria.
            </p>
          ) : (
            <div className="product-grid">
              {frames.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </Container>
      </section>

      <TrustBadges />
      <InstagramGallery />
      <FAQSection />

      {/* Floating Concierge Action Trigger */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20Elegant%20Walls!`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-[1000] flex items-center gap-2 bg-[#25D366] text-white px-5 py-3 rounded-full shadow-lg font-bold text-sm no-print animate-pulse-badge hover:scale-105 transition-transform"
      >
        <FaWhatsapp size={20} /> Need Help?
      </a>

      <Footer />
    </>
  );
}

// Next.js requires components accessing useSearchParams to be safely wrapped inside a Suspense Boundary
export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="w-full min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground-secondary animate-pulse tracking-widest text-xs uppercase font-medium">
          Loading Gallery Collections...
        </p>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}