'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatPrice } from '@/lib/utils';

interface Props {
  data: Array<{ category: string; revenue: number }>;
}

const COLORS = ['#B08D46', '#8B6914', '#D4B896', '#6B4423', '#C4A574'];

export default function CategoryChart({ data }: Props) {
  if (!data.length) {
    return <p className="text-sm text-foreground-secondary text-center py-20">No category data yet</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={data} dataKey="revenue" nameKey="category" cx="50%" cy="50%" outerRadius={90}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v) => formatPrice(Number(v))} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
