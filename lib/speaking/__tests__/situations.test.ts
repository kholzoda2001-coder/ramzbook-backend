/**
 * «Гуфтор»-и нав: тартиби вазъиятҳо ва дастрасии ройгон (26.09.2026).
 */
import { describe, expect, it } from 'vitest';
import { asGoal, inPath, isSituation, levelOf, orderChapters } from '../situations';
import {
  FREE_SITUATIONS,
  unlockedSpeakingLessonIds,
} from '../access';

const legacy = (id: string, order: number, n = 3) => ({
  id,
  order,
  goals: [] as string[],
  lessons: Array.from({ length: n }, (_, i) => ({ id: `${id}${i}`, stage: null })),
});

const situation = (id: string, order: number, goals: string[], n = 5) => ({
  id,
  order,
  goals,
  lessons: Array.from({ length: n }, (_, i) => ({
    id: `${id}${i}`,
    stage: i < 2 ? 'words' : 'dialogue',
  })),
});

describe('orderChapters', () => {
  const chapters = [
    legacy('old', 0),
    situation('taxi', 3, ['drive']),
    situation('doctor', 2, []),
    situation('site', 1, ['build']),
  ];

  it('роҳ (ҳадаф + умумӣ) БАҲАМ аз рӯи order, баъд нишаҳои дигар, кӯҳна дар охир', () => {
    expect(orderChapters(chapters, 'build').map((c) => c.id)).toEqual([
      'site',
      'doctor',
      'taxi',
      'old',
    ]);
    // «Назди духтур» (order 2) пеш аз «Такси» (order 3) — умумӣ ва ҳадаф баҳам.
    expect(orderChapters(chapters, 'drive').map((c) => c.id)).toEqual([
      'doctor',
      'taxi',
      'site',
      'old',
    ]);
  });

  it('Шиносоӣ (умумӣ, order 1) пеш аз «Кор ёфтан» (ҳадаф, order 2)', () => {
    const path = [
      situation('job', 2, ['build', 'drive']),
      situation('meet', 1, []),
      situation('site', 3, ['build']),
    ];
    expect(orderChapters(path, 'build').map((c) => c.id)).toEqual(['meet', 'job', 'site']);
  });

  it('бе ҳадаф: ҳамаи вазъиятҳо бо `order`', () => {
    expect(orderChapters(chapters, null).map((c) => c.id)).toEqual([
      'site',
      'doctor',
      'taxi',
      'old',
    ]);
  });

  it('inPath: ҳадаф + умумӣ; нишаи дигар ва кӯҳна — не', () => {
    expect(inPath(situation('site', 1, ['build']), 'build')).toBe(true);
    expect(inPath(situation('doctor', 2, []), 'build')).toBe(true);
    expect(inPath(situation('taxi', 3, ['drive']), 'build')).toBe(false);
    expect(inPath(legacy('old', 0), 'build')).toBe(false);
    expect(inPath(situation('taxi', 3, ['drive']), null)).toBe(true);
  });

  it('general: ҲАМАИ умумӣ аввал, баъд нишаи life; нишаҳои касбӣ берун аз роҳ', () => {
    const all = [
      situation('meet', 1, []),
      situation('airport', 3, ['life']),
      situation('site', 3, ['build']),
      situation('doctor', 6, []),
      situation('hotel', 4, ['life']),
      situation('docs', 16, []),
      situation('job', 2, ['build', 'service', 'drive', 'life']),
      legacy('old', 0),
    ];
    // Умумӣ (1, 6, 16) — ҳатто пеш аз «life»-и order 2/3/4.
    expect(orderChapters(all, 'general').map((c) => c.id)).toEqual([
      'meet', 'doctor', 'docs', 'job', 'airport', 'hotel', 'site', 'old',
    ]);
    expect(inPath(situation('meet', 1, []), 'general')).toBe(true);
    expect(inPath(situation('hotel', 4, ['life']), 'general')).toBe(true);
    expect(inPath(situation('site', 3, ['build']), 'general')).toBe(false);
    expect(inPath(legacy('old', 0), 'general')).toBe(false);
    expect(asGoal('general')).toBe('general');
  });

  it('general дар сатҳҳо: A1-и умумӣ ва life пеш аз A2', () => {
    const all = [
      { ...situation('meet2', 1, []), level: 2 },
      situation('hotel', 4, ['life']),
      situation('meet', 1, []),
    ];
    expect(orderChapters(all, 'general').map((c) => c.id)).toEqual(['meet', 'hotel', 'meet2']);
  });

  it('isSituation / asGoal', () => {
    expect(isSituation(legacy('a', 0))).toBe(false);
    expect(isSituation(situation('b', 0, []))).toBe(true);
    expect(asGoal('build')).toBe('build');
    expect(asGoal('hack')).toBeNull();
    expect(asGoal(null)).toBeNull();
  });
});

describe('дастрасии ройгон', () => {
  it(`${FREE_SITUATIONS} вазъияти аввал ПУРРА ройгон, дигарҳо — 0 (27.09.2026)`, () => {
    expect(FREE_SITUATIONS).toBe(1);
    const open = unlockedSpeakingLessonIds({
      chapters: [situation('meet', 0, []), situation('site', 1, ['build']), situation('doctor', 2, [])],
      isPremium: false,
    });
    expect(Array.from(open).sort()).toEqual(['meet0', 'meet1', 'meet2', 'meet3', 'meet4']);
  });

  it('вазъияти ройгон аз ҳадаф намеҷаҳад — аввалин УМУМӢ, на аввалин дар рӯйхат', () => {
    // Ҳадафи «сохтмон» бобҳоро дигар тартиб медиҳад; «Шиносоӣ» ройгон мемонад.
    const open = unlockedSpeakingLessonIds({
      chapters: [situation('site', 0, ['build']), situation('meet', 1, []), situation('doctor', 2, [])],
      isPremium: false,
    });
    expect(Array.from(open).sort()).toEqual(['meet0', 'meet1', 'meet2', 'meet3', 'meet4']);
  });

  it('вазъияти умумӣ нест → аввалин вазъият', () => {
    const open = unlockedSpeakingLessonIds({
      chapters: [situation('site', 0, ['build']), situation('shop', 1, ['trade'])],
      isPremium: false,
    });
    expect(Array.from(open).sort()).toEqual(['site0', 'site1', 'site2', 'site3', 'site4']);
  });

  it('гузаштаи вазъияти дигар кушода мемонад (ройгони пештара гирифта намешавад)', () => {
    const open = unlockedSpeakingLessonIds({
      chapters: [situation('meet', 0, []), situation('doctor', 1, [])],
      completedIds: ['doctor0', 'doctor1'],
      isPremium: false,
    });
    expect(open.has('doctor0') && open.has('doctor1')).toBe(true);
    expect(open.has('doctor2')).toBe(false);
  });

  it('бобҳои кӯҳна қоидаи пештараро доранд — танҳо дарси аввали занҷири кӯҳна', () => {
    // Тартиби нав вазъиятро пеш мегузорад — дарси ройгони кӯҳна набояд кӯчад.
    const open = unlockedSpeakingLessonIds({
      chapters: [situation('doctor', 0, []), legacy('old', 1), legacy('old2', 2)],
      isPremium: false,
    });
    expect(open.has('old0')).toBe(true);
    expect(open.has('old1')).toBe(false);
    expect(open.has('old20')).toBe(false);
    expect(open.has('doctor4')).toBe(true);
  });

  it('гузашта ҳамеша кушода, премиум — ҳама', () => {
    const chapters = [situation('doctor', 0, [])];
    expect(
      unlockedSpeakingLessonIds({ chapters, completedIds: ['doctor4'], isPremium: false }).has(
        'doctor4',
      ),
    ).toBe(true);
    expect(unlockedSpeakingLessonIds({ chapters, isPremium: true }).size).toBe(5);
  });
});

describe('сатҳҳои ниша (27.09.2026)', () => {
  it('роҳ: ҳамаи сатҳи 1, баъд сатҳи 2 — новобаста аз order', () => {
    const chapters = [
      { ...situation('pay2', 1, ['build']), level: 2 },
      { ...situation('meet', 1, []), level: 1 },
      { ...situation('site', 3, ['build']), level: 1 },
      { ...situation('meet2', 0, []), level: 2 },
    ];
    expect(orderChapters(chapters, 'build').map((c) => c.id)).toEqual([
      'meet',
      'site',
      'meet2',
      'pay2',
    ]);
  });

  it('levelOf: холӣ ё ғалат → 1', () => {
    expect(levelOf({})).toBe(1);
    expect(levelOf({ level: null })).toBe(1);
    expect(levelOf({ level: 2 })).toBe(2);
    expect(levelOf({ level: 9 })).toBe(1);
    expect(levelOf({ level: 0 })).toBe(1);
  });
});
