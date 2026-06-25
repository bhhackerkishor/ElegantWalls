import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  pulse?: boolean;
}

export default function Badge({ children, className, pulse }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide rounded-full bg-accent-light text-accent border border-border',
        pulse && 'animate-pulse-badge',
        className
      )}
    >
      {children}
    </span>
  );
}
