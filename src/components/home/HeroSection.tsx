'use client';

import { motion, useMotionValue, useTransform, useAnimationFrame } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';

const VIDEOS = [
  '/videos/1.mp4', '/videos/2.mp4', '/videos/3.mp4',
  '/videos/4.mp4', '/videos/5.mp4', '/videos/6.mp4',
  '/videos/7.mp4', '/videos/8.mp4', '/videos/9.mp4',
];

const INITIAL_ARTWORKS = [
  {
    id: 'anime-premium-black',
    src: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600',
    alt: 'Anime Illustration Portrait',
    className: 'border-[8px] border-zinc-950 dark:border-zinc-900 bg-black shadow-[6px_10px_20px_rgba(0,0,0,0.55),_inset_0_2px_4px_rgba(0,0,0,0.8)] rounded-xs',
    width: 140,  
    height: 230, 
    left: '8%',
    top: '12%',
  },
  {
    id: 'one-piece-main',
    src: 'https://wallpapers.com/images/high/one-piece-pictures-bjm9tdff9yzguoup.jpg',
    alt: 'One Piece Anime Landscape',
    className: 'border-[10px] border-amber-950 dark:border-amber-900/80 bg-neutral-900 shadow-[8px_12px_24px_rgba(0,0,0,0.6),_inset_0_2px_4px_rgba(0,0,0,0.5)] rounded-sm',
    width: 240,  
    height: 135, 
    left: '74%',
    top: '48%',
  },
  {
    id: 'bmw-m3-gtr',
    src: 'https://cdn.motor1.com/images/mgl/eoKjQP/s3/bmw-m3-gtr-from-2005-s-need-for-speed-most-wanted.webp',
    alt: 'bmw-m3-gtrLandscape',
    className: 'border-[10px] border-amber-950 dark:border-amber-900/80 bg-neutral-900 shadow-[8px_12px_24px_rgba(0,0,0,0.6),_inset_0_2px_4px_rgba(0,0,0,0.5)] rounded-sm',
    width: 240,  
    height: 135, 
    left: '68%', 
    top: '70%',  
  },
  {
    id: 'couple-mat-frame',
    src: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=800',
    alt: 'Couples Cinematic Landscape',
    className: 'border-[12px] border-stone-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-[10px_14px_28px_rgba(0,0,0,0.45)] rounded-xs',
    width: 220,  
    height: 125, 
    left: '70%',
    top: '16%',
  },
  {
    id: 'sticker-motivation',
    src: 'https://i.pinimg.com/736x/70/8f/58/708f585372a5d771f90b4355f8991d78.jpg',
    alt: 'Motivation Round Wall Sticker',
    className: 'border-[6px] border-neutral-900 dark:border-neutral-800 bg-stone-300 dark:bg-neutral-700 shadow-[8px_12px_22px_rgba(0,0,0,0.5)] rounded-xs',
    width: 120,  
    height: 170, 
    left: '38%',
    top: '14%',
  },
  {
    id: 'sticker-chibi',
    src: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800',
    alt: 'Anime Sticker',
    className: 'rounded-xl border-4 border-white dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-[2px_4px_8px_rgba(0,0,0,0.35)]',
    width: 110,  
    height: 75, 
    left: '14%',
    top: '68%',
  },
  {
    id: 'couple-portrait-charcoal',
    src: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=600',
    alt: 'Couple Portrait',
    className: 'border-[6px] border-neutral-900 dark:border-neutral-800 bg-stone-300 dark:bg-neutral-700 shadow-[8px_12px_22px_rgba(0,0,0,0.5)] rounded-xs',
    width: 120,  
    height: 190, 
    left: '48%',
    top: '60%',
  },
  {
    id: 'extra-minimal-frame',
    src: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=600',
    alt: 'Abstract Art Piece',
    className: 'border-[8px] border-amber-100 dark:border-amber-950/40 bg-stone-200 dark:bg-neutral-800 shadow-[7px_11px_22px_rgba(0,0,0,0.48)] rounded-xs',
    width: 130,
    height: 130,
    left: '26%',
    top: '42%',
  }
];

export default function HeroSection() {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const progress = useMotionValue(0);
  const [dragging, setDragging] = useState(false);

  const dragStart = useRef(0);
  const progressStart = useRef(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const speed = 0.000028;

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

        if (Math.abs(offset) < 0.8) {
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
    <section className="relative mt-10 min-h-screen bg-background text-foreground flex flex-col items-center justify-center overflow-hidden pt-20 transition-colors duration-300">
      <div className="text-center z-20 max-w-5xl px-6 mb-20">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="uppercase tracking-[4px] text-sm font-medium text-foreground-secondary mb-3"
        >
          ELEGANT WALLS
        </motion.p>

        <h1 className="text-6xl md:text-7xl lg:text-[5.5rem] font-serif tracking-tighter leading-none text-foreground mb-6">
          Art that tells<br />your story.
        </h1>

        <p className="text-2xl text-foreground-secondary max-w-2xl mx-auto font-light">
          Premium wall art, frames & canvas prints crafted for those who value beauty and memory.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/collections"
            className="bg-accent text-white dark:text-background px-10 py-4 rounded-full text-lg font-medium hover:opacity-90 transition-all"
          >
            Shop Collection
          </Link>
          <Link
            href="/product/upload-your-photo-frame"
            className="border-2 border-foreground px-10 py-4 rounded-full text-lg font-medium hover:bg-background-secondary transition-all"
          >
            Create Your Own
          </Link>
        </div>
      </div>

      <section 
        ref={constraintsRef} 
        className="relative w-full h-screen min-h-[750px] overflow-hidden select-none bg-background flex flex-col justify-between py-12 px-6"
      >
        {/* Background Image: Concrete Museum Wall */}
        <Image
          src="https://images.unsplash.com/photo-1521193089946-7aa29d1fe776?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0"
          alt="Concrete museum wall layout"
          fill
          priority
          className="object-cover pointer-events-none opacity-90 dark:opacity-40 transition-opacity duration-300"
        />
  
        {/* Vignette & Ambient Light Overlays adjusted contextually for Dark Mode compatibility */}
        <div className="absolute inset-0 bg-black/25 dark:bg-black/60 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80 dark:to-black/95 pointer-events-none" />
  
        {/* --- INTERACTIVE DRAGGABLE CANVAS LAYER --- */}
        <div className="absolute inset-0 z-10 overflow-hidden w-full h-full">
          {INITIAL_ARTWORKS.map((art) => (
            <DraggableArt key={art.id} art={art} constraintsRef={constraintsRef} />
          ))}
        </div>

        <FloatingStat value="10K+" title="Happy Customers" className="top-[18%] left-[5%]" />
        <FloatingStat value="50K+" title="Artworks Delivered" className="top-[30%] right-[8%]" />
        <FloatingStat value="4.9★" title="Average Rating" className="bottom-[18%] right-[12%]" />
  
        {/* TOP LAYER */}
        <div className="relative z-20 w-full text-center pointer-events-none mt-4">
          <motion.h2 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-xs md:text-sm font-black tracking-[0.7em] bg-gradient-to-r from-stone-400 via-stone-200 to-stone-400 dark:from-stone-500 dark:via-stone-300 dark:to-stone-500 bg-clip-text uppercase drop-shadow-md text-transparent"
          >
            ELEGANT WALLS
          </motion.h2>
        </div>
        
        {/* CENTER LAYER */}
        <div className="relative z-0 w-full text-center pointer-events-none my-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="bg-gradient-to-r from-foreground via-accent to-foreground bg-clip-text text-transparent mix-blend-difference filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)]"
            style={{ WebkitTextStroke: "0.25px rgba(255,255,255,0.1)" }}
          >
            <h1 className="text-display text-[clamp(3rem,8vw,6rem)] leading-none">
              Art that tells<br />your story.
            </h1>
          </motion.div>
        </div>
  
        {/* BOTTOM LAYER */}
        <div className="relative z-20 w-full text-center max-w-3xl mx-auto mb-4">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-stone-300/90 dark:text-stone-400 font-medium text-sm md:text-base max-w-xl mx-auto leading-relaxed drop-shadow-md pointer-events-none"
          >
            Transform empty spaces into meaningful stories. Click and drag the frames around 
            to start curating your dream exhibition wall layout right here.
          </motion.p>
  
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-8 flex flex-col sm:flex-row justify-center gap-4 pointer-events-auto"
          >
            <Link href="/posters">
              <Button className="px-8 py-3.5 text-sm font-semibold rounded-full shadow-lg bg-accent text-white dark:text-background hover:shadow-xl transition-all">
                Explore Collection
              </Button>
            </Link>
  
            <Link href="/custom">
              <Button
                variant="secondary"
                className="px-8 py-3.5 text-sm font-semibold rounded-full bg-white/5 border-white/10 text-stone-200 hover:bg-white/10 backdrop-blur-md transition-all"
              >
                Create Custom Artwork
              </Button>
            </Link>
          </motion.div>
        </div>
  
        {/* Subtle Scroll Hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none opacity-40">
          <div className="h-8 w-5 rounded-full border border-stone-500/60 dark:border-stone-400/40 flex justify-center">
            <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-stone-400 dark:bg-stone-300 animate-bounce" />
          </div>
        </div>
      </section>

      {/* Curved Carousel */}
      <div className="relative w-full max-w-[1620px] mx-auto px-4 mt-12 mb-20">
        <div
          className="relative h-[620px] w-full overflow-hidden"
          style={{ perspective: '3200px', perspectiveOrigin: '50% 45%' }}
          onPointerDown={(e) => {
            setDragging(true);
            dragStart.current = e.clientX;
            progressStart.current = progress.get();
          }}
          onPointerMove={(e) => {
            if (!dragging) return;
            const delta = (e.clientX - dragStart.current) / 185;
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
    </section>
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
      const translateX = offset * 198;
      const translateY = Math.pow(abs, 1.35) * 9;
      const rotateY = offset * -7;

      let scale = Math.max(0.74, 1 - abs * 0.13);
      let opacity = abs > 2.7 ? 0.12 : Math.max(0.9, 1 - abs * 0.23);
      let zIndex = Math.round(400 - abs * 38);

      if (abs < 0.65) {
        scale = 1.16;
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
      className="absolute left-1/2 top-[48%] w-[218px] h-[375px] rounded-3xl overflow-hidden shadow-2xl border border-border/10"
      style={{
        zIndex: style.zIndex,
        transformStyle: 'preserve-3d',
        boxShadow: '0 30px 70px -15px rgba(0,0,0,0.45)',
      }}
      animate={{
        x: `calc(-50% + ${style.x}px)`,
        y: `calc(-50% + ${style.y}px)`,
        rotateY: style.rotateY,
        scale: style.scale,
        opacity: style.opacity,
      }}
      transition={{ type: 'spring', stiffness: 80, damping: 26 }}
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
    </motion.div>
  );
}

function DraggableArt({ art, constraintsRef }: { art: typeof INITIAL_ARTWORKS[0]; constraintsRef: React.RefObject<HTMLDivElement | null> }) {
  const dragXDelta = useMotionValue(0);
  const dynamicRotation = useTransform(dragXDelta, [-40, 40], [-10, 10]);

  return (
    <motion.div
      drag
      dragConstraints={constraintsRef}
      dragElastic={0.02}
      dragMomentum={false}
      onDrag={(event, info) => {
        dragXDelta.set(info.delta.x);
      }}
      onDragEnd={() => {
        dragXDelta.set(0);
      }}
      style={{ 
        left: art.left, 
        top: art.top, 
        rotate: dynamicRotation,
        width: art.width,
        height: art.height
      }}
      whileDrag={{ 
        scale: 1.03,
        zIndex: 50,
        cursor: 'grabbing',
        boxShadow: "20px 35px 50px -5px rgba(0, 0, 0, 0.75)"
      }}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 85, damping: 20 }}
      className={`absolute cursor-grab active:cursor-grabbing transition-shadow duration-200 ${art.className}`}
    >
      <div className="relative w-full h-full block overflow-hidden rounded-[inherit]">
        <div className="absolute inset-0 shadow-[inset_0_2px_6px_rgba(0,0,0,0.4)] dark:shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] z-10 pointer-events-none" />
        <Image
          src={art.src}
          alt={art.alt}
          width={art.width}
          height={art.height}
          className="object-cover w-full h-full pointer-events-none"
        />
      </div>
    </motion.div>
  );
}

function FloatingStat({ title, value, className }: { title: string; value: string; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: [0, -8, 0] }}
      className={`absolute z-30 rounded-2xl px-5 py-4 backdrop-blur-xl border shadow-xl ${className}`}
      style={{
        background: "var(--glass-bg)",
        borderColor: "var(--glass-border)",
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <p className="text-2xl font-semibold text-foreground">
        {value}
      </p>
      <p className="text-sm text-foreground-secondary">
        {title}
      </p>
    </motion.div>
  );
}