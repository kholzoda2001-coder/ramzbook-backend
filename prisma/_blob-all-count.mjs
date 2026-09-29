// Все ссылки на Vercel Blob (store заблокирован → 403) во ВСЕХ текстовых колонках. Только чтение.
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';
const env = Object.fromEntries(readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')
  .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
  .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sql = neon(env.DATABASE_URL);
const cols = await sql.query(`SELECT table_name t, column_name c FROM information_schema.columns
  WHERE table_schema='public' AND data_type IN ('text','character varying')`);
for (const { t, c } of cols) {
  const [r] = await sql.query(`SELECT count(*)::int n FROM "${t}" WHERE "${c}" LIKE '%blob.vercel-storage.com%'`);
  if (r.n) console.log(`${t}.${c}: ${r.n}`);
}
