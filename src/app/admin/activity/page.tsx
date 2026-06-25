'use client';

import { useEffect, useState } from 'react';
import { DataTable } from '@/components/admin/ConfirmDialog';
import { useAdminApi } from '@/hooks/useAdminApi';

interface AuditLog {
  _id: string;
  action: string;
  entity: string;
  entityId?: string;
  adminEmail: string;
  ipAddress?: string;
  createdAt: string;
}

export default function AdminActivityPage() {
  const { get } = useAdminApi();
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    get<{ logs: AuditLog[] }>('/api/admin/activity').then((r) => {
      if (r.success && r.data) setLogs(r.data.logs);
    });
  }, [get]);

  return (
    <DataTable headers={['Action', 'Entity', 'Admin', 'IP', 'Date']}>
      {logs.map((l) => (
        <tr key={l._id}>
          <td className="px-4 py-3 font-medium">{l.action}</td>
          <td className="px-4 py-3 text-sm">{l.entity}{l.entityId ? ` · ${l.entityId.slice(-6)}` : ''}</td>
          <td className="px-4 py-3 text-sm">{l.adminEmail}</td>
          <td className="px-4 py-3 text-xs font-mono">{l.ipAddress || '—'}</td>
          <td className="px-4 py-3 text-sm">{new Date(l.createdAt).toLocaleString()}</td>
        </tr>
      ))}
    </DataTable>
  );
}
