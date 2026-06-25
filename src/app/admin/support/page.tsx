'use client';

import { useEffect, useState } from 'react';
import { DataTable } from '@/components/admin/ConfirmDialog';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { useAdminApi } from '@/hooks/useAdminApi';
import { useToast } from '@/components/admin/ToastProvider';
import { FiInbox, FiAlertCircle, FiClock, FiCheckCircle, FiSearch, FiMessageSquare, FiFileText, FiX } from 'react-icons/fi';

interface TicketMessage {
  sender: 'customer' | 'admin';
  senderEmail: string;
  message: string;
  timestamp: string;
}

interface Ticket {
  _id: string;
  ticketNumber: string;
  customerName?: string;
  customerEmail: string;
  subject: string;
  status: 'open' | 'pending' | 'resolved';
  orderId?: string;
  messages: TicketMessage[];
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminSupportPage() {
  const { get, put, post } = useAdminApi();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  
  const [activeTab, setActiveTab] = useState<'all' | 'open' | 'pending' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const formDefaults = { customerEmail: '', subject: '', customerName: '', initialMessage: '' };
  const [form, setForm] = useState(formDefaults);
  const [adminReply, setAdminReply] = useState('');
  const [notesDraft, setNotesDraft] = useState('');
  const [updatingTicket, setUpdatingTicket] = useState(false);

  const load = async () => {
    const route = activeTab === 'all' ? '/api/support' : `/api/support?status=${activeTab}`;
    const r = await get<Ticket[]>(route);
    if (r.success && r.data) {
      setTickets(r.data);
      if (selectedTicket) {
        const matching = r.data.find(t => t._id === selectedTicket._id);
        if (matching) {
          setSelectedTicket(matching);
          setNotesDraft(matching.internalNotes || '');
        }
      }
    }
  };

  useEffect(() => {
    load();
  }, [activeTab]);

  const handleCreateTicket = async () => {
    if (!form.customerEmail || !form.subject || !form.initialMessage) {
      return toast('Please complete all mandatory field entries.', 'error');
    }
    const payload = {
      customerEmail: form.customerEmail,
      customerName: form.customerName,
      subject: form.subject,
      messages: [{
        sender: 'admin',
        senderEmail: 'admin',
        message: form.initialMessage,
        timestamp: new Date().toISOString()
      }]
    };
    
    const res = await post('/api/support', payload);
    if (res.success) {
      toast('Support ticket opened successfully.', 'success');
      setForm(formDefaults);
      load();
    }
  };

  const handleSendReply = async (newStatus?: 'open' | 'pending' | 'resolved') => {
    if (!selectedTicket) return;
    if (!adminReply.trim() && !newStatus) return;

    setUpdatingTicket(true);
    const payload: any = {};
    if (adminReply.trim()) payload.reply = adminReply;
    if (newStatus) payload.status = newStatus;
    payload.internalNotes = notesDraft;

    const res = await put(`/api/support?id=${selectedTicket._id}`, payload);
    if (res.success) {
      toast('Ticket updated successfully.', 'success');
      setAdminReply('');
      load();
    }
    setUpdatingTicket(false);
  };

  const filteredTickets = tickets.filter(t => 
    t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusStyle = (status: string) => {
    if (status === 'resolved') return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    if (status === 'open') return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-[var(--foreground)]">
      
      {/* 📊 CORE CRM AGGREGATED METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] text-[var(--foreground-secondary)] uppercase tracking-wider font-bold">Total Pool</p>
            <p className="text-3xl font-extrabold mt-1 font-mono">{tickets.length}</p>
          </div>
          <div className="p-3 bg-[var(--background-secondary)] rounded-xl text-[var(--foreground-secondary)]"><FiInbox size={20} /></div>
        </div>
        <div className="p-5 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] text-[var(--foreground-secondary)] uppercase tracking-wider font-bold">Unassigned / Open</p>
            <p className="text-3xl font-extrabold mt-1 text-rose-500 dark:text-rose-400 font-mono">{tickets.filter(t => t.status === 'open').length}</p>
          </div>
          <div className="p-3 bg-rose-500/10 rounded-xl text-rose-500"><FiAlertCircle size={20} /></div>
        </div>
        <div className="p-5 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] text-[var(--foreground-secondary)] uppercase tracking-wider font-bold">Pending Action</p>
            <p className="text-3xl font-extrabold mt-1 text-amber-500 dark:text-amber-400 font-mono">{tickets.filter(t => t.status === 'pending').length}</p>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500"><FiClock size={20} /></div>
        </div>
        <div className="p-5 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] text-[var(--foreground-secondary)] uppercase tracking-wider font-bold">Resolved Cases</p>
            <p className="text-3xl font-extrabold mt-1 text-emerald-500 dark:text-emerald-400 font-mono">{tickets.filter(t => t.status === 'resolved').length}</p>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500"><FiCheckCircle size={20} /></div>
        </div>
      </div>

      {/* 🖥️ SPLIT MATRIX OPERATIONAL SANDBOX */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* LEFT HAND LOG MANAGEMENT VIEWPORT */}
        <div className={`${selectedTicket ? 'xl:col-span-7' : 'xl:col-span-12'} space-y-6 transition-all duration-300`}>
          
          {/* MANUAL GENERATION PANEL */}
          <div className="p-6 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-secondary)] border-b border-[var(--border)] pb-3 flex items-center gap-2">
              <FiMessageSquare className="text-amber-500" /> Manual Case Registration Entry
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input label="Customer Email" placeholder="client@domain.com" value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} />
              <Input label="Customer Name" placeholder="John Doe" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
              <Input label="Subject / Fault Scope" placeholder="E.g., Payment Failure" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            </div>
            <Textarea 
              label="Opening Message Body" 
              placeholder="Provide intake record logs, verification references or descriptive telemetry parameters..."
              value={form.initialMessage} 
              onChange={(e) => setForm({ ...form, initialMessage: e.target.value })} 
              rows={2}
            />
            <div className="flex justify-end pt-1">
              <Button onClick={handleCreateTicket} className="bg-[var(--foreground)] hover:bg-[var(--foreground)]/90 text-[var(--background)] font-bold text-xs h-9 px-5 rounded-xl transition-all shadow-sm">
                Provision Support Log
              </Button>
            </div>
          </div>

          {/* BAR BANNER CONTROL FILTERS */}
          <div className="p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="flex gap-1 bg-[var(--background)] p-1 border border-[var(--border)] rounded-xl w-full sm:w-auto">
              {(['all', 'open', 'pending', 'resolved'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-bold uppercase rounded-lg transition-all ${
                    activeTab === tab 
                      ? 'bg-[var(--card-bg)] text-[var(--foreground)] shadow-sm border border-[var(--border)]' 
                      : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)] bg-transparent'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-72">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-secondary)]/60"><FiSearch size={14} /></span>
              <input
                type="text"
                placeholder="Search ticket parameters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-4 text-xs rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-[var(--foreground)] outline-none text-[var(--foreground)] transition-colors shadow-inner"
              />
            </div>
          </div>

          {/* DYNAMIC CASE LEDGER TABLE */}
          {/* DYNAMIC CASE LEDGER TABLE */}
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <DataTable headers={['Ticket Number', 'Customer Email', 'Subject Domain', 'Fulfillment Status', 'Operational Scope']}>
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-xs font-medium text-[var(--foreground-secondary)]">
                      No active service tickets correlate with your current filters.
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((t) => (
                    <tr 
                      key={t._id} 
                      onClick={() => { setSelectedTicket(t); setNotesDraft(t.internalNotes || ''); }}
                      className={`cursor-pointer group border-b border-[var(--border)] last:border-0 hover:bg-[var(--background-secondary)]/30 transition-colors ${
                        selectedTicket?._id === t._id ? 'bg-[var(--background-secondary)]/50' : ''
                      }`}
                    >
                      <td className="px-4 py-4 font-mono text-xs font-bold text-[var(--foreground)] group-hover:text-[var(--foreground-secondary)] transition-colors">
                        {t.ticketNumber}
                      </td>
                      <td className="px-4 py-4 text-xs font-medium text-[var(--foreground-secondary)] max-w-[140px] truncate">
                        {t.customerEmail}
                      </td>
                      <td className="px-4 py-4 text-xs font-bold text-[var(--foreground)] max-w-[180px] truncate">
                        {t.subject}
                      </td>
                      <td className="px-4 py-4">
                        <Badge className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase ${getStatusStyle(t.status)}`}>
                          {t.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-[11px] font-bold h-7 px-3 rounded-lg border border-[var(--border)] hover:bg-[var(--background)]" 
                          onClick={() => { setSelectedTicket(t); setNotesDraft(t.internalNotes || ''); }}
                        >
                          Inspect
                        </Button>
                        {t.status !== 'resolved' && (
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            className="text-[11px] font-bold h-7 px-3 rounded-lg border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors"
                            onClick={async () => {
                              await put(`/api/support?id=${t._id}`, { status: 'resolved' });
                              toast('Ticket marked resolved.', 'success');
                              load();
                            }}
                          >
                            Resolve
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </DataTable>
            </div>
          </div>
        </div>

        {/* RIGHT HAND CRM INSPECTOR PANEL SHELL */}
        {selectedTicket && (
          <div className="xl:col-span-5 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-sm p-6 space-y-4 relative xl:sticky xl:top-6 transition-all duration-300">
            
            {/* HEADER METADATA ARCHITECTURE */}
            <div className="flex justify-between items-start border-b border-[var(--border)] pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-mono font-black text-lg text-[var(--foreground)] tracking-tight">{selectedTicket.ticketNumber}</h3>
                  <Badge className={`text-[10px] uppercase border px-2 py-0.5 rounded-md font-bold ${getStatusStyle(selectedTicket.status)}`}>
                    {selectedTicket.status}
                  </Badge>
                </div>
                <p className="text-xs font-bold text-[var(--foreground)] leading-snug">{selectedTicket.subject}</p>
                <p className="text-[11px] font-medium text-[var(--foreground-secondary)]">Client: {selectedTicket.customerName || 'N/A'} <span className="opacity-60">({selectedTicket.customerEmail})</span></p>
                {selectedTicket.orderId && (
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/5 border border-amber-500/10 px-2 py-0.5 rounded-md font-mono inline-block mt-1">Linked Order ID: #{selectedTicket.orderId}</p>
                )}
              </div>
              <button 
                onClick={() => setSelectedTicket(null)}
                className="text-[var(--foreground-secondary)] hover:text-[var(--foreground)] p-1.5 transition-colors bg-[var(--background)] border border-[var(--border)] rounded-lg"
              >
                <FiX size={14} />
              </button>
            </div>

            {/* MESSAGE CHAT CHANNEL TIMELINE */}
            {/* Chat Container */}
<div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1 bg-[var(--background)] border border-[var(--border)] rounded-lg p-2">
  {selectedTicket.messages.map((msg, i) => (
    <div
      key={i}
      className={`flex flex-col max-w-[80%] text-[10px] rounded-md px-2 py-1.5 text-[11px] ${
        msg.sender === 'admin'
          ? 'ml-auto bg-[var(--foreground)] text-[var(--background)]'
          : 'mr-auto bg-[var(--card-bg)] border border-[var(--border)] text-[var(--foreground)]'
      }`}
    >
      {/* Message */}
      <p className="leading-snug text-[10px] break-words">
        {msg.message}
      </p>

      {/* Footer */}
      <div className="flex items-center text-[10px] gap-1 mt-1 text-[8px] opacity-60">
        <span>
          {msg.sender === 'admin' ? 'Agent' : 'User'}
        </span>

        <span className="ml-auto">
          {new Date(msg.timestamp).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  ))}
</div>

            {/* MUTATORS CONFIGURATION ENGINE */}
            <div className="space-y-4">
              <Textarea 
                label="Compose Dispatch Outbound Reply" 
                placeholder="Type messages intended to synchronize directly back downstream to target consumer nodes..." 
                value={adminReply}
                onChange={(e) => setAdminReply(e.target.value)}
                rows={3}
              />
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--foreground-secondary)] uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <FiFileText className="text-amber-500" /> Internal Administrative Sandbox (Sticky Notes)
                </label>
                <textarea
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  placeholder="Append logistics identifiers, diagnostic checksum configurations, or verification sequences..."
                  className="w-full text-xs p-3 rounded-xl bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] outline-none font-mono focus:border-[var(--foreground)] transition-colors shadow-inner"
                  rows={2}
                />
              </div>

              {/* DYNAMIC ACTION TRIGGER MATRIX */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <Button 
                  size="sm" 
                  variant={"outline" as any}
                  disabled={updatingTicket}
                  onClick={() => handleSendReply(selectedTicket.status === 'open' ? 'pending' : undefined)}
                  className="text-xs font-bold h-10 border-[var(--border)] bg-transparent text-[var(--foreground)] hover:bg-[var(--background-secondary)] rounded-xl"
                >
                  Commit Sticky Note
                </Button>
                <Button 
                  size="sm" 
                  loading={updatingTicket}
                  onClick={() => handleSendReply()}
                  className="text-xs font-bold h-10 rounded-xl bg-[var(--foreground)] hover:bg-[var(--foreground)]/90 text-[var(--background)]"
                >
                  Transmit Message
                </Button>
              </div>

              {selectedTicket.status !== 'resolved' && (
                <Button 
                  size="sm" 
                  variant="secondary" 
                  disabled={updatingTicket}
                  onClick={() => handleSendReply('resolved')}
                  className="w-full h-10 text-xs font-bold border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 rounded-xl transition-all"
                >
                  Lock & Finalize Ticket Context
                </Button>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}