import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { getCatalogProducts } from '@/lib/catalog-seed';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from '@/lib/api-response';
import { isAdminAuthorized } from '@/lib/auth';
import { getCached, setCache, invalidateCache, CACHE_KEYS } from '@/lib/cache';
import type { ProductCategory } from '@/types';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as ProductCategory | null;
    const search = searchParams.get('search');
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const size = searchParams.get('size');
    const material = searchParams.get('material');
    const frame = searchParams.get('frame');
    const orientation = searchParams.get('orientation');
    const sort = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '24', 10);

    if (id) {
      const product = await Product.findById(id).lean();
      if (!product) return notFoundResponse('Product not found');
      return successResponse(product);
    }

    if (slug) {
      const product = await Product.findOne({ slug }).lean();
      if (!product) return notFoundResponse('Product not found');
      return successResponse(product);
    }

    let products = await Product.find({}).lean();
    if (products.length === 0 && !category && !search) {
      await Product.insertMany(getCatalogProducts());
      products = await Product.find({}).lean();
      invalidateCache(CACHE_KEYS.products);
    }

    let filtered = products;

    if (category) filtered = filtered.filter((p) => p.category === category);
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }
    if (size) filtered = filtered.filter((p) => p.variants.some((v) => v.size === size));
    if (material) filtered = filtered.filter((p) => p.variants.some((v) => v.material === material));
    if (frame) filtered = filtered.filter((p) => p.variants.some((v) => v.frame === frame));
    if (orientation) filtered = filtered.filter((p) => p.variants.some((v) => v.orientation === orientation));
    if (minPrice) {
      const min = parseFloat(minPrice);
      filtered = filtered.filter((p) => Math.min(...p.variants.map((v) => v.price)) >= min);
    }
    if (maxPrice) {
      const max = parseFloat(maxPrice);
      filtered = filtered.filter((p) => Math.min(...p.variants.map((v) => v.price)) <= max);
    }

    switch (sort) {
      case 'price_asc':
        filtered.sort((a, b) => Math.min(...a.variants.map((v) => v.price)) - Math.min(...b.variants.map((v) => v.price)));
        break;
      case 'price_desc':
        filtered.sort((a, b) => Math.min(...b.variants.map((v) => v.price)) - Math.min(...a.variants.map((v) => v.price)));
        break;
      case 'bestseller':
        filtered.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
        break;
      default:
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const total = filtered.length;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return successResponse({
      products: paginated,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isAdminAuthorized(request)) return unauthorizedResponse();
    await dbConnect();
    const body = await request.json();
    if (!body.slug && body.title) {
      body.slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    const product = await Product.create(body);
    invalidateCache(CACHE_KEYS.products);
    return successResponse(product, 201);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Bad request', 400);
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!isAdminAuthorized(request)) return unauthorizedResponse();
    await dbConnect();
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return errorResponse('Missing product ID');
    const body = await request.json();
    const product = await Product.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!product) return notFoundResponse('Product not found');
    invalidateCache(CACHE_KEYS.products);
    return successResponse(product);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Bad request', 400);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!isAdminAuthorized(request)) return unauthorizedResponse();
    await dbConnect();
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return errorResponse('Missing product ID');
    const product = await Product.findByIdAndDelete(id);
    if (!product) return notFoundResponse('Product not found');
    invalidateCache(CACHE_KEYS.products);
    return successResponse({ message: 'Product deleted' });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Bad request', 400);
  }
}
