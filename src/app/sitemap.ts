import { MetadataRoute } from 'next';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { SITE_URL, PRODUCT_CATEGORIES } from '@/lib/constants';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    '',
    '/about',
    '/contact',
    '/support',
    '/posters',
    '/photo-frames',
    '/wall-stickers',
    '/canvas-prints',
    '/custom-prints',
    '/privacy-policy',
    '/terms',
    '/shipping-policy',
    '/refund-policy',
    '/cancellation-policy',
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.8,
  }));

  try {
    await dbConnect();
    const products = await Product.find().select('slug updatedAt').lean();
    const productPages = products.map((p) => ({
      url: `${SITE_URL}/product/${p.slug}`,
      lastModified: p.createdAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }));
    return [...staticPages, ...productPages];
  } catch {
    return staticPages;
  }
}
