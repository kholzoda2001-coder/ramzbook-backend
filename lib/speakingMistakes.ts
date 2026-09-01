import { prisma } from '@/lib/prisma';

/**
 * Навбати «такрори аз ХАТОҲО» — сабт ва тозакунии он.
 *
 * ЧАРО дар `lib/`, на дар худи route: ҳам `/complete` ва ҳам
 * `/review/complete` ҳаминро истифода мебаранд, ва файли route-и Next.js
 * набояд ғайр аз ҳендлерҳо чизе содир кунад.
 *
 * Фарқ аз `SpeakingProgress.lastReviewedAt`: он такрорро аз рӯи ВАҚТ
 * месозад («кадом дарс кайҳо боз такрор нашуд») ва намедонад, ки хонанда
 * маҳз дар КАДОМ ҷумла ғалат кард. Ин файл маҳз ҳамонро нигоҳ медорад.
 */

/**
 * Баъди чанд гузаштани ПАЙ ДАР ПАЙИ бе хато воҳид аз навбати такрор мебарояд.
 *
 * Як бор кам аст: хонанда метавонад тасодуфан ё бо кӯшиши сеюми «кафолатӣ»
 * гузарад. Ду бор маънои онро дорад, ки воқеан ёд гирифт.
 */
const CLEAR_STREAK = 2;

/** Дар як нишаст беш аз ин воҳид қабул намешавад — ҳимоя аз дархости сохта. */
const MAX_REPORTED = 100;

/** Рӯйхати `itemId`-ҳоро тоза мекунад: сатрҳои воқеӣ, бе такрор, бо ҳад. */
function cleanIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const out = new Set<string>();
  for (const v of raw) {
    if (typeof v !== 'string') continue;
    const id = v.trim();
    if (id) out.add(id);
    if (out.size >= MAX_REPORTED) break;
  }
  return Array.from(out);
}

/**
 * Хатоҳо ва гузаштаҳои тозаи як нишастро сабт мекунад.
 *
 * ⚠️ Танҳо воҳидҳое қабул мешаванд, ки ВОҚЕАН ба ҳамин дарс(ҳо) тааллуқ
 * доранд. Бе ин санҷиш клиент метавонист ҳар `itemId`-и дилхоҳро фиристад
 * ва навбати такрори каси дигарро вайрон кунад.
 *
 * Ҳеҷ гоҳ хато намепартояд: сабти хато кори ЁРИРАСОН аст ва набояд
 * анҷоми дарсро вайрон кунад.
 */
export async function recordOutcomes(
  userId: string,
  scope: { lessonIds: string[] } | { anyCompleted: true },
  missedRaw: unknown,
  cleanRaw: unknown,
) {
  const missed = cleanIds(missedRaw);
  const clean = cleanIds(cleanRaw);
  if (missed.length === 0 && clean.length === 0) return;

  try {
    // ⚠️ Ду доираи ГУНОГУН:
    //  • дарси оддӣ — воҳид бояд маҳз ба ҳамон дарс тааллуқ дошта бошад;
    //  • ТАКРОР — ҷумлаҳои хатогӣ метавонанд аз дарси ДИГАР оянд, ки дар
    //    `reviewLessonIds` нест. Он ҷо шарт ин аст: дарс бояд аз ҷониби
    //    ҲАМИН корбар гузашта бошад.
    const owned = await prisma.speakingItem.findMany({
      where: {
        id: { in: [...missed, ...clean] },
        ...('lessonIds' in scope
          ? { lessonId: { in: scope.lessonIds } }
          : { lesson: { progress: { some: { userId } } } }),
      },
      select: { id: true },
    });
    const ok = new Set(owned.map((i) => i.id));

    const now = new Date();

    for (const itemId of missed) {
      if (!ok.has(itemId)) continue;
      await prisma.speakingMistake.upsert({
        where: { userId_itemId: { userId, itemId } },
        create: { userId, itemId, misses: 1, streak: 0, lastMissedAt: now },
        // Хатои нав занҷири тозаро МЕШИКАНАД — воҳид аз аввал сар мекунад.
        update: { misses: { increment: 1 }, streak: 0, lastMissedAt: now },
      });
    }

    // Гузаштани тоза танҳо ба воҳидҳои аллакай «қарздор» дахл дорад: барои
    // воҳиде, ки ҳеҷ гоҳ хато надошт, сатр сохтан беҳуда аст.
    const cleanOwned = clean.filter((id) => ok.has(id) && !missed.includes(id));
    if (cleanOwned.length > 0) {
      const rows = await prisma.speakingMistake.findMany({
        where: { userId, itemId: { in: cleanOwned } },
        select: { id: true, streak: true },
      });

      const retire = rows
        .filter((r) => r.streak + 1 >= CLEAR_STREAK)
        .map((r) => r.id);
      const bump = rows
        .filter((r) => r.streak + 1 < CLEAR_STREAK)
        .map((r) => r.id);

      if (bump.length > 0) {
        await prisma.speakingMistake.updateMany({
          where: { id: { in: bump } },
          data: { streak: { increment: 1 } },
        });
      }
      if (retire.length > 0) {
        // Ёд гирифт — сатр нест мешавад ва навбат худаш тоза мемонад.
        await prisma.speakingMistake.deleteMany({ where: { id: { in: retire } } });
      }
    }
  } catch (err) {
    console.error('[ai/speaking] recordOutcomes failed:', err);
  }
}
