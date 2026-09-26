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
 * «Роҳи» хонанда (нишаи ӯ): вазъиятҳои ҳадафи ӯ ВА вазъиятҳои умумӣ.
 *
 * Бе ҳадаф — ҳамаи вазъиятҳо. Боби кӯҳна ҳеҷ гоҳ дар роҳ нест: он дар
 * «Машқҳои пештара» мемонад ва танҳо дастӣ кушода мешавад.
 */
export function inPath(c: OrderableChapter, goal: SpeakingGoal | null): boolean {
  if (!isSituation(c)) return false;
  const g = c.goals ?? [];
  return goal === null || g.length === 0 || g.includes(goal);
}

/**
 * Тартиби бобҳо барои ҲАМИН хонанда.
 *
 *   0 — РОҲИ хонанда: вазъиятҳои ҳадафи ӯ ва умумӣ, БАҲАМ аз рӯи `order`
 *       (Шиносоӣ → Кор ёфтан → Рӯзи аввал → Назди духтур…). Пештар ҳадаф
 *       пеш аз умумӣ меистод ва навомӯз бо «Кор ёфтан» сар мекард, на бо
 *       «Шиносоӣ» — салом ва номро наомӯхта (26.09.2026);
 *   1 — вазъият барои ҳадафи дигар;
 *   2 — боби кӯҳна.
 *
 * Дар дохили як гурӯҳ — `order`-и админ. Устувор (stable): баробарҳо тартиби
 * вурудро нигоҳ медоранд.
 */
export function orderChapters<T extends OrderableChapter>(
  chapters: T[],
  goal: SpeakingGoal | null,
): T[] {
  const rank = (c: T): number => {
    if (!isSituation(c)) return 2;
    return inPath(c, goal) ? 0 : 1;
  };
  return chapters
    .map((c, i) => ({ c, i, r: rank(c) }))
    .sort((a, b) => a.r - b.r || a.c.order - b.c.order || a.i - b.i)
    .map((x) => x.c);
}
