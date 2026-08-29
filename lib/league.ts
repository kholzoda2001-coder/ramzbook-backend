import { prisma } from './prisma';

// ─────────────────────────────────────────────────────────────────────────────
// Лига — мусобиқаи ҳафтаинаи когортҳои то 30 нафар.
//
// Рейтинги ҷаҳонӣ ҳамаи ~1240 корбарро дар як рӯйхат мегузошт: қариб ҳама дар
// ҷое меистоданд, ки ҳеҷ гоҳ иваз карда наметавонистанд. Ин ҷо ҳар кас дар
// когортаи ≤30-нафара мусобиқа мекунад, пас ҷои аввал ВОҚЕАН дастрас аст.
//
// Ин файл ЯГОНА ҷойест, ки марзи ҳафта, тақсими когорта ва бастани ҳафтаро
// медонад. Ҳар route танҳо ҳамин функсияҳоро даъват мекунад.
// ─────────────────────────────────────────────────────────────────────────────

/** Ҳадди аксари аъзо дар як когорта. */
export const COHORT_SIZE = 30;
/** Чанд нафари боло як зина боло мераванд (дар когортаи пурра). */
export const PROMOTE_COUNT = 10;
/** Чанд нафари поён як зина поён мераванд (дар когортаи пурра). */
export const DEMOTE_COUNT = 5;
/** 1 Бронза · 2 Нуқра · 3 Тилло · 4 Платина · 5 Алмос */
export const MIN_TIER = 1;
export const MAX_TIER = 5;

/**
 * Мукофоти алмос — ҲАМВОР аз рӯи натиҷа, вобаста ба зина НЕСТ.
 *
 * Поёнравӣ ҳам 10 мегирад: бохтани лига набояд ҳамчун ҶАЗО ҳис шавад —
 * хонандае, ки ҳафтаи сахт дошт, аллакай худро бад ҳис мекунад, ва сифр
 * гирифтан ӯро аз лига тамоман мебарорад.
 */
export const GEMS_BY_OUTCOME: Record<LeagueOutcome, number> = {
  promoted: 100,
  stayed: 25,
  demoted: 10,
};

export type LeagueOutcome = 'promoted' | 'stayed' | 'demoted';

/**
 * Ҳамон Prisma, вале танҳо ҷадвалҳое, ки бастани ҳафта ба онҳо даст мерасонад.
 *
 * ЧАРО: `closeLeague` муҳимтарин ва хатарноктарин коди ин хусусият аст — онро
 * бояд БЕ базаи воқеӣ санҷидан мумкин бошад (`scripts/league-idempotency-test.ts`).
 * Навъ танг аст, на `any`: дар дохили функсия типҳои Prisma пурра боқӣ мемонанд,
 * пас хатои воқеии навъ пинҳон намешавад.
 */
export type LeagueDb = Pick<
  typeof prisma,
  'league' | 'leagueMember' | 'leagueResult' | 'user' | '$transaction'
>;

// ── Марзи ҳафта ──────────────────────────────────────────────────────────────
//
// ШАНБЕ 00:00 UTC барои ҲАМА. Ҳафтаи ҳар корбар алоҳида бошад, когортро
// тартиб додан имконнопазир мешавад — ду нафар «ҳафтаи ҷорӣ»-и гуногун
// медоштанд ва рейтинги ягона маъно намедошт.
//
// Калид = санаи ҳамон ШАНБЕ ("2026-08-29"), на рақами ҳафтаи ISO: ISO ҳафтаро
// аз душанбе мешуморад ва дар марзи сол (W52/W01) домҳои худро дорад.

const DAY_MS = 86_400_000;

/** Нимишаби UTC-и ҳамон рӯз. */
function utcMidnight(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/** Калиди ҳафтае, ки ин лаҳза ба он тааллуқ дорад. */
export function weekKeyFor(now: Date = new Date()): string {
  const midnight = utcMidnight(now);
  // getUTCDay(): 0 = якшанбе … 6 = шанбе. Чанд рӯз пас аз шанбеи охирин?
  const daysSinceSaturday = (midnight.getUTCDay() + 1) % 7;
  const saturday = new Date(midnight.getTime() - daysSinceSaturday * DAY_MS);
  return saturday.toISOString().slice(0, 10);
}

/** Лаҳзаи АНҶОМИ ҳафта (= оғози ҳафтаи оянда), UTC. */
export function weekEndsAt(weekKey: string): Date {
  return new Date(new Date(`${weekKey}T00:00:00.000Z`).getTime() + 7 * DAY_MS);
}

/** Чанд сония то анҷоми ҳафта (ҳеҷ гоҳ манфӣ). */
export function secondsUntilWeekEnd(weekKey: string, now: Date = new Date()): number {
  return Math.max(0, Math.floor((weekEndsAt(weekKey).getTime() - now.getTime()) / 1000));
}

// ── Ҳудуди зинаҳо дар когортаи ХУРД ──────────────────────────────────────────

/**
 * Чанд нафар боло мераванд ва чанд нафар поён, барои когортаи `n`-нафара.
 *
 * Дар когортаи пурра ин 10 ва 5 аст — маҳз ҳамон таносуби 33.3% / 50% / 16.7%,
 * ки метри макет нишон медиҳад. Барои когортаи хурд ҳамон таносуб нигоҳ дошта
 * мешавад (сеяк боло, шашяк поён), вагарна дар когортаи 8-нафара «10-и боло»
 * ва «5-и поён» бо ҳам мебуриданд ва як нафар ҳам боло, ҳам поён мерафт.
 *
 * Агар когорта он қадар хурд бошад, ки ду минтақа боз мебуранд — ҳеҷ кас
 * поён намеравад. Дар когортаи 1–2 нафара мусобиқа маъно надорад.
 */
export function zonesFor(n: number): { promote: number; demote: number } {
  const promote = Math.min(PROMOTE_COUNT, Math.floor(n / 3));
  let demote = Math.min(DEMOTE_COUNT, Math.floor(n / 6));
  if (promote + demote >= n) demote = 0;
  return { promote, demote };
}

/**
 * Натиҷаи як нафар — функсияи СОФ аз (ҷой, зина, шумораи аъзо).
 *
 * ⚠️ Маҳз ин чиз такрори кори ҳафтагиро бехатар мекунад. Ҳеҷ ҷо `tier + 1`
 * ҳамчун ЗИЁДКУНӢ навишта намешавад — зинаи нав ҳар бор аз нав ҲИСОБ мешавад,
 * пас иҷрои дуюм ҳамон рақамро мебарорад, на як зина болотар.
 */
export function outcomeFor(
  rank: number,
  tier: number,
  memberCount: number,
): { outcome: LeagueOutcome; newTier: number } {
  const { promote, demote } = zonesFor(memberCount);
  if (rank <= promote && tier < MAX_TIER) {
    return { outcome: 'promoted', newTier: tier + 1 };
  }
  if (rank > memberCount - demote && demote > 0 && tier > MIN_TIER) {
    return { outcome: 'demoted', newTier: tier - 1 };
  }
  return { outcome: 'stayed', newTier: tier };
}

/**
 * Аъзои тартибдодашударо ба натиҷа мегардонад. СОФ — на база, на вақт.
 *
 * Маҳз ин ҷо дучанд-боло-рафтан рӯй дода метавонист, пас маҳз ин ҷо санҷида
 * мешавад: даъвати такрорӣ бо ҳамон вуруд ҳамон баромадро медиҳад, чунки
 * `newTier` аз `tier` ҲИСОБ мешавад, на ба он илова.
 */
export function rankAndDecide<T extends { userId: string; weeklyXp: number }>(
  ordered: T[],
  tier: number,
): Array<T & { finalRank: number; outcome: LeagueOutcome; newTier: number; gemsReward: number }> {
  const n = ordered.length;
  return ordered.map((m, i) => {
    const finalRank = i + 1;
    const { outcome, newTier } = outcomeFor(finalRank, tier, n);
    return { ...m, finalRank, outcome, newTier, gemsReward: GEMS_BY_OUTCOME[outcome] };
  });
}

// ── Тақсими когорта ──────────────────────────────────────────────────────────

/**
 * Узвияти ҳафтаи ҷориро мегирад ё месозад.
 *
 * ⚠️ Корбаре, ки ин ҳафта ягон XP нагирифтааст, ҷойгир карда НАМЕШАВАД — ин
 * функсия танҳо аз `awardXp` даъват мешавад. Вагарна ҷадвал бо сатрҳои
 * мурдаи «0 XP» пур мешуд ва мусобиқа сохта менамуд.
 */
export async function ensureMembership(userId: string, now: Date = new Date()) {
  const weekKey = weekKeyFor(now);

  const existing = await prisma.leagueMember.findUnique({
    where: { userId_weekKey: { userId, weekKey } },
  });
  if (existing) return existing;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { leagueTier: true },
  });
  const tier = Math.min(MAX_TIER, Math.max(MIN_TIER, user?.leagueTier ?? MIN_TIER));

  // Се кӯшиш: ҷои холӣ ёфтан → ҶОЙРО ГИРИФТАН → узвият сохтан.
  for (let attempt = 0; attempt < 5; attempt++) {
    const open = await prisma.league.findFirst({
      where: { weekKey, tier, memberCount: { lt: COHORT_SIZE } },
      orderBy: { memberCount: 'desc' }, // когортҳоро пур мекунем, на паҳн
      select: { id: true },
    });

    let leagueId = open?.id;

    if (leagueId) {
      // ⚠️ Навиштани ШАРТӢ. Хондан-баъд-навиштан ин ҷо ғалат аст: ду корбар
      // ҳамзамон 29-ро мехонанд ва ҳарду дохил мешаванд → когортаи 31-нафара.
      // `updateMany` бо шарти `memberCount < 30` дар ЯК амали атомӣ ҷойро
      // мегирад; агар 0 сатр иваз шуда бошад, касе моро пеш гузашт.
      const claimed = await prisma.league.updateMany({
        where: { id: leagueId, memberCount: { lt: COHORT_SIZE } },
        data: { memberCount: { increment: 1 } },
      });
      if (claimed.count === 0) continue; // когорта пур шуд — аз нав ҷустуҷӯ
    } else {
      const created = await prisma.league.create({
        data: { tier, weekKey, memberCount: 1 },
        select: { id: true },
      });
      leagueId = created.id;
    }

    try {
      return await prisma.leagueMember.create({
        data: { leagueId, userId, weekKey, weeklyXp: 0 },
      });
    } catch (e) {
      // P2002 = ду дархости ҳамзамон барои ҳамон корбар. Ҷои гирифтаамонро
      // бармегардонем ва узвияти воқеиро мехонем.
      await prisma.league.update({
        where: { id: leagueId },
        data: { memberCount: { decrement: 1 } },
      });
      const raced = await prisma.leagueMember.findUnique({
        where: { userId_weekKey: { userId, weekKey } },
      });
      if (raced) return raced;
      throw e;
    }
  }

  throw new Error('[league] could not place user in a cohort');
}

/**
 * XP-и ҳафтаинаро зиёд мекунад. Аз `awardXp()` даъват мешавад.
 *
 * Ҳеҷ гоҳ намепартояд: лига хусусияти дуюмдараҷа аст ва набояд мукофоти XP-и
 * дарсро вайрон кунад.
 */
export async function addWeeklyXp(userId: string, amount: number, now: Date = new Date()) {
  if (amount <= 0) return;
  try {
    // Ҳафтаҳои гузашта пеш аз ҷойгиршавӣ баста мешаванд — вагарна корбар ба
    // когортаи ҳафтаи кӯҳна XP илова мекард.
    await catchUpClosedWeeks(now);
    const member = await ensureMembership(userId, now);
    await prisma.leagueMember.update({
      where: { id: member.id },
      data: { weeklyXp: { increment: Math.round(amount) } },
    });
  } catch (e) {
    console.error('[league] addWeeklyXp failed', e);
  }
}

// ── Бастани ҳафта ────────────────────────────────────────────────────────────

/**
 * Ҳамаи когортҳои ҳафтаҳои ГУЗАШТАро мебандад.
 *
 * ⚠️ ҶАДВАЛ НЕСТ. Vercel Hobby танҳо ду ҷои cron медиҳад ва ҳарду аллакай ба
 * push банданд; GitHub Actions дар ин аккаунт бо сабаби пардохт қулф аст.
 * Пас бастан ТАНБАЛ аст — ҳамон намунае, ки `StreakWager` ва `FriendStreak`
 * доранд (ниг. шарҳи `resolveFriendStreak`). `/api/cron/league` ҳамин
 * функсияро даъват мекунад, пас ҳар лаҳза ҷадвал пайдо шавад, кор мекунад ва
 * ҳеҷ чизи дигар тағйир намехоҳад.
 */
/**
 * Кэши дохили-протсессӣ: «дар ин ҳафта аллакай ҷамъбаст кардем».
 *
 * ЧАРО: `catchUpClosedWeeks` аз `awardXp` даъват мешавад, яъне пас аз ҲАР
 * дарс. Бе ин муҳофиз ҳар хатми дарс як дархости иловагӣ ба база мекард, ки
 * қариб ҳамеша холӣ бармегардад. Когорта танҳо дар марзи ҳафта кӯҳна мешавад,
 * пас кэш аз рӯи калиди ҳафта АЙНАН дуруст аст.
 */
let _caughtUpFor: string | null = null;

export async function catchUpClosedWeeks(
  now: Date = new Date(),
  db: LeagueDb = prisma,
): Promise<number> {
  const current = weekKeyFor(now);
  // Кэш танҳо барои мизоҷи ВОҚЕӢ — тест мизоҷи худро медиҳад ва бояд ҳар бор
  // воқеан кор кунад.
  if (db === prisma && _caughtUpFor === current) return 0;
  const stale = await db.league.findMany({
    where: { weekKey: { lt: current }, rolledOverAt: null },
    select: { id: true },
    take: 200,
  });
  let closed = 0;
  for (const l of stale) {
    if (await closeLeague(l.id, db)) closed++;
  }
  if (db === prisma) _caughtUpFor = current;
  return closed;
}

/**
 * Як когортаро мебандад. Бе хатар такроран даъват мешавад.
 *
 * СЕ муҳофизати мустақил:
 *  1. `rolledOverAt` — иҷрои дуюм когортаро тамоман мегузаронад;
 *  2. `@@unique([userId, weekKey])` дар `LeagueResult` — ҳатто агар ду иҷро
 *     ҳамзамон аз гейти якум гузаранд, дуюмаш P2002 мегирад;
 *  3. ҳеҷ ҷо ЗИЁДКУНӢ нест — `newTier` функсияи софи (ҷой, зина, шумора) аст
 *     ва `User.leagueTier` бо `set:` навишта мешавад. Маҳз ин муҳофизат
 *     дучанд-боло-рафтанро НОМУМКИН мекунад; ду муҳофизати боло танҳо сатри
 *     такрориро пешгирӣ мекунанд.
 *
 * @returns `true` агар маҳз ҳамин даъват онро бастааст.
 */
export async function closeLeague(
  leagueId: string,
  db: LeagueDb = prisma,
): Promise<boolean> {
  const league = await db.league.findUnique({
    where: { id: leagueId },
    select: { id: true, tier: true, weekKey: true, rolledOverAt: true },
  });
  if (!league || league.rolledOverAt) return false; // муҳофизати №1

  const members = await db.leagueMember.findMany({
    where: { leagueId },
    // Тартиби ДЕТЕРМИНИСТӢ: ҳангоми XP-и баробар онки барвақттар ҳамроҳ шуд
    // болотар меистад. Бе ин, ду иҷро метавонистанд ҷойҳои гуногун диҳанд.
    orderBy: [{ weeklyXp: 'desc' }, { joinedAt: 'asc' }, { id: 'asc' }],
    select: { userId: true, weeklyXp: true },
  });

  const n = members.length;
  // ⚠️ Ҳамон функсияи СОФ, ки тест онро мекӯбад — вагарна тест чизеро исбот
  // намекард, ки истеҳсол воқеан иҷро мекунад.
  const rows = rankAndDecide(members, league.tier).map((r) => ({
    userId: r.userId,
    leagueId,
    weekKey: league.weekKey,
    tier: league.tier,
    finalRank: r.finalRank,
    weeklyXp: r.weeklyXp,
    memberCount: n,
    outcome: r.outcome,
    newTier: r.newTier,
    gemsReward: r.gemsReward,
  }));

  await db.$transaction(async (tx) => {
    // Гейти №1 боз як бор, ин дафъа ШАРТӢ — агар иҷрои дигар моро пеш гузашта
    // бошад, 0 сатр иваз мешавад ва мо чизе намекунем.
    const gate = await tx.league.updateMany({
      where: { id: leagueId, rolledOverAt: null },
      data: { rolledOverAt: new Date() },
    });
    if (gate.count === 0) return;

    if (rows.length > 0) {
      // Муҳофизати №2 дар амал.
      await tx.leagueResult.createMany({ data: rows, skipDuplicates: true });
      for (const r of rows) {
        await tx.user.update({
          where: { id: r.userId },
          data: {
            // `set`, на `increment` — муҳофизати №3.
            leagueTier: { set: r.newTier },
            // XP-и ҳафтаинаи корбар ҳеҷ ҷо аз нав сифр намешуд — боги
            // мустақил аз ин кор, ин ҷо ислоҳ мешавад.
            weeklyXp: { set: 0 },
          },
        });
      }
    }
  });

  return true;
}

// ── Миёнаи XP дар як дарс ────────────────────────────────────────────────────

const AVG_XP_SETTING_PREFIX = 'league_avg_xp:';
/** Ҳадди поён — курси нав бе мазмун набояд «0 дарс» ё тақсим ба сифр диҳад. */
const AVG_XP_FLOOR = 15;
const AVG_XP_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Миёнаи `xpReward` дар дарсҳои ФАЪОЛИ курс, кэшшуда дар як рӯз.
 *
 * Адади сахткодшуда кор намекунад: `Lesson.xpReward` пешфарз 60 аст, вале
 * мазмуни воқеӣ хеле фарқ мекунад (дарси 15-XP ҳам ҳаст). Хатти «4 дарс то
 * гузаштан аз Numonshoh» бо адади нодуруст дурӯғ мешавад.
 */
export async function avgXpPerLesson(courseId: string | null): Promise<number> {
  const key = `${AVG_XP_SETTING_PREFIX}${courseId ?? 'global'}`;

  try {
    const cached = await prisma.appSetting.findUnique({ where: { key } });
    if (cached) {
      const parsed = JSON.parse(cached.valueJson) as { value: number; at: number };
      if (Date.now() - parsed.at < AVG_XP_TTL_MS && parsed.value >= AVG_XP_FLOOR) {
        return parsed.value;
      }
    }
  } catch {
    /* кэши вайрон — аз нав ҳисоб мекунем */
  }

  const agg = await prisma.lesson.aggregate({
    _avg: { xpReward: true },
    where: {
      isActive: true,
      ...(courseId ? { module: { courseId } } : {}),
    },
  });

  const value = Math.max(AVG_XP_FLOOR, Math.round(agg._avg.xpReward ?? 0));

  try {
    await prisma.appSetting.upsert({
      where: { key },
      create: { key, valueJson: JSON.stringify({ value, at: Date.now() }) },
      update: { valueJson: JSON.stringify({ value, at: Date.now() }) },
    });
  } catch {
    /* навиштани кэш ҳатмӣ нест */
  }

  return value;
}

/** XP-и фарқиятро ба ШУМОРАИ ДАРС мегардонад (ҳадди ақал 1 агар фарқ бошад). */
export function lessonsForXpGap(xpGap: number, avgXp: number): number {
  if (xpGap <= 0) return 0;
  return Math.max(1, Math.ceil(xpGap / Math.max(AVG_XP_FLOOR, avgXp)));
}

// ── Ҷадвали лига ─────────────────────────────────────────────────────────────

export type LeagueRow = {
  rank: number;
  id: string;
  name: string;
  /// Танҳо ҲАРФ, на сурат. Акси корбарони дигар мазмуни оммавии бемодератсия
  /// мешавад (сиёсати UGC-и Google Play) — ҳамон қароре, ки дар лидерборди
  /// кӯҳна қабул шуда буд.
  avatarLetter: string;
  level: string;
  streak: number;
  weeklyXp: number;
  /// Мусбат = боло рафт, манфӣ = поён, 0 = бетағйир, null = ҳанӯз маълум нест.
  rankDelta: number | null;
  isYou: boolean;
};

function letterOf(name: string): string {
  const t = (name ?? '').trim();
  return t.length > 0 ? t[0].toUpperCase() : '?';
}

/**
 * Ҷадвали когортаи ҷории корбар.
 *
 * `placed: false` вақте корбар ин ҳафта ҳанӯз XP нагирифтааст — он гоҳ ӯ дар
 * ҳеҷ когорта нест ва экран бояд ҳолати «дарс хонед, то ҳамроҳ шавед»-ро
 * нишон диҳад, на ҷадвали холӣ.
 */
export async function getMyLeague(userId: string, now: Date = new Date()) {
  await catchUpClosedWeeks(now);

  const weekKey = weekKeyFor(now);
  const me = await prisma.user.findUnique({
    where: { id: userId },
    select: { leagueTier: true, currentCourseId: true },
  });

  const membership = await prisma.leagueMember.findUnique({
    where: { userId_weekKey: { userId, weekKey } },
    select: { leagueId: true, league: { select: { tier: true } } },
  });

  const base = {
    weekKey,
    secondsUntilEnd: secondsUntilWeekEnd(weekKey, now),
    tier: membership?.league.tier ?? me?.leagueTier ?? MIN_TIER,
  };

  if (!membership) {
    return { ...base, placed: false as const, members: [], you: null, memberCount: 0 };
  }

  const raw = await prisma.leagueMember.findMany({
    where: { leagueId: membership.leagueId },
    orderBy: [{ weeklyXp: 'desc' }, { joinedAt: 'asc' }, { id: 'asc' }],
    select: {
      id: true,
      weeklyXp: true,
      startRank: true,
      userId: true,
      user: { select: { name: true, level: true, streak: true } },
    },
  });

  const members: LeagueRow[] = raw.map((m, i) => ({
    rank: i + 1,
    id: m.userId,
    name: m.user.name,
    avatarLetter: letterOf(m.user.name),
    level: m.user.level,
    streak: m.user.streak,
    weeklyXp: m.weeklyXp,
    rankDelta: m.startRank == null ? null : m.startRank - (i + 1),
    isYou: m.userId === userId,
  }));

  const n = members.length;
  const { promote, demote } = zonesFor(n);
  const you = members.find((r) => r.isYou) ?? null;

  // Хатти фарқият дар ДАРС, на дар XP. «250 XP» ба хонанда ҳеҷ чиз намегӯяд;
  // «4 дарс» нақшаи амал аст.
  const avgXp = await avgXpPerLesson(me?.currentCourseId ?? null);
  let gap: {
    aheadName: string | null; aheadLessons: number;
    behindName: string | null; behindLessons: number;
  } = { aheadName: null, aheadLessons: 0, behindName: null, behindLessons: 0 };

  if (you) {
    const idx = you.rank - 1;
    const above = idx > 0 ? members[idx - 1] : null;
    const below = idx < n - 1 ? members[idx + 1] : null;
    gap = {
      aheadName: above?.name ?? null,
      aheadLessons: above ? lessonsForXpGap(above.weeklyXp - you.weeklyXp, avgXp) : 0,
      behindName: below?.name ?? null,
      behindLessons: below ? lessonsForXpGap(you.weeklyXp - below.weeklyXp, avgXp) : 0,
    };

    // Аксбардории ҷой БАЪДИ сохтани ҷавоб — пас дафъаи оянда тирча «аз
    // бинии охирини ШУМО чӣ қадар ҳаракат шуд»-ро нишон медиҳад.
    const mine = raw[idx];
    if (mine && mine.startRank !== you.rank) {
      prisma.leagueMember
        .update({ where: { id: mine.id }, data: { startRank: you.rank } })
        .catch(() => {});
    }
  }

  return {
    ...base,
    placed: true as const,
    memberCount: n,
    /// Ҷои ≤ ин → боло меравад. 0 = дар ин когорта касе боло намеравад.
    promoteCutoff: promote,
    /// Ҷои > ин → поён меравад. Ба n баробар бошад, касе поён намеравад.
    demoteCutoff: n - demote,
    avgXpPerLesson: avgXp,
    members,
    you,
    gap,
  };
}

/**
 * Ҳамон шакл, вале танҳо дӯстон.
 *
 * «Дӯст» = графи `FriendInvite` дар ҲАР ДУ самт (ман даъват кардам ва қабул
 * шуд, ё маро даъват карданд). `FriendStreak` дӯстӣ НЕСТ — он танҳо ЯК ҷуфти
 * фаъол дорад, пас ҷадвали дӯстон аз он ҳамеша ду сатр мешуд.
 */
export async function getFriendsLeague(userId: string, now: Date = new Date()) {
  const weekKey = weekKeyFor(now);

  const invites = await prisma.friendInvite.findMany({
    where: {
      consumedByUserId: { not: null },
      OR: [{ creatorUserId: userId }, { consumedByUserId: userId }],
    },
    select: { creatorUserId: true, consumedByUserId: true },
  });

  const friendIds = new Set<string>();
  for (const i of invites) {
    if (i.creatorUserId !== userId) friendIds.add(i.creatorUserId);
    if (i.consumedByUserId && i.consumedByUserId !== userId) friendIds.add(i.consumedByUserId);
  }

  if (friendIds.size === 0) {
    return { weekKey, secondsUntilEnd: secondsUntilWeekEnd(weekKey, now), members: [], you: null, memberCount: 0 };
  }

  // `Array.from`, на spread: tsconfig ба ES5 нишон мегирад ва spread-и Set
  // он ҷо `--downlevelIteration` талаб мекунад.
  const ids = [...Array.from(friendIds), userId];
  const users = await prisma.user.findMany({
    where: { id: { in: ids }, isActive: true },
    select: { id: true, name: true, level: true, streak: true },
  });
  const memberships = await prisma.leagueMember.findMany({
    where: { userId: { in: ids }, weekKey },
    select: { userId: true, weeklyXp: true },
  });
  const xpById = new Map(memberships.map((m) => [m.userId, m.weeklyXp]));

  const members: LeagueRow[] = users
    .map((u) => ({
      rank: 0,
      id: u.id,
      name: u.name,
      avatarLetter: letterOf(u.name),
      level: u.level,
      streak: u.streak,
      // Дӯсте, ки ин ҳафта ҳанӯз нахондааст, 0 дорад — ин ҷо ӯ сатри мурда
      // нест, балки маҳз ҳамон касест, ки бояд гузашт.
      weeklyXp: xpById.get(u.id) ?? 0,
      rankDelta: null,
      isYou: u.id === userId,
    }))
    .sort((a, b) => b.weeklyXp - a.weeklyXp || a.name.localeCompare(b.name))
    .map((r, i) => ({ ...r, rank: i + 1 }));

  return {
    weekKey,
    secondsUntilEnd: secondsUntilWeekEnd(weekKey, now),
    memberCount: members.length,
    members,
    you: members.find((r) => r.isYou) ?? null,
  };
}
