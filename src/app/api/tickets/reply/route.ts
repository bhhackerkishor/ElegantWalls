import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import SupportTicket from '@/models/SupportTicket';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from '@/lib/api-response';
import { getUserFromRequest } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const user = getUserFromRequest(request);
    if (!user || !user.email) return unauthorizedResponse();

    const id = new URL(request.url).searchParams.get('id');
    if (!id) return errorResponse('Missing Ticket ID parameter', 400);

    const { reply } = await request.json();
    if (!reply?.trim()) return errorResponse('Response statement required', 400);

    const ticket = await SupportTicket.findOne({ _id: id, customerEmail: user.email.toLowerCase() });
    if (!ticket) return notFoundResponse('Ticket object data not found');
    if (ticket.status === 'resolved') return errorResponse('Resolved tickets are locked against modifications', 400);

    // Append response frame
    ticket.messages.push({
      sender: 'customer',
      senderEmail: user.email.toLowerCase(),
      message: reply,
      timestamp: new Date(),
    });
    
    ticket.status = 'open'; // Reset status context flags back to agent queue
    ticket.updatedAt = new Date();
    await ticket.save();

    return successResponse(ticket);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Server error', 500);
  }
}