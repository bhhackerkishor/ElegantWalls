import type { Product, ProductVariant } from '@/types';
import type { PriceBreakdown } from '@/types/preview';

function findCheapestWithoutFrame(
  variants: ProductVariant[],
  match: Pick<ProductVariant, 'size' | 'material' | 'orientation'>
): ProductVariant | undefined {
  const candidates = variants.filter(
    (v) =>
      v.size === match.size &&
      v.material === match.material &&
      v.orientation === match.orientation &&
      (v.frame === 'No Frame' || v.frame === 'None')
  );
  if (candidates.length) return candidates.reduce((a, b) => (a.price < b.price ? a : b));
  return variants.find(
    (v) =>
      v.size === match.size &&
      v.material === match.material &&
      v.orientation === match.orientation
  );
}

function findCheapestFrameForSize(
  variants: ProductVariant[],
  size: string
): number {
  const sizeVariants = variants.filter((v) => v.size === size);
  if (!sizeVariants.length) return 0;
  return Math.min(...sizeVariants.map((v) => v.price));
}

export function getPriceBreakdown(product: Product, variant: ProductVariant): PriceBreakdown {
  const totalPrice = variant.price;

  if (product.category === 'poster' || product.category === 'custom') {
    const baseVariant = findCheapestWithoutFrame(product.variants, variant);
    const basePrice = baseVariant?.price ?? totalPrice;
    return {
      basePrice,
      frameCost: Math.max(0, totalPrice - basePrice),
      totalPrice,
    };
  }

  if (product.category === 'frame') {
    const basePrice = findCheapestFrameForSize(product.variants, variant.size);
    return {
      basePrice,
      frameCost: Math.max(0, totalPrice - basePrice),
      totalPrice,
    };
  }

  // Sticker & canvas — single price tier
  return { basePrice: totalPrice, frameCost: 0, totalPrice };
}
