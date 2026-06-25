import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Container from '@/components/ui/Container';
import Badge from '@/components/ui/Badge';
import { buildPageMetadata } from '@/lib/seo';
import { SITE_NAME } from '@/lib/constants';

export const metadata = buildPageMetadata({
  title: 'About Us',
  description: `Learn about ${SITE_NAME} — premium wall decor handcrafted in India.`,
  path: '/about',
});

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="pt-[115px] min-h-screen">
        <Container className="py-16 max-w-4xl">
          <Badge>Our Story</Badge>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold mt-3 mb-8">About {SITE_NAME}</h1>
          <div className="grid md:grid-cols-2 gap-10 items-center mb-16">
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=800"
                alt="Premium photo frames"
                fill
                className="object-cover"
                sizes="(max-width:768px) 100vw, 50vw"
              />
            </div>
            <div className="space-y-4 text-foreground-secondary leading-relaxed">
              <p>Founded with a passion for transforming empty walls into memory-filled galleries, {SITE_NAME} brings premium wall decor to homes across India.</p>
              <p>From minimalist posters to handcrafted oak frames, every product is made to order with meticulous attention to print quality, material selection, and safe packaging.</p>
              <p>We believe your walls should tell your story — whether that&apos;s a favourite movie poster, a family portrait, or a custom canvas print of your own photography.</p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Premium Quality', desc: '280+ GSM cardstock, HD inkjet printing, and handcrafted timber frames.' },
              { title: 'Custom Everything', desc: 'Choose your size, frame, material, and upload your own photos.' },
              { title: 'Pan-India Delivery', desc: 'Secure packaging with active tracking. Delivered in 3–5 working days.' },
            ].map((item) => (
              <div key={item.title} className="p-6 bg-background-secondary border border-border rounded-lg">
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-foreground-secondary">{item.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
