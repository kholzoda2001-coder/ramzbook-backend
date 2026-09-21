// Аудити ФИЛТРҲОИ саҳифаи /admin/users бо маълумоти ВОҚЕИИ продакшн.
//
// Ҳар филтр дар клиент кор мекунад (`app/admin/users/page.tsx`), вале
// маълумот аз `/api/admin/users` меояд. Ин скрипт ҳамон майдонҳоро мегирад
// ва мепурсад: «оё филтр РОСТ ҷавоб медиҳад?»
//
//   node prisma/_admin-users-filter-audit.mjs
//
// ⚠️ ДОМИ ВАҚТ: ҳамаи сутунҳои вақт дар база `timestamp WITHOUT time zone`-анд
// ва рақами UTC-ро нигоҳ медоранд. Драйвери HTTP-и Neon онҳоро ҳамчун вақти
// МАҲАЛЛИИ ин компютер мехонад — дар мошини UTC+4 ҳар сана 4 соат ҷилав
// мепарад. Prisma (ва саҳифаи админ) онҳоро дуруст ҳамчун UTC мехонад.
// Пас: барои муқоисаи ДАҚИҚИ вақт ин скриптро ба Postgres ҳисоб кунонед
// (`completedAt + interval '5 hours'` дар худи SQL), на дар JS.
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);

const rows = await sql`
  SELECT id, name, email, phone, "isActive", "isPremium", "premiumPlan",
         "premiumExpiresAt", "totalXp", streak, "lastActiveDate", "tzOffsetMin",
         "streakFreezesAvailable", "createdAt", "lastActiveAt",
         "interfaceLang", "targetLang", level, country
  FROM "User"
`;

const isTest = (u) => {
  const name = (u.name ?? '').trim();
  const email = (u.email ?? '').trim().toLowerCase();
  return name.startsWith('Test User') || name.includes('@') ||
         email.endsWith('@cloudtestlabaccounts.com');
};

const now = new Date();
const n = rows.length;
const real = rows.filter((u) => !isTest(u));
console.log(`\n═══ ҶАМЪ: ${n} корбар · воқеӣ ${real.length} · тестӣ ${n - real.length}\n`);

const pct = (k) => `${k} (${((k / n) * 100).toFixed(1)}%)`;

// ── 1. Майдонҳои ХОЛӢ, ки филтрҳо ба онҳо такя мекунанд ───────────────────
console.log('① Майдонҳои холӣ (филтр ба онҳо такя мекунад)');
for (const f of ['lastActiveAt', 'lastActiveDate', 'targetLang', 'interfaceLang', 'level', 'country']) {
  const empty = rows.filter((u) => u[f] === null || u[f] === undefined || u[f] === '').length;
  console.log(`   ${f.padEnd(16)} холӣ: ${pct(empty)}`);
}

// ── 2. lastActiveAt ↔ lastActiveDate ─────────────────────────────────────
const day = (d) => (d ? new Date(d).toISOString().slice(0, 10) : null);
const bothSet = rows.filter((u) => u.lastActiveAt && u.lastActiveDate);
const disagree = bothSet.filter((u) => day(u.lastActiveAt) !== day(u.lastActiveDate));
console.log(`\n② lastActiveAt ↔ lastActiveDate: ҳарду ҳаст дар ${bothSet.length}, рӯзи ГУНОГУН дар ${disagree.length}`);
const onlyDate = rows.filter((u) => !u.lastActiveAt && u.lastActiveDate).length;
const onlyAt = rows.filter((u) => u.lastActiveAt && !u.lastActiveDate).length;
console.log(`   танҳо lastActiveDate: ${onlyDate} · танҳо lastActiveAt: ${onlyAt}`);

// ── 3. Филтри «Вақти фаъолият» ───────────────────────────────────────────
const diffDays = (u) => (now.getTime() - new Date(u.lastActiveAt).getTime()) / 86400000;
const never = rows.filter((u) => !u.lastActiveAt);
const bucket = (name, f) => {
  const k = rows.filter((u) => u.lastActiveAt && f(diffDays(u))).length;
  console.log(`   ${name.padEnd(22)} ${k}`);
};
console.log('\n③ Филтри «Вақти фаъолият» (мантиқи ҲОЗИРАИ саҳифа)');
bucket('Имрӯз (24 соат)', (d) => d <= 1);
bucket('3 рӯз', (d) => d <= 3);
bucket('7 рӯз', (d) => d <= 7);
bucket('30 рӯз', (d) => d <= 30);
bucket('Ғайрифаъол >30', (d) => d > 30);
console.log(`   ҲЕҶ ГОҲ фаъол набуда  ${never.length}  ← дар ҳеҷ як сатил НЕСТ`);

// «Имрӯз» ҳамчун рӯзи ТАҚВИМИИ Душанбе (UTC+5)
const TZ = 300;
const localDay = (d) => Math.floor((new Date(d).getTime() + TZ * 60000) / 86400000);
const today = localDay(now);
const calToday = rows.filter((u) => u.lastActiveAt && localDay(u.lastActiveAt) === today).length;
const rolling = rows.filter((u) => u.lastActiveAt && diffDays(u) <= 1).length;
console.log(`   «Имрӯз» тақвимӣ (Душанбе): ${calToday} · «24 соат»: ${rolling} → фарқ ${rolling - calToday}`);

// ── 4. Premium ───────────────────────────────────────────────────────────
const apiPremium = (u) => u.isPremium && (u.premiumPlan === 'lifetime' || (!!u.premiumExpiresAt && new Date(u.premiumExpiresAt) >= now));
console.log('\n④ Филтри «Обуна»');
console.log(`   API-premium: ${rows.filter(apiPremium).length}`);
console.log(`   DB isPremium=true: ${rows.filter((u) => u.isPremium).length}`);
console.log(`   isPremium=true, вале мӯҳлат гузашт: ${rows.filter((u) => u.isPremium && !apiPremium(u)).length}`);
console.log(`   isPremium=false, вале plan ҳаст: ${rows.filter((u) => !u.isPremium && u.premiumPlan).length}`);
const plans = {};
for (const u of rows) plans[u.premiumPlan ?? '—'] = (plans[u.premiumPlan ?? '—'] ?? 0) + 1;
console.log(`   планҳо: ${JSON.stringify(plans)}`);

// ── 5. Забонҳо ва сатҳ ───────────────────────────────────────────────────
const tally = (f) => {
  const m = {};
  for (const u of rows) m[u[f] ?? 'NULL'] = (m[u[f] ?? 'NULL'] ?? 0) + 1;
  return m;
};
console.log('\n⑤ Забон ва сатҳ');
console.log(`   interfaceLang: ${JSON.stringify(tally('interfaceLang'))}`);
console.log(`   targetLang:    ${JSON.stringify(tally('targetLang'))}`);
console.log(`   level:         ${JSON.stringify(tally('level'))}`);

// Сатҳ vs XP: оё `level` ба ҳақиқат мувофиқ аст?
const withXp = rows.filter((u) => u.totalXp > 0);
const a1WithBigXp = withXp.filter((u) => u.level === 'A1' && u.totalXp > 5000).length;
console.log(`   level='A1' вале XP>5000: ${a1WithBigXp}`);

// ── 6. Streak: рақами мурда ↔ зинда ──────────────────────────────────────
const localDayIdx = (d, tz) => Math.floor((new Date(d).getTime() + tz * 60000) / 86400000);
const liveStreak = (u) => {
  if (u.streak <= 0 || !u.lastActiveDate) return 0;
  const tz = u.tzOffsetMin ?? TZ;
  const missed = Math.max(0, localDayIdx(now, tz) - localDayIdx(u.lastActiveDate, tz) - 1);
  if (missed === 0) return Math.max(0, u.streak);
  const freezes = Math.max(0, u.streakFreezesAvailable ?? 0);
  const spent = Math.min(missed, freezes);
  return Math.max(0, u.streak - (missed - spent));
};
const dbStreakPos = rows.filter((u) => u.streak > 0).length;
const liveStreakPos = rows.filter((u) => liveStreak(u) > 0).length;
console.log(`\n⑥ Стрик: DB > 0 → ${dbStreakPos} · ЗИНДА > 0 → ${liveStreakPos}`);

// ── 7. Ҷустуҷӯ: оё бо ID / телефон кор мекунад? ──────────────────────────
const shadow = rows.filter((u) => u.email && u.email.endsWith('@ramzbook.tj')).length;
const withPhone = rows.filter((u) => u.phone).length;
console.log(`\n⑦ Ҷустуҷӯ: почтаи сояи @ramzbook.tj — ${shadow} · phone пур — ${withPhone}`);
const sample = rows.slice(0, 3).map((u) => ({ id: u.id, name: u.name, email: u.email, phone: u.phone }));
console.log(`   намуна: ${JSON.stringify(sample)}`);

// ── 8. isActive ──────────────────────────────────────────────────────────
console.log(`\n⑧ isActive=false: ${rows.filter((u) => !u.isActive).length} ← филтр УМУМАН нест`);
