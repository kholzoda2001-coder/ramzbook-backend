/**
 * Admin CRUD for the library (books, audiobooks, video courses, templates).
 * Guarded by middleware.ts (`/api/admin` requires an admin token).
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const ITEM_TYPES = ['book', 'audio', 'video', 'template'] as const;
export type ItemType = (typeof ITEM_TYPES)[number];

export interface PageInput {
  order?: number;
  title?: string | null;
  content?: string;
  imageUrl?: string | null;
}

/** Shapes free-form admin input into valid page rows (drops empty ones). */
export function normalizePages(pages: unknown): Required<PageInput>[] {
  if (!Array.isArray(pages)) return [];
  return pages
    .map((p, i) => {
      const raw = (p ?? {}) as PageInput;
      return {
        order: Number.isFinite(Number(raw.order)) ? Math.floor(Number(raw.order)) : i,
        title: raw.title?.toString().trim() || null,
        content: (raw.content ?? '').toString(),
        imageUrl: raw.imageUrl?.toString().trim() || null,
      };
    })
    .filter((p) => p.content.trim().length > 0);
}

/** GET /api/admin/library[?type=book] — everything, active or not. */
export async function GET(req: NextRequest) {
  try {
    const type = req.nextUrl.searchParams.get('type');
    const items = await prisma.libraryItem.findMany({
      where: type ? { type } : {},
      orderBy: [{ type: 'asc' }, { order: 'asc' }, { createdAt: 'desc' }],
      include: { _count: { select: { pages: true } } },
    });
    return Response.json({
      items: items.map(({ _count, ...it }) => ({ ...it, pageCount: _count.pages })),
    });
  } catch (e) {
    console.error('[admin/library GET]', e);
    return Response.json({ error: 'Failed to load library' }, { status: 500 });
  }
}

/** POST /api/admin/library — create one item (optionally with pages). */
export async function POST(req: NextRequest) {
  try {
    const b = (await req.json()) as Record<string, any>;
    const title = (b.title ?? '').toString().trim();
    if (!title) return Response.json({ error: 'title required' }, { status: 400 });

    const type: string = ITEM_TYPES.includes(b.type) ? b.type : 'book';
    const pages = normalizePages(b.pages);

    const created = await prisma.libraryItem.create({
      data: {
        type,
        title,
        author: b.author?.toString().trim() || null,
        description: b.description?.toString() || null,
        coverUrl: b.coverUrl?.toString().trim() || null,
        level: b.level?.toString().trim() || null,
        targetLang: b.targetLang?.toString().trim() || null,
        mediaUrl: b.mediaUrl?.toString().trim() || null,
        durationMin: b.durationMin != null ? Math.max(0, Math.floor(Number(b.durationMin) || 0)) : null,
        rating: b.rating != null ? Number(b.rating) : null,
        isPremium: !!b.isPremium,
        isActive: b.isActive === undefined ? true : !!b.isActive,
        order: Math.floor(Number(b.order) || 0),
        ...(pages.length ? { pages: { create: pages } } : {}),
      },
      include: { _count: { select: { pages: true } } },
    });

    const { _count, ...item } = created;
    return Response.json({ item: { ...item, pageCount: _count.pages } });
  } catch (e) {
    console.error('[admin/library POST]', e);
    return Response.json({ error: 'Failed to create item' }, { status: 500 });
  }
}
