/**
 * Кадом дарси ГУФТОР бояд кушода шавад — функсияи СОФ (бе Prisma, бе I/O).
 *
 * ── Чаро ҷудо аз роут ──────────────────────────────────────────────────────
 * Пештар ин ҳалқа дар дохили `/api/ai/speaking/lesson` буд ва танҳо «дарси
 * навбатӣ»-ро медонист. Акнун хонанда метавонад аз рӯйхати дарсҳои боб МАҲЗ
 * як дарсро интихоб кунад (`lessonId`), ва ин ду роҳ набояд ду қоидаи гуногун
 * дошта бошанд — пас ҳарду ин ҷоянд ва тест мешаванд.
 *
 * ⚠️ Ин ҷо ГЕЙТИ ПРЕМИУМ НЕСТ. Интихоб ва иҷозат ду қадами ҷудоанд: роут
 * аввал дарсро интихоб мекунад, баъд `unlockedSpeakingLessonIds` месанҷад,
 * ки оё корбар онро кушода метавонад.
 */

export type PickChapter = { lessons: { id: string }[] };

export interface PickedLesson {
  chapterIndex: number;
  lessonIndex: number;
}

/**
 * [chapters] — бобҳо ва дарсҳо бо тартиби `order` (дарси бе воҳид аллакай
 * партофта шудааст).
 *
 * [lessonId] пур бошад → МАҲЗ ҳамон дарс, ҳатто агар аллакай гузашта бошад
 * (хонанда онро такрор кардан мехоҳад). Ёфт нашавад → `null` (роут 404
 * медиҳад), на хомӯшона дарси дигар — вагарна хонанда як дарсро мезад ва
 * дарси дигарро мегирифт.
 *
 * Холӣ бошад → аввалин дарси нагузашта; ҳама тамом → охирин (такрор).
 */
export function pickSpeakingLesson(
  chapters: PickChapter[],
  doneIds: { has(id: string): boolean },
  lessonId?: string | null,
): PickedLesson | null {
  if (chapters.length === 0) return null;

  if (lessonId) {
    for (let ci = 0; ci < chapters.length; ci++) {
      const li = chapters[ci].lessons.findIndex((l) => l.id === lessonId);
      if (li !== -1) return { chapterIndex: ci, lessonIndex: li };
    }
    return null;
  }

  for (let ci = 0; ci < chapters.length; ci++) {
    const li = chapters[ci].lessons.findIndex((l) => !doneIds.has(l.id));
    if (li !== -1) return { chapterIndex: ci, lessonIndex: li };
  }

  const ci = chapters.length - 1;
  const last = chapters[ci].lessons.length - 1;
  return last < 0 ? null : { chapterIndex: ci, lessonIndex: last };
}
