import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import SupportTicket from '@/models/SupportTicket';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';
import { getUserFromRequest } from '@/lib/auth';

function generateTicketNumber() {
  return `TKT${Date.now().toString().slice(-8)}`;
}

// GET /api/tickets - Fetch active user tickets
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const user = getUserFromRequest(request);
    if (!user || !user.email) return unauthorizedResponse();

    const tickets = await SupportTicket.find({ customerEmail: user.email.toLowerCase() })
      .sort({ updatedAt: -1 })
      .lean();

    return successResponse(tickets);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Server error', 500);
  }
}

// POST /api/tickets - Raise a new ticket
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const user = getUserFromRequest(request);
    if (!user || !user.email) return unauthorizedResponse();

    const body = await request.json();
    const { subject, message, orderId } = body;

    if (!subject || !message) {
      return errorResponse('Subject and message details are required.', 400);
    }

    const ticket = await SupportTicket.create({
      ticketNumber: generateTicketNumber(),
      customerEmail: user.email.toLowerCase(),
      customerName: (user as any).name || '',
      subject,
      orderId: orderId || undefined,
      status: 'open',
      messages: [{
        sender: 'customer',
        senderEmail: user.email.toLowerCase(),
        message: message,
        timestamp: new Date()
      }]
    });

    return successResponse(ticket, 201);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Bad request', 400);
  }
}