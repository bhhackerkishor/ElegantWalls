import type { Metadata } from 'next';
import type { Product } from '@/types';
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from './constants';
import { formatPrice, getStartingPrice } from './utils';

export function buildPageMetadata({
  title,
  description,
  path = '',
  image,
  noIndex = false,
}: {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const url = `${SITE_URL}${path}`;
  const ogImage = image || `${SITE_URL}/og-default.jpg`;

  return {
    title: `${title} | ${SITE_NAME}`,
    description: description || SITE_DESCRIPTION,
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description: description || SITE_DESCRIPTION,
      url,
      siteName: SITE_NAME,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      locale: 'en_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_NAME}`,
      description: description || SITE_DESCRIPTION,
      images: [ogImage],
    },
    alternates: { canonical: url },
  };
}

export function buildProductMetadata(product: Product): Metadata {
  const price = getStartingPrice(product);
  const description = product.description.slice(0, 160);
  const url = `${SITE_URL}/product/${product.slug}`;

  return {
    title: `${product.title} | ${SITE_NAME}`,
    description,
    openGraph: {
      title: product.title,
      description,
      url,
      images: [{ url: product.image, width: 800, height: 800, alt: product.title }],
      type: 'website',
    },
    alternates: { canonical: url },
    other: {
      'product:price:amount': String(price),
      'product:price:currency': 'INR',
    },
  };
}

export function buildProductJsonLd(product: Product): object {
  const price = getStartingPrice(product);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: [product.image, ...product.images],
    sku: product.variants[0]?.sku,
    brand: { '@type': 'Brand', name: SITE_NAME },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'INR',
      lowPrice: price,
      highPrice: Math.max(...product.variants.map((v) => v.price)),
      availability: product.variants.some((v) => v.stockCount > 0)
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };
}

export function buildOrganizationJsonLd(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'elegantwalls.prints@gmail.com',
      availableLanguage: 'English',
    },
  };
}
