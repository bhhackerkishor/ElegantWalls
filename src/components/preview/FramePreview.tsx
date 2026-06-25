'use client';

import { memo, useMemo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { ProductCategory } from '@/types';
import { resolveFrameStyle, hasFrame, getFrameDepthShadow } from '@/lib/preview/frame-styles';
import {
  parseSizeDimensions,
  getDisplayScale,
  getAspectRatio,
  getPreviewWidth,
} from '@/lib/preview/size-utils';
import { FrameTextureOverlay } from './FrameTextureOverlay';
import { cn } from '@/lib/utils';

export interface FramePreviewProps {
  imageUrl: string;
  size: string;
  frame: string;
  orientation: string;
  category: ProductCategory;
  isLoading?: boolean;
  className?: string;
}

function FramePreview({
  imageUrl,
  size,
  frame,
  orientation,
  category,
  isLoading = false,
  className,
}: FramePreviewProps) {
  const dims = useMemo(() => parseSizeDimensions(size, orientation), [size, orientation]);
  const scale = useMemo(() => getDisplayScale(dims), [dims]);
  const previewWidth = getPreviewWidth(scale);
  const frameStyle = resolveFrameStyle(frame);
  const showFrame = hasFrame(frame) && category !== 'sticker';
  const isCanvas = category === 'canvas';
  const isSticker = category === 'sticker';
  const borderPct = showFrame ? frameStyle.borderRatio * 100 : 0;

  const containerVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
  };

  return (
    <div
      className={cn(
        'relative flex items-center justify-center w-full min-h-[320px] md:min-h-[420px] rounded-lg bg-background-secondary overflow-hidden',
        className
      )}
    >
      {/* Ambient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-b from-background-secondary via-background to-background-secondary" />

      <motion.div
        className="relative z-10 flex items-center justify-center"
        variants={containerVariants}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          key={`${size}-${orientation}-${frame}`}
          initial={{ width: previewWidth * 0.85, opacity: 0.7 }}
          animate={{ width: previewWidth, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 180, damping: 22 }}
          style={{ aspectRatio: getAspectRatio(dims), maxWidth: '92%' }}
          className="relative"
        >
          {isSticker ? (
            <StickerDecal imageUrl={imageUrl} isLoading={isLoading} scale={scale} />
          ) : isCanvas ? (
            <CanvasWrapPreview imageUrl={imageUrl} isLoading={isLoading} />
          ) : showFrame ? (
            <FramedArtwork
              imageUrl={imageUrl}
              frameStyle={frameStyle}
              borderPct={borderPct}
              isLoading={isLoading}
            />
          ) : (
            <FlatPosterPreview imageUrl={imageUrl} isLoading={isLoading} />
          )}
        </motion.div>
      </motion.div>

      {/* Size label */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-glass-bg backdrop-blur-sm border border-glass-border text-xs text-foreground-secondary">
        {dims.label} · {orientation}
      </div>
    </div>
  );
}

interface FramedArtworkProps {
  imageUrl: string;
  frameStyle: ReturnType<typeof resolveFrameStyle>;
  borderPct: number;
  isLoading: boolean;
}

function FramedArtwork({ imageUrl, frameStyle, borderPct, isLoading }: FramedArtworkProps) {
  const shadow = getFrameDepthShadow(frameStyle);

  return (
    <div
      className="relative w-full h-full"
      style={{ filter: `drop-shadow(0 0 0 transparent)` }}
    >
      {/* Outer frame with depth */}
      <div
        className="relative w-full h-full rounded-sm overflow-visible"
        style={{
          padding: `${borderPct}%`,
          background: frameStyle.face,
          boxShadow: shadow,
        }}
      >
        <FrameTextureOverlay style={frameStyle} />

        {/* Inner bevel highlight */}
        <div
          className="absolute inset-0 pointer-events-none rounded-sm"
          style={{
            boxShadow: `inset 0 0 0 1px ${frameStyle.highlight}, inset 2px 2px 4px rgba(255,255,255,0.15)`,
          }}
        />

        {/* Mat / inner lip */}
        <div
          className="relative w-full h-full bg-[#FAFAF8] overflow-hidden"
          style={{
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.12)',
            padding: '2%',
          }}
        >
          {/* Artwork */}
          <div className="relative w-full h-full overflow-hidden bg-neutral-100">
            {isLoading ? (
              <div className="absolute inset-0 animate-pulse bg-background-secondary" />
            ) : (
              <Image
                src={imageUrl}
                alt="Artwork preview"
                fill
                className="object-cover"
                sizes="(max-width:768px) 90vw, 420px"
                priority
              />
            )}
            {/* Glass reflection */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.05) 100%)',
              }}
            />
          </div>
        </div>

        {/* Side depth edges (CSS 3D illusion) */}
        <div
          className="absolute top-0 right-0 h-full pointer-events-none"
          style={{
            width: `${frameStyle.depthPx}px`,
            background: `linear-gradient(to right, ${frameStyle.edge}, transparent)`,
            transform: `translateX(100%) skewY(-45deg)`,
            transformOrigin: 'top left',
            opacity: 0.7,
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-full pointer-events-none"
          style={{
            height: `${frameStyle.depthPx}px`,
            background: `linear-gradient(to bottom, ${frameStyle.edge}, transparent)`,
            transform: `translateY(100%) skewX(-45deg)`,
            transformOrigin: 'top left',
            opacity: 0.7,
          }}
        />
      </div>
    </div>
  );
}

function FlatPosterPreview({ imageUrl, isLoading }: { imageUrl: string; isLoading: boolean }) {
  return (
    <div
      className="relative w-full h-full overflow-hidden rounded-sm"
      style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.1)' }}
    >
      {isLoading ? (
        <div className="absolute inset-0 animate-pulse bg-background-secondary" />
      ) : (
        <Image src={imageUrl} alt="Poster preview" fill className="object-cover" sizes="420px" priority />
      )}
    </div>
  );
}

function CanvasWrapPreview({
  imageUrl,
  isLoading,
}: {
  imageUrl: string;
  isLoading: boolean;
}) {
  const depth = 16;
  return (
    <div
      className="relative w-full h-full"
      style={{
        boxShadow: `${depth}px ${depth}px 0 #3D2614, 0 16px 40px rgba(0,0,0,0.3)`,
      }}
    >
      {/* Canvas wrap edges */}
      <div className="absolute -top-[3%] -left-[3%] -right-[3%] -bottom-[3%] bg-[#2A1810] rounded-sm" />
      <div className="relative w-full h-full overflow-hidden rounded-sm border-2 border-[#4A3020]">
        {isLoading ? (
          <div className="absolute inset-0 animate-pulse bg-background-secondary" />
        ) : (
          <Image src={imageUrl} alt="Canvas preview" fill className="object-cover" sizes="420px" priority />
        )}
        {/* Gallery wrap edge illusion */}
        <div className="absolute inset-0 pointer-events-none border-[6px] border-[#3D2614]/40" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%)`,
          }}
        />
      </div>
    </div>
  );
}

function StickerDecal({
  imageUrl,
  isLoading,
  scale,
}: {
  imageUrl: string;
  isLoading: boolean;
  scale: number;
}) {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Subtle wall */}
      <div
        className="absolute inset-0 rounded-lg"
        style={{
          background: 'linear-gradient(180deg, #F5F0EB 0%, #EDE8E2 100%)',
        }}
      />
      <motion.div
        className="relative z-10 w-[85%] h-[85%]"
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          filter: `drop-shadow(0 ${4 * scale}px ${12 * scale}px rgba(0,0,0,0.12))`,
        }}
      >
        {isLoading ? (
          <div className="w-full h-full animate-pulse bg-background-secondary rounded" />
        ) : (
          <Image
            src={imageUrl}
            alt="Sticker preview"
            fill
            className="object-contain"
            sizes="380px"
            priority
          />
        )}
      </motion.div>
    </div>
  );
}

export default memo(FramePreview);
