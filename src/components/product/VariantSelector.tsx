'use client';

import Image from 'next/image';
import type { Product } from '@/types';
import type { ProductConfiguration } from '@/hooks/useProductConfiguration';
import { ORIENTATION_OPTIONS } from '@/lib/constants';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import AnimatedPrice from '@/components/preview/AnimatedPrice';
import ConversionTrustBar from '@/components/preview/ConversionTrustBar';
import { FiUpload } from 'react-icons/fi';

interface VariantSelectorProps {
  product: Product;
  config: ProductConfiguration;
  onAdd?: () => void;
}

export default function VariantSelector({ product, config, onAdd }: VariantSelectorProps) {
  const {
    selectedSize,
    selectedFrame,
    selectedMaterial,
    selectedOrientation,
    customImage,
    uploading,
    availableSizes,
    availableFrames,
    availableMaterials,
    selectedVariant,
    priceBreakdown,
    setSelectedSize,
    setSelectedFrame,
    setSelectedMaterial,
    setSelectedOrientation,
    handleUpload,
    handleAddToCart,
  } = config;

  const pickerClass = (active: boolean) =>
    `px-3 py-2 text-sm rounded-sm border cursor-pointer transition-all ${
      active ? 'border-accent bg-accent-light text-accent font-semibold' : 'border-border bg-background hover:border-accent'
    }`;

  const showUpload =
    product.category === 'custom' ||
    product.category === 'frame' ||
    product.subcategory?.includes('Custom');

  const showFrameCost = priceBreakdown.frameCost > 0;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-foreground-secondary mb-2">Size</p>
        <div className="flex flex-wrap gap-2">
          {availableSizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSelectedSize(s)}
              className={pickerClass(selectedSize === s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {availableFrames.length > 1 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-foreground-secondary mb-2">Frame</p>
          <div className="flex flex-wrap gap-2">
            {availableFrames.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setSelectedFrame(f)}
                className={pickerClass(selectedFrame === f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-foreground-secondary mb-2">Material</p>
        <div className="flex flex-wrap gap-2">
          {availableMaterials.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setSelectedMaterial(m)}
              className={pickerClass(selectedMaterial === m)}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-foreground-secondary mb-2">Orientation</p>
        <div className="flex flex-wrap gap-2">
          {ORIENTATION_OPTIONS.filter((o) => product.variants.some((v) => v.orientation === o)).map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => setSelectedOrientation(o)}
              className={pickerClass(selectedOrientation === o)}
            >
              {o}
            </button>
          ))}
        </div>
      </div>

      {showUpload && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-foreground-secondary mb-2">Custom Image</p>
          <label className="flex items-center gap-2 px-4 py-3 border border-dashed border-border rounded-md cursor-pointer hover:border-accent transition-colors">
            <FiUpload />
            <span className="text-sm">{uploading ? 'Uploading…' : 'Upload your photo (JPEG/PNG)'}</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          </label>
          {customImage && (
            <div className="relative w-24 h-24 mt-2 rounded-md overflow-hidden border border-border">
              <Image src={customImage} alt="Custom upload" fill className="object-cover" />
            </div>
          )}
        </div>
      )}

      {/* Price breakdown */}
      <div className="pt-4 border-t border-border space-y-2">
        <div className="flex justify-between text-sm text-foreground-secondary">
          <span>Base Price</span>
          <AnimatedPrice value={priceBreakdown.basePrice} />
        </div>
        {showFrameCost && (
          <div className="flex justify-between text-sm text-foreground-secondary">
            <span>Frame Cost</span>
            <AnimatedPrice value={priceBreakdown.frameCost} />
          </div>
        )}
        <div className="flex justify-between items-end pt-1">
          <span className="text-sm font-semibold">Total</span>
          <AnimatedPrice value={priceBreakdown.totalPrice} className="text-2xl font-bold text-foreground" />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>
          {selectedVariant && selectedVariant.stockCount <= 5 && selectedVariant.stockCount > 0 && (
            <Badge>Only {selectedVariant.stockCount} left</Badge>
          )}
          {selectedVariant?.stockCount === 0 && (
            <Badge className="bg-error/10 text-error border-error/30">Out of Stock</Badge>
          )}
        </div>
        <Button
          onClick={() => handleAddToCart(onAdd)}
          disabled={!selectedVariant || selectedVariant.stockCount <= 0}
          className="min-w-[140px]"
        >
          Add to Cart
        </Button>
      </div>

      <ConversionTrustBar />
    </div>
  );
}
