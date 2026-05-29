// Grammar system constants (Step 3) — language-agnostic, shared by admin & mobile.

// How a grammar practice exercise is rendered / graded by the app.
export const GRAMMAR_EXERCISE_TYPES = [
  'fill_blank', // learner types the missing word(s)
  'choose',     // learner picks the correct option
  'reorder',    // learner orders shuffled tokens into a correct sentence
  'transform',  // learner rewrites a sentence into a target form
] as const;
export type GrammarExerciseType = (typeof GRAMMAR_EXERCISE_TYPES)[number];

export function isGrammarExerciseType(v: unknown): v is GrammarExerciseType {
  return typeof v === 'string' && (GRAMMAR_EXERCISE_TYPES as readonly string[]).includes(v);
}

// Normalize an "options" payload to a clean string[] (or null).
export function normalizeOptions(v: unknown): string[] | null {
  if (!Array.isArray(v)) return null;
  const arr = v.map((x) => String(x).trim()).filter(Boolean);
  return arr.length ? arr : null;
}
