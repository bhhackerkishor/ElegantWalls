import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';
import { getUserFromRequest } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return unauthorizedResponse('Please login first.');

    await dbConnect();
    const dbUser = await User.findOne({ email: user.email }).select('-otp -otpExpiry').lean();
    if (!dbUser) return notFoundResponse('User not found');
    return successResponse(dbUser);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Server error', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return unauthorizedResponse('Please login first.');

    await dbConnect();
    const body = await request.json();
    const dbUser = await User.findOne({ email: user.email });
    if (!dbUser) return notFoundResponse('User not found');

    if (body.name !== undefined) dbUser.name = body.name;
    if (body.phone !== undefined) dbUser.phone = body.phone;
    if (body.address !== undefined) dbUser.address = body.address;
    if (body.city !== undefined) dbUser.city = body.city;
    if (body.state !== undefined) dbUser.state = body.state;
    if (body.zipCode !== undefined) dbUser.zipCode = body.zipCode;
    if (body.marketingEmails !== undefined) dbUser.marketingEmails = body.marketingEmails;
    if (body.cart !== undefined) dbUser.cart = body.cart;
    await dbUser.save();
    return successResponse(dbUser);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Server error', 500);
  }
}
