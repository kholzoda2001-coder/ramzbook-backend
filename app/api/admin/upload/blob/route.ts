import { NextRequest, NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';

export const runtime = 'nodejs';

/**
 * Client-side upload handshake for LARGE library files (EPUB books, audiobooks).
 *
 * Why this exists: a Vercel serverless function can only receive ~4.5 MB of
 * request body, so pushing an EPUB or an audiobook through /api/admin/upload
 * fails. Here the browser asks us for a short-lived token and then uploads the
 * bytes DIRECTLY to Blob storage, so the file never passes through the function
 * and the size limit does not apply.
 *
 * Admin auth is enforced upstream by middleware.ts (`/api/admin` requires the
 * admin cookie), so reaching this handler already means the caller is an admin.
 */
const MAX_BYTES = 60 * 1024 * 1024; // 60 MB — plenty for an EPUB or an audiobook

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as HandleUploadBody;

    const result = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        const isEpub = pathname.toLowerCase().endsWith('.epub');
        return {
          allowedContentTypes: isEpub
            ? ['application/epub+zip', 'application/octet-stream', 'application/zip']
            : ['audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'application/octet-stream'],
          maximumSizeInBytes: MAX_BYTES,
          // Keep the original name readable but never let two uploads collide.
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log('[Upload/blob] stored', blob.pathname, blob.url);
      },
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error('[Upload/blob] error:', err);
    return NextResponse.json(
      { error: (err as Error)?.message ?? 'Бор кардан нашуд' },
      { status: 400 },
    );
  }
}
