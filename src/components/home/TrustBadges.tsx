'use client';

import { FiTruck, FiShield, FiRefreshCw, FiAward } from 'react-icons/fi';
import Container from '@/components/ui/Container';
import { TRUST_BADGES } from '@/lib/constants';

const iconMap = {
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiAward,
};

export default function TrustBadges() {
  return (
    <section className="py-12 border-y border-border bg-background-secondary">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {TRUST_BADGES.map((badge) => {
            const Icon = iconMap[badge.icon as keyof typeof iconMap];
            return (
              <div key={badge.label} className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-light text-accent">
                  <Icon size={22} />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{badge.label}</p>
                  <p className="text-xs text-foreground-secondary">{badge.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
