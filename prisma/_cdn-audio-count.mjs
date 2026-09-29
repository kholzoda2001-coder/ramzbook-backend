// Сколько аудио на jsDelivr в каждой колонке (для обрезки тишины в начале). Только чтение.
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';
const env = Object.fromEntries(readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')
  .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
  .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sql = neon(env.DATABASE_URL);
const cols = await sql.query(`SELECT table_name t, column_name c FROM information_schema.columns
  WHERE table_schema='public' AND column_name ILIKE '%audio%' AND data_type IN ('text','character varying')`);
let total = 0, uniq = new Set();
for (const { t, c } of cols) {
  const rows = await sql.query(`SELECT "${c}" u FROM "${t}" WHERE "${c}" LIKE 'https://cdn.jsdelivr.net/%'`);
  if (rows.length) { console.log(`${t}.${c}: ${rows.length}`); total += rows.length; rows.forEach((r) => uniq.add(r.u)); }
}
console.log(`ҳамагӣ: ${total} сатр · ${uniq.size} файли ягона`);
