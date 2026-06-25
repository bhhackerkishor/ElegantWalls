import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import SupportTicket from '@/models/SupportTicket';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from '@/lib/api-response';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const user = getUserFromRequest(request);
    if (!user || !user.email) return unauthorizedResponse();

    const searchParams = new URL(request.url).searchParams;
    const id = searchParams.get('id');
    const orderId = searchParams.get('orderId');

    const criteria: any = { customerEmail: user.email.toLowerCase() };
    if (id) criteria._id = id;
    else if (orderId) criteria.orderId = orderId;
    else return errorResponse('Missing lookup routing parameter query', 400);

    // Fetch matching instance tracking block
    const ticket = await SupportTicket.findOne(criteria).lean();
    if (!ticket) return successResponse(null); // Return empty state cleanly if unassigned

    return successResponse(ticket);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Server error', 500);
  }
}