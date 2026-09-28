/**
 * Боби арабии «التعارف»: 4 матни бе ҳаракат, ки валидатори нав ёфт (28.09.2026).
 * Танҳо ҲАРАКАТ илова мешавад — талаффуз ва аудио ҳамон. Seed не (seed аудиоро
 * мекушад) — ивази мустақими сатрҳо дар JSON ва база.
 *
 *   node prisma/_ar-legacy-harakat.mjs          — нишон медиҳад
 *   node prisma/_ar-legacy-harakat.mjs --apply  — иваз мекунад
 */
import { readFileSync, writeFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const FIX = [
  ['أَنَا مَشْغُول الآن.', 'أَنَا مَشْغُول الْآنَ.'],
  ['اِسْمِي أَحْمَد عَبْدُ الله.', 'اِسْمِي أَحْمَد عَبْدُ اللَّه.'],
  ['إِنْ شَاءَ الله، أَرَاكَ غَداً.', 'إِنْ شَاءَ اللَّه، أَرَاكَ غَداً.'],
  ['إِنْ شَاءَ الله', 'إِنْ شَاءَ اللَّه'],
];
const apply = process.argv.includes('--apply');
const env = Object.fromEntries(readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#')).map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sql = neon(env.DATABASE_URL);

const file = new URL('../content/speaking/meeting_people_ar_tg.json', import.meta.url);
let json = readFileSync(file, 'utf8');
for (const [a, b] of FIX) {
  const inFile = json.split(`"${a}"`).length - 1;
  const rows = await sql.query(
    `SELECT i.id, i.text = $1 AS t, i.cue = $1 AS c FROM "SpeakingItem" i
       JOIN "SpeakingLesson" l ON l.id = i."lessonId" JOIN "SpeakingCategory" c ON c.id = l."categoryId"
       JOIN "Language" g ON g.id = c."targetLanguageId"
      WHERE g.code = 'ar' AND (i.text = $1 OR i.cue = $1)`, [a]);
  console.log(`«${a}» → «${b}»: файл ${inFile}, база ${rows.length}`);
  if (!apply) continue;
  json = json.split(`"${a}"`).join(`"${b}"`);
  for (const r of rows) {
    if (r.t) await sql.query(`UPDATE "SpeakingItem" SET text = $2 WHERE id = $1`, [r.id, b]);
    if (r.c) await sql.query(`UPDATE "SpeakingItem" SET cue = $2 WHERE id = $1`, [r.id, b]);
  }
}
if (apply) { writeFileSync(file, json); console.log('иваз шуд'); }
