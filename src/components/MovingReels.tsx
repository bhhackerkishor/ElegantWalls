'use client';

import Image from 'next/image';
import Container from '@/components/ui/Container';

interface TickerItem {
  url: string;
  width: number;
  caption: string;
}

const IMAGES_POOL: TickerItem[] = [
  { 
    url: 'https://res.cloudinary.com/drmjevfh8/image/upload/v1782378625/41882703286ef67ccfb8a96db5b395dc_uj43h0.jpg', 
    width: 130, 
    caption: 'Private Residence, Mumbai — Edition No. 14' 
  },
  { 
    url: 'https://res.cloudinary.com/drmjevfh8/image/upload/v1782379335/06bf3a428ef9f8733d5493ff98a48334_hx0lck.jpg', 
    width: 120, 
    caption: 'Atelier Interior Study — Custom Run' 
  }
 
  { 
    url: 'https://res.cloudinary.com/drmjevfh8/image/upload/v1782378420/10d8886dd0d15a6189ff91279ea287d5_yhqscw.jpg', 
    width: 410, 
    caption: 'The Monolithic Series — Spatial Anchor' 
  },
  { 
    url: 'https://res.cloudinary.com/drmjevfh8/image/upload/v1782377731/84f9c824f2440c36b79cacdea68855ff_qbpd4l.jpg', 
    width: 150, 
    caption: 'Atelier Interior Study — Custom Run' 
  },
  { 
    url: 'https://res.cloudinary.com/drmjevfh8/image/upload/v1782378348/GAME6_9ed13ec5-38c3-47de-a5e9-0234376f6a06_qnkb3i.jpg', 
    width: 290, 
    caption: 'Graphic Expression Study — Gallery Matte' 
  },
   { 
    url: 'https://res.cloudinary.com/drmjevfh8/image/upload/v1782378907/11250037_liayyg.webp', 
    width: 180, 
    caption: 'Atelier Interior Study — Custom Run' 
  },
  { 
    url: 'https://res.cloudinary.com/drmjevfh8/image/upload/v1782239568/elegant-walls/pynuy9x6lels1dcum2nk.webp', 
    width: 320, 
    caption: 'Residential Framing Archetype' 
  },
  { 
    url: 'https://res.cloudinary.com/drmjevfh8/image/upload/v1782379089/667446c589c2ef1faf988d30bde72231_t6lb1j.jpg', 
    width: 120, 
    caption: 'Atelier Interior Study — Custom Run' 
  },
  
];

export default function MovingReels() {
  const forwardRow = [...IMAGES_POOL];
  const reverseRow = [...IMAGES_POOL].reverse();

  return (
    <section 
      className="py-24 sm:py-32 bg-background overflow-hidden border-b border-border/20"
      aria-labelledby="ticker-heading"
    >
      {/* Editorial Header Section */}
      <Container className="mb-16 sm:mb-20">
        <div className="max-w-2xl mx-auto text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-foreground/40 block mb-4">
            Spatial Transformations
          </span>
          <h2 
            id="ticker-heading"
            className="text-3xl sm:text-4xl font-serif font-light tracking-tight text-foreground leading-tight"
          >
            The Living Gallery
          </h2>
          <p className="text-sm text-foreground-secondary font-light mt-3 max-w-md mx-auto leading-relaxed">
            A continuous spatial registry of bespoke premium installations documented within collector residences.
          </p>
        </div>
      </Container>

      {/* Ticker Row 1: Left to Right */}
      <div className="overflow-hidden mb-8 sm:mb-12 relative w-full group">
        {/* Luxury Vignette Masks to fade edges beautifully into the page background */}
        <div className="absolute inset-y-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <div className="flex gap-6 sm:gap-8 w-max animate-ticker group-hover:[animation-play-state:paused]">
          {[...forwardRow, ...forwardRow, ...forwardRow, ...forwardRow].map((item, idx) => (
            <div
              key={`fwd-${idx}`}
              className="relative shrink-0 flex flex-col group/item cursor-pointer"
              style={{ width: item.width }}
            >
              {/* Maintained exact height constraint with curated width modifications */}
              <div className="relative w-full h-[220px] rounded-[24px] overflow-hidden bg-background-secondary border border-border/10 shadow-[0_15px_35px_rgba(0,0,0,0.03)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-transform duration-700 ease-[0.25,1,0.5,1] group-hover/item:scale-[1.02]">
                <Image 
                  src={item.url} 
                  alt={item.caption}
                  fill 
                  className="object-cover transition-transform duration-[1000ms] ease-out scale-100 group-hover/item:scale-105" 
                  loading="lazy" 
                  sizes="450px" 
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-black/5 dark:ring-white/5 rounded-[inherit]" />
              </div>
              
              {/* Lookbook Caption underneath individual item */}
              <span className="mt-3 block text-[10px] tracking-widest text-foreground-secondary font-light opacity-0 translate-y-1 group-hover/item:opacity-100 group-hover/item:translate-y-0 transition-all duration-500 ease-out px-2">
                {item.caption}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Ticker Row 2: Right to Left */}
      <div className="overflow-hidden relative w-full group">
        <div className="absolute inset-y-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <div className="flex gap-6 sm:gap-8 w-max animate-ticker-reverse group-hover:[animation-play-state:paused]">
          {[...reverseRow, ...reverseRow, ...reverseRow, ...reverseRow].map((item, idx) => (
            <div
              key={`rev-${idx}`}
              className="relative shrink-0 flex flex-col group/item cursor-pointer"
              style={{ width: item.width }}
            >
              {/* Maintained exact height constraint with curated width modifications */}
              <div className="relative w-full h-[220px] rounded-[24px] overflow-hidden bg-background-secondary border border-border/10 shadow-[0_15px_35px_rgba(0,0,0,0.03)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-transform duration-700 ease-[0.25,1,0.5,1] group-hover/item:scale-[1.02]">
                <Image 
                  src={item.url} 
                  alt={item.caption}
                  fill 
                  className="object-cover transition-transform duration-[1000ms] ease-out scale-100 group-hover/item:scale-105" 
                  loading="lazy" 
                  sizes="450px" 
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-black/5 dark:ring-white/5 rounded-[inherit]" />
              </div>
              
              <span className="mt-3 block text-[10px] tracking-widest text-foreground-secondary font-light opacity-0 translate-y-1 group-hover/item:opacity-100 group-hover/item:translate-y-0 transition-all duration-500 ease-out px-2">
                {item.caption}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}