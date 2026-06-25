import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return unauthorizedResponse();
    await dbConnect();
    const dbUser = await User.findOne({ email: user.email }).select('recentlyViewed').lean();
    if (!dbUser?.recentlyViewed?.length) return successResponse([]);

    const products = await Product.find({ _id: { $in: dbUser.recentlyViewed } }).lean();
    const ordered = dbUser.recentlyViewed
      .map((id) => products.find((p) => p._id.toString() === id))
      .filter(Boolean);
    return successResponse(ordered);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    const { productId } = await request.json();
    if (!productId) return errorResponse('Product ID required');

    await dbConnect();

    if (user) {
      const dbUser = await User.findOne({ email: user.email });
      if (dbUser) {
        dbUser.recentlyViewed = [
          productId,
          ...dbUser.recentlyViewed.filter((id) => id !== productId),
        ].slice(0, 12);
        await dbUser.save();
      }
    }

    return successResponse({ recorded: true });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Bad request', 400);
  }
}
