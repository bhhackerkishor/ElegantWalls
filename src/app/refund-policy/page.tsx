import PolicyPage from '@/components/layout/PolicyPage';
import { buildPageMetadata } from '@/lib/seo';
import { SUPPORT_EMAIL } from '@/lib/constants';

export const metadata = buildPageMetadata({ title: 'Refund Policy', path: '/refund-policy' });

export default function RefundPolicyPage() {
  return (
    <PolicyPage title="Refund Policy">
      <p>Since all products are custom-made to order, we generally do not accept returns for change-of-mind.</p>
      <h2 className="text-lg font-bold text-foreground pt-4">Transit Damage</h2>
      <p>If your order arrives damaged, contact us within 48 hours with photos of the package and product. We offer 100% free replacement at no extra cost.</p>
      <h2 className="text-lg font-bold text-foreground pt-4">Refund Processing</h2>
      <p>Approved refunds are processed within 5–7 business days to the original payment method. COD refunds are processed via UPI or bank transfer.</p>
      <h2 className="text-lg font-bold text-foreground pt-4">Contact</h2>
      <p>Email <a href={`mailto:${SUPPORT_EMAIL}`} className="text-accent">{SUPPORT_EMAIL}</a> or WhatsApp us with your order number.</p>
    </PolicyPage>
  );
}
