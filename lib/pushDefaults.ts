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
  countdownToHour?: number | null;
  cooldownHours?: number;
  priority?: number;
  route?: string;
  texts: Record<string, { title: string; body: string }>;
};

const SOFT_TG = {
  title: '{name}, вақти дарс расид 📚',
  body: 'Имрӯз ҳанӯз нахондаӣ. Дарси «{lesson}» — ҳамагӣ {minutes} дақиқа.',
};
const HARD_TG = {
  title: '🔥 Силсилаи {streak}-рӯзаат дар хатар!',
  body: '{countdown} монд. 5 дақиқа хон ва онро наҷот деҳ: «{lesson}».',
};
const SOFT_RU = {
  title: '{name}, время урока 📚',
  body: 'Сегодня ты ещё не занимался. Урок «{lesson}» — всего {minutes} минут.',
};
const HARD_RU = {
  title: '🔥 Твой стрик {streak} дн. под угрозой!',
  body: 'Осталось {countdown}. 5 минут — и он спасён: «{lesson}».',
};

export const DEFAULT_CAMPAIGNS: Seed[] = [
  // ── Занҷири рӯзона: тоҷикӣ ──────────────────────────────────────────────
  {
    name: 'Ёдрасони нарм 19:00 — тоҷикӣ',
    hour: 19,
    langs: 'tg',
    studiedToday: 'no',
    priority: 10,
    route: 'lesson',
    texts: { tg: SOFT_TG },
  },
  {
    name: 'Огоҳии қавӣ 21:30 — тоҷикӣ',
    hour: 21,
    minute: 30,
    langs: 'tg',
    studiedToday: 'no',
    minStreak: 1,
    countdownToHour: 24, // то нимишаби Душанбе
    priority: 20,
    route: 'lesson',
    texts: { tg: HARD_TG },
  },
  // ── Занҷири рӯзона: русӣ ────────────────────────────────────────────────
  {
    name: 'Ёдрасони нарм 19:00 — русӣ',
    hour: 19,
    langs: 'ru',
    studiedToday: 'no',
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
    countdownToHour: 24,
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
      tg: { title: '{name}, се рӯз нест 👀', body: 'Дарси «{lesson}» интизори туст — ҳамагӣ {minutes} дақиқа.' },
      ru: { title: '{name}, тебя не было три дня 👀', body: 'Урок «{lesson}» ждёт тебя — всего {minutes} минут.' },
      en: { title: '{name}, it has been three days 👀', body: '"{lesson}" is waiting — just {minutes} minutes.' },
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
      tg: { title: 'Як ҳафта гузашт 📚', body: 'Рекорди ту {longest_streak} рӯз буд. Имрӯз аз нав сар кунем?' },
      ru: { title: 'Прошла неделя 📚', body: 'Твой рекорд — {longest_streak} дн. Начнём заново сегодня?' },
      en: { title: 'A week has passed 📚', body: 'Your record is {longest_streak} days. Start again today?' },
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
      tg: { title: 'Пазмонат шудем, {name} 😔', body: '«{course}» ним роҳ монд. Имрӯз ҳатто 2 дақиқа кофист.' },
      ru: { title: 'Скучаем по тебе, {name} 😔', body: '«{course}» остался на полпути. Сегодня хватит и 2 минут.' },
      en: { title: 'We miss you, {name} 😔', body: '"{course}" is half-finished. Even 2 minutes today is enough.' },
    },
  },
  {
    name: 'Win-back · 30 рӯз',
    hour: 20,
    minInactiveDays: 30,
    cooldownHours: 720,
    priority: 33,
    texts: {
      tg: { title: 'Биё баргард! 🎁', body: '{name}, як моҳ шуд. Дилҳоят пуранд ва {gems} алмосат нигоҳ дошта шуд.' },
      ru: { title: 'Возвращайся! 🎁', body: '{name}, прошёл месяц. Жизни полны, и твои {gems} кристаллов на месте.' },
      en: { title: 'Come back! 🎁', body: '{name}, it has been a month. Your hearts are full and {gems} gems are safe.' },
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
