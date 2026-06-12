import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId, unauthorized, apiError } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/mobile/preferences
 * Body: { nativeLang?, targetLang?, currentCourseId?, level? }
 * Persists the user's language pair + current course.
 */
export async function PATCH(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    if (!userId) return unauthorized('Missing or invalid Bearer token.');

    const body = await req.json() as {
      nativeLang?: string;
      targetLang?: string | null;
      currentCourseId?: string;
      level?: string;
    };

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(body.nativeLang !== undefined && {
          nativeLang: body.nativeLang,
          interfaceLang: body.nativeLang,
        }),
        ...(body.targetLang !== undefined && {
          targetLang: body.targetLang,
          ...(body.targetLang === null && { currentCourseId: null }),
        }),
        ...(body.currentCourseId !== undefined && { currentCourseId: body.currentCourseId }),
        ...(body.level !== undefined && { level: body.level }),
      },
      select: {
        nativeLang: true, interfaceLang: true, targetLang: true,
        currentCourseId: true, level: true,
      },
    });

    return NextResponse.json({ success: true, preferences: user });
  } catch (err) {
    console.error('[mobile/preferences]', err);
    return apiError('Failed to update preferences');
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
