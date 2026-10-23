import { Prisma } from '@prisma/client';
import { prisma } from './prisma';
import { realUserSql } from './admin/realUser';

/**
 * Лига = РЕЙТИНГИ ҲАФТА (12.10.2026, қарори соҳиби маҳсулот).
 *
 * ── Чаро ин тарз ──────────────────────────────────────────────────────────
 * Аз 19.09 то 12.10 ин ҷо рейтинги ТАМОМИ XP буд («то 1000 корбар»), вале
 * барнома ба хонанда ҳамоно «ҳафта», «10-и боло боло мераванд» ва «мукофот»
 * ваъда медод. Натиҷаи воқеӣ (12.10): барои 30-и боло 3774 XP лозим буд, аз
 * 30 нафар танҳо 8 нафар дар 2 ҳафтаи охир фаъол буданд, ҷои хонандаи берун
 * аз 30 ҳамеша «31» менамуд ва таби «Дӯстон» ҳамеша холӣ буд.
 *
 * Акнун:
 *   • ЯК ҷадвали умумӣ — XP-и ҲАМИН ҳафта аз `DailyXp`; ҳар душанбе 00:00 UTC
 *     (05:00 Душанбе) худ ба худ аз сифр (ҳафта аз сана ҳисоб мешавад — на cron
 *     лозим, на «бастан»);
 *   • ҷои ВОҚЕИИ ҳар кас (масалан 47-ум), на «31»;
 *   • `scope: 'all'` — ҳамон ҷадвал аз рӯи `totalXp` (фахри пешсафони кӯҳна);
 *   • дӯстон = графи `FriendInvite`, XP-и ҳамин ҳафта;
 *   • зинаҳо, боло/поён рафтан ва мукофот НЕСТАНД. Майдонҳои `tier`,
 *     `promoteCutoff`, `demoteCutoff` барои барномаҳои КӮҲНАИ насбшуда
 *     бетараф мемонанд (1 / 0 / memberCount → ягон хатти ҷудокунанда нест).
 *
 * Ҳисобҳои роботи Google ва `Test User`-ҳо (`realUserSql`) дар ҷадвал нестанд.
 * Низоми кӯҳнаи когортаҳо: `lib/league_cohort.ts.bak`.
 */

export const BOARD_SIZE = 30;
export const MIN_TIER = 1;

export type LeagueScope = 'week' | 'all';

const DAY_MS = 86_400_000;

function utcMidnight(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/** Душанбеи ҳамин ҳафта (UTC), `YYYY-MM-DD`. `DailyXp.date` низ рӯзи UTC аст. */
export function weekKeyFor(now: Date = new Date()): string {
  const midnight = utcMidnight(now);
  const daysSinceMonday = (midnight.getUTCDay() + 6) % 7;
  return new Date(midnight.getTime() - daysSinceMonday * DAY_MS).toISOString().slice(0, 10);
}

export function weekEndsAt(weekKey: string): Date {
  return new Date(new Date(`${weekKey}T00:00:00.000Z`).getTime() + 7 * DAY_MS);
}

export function secondsUntilWeekEnd(weekKey: string, now: Date = new Date()): number {
  return Math.max(0, Math.floor((weekEndsAt(weekKey).getTime() - now.getTime()) / 1000));
}

/**
 * Барои мутобиқат бо `awardXp`/`achievements`: XP-и ҳафта аз `DailyXp` хонда
 * мешавад, пас ин ҷо коре нест. Ҳеҷ гоҳ намепартояд.
 */
export async function addWeeklyXp(_userId: string, _amount: number, _now: Date = new Date()) {}

/** Ҳафта аз сана ҳисоб мешавад — бастан лозим нест (cron ва роҳи танбал). */
export async function catchUpClosedWeeks(..._args: unknown[]) {
  return 0;
}

// ── Хатти фарқият «N дарс» ─────────────────────────────────────────────────

const AVG_XP_SETTING_PREFIX = 'league_avg_xp:';
const AVG_XP_FLOOR = 15;
const AVG_XP_TTL_MS = 24 * 60 * 60 * 1000;

export async function avgXpPerLesson(courseId: string | null): Promise<number> {
  const key = `${AVG_XP_SETTING_PREFIX}${courseId ?? 'global'}`;
  try {
    const cached = await prisma.appSetting.findUnique({ where: { key } });
    if (cached) {
      const parsed = JSON.parse(cached.valueJson) as { value: number; at: number };
      if (Date.now() - parsed.at < AVG_XP_TTL_MS && parsed.value >= AVG_XP_FLOOR) return parsed.value;
    }
  } catch {}
  const agg = await prisma.lesson.aggregate({
    _avg: { xpReward: true },
    where: { isActive: true, ...(courseId ? { module: { courseId } } : {}) },
  });
  const value = Math.max(AVG_XP_FLOOR, Math.round(agg._avg.xpReward ?? 0));
  try {
    await prisma.appSetting.upsert({
      where: { key },
      create: { key, valueJson: JSON.stringify({ value, at: Date.now() }) },
      update: { valueJson: JSON.stringify({ value, at: Date.now() }) },
    });
  } catch {}
  return value;
}

export function lessonsForXpGap(xpGap: number, avgXp: number): number {
  if (xpGap <= 0) return 0;
  return Math.max(1, Math.ceil(xpGap / Math.max(AVG_XP_FLOOR, avgXp)));
}

// ── Ҷадвал ────────────────────────────────────────────────────────────────

export type LeagueRow = {
  rank: number;
  id: string;
  name: string;
  avatarLetter: string;
  avatarUrl: string | null;
  level: string;
  streak: number;
  /** XP-и ҳафта (`scope: 'week'`) ё тамоми XP (`scope: 'all'`). */
  weeklyXp: number;
  rankDelta: number | null;
  isYou: boolean;
};

export type RankedRow = {
  id: string;
  name: string;
  avatarUrl: string | null;
  level: string;
  streak: number;
  xp: number;
  rank: number;
  total: number;
};

function letterOf(name: string): string {
  const t = (name ?? '').trim();
  return t.length > 0 ? t[0].toUpperCase() : '?';
}

/**
 * Ҷадвали тартибдодашуда: 30-и боло + (агар [userId] дода шавад) худи корбар
 * ва ду ҳамсояи ӯ — барои ҷои ВОҚЕӢ ва хатти фарқият.
 *
 * Баробарии XP → тартиби устувор аз рӯи `id` (ҷой ҳар кушодан намеҷаҳад).
 */
async function rankedRows(
  scope: LeagueScope,
  now: Date,
  userId: string | null,
  weekKey: string = weekKeyFor(now),
): Promise<RankedRow[]> {
  const real = Prisma.raw(realUserSql('u'));
  const me = userId ?? '';
  const weekEnd = weekEndsAt(weekKey).toISOString().slice(0, 10);
  const scored =
    scope === 'week'
      ? Prisma.sql`
          SELECT d."userId" AS uid, SUM(d.xp)::int AS xp
          FROM "DailyXp" d JOIN "User" u ON u.id = d."userId"
          WHERE d.date >= ${weekKey}::date AND d.date < ${weekEnd}::date
            AND u."isActive" = true AND ${real}
          GROUP BY d."userId"
          HAVING SUM(d.xp) > 0`
      : Prisma.sql`
          SELECT u.id AS uid, u."totalXp" AS xp
          FROM "User" u
          WHERE u."isActive" = true AND u."totalXp" > 0 AND ${real}`;

  const rows = await prisma.$queryRaw<
    { id: string; name: string; avatarUrl: string | null; level: string; streak: number; xp: number; rank: number; total: number }[]
  >`
    WITH s AS (${scored}),
    r AS (
      SELECT uid, xp,
             ROW_NUMBER() OVER (ORDER BY xp DESC, uid)::int AS rk,
             COUNT(*) OVER ()::int AS total
      FROM s
    ),
    m AS (SELECT rk FROM r WHERE uid = ${me})
    SELECT u.id, u.name, u."avatarUrl", u.level, u.streak, r.xp, r.rk AS rank, r.total
    FROM r JOIN "User" u ON u.id = r.uid
    WHERE r.rk <= ${BOARD_SIZE} OR ABS(r.rk - COALESCE((SELECT rk FROM m), -100)) <= 1
    ORDER BY r.rk`;

  const ranked = rows.map((r) => ({ ...r, xp: Number(r.xp), rank: Number(r.rank), total: Number(r.total) }));
  if (scope !== 'week') return ranked;

  // 🔴 23.10.2026: то охири ҳафта ҷадвал ҳамеша 30 нафар бошад. Пештар танҳо
  // касоне буданд, ки ИН ҳафта XP гирифтанд — душанбе-сешанбе ҳамагӣ 5–15 нафар.
  // Ҷойҳои холӣ бо хонандагони воқеии ОХИРОН фаъол (0 XP-и ҳафта) пур мешаванд:
  // онҳоро бо як дарс гузаштан мумкин аст. Худи корбар ин ҷо ворид намешавад —
  // «ҳанӯз дар ҷадвал нестед» (бе XP) ҳамон тавр мемонад.
  const missing = BOARD_SIZE - ranked.filter((r) => r.rank <= BOARD_SIZE).length;
  if (missing <= 0) return ranked;
  const fill = await prisma.$queryRaw<
    { id: string; name: string; avatarUrl: string | null; level: string; streak: number }[]
  >`
    SELECT u.id, u.name, u."avatarUrl", u.level, u.streak
    FROM "User" u
    WHERE u."isActive" = true AND ${real} AND u.id <> ${me}
      AND NOT EXISTS (
        SELECT 1 FROM "DailyXp" d
        WHERE d."userId" = u.id AND d.date >= ${weekKey}::date AND d.date < ${weekEnd}::date AND d.xp > 0
      )
    ORDER BY u."lastActiveDate" DESC NULLS LAST, u."totalXp" DESC, u.id
    LIMIT ${missing}`;
  return fillBoard(ranked, fill);
}

/**
 * Ҷадвали ҳафтаро то [BOARD_SIZE] бо хонандагони 0-XP пур мекунад. СОФ.
 * Онҳо пас аз ҳамаи XP-дорон меистанд; ҷойи хонандаи берун аз 30 (`rank > 30`)
 * бетағйир мемонад, пас ҳамсояҳо ва «N дарс то гузаштан» вайрон намешаванд.
 */
export function fillBoard(
  ranked: RankedRow[],
  fill: { id: string; name: string; avatarUrl: string | null; level: string; streak: number }[],
): RankedRow[] {
  const top = ranked.filter((r) => r.rank <= BOARD_SIZE);
  const rest = ranked.filter((r) => r.rank > BOARD_SIZE);
  const seen = new Set(ranked.map((r) => r.id));
  const total = ranked[0]?.total ?? 0;
  const extra = fill
    .filter((f) => !seen.has(f.id))
    .slice(0, BOARD_SIZE - top.length)
    .map((f, i) => ({ ...f, xp: 0, rank: top.length + i + 1, total }));
  return [...top, ...extra, ...rest];
}

function toRow(r: RankedRow, userId: string | null, publicView = false): LeagueRow {
  return {
    rank: r.rank,
    id: publicView ? '' : r.id,
    name: r.name,
    avatarLetter: letterOf(r.name),
    avatarUrl: publicView ? null : (r.avatarUrl ?? null),
    level: r.level,
    streak: r.streak,
    weeklyXp: r.xp,
    rankDelta: null,
    isYou: !!userId && r.id === userId,
  };
}

/** Ҳадди камтарини иштирокчиён, ки ҷадвали ҳафтаи ҶОРӢ ҳамчун `preview` нишон дода шавад. */
const PREVIEW_MIN = 3;

/**
 * 30-и боло барои меҳмон (бе `id` ва акс) ва барои ҳолати «ҳанӯз дар ҷадвал
 * нестед».
 *
 * Душанбе саҳар ҷадвал аз нав сар мешавад ва чанд соат қариб холӣ аст. Он гоҳ
 * натиҷаи НИҲОИИ ҳафтаи гузашта бармегардад (`lastWeek: true` — барнома инро
 * менависад), то Хона ҳеҷ гоҳ блоки холӣ нишон надиҳад (талаби 14.09).
 */
export async function getLeaguePreviewInfo(
  now: Date = new Date(),
  opts: { publicView?: boolean } = {},
): Promise<{ rows: LeagueRow[]; lastWeek: boolean }> {
  const cur = (await rankedRows('week', now, null)).filter((r) => r.rank <= BOARD_SIZE);
  // Танҳо XP-дорон ҳисоб мешаванд — пуркунии 0-XP (`fillBoard`) ҷадвали холии
  // душанберо «пур» наменамояд.
  const scored = (rs: RankedRow[]) => rs.filter((r) => r.xp > 0).length;
  if (scored(cur) >= PREVIEW_MIN) return { rows: cur.map((r) => toRow(r, null, opts.publicView)), lastWeek: false };
  const prevKey = new Date(new Date(`${weekKeyFor(now)}T00:00:00.000Z`).getTime() - 7 * DAY_MS)
    .toISOString()
    .slice(0, 10);
  const prev = (await rankedRows('week', now, null, prevKey)).filter((r) => r.rank <= BOARD_SIZE);
  if (scored(prev) > scored(cur)) return { rows: prev.map((r) => toRow(r, null, opts.publicView)), lastWeek: true };
  return { rows: cur.map((r) => toRow(r, null, opts.publicView)), lastWeek: false };
}

export async function getLeaguePreview(
  _tier: number = MIN_TIER,
  now: Date = new Date(),
  opts: { publicView?: boolean } = {},
): Promise<LeagueRow[]> {
  return (await getLeaguePreviewInfo(now, opts)).rows;
}

export async function getMyLeague(userId: string, now: Date = new Date(), scope: LeagueScope = 'week') {
  const weekKey = weekKeyFor(now);
  const rows = await rankedRows(scope, now, userId);
  const top = rows.filter((r) => r.rank <= BOARD_SIZE);
  const mine = rows.find((r) => r.id === userId) ?? null;
  const total = rows[0]?.total ?? 0;

  const members = top.map((r) => toRow(r, userId));
  const you = mine ? toRow(mine, userId) : null;

  let gap = { aheadName: null as string | null, aheadLessons: 0, behindName: null as string | null, behindLessons: 0 };
  if (mine) {
    const me = await prisma.user.findUnique({ where: { id: userId }, select: { currentCourseId: true } });
    const avgXp = await avgXpPerLesson(me?.currentCourseId ?? null);
    const above = rows.find((r) => r.rank === mine.rank - 1);
    const below = rows.find((r) => r.rank === mine.rank + 1);
    // «+1»: барои ГУЗАШТАН баробар шудан кам аст.
    gap = {
      aheadName: above?.name ?? null,
      aheadLessons: above ? lessonsForXpGap(above.xp - mine.xp + 1, avgXp) : 0,
      behindName: below?.name ?? null,
      behindLessons: below ? lessonsForXpGap(mine.xp - below.xp + 1, avgXp) : 0,
    };
  }

  // Ин ҳафта ҳанӯз XP нагирифт → «як дарс хонед» + ҷадвал ҳамчун `preview`.
  const pv = you ? null : scope === 'week' ? await getLeaguePreviewInfo(now) : { rows: members, lastWeek: false };

  return {
    scope,
    weekKey,
    secondsUntilEnd: secondsUntilWeekEnd(weekKey, now),
    tier: MIN_TIER,
    placed: !!you,
    members: you ? members : [],
    you,
    memberCount: total,
    promoteCutoff: 0,
    demoteCutoff: total,
    gap,
    preview: pv?.rows ?? [],
    previewLastWeek: pv?.lastWeek ?? false,
    // Ҳамсояҳои корбар (пеш · худаш · қафо) — ҳатто вақте ӯ берун аз 30-и
    // боло аст (масалан 47-ум); блоки Хона онҳоро дар паҳлӯи «Шумо» мекашад.
    around: mine ? rows.filter((r) => Math.abs(r.rank - mine.rank) <= 1).map((r) => toRow(r, userId)) : [],
  };
}

/**
 * Дӯстон = графи `FriendInvite` дар ҳар ду самт; XP-и ҲАМИН ҳафта. Дӯсте, ки
 * ин ҳафта нахондааст, бо 0 мемонад — маҳз ӯро гузаштан лозим аст.
 */
export async function getFriendsLeague(userId: string, now: Date = new Date()) {
  const weekKey = weekKeyFor(now);
  const base = { weekKey, secondsUntilEnd: secondsUntilWeekEnd(weekKey, now) };

  const invites = await prisma.friendInvite.findMany({
    where: { consumedByUserId: { not: null }, OR: [{ creatorUserId: userId }, { consumedByUserId: userId }] },
    select: { creatorUserId: true, consumedByUserId: true },
  });
  const friendIds = new Set<string>();
  for (const i of invites) {
    if (i.creatorUserId !== userId) friendIds.add(i.creatorUserId);
    if (i.consumedByUserId && i.consumedByUserId !== userId) friendIds.add(i.consumedByUserId);
  }
  if (friendIds.size === 0) return { ...base, members: [], you: null, memberCount: 0 };

  const ids = [...Array.from(friendIds), userId];
  const [users, xp] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: ids }, isActive: true },
      select: { id: true, name: true, avatarUrl: true, level: true, streak: true },
    }),
    prisma.dailyXp.groupBy({
      by: ['userId'],
      where: { userId: { in: ids }, date: { gte: new Date(`${weekKey}T00:00:00.000Z`) } },
      _sum: { xp: true },
    }),
  ]);
  const xpById = new Map(xp.map((x) => [x.userId, x._sum.xp ?? 0]));

  const members: LeagueRow[] = users
    .map((u) => ({
      rank: 0,
      id: u.id,
      name: u.name,
      avatarLetter: letterOf(u.name),
      avatarUrl: u.avatarUrl ?? null,
      level: u.level,
      streak: u.streak,
      weeklyXp: xpById.get(u.id) ?? 0,
      rankDelta: null,
      isYou: u.id === userId,
    }))
    .sort((a, b) => b.weeklyXp - a.weeklyXp || a.name.localeCompare(b.name))
    .map((r, i) => ({ ...r, rank: i + 1 }));

  return { ...base, memberCount: members.length, members, you: members.find((r) => r.isYou) ?? null };
}
