// Бархӯрди тарҷума: ду ҷумлаи ГУНОГУНИ арабӣ як тарҷумаи тоҷикӣ доштанд.
// Дар машқи сохтани ҷумла ин ду ҷавоби дуруст месозад — ҳамон доме, ки
// қаблан курси русиро қулф карда буд.
//
// Ҳал: тарҷумаи грамматика ДАҚИҚ карда мешавад (ҷумлаҳо воқеан фарқ доранд),
// ва ду мисоли рақам ҷумлаи худро мегирад.
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
const [m] = await sql.query(`SELECT id FROM "Module" WHERE "courseId"=$1 AND "order"=2`,[c.id]);
const ls = await sql.query(`SELECT id,"grammarTopicId" g FROM "Lesson" WHERE "moduleId"=$1`,[m.id]);
const lids = ls.map(x=>x.id), gids = ls.map(x=>x.g).filter(Boolean);
const run = async (label, text, params) => {
  const r = await sql.query(text + ' RETURNING 1 AS x', params);
  console.log(`  ${r.length ? '✓' : '·'} ${label}${r.length ? '' : '  ЁФТ НАШУД'}`);
};

// `عِنْدِي أَخٌ.` «як» надорад — тарҷумааш ҳам набояд дошта бошад.
await run('грамматика «عِنْدِي أَخٌ.» → «Ман бародар дорам.»',
  `UPDATE "GrammarExample" SET translation=$2 WHERE "topicId"=ANY($1) AND sentence=$3`,
  [gids, 'Ман бародар дорам.', 'عِنْدِي أَخٌ.']);

// `اِثْنَان` ва `ثَلَاثَة` ҷумлаи ХУДРО мегиранд, на нусхаи грамматика.
await run('мисоли اِثْنَان → «هُمَا اِثْنَان.»',
  `UPDATE "Word" SET example=$2, "exampleTrans"=$3 WHERE "lessonId"=ANY($1) AND word='اِثْنَان'`,
  [lids, 'هُمَا اِثْنَان.', 'Онҳо дутоянд.']);
await run('мисоли ثَلَاثَة → «عِنْدِي ثَلَاثَةُ أَصْدِقَاء.»',
  `UPDATE "Word" SET example=$2, "exampleTrans"=$3 WHERE "lessonId"=ANY($1) AND word='ثَلَاثَة'`,
  [lids, 'عِنْدِي ثَلَاثَةُ أَصْدِقَاء.', 'Ман се дӯст дорам.']);
