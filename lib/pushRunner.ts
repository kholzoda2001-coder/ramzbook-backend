/**
 * lib/pushRunner.ts — иҷрокунандаи кампанияҳо.
 *
 * Як ҷои ягона, ки кампанияи сохтаи АДМИНро мегирад, сегментро мехонад, барои
 * ҳар хонанда матнро бо забони худаш пур мекунад ва push мефиристад.
 *
 * Ду роҳи даъват:
 *  • `runDueCampaigns()` — аз cron (ҳар 15 дақиқа); он кампанияҳоеро иҷро
 *    мекунад, ки вақташон расидааст;
 *  • `runCampaign()` — аз панел, тугмаи «Ҳозир иҷро кун» (бо `dryRun`).
 */
import type { PushCampaign } from '@prisma/client';
import { prisma } from './prisma';
import { sendPushToUser } from './push';
import { loadLearnerContext } from './pushMessages';
import { renderCampaignText, type CampaignTexts } from './pushTemplate';
import { listSegmentUserIds, parseList, type Segment } from './pushSegments';

/** Дар як иҷро аз ин зиёд не — то job аз лимити вақти Vercel набарояд. */
export const MAX_PER_RUN = 800;

/** Тирезаи «дер нашуд» — агар cron 90 дақиқа хоб рафта бошад, боз мефиристад. */
const DUE_WINDOW_MIN = 90;

export function segmentOf(c: PushCampaign): Segment {
  return {
    langs: parseList(c.langs),
    tier: c.tier,
    studiedToday: c.studiedToday,
    minStreak: c.minStreak,
    maxStreak: c.maxStreak,
    minInactiveDays: c.minInactiveDays,
    maxInactiveDays: c.maxInactiveDays,
    levels: parseList(c.levels),
    countries: parseList(c.countries),
  };
}

/** Рӯзи ҳафта бо вақти маҳаллӣ: 1 = Душанбе … 7 = Якшанбе. */
function localWeekday(now: Date, tzOffsetMin: number): number {
  const shifted = new Date(now.getTime() + tzOffsetMin * 60_000);
  const d = shifted.getUTCDay(); // 0 = Яш
  return d === 0 ? 7 : d;
}

/** «Санаи маҳаллӣ» ҳамчун сатр (2026-08-18) — барои «имрӯз аллакай давид?». */
function localDateKey(d: Date, tzOffsetMin: number): string {
  const shifted = new Date(d.getTime() + tzOffsetMin * 60_000);
  return shifted.toISOString().slice(0, 10);
}

/** Дақиқаҳои гузашта аз нимишаби маҳаллӣ. */
function localMinutes(now: Date, tzOffsetMin: number): number {
  const shifted = new Date(now.getTime() + tzOffsetMin * 60_000);
  return shifted.getUTCHours() * 60 + shifted.getUTCMinutes();
}

/**
 * Оё вақти ин кампания расидааст?
 * Се шарт: фаъол · рӯзи ҳафта мувофиқ · вақт гузаштааст, вале на дертар аз
 * тирезаи иҷозатдодашуда · имрӯз ҳанӯз надавидааст.
 */
export function isDue(c: PushCampaign, now = new Date()): boolean {
  if (!c.isActive || c.kind !== 'scheduled') return false;

  const days = parseList(c.weekdays);
  if (days && !days.includes(String(localWeekday(now, c.tzOffsetMin)))) return false;

  const nowMin = localMinutes(now, c.tzOffsetMin);
  const targetMin = c.hour * 60 + c.minute;
  if (nowMin < targetMin || nowMin > targetMin + DUE_WINDOW_MIN) return false;

  if (c.lastRunAt && localDateKey(c.lastRunAt, c.tzOffsetMin) === localDateKey(now, c.tzOffsetMin)) {
    return false;
  }
  return true;
}

export type RunResult = {
  campaignId: string;
  name: string;
  matched: number;
  sent: number;
  skipped: number;
  failed: number;
  /** Намунаи матн (аввалин корбар) — барои пешнамоиш дар панел. */
  sample?: { userId: string; title: string; body: string } | null;
  dryRun: boolean;
};

export type RunOptions = {
  /** Ҳеҷ чиз намефиристад — танҳо ҳисоб ва намунаи матн. */
  dryRun?: boolean;
  limit?: number;
  now?: Date;
  /** Лимити рӯзонаи корбарро сарфи назар кунад (танҳо санҷиши дастӣ). */
  force?: boolean;
};

/**
 * Як кампанияро иҷро мекунад.
 *
 * Ду муҳофиз ба ғайр аз лимити умумии рӯзона (`lib/push.ts`):
 *  • `cooldownHours` — ҲАМОН кампания ба ҲАМОН корбар дар ин муддат такрор
 *    намешавад (мас. win-back-и 3-рӯза ҳар рӯз такрор нашавад);
 *  • `MAX_PER_RUN` — маҳдудияти ҳаҷм.
 */
export async function runCampaign(c: PushCampaign, opts: RunOptions = {}): Promise<RunResult> {
  const now = opts.now ?? new Date();
  const dryRun = opts.dryRun === true;
  const limit = Math.min(opts.limit ?? MAX_PER_RUN, MAX_PER_RUN);
  const texts = (c.texts ?? {}) as CampaignTexts;

  const res: RunResult = {
    campaignId: c.id,
    name: c.name,
    matched: 0,
    sent: 0,
    skipped: 0,
    failed: 0,
    sample: null,
    dryRun,
  };

  let userIds = await listSegmentUserIds(segmentOf(c), limit, c.tzOffsetMin, now);
  res.matched = userIds.length;

  // Кӣ ҳамин кампанияро дар давраи cooldown аллакай гирифт → мепартоем.
  if (c.cooldownHours > 0 && userIds.length > 0) {
    const since = new Date(now.getTime() - c.cooldownHours * 3_600_000);
    const recent = await prisma.pushSend.findMany({
      where: {
        campaignId: c.id,
        status: 'sent',
        createdAt: { gte: since },
        userId: { in: userIds },
      },
      select: { userId: true },
    });
    const seen = new Set(recent.map((r) => r.userId));
    const before = userIds.length;
    userIds = userIds.filter((id) => !seen.has(id));
    res.skipped += before - userIds.length;
  }

  for (const userId of userIds) {
    try {
      const ctx = await loadLearnerContext(userId);
      if (!ctx) { res.skipped++; continue; }

      const msg = renderCampaignText(texts, ctx, {
        tzOffsetMin: c.tzOffsetMin,
        countdownToHour: c.countdownToHour,
        now,
      });
      if (!msg || !msg.title) { res.skipped++; continue; }

      if (!res.sample) res.sample = { userId, title: msg.title, body: msg.body };
      if (dryRun) continue;

      const r = await sendPushToUser(
        userId,
        msg.title,
        msg.body,
        { type: 'campaign', campaign: c.id, campaignName: c.name, route: c.route, lang: ctx.lang },
        { campaignId: c.id, campaignKey: c.name, ignoreFrequencyCap: opts.force === true },
      );
      if (r.sent > 0) res.sent += r.sent;
      else if (r.skipped) res.skipped++;
      else res.failed++;
    } catch (e) {
      res.failed++;
    }
  }

  if (!dryRun) {
    await prisma.pushCampaign
      .update({ where: { id: c.id }, data: { lastRunAt: now, lastRunSent: res.sent } })
      .catch(() => {/* натиҷа муҳимтар аз сабти вақт */});
  }

  return res;
}

/** Ҳамаи кампанияҳое, ки вақташон расидааст (аз cron). */
export async function runDueCampaigns(now = new Date()): Promise<RunResult[]> {
  const all = await prisma.pushCampaign.findMany({
    where: { isActive: true, kind: 'scheduled' },
    orderBy: { priority: 'asc' },
  });
  const due = all.filter((c) => isDue(c, now));
  const out: RunResult[] = [];
  for (const c of due) {
    try {
      out.push(await runCampaign(c, { now }));
    } catch (e) {
      console.error(`[pushRunner] кампанияи «${c.name}» нашуд`, e);
    }
  }
  return out;
}

// ── Фиристодани ДАСТӢ (broadcast аз панел) ──────────────────────────────────

export type BroadcastResult = {
  matched: number;
  sent: number;
  skipped: number;
  failed: number;
  sample?: { userId: string; title: string; body: string } | null;
  dryRun: boolean;
};

/**
 * Як паёми дастӣ ба сегмент. Матн ҳамон шаблон аст ({name}, {streak}…), пас
 * фиристодани дастӣ ҳам шахсӣ мебарояд.
 *
 * [force] — лимити рӯзонаро мешиканад; барои эълони муҳим лозим мешавад, вале
 * бо эҳтиёт (ин ягона роҳи спам кардани корбар аст).
 */
export async function sendBroadcast(
  seg: Segment,
  texts: CampaignTexts,
  opts: {
    route?: string;
    dryRun?: boolean;
    force?: boolean;
    limit?: number;
    tzOffsetMin?: number;
    countdownToHour?: number | null;
    label?: string;
    now?: Date;
  } = {},
): Promise<BroadcastResult> {
  const now = opts.now ?? new Date();
  const tz = opts.tzOffsetMin ?? 300;
  const dryRun = opts.dryRun === true;
  const limit = Math.min(opts.limit ?? MAX_PER_RUN, MAX_PER_RUN);

  const userIds = await listSegmentUserIds(seg, limit, tz, now);
  const res: BroadcastResult = {
    matched: userIds.length,
    sent: 0,
    skipped: 0,
    failed: 0,
    sample: null,
    dryRun,
  };

  for (const userId of userIds) {
    try {
      const ctx = await loadLearnerContext(userId);
      if (!ctx) { res.skipped++; continue; }
      const msg = renderCampaignText(texts, ctx, {
        tzOffsetMin: tz,
        countdownToHour: opts.countdownToHour ?? null,
        now,
      });
      if (!msg || !msg.title) { res.skipped++; continue; }
      if (!res.sample) res.sample = { userId, title: msg.title, body: msg.body };
      if (dryRun) continue;

      const r = await sendPushToUser(
        userId,
        msg.title,
        msg.body,
        { type: 'broadcast', campaign: opts.label ?? 'broadcast', route: opts.route ?? 'home', lang: ctx.lang },
        { campaignKey: opts.label ?? 'broadcast', ignoreFrequencyCap: opts.force === true },
      );
      if (r.sent > 0) res.sent += r.sent;
      else if (r.skipped) res.skipped++;
      else res.failed++;
    } catch (e) {
      res.failed++;
    }
  }

  return res;
}
