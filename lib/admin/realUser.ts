/**
 * «Корбари ВОҚЕӢ» — ЯГОНА таърифи он, ки кадом ҳисоб ба омор дохил мешавад.
 *
 * ── Чаро ин файл ҳаст ──────────────────────────────────────────────────────
 * Ҳамин шарт пештар дар ПАНҶ ҷо дастӣ такрор мешуд (dashboard-и админ, саҳифаи
 * Аналитика, роути `stats/dashboard`, сегментҳои push ва ду `$queryRaw`), ва
 * ҳар нусха танҳо `Test User%`-ро медонист. Дар натиҷа ҳисобҳои РОБОТИИ Google
 * дар ҳамаи рақамҳо ҳамчун «корбар» ҳисоб мешуданд. Таъриф бояд дар як ҷои
 * тестшаванда бошад, вагарна нусхаи шашум боз аз ҳад мемонад.
 *
 * ⚠️ Ин ҷо ҲЕҶ ЧИЗ нест карда намешавад ва ҳеҷ ҳисоб маҳдуд намешавад — ин
 * танҳо филтри ХОНИШ барои омори админ аст. Ҳисобҳои санҷишӣ дар база
 * мемонанд, чунки Google метавонад ҳамонҳоро дар санҷиши билди оянда
 * истифода барад.
 */

import { Prisma } from '@prisma/client';

/** Ҳисобҳои seed-и худамон: `Test User 1`, `Test User 2`… (10 дона). */
export const TEST_NAME_PREFIX = 'Test User';

/**
 * Домени РАСМИИ ҳисобҳои Firebase Test Lab / Google Play pre-launch report.
 * Ҳангоми ҳар нашри билди нав Google барномаро дар дастгоҳҳои худ мекушояд ва
 * бо чунин ҳисоб ворид мешавад.
 */
export const GOOGLE_TEST_EMAIL_DOMAIN = '@cloudtestlabaccounts.com';

/**
 * Роботи pre-launch баъди вуруд бо Google ба экрани «Профилро пур кун» мерасад
 * ва ба майдони НОМ сатреро менависад, ки дар Play Console ҳамчун ҳисоби
 * санҷишӣ дода шудааст — яъне як ПОЧТА. Пас «ном почта аст» аломати боэътимоди
 * ҳисоби робот аст.
 *
 * ⚠️ Ин қоида дар продакшн ЧЕНИДА шудааст (9 сентябри 2026): 41 мувофиқат, ва
 * ҳар 41-тоаш робот — ягон хонандаи воқеӣ дар майдони ном почта НАДОШТ. Ва
 * акнун `lib/profile/displayName.ts` дар сарҳади сервер чунин номро умуман
 * қабул намекунад, пас ин сатил дигар бо одам пур намешавад.
 *
 * ⚠️ Номи РАҚАМДОР қасдан ин ҷо НЕСТ: `Izatullo 71`, `malaev.m7`, `1234`
 * (5820 XP) — инҳо хонандагони ҳақиқӣ ва фаъоланд.
 */
export function isTestAccount(u: { name?: string | null; email?: string | null }): boolean {
  const name = (u.name ?? '').trim();
  const email = (u.email ?? '').trim().toLowerCase();
  if (name.startsWith(TEST_NAME_PREFIX)) return true;
  if (name.includes('@')) return true;
  if (email.endsWith(GOOGLE_TEST_EMAIL_DOMAIN)) return true;
  return false;
}

/**
 * Ҳамон таъриф ҳамчун шарти Prisma. Бо `{ ...realUserWhere, createdAt: … }`
 * васл кардан бехатар аст, чунки ҳама чиз дар як калиди `AND` аст.
 */
export const realUserWhere: Prisma.UserWhereInput = {
  AND: [
    { NOT: { name: { startsWith: TEST_NAME_PREFIX } } },
    { NOT: { name: { contains: '@' } } },
    { NOT: { email: { endsWith: GOOGLE_TEST_EMAIL_DOMAIN } } },
  ],
};

/**
 * Ҳамон таъриф барои `$queryRaw`, бо алиаси ҷадвали `User`.
 *
 * `name` дар схема ҳатмист, вале дар SQL-и мавҷуда `IS NULL` санҷида мешуд —
 * ҳамон эҳтиёткориро нигоҳ медорем, то сатри тасодуфан холӣ аз ҳисоб напарад.
 */
export function realUserSql(alias = 'u'): string {
  const n = `${alias}."name"`;
  const e = `${alias}."email"`;
  return (
    `((${n} IS NULL OR (${n} NOT LIKE '${TEST_NAME_PREFIX}%' AND ${n} NOT LIKE '%@%')) ` +
    `AND (${e} IS NULL OR ${e} NOT LIKE '%${GOOGLE_TEST_EMAIL_DOMAIN}'))`
  );
}
