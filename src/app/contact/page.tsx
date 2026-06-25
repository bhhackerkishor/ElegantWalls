'use client';

import { useState } from 'react';
import { FaWhatsapp, FaInstagram } from 'react-icons/fa';
import { FiMail } from 'react-icons/fi';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Container from '@/components/ui/Container';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { WHATSAPP_NUMBER, INSTAGRAM_URL, SUPPORT_EMAIL } from '@/lib/constants';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <>
      <Navbar />
      <main className="pt-[115px] min-h-screen pb-16">
        <Container className="py-16 max-w-4xl">
          <Badge>Get in Touch</Badge>
          <h1 className="text-4xl font-display font-bold mt-3 mb-8">Contact Us</h1>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 border border-border rounded-lg hover:border-accent transition-colors">
                <FaWhatsapp size={28} className="text-[#25D366]" />
                <div><p className="font-bold">WhatsApp</p><p className="text-sm text-foreground-secondary">Fastest response</p></div>
              </a>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 border border-border rounded-lg hover:border-accent transition-colors">
                <FaInstagram size={28} className="text-accent" />
                <div><p className="font-bold">Instagram</p><p className="text-sm text-foreground-secondary">@elgant.walls</p></div>
              </a>
              <a href={`mailto:${SUPPORT_EMAIL}`} className="flex items-center gap-4 p-4 border border-border rounded-lg hover:border-accent transition-colors">
                <FiMail size={28} />
                <div><p className="font-bold">Email</p><p className="text-sm text-foreground-secondary">{SUPPORT_EMAIL}</p></div>
              </a>
            </div>

            {submitted ? (
              <div className="p-8 bg-accent-light border border-border rounded-lg text-center">
                <p className="font-bold text-lg">Message received!</p>
                <p className="text-sm text-foreground-secondary mt-2">We&apos;ll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-1">
                <Input label="Name" required />
                <Input label="Email" type="email" required />
                <Textarea label="Message" required rows={4} />
                <Button type="submit" className="mt-2">Send Message</Button>
              </form>
            )}
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
