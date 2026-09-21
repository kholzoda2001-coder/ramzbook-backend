/**
 * XP барои хондан — қоидаи хасис.
 *
 * 🔴 То 22.09.2026 хондан умуман ҳисоб намешуд: 0 XP, стрик мешикаст, вазифаи
 * рӯз пеш намерафт ва хонандаи китобхон барои сервер «ғайрифаъол» буд.
 * Ҳамин қоида онро ислоҳ мекунад — вале тавре, ки ба «фермаи XP» табдил
 * нашавад.
 */
import { describe, it, expect } from 'vitest';
import { readingXp, READ_XP_PER_PAGE, READ_XP_DAILY_CAP } from '../libraryProgress';

describe('XP барои хондан', () => {
  it('танҳо ҷои НАВ ҳисоб мешавад', () => {
    expect(readingXp(0, 1, 0)).toBe(READ_XP_PER_PAGE);
    expect(readingXp(3, 6, 0)).toBe(3 * READ_XP_PER_PAGE);
  });

  it('варақи такрорӣ ва бозгашт ҳеҷ чиз намедиҳад', () => {
    // Хонанда бобро дубора мехонад ё ба қафо мегардад — фаъолият ҳаст
    // (`markStudied` дар роут ҷудост), вале XP нест.
    expect(readingXp(5, 5, 0)).toBe(0);
    expect(readingXp(5, 2, 0)).toBe(0);
  });

  it('ҳадди рӯзона риоя мешавад', () => {
    expect(readingXp(0, 100, 0)).toBe(READ_XP_DAILY_CAP);
    expect(readingXp(0, 100, READ_XP_DAILY_CAP)).toBe(0);
    // Нисфи ҳад аллакай гирифта шуд → танҳо нисфи боқимонда меояд.
    expect(readingXp(0, 100, READ_XP_DAILY_CAP - 4)).toBe(4);
  });

  it('рақами вайрон ҳеҷ чизро намешиканад', () => {
    expect(readingXp(0, 0, 0)).toBe(0);
    expect(readingXp(-5, 2, 0)).toBeGreaterThanOrEqual(0);
    expect(readingXp(0, 3, -100)).toBeLessThanOrEqual(READ_XP_DAILY_CAP);
    expect(readingXp(1.7, 3.9, 0)).toBe(2 * READ_XP_PER_PAGE); // 1 → 3
  });

  it('ҳадди рӯзона аз як дарси луғат зиёд нест', () => {
    // Вагарна хондан аз дарс «фоиданоктар» мешуд ва роҳи омӯзишро мекушт.
    expect(READ_XP_DAILY_CAP).toBeLessThanOrEqual(25);
  });
});
