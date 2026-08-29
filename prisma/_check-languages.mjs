// Ҳолати ҷадвали Language-ро нишон медиҳад (кадом забон canBeNative/canBeTarget аст).
//   node prisma/_check-languages.mjs
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);

const rows = await sql.query(
  `SELECT id, code, name, "nativeName", flag, "canBeNative", "canBeTarget", "isActive", "order",
          "ttsLocale", "sttLocale", direction, "fontFamily", "hasIPA"
     FROM "Language" ORDER BY "order" ASC`);

for (const r of rows) {
  console.log(
    `${r.code.padEnd(4)} ${String(r.name).padEnd(10)} native=${r.canBeNative ? 'Y' : 'n'} target=${r.canBeTarget ? 'Y' : 'n'} active=${r.isActive ? 'Y' : 'n'} order=${r.order} tts=${r.ttsLocale ?? '-'} id=${r.id}`);
}

const ui = await sql.query(
  `SELECT l.code, count(u.id)::int AS n
     FROM "Language" l LEFT JOIN "UiTranslation" u ON u."languageId" = l.id
    GROUP BY l.code ORDER BY l.code`);
console.log('\nUiTranslation:', ui.map(r => `${r.code}=${r.n}`).join('  '));
