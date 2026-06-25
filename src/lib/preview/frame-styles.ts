import type { FrameStyleConfig, FrameStyleKey } from '@/types/preview';

const FRAME_STYLE_MAP: Record<FrameStyleKey, FrameStyleConfig> = {
  'natural-oak': {
    key: 'natural-oak',
    label: 'Natural Oak',
    face: 'linear-gradient(145deg, #D4B896 0%, #C4A574 35%, #B8956A 70%, #A8845C 100%)',
    highlight: 'rgba(255, 248, 230, 0)',
    shadow: 'rgba(0, 0, 0, 0.3)',
    edge: '#8B6914',
    texture: 'wood-light',
    borderRatio: 0.08,
    depthPx: 14,
  },
  'black-matte': {
    key: 'black-matte',
    label: 'Black Matte',
    face: 'linear-gradient(160deg, #3A3A3A 0%, #1A1A1A 40%, #0D0D0D 100%)',
    highlight: 'rgba(80, 80, 80, 0)',
    shadow: 'rgba(0, 0, 0, 0.3)',
    edge: '#0A0A0A',
    texture: 'matte-black',
    borderRatio: 0.075,
    depthPx: 12,
  },
  'white-classic': {
    key: 'white-classic',
    label: 'White Classic',
    face: 'linear-gradient(160deg, #FFFFFF 0%, #F5F5F5 50%, #E8E8E8 100%)',
    highlight: 'rgba(255, 255, 255, 0)',
    shadow: 'rgba(0, 0, 0, 0.3)',
    edge: '#D0D0D0',
    texture: 'smooth-white',
    borderRatio: 0.07,
    depthPx: 10,
  },
  'walnut-wood': {
    key: 'walnut-wood',
    label: 'Walnut Wood',
    face: 'linear-gradient(145deg, #6B4423 0%, #5C3A1E 35%, #4A2F18 70%, #3D2614 100%)',
    highlight: 'rgba(180, 130, 80, 0)',
    shadow: 'rgba(0, 0, 0, 0.3)',
    edge: '#2A1808',
    texture: 'wood-dark',
    borderRatio: 0.085,
    depthPx: 14,
  },
  'black-frame': {
    key: 'black-frame',
    label: 'Black Frame',
    face: 'linear-gradient(160deg, #2E2E2E 0%, #1A1A1A 100%)',
    highlight: 'rgba(70, 70, 70, 0)',
    shadow: 'rgba(0, 0, 0, 0.29)',
    edge: '#111111',
    texture: 'matte-black',
    borderRatio: 0.06,
    depthPx: 10,
  },
  'white-frame': {
    key: 'white-frame',
    label: 'White Frame',
    face: 'linear-gradient(160deg, #FAFAFA 0%, #EEEEEE 100%)',
    highlight: 'rgba(255, 255, 255, 0)',
    shadow: 'rgba(0, 0, 0, 0.3)',
    edge: '#e21111',
    texture: 'smooth-white',
    borderRatio: 0.055,
    depthPx: 8,
  },
  'wooden-frame': {
    key: 'wooden-frame',
    label: 'Wooden Frame',
    face: 'linear-gradient(145deg, #C9A66B 0%, #A8845C 50%, #8B6914 100%)',
    highlight: 'rgba(255, 240, 210, 0.4)',
    shadow: 'rgba(0, 0, 0, 0.3)',
    edge: '#6B4E1A',
    texture: 'gold-wood',
    borderRatio: 0.065,
    depthPx: 12,
  },
  none: {
    key: 'none',
    label: 'No Frame',
    face: 'transparent',
    highlight: 'transparent',
    shadow: 'rgba(0, 0, 0, 0.3)',
    edge: 'transparent',
    texture: 'flat',
    borderRatio: 0,
    depthPx: 0,
  },
};

const FRAME_NAME_ALIASES: Record<string, FrameStyleKey> = {
  'natural oak': 'natural-oak',
  'natural oak finish': 'natural-oak',
  'black matte': 'black-matte',
  'midnight black': 'black-matte',
  'white classic': 'white-classic',
  'walnut wood': 'walnut-wood',
  'dark walnut': 'walnut-wood',
  'black frame': 'black-frame',
  'white frame': 'white-frame',
  'wooden frame': 'wooden-frame',
  'royal gold': 'wooden-frame',
  'no frame': 'none',
  none: 'none',
};

export function resolveFrameStyle(frameName: string): FrameStyleConfig {
  const normalized = frameName.toLowerCase().trim();
  const key = FRAME_NAME_ALIASES[normalized] ?? 'natural-oak';
  return FRAME_STYLE_MAP[key];
}

export function hasFrame(frameName: string): boolean {
  return resolveFrameStyle(frameName).key !== 'none';
}

export function getFrameDepthShadow(style: FrameStyleConfig): string {
  const d = style.depthPx;
  if (d === 0) return '0 8px 24px rgba(0,0,0,0.15)';
  return [
    `${d}px ${d}px 0 ${style.edge}`,
    `${d + 2}px ${d + 2}px ${d}px ${style.shadow}`,
    `0 12px 40px rgba(0,0,0,0.25)`,
  ].join(', ');
}
