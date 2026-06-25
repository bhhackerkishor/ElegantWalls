import Link from 'next/link';
import Container from '@/components/ui/Container';
import { SITE_NAME, SUPPORT_EMAIL, INSTAGRAM_URL, WHATSAPP_NUMBER } from '@/lib/constants';

const footerLinks = {
  shop: [
    { href: '/posters', label: 'Posters' },
    { href: '/photo-frames', label: 'Photo Frames' },
    { href: '/wall-stickers', label: 'Wall Stickers' },
    { href: '/canvas-prints', label: 'Canvas Prints' },
    { href: '/custom-prints', label: 'Custom Prints' },
  ],
  company: [
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact Us' },
    { href: '/support', label: 'Support' },
    { href: '/orders', label: 'Track Order' },
  ],
  policies: [
    { href: '/privacy-policy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms & Conditions' },
    { href: '/shipping-policy', label: 'Shipping Policy' },
    { href: '/refund-policy', label: 'Refund Policy' },
    { href: '/cancellation-policy', label: 'Cancellation Policy' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-background-secondary border-t border-border pt-16 pb-8 mt-auto">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          <div>
            <h3 className="text-accent text-xl font-display font-extrabold mb-3">{SITE_NAME.toUpperCase()}</h3>
            <p className="text-[13px] text-foreground-secondary leading-relaxed max-w-xs">
              Handcrafting premium wall decor — posters, frames, canvas prints & custom uploads. Delivered safely across India.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase mb-3">Shop</h4>
            <div className="flex flex-col gap-2 text-[13px]">
              {footerLinks.shop.map((l) => (
                <Link key={l.href} href={l.href}>{l.label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase mb-3">Company</h4>
            <div className="flex flex-col gap-2 text-[13px]">
              {footerLinks.company.map((l) => (
                <Link key={l.href} href={l.href}>{l.label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase mb-3">Policies</h4>
            <div className="flex flex-col gap-2 text-[13px]">
              {footerLinks.policies.map((l) => (
                <Link key={l.href} href={l.href}>{l.label}</Link>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-foreground-secondary">
          <p>© {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
          <div className="flex gap-4">
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
