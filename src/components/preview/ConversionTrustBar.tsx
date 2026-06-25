'use client';

import { memo } from 'react';
import { FiUsers, FiAward, FiShield, FiTruck } from 'react-icons/fi';

const TRUST_ITEMS = [
  { icon: FiUsers, text: '300+ Happy Customers' },
  { icon: FiAward, text: 'Premium Quality Materials' },
  { icon: FiShield, text: 'Secure Checkout' },
  { icon: FiTruck, text: 'Free Shipping Above ₹999' },
] as const;

function ConversionTrustBar() {
  return (
    <div className="grid grid-cols-2 gap-2 mt-4">
      {TRUST_ITEMS.map(({ icon: Icon, text }) => (
        <div
          key={text}
          className="flex items-center gap-2 px-3 py-2 rounded-sm bg-accent-light/60 border border-border text-xs text-foreground-secondary"
        >
          <Icon className="shrink-0 text-accent" size={14} />
          <span>{text}</span>
        </div>
      ))}
    </div>
  );
}

export default memo(ConversionTrustBar);
