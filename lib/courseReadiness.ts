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
