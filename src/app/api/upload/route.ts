import { NextRequest } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { successResponse, errorResponse } from '@/lib/api-response';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || !(file instanceof Blob)) return errorResponse('No file uploaded');

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ resource_type: 'auto', folder: 'elegant-walls', format: 'webp' }, (error, result) => {
          if (error) reject(error);
          else resolve(result as { secure_url: string });
        })
        .end(buffer);
    });

    return successResponse({ url: uploadResult.secure_url });
  } catch (error) {
    console.error('Upload error:', error);
    if (process.env.CLOUDINARY_API_KEY === 'placeholder' || !process.env.CLOUDINARY_API_KEY) {
      return successResponse({
        url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600',
        note: 'Fallback placeholder used',
      });
    }
    return errorResponse(error instanceof Error ? error.message : 'Upload failed', 500);
  }
}
