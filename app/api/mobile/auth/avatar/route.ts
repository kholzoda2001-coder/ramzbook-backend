/**
 * POST /api/mobile/auth/avatar
 * Authorization: Bearer <accessToken>
 * Body: raw image bytes (Content-Type: image/jpeg | image/png | image/webp)
 *
 * Uploads the user's profile photo to Vercel Blob and stores the public URL in
 * `user.avatarUrl`. Returns { avatarUrl }.
 *
 * Requires a Vercel Blob store connected to the project (env
 * BLOB_READ_WRITE_TOKEN is injected automatically once you create one in the
 * Vercel dashboard → Storage → Blob).
 */
import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { prisma } from '@/lib/prisma';
import { requireUserId } from '@/lib/auth';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const dynamic = 'force-dynamic';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest) {
  const userId = requireUserId(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: CORS });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'Avatar storage not configured (create a Vercel Blob store).' },
      { status: 503, headers: CORS },
    );
  }

  try {
    const contentType = (req.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase();
    const ext = ALLOWED[contentType];
    if (!ext) {
      return NextResponse.json(
        { error: 'Unsupported image type. Use JPEG, PNG or WEBP.' },
        { status: 415, headers: CORS },
      );
    }

    const bytes = Buffer.from(await req.arrayBuffer());
    if (bytes.length === 0) {
      return NextResponse.json({ error: 'Empty image.' }, { status: 400, headers: CORS });
    }
    if (bytes.length > MAX_BYTES) {
      return NextResponse.json({ error: 'Image too large (max 5 MB).' }, { status: 413, headers: CORS });
    }

    // A fresh, unique path each upload so the CDN never serves a stale cached
    // photo after a change. `addRandomSuffix` also avoids collisions.
    const blob = await put(`avatars/${userId}-${Date.now()}.${ext}`, bytes, {
      access: 'public',
      contentType,
      addRandomSuffix: true,
    });

    await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: blob.url },
    });

    return NextResponse.json({ avatarUrl: blob.url }, { status: 200, headers: CORS });
  } catch (err) {
    console.error('[auth/avatar POST]', err);
    return NextResponse.json({ error: 'Failed to upload avatar.' }, { status: 500, headers: CORS });
  }
}
