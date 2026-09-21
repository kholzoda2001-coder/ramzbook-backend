/**
 * Дашборди як хонанда — қабати ПОКИ ҳисоб.
 *
 * Пурсишҳо (`app/api/admin/users/[id]/dashboard/route.ts`) сатрҳои ХОМИ
 * гурӯҳшударо меоранд; ин ҷо онҳо ба шакли ниҳоӣ меоянд. Ҳеҷ чиз ин ҷо ба
 * база ва ба `Date.now()` даст намерасонад — пас ҳар қоида бо vitest санҷида
 * мешавад (`lib/admin/__tests__/userDashboard.test.ts`).
 *
 * ⚠️ ВАҚТ: тамоми рӯзҳо ва соатҳо бо вақти ДУШАНБЕ (UTC+5) ҳисоб мешаванд —
 * ҳамон қоидаи боқимондаи панели админ. Бе ин «дирӯз соати 23:00» ба рӯзи
 * дигар меафтод ва гистограммаи соатҳо 5 соат ҷаббида мешуд.
 */

import { DEFAULT_TZ_OFFSET_MIN } from '../localDay';
import { LEVEL_ORDER } from './userFilters';

export const TZ = DEFAULT_TZ_OFFSET_MIN;

/** `YYYY-MM-DD` дар вақти Душанбе. */
export function dayKey(d: Date | string, tz = TZ): string {
  return new Date(new Date(d).getTime() + tz * 60_000).toISOString().slice(0, 10);
}

/** Соати 0–23 дар вақти Душанбе. */
export function hourOf(d: Date | string, tz = TZ): number {
  return new Date(new Date(d).getTime() + tz * 60_000).getUTCHours();
}

/** Рӯзи ҳафта: 0 = душанбе … 6 = якшанбе (на якшанбе-якум!). */
export function weekdayOf(d: Date | string, tz = TZ): number {
  const js = new Date(new Date(d).getTime() + tz * 60_000).getUTCDay(); // 0=Як
  return (js + 6) % 7;
}

export function higherLevel(a: string | null, b: string | null): string {
  const ia = LEVEL_ORDER.indexOf(a ?? '');
  const ib = LEVEL_ORDER.indexOf(b ?? '');
  return ib > ia ? (b ?? 'A1') : (a ?? 'A1');
}

// ── Забонҳо ────────────────────────────────────────────────────────────────

/** Як сатри гурӯҳшуда: корбар × забон × сатҳи курс × навъи маҳорат. */
export type LangRow = {
  code: string;
  name: string | null;
  flag: string | null;
  level: string | null;
  skillType: string | null;
  lessons: number;
  xp: number;
  timeSpent: number;
  accuracySum: number;
  heartsLost: number;
  lastAt: string | null;
};

export type LangSummary = {
  code: string;
  name: string;
  flag: string;
  lessons: number;
  xp: number;
  minutes: number;
  accuracy: number;
  heartsLost: number;
  level: string;
  words: number;
  lastAt: string | null;
  byLevel: Record<string, number>;
  bySkill: Record<string, number>;
};

/**
 * `skillType` дар база ду нуқсон дорад: `vocab` ва `vocabulary` ҳамон як
 * чизанд, ва баъзе дарсҳо онро холӣ доранд. Бе ин ҷамъбандӣ дашборд ду
 * сатри «Луғат» нишон медод.
 */
export function normSkill(s: string | null | undefined): string {
  const k = (s ?? '').trim().toLowerCase();
  if (!k) return 'other';
  if (k === 'vocabulary') return 'vocab';
  return k;
}

export function buildLanguages(
  rows: LangRow[],
  wordsByLang: Record<string, number> = {},
): LangSummary[] {
  const map = new Map<string, LangSummary>();

  for (const r of rows) {
    const cur = map.get(r.code) ?? {
      code: r.code,
      name: r.name ?? r.code.toUpperCase(),
      flag: r.flag ?? '',
      lessons: 0, xp: 0, minutes: 0, accuracy: 0, heartsLost: 0,
      level: 'A1', words: 0, lastAt: null,
      byLevel: {}, bySkill: {},
    };

    cur.lessons += r.lessons;
    cur.xp += r.xp;
    cur.minutes += r.timeSpent;            // сония — дар охир ба дақиқа
    cur.accuracy += r.accuracySum;         // ҷамъи фоизҳо — дар охир миёна
    cur.heartsLost += r.heartsLost;
    cur.level = higherLevel(cur.level, r.level);
    if (r.level) cur.byLevel[r.level] = (cur.byLevel[r.level] ?? 0) + r.lessons;
    const sk = normSkill(r.skillType);
    cur.bySkill[sk] = (cur.bySkill[sk] ?? 0) + r.lessons;
    if (r.lastAt && (!cur.lastAt || r.lastAt > cur.lastAt)) cur.lastAt = r.lastAt;

    map.set(r.code, cur);
  }

  const out = Array.from(map.values()).map((l) => ({
    ...l,
    accuracy: l.lessons ? Math.round(l.accuracy / l.lessons) : 0,
    minutes: Math.round(l.minutes / 60),
    words: wordsByLang[l.code] ?? 0,
  }));
  out.sort((a, b) => b.lessons - a.lessons);
  return out;
}

// ── Рӯзҳо ──────────────────────────────────────────────────────────────────

export type DayRow = {
  day: string; lessons: number; xp: number; timeSpent: number;
  /** Аввалин ва охирин анҷоми дарс дар ҳамон рӯз (ISO). */
  firstAt?: string | null; lastAt?: string | null;
};
export type DailyPoint = { date: string; lessons: number; xp: number; minutes: number };

/**
 * Тақвими `days`-рӯза то `today` (ҳатман ПАЙВАСТА — рӯзҳои холӣ ҳам сатр
 * доранд, вагарна графики фаъолият рӯзҳои холиро «ғайб» мекард).
 *
 * `xpRows` аз `DailyXp` меояд (рақами РАСМИИ XP-и рӯз), `lessonRows` аз
 * `UserProgress` — онҳо метавонанд НАМУВОФИҚ бошанд: XP-и дучанд, гуфтор ва
 * китобхона дарс нестанд. Ҳарду нигоҳ дошта мешаванд.
 */
export function buildDaily(
  lessonRows: DayRow[],
  xpRows: { day: string; xp: number }[],
  today: string,
  days = 90,
): DailyPoint[] {
  const les = new Map(lessonRows.map((r) => [r.day, r]));
  const xps = new Map(xpRows.map((r) => [r.day, r.xp]));

  const out: DailyPoint[] = [];
  const end = new Date(`${today}T00:00:00.000Z`).getTime();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(end - i * 86_400_000).toISOString().slice(0, 10);
    const l = les.get(date);
    out.push({
      date,
      lessons: l?.lessons ?? 0,
      xp: xps.get(date) ?? l?.xp ?? 0,
      minutes: Math.round((l?.timeSpent ?? 0) / 60),
    });
  }
  return out;
}

/** Гистограммаи 24-соата: кай хонанда воқеан машғул мешавад. */
export function buildHours(stamps: (string | Date)[], tz = TZ): number[] {
  const out = new Array(24).fill(0);
  for (const s of stamps) out[hourOf(s, tz)]++;
  return out;
}

/** Ҳафт рӯзи ҳафта, аз душанбе. */
export function buildWeekdays(stamps: (string | Date)[], tz = TZ): number[] {
  const out = new Array(7).fill(0);
  for (const s of stamps) out[weekdayOf(s, tz)]++;
  return out;
}

/**
 * Силсилаи рӯзҳои ПАЙДАРПАЙ дар маълумоти воқеӣ (на майдони `User.streak`).
 * Барои назорат: «мегӯяд 🔥12, вале дар ҳақиқат чанд рӯз хондааст?»
 */
export function longestDayStreak(dayKeys: string[]): number {
  const uniq = Array.from(new Set(dayKeys)).sort();
  let best = 0, run = 0, prev: number | null = null;
  for (const k of uniq) {
    const idx = Math.floor(new Date(`${k}T00:00:00.000Z`).getTime() / 86_400_000);
    run = prev !== null && idx === prev + 1 ? run + 1 : 1;
    prev = idx;
    if (run > best) best = run;
  }
  return best;
}

/**
 * «Таркиш»-и синхронизатсия: даҳҳо дарс дар як-ду дақиқа.
 *
 * 🔴 Дар маълумоти ВОҚЕӢ ёфт шуд: як корбар 201 дарсро дар 111 СОНИЯ
 * «анҷом дод» (2026-08-29, 21:57:46 → 21:59:37). Ин хондан нест — ин як
 * бор ба сервер рехтани прогресси офлайн/кӯҳна аст. Бе ин огоҳӣ дашборд
 * ӯро ҳамчун хонандаи аз ҳама фаъол нишон медиҳад ва ҳар хулоса ғалат
 * мешавад. Пас: рақамро пинҳон намекунем, вале РОСТ мегӯем, ки ин чист.
 */
export type SyncBurst = { date: string; lessons: number; seconds: number };

export function findSyncBursts(rows: DayRow[], minLessons = 20, maxSeconds = 600): SyncBurst[] {
  const out: SyncBurst[] = [];
  for (const r of rows) {
    if (r.lessons < minLessons || !r.firstAt || !r.lastAt) continue;
    const sec = Math.round(
      (new Date(r.lastAt).getTime() - new Date(r.firstAt).getTime()) / 1000,
    );
    if (sec <= maxSeconds) out.push({ date: r.day, lessons: r.lessons, seconds: sec });
  }
  return out.sort((a, b) => b.lessons - a.lessons);
}

// ── Китобхона ──────────────────────────────────────────────────────────────

export type BookRow = {
  title: string; type: string; level: string | null;
  position: number; total: number; lastReadAt: string | null;
};

export function buildBooks(rows: BookRow[]) {
  return rows
    .map((b) => ({
      ...b,
      // `position` аз 0 меояд: саҳифаи 0 = саҳифаи 1-уми хонда. Бе `+1`
      // дашборд «0 саҳифа» менавишт, ҳол он ки китоб кушода шудааст.
      pagesRead: b.total > 0 ? Math.min(b.position + 1, b.total) : b.position + 1,
      percent: b.total > 0 ? Math.round(((b.position + 1) / b.total) * 100) : 0,
    }))
    .sort((a, b) => (b.lastReadAt ?? '').localeCompare(a.lastReadAt ?? ''));
}

// ── Ҷамъбасти умумӣ ────────────────────────────────────────────────────────

export function summarize(langs: LangSummary[], daily: DailyPoint[]) {
  const lessons = langs.reduce((s, l) => s + l.lessons, 0);
  const minutes = langs.reduce((s, l) => s + l.minutes, 0);
  const xp = langs.reduce((s, l) => s + l.xp, 0);
  const words = langs.reduce((s, l) => s + l.words, 0);
  const accuracy = lessons
    ? Math.round(langs.reduce((s, l) => s + l.accuracy * l.lessons, 0) / lessons)
    : 0;
  const activeDays = daily.filter((d) => d.lessons > 0 || d.xp > 0).length;
  return { lessons, minutes, xp, words, accuracy, activeDays };
}
