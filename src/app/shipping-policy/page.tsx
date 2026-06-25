import PolicyPage from '@/components/layout/PolicyPage';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({ title: 'Shipping Policy', path: '/shipping-policy' });

export default function ShippingPolicyPage() {
  return (
    <PolicyPage title="Shipping Policy">
      <h2 className="text-lg font-bold text-foreground">Delivery Timeline</h2>
      <p>We deliver across all of India within 3 to 5 working days from order confirmation. Custom print orders may require an additional 1–2 days for production.</p>
      <h2 className="text-lg font-bold text-foreground pt-4">Shipping Charges</h2>
      <p>Standard shipping is ₹80. Free shipping applies on prepaid orders above ₹500.</p>
      <h2 className="text-lg font-bold text-foreground pt-4">Tracking</h2>
      <p>Once shipped, you will receive a tracking number via email and WhatsApp. Track your order anytime from the Orders page.</p>
      <h2 className="text-lg font-bold text-foreground pt-4">Packaging</h2>
      <p>All items are packed in double-layer protective packaging with corner guards for frames to prevent transit damage.</p>
    </PolicyPage>
  );
}
