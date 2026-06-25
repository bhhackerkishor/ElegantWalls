import type { SizeDimensions } from '@/types/preview';

/** Parse product size strings into inch dimensions for proportional display */
export function parseSizeDimensions(size: string, orientation: string): SizeDimensions {
  const label = size;

  // Photo frame sizes: "4×4 Inch", "12×10 Inch"
  const inchMatch = size.match(/(\d+)\s*[×x]\s*(\d+)/i);
  if (inchMatch) {
    let w = parseInt(inchMatch[1], 10);
    let h = parseInt(inchMatch[2], 10);
    if (orientation === 'Landscape' && w < h) [w, h] = [h, w];
    if (orientation === 'Portrait' && w > h) [w, h] = [h, w];
    return { widthIn: w, heightIn: h, label };
  }

  // Poster sizes A-series (approx inches)
  const posterSizes: Record<string, [number, number]> = {
    A5: [5.8, 8.3],
    A4: [8.3, 11.7],
    A3: [11.7, 16.5],
    A2: [16.5, 23.4],
  };
  if (posterSizes[size]) {
    let [w, h] = posterSizes[size];
    if (orientation === 'Landscape') [w, h] = [h, w];
    return { widthIn: w, heightIn: h, label };
  }

  // Named sizes for stickers / canvas
  const namedSizes: Record<string, [number, number]> = {
    Small: [12, 12],
    Medium: [18, 18],
    Large: [24, 24],
  };
  if (namedSizes[size]) {
    const [w, h] = namedSizes[size];
    return { widthIn: w, heightIn: h, label };
  }

  // Fallback constants-style labels
  const legacy: Record<string, [number, number]> = {
    'A4 Size': [8.3, 11.7],
    'A3 Size': [11.7, 16.5],
    'Medium (8x10 in)': [8, 10],
    'Large (12x15 in)': [12, 15],
    'Huge (12x18 in)': [12, 18],
  };
  if (legacy[size]) {
    let [w, h] = legacy[size];
    if (orientation === 'Landscape') [w, h] = [h, w];
    return { widthIn: w, heightIn: h, label };
  }

  return { widthIn: 12, heightIn: 16, label };
}

/** Scale factor 0–1 relative to largest frame (16×24) for preview container */
export function getDisplayScale(dims: SizeDimensions, maxRef = 16 * 24): number {
  const area = dims.widthIn * dims.heightIn;
  const minArea = 4 * 4;
  const maxArea = maxRef;
  const normalized = (area - minArea) / (maxArea - minArea);
  return 0.38 + Math.min(1, Math.max(0, normalized)) * 0.62;
}

/** Convert inch dimensions to CSS aspect ratio string */
export function getAspectRatio(dims: SizeDimensions): string {
  return `${dims.widthIn} / ${dims.heightIn}`;
}

/** Max preview width in px based on scale */
export function getPreviewWidth(scale: number, containerMax = 420): number {
  return Math.round(containerMax * scale);
}
