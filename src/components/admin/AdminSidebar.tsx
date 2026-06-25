'use client';

import { memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiChevronLeft, FiChevronRight, FiExternalLink } from 'react-icons/fi';
import { ADMIN_NAV } from '@/lib/admin/nav';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r border-[var(--border)] bg-[var(--card-bg)] flex flex-col transition-all duration-300 ease-in-out',
        collapsed ? 'w-[68px]' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-[var(--border)] shrink-0 bg-[var(--background-secondary)]/50">
        {!collapsed && (
          <Link href="/admin" className="font-display font-bold text-base tracking-tight text-[var(--foreground)]">
            Elegant <span className="text-[var(--accent)] font-semibold">Admin</span>
          </Link>
        )}
        <button
          type="button"
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-[var(--background-secondary)] cursor-pointer text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors ml-auto"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <FiChevronRight size={16} /> : <FiChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-7 custom-scrollbar">
        {ADMIN_NAV.map((group) => (
          <div key={group.section} className="space-y-2">
            {!collapsed && (
              <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-[var(--foreground-secondary)] opacity-50">
                {group.section}
              </p>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active =
                  item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-200 group relative',
                        active
                          ? 'bg-[var(--background-secondary)] text-[var(--foreground)] border-l-2 border-[var(--accent)] rounded-l-none pl-2.5'
                          : 'text-[var(--foreground-secondary)] hover:bg-[var(--background-secondary)]/60 hover:text-[var(--foreground)]'
                      )}
                    >
                      <Icon 
                        size={16} 
                        className={cn(
                          'shrink-0 transition-transform duration-200 group-hover:scale-105',
                          active ? 'text-[var(--accent)]' : 'text-[var(--foreground-secondary)] group-hover:text-[var(--foreground)]'
                        )} 
                      />
                      {!collapsed && <span className="truncate text-[11px] font-medium tracking-wide">{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Sidebar Footer Link */}
      <div className="p-3 border-t border-[var(--border)] shrink-0 bg-[var(--background-secondary)]/30">
        <Link
          href="/"
          target="_blank"
          className={cn(
            'flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-[var(--foreground-secondary)] hover:bg-[var(--background-secondary)] hover:text-[var(--foreground)] transition-colors',
            collapsed && 'justify-center'
          )}
        >
          <FiExternalLink size={14} className="shrink-0" />
          {!collapsed && <span>View Store</span>}
        </Link>
      </div>
    </aside>
  );
}

export default memo(AdminSidebar);