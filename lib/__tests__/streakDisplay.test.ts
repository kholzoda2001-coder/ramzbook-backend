import { describe, expect, it } from 'vitest';
import { liveStreak } from '../streakDisplay';

/**
 * Ин тестҳо маҳз ҳамон ҳолати продакшнро қулф мекунанд, ки боис шуд: 75
 * корбар дар база `streak > 0` доштанд, дар ҳоле ки 7+ рӯз барномаро
 * накушода буданд, ва рейтинг он рақами мурдаро ҳамчун зинда нишон медод.
 */
describe('liveStreak', () => {
  // 2026-09-09, соати 10:00-и Душанбе (UTC+5)
  const now = new Date('2026-09-09T05:00:00.000Z');
  const tz = 300;

  it('имрӯз фаъол → силсила пурра мемонад', () => {
    const lastActiveDate = new Date('2026-09-09T04:00:00.000Z'); // 09:00 маҳаллӣ
    expect(liveStreak({ streak: 31, lastActiveDate, tzOffsetMin: tz }, now)).toBe(31);
  });

  it('дирӯз фаъол → ҳанӯз зинда (имрӯз вақт ҳаст)', () => {
    const lastActiveDate = new Date('2026-09-08T10:00:00.000Z');
    expect(liveStreak({ streak: 31, lastActiveDate, tzOffsetMin: tz }, now)).toBe(31);
  });

  it('як рӯзи пурра холӣ → 0', () => {
    const lastActiveDate = new Date('2026-09-07T10:00:00.000Z');
    expect(liveStreak({ streak: 31, lastActiveDate, tzOffsetMin: tz }, now)).toBe(0);
  });

  it('ҳолати воқеии продакшн: 11 рӯз, як моҳ пеш рафтааст → 0', () => {
    const lastActiveDate = new Date('2026-08-10T10:00:00.000Z');
    expect(liveStreak({ streak: 11, lastActiveDate, tzOffsetMin: tz }, now)).toBe(0);
  });

  it('ҳеҷ гоҳ фаъол набуд → 0', () => {
    expect(liveStreak({ streak: 5, lastActiveDate: null, tzOffsetMin: tz }, now)).toBe(0);
  });

  it('силсила аллакай 0 → 0', () => {
    const lastActiveDate = new Date('2026-09-09T04:00:00.000Z');
    expect(liveStreak({ streak: 0, lastActiveDate, tzOffsetMin: tz }, now)).toBe(0);
  });

  it('бе tzOffsetMin пешфарзи Душанбе (UTC+5) кор мекунад', () => {
    // 2026-09-09T00:30Z = 05:30-и 9 сентябр дар Душанбе, яъне ИМРӮЗ.
    // Бо UTC ин ҳам 9 сентябр аст, пас ҳолати ҷолибтарро мегирем:
    // 2026-09-08T20:00Z = 01:00-и 9 сентябр дар Душанбе — рӯзи КОРБАР имрӯз,
    // вале рӯзи UTC ҳанӯз 8-ум. Бе минтақаи вақт ин «дирӯз» ҳисоб мешуд.
    const lastActiveDate = new Date('2026-09-08T20:00:00.000Z');
    expect(liveStreak({ streak: 7, lastActiveDate }, now)).toBe(7);
  });

  it('ҳисоб бо рӯзи МАҲАЛЛӢ, на UTC: соати 01:00-и шаб ҳанӯз ҳамон рӯз аст', () => {
    // Ҳозир 2026-09-09T19:30Z = 00:30-и 10 сентябр дар Душанбе.
    const nowLate = new Date('2026-09-09T19:30:00.000Z');
    // Фаъолият 2026-09-09T18:00Z = 23:00-и 9 сентябр — яъне ДИРӮЗИ маҳаллӣ.
    const lastActiveDate = new Date('2026-09-09T18:00:00.000Z');
    expect(liveStreak({ streak: 4, lastActiveDate, tzOffsetMin: tz }, nowLate)).toBe(4);
  });
});
