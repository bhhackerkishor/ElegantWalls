import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Notification from '@/models/Notification';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';
import { isAdminAuthorized } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    if (!isAdminAuthorized(request)) return unauthorizedResponse();
    await dbConnect();
    const unreadOnly = new URL(request.url).searchParams.get('unread') === 'true';
    const filter = unreadOnly ? { read: false } : {};
    const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(50).lean();
    const unreadCount = await Notification.countDocuments({ read: false });
    return successResponse({ notifications, unreadCount });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Server error', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!isAdminAuthorized(request)) return unauthorizedResponse();
    await dbConnect();
    const id = new URL(request.url).searchParams.get('id');
    const body = await request.json();

    if (body.markAllRead) {
      await Notification.updateMany({ read: false }, { read: true });
      return successResponse({ message: 'All marked read' });
    }

    if (!id) return errorResponse('Missing ID');
    const notification = await Notification.findByIdAndUpdate(id, body, { new: true });
    if (!notification) return errorResponse('Not found', 404);
    return successResponse(notification);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Bad request', 400);
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isAdminAuthorized(request)) return unauthorizedResponse();
    await dbConnect();
    const notification = await Notification.create(await request.json());
    return successResponse(notification, 201);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Bad request', 400);
  }
}
