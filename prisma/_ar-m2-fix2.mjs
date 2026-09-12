// Эмоҷиҳои забонҳо — бархӯрд дар ду дарс.
//
// Парчами кишвар барои ЗАБОН кор намекунад: дар дарси навиштан «Англия» ва
// «Англисӣ» ҳарду 🇬🇧 доштанд, «Тоҷикистон» ва «Тоҷикӣ» ҳарду 🇹🇯. Ва
// вақте ба 🗣/💬 иваз кардам, дар дарси «Забонҳо» бо «Забон» ва «Гап задан»
// бархӯрданд. Ҳоло ҳар забон нишони ХУДРО дорад.
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';
const env = Object.fromEntries(readFileSync(new URL('../.env', import.meta.url),'utf8').split('\n').filter(l=>l.includes('=')&&!l.trim().startsWith('#')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const sql = neon(env.DATABASE_URL);
const [c] = await sql.query(`SELECT c.id FROM "Course" c JOIN "Language" t ON t.id=c."targetLanguageId" JOIN "Language" n ON n.id=c."nativeLanguageId" WHERE t.code='ar' AND n.code='tg' AND c.level='A1'`);
const [m] = await sql.query(`SELECT id FROM "Module" WHERE "courseId"=$1 AND "order"=1`, [c.id]);
const ls = await sql.query(`SELECT id FROM "Lesson" WHERE "moduleId"=$1`, [m.id]);
const lids = ls.map(x => x.id);
for (const [w, e] of [['الإِنْجِلِيزِيَّة','🔤'], ['الطَّاجِيكِيَّة','📗'], ['الرُّوسِيَّة','📘']]) {
  const r = await sql.query(`UPDATE "Word" SET emoji=$2 WHERE "lessonId"=ANY($1) AND word=$3 RETURNING id`, [lids, e, w]);
  console.log(`${r.length ? '✓' : '·'} ${w} → ${e} (${r.length} корт)`);
}
