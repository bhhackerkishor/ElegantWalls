import type { ProductCategory } from '@/types';

export type PreviewTab = 'frame' | 'wall' | '3d';

export type RoomEnvironment = 'living-room' | 'bedroom' | 'office';

export type FrameStyleKey =
  | 'natural-oak'
  | 'black-matte'
  | 'white-classic'
  | 'walnut-wood'
  | 'black-frame'
  | 'white-frame'
  | 'wooden-frame'
  | 'none';

export interface FrameStyleConfig {
  key: FrameStyleKey;
  label: string;
  /** Outer frame face color / gradient */
  face: string;
  /** Inner bevel highlight */
  highlight: string;
  /** Shadow color for depth */
  shadow: string;
  /** Side edge color for 3D depth illusion */
  edge: string;
  /** Texture type */
  texture: 'wood-light' | 'wood-dark' | 'matte-black' | 'smooth-white' | 'gold-wood' | 'flat';
  /** Frame border width as % of shorter side */
  borderRatio: number;
  /** Depth in px for CSS shadow stack */
  depthPx: number;
}

export interface SizeDimensions {
  widthIn: number;
  heightIn: number;
  label: string;
}

export interface PriceBreakdown {
  basePrice: number;
  frameCost: number;
  totalPrice: number;
}

export interface PreviewArtworkProps {
  imageUrl: string;
  size: string;
  frame: string;
  orientation: string;
  category: ProductCategory;
  isLoading?: boolean;
}

export interface RoomMockupConfig {
  environment: RoomEnvironment;
  imageUrl: string;
  size: string;
  frame: string;
  orientation: string;
  category: ProductCategory;
}
