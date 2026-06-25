'use client';

import { useEffect, useRef } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { formatPrice } from '@/lib/utils';

interface AnimatedPriceProps {
  value: number;
  className?: string;
  label?: string;
}

export default function AnimatedPrice({ value, className = '', label }: AnimatedPriceProps) {
  const spring = useSpring(value, { stiffness: 120, damping: 20 });
  const display = useTransform(spring, (v) => formatPrice(Math.round(v)));
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    const unsub = display.on('change', (v) => {
      if (ref.current) ref.current.textContent = v;
    });
    return unsub;
  }, [display]);

  return (
    <span className={className}>
      {label && <span className="text-xs text-foreground-secondary block mb-0.5">{label}</span>}
      <motion.span ref={ref} className="tabular-nums">
        {formatPrice(value)}
      </motion.span>
    </span>
  );
}
