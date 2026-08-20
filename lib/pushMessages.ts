/**
 * lib/pushMessages.ts — «мағзи» шахсисозии push.
 *
 * Ҳар паём аз рӯи ҲОЛАТИ ВОҚЕИИ хонанда сохта мешавад: ном, силсила, курс,
 * дарси навбатие, ки ӯро интизор аст, дилҳо ва забони интерфейсаш. Ҳеҷ паёми
 * «умумӣ» намефиристем — маҳз ин фарқи push-и кордор аз спам аст.
 *
 * Ҷои ягонаи матн: ҳамаи кампанияҳо ин ҷо ҷамъанд, то тарҷума ва A/B дар як
 * файл идора шавад.
 */
import { prisma } from './prisma';

/** Кампанияҳои ДОХИЛӢ (матн дар код). Кампанияҳои админӣ моделӣ Prisma-и
 * `PushCampaign` доранд — ин ду чизи гуногунанд. */
export type BuiltinCampaign =
  | 'winback_3'
  | 'winback_7'
  | 'winback_14'
  | 'winback_30'
  | 'streak_risk'
  | 'hearts_full'
  | 'test';

/** Забонҳои дастгиришаванда; ҳар чизи дигар ба тоҷикӣ бармегардад. */
type Lang = 'tg' | 'ru' | 'en';

function normLang(raw: string | null | undefined): Lang {
  const v = (raw ?? '').toLowerCase();
  if (v.startsWith('ru')) return 'ru';
  if (v.startsWith('en')) return 'en';
  return 'tg';
}

/** Ҳама чизе, ки барои шахсисозии як паём лозим аст. */
export type LearnerContext = {
  userId: string;
  firstName: string;
  lang: Lang;
  streak: number;
  longestStreak: number;
  hearts: number;
  maxHearts: number;
  gems: number;
  level: string;
  daysInactive: number;
  /** Курси ҷорӣ (унвон дар забони модарӣ) — метавонад набошад. */
  courseTitle?: string;
  courseEmoji?: string;
  /** Аввалин дарси ХАТМНАШУДА дар курси ҷорӣ — «аз ҳамин ҷо давом кун». */
  nextLesson?: string;
  nextLessonEmoji?: string;
  nextLessonMinutes?: number;
};

/** Ном → танҳо калимаи аввал ('Аҳмад Раҳимов' → 'Аҳмад'). */
function firstNameOf(name: string): string {
  const first = (name ?? '').trim().split(/\s+/)[0] ?? '';
  return first.length > 0 && first.length <= 24 ? first : '';
}

/**
 * Контексти хонандаро аз база меғундорад (корбар + курс + дарси навбатӣ).
 * `null` — агар корбар ёфт нашавад.
 */
export async function loadLearnerContext(userId: string): Promise<LearnerContext | null> {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, name: true, interfaceLang: true, nativeLang: true,
      streak: true, longestStreak: true, hearts: true, maxHearts: true,
      gems: true, level: true, lastActiveAt: true, currentCourseId: true,
    },
  });
  if (!u) return null;

  const ctx: LearnerContext = {
    userId: u.id,
    firstName: firstNameOf(u.name),
    lang: normLang(u.interfaceLang || u.nativeLang),
    streak: u.streak,
    longestStreak: u.longestStreak,
    hearts: u.hearts,
    maxHearts: u.maxHearts,
    gems: u.gems,
    level: u.level,
    daysInactive: Math.floor((Date.now() - u.lastActiveAt.getTime()) / 86_400_000),
  };

  if (u.currentCourseId) {
    // Курс + аввалин дарси ҳанӯз хатмнашуда (тартиби роҳнамо: модул → дарс).
    const [course, lesson] = await Promise.all([
      prisma.course.findUnique({
        where: { id: u.currentCourseId },
        select: { title: true, emoji: true },
      }),
      prisma.lesson.findFirst({
        where: {
          isActive: true,
          module: { isActive: true, courseId: u.currentCourseId },
          progress: { none: { userId, isCompleted: true } },
        },
        orderBy: [{ module: { order: 'asc' } }, { order: 'asc' }],
        select: { titleTranslated: true, title: true, emoji: true, duration: true },
      }),
    ]);
    if (course) {
      ctx.courseTitle = course.title;
      ctx.courseEmoji = course.emoji;
    }
    if (lesson) {
      ctx.nextLesson = lesson.titleTranslated || lesson.title;
      ctx.nextLessonEmoji = lesson.emoji;
      ctx.nextLessonMinutes = lesson.duration;
    }
  }

  return ctx;
}

export type BuiltMessage = {
  title: string;
  body: string;
  /** `data` — барои коркарди тап дар барнома (навигатсия + аналитика). */
  data: Record<string, string>;
};

/** «Салом, Аҳмад!» / «Салом!» — агар ном набошад, вергули холӣ намемонад. */
function hi(ctx: LearnerContext): string {
  const t = { tg: 'Салом', ru: 'Привет', en: 'Hi' }[ctx.lang];
  return ctx.firstName ? `${t}, ${ctx.firstName}!` : `${t}!`;
}

/**
 * «Қадами навбатӣ» ҳамчун ҷумлаи омода. Агар дарси мушаххас маълум набошад,
 * ба унвони курс, вагарна ба матни умумӣ бармегардад — то ҳеҷ гоҳ ҷои холии
 * «{lesson}» ба корбар нарасад.
 */
function nextStep(ctx: LearnerContext): string {
  if (ctx.nextLesson) {
    const m = ctx.nextLessonMinutes ?? 5;
    return {
      tg: `Дарси «${ctx.nextLesson}» интизори туст — ҳамагӣ ${m} дақиқа.`,
      ru: `Урок «${ctx.nextLesson}» ждёт тебя — всего ${m} минут.`,
      en: `"${ctx.nextLesson}" is waiting for you — just ${m} minutes.`,
    }[ctx.lang];
  }
  if (ctx.courseTitle) {
    return {
      tg: `Курси «${ctx.courseTitle}» интизори туст.`,
      ru: `Курс «${ctx.courseTitle}» ждёт тебя.`,
      en: `Your "${ctx.courseTitle}" course is waiting.`,
    }[ctx.lang];
  }
  return {
    tg: 'Ҳамагӣ 5 дақиқа — ва дарси имрӯза тайёр.',
    ru: 'Всего 5 минут — и урок на сегодня закрыт.',
    en: 'Just 5 minutes and today is done.',
  }[ctx.lang];
}

/**
 * Матни ниҳоии як кампания барои як хонанда.
 * Ҳар шоха ҳатман ба ҳолати воқеии ӯ такя мекунад (силсила ҳаст/нест,
 * рекорд ҳаст/нест, дарси навбатӣ маълум/номаълум).
 */
export function buildMessage(campaign: BuiltinCampaign, ctx: LearnerContext): BuiltMessage {
  const L = ctx.lang;
  const data: Record<string, string> = {
    type: campaign,
    campaign,
    route: 'roadmap',
    lang: L,
  };

  switch (campaign) {
    // ── 3 рӯз нест: сабук, бе гуноҳкунонӣ, бо дарси мушаххас ────────────────
    case 'winback_3': {
      const title = ctx.streak > 0
        ? {
            tg: `${hi(ctx)} Силсилаи ${ctx.streak}-рӯзаат интизор аст 🔥`,
            ru: `${hi(ctx)} Твой стрик ${ctx.streak} дн. ждёт 🔥`,
            en: `${hi(ctx)} Your ${ctx.streak}-day streak is waiting 🔥`,
          }[L]
        : {
            tg: `${hi(ctx)} Се рӯз нест 👀`,
            ru: `${hi(ctx)} Тебя не было три дня 👀`,
            en: `${hi(ctx)} It has been three days 👀`,
          }[L];
      return { title, body: nextStep(ctx), data };
    }

    // ── 7 рӯз: ба рекорди ШАХСИИ ӯ такя мекунем ─────────────────────────────
    case 'winback_7': {
      const title = { tg: 'Як ҳафта гузашт 📚', ru: 'Прошла неделя 📚', en: 'A week has passed 📚' }[L];
      const body = ctx.longestStreak >= 3
        ? {
            tg: `Рекорди ту ${ctx.longestStreak} рӯз буд. Имрӯз аз нав сар кунем? ${nextStep(ctx)}`,
            ru: `Твой рекорд — ${ctx.longestStreak} дн. Начнём заново сегодня? ${nextStep(ctx)}`,
            en: `Your record is ${ctx.longestStreak} days. Start again today? ${nextStep(ctx)}`,
          }[L]
        : {
            tg: `Забон бе такрор фаромӯш мешавад. ${nextStep(ctx)}`,
            ru: `Язык забывается без повторения. ${nextStep(ctx)}`,
            en: `A language fades without practice. ${nextStep(ctx)}`,
          }[L];
      return { title, body, data };
    }

    // ── 14 рӯз: ҳаҷми талабро то ҳадди ақал паст мекунем ────────────────────
    case 'winback_14': {
      const title = ctx.firstName
        ? {
            tg: `Пазмонат шудем, ${ctx.firstName} 😔`,
            ru: `Скучаем по тебе, ${ctx.firstName} 😔`,
            en: `We miss you, ${ctx.firstName} 😔`,
          }[L]
        : { tg: 'Пазмонат шудем 😔', ru: 'Скучаем по тебе 😔', en: 'We miss you 😔' }[L];
      const body = ctx.courseTitle
        ? {
            tg: `«${ctx.courseTitle}» ним роҳ монд. Имрӯз ҳатто 2 дақиқа кофист.`,
            ru: `«${ctx.courseTitle}» остался на полпути. Сегодня хватит и 2 минут.`,
            en: `"${ctx.courseTitle}" is half-finished. Even 2 minutes today is enough.`,
          }[L]
        : {
            tg: 'Ду ҳафта гузашт. Имрӯз ҳатто 2 дақиқа кофист.',
            ru: 'Прошло две недели. Сегодня хватит и 2 минут.',
            en: 'Two weeks have passed. Even 2 minutes today is enough.',
          }[L];
      return { title, body, data };
    }

    // ── 30 рӯз: охирин кӯшиш — оғози тоза, бе фишор ─────────────────────────
    case 'winback_30': {
      const title = { tg: 'Биё баргард! 🎁', ru: 'Возвращайся! 🎁', en: 'Come back! 🎁' }[L];
      const name = ctx.firstName || { tg: 'Дӯст', ru: 'Друг', en: 'Friend' }[L];
      const body = {
        tg: `${name}, як моҳ шуд. Дилҳоят пуранд ва ${ctx.gems} алмосат нигоҳ дошта шуд — биё, аз нав сар кунем.`,
        ru: `${name}, прошёл месяц. Жизни полны, и твои ${ctx.gems} кристаллов на месте — начнём заново.`,
        en: `${name}, it has been a month. Your hearts are full and your ${ctx.gems} gems are safe — let us start again.`,
      }[L];
      return { title, body, data };
    }

    // ── Силсила дар хатар: имрӯз нахондааст, бегоҳ ──────────────────────────
    case 'streak_risk': {
      const title = {
        tg: `Силсилаи ${ctx.streak}-рӯзаат дар хатар! 🔥`,
        ru: `Стрик ${ctx.streak} дн. под угрозой! 🔥`,
        en: `Your ${ctx.streak}-day streak is at risk! 🔥`,
      }[L];
      const prefix = ctx.firstName ? `${ctx.firstName}, ` : '';
      return { title, body: `${prefix}${nextStep(ctx)}`, data: { ...data, route: 'lesson' } };
    }

    // ── Дилҳо пур шуданд: маҳз сабабе, ки ӯ рафта буд ───────────────────────
    case 'hearts_full': {
      const title = {
        tg: `Дилҳоят пур шуданд ❤️ (${ctx.maxHearts}/${ctx.maxHearts})`,
        ru: `Жизни восстановлены ❤️ (${ctx.maxHearts}/${ctx.maxHearts})`,
        en: `Hearts refilled ❤️ (${ctx.maxHearts}/${ctx.maxHearts})`,
      }[L];
      return { title, body: nextStep(ctx), data: { ...data, route: 'lesson' } };
    }

    // ── Санҷишӣ (танҳо аз панели админ) ─────────────────────────────────────
    case 'test':
    default: {
      const title = { tg: 'Санҷиши RAMZ ✅', ru: 'Тест RAMZ ✅', en: 'RAMZ test ✅' }[L];
      const body = {
        tg: `${hi(ctx)} Push кор мекунад. Силсила: ${ctx.streak}, дилҳо: ${ctx.hearts}/${ctx.maxHearts}, сатҳ: ${ctx.level}.`,
        ru: `${hi(ctx)} Push работает. Стрик: ${ctx.streak}, жизни: ${ctx.hearts}/${ctx.maxHearts}, уровень: ${ctx.level}.`,
        en: `${hi(ctx)} Push works. Streak: ${ctx.streak}, hearts: ${ctx.hearts}/${ctx.maxHearts}, level: ${ctx.level}.`,
      }[L];
      return { title, body, data: { ...data, route: 'home' } };
    }
  }
}

/** Контекстро мегирад ва фавран паёми тайёрро бармегардонад. */
export async function buildFor(userId: string, campaign: BuiltinCampaign): Promise<BuiltMessage | null> {
  const ctx = await loadLearnerContext(userId);
  return ctx ? buildMessage(campaign, ctx) : null;
}
