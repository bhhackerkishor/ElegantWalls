'use client';

import { useEffect, useState, useRef } from 'react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useAdminApi } from '@/hooks/useAdminApi';
import { useToast } from '@/components/admin/ToastProvider';
import { 
  FiBell, FiPackage, FiAlertCircle, FiUserPlus, 
  FiDollarSign, FiMessageSquare, FiRefreshCw, FiVolume2, FiVolumeX, FiCheckSquare 
} from 'react-icons/fi';

interface Notification {
  _id: string;
  type: 'order' | 'stock' | 'review' | 'support' | 'return' | 'user' | 'payment' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export default function AdminNotificationsPage() {
  const { get, put } = useAdminApi();
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  // Reference cache to evaluate if new raw frames have dropped into state array since last poll
  const previousLengthRef = useRef<number>(0);

  // Synthetic Audio Cue Dispatcher using the browser's Web Audio API
  const playAlertSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      // Dual-tone chime sequence
      [
        { freq: 587.33, delay: 0 }, // D5
        { freq: 880.00, delay: 0.12 } // A5
      ].forEach((tone) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(tone.freq, ctx.currentTime + tone.delay);
        
        gain.gain.setValueAtTime(0.15, ctx.currentTime + tone.delay);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + tone.delay + 0.3);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + tone.delay);
        osc.stop(ctx.currentTime + tone.delay + 0.3);
      });
    } catch (e) {
      console.warn('Audio payload initialization delayed until interaction context.', e);
    }
  };

  const loadNotificationsPipeline = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    const res = await get<{ notifications: Notification[] }>('/api/notifications');
    if (res.success && res.data) {
      const incoming = res.data.notifications;
      
      // Evaluate if an unread entry has arrived compared to previous state tracking
      const incomingUnreadCount = incoming.filter(n => !n.read).length;
      const currentUnreadCount = notifications.filter(n => !n.read).length;
      
      if (!isInitial && incomingUnreadCount > currentUnreadCount && incoming.length > 0) {
        playAlertSound();
      }
      
      setNotifications(incoming);
      previousLengthRef.current = incoming.length;
    }
    setLoading(false);
  };

  // Poll for inbound entries every 15 seconds
  useEffect(() => {
    loadNotificationsPipeline(true);
    const backgroundPulse = setInterval(() => {
      loadNotificationsPipeline(false);
    }, 15000);
    return () => clearInterval(backgroundPulse);
  }, [soundEnabled, notifications.length,loadNotificationsPipeline]);

  const markSingleAsRead = async (id: string) => {
    const res = await put(`/api/notifications?id=${id}`, { read: true });
    if (res.success) {
      setNotifications(p => p.map(n => n._id === id ? { ...n, read: true } : n));
    }
  };

  const markAllAsRead = async () => {
    const res = await put('/api/notifications', { markAllRead: true });
    if (res.success) {
      toast('All processing cues mapped as synchronized.', 'success');
      setNotifications(p => p.map(n => ({ ...n, read: true })));
    }
  };

  const getMetaAttributes = (type: Notification['type']) => {
    switch (type) {
      case 'order': return { icon: FiPackage, style: 'bg-blue-500/10 text-blue-500 border-blue-500/20', label: 'Order Pipeline' };
      case 'stock': return { icon: FiAlertCircle, style: 'bg-rose-500/10 text-rose-500 border-rose-500/20', label: 'Low Stock Alert' };
      case 'user': return { icon: FiUserPlus, style: 'bg-purple-500/10 text-purple-500 border-purple-500/20', label: 'Account Created' };
      case 'payment': return { icon: FiDollarSign, style: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', label: 'Payment Event' };
      case 'support': return { icon: FiMessageSquare, style: 'bg-amber-500/10 text-amber-500 border-amber-500/20', label: 'Support Ticket' };
      case 'return': return { icon: FiRefreshCw, style: 'bg-orange-500/10 text-orange-500 border-orange-500/20', label: 'Return/Cancellation' };
      default: return { icon: FiBell, style: 'bg-background-secondary text-foreground-secondary border-border', label: 'System Log' };
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !n.read;
    return n.type === activeTab;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6 text-foreground bg-background transition-colors duration-300">
      
      {/* 📡 CONTROL HEADER STRIP */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2"><FiBell className="text-accent" /> Control Center Telegrams</h1>
          <p className="text-xs text-foreground-secondary mt-1">Live updates covering product manufacturing metrics and customer interactions.</p>
        </div>
        
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button 
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if(!soundEnabled) setTimeout(() => playAlertSound(), 100);
            }}
            className={`flex items-center justify-center gap-1.5 px-3 h-9 rounded-xl border text-xs font-bold transition-all ${soundEnabled ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-background-secondary border-border text-foreground-secondary'}`}
          >
            {soundEnabled ? <FiVolume2 size={14} /> : <FiVolumeX size={14} />}
            {soundEnabled ? 'Chime Active' : 'Muted'}
          </button>
          
          <Button size="sm" onClick={markAllAsRead} className="bg-background border border-border text-foreground hover:bg-background-secondary flex items-center gap-1.5 font-bold h-9 text-xs rounded-xl">
            <FiCheckSquare size={13} /> Mark Clear
          </Button>
        </div>
      </div>

      {/* 🎛️ TAB DISPATCH CHANNEL SHIFTING */}
      <div className="flex flex-wrap gap-1 p-1 bg-background-secondary rounded-xl text-xs max-w-max">
        {[
          { id: 'all', label: 'All Logs' },
          { id: 'unread', label: 'Unread Only' },
          { id: 'order', label: 'Orders' },
          { id: 'payment', label: 'Payments' },
          { id: 'stock', label: 'Stock Alerts' },
          { id: 'support', label: 'Tickets' },
          { id: 'user', label: 'Accounts' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 font-bold rounded-lg transition-all ${activeTab === tab.id ? 'bg-card-bg text-accent shadow-xs' : 'text-foreground-secondary hover:text-foreground'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 📬 STREAM CARDS CONTAINER */}
      {loading ? (
        <div className="py-12 text-center text-xs text-foreground-secondary animate-pulse tracking-widest">Polling operations grid sync matrices...</div>
      ) : filteredNotifications.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border rounded-2xl bg-card-bg/30">
          <p className="text-xs text-foreground-secondary font-mono">No transactional logs detected inside this operational stream.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((n) => {
            const meta = getMetaAttributes(n.type);
            const Icon = meta.icon;
            return (
              <div 
                key={n._id} 
                onClick={() => !n.read && markSingleAsRead(n._id)}
                className={`group relative p-4 border rounded-xl transition-all duration-200 cursor-pointer ${!n.read ? 'bg-background-secondary/90 border-accent/40 shadow-xs' : 'bg-card-bg border-border hover:bg-card-bg-hover'}`}
              >
                <div className="flex gap-4 items-start">
                  <div className={`p-2.5 rounded-xl border shrink-0 ${meta.style}`}>
                    <Icon size={16} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <p className={`text-xs font-bold ${!n.read ? 'text-foreground' : 'text-foreground-secondary'}`}>{n.title}</p>
                      <span className="text-[10px] font-mono text-foreground-secondary shrink-0">{new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-foreground-secondary mt-1 leading-relaxed break-words">{n.message}</p>
                    
                    {n.link && (
                      <a href={n.link} className="inline-flex items-center gap-1 text-[11px] text-accent font-bold mt-2 hover:underline">
                        Investigate Context Asset Node →
                      </a>
                    )}
                  </div>
                </div>
                
                {!n.read && (
                  <span className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}