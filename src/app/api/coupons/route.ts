import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Coupon from '@/models/Coupon';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from '@/lib/api-response';
import { isAdminAuthorized } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const code = new URL(request.url).searchParams.get('code');

    if (!code) {
      if (!isAdminAuthorized(request)) return unauthorizedResponse();
      let coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
      if (coupons.length === 0) {
        await Coupon.create({
          code: 'WELCOME10',
          discountType: 'percentage',
          discountValue: 10,
          minOrderValue: 500,
          isActive: true,
        });
        coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
      }
      return successResponse(coupons);
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() }).lean();
    if (!coupon) return notFoundResponse('Coupon code not found');
    if (!coupon.isActive) return errorResponse('Coupon code is inactive');
    return NextResponse.json({ success: true, coupon });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isAdminAuthorized(request)) return unauthorizedResponse();
    await dbConnect();
    const coupon = await Coupon.create(await request.json());
    return successResponse(coupon, 201);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Bad request', 400);
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!isAdminAuthorized(request)) return unauthorizedResponse();
    await dbConnect();
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return errorResponse('Missing ID');
    const coupon = await Coupon.findByIdAndUpdate(id, await request.json(), { new: true });
    if (!coupon) return notFoundResponse('Coupon not found');
    return successResponse(coupon);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Bad request', 400);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!isAdminAuthorized(request)) return unauthorizedResponse();
    await dbConnect();
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return errorResponse('Missing ID');
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) return notFoundResponse('Coupon not found');
    return successResponse({ message: 'Coupon deleted' });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Bad request', 400);
  }
}
