'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Container from '@/components/ui/Container';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import AuthModal from '@/components/AuthModal';
import ProductCard from '@/components/product/ProductCard';
import { Input, Textarea } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';

import type { Order, OrderItem, UserProfile, Product } from '@/types';

export default function ProfilePage() {
  const { isAuthenticated, getAuthHeaders, login, logout } = useAuth();
  const [tab, setTab] = useState<'orders' | 'wishlist' | 'address' | 'settings'>('orders');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [authOpen, setAuthOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetch('/api/users/profile', { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((data) => { if (data.success) setProfile(data.data); });

    fetch('/api/orders/history', { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((data) => { if (data.success) setOrders(data.data || []); });
  }, [isAuthenticated, getAuthHeaders]);

  useEffect(() => {
    if (!isAuthenticated || tab !== 'wishlist') return;
    fetch('/api/wishlist', { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then(async (data) => {
        if (data.success && data.data?.length) {
          const res = await fetch('/api/products');
          const prods = await res.json();
          const all: Product[] = prods.data?.products || prods.data || [];
          setWishlistProducts(all.filter((p) => data.data.includes(p._id)));
        }
      });
  }, [isAuthenticated, tab, getAuthHeaders]);

  const saveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    await fetch('/api/users/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(profile),
    });
    setSaving(false);
  };

  if (!isAuthenticated) {
    return (
      <>
        <Navbar />
        <Container className="pt-[140px] py-32 text-center max-w-xl">
          <div className="p-10 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-sm text-center">
            <h1 className="text-2xl font-bold text-[var(--foreground)] mb-3">Welcome Back</h1>
            <p className="text-sm text-[var(--foreground-secondary)] leading-relaxed mb-8">Please sign in to view your orders, saved items, and account settings.</p>
            <Button onClick={() => setAuthOpen(true)} className="w-full bg-[var(--foreground)] text-[var(--background)] py-4 rounded-full font-semibold">Sign In / Register</Button>
          </div>
        </Container>
        {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onLoginSuccess={login} />}
      </>
    );
  }

  const tabs = [
    { key: 'orders' as const, label: 'Order History', desc: 'Track or view past purchases' },
    { key: 'wishlist' as const, label: 'My Wishlist', desc: 'Your saved products' },
    { key: 'address' as const, label: 'Delivery Address', desc: 'Manage where your orders are sent' },
    { key: 'settings' as const, label: 'Preferences', desc: 'Email and notification settings' },
  ];

  const getStatusColor = (status: string) => {
    if (status === 'DELIVERED') return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    if (['CANCELLED', 'FAILED'].includes(status)) return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
  };

  return (
    <>
      <Navbar />
      <main className="pt-[130px] min-h-screen pb-24 transition-colors duration-300 bg-[var(--background)] text-[var(--foreground)]">
        <Container className="py-8">
          
          {/* Dashboard Profile Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 mb-10 border-b border-[var(--border)]">
            <div className="flex items-center gap-5">
              <div className="h-14 w-14 rounded-full bg-[var(--foreground)] text-[var(--background)] font-bold flex items-center justify-center text-lg shrink-0 font-mono">
                {profile?.name ? profile.name[0].toUpperCase() : profile?.email?.[0].toUpperCase()}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider font-bold mb-0.5 text-[var(--foreground-secondary)]">Your Profile</p>
                <h1 className="text-xl font-bold text-[var(--foreground)]">{profile?.name || profile?.email}</h1>
              </div>
            </div>
            <Button variant={"outline" as any } size="sm" onClick={logout} className="bg-transparent border-[var(--border)] hover:border-rose-500/50 hover:text-rose-600 text-xs py-2 px-4 rounded-full font-medium transition-colors">Sign Out</Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            
            {/* Sidebar Navigation Menu */}
            <div className="border border-[var(--border)] bg-[var(--card-bg)] rounded-2xl p-2 flex flex-col gap-1">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`w-full text-left px-5 py-4 transition-all flex flex-col gap-0.5 cursor-pointer rounded-xl ${
                    tab === t.key 
                      ? 'bg-[var(--background-secondary)] text-[var(--foreground)] border border-[var(--border)]' 
                      : 'bg-transparent border border-transparent text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--background-secondary)]/50'
                  }`}
                >
                  <span className="text-xs font-bold tracking-wider uppercase">{t.label}</span>
                  <span className="text-xs font-medium text-[var(--foreground-secondary)] hidden md:inline-block mt-0.5">{t.desc}</span>
                </button>
              ))}
            </div>

            {/* Right Side Content Canvas Panels */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Tab Content 1: Orders History list view */}
              {tab === 'orders' && (
                <div className="space-y-6">
                  {orders.length === 0 ? (
                    <div className="border border-[var(--border)] bg-[var(--card-bg)] rounded-2xl p-16 text-center">
                      <p className="text-sm font-medium text-[var(--foreground-secondary)] mb-6">You have not placed any orders yet.</p>
                      <Link href="/shop"><Button size="sm" className="rounded-full font-bold text-xs bg-[var(--foreground)] text-[var(--background)] px-6 py-3">Start Shopping</Button></Link>
                    </div>
                  ) : (
                    orders.map((order) => (
                      <div key={order._id} className="border border-[var(--border)] bg-[var(--card-bg)] rounded-2xl overflow-hidden shadow-sm">
                        
                        {/* Order Sub-header Metadata */}
                        <div className="p-6 bg-[var(--background-secondary)] border-b border-[var(--border)] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium text-[var(--foreground-secondary)]">
                          <div>
                            <p className="font-semibold text-[var(--foreground-secondary)] uppercase text-[10px] tracking-wider mb-0.5">Date Placed</p>
                            <p className="text-[var(--foreground)] font-bold">{new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-[var(--foreground-secondary)] uppercase text-[10px] tracking-wider mb-0.5">Total Paid</p>
                            <p className="text-[var(--foreground)] font-bold font-mono">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-[var(--foreground-secondary)] uppercase text-[10px] tracking-wider mb-0.5">Ship To</p>
                            <p className="text-[var(--foreground)] font-bold truncate" title={order.shippingDetails.name}>{order.shippingDetails.name}</p>
                          </div>
                          <div className="text-right flex flex-col items-end justify-center">
                            <p className="text-[var(--foreground)] font-mono font-bold text-xs">Order #{order.orderNumber}</p>
                            <Link
                              href={`/orders/${order._id}`}
                              className="inline-flex items-center gap-2 mt-2 px-5 h-9 rounded-full bg-[var(--foreground)] text-[var(--background)] text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:opacity-90 shadow-sm"
                            >
                              View Details <span>→</span>
                            </Link>
                          </div>
                        </div>

                        {/* Ordered Items Inner List */}
                        <div className="divide-y divide-[var(--border)]">
                          {order.items.map((item: OrderItem, itemIdx) => (
                            <div key={itemIdx} className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 justify-between hover:bg-[var(--background-secondary)]/30 transition-colors">
                              <div className="flex gap-5 items-start">
                                <div className="relative h-20 w-20 shrink-0 border border-[var(--border)] bg-[var(--background-secondary)] rounded-xl overflow-hidden">
                                  <Image 
                                    src={item.customImage || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=200'} 
                                    alt={item.title} 
                                    fill 
                                    className="object-cover"
                                    sizes="80px"
                                  />
                                </div>
                                <div className="space-y-1 text-sm">
                                  <h4 className="font-bold text-base text-[var(--foreground)] line-clamp-1">
                                    {item.title}
                                  </h4>
                                  <p className="text-xs font-medium text-[var(--foreground-secondary)]">
                                    {item.category} — Qty: <span className="font-bold font-mono">{item.quantity}</span>
                                  </p>
                                  <div className="flex flex-wrap gap-1.5 pt-1">
                                    <span className="bg-[var(--background-secondary)] border border-[var(--border)] text-[10px] font-medium px-2.5 py-0.5 rounded-full text-[var(--foreground-secondary)]">Size: {item.size}</span>
                                    <span className="bg-[var(--background-secondary)] border border-[var(--border)] text-[10px] font-medium px-2.5 py-0.5 rounded-full text-[var(--foreground-secondary)]">Frame: {item.frame}</span>
                                    <span className="bg-[var(--background-secondary)] border border-[var(--border)] text-[10px] font-medium px-2.5 py-0.5 rounded-full text-[var(--foreground-secondary)]">Material: {item.material}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Price and Badges */}
                              <div className="sm:text-right w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-[var(--border)] flex sm:flex-col justify-between sm:justify-center items-center sm:items-end gap-3">
                                <p className="font-bold font-mono text-sm text-[var(--foreground)]">₹{item.price.toLocaleString('en-IN')}</p>
                                <Badge className={`text-[10px] tracking-wider uppercase px-2.5 py-0.5 rounded-full border font-bold ${getStatusColor(order.deliveryStatus)}`}>
                                  {order.deliveryStatus}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Order Card Footer */}
                        <div className="p-4 bg-[var(--background-secondary)] border-t border-[var(--border)] text-xs font-medium text-[var(--foreground-secondary)] flex flex-wrap gap-4 items-center justify-between">
                          <p>Estimated Delivery: <span className="font-bold text-[var(--foreground)] ml-1">{order.deliveryTimeline || 'Processing'}</span></p>
                          {order.trackingNumber && (
                            <p className="tracking-wide">
                              {order.courierPartner || 'Logistics'}: <span className="text-[var(--foreground)] font-bold font-mono ml-1">{order.trackingNumber}</span>
                            </p>
                          )}
                        </div>

                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab Content 2: Wishlist Grid Workspace */}
              {tab === 'wishlist' && (
                <div className="border border-[var(--border)] bg-[var(--card-bg)] rounded-2xl p-8">
                  <h3 className="text-sm uppercase tracking-wider font-bold mb-6 text-[var(--foreground)]">Your Saved Products</h3>
                  {wishlistProducts.length === 0 ? (
                    <p className="text-xs font-medium text-[var(--foreground-secondary)]">Your wishlist is currently empty.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {wishlistProducts.map((p) => (
                        <ProductCard key={p._id} product={p} isWishlisted />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab Content 3: Address Form Control Box */}
              {tab === 'address' && profile && (
                <div className="border border-[var(--border)] bg-[var(--card-bg)] rounded-2xl p-8">
                  <h3 className="text-sm uppercase tracking-wider font-bold mb-1 text-[var(--foreground)]">Delivery Address</h3>
                  <p className="text-xs text-[var(--foreground-secondary)] font-medium mb-8">Save your default shipping info for faster checkout lines.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
                    <Input label="Receiver Full Name" value={profile.name || ''} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                    <Input label="Phone Number" value={profile.phone || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                    <div className="sm:col-span-2">
                      <Textarea label="Complete Home/Office Address" value={profile.address || ''} onChange={(e) => setProfile({ ...profile, address: e.target.value })} className="min-h-[100px]" />
                    </div>
                    <Input label="City" value={profile.city || ''} onChange={(e) => setProfile({ ...profile, city: e.target.value })} />
                    <Input label="State / Province" value={profile.state || ''} onChange={(e) => setProfile({ ...profile, state: e.target.value })} />
                    <Input label="Pincode / Postal Code" value={profile.zipCode || ''} onChange={(e) => setProfile({ ...profile, zipCode: e.target.value })} />
                  </div>
                  
                  <div className="mt-8 pt-5 border-t border-[var(--border)] flex justify-end">
                    <Button onClick={saveProfile} loading={saving} className="min-w-[180px] rounded-full bg-[var(--foreground)] text-[var(--background)] py-3 font-bold text-xs">
                      Save Address Details
                    </Button>
                  </div>
                </div>
              )}

              {/* Tab Content 4: Notification Settings rules options */}
              {tab === 'settings' && profile && (
                <div className="border border-[var(--border)] bg-[var(--card-bg)] rounded-2xl p-8">
                  <h3 className="text-sm uppercase tracking-wider font-bold mb-1 text-[var(--foreground)]">Email Preferences</h3>
                  <p className="text-xs text-[var(--foreground-secondary)] font-medium mb-8">Manage what notifications and updates you get in your mailbox.</p>
                  
                  <div className="p-5 border border-[var(--border)] bg-[var(--background-secondary)] rounded-2xl">
                    <label className="flex items-start gap-4 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-0 cursor-pointer"
                        checked={!!profile.marketingEmails}
                        onChange={(e) => setProfile({ ...profile, marketingEmails: e.target.checked })}
                      />
                      <div className="text-sm">
                        <span className="font-bold tracking-wide block text-[var(--foreground)]">Newsletters & Offers</span>
                        <span className="text-xs font-medium text-[var(--foreground-secondary)] block mt-1 leading-relaxed">Receive alerts about special sales, discount codes, custom restocks, and store arrivals.</span>
                      </div>
                    </label>
                  </div>

                  <div className="mt-8 pt-5 border-t border-[var(--border)] flex justify-end">
                    <Button onClick={saveProfile} loading={saving} className="min-w-[180px] rounded-full bg-[var(--foreground)] text-[var(--background)] py-3 font-bold text-xs">
                      Save Preferences
                    </Button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}