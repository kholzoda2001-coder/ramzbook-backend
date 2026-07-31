/**
 * In-app feedback prompt — settings in AppSetting (`feedback_settings`),
 * answers in the `Feedback` table.
 *
 * The prompt is shown ONCE, after a configurable number of finished lessons,
 * and is always reachable from the profile. It is deliberately independent of
 * the Google Play review prompt (lib/../services/review_prompt_service.dart):
 * chaining "happy answer → store rating" is sentiment gating and is banned by
 * both Google and Apple.
 *
 * Mirrors the settings pattern in lib/promo.ts and lib/ai/ai-settings.ts.
 */

import type { PrismaClient } from '@prisma/client';

export const SETTING_KEY = 'feedback_settings';

export interface FeedbackConfig {
  /** Master switch — false stops the prompt everywhere, instantly. */
  enabled: boolean;
  /** Finished lessons before the prompt appears (the learner's Nth lesson). */
  afterLessons: number;
  title: string;
  message: string;
  placeholder: string;
  /** Shown after a successful submit. */
  thanks: string;
}

export const defaultFeedbackConfig: FeedbackConfig = {
  enabled: true,
  afterLessons: 12,
  title: 'Фикри шумо барои мо муҳим аст',
  message: 'Шумо аллакай хуб пеш рафтед! Дар як ҷумла бигӯед: чӣ ба шумо маъқул аст ва чиро беҳтар кунем?',
  placeholder: 'Фикри худро ин ҷо нависед…',
  thanks: 'Ташаккур! Фикри шумо ба мо расид. 💚',
};

function deepClone<T>(o: T): T {
  return JSON.parse(JSON.stringify(o)) as T;
}

export async function loadFeedbackConfig(prisma: PrismaClient): Promise<FeedbackConfig> {
  const row = await prisma.appSetting.findUnique({ where: { key: SETTING_KEY } });
  if (!row?.valueJson) return deepClone(defaultFeedbackConfig);
  try {
    const parsed = JSON.parse(row.valueJson) as Partial<FeedbackConfig>;
    return { ...deepClone(defaultFeedbackConfig), ...parsed };
  } catch {
    return deepClone(defaultFeedbackConfig);
  }
}

export async function saveFeedbackConfig(prisma: PrismaClient, cfg: FeedbackConfig): Promise<void> {
  await prisma.appSetting.upsert({
    where: { key: SETTING_KEY },
    create: { key: SETTING_KEY, valueJson: JSON.stringify(cfg) },
    update: { valueJson: JSON.stringify(cfg) },
  });
}

export function mergeFeedbackUpdate(
  current: FeedbackConfig,
  partial: Partial<FeedbackConfig>,
): FeedbackConfig {
  const next = deepClone(current);
  if (partial.enabled !== undefined) next.enabled = !!partial.enabled;
  if (partial.afterLessons !== undefined) {
    next.afterLessons = Math.min(500, Math.max(1, Math.floor(Number(partial.afterLessons) || 0) || 1));
  }
  if (partial.title !== undefined) next.title = partial.title;
  if (partial.message !== undefined) next.message = partial.message;
  if (partial.placeholder !== undefined) next.placeholder = partial.placeholder;
  if (partial.thanks !== undefined) next.thanks = partial.thanks;
  return next;
}

export interface FeedbackState {
  /** The prompt may still be shown to this user at some point. */
  eligible: boolean;
  afterLessons: number;
  alreadySubmitted: boolean;
  title: string;
  message: string;
  placeholder: string;
  thanks: string;
}

/**
 * Whether this user may still be asked, plus the copy to render. The CLIENT
 * decides the exact moment (it knows the live lesson count); this decides
 * whether asking is allowed at all — so switching the prompt off in the admin
 * takes effect without an app update.
 */
export async function getFeedbackStateFor(
  prisma: PrismaClient,
  userId: string,
): Promise<FeedbackState> {
  const cfg = await loadFeedbackConfig(prisma);

  const submitted = await prisma.feedback.findFirst({
    where: { userId, source: 'lesson_milestone' },
    select: { id: true },
  });
  const alreadySubmitted = submitted != null;

  return {
    eligible: cfg.enabled && !alreadySubmitted,
    afterLessons: cfg.afterLessons,
    alreadySubmitted,
    title: cfg.title,
    message: cfg.message,
    placeholder: cfg.placeholder,
    thanks: cfg.thanks,
  };
}
