// Санҷиши филтрҳои /admin/users бо маълумоти ВОҚЕИИ продакшн: КӮҲНА ↔ НАВ.
//
// Ҳамон коре, ки API акнун мекунад (забон ва сатҳ аз прогресс), ин ҷо такрор
// мешавад ва натиҷаи ҳар филтр бо мантиқи пештара муқоиса мегардад.
//
//   node prisma/_admin-users-filter-verify.mjs
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

const LEVEL_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const TZ = 300;
const dayIdx = (d) => Math.floor((new Date(d).getTime() + TZ * 60000) / 86400000);

const users = await sql`
  SELECT id, name, email, phone, "isPremium", "premiumPlan", "premiumExpiresAt",
         "totalXp", streak, "lastActiveDate", "tzOffsetMin", "streakFreezesAvailable",
         "createdAt", "lastActiveAt", "interfaceLang", "targetLang", level
  FROM "User"`;

const study = await sql`
  SELECT up."userId" AS uid, tl.code AS code, c.level AS level, COUNT(*)::int AS lessons
  FROM "UserProgress" up
  JOIN "Lesson" le ON le.id = up."lessonId"
  JOIN "Module" m  ON m.id  = le."moduleId"
  JOIN "Course" c  ON c.id  = m."courseId"
  JOIN "Language" tl ON tl.id = c."targetLanguageId"
  WHERE up."isCompleted" = true
  GROUP BY 1, 2, 3`;

const map = new Map();
for (const r of study) {
  const cur = map.get(r.uid) ?? { langs: [], level: 'A1', lessons: 0 };
  if (!cur.langs.includes(r.code)) cur.langs.push(r.code);
  if (LEVEL_ORDER.indexOf(r.level) > LEVEL_ORDER.indexOf(cur.level)) cur.level = r.level;
  cur.lessons += r.lessons;
  map.set(r.uid, cur);
}

const isTest = (u) => {
  const n = (u.name ?? '').trim(), e = (u.email ?? '').trim().toLowerCase();
  return n.startsWith('Test User') || n.includes('@') || e.endsWith('@cloudtestlabaccounts.com');
};

const rows = users.map((u) => {
  const st = map.get(u.id);
  return { ...u, isTest: isTest(u), langs: st?.langs ?? [], studyLevel: st?.level ?? null, lessonsDone: st?.lessons ?? 0 };
});
const real = rows.filter((u) => !u.isTest);   // пешфарзи саҳифа

const newLangs = (u) => {
  const out = [...u.langs];
  if (u.targetLang && !out.includes(u.targetLang)) out.push(u.targetLang);
  return out;
};
const newLevel = (u) => u.studyLevel || u.level || 'A1';

const line = (label, oldN, newN) => {
  const mark = oldN === newN ? '  =' : ' ▲▲';
  console.log(`   ${label.padEnd(26)} кӯҳна ${String(oldN).padStart(4)}  →  нав ${String(newN).padStart(4)} ${mark}`);
};

console.log(`\n═══ ${rows.length} корбар · воқеӣ ${real.length} (пешфарзи саҳифа)\n`);

console.log('① ФИЛТРИ «Забони омӯзишӣ»');
const codes = Array.from(new Set(real.flatMap(newLangs))).sort();
for (const c of codes) {
  line(c.toUpperCase(), real.filter((u) => u.targetLang === c).length,
                        real.filter((u) => newLangs(u).includes(c)).length);
}
line('ҶАМЪИ дастрас', real.filter((u) => u.targetLang).length,
                      real.filter((u) => newLangs(u).length).length);

console.log('\n② ФИЛТРИ «Сатҳ»');
const levels = Array.from(new Set(real.map(newLevel))).sort((a, b) => LEVEL_ORDER.indexOf(a) - LEVEL_ORDER.indexOf(b));
for (const l of levels) {
  line(l, real.filter((u) => u.level === l).length, real.filter((u) => newLevel(u) === l).length);
}

console.log('\n③ ФИЛТРИ «Вақти фаъолият»');
const now = new Date();
const oldDiff = (u) => (now.getTime() - new Date(u.lastActiveAt).getTime()) / 86400000;
const newDiff = (u) => (u.lastActiveAt === null ? null : dayIdx(now) - dayIdx(u.lastActiveAt));
line('Имрӯз', real.filter((u) => u.lastActiveAt && oldDiff(u) <= 1).length,
              real.filter((u) => newDiff(u) === 0).length);
line('3 рӯз', real.filter((u) => u.lastActiveAt && oldDiff(u) <= 3).length,
              real.filter((u) => newDiff(u) !== null && newDiff(u) <= 2).length);
line('7 рӯз', real.filter((u) => u.lastActiveAt && oldDiff(u) <= 7).length,
              real.filter((u) => newDiff(u) !== null && newDiff(u) <= 6).length);
line('30 рӯз', real.filter((u) => u.lastActiveAt && oldDiff(u) <= 30).length,
               real.filter((u) => newDiff(u) !== null && newDiff(u) <= 29).length);
line('Ғайрифаъол 30+', real.filter((u) => u.lastActiveAt && oldDiff(u) > 30).length,
                       real.filter((u) => newDiff(u) === null || newDiff(u) > 29).length);

console.log('\n④ ФИЛТРИ «Обуна»');
const PAID = ['monthly', 'sixmonths', 'yearly', 'lifetime'];
const paid = real.filter((u) => u.isPremium && PAID.includes(u.premiumPlan ?? ''));
const promo = real.filter((u) => u.isPremium && !PAID.includes(u.premiumPlan ?? ''));
console.log(`   Premium (ҳама) ${real.filter((u) => u.isPremium).length} = пулакӣ ${paid.length} + промо ${promo.length}`);

console.log('\n⑤ Чанд забонро ҳамзамон меомӯзанд');
const multi = real.filter((u) => newLangs(u).length > 1);
console.log(`   ${multi.length} корбар · намуна: ${multi.slice(0, 5).map((u) => `${u.name}[${newLangs(u).join('+')}]`).join(', ')}`);

console.log('\n⑥ Корбароне, ки ПЕШТАР дар ҳеҷ филтри забон пайдо намешуданд');
const rescued = real.filter((u) => !u.targetLang && u.langs.length);
console.log(`   ${rescued.length} нафар`);
for (const u of rescued.sort((a, b) => b.lessonsDone - a.lessonsDone).slice(0, 8)) {
  console.log(`     ${String(u.lessonsDone).padStart(4)} дарс · ${u.langs.join('+')} · ${u.studyLevel} · ${u.name}`);
}
