// Нимишаби МАҲАЛЛӢ — навбат бо рӯзи худи хонанда кор мекунад, на бо UTC
// (ҳамон сабабе, ки дар `lib/localDay.ts` шарҳ дода шудааст).
import { DEFAULT_TZ_OFFSET_MIN } from './localDay';

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

// ─────────────────────────────────────────────────────────────────────────────
// Сиёсати навбат — ҷудо аз математикаи SM-2 боло.
//
// Математика дуруст буд, вале СИЁСАТ набуд, ва маҳз он навбатро мекушт.
// Ҳолати продакшн дар 10.09.2026:
//   • 8,323 корт, ки 85%-аш дар `repetitions = 1` меистод — як бор сабт
//     шуда, дигар ҳеҷ гоҳ воқеан такрор нашуда;
//   • Алишер Хакимов 851 корти мӯҳлатрасида аз 851 (100%), кӯҳнатаринаш
//     39 рӯз пеш; Shar1pov 740 аз 740;
//   • миёна 30.4 корти нав дар як рӯз, рекорд **571 дар ЯК рӯз**.
// Сабаб: тамомкунии дарс ҳамаи калимаҳояшро ЯКБОРА ба навбат мепартофт ва
// ҳеҷ ҳадди рӯзона набуд. Хонанда рӯзи дигар девори 500-калимаро медид ва
// дигар ба он даст намезад.
// ─────────────────────────────────────────────────────────────────────────────

/** Чанд корти НАВ дар як рӯз ба навбат дохил мешавад. */
export const SRS_NEW_PER_DAY = 20;

/** Андозаи як сессияи такрор — ҳамон рақаме, ки мизоҷ мепурсад. */
export const SRS_SESSION_SIZE = 15;

/** Оғози рӯзи маҳаллӣ + `plusDays`, ҳамчун лаҳзаи воқеии UTC. */
export function dueDayStart(plusDays: number, now: Date, tzOffsetMin = DEFAULT_TZ_OFFSET_MIN): Date {
  const shifted = new Date(now.getTime() + tzOffsetMin * 60_000);
  shifted.setUTCHours(0, 0, 0, 0);
  shifted.setUTCDate(shifted.getUTCDate() + plusDays);
  return new Date(shifted.getTime() - tzOffsetMin * 60_000);
}

/**
 * Санаи навбатро барои кортҳои НАВ тақсим мекунад, то ҳеҷ рӯз аз
 * [SRS_NEW_PER_DAY] зиёд нагирад.
 *
 * [alreadyPerDay] — чанд корт аллакай ба ҳар рӯз таъин шудааст
 * (калид = «чанд рӯз аз имрӯз», яъне 1 = фардо).
 *
 * Функсияи пок: рӯйхати «чанд рӯз баъд» бармегардонад, ба ҳамон тартиби
 * калимаҳои воридшуда — то калимаҳои як дарс паҳлӯи ҳам монанд.
 */
export function spreadNewCards(
  count: number,
  alreadyPerDay: Map<number, number> = new Map(),
  perDay = SRS_NEW_PER_DAY,
): number[] {
  const out: number[] = [];
  // Аз ФАРДО оғоз мешавад: калимаро ҳамон рӯзе, ки омӯхта шуд, пурсидан
  // такрори фосиладор нест — хонанда онро ҳанӯз дар хотири кӯтоҳмуддат дорад.
  let day = 1;
  let used = alreadyPerDay.get(day) ?? 0;

  for (let i = 0; i < count; i++) {
    while (used >= perDay) {
      day += 1;
      used = alreadyPerDay.get(day) ?? 0;
    }
    out.push(day);
    used += 1;
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// ҚУТТИИ ХАТОҲО («Такрор» дар экрани асосӣ)
//
// Талаби корбар (21.09.2026), айнан:
//   · дар як рӯз ҳадди аксар 15 калима;
//   · ТАНҲО калимаҳое, ки дар ДАРС хато шудаанд (10 хато → 10 калима);
//   · агар дар вақти такрор боз хато кунад → рӯзи ОЯНДА бармегардад;
//   · фардо: хатоҳои нав + хатоҳои боқимонда, боз ҳамон 15;
//   · ҳама дуруст шуд → ҷои такрор ХОЛӢ.
//
// Ин аз SM-2-и оддӣ фарқ мекунад: он ҲАМАИ калимаҳои омӯхташударо дер ё зуд
// бармегардонад. Ин ҷо танҳо «қарзи хато» дида мешавад.
//
// Аломати «дар қуттӣ» = `lapses > 0`. Ҳеҷ ҷадвали нав лозим нест ва
// `SrsCard` ҳамчун сабти «калимаи омӯхташуда» бетағйир мемонад.
// ─────────────────────────────────────────────────────────────────────────────

/** Чанд калимаи хато дар ЯК рӯз нишон дода мешавад. */
export const MISTAKE_BOX_SIZE = 15;

/**
 * Хато дар ДАРС: калима ба қуттӣ меафтад ва ҲАМИН РӮЗ дар навбат пайдо
 * мешавад (`dueAt = now`) — хонанда набояд то фардо интизор шавад.
 *
 * Фосилаҳои SM-2 даст намехӯранд: калима аллакай «омӯхташуда» ҳисоб мешавад
 * ва мо танҳо қарзи хаторо илова мекунем.
 */
export function afterLessonMistake(
  prev: SrsState | null,
  now: Date = new Date(),
): SrsState & { dueAt: Date } {
  const base = prev ?? initialSrsState();
  return { ...base, lapses: base.lapses + 1, dueAt: now };
}

/**
 * Ҷавоб дар ТАКРОР.
 *
 * · дуруст → `lapses = 0`: калима аз қуттӣ МЕБАРОЯД (ва бо ҷадвали
 *   муқаррарии SM-2 давом мекунад);
 * · хато    → `again`: SM-2 худаш `dueAt = фардо` мегузорад ва `lapses`-ро
 *   як зина боло мебарад — яъне калима маҳз рӯзи оянда бармегардад.
 */
export function afterReviewAnswer(
  prev: SrsState,
  correct: boolean,
  now: Date = new Date(),
): SrsReviewResult {
  const res = reviewCard(prev, correct ? 'good' : 'again', now);
  return correct ? { ...res, lapses: 0 } : res;
}

/** Оё ин корт ҳоло дар қуттии хатоҳост? */
export function isInMistakeBox(state: Pick<SrsState, 'lapses'>): boolean {
  return state.lapses > 0;
}
