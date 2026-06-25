'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import { useAdminApi } from '@/hooks/useAdminApi';
import { useToast } from '@/components/admin/ToastProvider';

interface Section {
  _id: string;
  key: string;
  label: string;
  enabled: boolean;
  sortOrder: number;
}

export default function AdminHomepagePage() {
  const { get, put } = useAdminApi();
  const { toast } = useToast();
  const [sections, setSections] = useState<Section[]>([]);

  useEffect(() => {
    get<Section[]>('/api/homepage-sections').then((r) => { if (r.success && r.data) setSections(r.data); });
  }, [get]);

  const move = (index: number, dir: -1 | 1) => {
    const next = [...sections];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    next.forEach((s, i) => { s.sortOrder = i; });
    setSections(next);
  };

  const save = async () => {
    await put('/api/homepage-sections', { sections });
    toast('Homepage layout saved');
  };

  return (
    <div className="max-w-lg space-y-3">
      <p className="text-sm text-foreground-secondary">Drag sections to reorder your homepage layout.</p>
      {sections.map((s, i) => (
        <div key={s.key} className="flex items-center gap-3 p-4 bg-card-bg border border-border rounded-xl">
          <span className="text-foreground-secondary w-6">{i + 1}</span>
          <div className="flex-1"><p className="font-medium">{s.label}</p><p className="text-xs text-foreground-secondary">{s.key}</p></div>
          <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={s.enabled} onChange={() => setSections(sections.map((sec) => sec.key === s.key ? { ...sec, enabled: !sec.enabled } : sec))} /> Show</label>
          <Button size="sm" variant="ghost" onClick={() => move(i, -1)}>↑</Button>
          <Button size="sm" variant="ghost" onClick={() => move(i, 1)}>↓</Button>
        </div>
      ))}
      <Button onClick={save}>Save Layout</Button>
    </div>
  );
}
