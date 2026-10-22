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

/**
 * Ҳадафҳои хонанда — ҳамон рӯйхати экрани «Ҳадаф» дар барнома.
 *
 * `general` (06.10.2026) — ниша НЕСТ (ҳеҷ вазъият `goals: ['general']`
 * надорад): хонанда «аз асос» сар мекунад. Роҳаш — АВВАЛ ҳамаи вазъиятҳои
 * умумӣ, баъд нишаи `life` (ҳаёти ҳаррӯза), ниг. [GENERAL_THEN].
 */
export const SPEAKING_GOALS = ['general', 'build', 'service', 'drive', 'study', 'life'] as const;
export type SpeakingGoal = (typeof SPEAKING_GOALS)[number];

export function asGoal(v: string | null | undefined): SpeakingGoal | null {
  return (SPEAKING_GOALS as readonly string[]).includes(v ?? '')
    ? (v as SpeakingGoal)
    : null;
}

export interface OrderableChapter {
  order: number;
  /**
   * Сатҳи ниша: 1 = A1 («Сохтмон 1»), 2 = A2, 3 = B1. Холӣ = 1. Роҳ сатҳҳоро
   * ПАЙ ДАР ПАЙ мегузарад: ҳамаи вазъиятҳои сатҳи 1, баъд сатҳи 2.
   */
  level?: number | null;
  /** Ҳадафҳое, ки ин вазъият барояшон аст. Холӣ = барои ҳама (умумӣ). */
  goals?: string[];
  lessons: { stage?: string | null }[];
}

/** Сатҳи вазъият (1 = A1). Қимати ғалат ё холӣ → 1. */
export function levelOf(c: { level?: number | null }): number {
  const l = Math.round(c.level ?? 1);
  return l >= 1 && l <= 3 ? l : 1;
}

/** CEFR барои сатҳ: 1 → «A1», 2 → «A2», 3 → «B1». */
export function cefrOfLevel(level: number): string {
  return ['A1', 'A2', 'B1'][Math.min(3, Math.max(1, Math.round(level))) - 1];
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
  if (goal === 'general') return g.length === 0 || g.includes(GENERAL_THEN);
  return goal === null || g.length === 0 || g.includes(goal);
}

/**
 * Нишае, ки роҳи `general` БАЪД аз вазъиятҳои умумӣ идома медиҳад. Танҳо 5–6
 * вазъияти умумӣ ҳаст — бе идома хонанда пас аз ~45 дарс ба «роҳ тамом»
 * мерасид. `life` (фурудгоҳ, дорухона, ҳамсояҳо…) ба ҳеҷ касб баста нест.
 */
export const GENERAL_THEN = 'life';

/**
 * Дар дохили як сатҳ:
 *  • `general` — умумӣ (0) пеш аз нишаи идома (1): хонанда аз «аз асос» сар мекунад;
 *  • нишаи касбӣ (`build`, `service`…) — акс: вазъиятҳои ХУДИ ҳамон ниша (0)
 *    пеш аз умумӣ (1). Хонандае, ки «Сохтмон»-ро интихоб кард, аз сохтмон сар
 *    мекунад; умумии боқимонда («Бозор», «Иҷораи хона»…) баъди онҳо меояд.
 *
 * ⚠️ Қарори соҳиби маҳсулот (22.10.2026): «ҳар категория, ки интихоб шуд,
 * бояд аз ҳамон сар шавад; умумӣ — салом ва шиносоӣ».
 */
function pathTie(c: OrderableChapter, goal: SpeakingGoal | null): number {
  const isGeneral = (c.goals ?? []).length === 0;
  if (goal === 'general') return isGeneral ? 0 : 1;
  return goal === null ? 0 : isGeneral ? 1 : 0;
}

/**
 * Тартиби бобҳо барои ҲАМИН хонанда.
 *
 *   0 — РОҲИ хонанда: вазъиятҳои ҳадафи ӯ ва умумӣ. Дар ҳар сатҳ: барои
 *       ҳадафи касбӣ — аввал вазъиятҳои ХУДИ ҳамон ниша, баъд умумӣ (22.10.2026);
 *       барои `general` — аввал умумӣ (салом ва шиносоӣ), баъд `life`. Дар
 *       дохили гурӯҳ — аз рӯи `order`;
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
    .sort(
      (a, b) =>
        a.r - b.r ||
        levelOf(a.c) - levelOf(b.c) ||
        pathTie(a.c, goal) - pathTie(b.c, goal) ||
        a.c.order - b.c.order ||
        a.i - b.i,
    )
    .map((x) => x.c);
}
