'use client';

import dynamic from 'next/dynamic';
import type { ComponentProps } from 'react';

const ThreeDFramePreview = dynamic(() => import('./ThreeDFramePreview'), {
  ssr: false,
  loading: () => (
    <div className="w-full min-h-[320px] md:min-h-[400px] rounded-lg bg-neutral-900 animate-pulse flex items-center justify-center">
      <span className="text-sm text-white/40">Loading 3D preview…</span>
    </div>
  ),
});

export type LazyThreeDFramePreviewProps = ComponentProps<typeof ThreeDFramePreview>;

export default function LazyThreeDFramePreview(props: LazyThreeDFramePreviewProps) {
  return <ThreeDFramePreview {...props} />;
}
