/**
 * Courier tracking integration architecture.
 * Plug in Shiprocket, Delhivery, or Bluedart by setting env vars.
 */

export interface CourierTrackingResult {
  trackingNumber: string;
  courierPartner: string;
  status: string;
  events: Array<{
    status: string;
    description: string;
    location: string;
    timestamp: Date;
  }>;
}

export async function fetchCourierTracking(
  trackingNumber: string,
  courierPartner: string
): Promise<CourierTrackingResult | null> {
  const provider = process.env.COURIER_PROVIDER;

  if (!provider || !trackingNumber) {
    return null;
  }

  switch (provider) {
    case 'shiprocket':
      return fetchShiprocketTracking(trackingNumber);
    case 'delhivery':
      return fetchDelhiveryTracking(trackingNumber);
    default:
      return null;
  }
}

async function fetchShiprocketTracking(trackingNumber: string): Promise<CourierTrackingResult | null> {
  const token = process.env.SHIPROCKET_API_TOKEN;
  if (!token) return null;

  try {
    const res = await fetch(
      `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${trackingNumber}`,
      { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 300 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      trackingNumber,
      courierPartner: data.courier_name || 'Shiprocket',
      status: data.current_status || 'In Transit',
      events: (data.tracking_data?.shipment_track || []).map(
        (e: { activity: string; location: string; date: string }) => ({
          status: e.activity,
          description: e.activity,
          location: e.location || 'In Transit',
          timestamp: new Date(e.date),
        })
      ),
    };
  } catch {
    return null;
  }
}

async function fetchDelhiveryTracking(trackingNumber: string): Promise<CourierTrackingResult | null> {
  const token = process.env.DELHIVERY_API_TOKEN;
  if (!token) return null;

  try {
    const res = await fetch(
      `https://track.delhivery.com/api/v1/packages/json/?waybill=${trackingNumber}&token=${token}`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const shipment = data.ShipmentData?.[0]?.Shipment;
    if (!shipment) return null;
    return {
      trackingNumber,
      courierPartner: 'Delhivery',
      status: shipment.Status?.Status || 'In Transit',
      events: (shipment.Scans || []).map(
        (s: { ScanDetail: { Scan: string; ScannedLocation: string; ScanDateTime: string } }) => ({
          status: s.ScanDetail.Scan,
          description: s.ScanDetail.Scan,
          location: s.ScanDetail.ScannedLocation,
          timestamp: new Date(s.ScanDetail.ScanDateTime),
        })
      ),
    };
  } catch {
    return null;
  }
}
