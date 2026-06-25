import type { Metadata } from 'next';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { buildProductMetadata, buildProductJsonLd } from '@/lib/seo';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    await dbConnect();
    const product = await Product.findOne({ slug }).lean();
    if (!product) return { title: 'Product Not Found' };
    return buildProductMetadata(JSON.parse(JSON.stringify(product)));
  } catch {
    return { title: 'Product' };
  }
}

export default async function ProductLayout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let jsonLd = null;
  try {
    await dbConnect();
    const product = await Product.findOne({ slug }).lean();
    if (product) jsonLd = buildProductJsonLd(JSON.parse(JSON.stringify(product)));
  } catch {
    /* ignore */
  }

  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      {children}
    </>
  );
}
