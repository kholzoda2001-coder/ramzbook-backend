import { describe, expect, it, vi } from 'vitest';
import { languageStats } from '../languageStats';

/**
 * Пешрафт БО ЗАБОНҲО.
 *
 * ── Ду боге, ки ин тест мебандад ───────────────────────────────────────────
 *
 * 1. Рӯйхати профил рақами УМУМИРО ба забони ФАЪОЛ мечаспонд. Корбар
 *    англисиро интихоб мекард — 8438 XP ба англисӣ; арабиро интихоб
 *    мекард — ҲАМОН 8438 ба арабӣ мекӯчид.
 *
 * 2. Кӯшиши аввали ислоҳ рӯйхатро аз `UserLanguage` мегирифт. Санҷиш дар
 *    базаи ИСТЕҲСОЛӢ нишон дод, ки он ҷадвал барои корбарони воқеӣ ТАМОМАН
 *    холист: корбари 21 021 XP-дор бо 284 дарси англисӣ дар он ҷо сифр сатр
 *    дорад. Ислоҳ хомӯшона кор намекард ва боги нав ба ҷои кӯҳна меомад.
 *
 * Пас манбаъ ҳатман `UserProgress` аст, ва `UserLanguage` танҳо барои
 * сатҳи CEFR — он ҳам ихтиёрӣ.
 */

/** Як сатри `UserProgress` бо занҷири забонаш. */
const row = (code: string, xp: number) => ({
  xpEarned: xp,
  lesson: { module: { course: { targetLanguage: { code } } } },
});

function fakePrisma(opts: {
  progress: unknown[];
  userLanguages?: unknown[];
  lessonTotals?: Record<string, number>;
}) {
  return {
    userProgress: { findMany: vi.fn().mockResolvedValue(opts.progress) },
    userLanguage: {
      findMany: vi.fn().mockResolvedValue(opts.userLanguages ?? []),
    },
    lesson: {
      count: vi.fn().mockImplementation((args: any) => {
        const code = args?.where?.module?.course?.targetLanguage?.code;
        return Promise.resolve(opts.lessonTotals?.[code] ?? 0);
      }),
    },
  } as any;
}

describe('ҳар забон рақами ХУДашро мегирад', () => {
  it('XP ва дарсҳо аз рӯи забон ҷудо мешаванд', async () => {
    const out = await languageStats(
      fakePrisma({
        progress: [
          row('en', 100),
          row('en', 50),
          row('ar', 30),
        ],
        lessonTotals: { en: 4, ar: 10 },
      }),
      'u1',
      'tg',
    );

    const en = out.find((r) => r.code === 'en')!;
    const ar = out.find((r) => r.code === 'ar')!;

    expect(en.xp).toBe(150);
    expect(en.lessons).toBe(2);
    expect(ar.xp).toBe(30);
    expect(ar.lessons).toBe(1);
  });

  it('ЯК рақам ба ду забон дода намешавад', async () => {
    // Маҳз боги корбар: 8438 дар ҳарду.
    const out = await languageStats(
      fakePrisma({
        progress: [row('en', 8438)],
        lessonTotals: { en: 100 },
      }),
      'u1',
      'tg',
    );
    expect(out).toHaveLength(1);
    expect(out[0].code).toBe('en');
    expect(out[0].xp).toBe(8438);
  });

  it('забони бе пешрафт дар ҷавоб НАМЕОЯД', async () => {
    // Барнома барои он сифр мекашад — ва ин дуруст аст.
    const out = await languageStats(
      fakePrisma({ progress: [row('en', 10)], lessonTotals: { en: 5 } }),
      'u1',
      'tg',
    );
    expect(out.map((r) => r.code)).toEqual(['en']);
  });
});

describe('`UserLanguage`-и ХОЛӢ ҳамааш вайрон намекунад', () => {
  it('рақамҳо бе ягон сатри `UserLanguage` меоянд', async () => {
    // 🔴 Ҳолати ВОҚЕИИ базаи истеҳсолӣ.
    const out = await languageStats(
      fakePrisma({
        progress: [row('en', 17430)],
        userLanguages: [],
        lessonTotals: { en: 300 },
      }),
      'u1',
      'tg',
    );
    expect(out[0].xp).toBe(17430);
    expect(out[0].level).toBe('A1');
  });

  it('сатҳ гирифта мешавад, агар сатр бошад', async () => {
    const out = await languageStats(
      fakePrisma({
        progress: [row('en', 10)],
        userLanguages: [{ currentLevel: 'B1', language: { code: 'en' } }],
        lessonTotals: { en: 5 },
      }),
      'u1',
      'tg',
    );
    expect(out[0].level).toBe('B1');
  });
});

describe('фоиз', () => {
  it('аз дарсҳои ҷуфти забон ҳисоб мешавад', async () => {
    const out = await languageStats(
      fakePrisma({ progress: [row('en', 1), row('en', 1)], lessonTotals: { en: 8 } }),
      'u1',
      'tg',
    );
    expect(out[0].percent).toBe(25);
  });

  it('дар 100 МАҲДУД мешавад', async () => {
    // Корбар забони модариро иваз кардааст: дарсҳои ҷуфти кӯҳна ҳисоб
    // мешаванд, вале маҷмӯи ҷуфти нав хурдтар аст → 300%.
    const out = await languageStats(
      fakePrisma({
        progress: [row('en', 1), row('en', 1), row('en', 1)],
        lessonTotals: { en: 1 },
      }),
      'u1',
      'tg',
    );
    expect(out[0].percent).toBe(100);
  });

  it('курси холӣ ба тақсим ба сифр намебарад', async () => {
    const out = await languageStats(
      fakePrisma({ progress: [row('de', 5)], lessonTotals: {} }),
      'u1',
      'tg',
    );
    expect(out[0].percent).toBe(0);
    expect(out[0].xp).toBe(5);
  });
});

describe('ҳадҳо', () => {
  it('бе ягон пешрафт рӯйхати холӣ медиҳад', async () => {
    const out = await languageStats(fakePrisma({ progress: [] }), 'u1', 'tg');
    expect(out).toEqual([]);
  });

  it('дарси бе занҷири забон партофта мешавад', async () => {
    // Мазмуни нимкора (модул ё курс нест) набояд `undefined`-ро калид кунад.
    const out = await languageStats(
      fakePrisma({
        progress: [
          { xpEarned: 5, lesson: null },
          { xpEarned: 7, lesson: { module: null } },
          row('en', 3),
        ],
        lessonTotals: { en: 1 },
      }),
      'u1',
      'tg',
    );
    expect(out).toHaveLength(1);
    expect(out[0].xp).toBe(3);
  });

  it('калонтарин забон ЯКУМ меистад', async () => {
    const out = await languageStats(
      fakePrisma({
        progress: [row('ar', 10), row('en', 900), row('ru', 100)],
        lessonTotals: { en: 1, ar: 1, ru: 1 },
      }),
      'u1',
      'tg',
    );
    expect(out.map((r) => r.code)).toEqual(['en', 'ru', 'ar']);
  });
});
