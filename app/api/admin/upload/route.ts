import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are accepted' }, { status: 400 });
    }

    // Build a sanitised, timestamped filename
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const safeName = file.name
      .replace(/\.[^.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 60);
    const filename = `books/${safeName}_${Date.now()}.${ext}`;

    // Upload to Vercel Blob — returns an absolute public HTTPS URL
    const blob = await put(filename, file, {
      access: 'public',
      contentType: file.type,
    });

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error('[Upload] Vercel Blob error:', err);
    return NextResponse.json({ error: 'Image upload failed' }, { status: 500 });
  }
}
