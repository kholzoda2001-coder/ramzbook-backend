/**
 * GET  /api/admin/users/[id]/access
 *   Returns every Product in the catalog, annotated with whether
 *   this user currently has isPurchased = true in UserProgress.
 *
 * POST /api/admin/users/[id]/access
 *   Body: { productId: string; grant: boolean }
 *   Grants (isPurchased=true) or revokes (isPurchased=false) access
 *   by upserting the UserProgress row — the same table the mobile app
 *   reads via /api/mobile/books/[id] and /api/mobile/library.
 *
 * Protected by ADMIN_API_KEY header:  x-admin-api-key: <value>
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function isAdmin(req: NextRequest): boolean {
  const key = req.headers.get('x-admin-api-key');
  const expected = process.env.ADMIN_API_KEY;
  if (!expected) return false; // key not configured → deny
  return key === expected;
}

// ─── GET: list all books with access status for this user ─────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const userId = params.id;

  try {
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch all active products
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        author: true,
        coverUrl: true,
        category: true,
        isFree: true,
      },
    });

    // Fetch user's progress rows (only the ones where isPurchased is set)
    const progressRows = await prisma.userProgress.findMany({
      where: { userId },
      select: { productId: true, isPurchased: true, isManualGrant: true },
    });

    const purchasedSet = new Set(
      progressRows.filter((r) => r.isPurchased).map((r) => r.productId)
    );

    const books = products.map((p) => {
      const row = progressRows.find((r) => r.productId === p.id);
      return {
        ...p,
        isPurchased: purchasedSet.has(p.id),
        isManualGrant: row?.isManualGrant ?? false,
        // If the book is free it's always accessible; reflect that
        isAccessible: p.isFree || purchasedSet.has(p.id),
      };
    });

    return NextResponse.json({ user, books });
  } catch (err) {
    console.error('[admin/users/[id]/access GET]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// ─── POST: grant or revoke access ─────────────────────────────────────────────

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const userId = params.id;

  try {
    const body = (await req.json()) as { productId?: string; grant?: boolean };
    const { productId, grant } = body;

    if (!productId || typeof grant !== 'boolean') {
      return NextResponse.json(
        { error: 'productId (string) and grant (boolean) are required.' },
        { status: 400 }
      );
    }

    // Verify both user and product exist
    const [user, product, existingProgress] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { id: true } }),
      prisma.product.findUnique({ where: { id: productId }, select: { id: true } }),
      prisma.userProgress.findUnique({ where: { userId_productId: { userId, productId } } })
    ]);

    if (!user)    return NextResponse.json({ error: 'User not found' },    { status: 404 });
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    // SAFETY LOGIC:
    // 1. Organic Purchase (isPurchased = true, isManualGrant = false):
    //    If admin tries to revoke an organic purchase, we block it to prevent accidental data loss of real purchases.
    // 2. Manual Grant (isPurchased = true, isManualGrant = true):
    //    Admin can safely revoke. isPurchased becomes false.
    // 3. Locked (both false): Admin can grant. Both become true.

    const isOrganicPurchase = existingProgress?.isPurchased && !existingProgress?.isManualGrant;

    if (!grant && isOrganicPurchase) {
      return NextResponse.json(
        { error: 'Cannot revoke: This book was organically purchased by the user. Revoking would destroy their real purchase.' },
        { status: 403 }
      );
    }

    // Upsert UserProgress
    const progress = await prisma.userProgress.upsert({
      where: { userId_productId: { userId, productId } },
      create: {
        userId,
        productId,
        isPurchased: grant,
        isManualGrant: grant,
        lastReadPageIndex: 0,
      },
      update: {
        isPurchased: grant ? true : false,
        isManualGrant: grant ? true : false,
      },
      select: { isPurchased: true, isManualGrant: true, lastReadPageIndex: true },
    });

    return NextResponse.json({
      ok: true,
      userId,
      productId,
      isPurchased: progress.isPurchased,
      isManualGrant: progress.isManualGrant,
      message: grant
        ? 'Access granted manually.'
        : 'Manual access revoked — book is locked again.',
    });
  } catch (err) {
    console.error('[admin/users/[id]/access POST]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
