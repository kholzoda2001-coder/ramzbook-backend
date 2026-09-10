import { describe, expect, it } from 'vitest';
import { SRS_NEW_PER_DAY, dueDayStart, spreadNewCards } from '../srs';

/**
 * Ин тестҳо маҳз ҳамон ҳолати продакшнро қулф мекунанд, ки навбатро кушт:
 * тамомкунии дарс 571 корти навро ба ЯК рӯз мепартофт, ва се хонандаи фаъол
 * 100% колодаашонро мӯҳлатрасида доштанд (851, 740, 484 корт).
 */
describe('spreadNewCards — ҳадди рӯзонаи кортҳои нав', () => {
  it('камтар аз ҳад → ҳама ба ФАРДО (на ба имрӯз)', () => {
    expect(spreadNewCards(5)).toEqual([1, 1, 1, 1, 1]);
  });

  it('маҳз ба ҳад баробар → ҳанӯз як рӯз', () => {
    const out = spreadNewCards(SRS_NEW_PER_DAY);
    expect(new Set(out)).toEqual(new Set([1]));
    expect(out).toHaveLength(SRS_NEW_PER_DAY);
  });

  it('аз ҳад зиёд → ба рӯзи оянда мегузарад', () => {
    const out = spreadNewCards(SRS_NEW_PER_DAY + 3);
    expect(out.filter((d) => d === 1)).toHaveLength(SRS_NEW_PER_DAY);
    expect(out.filter((d) => d === 2)).toHaveLength(3);
  });

  it('ҳолати воқеии продакшн: 571 корт дар як рӯз паҳн мешавад, на як тӯда', () => {
    const out = spreadNewCards(571);
    const perDay = new Map<number, number>();
    for (const d of out) perDay.set(d, (perDay.get(d) ?? 0) + 1);
    // Ҳеҷ рӯз аз ҳад намегузарад…
    for (const n of Array.from(perDay.values())) expect(n).toBeLessThanOrEqual(SRS_NEW_PER_DAY);
    // …ва 571 корт ба 29 рӯз паҳн мешавад, на ҳамааш ба фардо.
    expect(Math.max(...out)).toBe(Math.ceil(571 / SRS_NEW_PER_DAY));
  });

  it('рӯзҳои аллакай пур ба ҳисоб гирифта мешаванд', () => {
    // Фардо аллакай пур аст, пасфардо як ҷои холӣ дорад.
    const already = new Map([[1, SRS_NEW_PER_DAY], [2, SRS_NEW_PER_DAY - 1]]);
    expect(spreadNewCards(3, already)).toEqual([2, 3, 3]);
  });

  it('тартиби калимаҳо нигоҳ дошта мешавад — як дарс паҳлӯи ҳам мемонад', () => {
    const out = spreadNewCards(45);
    // Рӯзҳо танҳо боло мераванд, ҳеҷ гоҳ ба ақиб намегарданд.
    for (let i = 1; i < out.length; i++) expect(out[i]).toBeGreaterThanOrEqual(out[i - 1]);
  });

  it('сифр калима → рӯйхати холӣ', () => {
    expect(spreadNewCards(0)).toEqual([]);
  });
});

describe('dueDayStart — нимишаби МАҲАЛЛӢ', () => {
  it('фардо = нимишаби Душанбе, на UTC', () => {
    // 2026-09-09T05:00Z = 10:00-и Душанбе. Фардо = 10 сентябр, 00:00 маҳаллӣ.
    const now = new Date('2026-09-09T05:00:00.000Z');
    expect(dueDayStart(1, now).toISOString()).toBe('2026-09-09T19:00:00.000Z');
  });

  it('соати 01:00-и шаб ҳанӯз ҳамон рӯз аст', () => {
    // 2026-09-09T20:00Z = 01:00-и 10 сентябр дар Душанбе → фардо = 11 сентябр.
    const now = new Date('2026-09-09T20:00:00.000Z');
    expect(dueDayStart(1, now).toISOString()).toBe('2026-09-10T19:00:00.000Z');
  });

  it('рӯзи 0 = оғози имрӯзи маҳаллӣ', () => {
    const now = new Date('2026-09-09T05:00:00.000Z');
    expect(dueDayStart(0, now).toISOString()).toBe('2026-09-08T19:00:00.000Z');
  });
});
