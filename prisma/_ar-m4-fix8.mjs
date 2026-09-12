// Он чи ки ХОНДАНИ БО ЧАШМ ва санҷиши байнимодулӣ ёфт.
//
// 1 · «Си» ғалат аст — дар тоҷикӣ 30 = «Сӣ» (бо ӣ).
// 2 · «Сомонӣ» бо ҳарфи калон дар дохили ҷумла.
// 3 · «ҳафтод сола» ҷудо, вале модул ҳама ҷо «бистсола», «ҳаждаҳсола» —
//     якҷоя менависад.
// 4 · Транскрипсияи зид дар КУРС: `وَاحِد` дар ин модул [воҳид], дар
//     модули пеш [ваҳид]. Дуруст [ваҳид] аст — конвенсияи курс «в» = w
//     ва алифи дароз = «а» (қиёс: ثَلَاثَة [саласа], أَرْبَعَة [арбаа]).
// 5 · `عَشَرَ` дар охири рақамҳои 11–19 фатҳа дорад → «ашара», на «ашар».
//     Модули «Дар бораи Ман» аллакай [хамсата ашара] менависад.
// 6 · `يُولْيُو`/`يُونْيُو` — [юлюу]/[юнюу] «у»-и барзиёд доштанд.
// 7 · Мисоли `مَارِس` калимаи `جَمِيل`-ро дошт, ки дар дарси ХОМӮШ буд.
//
// Ҳеҷ кадоми инҳо матни арабии садодорро тағйир намедиҳанд → аудио ҳамон.
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
const [m] = await sql.query(`SELECT id FROM "Module" WHERE "courseId"=$1 AND "order"=3`,[c.id]);
const ls = await sql.query(`SELECT id,"titleTranslated" t FROM "Lesson" WHERE "moduleId"=$1 AND "isActive"`,[m.id]);
const lids = ls.map(x=>x.id);
const run = async (label, text, params) => {
  const r = await sql.query(text+' RETURNING 1 AS x', params);
  console.log(`  ${r.length?'✓':'·'} ${label}${r.length?'':'  ЁФТ НАШУД'}`);
};

console.log('── тарҷума ва имло ──');
await run('ثَلَاثُون → «Сӣ» (буд «Си»)',
  `UPDATE "Word" SET translation='Сӣ' WHERE "lessonId"=ANY($1) AND word='ثَلَاثُون'`,[lids]);
await run('мисоли ثَلَاثُون → «Ман сӣсола ҳастам.»',
  `UPDATE "Word" SET "exampleTrans"='Ман сӣсола ҳастам.' WHERE "lessonId"=ANY($1) AND word='ثَلَاثُون'`,[lids]);
await run('мисоли تِسْعُون → «Нархи он навад сомонӣ аст.»',
  `UPDATE "Word" SET "exampleTrans"='Нархи он навад сомонӣ аст.' WHERE "lessonId"=ANY($1) AND word='تِسْعُون'`,[lids]);
await run('мисоли سَبْعُون → «Ӯ ҳафтодсола аст.»',
  `UPDATE "Word" SET "exampleTrans"='Ӯ ҳафтодсола аст.' WHERE "lessonId"=ANY($1) AND word='سَبْعُون'`,[lids]);
await run('мисоли مَارِس (بе `جَمِيل`-и таълимнашуда)',
  `UPDATE "Word" SET example='فِي مَارِس الجَوُّ دَافِئٌ.', "exampleTrans"='Дар март ҳаво гарм аст.'
    WHERE "lessonId"=ANY($1) AND word='مَارِس'`,[lids]);

console.log('\n── транскрипсия ──');
const IPA = [
  ['وَاحِد','ваҳид'], ['أَحَدَ عَشَرَ','аҳада ашара'], ['اِثْنَا عَشَرَ','исна ашара'],
  ['ثَلَاثَةَ عَشَرَ','саласата ашара'], ['أَرْبَعَةَ عَشَرَ','арбаата ашара'],
  ['خَمْسَةَ عَشَرَ','хамсата ашара'], ['سِتَّةَ عَشَرَ','ситтата ашара'],
  ['سَبْعَةَ عَشَرَ','сабъата ашара'], ['ثَمَانِيَةَ عَشَرَ','саманията ашара'],
  ['تِسْعَةَ عَشَرَ','тисъата ашара'], ['يُولْيُو','юлю'], ['يُونْيُو','юню'],
];
for (const [w,ip] of IPA)
  await run(`${w} → [${ip}]`,
    `UPDATE "Word" SET "ipaTajik"=$2 WHERE "lessonId"=ANY($1) AND word=$3`,[lids,ip,w]);

console.log('\n── эмоҷии дарс ──');
await run('«Пешояндҳои вақт» 🕐 → ⏳ (🕐 эмоҷии дарси соатҳо буд)',
  `UPDATE "Lesson" SET emoji='⏳' WHERE id=$1`,
  [ls.find(x=>x.t==='Грамматика: Пешояндҳои вақт').id]);
