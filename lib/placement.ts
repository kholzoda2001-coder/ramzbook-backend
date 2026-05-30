// ─────────────────────────────────────────────────────────────────────────────
// Placement scoring engine (Phase 5).
//
// Given the learner's answers to a placement test — each tagged with the CEFR
// level the question probes — infer the recommended starting level. The engine
// is language-agnostic: it only looks at per-level correctness, never at any
// language content. Questions are auto-graded multiple-choice.
//
// Rule: walk the CEFR ladder from the lowest tested level upward. The learner is
// placed at the HIGHEST level they pass without first failing a lower one
// (a fluke success above a failed level is not trusted). Levels with no
// questions are skipped so they never block progression. Failing the lowest
// tested level places the learner at the floor (default A1).
// ─────────────────────────────────────────────────────────────────────────────

import { CEFR_LEVELS, CefrLevel, normalizeCefrLevel } from './cefr';

/** Default share of correct answers required to "pass" a level. */
export const DEFAULT_PASS_THRESHOLD = 0.6;

/** Lowest level a learner can be placed at (courses begin at A1). */
export const DEFAULT_FLOOR_LEVEL: CefrLevel = 'A1';

export interface PlacementAnswer {
  /** The CEFR level the question probes (A1…C2). */
  cefrLevel: string;
  /** Whether the learner answered it correctly. */
  correct: boolean;
}

export interface PlacementLevelBreakdown {
  level: CefrLevel;
  total: number;
  correct: number;
  accuracy: number; // 0..1
  passed: boolean;
}

export interface PlacementResult {
  /** The recommended starting CEFR level. */
  level: CefrLevel;
  totalQuestions: number;
  totalCorrect: number;
  overallAccuracy: number; // 0..1
  passThreshold: number;
  breakdown: PlacementLevelBreakdown[];
}

export interface PlacementOptions {
  passThreshold?: number;
  floorLevel?: CefrLevel;
}

/** Normalize an answer for comparison — language-agnostic (trim, lowercase, collapse spaces). */
export function normalizeAnswer(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Compare a learner's choice against the correct option. */
export function isCorrectAnswer(expected: string, given: string): boolean {
  if (typeof expected !== 'string' || typeof given !== 'string') return false;
  return normalizeAnswer(expected) === normalizeAnswer(given);
}

/**
 * Infer the recommended placement level from a list of per-question results.
 * @param answers  one entry per answered question (level + correctness)
 * @param opts     pass threshold + floor level overrides (both optional)
 */
export function computePlacement(
  answers: PlacementAnswer[],
  opts: PlacementOptions = {},
): PlacementResult {
  const passThreshold = opts.passThreshold ?? DEFAULT_PASS_THRESHOLD;
  const floorLevel = opts.floorLevel ?? DEFAULT_FLOOR_LEVEL;

  // Aggregate correctness per canonical level.
  const totals = new Map<CefrLevel, { total: number; correct: number }>();
  for (const a of answers) {
    const lvl = normalizeCefrLevel(a.cefrLevel);
    if (!lvl) continue;
    const cur = totals.get(lvl) ?? { total: 0, correct: 0 };
    cur.total += 1;
    if (a.correct) cur.correct += 1;
    totals.set(lvl, cur);
  }

  // Build the breakdown in canonical CEFR order, skipping untested levels.
  const breakdown: PlacementLevelBreakdown[] = [];
  let totalQuestions = 0;
  let totalCorrect = 0;
  for (const level of CEFR_LEVELS) {
    const agg = totals.get(level);
    if (!agg || agg.total === 0) continue;
    const accuracy = agg.correct / agg.total;
    breakdown.push({
      level,
      total: agg.total,
      correct: agg.correct,
      accuracy: Math.round(accuracy * 1000) / 1000,
      passed: accuracy >= passThreshold,
    });
    totalQuestions += agg.total;
    totalCorrect += agg.correct;
  }

  // Climb from the lowest tested level; stop at the first failed level.
  let placement: CefrLevel = floorLevel;
  for (const b of breakdown) {
    if (!b.passed) break; // failing here (incl. the lowest) caps us below it → floor
    placement = b.level;
  }

  const overallAccuracy =
    totalQuestions === 0 ? 0 : Math.round((totalCorrect / totalQuestions) * 1000) / 1000;

  return {
    level: placement,
    totalQuestions,
    totalCorrect,
    overallAccuracy,
    passThreshold,
    breakdown,
  };
}
