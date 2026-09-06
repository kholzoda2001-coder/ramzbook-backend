/**
 * Шакли профили ҶАМЪИЯТИИ корбар — он чизе, ки хонандаи дигар мебинад.
 *
 * ── Чаро ин файл ҳаст ──────────────────────────────────────────────────────
 * Клик ба ном дар рейтинг варақаи профилро мекушояд. Ин ЯГОНА ҷоест, ки
 * маълумоти як корбар ба корбари ДИГАР дода мешавад — пас қоидаи «чӣ намоён
 * аст» бояд дар як ҷои санҷидашаванда бошад, на дар дохили роут.
 *
 * ⚠️ Қоидаи асосӣ: ин ҷо ТАНҲО пешрафти таълим меравад. `email`, `phone`,
 * `passwordHash`, харид, обуна ва ҳисоби дил ҲЕҶ ГОҲ. Роут майдонҳоро
 * ошкоро интихоб мекунад ва [publicName] ном ҳам мебурад — ду қабат, чунки
 * як `select: true`-и тасодуфӣ дар оянда метавонад ҳамаро берун барорад.
 *
 * Ҳамаи функсияҳо СОФанд — бе Prisma, бе вақти ҷорӣ аз дохил. Вақт ҳамеша
 * ҳамчун аргумент меояд, вагарна тест дар нисфи шаб меафтад.
 */

/** Чанд рӯзи охирин дар навори фаъолият. */
export const WEEK_DAYS = 7;

/**
 * Номи намоишӣ: танҳо ҷузъи АВВАЛ, бе почта.
 *
 * ⚠️ Ин такрори `leaderboardDisplayName`-и барнома аст ва ҚАСДАН такрор
 * шудааст. Агар танҳо телефон ном мебурид, ҳар мизоҷи дигар (веб, админ,
 * скрипт) почтаи пурраи корбарро мегирифт. Ҳимоя бояд дар ҷое бошад, ки
 * маълумот аз он мебарояд.
 */
export function publicName(raw: string | null | undefined): string {
  let s = (raw ?? '').trim();
  if (!s) return '';
  if (s.indexOf('@') !== -1) s = s.split('@')[0];
  const parts = s.split(/[\s._\-]+/).filter((p) => p.trim().length > 0);
  s = parts.length > 0 ? parts[0] : s;
  if (!s) return '';
  return s[0].toUpperCase() + s.slice(1);
}

/** Як рӯзи навори фаъолият. */
export interface WeekDay {
  /** `YYYY-MM-DD` — ҳамон рӯз бо вақти UTC. */
  date: string;
  xp: number;
}

/** Сатри хоми `DailyXp`. */
export interface DailyXpRow {
  date: Date;
  xp: number;
}

/** `Date` → `YYYY-MM-DD` бо UTC (ҳамон тавре, ки `@db.Date` нигоҳ медорад). */
export function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Навори [WEEK_DAYS]-рӯза, ки бо СИФР пур карда мешавад.
 *
 * ⚠️ Рӯзи БЕ фаъолият дар `DailyXp` сатр НАДОРАД. Агар мо танҳо сатрҳоро
 * медодем, навор 3–4 сутун мешуд ва «ҳафтаи пурра»-и тарҳ вайрон мебуд —
 * бадтараш, рӯзи холӣ ба назар намерасид ва хонанда фикр мекард, ки ӯ ҳар
 * рӯз хондааст.
 *
 * Тартиб ҳамеша аз КӮҲНА ба НАВ, ва рӯзи охирин ҳамеша [today] аст.
 */
export function weekStrip(rows: DailyXpRow[], today: Date): WeekDay[] {
  const byDay = new Map<string, number>();
  for (const r of rows) byDay.set(dayKey(r.date), r.xp);

  const out: WeekDay[] = [];
  for (let i = WEEK_DAYS - 1; i >= 0; i--) {
    const d = new Date(today.getTime());
    d.setUTCDate(d.getUTCDate() - i);
    const key = dayKey(d);
    out.push({ date: key, xp: byDay.get(key) ?? 0 });
  }
  return out;
}

/**
 * Фоизи хатми курс.
 *
 * `total === 0` → `0`, на `NaN`. Курси холӣ (мазмунаш ҳанӯз нарехта) набояд
 * дар экран `NaN%` нишон диҳад.
 */
export function coursePercent(completed: number, total: number): number {
  if (total <= 0) return 0;
  const p = Math.round((completed / total) * 100);
  return Math.max(0, Math.min(100, p));
}

/** Ҳолати фаъолият барои нуқтаи сабз дар сарлавҳа. */
export type Presence = 'today' | 'week' | 'away';

/**
 * Кай ин корбар бори охир ХОНДААСТ.
 *
 * ⚠️ Манбаъ `lastStudyAt` аст, на `lastActiveAt`. `lastActiveAt` ҳангоми
 * ҳар кушодани барнома навсозӣ мешавад — яъне «фаъол буд» -и он маънои
 * «хондааст»-ро надорад ва ба хонандаи дигар тасвири бардурӯғ медиҳад.
 */
export function presence(
  lastStudyAt: Date | null | undefined,
  now: Date,
): Presence {
  if (!lastStudyAt) return 'away';
  const days =
    (Date.parse(dayKey(now)) - Date.parse(dayKey(lastStudyAt))) / 86_400_000;
  if (days <= 0) return 'today';
  if (days < WEEK_DAYS) return 'week';
  return 'away';
}
