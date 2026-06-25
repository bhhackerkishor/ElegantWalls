'use client';

import { motion, useMotionValue, useAnimationFrame } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

const VIDEOS = [
  '/videos/1.mp4', '/videos/2.mp4', '/videos/3.mp4',
  '/videos/1.mp4', '/videos/2.mp4', '/videos/3.mp4',
  '/videos/1.mp4', '/videos/2.mp4', '/videos/3.mp4',
  '/videos/1.mp4', '/videos/2.mp4', '/videos/3.mp4',
];

export default function Hero() {
  const progress = useMotionValue(0);
  const [dragging, setDragging] = useState(false);

  const dragStart = useRef(0);
  const progressStart = useRef(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const speed = 0.000032; // Slower & smoother auto speed

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
    <div className="min-h-screen bg-white flex flex-col items-center pt-16 relative overflow-hidden">
      <div className="text-center z-20 mb-16 px-6 max-w-4xl">
        <h1 className="text-6xl md:text-7xl font-serif tracking-tight mb-6 text-gray-900">
          Customer Reviews
        </h1>
        <h3 className="text-2xl md:text-3xl text-gray-600">
          Patch plants makes it easy for you to find a plant that fits
          
        </h3>
      </div>

      <div className="relative w-screen max-w-[1550px] mx-auto">
        <div
          className="relative h-[560px] w-full overflow-hidden"
          style={{ 
            perspective: '2800px', 
            perspectiveOrigin: '50% 48%' 
          }}
          onPointerDown={(e) => {
            setDragging(true);
            dragStart.current = e.clientX;
            progressStart.current = progress.get();
          }}
          onPointerMove={(e) => {
            if (!dragging) return;
            const delta = (e.clientX - dragStart.current) / 195; // Smoother drag
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

      <p className="text-center text-sm text-gray-500 mt-8">
        Drag to explore • Center video comes forward
      </p>
    </div>
  );
}

function CarouselCard({ index, total, progress, videoSrc, videoRefs }: any) {
  const [style, setStyle] = useState({
    x: 0,
    y: 0,
    scale: 1,
    rotateY: 0,
    opacity: 1,
    zIndex: 10,
  });

  useEffect(() => {
    const update = (value: number) => {
      let offset = index - value;
      while (offset > total / 2) offset -= total;
      while (offset < -total / 2) offset += total;

      const abs = Math.abs(offset);

      const translateX = offset * 195;
      const translateY = Math.pow(abs, 1.35) * 9;
      const rotateY = offset * -7;

      let scale = Math.max(0.72, 1 - abs * 0.135);
      let opacity = abs > 2.6 ? 0.15 : Math.max(0.92, 1 - abs * 0.24);
      let zIndex = Math.round(400 - abs * 35);

      // Center card comes forward (premium depth)
      if (abs < 0.7) {
        scale = 1.12;
        opacity = 1;
        zIndex = 700;
      }

      setStyle({
        x: translateX,
        y: translateY,
        rotateY,
        scale,
        opacity,
        zIndex,
      });
    };

    update(progress.get());
    const unsubscribe = progress.on('change', update);
    return unsubscribe;
  }, [index, total, progress]);

  return (
    <motion.div
      className="absolute left-1/2 top-[48%] w-[210px] h-[360px] rounded-3xl overflow-hidden shadow-2xl border border-gray-100"
      style={{
        zIndex: style.zIndex,
        transformStyle: 'preserve-3d',
        backgroundColor: '#111',
        boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.4)', // Premium shadow
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
        stiffness: 85, 
        damping: 26,
        mass: 0.9
      }}
    >
      <video
       ref={(el) => { videoRefs.current[index] = el; }}
        src={videoSrc}
        muted
        loop
        playsInline
        preload="metadata"
        className="w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

      <div className="absolute bottom-4 left-4 text-white z-10">
        <p className="font-medium text-sm">Live Growth</p>
        <p className="text-xs opacity-75">Watch it thrive</p>
      </div>
    </motion.div>
  );
}