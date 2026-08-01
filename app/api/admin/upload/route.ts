import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export const runtime = 'nodejs';

/**
 * Small-file upload (covers, short audio). The whole file travels through this
 * function, so Vercel's ~4.5 MB request-body limit applies — anything bigger
 * must go through /api/admin/upload/blob, which uploads straight from the
 * browser to Blob storage.
 */
const MAX_BYTES = 4 * 1024 * 1024;

/** Extension → (folder, content type) for the kinds the library accepts. */
function classify(file: File): { folder: string; contentType: string } | null {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const type = file.type;

  if (type.startsWith('image/')) return { folder: 'covers', contentType: type };
  // Browsers are inconsistent about EPUB: some send application/epub+zip,
  // others octet-stream or nothing at all — so trust the extension too.
  if (type === 'application/epub+zip' || ext === 'epub') {
    return { folder: 'books', contentType: 'application/epub+zip' };
  }
  if (type.startsWith('audio/') || ext === 'mp3' || ext === 'm4a') {
    return { folder: 'audio', contentType: type || 'audio/mpeg' };
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const kind = classify(file);
    if (!kind) {
      return NextResponse.json(
        { error: 'Танҳо расм, EPUB ё аудио қабул мешавад' },
        { status: 400 },
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: 'Файл аз 4MB калон аст — роҳи бевоситаи Blob-ро истифода баред' },
        { status: 413 },
      );
    }

    // Build a sanitised, timestamped filename
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin';
    const safeName = file.name
      .replace(/\.[^.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 60);
    const filename = `${kind.folder}/${safeName}_${Date.now()}.${ext}`;

    // Upload to Vercel Blob — returns an absolute public HTTPS URL
    const blob = await put(filename, file, {
      access: 'public',
      contentType: kind.contentType,
    });

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error('[Upload] Vercel Blob error:', err);
    return NextResponse.json({ error: 'Бор кардан нашуд' }, { status: 500 });
  }
}
