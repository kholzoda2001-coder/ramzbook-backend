/**
 * Мантиқи ҲАЛЛИ гурӯҳи гузоришҳо — ҷудо аз маршрут, то СAНҶИДА шавад.
 *
 * Маршрут танҳо `prisma.$transaction`-ро мекушояд ва инро даъват мекунад.
 * Санҷиш ҳамонро бо `tx`-и сохта даъват мекунад — бе база.
 */

/** Мукофот барои як гузориши тасдиқшуда. */
export const GEMS_PER_REPORT = 5;

/** Он чи аз `tx` воқеан лозим аст — на тамоми Prisma. */
export interface ResolveTx {
  contentReport: {
    findMany(args: any): Promise<
      { id: string; userId: string; lessonId: string; moduleId: string | null; rewarded: boolean }[]
    >;
    updateMany(args: any): Promise<{ count: number }>;
  };
  user: {
    update(args: any): Promise<unknown>;
  };
}

export interface ResolveOutcome {
  groupSize: number;
  /// Чанд гузориш МАҲЗ ҲОЗИР мукофот гирифт. Дар зеркунии дуюм — 0.
  rewarded: number;
  gems: number;
  /// Корбароне, ки маҳз ҳозир мукофот гирифтанд — огоҳӣ танҳо ба онҳо.
  users: string[];
  lessonId: string;
  moduleId: string | null;
}

/**
 * Гурӯҳро ҳал мекунад: ҳама → `fixed`, ва ба ҳар гузориши ҳанӯз бемукофот —
 * 5 алмос.
 *
 * ⚠️ ИДЕМПОТЕНТӢ. Парчами `rewarded` (на ҳолати `status`) амалро бехатар
 * мекунад. Ҳар ду навишт шарти `rewarded: false` доранд, пас:
 *   • зеркунии ЯКУМ — ҳамаро мукофот медиҳад;
 *   • зеркунии ДУЮМ — сифр сатр меёбад, сифр алмос медиҳад, сифр огоҳӣ
 *     мефиристад.
 * Бе ин парчам зеркунии дуюм ҳамон корбаронро дубора мукофот медод.
 *
 * Ҳамчунин: агар гузориш аллакай `fixed` бошад, вале бо ягон сабаб бемукофот
 * монда бошад, ин даъват мукофоти онро мерасонад — маҳз барои ҳамин ҷустуҷӯ
 * бо `status in ('new','fixed')` меравад, на танҳо `new`.
 */
export async function resolveReportGroup(
  tx: ResolveTx,
  contentId: string,
  field: string,
): Promise<ResolveOutcome> {
  const group = await tx.contentReport.findMany({
    where: { contentId, field, status: { in: ['new', 'fixed'] } },
    select: { id: true, userId: true, lessonId: true, moduleId: true, rewarded: true },
  });

  if (group.length === 0) {
    return { groupSize: 0, rewarded: 0, gems: GEMS_PER_REPORT, users: [], lessonId: '', moduleId: null };
  }

  // 1. Ҳама → fixed.
  await tx.contentReport.updateMany({
    where: { contentId, field, status: 'new' },
    data: { status: 'fixed', resolvedAt: new Date() },
  });

  // 2. Мукофот ТАНҲО ба гузоришҳои ҳанӯз бемукофот.
  const unrewarded = group.filter((r) => !r.rewarded);
  // ⚠️ Объекти оддӣ, на `Map`: tsconfig-и лоиҳа ба ES5 нишон гирифтааст ва
  // гардиши `Map`/`Set` он ҷо иҷозат нест.
  const gemsByUser: Record<string, number> = {};
  unrewarded.forEach((r) => {
    gemsByUser[r.userId] = (gemsByUser[r.userId] ?? 0) + GEMS_PER_REPORT;
  });

  if (unrewarded.length > 0) {
    // Шарти `rewarded: false` ин ҷо ТАКРОР мешавад — то ду даъвати ҲАМЗАМОН
    // натавонанд як сатрро ду бор мукофот диҳанд.
    await tx.contentReport.updateMany({
      where: { id: { in: unrewarded.map((r) => r.id) }, rewarded: false },
      data: { rewarded: true },
    });
    for (const userId of Object.keys(gemsByUser)) {
      await tx.user.update({
        where: { id: userId },
        data: { gems: { increment: gemsByUser[userId] } },
      });
    }
  }

  return {
    groupSize: group.length,
    rewarded: unrewarded.length,
    gems: GEMS_PER_REPORT,
    users: Object.keys(gemsByUser),
    lessonId: group[0].lessonId,
    moduleId: group[0].moduleId,
  };
}
