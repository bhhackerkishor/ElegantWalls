'use client';

import { memo, useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import type { ProductCategory } from '@/types';
import type { RoomEnvironment } from '@/types/preview';
import { ROOM_ENVIRONMENTS, getRoomEnvironment } from '@/lib/preview/room-environments';
import { resolveFrameStyle, hasFrame, getFrameDepthShadow } from '@/lib/preview/frame-styles';
import { parseSizeDimensions, getDisplayScale, getAspectRatio } from '@/lib/preview/size-utils';
import { FrameTextureOverlay } from './FrameTextureOverlay';
import { cn } from '@/lib/utils';

export interface RoomMockupPreviewProps {
  imageUrl: string;
  size: string;
  frame: string;
  orientation: string;
  category: ProductCategory;
  environment?: RoomEnvironment;
  onEnvironmentChange?: (env: RoomEnvironment) => void;
  isLoading?: boolean;
  className?: string;
}

function RoomMockupPreview({
  imageUrl,
  size,
  frame,
  orientation,
  category,
  environment: controlledEnv,
  onEnvironmentChange,
  isLoading = false,
  className,
}: RoomMockupPreviewProps) {
  const [internalEnv, setInternalEnv] = useState<RoomEnvironment>('living-room');
  const environment = controlledEnv ?? internalEnv;
  const room = getRoomEnvironment(environment);
  const dims = useMemo(() => parseSizeDimensions(size, orientation), [size, orientation]);
  const scale = useMemo(() => getDisplayScale(dims), [dims]);
  const frameStyle = resolveFrameStyle(frame);
  const showFrame = hasFrame(frame) && category !== 'sticker';
  const borderPct = showFrame ? frameStyle.borderRatio * 100 : 1.5;

  // Ref anchor used to lock drag boundaries safely inside the canvas wall viewport
  const constraintsRef = useRef<HTMLDivElement>(null);

  const handleEnvChange = (env: RoomEnvironment) => {
    setInternalEnv(env);
    onEnvironmentChange?.(env);
  };

  const placementWidth = parseFloat(room.placement.width) * scale * 1.1;

  return (
    <div className={cn('relative w-full select-none', className)}>
      {/* Environment picker */}
      <div className="flex gap-2 mb-3">
        {ROOM_ENVIRONMENTS.map((env) => (
          <button
            key={env.id}
            type="button"
            onClick={() => handleEnvChange(env.id)}
            className={cn(
              'px-3 py-1.5 text-xs rounded-full border transition-all cursor-pointer',
              environment === env.id
                ? 'border-accent bg-accent-light text-accent font-semibold'
                : 'border-border bg-background hover:border-accent text-foreground-secondary'
            )}
          >
            {env.label}
          </button>
        ))}
      </div>

      {/* Shared bounding container mask */}
      <div 
        ref={constraintsRef}
        className="relative aspect-[4/3] rounded-lg overflow-hidden bg-background-secondary touch-none"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={environment}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 pointer-events-none"
          >
            <Image
              src={room.image}
              alt={`${room.label} mockup`}
              fill
              className="object-cover"
              sizes="(max-width:768px) 100vw, 600px"
              priority
            />
            <div className="absolute inset-0 bg-black/5" />
          </motion.div>
        </AnimatePresence>

        {/* Framed artwork on wall (Draggable Canvas Wrapper) */}
        <motion.div
          drag
          dragMomentum={false}
          dragElastic={0.05}
          dragConstraints={constraintsRef}
          className="absolute z-10 cursor-grab active:cursor-grabbing"
          style={{
            top: room.placement.top,
            left: room.placement.left,
            width: `${placementWidth}%`,
            aspectRatio: getAspectRatio(dims),
            x: "-50%", // Handles clean centering relative to initial positional metrics
            y: "0%"
          }}
          // Re-evaluate positions gracefully when layout environment context shifts
          key={`${environment}-${size}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        >
          {/* Hanging wire */}
          {showFrame && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-px h-3 bg-neutral-500/40 pointer-events-none" />
          )}

          <div
            className="relative w-full h-full group"
            style={{
              boxShadow: showFrame
                ? getFrameDepthShadow(frameStyle)
                : '0 12px 36px rgba(0,0,0,0.2)',
            }}
          >
            {showFrame ? (
              <div
                className="relative w-full h-full rounded-sm overflow-hidden border border-black/5"
                style={{
                  padding: `${borderPct}%`,
                  background: frameStyle.face,
                }}
              >
                <FrameTextureOverlay style={frameStyle} />
                <div className="relative w-full h-full bg-[#FAFAF8] p-[2%] shadow-inner">
                  <div className="relative w-full h-full overflow-hidden">
                    {isLoading ? (
                      <div className="absolute inset-0 animate-pulse bg-neutral-200" />
                    ) : (
                      <Image src={imageUrl} alt="" fill className="object-cover pointer-events-none" sizes="250px" />
                    )}
                  </div>
                </div>
              </div>
            ) : category === 'sticker' ? (
              <div className="relative w-full h-full pointer-events-none">
                {!isLoading && (
                  <Image src={imageUrl} alt="" fill className="object-contain drop-shadow-xl" sizes="250px" />
                )}
              </div>
            ) : (
              <div className="relative w-full h-full overflow-hidden rounded-sm shadow-md pointer-events-none">
                {!isLoading && (
                  <Image src={imageUrl} alt="" fill className="object-cover" sizes="250px" />
                )}
              </div>
            )}
            
            {/* Elegant visual drag affordance ring visible on hover */}
            <div className="absolute inset-0 border border-accent/0 group-hover:border-accent/30 transition-colors rounded-sm pointer-events-none" />
          </div>

          {/* Integrated Ambient Wall Shadow Beneath Frame */}
          <div
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[88%] h-3 rounded-full blur-md opacity-80 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 80%)' }}
          />
        </motion.div>
      </div>
    </div>
  );
}

export default memo(RoomMockupPreview);