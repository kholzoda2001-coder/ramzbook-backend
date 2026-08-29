/**
 * «Агар push ҳозир зинда мешуд, ҳар кампания ба ЧАНД нафар мерасид?»
 *
 * Мантиқи `lib/pushSegments.buildWhere`-ро дар SQL такрор мекунад ва барои ҳар
 * кампанияи фаъол аудиторияи ВОҚЕИРО мешуморад. Ин ягона роҳи бе фиристодан
 * фаҳмидани он аст, ки ҳадафгирӣ дуруст аст ё не (мас. агар кампанияи «имрӯз
 * нахондаанд» ба 0 нафар мерасид, маънояш филтр вайрон аст).
 *
 * Иҷро: node prisma/_push-audience-http.mjs
 */
import fs from 'node:fs';
import { neon } from '@neondatabase/serverless';

const envText = fs.readFileSync(new URL('../.env', import.meta.url), 'utf8');
const env = {};
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)\s*=\s*"?([^"]*)"?\s*$/);
  if (m) env[m[1]] = m[2];
}
const sql = neon(env.DATABASE_URL);

/** Оғози рӯзи МАҲАЛЛӢ ҳамчун лаҳзаи UTC (ҳамон мантиқи localDayStart). */
function localDayStart(now, tzOffsetMin) {
  const shifted = new Date(now.getTime() + tzOffsetMin * 60_000);
  const midnight = Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate());
  return new Date(midnight - tzOffsetMin * 60_000);
}

const now = new Date();
const campaigns = await sql`
  select id, name, hour, minute, "tzOffsetMin", langs, tier, "studiedToday",
         "minStreak", "maxStreak", "minInactiveDays", "maxInactiveDays", levels, countries
  from "PushCampaign" where "isActive" = true order by hour, minute`;

const parse = (v) => (v ? v.split(',').map((s) => s.trim()).filter(Boolean) : null);

console.log(`\nВақти ҳозира: ${now.toISOString()} (UTC)\n`);
console.log('Аудиторияи ҲОЗИРАИ ҳар кампания:');

let reachable = 0;
for (const c of campaigns) {
  const cond = [`u."pushEnabled" = true`, `exists (select 1 from "DeviceToken" d where d."userId" = u.id)`, `u.name not like 'Test User%'`];
  const langs = parse(c.langs);
  if (langs) cond.push(`u."interfaceLang" = any(${lit(langs)})`);
  const levels = parse(c.levels);
  if (levels) cond.push(`u.level = any(${lit(levels)})`);
  const countries = parse(c.countries);
  if (countries) cond.push(`u.country = any(${lit(countries)})`);
  if (c.tier === 'premium') cond.push(`u."subscriptionTier" = 'premium'`);
  else if (c.tier === 'free') cond.push(`u."subscriptionTier" <> 'premium'`);
  if (c.minStreak != null) cond.push(`u.streak >= ${c.minStreak}`);
  if (c.maxStreak != null) cond.push(`u.streak <= ${c.maxStreak}`);
  if (c.minInactiveDays != null) cond.push(`u."lastActiveAt" < '${new Date(now.getTime() - c.minInactiveDays * 86400000).toISOString()}'`);
  if (c.maxInactiveDays != null) cond.push(`u."lastActiveAt" >= '${new Date(now.getTime() - (c.maxInactiveDays + 1) * 86400000).toISOString()}'`);
  if (c.studiedToday === 'no') {
    const ds = localDayStart(now, c.tzOffsetMin).toISOString();
    cond.push(`(u."lastActiveDate" is null or u."lastActiveDate" < '${ds}')`);
  } else if (c.studiedToday === 'yes') {
    const ds = localDayStart(now, c.tzOffsetMin).toISOString();
    cond.push(`u."lastActiveDate" >= '${ds}'`);
  }

  const rows = await sql.query(`select count(*)::int as n from "User" u where ${cond.join(' and ')}`);
  const n = rows[0].n;
  reachable = Math.max(reachable, 0);
  const time = `${String(c.hour).padStart(2, '0')}:${String(c.minute).padStart(2, '0')}`;
  console.log(`  ${time}  ${String(n).padStart(4)} нафар  · ${c.name}`);
}

const [{ n: total }] = await sql`
  select count(*)::int as n from "User" u
  where u."pushEnabled" = true
    and exists (select 1 from "DeviceToken" d where d."userId" = u.id)
    and u.name not like 'Test User%'`;
console.log(`\nҲамагӣ дастрас (token + огоҳии фаъол): ${total} нафар`);

function lit(arr) {
  return `array[${arr.map((s) => `'${s.replace(/'/g, "''")}'`).join(',')}]`;
}
