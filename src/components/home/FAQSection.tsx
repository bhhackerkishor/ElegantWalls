'use client';

import { useState } from 'react';
import Container from '@/components/ui/Container';

interface FAQItem {
  q: string;
  a: string;
}

const BRAND_FAQS: FAQItem[] = [
  { 
    q: "What is the typical curation and dispatch timeframe?", 
    a: "Every artwork is produced to museum standards upon order verification. Curation, archival printing, custom framing, and white-glove packaging typically require 2-3 business days. Secure transit across India spans an additional 3-5 structural business days." 
  },
  { 
    q: "Do you accommodate custom dimensions and bespoke gallery specifications?", 
    a: "Yes. Through our atelier platform, you can upload high-resolution files. Our design team assesses structural pixel densities and provides custom profile matching, layout sizing, and material configuration consultation." 
  },
  { 
    q: "What measures protect framed glass assets during transit?", 
    a: "We deploy industrial-grade, multi-layered break-safe casing. Each frame is cocooned within shock-absorbing high-density memory foam cells and housed in a hardboard structural crate built to withstand major transit vibrations." 
  },
  { 
    q: "Are the printing mediums museum-grade?", 
    a: "Completely. We exclusively utilize 100% acid-free cotton rag papers paired with archival-grade pigment ink arrays. This prevents atmospheric yellowing or pigment degradation, preserving structural contrast metrics for over a century." 
  }
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-28 sm:py-36 bg-background text-foreground transition-colors duration-500 border-b border-border/10">
      <Container className="max-w-3xl">
        <div className="text-center mb-20">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-foreground/40 block mb-4">
            Assistance & Protocol
          </span>
          <h2 className="text-4xl sm:text-5xl font-serif font-light tracking-tight text-foreground">
            Collector Inquiries
          </h2>
        </div>

        <div className="space-y-4">
          {BRAND_FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div 
                key={i} 
                className="border-b border-border/20 dark:border-border/10 transition-colors duration-300"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="w-full py-7 text-left flex justify-between items-center group outline-none"
                >
                  <span className="text-base sm:text-lg font-light text-foreground group-hover:text-foreground-secondary transition-colors duration-300 pr-4">
                    {faq.q}
                  </span>
                  <span className="text-xl font-light text-foreground-secondary shrink-0 relative w-4 h-4 flex items-center justify-center">
                    <span className={`absolute bg-current h-[1px] w-4 transition-transform duration-500 ease-out ${isOpen ? 'rotate-180' : ''}`} />
                    <span className={`absolute bg-current w-[1px] h-4 transition-transform duration-500 ease-out ${isOpen ? 'rotate-90 opacity-0' : ''}`} />
                  </span>
                </button>
                
                <div 
                  className={`overflow-hidden transition-all duration-500 ease-[0.25,1,0.5,1] ${
                    isOpen ? 'max-h-[250px] pb-8 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="text-sm sm:text-base text-foreground-secondary font-light leading-relaxed max-w-2xl">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}