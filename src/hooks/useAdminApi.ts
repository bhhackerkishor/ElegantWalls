'use client';

import { useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function useAdminApi() {
  const { getAuthHeaders } = useAuth();

  const headers = useCallback(
    () => ({ ...getAuthHeaders(), 'Content-Type': 'application/json' }),
    [getAuthHeaders]
  );

  const get = useCallback(
    async <T,>(url: string): Promise<{ success: boolean; data?: T; error?: string }> => {
      const res = await fetch(url, { headers: headers() });
      return res.json();
    },
    [headers]
  );

  const post = useCallback(
    async <T,>(url: string, body: unknown): Promise<{ success: boolean; data?: T; error?: string }> => {
      const res = await fetch(url, { method: 'POST', headers: headers(), body: JSON.stringify(body) });
      return res.json();
    },
    [headers]
  );

  const put = useCallback(
    async <T,>(url: string, body: unknown): Promise<{ success: boolean; data?: T; error?: string }> => {
      const res = await fetch(url, { method: 'PUT', headers: headers(), body: JSON.stringify(body) });
      return res.json();
    },
    [headers]
  );

  const del = useCallback(
    async (url: string) => {
      const res = await fetch(url, { method: 'DELETE', headers: headers() });
      return res.json();
    },
    [headers]
  );

  const exportCsv = useCallback(
    async (type: string) => {
      const res = await fetch(`/api/admin/export?type=${type}`, { headers: getAuthHeaders() });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [getAuthHeaders]
  );

  return { get, post, put, del, exportCsv, headers };
}
