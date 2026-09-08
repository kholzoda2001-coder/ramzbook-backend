// «Худои Забон» → «Соли тиллоӣ» барои дастоварди `streak_365`.
//
// Чаро дастӣ: аз ин мошин Prisma ба Neon намерасад (TCP 5432 баста).
// Ниг. [[ramz-db-scripts-local]]. Дастовардҳо ТАНҲО дар DB зиндагӣ мекунанд —
// дар код ё seed нестанд, барои ҳамин ислоҳ бояд ҳамин ҷо шавад.
//
//   node prisma/_ach-rename-streak365-http.mjs --dry
//   node prisma/_ach-rename-streak365-http.mjs
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

const CODE = 'streak_365';
const NAME = 'Соли тиллоӣ';
const NAMES = { tg: 'Соли тиллоӣ', ru: 'Золотой год', en: 'Golden Year', uz: 'Oltin yil' };

const [before] = await q(
  `SELECT code, name, "nameTranslations" FROM "Achievement" WHERE code = $1`, [CODE]
);
if (!before) { console.log(`Дастоварди «${CODE}» ёфт нашуд.`); process.exit(1); }

console.log(`ҳозир: ${before.name} · ${JSON.stringify(before.nameTranslations)}`);
if (before.name === NAME) { console.log('Аллакай ислоҳ шудааст, коре нест.'); process.exit(0); }
if (DRY) { console.log(`[--dry] → ${NAME} · ${JSON.stringify(NAMES)}`); process.exit(0); }

await q(
  `UPDATE "Achievement" SET name = $1, "nameTranslations" = $2::jsonb WHERE code = $3`,
  [NAME, JSON.stringify(NAMES), CODE]
);

const [after] = await q(
  `SELECT name, "nameTranslations" FROM "Achievement" WHERE code = $1`, [CODE]
);
console.log(`шуд:   ${after.name} · ${JSON.stringify(after.nameTranslations)}`);
