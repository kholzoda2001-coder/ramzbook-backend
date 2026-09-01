/**
 * Пули байни валидатори ТОЗА (`validate.ts`) ва база.
 *
 * `validate.ts` қасдан ҳеҷ I/O надорад — контекст (намунаи алифбо,
 * матнҳои боб) бояд аз берун дода шавад. Ин файл маҳз ҳамонро ҷамъ
 * мекунад, то ҳам `items/route.ts` ва ҳам `seed/route.ts` ҳамон
 * қоидаҳоро бо ҳамон контекст иҷро кунанд.
 */

import { prisma } from '@/lib/prisma';
import { DEFAULT_CONFIG, toEngineItem } from './engine';
import { validateLesson, errorsOf, type Issue } from './validate';

/** Ҳамон ифодаи `splitWords` — барои кэши `wordCount`. */
export const countWords = (t: string) => t.trim().split(/\s+/).filter(Boolean).length;

/**
 * Дарсро аз рӯи ҳолати ҶОРИИ база месанҷад.
 *
 * `extra` — воҳиде, ки ҳанӯз сабт нашудааст (илова/таҳрир). Бо ҳамин
 * админ пеш аз навишта шудан хатогиро мебинад, на баъд аз он.
 */
export async function validateLessonById(
  lessonId: string,
  extra?: { id?: string; kind: string; text: string; translation: string;
            literal?: string | null; note?: string | null; audioUrl?: string | null;
            cue?: string | null; cueTranslation?: string | null },
): Promise<Issue[]> {
  const lesson = await prisma.speakingLesson.findUnique({
    where: { id: lessonId },
    select: {
      id: true,
      categoryId: true,
      items: {
        orderBy: { order: 'asc' },
        select: {
          id: true, kind: true, text: true, translation: true, literal: true,
          note: true, audioUrl: true, cue: true, cueTranslation: true,
          chainOverride: true, swaps: true,
        },
      },
      category: {
        select: {
          id: true,
          targetLanguage: { select: { scriptPattern: true } },
          lessons: {
            select: { id: true, items: { select: { text: true } } },
          },
        },
      },
    },
  });
  if (!lesson) return [{ code: 'E_NO_LESSON', severity: 'error', message: 'Дарс ёфт нашуд' }];

  // Матнҳои дарсҳои ДИГАРи ҳамин боб.
  const categoryTexts = new Set<string>();
  for (const l of lesson.category.lessons) {
    if (l.id === lesson.id) continue;
    for (const i of l.items) categoryTexts.add(i.text.trim().toLowerCase());
  }

  const pattern = lesson.category.targetLanguage.scriptPattern;
  let targetScript: RegExp | null = null;
  if (pattern) {
    // Намунаи вайрон набояд тамоми сабтро вайрон кунад.
    try {
      targetScript = new RegExp(pattern);
    } catch {
      targetScript = null;
    }
  }

  const stored = lesson.items
    .filter((i) => !extra?.id || i.id !== extra.id) // таҳрир: нусхаи кӯҳна партофта мешавад
    .map((i) => ({ ...toEngineItem(i), chainOverride: i.chainOverride, swaps: i.swaps }));

  const items = extra
    ? [...stored, { ...toEngineItem({ ...extra, id: extra.id ?? '__new__',
        literal: extra.literal ?? null, note: extra.note ?? null,
        audioUrl: extra.audioUrl ?? null, cue: extra.cue ?? null,
        cueTranslation: extra.cueTranslation ?? null }), chainOverride: [], swaps: [] }]
    : stored;

  return validateLesson({ id: lesson.id, items }, { targetScript, categoryTexts }, DEFAULT_CONFIG);
}

/** `{ ok: false, issues }` агар хатои манъкунанда бошад. */
export async function blockingIssues(
  lessonId: string,
  extra?: Parameters<typeof validateLessonById>[1],
): Promise<Issue[]> {
  return errorsOf(await validateLessonById(lessonId, extra));
}
