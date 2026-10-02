/**
 * Транскрипсияи ҷумлаҳои шахсии «I am {job}.» (02.10.2026).
 *
 * Матни ҷумла `{job}` дорад ва онро БАРНОМА бо касби хонанда пур мекунад
 * (`speaking_persona.dart`: build → «a builder»). Транскрипсия (`literal`)
 * пештар барои ин ҷумлаҳо холӣ буд — хонанда «I am a builder» -ро бе хати
 * тоҷикӣ медид. Акнун `literal` дар база қолаб аст («ай эм {job}»), ва сервер
 * онро бо транскрипсияи ҲАМОН касб пур мекунад, ки барнома ба матн мегузорад.
 *
 * ⚠️ Касбҳо бояд бо `_jobs`-и `speaking_persona.dart` якхела бошанд: ҳадаф
 * нест → `life` (ҳамон қоидаи `_goalKey`).
 */
import type { SpeakingGoal } from './situations';

const JOB_LITERAL: Record<string, Record<SpeakingGoal, string>> = {
  // en: «a builder», «a driver», «a salesperson», «a student», «a worker».
  en: {
    build: 'э билдэр',
    drive: 'э драйвэр',
    service: 'э сейлзпёрсэн',
    study: 'э стюдэнт',
    life: 'э вёркэр',
  },
};

/**
 * `literal` бо `{job}` → транскрипсияи пурра.
 *
 * - `goal === undefined` — ҳадафи хонанда номаълум (такрор, «Калимаҳои ман»):
 *   касбро бо итминон гуфта намешавад → `''` (барнома транскрипсияро
 *   намекашад, мисли пештара), на қолаби хом бо «{job}».
 * - `goal === null` — хонанда ҳадаф интихоб накардааст → `life`.
 * - Забоне, ки ҷадвал надорад, ё `{name}` → `''`.
 */
export function fillJobLiteral(
  literal: string,
  lang: string,
  goal: SpeakingGoal | null | undefined,
): string {
  if (!literal.includes('{')) return literal;
  if (goal === undefined || literal.includes('{name}')) return '';
  const job = JOB_LITERAL[lang.split('-')[0].toLowerCase()]?.[goal ?? 'life'];
  if (!job) return '';
  const out = literal.replace(/\{job\}/g, job);
  return out.includes('{') ? '' : out;
}
