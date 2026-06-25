import CategoryPage from '@/components/catalog/CategoryPage';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Wall Stickers',
  description: 'Removable vinyl wall stickers and decals for every room.',
  path: '/wall-stickers',
});

export default function WallStickersPage() {
  return <CategoryPage category="sticker" />;
}
