// ─────────────────────────────────────────────────────────────────────────────
// SRS scheduler — a 4-button SM-2 (SuperMemo 2) implementation.
//
// The learner grades each card with one of four buttons; we map those to an
// SM-2 quality score and update the card's ease factor, interval, repetition
// count and next due date. Language-agnostic: the engine only manipulates
// numeric scheduling state, never any content.
// ─────────────────────────────────────────────────────────────────────────────

export type SrsGrade = 'again' | 'hard' | 'good' | 'easy';

export const SRS_GRADES: SrsGrade[] = ['again', 'hard', 'good', 'easy'];

/** Map a button to the classic SM-2 0–5 quality scale. */
const QUALITY: Record<SrsGrade, number> = {
  again: 1, // forgot
  hard: 3,  // recalled with serious difficulty
  good: 4,  // recalled after some hesitation
  easy: 5,  // perfect recall
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MIN_EASE = 1.3;
const DEFAULT_EASE = 2.5;

export interface SrsState {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  lapses: number;
}

export interface SrsReviewResult extends SrsState {
  dueAt: Date;
}

/** Fresh state for a brand-new card (due immediately). */
export function initialSrsState(): SrsState {
  return { easeFactor: DEFAULT_EASE, intervalDays: 0, repetitions: 0, lapses: 0 };
}

/**
 * Apply one review. Returns the new scheduling state + the next due date.
 * @param state current card state
 * @param grade the learner's button press
 * @param now   injectable clock (defaults to Date.now) — handy for tests
 */
export function reviewCard(state: SrsState, grade: SrsGrade, now: Date = new Date()): SrsReviewResult {
  const q = QUALITY[grade];
  let { easeFactor, intervalDays, repetitions, lapses } = state;

  if (q < 3) {
    // Lapse: reset the streak, relearn tomorrow.
    repetitions = 0;
    intervalDays = 1;
    lapses += 1;
  } else {
    if (repetitions === 0) {
      intervalDays = 1;
    } else if (repetitions === 1) {
      intervalDays = 6;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
    }
    // "hard" stretches the interval less than "good"/"easy".
    if (grade === 'hard') {
      intervalDays = Math.max(1, Math.round(intervalDays * 0.8));
    }
    repetitions += 1;
  }

  // SM-2 ease update, floored at 1.3.
  easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (easeFactor < MIN_EASE) easeFactor = MIN_EASE;
  easeFactor = Math.round(easeFactor * 1000) / 1000; // keep it tidy

  const dueAt = new Date(now.getTime() + intervalDays * MS_PER_DAY);
  return { easeFactor, intervalDays, repetitions, lapses, dueAt };
}

export function isGrade(value: unknown): value is SrsGrade {
  return typeof value === 'string' && (SRS_GRADES as string[]).includes(value);
}
