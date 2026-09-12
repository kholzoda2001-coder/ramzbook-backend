// Нусхаи эҳтиётии ҳамаи сатрҳое, ки `_ar-m1-fix.mjs` тағйир медиҳад.
import { readFileSync, writeFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';
const env = Object.fromEntries(readFileSync(new URL('../.env', import.meta.url),'utf8').split('\n').filter(l=>l.includes('=')&&!l.trim().startsWith('#')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const sql = neon(env.DATABASE_URL);
const [c] = await sql.query(`SELECT c.id FROM "Course" c JOIN "Language" t ON t.id=c."targetLanguageId" JOIN "Language" n ON n.id=c."nativeLanguageId" WHERE t.code='ar' AND n.code='tg' AND c.level='A1'`);
const [m] = await sql.query(`SELECT id, "canDoStatement" FROM "Module" WHERE "courseId"=$1 ORDER BY "order" LIMIT 1`, [c.id]);
const ls = await sql.query(`SELECT id, "order", "dialogueId", "comprehensionId" FROM "Lesson" WHERE "moduleId"=$1`, [m.id]);
const lids = ls.map(x=>x.id);
const out = { module: m, lessons: ls };
out.words = await sql.query(`SELECT * FROM "Word" WHERE "lessonId"=ANY($1)`, [lids]);
const dids = ls.map(x=>x.dialogueId).filter(Boolean);
out.dialogueLines = dids.length ? await sql.query(`SELECT * FROM "DialogueLine" WHERE "dialogueId"=ANY($1)`, [dids]) : [];
const cids = ls.map(x=>x.comprehensionId).filter(Boolean);
out.comprehensions = cids.length ? await sql.query(`SELECT * FROM "ComprehensionExercise" WHERE id=ANY($1)`, [cids]) : [];
out.questions = cids.length ? await sql.query(`SELECT * FROM "ComprehensionQuestion" WHERE "exerciseId"=ANY($1)`, [cids]) : [];
writeFileSync('tmp/ar-m1-backup.json', JSON.stringify(out, null, 1));
console.log(`нусха: ${out.words.length} калима · ${out.dialogueLines.length} сатри муколама · ${out.comprehensions.length} матн · ${out.questions.length} савол`);
