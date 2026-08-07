import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';

// ─────────────────────────────────────────────────────────────────────────────
// «сохт кунед» → «созед»
//
// Феъли `сохтан` дар шакли амрии ҷамъ `созед` мешавад. «сохт кунед» омехтаи
// бемантиқи асоси замони гузашта (`сохт`) ва феъли ёридиҳандаи `кардан` аст —
// дар тоҷикӣ чунин сохт вуҷуд надорад. Хонанда инро дарҳол ҳамчун хатои
// саводнокӣ мебинад.
//
// База тавассути HTTP-и Neon: дар ин шабака порти 5432 бурида мешавад ва
// эндпоинти `-pooler` timeout медиҳад (ниг. gen-audio-fetch-http.mjs).
//
//   node prisma/fix-sokht-kuned.mjs         — танҳо ҳисоб мекунад (dry-run)
//   node prisma/fix-sokht-kuned.mjs --apply — иваз мекунад
// ─────────────────────────────────────────────────────────────────────────────

const APPLY = process.argv.includes('--apply');

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8');
const raw = (env.match(/^\s*DATABASE_URL\s*=\s*"([^"]+)"/m) || [])[1];
if (!raw) throw new Error('DATABASE_URL дар .env ёфт нашуд');
const sql = neon(raw
  .replace('-pooler.', '.')
  .replace(/[?&](pgbouncer|connection_limit|pool_timeout|connect_timeout)=[^&]*/g, ''));

// Ҳар ҷадвал ва сутунҳои матнии он, ки метавонанд ин ибораро дошта бошанд.
const TARGETS = [
  ['GrammarExercise', ['prompt', 'promptTranslated', 'explanation']],
  ['GrammarRule', ['title', 'body']],
  ['PlacementQuestion', ['prompt', 'promptTranslated', 'explanation']],
  ['ComprehensionQuestion', ['prompt', 'explanation']],
  ['ComprehensionExercise', ['prompt']],
  ['Lesson', ['title', 'description']],
  ['GrammarTopic', ['title', 'summary']],
];

const BAD = 'сохт кунед';
const GOOD = 'созед';

async function main() {
  let total = 0;
  for (const [table, cols] of TARGETS) {
    for (const col of cols) {
      let rows;
      try {
        rows = await sql.query(
          `SELECT id, "${col}" AS v FROM "${table}" WHERE "${col}" ILIKE $1`,
          [`%${BAD}%`],
        );
      } catch (e) {
        // Сутун вуҷуд надорад — ҷадвалҳо бо мурури замон тағйир меёбанд.
        const msg = (e.message || '').slice(0, 60);
        if (/does not exist/i.test(msg)) continue;
        console.log(`  ⚠️ ${table}.${col}: ${msg}`);
        continue;
      }
      if (!rows.length) continue;
      total += rows.length;
      const sample = [...new Set(rows.map((r) => r.v))].slice(0, 3);
      console.log(`${table}.${col}: ${rows.length} сатр`);
      for (const s of sample) console.log(`    «${s}» → «${s.replace(BAD, GOOD)}»`);

      if (APPLY) {
        // REPLACE дар худи Postgres — бе кашидан ва баргардонидани матн.
        const r = await sql.query(
          `UPDATE "${table}" SET "${col}" = REPLACE("${col}", $1, $2) WHERE "${col}" ILIKE $3`,
          [BAD, GOOD, `%${BAD}%`],
        );
        console.log(`    ✅ навсозӣ шуд`);
      }
    }
  }

  console.log(`\nҲамагӣ: ${total} сатр${APPLY ? ' — иваз шуд' : ' (dry-run, --apply лозим)'}`);

  if (APPLY && total > 0) {
    // Бе ин хонандагон матни навро то тамом шудани TTL-и кэш намебинанд.
    await sql.query(
      `UPDATE "AppSetting" SET "valueJson" = $1, "updatedAt" = NOW() WHERE key = $2`,
      [JSON.stringify(String(Date.now())), 'content_version'],
    );
    console.log('✅ content_version нав шуд — кэши барномаҳо нав мешавад');
  }
}

main().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
