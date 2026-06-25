'use client';

import { useState, useEffect, useRef } from 'react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import type { ISupportTicket } from '@/types';

interface TicketChatPanelProps {
  ticketId?: string;
  orderId?: string;
  onClose?: () => void;
  getAuthHeaders: () => Record<string, string>;
}

export default function TicketChatPanel({ ticketId, orderId, onClose, getAuthHeaders }: TicketChatPanelProps) {
  const [ticket, setTicket] = useState<ISupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchTicketDetails = async () => {
    try {
      const queryParam = ticketId ? `id=${ticketId}` : `orderId=${orderId}`;
      const res = await fetch(`/api/tickets/detail?${queryParam}`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success && data.data) {
        setTicket(data.data);
      }
    } catch (err) {
      console.error('Error tracking target ticket thread', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketDetails();
    const timer = setInterval(fetchTicketDetails, 10000);
    return () => clearInterval(timer);
  }, [ticketId, orderId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [ticket?.messages]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket || !replyText.trim()) return;

    setSending(true);
    try {
      const res = await fetch(`/api/tickets/reply?id=${ticket._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ reply: replyText }),
      });
      const data = await res.json();
      if (data.success) {
        setReplyText('');
        setTicket(data.data);
      }
    } catch (err) {
      console.error('Message submission failed', err);
    } finally {
      setSending(false);
    }
  };

  const getStatusStyle = (status: string) => {
    if (status === 'resolved') return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    if (status === 'open') return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
  };

  if (loading) {
    return (
      <div className="support-card border border-border p-8 text-center shadow-sm">
        <p className="text-xs font-medium text-accent animate-pulse font-light">Loading secure chat console...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="support-card border border-border p-6 text-center shadow-sm">
        <p className="text-xs text-foreground-secondary font-light">No active support ticket thread found.</p>
      </div>
    );
  }

  return (
    <div className="support-panel border border-border shadow-md p-4 space-y-4 transition-all duration-300">
      
      {/* Header Info Banner */}
      <div className="flex justify-between items-start border-b border-border/40 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-xs text-accent tracking-wider">{ticket.ticketNumber}</span>
            <Badge className={`text-[9px] uppercase border px-1.5 py-0.5 rounded-sm font-sans ${getStatusStyle(ticket.status)}`}>
              {ticket.status}
            </Badge>
          </div>
          <h4 className="text-sm font-serif font-bold text-foreground mt-1.5 truncate max-w-[200px]" title={ticket.subject}>
            {ticket.subject}
          </h4>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-foreground-secondary hover:text-accent text-[10px] tracking-widest uppercase p-1 font-semibold transition-colors">
            ✕ Close
          </button>
        )}
      </div>

      {/* Message Timeline Scroller */}
      <div 
        ref={scrollRef}
        className="space-y-4 h-[320px] overflow-y-auto pr-1 bg-background/50 p-3 border border-border/40 rounded-xl shadow-inner flex flex-col support-scrollbar"
      >
        {ticket.messages.map((msg: { sender: string; message: string; timestamp: string | number | Date },  i: number) => {
          const isAdmin = msg.sender === 'admin';
          return (
            <div 
              key={i} 
              className={`max-w-[85%] rounded-2xl p-3 text-xs border shadow-2xs leading-relaxed ${
                isAdmin 
                  ? 'mr-auto bg-card-bg border-border/40 text-foreground rounded-tl-none font-light' 
                  : 'ml-auto bg-accent text-background border-transparent rounded-tr-none font-normal'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.message}</p>
              <p className={`mt-1.5 text-[9px] opacity-60 text-right ${isAdmin ? 'text-foreground-secondary' : 'text-background/80'}`}>
                {isAdmin ? 'Support Agent' : 'You'} • {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          );
        })}

      </div>

      {/* Interactive Input Form Control */}
      {ticket.status === 'resolved' ? (
        <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-center">
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-serif">This support ticket query is resolved & locked.</p>
        </div>
      ) : (
        <form onSubmit={handleSendReply} className="space-y-2">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type your clarification notes..."
            rows={2}
            className="w-full text-xs p-3 rounded-xl bg-background/60 border border-border/60 text-foreground outline-none focus:border-accent transition-colors resize-none placeholder:text-foreground-secondary/50 font-light"
          />
          <Button type="submit" size="sm" loading={sending} className="w-full text-xs font-semibold py-2 bg-accent text-background rounded-xl hover:bg-accent/90">
            Send Message Updates
          </Button>
        </form>
      )}

    </div>
  );
}