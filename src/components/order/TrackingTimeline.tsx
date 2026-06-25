'use client';

import { ORDER_TRACKING_STAGES } from '@/lib/constants';
import { getDeliveryStageIndex } from '@/lib/utils';
import type { TrackingEvent } from '@/types';
import { FiCheck, FiPackage, FiCircle, FiMapPin } from 'react-icons/fi';

interface TrackingTimelineProps {
  deliveryStatus: string;
  trackingEvents?: TrackingEvent[];
  trackingNumber?: string;
  courierPartner?: string;
}

export default function TrackingTimeline({
  deliveryStatus,
  trackingEvents = [],
  trackingNumber,
  courierPartner,
}: TrackingTimelineProps) {
  const currentIndex = getDeliveryStageIndex(deliveryStatus);

  return (
    <div className="w-full space-y-8 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-6 text-[var(--foreground)] transition-colors duration-300">
      
      {/* Shipping Details Boxes */}
      {(trackingNumber || courierPartner) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg">
          {courierPartner && (
            <div className="space-y-0.5">
              <span className="text-xs uppercase font-semibold text-[var(--foreground-secondary)] block">Courier Partner</span>
              <p className="text-sm font-bold uppercase">{courierPartner}</p>
            </div>
          )}
          {trackingNumber && (
            <div className="space-y-0.5">
              <span className="text-xs uppercase font-semibold text-[var(--foreground-secondary)] block">Tracking Number (AWB)</span>
              <p className="text-sm font-mono font-bold text-[var(--accent)]">{trackingNumber}</p>
            </div>
          )}
        </div>
      )}

      {/* Main Order Progress Tracker */}
      <div className="relative pl-2">
        {ORDER_TRACKING_STAGES.map((stage, idx) => {
          const isComplete = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isUnvisited = idx > currentIndex;

          return (
            <div 
              key={stage.key} 
              className="flex gap-4 pb-8 last:pb-0 relative group"
            >
              {/* Line linking the stages */}
              {idx < ORDER_TRACKING_STAGES.length - 1 && (
                <div className="absolute left-[15px] top-8 w-0.5 h-[calc(100%-16px)] bg-[var(--border)]">
                  <div
                    className={`w-full h-full origin-top transition-transform duration-700 ease-out ${
                      idx < currentIndex ? 'scale-y-100 bg-[var(--accent)]' : 'scale-y-0'
                    }`}
                  />
                </div>
              )}

              {/* Status Circle / Icons */}
              <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center">
                {isCurrent && (
                  <span className="absolute inset-0 rounded-full bg-[var(--accent)] opacity-20 animate-ping" />
                )}
                
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    isComplete
                      ? 'bg-[var(--accent)] border-[var(--accent)] text-black'
                      : isCurrent
                      ? 'bg-[var(--background)] border-[var(--accent)] text-[var(--accent)] shadow-md'
                      : 'bg-[var(--background-secondary)] border-[var(--border)] text-[var(--foreground-secondary)]'
                  }`}
                >
                  {isComplete ? (
                    <FiCheck size={14} className="stroke-[3]" />
                  ) : isCurrent ? (
                    <FiPackage size={14} className="animate-bounce" />
                  ) : (
                    <FiCircle size={8} className="fill-current opacity-40" />
                  )}
                </div>
              </div>

              {/* Stage Text Information */}
              <div className="pt-0.5 flex-grow">
                <div className="flex items-center gap-2 flex-wrap">
                  <p 
                    className={`text-sm font-bold ${
                      isUnvisited ? 'text-[var(--foreground-secondary)] opacity-60' : 'text-[var(--foreground)]'
                    }`}
                  >
                    {stage.label}
                  </p>
                  {isCurrent && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[var(--accent)] text-black animate-pulse">
                      Current Stage
                    </span>
                  )}
                </div>
                <p 
                  className={`text-xs mt-0.5 max-w-xl leading-relaxed ${
                    isUnvisited ? 'text-[var(--foreground-secondary)] opacity-50' : 'text-[var(--foreground-secondary)]'
                  }`}
                >
                  {stage.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Shipment History Log */}
      {trackingEvents.length > 0 && (
        <div className="pt-6 border-t border-[var(--border)]">
          <h4 className="text-sm font-bold text-[var(--foreground)] mb-4">
            Detailed Tracking History
          </h4>
          <div className="space-y-3">
            {trackingEvents.map((event, i) => (
              <div 
                key={i} 
                className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 p-3 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)] hover:bg-[var(--card-bg)] transition-colors duration-200"
              >
                <div className="space-y-1">
                  <p className="text-xs font-bold text-[var(--foreground)]">{event.status}</p>
                  {event.description && (
                    <p className="text-xs text-[var(--foreground-secondary)]">{event.description}</p>
                  )}
                  {event.location && (
                    <span className="inline-flex items-center gap-1 text-xs text-[var(--accent)] font-medium pt-0.5">
                      <FiMapPin size={12} />
                      {event.location}
                    </span>
                  )}
                </div>
                
                <span className="text-xs text-[var(--foreground-secondary)] whitespace-nowrap pt-0.5">
                  {new Date(event.timestamp).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}