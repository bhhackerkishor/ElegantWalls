import CategoryPage from '@/components/catalog/CategoryPage';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Photo Frames',
  description: 'Handcrafted premium photo frames in oak, walnut and gold finishes.',
  path: '/photo-frames',
});

export default function PhotoFramesPage() {
  return <CategoryPage category="frame" />;
}
