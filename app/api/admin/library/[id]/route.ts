/**
 * Admin: read / update / delete one library item.
 * Guarded by middleware.ts (`/api/admin` requires an admin token).
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ITEM_TYPES, normalizePages } from '../route';

export const dynamic = 'force-dynamic';

/** GET — the item with all its pages, for the editor. */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const item = await prisma.libraryItem.findUnique({
      where: { id: params.id },
      include: { pages: { orderBy: { order: 'asc' } } },
    });
    if (!item) return Response.json({ error: 'Not found' }, { status: 404 });
    return Response.json({ item });
  } catch (e) {
    console.error('[admin/library/[id] GET]', e);
    return Response.json({ error: 'Failed to load item' }, { status: 500 });
  }
}

/**
 * PUT — update fields, and (when `pages` is present) replace the whole page
 * set. Replacing wholesale keeps the editor honest: what the admin sees in the
 * list is exactly what gets stored, with no orphaned rows to reconcile.
 */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const b = (await req.json()) as Record<string, any>;

    const data: Record<string, any> = {};
    if (b.type !== undefined && ITEM_TYPES.includes(b.type)) data.type = b.type;
    if (b.title !== undefined) {
      const t = b.title.toString().trim();
      if (!t) return Response.json({ error: 'title cannot be empty' }, { status: 400 });
      data.title = t;
    }
    if (b.author !== undefined) data.author = b.author?.toString().trim() || null;
    if (b.description !== undefined) data.description = b.description?.toString() || null;
    if (b.coverUrl !== undefined) data.coverUrl = b.coverUrl?.toString().trim() || null;
    if (b.level !== undefined) data.level = b.level?.toString().trim() || null;
    if (b.targetLang !== undefined) data.targetLang = b.targetLang?.toString().trim() || null;
    if (b.mediaUrl !== undefined) data.mediaUrl = b.mediaUrl?.toString().trim() || null;
    if (b.durationMin !== undefined) {
      data.durationMin = b.durationMin == null ? null : Math.max(0, Math.floor(Number(b.durationMin) || 0));
    }
    if (b.rating !== undefined) data.rating = b.rating == null ? null : Number(b.rating);
    if (b.isPremium !== undefined) data.isPremium = !!b.isPremium;
    if (b.isActive !== undefined) data.isActive = !!b.isActive;
    if (b.order !== undefined) data.order = Math.floor(Number(b.order) || 0);

    const hasPages = b.pages !== undefined;
    const pages = hasPages ? normalizePages(b.pages) : [];

    const item = await prisma.$transaction(async (tx) => {
      await tx.libraryItem.update({ where: { id: params.id }, data });
      if (hasPages) {
        await tx.libraryPage.deleteMany({ where: { itemId: params.id } });
        if (pages.length) {
          await tx.libraryPage.createMany({
            data: pages.map((p) => ({ ...p, itemId: params.id })),
          });
        }
      }
      return tx.libraryItem.findUnique({
        where: { id: params.id },
        include: { pages: { orderBy: { order: 'asc' } } },
      });
    });

    return Response.json({ item });
  } catch (e) {
    console.error('[admin/library/[id] PUT]', e);
    return Response.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

/** DELETE — removes the item; its pages cascade (see schema.prisma). */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.libraryItem.delete({ where: { id: params.id } });
    return Response.json({ ok: true });
  } catch (e) {
    console.error('[admin/library/[id] DELETE]', e);
    return Response.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
