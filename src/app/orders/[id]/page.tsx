'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowLeft, FiDownload, FiMessageSquare, FiAlertCircle, FiHelpCircle, FiTruck } from 'react-icons/fi';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Container from '@/components/ui/Container';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import TrackingTimeline from '@/components/order/TrackingTimeline';
import { useAuth } from '@/hooks/useAuth';
import type { Order } from '@/types';
import { formatPrice } from '@/lib/utils';
import TicketChatPanel from '@/components/support/TicketChatPanel';

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { isAuthenticated, getAuthHeaders } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelReason, setCancelReason] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketLoading, setTicketLoading] = useState(false);
  const [showChatHub, setShowChatHub] = useState(false);

  useEffect(() => {
    fetch(`/api/orders?id=${id}`)
      .then((r) => r.json())
      .then((data) => { if (data.success) setOrder(data.data); })
      .finally(() => setLoading(false));
  }, [id]);

  const requestCancel = async () => {
    if (!cancelReason.trim()) return setActionMsg('Please write a reason for cancellation.');
    const res = await fetch('/api/orders/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ orderId: id, reason: cancelReason }),
    });
    const data = await res.json();
    setActionMsg(data.success ? 'Your cancellation request has been sent successfully.' : data.error);
    if (data.success) setOrder(data.data);
  };

  const requestReturn = async () => {
    if (!returnReason.trim()) return setActionMsg('Please give a reason for your return.');
    const res = await fetch('/api/orders/return', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ orderId: id, reason: returnReason }),
    });
    const data = await res.json();
    setActionMsg(data.success ? 'Your return request has been submitted for review.' : data.error);
    if (data.success) setOrder(data.data);
  };

  const raiseOrderTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return setActionMsg('Please fill in all information fields.');
    setTicketLoading(true);
    setActionMsg('');

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ subject: ticketSubject, message: ticketMessage, orderId: order?._id }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg(`Support ticket #${data.data.ticketNumber} has been created.`);
        setTicketSubject('');
        setTicketMessage('');
      } else {
        setActionMsg(data.error || 'Failed to create a support ticket.');
      }
    } catch {
      setActionMsg('A network error occurred. Please try again.');
    } finally {
      setTicketLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="pt-[140px] min-h-screen flex flex-col items-center justify-center bg-[var(--background)]">
          <div className="h-6 w-6 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin mb-4" />
          <p className="text-sm font-medium tracking-wide text-[var(--foreground-secondary)]">Loading your order details...</p>
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Navbar />
        <Container className="pt-[160px] pb-32 text-center max-w-xl">
          <div className="p-12 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-sm">
            <FiAlertCircle className="text-[var(--foreground-secondary)] opacity-60 mb-4 mx-auto" size={32} />
            <h1 className="text-2xl font-bold mb-3 text-[var(--foreground)]">Order Not Found</h1>
            <p className="text-sm text-[var(--foreground-secondary)] leading-relaxed mb-8">We could not find an active order linked with this reference code.</p>
            <Link href="/profile" className="w-full">
              <Button size="sm" className="w-full py-4 bg-[var(--foreground)] text-[var(--background)] font-semibold rounded-full">Return to Dashboard</Button>
            </Link>
          </div>
        </Container>
      </>
    );
  }

  const getStatusBadgeStyle = (status: string) => {
    if (status === 'DELIVERED') return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    if (['CANCELLED', 'FAILED'].includes(status)) return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
  };

  return (
    <>
      <Navbar />
      <main className="pt-[140px] min-h-screen pb-32 bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
        <Container>
          
          {/* Top Actions Header */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/profile" className="group text-xs font-semibold uppercase tracking-wider text-[var(--foreground-secondary)] hover:text-[var(--foreground)] flex items-center gap-2 transition-colors">
              <FiArrowLeft className="group-hover:-translate-x-0.5 transition-transform" />
              Back to My Account
            </Link>
            
            <a href={`/api/invoice?orderId=${order._id}`} target="_blank" rel="noopener noreferrer" className="inline-flex">
              <button className="px-5 py-2.5 border border-[var(--border)] rounded-full text-xs font-medium text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:border-[var(--foreground)] bg-transparent transition-all duration-300 flex items-center gap-2 cursor-pointer">
                <FiDownload size={14} />
                Download Invoice
              </button>
            </a>
          </div>

          {/* Core App Header Style Order Summary Card */}
          <div className="p-8 md:p-12 mb-12 bg-[var(--background-secondary)] border border-[var(--border)] rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-xs uppercase tracking-wider text-[var(--foreground-secondary)] font-semibold">Order Status</span>
                <Badge className={`text-xs uppercase tracking-wider px-3 py-0.5 rounded-full border font-bold ${getStatusBadgeStyle(order.deliveryStatus)}`}>
                  {order.deliveryStatus}
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-display text-[var(--foreground)]">
                Order #{order.orderNumber}
              </h1>
              <p className="text-sm font-medium text-[var(--foreground-secondary)]">
                Placed on <span className="text-[var(--foreground)]">{new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</span> — Estimated Delivery: <span className="text-[var(--accent)] font-semibold">{order.deliveryTimeline || 'Processing'}</span>
              </p>
            </div>
            
            <div className="text-left md:text-right pt-6 md:pt-0 border-t md:border-t-0 border-[var(--border)] w-full md:w-auto">
              <span className="text-xs uppercase tracking-wider text-[var(--foreground-secondary)] block mb-1 font-semibold">Total Price</span>
              <p className="text-2xl md:text-3xl font-bold text-[var(--accent)]">
                ₹{order.totalAmount.toLocaleString('en-IN')}
              </p>
              <span className="text-xs text-[var(--foreground-secondary)] block mt-0.5 font-medium">Includes all taxes & GST</span>
            </div>
          </div>

          {/* 12-Column Responsive Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Main Dashboard Layout Area (8 Columns) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Product Layout Items Block */}
              <div className="border border-[var(--border)] rounded-2xl bg-[var(--card-bg)] overflow-hidden">
                <div className="px-8 py-5 border-b border-[var(--border)] flex justify-between items-center bg-[var(--background-secondary)]">
                  <h3 className="text-sm uppercase tracking-wider font-bold text-[var(--foreground)]">
                    Items In Your Order
                  </h3>
                  <span className="text-xs font-semibold text-[var(--foreground-secondary)]">
                    ({order.items.reduce((acc, i) => acc + i.quantity, 0)} {order.items.reduce((acc, i) => acc + i.quantity, 0) === 1 ? 'Item' : 'Items'})
                  </span>
                </div>
                
                <div className="divide-y divide-[var(--border)]">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="p-8 flex flex-col sm:flex-row items-start gap-8 justify-between hover:bg-[var(--background-secondary)] opacity-95 transition-colors duration-300">
                      <div className="flex flex-col sm:flex-row items-start gap-6">
                        <div className="relative h-28 w-24 shrink-0 border border-[var(--border)] bg-[var(--background-secondary)] rounded-xl overflow-hidden shadow-inner">
                          <Image
                            src={item.customImage || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=300'}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="120px"
                          />
                        </div>
                        <div className="space-y-2 text-sm">
                          <span className="text-xs font-semibold uppercase text-[var(--accent)] block tracking-wider">{item.category}</span>
                          <h4 className="text-lg font-bold text-[var(--foreground)] leading-snug">{item.title}</h4>
                          <p className="text-xs font-medium text-[var(--foreground-secondary)]">SKU: {item.sku || 'N/A'}</p>
                          
                          <div className="flex flex-wrap gap-2 pt-1">
                            <span className="bg-[var(--background-secondary)] text-[var(--foreground-secondary)] border border-[var(--border)] text-xs px-3 py-1 rounded-full font-medium">Size: {item.size}</span>
                            <span className="bg-[var(--background-secondary)] text-[var(--foreground-secondary)] border border-[var(--border)] text-xs px-3 py-1 rounded-full font-medium">Frame: {item.frame}</span>
                            <span className="bg-[var(--background-secondary)] text-[var(--foreground-secondary)] border border-[var(--border)] text-xs px-3 py-1 rounded-full font-medium">Material: {item.material}</span>
                            {item.orientation && (
                              <span className="bg-[var(--background-secondary)] text-[var(--foreground-secondary)] border border-[var(--border)] text-xs px-3 py-1 rounded-full font-medium">Orientation: {item.orientation}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="sm:text-right w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-[var(--border)] text-right flex sm:flex-col justify-between sm:justify-start items-end gap-1 shrink-0">
                        <span className="text-xs uppercase tracking-wider text-[var(--foreground-secondary)] sm:hidden font-semibold">Price</span>
                        <div className="space-y-0.5">
                          <p className="text-base font-bold text-[var(--foreground)]">{formatPrice(item.price * item.quantity)}</p>
                          <p className="text-xs font-medium text-[var(--foreground-secondary)] font-mono">
                            {formatPrice(item.price)} × {item.quantity}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Progress Bar Section */}
              <div className="border border-[var(--border)] rounded-2xl bg-[var(--card-bg)] p-8">
                <div className="flex items-center gap-3 mb-6 border-b border-[var(--border)] pb-4">
                  <FiTruck className="text-[var(--accent)]" size={18} />
                  <h3 className="text-sm uppercase tracking-wider font-bold text-[var(--foreground)]">Shipment Status</h3>
                </div>
                <TrackingTimeline
                  deliveryStatus={order.deliveryStatus}
                  trackingEvents={order.trackingEvents}
                  trackingNumber={order.trackingNumber}
                  courierPartner={order.courierPartner}
                />
              </div>

            </div>

            {/* Right Side Sidebar Workspace Panel Layout (4 Columns) */}
            <div className="lg:col-span-4 space-y-8">
              
              {/* Shipping Address Container Component */}
              <div className="border border-[var(--border)] rounded-2xl bg-[var(--card-bg)] p-6 space-y-5">
                <div>
                  <h3 className="text-sm uppercase tracking-wider font-bold text-[var(--foreground)] border-b border-[var(--border)] pb-3 mb-4">
                    Shipping Address
                  </h3>
                  <div className="text-sm space-y-1.5 text-[var(--foreground-secondary)] leading-relaxed font-medium">
                    <p className="font-bold text-[var(--foreground)] text-base mb-1">{order.shippingDetails.name}</p>
                    <p>{order.shippingDetails.address}</p>
                    <p>{order.shippingDetails.city}, {order.shippingDetails.state} – <span className="font-bold text-[var(--foreground)]">{order.shippingDetails.pincode}</span></p>
                    <p className="pt-2 text-xs font-semibold text-[var(--foreground-secondary)]">
                      Phone Number: {order.shippingDetails.phone}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--border)]">
                  <h3 className="text-xs uppercase tracking-wider text-[var(--foreground-secondary)] mb-2 font-bold">
                    Payment Method
                  </h3>
                  <div className="text-xs space-y-1.5 font-medium">
                    <p className="text-[var(--foreground)]">
                      Method: <span className="font-semibold">{order.paymentMethod === 'razorpay' ? 'Online Payment' : 'Cash on Delivery (COD)'}</span>
                    </p>
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="text-[var(--foreground-secondary)]">Payment Status:</span>
                      <span className={`inline-block h-2 w-2 rounded-full ${order.paymentStatus === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <span className="uppercase text-xs font-bold text-[var(--foreground)]">{order.paymentStatus}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Breakdown Ledger Invoice Box */}
              <div className="border border-[var(--border)] rounded-2xl bg-[var(--card-bg)] p-6">
                <h3 className="text-sm uppercase tracking-wider font-bold text-[var(--foreground)] border-b border-[var(--border)] pb-3 mb-4">
                  Price Breakdown
                </h3>
                <div className="text-sm space-y-3 font-medium text-[var(--foreground-secondary)]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-[var(--foreground)]">{formatPrice(order.subtotal || 0)}</span>
                  </div>
                  
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                      <span>Discount Applied ({order.couponApplied || 'PROMO'})</span>
                      <span>-{formatPrice(order.discountAmount)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span>Tax (GST 18%)</span>
                    <span className="text-[var(--foreground)]">{formatPrice(order.gst || 0)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Shipping Charges</span>
                    <span className="text-[var(--foreground)]">
                      {order.shippingFee === 0 ? (
                        <span className="text-[10px] font-bold tracking-wider text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase">Free</span>
                      ) : (
                        formatPrice(order.shippingFee)
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-lg font-bold text-[var(--foreground)] pt-4 border-t border-[var(--border)] border-dashed">
                    <span>Total Amount</span>
                    <span className="text-[var(--accent)] font-mono">{formatPrice(order.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Customer Care Service System Support Boxes */}
              {isAuthenticated && (
                <div className="space-y-6">
                  
                  {/* Interactive Live Message Chat Panel Box */}
                  <div className="border border-[var(--border)] rounded-2xl bg-[var(--card-bg)] p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <FiMessageSquare className="text-[var(--accent)]" size={16} />
                      <h3 className="text-sm uppercase tracking-wider font-bold text-[var(--foreground)]">Customer Support Chat</h3>
                    </div>
                    <p className="text-xs text-[var(--foreground-secondary)] leading-relaxed mb-4">View your messages or chat directly with our support team about this order.</p>
                    
                    {!showChatHub ? (
                      <Button size="sm" variant={"outline" as any} className="w-full py-2.5 rounded-full border border-[var(--border)] bg-transparent hover:bg-[var(--background-secondary)] font-semibold text-xs text-[var(--foreground)]" onClick={() => setShowChatHub(true)}>
                        Open Support Chat Logs
                      </Button>
                    ) : (
                      <div className="pt-2">
                        <TicketChatPanel 
                          orderId={order._id} 
                          onClose={() => setShowChatHub(false)}
                           getAuthHeaders={() => getAuthHeaders() as Record<string, string>}
                        />
                      </div>
                    )}
                  </div>

                  {/* Create support dispute request ticket */}
                  <div className="border border-[var(--border)] rounded-2xl bg-[var(--card-bg)] p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <FiHelpCircle className="text-[var(--accent)]" size={16} />
                      <h3 className="text-sm uppercase tracking-wider font-bold text-[var(--foreground)]">Open a Support Ticket</h3>
                    </div>
                    <p className="text-xs text-[var(--foreground-secondary)] leading-relaxed mb-4">Have a problem with quality issues, or damaged parts? Let us know immediately.</p>
                    
                    <form onSubmit={raiseOrderTicket} className="space-y-3 text-sm">
                      <input 
                        type="text"
                        value={ticketSubject}
                        onChange={(e) => setTicketSubject(e.target.value)}
                        placeholder="Subject (e.g., Frame arrives broken/dented)"
                        className="w-full text-xs p-3 rounded-xl border border-[var(--border)] bg-transparent outline-none text-[var(--foreground)] focus:border-[var(--accent)]"
                      />
                      <textarea 
                        value={ticketMessage} 
                        onChange={(e) => setTicketMessage(e.target.value)} 
                        placeholder="Describe your issue in plain detail here..." 
                        rows={3} 
                        className="w-full text-xs p-3 rounded-xl border border-[var(--border)] bg-transparent outline-none text-[var(--foreground)] focus:border-[var(--accent)] resize-none"
                      />
                      <Button size="sm" type="submit" loading={ticketLoading} className="w-full rounded-full bg-[var(--foreground)] text-[var(--background)] py-2.5 font-bold text-xs hover:opacity-90">
                        Submit Support Ticket
                      </Button>
                    </form>
                  </div>

                  {/* Cancel Order Request layout configuration block */}
                  {!order.cancellationRequest?.isRequested && order.deliveryStatus !== 'DELIVERED' && order.deliveryStatus !== 'CANCELLED' && (
                    <div className="border border-[var(--border)] rounded-2xl bg-[var(--card-bg)] p-6">
                      <h3 className="text-sm uppercase tracking-wider font-bold text-[var(--foreground)] mb-1">Cancel Order</h3>
                      <p className="text-xs text-[var(--foreground-secondary)] leading-relaxed mb-4">You can cancel this order only if it has not been shipped out yet.</p>
                      <div className="space-y-3">
                        <textarea 
                          value={cancelReason} 
                          onChange={(e) => setCancelReason(e.target.value)} 
                          placeholder="Tell us why you want to cancel this order..." 
                          rows={2} 
                          className="w-full text-xs p-3 rounded-xl border border-[var(--border)] bg-transparent outline-none text-[var(--foreground)] focus:border-[var(--accent)] resize-none"
                        />
                        <Button size="sm" variant="danger" className="w-full rounded-full bg-rose-600 hover:bg-rose-700 text-white py-2.5 border-none font-bold text-xs" onClick={requestCancel}>
                          Confirm Order Cancellation
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Returns System Request layout block */}
                  {order.deliveryStatus === 'DELIVERED' && !order.returnRequest?.isRequested && (
                    <div className="border border-[var(--border)] rounded-2xl bg-[var(--card-bg)] p-6">
                      <h3 className="text-sm uppercase tracking-wider font-bold text-[var(--foreground)] mb-1">Return Items</h3>
                      <p className="text-xs text-[var(--foreground-secondary)] leading-relaxed mb-4">If you are unhappy with the quality, you can submit a return claim request within our return guidelines.</p>
                      <div className="space-y-3">
                        <textarea 
                          value={returnReason} 
                          onChange={(e) => setReturnReason(e.target.value)} 
                          placeholder="Tell us why you want to return this product..." 
                          rows={2} 
                          className="w-full text-xs p-3 rounded-xl border border-[var(--border)] bg-transparent outline-none text-[var(--foreground)] focus:border-[var(--accent)] resize-none"
                        />
                        <Button size="sm" className="w-full rounded-full border border-[var(--border)] bg-transparent text-[var(--foreground)] py-2.5 font-bold text-xs hover:bg-[var(--background-secondary)]" onClick={requestReturn}>
                          Submit Return Request
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* System responses banner message */}
                  {actionMsg && (
                    <div className="p-4 bg-[var(--background-secondary)] border border-[var(--accent)] rounded-xl text-center">
                      <p className="text-xs font-bold text-[var(--accent)]">{actionMsg}</p>
                    </div>
                  )}

                  {/* Pending Active Customer Requests logs status updates info badges */}
                  {order.cancellationRequest?.isRequested && (
                    <div className="border border-[var(--border)] rounded-2xl bg-[var(--card-bg)] p-5 space-y-2 text-xs">
                      <p className="font-bold text-[var(--foreground)] uppercase tracking-wider">Cancellation Request Pending</p>
                      <p className="text-[var(--foreground-secondary)]">Reason Given: "{order.cancellationRequest.reason}"</p>
                      <span className="inline-block px-3 py-0.5 rounded-full font-semibold text-xs tracking-wide bg-[var(--background-secondary)] text-[var(--foreground)] border border-[var(--border)]">{order.cancellationRequest.status}</span>
                    </div>
                  )}

                  {order.returnRequest?.isRequested && (
                    <div className="border border-[var(--border)] rounded-2xl bg-[var(--card-bg)] p-5 space-y-2 text-xs">
                      <p className="font-bold text-[var(--foreground)] uppercase tracking-wider">Return Request Pending</p>
                      <p className="text-[var(--foreground-secondary)]">Reason Given: "{order.returnRequest.reason}"</p>
                      <span className="inline-block px-3 py-0.5 rounded-full font-semibold text-xs tracking-wide bg-[var(--background-secondary)] text-[var(--foreground)] border border-[var(--border)]">{order.returnRequest.status}</span>
                    </div>
                  )}

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