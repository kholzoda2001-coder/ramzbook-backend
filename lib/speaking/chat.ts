/**
 * lib/speaking/chat.ts — «Сӯҳбат бо AI» (27.09.2026): суҳбати ОЗОДИ овозӣ бо
 * ҳамсӯҳбати «Рамз».
 *
 * Хонанда тугмаро мезанад → Рамз ХУДАШ сар мекунад: бори аввал номро
 * мепурсад, баъд аз рӯи ҷавобҳо мавзӯъ пешниҳод мекунад; бори дигар номро
 * ва чизҳои гуфташударо (кор, шаҳр, оила) ДАР ЁД дорад ва аз ҳамон сар мекунад.
 *
 * Фарқ аз «Озод гап занед» (`freetalk.ts`): он ҷо ҳамсӯҳбат танҳо сатрҳои
 * тасдиқшудаи вазъиятро мегӯяд; ин ҷо мавзӯъ озод аст, пас AI ҷумла МЕНАВИСАД.
 * Тарҷумаи тоҷикӣ аз ин сабаб ба Google Translate супурда мешавад (ниг.
 * `lib/ai/translate.ts`) — тарҷумаи худи модел ғалат буд («Где бетон?» →
 * «Кӯдак дар куҷост?»); агар Google набошад, тарҷумаи модел «тахминӣ» аст.
 *
 * СОФ: промпт, хондани ҷавоб, хотира — бе шабака, то тест онро бигирад.
 */
import type { ChatMessage } from '../ai/openai';

/** Навбатҳои хонанда дар як суҳбат: ройгон / Premium. Баъд Рамз хайрухуш мекунад. */
export const FREE_TURNS = 12;
export const PREMIUM_TURNS = 40;

/**
 * Суҳбатҳои ройгон дар ТАМОМИ умр (озмоишӣ). Premium — бемаҳдуд.
 *
 * Қарори соҳиби маҳсулот (27.09.2026): «хонанда фоидаро фаҳмад, ба ман
 * зарар нарасад». Пештар 1 суҳбат ҲАР РӮЗ буд — ҳар навбат Azure (гӯш) +
 * AI мехӯрад, пас корбари ройгони ҳаррӯза моҳе ~30 суҳбат мегирифт.
 *
 * Суҳбат танҳо вақте ҳисоб мешавад, ки хонанда ақаллан ЯК бор гап зад
 * (`turns > 0`): кушоду баромад — суҳбат сарф намешавад.
 */
export const FREE_TALKS_TOTAL = 3;

/**
 * Суҳбати НАВ (ҳанӯз бе навбати хонанда) барои корбари ройгон иҷозат аст?
 * СОФ. `used` — суҳбатҳои ДИГАРИ ӯ, ки дар онҳо гап зад.
 *
 * ⚠️ Санҷиш на танҳо ҳангоми сохтани сессия: сессияи холӣ (`turns = 0`)
 * ҳанӯз «суҳбат» нест, вале агар гейт танҳо дар сохтан мебуд, хонанда
 * метавонист 10 сессияи холӣ кушояду баъд дар ҳар кадом гап занад.
 */
export function freeTalkAllowed(used: number, sessionTurns: number): boolean {
  return sessionTurns > 0 || used < FREE_TALKS_TOTAL;
}

/** Чанд суҳбати ройгон боқӣ монд (барои экран). */
export function freeTalksLeft(used: number): number {
  return Math.max(0, FREE_TALKS_TOTAL - used);
}

/** Чанд сатри охирини суҳбат ба модел меравад. */
export const MAX_HISTORY = 16;

/** Чанд далели хотира нигоҳ дошта мешавад. */
export const MAX_FACTS = 12;

/** Чанд ибораи омӯхтаи хонанда ба промпт меравад (токенҳо кам!). */
export const MAX_KNOWN = 30;

export const MAX_LINE_CHARS = 240;

export type ChatLine = { who: 'ai' | 'me'; text: string };

/**
 * `turn` — хонанда гап зад, Рамз ҷавоб медиҳад.
 * `hint` — «Чӣ гӯям?».
 * `nudge` — хонанда ХОМӮШ монд: Рамз мисли устод саволи ОСОНТАР медиҳад, на
 *   ин ки хомӯш интизор шавад (корбар, 28.09.2026: «хомӯш наистад»).
 */
export type ChatMode = 'turn' | 'hint' | 'nudge';

/**
 * Сатҳи суҳбат — ҲАМЕША A1 (қарори корбар, 28.09.2026: «саволҳо бояд мутобиқ
 * ба сатҳи A1 бошанд»). Пештар аз сатҳи бобҳои гузашта (A2 ҳам) гирифта мешуд.
 */
export const CHAT_LEVEL = 'A1';

/**
 * Мавзӯъҳои ҳаррӯзаи A1 — Рамз аз инҳо интихоб мекунад. ⚠️ Ниша (сохтмон,
 * ронандагӣ) ҚАСДАН нест: суҳбат озод аст, на дарси касбӣ (корбар, 28.09.2026:
 * «мавзӯъ ва ниша фарқ надорад»).
 */
export const A1_TOPICS = [
  'family', 'food', 'drinks', 'weather', 'home', 'city', 'hobbies',
  'weekend', 'friends', 'shopping', 'daily routine', 'sport', 'music',
  'films', 'holidays', 'animals', 'clothes', 'languages', 'transport',
  'colours', 'time and days', 'the body and health',
];

export type ChatMemory = {
  /** Номи хонанда (холӣ = ҳанӯз намедонем). */
  name: string;
  /** Далелҳо бо англисӣ, кӯтоҳ: «works on a construction site». */
  facts: string[];
};

export type ChatInput = {
  /** Номи забони омӯзиш бо англисӣ («Russian»). */
  language: string;
  /** «A1» | «A2» | «B1». */
  level: string;
  memory: ChatMemory;
  /** Ибораҳое, ки хонанда дар «Гуфтор» омӯхт. */
  known: string[];
  history: ChatLine[];
  /** Навбати ОХИРИНИ ҷоиз — Рамз бояд хайрухуш кунад. */
  closing: boolean;
  /** Мавзӯи саволи АВВАЛ (оғози суҳбат) — ҳар бор дигар, то такрор нашавад. */
  openTopic?: string;
};

export type ChatFix = { said: string; better: string; why: string };
/** `label` — тоҷикии модел (тахминӣ); `labelEn` — барои Google Translate. */
export type ChatTopic = { label: string; labelEn: string; say: string };
export type ChatHint = { say: string; tg: string };

export type ChatReply = {
  reply: string;
  /** Тарҷумаи МОДЕЛ — тахминӣ; роут онро бо Google иваз мекунад, агар шавад. */
  replyTg: string;
  topics: ChatTopic[];
  fix: ChatFix | null;
  /** Хонанда ҳозир номашро гуфт (холӣ = не). */
  name: string;
  /** Далелҳои НАВ дар бораи хонанда. */
  remember: string[];
  /** Хонанда суҳбатро тамом кардан хост → ин сатр хайрухуш аст. */
  goodbye: boolean;
};

const clip = (s: string, n: number) => s.replace(/\s+/g, ' ').trim().slice(0, n);

// ⚠️ Бе флаги `u`: `tsconfig` target надорад (ES5).
// Арабӣ (28.09.2026): ҳаракот партофта мешаванд (модел як калимаро гоҳ бо
// ҳаракоти дигар менависад), ва ؟ ، ؛ — аломатҳои китобатии арабӣ.
const bare = (s: string) =>
  s
    .toLowerCase()
    .replace(/[\u064B-\u0652\u0670]/g, '') // ҳаракот
    // шаклҳои ҳамза, ة/ه, ى/ي — STT онҳоро гоҳ ин хел, гоҳ он хел менависад
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\s.,!?;:"'«»()\-—–…؟،؛]+/g, ' ')
    .trim();

/** Аломати савол: `?` ва арабии `؟`. */
const Q = /[?؟]/;

/**
 * Навбати ягонае, ки Рамз мавзӯъ пешниҳод мекунад: баъди ҷавоби ДУЮМИ хонанда
 * (одатан ном ва кор). ⚠️ Қатъӣ дар сервер: модел «танҳо як бор»-ро риоя
 * намекард ва мавзӯъҳоро ҳар навбат такрор мекард (санҷиши зинда, 27.09.2026).
 */
export const TOPICS_AT_TURN = 2;

/** Навбатҳои хонанда то ҳол. */
export function learnerTurns(h: ChatLine[]): number {
  return h.filter((l) => l.who === 'me').length;
}

/**
 * Таърих дуруст аст? Рамз сар мекунад; хонанда ҳеҷ гоҳ ду бор пай дар пай
 * намегӯяд; Рамз то ДУ бор пай дар пай (савол + `nudge` баъди хомӯшӣ).
 * `turn` — сатри охирин аз хонанда (ё холӣ — оғоз); `hint`/`nudge` — аз Рамз.
 */
export function chatValid(h: ChatLine[], mode: ChatMode, maxTurns: number): boolean {
  if (h.length > maxTurns * 3 + 1) return false;
  if (h.length > 0 && h[0].who !== 'ai') return false;
  let aiRun = 0;
  for (let k = 0; k < h.length; k++) {
    const t = h[k].text.trim();
    if (!t || t.length > MAX_LINE_CHARS) return false;
    if (h[k].who === 'ai') {
      if (++aiRun > 2) return false;
    } else {
      if (k > 0 && h[k - 1].who === 'me') return false;
      aiRun = 0;
    }
  }
  const last = h.length ? h[h.length - 1].who : null;
  if (mode === 'hint') return last === 'ai';
  // `nudge` танҳо баъди ЯК саволи бе ҷавоб — дуюмаш таваққуф аст (клиент).
  if (mode === 'nudge') return last === 'ai' && aiRun === 1;
  if (last !== null && last !== 'me') return false;
  return learnerTurns(h) <= maxTurns;
}

/** Саволҳое, ки Рамз дар ҳамин суҳбат аллакай дод — барои «такрор накун». */
export function askedQuestions(h: ChatLine[]): string[] {
  return h.filter((l) => l.who === 'ai').map((l) => clip(l.text, 120));
}

// Арабӣ: артикли «ال» ҷузъи калима навишта мешавад («الشاي» = «шай»), вале маъно
// ҳамон аст — барои муқоисаи калимаҳо ҷудо мешавад.
const words = (s: string) =>
  bare(s)
    .split(' ')
    .filter((w) => w.length > 1)
    .map((w) => (w.length > 3 && w.indexOf('ال') === 0 ? w.slice(2) : w));

/** Ду ҷумла ҳамон як саволанд? (калимаҳои умумӣ ≥ 70% — Jaccard). СОФ. */
export function sameQuestion(a: string, b: string): boolean {
  const qa = lastQuestion(a);
  const qb = lastQuestion(b);
  if (!qa || !qb) return false;
  if (bare(qa) === bare(qb)) return true;
  const A = new Set(words(qa));
  const Bw = new Set(words(qb));
  if (A.size < 2 || Bw.size < 2) return false;
  let common = 0;
  A.forEach((w) => {
    if (Bw.has(w)) common++;
  });
  return common / (A.size + Bw.size - common) >= 0.7;
}

/** Ҷумлаи саволии охир («Понятно. Где ты живёшь?» → «Где ты живёшь?»). */
function lastQuestion(s: string): string {
  // ⚠️ Бе lookbehind: `tsconfig` target надорад (ES5).
  const qs = s.match(/[^.!?؟]*[?؟]/g);
  return qs ? qs[qs.length - 1].trim() : '';
}

/**
 * Ҷавоби модел қабул аст? `null` = ҳа. Вагарна сабаб — роут як бори дигар
 * мепурсад. Рамз бояд ҲАМЕША савол диҳад (ба ҷуз хайрухуш) ва ҳеҷ гоҳ
 * саволи пешинаро такрор накунад (корбар, 28.09.2026: «ҳар дафъа дубора
 * мепурсад»). СОФ.
 */
/**
 * Ҷавоби модел бо ХАТИ забони омӯзиш аст? (28.09.2026, саволи корбар: «набояд хонандаи
 * англисӣ бошад ва AI русӣ гап занад»). Санҷиши зинда: модел забонро нигоҳ медорад, ҳатто
 * вақте хонанда «говори по-русски» менависад — вале ин кафолат аз МОДЕЛ аст, на аз мо.
 * Ин муҳофиз онро дар сервер кафолат медиҳад:
 *   • забони лотинӣ (en, de, tr…) — на кириллӣ, на арабӣ, на ҳангул, на иероглиф;
 *   • русӣ — кириллӣ, вале БЕ ҳарфҳои тоҷикӣ (ӣ ӯ қ ғ ҳ ҷ);
 *   • арабӣ / кореягӣ / хитоӣ / ҷопонӣ — хати худ ҳаст ва кириллӣ нест.
 * Номҳо ва калимаҳои иқтибосии лотинӣ («Ramz», «OK») монеа нестанд. СОФ.
 */
export function inTargetScript(text: string, langCode: string): boolean {
  const code = langCode.split('-')[0].toLowerCase();
  const cyr = /[\u0400-\u04FF]/.test(text);
  const tajik = /[ӣӯқғҳҷӢӮҚҒҲҶ]/.test(text);
  const arabic = /[\u0600-\u06FF]/.test(text);
  const hangul = /[\uAC00-\uD7A3]/.test(text);
  const cjk = /[\u3040-\u30FF\u4E00-\u9FFF]/.test(text);
  switch (code) {
    case 'ru':
      return cyr && !tajik && !arabic && !hangul && !cjk;
    case 'ar':
      return arabic && !cyr;
    case 'ko':
      return hangul && !cyr && !arabic;
    case 'zh':
    case 'ja':
      return cjk && !cyr && !arabic;
    case 'tg':
      return cyr;
    default:
      return /[a-z]/i.test(text) && !cyr && !arabic && !hangul && !cjk;
  }
}

export type ReplyProblem = 'no_question' | 'many_questions' | 'repeat' | 'wrong_language';

export function replyProblem(
  reply: string,
  history: ChatLine[],
  opts: { closing: boolean; goodbye: boolean; lang?: string },
): ReplyProblem | null {
  // Забон пеш аз ҳама — ҳатто дар хайрухуш.
  if (opts.lang && !inTargetScript(reply, opts.lang)) return 'wrong_language';
  if (opts.closing || opts.goodbye) return null;
  if (!Q.test(reply)) return 'no_question';
  // A1: як савол дар як сатр — ду савол навомӯзро гум мекунад («Ты любишь
  // еду? Что ты ешь обычно?» — санҷиши зинда, 28.09.2026).
  if ((reply.match(/[?؟]/g) || []).length > 1) return 'many_questions';
  if (history.some((l) => l.who === 'ai' && sameQuestion(l.text, reply))) return 'repeat';
  return null;
}

/**
 * Танҳо саволи АВВАЛ: «Погода хорошая? Какой сегодня день?» → «Погода
 * хорошая?». Захираи охирин, вақте модел ду бор ду савол дод. СОФ.
 */
export function trimToOneQuestion(reply: string): string {
  const m = Q.exec(reply);
  return m ? reply.slice(0, m.index + 1).trim() : reply;
}

/** Дастури иловагӣ барои кӯшиши дуюм. */
export function retryNote(problem: ReplyProblem): string {
  switch (problem) {
    case 'wrong_language':
      return 'Your last draft was NOT in the target language. Rewrite it ONLY in the language of this lesson, even if the learner writes in another language.';
    case 'no_question':
      return 'Your last draft had NO question. Rewrite it: react briefly and END with ONE easy new question.';
    case 'many_questions':
      return 'Your last draft had MORE than one question. Rewrite it with exactly ONE short question.';
    case 'repeat':
      return 'Your last draft repeated a question you already asked. Rewrite it with a DIFFERENT question on a NEW everyday topic.';
  }
}

/**
 * Қоидаҳои ХОСИ забон барои промпт. Ҳоло танҳо арабӣ (28.09.2026):
 *  • хонандаи A1-и тоҷик арабии БЕ ҳаракатро хонда наметавонад → ҳар калима
 *    бо ташкили пурра, охири ҷумла бо вақф (сукун) — чунон ки мегӯянд;
 *  • гуфтори хонанда аз STT БЕ ҳаракат меояд → ҳаракот, эъроб, ҳамза ва
 *    ة/ه ҳеҷ гоҳ «хато» нестанд (бе ин модел ҳар ҷумлаи дурустро «ислоҳ» мекард).
 */
export function scriptRules(language: string): string {
  if (/korean/i.test(language)) {
    // Кореягӣ (28.09.2026): курси мо 해요체-ро меомӯзонад (-요); сатҳи дигар
    // (합니다체 ё 반말) навомӯзро гум мекунад. STT фосила ва рақамро гоҳ дигар хел
    // менависад («3개») — хато нест. Ном бо ҳангул — TTS-и кореягӣ «Ramz»-и лотиниро намехонад.
    return (
      'Write Korean in Hangul only (no Hanja, no romanization), in the polite 해요체 style (endings with -요) in every line. ' +
      'Write your own name in Hangul: 람즈. ' +
      "The learner's text is speech-to-text: never treat spacing or digits instead of number words as a mistake."
    );
  }
  if (!/arab/i.test(language)) return '';
  return (
    'Write in simple Modern Standard Arabic and put FULL diacritics (tashkeel/harakat) on EVERY Arabic word you write, ' +
    'write your own name in Arabic: رَمْز, ' +
    'with the pausal form (sukun, no case ending) on the last word of each sentence, as people say it. ' +
    "The learner's text is speech-to-text WITHOUT diacritics: never treat missing diacritics, case endings (i'rab), hamza or ة/ه spelling as a mistake."
  );
}

/**
 * 🔴 Санҷиши зинда бо арабӣ (28.09.2026): «тарҷумаи тоҷикӣ»-и модел аксаран
 * ӮЗБЕКӢ буд («таңертең не жеймени ёқтирасан», «Қизил ёки кўкни ёқтирасиз») —
 * модел «Tajik, Cyrillic»-ро бо забонҳои туркии кириллӣ омехта мекард.
 */
const TAJIK_NOTE =
  'Tajik is a PERSIAN language (like Farsi/Dari) written in Cyrillic: in every Tajik field use only Tajik words, never Uzbek, Kazakh or other Turkic words.';

const PERSONA = (lang: string) =>
  `You are Ramz, a warm, patient ${lang} teacher having a FREE everyday conversation with a Tajik beginner in a language app. ` +
  `You lead the talk like a good teacher: you are never silent, you keep asking simple questions about the learner's everyday life ` +
  `(${A1_TOPICS.join(', ')}). Do NOT talk about work or jobs unless the learner brings it up.`;

export function buildChatMessages(i: ChatInput, mode: ChatMode): ChatMessage[] {
  const known = i.known.slice(0, MAX_KNOWN).map((k) => `"${clip(k, 60)}"`).join(', ');
  const facts = i.memory.facts.slice(0, MAX_FACTS).map((f) => clip(f, 80));
  const name = clip(i.memory.name, 40);
  const hist = i.history.slice(-MAX_HISTORY);
  const first = i.history.length === 0;

  const level =
    i.level === 'B1'
      ? 'The learner is B1: normal short sentences are fine.'
      : i.level === 'A2'
        ? 'The learner is A2: short simple sentences, everyday words.'
        : 'The learner is A1: very short simple sentences (max 8 words), present tense, the most common everyday words only, one question at a time.';

  const aboutLearner = [
    name ? `The learner's name is ${name}.` : `You don't know the learner's name yet.`,
    facts.length ? `You remember about them: ${facts.join('; ')}.` : '',
    known ? `Phrases they have practised (prefer these words): ${known}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  if (mode === 'hint') {
    const system = [
      PERSONA(i.language),
      scriptRules(i.language),
      TAJIK_NOTE,
      level,
      aboutLearner,
      `The learner is stuck and does not know how to answer your last line.`,
      `Suggest 3 different short answers (max 8 words each) the learner could say, in ${i.language}, natural and correct, about themselves (use what you know about them).`,
      `Reply with JSON only: {"hints": [{"say": "<${i.language}>", "tg": "<Tajik translation, Cyrillic>"}]}`,
    ]
      .filter(Boolean)
      .join(' ');
    return [
      { role: 'system', content: system },
      { role: 'user', content: transcript(hist, name) },
    ];
  }

  const asked = askedQuestions(hist);
  const noRepeat = asked.length
    ? `You ALREADY said these lines — NEVER ask the same or a similar question again: ${asked.map((q) => `"${q}"`).join(' | ')}.`
    : '';
  const noKnown = facts.length
    ? `Do not ask about things you already know about the learner.`
    : '';
  const topic = clip(i.openTopic || 'daily routine', 30);

  if (mode === 'nudge') {
    const system = [
      PERSONA(i.language),
      scriptRules(i.language),
      TAJIK_NOTE,
      level,
      aboutLearner,
      `Speak ONLY ${i.language}.`,
      `The learner stayed SILENT after your last line: maybe they did not understand or do not know what to say.`,
      `Like a kind teacher: say a very short encouragement (max 3 words) and ask a DIFFERENT, much easier question on a new everyday topic — a yes/no question or a choice ("tea or coffee?").`,
      noRepeat,
      `Reply with JSON only: {"reply": "<your line in ${i.language}>", "reply_tg": "<Tajik translation, Cyrillic>", "topics": [], "fix": null, "name": "", "remember": [], "goodbye": false}`,
    ]
      .filter(Boolean)
      .join(' ');
    return [
      { role: 'system', content: system },
      { role: 'user', content: transcript(hist, name) },
    ];
  }

  const plan = first
    ? name
      ? `Start the conversation: greet ${name} by name and ask ONE easy question about ${topic}.`
      : `Start the conversation: say hi, introduce yourself as Ramz, and ask the learner's name.`
    : i.closing
      ? `Time is up: react briefly to their last line and say a warm goodbye (use their name), with NO question.`
      : [
          `React to what the learner just said (show you understood, one short sentence) and ask ONE new, easy question.`,
          `EVERY line you say must END with exactly one question — never leave the learner without a question.`,
          `Ask at most 2 questions about the same topic, then move to a NEW everyday topic the learner has not talked about yet.`,
          noRepeat,
          noKnown,
          name
            ? ''
            : `If they just told you their name, use it.`,
          learnerTurns(i.history) === TOPICS_AT_TURN
            ? `Now ALSO offer 2-3 conversation topics that fit their life in "topics" (ask "What shall we talk about?").`
            : `"topics" must be [].`,
          `If the learner says goodbye or wants to stop ("пока", "до свидания", "хватит", "bye", "stop"...), say a warm goodbye and set "goodbye": true.`,
          `If their answer does not fit your question or is unclear, do NOT repeat the question: turn the SAME question into a choice of two concrete options (for "What animal do you like?" → "Cats or dogs?"), or move on to a new topic.`,
        ]
          .filter(Boolean)
          .join(' ');

  const system = [
    PERSONA(i.language),
    scriptRules(i.language),
    TAJIK_NOTE,
    level,
    aboutLearner,
    `Speak ONLY ${i.language}. Never correct the learner inside your line.`,
    plan,
    `Check the learner's LAST line like a careful teacher (it is speech-to-text: ignore spelling, punctuation, capitals): if it has a real grammar or word mistake, give "fix"; else null. Never fix names. A fix keeps the learner's OWN meaning — an answer that does not fit your question is not a mistake.`,
    `Reply with JSON only:`,
    `{"reply": "<your line in ${i.language}>", "reply_tg": "<Tajik translation, Cyrillic>",`,
    `"topics": [{"label_en": "<2-3 word topic name in English>", "label_tg": "<the same in Tajik, Cyrillic>", "say": "<the short phrase the LEARNER says to choose it, in ${i.language}, 1-3 words, e.g. \"О работе\">"}] or [],`,
    `"fix": null or {"said": "<their line>", "better": "<correct natural ${i.language} sentence, max 12 words>", "why_en": "<the rule in simple English, max 12 words>"},`,
    `"name": "<the learner's first name if they told it in their last line, else empty>",`,
    `"remember": ["<new short facts about the learner in English (not the name), max 8 words each, only if they just told you something personal>"],`,
    `"goodbye": <true|false>}`,
  ]
    .filter(Boolean)
    .join(' ');

  return [
    { role: 'system', content: system },
    { role: 'user', content: first ? 'The learner opened the chat.' : transcript(hist, name) },
  ];
}

function transcript(h: ChatLine[], name: string): string {
  const who = name || 'Learner';
  return `Conversation so far:\n${h
    .map((l) => `${l.who === 'ai' ? 'Ramz' : `${who} (speech-to-text)`}: ${clip(l.text, MAX_LINE_CHARS)}`)
    .join('\n')}`;
}

function json(raw: string): Record<string, unknown> | null {
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    return JSON.parse(m[0]) as Record<string, unknown>;
  } catch {
    return null;
  }
}

const str = (v: unknown, n: number) => (typeof v === 'string' ? clip(v, n) : '');

/**
 * Ҳаракати «овезон»: модел гоҳ сукунро ПАС аз аломат мегузорад («جَمِيلٌ؟ْ») —
 * дар экран як аломати беҳарф мемонад. Ҳаракат танҳо баъди ҳарфи арабӣ (ё
 * ҳаракати дигар — шадда + фатҳа) ҷоиз аст. Барои матни ғайриарабӣ бетаъсир. СОФ.
 */
export function tidyArabicMarks(s: string): string {
  return s.replace(/([^\u0621-\u064A\u0671-\u06D3\u064B-\u0652\u0670])[\u064B-\u0652]+/g, '$1');
}

/**
 * «Ислоҳ» маънои ХУДИ хонандаро нигоҳ медорад? Санҷиши зинда (28.09.2026):
 * ба саволи «ранг» хонанда «أحب البلوف» (палавро дӯст медорам) гуфт ва модел
 * «ислоҳ» кард → «أُحِبُّ اللَّوْنَ الأَزْرَقَ» — ин ислоҳ не, ҷавоби ДИГАР аст, ва
 * дастури промпт онро боздошта натавонист. Ислоҳи воқеӣ аксари калимаҳоро
 * нигоҳ медорад («I has brother» → «I have a brother»: 1/3). Ҷавоби якқалима
 * («Чай» → «Я люблю чай») ҳамеша ҷоиз аст. СОФ.
 */
export function fixKeepsMeaning(said: string, better: string): boolean {
  const A = new Set(words(said));
  if (A.size < 2) return true;
  const Bw = new Set(words(better));
  let common = 0;
  A.forEach((w) => {
    if (Bw.has(w)) common++;
  });
  return common / (A.size + Bw.size - common) >= 0.3;
}

/** Ҷавоби навбат. `null` = модел сатр надод (роут дубора мепурсад ё 502). */
export function parseChatReply(raw: string, firstTurn = false): ChatReply | null {
  const j = json(raw);
  if (!j) return null;
  const reply = tidyArabicMarks(str(j.reply, 300));
  if (!reply) return null;

  let fix: ChatFix | null = null;
  const f = j.fix as Record<string, unknown> | null | undefined;
  if (!firstTurn && f && typeof f === 'object') {
    const said = str(f.said, 200);
    const better = tidyArabicMarks(str(f.better, 160));
    const why = str(f.why_en, 160);
    if (said && better && bare(said) !== bare(better) && fixKeepsMeaning(said, better)) {
      fix = { said, better, why };
    }
  }

  const topics: ChatTopic[] = Array.isArray(j.topics)
    ? (j.topics as unknown[])
        .filter((t): t is Record<string, unknown> => !!t && typeof t === 'object')
        .map((t) => ({ label: str(t.label_tg, 40), labelEn: str(t.label_en, 40), say: str(t.say, 60) }))
        .filter((t) => (t.label || t.labelEn) && t.say)
        .slice(0, 3)
    : [];

  const remember = Array.isArray(j.remember)
    ? (j.remember as unknown[]).map((r) => str(r, 80)).filter(Boolean).slice(0, 4)
    : [];

  // Ном: танҳо як калима-ду калимаи ҳарфӣ, на ҷумла («меня зовут» ≠ ном).
  const rawName = str(j.name, 40);
  const name = /^[^\s\d.,!?]{2,20}( [^\s\d.,!?]{2,20})?$/.test(rawName) ? rawName : '';

  return {
    reply,
    replyTg: str(j.reply_tg, 320),
    topics,
    fix,
    name,
    remember,
    goodbye: j.goodbye === true || j.goodbye === 'true',
  };
}

/** Ёриҳои «Чӣ гӯям?». Ҳеҷ гоҳ `null` не — холӣ = ёрӣ нашуд. */
export function parseHints(raw: string): ChatHint[] {
  const j = json(raw);
  if (!j || !Array.isArray(j.hints)) return [];
  const seen = new Set<string>();
  return (j.hints as unknown[])
    .filter((h): h is Record<string, unknown> => !!h && typeof h === 'object')
    .map((h) => ({ say: tidyArabicMarks(str(h.say, 80)), tg: str(h.tg, 120) }))
    .filter((h) => {
      const k = bare(h.say);
      if (!h.say || seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .slice(0, 3);
}

/**
 * Хотираи нав: номи нав (агар гуфт) ва далелҳои нав бе такрор; кӯҳнатаринҳо
 * аз сар мераванд, то [MAX_FACTS]. СОФ.
 */
export function mergeMemory(m: ChatMemory, r: Pick<ChatReply, 'name' | 'remember'>): ChatMemory {
  const facts = [...m.facts];
  const name = r.name || m.name;
  for (const f of r.remember) {
    // Ном дар `name` аст — «Name is Alisher» далели нав нест.
    if (/\bname\b/i.test(f)) continue;
    if (!facts.some((x) => bare(x) === bare(f))) facts.push(f);
  }
  return {
    name,
    facts: facts.slice(-MAX_FACTS),
  };
}

/**
 * Хонанда хайрухуш мекунад? — калимаҳои маъмул дар чанд забон. Модел инро
 * низ медонад (`goodbye`), вале ин муҳофизи дуюм аст: агар модел фаромӯш
 * кард, суҳбат баъди «Пока» набояд бо саволи нав давом кунад.
 */
export function saysGoodbye(text: string): boolean {
  // ⚠️ Танҳо дар АВВАЛ ё ОХИРИ ҷумла: «Я работаю пока здесь» («ҳоло ин ҷо
  // кор мекунам») хайрухуш НЕСТ, «Ну ладно, пока!» — ҳаст.
  const t = bare(text);
  return [
    'пока', 'до свидания', 'до завтра', 'хватит',
    'bye', 'goodbye', 'see you',
    'tschüss', 'auf wiedersehen', 'görüşürüz', 'hoşça kal',
    // арабӣ — БЕ ҳаракат (`bare` онҳоро мепартояд); ҳамза ду хел, чунки STT гоҳ менависад, гоҳ не
    'مع السلامة', 'مع السلامه', 'إلى اللقاء', 'الى اللقاء', 'وداعا', 'باي',
    // кореягӣ
    '안녕히 계세요', '안녕히 가세요', '또 만나요', '또 봐요', '잘 가요', '안녕',
  ]
    .map(bare) // ҳамон якхелакунӣ, ки матни хонанда мегирад (ҳамза, ى, ة)
    .some((p) => t === p || t.endsWith(` ${p}`) || t.startsWith(`${p} `));
}
