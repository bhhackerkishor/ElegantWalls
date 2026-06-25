'use client';

import { motion, useMotionValue, useAnimationFrame } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

const VIDEOS = [
  '/videos/1.mp4', '/videos/2.mp4', '/videos/3.mp4',
  '/videos/4.mp4', '/videos/7.mp4', '/videos/10.mp4',
  '/videos/5.mp4', '/videos/8.mp4', '/videos/11.mp4',
  '/videos/6.mp4', '/videos/9.mp4', '/videos/1.mp4',
];

export default function ReviewHero() {
  const progress = useMotionValue(0);
  const [dragging, setDragging] = useState(false);

  const dragStart = useRef(0);
  const progressStart = useRef(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const speed = 0.000022; // Deliberate luxury layout speed velocity

  useAnimationFrame((_, delta) => {
    if (dragging) return;
    progress.set(progress.get() + delta * speed);
  });

  useEffect(() => {
    const handlePlayback = (value: number) => {
      videoRefs.current.forEach((video, i) => {
        if (!video) return;
        const total = VIDEOS.length;
        let offset = i - value;
        while (offset > total / 2) offset -= total;
        while (offset < -total / 2) offset += total;

        if (Math.abs(offset) < 0.85) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    };

    handlePlayback(progress.get());
    const unsubscribe = progress.on('change', handlePlayback);
    return unsubscribe;
  }, [progress]);

  return (
    <div className="py-24 sm:py-32 bg-background text-foreground flex flex-col items-center relative overflow-hidden transition-colors duration-500 border-b border-border/10">
      <div className="text-center z-20 mb-20 px-6 max-w-3xl">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-foreground/40 block mb-4">
          Verified Installations
        </span>
        <h2 className="text-4xl sm:text-5xl font-serif font-light tracking-tight text-foreground mb-6">
          Living Verification
        </h2>
        <p className="text-base text-foreground-secondary font-light max-w-lg mx-auto leading-relaxed">
          Dynamic visual case notes shared directly by collectors documenting the layout changes within their interior spaces.
        </p>
      </div>

      {/* Interactive Drag Canvas Box Frame */}
      <div className="relative w-screen max-w-[1550px] mx-auto cursor-grab active:cursor-grabbing">
        <div
          className="relative h-[560px] w-full overflow-hidden select-none"
          style={{ 
            perspective: '3200px', 
            perspectiveOrigin: '50% 45%' 
          }}
          onPointerDown={(e) => {
            setDragging(true);
            dragStart.current = e.clientX;
            progressStart.current = progress.get();
          }}
          onPointerMove={(e) => {
            if (!dragging) return;
            const delta = (e.clientX - dragStart.current) / 240; 
            progress.set(progressStart.current - delta);
          }}
          onPointerUp={() => setDragging(false)}
          onPointerLeave={() => setDragging(false)}
        >
          {VIDEOS.map((videoSrc, index) => (
            <CarouselCard
              key={index}
              index={index}
              total={VIDEOS.length}
              progress={progress}
              videoSrc={videoSrc}
              videoRefs={videoRefs}
            />
          ))}
        </div>
      </div>

      <div className="text-center mt-12 flex items-center gap-3 opacity-30 select-none">
        <span className="h-[1px] w-8 bg-foreground" />
        <p className="text-[10px] tracking-[0.25em] uppercase font-medium">
          Drag horizontally to cycle register
        </p>
        <span className="h-[1px] w-8 bg-foreground" />
      </div>
    </div>
  );
}

function CarouselCard({ index, total, progress, videoSrc, videoRefs }: any) {
  const [style, setStyle] = useState({ x: 0, y: 0, scale: 1, rotateY: 0, opacity: 1, zIndex: 10 });

  useEffect(() => {
    const update = (value: number) => {
      let offset = index - value;
      while (offset > total / 2) offset -= total;
      while (offset < -total / 2) offset += total;

      const abs = Math.abs(offset);
      const translateX = offset * 215;
      const translateY = Math.pow(abs, 1.4) * 11;
      const rotateY = offset * -8;

      let scale = Math.max(0.70, 1 - abs * 0.14);
      let opacity = abs > 2.5 ? 0.0 : Math.max(0.90, 1 - abs * 0.28);
      let zIndex = Math.round(500 - abs * 40);

      if (abs < 0.65) {
        scale = 1.15;
        opacity = 1;
        zIndex = 800;
      }

      setStyle({ x: translateX, y: translateY, rotateY, scale, opacity, zIndex });
    };

    update(progress.get());
    const unsubscribe = progress.on('change', update);
    return unsubscribe;
  }, [index, total, progress]);

  return (
    <motion.div
      className="absolute left-1/2 top-[46%] w-[218px] h-[370px] rounded-[28px] overflow-hidden border border-border/10 shadow-[0_30px_70px_rgba(0,0,0,0.15)] dark:shadow-[0_40px_90px_rgba(0,0,0,0.5)] bg-neutral-950"
      style={{
        zIndex: style.zIndex,
        transformStyle: 'preserve-3d',
      }}
      animate={{
        x: `calc(-50% + ${style.x}px)`,
        y: `calc(-50% + ${style.y}px)`,
        rotateY: style.rotateY,
        scale: style.scale,
        opacity: style.opacity,
      }}
      transition={{ 
        type: 'spring', 
        stiffness: 75, 
        damping: 24,
        mass: 0.95
      }}
    >
      <video
        ref={(el) => { videoRefs.current[index] = el; }}
        src={videoSrc}
        muted
        loop
        playsInline
        preload="metadata"
        className="w-full h-full object-cover grayscale-[30%] contrast-[1.05]"
      />

      {/* Multi-tier overlay protecting text contrast cleanly */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

      <div className="absolute bottom-6 left-6 right-6 text-white z-10 pointer-events-none">
        <span className="block text-[9px] tracking-widest text-accent font-bold uppercase mb-1">
          Registry Archive
        </span>
        <p className="font-serif font-light text-sm tracking-tight text-stone-100 leading-tight">
          Bespoke Installation Verification
        </p>
      </div>
    </motion.div>
  );
}