import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Banner from '@/models/Banner';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from '@/lib/api-response';
import { isAdminAuthorized } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const all = new URL(request.url).searchParams.get('all') === 'true';
    const isAdmin = isAdminAuthorized(request);
    const filter = all && isAdmin ? {} : { isActive: true };
    let banners = await Banner.find(filter).sort({ sortOrder: 1, createdAt: -1 }).lean();
    if (banners.length === 0) {
      await Banner.insertMany([
        {
          title: 'Transform Your Memories',
          subtitle: 'Premium photo framing and custom prints with delivery in 3 to 5 days.',
          image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1200',
          link: '/photo-frames',
        },
        {
          title: 'Premium Adhesive Stickers',
          subtitle: 'Explore 500+ designs in anime, movies, motivation, and nature collections.',
          image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1200',
          link: '/wall-stickers',
        },
      ]);
      banners = await Banner.find({ isActive: true }).sort({ createdAt: -1 }).lean();
    }
    return successResponse(banners);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isAdminAuthorized(request)) return unauthorizedResponse();
    await dbConnect();
    const banner = await Banner.create(await request.json());
    return successResponse(banner, 201);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Bad request', 400);
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!isAdminAuthorized(request)) return unauthorizedResponse();
    await dbConnect();
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return errorResponse('Missing Banner ID');
    const banner = await Banner.findByIdAndUpdate(id, await request.json(), { new: true });
    if (!banner) return notFoundResponse('Banner not found');
    return successResponse(banner);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Bad request', 400);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!isAdminAuthorized(request)) return unauthorizedResponse();
    await dbConnect();
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return errorResponse('Missing Banner ID');
    const banner = await Banner.findByIdAndDelete(id);
    if (!banner) return notFoundResponse('Banner not found');
    return successResponse({ message: 'Banner deleted' });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Bad request', 400);
  }
}
