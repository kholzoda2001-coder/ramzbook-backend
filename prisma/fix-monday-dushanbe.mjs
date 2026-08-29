// «Имрӯз Душанбе аст.» → «Имрӯз душанбе аст.»
//
// Дар тоҷикӣ рӯзи ҳафта бо ҳарфи ХУРД навишта мешавад («душанбе»), шаҳр бошад
// бо ҳарфи КАЛОН («Душанбе»). Дар сатри «Monday» тарҷумаи мисол ҳарфи калон
// дошт, пас ҷумла «Имрӯз ШАҲРИ Душанбе аст» хонда мешуд.
//
// Ҷумлаи АНГЛИСӢ манбаи ҳақиқат аст, на рӯйхати дастӣ:
//   мисол «Monday» дорад ва «Dushanbe» надорад → рӯзи ҳафта → ҳарфи хурд
//   мисол «Dushanbe» дорад ва «Monday» надорад → шаҳр        → ҳарфи калон
// Пас скрипт ҲАМА сатрҳои A1-ро месанҷад ва танҳо номувофиқҳоро ислоҳ мекунад
// — рӯйхати «се ҷои маълум» лозим нест ва ҳеҷ сатри дурустро вайрон намекунад.
//
// Диққат: майдон дар схема `exampleTrans` аст (на `exampleTranslated`), ва
// майдони `translation` даст намехӯрад — он саркалимаи луғат аст ва мисли
// ҳамаи рӯзҳои дигар («Сешанбе», «Чоршанбе») бо ҳарфи калон мемонад.
//
//   node prisma/fix-monday-dushanbe.mjs --dry
//   node prisma/fix-monday-dushanbe.mjs
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);
const q = (t, p) => sql.query(t, p);

const DRY = process.argv.includes('--dry');
const A1 = 'cmqkvhu8p0001o5r7nkbeo4jm';   // Англисӣ — A1 (en → tg)

const rows = await q(
  `SELECT w.id, w.word, w.translation, w.example, w."exampleTrans" tr,
          m."order" mo, l.title lt
     FROM "Word" w
     JOIN "Lesson" l ON l.id = w."lessonId"
     JOIN "Module" m ON m.id = l."moduleId"
    WHERE m."courseId" = $1
      AND (w.example ILIKE '%dushanbe%' OR w."exampleTrans" ILIKE '%душанбе%')
    ORDER BY m."order"`, [A1]);

console.log(`Сатрҳои A1 бо «Dushanbe / душанбе»: ${rows.length}\n`);

let fixed = 0, ok = 0, manual = 0;

for (const r of rows) {
  const en = r.example ?? '';
  const hasCity = /\bDushanbe\b/.test(en);
  const hasDay = /\bMonday\b/i.test(en);
  const tr = r.tr ?? '';

  let kind, want;
  if (hasDay && !hasCity) {
    kind = 'рӯзи ҳафта';
    want = tr.replace(/Душанбе/g, 'душанбе');       // калон → хурд
  } else if (hasCity && !hasDay) {
    kind = 'шаҳр';
    want = tr.replace(/душанбе/g, 'Душанбе');       // хурд → калон
  } else {
    console.log(`? M${r.mo + 1} «${r.word}» — ҳам «Monday», ҳам «Dushanbe» (ё ҳеҷ кадом): дастӣ дида шавад`);
    console.log(`    en: ${en}\n    tg: ${tr}`);
    manual++;
    continue;
  }

  if (want === tr) {
    console.log(`✓ M${r.mo + 1} «${r.word}» (${kind}) — аллакай дуруст: ${tr}`);
    ok++;
    continue;
  }

  console.log(`→ M${r.mo + 1} «${r.word}» (${kind}) [${r.id}] ${r.lt.slice(0, 30)}`);
  console.log(`    en:  ${en}`);
  console.log(`    буд: ${tr}`);
  console.log(`    шуд: ${want}`);
  if (!DRY) {
    // Домаи дучанда: ҳам id, ҳам занҷири курс — то ягон сатри берун аз A1
    // ҳатто ҳангоми хатои id ламс нашавад.
    await q(
      `UPDATE "Word" SET "exampleTrans" = $1
        WHERE id = $2
          AND "lessonId" IN (
            SELECT l.id FROM "Lesson" l JOIN "Module" m ON m.id = l."moduleId"
             WHERE m."courseId" = $3)`, [want, r.id, A1]);
  }
  fixed++;
}

if (!DRY && fixed) {
  await q(`UPDATE "AppSetting" SET "updatedAt"=NOW() WHERE key='content_version'`);
  console.log('\ncontent_version ламс шуд.');
}
console.log(DRY
  ? `\n[--dry] ${fixed} сатр ислоҳ МЕШУД · ${ok} аллакай дуруст · ${manual} дастӣ`
  : `\n${fixed} сатр ислоҳ шуд · ${ok} аллакай дуруст · ${manual} дастӣ`);

// ── Худсанҷӣ: драйвери HTTP аз UPDATE rowCount намедиҳад — аз нав мехонем.
const after = await q(
  `SELECT w.word, w.example, w."exampleTrans" tr, m."order" mo
     FROM "Word" w JOIN "Lesson" l ON l.id = w."lessonId" JOIN "Module" m ON m.id = l."moduleId"
    WHERE m."courseId" = $1
      AND (w.example ILIKE '%dushanbe%' OR w."exampleTrans" ILIKE '%душанбе%')
    ORDER BY m."order"`, [A1]);
console.log('\nҲОЛАТИ БАЪДӢ:');
let bad = 0;
for (const r of after) {
  const day = /\bMonday\b/i.test(r.example ?? '') && !/\bDushanbe\b/.test(r.example ?? '');
  const wrong = day ? /Душанбе/.test(r.tr ?? '') : /(^|\s)душанбе/.test(r.tr ?? '');
  if (wrong) bad++;
  console.log(`  ${wrong ? '✗' : '✓'} M${r.mo + 1} ${r.word.padEnd(9)} ${day ? 'рӯз ' : 'шаҳр'} · ${r.tr}`);
}
console.log(`\n${bad === 0 ? '✓' : '✗'} номувофиқии боқимонда: ${bad}`);

// Рӯзҳои дигари ҳафта ҳамон услубро доранд ё не (муқоисаи назоратӣ).
const days = await q(
  `SELECT w.word, w."exampleTrans" tr FROM "Word" w
     JOIN "Lesson" l ON l.id = w."lessonId" JOIN "Module" m ON m.id = l."moduleId"
    WHERE m."courseId" = $1 AND w.word = ANY($2::text[]) ORDER BY w."order"`,
  [A1, ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']]);
console.log('\nҲамаи рӯзҳои ҳафта (бояд ҳама бо ҳарфи ХУРД бошанд):');
days.forEach(d => console.log(`  ${d.word.padEnd(10)} ${d.tr}`));

// Берун аз A1 чизе тағйир наёфт.
const outside = await q(
  `SELECT c.level, tl.code, COUNT(*)::int n FROM "Word" w
     JOIN "Lesson" l ON l.id=w."lessonId" JOIN "Module" m ON m.id=l."moduleId"
     JOIN "Course" c ON c.id=m."courseId" JOIN "Language" tl ON tl.id=c."targetLanguageId"
    WHERE m."courseId" <> $1
      AND (w.example ILIKE '%dushanbe%' OR w."exampleTrans" ILIKE '%душанбе%')
    GROUP BY c.level, tl.code ORDER BY tl.code, c.level`, [A1]);
console.log('\nҲамон намуна дар курсҳои ДИГАР (даст нахӯрданд):');
console.log(outside.length ? outside.map(r => `  ${r.code}-${r.level}: ${r.n} сатр`).join('\n') : '  —');
