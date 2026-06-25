import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Analytics from '@/models/Analytics';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';
import { isAdminAuthorized } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    if (!isAdminAuthorized(request)) return unauthorizedResponse();
    await dbConnect();

    const [pageviews, addToCart, clickBuy, customUploads, recentEvents, aggregates] = await Promise.all([
      Analytics.countDocuments({ eventType: 'pageview' }),
      Analytics.countDocuments({ eventType: 'add_to_cart' }),
      Analytics.countDocuments({ eventType: 'click_buy' }),
      Analytics.countDocuments({ eventType: 'custom_upload' }),
      Analytics.find().sort({ timestamp: -1 }).limit(100).lean(),
      Analytics.aggregate([
        { $match: { timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
        {
          $group: {
            _id: {
              day: { $dayOfMonth: '$timestamp' },
              month: { $month: '$timestamp' },
              year: { $year: '$timestamp' },
              eventType: '$eventType',
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      ]),
    ]);

    return successResponse({
      metrics: { pageviews, addToCart, clickBuy, customUploads },
      recentEvents,
      aggregates,
    });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { eventType, sessionId, details } = await request.json();
    if (!eventType || !sessionId) return errorResponse('Missing required parameters');
    const event = await Analytics.create({ eventType, sessionId, details });
    return successResponse(event, 201);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Bad request', 400);
  }
}
