'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Container from '@/components/ui/Container';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { FAQ_ITEMS, WHATSAPP_NUMBER, SUPPORT_EMAIL } from '@/lib/constants';
import type { ISupportTicket } from '@/types';
import TicketChatPanel from '@/components/support/TicketChatPanel';

export default function SupportPage() {
  const { isAuthenticated, getAuthHeaders } = useAuth();
  const [tickets, setTickets] = useState<ISupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<ISupportTicket | null>(null);
  
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  const loadTickets = () => {
    if (!isAuthenticated) return;
    fetch('/api/tickets', { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setTickets(data.data || []);
          if (selectedTicket) {
            const current = data.data.find((t: ISupportTicket) => t._id === selectedTicket._id);
            if (current) setSelectedTicket(current);
          }
        }
      });
  };

  useEffect(() => {
    loadTickets();
  }, [isAuthenticated]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return setActionMsg('Please complete all form values.');
    
    setSubmitting(true);
    setActionMsg('');

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ subject, message }),
      });
      const data = await res.json();
      
      if (data.success) {
        setActionMsg(`Ticket ${data.data.ticketNumber} created successfully.`);
        setSubject('');
        setMessage('');
        loadTickets();
      } else {
        setActionMsg(data.error || 'Failed to submit ticket.');
      }
    } catch (err) {
      setActionMsg('An unexpected network interruption occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusStyle = (status: string) => {
    if (status === 'resolved') return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    if (status === 'open') return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
  };

  return (
    <>
      <Navbar />
      <main className="pt-[115px] min-h-screen bg-background-secondary text-foreground transition-colors duration-300">
        <Container className="py-12 max-w-6xl">
          
          {/* Header Block with Serif Styling */}
          <div className="text-center max-w-xl mx-auto mb-14 animate-fade-in">
            <Badge className="bg-accent-light text-accent border-accent/20 px-3 py-1 text-[11px] tracking-widest uppercase">Help Center</Badge>
            <h1 className="text-4xl md:text-5xl font-serif tracking-tight mt-4 mb-3 text-foreground font-semibold">Support Portal</h1>
            <p className="text-xs md:text-sm text-foreground-secondary leading-relaxed font-light">
              Find immediate resources or manage ongoing conversations with our service desk operations.
            </p>
          </div>

          {/* Quicklinks Grid utilizing brand .support-card tokens */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { href: "/profile", title: "Track Orders", desc: "View tracking timelines and dispatch routes." },
              { href: "/profile", title: "Manage Profile", desc: "Update default names and physical addresses." },
              { href: "/refund-policy", title: "Return Rules", desc: "Review parameters governing replacement items." },
              { href: `https://wa.me/${WHATSAPP_NUMBER}`, title: "WhatsApp Live", desc: "Initiate chat operations instantly online.", isExternal: true }
            ].map((link, idx) => {
              const Comp = link.isExternal ? 'a' : Link;
              return (
                // @ts-ignore
                <Comp
                  key={idx}
                  href={link.href}
                  {...(link.isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="support-card p-6 border border-border shadow-sm flex flex-col justify-between hover:scale-[1.01]"
                >
                  <div>
                    <h3 className="font-serif font-bold text-base text-foreground mb-1.5 tracking-tight">{link.title}</h3>
                    <p className="text-xs text-foreground-secondary font-light leading-normal">{link.desc}</p>
                  </div>
                </Comp>
              );
            })}
          </div>

          {/* Master View Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Column A: Form Control Hub */}
            <div className={`${selectedTicket ? 'lg:col-span-4' : 'lg:col-span-6'} space-y-6 transition-all duration-300`}>
              <div className="support-card border border-border p-6 shadow-sm">
                <h2 className="text-xl font-serif font-bold mb-1 text-foreground tracking-tight">Open an Incident Ticket</h2>
                <p className="text-xs text-foreground-secondary mb-5 font-light">Our operations desks review all custom config queries within 24 business hours.</p>
                
                {isAuthenticated ? (
                  <form onSubmit={handleCreateTicket} className="space-y-4">
                    <Input 
                      label="Subject Topic" 
                      placeholder="e.g., Damaged frame alignment on delivery"
                      value={subject} 
                      onChange={(e) => setSubject(e.target.value)} 
                      className="text-xs bg-background/50 border-border rounded-[8px]"
                    />
                    <Textarea 
                      label="Detailed Support Message" 
                      placeholder="Provide details regarding frame faults or missing configuration units..." 
                      rows={4}
                      value={message} 
                      onChange={(e) => setMessage(e.target.value)}
                      className="text-xs bg-background/50 border-border rounded-[8px]"
                    />
                    {actionMsg && <p className="text-xs font-medium text-accent animate-pulse">{actionMsg}</p>}
                    <Button type="submit" loading={submitting} className="w-full text-xs font-semibold py-2.5 rounded-[8px] bg-accent text-background hover:bg-accent/90">
                      File New Ticket
                    </Button>
                  </form>
                ) : (
                  <div className="p-8 border border-dashed border-border/60 bg-accent-light/30 text-center rounded-xl">
                    <p className="text-xs text-foreground-secondary mb-4 font-light">You must log in to track service tickets.</p>
                    <Link href="/profile">
                      <Button size="sm" className="bg-accent text-background text-xs font-medium rounded-[6px]">Go To Authentication</Button>
                    </Link>
                  </div>
                )}
              </div>

              {!selectedTicket && (
                <div className="support-card border border-border p-6 shadow-sm">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-accent mb-4">Frequently Asked Questions</h2>
                  <div className="space-y-4 divide-y divide-border/30">
                    {FAQ_ITEMS.slice(0, 3).map((faq, i) => (
                      <div key={i} className={`text-xs ${i > 0 ? 'pt-4' : ''}`}>
                        <p className="font-semibold text-foreground mb-1 font-serif text-sm tracking-tight">{faq.q}</p>
                        <p className="text-foreground-secondary leading-relaxed font-light">{faq.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Column B: Active Ticket Logging Indices */}
            <div className={`${selectedTicket ? 'lg:col-span-4' : 'lg:col-span-6'} space-y-4 transition-all duration-300`}>
              <div className="support-card border border-border p-6 shadow-sm">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-accent border-b border-border/40 pb-3 mb-4">
                  Your Support Tickets ({tickets.length})
                </h3>
                
                {!isAuthenticated ? (
                  <p className="text-xs text-foreground-secondary text-center py-6 font-light">Authenticate account status to access logged history indices.</p>
                ) : tickets.length === 0 ? (
                  <p className="text-xs text-foreground-secondary text-center py-6 font-light">No active support ticket records encountered yet.</p>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 support-scrollbar">
                    {tickets.map((t) => (
                      <div 
                        key={t._id} 
                        onClick={() => setSelectedTicket(t)}
                        className={`p-4 border rounded-xl cursor-pointer transition-all flex flex-col justify-between gap-2.5 ${
                          selectedTicket?._id === t._id 
                            ? 'bg-accent-light/70 border-accent' 
                            : 'bg-background/40 border-border/60 hover:bg-accent-light/20'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono font-bold text-xs text-accent tracking-wider">{t.ticketNumber}</span>
                          <Badge className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border font-sans ${getStatusStyle(t.status)}`}>
                            {t.status}
                          </Badge>
                        </div>
                        <p className="font-serif font-bold text-sm text-foreground tracking-tight truncate">{t.subject}</p>
                        <p className="text-[10px] text-foreground-secondary font-light text-right">
                          Last Updated: {new Date(t.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Column C: Interactive Registered Message Chat Board */}
            {selectedTicket && (
              <div className="lg:col-span-4 sticky top-6 animate-slide-in-right">
                <TicketChatPanel 
                  ticketId={selectedTicket._id} 
                  onClose={() => setSelectedTicket(null)}
                   getAuthHeaders={() => getAuthHeaders() as Record<string, string>} 
                />
              </div>
            )}
          </div>

        </Container>
      </main>
      <Footer />
    </>
  );
}