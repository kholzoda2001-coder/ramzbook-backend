/**
 * Ҳуқуқи ДОИМИИ як хонанда ба воҳидҳои Китобхона.
 *
 *   GET                        → чӣ дорад + чӣ дода метавонад
 *   POST { itemId, note? }     → додан (ё зинда кардани сатри гирифташуда)
 *   DELETE { itemId }          → гирифтан (сатр НЕСТ карда намешавад)
 *
 * ── Чаро ин ҷо ҳаст ────────────────────────────────────────────────────────
 * Дастрасӣ ду ҳолат дошт: обунадор (ҳама чиз) ё не. Соҳиби маҳсулот бояд
 * як китобро ба як хонанда ДОИМӢ кушода тавонад — тӯҳфа, фурӯши берунӣ,
 * ҷуброни хато.
 *
 * ⚠️ Сатр ҳеҷ гоҳ `DELETE` намешавад. Хонанда шояд пул дода бошад, ва
 * таърихи «кӣ, кай, чаро дод» ягона роҳи ҷавоб ба шикоят аст. Гирифтан =
 * `revokedAt`, ва додани дубора ҳамон сатрро зинда мекунад.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    const [owned, items] = await Promise.all([
      prisma.entitlement.findMany({
        where: { userId: id },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, itemId: true, source: true, note: true,
          pricePaid: true, createdAt: true, revokedAt: true,
          item: { select: { title: true, type: true, targetLang: true, priceTjs: true } },
        },
      }),
      // Рӯйхати интихоб — ҳамон тартибе, ки хонанда дар раф мебинад.
      prisma.libraryItem.findMany({
        where: { isActive: true },
        orderBy: [{ type: 'asc' }, { order: 'asc' }, { createdAt: 'desc' }],
        select: {
          id: true, title: true, type: true, targetLang: true,
          isPremium: true, priceTjs: true,
        },
      }),
    ]);

    return NextResponse.json({ owned, items });
  } catch (err: any) {
    console.error('[admin/users/[id]/entitlements GET]', err?.message);
    return NextResponse.json({ error: err?.message ?? 'Хатои сервер' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const body = (await req.json().catch(() => ({}))) as {
      itemId?: string; note?: string; pricePaid?: number;
    };
    const itemId = (body.itemId ?? '').trim();
    if (!itemId) {
      return NextResponse.json({ error: '`itemId` лозим аст' }, { status: 400 });
    }

    // Ҳарду тарафро тафтиш мекунем: калиди беруна хаторо мегирифт, вале
    // паёми он барои админ хонда намешуд.
    const [user, item] = await Promise.all([
      prisma.user.findUnique({ where: { id }, select: { id: true } }),
      prisma.libraryItem.findUnique({
        where: { id: itemId },
        select: { id: true, title: true, priceTjs: true },
      }),
    ]);
    if (!user) return NextResponse.json({ error: 'Корбар ёфт нашуд' }, { status: 404 });
    if (!item) return NextResponse.json({ error: 'Воҳид ёфт нашуд' }, { status: 404 });

    const note = (body.note ?? '').trim() || null;
    // Нарх агар нишон дода нашавад — нархи витринаи воҳид. Тӯҳфа = 0.
    const pricePaid =
      typeof body.pricePaid === 'number' && Number.isFinite(body.pricePaid)
        ? Math.max(0, body.pricePaid)
        : item.priceTjs ?? null;

    // `upsert` аз рӯи ҷуфти ягона: додани дубора сатри ГИРИФТАШУДАро зинда
    // мекунад (`revokedAt: null`), на сатри дуюм месозад.
    const row = await prisma.entitlement.upsert({
      where: { userId_itemId: { userId: id, itemId } },
      create: { userId: id, itemId, source: 'admin', note, pricePaid },
      update: { revokedAt: null, source: 'admin', note, pricePaid },
      select: { id: true, itemId: true, createdAt: true, revokedAt: true },
    });

    return NextResponse.json({ ok: true, entitlement: row, title: item.title });
  } catch (err: any) {
    console.error('[admin/users/[id]/entitlements POST]', err?.message);
    return NextResponse.json({ error: err?.message ?? 'Хатои сервер' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const body = (await req.json().catch(() => ({}))) as { itemId?: string };
    const itemId = (body.itemId ?? '').trim();
    if (!itemId) {
      return NextResponse.json({ error: '`itemId` лозим аст' }, { status: 400 });
    }

    const res = await prisma.entitlement.updateMany({
      where: { userId: id, itemId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return NextResponse.json({ ok: true, revoked: res.count });
  } catch (err: any) {
    console.error('[admin/users/[id]/entitlements DELETE]', err?.message);
    return NextResponse.json({ error: err?.message ?? 'Хатои сервер' }, { status: 500 });
  }
}
