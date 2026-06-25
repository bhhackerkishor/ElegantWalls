import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import HomepageSection, { DEFAULT_HOMEPAGE_SECTIONS } from '@/models/HomepageSection';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';
import { isAdminAuthorized } from '@/lib/auth';
import { logAdminAction } from '@/lib/admin/audit';

export async function GET() {
  try {
    await dbConnect();
    let sections = await HomepageSection.find().sort({ sortOrder: 1 }).lean();
    if (sections.length === 0) {
      await HomepageSection.insertMany(
        DEFAULT_HOMEPAGE_SECTIONS.map((s) => ({ ...s, enabled: true, config: {} }))
      );
      sections = await HomepageSection.find().sort({ sortOrder: 1 }).lean();
    }
    return successResponse(sections);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Server error', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!isAdminAuthorized(request)) return unauthorizedResponse();
    await dbConnect();
    const body = await request.json();

    if (Array.isArray(body.sections)) {
      for (const section of body.sections) {
        await HomepageSection.findOneAndUpdate(
          { key: section.key },
          { ...section, updatedAt: new Date() },
          { upsert: true }
        );
      }
      await logAdminAction(request, 'reorder', 'homepage_sections');
      const sections = await HomepageSection.find().sort({ sortOrder: 1 }).lean();
      return successResponse(sections);
    }

    const id = new URL(request.url).searchParams.get('id');
    if (!id) return errorResponse('Missing ID or sections array');
    const section = await HomepageSection.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true }
    );
    return successResponse(section);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Bad request', 400);
  }
}
