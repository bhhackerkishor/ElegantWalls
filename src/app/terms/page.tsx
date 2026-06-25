import PolicyPage from '@/components/layout/PolicyPage';
import { buildPageMetadata } from '@/lib/seo';
import { SITE_NAME } from '@/lib/constants';

export const metadata = buildPageMetadata({ title: 'Terms & Conditions', path: '/terms' });

export default function TermsPage() {
  return (
    <PolicyPage title="Terms & Conditions">
      <p>By accessing and using {SITE_NAME}, you agree to these terms and conditions.</p>
      <h2 className="text-lg font-bold text-foreground pt-4">Products & Custom Orders</h2>
      <p>All products are made to order. Custom uploads must not violate copyright or contain offensive content. We reserve the right to reject any custom order.</p>
      <h2 className="text-lg font-bold text-foreground pt-4">Pricing & Payment</h2>
      <p>Prices are listed in INR and include applicable taxes at checkout. We accept Razorpay online payments and Cash on Delivery (COD) where available.</p>
      <h2 className="text-lg font-bold text-foreground pt-4">Intellectual Property</h2>
      <p>All designs, branding, and website content are owned by {SITE_NAME}. Unauthorized reproduction is prohibited.</p>
      <h2 className="text-lg font-bold text-foreground pt-4">Limitation of Liability</h2>
      <p>{SITE_NAME} is not liable for indirect damages arising from use of our products or services beyond the value of the order placed.</p>
    </PolicyPage>
  );
}
