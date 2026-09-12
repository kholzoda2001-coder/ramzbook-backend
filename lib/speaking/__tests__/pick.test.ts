import { describe, it, expect } from 'vitest';
import { pickSpeakingLesson } from '@/lib/speaking/pick';

/**
 * Интихоби дарси гуфтор (2026-09-12): рӯйхати дарсҳои боб.
 *
 * Хонанда акнун дар боб рӯйхати ҳамаи дарсҳоро мебинад ва МАҲЗ якеро
 * интихоб мекунад. Ин тест қулф мекунад:
 *   1. роҳи кӯҳна (бе `lessonId`) бетағйир: аввалин дарси нагузашта;
 *   2. `lessonId` маҳз ҳамон дарсро медиҳад — ҳатто гузаштаро (такрор);
 *   3. `lessonId`-и ношинос → `null`, на дарси тасодуфӣ.
 */

const chapters = [
  { lessons: [{ id: 'c1l1' }, { id: 'c1l2' }, { id: 'c1l3' }] },
  { lessons: [{ id: 'c2l1' }, { id: 'c2l2' }] },
];

const done = (...ids: string[]) => new Set(ids);

describe('интихоби дарси гуфтор', () => {
  it('бе lessonId — аввалин дарси нагузашта', () => {
    expect(pickSpeakingLesson(chapters, done())).toEqual({
      chapterIndex: 0,
      lessonIndex: 0,
    });
    expect(pickSpeakingLesson(chapters, done('c1l1', 'c1l2', 'c1l3'))).toEqual(
      { chapterIndex: 1, lessonIndex: 0 },
    );
  });

  it('ҳама гузашт — охирин дарс (такрор)', () => {
    const all = done('c1l1', 'c1l2', 'c1l3', 'c2l1', 'c2l2');
    expect(pickSpeakingLesson(chapters, all)).toEqual({
      chapterIndex: 1,
      lessonIndex: 1,
    });
  });

  it('lessonId — МАҲЗ ҳамон дарс, на дарси навбатӣ', () => {
    expect(pickSpeakingLesson(chapters, done(), 'c1l3')).toEqual({
      chapterIndex: 0,
      lessonIndex: 2,
    });
    expect(pickSpeakingLesson(chapters, done(), 'c2l2')).toEqual({
      chapterIndex: 1,
      lessonIndex: 1,
    });
  });

  it('lessonId-и ГУЗАШТА ҳам кушода мешавад (такрор)', () => {
    expect(pickSpeakingLesson(chapters, done('c1l1'), 'c1l1')).toEqual({
      chapterIndex: 0,
      lessonIndex: 0,
    });
  });

  it('lessonId-и ношинос → null, на дарси дигар', () => {
    expect(pickSpeakingLesson(chapters, done(), 'нест')).toBeNull();
  });

  it('бахши холӣ → null', () => {
    expect(pickSpeakingLesson([], done())).toBeNull();
    expect(pickSpeakingLesson([], done(), 'c1l1')).toBeNull();
  });
});
