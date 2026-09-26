/**
 * Муҳаррики тавлиди машқҳои Speaking.
 *
 * ⚠️ M0 — ҶУДОКУНӢ, на такмил. Мантиқ АЙНАН ҳамон аст, ки дар
 * `app/api/ai/speaking/lesson/route.ts:153–265` буд. Ҳеҷ майдони нав,
 * ҳеҷ тартиби нав, ҳеҷ фосила (`gap`). Хуруҷи `toWire(step, 1)` бояд
 * байт-ба-байт бо 6 baseline-и `__tests__/__snapshots__/baseline/`
 * баробар бошад.
 *
 * ТАЛАБОТИ ҚАТЪӢ (§2.1): ин файл функсияи ТОЗА аст —
 *   ❌ ҳеҷ `Math.random()`   ❌ ҳеҷ `Date` / `Date.now()`
 *   ❌ ҳеҷ Prisma, `fetch`, ё ягон I/O
 *   ✅ як вуруд = ҳамеша ҳамон натиҷа
 * Танҳо чунин функсияро метавон 100% санҷид ва дар админ пешнамоиш кард.
 */

/** Версияи худи муҳаррик. Ба формати сим дахл НАДОРАД — ниг. `toWire(s, ev)`. */
export const ENGINE_VERSION = 2;

export type StepKind =
  | 'say' // матн + маънӣ намоён, барнома мехонад
  | 'chunk' // пораи занҷир — M5, ҳанӯз тавлид намешавад
  | 'translate' // тарҷума намоён, слотҳо, барнома НАмехонад
  | 'swap' // қолаб бо ҷузъи иваз — M5, ҳанӯз тавлид намешавад
  | 'recall' // бе слот, бе матн
  // ── ev ≥ 3 (26.09.2026): курси вазъиятҳо ──────────────────────────────
  | 'listen' // муколамаи пурра — танҳо гӯш кардан, бе микрофон
  | 'heard' // «Кадом ибораро шунидӣ?» — интихоб аз 3, бе микрофон
  | 'turn' // нақшбозӣ: ҷумлаи ҳамсӯҳбат + НИЯТ, хонанда бо калимаҳои худ
  | 'pattern' // «Иваз кун»: қолаб + вариант бо маънои тоҷикӣ, ҷумлаи пурра
  | 'own'; // «Ҷавоби худат»: қолаб бо ҷои холӣ — «Меня зовут ___»

/**
 * Зинаи дарс дар дохили вазъият (`SpeakingLesson.stage`).
 *
 * Аз осон ба душвор: калима → ибораи 2-калимагӣ → ҷумлаи кӯтоҳ → нақшбозӣ
 * → миссия. `null` = дарси кӯҳна, рафтори пештара.
 */
export type Stage = 'words' | 'chunks' | 'sentences' | 'dialogue' | 'mission';

export const STAGES: readonly Stage[] = [
  'words',
  'chunks',
  'sentences',
  'dialogue',
  'mission',
];

export function asStage(v: string | null | undefined): Stage | null {
  return STAGES.includes(v as Stage) ? (v as Stage) : null;
}

export type Badge = 'none' | 'newWord' | 'hard' | 'remember';

export interface EngineConfig {
  /** Ҳадди ақали фосила байни қадамҳои як воҳид. ⚠️ M0: ИСТИФОДА НАМЕШАВАД (M1). */
  gap: number;
  /** Аз ин зиёд калима — слот сохта намешавад. */
  maxSlotWords: number;
  /** Ҷумлаи аз ин кӯтоҳтар занҷир намегирад. */
  minChainWords: number;
  /**
   * Аз як ҷумла на бештар аз ин чунк.
   *
   * ⚠️ 2 → 1. Чунки дуюм танҳо ба 11 ҷумла аз 148 мерасид ва одатан
   * такрори ҳамонест бо як калимаи иловагӣ — фоидааш кам, вале дарозии
   * дарсро зиёд мекард.
   */
  maxChainSteps: number;
  /** ⚠️ M0: истифода намешавад (M5 — `swap`). */
  maxSwapSteps: number;
  /** Чанд ҷумла дар охири дарс ҳамчун `recall`. */
  recallTail: number;
  /** Камтар аз ин ҳавз — думи `recall` тамоман нест. */
  recallMinPool: number;
  /** ⚠️ M0: истифода намешавад (M3 — валидатор). */
  maxNewWordsPerLesson: number;

  /**
   * Кадом навъҳо тавлид шуда метавонанд — ГЕЙТИ ВЕРСИЯ (§10.2).
   *
   * ⚠️ Ин ягона муҳофизест, ки APK-и КӮҲНА навъи навро ҳеҷ гоҳ
   * намегирад, ҳатто пас аз навсозии сервер. Бе он `swap` дар
   * телефонҳои насбшуда хомӯшона вайрон мешуд.
   */
  allowedKinds: StepKind[];

  /**
   * Рамзи забони ОМӮЗИШ («de», «ru», …) — барои рӯйхатҳои чанки хоси забон.
   *
   * Холӣ бошад, танҳо рӯйхатҳои умумӣ кор мекунанд (рафтори пештара).
   */
  lang?: string;
}

/** Навъҳое, ки ҳар клиент мефаҳмад (ev = 1). */
export const LEGACY_KINDS: StepKind[] = ['say', 'translate', 'recall'];

/** + навъҳои нав (ev ≥ 2). */
export const V2_KINDS: StepKind[] = [...LEGACY_KINDS, 'chunk', 'swap'];

/** + курси вазъиятҳо (ev ≥ 3): гӯш кардан, «кадомашро шунидӣ», нақшбозӣ. */
export const V3_KINDS: StepKind[] = [
  ...V2_KINDS,
  'listen',
  'heard',
  'turn',
  'pattern',
  'own',
];

/** Ҷои холӣ дар қолаби «Ҷавоби худат»: «Меня зовут ___.» */
export const OWN_SLOT = '___';

/** Як варианти «Иваз кун»: калима ва маънои тоҷикии он. */
export interface PatternOption {
  text: string;
  meaning: string;
}

/**
 * `swaps` дар шакли «калима|маъно» (`"живот|шикам"`). Бе «|» — маъно холӣ.
 * Пешниҳоди КӮҲНА (`swap`, ev 2) ҳамон сатрҳоро бе «|» истифода мебарад.
 */
export function parsePatternOptions(swaps: string[] | undefined): PatternOption[] {
  return (swaps ?? [])
    .map((s) => {
      const i = s.indexOf('|');
      return i === -1
        ? { text: s.trim(), meaning: '' }
        : { text: s.slice(0, i).trim(), meaning: s.slice(i + 1).trim() };
    })
    .filter((o) => o.text);
}

export const DEFAULT_CONFIG: EngineConfig = {
  gap: 2,
  maxSlotWords: 8,
  minChainWords: 3,
  maxChainSteps: 1,
  maxSwapSteps: 2,
  recallTail: 2,
  recallMinPool: 3,
  maxNewWordsPerLesson: 7,
  allowedKinds: LEGACY_KINDS,
};

/**
 * Конфиг аз рӯи версияи клиент.
 *
 * `ev` аз параметри дархост меояд (`?ev=2`). Клиенти кӯҳна онро
 * тамоман намефиристад → `1` → рафтори M1 бе ягон тағйир.
 */
export function configForEv(ev: number, base: EngineConfig = DEFAULT_CONFIG): EngineConfig {
  if (ev >= 3) return { ...base, allowedKinds: V3_KINDS };
  return ev >= 2 ? { ...base, allowedKinds: V2_KINDS } : { ...base, allowedKinds: LEGACY_KINDS };
}

/** Воҳиди мазмун — маҳз ҳамон 9 майдоне, ки `select`-и роут мегирад (79–93). */
export interface EngineItem {
  id: string;
  /**
   * `turn` = қадами нақшбозӣ (ниг. [Stage] `dialogue`/`mission`);
   * `own` = «Ҷавоби худат» — `text` қолаб бо [OWN_SLOT] аст.
   */
  kind: 'word' | 'sentence' | 'turn' | 'own';
  text: string;
  translation: string;
  literal: string | null;
  note: string | null;
  cue: string | null;
  cueTranslation: string | null;
  audioUrl: string | null;
  /** ⚠️ Дар схема ҲАНӮЗ НЕСТ (M2). Барои ҳамин ихтиёрӣ. */
  chainOverride?: string[];
  /** ⚠️ Дар схема ҲАНӮЗ НЕСТ (M2). */
  swaps?: string[];
  order?: number;
  /** Нияти нақшбозӣ ба забони модарӣ — танҳо барои `turn`. */
  intent?: string | null;
  /** Ҷавобҳои ДИГАРИ дуруст барои `turn`. */
  accepts?: string[];
  /** Аудиои тайёри ҷумлаи ҳамсӯҳбат (`cue`). Холӣ = TTS-и дастгоҳ. */
  cueAudioUrl?: string | null;
  /** Ният бо овози тоҷикӣ (`turn`/`own`). Холӣ = танҳо матн. */
  intentAudioUrl?: string | null;
}

export interface EngineOptions {
  /**
   * Дарс аллакай гузашта шудааст → нишони «ба ёд оред».
   *
   * ⚠️ Дар §2.6 ин `isReview` номида шудааст. Ном дар ин ҷо ҚАСДАН фарқ
   * мекунад: манбаи имрӯзаи он `doneIds.has(lesson.id)` аст — яъне
   * «ин дарс такрорӣ аст», на «ин нишасти /review аст». Ду мафҳуми
   * гуногунро як ном пӯшонида наметавонад.
   */
  repeat: boolean;

  /** Зинаи дарс. Холӣ = дарси кӯҳна (рафтори пештара). */
  stage?: Stage | null;

  /**
   * Ибораҳои НИШАСТҲОИ ПЕШТАРАИ ҳамин вазъият — «3 ибораи кӯҳна».
   * Роут интихоб мекунад (охиринҳо); муҳаррик онҳоро ҳамчун «аз маъно
   * гӯй» ва барои «Шунидед?»-и аввали нишаст истифода мебарад.
   */
  review?: EngineItem[];

  /**
   * Рақами дарс дар вазъият (0…). Барои ГАРДОНИ «Шунидед?»: ҳар нишаст
   * ибораи дигар ва ҷои дигари ҷавоби дурустро мегирад. Детерминистӣ.
   */
  position?: number;
}

/** Қадами ДОХИЛӢ. Ҳеҷ гоҳ бевосита ба сим намеравад — ниг. `toWire`. */
export interface Step {
  stepId: string;
  itemId: string;
  kind: StepKind;
  prompt: string;
  target: string;
  translation: string;
  literal: string | null;
  note: string | null;
  cue: string | null;
  cueTranslation: string | null;
  audioUrl: string | null;
  badge: Badge;
  targetWords: string[];
  showSlots: boolean;
  timerMs: number | null;

  // ── Танҳо барои навъҳои ev ≥ 3 ──────────────────────────────────────
  /** `listen`: сатрҳои муколама бо тартиб. */
  lines?: DialogueLine[];
  /** `heard`: се ибора, яке шунида мешавад. */
  options?: string[];
  answerIndex?: number;
  /** `turn`: ҷавобҳои дигари дуруст ва нияти забони модарӣ. */
  accepts?: string[];
  intent?: string;
  /** Аудиои тайёри `cue` ва нияти тоҷикӣ — ниг. [EngineItem]. */
  cueAudioUrl?: string;
  intentAudioUrl?: string;
  /** `turn` дар миссия: корти ният пинҳон, танҳо рӯйхати ҳадафҳо. */
  hideIntent?: boolean;
  goals?: string[];
  goalIndex?: number;
  /** `pattern`: қолаб «У меня болит ___», вариантҳо ва кадомаш пурсида мешавад. */
  patternHead?: string;
  patternTail?: string;
  patternOptions?: PatternOption[];
  askIndex?: number;
}

/** Як сатри муколама барои қадами `listen`. */
export interface DialogueLine {
  who: 'partner' | 'me';
  text: string;
  translation: string;
  audioUrl: string;
}

/** Он чи ба клиент меравад. Номҳо аз формати ҶОРӢ мехкӯб шудаанд. */
export interface WireStep {
  kind: string;
  badge: string;
  target?: string;
  prompt?: string;
  targetWords?: string[];
  itemId: string;
  translit: string;
  meaning: string;
  grammar: string;
  audioUrl: string;
  cue?: string;
  cueTranslation?: string;
  // Танҳо ҳангоми ev >= 2 (§10.2). Клиенти кӯҳна инҳоро намебинад.
  stepId?: string;
  showSlots?: boolean;
  timerMs?: number | null;
  // Танҳо ev ≥ 3.
  lines?: DialogueLine[];
  options?: string[];
  answerIndex?: number;
  accepts?: string[];
  intent?: string;
  cueAudioUrl?: string;
  intentAudioUrl?: string;
  hideIntent?: boolean;
  goals?: string[];
  goalIndex?: number;
  patternHead?: string;
  patternTail?: string;
  patternOptions?: PatternOption[];
  askIndex?: number;
}

/** Сатри Prisma → воҳиди муҳаррик. Дар M0 амалан айниятӣ. */
export function toEngineItem(i: {
  id: string;
  kind: string;
  text: string;
  translation: string;
  literal: string | null;
  note: string | null;
  audioUrl: string | null;
  cue: string | null;
  cueTranslation: string | null;
  intent?: string | null;
  accepts?: string[];
  cueAudioUrl?: string | null;
  intentAudioUrl?: string | null;
}): EngineItem {
  return {
    id: i.id,
    kind:
      i.kind === 'word'
        ? 'word'
        : i.kind === 'turn'
          ? 'turn'
          : i.kind === 'own'
            ? 'own'
            : 'sentence',
    intent: i.intent ?? null,
    accepts: i.accepts ?? [],
    cueAudioUrl: i.cueAudioUrl ?? null,
    intentAudioUrl: i.intentAudioUrl ?? null,
    text: i.text,
    translation: i.translation,
    literal: i.literal,
    note: i.note,
    cue: i.cue,
    cueTranslation: i.cueTranslation,
    audioUrl: i.audioUrl,
  };
}

/** `text.split(/\s+/).filter(Boolean)` — ҳамон ифодаи роути ҷорӣ. */
function splitWords(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

/**
 * Калима барои муқоиса бо рӯйхатҳо: хурдҳарф, бе аломати китобатӣ.
 *
 * 🔴 2026-09-13: пештар `[^a-z]` буд — ҳар калимаи кириллӣ/арабӣ ба `''`
 * табдил меёфт ва инкори русӣ («не») ё арабӣ («لَا») ДИДА НАМЕШУД. Ҳоло ҳарфҳои
 * лотинӣ, кириллӣ, арабӣ ва ҳангул мемонанд; ҳаракатҳои арабӣ (U+064B–0652)
 * ва рақамҳо, мисли пештара, партофта мешаванд. Барои англисӣ натиҷа ҳамон аст.
 * 🔴 20.09.2026: «ß» (U+00DF) аз диапазони à–ɏ БЕРУН аст ва партофта мешуд —
 * «heiße» ба «heie» табдил меёфт ва ҳеҷ рӯйхати олмонӣ онро намедид.
 * ⚠️ `\p{L}` бо парчами `u` НА — `tsc` (target < es6) онро рад мекунад ва
 * билди Vercel мешиканад.
 */
function bare(w: string): string {
  return w
    .toLowerCase()
    .replace(/[^a-zßà-ɏа-џؠ-يٱ-ۓ가-힣]/g, '');
}

/**
 * Занҷири «аз охир» (back-chaining) — §2.3.
 *
 * Ҷузъи охирини ҷумла — одатан душвортарин — аввал машқ мешавад, баъд
 * тамоми ҷумла.
 *
 * ⚠️ АЛГОРИТМ ИВАЗ ШУД. Дар §2.3 буриш аз рӯи ШУМОРАИ КАЛИМА мешуд
 * (`ceil(n/2)` ва `n−1`). Санҷиш бар ҳамаи 150 ҷумлаи база нишон дод, ки
 * **43% чунк бемаънӣ мебарояд**, чунки буриш ба мобайни таркиб меафтад:
 *
 *     «How much is it?»               → «much is it?»
 *     «Three glasses of water, please» → «of water, please.»
 *     «I want to buy that.»           → «to buy that.»
 *     «This is my mother.»            → «is my mother.»
 *
 * Ҳеҷ танзими `minChainWords`/`maxChainSteps` инро ҳал накард — бо `5/1`
 * фоизи бад ҳатто ба 56% бархост, чунки маҳз буриши «нисф» бадтарин аст.
 *
 * Ҳоло буриш аз рӯи МАРЗИ ТАРКИБ интихоб мешавад, бо се қоида:
 *
 *  1. чунк дар МОБАЙНИ таркиб сар нашавад — на бо пешоянд, феъли
 *     ёридиҳанда, пайвандак ё ҳиссача. Муайянкунанда (a/the/my/this)
 *     ИҶОЗАТ дорад: «a table for two?» оғози табиии ибора аст;
 *  2. таркиби «калимаи саволӣ + …» шикаста нашавад — «What time | is
 *     breakfast?» рад мешавад, вале «My | luggage is missing.» мемонад;
 *  3. адади пеш аз чунк ҷузъи ҳамон ибора аст ва ҲАМРОҲ карда мешавад —
 *     вагарна «He is ten years old.» → «years old.» мешуд ва маҳз рақам,
 *     ки мазмуни машқ аст, гум мегашт.
 *
 * Агар ягон номзад ин шартҳоро қонеъ накунад — занҷир НЕСТ. Ин қасдан
 * аст: чунки бад аз набудани чунк бадтар аст.
 *
 * ⚠️ РӮЙХАТҲО АНГЛИСӢ-АНД. Ҳоло тамоми мазмуни Speaking `en → tg` аст.
 * Пеш аз илова кардани бастаи `ru`/`de`/`ar` ин рӯйхатҳо бояд барои он
 * забон дароз карда шаванд, вагарна буриш дубора тасодуфӣ мешавад.
 */
/**
 * Калимаҳое, ки чунк бо онҳо САР ШУДА НАМЕТАВОНАД.
 *
 * ⚠️ Ин рӯйхат ҳамаи калимаҳои хизматӣ НЕСТ — танҳо онҳое, ки дар МОБАЙНИ
 * таркиб меистанд. Фарқ муҳим аст:
 *
 *   «a table for two?»  ← ибораи ХУБ: артикл + исм, оғози табиии таркиб
 *   «of water, please.» ← ибораи БАД: пешоянд аз исми пешинаш канда шуд
 *
 * Аввалин кӯшиши ман ҳарду хелро манъ мекард — натиҷа он шуд, ки
 * «This is my mother.» ва «I have a brother.» тамоман бе занҷир монданд,
 * ҳол он ки «my mother» ва «a brother» маҳз ҳамон чунке ҳастанд, ки
 * методика талаб мекунад. Пас муайянкунандаҳо ИҶОЗАТ доранд.
 */
const CHAIN_BLOCKED_STARTS = new Set<string>([
  // пешоянд — аз исми пешинаш канда мешавад
  'to', 'of', 'in', 'on', 'at', 'for', 'with', 'from', 'by', 'about', 'into',
  'onto', 'over', 'under', 'near', 'between', 'through', 'during', 'after',
  'before', 'without', 'within', 'across', 'behind', 'beside', 'around', 'like', 'than',
  // феъли ёридиҳанда ва модалӣ — хабарро аз фоил мешикананд
  'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'do', 'does', 'did',
  'have', 'has', 'had', 'will', 'would', 'shall', 'should', 'can', 'could',
  'may', 'might', 'must',
  // ҷонишини фоилӣ/мафъулӣ (на муайянкунанда)
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
  'myself', 'yourself', 'himself', 'herself', 'itself', 'ourselves', 'themselves',
  'there',
  // пайвандак
  'and', 'or', 'but', 'so', 'because', 'if', 'while', 'although', 'though', 'as',
  // миқдорномаи хабарӣ — «much is it?»
  'much', 'many', 'more', 'most',
  // ҳиссача
  'not', 'nt', 'up', 'down', 'off', 'out', 'too', 'very', 'just', 'only', 'also', 'please',
  // калимаҳои саволии АРАБӢ. Дар арабӣ савол бо онҳо САР мешавад, пас агар
  // чунк аз мобайн бо онҳо сар шавад, пешоянди пешин канда шудааст:
  // «مِنْ أَيْنَ أَنْتَ؟» → «أَيْنَ أَنْتَ؟» (ту куҷоӣ?) ✗ «аз» гум шуд.
  // «مَا»/«مَنْ» ин ҷо нестанд — ҳамшакли калимаҳои дигаранд.
  'أين', 'متى', 'كيف', 'ماذا', 'لماذا', 'كم',
  // пешояндҳои арабӣ, ки аз феъл/ибораи пешин ҷудо намешаванд:
  // «أَبْحَثُ عَنْ عَمَل» → «عَنْ عَمَل» ✗, «تُصْبِحُ عَلَى خَيْر» → «عَلَى خَيْر» ✗.
  'عن', 'على', 'إلى', 'الى',
  // ── РУСӢ (2026-09-20) ────────────────────────────────────────────────
  // ⚠️ Пешояндҳои русӣ ин ҷо ҚАСДАН НЕСТАНД: дар русӣ пешоянд ҳамеша маҳз
  // пеш аз ибораи худ меистад, пас «в Душанбе», «на работу» оғози ТАБИИИ
  // чунканд. Хатари русӣ дар ҷои дигар аст — ҷонишин ва феъли ёридиҳанда:
  //     «Меня зовут Али.»   → «зовут Али.»  ✗ ибораи «меня зовут» шикаст
  //     «Как вас зовут?»    → «вас зовут?»  ✗
  //     «У меня есть работа.» → «есть работа.» ✗ сохти «у меня есть» шикаст
  'я', 'ты', 'вы', 'он', 'она', 'оно', 'мы', 'они',
  'меня', 'тебя', 'вас', 'нас', 'мне', 'тебе', 'вам', 'нам', 'ему', 'ей', 'им',
  'себя', 'вами', 'нами', 'него', 'неё', 'нее', 'них',
  // феъли ёридиҳанда ва бандак
  'есть', 'был', 'была', 'было', 'были', 'буду', 'будешь', 'будет', 'будем', 'будут',
  // пайвандак ва ҳиссача
  'и', 'а', 'но', 'или', 'если', 'потому', 'же', 'ли', 'бы', 'тоже', 'также', 'ведь',
  // ҷузъи дуюми ибораи устувор — ҳеҷ гоҳ оғози чунк намешавад
  'зовут', 'пожаловать',
]);

/**
 * Калимаҳои саволӣ. ҚАСДАН дар рӯйхати боло НЕСТАНД: чунке, ки бо онҳо
 * САР мешавад, ҷумлаи мукаммал аст («where is the bank?»). Хатар вақте
 * ҳаст, ки чунк онҳоро дар ҚАФО мегузорад — қоидаи 2.
 */
const CHAIN_WH_WORDS = new Set<string>([
  'what', 'which', 'how', 'where', 'who', 'whom', 'whose', 'why', 'when',
  // русӣ: «Как | вас зовут?» ва «Сколько | вам лет?» набояд шикананд
  'как', 'что', 'где', 'когда', 'почему', 'зачем', 'кто', 'куда', 'откуда',
  'сколько', 'какой', 'какая', 'какое', 'какие', 'чей', 'чья',
]);

/**
 * Калимаҳое, ки аз исми ПАСИ худ ҷудо намешаванд (қоидаи 3).
 *
 * Агар чунк маҳз пас аз инҳо сар шавад, онҳо ба чунк ҲАМРОҲ карда
 * мешаванд — вагарна ибора нимкора мемонад:
 *     «He is ten years old.»        → «years old.»      ✗ рақам гум шуд
 *     «Can I have a table for two?» → «table for two?»  ✗ артикл гум шуд
 */
const CHAIN_GLUED_BEFORE = new Set<string>([
  // ададҳо
  'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'twenty', 'thirty', 'forty', 'fifty', 'hundred',
  // муайянкунанда
  'a', 'an', 'the', 'my', 'your', 'his', 'her', 'its', 'our', 'their',
  'this', 'that', 'these', 'those', 'some', 'any', 'no', 'another', 'other',
  'every', 'each', 'both', 'several', 'few', 'little', 'all',
  // ── РУСӢ (2026-09-20) ────────────────────────────────────────────────
  // Пешоянди русӣ аз ибораи ПАСИ худ ҷудо намешавад — вагарна чунк нимкора
  // мемонад: «Я живу на улице Рудаки.» → «улице Рудаки.» ✗ «на» гум шуд.
  'в', 'во', 'на', 'с', 'со', 'из', 'от', 'до', 'для', 'по', 'за', 'к', 'ко',
  'у', 'о', 'об', 'при', 'над', 'под', 'без', 'про', 'через', 'около',
  // соҳибият ва ишора
  'мой', 'моя', 'моё', 'мое', 'мои', 'моего', 'моему', 'моей', 'моим',
  'ваш', 'ваша', 'ваше', 'ваши', 'вашего', 'твой', 'твоя', 'твоё', 'твои',
  'наш', 'наша', 'наше', 'наши', 'его', 'её', 'ее', 'их',
  'этот', 'эта', 'это', 'эти', 'этом', 'тот', 'та', 'те', 'весь', 'вся', 'всё',
  'всего', 'всем',
  // адад
  'один', 'одна', 'одно', 'два', 'две', 'три', 'четыре', 'пять', 'шесть',
  'семь', 'восемь', 'девять', 'десять', 'двадцать', 'тридцать', 'сорок',
  'пятьдесят', 'сто', 'двое', 'трое',
  // сифатҳои сермаҳсул: «Доброе | утро» ва «новый | сосед» набояд шикананд
  'добрый', 'доброе', 'добрая', 'доброго', 'спокойной', 'хороший', 'хорошая',
  'хорошее', 'хорошего', 'новый', 'новая', 'новое', 'новые', 'большой',
  'большая', 'маленький', 'молодой', 'красивый', 'первый', 'последний',
  'русский', 'таджикский', 'рабочий', 'главный', 'следующий', 'прошлый',
]);

/**
 * Калимаҳои ИНКОР — ҷумлае, ки инҳоро дорад, чунк НАМЕГИРАД.
 *
 * 🔴 Аудити «10 донишҷӯи рақамӣ» (2026-09-06). Занҷир аз ОХИР бурида
 * мешавад, пас инкор, ки қариб ҳамеша дар НИМАИ АВВАЛ меистад, аз чунк
 * берун мемонад ва маънои ҷумла ба МУҚОБИЛ мегардад:
 *
 *     «I don't eat meat.»      → чунк «eat meat.»       ✗ гӯшт мехӯрам
 *     «There is no hot water.» → чунк «hot water.»       ✗ оби гарм ҳаст
 *     «The light does not work.» → чунк «not work.»      (аллакай баста)
 *     «No, thank you.»         → чунк «thank you.»       ✗ розӣ шудам
 *
 * Хонанда ин порчаро БО ОВОЗ такрор мекунад ва фавран пас аз он ҷумлаи
 * пурраро мегӯяд — яъне мо ӯро маҷбур мекунем аввал чизи баръаксро гӯяд.
 * Дар ошхона («гӯшт намехӯрам») ва дар меҳмонхона ин хатои хатарнок аст.
 *
 * ⚠️ Ҳамон қоидаи §2.3: чунки бад аз НАБУДАНИ чунк бадтар аст.
 */
const CHAIN_NEGATIONS = new Set<string>([
  'not', 'no', 'never', 'none', 'nothing', 'nobody', 'nowhere', 'neither',
  // шаклҳои кӯтоҳ — `bare()` апострофро мепартояд: don't → dont
  'dont', 'doesnt', 'didnt', 'isnt', 'arent', 'wasnt', 'werent', 'cant',
  'cannot', 'couldnt', 'wont', 'wouldnt', 'shouldnt', 'havent', 'hasnt',
  'hadnt', 'aint',
  // русӣ
  'не', 'нет', 'ни', 'никогда', 'ничего', 'никто', 'нельзя',
  // олмонӣ
  'nicht', 'nein', 'kein', 'keine', 'keinen', 'keiner', 'keinem', 'nie',
  'niemand', 'nichts', 'niemals',
  // арабӣ (бе ҳаракат — `bare()` онҳоро мепартояд). «مَا» ҚАСДАН нест:
  // он пеш аз ҳама калимаи саволӣ аст («مَا اسْمُكَ؟»).
  'لا', 'ولا', 'ليس', 'ليست', 'لست', 'لسنا', 'لم', 'لن', 'غير',
]);

/**
 * Рӯйхатҳои хоси ЯК забон — танҳо вақте `cfg.lang` ҳамон забон бошад.
 *
 * 🔴 Чаро ҷудо (2026-09-20): забонҳои алифбои ЛОТИНӢ бо ҳам бархӯрд
 * мекунанд. Калимаҳои олмонии `in`, `am`, `an`, `war`, `hat`, `man`, `was`
 * дар англисӣ маънои тамоман дигар доранд, ва вақте онҳоро ба рӯйхати
 * УМУМӢ андохтам, чунки англисӣ вайрон шуд:
 *     «I am tired now.» → «am tired now.» ✗ (`am` ҳамчун пешоянди олмонӣ
 *     часпид ва қоидаи «чунк бо феъли ёридиҳанда сар нашавад»-ро зер кард)
 * Русӣ ва арабӣ ин мушкилро НАДОРАНД — алифбошон дигар аст, пас онҳо дар
 * рӯйхатҳои умумӣ мемонанд.
 */
interface LangChainLists {
  blocked: Set<string>;
  wh: Set<string>;
  glued: Set<string>;
}

const LANG_LISTS: Record<string, LangChainLists> = {
  de: {
    // ҷонишин, феъли ёридиҳанда/модалӣ, пайвандак ва ҷузъи ибораи устувор:
    //   «Ich heiße Ali.»     → «heiße Ali.» ✗
    //   «Wie geht es Ihnen?» → «es Ihnen?»  ✗
    blocked: new Set<string>([
    'ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'man',
    'mich', 'dich', 'ihn', 'uns', 'euch', 'mir', 'dir', 'ihm',
    'ihnen', 'bin', 'bist', 'ist', 'sind', 'seid', 'war', 'waren',
    'sein', 'habe', 'hast', 'hat', 'haben', 'hatte', 'hatten', 'kann',
    'kannst', 'können', 'konnen', 'muss', 'müssen', 'mussen', 'will', 'willst',
    'wollen', 'möchte', 'möchten', 'mochte', 'mochten', 'soll', 'sollen', 'werde',
    'wird', 'werden', 'wurde', 'darf', 'dürfen', 'und', 'aber', 'oder',
    'dass', 'weil', 'wenn', 'denn', 'als', 'ob', 'nicht', 'kein',
    'nur', 'auch', 'sehr', 'schon', 'noch', 'doch', 'mal', 'zu',
    'heiße', 'heisse', 'heißen', 'heissen', 'heißt', 'heisst', 'geht',
    ]),
    // «Wie | heißen Sie?» ва «Woher | kommen Sie?» набояд шикананд
    wh: new Set<string>([
    'wie', 'was', 'wo', 'wann', 'warum', 'wer', 'wen', 'wem',
    'wessen', 'woher', 'wohin', 'welcher', 'welche', 'welches', 'wieviel',
    ]),
    // Пешоянд ва артикл аз исми ПАСИ худ ҷудо намешаванд:
    //   «Ich wohne in der Bahnhofstraße.» → «der Bahnhofstraße.» ✗
    glued: new Set<string>([
    'in', 'im', 'an', 'am', 'auf', 'aus', 'mit', 'von',
    'vom', 'zu', 'zum', 'zur', 'bei', 'beim', 'für', 'fur',
    'über', 'uber', 'unter', 'nach', 'vor', 'seit', 'ohne', 'um',
    'durch', 'gegen', 'neben', 'wegen', 'der', 'die', 'das', 'den',
    'dem', 'des', 'ein', 'eine', 'einen', 'einem', 'einer', 'eines',
    'mein', 'meine', 'meinen', 'meinem', 'meiner', 'dein', 'deine', 'sein',
    'seine', 'unser', 'unsere', 'euer', 'eure', 'dieser', 'diese', 'dieses',
    'diesen', 'diesem', 'jeder', 'jede', 'jedes', 'alle', 'alles', 'viele',
    'keine', 'keinen', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'funf',
    'sechs', 'sieben', 'acht', 'neun', 'zehn', 'zwanzig', 'dreißig', 'dreissig',
    'vierzig', 'fünfzig', 'hundert', 'guten', 'gute', 'gutes', 'guter', 'schönen',
    'schonen', 'schöne', 'schone', 'neue', 'neuen', 'neuer', 'großen', 'grossen',
    'große', 'grosse', 'kleine', 'erste', 'ersten', 'letzte', 'letzten', 'deutsche',
    'deutschen',
    ]),
  },
};

const isBlockedStart = (w: string, cfg: EngineConfig) =>
  CHAIN_BLOCKED_STARTS.has(w) || (cfg.lang ? !!LANG_LISTS[cfg.lang]?.blocked.has(w) : false);
const isWhWord = (w: string, cfg: EngineConfig) =>
  CHAIN_WH_WORDS.has(w) || (cfg.lang ? !!LANG_LISTS[cfg.lang]?.wh.has(w) : false);
const isGluedBefore = (w: string, cfg: EngineConfig) =>
  CHAIN_GLUED_BEFORE.has(w) || (cfg.lang ? !!LANG_LISTS[cfg.lang]?.glued.has(w) : false);

export function buildChain(text: string, cfg: EngineConfig): string[] {
  // ⚠️ `0` = чунк НЕСТ. Бе ин санҷиш ҳалқаи поён як чункро илова мекард ва
  // танҳо БАЪД `out.length >= 0`-ро медид.
  if (cfg.maxChainSteps <= 0) return [];
  const w = splitWords(text.trim());
  const n = w.length;
  if (n < cfg.minChainWords) return [];

  // Инкор → занҷир тамоман нест (ниг. [CHAIN_NEGATIONS]).
  if (w.some((x) => CHAIN_NEGATIONS.has(bare(x)))) return [];

  const full = w.join(' ');
  const out: string[] = [];

  // Аз кӯтоҳтарин номзад сар мекунем — чунки аввал бояд хурдтарин
  // порчаи маънодор бошад.
  for (let len = 2; len < n; len++) {
    let start = n - len;

    if (isBlockedStart(bare(w[start]), cfg)) continue; // қоидаи 1
    if (start > 0 && isWhWord(bare(w[start - 1]), cfg)) continue; // қоидаи 2

    // қоидаи 3 — муайянкунанда/адади пешомадаро ба чунк мечаспонем
    const plain = w.slice(start).join(' ');
    let glued = start;
    while (glued > 0 && isGluedBefore(bare(w[glued - 1]), cfg)) glued--;

    // Агар часпондан тамоми ҷумларо диҳад, шакли бечаспро мегирем:
    // «The bill, please.» набояд ба худи ҷумла табдил ёбад.
    let seg = w.slice(glued).join(' ');
    if (seg === full) seg = plain;
    if (seg === full) continue; // чунк набояд тамоми ҷумла бошад
    if (!out.includes(seg)) out.push(seg);
    if (out.length >= cfg.maxChainSteps) break;
  }

  return out;
}

/** Қолаб бо ҷузъи иваз — §2.4. Калимаи ОХИРИН иваз мешавад. */
export function buildSwaps(text: string, swaps: string[], cfg: EngineConfig): string[] {
  if (swaps.length < 2) return [];
  const w = splitWords(text.trim());
  if (w.length < 2) return [];
  const head = w.slice(0, -1).join(' ');
  return swaps.slice(0, cfg.maxSwapSteps).map((s) => `${head} ${s}`);
}

/** Як қадами банақшагирифта — ҳанӯз ба `Step` табдил наёфта. */
interface PlanEntry {
  kind: StepKind;
  /** Матни ҳадафи ҳамин қадам. Дар M1 ҳамеша матни худи воҳид. */
  target: string;
  /** Чанд қадам ПАС аз ҷои табиии худ гузошта шавад. `0` = фавран. */
  delay: number;
  variant: number;
}

/**
 * Нақшаи як воҳид — кадом қадамҳо ва бо кадом таъхир.
 *
 * ⚠️ M1 маҳз ҲАМОН қадамҳоеро месозад, ки M0 месохт. Фарқ танҳо дар
 * майдони `delay` аст. `chunk` ва `swap` (§2.5) ҚАСДАН ин ҷо НЕСТАНД —
 * онҳо қадами 7 (M5) мебошанд ва навъҳои НАВ илова мекунанд, на танҳо
 * тартибро иваз.
 */
function planItem(item: EngineItem, cfg: EngineConfig): PlanEntry[] {
  const text = item.text.trim();
  const wc = splitWords(text).length;

  // Режими v2 = клиент навъҳои навро мефаҳмад (§10.2).
  const v2 = cfg.allowedKinds.includes('chunk') || cfg.allowedKinds.includes('swap');

  const out: PlanEntry[] = [];

  // ── КАЛИМА: зинаи ДУҚАДАМА. Дар ҳарду режим якхела. ──────────────────
  //
  // 🔴 2026-09-02: қадами МИЁНА (`wordEcho`) аз рӯи қарори соҳиби маҳсулот
  // бардошта шуд. Он ҳамон матнро дубора нишон медод — танҳо талаффуз ва
  // маънӣ пинҳон буданд — ва хонанда як калимаро СЕ бор мегуфт. Ҳоло:
  // «бо ёрии пурра бигӯ» → «аз тарҷума бигӯ».
  if (item.kind === 'word') {
    out.push({ kind: 'say', target: text, delay: 0, variant: 0 });
    out.push({ kind: 'translate', target: text, delay: cfg.gap, variant: 0 });
    return out.filter((e) => cfg.allowedKinds.includes(e.kind));
  }

  // ── ҶУМЛА ─────────────────────────────────────────────────────────────
  if (!v2) {
    // Режими КӮҲНА (ev = 1) — айнан рафтори M1, бе ягон қадами иловагӣ.
    if (wc > cfg.maxSlotWords) {
      return [{ kind: 'say', target: text, delay: 0, variant: 0 }];
    }
    return [{ kind: 'translate', target: text, delay: 0, variant: 0 }];
  }

  // Режими v2 — §2.5.
  //
  // 1. Занҷир (аз охир): дастӣ бошад — ҳамон, вагарна худкор.
  const chain = (item.chainOverride?.length ? item.chainOverride : buildChain(text, cfg));
  chain.forEach((seg, i) =>
    out.push({ kind: 'chunk', target: seg, delay: 0, variant: i }),
  );

  // 2. Тамоми ҷумла бо матни намоён.
  out.push({ kind: 'say', target: text, delay: 0, variant: 0 });

  // 3. Санҷиш. ҲАЛЛИ P5: ҷумлаи дароз ҳам санҷида мешавад — вале бе слот.
  out.push({
    kind: wc <= cfg.maxSlotWords ? 'translate' : 'recall',
    target: text,
    delay: cfg.gap,
    variant: 0,
  });

  // 4. Қолаб бо ҷузъи иваз.
  buildSwaps(text, item.swaps ?? [], cfg).forEach((sw, i) =>
    out.push({ kind: 'swap', target: sw, delay: cfg.gap * 2, variant: i }),
  );

  return out.filter((e) => cfg.allowedKinds.includes(e.kind));
}

/** `PlanEntry` + воҳид → `Step`. Мазмун АЙНАН ҳамон, ки M0 месохт. */
function materialize(
  e: PlanEntry,
  item: EngineItem,
  _cfg: EngineConfig,
  opts: EngineOptions,
): Step {
  const text = e.target;
  const translation = item.translation.trim();
  const { repeat } = opts;

  // Нишон — ҳамон қоидаҳои M0, ки ҳам аз навъи ҚАДАМ ва ҳам аз навъи
  // ВОҲИД вобастаанд.
  let badge: Badge;
  if (e.kind === 'recall') {
    badge = 'remember';
  } else if (e.kind === 'say') {
    badge = repeat ? 'remember' : item.kind === 'word' ? 'newWord' : 'none';
  } else if (e.kind === 'translate') {
    // Қадами сеюми зинаи калима ҳеҷ гоҳ нишон намегирад.
    badge = item.kind === 'word' ? 'none' : repeat ? 'remember' : 'none';
  } else {
    badge = 'none';
  }

  return {
    stepId: `${item.id}:${e.kind}:${e.variant}`,
    itemId: item.id,
    kind: e.kind,
    prompt: e.kind === 'translate' || e.kind === 'recall' ? translation : '',
    target: text,
    translation,
    literal: item.literal?.trim() ?? null,
    note: item.note?.trim() ?? null,
    cue: item.cue?.trim() ?? null,
    cueTranslation: item.cueTranslation?.trim() ?? null,
    audioUrl: item.audioUrl ?? null,
    badge,
    targetWords: splitWords(text),
    showSlots: e.kind === 'translate' || e.kind === 'swap',
    timerMs: e.kind === 'translate' || e.kind === 'swap' ? 4000 : e.kind === 'recall' ? 5000 : null,
  };
}
/**
 * Чанд қадам байни ду қадами ПАЙДАРПАЙИ як воҳид лозим аст.
 *
 * Аз худи `delay`-ҳои §2.5 ҳисоб мешавад: зинаи калима `0 → gap → 2·gap`
 * медиҳад, пас фосилаи ҳарду гузариш `gap` мешавад. Барои `chunk`-ҳо, ки
 * ҳама `delay: 0` доранд, фосила `0` мебарояд — маҳз ҳамон истиснои
 * инварианти 1 дар §2.7, бе ягон шарти махсус.
 */
function spacingOf(entries: PlanEntry[], k: number): number {
  return k === 0 ? 0 : Math.max(0, entries[k].delay - entries[k - 1].delay);
}

/**
 * Қадамҳои як нишаст — банақшагирии ФОСИЛАДОР (M1).
 *
 * ⚠️ ЧАРО НЕ АЙНАН §2.6: алгоритми он ҷо дар ОХИРИ дарс вайрон мешавад.
 * `while (pending.length) { out.push(...) }` навбатро БЕ назардошти
 * `dueAt` холӣ мекунад, пас агар воҳиди охирини дарс калима бошад, се
 * қадами он пайиҳам меафтанд ва инварианти 1 вайрон мешавад — маҳз
 * ҳамон P1, ки M1 бояд ҳал кунад. Дар fixture-и 01 (чор калима) ҳамаи
 * се қадами воҳиди охирин, дар 05 ду қадам чунин шуданд.
 *
 * Сабаби решагӣ: `flush` навбатро хеле барвақт холӣ мекунад, пас то
 * воҳиди охирин ҳеҷ чиз намемонад, ки байни қадамҳои он гузошта шавад.
 *
 * ИВАЗ: ба ҷои навбати вақтӣ — банақшагирии «хатсайр»-ӣ. Ҳар воҳид як
 * хатсайр (`lane`) аст ва дар ҳар ҷойгоҳ маҳз ЯК қадам интихоб мешавад:
 *
 *   • ҳеҷ гоҳ ҳамон воҳиди қадами гузашта (инварианти 1);
 *   • ҳеҷ гоҳ наздиктар аз фосилаи талабшуда (инварианти 2);
 *   • аз ҳама пеш — хатсайри аз ҳама ПЕШРАФТА, то воҳид пеш аз оғози
 *     воҳидҳои нав ба охир расад (вагарна дарси 12-воҳида ба «12 say,
 *     баъд 12 wordEcho…» табдил меёфт ва фосила ба фаромӯшӣ мегузашт);
 *   • дар як вақт танҳо ЯК воҳиди нав кушода мешавад.
 *
 * Натиҷа детерминистӣ аст: ҳеҷ тасодуф, баробарҳо бо тартиби вуруд.
 */
export function generateSteps(
  items: EngineItem[],
  cfg: EngineConfig = DEFAULT_CONFIG,
  opts: EngineOptions = { repeat: false },
): Step[] {
  const steps = generateStepsInner(items, cfg, opts);

  // Аудиои тайёри ҲАМСӮҲБАТ ба ҳар қадаме, ки ҳамон `cue`-ро нишон медиҳад —
  // на танҳо ба навбатҳои нақшбозӣ. Бе ин «бигӯ»/«тарҷума» сатри духтурро
  // бо овози телефон мехонд, гарчи файли тайёр дар база буд (26.09.2026).
  const cueAudio = new Map<string, { cue: string; url: string }>();
  for (const i of [...items, ...(opts.review ?? [])]) {
    const url = i.cueAudioUrl?.trim();
    const cue = i.cue?.trim();
    if (url && cue) cueAudio.set(i.id, { cue, url });
  }
  if (cueAudio.size === 0) return steps;
  return steps.map((st) => {
    const a = cueAudio.get(st.itemId);
    return a && !st.cueAudioUrl && st.cue?.trim() === a.cue
      ? { ...st, cueAudioUrl: a.url }
      : st;
  });
}

function generateStepsInner(
  items: EngineItem[],
  cfg: EngineConfig,
  opts: EngineOptions,
): Step[] {
  const stage = opts.stage ?? null;

  // ── Нақшбозӣ ва миссия (ev ≥ 3) ─────────────────────────────────────
  if ((stage === 'dialogue' || stage === 'mission') && cfg.allowedKinds.includes('turn')) {
    const d = generateDialogueSteps(items, stage, opts);
    if (d.length) return d;
    // Дарси «муколама» бе қадами `turn` — ба роҳи оддӣ меафтем.
  }

  // ── Зинаҳои осон: ҷумлаҳо кӯтоҳанд, пас чунк лозим нест ─────────────
  //
  // Дар `words`/`chunks` думи «аз хотира» ҳам нест: дарси аввал бояд
  // кӯтоҳ ва бомуваффақият бошад (ҳадафи ~90% қабул дар кӯшиши аввал).
  if (stage === 'words' || stage === 'chunks' || stage === 'sentences') {
    cfg = {
      ...cfg,
      maxChainSteps: 0,
      // `swaps` дар зинаҳо «Иваз кун» (`pattern`) мешаванд, на `swap`-и кӯҳна.
      maxSwapSteps: 0,
      recallTail: stage === 'sentences' ? cfg.recallTail : 0,
    };
    // «Ҷавоби худат» танҳо барои клиенти ev ≥ 3 — клиенти кӯҳна
    // «Меня зовут ___»-ро айнан талаб мекард.
    if (!cfg.allowedKinds.includes('own')) {
      items = items.filter((i) => i.kind !== 'own');
    }
    if (cfg.allowedKinds.includes('heard')) {
      return composeSessionA(items, cfg, opts);
    }
  }

  const lanes = items.map((item) => ({
    item,
    entries: planItem(item, cfg),
    next: 0,
    lastPos: Number.NEGATIVE_INFINITY,
  }));

  const total = lanes.reduce((n, l) => n + l.entries.length, 0);
  const out: Step[] = [];
  let opened = 0; // чанд воҳид аллакай сар шудааст

  // ── Думи «санҷиши хотира» ПЕШАКӢ ҳисоб мешавад ───────────────────────
  //
  // ЧАРО пеш аз ҳалқа, на баъд: дар охири дарс метавонад ҳолате ояд, ки
  // танҳо қадамҳои ЯК воҳид монда бошанд ва фосила сохтан ғайриимкон
  // гардад. Дар fixture-и 05 маҳз чунин шуд: воҳиди 10 калима аст
  // (се қадам) ва пас аз он ҳамагӣ як ҷумла мондааст — се такрори як
  // воҳид бо як ҷудокунанда ҷойгир намешавад.
  //
  // Қадами `recall` ба воҳиди ДИГАР тааллуқ дорад, пас маҳз ҳамон
  // ҷудокунандаи гумшуда аст. Он ҳамчун чораи ОХИРИН кашида мешавад —
  // вагарна такрор аз охири дарс мебаромад ва маънои худро гум мекард.
  const recallQueue = items.filter(
    (i) => i.kind !== 'word' && splitWords(i.text.trim()).length <= cfg.maxSlotWords,
  );
  const recallTail =
    // ⚠️ `recallTail > 0` ҲАТМӢ: `slice(-0)` дар JS ТАМОМИ рӯйхатро медиҳад,
    // на холӣ — зинаҳои осон (`recallTail: 0`) се «аз хотира» мегирифтанд.
    cfg.recallTail > 0 && recallQueue.length >= cfg.recallMinPool
      ? recallQueue.slice(-cfg.recallTail)
      : [];

  const pushRecall = (item: EngineItem) =>
    out.push(
      materialize(
        { kind: 'recall', target: item.text.trim(), delay: 0, variant: 99 },
        item,
        cfg,
        opts,
      ),
    );

  // ⚠️ Шумориши ҶУДО: `out` метавонад қадами `recall`-и пешакикашидашударо
  // ҳам дошта бошад, пас `out.length` ченаки пешрафти хатсайрҳо НЕСТ.
  let placed = 0;

  while (placed < total) {
    const pos = out.length;
    const lastId = pos > 0 ? out[pos - 1].itemId : null;
    // Танҳо воҳидҳои саршуда + ЯК воҳиди навбатӣ.
    const limit = Math.min(opened + 1, lanes.length);

    let best = -1; // ҳарду шарт иҷро мешаванд
    let noGap = -1; // инварианти 1 иҷро, фосила нарасид
    let forced = -1; // ҳатто инварианти 1 иҷро намешавад

    for (let i = 0; i < limit; i++) {
      const l = lanes[i];
      if (l.next >= l.entries.length) continue;

      const okAdjacent = l.item.id !== lastId;
      const okSpacing =
        l.next === 0 || pos - l.lastPos >= spacingOf(l.entries, l.next);

      if (okAdjacent && okSpacing) {
        if (best === -1 || l.next > lanes[best].next) best = i;
      } else if (okAdjacent) {
        if (noGap === -1 || l.next > lanes[noGap].next) noGap = i;
      } else if (forced === -1) {
        forced = i;
      }
    }

    // Ҳеҷ номзади бехатар нест → пеш аз шикастани инварианти 1 кӯшиш
    // мекунем як қадами `recall`-и воҳиди ДИГАРро ҳамчун ҷудокунанда
    // гирем. Ин ягона роҳи наҷоти охири дарс аст.
    if (best === -1 && noGap === -1 && forced !== -1) {
      const r = recallTail.findIndex((i) => i.id !== lastId);
      if (r !== -1) {
        const [item] = recallTail.splice(r, 1);
        pushRecall(item);
        continue;
      }
    }

    // `forced` танҳо вақте мемонад, ки ғайр аз ҳамон воҳид дигар ҳеҷ
    // қадам намондааст (мас. дарсе, ки ҲАМАГӢ як калима дорад). Он гоҳ
    // фосила сохтан ФИЗИКӢ ғайриимкон аст.
    const idx = best !== -1 ? best : noGap !== -1 ? noGap : forced;
    if (idx === -1) break;

    const lane = lanes[idx];
    if (lane.next === 0) opened = Math.max(opened, idx + 1);
    out.push(materialize(lane.entries[lane.next], lane.item, cfg, opts));
    lane.lastPos = pos;
    lane.next++;
    placed++;
  }

  // ── Он чи аз думи «санҷиши хотира» боқӣ монд ───────────────────────────
  //
  // Одатан ҳама, чунки кашидани пешакӣ чораи ниҳоист. Ҳамон қоидаи
  // ҳамсоягӣ ин ҷо низ риоя мешавад.
  while (recallTail.length) {
    const lastId = out.length ? out[out.length - 1].itemId : null;
    let k = recallTail.findIndex((i) => i.id !== lastId);
    if (k === -1) k = 0; // чорае нест
    const [item] = recallTail.splice(k, 1);
    pushRecall(item);
  }

  return out;
}

/**
 * «НИШАСТИ А» (26.09.2026) — зинаҳои `words` / `chunks` / `sentences`:
 *
 *   1. «Кадом ибораро шунидед?» — гӯш кардан дар АВВАЛ (аз ибораҳои кӯҳна,
 *      агар бошанд — яъне гӯш кардан ҳамзамон такрор аст);
 *   2. ибораҳои НАВ — ҳамон зинаи «бигӯ → аз маъно гӯй» (банақшагирии
 *      фосиладори ҳозира);
 *   3. то 3 ибораи КӮҲНА — «аз маъно гӯй», нишони «ба ёд оред»;
 *   4. «Иваз кун» — аз ҷумлаҳое, ки `swaps` доранд;
 *   5. «Ҷавоби худат»;
 *   6. думи «аз хотира» (танҳо `sentences`).
 */
function composeSessionA(
  items: EngineItem[],
  cfg: EngineConfig,
  opts: EngineOptions,
): Step[] {
  const drill = items.filter((i) => i.kind === 'word' || i.kind === 'sentence');
  const owns = items.filter((i) => i.kind === 'own');
  const review = (opts.review ?? []).filter(
    (i) => (i.kind === 'word' || i.kind === 'sentence') && i.text.trim(),
  );

  // Ибораҳои нав — ҳамон банақшагирии фосиладор, бе думи «аз хотира» (он
  // дар охири нишаст меистад).
  const lanes = generateSteps(drill, cfg, { ...opts, stage: null, review: [] });
  const main = lanes.filter((s) => s.kind !== 'recall');
  const recalls = lanes.filter((s) => s.kind === 'recall');

  const out: Step[] = [];

  // 1. Гӯш кардан.
  const heard = buildHeard(review.length >= 3 ? review : drill, opts);
  if (heard) out.push(heard);

  // 2. Нав.
  out.push(...main);

  // 3. Кӯҳна — «аз маъно гӯй».
  for (const r of review.slice(-3)) {
    out.push({
      ...materialize({ kind: 'translate', target: r.text.trim(), delay: 0, variant: 7 }, r, cfg, opts),
      badge: 'remember',
    });
  }

  // 4. «Иваз кун».
  for (const it of drill) {
    out.push(...buildPatterns(it, opts));
  }

  // 5. «Ҷавоби худат».
  for (const it of owns) {
    const text = it.text.trim();
    if (!text.includes(OWN_SLOT)) continue;
    out.push({
      stepId: `${it.id}:own:0`,
      itemId: it.id,
      kind: 'own',
      prompt: it.intent?.trim() || it.translation.trim(),
      target: text,
      translation: it.translation.trim(),
      literal: it.literal?.trim() ?? null,
      note: it.note?.trim() ?? null,
      cue: it.cue?.trim() ?? null,
      cueTranslation: it.cueTranslation?.trim() ?? null,
      audioUrl: it.audioUrl ?? null,
      badge: opts.repeat ? 'remember' : 'none',
      targetWords: splitWords(text),
      showSlots: false,
      timerMs: null,
      intent: it.intent?.trim() || it.translation.trim(),
      cueAudioUrl: it.cueAudioUrl?.trim() || undefined,
      intentAudioUrl: it.intentAudioUrl?.trim() || undefined,
    });
  }

  // 6. «Аз хотира».
  out.push(...recalls);
  return out;
}

/** «Кадом ибораро шунидед?» аз се ибораи гуногун. `null` — ибора кам аст. */
function buildHeard(pool: EngineItem[], opts: EngineOptions): Step | null {
  const texts: string[] = [];
  const src: EngineItem[] = [];
  for (const i of pool) {
    const t = i.text.trim();
    if (t && !texts.some((x) => x.toLowerCase() === t.toLowerCase())) {
      texts.push(t);
      src.push(i);
    }
  }
  if (texts.length < 3) return null;

  // Ибора ва ҷои ҷавоб аз РАҚАМИ ДАРС гардон мешаванд. Пештар ҷой аз шумораи
  // ҳавз ҳисоб мешуд — ҳавз қариб ҳамеша 6 ибора аст ва ҷавоб дар 4 аз 6
  // дарс ЯКУМ меистод, ва дарсҳои 1–2 ҳамон калимаро мепурсиданд (санҷиши
  // бастаи «Назди духтур», доми «ҷавоб ҳамеша якум»).
  const pos = Math.max(0, opts.position ?? 0);
  const n = texts.length;
  const k = n - 1 - (pos % n);
  const options = [texts[(k + 1) % n], texts[(k + 2) % n]];
  const answerIndex = pos % 3;
  options.splice(answerIndex, 0, texts[k]);

  return {
    stepId: `${src[k].id}:heard:a`,
    itemId: '',
    kind: 'heard',
    prompt: '',
    target: texts[k],
    translation: src[k].translation.trim(),
    literal: null,
    note: null,
    cue: null,
    cueTranslation: null,
    audioUrl: src[k].audioUrl ?? null,
    badge: opts.repeat ? 'remember' : 'none',
    targetWords: [],
    showSlots: false,
    timerMs: null,
    options,
    answerIndex,
  };
}

/**
 * «Иваз кун»: ҷумлаи «У меня болит голова.» бо `swaps`
 * `["голова|сар", "живот|шикам", "зуб|дандон"]` → қолаби «У меня болит ___.»
 * ва ду қадам: бо «шикам» ва бо «дандон» (варианти ҲОЗИРА аллакай гуфта шуд).
 *
 * Калимаи ивазшаванда — калимаи ОХИРИН (бе аломати китобат), ҳамон қоидаи
 * `buildSwaps`.
 */
function buildPatterns(it: EngineItem, opts: EngineOptions): Step[] {
  const options = parsePatternOptions(it.swaps);
  if (options.length < 2) return [];
  const words = splitWords(it.text.trim());
  if (words.length < 2) return [];

  const last = words[words.length - 1];
  const m = last.match(/^(.*?)([.!?…,]*)$/);
  const lastBare = m ? m[1] : last;
  const tail = m ? m[2] : '';
  const head = words.slice(0, -1).join(' ');

  const out: Step[] = [];
  options.forEach((o, askIndex) => {
    // Варианте, ки худи ҷумла аст, аллакай машқ шуд — такрор намекунем.
    if (o.text.toLowerCase() === lastBare.toLowerCase()) return;
    if (out.length >= 2) return;
    const target = `${head} ${o.text}${tail}`;
    out.push({
      stepId: `${it.id}:pattern:${askIndex}`,
      itemId: it.id,
      kind: 'pattern',
      prompt: o.meaning,
      target,
      translation: it.translation.trim(),
      literal: null,
      note: it.note?.trim() ?? null,
      cue: null,
      cueTranslation: null,
      // Аудиои тайёр ба ҷумлаи АСЛӢ тааллуқ дорад — вариант бо TTS.
      audioUrl: null,
      badge: opts.repeat ? 'remember' : 'none',
      targetWords: splitWords(target),
      showSlots: false,
      timerMs: null,
      patternHead: head,
      patternTail: tail,
      patternOptions: options,
      askIndex,
    });
  });
  return out;
}

/**
 * Қадамҳои дарси НАҚШБОЗӢ (`dialogue`) ё МИССИЯ (`mission`).
 *
 *   dialogue: гӯш кардани муколамаи пурра → «кадом ибораро шунидӣ?» ×2
 *             → ҳар навбат бо корти НИЯТ;
 *   mission:  ҳар навбат БЕ корти ният, бо рӯйхати ҳадафҳо.
 *
 * Функсияи ТОЗА ва детерминистӣ, мисли тамоми файл: вариантҳои «шунидӣ»
 * бо гардиши собит интихоб мешаванд, на тасодуфӣ.
 */
function generateDialogueSteps(
  items: EngineItem[],
  stage: 'dialogue' | 'mission',
  opts: EngineOptions,
): Step[] {
  const turns = items.filter(
    (i) => i.kind === 'turn' && !!i.cue?.trim() && !!i.text.trim(),
  );
  if (!turns.length) return [];

  const out: Step[] = [];
  const badge: Badge = opts.repeat ? 'remember' : 'none';

  const blank = (kind: StepKind, stepId: string): Step => ({
    stepId,
    itemId: '',
    kind,
    prompt: '',
    target: '',
    translation: '',
    literal: null,
    note: null,
    cue: null,
    cueTranslation: null,
    audioUrl: null,
    badge,
    targetWords: [],
    showSlots: false,
    timerMs: null,
  });

  if (stage === 'dialogue') {
    // 1. Муколамаи пурра — хонанда аввал ГӮШ мекунад.
    out.push({
      ...blank('listen', `${turns[0].id}:listen:0`),
      lines: turns.flatMap((t) => [
        {
          who: 'partner' as const,
          text: (t.cue ?? '').trim(),
          translation: t.cueTranslation?.trim() ?? '',
          // Аудиои тайёр агар бошад; холӣ = TTS-и дастгоҳ.
          audioUrl: t.cueAudioUrl?.trim() ?? '',
        },
        {
          who: 'me' as const,
          text: t.text.trim(),
          translation: t.translation.trim(),
          audioUrl: t.audioUrl ?? '',
        },
      ]),
    });

    // 2. «Кадом ибораро шунидӣ?» — танҳо агар 3 ибораи гуногун бошад.
    const texts = turns.map((t) => t.text.trim());
    const n = turns.length;
    const picks = [0, Math.floor(n / 2)].filter((k, i, a) => a.indexOf(k) === i);
    for (const k of picks) {
      const t = turns[k];
      // Ду ибораи ДИГАР, ки бо матни ҳадаф якхела нестанд.
      const others: string[] = [];
      for (let j = 1; j < n && others.length < 2; j++) {
        const o = texts[(k + j) % n];
        if (
          o.toLowerCase() !== texts[k].toLowerCase() &&
          !others.some((x) => x.toLowerCase() === o.toLowerCase())
        ) {
          others.push(o);
        }
      }
      if (others.length < 2) continue;
      // Ҷои ҷавоби дуруст гардон аст, то ҳамеша «якум» набошад
      // (доми «ҷавоб ҳамеша якум», ниг. курси арабӣ).
      const answerIndex = (k + Math.max(0, opts.position ?? 0)) % 3;
      const options = [...others];
      options.splice(answerIndex, 0, texts[k]);
      out.push({
        ...blank('heard', `${t.id}:heard:${k}`),
        target: texts[k],
        translation: t.translation.trim(),
        audioUrl: t.audioUrl ?? null,
        options,
        answerIndex,
      });
    }
  }

  // 3. Навбатҳои нақшбозӣ.
  const goals =
    stage === 'mission'
      ? turns.map((t) => t.intent?.trim() || t.translation.trim())
      : undefined;

  turns.forEach((t, i) => {
    const text = t.text.trim();
    const intent = t.intent?.trim() || t.translation.trim();
    out.push({
      stepId: `${t.id}:turn:${i}`,
      itemId: t.id,
      kind: 'turn',
      // `prompt` = нияти забони модарӣ — клиенти ev ≥ 3 онро дар корт мекашад.
      prompt: intent,
      target: text,
      translation: t.translation.trim(),
      literal: t.literal?.trim() ?? null,
      note: t.note?.trim() ?? null,
      cue: t.cue?.trim() ?? null,
      cueTranslation: t.cueTranslation?.trim() ?? null,
      audioUrl: t.audioUrl ?? null,
      badge,
      targetWords: splitWords(text),
      showSlots: false,
      timerMs: null,
      accepts: (t.accepts ?? []).map((a) => a.trim()).filter(Boolean),
      intent,
      cueAudioUrl: t.cueAudioUrl?.trim() || undefined,
      // Дар миссия ният ПИНҲОН аст — овози он ҳам намеравад.
      intentAudioUrl:
        stage === 'mission' ? undefined : t.intentAudioUrl?.trim() || undefined,
      hideIntent: stage === 'mission',
      goals,
      goalIndex: stage === 'mission' ? i : undefined,
    });
  });

  return out;
}

/**
 * Қадами дохилӣ → объекте, ки ба клиент меравад.
 *
 * ⚠️ ТАРТИБИ КАЛИДҲО МУҲИМ АСТ. `JSON.stringify` тартиби гузоштанро нигоҳ
 * медорад, ва меъёри қабули M0 маҳз баробарии БАЙТӢ бо baseline аст. Дар
 * формати ҷорӣ ЧОР шакли гуногун ҳаст — на як:
 *
 *   say / wordEcho → kind, badge, target, itemId, translit, meaning,
 *                    grammar, audioUrl, cue, cueTranslation        (10)
 *   translate      → kind, badge, prompt, targetWords, itemId, translit,
 *                    meaning, grammar, audioUrl, cue, cueTranslation (11)
 *   recall         → kind, badge, itemId, prompt, target, targetWords,
 *                    translit, meaning, grammar, audioUrl           (10)
 */
export function toWire(s: Step, ev: number): WireStep {
  const translit = s.literal ?? '';
  const meaning = s.translation;
  const grammar = s.note ?? '';
  const audioUrl = s.audioUrl ?? '';
  const cue = s.cue ?? '';
  const cueTranslation = s.cueTranslation ?? '';

  let wire: WireStep;

  switch (s.kind) {
    // `chunk` шакли `say`-ро мегирад: матн намоён, барнома мехонад.
    case 'chunk':
      if (ev < 2) {
        throw new Error('toWire: «chunk» танҳо аз ev≥2 (§10.2)');
      }
    // fallthrough — ҳамон 10 калид
    case 'say':
      wire = {
        kind: s.kind,
        badge: s.badge,
        target: s.target,
        itemId: s.itemId,
        translit,
        meaning,
        grammar,
        audioUrl,
        cue,
        cueTranslation,
      };
      break;

    // `swap` шакли `translate`-ро мегирад: слотҳо бо қолаб.
    case 'swap':
      if (ev < 2) {
        throw new Error('toWire: «swap» танҳо аз ev≥2 (§10.2)');
      }
    // fallthrough — ҳамон 11 калид
    case 'translate':
      wire = {
        kind: s.kind,
        badge: s.badge,
        prompt: s.prompt,
        targetWords: s.targetWords,
        itemId: s.itemId,
        translit,
        meaning,
        grammar,
        audioUrl,
        cue,
        cueTranslation,
      };
      break;

    case 'recall':
      // ⚠️ ҚАСДАН БЕ `cue` ва `cueTranslation`.
      //
      // Ин боги МАВҶУДА аст, на интихоби тарҳ: сохтани `recall` дар
      // `lesson/route.ts:251–265` онҳоро намегузошт, дар ҳоле ки
      // `toRecall()` дар `review/route.ts:67–85` мегузорад. M0 рафторро
      // ИВАЗ НАМЕКУНАД — ислоҳ қарори алоҳида аст.
      wire = {
        kind: s.kind,
        badge: s.badge,
        itemId: s.itemId,
        prompt: s.prompt,
        target: s.target,
        targetWords: s.targetWords,
        translit,
        meaning,
        grammar,
        audioUrl,
      };
      break;

    // ── ev ≥ 3: курси вазъиятҳо ─────────────────────────────────────────
    case 'listen':
      if (ev < 3) throw new Error('toWire: «listen» танҳо аз ev≥3');
      wire = {
        kind: s.kind,
        badge: s.badge,
        itemId: s.itemId,
        translit,
        meaning,
        grammar,
        audioUrl,
        lines: s.lines ?? [],
      };
      break;

    case 'heard':
      if (ev < 3) throw new Error('toWire: «heard» танҳо аз ev≥3');
      wire = {
        kind: s.kind,
        badge: s.badge,
        target: s.target,
        itemId: s.itemId,
        translit,
        meaning,
        grammar,
        audioUrl,
        options: s.options ?? [],
        answerIndex: s.answerIndex ?? 0,
      };
      break;

    case 'turn':
      if (ev < 3) throw new Error('toWire: «turn» танҳо аз ev≥3');
      wire = {
        kind: s.kind,
        badge: s.badge,
        prompt: s.prompt,
        target: s.target,
        targetWords: s.targetWords,
        itemId: s.itemId,
        translit,
        meaning,
        grammar,
        audioUrl,
        cue,
        cueTranslation,
        accepts: s.accepts ?? [],
        intent: s.intent ?? '',
        hideIntent: s.hideIntent ?? false,
      };
      if (s.cueAudioUrl) wire.cueAudioUrl = s.cueAudioUrl;
      if (s.intentAudioUrl) wire.intentAudioUrl = s.intentAudioUrl;
      if (s.goals) {
        wire.goals = s.goals;
        wire.goalIndex = s.goalIndex ?? 0;
      }
      break;

    case 'pattern':
      if (ev < 3) throw new Error('toWire: «pattern» танҳо аз ev≥3');
      wire = {
        kind: s.kind,
        badge: s.badge,
        prompt: s.prompt,
        target: s.target,
        targetWords: s.targetWords,
        itemId: s.itemId,
        translit,
        meaning,
        grammar,
        audioUrl,
        patternHead: s.patternHead ?? '',
        patternTail: s.patternTail ?? '',
        patternOptions: s.patternOptions ?? [],
        askIndex: s.askIndex ?? 0,
      };
      break;

    case 'own':
      if (ev < 3) throw new Error('toWire: «own» танҳо аз ev≥3');
      wire = {
        kind: s.kind,
        badge: s.badge,
        prompt: s.prompt,
        target: s.target,
        targetWords: s.targetWords,
        itemId: s.itemId,
        translit,
        meaning,
        grammar,
        audioUrl,
        cue,
        cueTranslation,
        intent: s.intent ?? '',
      };
      if (s.cueAudioUrl) wire.cueAudioUrl = s.cueAudioUrl;
      if (s.intentAudioUrl) wire.intentAudioUrl = s.intentAudioUrl;
      break;

    default:
      // Навъи тамоман ношинос — хомӯшона шакли нодуруст додан хатарноктар.
      throw new Error(
        `toWire: навъи «${s.kind}» ҳанӯз амалӣ нашудааст (M5, §10.2).`,
      );
  }

  // Аудиои тайёри ҳамсӯҳбат — ба ҳар шакле, ки `cue` дорад (ev ≥ 3).
  if (ev >= 3 && wire.cue && s.cueAudioUrl && !wire.cueAudioUrl) {
    wire.cueAudioUrl = s.cueAudioUrl;
  }

  // Майдонҳои иловагӣ танҳо барои клиенти нав (§10.2). Дар M0 ҳеҷ гоҳ.
  if (ev >= 2) {
    wire.stepId = s.stepId;
    wire.showSlots = s.showSlots;
    wire.timerMs = s.timerMs;
  }

  return wire;
}
