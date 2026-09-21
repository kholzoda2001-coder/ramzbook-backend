/**
 * Дашборди хонанда — қоидаҳои ҳисоб.
 *
 *   node_modules/.bin/vitest run lib/admin/__tests__/userDashboard.test.ts
 */
import { describe, it, expect } from 'vitest';
import {
  type LangRow,
  dayKey, hourOf, weekdayOf, normSkill, higherLevel,
  buildLanguages, buildDaily, buildHours, buildWeekdays, buildBooks,
  summarize, longestDayStreak, findSyncBursts,
} from '../userDashboard';

const row = (over: Partial<LangRow> = {}): LangRow => ({
  code: 'en', name: 'English', flag: '🇬🇧', level: 'A1', skillType: 'vocab',
  lessons: 1, xp: 10, timeSpent: 60, accuracySum: 100, heartsLost: 0,
  lastAt: '2026-09-01T10:00:00.000Z',
  ...over,
});

describe('Вақти Душанбе', () => {
  it('нисфи шаби маҳаллӣ ба рӯзи ДУРУСТ меафтад', () => {
    // 19:30 UTC = 00:30-и рӯзи ОЯНДА дар Душанбе
    expect(dayKey('2026-09-20T19:30:00.000Z')).toBe('2026-09-21');
    expect(dayKey('2026-09-20T18:30:00.000Z')).toBe('2026-09-20');
  });
  it('соат бо +5 ҳисоб мешавад', () => {
    expect(hourOf('2026-09-20T19:30:00.000Z')).toBe(0);
    expect(hourOf('2026-09-20T05:00:00.000Z')).toBe(10);
  });
  it('ҳафта аз ДУШАНБЕ сар мешавад', () => {
    expect(weekdayOf('2026-09-21T06:00:00.000Z')).toBe(0); // душанбе
    expect(weekdayOf('2026-09-20T06:00:00.000Z')).toBe(6); // якшанбе
  });
});

describe('Забонҳо', () => {
  it('сатрҳои як забон ҶАМЪ мешаванд ва миёнаи дақиқӣ дуруст аст', () => {
    const langs = buildLanguages([
      row({ lessons: 2, xp: 20, timeSpent: 120, accuracySum: 180 }),  // 90% × 2
      row({ lessons: 2, xp: 30, timeSpent: 60, accuracySum: 140, skillType: 'grammar' }), // 70% × 2
    ]);
    expect(langs).toHaveLength(1);
    expect(langs[0].lessons).toBe(4);
    expect(langs[0].xp).toBe(50);
    expect(langs[0].minutes).toBe(3);
    expect(langs[0].accuracy).toBe(80); // (180+140)/4
    expect(langs[0].bySkill).toEqual({ vocab: 2, grammar: 2 });
  });

  it('`vocabulary` ва `vocab` ЯК маҳоратанд', () => {
    expect(normSkill('vocabulary')).toBe('vocab');
    expect(normSkill(null)).toBe('other');
    const langs = buildLanguages([
      row({ skillType: 'vocab', lessons: 3 }),
      row({ skillType: 'vocabulary', lessons: 2 }),
    ]);
    expect(langs[0].bySkill).toEqual({ vocab: 5 });
  });

  it('сатҳ = БОЛОТАРИН, на охирин сатр', () => {
    expect(higherLevel('A1', 'B1')).toBe('B1');
    expect(higherLevel('B1', 'A2')).toBe('B1');
    const langs = buildLanguages([
      row({ level: 'B1', lessons: 1 }),
      row({ level: 'A1', lessons: 5 }),
    ]);
    expect(langs[0].level).toBe('B1');
    expect(langs[0].byLevel).toEqual({ B1: 1, A1: 5 });
  });

  it('«фаъолияти охирин» ҳақиқатан охирин аст', () => {
    const langs = buildLanguages([
      row({ lastAt: '2026-01-01T00:00:00.000Z' }),
      row({ lastAt: '2026-09-09T00:00:00.000Z' }),
      row({ lastAt: null }),
    ]);
    expect(langs[0].lastAt).toBe('2026-09-09T00:00:00.000Z');
  });

  it('забонҳо аз рӯи шумораи дарс тартиб мегиранд ва калима мечаспад', () => {
    const langs = buildLanguages(
      [row({ code: 'ru', lessons: 2 }), row({ code: 'en', lessons: 9 })],
      { en: 461, ru: 7 },
    );
    expect(langs.map((l) => l.code)).toEqual(['en', 'ru']);
    expect(langs[0].words).toBe(461);
    expect(langs[1].words).toBe(7);
  });

  it('забони бе калима 0 мегирад, на undefined', () => {
    expect(buildLanguages([row({ code: 'ko' })], {})[0].words).toBe(0);
  });
});

describe('Рӯзҳо', () => {
  it('рӯзҳои ХОЛӢ ҳам сатр доранд (график сӯрох намемонад)', () => {
    const d = buildDaily([{ day: '2026-09-21', lessons: 3, xp: 30, timeSpent: 600 }], [], '2026-09-21', 5);
    expect(d).toHaveLength(5);
    expect(d.map((x) => x.date)).toEqual(['2026-09-17', '2026-09-18', '2026-09-19', '2026-09-20', '2026-09-21']);
    expect(d[4]).toEqual({ date: '2026-09-21', lessons: 3, xp: 30, minutes: 10 });
    expect(d[0].lessons).toBe(0);
  });

  it('XP-и расмии рӯз (DailyXp) бар XP-и дарс бартарӣ дорад', () => {
    // XP-и дучанд ва гуфтор дар `UserProgress` нестанд.
    const d = buildDaily(
      [{ day: '2026-09-21', lessons: 2, xp: 100, timeSpent: 0 }],
      [{ day: '2026-09-21', xp: 218 }],
      '2026-09-21', 1,
    );
    expect(d[0].xp).toBe(218);
    expect(d[0].lessons).toBe(2);
  });

  it('силсилаи дарозтарини РӮЗҲОИ пайдарпай', () => {
    expect(longestDayStreak(['2026-09-01', '2026-09-02', '2026-09-03', '2026-09-05'])).toBe(3);
    expect(longestDayStreak(['2026-09-01', '2026-09-01'])).toBe(1);
    expect(longestDayStreak([])).toBe(0);
  });

  it('соат ва рӯзи ҳафта дуруст ҷамъ мешаванд', () => {
    const hours = buildHours(['2026-09-20T19:30:00.000Z', '2026-09-21T19:45:00.000Z']);
    expect(hours[0]).toBe(2);
    expect(hours.reduce((a, b) => a + b, 0)).toBe(2);
    const wd = buildWeekdays(['2026-09-21T06:00:00.000Z']);
    expect(wd[0]).toBe(1);
  });
});

describe('Китобхона', () => {
  it('саҳифаи 0 = 1 саҳифаи хондашуда, на «0»', () => {
    const b = buildBooks([{ title: 'Китоб', type: 'book', level: 'A1', position: 0, total: 20, lastReadAt: null }]);
    expect(b[0].pagesRead).toBe(1);
    expect(b[0].percent).toBe(5);
  });
  it('аз ҳад зиёд нашавад ва бе `total` наафтад', () => {
    const b = buildBooks([
      { title: 'A', type: 'book', level: null, position: 99, total: 20, lastReadAt: null },
      { title: 'B', type: 'audio', level: null, position: 3, total: 0, lastReadAt: null },
    ]);
    expect(b.find((x) => x.title === 'A')!.pagesRead).toBe(20);
    expect(b.find((x) => x.title === 'B')!.percent).toBe(0);
  });
  it('охирин хондашуда болост', () => {
    const b = buildBooks([
      { title: 'кӯҳна', type: 'book', level: null, position: 1, total: 10, lastReadAt: '2026-01-01T00:00:00.000Z' },
      { title: 'нав', type: 'book', level: null, position: 1, total: 10, lastReadAt: '2026-09-01T00:00:00.000Z' },
    ]);
    expect(b[0].title).toBe('нав');
  });
});

describe('Ҷамъбаст', () => {
  it('рӯзи фаъол = рӯзе, ки дарс Ё XP дорад', () => {
    const langs = buildLanguages([row({ lessons: 4, xp: 40, timeSpent: 600, accuracySum: 320 })], { en: 12 });
    const daily = buildDaily(
      [{ day: '2026-09-20', lessons: 4, xp: 40, timeSpent: 600 }],
      [{ day: '2026-09-19', xp: 15 }],
      '2026-09-21', 5,
    );
    const s = summarize(langs, daily);
    expect(s.lessons).toBe(4);
    expect(s.words).toBe(12);
    expect(s.accuracy).toBe(80);
    expect(s.minutes).toBe(10);
    expect(s.activeDays).toBe(2);
  });

  it('корбари холӣ ҳеҷ чизро намешиканад', () => {
    const s = summarize([], buildDaily([], [], '2026-09-21', 3));
    expect(s).toEqual({ lessons: 0, minutes: 0, xp: 0, words: 0, accuracy: 0, activeDays: 0 });
  });
});

describe('Таркиши синхронизатсия', () => {
  // Маълумоти ВОҚЕӢ: 201 дарс дар 112 сония (2026-08-29).
  const burstDay = {
    day: '2026-08-29', lessons: 201, xp: 9000, timeSpent: 0,
    firstAt: '2026-08-28T21:57:46.000Z', lastAt: '2026-08-28T21:59:38.000Z',
  };
  const realDay = {
    day: '2026-09-03', lessons: 13, xp: 400, timeSpent: 3000,
    firstAt: '2026-09-03T06:21:59.000Z', lastAt: '2026-09-03T08:46:38.000Z',
  };
  const longDay = {
    day: '2026-09-04', lessons: 40, xp: 900, timeSpent: 9000,
    firstAt: '2026-09-04T06:00:00.000Z', lastAt: '2026-09-04T09:00:00.000Z',
  };

  it('таркишро мегирад', () => {
    expect(findSyncBursts([burstDay])).toEqual([{ date: '2026-08-29', lessons: 201, seconds: 112 }]);
  });
  it('рӯзи ВОҚЕИИ хониш огоҳӣ намедиҳад', () => {
    expect(findSyncBursts([realDay, longDay])).toEqual([]);
  });
  it('бе вақт сатр партофта мешавад, на фарз карда', () => {
    expect(findSyncBursts([{ day: 'x', lessons: 99, xp: 0, timeSpent: 0 }])).toEqual([]);
  });
  it('калонтаринаш аввал меистад', () => {
    const second = { ...burstDay, day: '2026-07-01', lessons: 30 };
    expect(findSyncBursts([second, burstDay]).map((b) => b.lessons)).toEqual([201, 30]);
  });
});
