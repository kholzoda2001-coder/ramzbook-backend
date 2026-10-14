/**
 * «Ин забон ТАЙЁР аст?» — қоидаи ягона барои интихоби забон.
 *
 * 🔴 Чаро пайдо шуд: `/api/mobile/languages/target` мегуфт `available =
 * courseCount > 0`, яъне ҳатто як курси НИМСОХТА ҳамчун LIVE нишон дода
 * мешуд. Хитоӣ (`zh`) маҳз ҳамин буд: 9 модул, вале 25 дарс (модули 1 — 9
 * дарс, боқӣ 2-тогӣ). Хонанда интихоб мекард ва баъди якчанд дарс ба девор
 * мерасид. Курсҳои воқеан тайёр 197–252 дарс доранд.
 */

/** Ҳадди ақали дарси ФАЪОЛ, то забон ҳамчун «дастрас» нишон дода шавад. */
export const MIN_READY_LESSONS = 40;

export function isCourseReady(courseCount: number, lessonCount: number): boolean {
  return courseCount > 0 && lessonCount >= MIN_READY_LESSONS;
}

/**
 * Ҷуфтҳое (`забони ҳадаф:забони модарӣ`), ки ҳанӯз ба ҳадди MIN_READY_LESSONS
 * нарасидаанд, вале қасдан барои санҷиш/рушд дастрас карда шудаанд (14.10.2026:
 * англисӣ барои ӯзбекҳо — модулҳо яке-яке илова мешаванд). Рӯйхат КӮТОҲ бимонад
 * ва пас аз пурра шудани курс аз ин ҷо бароварда шавад.
 */
export const EARLY_ACCESS_PAIRS: ReadonlySet<string> = new Set(['en:uz']);

export function isPairReady(
  targetCode: string,
  nativeCode: string,
  courseCount: number,
  lessonCount: number,
): boolean {
  if (isCourseReady(courseCount, lessonCount)) return true;
  return EARLY_ACCESS_PAIRS.has(`${targetCode}:${nativeCode}`) && courseCount > 0 && lessonCount > 0;
}
