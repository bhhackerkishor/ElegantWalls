'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAdminApi } from '@/hooks/useAdminApi';
import { useToast } from '@/components/admin/ToastProvider';

export default function AdminSettingsPage() {
  const { get, put } = useAdminApi();
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    siteName: 'Elegant Walls',
    logo: '',
    contactEmail: '',
    contactPhone: '',
    whatsapp: '',
    address: '',
    socialLinks: { instagram: '', facebook: '', twitter: '', youtube: '' },
    footerContent: '',
    seoDefaults: { title: '', description: '', keywords: [] as string[] },
    paymentSettings: { codEnabled: true, razorpayEnabled: true },
  });

  useEffect(() => {
    get('/api/settings').then((r) => { if (r.success && r.data) setSettings(r.data as typeof settings); });
  }, [get]);

  const save = async () => {
    await put('/api/settings', settings);
    toast('Settings saved');
  };

  return (
    <div className="max-w-2xl space-y-6">
      <section className="p-5 bg-card-bg border border-border rounded-xl space-y-3">
        <h3 className="font-bold">Site Settings</h3>
        <Input label="Site Name" value={settings.siteName} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} />
        <Input label="Logo URL" value={settings.logo} onChange={(e) => setSettings({ ...settings, logo: e.target.value })} />
        <Input label="Contact Email" value={settings.contactEmail} onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })} />
        <Input label="Contact Phone" value={settings.contactPhone} onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })} />
        <Input label="WhatsApp" value={settings.whatsapp} onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })} />
        <Input label="Address" value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} />
      </section>
      <section className="p-5 bg-card-bg border border-border rounded-xl space-y-3">
        <h3 className="font-bold">Social Links</h3>
        <Input label="Instagram" value={settings.socialLinks.instagram} onChange={(e) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, instagram: e.target.value } })} />
        <Input label="Facebook" value={settings.socialLinks.facebook} onChange={(e) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, facebook: e.target.value } })} />
      </section>
      <section className="p-5 bg-card-bg border border-border rounded-xl space-y-3">
        <h3 className="font-bold">SEO Defaults</h3>
        <Input label="Meta Title" value={settings.seoDefaults.title} onChange={(e) => setSettings({ ...settings, seoDefaults: { ...settings.seoDefaults, title: e.target.value } })} />
        <Input label="Meta Description" value={settings.seoDefaults.description} onChange={(e) => setSettings({ ...settings, seoDefaults: { ...settings.seoDefaults, description: e.target.value } })} />
      </section>
      <section className="p-5 bg-card-bg border border-border rounded-xl space-y-3">
        <h3 className="font-bold">Payment Settings</h3>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={settings.paymentSettings.codEnabled} onChange={(e) => setSettings({ ...settings, paymentSettings: { ...settings.paymentSettings, codEnabled: e.target.checked } })} /> COD Enabled</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={settings.paymentSettings.razorpayEnabled} onChange={(e) => setSettings({ ...settings, paymentSettings: { ...settings.paymentSettings, razorpayEnabled: e.target.checked } })} /> Razorpay Enabled</label>
      </section>
      <Button onClick={save}>Save All Settings</Button>
    </div>
  );
}
