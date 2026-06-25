import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Settings from '@/models/Settings';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';
import { isAdminAuthorized } from '@/lib/auth';
import { logAdminAction } from '@/lib/admin/audit';

const DEFAULTS = {
  siteName: 'Elegant Walls',
  contactEmail: 'elegantwalls.prints@gmail.com',
  whatsapp: '919876543210',
  socialLinks: { instagram: 'https://www.instagram.com/elgant.walls/' },
  seoDefaults: {
    title: 'Elegant Walls | Premium Wall Decor India',
    description: 'Premium wall posters, photo frames, canvas prints & custom prints.',
    keywords: ['wall decor', 'photo frames'],
  },
  paymentSettings: { codEnabled: true, razorpayEnabled: true },
};

export async function GET() {
  try {
    await dbConnect();
    let settings = await Settings.findOne().lean();
    if (!settings) {
      settings = await Settings.create(DEFAULTS);
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
    const settings = await Settings.findOneAndUpdate(
      {},
      { ...body, updatedAt: new Date() },
      { new: true, upsert: true }
    );
    await logAdminAction(request, 'update', 'settings', String(settings._id));
    return successResponse(settings);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Bad request', 400);
  }
}
