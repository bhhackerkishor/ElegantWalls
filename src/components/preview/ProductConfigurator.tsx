'use client';

import { memo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { Product } from '@/types';
import type { PreviewTab, RoomEnvironment } from '@/types/preview';
import type { ProductConfiguration } from '@/hooks/useProductConfiguration';
import FramePreview from './FramePreview';
import RoomMockupPreview from './RoomMockupPreview';
import LazyThreeDFramePreview from './LazyThreeDFramePreview';
import { cn } from '@/lib/utils';

export interface ProductConfiguratorProps {
  product: Product;
  config: Pick<
    ProductConfiguration,
    | 'artworkUrl'
    | 'selectedSize'
    | 'selectedFrame'
    | 'selectedOrientation'
    | 'uploading'
  >;
}

const TABS: { id: PreviewTab; label: string }[] = [
  { id: 'frame', label: 'Frame View' },
  { id: 'wall', label: 'Wall Preview' },
  { id: '3d', label: '3D View' },
];

function ProductConfigurator({ product, config }: ProductConfiguratorProps) {
  const [activeTab, setActiveTab] = useState<PreviewTab>('frame');
  const [roomEnv, setRoomEnv] = useState<RoomEnvironment>('living-room');
  const [hasOpened3d, setHasOpened3d] = useState(false);

  const handleTabChange = useCallback((tab: PreviewTab) => {
    setActiveTab(tab);
    if (tab === '3d') setHasOpened3d(true);
  }, []);

  const previewProps = {
    imageUrl: config.artworkUrl,
    size: config.selectedSize,
    frame: config.selectedFrame,
    orientation: config.selectedOrientation,
    category: product.category,
    isLoading: config.uploading,
  };

  return (
    <div className="space-y-3">
      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-lg bg-background-secondary border border-border">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabChange(tab.id)}
            className={cn(
              'relative flex-1 px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors cursor-pointer',
              activeTab === tab.id ? 'text-accent' : 'text-foreground-secondary hover:text-foreground'
            )}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="preview-tab-indicator"
                className="absolute inset-0 bg-accent-light border border-accent/20 rounded-md"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Preview panels */}
      <div className="relative">
        {activeTab === 'frame' && (
          <motion.div
            key="frame"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
          >
            <FramePreview {...previewProps} />
          </motion.div>
        )}

        {activeTab === 'wall' && (
          <motion.div
            key="wall"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className="rounded-lg bg-background-secondary p-3"
          >
            <RoomMockupPreview
              {...previewProps}
              environment={roomEnv}
              onEnvironmentChange={setRoomEnv}
            />
          </motion.div>
        )}

        {activeTab === '3d' && hasOpened3d && (
          <motion.div
            key="3d"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
          >
            <LazyThreeDFramePreview {...previewProps} />
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default memo(ProductConfigurator);
