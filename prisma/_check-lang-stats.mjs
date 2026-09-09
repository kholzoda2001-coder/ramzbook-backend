// Санҷиши мантиқи `lib/languageStats.ts` дар маълумоти ВОҚЕӢ.
//
// Иҷро:  node prisma/_check-lang-stats.mjs [email]
//
// Чаро ин ҷо ҳаст: ислоҳ ба он такя мекунад, ки `UserProgress` воқеан ба
// забон мебандад ва `UserLanguage.xp` холист. Ҳарду даъво бояд ЧЕН шаванд,
// на тахмин — вагарна як боги сифр ба ҷои боги «рақами кӯчанда» меояд.

import { readFileSync } from 'node:fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);

const who = process.argv[2] ?? null;

// ── 1. Кадом корбар ─────────────────────────────────────────────────────────
const users = await sql.query(
  who
    ? `SELECT id, name, email, "totalXp", "nativeLang" FROM "User" WHERE email = $1`
    : `SELECT id, name, email, "totalXp", "nativeLang" FROM "User"
       ORDER BY "totalXp" DESC LIMIT 3`,
  who ? [who] : [],
);

if (users.length === 0) { console.log('корбар ёфт нашуд'); process.exit(0); }

for (const u of users) {
  console.log('\n' + '='.repeat(66));
  console.log(`${u.name ?? '(бе ном)'}  <${u.email ?? '-'}>`);
  console.log(`  totalXp (умумӣ) = ${u.totalXp}   nativeLang = ${u.nativeLang}`);

  // ── 2. Оё `UserLanguage.xp` воқеан холист? ────────────────────────────────
  const ul = await sql.query(
    `SELECT l.code, ul."currentLevel", ul.xp, ul."isCurrent"
       FROM "UserLanguage" ul JOIN "Language" l ON l.id = ul."languageId"
      WHERE ul."userId" = $1 ORDER BY ul."isCurrent" DESC`,
    [u.id],
  );
  console.log('\n  UserLanguage (майдони `xp`-и схема):');
  for (const r of ul) {
    console.log(`    ${r.code}: xp=${r.xp}  level=${r.currentLevel}  current=${r.isCurrent}`);
  }

  // ── 3. Ҳақиқат: аз `UserProgress` бо занҷири забон ────────────────────────
  const real = await sql.query(
    `SELECT tl.code,
            COUNT(*)::int              AS lessons,
            COALESCE(SUM(up."xpEarned"),0)::int AS xp
       FROM "UserProgress" up
       JOIN "Lesson"   le ON le.id = up."lessonId"
       JOIN "Module"   m  ON m.id  = le."moduleId"
       JOIN "Course"   co ON co.id = m."courseId"
       JOIN "Language" tl ON tl.id = co."targetLanguageId"
      WHERE up."userId" = $1 AND up."isCompleted" = true
      GROUP BY tl.code ORDER BY xp DESC`,
    [u.id],
  );
  console.log('\n  ҲАҚИҚАТ аз UserProgress:');
  if (real.length === 0) console.log('    (ҳеҷ дарси анҷомёфта нест)');
  for (const r of real) {
    console.log(`    ${r.code}: ${r.xp} XP · ${r.lessons} дарс`);
  }
  const sum = real.reduce((a, r) => a + r.xp, 0);
  console.log(`    ── ҷамъ = ${sum}  (аз totalXp ${u.totalXp}: фарқ ${u.totalXp - sum})`);

  // ── 4. XP-и берун аз курс (гуфтор) — фарқро шарҳ медиҳад ──────────────────
  const sp = await sql.query(
    `SELECT COALESCE(SUM("xpEarned"),0)::int AS xp, COUNT(*)::int AS n
       FROM "SpeakingProgress" WHERE "userId" = $1`,
    [u.id],
  );
  console.log(`    гуфтор (SpeakingProgress): ${sp[0].xp} XP · ${sp[0].n} машқ`);
}
console.log('');
