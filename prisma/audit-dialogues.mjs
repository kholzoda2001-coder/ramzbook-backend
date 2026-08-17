import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';

// Ҳар муколама: сарлавҳа, тавсифи вазъият (scenario) ва матни ҳамаи сатрҳо.
// Мақсад: ёфтани тавсифҳое, ки ба мазмуни муколама мувофиқ НЕСТАНД
// (мас. «ду мошинро муқоиса мекунанд», дар ҳоле ки муколама дар бораи телефон аст).
const env = readFileSync(new URL('../.env', import.meta.url), 'utf8');
const raw = (env.match(/^\s*DATABASE_URL\s*=\s*"([^"]+)"/m) || [])[1];
const sql = neon(raw
  .replace('-pooler.', '.')
  .replace(/[?&](pgbouncer|connection_limit|pool_timeout|connect_timeout)=[^&]*/g, ''));

const rows = await sql.query(
  `SELECT d.id, c.title AS course, d."cefrLevel", d.title, d."titleTranslated", d.scenario,
          STRING_AGG(l.text, ' | ' ORDER BY l."order") AS lines
     FROM "Dialogue" d
     JOIN "Course" c ON c.id = d."courseId"
     LEFT JOIN "DialogueLine" l ON l."dialogueId" = d.id
    GROUP BY d.id, c.title, d."cefrLevel", d.title, d."titleTranslated", d.scenario
    ORDER BY c.title, d."order"`,
);

console.log(`${rows.length} муколама\n`);
for (const r of rows) {
  console.log(`── [${r.course} · ${r.cefrLevel || '—'}] ${r.title}`);
  console.log(`   tj: ${r.titleTranslated}`);
  console.log(`   scenario: ${r.scenario || '(нест)'}`);
  console.log(`   lines: ${(r.lines || '').slice(0, 400)}`);
  console.log(`   id: ${r.id}\n`);
}
