/**
 * «Кадом САДО ба шумо кор мехоҳад» — ҷамъбасти талаффуз аз рӯи фонема.
 *
 * ── Чаро ин ҳаст ───────────────────────────────────────────────────────────
 * Azure барои ҳар калима на танҳо хол, балки БАДТАРИН ФОНЕМАи онро медиҳад
 * (`AzureWord.worstPhoneme`). Мо маҳз барои ин маълумот пул медодем — ва
 * онро баъди нишон додани як ишора ФАВРАН мепартофтем.
 *
 * Ҳол он ки ин ягона чизест, ки барномаи ройгон дода наметавонад: «шумо
 * `th`-ро 41 → 68 беҳтар кардед, вале `r` ҳанӯз 38 аст». Ҳисоб аз рӯи ДАРС
 * («4 дарс тамом») ҳар барнома дорад; ҳисоб аз рӯи САДО — не.
 *
 * ── Модели маълумот ────────────────────────────────────────────────────────
 * Сатрҳои ХОМ нигоҳ дошта намешаванд. Барои ҳар (корбар · забон · фонема)
 * ЯК сатр бо ду сатил:
 *
 *   `cur*`  — ҳафтаи ҶОРӢ (аз `curStart`)
 *   `prev*` — ҳафтаи ГУЗАШТА, танҳо барои тирчаи «↑ беҳтар шуд»
 *
 * Вақте ҳафтаи ҷорӣ кӯҳна мешавад, сатили ҷорӣ ба гузашта мегузарад ва
 * аз сифр сар мешавад. Ин «гардиш» функсияи СОФ аст ([rollWeek]) — пас
 * ҳисоб ба вақти сервер вобаста нест ва санҷида мешавад.
 *
 * ⚠️ ЧАРО на сатрҳои хом: як дарс ~145 кӯшиш дорад ва ҳар кӯшиш чанд
 * калима. Дар як моҳ ин садҳо ҳазор сатр мешуд — барои ҳисобе, ки ҳамагӣ
 * миёнаро нишон медиҳад.
 */

/** Ҳафта = 7 рӯз. Дар як ҷо, то ҳисоб ва матни экран аз ҳам наравад. */
export const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** Аз ин камтар кӯшиш → садо дар ҳисобот НАМЕОЯД (шумораи тасодуфӣ). */
export const MIN_ATTEMPTS = 3;

/** Хол аз ин поён → «кор мехоҳад». Ҳамон ҳадди ранги сурхи экран. */
export const WEAK_BELOW = 50;

/** Сатили як садо. Ҳамон майдонҳои `SpeakingSound`. */
export interface SoundRow {
  phoneme: string;
  curAttempts: number;
  curSum: number;
  curStart: Date;
  prevAttempts: number;
  prevSum: number;
  examples: string[];
}

/**
 * Агар ҳафтаи ҷорӣ кӯҳна шуда бошад — сатилҳоро мегардонад.
 *
 * Функсияи СОФ: сатри НАВ бармегардонад, сатри додашударо тағйир намедиҳад.
 *
 * ⚠️ Агар зиёда аз ЯК ҳафта гузашта бошад, «гузашта» низ пок мешавад: холи
 * дуҳафтаинаро ҳамчун «ҳафтаи гузашта» нишон додан дурӯғ мебуд.
 */
export function rollWeek(row: SoundRow, now: Date): SoundRow {
  const age = now.getTime() - row.curStart.getTime();
  if (age < WEEK_MS) return row;

  const twoWeeks = age >= 2 * WEEK_MS;
  return {
    ...row,
    prevAttempts: twoWeeks ? 0 : row.curAttempts,
    prevSum: twoWeeks ? 0 : row.curSum,
    curAttempts: 0,
    curSum: 0,
    curStart: now,
  };
}

/** Як кӯшиши нав: `{phoneme, score, word}` аз клиент. */
export interface SoundHit {
  phoneme: string;
  score: number;
  word?: string;
}

/** Чанд намунаи калима барои ҳар садо нигоҳ дошта мешавад. */
export const MAX_EXAMPLES = 3;

/**
 * Кӯшиши навро ба сатр илова мекунад (пас аз [rollWeek]).
 *
 * Намунаҳо ТАКРОР намешаванд ва аз [MAX_EXAMPLES] зиёд нест — рӯйхати
 * дароз дар экран ҷой надорад ва дар база беҳуда ҷой мегирад.
 */
export function addHit(row: SoundRow, hit: SoundHit): SoundRow {
  const word = (hit.word ?? '').trim().toLowerCase();
  const examples = row.examples.slice();
  if (word && examples.indexOf(word) === -1 && examples.length < MAX_EXAMPLES) {
    examples.push(word);
  }
  return {
    ...row,
    curAttempts: row.curAttempts + 1,
    curSum: row.curSum + hit.score,
    examples,
  };
}

/** Як сатри ҳисобот — маҳз он чи экран мехонад. */
export interface SoundReportRow {
  phoneme: string;
  /** Миёнаи ҳафтаи ҷорӣ, 0–100. */
  score: number;
  /** Миёнаи ҳафтаи гузашта; `null` = маълумот нест. */
  prevScore: number | null;
  attempts: number;
  examples: string[];
  /** Хол аз [WEAK_BELOW] поён аст. */
  weak: boolean;
}

const avg = (sum: number, n: number) => (n > 0 ? Math.round(sum / n) : 0);

/**
 * Сатрҳои база → ҳисоботи тайёр.
 *
 * Тартиб: аввал садоҳои СУСТ (аз пасттарин хол), баъд боқимонда. Экран
 * танҳо чанд сатри аввалро мегирад, пас тартиб маънои «чиро аввал нишон
 * диҳем»-ро дорад.
 */
export function buildSoundReport(
  rows: SoundRow[],
  { minAttempts = MIN_ATTEMPTS }: { minAttempts?: number } = {},
): SoundReportRow[] {
  return rows
    .filter((r) => r.curAttempts >= minAttempts)
    .map((r) => {
      const score = avg(r.curSum, r.curAttempts);
      return {
        phoneme: r.phoneme,
        score,
        prevScore: r.prevAttempts > 0 ? avg(r.prevSum, r.prevAttempts) : null,
        attempts: r.curAttempts,
        examples: r.examples.slice(0, MAX_EXAMPLES),
        weak: score < WEAK_BELOW,
      };
    })
    .sort((a, b) => {
      if (a.weak !== b.weak) return a.weak ? -1 : 1;
      return a.score - b.score;
    });
}
