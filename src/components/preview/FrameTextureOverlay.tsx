'use client';

import { memo } from 'react';
import type { FrameStyleConfig } from '@/types/preview';

interface FrameTextureOverlayProps {
  style: FrameStyleConfig;
}

function FrameTextureOverlay({ style }: FrameTextureOverlayProps) {
  if (style.texture === 'wood-light') {
    return (
      <div
        className="absolute inset-0 pointer-events-none opacity-50 mix-blend-overlay"
        style={{
          backgroundImage: `
            repeating-linear-gradient(90deg, transparent, transparent 18px, rgba(0,0,0,0.04) 18px, rgba(0,0,0,0.04) 19px),
            repeating-linear-gradient(0deg, transparent, transparent 6px, rgba(255,255,255,0.06) 6px, rgba(255,255,255,0.06) 7px),
            linear-gradient(180deg, rgba(255,240,210,0.15) 0%, transparent 50%)
          `,
        }}
      />
    );
  }

  if (style.texture === 'wood-dark' || style.texture === 'gold-wood') {
    return (
      <div
        className="absolute inset-0 pointer-events-none opacity-45 mix-blend-overlay"
        style={{
          backgroundImage: `
            repeating-linear-gradient(88deg, transparent, transparent 22px, rgba(0,0,0,0.08) 22px, rgba(0,0,0,0.08) 23px),
            repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(255,255,255,0.04) 8px, rgba(255,255,255,0.04) 9px)
          `,
        }}
      />
    );
  }

  if (style.texture === 'matte-black') {
    return (
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: '128px 128px',
        }}
      />
    );
  }

  if (style.texture === 'smooth-white') {
    return (
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 40%, rgba(255,255,255,0.1) 100%)',
        }}
      />
    );
  }

  return null;
}

export { FrameTextureOverlay };
export default memo(FrameTextureOverlay);
