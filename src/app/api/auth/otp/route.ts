import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { isAdminEmail } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { transporter } from '@/lib/mail';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const email = body?.email;
    if (!email) return errorResponse('Email is required', 400);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Save/Update user OTP
    const role = isAdminEmail(email) ? 'admin' : 'customer';

    await User.findOneAndUpdate(
      { email },
      { otp, otpExpiry, role },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    let emailSent = false;

    // Use the cached global transporter setup
    if (transporter) {
      try {
        await transporter.sendMail({
          from: `"Elegant Walls" <${process.env.SMTP_USER}>`,
          to: email,
          subject: 'Your Elegant Walls OTP Code',
          text: `Your login OTP code is: ${otp}. It will expire in 10 minutes.`,
        });
        emailSent = true;
      } catch (err) {
        console.error('SMTP Delivery failed:', err);
      }
    } else {
      console.log(`[OTP SIMULATION] ${email} | OTP: ${otp}`);
    }

    return successResponse({
      simulated: !emailSent,
      simulatedOtp: !emailSent ? otp : undefined,
      message: emailSent ? 'OTP sent successfully.' : 'OTP generated (simulation mode).',
    });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Server error', 500);
  }
}