'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { IoClose, IoCartOutline, IoRemove, IoAdd } from 'react-icons/io5';
import { FiCheckCircle } from 'react-icons/fi';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { loadRazorpay } from '@/lib/loadRazorpay';
import { calculateOrderTotals, formatPrice, cartItemKey, parseAddress } from '@/lib/utils';
import { DEFAULT_SHIPPING } from '@/lib/constants';
import Button from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import type { Coupon, Order } from '@/types';

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export default function CartDrawer() {
  const {
    cartItems, isCartOpen, setIsCartOpen, cartTotal,
    removeFromCart, updateQuantity, clearCart, sessionId,
  } = useCart();
  const { email, isAuthenticated, getAuthHeaders } = useAuth();

  const [guestEmail, setGuestEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [orderSuccess, setOrderSuccess] = useState<Order | null>(null);

  useEffect(() => {
    if (isCartOpen && isAuthenticated) {
      fetch('/api/users/profile', { headers: getAuthHeaders() })
        .then((r) => r.json())
        .then((data) => {
          const user = data.data || data.user;
          if (user) {
            if (user.name) setCustomerName(user.name);
            if (user.phone) setCustomerPhone(user.phone);
            if (user.address) setAddressLine1(user.address);
            if (user.city) setCity(user.city);
            if (user.state) setState(user.state);
            if (user.zipCode) setPincode(user.zipCode);
          }
        })
        .catch(() => {});
    }
  }, [isCartOpen, isAuthenticated, getAuthHeaders]);

  const totals = useMemo(
    () => calculateOrderTotals(cartTotal, couponDiscount, DEFAULT_SHIPPING),
    [cartTotal, couponDiscount]
  );

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!couponCode) return;
    const res = await fetch(`/api/coupons?code=${couponCode}`);
    const data = await res.json();
    if (data.success && data.coupon) {
      const coupon = data.coupon as Coupon;
      if (cartTotal < coupon.minOrderValue) {
        setCouponError(`Min order value is ${formatPrice(coupon.minOrderValue)}`);
        return;
      }
      setAppliedCoupon(coupon);
      setCouponDiscount(
        coupon.discountType === 'percentage'
          ? Math.round((cartTotal * coupon.discountValue) / 100)
          : Math.min(coupon.discountValue, cartTotal)
      );
    } else {
      setCouponError(data.error || 'Invalid coupon');
      setAppliedCoupon(null);
      setCouponDiscount(0);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !customerName ||
      !customerPhone ||
      !addressLine1 ||
      !city ||
      !state ||
      !pincode
    ) {
      alert('Please fill all shipping details');
      return;
    }
    const userEmail = email || guestEmail;
    if (!userEmail) { alert('Please enter your email.'); return; }

    setIsSubmitting(true);
    const shippingDetails = {
      name: customerName,
      phone: customerPhone,
      address: `${addressLine1} ${addressLine2}`.trim(),
      city,
      state,
      pincode,
    };

    try {
      // 🛠️ Locate the COD branch inside your handleCheckout handler:
      if (paymentMethod === 'cod') {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            cartItems,
            cartTotal: totals.total,
            shippingDetails, // ⚡ Pass this explicitly as shippingDetails
            email: userEmail,
            couponApplied: appliedCoupon?.code,
            discountAmount: couponDiscount,
            paymentMethod: 'cod',
          }),
        });
        const data = await res.json();
        if (data.success) {
          const orderRes = await fetch(`/api/orders?id=${data.data.orderId}`);
          const orderData = await orderRes.json();
          if (orderData.success) {
            setOrderSuccess(orderData.data);
            clearCart();
          }
        } else {
          alert(data.error || 'Failed to place order.');
        }
        return;
      }

      const scriptLoaded = await loadRazorpay();
      if (!scriptLoaded) { alert('Failed to load payment gateway.'); return; }

      const orderRes = await fetch('/api/payments/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          cartItems,
          shippingDetails,
          couponApplied: appliedCoupon?.code,
          paymentMethod: 'razorpay',
        }),
      });
      const orderData = await orderRes.json();
      if (!orderData.success) { alert(orderData.error); return; }

      const payload = orderData.data;
      const verifyPayment = async (response: Record<string, string>) => {
        const verifyRes = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: payload.orderId,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            
            sessionId,
          }),
        });
        const verifyData = await verifyRes.json();
        if (verifyData.success) {
          setOrderSuccess(verifyData.data.order);
          clearCart();
        } else {
          alert('Payment verification failed.');
        }
      };

      
      new window.Razorpay({
        key: payload.keyId,
        amount: payload.amount * 100,
        currency: 'INR',
        order_id: payload.razorpayOrderId,
      
        name: 'Elegant Walls',
      
        description:
          'Premium Posters & Photo Frames',
      
        image: '/logo.png',
      
        prefill: {
          name: customerName,
          email: userEmail,
          contact: customerPhone,
        },
      
        theme: {
          color: '#B08D46',
        },
      
        handler: verifyPayment,
      }).open();
      
    } catch {
      alert('Checkout error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[150] flex justify-end bg-black/50 backdrop-blur-sm"
      onClick={() => setIsCartOpen(false)}
    >
      <div
        className="flex flex-col w-full max-w-md h-full bg-background border-l border-border shadow-lg animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-xl font-bold">Shopping Bag ({cartItems.length})</h3>
          <button onClick={() => setIsCartOpen(false)} className="p-1 bg-transparent border-none cursor-pointer">
            <IoClose size={24} />
          </button>
        </div>

        {orderSuccess ? (
          <div className="flex flex-col items-center justify-center gap-5 p-8 text-center flex-1">
            <FiCheckCircle size={64} className="text-success" />
            <h2 className="text-2xl font-bold text-success">Order Received!</h2>
            <div className="w-full p-4 bg-background-secondary rounded-md text-left text-sm space-y-1">
              <p><strong>Order:</strong> {orderSuccess.orderNumber}</p>
              <p><strong>Status:</strong> {orderSuccess.paymentStatus.toUpperCase()}</p>
              <p><strong>Total:</strong> {formatPrice(orderSuccess.totalAmount)}</p>
            </div>
            <Link href={`/orders/${orderSuccess._id}`} className="w-full">
              <Button className="w-full" onClick={() => { setIsCartOpen(false); setOrderSuccess(null); }}>
                Track Order
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {cartItems.length === 0 ? (
                <div className="text-center mt-10 text-foreground-secondary">
                  <IoCartOutline size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Your cart is empty.</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={cartItemKey(item)} className="flex gap-4 pb-4 border-b border-border">
                    <div className="relative w-20 h-20 shrink-0 rounded-sm overflow-hidden bg-background-secondary">
                      <Image src={item.customImage || item.image} alt={item.title} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="text-xs text-accent">{item.size} · {item.material}</p>
                      <p className="text-sm font-bold mt-1">{formatPrice(item.price)}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-border rounded-sm overflow-hidden">
                          <button onClick={() => updateQuantity(item, item.quantity - 1)} className="px-2 py-1 bg-transparent border-none cursor-pointer"><IoRemove /></button>
                          <span className="px-3 text-sm border-x border-border">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item, item.quantity + 1)} className="px-2 py-1 bg-transparent border-none cursor-pointer"><IoAdd /></button>
                        </div>
                        <button onClick={() => removeFromCart(item)} className="text-xs text-error bg-transparent border-none cursor-pointer underline">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-6 border-t border-border bg-background-secondary space-y-4 max-h-[60%] overflow-y-auto">
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Coupon code"
                    className="flex-1 px-3 py-2 text-sm rounded-sm border border-border bg-background"
                  />
                  <Button type="submit" variant="secondary" size="sm">Apply</Button>
                </form>
                {couponError && <p className="text-xs text-error">{couponError}</p>}
                {appliedCoupon && (
                  <p className="text-xs text-success">Coupon &apos;{appliedCoupon.code}&apos; applied (-{formatPrice(couponDiscount)})</p>
                )}

                <div className="text-sm space-y-1 border-b border-border pb-3">
                  <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(totals.subtotal)}</span></div>
                  {couponDiscount > 0 && <div className="flex justify-between text-success"><span>Discount</span><span>-{formatPrice(couponDiscount)}</span></div>}
                  <div className="flex justify-between text-foreground-secondary"><span>GST (18%)</span><span>{formatPrice(totals.gst)}</span></div>
                  <div className="flex justify-between text-foreground-secondary"><span>Shipping</span><span>{totals.shipping === 0 ? 'FREE' : formatPrice(totals.shipping)}</span></div>
                  <div className="flex justify-between font-bold text-base pt-1"><span>Total</span><span className="text-accent">{formatPrice(totals.total)}</span></div>
                </div>

                <form onSubmit={handleCheckout} className="space-y-3">
                  {!isAuthenticated && (
                    <Input label="Email *" type="email" required value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} />
                  )}
                  <Input label="Full Name *" required value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                  <Input label="Phone *" type="tel" required value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
                  <Input
                  label="Address Line 1 *"
                  required
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                />

                <Input
                  label="Address Line 2"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="City *"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />

                  <Input
                    label="State *"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                </div>

                <Input
                  label="Pincode *"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                />

                  <div className="pt-2">
                    <p className="text-xs font-bold mb-2">Payment Method</p>
                    <div className="flex gap-4 text-sm">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} />
                        Razorpay
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                        COD
                      </label>
                    </div>
                  </div>

                  <Button type="submit" loading={isSubmitting} className="w-full">
                    Checkout · {formatPrice(totals.total)}
                  </Button>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
