import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import AuditLog from '@/models/AuditLog';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';
import { isAdminAuthorized } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    if (!isAdminAuthorized(request)) return unauthorizedResponse();
    await dbConnect();
    const page = parseInt(new URL(request.url).searchParams.get('page') || '1', 10);
    const limit = parseInt(new URL(request.url).searchParams.get('limit') || '50', 10);
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      AuditLog.countDocuments(),
    ]);

    return successResponse({ logs, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Server error', 500);
  }
}
