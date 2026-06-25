'use client';

import { useState } from 'react';
import Image from 'next/image';
import Container from '@/components/ui/Container';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { FiMove } from 'react-icons/fi';

const samples = [
  {
    title: 'Cozy Living Room Transformation',
    description: 'Blank white wall turned into a warm family memory gallery.',
    beforeImg: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800',
    afterImg: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800',
    stats: '3× Golden Oak Frames (A3) + 2× Black Matte (A4)',
  },
  {
    title: 'Minimalist Modern Bedroom',
    description: 'Neutral walls brought to life with abstract art.',
    beforeImg: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=800',
    afterImg: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=800',
    stats: 'Nordic Line Art Posters (A3)',
  },
  {
    title: 'Creative Home Office',
    description: 'Increased productivity with inspirational wall art.',
    beforeImg: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=800',
    afterImg: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=800',
    stats: 'Golden Hour Mountain Poster + Brass Frame',
  },
];

export default function BeforeAfterShowcase() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50);
  const current = samples[activeSlide];

  const handleDrag = (e: React.MouseEvent) => {
    const startX = e.clientX;
    const startPos = sliderPosition;
    const onMove = (moveEvent: MouseEvent) => {
      const delta = ((moveEvent.clientX - startX) / window.innerWidth) * 100;
      setSliderPosition(Math.max(10, Math.min(90, startPos + delta)));
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  return (
    <section className="py-20 bg-background-secondary border-b border-border">
      <Container className="max-w-5xl">
        <div className="text-center mb-12">
          <Badge>Before → After</Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold mt-3">See the Magic Happen</h2>
          <p className="text-foreground-secondary mt-3 max-w-xl mx-auto">
            Drag the slider to see how your wall can transform
          </p>
        </div>

        <div className="flex justify-center gap-3 mb-8 flex-wrap">
          {samples.map((slide, idx) => (
            <Button
              key={idx}
              variant={idx === activeSlide ? 'primary' : 'secondary'}
              size="sm"
              className="rounded-full"
              onClick={() => setActiveSlide(idx)}
            >
              {slide.title.split(' ').slice(0, 2).join(' ')}
            </Button>
          ))}
        </div>

        <div className="relative w-full h-[400px] md:h-[520px] rounded-lg overflow-hidden shadow-lg border border-border">
          <div className="absolute inset-0 z-[1]">
            <Image src={current.beforeImg} alt="Before" fill className="object-cover" />
            <span className="absolute top-5 left-5 bg-black/75 text-white px-3 py-1 rounded-sm text-xs font-semibold">BEFORE</span>
          </div>
          <div className="absolute top-0 right-0 h-full z-[2] overflow-hidden" style={{ left: `${sliderPosition}%` }}>
            <Image src={current.afterImg} alt="After" fill className="object-cover" />
            <span className="absolute top-5 right-5 bg-black/75 text-white px-3 py-1 rounded-sm text-xs font-semibold">AFTER</span>
          </div>
          <div
            className="absolute top-0 h-full w-1 bg-white shadow-md z-[3] cursor-ew-resize"
            style={{ left: `${sliderPosition}%` }}
            onMouseDown={handleDrag}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-accent rounded-full flex items-center justify-center text-black shadow-lg">
              <FiMove />
            </div>
          </div>
        </div>

        <div className="text-center mt-8 max-w-2xl mx-auto">
          <h3 className="text-xl font-bold">{current.title}</h3>
          <p className="mt-3 text-foreground-secondary">{current.description}</p>
          <div className="mt-4 inline-block px-5 py-3 bg-background border border-border rounded-md text-sm">
            {current.stats}
          </div>
        </div>
      </Container>
    </section>
  );
}
