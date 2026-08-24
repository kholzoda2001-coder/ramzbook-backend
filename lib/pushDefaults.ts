/**
 * lib/pushDefaults.ts — кампанияҳои ОҒОЗӢ.
 *
 * Ҳангоми аввалин кушодани панел (агар ҷадвал холӣ бошад) ин 8 кампания сохта
 * мешаванд, то система аз рӯзи аввал кор кунад. Баъд ҳамаашон дар панел таҳрир,
 * хомӯш ё нест мешаванд — ҳеҷ матн дар код қулф намондааст.
 *
 * Занҷири рӯзона (вақти Душанбе):
 *   19:00 — огоҳии НАРМ ба онҳое, ки имрӯз нахондаанд;
 *   21:30 — огоҳии ҚАВӢ бо ҳисоби вақт ({countdown}) танҳо ба онҳое, ки силсила
 *           доранд — яъне воқеан чизе барои гум кардан доранд;
 *   20:00 — win-back ба ғайрифаъолон (3/7/14/30 рӯз).
 */
import { prisma } from './prisma';

const TJ = 300; // Душанбе = UTC+5

type Seed = {
  name: string;
  hour: number;
  minute?: number;
  langs?: string | null;
  studiedToday?: string | null;
  minStreak?: number | null;
  minInactiveDays?: number | null;
  maxInactiveDays?: number | null;
  friendStreak?: string | null;
  wager?: string | null;
  countdownToHour?: number | null;
  cooldownHours?: number;
  priority?: number;
  route?: string;
  texts: Record<string, { title: string; body: string }>;
};

/**
 * Соати маҳаллии дедлайни ВОҚЕИИ силсила.
 *
 * `lib/xp.ts` рӯзро бо UTC мешуморад (`dateOnly` → UTC), пас силсила на дар
 * нимишаби Душанбе, балки соати 00:00 UTC = **05:00 Душанбе** сифр мешавад.
 * `minutesUntilLocalHour` соатҳои >24-ро ҳамчун «пагоҳ» мефаҳмад, пас 29 = 05:00
 * рӯзи оянда. Агар мо ин ҷо 24 мегузоштем, матн «то нимишаб 2 соат монд» мегуфт,
 * дар ҳоле ки корбар воқеан 7 соат вақт дошт — яъне push дурӯғ мегуфт.
 */
const STREAK_DEADLINE_HOUR = 29;

/**
 * Занҷири рӯзона танҳо ба онҳое меравад, ки ҳанӯз ГУМ нашудаанд (0–2 рӯз).
 * Аз рӯзи 3-юм онҳоро win-back мегирад. Бе ин марз як корбари ғайрифаъол дар
 * як рӯз 3 push мегирифт (19:00 нарм + 20:00 win-back + 21:30 қавӣ) — маҳз он
 * лимити рӯзона, яъне ҳадди аксари иҷозатдодашудаи СПАМ.
 */
const DAILY_CHAIN_MAX_INACTIVE = 2;

const SOFT_TG = {
  title: '{name}, вақти дарс расид 📚',
  body: 'Имрӯз ҳанӯз нахондаӣ. {lesson} — ҳамагӣ {minutes} дақиқа.',
};
const HARD_TG = {
  title: '🔥 Силсилаи {streak}-рӯзаат дар хатар!',
  body: '{countdown} монд. 5 дақиқа хон ва онро наҷот деҳ: {lesson}.',
};
const SOFT_RU = {
  title: '{name}, время урока 📚',
  body: 'Сегодня ты ещё не занимался. {lesson} — всего {minutes} минут.',
};
const HARD_RU = {
  title: '🔥 Твой стрик {streak} дн. под угрозой!',
  body: 'Осталось {countdown}. 5 минут — и он спасён: {lesson}.',
};
const SOFT_EN = {
  title: '{name}, time to study 📚',
  body: "You haven't studied today. {lesson} takes just {minutes} minutes.",
};
const HARD_EN = {
  title: '🔥 Your {streak}-day streak is at risk!',
  body: '{countdown} left. Five minutes saves it: {lesson}.',
};

export const DEFAULT_CAMPAIGNS: Seed[] = [
  // ── Занҷири рӯзона: тоҷикӣ ──────────────────────────────────────────────
  {
    // `langs` низ `uz`/`en`-ро мегирад: онҳо матни тоҷикӣ надоранд, вале
    // `pickText` барои `en` матни англисиро мегирад ва барои `uz` ба тоҷикӣ
    // бармегардад. Бе ин корбари ғайри tg/ru ҲЕҶ ёдрасони рӯзона намегирифт.
    name: 'Ёдрасони нарм 19:00 — тоҷикӣ',
    hour: 19,
    langs: 'tg,uz,en',
    studiedToday: 'no',
    maxInactiveDays: DAILY_CHAIN_MAX_INACTIVE,
    priority: 10,
    route: 'lesson',
    texts: { tg: SOFT_TG, en: SOFT_EN },
  },
  {
    name: 'Огоҳии қавӣ 21:30 — тоҷикӣ',
    hour: 21,
    minute: 30,
    langs: 'tg,uz,en',
    studiedToday: 'no',
    minStreak: 1,
    maxInactiveDays: DAILY_CHAIN_MAX_INACTIVE,
    countdownToHour: STREAK_DEADLINE_HOUR,
    priority: 20,
    route: 'lesson',
    texts: { tg: HARD_TG, en: HARD_EN },
  },
  // ── Занҷири рӯзона: русӣ ────────────────────────────────────────────────
  {
    name: 'Ёдрасони нарм 19:00 — русӣ',
    hour: 19,
    langs: 'ru',
    studiedToday: 'no',
    maxInactiveDays: DAILY_CHAIN_MAX_INACTIVE,
    priority: 11,
    route: 'lesson',
    texts: { ru: SOFT_RU },
  },
  {
    name: 'Огоҳии қавӣ 21:30 — русӣ',
    hour: 21,
    minute: 30,
    langs: 'ru',
    studiedToday: 'no',
    minStreak: 1,
    maxInactiveDays: DAILY_CHAIN_MAX_INACTIVE,
    countdownToHour: STREAK_DEADLINE_HOUR,
    priority: 21,
    route: 'lesson',
    texts: { ru: HARD_RU },
  },
  // ── Win-back (ҳама забонҳо) ─────────────────────────────────────────────
  {
    name: 'Win-back · 3 рӯз',
    hour: 20,
    minInactiveDays: 3,
    maxInactiveDays: 6,
    cooldownHours: 96,
    priority: 30,
    texts: {
      tg: { title: '{name}, се рӯз нест 👀', body: '{lesson} интизори туст — ҳамагӣ {minutes} дақиқа.' },
      ru: { title: '{name}, тебя не было три дня 👀', body: '{lesson} ждёт тебя — всего {minutes} минут.' },
      en: { title: '{name}, it has been three days 👀', body: '{lesson} is waiting — just {minutes} minutes.' },
    },
  },
  {
    name: 'Win-back · 7 рӯз',
    hour: 20,
    minInactiveDays: 7,
    maxInactiveDays: 13,
    cooldownHours: 168,
    priority: 31,
    texts: {
      tg: { title: 'Як ҳафта гузашт 📚', body: 'Забон бе такрор зуд фаромӯш мешавад. Имрӯз 5 дақиқа кофист — {lesson}.' },
      ru: { title: 'Прошла неделя 📚', body: 'Язык без повторения быстро забывается. Сегодня хватит 5 минут — {lesson}.' },
      en: { title: 'A week has passed 📚', body: 'A language fades without practice. Five minutes today is enough — {lesson}.' },
    },
  },
  {
    name: 'Win-back · 14 рӯз',
    hour: 20,
    minInactiveDays: 14,
    maxInactiveDays: 29,
    cooldownHours: 336,
    priority: 32,
    texts: {
      tg: { title: 'Пазмонат шудем, {name} 😔', body: 'Ду ҳафта гузашт. Имрӯз ҳатто 2 дақиқа кофист — {lesson}.' },
      ru: { title: 'Скучаем по тебе, {name} 😔', body: 'Прошли две недели. Сегодня хватит и 2 минут — {lesson}.' },
      en: { title: 'We miss you, {name} 😔', body: 'Two weeks have passed. Even 2 minutes today is enough — {lesson}.' },
    },
  },
  {
    // ⚠️ {gems} ин ҷо қасдан истифода намешавад: 53 корбари дорои token сифр
    // алмос доранд ва «ва 0 алмосат нигоҳ дошта шуд» ба ҷои ҳавасмандӣ
    // хандаовар мебарояд. Ҳар ҷойгузор бояд барои ҳолати САРҲАДӢ ҳам маънo дошта бошад.
    name: 'Win-back · 30 рӯз',
    hour: 20,
    minInactiveDays: 30,
    cooldownHours: 720,
    priority: 33,
    texts: {
      tg: { title: 'Биё баргард! 🎁', body: '{name}, як моҳ шуд. Дилҳоят пуранд — аз ҳамон ҷое, ки монда будӣ, давом кун.' },
      ru: { title: 'Возвращайся! 🎁', body: '{name}, прошёл месяц. Жизни полны — продолжим с того места, где ты остановился.' },
      en: { title: 'Come back! 🎁', body: '{name}, it has been a month. Your hearts are full — pick up right where you left off.' },
    },
  },
  // ── Ҷои ёдрасонҳои МАҲАЛЛИИ 102/103 ────────────────────────────────────
  // Ин ду то ҳол танҳо дар телефон буданд ва аз рӯи маълумоти КӮҲНАИ дастгоҳ
  // кор мекарданд. Акнун сервер ҳолати ВОҚЕИИ ҷуфт/гаравро медонад.
  {
    name: 'Силсила бо дӯст 19:30',
    hour: 19,
    minute: 30,
    studiedToday: 'no',
    friendStreak: 'yes',
    maxInactiveDays: DAILY_CHAIN_MAX_INACTIVE,
    countdownToHour: STREAK_DEADLINE_HOUR,
    priority: 15,
    route: 'lesson',
    texts: {
      tg: { title: 'Дӯстат интизор аст 🤝', body: 'Силсилаи ҷуфтиатон имрӯз меғурад. {countdown} монд — {lesson}.' },
      ru: { title: 'Друг тебя ждёт 🤝', body: 'Ваш общий стрик сегодня оборвётся. Осталось {countdown} — {lesson}.' },
      en: { title: 'Your friend is waiting 🤝', body: 'Your joint streak breaks today. {countdown} left — {lesson}.' },
    },
  },
  {
    name: 'Гарави алмос 20:15',
    hour: 20,
    minute: 15,
    studiedToday: 'no',
    wager: 'yes',
    maxInactiveDays: DAILY_CHAIN_MAX_INACTIVE,
    countdownToHour: STREAK_DEADLINE_HOUR,
    priority: 25,
    route: 'lesson',
    texts: {
      tg: { title: '💎 Гаравҳоят дар хатар', body: '{name}, имрӯз нахондаӣ — {countdown} монд. Як дарс ва алмосҳоят маҳфузанд.' },
      ru: { title: '💎 Твоя ставка под угрозой', body: '{name}, сегодня ты не занимался — осталось {countdown}. Один урок, и кристаллы твои.' },
      en: { title: '💎 Your wager is at risk', body: "{name}, you haven't studied today — {countdown} left. One lesson keeps your gems." },
    },
  },
];

/**
 * Агар ягон кампания набошад, кампанияҳои оғозиро месозад.
 * Идемпотент аст: ҳамин ки як сатр ҳаст, ҳеҷ чиз намекунад — то кампанияи
 * несткардаи админ дубора зинда нашавад.
 */
export async function ensureDefaultCampaigns(): Promise<number> {
  const existing = await prisma.pushCampaign.count();
  if (existing > 0) return 0;

  for (const s of DEFAULT_CAMPAIGNS) {
    await prisma.pushCampaign.create({
      data: {
        name: s.name,
        kind: 'scheduled',
        isActive: true,
        hour: s.hour,
        minute: s.minute ?? 0,
        tzOffsetMin: TJ,
        langs: s.langs ?? null,
        studiedToday: s.studiedToday ?? null,
        minStreak: s.minStreak ?? null,
        minInactiveDays: s.minInactiveDays ?? null,
        maxInactiveDays: s.maxInactiveDays ?? null,
        friendStreak: s.friendStreak ?? null,
        wager: s.wager ?? null,
        countdownToHour: s.countdownToHour ?? null,
        cooldownHours: s.cooldownHours ?? 20,
        priority: s.priority ?? 0,
        route: s.route ?? 'lesson',
        texts: s.texts,
      },
    });
  }
  return DEFAULT_CAMPAIGNS.length;
}
