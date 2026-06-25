'use client';

import type { ReactNode } from 'react';
import AdminAuthGate from './AdminAuthGate';
import { AdminShell } from './AdminShell';
import { ToastProvider } from './ToastProvider';

export default function AdminLayoutClient({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AdminAuthGate>
        <AdminShell>{children}</AdminShell>
      </AdminAuthGate>
    </ToastProvider>
  );
}
