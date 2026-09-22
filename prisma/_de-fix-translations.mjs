// Ду калимаи ГУНОГУНИ олмонӣ набояд ЯК тарҷумаи тоҷикӣ дошта бошанд.
//
// Чаро: муҳаррики машқ вариантҳои «дуҳела»-ро аз рӯи ТАРҶУМА мефилтрад — агар
// ду калима як тарҷума дошта бошанд, ҷавоби дурусти хонанда метавонад «ғалат»
// ҳисоб шавад. Ва ҳатто бе он, хонанда мебинад, ки ду корти гуногун як маъно
// доранд ва бовар мекунад, ки онҳо ҳаммаъноянд.
//
// Ҳам файли мазмун, ҳам база навсозӣ мешавад — вагарна билди навбатӣ бармегардонад.
//
//   node prisma/_de-fix-translations.mjs [--apply]
import { readFileSync, writeFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')
    .filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sql = neon(env.DATABASE_URL);
const COURSE = 'cmqdhwb5q00021z597df2767m';
const APPLY = process.argv.includes('--apply');

// калима → тарҷумаи НАВ (аз рӯи аудити 20.09.2026)
const FIX = {
  'das Wohnzimmer': 'утоқи меҳмонӣ',   // «меҳмонхона» бо das Hotel як хел буд
  bequem: 'қулай',                      // «бароҳат» бо gemütlich як хел буд
  buchen: 'брон кардан',                // «фармоиш додан» бо bestellen як хел буд
  gemeinsam: 'муштарак',                // «якҷоя» бо zusammen як хел буд
};

console.log('Тарҷумаҳои нав:');
for (const [w, t] of Object.entries(FIX)) console.log(`  ${w} → «${t}»`);
if (!APPLY) { console.log('\n(нақша) --apply'); process.exit(0); }

// ── 1. Файлҳои мазмун ───────────────────────────────────────────────────────
let touched = 0;
for (let n = 1; n <= 15; n++) {
  const p = new URL(`./_de-m${n}-content.mjs`, import.meta.url);
  let s;
  try { s = readFileSync(p, 'utf8'); } catch { continue; }
  const before = s;
  for (const [w, t] of Object.entries(FIX)) {
    const re = new RegExp(`(\\{ word: '${w.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}',[^}]*?translation: ')[^']*(')`, 'g');
    s = s.replace(re, `$1${t}$2`);
  }
  if (s !== before) { writeFileSync(p, s); touched++; console.log(`  файл m${n} навсозӣ шуд`); }
}

// ── 2. База ─────────────────────────────────────────────────────────────────
for (const [w, t] of Object.entries(FIX)) {
  const rows = await sql.query(
    `UPDATE "Word" SET translation=$1 WHERE word=$2 AND "lessonId" IN
       (SELECT l.id FROM "Lesson" l JOIN "Module" m ON l."moduleId"=m.id WHERE m."courseId"=$3)
     RETURNING id`, [t, w, COURSE]);
  console.log(`  база: ${w} → ${rows.length} сатр`);
}
await sql.query(`UPDATE "Module" SET "contentVersion" = "contentVersion" + 1 WHERE "courseId"=$1`, [COURSE]);
await sql.query(`UPDATE "AppSetting" SET "updatedAt" = NOW() WHERE key='content_version'`);
console.log(`\n✓ ${touched} файл ва база навсозӣ шуд`);
