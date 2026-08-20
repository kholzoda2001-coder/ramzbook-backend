/**
 * lib/pushSegments.ts — «кӣ бояд ин паёмро гирад».
 *
 * Як ҷои ягона, ки филтрҳои панели админро ба дархости Prisma табдил медиҳад.
 * Ҳамон филтрҳо ҳам барои кампанияи АВТОМАТӢ, ҳам барои фиристодани ДАСТӢ
 * кор мекунанд — то ҳисоби «чанд нафар мегиранд» ҳамеша бо фиристодани воқеӣ
 * мувофиқ ояд.
 *
 * Ду шарт ҲАМЕША илова мешаванд ва аз панел хомӯш намешаванд:
 *   • корбар дастгоҳи сабтшуда дорад (`deviceTokens`);
 *   • корбар огоҳиро хомӯш накардааст (`pushEnabled`).
 */
import type { Prisma } from '@prisma/client';
import { prisma } from './prisma';

export type Segment = {
  /** Забони интерфейс: ['tg','ru'] — холӣ/недоступно = ҳама. */
  langs?: string[] | null;
  /** free | premium | null=ҳама */
  tier?: string | null;
  /** yes = имрӯз хондааст, no = нахондааст, null = фарқ надорад */
  studiedToday?: string | null;
  minStreak?: number | null;
  maxStreak?: number | null;
  /** Рӯзҳои ғайрифаъолӣ (аз `lastActiveAt`). */
  minInactiveDays?: number | null;
  maxInactiveDays?: number | null;
  levels?: string[] | null;
  countries?: string[] | null;
};

/** "tg,ru" → ['tg','ru'] (холӣ → null). */
export function parseList(v: string | null | undefined): string[] | null {
  if (!v) return null;
  const arr = v.split(',').map((s) => s.trim()).filter(Boolean);
  return arr.length ? arr : null;
}

/** ['tg','ru'] → "tg,ru" (холӣ → null). */
export function joinList(v: string[] | null | undefined): string | null {
  if (!v || v.length === 0) return null;
  return v.join(',');
}

/**
 * Оғози «имрӯз» бо вақти МАҲАЛЛИИ кампания, ҳамчун лаҳзаи UTC.
 *
 * Чаро маҳаллӣ: админ мегӯяд «онҳое, ки ИМРӮЗ нахондаанд» ва имрӯзи ӯ бо
 * соати Душанбе аст, на бо UTC.
 *
 * ⚠️ Диққат: муҳаррики силсила (`lib/xp.ts`) рӯзро бо UTC мешуморад, пас
 * марзи «рӯз» дар он ҷо 00:00 UTC = 05:00 Душанбе аст. Ин фарқ дидаву дониста
 * монда шудааст: барои матни push «имрӯз»-и корбар муҳимтар аст.
 */
export function localDayStart(now: Date, tzOffsetMin: number): Date {
  const shifted = new Date(now.getTime() + tzOffsetMin * 60_000);
  const midnightShifted = Date.UTC(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth(),
    shifted.getUTCDate(),
  );
  return new Date(midnightShifted - tzOffsetMin * 60_000);
}

/**
 * Филтрҳоро ба `where`-и Prisma табдил медиҳад.
 * [tzOffsetMin] барои марзи «имрӯз» истифода мешавад.
 */
export function buildWhere(
  seg: Segment,
  tzOffsetMin = 300,
  now = new Date(),
): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = {
    pushEnabled: true,
    deviceTokens: { some: {} },
    // Ҳисобҳои санҷишии seed-ро ҳамон тавре истисно мекунем, ки лидерборд ва
    // аналитика мекунанд — вагарна ҳисоби «чанд нафар» дурӯғ мешавад.
    NOT: { name: { startsWith: 'Test User' } },
  };

  if (seg.langs?.length) where.interfaceLang = { in: seg.langs };
  if (seg.levels?.length) where.level = { in: seg.levels };
  if (seg.countries?.length) where.country = { in: seg.countries };

  if (seg.tier === 'premium') where.subscriptionTier = 'premium';
  else if (seg.tier === 'free') where.subscriptionTier = { not: 'premium' };

  if (seg.minStreak != null || seg.maxStreak != null) {
    where.streak = {
      ...(seg.minStreak != null ? { gte: seg.minStreak } : {}),
      ...(seg.maxStreak != null ? { lte: seg.maxStreak } : {}),
    };
  }

  // Ғайрифаъолӣ: «на камтар аз N рӯз» = lastActiveAt то (ҳозир − N рӯз).
  if (seg.minInactiveDays != null || seg.maxInactiveDays != null) {
    const t = now.getTime();
    where.lastActiveAt = {
      ...(seg.minInactiveDays != null
        ? { lt: new Date(t - seg.minInactiveDays * 86_400_000) }
        : {}),
      ...(seg.maxInactiveDays != null
        ? { gte: new Date(t - (seg.maxInactiveDays + 1) * 86_400_000) }
        : {}),
    };
  }

  // «Имрӯз хондааст / нахондааст» — аз рӯи `lastActiveDate` (онро танҳо хатми
  // дарс мегузорад, на кушодани барнома).
  if (seg.studiedToday === 'yes' || seg.studiedToday === 'no') {
    const dayStart = localDayStart(now, tzOffsetMin);
    where.lastActiveDate =
      seg.studiedToday === 'yes'
        ? { gte: dayStart }
        : { lt: dayStart };
    if (seg.studiedToday === 'no') {
      // Онҳое, ки ҳеҷ гоҳ дарс нахондаанд (`null`), ҳам «имрӯз нахондаанд».
      where.OR = [{ lastActiveDate: { lt: dayStart } }, { lastActiveDate: null }];
      delete where.lastActiveDate;
    }
  }

  return where;
}

/** Чанд корбар ба ин сегмент мувофиқ аст. */
export function countSegment(seg: Segment, tzOffsetMin = 300, now = new Date()) {
  return prisma.user.count({ where: buildWhere(seg, tzOffsetMin, now) });
}

/** ID-ҳои корбарони сегмент (бо ҳадди боло, то job аз лимити вақт набарояд). */
export async function listSegmentUserIds(
  seg: Segment,
  limit: number,
  tzOffsetMin = 300,
  now = new Date(),
): Promise<string[]> {
  const rows = await prisma.user.findMany({
    where: buildWhere(seg, tzOffsetMin, now),
    select: { id: true },
    orderBy: { lastActiveAt: 'desc' },
    take: limit,
  });
  return rows.map((r) => r.id);
}

/** Тақсимоти сегмент аз рӯи забон — барои панел («tg: 120, ru: 30»). */
export async function segmentByLang(seg: Segment, tzOffsetMin = 300, now = new Date()) {
  const rows = await prisma.user.groupBy({
    by: ['interfaceLang'],
    where: buildWhere(seg, tzOffsetMin, now),
    _count: { _all: true },
  });
  return rows.map((r) => ({ lang: r.interfaceLang, count: r._count._all }));
}
