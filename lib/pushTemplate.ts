/**
 * lib/pushTemplate.ts — шаблони матни push.
 *
 * Админ дар панел матнро бо ҷойгузорҳо менависад, мас.:
 *   «{name}, силсилаи {streak}-рӯзаат месӯзад! {countdown} монд.»
 * ва ин файл онро барои ҲАР корбар алоҳида пур мекунад.
 *
 * Ҳамин тавр матн ПУРРА дар дасти админ мемонад, вале паём ҳамон қадар шахсӣ
 * мешавад, ки гӯё дастӣ навишта шудааст.
 */
import type { LearnerContext } from './pushMessages';

export type TplLang = 'tg' | 'ru' | 'en';

/** Рӯйхати ҷойгузорҳо барои панели админ (нишон дода мешавад). */
export const PLACEHOLDERS: { key: string; desc: string }[] = [
  { key: '{name}', desc: 'Номи хонанда (калимаи аввал)' },
  { key: '{streak}', desc: 'Силсилаи ҷорӣ (рӯз)' },
  { key: '{longest_streak}', desc: 'Рекорди силсила' },
  { key: '{lesson}', desc: 'Дарси навбатии хатмнашуда' },
  { key: '{course}', desc: 'Курси ҷорӣ' },
  { key: '{minutes}', desc: 'Давомнокии дарси навбатӣ (дақиқа)' },
  { key: '{hearts}', desc: 'Дилҳои ҳозира' },
  { key: '{max_hearts}', desc: 'Ҳадди аксари дилҳо' },
  { key: '{gems}', desc: 'Алмосҳо' },
  { key: '{level}', desc: 'Сатҳ (A1/A2/B1…)' },
  { key: '{days_inactive}', desc: 'Чанд рӯз нахондааст' },
  { key: '{countdown}', desc: 'То дедлайн чанд вақт монд (2 соату 30 дақиқа)' },
  { key: '{countdown_short}', desc: 'Ҳамон, кӯтоҳ (2:30)' },
];

/**
 * То соати маҳаллии [deadlineHour] чанд дақиқа монд.
 * `deadlineHour = 24` → нимишаби маҳаллӣ. Агар вақт гузашта бошад, рӯзи оянда.
 */
export function minutesUntilLocalHour(
  now: Date,
  tzOffsetMin: number,
  deadlineHour: number,
): number {
  const shifted = new Date(now.getTime() + tzOffsetMin * 60_000);
  const dayStartUtc = Date.UTC(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth(),
    shifted.getUTCDate(),
  );
  let target = dayStartUtc + deadlineHour * 3_600_000;
  const nowShifted = shifted.getTime();
  if (target <= nowShifted) target += 86_400_000;
  return Math.max(0, Math.round((target - nowShifted) / 60_000));
}

/** 150 → «2 соату 30 дақиқа» / «2 ч 30 мин» / «2h 30m». */
export function formatCountdown(totalMinutes: number, lang: TplLang): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (lang === 'ru') {
    if (h === 0) return `${m} мин`;
    return m === 0 ? `${h} ч` : `${h} ч ${m} мин`;
  }
  if (lang === 'en') {
    if (h === 0) return `${m}m`;
    return m === 0 ? `${h}h` : `${h}h ${m}m`;
  }
  if (h === 0) return `${m} дақиқа`;
  return m === 0 ? `${h} соат` : `${h} соату ${m} дақиқа`;
}

function shortCountdown(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
}

/**
 * Матни захиравӣ, вақте маълумоти воқеӣ нест.
 *
 * ⚠️ Бо ҲАРФИ КАЛОН: 46 аз 135 хонандаи дастрас ҳанӯз ягон дарс накардаанд ва
 * забони ҳадаф ҳам надоранд, пас барои онҳо ин матн мебарояд — на ҳамчун ном,
 * балки ҳамчун ҷумлаи мустақил. Шаблонҳо `{lesson}`-ро БЕ нохунак истифода
 * мебаранд, вагарна «Дарси «дарси навбатӣ»» мешуд.
 */
function fallbacks(lang: TplLang) {
  return {
    // Бо ҳарфи калон: шаблонҳо `{name}`-ро ҳам дар АВВАЛИ ҷумла истифода
    // мебаранд («{name}, вақти дарс расид»), пас ҳарфи хурд он ҷо хато мешуд.
    name: { tg: 'Дӯст', ru: 'Друг', en: 'Friend' }[lang],
    lesson: { tg: 'Дарси навбатӣ', ru: 'Следующий урок', en: 'The next lesson' }[lang],
    course: { tg: 'Курсат', ru: 'Твой курс', en: 'Your course' }[lang],
  };
}

export type RenderOptions = {
  tzOffsetMin?: number;
  /** Соати маҳаллии дедлайн барои {countdown} (мас. 24 = нимишаб). */
  countdownToHour?: number | null;
  now?: Date;
};

/**
 * Як сатри шаблонро барои як хонанда пур мекунад.
 * Ҷойгузори номаълум бетағйир мемонад — то хатои имло дар панел ноаён нашавад.
 */
export function renderTemplate(
  template: string,
  ctx: LearnerContext,
  opts: RenderOptions = {},
): string {
  const lang = ctx.lang as TplLang;
  const fb = fallbacks(lang);
  const now = opts.now ?? new Date();
  const tz = opts.tzOffsetMin ?? 300;

  const countdownMin =
    opts.countdownToHour != null
      ? minutesUntilLocalHour(now, tz, opts.countdownToHour)
      : null;

  const map: Record<string, string> = {
    '{name}': ctx.firstName || fb.name,
    '{streak}': String(ctx.streak),
    '{longest_streak}': String(ctx.longestStreak),
    '{lesson}': ctx.nextLesson || ctx.courseTitle || fb.lesson,
    '{course}': ctx.courseTitle || fb.course,
    '{minutes}': String(ctx.nextLessonMinutes ?? 5),
    '{hearts}': String(ctx.hearts),
    '{max_hearts}': String(ctx.maxHearts),
    '{gems}': String(ctx.gems),
    '{level}': ctx.level,
    '{days_inactive}': String(ctx.daysInactive),
    '{countdown}': countdownMin != null ? formatCountdown(countdownMin, lang) : '',
    '{countdown_short}': countdownMin != null ? shortCountdown(countdownMin) : '',
  };

  let out = template;
  for (const [k, v] of Object.entries(map)) {
    out = out.split(k).join(v);
  }
  // Ду фосилаи паиҳам (аз ҷойгузори холӣ) → як фосила.
  return out.replace(/[ \t]{2,}/g, ' ').trim();
}

export type CampaignTexts = Partial<Record<TplLang, { title: string; body: string }>>;

/** Матни забони корбар; агар набошад — тоҷикӣ, вагарна аввалин мавҷуда. */
export function pickText(texts: CampaignTexts, lang: string): { title: string; body: string } | null {
  const l = (lang as TplLang) ?? 'tg';
  return texts[l] ?? texts.tg ?? texts.ru ?? texts.en ?? null;
}

/** Матни тайёри як кампания барои як хонанда. */
export function renderCampaignText(
  texts: CampaignTexts,
  ctx: LearnerContext,
  opts: RenderOptions = {},
): { title: string; body: string } | null {
  const t = pickText(texts, ctx.lang);
  if (!t) return null;
  return {
    title: renderTemplate(t.title ?? '', ctx, opts),
    body: renderTemplate(t.body ?? '', ctx, opts),
  };
}
