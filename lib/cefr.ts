// CEFR framework constants — language-agnostic, shared by admin APIs & UI.
// Adding content for any language reuses these; nothing here is per-language.

export const CEFR_LEVELS = ['PreA1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export type CefrLevel = (typeof CEFR_LEVELS)[number];

// What kind of skill a lesson trains. Drives which exercise engine the app uses.
export const SKILL_TYPES = [
  'vocab', 'grammar', 'reading', 'listening', 'speaking', 'writing', 'review', 'test',
] as const;
export type SkillType = (typeof SKILL_TYPES)[number];

// Descriptor skill buckets (the four CEFR skills + an overall summary).
export const DESCRIPTOR_SKILLS = ['overall', 'reading', 'writing', 'listening', 'speaking'] as const;
export type DescriptorSkill = (typeof DESCRIPTOR_SKILLS)[number];

// Universal parts of speech (kept generic so any language fits).
export const PARTS_OF_SPEECH = [
  'noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition',
  'conjunction', 'interjection', 'numeral', 'phrase', 'other',
] as const;
export type PartOfSpeech = (typeof PARTS_OF_SPEECH)[number];

export function isCefrLevel(v: unknown): v is CefrLevel {
  return typeof v === 'string' && (CEFR_LEVELS as readonly string[]).includes(v);
}
export function isSkillType(v: unknown): v is SkillType {
  return typeof v === 'string' && (SKILL_TYPES as readonly string[]).includes(v);
}
export function isDescriptorSkill(v: unknown): v is DescriptorSkill {
  return typeof v === 'string' && (DESCRIPTOR_SKILLS as readonly string[]).includes(v);
}

// Normalize an arbitrary level string (e.g. legacy "A1") to a canonical CEFR level.
export function normalizeCefrLevel(v: unknown): CefrLevel | null {
  if (typeof v !== 'string') return null;
  const up = v.trim().replace(/[\s_-]/g, '').toUpperCase();
  if (up === 'PREA1') return 'PreA1';
  const match = CEFR_LEVELS.find((l) => l.toUpperCase() === up);
  return match ?? null;
}
