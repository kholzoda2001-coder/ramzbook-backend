// Ислоҳи эмоҷи ва тарҷумаҳои такрории луғати «Англисӣ — A1».
//
// ДОМАИ БЕХАТАРӢ: дар схема ягон сутуни `courseCode` ва ягон ҷадвали
// `Vocabulary` НЕСТ. Калимаҳо дар ҷадвали `Word` мебошанд ва ба курс танҳо
// тавассути занҷири Word → Lesson → Module → Course мерасанд. Пас филтри
// «courseCode = 'EN-A1'» ҳамчун `m."courseId" = A1_COURSE` навишта шудааст —
// ҳар UPDATE бо ҳамин занҷир маҳдуд аст, пас A2/B1/русӣ/арабӣ ламс намешаванд.
//
//   node prisma/fix-a1-vocab.mjs --dry
//   node prisma/fix-a1-vocab.mjs
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);          // Prisma аз ин мошин намерасад — HTTP
const q = (t, p) => sql.query(t, p);

const DRY = process.argv.includes('--dry');
const A1 = 'cmqkvhu8p0001o5r7nkbeo4jm';      // Англисӣ — A1 (en → tg)

// Ҳар банд: калима, майдон, арзиши ИНТИЗОРШАВАНДА (барои муҳофизат) ва нав.
// `expect` танҳо огоҳӣ медиҳад — агар база аллакай тағйир ёфта бошад, мебинем.
const FIXES = [
  { word: 'Exit',     field: 'emoji',       expect: '🚪', to: '🏃‍♂️', why: '🚪 «дар» аст, на «баромадгоҳ» — 🏃‍♂️ ҳамон рамзи тахтаи EXIT' },
  { word: 'Back',     field: 'emoji',       expect: '🔙', to: '🧍',   why: '🔙 тирчаи «бозгашт» аст, вале ин ҷо узви бадан (Пушт)' },
  { word: 'Stomach',  field: 'emoji',       expect: '🩹', to: '🍔',   why: '🩹 лейкопластир аст — бо «Bandage» омехта мешуд' },

  // Тарҷумаҳои такрорӣ: ду калимаи гуногуни англисӣ як тарҷумаи тоҷикӣ доштанд,
  // пас дар машқи интихоб ҳарду ҷавоб дуруст менамуд.
  { word: 'Straight', field: 'translation', expect: 'Рост / Мустақим', to: 'Мустақим',    why: 'бо «Right» (Рост) омехта мешуд' },
  { word: 'Right',    field: 'translation', expect: 'Рост',            to: 'Тарафи рост', why: 'бо «Straight» (Рост) омехта мешуд' },
  { word: 'Sick',     field: 'translation', expect: 'Бемор',           to: 'Касал',       why: 'бо «Ill» ҷудо карда шуд' },
  { word: 'Ill',      field: 'translation', expect: 'Бетоб',           to: 'Бемор',       why: 'бо «Sick» ҷудо карда шуд' },
  { word: 'House',    field: 'translation', expect: 'Хона',            to: 'Бино',        why: 'бо «Home» (Хона) омехта мешуд' },
  { word: 'Home',     field: 'translation', expect: 'Хона / Ватан',    to: 'Манзил',      why: 'бо «House» (Хона) омехта мешуд' },
];

let changed = 0, skipped = 0;

for (const f of FIXES) {
  // Ҳамаи сатрҳои ҳамин калима ДАР ДОХИЛИ A1 (баъзеи онҳо дар «Writing
  // Practice» такрор шудаанд — онҳо низ бояд ҳамоҳанг бошанд).
  const rows = await q(
    `SELECT w.id, w.word, w.emoji, w.translation, m."order" mo, l.title lt
       FROM "Word" w
       JOIN "Lesson" l ON l.id = w."lessonId"
       JOIN "Module" m ON m.id = l."moduleId"
      WHERE m."courseId" = $1 AND lower(w.word) = lower($2)
      ORDER BY m."order"`, [A1, f.word]);

  if (!rows.length) { console.log(`⚠ «${f.word}» дар A1 ёфт нашуд — гузашт`); skipped++; continue; }

  console.log(`\n«${f.word}» · ${f.field} → ${f.to}   (${f.why})`);
  for (const r of rows) {
    const cur = f.field === 'emoji' ? r.emoji : r.translation;
    if (cur === f.to) { console.log(`   = M${r.mo + 1} аллакай «${cur}» — тағйир не`); continue; }
    if (cur !== f.expect) console.log(`   ⚠ M${r.mo + 1} арзиши ҷорӣ «${cur}» ба интизор «${f.expect}» рост намеояд — бо вуҷуди ин нав мешавад`);
    console.log(`   → M${r.mo + 1} «${cur}» ⇒ «${f.to}»   [${r.id}] ${r.lt.slice(0, 32)}`);
    if (!DRY) {
      // Домаи дучанда: ҳам бо id, ҳам бо занҷири курс — то ягон сатри
      // берун аз A1 ҳатто ҳангоми хатои id ламс нашавад.
      await q(
        `UPDATE "Word" SET ${f.field === 'emoji' ? '"emoji"' : '"translation"'} = $1
          WHERE id = $2
            AND "lessonId" IN (
              SELECT l.id FROM "Lesson" l JOIN "Module" m ON m.id = l."moduleId"
               WHERE m."courseId" = $3)`, [f.to, r.id, A1]);
    }
    changed++;
  }
}

if (!DRY && changed) {
  await q(`UPDATE "AppSetting" SET "updatedAt"=NOW() WHERE key='content_version'`);
  console.log('\ncontent_version ламс шуд.');
}
console.log(DRY ? `\n[--dry] ${changed} сатр НАВ МЕШУД (${skipped} наёфт).` : `\n${changed} сатр нав шуд (${skipped} наёфт).`);

// ── Худсанҷӣ: драйвери HTTP аз UPDATE `rowCount` намедиҳад, пас аз нав хонда
//    месанҷем (ниг. [[ramz-db-scripts-local]]).
console.log('\nҲОЛАТИ БАЪДӢ:');
for (const f of FIXES) {
  const rows = await q(
    `SELECT w.emoji, w.translation, m."order" mo FROM "Word" w
       JOIN "Lesson" l ON l.id = w."lessonId" JOIN "Module" m ON m.id = l."moduleId"
      WHERE m."courseId" = $1 AND lower(w.word) = lower($2) ORDER BY m."order"`, [A1, f.word]);
  const vals = rows.map(r => f.field === 'emoji' ? r.emoji : r.translation);
  const ok = vals.length > 0 && vals.every(v => v === f.to);
  console.log(`  ${ok ? '✓' : '✗'} ${f.word.padEnd(9)} ${f.field.padEnd(11)} = ${vals.map(v => `«${v}»`).join(', ')}`);
}

// Такрори тарҷума дар байни ҳамин шаш калима боқӣ мондааст ё не?
const pairs = [['Straight', 'Right'], ['Sick', 'Ill'], ['House', 'Home']];
console.log('\nСанҷиши такрор:');
for (const [a, b] of pairs) {
  const g = async w => (await q(`SELECT DISTINCT w.translation t FROM "Word" w JOIN "Lesson" l ON l.id=w."lessonId"
      JOIN "Module" m ON m.id=l."moduleId" WHERE m."courseId"=$1 AND lower(w.word)=lower($2)`, [A1, w])).map(r => r.t);
  const [ta, tb] = [await g(a), await g(b)];
  const clash = ta.some(x => tb.includes(x));
  console.log(`  ${clash ? '✗' : '✓'} ${a} ${JSON.stringify(ta)} vs ${b} ${JSON.stringify(tb)}`);
}

// Домаи таъсир: берун аз A1 чизе тағйир наёфт?
const outside = await q(
  `SELECT c.level, tl.code, COUNT(*)::int n FROM "Word" w
     JOIN "Lesson" l ON l.id=w."lessonId" JOIN "Module" m ON m.id=l."moduleId"
     JOIN "Course" c ON c.id=m."courseId" JOIN "Language" tl ON tl.id=c."targetLanguageId"
    WHERE m."courseId" <> $1 AND lower(w.word) = ANY($2::text[])
    GROUP BY c.level, tl.code ORDER BY tl.code, c.level`,
  [A1, FIXES.map(f => f.word.toLowerCase())]);
console.log('\nҲамон калимаҳо дар курсҳои ДИГАР (даст нахӯрданд):');
console.log(outside.length ? outside.map(r => `  ${r.code}-${r.level}: ${r.n} сатр`).join('\n') : '  —');
