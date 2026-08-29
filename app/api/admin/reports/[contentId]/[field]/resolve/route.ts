import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPushToUser } from '@/lib/push';
import { bumpModuleVersion } from '@/lib/contentVersion';
import { GEMS_PER_REPORT, resolveReportGroup } from '@/lib/reports';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/admin/reports/:contentId/:field/resolve
 *
 * ЯК транзаксия:
 *   1. ҳамаи гузоришҳои гурӯҳ (`status = 'new'`) → `fixed`;
 *   2. барои ҳар гузорише, ки `rewarded = false` аст — 5 алмос ба соҳибаш ва
 *      `rewarded = true`.
 *
 * ⚠️ ПАРЧАМИ `rewarded` ЧАРО ҲАСТ. Бе он зеркунии ДУЮМи «Ҳал шуд» ҳамон
 * корбаронро боз мукофот медод. Ҳоло навсозӣ бо шарти `rewarded: false`
 * иҷро мешавад, пас зеркунии дуюм СИФР сатр мегирад ва сифр алмос медиҳад.
 * Ҳамин парчам (на ҳолати `status`) амалро идемпотент мекунад: ҳатто агар
 * гузориш аллакай `fixed` бошад, вале бе мукофот монда бошад, дафъаи оянда
 * мукофоти худро мегирад.
 *
 * Алмос СЕРВЕР медиҳад, на push. Агар огоҳӣ нарасад, тавозун ба ҳар ҳол
 * ҳангоми кушодани навбатии барнома дуруст аст.
 */
export async function PATCH(
  _req: NextRequest,
  { params }: { params: { contentId: string; field: string } },
) {
  try {
    const contentId = decodeURIComponent(params.contentId);
    const field = decodeURIComponent(params.field);

    // Мантиқи худи ҳал дар `lib/reports.ts` аст — то бе база САНҶИДА шавад
    // (ниг. `scripts/test-resolve-idempotent.ts`).
    const result = await prisma.$transaction((tx) => resolveReportGroup(tx as any, contentId, field));

    if (result.groupSize === 0) {
      return NextResponse.json({ error: 'group not found' }, { status: 404 });
    }

    // ── Берун аз транзаксия ────────────────────────────────────────────────
    // Версияи бахш боло меравад, то барнома сатри кӯҳнаро аз кэш нагирад.
    await bumpModuleVersion(result.moduleId);

    // Push ба ҳар корбаре, ки МАҲЗ ҳозир мукофот гирифт. Дар зеркунии дуюм
    // `users` холӣ аст, пас такрори огоҳӣ ҳам намеравад.
    let pushed = 0;
    for (const userId of result.users) {
      const res = await sendPushToUser(
        userId,
        'Ташаккур!',
        'Хатое, ки шумо ёфтед, ислоҳ шуд. +5 алмос',
        { type: 'report_fixed', lessonId: result.lessonId, gems: String(GEMS_PER_REPORT) },
        // Ин огоҳии ТРАНЗАКСИОНӢ аст — корбар онро КОР карда ба даст овард,
        // пас лимити рӯзонаи маркетингӣ ба он дахл надорад. Вале хоҳиши
        // корбар («Огоҳномаҳо» хомӯш) ЭҲТИРОМ мешавад: алмос ба ҳар ҳол дар
        // сервер дода шудааст ва ҳангоми кушодани барнома намоён мешавад.
        { ignoreFrequencyCap: true },
      );
      pushed += res.sent ?? 0;
    }

    return NextResponse.json({
      success: true,
      groupSize: result.groupSize,
      newlyRewarded: result.rewarded,
      gemsEach: GEMS_PER_REPORT,
      usersNotified: result.users.length,
      pushesSent: pushed,
    });
  } catch (err: any) {
    console.error('[admin/reports resolve]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
