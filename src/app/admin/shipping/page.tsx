'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import { useAdminApi } from '@/hooks/useAdminApi';
import { useToast } from '@/components/admin/ToastProvider';
import { FiSliders, FiDollarSign, FiPercent, FiClock, FiShield, FiSave } from 'react-icons/fi';

export default function AdminShippingPage() {
  const { get, put } = useAdminApi();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    freeShippingThreshold: 500,
    standardShippingFee: 80,
    gstRate: 18,
    estimatedDeliveryDays: '3 to 5 working days',
    codEnabled: true,
    razorpayEnabled: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    get('/api/shipping?key=global_shipping').then((r) => { 
      if (r.success && r.data) setSettings(r.data as typeof settings); 
    });
  }, [get]);

  const saveSettings = async () => {
    setSaving(true);
    const res = await put('/api/shipping?key=global_shipping', settings);
    if (res.success) {
      toast('Global constraints synchronized.', 'success');
    } else {
      toast('Failed mapping configuration properties.', 'error');
    }
    setSaving(false);
  };

  return (
    <div className=" p-4 sm:p-6 space-y-6 text-foreground bg-background transition-colors duration-300">
      
      {/* 🏷️ PANEL HEADER CONTAINER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <h1 className="text-xl font-display font-black tracking-tight text-foreground flex items-center gap-2">
            <FiSliders className="text-accent" /> Financial & Shipping Settings
          </h1>
          <p className="text-xs text-foreground-secondary">
            Configure systemic taxes, logistics criteria, and active storefront parameters.
          </p>
        </div>
        <Button 
          onClick={saveSettings} 
          disabled={saving}
          className="bg-accent hover:bg-accent/90 disabled:opacity-50 text-background font-bold h-10 px-5 rounded-xl flex items-center justify-center gap-2 text-xs transition-all shadow-xs shrink-0"
        >
          <FiSave size={14} /> {saving ? 'Syncing...' : 'Save Modifications'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 📦 LOGISTICS CONDITIONS FRAME */}
        <div className="p-6 bg-card-bg hover:bg-card-bg-hover border border-border rounded-2xl shadow-xs transition-all space-y-4">
          <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-foreground-secondary flex items-center gap-2 border-b border-border/60 pb-2.5">
            <FiDollarSign className="text-accent" /> Shipping Rules
          </h3>
          
          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground-secondary">Free Shipping Threshold (₹)</label>
              <input 
                type="number"
                value={settings.freeShippingThreshold}
                onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                className="w-full h-10 px-3 bg-background-secondary border border-border rounded-xl text-foreground outline-none focus:border-accent/60 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground-secondary">Standard Base Fee Rate (₹)</label>
              <input 
                type="number"
                value={settings.standardShippingFee}
                onChange={(e) => setSettings({ ...settings, standardShippingFee: Number(e.target.value) })}
                className="w-full h-10 px-3 bg-background-secondary border border-border rounded-xl text-foreground outline-none focus:border-accent/60 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* 🏛️ FISCAL TAXATION & TIMESPAN CARD */}
        <div className="p-6 bg-card-bg hover:bg-card-bg-hover border border-border rounded-2xl shadow-xs transition-all space-y-4">
          <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-foreground-secondary flex items-center gap-2 border-b border-border/60 pb-2.5">
            <FiPercent className="text-accent" /> Tax & Estimations
          </h3>
          
          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground-secondary">GST Applied Rate (%)</label>
              <input 
                type="number"
                value={settings.gstRate}
                onChange={(e) => setSettings({ ...settings, gstRate: Number(e.target.value) })}
                className="w-full h-10 px-3 bg-background-secondary border border-border rounded-xl text-foreground outline-none focus:border-accent/60 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground-secondary flex items-center gap-1">
                <FiClock size={12} className="text-accent" /> Estimated Delivery Window
              </label>
              <input 
                type="text"
                value={settings.estimatedDeliveryDays}
                onChange={(e) => setSettings({ ...settings, estimatedDeliveryDays: e.target.value })}
                className="w-full h-10 px-3 bg-background-secondary border border-border rounded-xl text-foreground outline-none focus:border-accent/60 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* 💳 TRANSACTION CHANNELS LAYER */}
        <div className="p-6 bg-card-bg border border-border rounded-2xl shadow-xs space-y-4 md:col-span-2">
          <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-foreground-secondary flex items-center gap-2 border-b border-border/60 pb-2.5">
            <FiShield className="text-accent" /> Payment Gateway Routing
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* CASH ON DELIVERY INTEGRATION */}
            <label className="flex items-center justify-between p-4 bg-background-secondary/50 border border-border rounded-xl cursor-pointer hover:border-accent/30 transition-all select-none group">
              <div className="space-y-0.5">
                <span className="font-bold text-foreground group-hover:text-accent transition-colors">Cash on Delivery (COD)</span>
                <p className="text-[10px] text-foreground-secondary">Enable dynamic manual processing checkout nodes.</p>
              </div>
              <input 
                type="checkbox"
                checked={settings.codEnabled}
                onChange={(e) => setSettings({ ...settings, codEnabled: e.target.checked })}
                className="w-4 h-4 rounded-md border-border text-accent focus:ring-accent accent-accent cursor-pointer"
              />
            </label>

            {/* SECURE E-PAYMENT INFRASTRUCTURE */}
            <label className="flex items-center justify-between p-4 bg-background-secondary/50 border border-border rounded-xl cursor-pointer hover:border-accent/30 transition-all select-none group">
              <div className="space-y-0.5">
                <span className="font-bold text-foreground group-hover:text-accent transition-colors">Razorpay Secure Pipeline</span>
                <p className="text-[10px] text-foreground-secondary">Enable immediate digital banking, card channels, and UPI links.</p>
              </div>
              <input 
                type="checkbox"
                checked={settings.razorpayEnabled}
                onChange={(e) => setSettings({ ...settings, razorpayEnabled: e.target.checked })}
                className="w-4 h-4 rounded-md border-border text-accent focus:ring-accent accent-accent cursor-pointer"
              />
            </label>
          </div>
        </div>

      </div>
    </div>
  );
}