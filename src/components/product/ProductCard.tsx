'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiHeart, FiShoppingCart } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import type { Product } from '@/types';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatPrice, getStartingPrice } from '@/lib/utils';
import { PRODUCT_CATEGORIES } from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';

interface ProductCardProps {
  product: Product;
  onCustomize?: (product: Product) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (productId: string) => void;
}

export default function ProductCard({
  product,
  onCustomize,
  isWishlisted,
  onToggleWishlist,
}: ProductCardProps) {
  const { isAuthenticated, getAuthHeaders } = useAuth();
  const [wishlisted, setWishlisted] = useState(isWishlisted ?? false);
  const price = getStartingPrice(product);
  const categoryLabel = PRODUCT_CATEGORIES[product.category]?.label || product.category;
  const inStock = product?.variants?.some((v) => v.stockCount > 0);

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;

    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ productId: product._id }),
      });
      const data = await res.json();
      if (data.success) {
        setWishlisted(data.data.isWishlisted);
        onToggleWishlist?.(product._id);
      }
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="lux-card group relative flex flex-col overflow-hidden">
      <Link href={`/product/${product.slug}`} className="block relative">
        
        {/* Media Frame Workspace Display */}
        <div className="relative aspect-[4/5] overflow-hidden bg-[var(--background-secondary)] border-b border-[var(--border)] rounded-t-[23px]">
          <Image
            src={product.image}
            alt={product.title}
            fill
            sizes="(max-width:768px) 50vw, 320px"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-102 filter brightness-[0.98] dark:brightness-95 contrast-[1.01]"
            loading="lazy"
          />
          
          {product.isBestSeller && (
            <Badge className="absolute top-4 left-4 bg-[var(--foreground)] text-[var(--background)] font-mono uppercase tracking-widest text-[9px] px-2.5 py-0.5 rounded-full border-none font-medium">
              Bestseller
            </Badge>
          )}
          
          {!inStock && (
            <span className="absolute top-4 left-4 px-2.5 py-0.5 text-[9px] font-semibold font-mono tracking-widest uppercase bg-neutral-950/90 text-white dark:bg-white dark:text-neutral-950 rounded-full">
              Archived
            </span>
          )}
          
          {isAuthenticated && (
            <button
              onClick={handleWishlist}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-[var(--background-secondary)] opacity-85 backdrop-blur-md border border-[var(--border)] cursor-pointer text-[var(--foreground)] hover:text-[var(--accent)] transition-colors duration-300"
              aria-label="Toggle wishlist"
            >
              {wishlisted ? <FaHeart className="text-[var(--accent)]" size={13} /> : <FiHeart size={13} />}
            </button>
          )}
        </div>

        {/* Text Content Block info updates */}
        <div className="p-5 flex flex-col flex-grow gap-1">
          <span className="text-[9px] uppercase tracking-widest font-mono font-medium lux-muted">{categoryLabel}</span>
          <h3 className="text-sm font-medium tracking-wide leading-snug line-clamp-1 lux-heading">{product.title}</h3>
          <p className="text-xs font-light line-clamp-2 leading-relaxed min-h-[2.5rem] lux-muted">{product.description}</p>
          
          <div className="flex items-baseline justify-between mt-auto pt-4 border-t border-[var(--border)] opacity-90">
            <span className="text-xs font-mono font-medium text-[var(--foreground)]">{formatPrice(price)}</span>
            <span className="text-[9px] uppercase tracking-wider font-light lux-muted">onwards</span>
          </div>
        </div>
      </Link>
      
      {/* Footer Call to Action controls layout */}
      <div className="px-5 pb-5 mt-auto">
        <Button
          variant={"outline"as any}
          size="sm"
          className="w-full lux-button border-[var(--border)] py-2.5 flex items-center justify-center gap-2 bg-transparent text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:border-[var(--accent)] transition-colors"
          onClick={() => onCustomize ? onCustomize(product) : (window.location.href = `/product/${product.slug}`)}
        >
          Customize
        </Button>
      </div>
    </div>
  );
}