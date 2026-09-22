// IPA ва хониши тоҷикии ҳамаи калимаҳои туркӣ — аз имлои худи калима.
//
// Пеш аз ин ҳар ду сутун ЯК хел буданд («/byjyc/» ҳам дар IPA, ҳам дар хониш),
// чунки билд `ipaToTajik = (ipa) => ipa` дошт. Ғайр аз ин IPA-и дастӣ хато
// дошт: ğ ба нуқта табдил ёфта буд (Sağ → «/sa./»).
//
// Алифбо ва дарси шиносоӣ ҳам ҳамин ҷо навсозӣ мешаванд, то хонанда дар се ҷо
// як услуби хониш бинад.
//
//   node prisma/_tr-reading.mjs [--apply]
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';
import { transcribe, selfTest, ALLOWED } from './_tr-tajik.mjs';
import { LETTER_NAME } from './_tr-letters.mjs';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')
    .filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sql = neon(env.DATABASE_URL);
const q = (t, p) => (p ? sql.query(t, p) : sql.query(t));
const COURSE = 'cmqdgwx740002c7nfgyzaaj8v';
const TR = 'cmqdgus870000c7nfz5z16xbx';
const APPLY = process.argv.includes('--apply');

console.log(`✓ транслитератор: ${selfTest()} худсанҷиш`);

const words = await q(
  `SELECT w.id, w.word, w.ipa, w."ipaTajik" FROM "Word" w JOIN "Lesson" l ON w."lessonId"=l.id
   JOIN "Module" m ON l."moduleId"=m.id WHERE m."courseId"=$1`, [COURSE]);

const plan = [];
const bad = [];
for (const w of words) {
  const { ipa, tajik } = transcribe(w.word);
  if (!tajik.trim()) { bad.push(`${w.word}: хониш холӣ`); continue; }
  if (!ALLOWED.test(tajik)) { bad.push(`${w.word}: аломати бегона дар «${tajik}»`); continue; }
  if (w.ipa !== ipa || w.ipaTajik !== tajik) plan.push({ id: w.id, word: w.word, ipa, tajik });
}

console.log(`калимаҳо: ${words.length} · тағйир лозим: ${plan.length} · мушкил: ${bad.length}`);
bad.slice(0, 20).forEach(b => console.log('  ✗ ' + b));
console.log('\nнамуна:');
plan.slice(0, 12).forEach(p => console.log(`  ${p.word.padEnd(22)} ${p.ipa.padEnd(26)} ${p.tajik}`));

if (!APPLY) { console.log('\n(нақша) --apply'); process.exit(bad.length ? 1 : 0); }
if (bad.length) { console.error('⛔ аввал мушкилҳоро ҳал кунед'); process.exit(1); }

for (let i = 0; i < plan.length; i += 100) {
  const chunk = plan.slice(i, i + 100);
  const values = chunk.map((_, k) => `($${k * 3 + 1}, $${k * 3 + 2}, $${k * 3 + 3})`).join(',');
  await q(`UPDATE "Word" t SET ipa = v.ipa, "ipaTajik" = v.tj FROM (VALUES ${values}) AS v(id, ipa, tj) WHERE t.id = v.id`,
    chunk.flatMap(p => [p.id, p.ipa, p.tajik]));
}
console.log(`✓ Word: ${plan.length} сатр`);

// ── Алифбо: `tajikTranscription` = НОМИ ҳарф, на садои он (мисли олмонӣ) ────
const letters = await q(`SELECT id, uppercase, lowercase, "tajikTranscription" t FROM "AlphabetLetter" WHERE "targetLanguageId"=$1`, [TR]);
// Номи ҳарфҳои туркӣ: садонок = худи он, ҳамсадо = ҳамсадо + "e" (be, ce, de…),
// ғайр аз чанд истиснои ҳаммаъно.
let n = 0;
for (const l of letters) {
  const name = LETTER_NAME[l.uppercase];
  if (!name) { console.log(`  ⚠ номи ҳарфи ${l.uppercase} маълум нест`); continue; }
  const tj = transcribe(name).tajik;
  if (l.t === tj) continue;
  await q(`UPDATE "AlphabetLetter" SET "tajikTranscription"=$1 WHERE id=$2`, [tj, l.id]);
  n++;
}
console.log(`✓ AlphabetLetter: ${n} сатр`);

// ── Дарси шиносоӣ ───────────────────────────────────────────────────────────
const onb = await q(`SELECT id, word, "transcriptionTajik" t FROM "OnboardingWord" WHERE "targetLanguageId"=$1`, [TR])
  .catch(() => []);
let m = 0;
for (const o of onb) {
  const tj = transcribe(o.word).tajik;
  if (o.t === tj) continue;
  await q(`UPDATE "OnboardingWord" SET "transcriptionTajik"=$1 WHERE id=$2`, [tj, o.id]);
  m++;
}
console.log(`✓ OnboardingWord: ${m} сатр`);

await q(`UPDATE "Module" SET "contentVersion" = "contentVersion" + 1 WHERE "courseId"=$1`, [COURSE]);
await q(`UPDATE "AppSetting" SET "updatedAt" = NOW() WHERE key='content_version'`);
