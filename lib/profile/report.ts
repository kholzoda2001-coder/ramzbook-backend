/**
 * Қоидаҳои шикоят ба як КОРБАР.
 *
 * Функсияҳои СОФ — бе Prisma. Роут танҳо онҳоро даъват мекунад ва натиҷаро
 * менависад; ҳамаи қарорҳо («ин сабаб дуруст аст?», «ин шикоят иҷозат
 * дорад?») ин ҷо санҷида мешаванд.
 */

/**
 * Сабабҳои иҷозатдодашуда.
 *
 * ⚠️ Рӯйхати БАСТА. Сабаби озод («ҳар чӣ хонанда нависад») ду мушкил дорад:
 * панели админ онро гурӯҳбандӣ карда наметавонад, ва матни озод худаш
 * метавонад таҳқир бошад. Матни озод танҳо дар `note` иҷозат аст.
 */
export const REPORT_REASONS = [
  /** Номи қабеҳ ё таҳқиромез. */
  'name',
  /** Аватари номуносиб. */
  'avatar',
  /** Тақаллуб — рақамҳои ғайривоқеӣ дар рейтинг. */
  'cheating',
  /** Дигар — `note` мехоҳад. */
  'other',
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

/** Дарозии ҳадди аксари матни ихтиёрӣ. */
export const MAX_NOTE = 500;

export function isReportReason(v: unknown): v is ReportReason {
  return typeof v === 'string' && (REPORT_REASONS as readonly string[]).indexOf(v) !== -1;
}

/** Сабаби рад — барои ҷавоби 400-и фаҳмо. */
export type ReportRefusal =
  | 'bad_reason'
  | 'self'
  | 'note_required'
  | 'note_too_long';

export interface ReportInput {
  reporterId: string;
  reportedId: string;
  reason: unknown;
  note?: unknown;
}

export interface ReportOk {
  ok: true;
  reason: ReportReason;
  note: string | null;
}

export interface ReportBad {
  ok: false;
  refusal: ReportRefusal;
}

/**
 * Шикоятро месанҷад ва майдонҳои тозашударо бармегардонад.
 *
 * Се қоида:
 *   1. сабаб бояд аз рӯйхати баста бошад;
 *   2. худро шикоят кардан мумкин нест — ин ё хато аст, ё бозӣ бо панел;
 *   3. `other` бе матн маъно надорад — админ бо он коре карда наметавонад.
 */
export function validateReport(input: ReportInput): ReportOk | ReportBad {
  if (!isReportReason(input.reason)) return { ok: false, refusal: 'bad_reason' };
  if (input.reporterId === input.reportedId) return { ok: false, refusal: 'self' };

  const raw = typeof input.note === 'string' ? input.note.trim() : '';
  if (raw.length > MAX_NOTE) return { ok: false, refusal: 'note_too_long' };
  if (input.reason === 'other' && raw.length === 0) {
    return { ok: false, refusal: 'note_required' };
  }

  return { ok: true, reason: input.reason, note: raw.length > 0 ? raw : null };
}

/**
 * Чанд шикояти ҶУДОГОНА то он даме, ки корбар ба назари админ бирасад.
 *
 * ⚠️ Ҳисоб аз рӯи шикоятгарони ГУНОГУН меравад, на аз рӯи шумораи сатрҳо.
 * Ҷадвал аллакай як сатр барои як ҷуфт мегузорад, пас «3 шикоят» маънои
 * «3 нафари гуногун» -ро дорад — ва маҳз ин чиз ҳамлаи як нафарро бефоида
 * мекунад.
 */
export const REPORTS_TO_FLAG = 3;

/** Оё ин корбар бояд дар панел ҳамчун «таъҷилӣ» нишон дода шавад? */
export function isFlagged(distinctReporters: number): boolean {
  return distinctReporters >= REPORTS_TO_FLAG;
}
