import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { signToken, isAdminEmail } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { email, otp } = await request.json();
    if (!email || !otp) return errorResponse('Email and OTP are required', 400);

    const user = await User.findOne({ email });
    if (!user) return errorResponse('User not found', 404);
    
    // 1. Check if the user even has an OTP generated
    if (!user.otp) return errorResponse('No OTP requested or code already used', 400);

    // 2. Type-safe string comparison to prevent Number vs String mismatches
    if (String(user.otp).trim() !== String(otp).trim()) {
      return errorResponse('Invalid OTP code', 400);
    }
    
    // 3. Expiry validation
    if (!user.otpExpiry || new Date() > user.otpExpiry) {
      return errorResponse('OTP has expired', 400);
    }

    // Clear OTP details so it cannot be reused
    if (isAdminEmail(user.email)) {
      user.role = 'admin';
    }

    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role === 'admin' ? 'admin' : 'customer',
    });

    const response = successResponse({
      message: 'Login successful',
      user: { id: user._id, email: user.email, role: user.role },
      token,
    });

    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Server error', 500);
  }
}