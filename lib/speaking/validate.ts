/**
 * Валидатори мазмуни Speaking — §3-и спетсификатсия.
 *
 * ЯГОНА манбаи қоидаҳо. Ҳамон файл дар СЕ ҷо истифода мешавад:
 *   • `app/api/admin/speaking/items/route.ts` — пеш аз сабт;
 *   • `app/api/admin/speaking/seed/route.ts` — пеш аз seed;
 *   • `npm run speaking:audit` — бар ҳамаи бастаҳо ва базаи ҷорӣ.
 *
 * Мисли `engine.ts`, ин функсияи ТОЗА аст: ҳеҷ Prisma, ҳеҷ I/O, ҳеҷ
 * `Date`. Даъваткунанда контекстро худаш тайёр мекунад.
 *
 * `error` → сабт МАНЪ (HTTP 400). `warning` → сабт иҷозат, вале дар
 * админ бо чароғаки зард.
 */

import {
  buildChain,
  generateSteps,
  configForEv,
  asStage,
  OWN_SLOT,
  parsePatternOptions,
  type EngineConfig,
  type EngineItem,
  type Stage,
} from './engine';

/**
 * Аз ин зиёд қадам — нишаст барои як машқи гуфтор хеле дароз мешавад.
 *
 * Чен аз мазмуни воқеӣ: дар `ev=1` миёна 18.8 қадам буд, дар `ev=2` бо
 * қадами `chunk` ба ~26 расид. Аз 30 боло дарс ба 8–10 дақиқаи гуфтори
 * бефосила мекашад — ин ҷоест, ки хонанда мепартояд.
 */
const MAX_STEPS_WARN = 30;

export type Severity = 'error' | 'warning';

export interface Issue {
  code: string;
  severity: Severity;
  message: string;
  itemId?: string;
}

export interface ValidateContext {
  /** Намунаи алифбои забони ОМӮЗИШ. `null` = санҷиш гузаронида мешавад. */
  targetScript: RegExp | null;
  /** Матнҳои дарсҳои ДИГАРи ҳамин боб — барои `W_DUP_IN_CATEGORY`. */
  categoryTexts: Set<string>;
}

const norm = (s: string) => s.trim().toLowerCase();
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean);

export function validateLesson(
  lesson: { id: string; items: EngineItem[]; stage?: string | null },
  ctx: ValidateContext,
  cfg: EngineConfig,
): Issue[] {
  const issues: Issue[] = [];
  const add = (code: string, severity: Severity, message: string, itemId?: string) =>
    issues.push({ code, severity, message, itemId });

  const items = lesson.items;

  // ── E_EMPTY_LESSON ─────────────────────────────────────────────────────
  if (items.length === 0) {
    add('E_EMPTY_LESSON', 'error', 'Дарс холӣ аст — дар барнома нишон дода намешавад');
    return issues;
  }

  const seenInLesson = new Map<string, string>();
  let newWords = 0;

  for (const it of items) {
    const text = it.text.trim();
    const wc = words(text).length;
    if (it.kind === 'word') newWords++;

    // ── E_WORD_HAS_SPACE / W_WORD_IS_CHUNK ──────────────────────────────
    //
    // ⚠️ КАҶРАВӢ АЗ §3, бо далел. Дар §3 ҳар «калима»-и фосиладор ХАТО
    // ҳисоб мешавад. Иҷрои аввал бар 7 баста 21 хато дод — ва ҲАР 21-тои
    // он чунки лексикии ҚАСДАН дуруст буд: «thank you», «how much»,
    // «excuse me», «Nice to meet you». Ягонтоаш ҷумлаи ғалат интихобшуда
    // набуд (0 то бо аломати ҷумла ё ≥5 калима).
    //
    // Сабаб сохторист: `kind` танҳо `word|sentence` дорад, ва зинаи
    // дуқадама (say → translate) маҳз ба `word` бастааст. То
    // пайдо шудани `chunk` ҳамчун навъи мустақил (M5), муаллиф чунки
    // 2–4-калимагиро дуруст ҳамчун `word` менависад. Онҳоро ба `sentence`
    // «ислоҳ» кардан зинаи талаффузро мекушт ва аз «Калимаҳои ман»
    // мебаровард — яъне регресси воқеӣ.
    //
    // Пас: ХАТО танҳо вақте, ки матн ВОҚЕАН ҷумла аст; чунк — огоҳӣ.
    if (it.kind === 'word' && wc > 1) {
      const looksLikeSentence = wc >= 5 || /[.!?]$/.test(text);
      if (looksLikeSentence) {
        add(
          'E_WORD_HAS_SPACE',
          'error',
          `«Калима» интихоб шуд, вале матн ҷумла аст: «${text}»`,
          it.id,
        );
      } else {
        add(
          'W_WORD_IS_CHUNK',
          'warning',
          `Чунки ${wc}-калимагӣ ҳамчун «Калима» сабт шуд: «${text}» — то M5 ин дуруст аст`,
          it.id,
        );
      }
    }

    // ── E_SCRIPT ────────────────────────────────────────────────────────
    if (ctx.targetScript && text && !ctx.targetScript.test(text)) {
      add('E_SCRIPT', 'error', `Матн бо алифбои забони омӯзиш нест: «${text}»`, it.id);
    }

    // ── E_DUP_IN_LESSON ─────────────────────────────────────────────────
    const key = norm(text);
    if (seenInLesson.has(key)) {
      add('E_DUP_IN_LESSON', 'error', `Такрори матн дар як дарс: «${text}»`, it.id);
    } else {
      seenInLesson.set(key, it.id);
    }

    // ── E_CUE_TRANSLATION ───────────────────────────────────────────────
    if (it.cueTranslation?.trim() && !it.cue?.trim()) {
      add(
        'E_CUE_TRANSLATION',
        'error',
        'Тарҷумаи ҷумлаи ҳамсӯҳбат ҳаст, вале худи ҷумла нест',
        it.id,
      );
    }

    // ── E_CHAIN_NOT_SUFFIX / E_CHAIN_ORDER ──────────────────────────────
    const chain = it.chainOverride ?? [];
    if (chain.length) {
      for (const seg of chain) {
        if (!text.endsWith(seg.trim())) {
          add(
            'E_CHAIN_NOT_SUFFIX',
            'error',
            `Занҷир бояд аз охири ҷумла сохта шавад: «${seg}» суффикси «${text}» нест`,
            it.id,
          );
        }
      }
      const lens = chain.map((s) => words(s).length);
      const ordered = lens.every((n, i) => i === 0 || lens[i - 1] < n);
      if (!ordered) {
        add('E_CHAIN_ORDER', 'error', 'Тартиби занҷир нодуруст — бояд аз кӯтоҳ ба дароз бошад', it.id);
      }
    }

    // ── W_SENTENCE_ONE_WORD ─────────────────────────────────────────────
    // (Навбати нақшбозӣ як калима шуда метавонад: «Нет.», «Да, спасибо.»)
    if (it.kind === 'sentence' && wc === 1) {
      add(
        'W_SENTENCE_ONE_WORD',
        'warning',
        `Ин як калима аст — навъро «Калима» кунед: «${text}»`,
        it.id,
      );
    }

    // ── W_TOO_LONG ──────────────────────────────────────────────────────
    if (wc > cfg.maxSlotWords) {
      add(
        'W_TOO_LONG',
        'warning',
        `Ҷумла аз ${cfg.maxSlotWords} калима дарозтар — слот сохта намешавад, ба ҷои он recall меояд`,
        it.id,
      );
    }

    // ── W_DUP_IN_CATEGORY ───────────────────────────────────────────────
    if (ctx.categoryTexts.has(key)) {
      add('W_DUP_IN_CATEGORY', 'warning', `Ин матн дар дарси дигари ҳамин боб ҳаст: «${text}»`, it.id);
    }

    // ── W_NO_LITERAL ────────────────────────────────────────────────────
    if (it.kind === 'word' && !it.literal?.trim()) {
      add('W_NO_LITERAL', 'warning', `Талаффуз холӣ — барои навомӯз душвор: «${text}»`, it.id);
    }

    // ── W_NO_AUDIO ──────────────────────────────────────────────────────
    if (!it.audioUrl?.trim()) {
      add('W_NO_AUDIO', 'warning', `Садо нест — TTS-и дастгоҳ истифода мешавад: «${text}»`, it.id);
    }

    // ── W_NO_SWAPS / W_NO_CHAIN (танҳо барои ҷумла) ─────────────────────
    // Навбати нақшбозӣ на қолаб дорад, на занҷир — огоҳӣ дар он ҷо садо аст.
    if (it.kind === 'sentence') {
      if ((it.swaps ?? []).length < 2) {
        add('W_NO_SWAPS', 'warning', `Варианти иваз нест — қолаб автоматӣ намешавад: «${text}»`, it.id);
      }
      if (wc >= cfg.minChainWords && chain.length === 0 && buildChain(text, cfg).length === 0) {
        add('W_NO_CHAIN', 'warning', `Занҷир сохта нашуд: «${text}»`, it.id);
      }
    }
  }

  // ── W_TOO_MANY_NEW ─────────────────────────────────────────────────────
  if (newWords > cfg.maxNewWordsPerLesson) {
    add(
      'W_TOO_MANY_NEW',
      'warning',
      `Дар як дарс аз ${cfg.maxNewWordsPerLesson} калимаи нав зиёд (${newWords}) — сарборӣ`,
    );
  }

  // ── W_LESSON_TOO_LONG ──────────────────────────────────────────────────
  //
  // Аз худи МУҲАРРИК пурсида мешавад, на тахмин: танҳо ҳамон рақамеро
  // мебинем, ки хонанда воқеан мегирад. `ev=2` гирифта мешавад — ҳолати
  // бадтарин, чунки он қадамҳои `chunk`/`swap`-ро низ дар бар мегирад.
  try {
    const steps = generateSteps(items, configForEv(3, cfg), {
      repeat: false,
      stage: asStage(lesson.stage),
    }).length;
    if (steps > MAX_STEPS_WARN) {
      add(
        'W_LESSON_TOO_LONG',
        'warning',
        `Дарс ${steps} қадам медиҳад (ҳадди тавсиявӣ ${MAX_STEPS_WARN}) — дарсро ба ду тақсим кунед`,
      );
    }
  } catch {
    // Валидатор набояд аз сабаби муҳаррик афтад.
  }

  // ── W_NO_SEPARATOR ─────────────────────────────────────────────────────
  //
  // ⚠️ Ин қоида дар §3 НАБУД — ҳангоми M1 ошкор шуд ва ин ҷои табиии он.
  // Воҳиди калима се қадам медиҳад; агар дар дарс ғайр аз он камтар аз ду
  // воҳиди дигар бошад, муҳаррик фосила сохта НАМЕТАВОНАД ва инварианти 1
  // ноилоҷ вайрон мешавад (§2.7).
  const wordItems = items.filter((i) => i.kind === 'word').length;
  if (wordItems > 0 && items.length < 3) {
    add(
      'W_NO_SEPARATOR',
      'warning',
      `Дарс хеле кӯтоҳ (${items.length} воҳид) — қадамҳои як калима пайиҳам меафтанд`,
    );
  }

  // ── Зинаҳои вазъият (26.09.2026) ───────────────────────────────────────
  const stage = asStage(lesson.stage);
  if (stage) {
    for (const i of validateStage(stage, items)) issues.push(i);
  } else if (items.some((i) => i.kind === 'turn')) {
    add(
      'W_TURN_NO_STAGE',
      'warning',
      'Дарс қадами нақшбозӣ дорад, вале зинааш «dialogue»/«mission» нест — ҳамчун машқи оддӣ нишон дода мешавад',
    );
  }

  return issues;
}

/**
 * Қоидаҳои ЗИНА — «аз осон ба душвор» дар дохили як вазъият.
 *
 *   words     → танҳо калима (то 2 калима: «спасибо», «добрый день»);
 *   chunks    → ибораҳои то 2 калима;
 *   sentences → ҷумлаҳои то 4 калима;
 *   dialogue  → танҳо навбатҳои нақшбозӣ (`turn`), ҳадди ақал 2;
 *   mission   → навбатҳои нақшбозӣ, ҳадди ақал 3 (се ҳадаф).
 *
 * Ҳадаф: дарсҳои аввал ~90% дар кӯшиши аввал гузаранд. Ҷумлаи дароз дар
 * дарси 1 маҳз ҳамон чизест, ки хонандаро дар рӯзи аввал мерабояд.
 */
export function validateStage(stage: Stage, items: EngineItem[]): Issue[] {
  const out: Issue[] = [];
  const add = (code: string, severity: Severity, message: string, itemId?: string) =>
    out.push({ code, severity, message, itemId });

  const maxWords: Record<Stage, number> = {
    words: 2,
    chunks: 2,
    sentences: 4,
    dialogue: 8,
    mission: 8,
  };

  if (stage === 'dialogue' || stage === 'mission') {
    const turns = items.filter((i) => i.kind === 'turn');
    const min = stage === 'mission' ? 3 : 2;
    if (turns.length < min) {
      add(
        'E_STAGE_FEW_TURNS',
        'error',
        `Зинаи «${stage}» ҳадди ақал ${min} навбати нақшбозӣ мехоҳад (ҳоло ${turns.length})`,
      );
    }
    for (const it of items) {
      if (it.kind !== 'turn') {
        add('E_STAGE_KIND', 'error', `Дар зинаи «${stage}» танҳо навбати нақшбозӣ мешавад: «${it.text}»`, it.id);
        continue;
      }
      if (!it.cue?.trim()) {
        add('E_TURN_NO_CUE', 'error', `Навбат бе ҷумлаи ҳамсӯҳбат: «${it.text}»`, it.id);
      }
      if (!it.intent?.trim()) {
        add('W_TURN_NO_INTENT', 'warning', `Нияти тоҷикӣ холӣ — ба ҷояш тарҷума нишон дода мешавад: «${it.text}»`, it.id);
      }
      if (words(it.text).length > maxWords[stage]) {
        add('W_STAGE_LONG', 'warning', `Ҷавоб барои нақшбозӣ дароз аст: «${it.text}»`, it.id);
      }
    }
    return out;
  }

  for (const it of items) {
    const wc = words(it.text).length;
    if (it.kind === 'turn') {
      add('E_STAGE_KIND', 'error', `Навбати нақшбозӣ дар зинаи «${stage}» — зинаро «dialogue» кунед`, it.id);
      continue;
    }
    // «Ҷавоби худат»: қолаб БОЯД ҷои холӣ дошта бошад, вагарна хонанда
    // «___»-ро айнан мегуфт.
    if (it.kind === 'own') {
      if (!it.text.includes(OWN_SLOT)) {
        add('E_OWN_NO_SLOT', 'error', `«Ҷавоби худат» бе ҷои холӣ «${OWN_SLOT}»: «${it.text}»`, it.id);
      }
      if (!it.cue?.trim()) {
        add('W_OWN_NO_CUE', 'warning', `«Ҷавоби худат» бе саволи ҳамсӯҳбат: «${it.text}»`, it.id);
      }
      if (stage === 'words') {
        add('E_STAGE_KIND', 'error', `Зинаи «words» танҳо калима дорад: «${it.text}»`, it.id);
      }
      continue;
    }
    // «Иваз кун»: ҳар вариант маънои тоҷикӣ мехоҳад — экран онро нишон медиҳад.
    const opts = parsePatternOptions(it.swaps);
    if (opts.length && opts.some((o) => !o.meaning)) {
      add('W_PATTERN_NO_MEANING', 'warning', `Варианти «Иваз кун» бе маъно («калима|маъно»): «${it.text}»`, it.id);
    }
    if (stage === 'words' && it.kind !== 'word') {
      add('E_STAGE_KIND', 'error', `Зинаи «words» танҳо калима дорад: «${it.text}»`, it.id);
    }
    if (wc > maxWords[stage]) {
      add(
        'E_STAGE_TOO_LONG',
        'error',
        `Дар зинаи «${stage}» ҳадди аксар ${maxWords[stage]} калима: «${it.text}» (${wc})`,
        it.id,
      );
    }
  }
  return out;
}

/** Ихтисори қулай: танҳо хатоҳо. */
export const errorsOf = (issues: Issue[]) => issues.filter((i) => i.severity === 'error');
