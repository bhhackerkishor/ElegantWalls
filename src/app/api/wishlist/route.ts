import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return unauthorizedResponse();
    await dbConnect();
    const dbUser = await User.findOne({ email: user.email }).select('wishlist').lean();
    return successResponse(dbUser?.wishlist || []);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    await dbConnect();
    const { productId } = await request.json();
    if (!productId) return errorResponse('Product ID required');

    const dbUser = await User.findOne({ email: user.email });
    if (!dbUser) return errorResponse('User not found', 404);

    const idx = dbUser.wishlist.indexOf(productId);
    if (idx > -1) {
      dbUser.wishlist.splice(idx, 1);
    } else {
      dbUser.wishlist.push(productId);
    }
    await dbUser.save();

    return successResponse({ isWishlisted: idx === -1, wishlist: dbUser.wishlist });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Bad request', 400);
  }
}
