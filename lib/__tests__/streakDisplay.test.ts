import { describe, expect, it } from 'vitest';
import { decayStreak, liveStreak, missedDays } from '../streakDisplay';

/**
 * Қоида: ҳар як рӯзи ПУРРА холӣ як зинаро мехӯрад; 1 freeze = 1 рӯз.
 * Ин тестҳо ҳам қоидаро қулф мекунанд, ҳам ҳамон ҳолати воқеии продакшнро,
 * ки боис шуд: 95 корбар `streak > 0` доштанд, вале танҳо 12-тоаш фаъол буданд.
 */
describe('streak — қоидаи зинапоя', () => {
  // 2026-09-09, соати 10:00-и Душанбе (UTC+5)
  const now = new Date('2026-09-09T05:00:00.000Z');
  const tz = 300;
  const at = (iso: string) => new Date(iso);

  describe('шумориши рӯзҳои холӣ', () => {
    it('имрӯз хондааст → 0 рӯзи холӣ', () => {
      expect(missedDays({ streak: 5, lastActiveDate: at('2026-09-09T04:00:00.000Z'), tzOffsetMin: tz }, now)).toBe(0);
    });
    it('дирӯз хондааст → 0 (имрӯз ҳанӯз тамом нашуда)', () => {
      expect(missedDays({ streak: 5, lastActiveDate: at('2026-09-08T10:00:00.000Z'), tzOffsetMin: tz }, now)).toBe(0);
    });
    it('парерӯз хондааст → 1 рӯзи холӣ', () => {
      expect(missedDays({ streak: 5, lastActiveDate: at('2026-09-07T10:00:00.000Z'), tzOffsetMin: tz }, now)).toBe(1);
    });
    it('панҷ рӯз пеш → 4 рӯзи холӣ', () => {
      expect(missedDays({ streak: 5, lastActiveDate: at('2026-09-04T10:00:00.000Z'), tzOffsetMin: tz }, now)).toBe(4);
    });
  });

  describe('коҳиш бе freeze', () => {
    const noFreeze = { streakFreezesAvailable: 0, tzOffsetMin: tz };

    it('1 рӯз нахонд → −1', () => {
      const d = decayStreak({ ...noFreeze, streak: 10, lastActiveDate: at('2026-09-07T10:00:00.000Z') }, now);
      expect(d.streak).toBe(9);
      expect(d.daysLost).toBe(1);
    });

    it('3 рӯз нахонд → −3', () => {
      const d = decayStreak({ ...noFreeze, streak: 10, lastActiveDate: at('2026-09-05T10:00:00.000Z') }, now);
      expect(d.streak).toBe(7);
      expect(d.daysLost).toBe(3);
    });

    it('аз силсила зиёдтар рӯз гузашт → 0, на рақами манфӣ', () => {
      const d = decayStreak({ ...noFreeze, streak: 2, lastActiveDate: at('2026-08-01T10:00:00.000Z') }, now);
      expect(d.streak).toBe(0);
      expect(d.daysLost).toBe(2);
    });

    it('дирӯз хондааст → ҳеҷ коҳиш', () => {
      const d = decayStreak({ ...noFreeze, streak: 31, lastActiveDate: at('2026-09-08T10:00:00.000Z') }, now);
      expect(d.streak).toBe(31);
      expect(d.freezesSpent).toBe(0);
    });
  });

  describe('freeze — як дона як рӯзро мехарад', () => {
    it('3 рӯзи холӣ + 2 freeze → 2 рӯз наҷот, 1 рӯз гум (10 → 9)', () => {
      const d = decayStreak(
        { streak: 10, lastActiveDate: at('2026-09-05T10:00:00.000Z'), tzOffsetMin: tz, streakFreezesAvailable: 2 },
        now,
      );
      expect(d.missedDays).toBe(3);
      expect(d.freezesSpent).toBe(2);
      expect(d.streak).toBe(9);
    });

    it('1 рӯзи холӣ + 1 freeze → пурра наҷот', () => {
      const d = decayStreak(
        { streak: 10, lastActiveDate: at('2026-09-07T10:00:00.000Z'), tzOffsetMin: tz, streakFreezesAvailable: 1 },
        now,
      );
      expect(d.streak).toBe(10);
      expect(d.freezesSpent).toBe(1);
    });

    it('freeze аз лозим зиёд → танҳо ҳамон қадар сарф мешавад', () => {
      const d = decayStreak(
        { streak: 10, lastActiveDate: at('2026-09-07T10:00:00.000Z'), tzOffsetMin: tz, streakFreezesAvailable: 2 },
        now,
      );
      expect(d.freezesSpent).toBe(1);
    });

    it('силсила ба ҳар ҳол мемирад → freeze бар абас НАМЕСӮЗАД', () => {
      const d = decayStreak(
        { streak: 2, lastActiveDate: at('2026-08-01T10:00:00.000Z'), tzOffsetMin: tz, streakFreezesAvailable: 2 },
        now,
      );
      expect(d.streak).toBe(0);
      expect(d.freezesSpent).toBe(0);
    });
  });

  describe('liveStreak — он чи рейтинг нишон медиҳад', () => {
    it('ҳолати воқеии продакшн: 🔥11, як моҳ пеш рафтааст, freeze нест → 0', () => {
      expect(liveStreak(
        { streak: 11, lastActiveDate: at('2026-08-10T10:00:00.000Z'), tzOffsetMin: tz, streakFreezesAvailable: 0 },
        now,
      )).toBe(0);
    });

    it('ҳеҷ гоҳ фаъол набуд → 0', () => {
      expect(liveStreak({ streak: 5, lastActiveDate: null, tzOffsetMin: tz }, now)).toBe(0);
    });

    it('силсила аллакай 0 → 0', () => {
      expect(liveStreak({ streak: 0, lastActiveDate: at('2026-09-09T04:00:00.000Z'), tzOffsetMin: tz }, now)).toBe(0);
    });

    it('freeze набошад ҳамчун 0 ҳисоб мешавад (майдон нест)', () => {
      expect(liveStreak({ streak: 6, lastActiveDate: at('2026-09-06T10:00:00.000Z'), tzOffsetMin: tz }, now)).toBe(4);
    });
  });

  describe('рӯз аз рӯи вақти МАҲАЛЛӢ, на UTC', () => {
    it('соати 01:00-и шаб ҳанӯз ҳамон рӯзи корбар аст', () => {
      // Ҳозир 2026-09-09T19:30Z = 00:30-и 10 сентябр дар Душанбе.
      const nowLate = at('2026-09-09T19:30:00.000Z');
      // Фаъолият 23:00-и 9 сентябри маҳаллӣ = дирӯз → ҳанӯз солим.
      expect(liveStreak({ streak: 4, lastActiveDate: at('2026-09-09T18:00:00.000Z'), tzOffsetMin: tz }, nowLate)).toBe(4);
    });

    it('бе tzOffsetMin пешфарзи Душанбе кор мекунад', () => {
      // 20:00Z = 01:00-и 9 сентябр дар Душанбе → имрӯз, на дирӯз.
      expect(liveStreak({ streak: 7, lastActiveDate: at('2026-09-08T20:00:00.000Z') }, now)).toBe(7);
    });
  });
});
