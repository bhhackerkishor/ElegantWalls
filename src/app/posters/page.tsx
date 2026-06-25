import CategoryPage from '@/components/catalog/CategoryPage';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Posters',
  description: 'Premium wall posters in custom sizes. Matte and glossy finishes.',
  path: '/posters',
});

export default function PostersPage() {
  return <CategoryPage category="poster" />;
}
