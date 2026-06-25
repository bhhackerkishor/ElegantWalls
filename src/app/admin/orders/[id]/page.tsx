'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAdminApi } from '@/hooks/useAdminApi';
import { useToast } from '@/components/admin/ToastProvider';
import TrackingTimeline from '@/components/order/TrackingTimeline';
import type { OrderDoc, OrderItemDoc } from '@/models/Order';
import { formatPrice } from '@/lib/utils';
import { ORDER_TRACKING_STAGES } from '@/lib/constants';
import { 
  FiArrowLeft, FiDownload, FiEye, FiTruck, FiPackage, 
  FiFileText, FiUser, FiMapPin, FiX, FiRefreshCw, FiChevronDown, FiCheck 
} from 'react-icons/fi';

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const { get, put } = useAdminApi();
  const { toast } = useToast();
  
  const [order, setOrder] = useState<OrderDoc | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierPartner, setCourierPartner] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Custom Dropdown State Engine
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Interactive Image Preview Modal State
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  const loadOrderContext = async () => {
    setLoading(true);
    const res = await get<OrderDoc>(`/api/orders?id=${id}`);
    if (res.success && res.data) {
      setOrder(res.data);
      setAdminNotes(res.data.adminNotes || '');
      setTrackingNumber(res.data.trackingNumber || '');
      setCourierPartner(res.data.courierPartner || '');
    } else {
      toast('Could not find order records.', 'error');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (id) loadOrderContext();
  }, [id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const commitOrderUpdates = async (updates: Record<string, unknown>) => {
    const res = await put(`/api/orders?id=${id}`, updates);
    if (res.success) {
      toast('Order updated successfully.', 'success');
      loadOrderContext();
    } else {
      toast(res.error || 'Failed to update order status.', 'error');
    }
  };

  const downloadProductionAsset = async (imageUrl: string, fileName: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `production_${fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      window.open(imageUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6 animate-pulse">
        <div className="h-12 bg-[var(--background-secondary)] rounded-2xl w-full" />
        <div className="grid md:grid-cols-3 gap-6">
          <div className="h-96 bg-[var(--background-secondary)] rounded-3xl md:col-span-2" />
          <div className="h-96 bg-[var(--background-secondary)] rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!order) return null;

  const currentStage = ORDER_TRACKING_STAGES.find(s => s.key === order.deliveryStatus);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 text-[var(--foreground)] min-h-screen transition-all">
      
      {/* 🧭 NAVIGATION BREADCRUMB */}
      <Link href="/admin/orders" className="inline-flex items-center gap-2 text-xs font-bold text-[var(--foreground-secondary)] hover:text-[var(--accent)] transition-colors group">
        <FiArrowLeft className="transform group-hover:-translate-x-0.5 transition-transform" /> Back to Orders
      </Link>

      {/* 💳 TOP HEADER PROFILE PANEL */}
      <div className="p-6 bg-[var(--card-bg)] border border-[var(--border)] backdrop-blur-md rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)]">{order.orderNumber}</h1>
            <span className="rounded-full px-2.5 py-0.5 font-bold text-[10px] uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              {order.deliveryStatus}
            </span>
            <span className="rounded-full px-2.5 py-0.5 font-bold text-[10px] uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {order.paymentStatus}
            </span>
          </div>
          <p className="text-xs text-[var(--foreground-secondary)] font-semibold flex items-center gap-1.5">
            <FiUser size={13} className="text-[var(--foreground-secondary)]/60" /> {order.userEmail} &bull; {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <div>
          <a href={`/api/invoice?orderId=${order._id}`} target="_blank" rel="noreferrer">
            <Button size="sm" className="bg-[var(--background)] hover:bg-[var(--background-secondary)] text-[var(--foreground)] border border-[var(--border)] flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-bold transition-all shadow-sm">
              <FiFileText size={14} /> Invoice PDF
            </Button>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* 🛍️ PRODUCTION LIST & METRICS COMPONENT */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl space-y-4 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-secondary)] flex items-center gap-2 border-b border-[var(--border)] pb-3">
              <FiPackage className="text-amber-500 dark:text-amber-400" /> Ordered Items
            </h3>
            
            <div className="divide-y divide-[var(--border)]">
              {order.items.map((item: OrderItemDoc, i: number) => {
                const printAssetUrl = item.customImage || `/api/products/image-placeholder.png`;
                const isCustomPrint = !!item.customImage;

                return (
                  <div key={i} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group">
                    <div className="flex gap-4 items-center w-full sm:w-auto">
                      
                      {/* PREVIEW BOX */}
                      <div className="relative w-14 h-14 rounded-xl bg-[var(--background-secondary)] border border-[var(--border)] overflow-hidden group-hover:border-amber-500/40 transition-all shrink-0">
                        <Image src={printAssetUrl} alt={item.title} fill className="object-cover" sizes="56px" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button 
                            onClick={() => setPreviewImage({ url: printAssetUrl, title: item.title })}
                            className="p-1.5 rounded-lg bg-amber-400 text-neutral-950 shadow-md hover:scale-105 transition-transform cursor-pointer"
                          >
                            <FiEye size={12} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-sm tracking-tight text-[var(--foreground)] truncate">{item.title}</h4>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md uppercase tracking-wide ${isCustomPrint ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'}`}>
                            {isCustomPrint ? 'Custom Upload' : 'Catalog'}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--foreground-secondary)] font-semibold truncate">
                          {item.size} &bull; {item.material} &bull; {item.frame} &bull; <span className="text-[var(--foreground)] font-bold">Qty {item.quantity}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 shrink-0">
                      <Button 
                        size="sm" 
                        onClick={() => downloadProductionAsset(printAssetUrl, item.title)}
                        className="bg-[var(--background)] hover:bg-amber-400 hover:text-neutral-950 text-[var(--foreground-secondary)] hover:border-transparent border border-[var(--border)] rounded-xl h-8 px-3 text-[11px] font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <FiDownload size={11} /> Asset File
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* FINANCIAL RECEIPT LEDGER BREAKDOWN */}
            <div className="pt-4 border-t border-[var(--border)] space-y-2 text-xs text-[var(--foreground-secondary)] font-semibold">
              <div className="flex justify-between items-center">
                <span>Subtotal</span>
                <span className="font-bold text-[var(--foreground)]">{formatPrice(order.subtotal || 0)}</span>
              </div>
              
              {order.discountAmount > 0 && (
                <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>Discount ({order.couponApplied || 'PROMO'})</span>
                  <span>-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span>GST (18%)</span>
                <span className="font-bold text-[var(--foreground)]">{formatPrice(order.gst || 0)}</span>
              </div>
              
              <div className="flex justify-between items-center pb-1">
                <span>Shipping Fees</span>
                <span className="font-bold text-[var(--foreground)]">
                  {order.shippingFee === 0 ? (
                    <span className="text-[9px] font-bold tracking-wide text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 bg-emerald-500/10 rounded-md border border-emerald-500/20 uppercase">FREE</span>
                  ) : (
                    formatPrice(order.shippingFee)
                  )}
                </span>
              </div>

              <div className="pt-3 border-t border-[var(--border)] flex justify-between items-center text-xs">
                <span className="font-bold text-[var(--foreground)]">Gross Total</span>
                <span className="text-base font-bold tracking-tight text-amber-600 dark:text-amber-400 font-mono">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* LOGISTICAL TIMELINE */}
          <div className="p-6 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-secondary)] flex items-center gap-2 border-b border-[var(--border)] pb-3 mb-5">
              <FiTruck className="text-amber-500 dark:text-amber-400" /> Logistics Tracking
            </h3>
            <TrackingTimeline
              deliveryStatus={order.deliveryStatus}
              trackingEvents={order.trackingEvents}
              trackingNumber={order.trackingNumber}
              courierPartner={order.courierPartner}
            />
          </div>
        </div>

        {/* 🏢 CONTROLS PANEL */}
        <div className="space-y-6">
          <div className="p-6 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl space-y-3 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-secondary)] flex items-center gap-2 border-b border-[var(--border)] pb-3">
              <FiMapPin className="text-amber-500 dark:text-amber-400" /> Shipping Destination
            </h3>
            <div className="text-xs space-y-1 leading-relaxed text-[var(--foreground-secondary)] font-semibold">
              <p className="font-bold text-[var(--foreground)] text-sm">{order.shippingDetails.name}</p>
              <p className="text-[var(--foreground)] select-all font-mono">{order.shippingDetails.phone}</p>
              <p className="pt-1 font-medium">{order.shippingDetails.address}</p>
              <p className="font-medium">{order.shippingDetails.city}, {order.shippingDetails.state} &bull; <span className="font-mono text-[var(--foreground)] font-bold">{order.shippingDetails.pincode}</span></p>
            </div>
          </div>

          <div className="p-6 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl space-y-4 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-secondary)] flex items-center gap-2 border-b border-[var(--border)] pb-2">
              <FiRefreshCw className="text-amber-500 dark:text-amber-400" /> Fulfillment Management
            </h3>
            
            <div className="space-y-4 text-xs">
              
              {/* INTERACTIVE DROPDOWN WITH THEME VARIABLES */}
              <div className="space-y-1" ref={dropdownRef}>
                <label className="font-bold uppercase tracking-wider text-[var(--foreground-secondary)]/70 text-[10px]">Fulfillment Phase</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-full h-10 px-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-left font-semibold text-[var(--foreground)] flex items-center justify-between focus:border-[var(--foreground)] transition-colors shadow-inner"
                  >
                    <span>{currentStage ? currentStage.label : order.deliveryStatus}</span>
                    <FiChevronDown className={`text-[var(--foreground-secondary)] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} size={14} />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute left-0 right-0 mt-1.5 max-h-60 overflow-y-auto bg-[var(--card-bg)] border border-[var(--border)] rounded-xl shadow-2xl z-50 py-1.5 divide-y divide-[var(--border)] animate-in fade-in slide-in-from-top-2 duration-150">
                      {ORDER_TRACKING_STAGES.map((s) => (
                        <button
                          key={s.key}
                          type="button"
                          onClick={() => {
                            commitOrderUpdates({ deliveryStatus: s.key });
                            setDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2.5 text-xs flex items-center justify-between transition-colors ${
                            order.deliveryStatus === s.key 
                              ? 'bg-[var(--background-secondary)] text-[var(--foreground)] font-bold' 
                              : 'text-[var(--foreground-secondary)] hover:bg-[var(--background-secondary)]/50 hover:text-[var(--foreground)]'
                          }`}
                        >
                          <span>{s.label}</span>
                          {order.deliveryStatus === s.key && <FiCheck size={12} className="text-[var(--foreground)]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-[var(--foreground-secondary)]/70 text-[10px]">Courier Partner</label>
                <input 
                  type="text"
                  placeholder="e.g., BlueDart, Delhivery" 
                  value={courierPartner} 
                  onChange={(e) => setCourierPartner(e.target.value)}
                  className="w-full h-10 px-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-xs font-semibold text-[var(--foreground)] outline-none focus:border-[var(--foreground)] transition-colors shadow-inner"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-[var(--foreground-secondary)]/70 text-[10px]">Waybill Tracking Number</label>
                <input 
                  type="text"
                  placeholder="AWB Tracking ID" 
                  value={trackingNumber} 
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full h-10 px-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-xs font-mono text-[var(--foreground)] outline-none focus:border-[var(--foreground)] transition-colors shadow-inner"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-[var(--foreground-secondary)]/70 text-[10px]">Internal Notes</label>
                <textarea 
                  rows={3}
                  placeholder="Add private staff log notes..." 
                  value={adminNotes} 
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full p-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-xs font-medium text-[var(--foreground)] outline-none focus:border-[var(--foreground)] transition-colors resize-none shadow-inner"
                />
              </div>

              <Button 
                onClick={() => commitOrderUpdates({ adminNotes, trackingNumber, courierPartner })}
                className="w-full bg-[var(--foreground)] hover:bg-[var(--foreground)]/90 text-[var(--background)] font-bold h-10 rounded-xl transition-all shadow-sm text-xs"
              >
                Save Details
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 🖼️ INTERACTIVE LIGHTBOX PREVIEW MODAL */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl overflow-hidden p-4 max-w-2xl w-full flex flex-col justify-between shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setPreviewImage(null)} 
              className="absolute top-6 right-6 text-[var(--foreground-secondary)] hover:text-[var(--foreground)] bg-[var(--background)] p-2 rounded-full transition-colors z-10 border border-[var(--border)] shadow-sm cursor-pointer"
            >
              <FiX size={14} />
            </button>

            {/* FLUID IMAGE WRAPPER FRAME CONTAINER */}
            <div className="w-full flex items-center justify-center rounded-xl overflow-hidden bg-[var(--background-secondary)]/30 max-h-[65vh]">
              <img 
                src={previewImage.url} 
                alt={previewImage.title} 
                className="w-auto h-auto max-w-full max-h-[65vh] object-contain rounded-xl select-none"
              />
            </div>
            
            <div className="pt-4 flex items-center justify-between text-xs">
              <div>
                <h4 className="font-bold text-[var(--foreground)] tracking-tight">{previewImage.title}</h4>
                <p className="text-[10px] text-[var(--foreground-secondary)] font-mono">Digital Master Copy</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm"
                  onClick={() => downloadProductionAsset(previewImage.url, previewImage.title)}
                  className="bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold h-9 px-4 rounded-xl flex items-center gap-1.5 text-xs transition-colors shadow-sm"
                >
                  <FiDownload size={13} /> Download File
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}