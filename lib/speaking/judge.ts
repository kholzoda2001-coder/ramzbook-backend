/**
 * lib/speaking/judge.ts — «AI-довар» барои нақшбозӣ (қадами 7, 26.09.2026).
 *
 * Вақте хонанда ҷавоби ДУРУСТ, вале НАНАВИШТАШУДА медиҳад («Голова трещит»
 * ба ҷои «Голова болит»), муқоиса бо рӯйхати `accepts` онро рад мекард — гарчи
 * духтури воқеӣ фаҳмида буд. Довар танҳо як савол медиҳад: «ҳамсӯҳбати
 * забондон ин ҷавобро мефаҳмид ва он ба нияти супориш мувофиқ аст?»
 *
 * СОФ: сохтани промпт ва хондани ҷавоб — бе шабака, то тест онро бигирад.
 */
import type { ChatMessage } from '../ai/openai';

export type JudgeInput = {
  /** Номи забони омӯзиш бо англисӣ («Russian»). */
  language: string;
  /** Сатри ҳамсӯҳбат (метавонад холӣ бошад). */
  cue: string;
  /** Нияти супориш ба тоҷикӣ. */
  intent: string;
  /** Ҷавобҳои намунавии дуруст. */
  answers: string[];
  /** Он чи муҳаррики нутқ шунид. */
  heard: string;
};

export type JudgeVerdict = { ok: boolean; fix: string };

const LANG_NAMES: Record<string, string> = {
  en: 'English', ru: 'Russian', ar: 'Arabic', tr: 'Turkish', de: 'German',
  ko: 'Korean', zh: 'Chinese', fr: 'French', es: 'Spanish', it: 'Italian',
  ja: 'Japanese', pt: 'Portuguese', hi: 'Hindi', fa: 'Persian', tg: 'Tajik',
};

/** «ru» / «ru-RU» → «Russian»; номи пурра бетағйир. */
export function languageName(raw: string): string {
  const v = raw.trim();
  const code = v.split('-')[0].toLowerCase();
  return LANG_NAMES[code] ?? v;
}

export const MAX_HEARD_WORDS = 20;
export const MAX_ANSWERS = 6;

/** Дархост барои довар мувофиқ аст? (ҳимоя аз суиистифода ва хароҷот) */
export function judgeable(i: JudgeInput): boolean {
  // Калима = ҳадди ақал як аломати ғайри-пунктуатсионӣ (ES5: бе флаги `u`).
  const words = i.heard.trim().split(/\s+/).filter((w) => /[^\s.,!?;:"'«»()\-—…]/.test(w));
  return (
    i.language.trim() !== '' &&
    words.length >= 1 &&
    words.length <= MAX_HEARD_WORDS &&
    i.heard.length <= 300 &&
    i.answers.length >= 1 &&
    i.answers.length <= MAX_ANSWERS &&
    (i.intent.trim() !== '' || i.cue.trim() !== '')
  );
}

const clip = (s: string, n: number) => s.replace(/\s+/g, ' ').trim().slice(0, n);

export function buildJudgeMessages(i: JudgeInput): ChatMessage[] {
  // Калибр шуд бо модели зинда (26.09.2026, 8 ҳолат): нусхаи аввал «болит
  // голова вчера»-ро рад мекард — яъне грамматикаро месанҷид, на маъноро.
  const system = [
    `You judge one spoken reply in a ${i.language} roleplay for a beginner (A1–A2). The goal is communication, not perfect grammar.`,
    `ok=true if a native ${i.language} speaker in this situation would understand that the learner means the intended meaning —`,
    `even with wrong word order, wrong endings, missing small words, colloquial or unusual wording, extra details, or speech-to-text slips.`,
    `ok=false only if the reply is in another language, says something different, answers a different question, or is too incomplete to carry the meaning.`,
    `Reply with JSON only: {"ok": true or false, "fix": "<the most natural correct ${i.language} sentence for this meaning, max 12 words>"}.`,
  ].join(' ');
  const user = [
    i.cue.trim() ? `Partner said: "${clip(i.cue, 200)}"` : 'The learner starts the conversation.',
    i.intent.trim() ? `Intended meaning (Tajik): "${clip(i.intent, 200)}"` : '',
    `Example correct replies: ${i.answers.slice(0, MAX_ANSWERS).map((a) => `"${clip(a, 120)}"`).join(', ')}`,
    `Learner said (speech-to-text): "${clip(i.heard, 300)}"`,
  ]
    .filter(Boolean)
    .join('\n');
  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
}

/**
 * Модели «фикркунанда» (gpt-oss, o1/o3/o4, qwen3, deepseek-r1)? Ба онҳо
 * `reasoning_effort: low` лозим аст: бе он токенҳо ба фикр сарф мешаванд,
 * ҷавоб холӣ меояд ва довар ҳамеша «рад» мекунад (боги зинда, 26.09.2026).
 */
export function isReasoningModel(model: string): boolean {
  return /gpt-oss|(^|\/)o[1-9]|qwen3|deepseek-r1|reason/i.test(model);
}

/**
 * Ҷавоби моделро мехонад. Ҳар чизи ношинос → `ok: false` (бехатар: хонанда
 * танҳо бори дигар мегӯяд, на ин ки ҷавоби нодуруст қабул шавад).
 */
export function parseJudgeReply(reply: string): JudgeVerdict {
  const m = reply.match(/\{[\s\S]*\}/);
  if (!m) return { ok: false, fix: '' };
  try {
    const j = JSON.parse(m[0]) as { ok?: unknown; fix?: unknown };
    const ok = j.ok === true || j.ok === 'true';
    const fix = typeof j.fix === 'string' ? clip(j.fix, 120) : '';
    return { ok, fix };
  } catch {
    return { ok: false, fix: '' };
  }
}
