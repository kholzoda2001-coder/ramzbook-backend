/**
 * «Гуфтор»-и нав: ВАЗЪИЯТҲО (26.09.2026).
 *
 * Вазъият = бобе, ки дарсҳояш ЗИНА доранд (`SpeakingLesson.stage`): калима →
 * ибора → ҷумла → нақшбозӣ → миссия. Боби бе зина = боби КӮҲНА, ки то сохта
 * шудани вазъиятҳои ҳамон забон дар поён («Машқҳои пештара») мемонад.
 *
 * Функсияҳои ТОЗА — бе Prisma, бе I/O. Ҳам `/categories`, ҳам `/lesson` ва
 * ҳам гейти дастрасӣ маҳз инҳоро мехонанд, то тартиб дар ҳама ҷо як бошад.
 */

/** Ҳадафҳои хонанда — ҳамон рӯйхати экрани «Ҳадаф» дар барнома. */
export const SPEAKING_GOALS = ['build', 'service', 'drive', 'study', 'life'] as const;
export type SpeakingGoal = (typeof SPEAKING_GOALS)[number];

export function asGoal(v: string | null | undefined): SpeakingGoal | null {
  return (SPEAKING_GOALS as readonly string[]).includes(v ?? '')
    ? (v as SpeakingGoal)
    : null;
}

export interface OrderableChapter {
  order: number;
  /** Ҳадафҳое, ки ин вазъият барояшон аст. Холӣ = барои ҳама (умумӣ). */
  goals?: string[];
  lessons: { stage?: string | null }[];
}

/** Боб вазъият аст — яъне ягон дарсаш зина дорад. */
export function isSituation(c: OrderableChapter): boolean {
  return c.lessons.some((l) => !!l.stage);
}

/**
 * Тартиби бобҳо барои ҲАМИН хонанда.
 *
 *   0 — вазъият барои ҳадафи хонанда;
 *   1 — вазъияти умумӣ (бе ҳадаф);
 *   2 — вазъият барои ҳадафи дигар;
 *   3 — боби кӯҳна.
 *
 * Дар дохили як гурӯҳ — `order`-и админ. Устувор (stable): баробарҳо тартиби
 * вурудро нигоҳ медоранд.
 */
export function orderChapters<T extends OrderableChapter>(
  chapters: T[],
  goal: SpeakingGoal | null,
): T[] {
  const rank = (c: T): number => {
    if (!isSituation(c)) return 3;
    const g = c.goals ?? [];
    if (g.length === 0) return 1;
    return goal && g.includes(goal) ? 0 : 2;
  };
  return chapters
    .map((c, i) => ({ c, i, r: rank(c) }))
    .sort((a, b) => a.r - b.r || a.c.order - b.c.order || a.i - b.i)
    .map((x) => x.c);
}
