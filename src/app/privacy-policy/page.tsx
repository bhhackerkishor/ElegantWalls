import PolicyPage from '@/components/layout/PolicyPage';
import { buildPageMetadata } from '@/lib/seo';
import { SITE_NAME, SUPPORT_EMAIL } from '@/lib/constants';

export const metadata = buildPageMetadata({ title: 'Privacy Policy', path: '/privacy-policy' });

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage title="Privacy Policy">
      <p>Last updated: {new Date().toLocaleDateString('en-IN')}</p>
      <p>{SITE_NAME} (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) respects your privacy. This policy explains how we collect, use, and protect your personal information when you use our website and services.</p>
      <h2 className="text-lg font-bold text-foreground pt-4">Information We Collect</h2>
      <p>We collect information you provide directly: name, email, phone number, shipping address, payment details (processed securely via Razorpay), and custom images you upload for printing.</p>
      <h2 className="text-lg font-bold text-foreground pt-4">How We Use Your Information</h2>
      <p>We use your information to process orders, communicate about deliveries, improve our services, and send marketing emails (with your consent).</p>
      <h2 className="text-lg font-bold text-foreground pt-4">Data Security</h2>
      <p>We implement industry-standard security measures. Payment data is never stored on our servers — it is handled entirely by Razorpay.</p>
      <h2 className="text-lg font-bold text-foreground pt-4">Contact</h2>
      <p>For privacy-related queries, email us at <a href={`mailto:${SUPPORT_EMAIL}`} className="text-accent">{SUPPORT_EMAIL}</a>.</p>
    </PolicyPage>
  );
}
