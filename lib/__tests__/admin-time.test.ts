import { describe, expect, it } from 'vitest';
import { dayKeyTJ, startOfDayTJ, startOfMonthTJ } from '../admin-time';

/**
 * These guard the exact failure that made the Dashboard's "Имрӯз" counter
 * wrong: the server clock is UTC, the admin reads the panel in Dushanbe
 * (UTC+5), so day boundaries must be shifted, not taken from the host.
 */
describe('admin-time (Asia/Dushanbe, UTC+5)', () => {
  it('00:43 local on 9 Sep starts the day at 8 Sep 19:00 UTC', () => {
    // 2026-09-08T19:43Z === 2026-09-09T00:43 in Dushanbe
    const now = new Date('2026-09-08T19:43:00.000Z');
    expect(startOfDayTJ(now).toISOString()).toBe('2026-09-08T19:00:00.000Z');
  });

  it('mid-afternoon local resolves to the same local day', () => {
    // 2026-09-09T10:00Z === 15:00 in Dushanbe
    const now = new Date('2026-09-09T10:00:00.000Z');
    expect(startOfDayTJ(now).toISOString()).toBe('2026-09-08T19:00:00.000Z');
  });

  it('04:00 local is still "today", not yesterday', () => {
    // The old UTC-midnight logic put 00:00–05:00 local into the previous day.
    const localEarly = new Date('2026-09-08T23:00:00.000Z'); // 04:00 on 9 Sep
    const localAfternoon = new Date('2026-09-09T10:00:00.000Z'); // 15:00 on 9 Sep
    expect(startOfDayTJ(localEarly).getTime()).toBe(startOfDayTJ(localAfternoon).getTime());
  });

  it('month starts at local midnight of the 1st', () => {
    const now = new Date('2026-09-08T19:43:00.000Z'); // 9 Sep local
    expect(startOfMonthTJ(now).toISOString()).toBe('2026-08-31T19:00:00.000Z');
  });

  it('a lesson finished at 02:00 local buckets into that local day', () => {
    expect(dayKeyTJ(new Date('2026-09-08T21:00:00.000Z'))).toBe('2026-09-09');
    expect(dayKeyTJ(new Date('2026-09-08T18:00:00.000Z'))).toBe('2026-09-08');
  });
});
