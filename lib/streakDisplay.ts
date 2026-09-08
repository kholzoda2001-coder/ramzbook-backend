/**
 * Қоидаҳои силсила (streak) — ЯГОНА ҷои ҳисоб.
 *
 * ── Қоида ─────────────────────────────────────────────────────────────────
 * Ҳар як рӯзи ПУРРА холӣ як зинаи силсиларо мехӯрад:
 *
 *     🔥10 → 1 рӯз нахонд → 🔥9 → боз 1 рӯз → 🔥8 …  (то 0)
 *
 * Рӯзи ҷорӣ ҳеҷ гоҳ ҳисоб намешавад: агар корбар дирӯз хонда бошад ва имрӯз
 * ҳанӯз наомада бошад, вай ҳанӯз тамоми имрӯзро дорад — силсила солим аст.
 *
 * `freeze` рӯзи гумшударо мехарад: **1 freeze = 1 рӯз**. Се рӯз нахонда бо ду
 * freeze → ду рӯз баргардонида мешавад, як рӯз гум мешавад (10 → 9).
 *
 * ── Чаро ҳисоб, на майдони база ───────────────────────────────────────────
 * `User.streak` рақами ЯХБАСТА аст: он танҳо вақте нав мешавад, ки ХУДИ ҳамон
 * корбар барномаро кушояд. Касе, ки рафт, ҳеҷ гоҳ ба он роҳ намерасад — 9
 * сентябри 2026 дар продакшн 95 корбар `streak > 0` доштанд, вале танҳо 12-тоаш
 * воқеан фаъол буданд, ва рейтинг он рақамҳои мурдаро зинда нишон медод.
 *
 * Пас: `User.streak` = силсила дар лаҳзаи `lastActiveDate`. Ҳар ҷое, ки
 * силсила НИШОН дода мешавад, `liveStreak()` даъват мешавад — вагарна боз
 * рақами мурда мебарояд.
 *
 * ⚠️ `liveStreak()` ҳеҷ чиз наменависад ва freeze сарф намекунад. Он танҳо
 * ҳамон натиҷаро ПЕШГӮӢ мекунад, ки `decayStreak()` ҳангоми баргаштани корбар
 * ба база менависад — пас рақами рейтинг ва рақами худи корбар ҳамеша як хел.
 */

import { DEFAULT_TZ_OFFSET_MIN, localDayIndex } from './localDay';

export interface StreakState {
  streak: number;
  lastActiveDate: Date | null;
  tzOffsetMin?: number | null;
  /** Набошад — ҳамчун 0 ҳисоб мешавад (ҳеҷ ҳимоя). */
  streakFreezesAvailable?: number | null;
}

export interface StreakDecay {
  /** Силсила пас аз коҳиш — ҳамон рақаме, ки бояд нишон дода шавад. */
  streak: number;
  /** Чанд рӯзи ПУРРА холӣ гузашт (рӯзи ҷорӣ ҳисоб намешавад). */
  missedDays: number;
  /** Чанд freeze бояд сарф шавад, то ҳамин натиҷа ҳосил шавад. */
  freezesSpent: number;
  /** Чанд зинаи силсила воқеан гум шуд (барои паёми «шумо N рӯз гум кардед»). */
  daysLost: number;
}

/** Рӯзҳои пурраи холӣ байни охирин хониш ва имрӯз. */
export function missedDays(u: StreakState, now: Date = new Date()): number {
  if (!u.lastActiveDate) return 0;
  const tz = u.tzOffsetMin ?? DEFAULT_TZ_OFFSET_MIN;
  return Math.max(0, localDayIndex(now, tz) - localDayIndex(u.lastActiveDate, tz) - 1);
}

/**
 * Силсиларо мувофиқи рӯзҳои гумшуда коҳиш медиҳад ва мегӯяд, ки чанд freeze
 * лозим шуд. Функсияи пок — ҳеҷ чиз наменависад.
 */
export function decayStreak(u: StreakState, now: Date = new Date()): StreakDecay {
  const none: StreakDecay = { streak: Math.max(0, u.streak), missedDays: 0, freezesSpent: 0, daysLost: 0 };
  if (u.streak <= 0 || !u.lastActiveDate) return { ...none, streak: 0 };

  const missed = missedDays(u, now);
  if (missed === 0) return none;

  const freezes = Math.max(0, u.streakFreezesAvailable ?? 0);
  let freezesSpent = Math.min(missed, freezes);
  let streak = Math.max(0, u.streak - (missed - freezesSpent));

  // Агар силсила ба ҳар ҳол сифр шавад, freeze-ро бар абас насӯзонем — он
  // чизест, ки корбар ё харидааст ё бо обуна гирифтааст.
  if (streak === 0) freezesSpent = 0;

  return { streak, missedDays: missed, freezesSpent, daysLost: u.streak - streak };
}

/** Силсила барои НАМОИШ (рейтинг, профил, админ). Ҳеҷ чиз наменависад. */
export function liveStreak(u: StreakState, now: Date = new Date()): number {
  return decayStreak(u, now).streak;
}
