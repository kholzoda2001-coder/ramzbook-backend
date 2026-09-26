// Санҷиши ТАНҲО-ХОНДАНӢ: сутунҳои курси вазъиятҳо (stage/intent/accepts)
// дар база ҳастанд ва бобҳои русӣ кадомҳоянд.
//   node --dns-result-order=ipv4first prisma/_chk_speaking_cols.mjs
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);

const cols = await sql.query(
  `SELECT table_name, column_name FROM information_schema.columns
    WHERE (table_name = 'SpeakingLesson' AND column_name = 'stage')
       OR (table_name = 'SpeakingItem' AND column_name IN ('intent', 'accepts'))`);
console.log('cols', cols.map(c => `${c.table_name}.${c.column_name}`));

const cats = await sql.query(
  `SELECT c."titleTranslated", c."order", c."isActive",
          (SELECT count(*) FROM "SpeakingLesson" l WHERE l."categoryId" = c.id) AS lessons,
          (SELECT count(*) FROM "SpeakingLesson" l WHERE l."categoryId" = c.id AND l.stage IS NOT NULL) AS staged
     FROM "SpeakingCategory" c JOIN "Language" t ON t.id = c."targetLanguageId"
    WHERE t.code = 'ru' ORDER BY c."order"`);
console.log('ru cats', cats);
