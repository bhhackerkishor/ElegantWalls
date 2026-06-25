'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatPrice } from '@/lib/utils';

interface Props {
  data: Array<{ date: string; revenue: number; orders: number }>;
}

export default function RevenueChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#B08D46" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#B08D46" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
        <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
        <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${v / 1000}k`} />
        <Tooltip formatter={(v) => formatPrice(Number(v))} labelFormatter={(l) => `Date: ${l}`} />
        <Area type="monotone" dataKey="revenue" stroke="#B08D46" fill="url(#revenueGrad)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
