// Сутуни `Feedback.nativeLang` + индекси ҷуфти забон + тозакунии сатрҳои кӯҳна.
//
// ⚠️ ПЕШ АЗ ДЕПЛОЙ иҷро шавад: Prisma-и нав сутунро интихоб мекунад ва бе он
// ҳам панел, ҳам POST-и фикр аз барнома мешиканад.
//
// ЧАРО СКРИПТ, НА `prisma db push`: аз мошини корӣ TCP 5432 баста аст, Prisma
// ба Neon намерасад. Драйвери HTTP (443) мерасад.
//
// Агар ин ҷо ҳам «fetch failed / Connect Timeout» шавад — интернет ба Neon
// нест. Он гоҳ ҳамон қадамҳоро аз браузер иҷро кунед:
// `prisma/sql/2026-08-30-feedback-native-lang.sql` → Neon SQL Editor.
//
//   node prisma/_inbox-add-native-lang.mjs --dry
//   node prisma/_inbox-add-native-lang.mjs
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);
const DRY = process.argv.includes('--dry');

// Ҳамон файле, ки дар Neon SQL Editor часпонда мешавад — то ду роҳ ҲАМОН
// корро кунанд ва аз ҳам дур нашаванд.
const raw = readFileSync(new URL('./sql/2026-08-30-feedback-native-lang.sql', import.meta.url), 'utf8');

// ⚠️ ТАРТИБ МУҲИМ: аввал сатрҳои шарҳ партофта мешаванд, БАЪД бо `;` ҷудо.
// Баръакс кардан вайрон мекунад — дар матни шарҳ `;` ҳаст ва изҳороти якум
// нимаи шарҳро ба худ мегирад.
const statements = raw
  .split('\n')
  .filter(l => !l.trim().startsWith('--'))
  .join('\n')
  .split(';')
  .map(s => s.trim())
  .filter(Boolean);

console.log(`изҳорот: ${statements.length}${DRY ? ' (DRY — иҷро намешавад)' : ''}\n`);

for (const st of statements) {
  const head = st.replace(/\s+/g, ' ').slice(0, 90);
  if (DRY) { console.log(`  · ${head}…`); continue; }
  await sql.query(st);
  console.log(`  ✓ ${head}…`);
}

if (!DRY) {
  // ⚠️ `sql.query()` барои UPDATE массиви ХОЛӢ бармегардонад — `rowCount` нест.
  // Пас натиҷа ҷудогона санҷида мешавад, на аз худи навсозӣ гирифта.
  const [{ total }] = await sql.query(`SELECT COUNT(*)::int AS total FROM "Feedback"`);
  const [{ withNative }] = await sql.query(
    `SELECT COUNT(*)::int AS "withNative" FROM "Feedback" WHERE "nativeLang" IS NOT NULL`);
  const [{ cuids }] = await sql.query(
    `SELECT COUNT(*)::int AS cuids FROM "Feedback" f
       WHERE EXISTS (SELECT 1 FROM "Language" l WHERE l.id = f."targetLang")`);
  console.log(`\nфикрҳо: ${total} · бо забони модарӣ: ${withNative} · cuid боқимонда: ${cuids}`);
  if (cuids > 0) console.log('⚠️ cuid боқӣ монд — қадами 2-ро дида бароед.');
}
