import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';

// ─────────────────────────────────────────────────────────────────────────────
// Ислоҳи тавсифи вазъияти муколамаҳо (`Dialogue.scenario`).
//
// Се хатои возеҳ:
//  1. «Which One Is Better?» — тавсиф мегӯяд «ду МОШИН», вале ҳамаи ҳашт сатри
//     муколама дар бораи ТЕЛЕФОН аст (two phones, better camera, lighter).
//     Тавсифро ислоҳ мекунем, на сатрҳоро: сатрҳо аудиои сабтшуда доранд ва
//     мазмуни грамматикии дарс (дараҷаи қиёсӣ) дуруст аст.
//  2. «хариди мекунад» → «харид мекунад» — исми `харид` изофаи «-и» намегирад.
//  3. «метрора» → «метроро» — пасванди бевоситаи `-ро` баъди садоноки `о`.
//
// Иваз бо ID мешавад, на бо матн: агар матн пештар қисман ислоҳ шуда бошад,
// иваз хомӯшона аз кор намемонад — скрипт мегӯяд, ки чанд сатр тағйир ёфт.
//
//   node prisma/fix-dialogue-scenarios.mjs         — dry-run
//   node prisma/fix-dialogue-scenarios.mjs --apply
// ─────────────────────────────────────────────────────────────────────────────

const APPLY = process.argv.includes('--apply');

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8');
const raw = (env.match(/^\s*DATABASE_URL\s*=\s*"([^"]+)"/m) || [])[1];
if (!raw) throw new Error('DATABASE_URL дар .env ёфт нашуд');
const sql = neon(raw
  .replace('-pooler.', '.')
  .replace(/[?&](pgbouncer|connection_limit|pool_timeout|connect_timeout)=[^&]*/g, ''));

const FIXES = [
  {
    id: 'cmrf98tvb005lmga2oc803rv1',
    why: 'муколама дар бораи телефон аст, на мошин',
    to: 'Ду дӯст ду телефонро муқоиса мекунанд ва беҳтаринро интихоб мекунанд.',
  },
  {
    id: 'cmqan0qqk007js2t1dsw3gzgo',
    why: '«хариди мекунад» → «харид мекунад»',
    to: 'Харидор нарх мепурсад ва харид мекунад.',
  },
  {
    id: 'cmqan0ra5007qs2t1ejs2lptu',
    why: '«метрора» → «метроро»',
    to: 'Сайёҳ роҳи метроро мепурсад.',
  },
];

async function main() {
  let changed = 0;
  for (const f of FIXES) {
    const [row] = await sql.query(
      `SELECT title, scenario FROM "Dialogue" WHERE id = $1`, [f.id],
    );
    if (!row) { console.log(`❌ ${f.id} ёфт нашуд`); continue; }
    if (row.scenario === f.to) { console.log(`⏭  ${row.title} — аллакай дуруст`); continue; }

    console.log(`── ${row.title}  (${f.why})`);
    console.log(`   пеш:  ${row.scenario}`);
    console.log(`   баъд: ${f.to}`);

    if (APPLY) {
      await sql.query(`UPDATE "Dialogue" SET scenario = $1 WHERE id = $2`, [f.to, f.id]);
      console.log('   ✅ навсозӣ шуд');
      changed++;
    }
  }

  if (APPLY && changed > 0) {
    await sql.query(
      `UPDATE "AppSetting" SET "valueJson" = $1, "updatedAt" = NOW() WHERE key = $2`,
      [JSON.stringify(String(Date.now())), 'content_version'],
    );
    console.log('\n✅ content_version нав шуд — кэши барномаҳо нав мешавад');
  }
  console.log(`\n${changed} тағйир${APPLY ? '' : ' (dry-run, --apply лозим)'}`);
}

main().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
