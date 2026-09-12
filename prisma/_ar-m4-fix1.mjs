// A3 · Рақами арабӣ аз МАТНИ корт бароварда мешавад.
//
// Корт `اِثْنَان ٢` буд, на `اِثْنَان`. Се зарар:
//   1. Дар машқи «тарҷума кун» рақам ҷавобро ошкор мекунад.
//   2. Калиди расм `اثنان_٢.png` мешавад — расм ҳеҷ гоҳ ёфт намешавад
//      (`_normImageKey` рақамро нигоҳ медорад).
//   3. edge-tts рақамро ҳам мехонад — аудио рақамро ДУ бор мегӯяд.
//
// Ин конвенсияи курс НЕСТ: аз 776 калимаи курс маҳз ҳамин 33-то чунинанд.
// Қимати рақами арабӣ (٢) дар бахши Алифбо таълим мешавад, на дар корти луғат;
// ин ҷо эмоҷии 2️⃣ аллакай миқдорро нишон медиҳад.
//
// ⚠️ Баъди ин ҳатман `_ar-m4-audio.mjs` — матни калима иваз шуд, пас
// аудиои кӯҳна дигар дуруст нест.
//
//   node prisma/_ar-m4-fix1.mjs --dry
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }),
);
const sql = neon(env.DATABASE_URL);
const DRY = process.argv.includes('--dry');

const [course] = await sql.query(`SELECT c.id FROM "Course" c
  JOIN "Language" t ON t.id=c."targetLanguageId"
  JOIN "Language" nn ON nn.id=c."nativeLanguageId"
 WHERE t.code='ar' AND nn.code='tg' AND c.level='A1'`);
const [mod] = await sql.query(`SELECT id FROM "Module" WHERE "courseId"=$1 AND "order"=3`, [course.id]);
const lids = (await sql.query(`SELECT id FROM "Lesson" WHERE "moduleId"=$1`, [mod.id])).map((x) => x.id);

const rows = await sql.query(
  `SELECT w.id, w.word, w.translation tr, l."order" lo FROM "Word" w
     JOIN "Lesson" l ON l.id=w."lessonId"
    WHERE w."lessonId"=ANY($1) AND w.word ~ '[٠-٩]' ORDER BY l."order", w."order"`, [lids]);

console.log(DRY ? '── DRY RUN ──' : '── A3: рақам аз матни корт ──');
let n = 0;
for (const r of rows) {
  const clean = r.word.replace(/[٠-٩]/g, '').replace(/\s+/g, ' ').trim();
  if (clean === r.word) continue;
  if (!clean) { console.log(`  ✗ ${r.word} — баъди тозакунӣ холӣ мемонад, гузашт`); continue; }
  if (DRY) { console.log(`  [dry] Д${r.lo} «${r.word}» → «${clean}»  (${r.tr})`); n++; continue; }
  await sql.query(`UPDATE "Word" SET word=$2 WHERE id=$1`, [r.id, clean]);
  console.log(`  ✓ Д${r.lo} «${r.word}» → «${clean}»  (${r.tr})`);
  n++;
}
console.log(`\n${DRY ? '[dry] ' : ''}${n} корт.`);

// Ҳамон калима дар ду дарс эмоҷии гуногун дошт (D6): `سبعون` дар Д4 7️⃣0️⃣,
// дар дарси навиштан 🔢. Баъди тозакунии рақам ҳарду як калима мешаванд.
if (!DRY) {
  const dup = await sql.query(
    `SELECT word, array_agg(DISTINCT emoji) es FROM "Word"
      WHERE "lessonId"=ANY($1) GROUP BY word HAVING COUNT(DISTINCT emoji) > 1`, [lids]);
  for (const d of dup) {
    // Эмоҷии РАҚАМДОР (7️⃣0️⃣) аз 🔢-и умумӣ бартар аст — он миқдорро нишон медиҳад.
    const best = d.es.find((e) => /[0-9]️?⃣/.test(e)) ?? d.es[0];
    await sql.query(`UPDATE "Word" SET emoji=$2 WHERE "lessonId"=ANY($1) AND word=$3`, [lids, best, d.word]);
    console.log(`  ✓ ${d.word}: ${d.es.join(' / ')} → ${best}`);
  }
  if (!dup.length) console.log('  · эмоҷии зидди як калима нест');
}
