/**
 * Номи намоишии сатҳҳо барои ҳар забон (11.10.2026).
 *
 * Корбар: «барои ҳар забон мувофиқ ба худаш — кореягӣ TOPIK I, ҷопонӣ N5».
 * Код (A1…C1) дар тамоми мантиқ (курс, қулф, пешрафт) мемонад — танҳо матни
 * намоишӣ аз `Language.levelLabels` иваз мешавад. Холӣ → худи код.
 *
 * СОФ: бе Prisma, бе I/O — роутҳо ва тестҳо инро мехонанд.
 */

export const LEVEL_CODES = ['A1', 'A2', 'B1', 'B2', 'C1'] as const;
export type LevelCode = (typeof LEVEL_CODES)[number];

/** Дарозии ҳадди аксар — тамға дар табҳо ва чипҳо бояд ғунҷад. */
export const MAX_LABEL_LEN = 24;

export type LevelLabels = Partial<Record<LevelCode, string>>;

/**
 * Вуруди админ → харитаи тоза. Калидҳои ношинос, қиматҳои холӣ ва ғайрисатрӣ
 * партофта мешаванд; фосилаҳо ҷамъ; дарозӣ маҳдуд. `{}` = ҳама пешфарз.
 */
export function cleanLevelLabels(input: unknown): LevelLabels {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {};
  const out: LevelLabels = {};
  for (const code of LEVEL_CODES) {
    const raw = (input as Record<string, unknown>)[code] ?? (input as Record<string, unknown>)[code.toLowerCase()];
    if (typeof raw !== 'string') continue;
    const v = raw.replace(/\s+/g, ' ').trim().slice(0, MAX_LABEL_LEN).trim();
    if (v && v !== code) out[code] = v;
  }
  return out;
}

/** Номи сатҳ барои намоиш: тамғаи админ ё худи код. */
export function levelLabel(labels: unknown, code: string): string {
  const c = (code ?? '').trim().toUpperCase();
  const map = cleanLevelLabels(labels);
  return (map as Record<string, string>)[c] ?? c;
}
