/**
 * Admin: read learner feedback. Guarded by middleware.ts (`/api/admin`).
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/feedback?rating=5&q=text&skip=0&take=50&unreadOnly=1
 * Newest first, with the author's name/email joined in.
 */
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const take = Math.min(200, Math.max(1, Number(sp.get('take')) || 50));
    const skip = Math.max(0, Number(sp.get('skip')) || 0);
    const rating = sp.get('rating') ? Number(sp.get('rating')) : null;
    const q = (sp.get('q') ?? '').trim();
    const unreadOnly = sp.get('unreadOnly') === '1';

    const where = {
      ...(rating && rating >= 1 && rating <= 5 ? { rating } : {}),
      ...(unreadOnly ? { isRead: false } : {}),
      ...(q ? { message: { contains: q, mode: 'insensitive' as const } } : {}),
    };

    const [items, total, unread, avg] = await Promise.all([
      prisma.feedback.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: { user: { select: { id: true, name: true, email: true, phone: true } } },
      }),
      prisma.feedback.count({ where }),
      prisma.feedback.count({ where: { isRead: false } }),
      prisma.feedback.aggregate({ _avg: { rating: true }, _count: { rating: true } }),
    ]);

    return Response.json({
      items,
      total,
      unread,
      averageRating: avg._avg.rating,
      totalAll: avg._count.rating,
    });
  } catch (e) {
    console.error('[admin/feedback GET]', e);
    return Response.json({ error: 'Failed to load feedback' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/feedback  Body: { id, isRead }
 * Marks one entry read/unread so a growing list stays triageable.
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = (await req.json()) as { id?: string; isRead?: boolean };
    if (!body.id) return Response.json({ error: 'id required' }, { status: 400 });
    const updated = await prisma.feedback.update({
      where: { id: body.id },
      data: { isRead: body.isRead ?? true },
      select: { id: true, isRead: true },
    });
    return Response.json(updated);
  } catch (e) {
    console.error('[admin/feedback PATCH]', e);
    return Response.json({ error: 'Failed to update' }, { status: 500 });
  }
}
