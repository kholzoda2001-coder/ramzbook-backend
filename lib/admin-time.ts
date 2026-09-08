/**
 * Day/month boundaries in the admin's own timezone (Asia/Dushanbe, UTC+5,
 * no DST).
 *
 * Why this exists: the admin panel runs on Vercel, whose clock is UTC, so
 * `new Date().setHours(0,0,0,0)` produced UTC midnight — 05:00 Dushanbe time.
 * Between 00:00 and 05:00 local, "Дарсҳои хондашуда — Имрӯз" therefore still
 * showed YESTERDAY's tail, and after 05:00 it silently dropped the lessons
 * finished between local midnight and 05:00. Same for "Даромади ин моҳ" on the
 * first day of a month.
 */

/** Asia/Dushanbe is UTC+5 all year — Tajikistan does not observe DST. */
export const TJ_OFFSET_MINUTES = 5 * 60;

/** Local (Dushanbe) midnight of the day `now` falls in, as a real UTC instant. */
export function startOfDayTJ(now: Date = new Date()): Date {
  const shifted = new Date(now.getTime() + TJ_OFFSET_MINUTES * 60_000);
  shifted.setUTCHours(0, 0, 0, 0);
  return new Date(shifted.getTime() - TJ_OFFSET_MINUTES * 60_000);
}

/** Local (Dushanbe) first-of-month midnight, as a real UTC instant. */
export function startOfMonthTJ(now: Date = new Date()): Date {
  const shifted = new Date(now.getTime() + TJ_OFFSET_MINUTES * 60_000);
  shifted.setUTCDate(1);
  shifted.setUTCHours(0, 0, 0, 0);
  return new Date(shifted.getTime() - TJ_OFFSET_MINUTES * 60_000);
}

/** `YYYY-MM-DD` of the LOCAL day an instant belongs to (for day-bucket charts). */
export function dayKeyTJ(d: Date): string {
  return new Date(d.getTime() + TJ_OFFSET_MINUTES * 60_000).toISOString().slice(0, 10);
}
