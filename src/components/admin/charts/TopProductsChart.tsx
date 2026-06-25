'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  data: Array<{ title: string; qty: number; revenue: number }>;
}

export default function TopProductsChart({ data }: Props) {
  const chartData = data.slice(0, 8).map((d) => ({
    name: d.title.length > 20 ? d.title.slice(0, 18) + '…' : d.title,
    qty: d.qty,
  }));

  if (!chartData.length) {
    return <p className="text-sm text-foreground-secondary text-center py-20">No sales data yet</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
        <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" height={60} />
        <YAxis tick={{ fontSize: 10 }} />
        <Tooltip />
        <Bar dataKey="qty" fill="#B08D46" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
