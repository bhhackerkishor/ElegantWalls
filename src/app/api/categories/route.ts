import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from '@/lib/api-response';
import { isAdminAuthorized } from '@/lib/auth';
import { invalidateCache, CACHE_KEYS } from '@/lib/cache';

// GET ALL CATEGORIES
export async function GET() {
  try {
    await dbConnect();
    const categories = await Category.find({}).sort({ createdAt: -1 }).lean();
    return successResponse(categories);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Server error', 500);
  }
}

// CREATE A NEW CATEGORY
export async function POST(request: NextRequest) {
  try {
    if (!isAdminAuthorized(request)) return unauthorizedResponse();
    await dbConnect();
    const body = await request.json();

    if (!body.name || !body.label) return errorResponse('Missing required schema fields');
    
    // Auto generate key tokens and route slug structures if missing
    if (!body.name) body.name = body.label.toLowerCase().replace(/[^a-z0-9]+/g, '');
    if (!body.slug) body.slug = body.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const category = await Category.create(body);
    invalidateCache(CACHE_KEYS.products); // Invalidate products cache if it relies on category lists
    return successResponse(category, 201);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Bad request', 400);
  }
}

// UPDATE CATEGORY
export async function PUT(request: NextRequest) {
  try {
    if (!isAdminAuthorized(request)) return unauthorizedResponse();
    await dbConnect();
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return errorResponse('Missing category lookup ID');
    
    const body = await request.json();
    const category = await Category.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!category) return notFoundResponse('Category row index target not found');
    
    return successResponse(category);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Bad request', 400);
  }
}

// DELETE CATEGORY
export async function DELETE(request: NextRequest) {
  try {
    if (!isAdminAuthorized(request)) return unauthorizedResponse();
    await dbConnect();
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return errorResponse('Missing category key configuration target parameter');
    
    const category = await Category.findByIdAndDelete(id);
    if (!category) return notFoundResponse('Category not found');
    return successResponse({ message: 'Category document node purged completely.' });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Bad request', 400);
  }
}