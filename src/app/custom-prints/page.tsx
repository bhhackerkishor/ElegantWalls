import CategoryPage from '@/components/catalog/CategoryPage';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Custom Prints',
  description: 'Upload your photos for custom wall art printing in any size.',
  path: '/custom-prints',
});

export default function CustomPrintsPage() {
  return <CategoryPage category="custom" />;
}
