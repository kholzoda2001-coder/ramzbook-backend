/**
 * «Гуфтор»-и нав: тартиби вазъиятҳо ва дастрасии ройгон (26.09.2026).
 */
import { describe, expect, it } from 'vitest';
import { asGoal, inPath, isSituation, orderChapters } from '../situations';
import {
  FREE_SESSIONS_PER_SITUATION,
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

  it('isSituation / asGoal', () => {
    expect(isSituation(legacy('a', 0))).toBe(false);
    expect(isSituation(situation('b', 0, []))).toBe(true);
    expect(asGoal('build')).toBe('build');
    expect(asGoal('hack')).toBeNull();
    expect(asGoal(null)).toBeNull();
  });
});

describe('дастрасии ройгон', () => {
  it(`ҳар вазъият ${FREE_SESSIONS_PER_SITUATION} нишасти аввалро медиҳад`, () => {
    const open = unlockedSpeakingLessonIds({
      chapters: [situation('doctor', 0, []), situation('site', 1, ['build'])],
      isPremium: false,
    });
    expect(Array.from(open).sort()).toEqual(['doctor0', 'doctor1', 'site0', 'site1']);
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
    expect(open.has('doctor2')).toBe(false);
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
