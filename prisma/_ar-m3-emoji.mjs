// Расмҳои вайрон аз CDN бардошта мешаванд, пас ЭМОҶӢ ягона тасвир мемонад —
// акнун ӯ бояд худаш дуруст бошад. Чор ҷо носаҳеҳ буд:
//
//   👪 Волидон      — 👪 «оила» аст ва аз 👨‍👩‍👧‍👦-и ҳамон дарс фарқ намекунад;
//                     👫 ҷуфти калонсол = маҳз падару модар.
//   👴 Бобо ва бибӣ — танҳо БОБО-ро нишон медиҳад, дар ҳоле ки калима ҲАР ДУ
//                     аст; 🧓 бетараф аст ва бо 👵 Солхӯрдаи ҳамон дарс
//                     намеомезад.
//   👨‍👩‍👦 Гурӯҳ      — боз як эмоҷии ОИЛА барои «гурӯҳ»; 👥 бо 👤 Шахси ҳамон
//                     дарс ҷуфти зебои «як ↔ бисёр» месозад.
//   👦/🧒            — 🧒 маҳз «кӯдак» аст, вале ба НАВРАС дода шуда буд.
//                     Ҷояшон иваз мешавад.
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';
const env = Object.fromEntries(readFileSync(new URL('../.env', import.meta.url),'utf8')
  .split('\n').filter((l)=>l.includes('=')&&!l.trim().startsWith('#'))
  .map((l)=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const sql = neon(env.DATABASE_URL);
const [c] = await sql.query(`SELECT c.id FROM "Course" c
  JOIN "Language" t ON t.id=c."targetLanguageId"
  JOIN "Language" n ON n.id=c."nativeLanguageId"
 WHERE t.code='ar' AND n.code='tg' AND c.level='A1'`);
const [m] = await sql.query(`SELECT id FROM "Module" WHERE "courseId"=$1 AND "order"=2`, [c.id]);
const ls = await sql.query(`SELECT id FROM "Lesson" WHERE "moduleId"=$1`, [m.id]);
const lids = ls.map((x) => x.id);
for (const [w, e, why] of [
  ['الوَالِدَان', '👫', 'буд 👪 — эмоҷии «оила»'],
  ['الجَدَّان',   '🧓', 'буд 👴 — танҳо бобо'],
  ['مَجْمُوعَة',  '👥', 'буд 👨‍👩‍👦 — эмоҷии оила'],
  ['طِفْل',       '🧒', 'буд 👦 — 🧒 маҳз «кӯдак»'],
  ['مُرَاهِق',    '👦', 'буд 🧒 — он ба Кӯдак гузашт'],
]) {
  const r = await sql.query(
    `UPDATE "Word" SET emoji=$2 WHERE "lessonId"=ANY($1) AND word=$3 RETURNING 1 x`, [lids, e, w]);
  console.log(`  ${r.length ? '✓' : '·'} ${w} → ${e}  (${why})${r.length ? '' : '  ЁФТ НАШУД'}`);
}
