import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Review from '@/models/Review';
import { getUserFromRequest, isAdminAuthorized } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const productId = new URL(request.url).searchParams.get('productId');
    const all = new URL(request.url).searchParams.get('all') === 'true';

    let query: Record<string, unknown> = { approved: true };
    if (productId) query = { productId, approved: true };
    if (all) {
      if (!isAdminAuthorized(request)) return unauthorizedResponse();
      query = productId ? { productId } : {};
    }
    const reviews = await Review.find(query).sort({ createdAt: -1 }).limit(50).lean();
    return successResponse(reviews);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return unauthorizedResponse('Please login to leave a review');

    await dbConnect();
    const { productId, customerName, rating, comment } = await request.json();

    if (!productId || !rating || !comment) {
      return errorResponse('Product, rating and comment are required');
    }

    const review = await Review.create({
      productId,
      userEmail: user.email,
      customerName: customerName || user.email.split('@')[0],
      rating: Math.min(5, Math.max(1, rating)),
      comment,
      approved: false,
    });

    return successResponse(review, 201);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Bad request', 400);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { isAdminAuthorized } = await import('@/lib/auth');
    if (!isAdminAuthorized(request)) return unauthorizedResponse();

    await dbConnect();
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return errorResponse('Missing review ID');

    const { approved } = await request.json();
    const review = await Review.findByIdAndUpdate(id, { approved }, { new: true });
    if (!review) return errorResponse('Review not found', 404);
    return successResponse(review);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Bad request', 400);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { isAdminAuthorized } = await import('@/lib/auth');
    if (!isAdminAuthorized(request)) return unauthorizedResponse();

    await dbConnect();
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return errorResponse('Missing review ID');
    await Review.findByIdAndDelete(id);
    return successResponse({ message: 'Review deleted' });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Bad request', 400);
  }
}
