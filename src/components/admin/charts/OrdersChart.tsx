'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  data: Array<{ status: string; count: number }>;
}

const LABELS: Record<string, string> = {
  PLACED: 'Placed', CONFIRMED: 'Confirmed', PROCESSING: 'Processing', PRINTING: 'Printing',
  FRAMING: 'Framing', QUALITY_CHECK: 'QC', PACKED: 'Packed', SHIPPED: 'Shipped',
  OUT_FOR_DELIVERY: 'Out for Delivery', DELIVERED: 'Delivered', CANCELLED: 'Cancelled',
};

export default function OrdersChart({ data }: Props) {
  const chartData = data.filter((d) => d.count > 0).map((d) => ({
    status: LABELS[d.status] || d.status,
    count: d.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
        <XAxis type="number" tick={{ fontSize: 10 }} />
        <YAxis type="category" dataKey="status" tick={{ fontSize: 10 }} width={90} />
        <Tooltip />
        <Bar dataKey="count" fill="#B08D46" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
