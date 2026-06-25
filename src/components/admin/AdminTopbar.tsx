'use client';

import { memo, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiSearch, FiBell, FiLogOut, FiUser, FiCommand ,FiSun, FiMoon,} from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import { useAdminApi } from '@/hooks/useAdminApi';
import { getAdminPageTitle } from '@/lib/admin/nav';
import Button from '@/components/ui/Button';
import { useTheme } from '@/context/ThemeContext';
interface AdminTopbarProps {
  pathname: string;
  sidebarCollapsed: boolean;
  onOpenCommand: () => void;
}

function AdminTopbar({ pathname, sidebarCollapsed, onOpenCommand }: AdminTopbarProps) {
  const { email, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { get } = useAdminApi();
  const router = useRouter();
  const [unread, setUnread] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);

  const loadNotifications = useCallback(async () => {
    const res = await get<{ unreadCount: number }>('/api/notifications?unread=true');
    if (res.success && res.data) setUnread(res.data.unreadCount);
  }, [get]);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  const crumbs = pathname
    .replace('/admin', '')
    .split('/')
    .filter(Boolean);

  return (
    <header
      className="sticky top-0 z-30 h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-6"
      style={{ marginLeft: sidebarCollapsed ? 0 : 0 }}
    >
      <div>
        <h1 className="text-lg font-bold">{getAdminPageTitle(pathname)}</h1>
        {crumbs.length > 0 && (
          <nav className="text-xs text-foreground-secondary flex items-center gap-1 mt-0.5">
            <Link href="/admin" className="hover:text-accent">Admin</Link>
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1">
                <span>/</span>
                <span className="capitalize">{c.replace(/-/g, ' ')}</span>
              </span>
            ))}
          </nav>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 bg-transparent border-none cursor-pointer text-foreground"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <FiSun size={22} /> : <FiMoon size={22} />}
        </button>
        <button
          type="button"
          onClick={onOpenCommand}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-background-secondary text-sm text-foreground-secondary hover:border-accent cursor-pointer"
        >
          <FiSearch size={14} />
          <span>Search…</span>
          <kbd className="ml-2 px-1.5 py-0.5 rounded bg-background border border-border text-[10px] font-mono">
            <FiCommand size={10} className="inline" />K
          </kbd>
        </button>

        <Link
          href="/admin/notifications"
          className="relative p-2 rounded-lg hover:bg-background-secondary text-foreground-secondary"
        >
          <FiBell size={18} />
          {unread > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-error text-white text-[10px] flex items-center justify-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Link>

        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-background-secondary cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-accent-light text-accent flex items-center justify-center">
              <FiUser size={16} />
            </div>
            <span className="hidden md:block text-sm max-w-[140px] truncate">{email}</span>
          </button>
          {profileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-48 bg-background border border-border rounded-lg shadow-xl z-50 py-1">
                <button
                  type="button"
                  onClick={() => { router.push('/admin/settings'); setProfileOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-background-secondary cursor-pointer"
                >
                  Settings
                </button>
                <button
                  type="button"
                  onClick={() => { logout(); router.push('/'); }}
                  className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error/5 flex items-center gap-2 cursor-pointer"
                >
                  <FiLogOut size={14} /> Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default memo(AdminTopbar);
