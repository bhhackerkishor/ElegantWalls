'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import Button from '@/components/ui/Button';

const INITIAL_ARTWORKS = [
  {
    id: 'anime-premium-black',
    src: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600',
    alt: 'Anime Illustration Portrait',
    // Realistic Deep Gallery Frame: Sharp dark border + drop shadow + inner bezel simulation
    className: 'border-[8px] border-zinc-950 bg-black shadow-[6px_10px_20px_rgba(0,0,0,0.55),_inset_0_2px_4px_rgba(0,0,0,0.8)] rounded-xs',
    width: 140,  
    height: 230, 
    left: '8%',
    top: '12%',
  },
  {
    id: 'one-piece-main',
    src: 'https://wallpapers.com/images/high/one-piece-pictures-bjm9tdff9yzguoup.jpg',
    alt: 'One Piece Anime Landscape',
    // Rich Walnut Wood Frame with inner shadow
    className: 'border-[10px] border-amber-950 bg-neutral-900 shadow-[8px_12px_24px_rgba(0,0,0,0.6),_inset_0_2px_4px_rgba(0,0,0,0.5)] rounded-sm',
    width: 240,  
    height: 135, 
    left: '74%',
    top: '48%',
  },
  {
    id: 'bmw-m3-gtr',
    src: 'https://cdn.motor1.com/images/mgl/eoKjQP/s3/bmw-m3-gtr-from-2005-s-need-for-speed-most-wanted.webp',
    alt: 'bmw-m3-gtrLandscape',
    // Rich Walnut Wood Frame with inner shadow
    className: 'border-[10px] border-amber-950 bg-neutral-900 shadow-[8px_12px_24px_rgba(0,0,0,0.6),_inset_0_2px_4px_rgba(0,0,0,0.5)] rounded-sm',
    width: 240,  
    height: 135, 
    left: '74%',
    top: '48%',
  },
  {
    id: 'couple-mat-frame',
    src: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=800',
    alt: 'Couples Cinematic Landscape',
    // Gallery White Passpartout Frame: Thick white mat border + thin outer shadow
    className: 'border-[12px] border-stone-100 bg-white shadow-[10px_14px_28px_rgba(0,0,0,0.45)] rounded-xs',
    width: 220,  
    height: 125, 
    left: '70%',
    top: '16%',
  },
  {
    id: 'sticker-motivation',
    src: 'https://i.pinimg.com/736x/70/8f/58/708f585372a5d771f90b4355f8991d78.jpg',
    alt: 'Motivation Round Wall Sticker',
    // Matte Die-Cut Sticker: Shaved down closer to the wall with zero frame thickness
    className: 'border-[6px] border-neutral-900 bg-stone-300 shadow-[8px_12px_22px_rgba(0,0,0,0.5)] rounded-xs',
    width: 120,  
    height: 170, 
    left: '38%',
    top: '14%',
  },
  {
    id: 'sticker-chibi',
    src: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800',
    alt: 'Anime Sticker',
    className: 'rounded-xl border-4 border-white bg-white shadow-[2px_4px_8px_rgba(0,0,0,0.35)]',
    width: 110,  
    height: 75, 
    left: '14%',
    top: '68%',
  },
  {
    id: 'couple-portrait-charcoal',
    src: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=600',
    alt: 'Couple Portrait',
    // Contemporary Thin Charcoal Shadowbox
    className: 'border-[6px] border-neutral-900 bg-stone-300 shadow-[8px_12px_22px_rgba(0,0,0,0.5)] rounded-xs',
    width: 120,  
    height: 190, 
    left: '48%',
    top: '60%',
  },
  {
    id: 'extra-minimal-frame',
    src: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=600',
    alt: 'Abstract Art Piece',
    // Modern Light Oak Frame
    className: 'border-[8px] border-amber-100 bg-stone-200 shadow-[7px_11px_22px_rgba(0,0,0,0.48)] rounded-xs',
    width: 130,
    height: 130,
    left: '26%',
    top: '42%',
  }
];

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
        // Lifted off wall: drops shadow further away and blurs it out smoothly
        boxShadow: "20px 35px 50px -5px rgba(0, 0, 0, 0.65)"
      }}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 85, damping: 20 }}
      className={`absolute cursor-grab active:cursor-grabbing transition-shadow duration-200 ${art.className}`}
    >
      {/* Dynamic Inner Mat Shadow Layer for realistic frame depth */}
      <div className="relative w-full h-full block overflow-hidden rounded-[inherit]">
        <div className="absolute inset-0 shadow-[inset_0_2px_6px_rgba(0,0,0,0.4)] z-10 pointer-events-none" />
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

export default function HeroSection() {
  const constraintsRef = useRef<HTMLDivElement>(null);

  return (
    <section 
      ref={constraintsRef} 
      className="relative h-screen min-h-[750px] overflow-hidden select-none bg-stone-950 flex flex-col justify-between py-12 px-6"
    >
      {/* Background Image (Concrete Wall Asset) */}
      <Image
        src="https://images.unsplash.com/photo-1521193089946-7aa29d1fe776?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        alt="Concrete museum wall layout"
        fill
        priority
        className="object-cover pointer-events-none"
      />

      {/* Vignette & Ambient Light Overlays */}
      <div className="absolute inset-0 bg-black/30 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/85 pointer-events-none" />

      {/* --- INTERACTIVE DRAGGABLE CANVAS LAYER --- */}
      <div className="absolute inset-0 z-10 overflow-hidden w-full h-full">
        {INITIAL_ARTWORKS.map((art) => (
          <DraggableArt key={art.id} art={art} constraintsRef={constraintsRef} />
        ))}
      </div>

      {/* 1. TOP LAYER: Brand Heading */}
      <div className="relative z-20 w-full text-center pointer-events-none mt-4">
        <motion.h2 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-xs md:text-sm font-black tracking-[0.7em] bg-gradient-to-r from-stone-400 via-stone-200 to-stone-400 bg-clip-text  uppercase drop-shadow-md"
        >
          ELEGANT WALLS
        </motion.h2>
      </div>
      

      {/* 2. CENTER LAYER: Core Slogan (Stenciled effect directly inside the concrete depth) */}
      <div className="relative z-0 w-full text-center pointer-events-none my-auto">
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="
            text-5xl md:text-8xl xl:text-9xl 
            font-black 
            text-transparent/20
            leading-[0.85] 
            tracking-tighter 
            bg-gradient-to-b from-white/90 via-stone-300/80 to-stone-600/50
            bg-clip-text 
            
            mix-blend-difference
            filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)]
          "
          style={{ WebkitTextStroke: "0.25px rgba(255,255,255,0.1)" }}
        >
          YOUR WALL
          <br />
          IS A
          <br />
          CANVAS.
        </motion.h1>
      </div>

      {/* 3. BOTTOM LAYER: Remaining Details, Description, and CTA Buttons */}
      <div className="relative z-20 w-full text-center max-w-3xl mx-auto mb-4">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-stone-300/80 font-medium text-sm md:text-base max-w-xl mx-auto leading-relaxed drop-shadow-md pointer-events-none"
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
            <Button className="px-8 py-3.5 text-sm font-semibold rounded-full shadow-lg hover:shadow-xl transition-all">
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
        <div className="h-8 w-5 rounded-full border border-stone-500/60 flex justify-center">
          <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-stone-400 animate-bounce" />
        </div>
      </div>
    </section>
  );
}