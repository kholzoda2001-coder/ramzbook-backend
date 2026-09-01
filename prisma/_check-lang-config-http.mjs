// ТАНҲО ХОНИШ: танзимоти «ба забон вобаста»-и ҳар забонро нишон медиҳад.
//   node prisma/_check-lang-config-http.mjs
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);

const rows = await sql.query(
  `SELECT code, name, "isActive", "hasIPA", direction, "ttsLocale", "sttLocale", "fontFamily"
     FROM "Language" ORDER BY "order" ASC, name ASC`);

console.log('code  name             active hasIPA dir  tts        stt        font');
for (const r of rows) {
  console.log('%s %s %s %s %s %s %s %s',
    String(r.code).padEnd(5),
    String(r.name).slice(0,16).padEnd(16),
    String(r.isActive).padEnd(6),
    String(r.hasIPA).padEnd(6),
    String(r.direction).padEnd(4),
    String(r.ttsLocale ?? '-').padEnd(10),
    String(r.sttLocale ?? '-').padEnd(10),
    String(r.fontFamily ?? '-'));
}
