import PolicyPage from '@/components/layout/PolicyPage';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({ title: 'Cancellation Policy', path: '/cancellation-policy' });

export default function CancellationPolicyPage() {
  return (
    <PolicyPage title="Cancellation Policy">
      <h2 className="text-lg font-bold text-foreground">Before Shipping</h2>
      <p>Orders can be cancelled before they enter the printing/production stage. Submit a cancellation request from your order tracking page.</p>
      <h2 className="text-lg font-bold text-foreground pt-4">After Shipping</h2>
      <p>Orders cannot be cancelled once shipped. You may refuse delivery, but return shipping charges may apply.</p>
      <h2 className="text-lg font-bold text-foreground pt-4">COD Orders</h2>
      <p>COD orders cancelled before dispatch incur no charges. Repeated COD cancellations may result in account restrictions.</p>
      <h2 className="text-lg font-bold text-foreground pt-4">Refund on Cancellation</h2>
      <p>Prepaid cancelled orders are refunded within 5–7 business days after approval.</p>
    </PolicyPage>
  );
}
