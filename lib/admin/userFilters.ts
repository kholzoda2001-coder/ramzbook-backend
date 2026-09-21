/**
 * Филтрҳои саҳифаи /admin/users — ЯГОНА ҷои мантиқ, то тестшаванда бошад.
 *
 * ── Чаро ин файл ҳаст ──────────────────────────────────────────────────────
 * Филтрҳо рост дар JSX навишта шуда буданд ва ҳеҷ гоҳ санҷида намешуданд.
 * Аудити 21.09.2026 бо маълумоти ВОҚЕИИ продакшн (271 корбар) нишон дод, ки
 * ду филтр ҷавоби НОДУРУСТ медоданд:
 *
 *   🔴 «Забони омӯзишӣ» — ба `User.targetLang` такя мекард, ки дар 180 аз 271
 *      сатр NULL аст. 79 корбаре, ки ВОҚЕАН дарс мехонанд (яке аз онҳо 234
 *      дарси англисӣ!), дар филтри `en` умуман пайдо намешуданд.
 *      Ҳал: забон аз ПРОГРЕССИ ҳақиқӣ ҳисоб мешавад (`langs`), ва як корбар
 *      метавонад якчанд забон дошта бошад (18 нафар доранд).
 *
 *   🔴 «Сатҳ» — `User.level` барои ҲАР 271 корбар 'A1' аст (17 нафар бо XP >
 *      5000 ҳам «A1»). Рӯйхат як вариант дошт ва ҳеҷ чизро ҷудо намекард.
 *      Ҳал: сатҳи БОЛОТАРИНИ курсе, ки корбар дар он прогресс дорад
 *      (`studyLevel`) — дар база воқеан A1/A2/B1 ҳаст.
 *
 *   🟠 «Имрӯз» — тирезаи ГАРДОНИ 24-соата буд, на рӯзи тақвимии Душанбе:
 *      13 корбар ба ҷои 5 нишон медод.
 */

import { DEFAULT_TZ_OFFSET_MIN, localDayIndex } from '../localDay';

export const LEVEL_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

/** Планҳои ПУЛАКӢ — `promo` ин ҷо нест: он тӯҳфа аст, на даромад. */
export const PAID_PLANS = ['monthly', 'sixmonths', 'yearly', 'lifetime'];

export type AdminUserRow = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  isActive: boolean;
  isPremium: boolean;
  premiumPlan: string | null;
  totalXp: number;
  streak: number;
  createdAt: string;
  lastActiveAt: string | null;
  interfaceLang: string;
  targetLang: string | null;
  level: string;
  /** Забонҳое, ки корбар ВОҚЕАН дарс хондааст (аз `UserProgress`). */
  langs?: string[];
  /** Сатҳи болотарини курси хондашуда — `User.level` ба ҳеҷ ваҷҳ ин нест. */
  studyLevel?: string | null;
  lessonsDone?: number;
  isTest?: boolean;
};

export type UserFilters = {
  search: string;
  nativeLang: string;
  targetLang: string;
  minXp: string;
  maxXp: string;
  minStreak: string;
  maxStreak: string;
  level: string;
  /** all | premium | paid | promo | free */
  premium: string;
  /** all | real | test */
  isTest: string;
  /** all | today | 3days | 7days | 30days | inactive */
  lastActive: string;
};

export const EMPTY_FILTERS: UserFilters = {
  search: '', nativeLang: '', targetLang: '',
  minXp: '', maxXp: '', minStreak: '', maxStreak: '',
  level: '', premium: 'all', isTest: 'real', lastActive: 'all',
};

/** Забонҳои корбар: прогресси ҲАҚИҚӢ аввал, `targetLang` ҳамчун захира. */
export function userLangs(u: AdminUserRow): string[] {
  const out = [...(u.langs ?? [])];
  if (u.targetLang && !out.includes(u.targetLang)) out.push(u.targetLang);
  return out;
}

/** Сатҳи ВОҚЕӢ — аз курси хондашуда; `User.level` танҳо захира. */
export function userLevel(u: AdminUserRow): string {
  return u.studyLevel || u.level || 'A1';
}

/** Он чи дар сатр нишон дода мешавад: телефон, ё почтаи ҳақиқӣ. */
export function displayContact(u: AdminUserRow): string {
  if (u.phone) return u.phone;
  if (u.email && u.email.endsWith('@ramzbook.tj')) {
    return '+' + u.email.replace('@ramzbook.tj', '');
  }
  return u.email || 'Номаълум';
}

/**
 * Чанд рӯзи ТАҚВИМӢ аз фаъолияти охирин гузашт (вақти Душанбе).
 * Имрӯз → 0, дирӯз → 1. `null` = ҳеҷ гоҳ фаъол набуд.
 */
export function daysSinceActive(u: AdminUserRow, now: Date): number | null {
  if (!u.lastActiveAt) return null;
  const tz = DEFAULT_TZ_OFFSET_MIN;
  return localDayIndex(now, tz) - localDayIndex(new Date(u.lastActiveAt), tz);
}

/** Танҳо рақамҳо — барои муқоисаи телефон (+992 90 123 45 67 ↔ 992901234567). */
const digits = (s: string) => s.replace(/\D+/g, '');

function matchesSearch(u: AdminUserRow, raw: string): boolean {
  const q = raw.trim().toLowerCase();
  if (!q) return true;

  const haystack = [
    u.name ?? '',
    u.email ?? '',
    displayContact(u),
    u.id, // ID дар ҷадвал НИШОН дода мешавад — пас бояд ҷустуҷӯ ҳам шавад
  ].join(' ').toLowerCase();
  if (haystack.includes(q)) return true;

  // Рақами телефон бо фосила/қавс навишта шуда бошад.
  const dq = digits(q);
  if (dq.length >= 4) {
    const dh = digits(`${u.phone ?? ''} ${u.email ?? ''}`);
    if (dh.includes(dq)) return true;
  }
  return false;
}

export function matchesFilters(
  u: AdminUserRow,
  f: UserFilters,
  now: Date = new Date(),
): boolean {
  if (!matchesSearch(u, f.search)) return false;

  if (f.nativeLang && u.interfaceLang !== f.nativeLang) return false;
  if (f.targetLang && !userLangs(u).includes(f.targetLang)) return false;

  // `Number`, на `parseInt`: «1e3» → 1000, на 1. Матни нодуруст → NaN →
  // филтр сарфи назар мешавад (вагарна ҳама сатр аз ҷадвал мепарид).
  const minXp = Number(f.minXp);
  const maxXp = Number(f.maxXp);
  if (f.minXp !== '' && Number.isFinite(minXp) && u.totalXp < minXp) return false;
  if (f.maxXp !== '' && Number.isFinite(maxXp) && u.totalXp > maxXp) return false;

  const minSt = Number(f.minStreak);
  const maxSt = Number(f.maxStreak);
  if (f.minStreak !== '' && Number.isFinite(minSt) && u.streak < minSt) return false;
  if (f.maxStreak !== '' && Number.isFinite(maxSt) && u.streak > maxSt) return false;

  if (f.level && userLevel(u) !== f.level) return false;

  const paid = u.isPremium && PAID_PLANS.includes(u.premiumPlan ?? '');
  const promo = u.isPremium && !paid;
  if (f.premium === 'premium' && !u.isPremium) return false;
  if (f.premium === 'paid' && !paid) return false;
  if (f.premium === 'promo' && !promo) return false;
  if (f.premium === 'free' && u.isPremium) return false;

  if (f.isTest === 'real' && u.isTest) return false;
  if (f.isTest === 'test' && !u.isTest) return false;

  if (f.lastActive !== 'all') {
    const d = daysSinceActive(u, now);
    // Ҳеҷ гоҳ фаъол набуда = ҒАЙРИФАЪОЛ-и комил, на «ҳеҷ ҷо».
    if (d === null) return f.lastActive === 'inactive';
    if (f.lastActive === 'today' && d !== 0) return false;
    if (f.lastActive === '3days' && d > 2) return false;
    if (f.lastActive === '7days' && d > 6) return false;
    if (f.lastActive === '30days' && d > 29) return false;
    if (f.lastActive === 'inactive' && d <= 29) return false;
  }

  return true;
}

export function sortUsers(rows: AdminUserRow[], sortConfig: string): AdminUserRow[] {
  const [field, order] = sortConfig.split('-');
  const m = order === 'desc' ? -1 : 1;
  const time = (s: string | null) => (s ? new Date(s).getTime() : 0);

  return [...rows].sort((a, b) => {
    if (field === 'totalXp') return (a.totalXp - b.totalXp) * m;
    if (field === 'streak') return (a.streak - b.streak) * m;
    if (field === 'createdAt') return (time(a.createdAt) - time(b.createdAt)) * m;
    if (field === 'lastActiveAt') return (time(a.lastActiveAt) - time(b.lastActiveAt)) * m;
    if (field === 'name') {
      return (a.name ?? '').localeCompare(b.name ?? '', 'ru') * m;
    }
    return 0;
  });
}

/** Ҳамаи забонҳои мавҷуда дар рӯйхат — барои dropdown. */
export function allTargetLangs(rows: AdminUserRow[]): string[] {
  const s = new Set<string>();
  for (const u of rows) for (const l of userLangs(u)) s.add(l);
  return Array.from(s).sort();
}

export function allLevels(rows: AdminUserRow[]): string[] {
  const s = new Set<string>();
  for (const u of rows) s.add(userLevel(u));
  return Array.from(s).sort((a, b) => LEVEL_ORDER.indexOf(a) - LEVEL_ORDER.indexOf(b));
}
