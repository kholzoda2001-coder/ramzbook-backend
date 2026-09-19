import { prisma } from './prisma';

export const COHORT_SIZE = 30;
export const PROMOTE_COUNT = 10;
export const DEMOTE_COUNT = 5;
export const MIN_TIER = 1;
export const MAX_TIER = 5;

export type LeagueOutcome = 'promoted' | 'stayed' | 'demoted';

export const GEMS_BY_OUTCOME: Record<LeagueOutcome, number> = {
  promoted: 100,
  stayed: 25,
  demoted: 10,
};

// Thresholds for leagues based on total XP (TEMPORARY GLOBAL LEADERBOARD)
export function getTierForXp(xp: number): number {
  if (xp >= 15000) return 5; // Diamond
  if (xp >= 7000) return 4;  // Platinum
  if (xp >= 3000) return 3;  // Gold
  if (xp >= 1000) return 2;  // Silver
  return 1;                  // Bronze
}

const DAY_MS = 86_400_000;
function utcMidnight(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}
export function weekKeyFor(now: Date = new Date()): string {
  const midnight = utcMidnight(now);
  const daysSinceSaturday = (midnight.getUTCDay() + 1) % 7;
  const saturday = new Date(midnight.getTime() - daysSinceSaturday * DAY_MS);
  return saturday.toISOString().slice(0, 10);
}
export function weekEndsAt(weekKey: string): Date {
  return new Date(new Date(`${weekKey}T00:00:00.000Z`).getTime() + 7 * DAY_MS);
}
export function secondsUntilWeekEnd(weekKey: string, now: Date = new Date()): number {
  return Math.max(0, Math.floor((weekEndsAt(weekKey).getTime() - now.getTime()) / 1000));
}
export function zonesFor(n: number) {
  if (n <= 2) return { promote: 0, demote: 0 };
  const p = Math.round(n * (PROMOTE_COUNT / COHORT_SIZE));
  const d = Math.round(n * (DEMOTE_COUNT / COHORT_SIZE));
  if (p + d >= n) return { promote: 0, demote: 0 };
  return { promote: p, demote: d };
}
export function rankAndDecide(members: { userId: string; weeklyXp: number }[], currentTier: number) {
  const n = members.length;
  const { promote, demote } = zonesFor(n);
  return members.map((m, i) => {
    const rank = i + 1;
    let outcome: LeagueOutcome = 'stayed';
    let newTier = currentTier;
    if (rank <= promote && currentTier < MAX_TIER) {
      outcome = 'promoted';
      newTier = currentTier + 1;
    } else if (rank > n - demote && currentTier > MIN_TIER) {
      outcome = 'demoted';
      newTier = currentTier - 1;
    }
    return { ...m, finalRank: rank, outcome, newTier, gemsReward: GEMS_BY_OUTCOME[outcome] };
  });
}

// Ensure membership does nothing in global mode
export async function ensureMembership(userId: string, now: Date = new Date()) {
  return { id: 'mock', leagueId: 'mock', userId, weekKey: weekKeyFor(now), weeklyXp: 0, startRank: null, joinedAt: new Date() };
}

// Called after awardXp. We upgrade tier if needed.
export async function addWeeklyXp(userId: string, amount: number, now: Date = new Date()) {
  if (amount <= 0) return;
  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { totalXp: true, leagueTier: true } });
    if (!user) return;
    const correctTier = getTierForXp(user.totalXp);
    if (correctTier > (user.leagueTier ?? 1)) {
      await prisma.user.update({
        where: { id: userId },
        data: { leagueTier: correctTier }
      });
    }
  } catch (e) {
    console.error('[league] addWeeklyXp failed', e);
  }
}

// Close league does nothing in global mode
export async function catchUpClosedWeeks(...args: any[]) { return 0; }
export async function closeLeague(...args: any[]) { return false; }

// Avg XP logic
const AVG_XP_SETTING_PREFIX = 'league_avg_xp:';
const AVG_XP_FLOOR = 15;
const AVG_XP_TTL_MS = 24 * 60 * 60 * 1000;

export type LeagueDb = any;
export function outcomeFor(...args: any[]) { return 'stayed'; }
export async function getFriendsLeague(userId: string, now: Date = new Date()) {
  return [];
}
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

export type LeagueRow = {
  rank: number;
  id: string;
  name: string;
  avatarLetter: string;
  avatarUrl: string | null;
  level: string;
  streak: number;
  weeklyXp: number;
  rankDelta: number | null;
  isYou: boolean;
};
function letterOf(name: string): string {
  const t = (name ?? '').trim();
  return t.length > 0 ? t[0].toUpperCase() : '?';
}

// In global mode, preview just shows the top 30 in the tier
export async function getLeaguePreview(tier: number, now: Date = new Date(), opts: { publicView?: boolean } = {}): Promise<LeagueRow[]> {
  const t = Math.min(MAX_TIER, Math.max(MIN_TIER, tier));
  const raw = await prisma.user.findMany({
    where: { leagueTier: t, isActive: true },
    orderBy: { totalXp: 'desc' },
    take: 30,
    select: { id: true, name: true, avatarUrl: true, level: true, streak: true, totalXp: true }
  });
  return raw.map((u, i) => ({
    rank: i + 1,
    id: opts.publicView ? '' : u.id,
    name: u.name,
    avatarLetter: letterOf(u.name),
    avatarUrl: opts.publicView ? null : (u.avatarUrl ?? null),
    level: u.level,
    streak: u.streak,
    weeklyXp: u.totalXp, // UI expects weeklyXp, but we feed totalXp
    rankDelta: null,
    isYou: false,
  }));
}

export async function getMyLeague(userId: string, now: Date = new Date()) {
  const me = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, leagueTier: true, currentCourseId: true, totalXp: true }
  });
  const tier = me?.leagueTier ?? MIN_TIER;
  
  // Update tier if they deserve a better one but haven't gotten it yet
  const correctTier = getTierForXp(me?.totalXp ?? 0);
  const effectiveTier = Math.max(tier, correctTier);

  const raw = await prisma.user.findMany({
    where: { leagueTier: effectiveTier, isActive: true },
    orderBy: { totalXp: 'desc' },
    take: 30,
    select: { id: true, name: true, avatarUrl: true, level: true, streak: true, totalXp: true }
  });

  // Ensure current user is in the list even if they are below top 30
  let isIncluded = raw.some(u => u.id === userId);
  if (!isIncluded && me) {
    const fullMe = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, avatarUrl: true, level: true, streak: true, totalXp: true }});
    if (fullMe) raw.push(fullMe);
    raw.sort((a, b) => b.totalXp - a.totalXp);
  }

  const members: LeagueRow[] = raw.map((u, i) => ({
    rank: i + 1,
    id: u.id,
    name: u.name,
    avatarLetter: letterOf(u.name),
    avatarUrl: u.avatarUrl ?? null,
    level: u.level,
    streak: u.streak,
    weeklyXp: u.totalXp, // Exposing totalXp as weeklyXp so the UI renders it
    rankDelta: null,
    isYou: u.id === userId,
  }));

  const n = members.length;
  const you = members.find((r) => r.isYou) ?? null;

  const avgXp = await avgXpPerLesson(me?.currentCourseId ?? null);
  let gap = { aheadName: null as string|null, aheadLessons: 0, behindName: null as string|null, behindLessons: 0 };

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
  }

  // Next threshold calculation
  const nextThreshold = effectiveTier < MAX_TIER ? getXpForTier(effectiveTier + 1) : null;
  const promoteCutoff = nextThreshold ? members.findIndex(m => m.weeklyXp < nextThreshold) : -1;
  const demoteCutoff = 999; // No demotions in this temporary mode

  return {
    weekKey: weekKeyFor(now),
    secondsUntilEnd: secondsUntilWeekEnd(weekKeyFor(now), now),
    tier: effectiveTier,
    placed: true,
    members,
    you,
    memberCount: n,
    promoteCutoff: promoteCutoff > 0 ? promoteCutoff : 0,
    demoteCutoff,
    gap
  };
}

function getXpForTier(tier: number): number {
  if (tier === 5) return 15000;
  if (tier === 4) return 7000;
  if (tier === 3) return 3000;
  if (tier === 2) return 1000;
  return 0;
}
