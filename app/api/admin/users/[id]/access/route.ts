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
 * Protected by the admin panel session (AdminShell layout).
 * No custom API key header required.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ─── GET: list all books with access status for this user ─────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = params.id;

  try {
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, vipExpiresAt: true },
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

    // Fetch user's progress rows
    const progressRows = await prisma.userProgress.findMany({
      where: { userId },
      select: { productId: true, isPurchased: true, isManualGrant: true, expiresAt: true },
    });

    const isVip = !!(user.vipExpiresAt && new Date(user.vipExpiresAt).getTime() > Date.now());

    const books = products.map((p) => {
      const row = progressRows.find((r) => r.productId === p.id);
      
      let isPurchased = false;
      if (row?.isPurchased && (!row.expiresAt || new Date(row.expiresAt).getTime() > Date.now())) {
        isPurchased = true;
      }

      return {
        ...p,
        isPurchased,
        isManualGrant: row?.isManualGrant ?? false,
        expiresAt: row?.expiresAt ?? null,
        // If free, VIP, or organically/manually active, it's accessible
        isAccessible: p.isFree || isVip || isPurchased,
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
  const userId = params.id;

  try {
    const body = await req.json();
    const { action, productId, reason } = body as { action?: string; productId?: string; reason?: string };

    if (!action) {
      return NextResponse.json({ error: 'Action is required.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // ── VIP Actions ──
    if (action === 'grant_vip' || action === 'revoke_vip') {
      let vipExpiresAt: Date | null = null;
      if (action === 'grant_vip') {
        vipExpiresAt = new Date();
        vipExpiresAt.setMonth(vipExpiresAt.getMonth() + 1); // 1 month from now
      }
      await prisma.user.update({
        where: { id: userId },
        data: { 
          vipExpiresAt,
          vipGrantReason: action === 'grant_vip' ? (reason || 'Admin manual grant') : null
        }
      });
      return NextResponse.json({ ok: true, message: action === 'grant_vip' ? 'VIP granted for 1 month.' : 'VIP revoked.' });
    }

    // ── Book Actions ──
    if (!productId) {
      return NextResponse.json({ error: 'productId is required for book actions.' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const existingProgress = await prisma.userProgress.findUnique({ where: { userId_productId: { userId, productId } } });
    const isOrganicPurchase = existingProgress?.isPurchased && !existingProgress?.isManualGrant;

    if (action === 'revoke') {
      if (isOrganicPurchase) {
        return NextResponse.json({ error: 'Cannot revoke: organically purchased.' }, { status: 403 });
      }
      await prisma.userProgress.update({
        where: { userId_productId: { userId, productId } },
        data: { isPurchased: false, isManualGrant: false, expiresAt: null, grantReason: null }
      });
      return NextResponse.json({ ok: true, message: 'Access revoked.' });
    }

    if (action === 'grant_6m' || action === 'grant_1y') {
      let expiresAt: Date | null = null;
      if (action === 'grant_6m') {
        expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 6);
      } else if (action === 'grant_1y') {
        expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      }

      const progress = await prisma.userProgress.upsert({
        where: { userId_productId: { userId, productId } },
        create: {
          userId,
          productId,
          isPurchased: true,
          isManualGrant: true,
          grantReason: reason || 'Admin manual grant',
          expiresAt,
          lastReadPageIndex: 0,
        },
        update: {
          isPurchased: true,
          isManualGrant: true,
          grantReason: reason || 'Admin manual grant',
          expiresAt,
        },
        select: { isPurchased: true, isManualGrant: true, expiresAt: true, grantReason: true },
      });

      return NextResponse.json({ ok: true, message: action === 'grant_6m' ? 'Granted for 6 months.' : 'Granted for 1 year.' });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    console.error('[admin/users/[id]/access POST]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
