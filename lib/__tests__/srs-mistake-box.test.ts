/**
 * Қуттии хатоҳо — айнан ҳамон сенария, ки корбар тасвир кард (21.09.2026):
 *
 *   «дар як рӯз 15 калима, ТАНҲО аз хатокардаҳои дарс… агар дар вақти такрор
 *    ягонтаашро хато кард, рӯзи баъд боз ояд… фардо 5 хатои нав + 10 кӯҳна =
 *    15… вақте ҳамаашро дуруст кард — ҷои такрор ХОЛӢ бошад»
 */
import { describe, it, expect } from 'vitest';
import {
  initialSrsState, reviewCard,
  afterLessonMistake, afterReviewAnswer, isInMistakeBox, MISTAKE_BOX_SIZE,
} from '../srs';

const DAY = 24 * 60 * 60 * 1000;
const T0 = new Date('2026-09-21T06:00:00.000Z'); // 11:00 дар Душанбе
const learned = () => ({ easeFactor: 2.5, intervalDays: 6, repetitions: 2, lapses: 0 });

describe('хато дар ДАРС', () => {
  it('калима ҲАМИН РӮЗ ба навбат меафтад, на фардо', () => {
    const s = afterLessonMistake(learned(), T0);
    expect(s.lapses).toBe(1);
    expect(s.dueAt.getTime()).toBe(T0.getTime());
    expect(isInMistakeBox(s)).toBe(true);
  });

  it('калимаи ҳанӯз кортнадошта ҳам ба қуттӣ меафтад', () => {
    const s = afterLessonMistake(null, T0);
    expect(isInMistakeBox(s)).toBe(true);
    expect(s.dueAt.getTime()).toBe(T0.getTime());
  });

  it('фосилаи SM-2-и калимаи омӯхташуда даст намехӯрад', () => {
    const s = afterLessonMistake(learned(), T0);
    expect(s.intervalDays).toBe(6);
    expect(s.repetitions).toBe(2);
  });

  it('хатои такрорӣ қарзро як зина боло мебарад', () => {
    const once = afterLessonMistake(learned(), T0);
    const twice = afterLessonMistake(once, T0);
    expect(twice.lapses).toBe(2);
  });
});

describe('ҷавоб дар ТАКРОР', () => {
  it('ДУРУСТ → калима аз қуттӣ мебарояд', () => {
    const inBox = afterLessonMistake(learned(), T0);
    const after = afterReviewAnswer(inBox, true, T0);
    expect(after.lapses).toBe(0);
    expect(isInMistakeBox(after)).toBe(false);
    // ва мӯҳлаташ ба пеш меравад — имрӯз дигар намебарояд
    expect(after.dueAt.getTime()).toBeGreaterThan(T0.getTime());
  });

  it('ХАТО → маҳз ФАРДО бармегардад ва дар қуттӣ мемонад', () => {
    const inBox = afterLessonMistake(learned(), T0);
    const after = afterReviewAnswer(inBox, false, T0);
    expect(isInMistakeBox(after)).toBe(true);
    expect(after.intervalDays).toBe(1);
    expect(after.dueAt.getTime()).toBe(T0.getTime() + DAY);
  });

  it('ҲАМА дуруст шуд → қуттӣ ХОЛӢ мешавад', () => {
    const box = [learned(), learned(), learned()].map((w) => afterLessonMistake(w, T0));
    const cleared = box.map((c) => afterReviewAnswer(c, true, T0));
    expect(cleared.filter(isInMistakeBox)).toHaveLength(0);
  });
});

describe('сенарияи пурраи ду рӯза (айнан аз талаби корбар)', () => {
  it('10 хато → 10 калима; 1 боз хато → фардо 5 нав + 10 кӯҳна = 15', () => {
    // ── Рӯзи 1: дар дарсҳо 10 хато ────────────────────────────────────────
    let box = Array.from({ length: 10 }, () => afterLessonMistake(learned(), T0));
    const dueDay1 = box.filter((c) => isInMistakeBox(c) && c.dueAt <= T0);
    expect(dueDay1).toHaveLength(10);

    // Такрор: 9-тояш дуруст, яке хато
    const day1Reviewed = box.map((c, i) => afterReviewAnswer(c, i !== 0, T0));
    expect(day1Reviewed.filter(isInMistakeBox)).toHaveLength(1);

    // ── Рӯзи 2 ────────────────────────────────────────────────────────────
    const T1 = new Date(T0.getTime() + DAY);
    const carried = day1Reviewed.filter(isInMistakeBox);
    expect(carried[0].dueAt.getTime()).toBe(T1.getTime()); // маҳз фардо

    // 9 хатои боқимондаи пешина (аз рӯзҳои дигар) + 5 хатои НАВ
    const older = Array.from({ length: 9 }, () => afterLessonMistake(learned(), T0));
    const fresh = Array.from({ length: 5 }, () => afterLessonMistake(learned(), T1));
    const all = [...older, ...carried, ...fresh];

    const dueDay2 = all
      .filter((c) => isInMistakeBox(c) && c.dueAt <= T1)
      .sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime())
      .slice(0, MISTAKE_BOX_SIZE);

    expect(dueDay2).toHaveLength(15);
    // Кӯҳнатаринҳо аввал — хатоҳои нав охир мемонанд
    expect(dueDay2.filter((c) => c.dueAt.getTime() === T1.getTime()).length).toBeLessThan(15);

    // ── Ҳамаашро дуруст кард → ХОЛӢ ───────────────────────────────────────
    const cleared = all.map((c) => afterReviewAnswer(c, true, T1));
    expect(cleared.filter(isInMistakeBox)).toHaveLength(0);
  });

  it('20 хато дар як рӯз → танҳо 15 нишон дода мешавад, 5 мемонад', () => {
    const box = Array.from({ length: 20 }, () => afterLessonMistake(learned(), T0));
    const shown = box.filter((c) => c.dueAt <= T0).slice(0, MISTAKE_BOX_SIZE);
    expect(shown).toHaveLength(15);
    expect(box.length - shown.length).toBe(5);
  });
});

describe('калимаи БЕ хато', () => {
  it('ҳеҷ гоҳ ба қуттӣ намеафтад', () => {
    expect(isInMistakeBox(initialSrsState())).toBe(false);
    expect(isInMistakeBox(learned())).toBe(false);
    // ва такрори оддии SM-2 онро ба қуттӣ намепартояд
    const good = reviewCard(learned(), 'good', T0);
    expect(isInMistakeBox(good)).toBe(false);
  });
});
