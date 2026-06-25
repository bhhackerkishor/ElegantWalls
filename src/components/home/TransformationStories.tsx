'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import Container from '@/components/ui/Container';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

const stories = [
  {
    id: 1,
    title: 'Cozy Family Living Room',
    customer: 'Rahul • Bangalore',
    before:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200',
    after:
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1200',
    description:
      'An empty wall transformed into a warm memory gallery using premium oak frames and family photographs.',
    products: ['A3 Oak Frame', 'Family Photo Print', 'Black Matte Frame'],
  },
  {
    id: 2,
    title: 'Modern Minimal Bedroom',
    customer: 'Priya • Mumbai',
    before:
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=1200',
    after:
      'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1200',
    description:
      'Abstract artwork and neutral frames transformed the bedroom into a calm, premium space.',
    products: ['Abstract Art Print', 'Gold Frame', 'Canvas Print'],
  },
];

export default function TransformationStories() {
  return (
    <section className="py-24 bg-background-secondary border-b border-border overflow-hidden">
      <Container>
        {/* Header */}
        <div className="text-center mb-20">
          <Badge>Transformation Stories</Badge>

          <h2 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">
            Walls That Tell Stories
          </h2>

          <p className="mt-4 max-w-2xl mx-auto text-foreground-secondary text-lg">
            Real customer spaces transformed with RegalMints wall art,
            frames, and premium prints.
          </p>
        </div>

        {/* Stories */}
        <div className="space-y-32">
          {stories.map((story, index) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="grid lg:grid-cols-2 gap-16 items-center"
            >
              <div
            className={`${
                index % 2 !== 0 ? 'lg:order-2' : ''
            }`}
            >
            <div className="grid grid-cols-2 gap-4">

                {/* BEFORE */}
                <div className="relative">
                <div className="absolute top-4 left-4 z-10 bg-black text-white px-3 py-1 rounded-full text-xs font-bold">
                    BEFORE
                </div>

                <div className="relative h-[300px] md:h-[500px] rounded-3xl overflow-hidden">
                    <Image
                    src={story.before}
                    alt="Before"
                    fill
                    className="object-cover"
                    />
                </div>
                </div>

                {/* AFTER */}
                <div className="relative">
                <div className="absolute top-4 left-4 z-10 bg-white text-black px-3 py-1 rounded-full text-xs font-bold">
                    AFTER
                </div>

                <div className="relative h-[300px] md:h-[500px] rounded-3xl overflow-hidden">
                    <Image
                    src={story.after}
                    alt="After"
                    fill
                    className="object-cover"
                    />
                </div>
                </div>

            </div>
            </div>

              {/* Content */}
              <div
                className={`${
                  index % 2 !== 0 ? 'lg:order-1' : ''
                }`}
              >
                <p className="text-accent font-semibold uppercase tracking-wider">
                  {story.customer}
                </p>

                <h3 className="mt-3 text-3xl md:text-4xl font-bold leading-tight">
                  {story.title}
                </h3>

                <p className="mt-5 text-foreground-secondary leading-relaxed text-lg">
                  {story.description}
                </p>

                {/* Products Used */}
                <div className="mt-8">
                  <p className="font-semibold mb-4">
                    Products Used
                  </p>

                  <div className="flex flex-wrap gap-3">
                    {story.products.map((product) => (
                      <span
                        key={product}
                        className="
                          px-4
                          py-2
                          rounded-full
                          bg-background
                          border
                          border-border
                          text-sm
                        "
                      >
                        {product}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-10">
                  <Button>
                    Shop This Look
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}