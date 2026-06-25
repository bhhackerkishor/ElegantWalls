'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Container from '@/components/ui/Container';
import Badge from '@/components/ui/Badge';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/hooks/useAuth';
import type { Order } from '@/types';
import { formatPrice } from '@/lib/utils';

export default function OrdersPage() {
  const { isAuthenticated, getAuthHeaders, login } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    fetch('/api/orders/history', { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((data) => { if (data.success) setOrders(data.data || []); })
      .finally(() => setLoading(false));
  }, [isAuthenticated, getAuthHeaders]);

  if (!isAuthenticated) {
    return (
      <>
        <Navbar />
        <Container className="pt-[115px] py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Login to view your orders</h1>
          <button onClick={() => setAuthOpen(true)} className="text-accent font-semibold bg-transparent border-none cursor-pointer">
            Sign In
          </button>
        </Container>
        {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onLoginSuccess={login} />}
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-[115px] min-h-screen pb-16">
        <Container className="py-10">
          <Badge>My Orders</Badge>
          <h1 className="text-3xl font-display font-bold mt-2 mb-8">Order History</h1>

          {loading ? (
            <p className="text-center py-10">Loading...</p>
          ) : orders.length === 0 ? (
            <p className="text-center py-10 text-foreground-secondary">No orders yet. <Link href="/" className="text-accent">Start shopping</Link></p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Link
                  key={order._id}
                  href={`/orders/${order._id}`}
                  className="block p-6 bg-card-bg border border-border rounded-lg hover:border-accent transition-colors"
                >
                  <div className="flex flex-wrap justify-between gap-4">
                    <div>
                      <p className="font-bold">{order.orderNumber}</p>
                      <p className="text-sm text-foreground-secondary">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-accent">{formatPrice(order.totalAmount)}</p>
                      <p className="text-xs uppercase">{order.deliveryStatus.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </>
  );
}
