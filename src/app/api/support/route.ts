import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import SupportTicket from '@/models/SupportTicket';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from '@/lib/api-response';
import { isAdminAuthorized, getUserFromRequest } from '@/lib/auth';
import { logAdminAction } from '@/lib/admin/audit';

function generateTicketNumber() {
  return `TKT${Date.now().toString().slice(-8)}`;
}

export async function GET(request: NextRequest) {
  try {
    if (!isAdminAuthorized(request)) return unauthorizedResponse();
    await dbConnect();
    const status = new URL(request.url).searchParams.get('status') as 'open' | 'pending' | 'resolved' | null;
    const filter = status ? { status } : {};
    const tickets = await SupportTicket.find(filter as Record<string, string>).sort({ updatedAt: -1 }).lean();
    return successResponse(tickets);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isAdminAuthorized(request)) return unauthorizedResponse();
    await dbConnect();
    const body = await request.json();
    const ticket = await SupportTicket.create({
      ...body,
      ticketNumber: generateTicketNumber(),
      messages: body.messages || [],
    });
    await logAdminAction(request, 'create', 'support_ticket', String(ticket._id));
    return successResponse(ticket, 201);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Bad request', 400);
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!isAdminAuthorized(request)) return unauthorizedResponse();
    await dbConnect();
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return errorResponse('Missing ID');
    const body = await request.json();
    const user = getUserFromRequest(request);

    if (body.reply) {
      const ticket = await SupportTicket.findById(id);
      if (!ticket) return notFoundResponse('Ticket not found');
      ticket.messages.push({
        sender: 'admin',
        senderEmail: user?.email || 'admin',
        message: body.reply,
        timestamp: new Date(),
      });
      ticket.status = body.status || ticket.status;
      ticket.internalNotes = body.internalNotes ?? ticket.internalNotes;
      ticket.updatedAt = new Date();
      await ticket.save();
      await logAdminAction(request, 'reply', 'support_ticket', id);
      return successResponse(ticket);
    }

    const ticket = await SupportTicket.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true }
    );
    if (!ticket) return notFoundResponse('Ticket not found');
    await logAdminAction(request, 'update', 'support_ticket', id);
    return successResponse(ticket);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Bad request', 400);
  }
}
