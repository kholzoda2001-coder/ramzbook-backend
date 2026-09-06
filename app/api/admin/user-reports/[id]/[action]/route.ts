import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/admin/user-reports/[id]/[action]
 *
 * `[id]` — id-и корбари ШИКОЯТШУДА (панел аз рӯи ӯ гурӯҳбандӣ мекунад).
 * `[action]` — `actioned` | `rejected` | `ban`.
 *
 * ── Чаро амал ба ГУРӮҲ меравад ─────────────────────────────────────────────
 * Админ дар бораи ЯК шикоят қарор намегирад, балки дар бораи КОРБАР. Агар
 * ҳар сатр алоҳида баста мешуд, як корбари бад бо панҷ шикоят панҷ бор кор
 * металабид — ва чор бораш такрори ҳамон қарор мебуд.
 *
 * ⚠️ `ban` — `isActive = false`. Ин корбарро аз рейтинг, лига ва профили
 * ҷамъиятӣ мебарорад (роути профил ба ғайрифаъол 404 медиҳад), вале
 * маълумоташро НАМЕБАРАД. Пок кардани корбар қарори дигар аст ва аз панели
 * `/admin/users` мегузарад.
 */
export async function PATCH(
  _req: NextRequest,
  { params }: { params: { id: string; action: string } },
) {
  try {
    const { id, action } = params;

    if (action !== 'actioned' && action !== 'rejected' && action !== 'ban') {
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    const status = action === 'rejected' ? 'rejected' : 'actioned';

    const updated = await prisma.userReport.updateMany({
      where: { reportedId: id, status: 'new' },
      data: { status, resolvedAt: new Date() },
    });

    let banned = false;
    if (action === 'ban') {
      await prisma.user.update({ where: { id }, data: { isActive: false } });
      banned = true;
    }

    return NextResponse.json({ ok: true, closed: updated.count, banned });
  } catch (err: any) {
    console.error('[admin/user-reports PATCH]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
