// ТАНҲО ХОНИШ: нишон медиҳад, ки хомӯш кардани ҳар забони модарӣ чиро пинҳон
// мекунад — чанд курс, кадом забонҳои омӯзишӣ, чанд хонанда.
//
// Ҳеҷ чиз навишта намешавад. Барои он аст, ки админ ПЕШ аз пахши «Хомӯш
// кардан» бидонад, чӣ мешавад.
//
// Prisma аз ин мошин ба Neon намерасад (порти 5432 баста) — драйвери HTTP
// истифода мешавад, ниг. [[ramz-db-scripts-local]].
//
//   node prisma/preview-native-visibility-http.mjs
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);

const langs = await sql.query(
  `SELECT id, code, name, "nativeName", flag, "canBeNative", "canBeTarget", "isActive", "order"
     FROM "Language" ORDER BY "order" ASC, name ASC`);

console.log('╔══════════════════════════════════════════════════════════════════╗');
console.log('║  ҲОЛАТИ ЗАБОНҲО — танҳо хониш                                    ║');
console.log('╚══════════════════════════════════════════════════════════════════╝\n');

for (const l of langs) {
  const courses = await sql.query(
    `SELECT c.id, c.level, c."isActive", t.flag AS tflag, t."nativeName" AS tname
       FROM "Course" c JOIN "Language" t ON t.id = c."targetLanguageId"
      WHERE c."nativeLanguageId" = $1`, [l.id]);
  const active = courses.filter(c => c.isActive);
  const targets = [...new Set(active.map(c => `${c.tflag} ${c.tname}`))];

  const [{ count: learners }] = await sql.query(
    `SELECT COUNT(*)::int AS count FROM "User" WHERE "nativeLang" = $1`, [l.code]);

  const role = [
    l.canBeNative ? 'МОДАРӢ ✅' : (courses.length ? 'МОДАРӢ 🚫 хомӯш' : null),
    l.canBeTarget ? 'ОМӮЗИШӢ' : null,
  ].filter(Boolean).join(' · ') || '—';

  console.log(`${l.flag}  ${l.nativeName}  (${l.code})`);
  console.log(`    нақш: ${role}   isActive=${l.isActive}  order=${l.order}`);
  if (l.canBeNative || courses.length) {
    console.log(`    хомӯш кунем → ${active.length} курс ва ${targets.length} забони омӯзишӣ пинҳон мешавад`);
    if (targets.length) console.log(`      ${targets.join('  ·  ')}`);
    console.log(`    хонандагони ин забони модарӣ: ${learners}`);
  }
  console.log();
}
