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

export type ChatMode = 'turn' | 'hint';

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
const bare = (s: string) => s.toLowerCase().replace(/[\s.,!?;:"'«»()\-—–…]+/g, ' ').trim();

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
 * Таърих дуруст аст? Рамз сар мекунад, навбатҳо иваз мешаванд, сатри охирин
 * аз хонанда (ё холӣ — оғоз). Барои `hint` сатри охирин аз Рамз аст.
 */
export function chatValid(h: ChatLine[], mode: ChatMode, maxTurns: number): boolean {
  if (h.length > maxTurns * 2 + 1) return false;
  for (let k = 0; k < h.length; k++) {
    if (h[k].who !== (k % 2 === 0 ? 'ai' : 'me')) return false;
    const t = h[k].text.trim();
    if (!t || t.length > MAX_LINE_CHARS) return false;
  }
  if (mode === 'hint') return h.length > 0 && h[h.length - 1].who === 'ai';
  if (h.length > 0 && h[h.length - 1].who !== 'me') return false;
  return learnerTurns(h) <= maxTurns;
}

const PERSONA = (lang: string) =>
  `You are Ramz, a warm, curious ${lang} speaking partner in a language app for Tajik adults ` +
  `(many work abroad: construction, driving, service). You are NOT a teacher in the chat: you talk like a friendly person.`;

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
        : 'The learner is A1: very short simple sentences (max 8 words), the most common words only, one question at a time.';

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
      level,
      aboutLearner,
      `The learner is stuck and does not know how to answer your last line.`,
      `Suggest 3 different short answers (max 8 words each) the learner could say, in ${i.language}, natural and correct, about themselves (use what you know about them).`,
      `Reply with JSON only: {"hints": [{"say": "<${i.language}>", "tg": "<Tajik translation, Cyrillic>"}]}`,
    ].join(' ');
    return [
      { role: 'system', content: system },
      { role: 'user', content: transcript(hist, name) },
    ];
  }

  const plan = first
    ? name
      ? `Start the conversation: greet ${name} by name and ask one question about their life, using what you remember (for example about their work or their day).`
      : `Start the conversation: say hi, introduce yourself as Ramz, and ask the learner's name.`
    : i.closing
      ? `Time is up: react briefly to their last line and say a warm goodbye (use their name), with NO question.`
      : [
          `React to what the learner just said (show you understood, one short sentence) and ask ONE new, easy follow-up question.`,
          name
            ? ''
            : `If they just told you their name, use it.`,
          learnerTurns(i.history) === TOPICS_AT_TURN
            ? `Now ALSO offer 2-3 conversation topics that fit their life in "topics" (ask "What shall we talk about?").`
            : `"topics" must be [].`,
          `If the learner says goodbye or wants to stop ("пока", "до свидания", "хватит", "bye", "stop"...), say a warm goodbye and set "goodbye": true.`,
          `If their line is unclear, ask again more simply.`,
        ]
          .filter(Boolean)
          .join(' ');

  const system = [
    PERSONA(i.language),
    level,
    aboutLearner,
    `Speak ONLY ${i.language}. Never correct the learner inside your line.`,
    plan,
    `Check the learner's LAST line like a careful teacher (it is speech-to-text: ignore spelling, punctuation, capitals): if it has a real grammar or word mistake, give "fix"; else null. Never fix names.`,
    `Reply with JSON only:`,
    `{"reply": "<your line in ${i.language}>", "reply_tg": "<Tajik translation, Cyrillic>",`,
    `"topics": [{"label_en": "<2-3 word topic name in English>", "label_tg": "<the same in Tajik, Cyrillic>", "say": "<the short phrase the LEARNER says to choose it, in ${i.language}, 1-3 words, e.g. \"О работе\">"}] or [],`,
    `"fix": null or {"said": "<their line>", "better": "<correct natural ${i.language} sentence, max 12 words>", "why_en": "<the rule in simple English, max 12 words>"},`,
    `"name": "<the learner's first name if they told it in their last line, else empty>",`,
    `"remember": ["<new short facts about the learner in English (not the name), max 8 words each, only if they just told you something personal>"],`,
    `"goodbye": <true|false>}`,
  ].join(' ');

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

/** Ҷавоби навбат. `null` = модел сатр надод (роут дубора мепурсад ё 502). */
export function parseChatReply(raw: string, firstTurn = false): ChatReply | null {
  const j = json(raw);
  if (!j) return null;
  const reply = str(j.reply, 300);
  if (!reply) return null;

  let fix: ChatFix | null = null;
  const f = j.fix as Record<string, unknown> | null | undefined;
  if (!firstTurn && f && typeof f === 'object') {
    const said = str(f.said, 200);
    const better = str(f.better, 160);
    const why = str(f.why_en, 160);
    if (said && better && bare(said) !== bare(better)) fix = { said, better, why };
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
    .map((h) => ({ say: str(h.say, 80), tg: str(h.tg, 120) }))
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
  ].some((p) => t === p || t.endsWith(` ${p}`) || t.startsWith(`${p} `));
}
