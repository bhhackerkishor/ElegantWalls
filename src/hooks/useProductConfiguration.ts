'use client';

import { useState, useMemo, useCallback } from 'react';
import type { Product, ProductVariant } from '@/types';
import type { PriceBreakdown } from '@/types/preview';
import { getPriceBreakdown } from '@/lib/preview/pricing';
import { useCart } from '@/context/CartContext';

export interface ProductConfiguration {
  selectedSize: string;
  selectedFrame: string;
  selectedMaterial: string;
  selectedOrientation: string;
  customImage: string | null;
  uploading: boolean;
  availableSizes: string[];
  availableFrames: string[];
  availableMaterials: string[];
  selectedVariant: ProductVariant;
  priceBreakdown: PriceBreakdown;
  artworkUrl: string;
  setSelectedSize: (s: string) => void;
  setSelectedFrame: (f: string) => void;
  setSelectedMaterial: (m: string) => void;
  setSelectedOrientation: (o: string) => void;
  handleUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleAddToCart: (onAdd?: () => void) => void;
}

export function useProductConfiguration(product: Product): ProductConfiguration {
  const { addToCart, logEvent } = useCart();

  const variants = product.variants ?? [];

  const availableSizes = useMemo(
    () => [...new Set(variants.map((v) => v.size))],
    [variants]
  );

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedFrame, setSelectedFrame] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [selectedOrientation, setSelectedOrientation] = useState('Portrait');
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const effectiveSize = selectedSize || availableSizes[0] || '';

  const availableFrames = useMemo(
    () =>
      [
        ...new Set(
          variants
            .filter((v) => !effectiveSize || v.size === effectiveSize)
            .map((v) => v.frame)
        ),
      ],
    [variants, effectiveSize]
  );

  const effectiveFrame = selectedFrame || availableFrames[0] || '';

  function matchPartial(v: ProductVariant) {
    if (effectiveSize && v.size !== effectiveSize) return false;
    if (effectiveFrame && v.frame !== effectiveFrame) return false;
    return true;
  }

  const availableMaterials = useMemo(
    () => [...new Set(variants.filter((v) => matchPartial(v)).map((v) => v.material))],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [variants, effectiveSize, effectiveFrame]
  );

  const effectiveMaterial = selectedMaterial || availableMaterials[0] || '';

  const selectedVariant = useMemo(() => {
    return (
      variants.find(
        (v) =>
          v.size === effectiveSize &&
          v.frame === effectiveFrame &&
          v.material === effectiveMaterial &&
          v.orientation === selectedOrientation
      ) || variants[0] || {
        sku: '',
        size: '',
        frame: '',
        material: '',
        orientation: 'Portrait',
        price: 0,
        stockCount: 0,
      }
    );
  }, [
    variants,
    effectiveSize,
    effectiveFrame,
    effectiveMaterial,
    selectedOrientation,
  ]);

  const priceBreakdown = useMemo(
    () => getPriceBreakdown(product, selectedVariant),
    [product, selectedVariant]
  );

  const artworkUrl = customImage || product.image;

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) {
          setCustomImage(data.data?.url || data.url);
          logEvent('custom_upload', { productId: product._id });
        }
      } finally {
        setUploading(false);
      }
    },
    [product._id, logEvent]
  );

  const handleAddToCart = useCallback(
    (onAdd?: () => void) => {
      if (!selectedVariant) return;
      if (selectedVariant.stockCount <= 0) {
        alert('This variant is out of stock.');
        return;
      }
      addToCart(product, selectedVariant, customImage || undefined);
      onAdd?.();
    },
    [addToCart, product, selectedVariant, customImage]
  );

  return {
    selectedSize: effectiveSize,
    selectedFrame: effectiveFrame,
    selectedMaterial: effectiveMaterial,
    selectedOrientation,
    customImage,
    uploading,
    availableSizes,
    availableFrames,
    availableMaterials,
    selectedVariant,
    priceBreakdown,
    artworkUrl,
    setSelectedSize,
    setSelectedFrame,
    setSelectedMaterial,
    setSelectedOrientation,
    handleUpload,
    handleAddToCart,
  };
}
