import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import AuditLog from '@/models/AuditLog';
import { getUserFromRequest } from '@/lib/auth';

export async function logAdminAction(
  request: NextRequest,
  action: string,
  entity: string,
  entityId?: string,
  details?: Record<string, unknown>
) {
  try {
    await dbConnect();
    const user = getUserFromRequest(request);
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    await AuditLog.create({
      action,
      entity,
      entityId,
      adminEmail: user?.email || 'system',
      details,
      ipAddress: ip,
    });
  } catch {
    // Non-blocking audit logging
  }
}
