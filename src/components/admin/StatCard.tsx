'use client';

import { memo } from 'react';
import type { IconType } from 'react-icons';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: IconType;
  trend?: number;
  className?: string;
}

function StatCard({ label, value, icon: Icon, trend, className = '' }: StatCardProps) {
  return (
    <div className={`p-5 bg-card-bg border border-border rounded-xl ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-foreground-secondary">{label}</p>
          <p className="text-2xl font-bold mt-1 tabular-nums">{value}</p>
          {trend !== undefined && (
            <p className={`flex items-center gap-1 text-xs mt-1 ${trend >= 0 ? 'text-success' : 'text-error'}`}>
              {trend >= 0 ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
              {Math.abs(trend)}%
            </p>
          )}
        </div>
        {Icon && (
          <div className="p-2.5 rounded-lg bg-accent-light text-accent">
            <Icon size={18} />
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(StatCard);
