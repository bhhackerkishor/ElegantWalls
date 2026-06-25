import CategoryPage from '@/components/catalog/CategoryPage';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Canvas Prints',
  description: 'Gallery-wrap canvas prints with vibrant, fade-resistant colors.',
  path: '/canvas-prints',
});

export default function CanvasPrintsPage() {
  return <CategoryPage category="canvas" />;
}
