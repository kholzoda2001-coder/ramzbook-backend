import { describe, it, expect } from 'vitest';
import {
  unlockedSpeakingLessonIds,
  FREE_SPEAKING_LESSONS,
} from '@/lib/speaking/access';

/**
 * Гейти премиуми гуфтор (қарори соҳиби маҳсулот, 2026-09-06).
 *
 * Ин тест се чизро АБАДӢ нигоҳ медорад:
 *   1. ройгон = ЯК дарс дар тамоми бахш, на як дарс дар ҳар боб;
 *   2. прогресси кӯҳна ҲЕҶ ГОҲ гирифта намешавад;
 *   3. премиум ҳама чизро мекушояд.
 */

const chapters = [
  { lessons: [{ id: 'c1l1' }, { id: 'c1l2' }, { id: 'c1l3' }] },
  { lessons: [{ id: 'c2l1' }, { id: 'c2l2' }] },
  { lessons: [{ id: 'c3l1' }] },
];

const ids = (s: Set<string>) => Array.from(s).sort();

describe('дастрасии дарсҳои гуфтор', () => {
  it('ройгон = танҳо дарси 1-и боби 1', () => {
    expect(
      ids(unlockedSpeakingLessonIds({ chapters, isPremium: false })),
    ).toEqual(['c1l1']);
  });

  it('НЕ дарси 1-и ҳар боб', () => {
    const open = unlockedSpeakingLessonIds({ chapters, isPremium: false });
    expect(open.has('c2l1')).toBe(false);
    expect(open.has('c3l1')).toBe(false);
  });

  it('премиум ҳамаро мекушояд', () => {
    expect(
      ids(unlockedSpeakingLessonIds({ chapters, isPremium: true })),
    ).toEqual(['c1l1', 'c1l2', 'c1l3', 'c2l1', 'c2l2', 'c3l1']);
  });

  it('прогресси кӯҳна нигоҳ дошта мешавад', () => {
    // Корбар пеш аз ҷорӣ шудани пейвол се дарс гузашта буд.
    const open = unlockedSpeakingLessonIds({
      chapters,
      completedIds: ['c1l2', 'c1l3', 'c2l1'],
      isPremium: false,
    });
    expect(ids(open)).toEqual(['c1l1', 'c1l2', 'c1l3', 'c2l1']);
    // …вале дарси НАВ ҳамон тавр баста мемонад.
    expect(open.has('c2l2')).toBe(false);
  });

  it('сатри бегонаи прогресс чизе намекушояд', () => {
    const open = unlockedSpeakingLessonIds({
      chapters,
      completedIds: ['дарси-забони-дигар'],
      isPremium: false,
    });
    expect(ids(open)).toEqual(['c1l1']);
  });

  it('бахши холӣ — маҷмӯи холӣ, на хато', () => {
    expect(
      unlockedSpeakingLessonIds({ chapters: [], isPremium: false }).size,
    ).toBe(0);
    expect(
      unlockedSpeakingLessonIds({ chapters: [], isPremium: true }).size,
    ).toBe(0);
  });

  it('рақами ройгон ЯГОНА манбаъ аст', () => {
    // Агар рӯзе `FREE_SPEAKING_LESSONS` иваз шавад, ин тест худаш ҳамроҳ
    // меравад — вале матни пейвол бояд ҳамин рақамро хонад, на аз худ нависад.
    const open = unlockedSpeakingLessonIds({ chapters, isPremium: false });
    expect(open.size).toBe(FREE_SPEAKING_LESSONS);
  });
});
