import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const productId = new URL(request.url).searchParams.get('productId');
    const category = new URL(request.url).searchParams.get('category');
    const limit = parseInt(new URL(request.url).searchParams.get('limit') || '6', 10);

    let query: Record<string, unknown> = {};
    if (productId) {
      const current = await Product.findById(productId).lean();
      if (current) query = { category: current.category, _id: { $ne: productId } };
    } else if (category) {
      query = { category };
    }

    const products = await Product.find(query)
      .sort({ isBestSeller: -1, isTrending: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    return successResponse(products);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Server error', 500);
  }
}
