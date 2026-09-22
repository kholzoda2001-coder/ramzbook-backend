// Калимае, ки дар ЧАНД файли мазмун номбар шудааст.
//
// Чаро ин хатарнок аст: як калима дар база ЯК сатр аст ва танҳо дар ЯК дарс
// зиндагӣ мекунад. Агар ду файли мазмун ҳамон калимаро талаб кунанд, билд онро
// ба дарси охирин МЕКӮЧОНАД — ва дарси аввал холӣ мемонад. Натиҷа: «дарси 1
// калима» (машқ 4 вариант сохта наметавонад) ва тартиби дарсҳо аз рӯи он
// вобаста мешавад, ки кадом модул охирин билд шуд.
//
//   node prisma/_tr-word-owner.mjs
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')
    .filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sql = neon(env.DATABASE_URL);
const COURSE = 'cmqdgwx740002c7nfgyzaaj8v';

const owners = new Map();   // калима → [{file, lesson}]
for (let n = 1; n <= 15; n++) {
  let mod;
  try { mod = await import(`./_tr-m${n}-content.mjs`); } catch { continue; }
  for (const lesson of mod.VOCAB ?? []) {
    for (const w of lesson.words) {
      if (!owners.has(w.word)) owners.set(w.word, []);
      owners.get(w.word).push({ file: `m${n}`, order: mod.MODULE.order, lesson: lesson.title });
    }
  }
}

const clash = [...owners.entries()].filter(([, v]) => v.length > 1);
console.log(`калимаҳо дар файлҳои мазмун: ${owners.size} · дар чанд ҷо: ${clash.length}`);
for (const [word, list] of clash) {
  console.log(`\n  «${word}»`);
  for (const l of list) console.log(`     ${l.file} (M${l.order}) → ${l.lesson}`);
}

// Ҳолати воқеӣ дар база — кадомаш ғолиб омад.
if (clash.length) {
  const rows = await sql.query(
    `SELECT w.word, m."order" mo, l.title FROM "Word" w JOIN "Lesson" l ON w."lessonId"=l.id
     JOIN "Module" m ON l."moduleId"=m.id WHERE m."courseId"='${COURSE}' AND l."skillType"='vocab'`);
  const at = new Map(rows.map(r => [r.word, `M${r.mo} → ${r.title}`]));
  console.log('\nҲоло дар база:');
  for (const [word] of clash) console.log(`  «${word}»: ${at.get(word) ?? '(нест)'}`);
}
