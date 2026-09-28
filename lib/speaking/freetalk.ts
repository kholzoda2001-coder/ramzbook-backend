/**
 * lib/speaking/freetalk.ts — «Озод гап занед» (27.09.2026).
 *
 * Баъди МИССИЯи вазъият хонанда бо ҳамсӯҳбат 6 навбат гап мезанад — бе
 * ҷумлаи тайёр, бе корти ният. Ин ягона ҷоест, ки ӯ ҷумлаи ХУДАШРО
 * месозад, на ҷумлаи навиштаи моро такрор мекунад.
 *
 * ── Чаро AI сатрро ИНТИХОБ мекунад, на менависад ──────────────────────────
 * Санҷиши зинда (27.09.2026, gpt-oss-120b ва qwen3.8): русии модел хуб аст,
 * вале ТАРҶУМАИ ТОҶИКИИ он ғалат — «Где бетон?» → «Кӯдак дар куҷост?»,
 * «молоток» → «чаккум». Навомӯзи A1 ба тарҷума такя мекунад; тарҷумаи хато
 * аз набудани он бадтар аст. Пас ҳамсӯҳбат аз ҲАВЗИ сатрҳои ҳамин вазъият
 * гап мезанад (15–18 сатр, ҳар кадом бо тарҷумаи тасдиқшуда ва аудиои
 * тайёр), ва AI танҳо ду кор мекунад:
 *   1. сатри навбатиро интихоб мекунад, ки ба ҷавоби хонанда мувофиқ аст;
 *   2. ҷавоби ОЗОДИ хонандаро мефаҳмад ва агар хатои воқеӣ бошад, ислоҳ
 *      пешниҳод мекунад (ҳарду бо забони омӯзиш — ҷое, ки модел боэътимод аст).
 *
 * Натиҷа: ҳамсӯҳбат ҳамеша бо калимаҳои омӯхта гап мезанад (қоидаи A1),
 * тарҷума ҳамеша дуруст, овоз ҳамеша овози курс.
 *
 * СОФ: сохтани промпт ва хондани ҷавоб, бе шабака — то тест онро бигирад.
 */
import type { ChatMessage } from '../ai/openai';
import { scriptRules } from './chat';

/** Чанд навбати ҲАМСӮҲБАТ дар як суҳбат (хонанда 5 бор ҷавоб медиҳад). */
export const FREE_TALK_TURNS = 6;

/** Дарозии ҳадди як сатри хонанда (STT) — ҳимоя аз хароҷот. */
export const MAX_LINE_CHARS = 220;

/** Андозаи ҳадди ҳавзи сатрҳои ҳамсӯҳбат. */
export const MAX_POOL = 40;

/** Камтар аз ин сатр — суҳбат 6 навбат давом карда наметавонад. */
export const MIN_POOL = FREE_TALK_TURNS;

export type FreeTalkLine = { who: 'partner' | 'me'; text: string };

/** Як сатри тасдиқшудаи ҳамсӯҳбат. */
export type PoolLine = {
  /** Забони омӯзиш. */
  text: string;
  /** Тарҷумаи тоҷикии тасдиқшуда. */
  tg: string;
  /** Аудиои тайёр (холӣ = TTS-и дастгоҳ). */
  audioUrl: string;
};

/** Сатри видоъ барои навбати охирин — ҳар забон. */
export const CLOSING_LINES: Record<string, PoolLine> = {
  // Аудио: овози курс (Chirp3-Kore), `prisma/_ru-speaking-real-audio.mjs`.
  ru: {
    text: 'Хорошо, спасибо! До встречи!',
    tg: 'Хуб, ташаккур! То дидор!',
    audioUrl:
      'https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio@0737fe314399223f1be2e835500890200b524c08/audio/ru/freetalk_close_ru.mp3',
  },
  // Аудио: овози курси англисӣ (Chirp3-Kore), `prisma/_speaking-real-audio-lang.mjs --lang=en`.
  en: {
    text: 'Great, thank you! See you later!',
    tg: 'Олӣ, ташаккур! То дидор!',
    audioUrl:
      'https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio@87a770f1d06b0f57e0d8f570c3d95d47573dfd01/audio/en/freetalk_close_en.mp3',
  },
  // Арабӣ: бо ҳаракот, охир бо вақф (чунон ки мегӯянд). Аудио: овози курс (Zariyah),
  // `prisma/_speaking-real-audio-lang.mjs --lang=ar`.
  ar: {
    text: 'مُمْتَازْ، شُكْرًا! إِلَى اللِّقَاءْ!',
    tg: 'Олӣ, ташаккур! То дидор!',
    audioUrl:
      'https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio@569156a04d7e6d43f592e2bc381117c294592840/audio/ar/freetalk_close_ar.mp3',
  },
  // Кореягӣ: 해요체 (сатҳи курс). Аудио: овози курс (Despina), `--lang=ko`.
  ko: {
    text: '좋아요, 감사합니다! 또 만나요!',
    tg: 'Олӣ, ташаккур! То дидор!',
    audioUrl:
      'https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio@985268fa7faeb8963af134a540e6233c5bd5d083/audio/ko/freetalk_close_ko.mp3',
  },
  de: { text: 'Super, danke! Bis später!', tg: 'Олӣ, ташаккур! То дидор!', audioUrl: '' },
  tr: { text: 'Harika, teşekkürler! Görüşürüz!', tg: 'Олӣ, ташаккур! То дидор!', audioUrl: '' },
};

export type FreeTalkInput = {
  /** Номи забони омӯзиш бо англисӣ («Russian»). */
  language: string;
  /** Номи вазъият ба тоҷикӣ. */
  situation: string;
  /** Сатрҳои тасдиқшудаи ҳамсӯҳбат. */
  pool: PoolLine[];
  /** Суҳбат то ҳол. Холӣ = ҳамсӯҳбат суҳбатро сар мекунад. */
  history: FreeTalkLine[];
};

export type FreeTalkFix = {
  /** Он чи хонанда гуфт. */
  said: string;
  /** Ҷумлаи табиӣ ва дуруст. */
  better: string;
};

/** Ҳукми модел: кадом сатр, ва сатри охирини хонанда чӣ гуна буд. */
export type FreeTalkVerdict = {
  /** Индекси сатр дар `pool`. `-1` = модел интихоб накард. */
  pick: number;
  understood: boolean;
  fix: FreeTalkFix | null;
};

const clip = (s: string, n: number) => s.replace(/\s+/g, ' ').trim().slice(0, n);

// ⚠️ Бе флаги `u`: `tsconfig` target надорад (ES5) — `\p{L}` билдро мешикаст.
const bare = (s: string) =>
  s.toLowerCase().replace(/[\s.,!?;:"'«»()\-—–…]+/g, ' ').trim();

/** Чанд навбати ҳамсӯҳбат аллакай гуфта шуд. */
export function partnerTurns(history: FreeTalkLine[]): number {
  return history.filter((l) => l.who === 'partner').length;
}

/** Навбати навбатии ҳамсӯҳбат охирин аст? */
export function isClosingTurn(history: FreeTalkLine[]): boolean {
  return partnerTurns(history) === FREE_TALK_TURNS - 1;
}

/** Индексҳои сатрҳои ҳавз, ки ҳамсӯҳбат аллакай гуфт. */
export function usedPicks(pool: PoolLine[], history: FreeTalkLine[]): number[] {
  const said = new Set(history.filter((l) => l.who === 'partner').map((l) => bare(l.text)));
  const out: number[] = [];
  pool.forEach((p, i) => {
    if (said.has(bare(p.text))) out.push(i);
  });
  return out;
}

/**
 * Ҳавз аз сатрҳои хом: такрорӣ, холӣ ва ҷойгузорҳо (`{name}`, `{job}`)
 * партофта мешаванд — ҷойгузор бе арзиш ба хонанда нишон дода мешуд.
 */
export function buildPool(
  raw: { cue: string | null; cueTranslation: string | null; cueAudioUrl: string | null }[],
): PoolLine[] {
  const out: PoolLine[] = [];
  const seen = new Set<string>();
  for (const r of raw) {
    const text = (r.cue ?? '').trim();
    const tg = (r.cueTranslation ?? '').trim();
    if (!text || !tg || text.includes('{') || tg.includes('{')) continue;
    const k = bare(text);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push({ text, tg, audioUrl: (r.cueAudioUrl ?? '').trim() });
    if (out.length >= MAX_POOL) break;
  }
  return out;
}

/**
 * Дархост дуруст аст? Суҳбат бо ҳамсӯҳбат сар мешавад, навбатҳо иваз
 * мешаванд, сатри охирин аз хонанда аст (ё таърих холӣ), ҳамсӯҳбат ТАНҲО
 * сатрҳои ҳавзро гуфтааст ва ҳадди навбат гузашта нашудааст.
 */
export function freeTalkable(i: FreeTalkInput): boolean {
  const h = i.history;
  if (i.language.trim() === '' || i.pool.length < MIN_POOL) return false;
  if (h.length > FREE_TALK_TURNS * 2 - 1) return false;
  const known = new Set(i.pool.map((p) => bare(p.text)));
  for (let k = 0; k < h.length; k++) {
    const want = k % 2 === 0 ? 'partner' : 'me';
    if (h[k].who !== want) return false;
    const t = h[k].text.trim();
    if (!t || t.length > MAX_LINE_CHARS) return false;
    if (want === 'partner' && !known.has(bare(t))) return false;
  }
  if (h.length > 0 && h[h.length - 1].who !== 'me') return false;
  return partnerTurns(h) < FREE_TALK_TURNS;
}

export function buildFreeTalkMessages(i: FreeTalkInput): ChatMessage[] {
  const turn = partnerTurns(i.history) + 1;
  const closing = turn === FREE_TALK_TURNS;
  const used = usedPicks(i.pool, i.history);
  const first = i.history.length === 0;

  const system = [
    `You direct a spoken ${i.language} roleplay with a Tajik beginner (CEFR A1). Situation (in Tajik): "${clip(i.situation, 120)}".`,
    scriptRules(i.language),
    `You play the other person, but you may ONLY say lines from the numbered list of PARTNER LINES — you pick the number.`,
    closing
      ? `The conversation is ending now: do not pick a line, use "pick": -1.`
      : first
        ? `This is the first turn: pick a line that opens the conversation (a greeting or a first easy question).`
        : `Pick the line that follows most naturally from the learner's last reply, like a real person would: react to what they just said or move the conversation forward. Never ask about something the learner has already told you. Never pick a line already used (${used.length ? used.join(', ') : 'none yet'}). If the learner's last reply was unclear or off-topic, pick an easier line on the same topic.`,
    `Also check the learner's LAST reply like a careful teacher (it is speech-to-text, so ignore spelling, punctuation and capital letters):`,
    `"understood": true if a native ${i.language} speaker would understand what they mean (true on the first turn);`,
    `"fix": if the reply has ANY grammar mistake — wrong case ending, wrong verb form or tense, wrong gender or agreement, a missing needed word, or an unnatural word order — give {"said": "<their reply>", "better": "<the most natural correct ${i.language} sentence for what they meant, max 10 words>"}; if it is correct, null. Never "fix" a name.`,
    `Reply with JSON only: {"pick": <number>, "understood": <true|false>, "fix": <null or object>}.`,
  ]
    .filter(Boolean)
    .join(' ');

  const lines = `PARTNER LINES:\n${i.pool.map((p, k) => `${k}. ${clip(p.text, 120)}`).join('\n')}`;
  // ⚠️ Луғати хонанда ба промпт НАМЕРАВАД: барои интихоби сатр ва санҷиши
  // ҷавоб лозим нест, вале ~300 токен мехӯрд — Groq-и ройгон ҳамагӣ 8000
  // токен дар дақиқа медиҳад (барои ҲАМАИ корбарон).
  const talk = first
    ? 'The conversation has not started yet.'
    : `Conversation so far:\n${i.history
        .map((l) => `${l.who === 'partner' ? 'You' : 'Learner'}: ${clip(l.text, MAX_LINE_CHARS)}`)
        .join('\n')}`;

  return [
    { role: 'system', content: system },
    { role: 'user', content: [lines, talk].join('\n\n') },
  ];
}

/**
 * Ҷавоби моделро мехонад. Ҳеҷ гоҳ `null` намедиҳад: ҷавоби вайрон → ҳукми
 * бехатар (`pick: -1`, фаҳмид, бе ислоҳ) — сервер худаш сатри навбатиро
 * интихоб мекунад ([nextPick]), суҳбат намеканад.
 */
export function parseFreeTalkReply(raw: string, poolSize: number, firstTurn = false): FreeTalkVerdict {
  const safe: FreeTalkVerdict = { pick: -1, understood: true, fix: null };
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) return safe;
  let j: Record<string, unknown>;
  try {
    j = JSON.parse(m[0]) as Record<string, unknown>;
  } catch {
    return safe;
  }
  const n = typeof j.pick === 'number' ? j.pick : Number(j.pick);
  const pick = Number.isInteger(n) && n >= 0 && n < poolSize ? n : -1;

  let fix: FreeTalkFix | null = null;
  const f = j.fix as Record<string, unknown> | null | undefined;
  if (!firstTurn && f && typeof f === 'object') {
    const said = typeof f.said === 'string' ? clip(f.said, 200) : '';
    const better = typeof f.better === 'string' ? clip(f.better, 160) : '';
    if (said && better && bare(said) !== bare(better)) fix = { said, better };
  }

  return {
    pick,
    understood: firstTurn ? true : j.understood !== false && j.understood !== 'false',
    fix,
  };
}

/**
 * Сатри навбатии ҳамсӯҳбат: интихоби модел, агар дуруст ва нав бошад;
 * вагарна аввалин сатри истифоданашуда (бо тартиби дарсҳо). СОФ.
 */
export function nextPick(pool: PoolLine[], history: FreeTalkLine[], modelPick: number): number {
  const used = new Set(usedPicks(pool, history));
  if (modelPick >= 0 && modelPick < pool.length && !used.has(modelPick)) return modelPick;
  for (let k = 0; k < pool.length; k++) if (!used.has(k)) return k;
  return 0;
}

/** Сатри видоъ барои забон; забони ношинос → англисӣ. */
export function closingLine(langCode: string): PoolLine {
  return CLOSING_LINES[langCode.split('-')[0].toLowerCase()] ?? CLOSING_LINES.en;
}
