import fs from 'node:fs';
import path from 'node:path';
const CSV = path.resolve(process.cwd(), '..', 'audit', 'report.csv');
const f = s => { s = String(s ?? ''); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
export function addRows(rows) {
  const out = rows.map(r => [r.lesson_id, r.lesson_title, r.pass, r.type, r.severity, r.quote, r.problem_tj, r.suggested_fix].map(f).join(',')).join('\n') + '\n';
  fs.appendFileSync(CSV, out, 'utf8');
  console.log(`+${rows.length} rows`);
}
