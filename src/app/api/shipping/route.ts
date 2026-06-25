import dbConnect from '@/lib/db';
import ShippingSettings from '@/models/ShippingSettings';
import { DEFAULT_SHIPPING } from '@/lib/constants';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';
import { isAdminAuthorized } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function GET() {
  try {
    await dbConnect();
    let settings = await ShippingSettings.findOne().lean();
    if (!settings) {
      settings = await ShippingSettings.create(DEFAULT_SHIPPING);
    }
    return successResponse(settings);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Server error', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!isAdminAuthorized(request)) return unauthorizedResponse();
    await dbConnect();
    const body = await request.json();
    const settings = await ShippingSettings.findOneAndUpdate(
      {},
      { ...body, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    return successResponse(settings);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Bad request', 400);
  }
}
