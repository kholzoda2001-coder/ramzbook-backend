// Модули 1 — ду камбудӣ, ки танҳо аудитори УМУМӢ ёфт (D6, D15).
//
// Аудитори М1-и махсус эмоҷиро танҳо БАЙНИ такрори як калима месанҷид, вале
// на дар ДОХИЛИ як дарс. Дар натиҷа дар Д0 се корт бо як 👋 буданд —
// дар бозии мач хонанда намедонад кадомро ба кадом кашад.
//
//   node prisma/_ar-m1-fix4.mjs
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }),
);
const sql = neon(env.DATABASE_URL);

const [c] = await sql.query(`SELECT c.id FROM "Course" c
  JOIN "Language" t ON t.id=c."targetLanguageId"
  JOIN "Language" n ON n.id=c."nativeLanguageId"
 WHERE t.code='ar' AND n.code='tg' AND c.level='A1'`);
const [m] = await sql.query(`SELECT id FROM "Module" WHERE "courseId"=$1 AND "order"=0`, [c.id]);
const ls = await sql.query(`SELECT id FROM "Lesson" WHERE "moduleId"=$1`, [m.id]);
const lids = ls.map((x) => x.id);

// ── D6: як калима — як тарҷума ─────────────────────────────────────────
// `مَرْحَباً` дар Д0 «Салом (ғайрирасмӣ)» буд ва дар Д12 «Салом». Акнун
// ҳар ду «Салом»; тафовут аз `أَهْلاً` («Салом (кӯтоҳ)») мемонад, пас ду
// корти якхела-тарҷума пайдо намешавад.
{
  const r = await sql.query(
    `UPDATE "Word" SET translation='Салом' WHERE "lessonId"=ANY($1) AND word='مَرْحَباً' RETURNING id`, [lids]);
  console.log(`✓ مَرْحَباً → «Салом» (${r.length} корт)`);
}

// ── D15: эмоҷии беназир дар ҳар дарс ───────────────────────────────────
const EMOJI = [
  ['أَهْلاً', '🙌', 'Салом (кӯтоҳ) — буд 👋'],
  ['مَعَ السَّلَامَة', '🚶', 'То дидор — буд 👋'],
  ['مِنْ فَضْلِكَ', '🤲', 'Лутфан — буд 🙏'],
  ['أَنْتَ', '🫵', 'Ту — буд 👤'],
  ['مَا اسْمُكَ؟', '❓', 'Номат чист? — буд 📛'],
];
for (const [w, e, why] of EMOJI) {
  const r = await sql.query(
    `UPDATE "Word" SET emoji=$2 WHERE "lessonId"=ANY($1) AND word=$3 RETURNING id`, [lids, e, w]);
  console.log(`${r.length ? '✓' : '·'} ${w} → ${e}  (${why}) [${r.length} корт]`);
}
