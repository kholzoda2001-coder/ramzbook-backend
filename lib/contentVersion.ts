import { prisma } from '@/lib/prisma';

/**
 * Версияи мазмуни БАХШ (`Module.contentVersion`) — як зина боло.
 *
 * ЧАРО ИН ЛОЗИМ АСТ
 * ─────────────────
 * Барнома бахшҳоро барои офлайн зеркашӣ мекунад (тирезаи 3-бахшӣ). Вақте
 * хатои мазмун ислоҳ мешавад, дар телефон ҳамон сатри КӮҲНА мемонад. Огоҳии
 * «хато ислоҳ шуд» меояд, хонанда дарсро мекушояд — ва ҳамон хаторо мебинад.
 *
 * `AppSetting.content_version`-и глобалӣ инро ҳал НАМЕКУНАД:
 *   • он ГЛОБАЛӢ аст — намегӯяд кадом бахш кӯҳна шуд;
 *   • он танҳо ҳангоми оғози САРДИ барнома пурсида мешавад (`main.dart`), ва
 *     вақте push меояд, барнома одатан аллакай кор мекунад;
 *   • он ба stale-while-revalidate мебарад, ки нусхаи КӮҲНАРО фавран нишон
 *     медиҳад — маҳз ҳамон нуқс.
 *
 * Ин рақам ба ҳар БАХШ баста аст, пас барнома ҳангоми кушодан муқоиса карда
 * метавонад ва танҳо ҳамон бахшро аз нав мегирад.
 */
export async function bumpModuleVersion(moduleId: string | null | undefined): Promise<void> {
  if (!moduleId) return;
  try {
    await prisma.module.update({
      where: { id: moduleId },
      data: { contentVersion: { increment: 1 } },
    });
  } catch (e) {
    // Бахш нест шуда бошад — ин ҷо чизе шикастан лозим нест.
    console.error('[bumpModuleVersion]', e);
  }
}

/**
 * Бахши соҳиби як МАЗМУН-ро меёбад.
 *
 * Гузориш ба `contentId` баста аст (одатан `Word.id`), вале версия ба БАХШ
 * тааллуқ дорад — ин ҷо занҷири `Word → Lesson → Module` тай карда мешавад.
 * Агар гузориш `moduleId`-и худро дошта бошад (барнома онро мефиристад), ин
 * даъват тамоман лозим намешавад.
 */
export async function moduleIdForLesson(lessonId: string): Promise<string | null> {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { moduleId: true },
    });
    return lesson?.moduleId ?? null;
  } catch {
    return null;
  }
}
