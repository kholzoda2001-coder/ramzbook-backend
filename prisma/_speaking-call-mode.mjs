// Миссияҳои «Кор ёфтан» ва «Иҷораи хона» → «Занги телефон» (27.09.2026).
// Ҳамон қимат дар `content/speaking/{job,rent}_ru_tg.json` (`mode: "call"`),
// вале seed аудиоро мекушад — пас ин ҷо танҳо SQL. Идемпотент.
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';
const env = Object.fromEntries(readFileSync('.env', 'utf8').split(/\r?\n/).filter((l) => l.includes('=') && !l.trim().startsWith('#')).map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')]; }));
const sql = neon(env.DATABASE_URL);
const RU = 'cmpqk40yz00009rhl1uazdfi3';
for (const title of ['Кор ёфтан', 'Иҷораи хона']) {
  await sql`UPDATE "SpeakingLesson" l SET mode = 'call' FROM "SpeakingCategory" c
             WHERE l."categoryId" = c.id AND c."targetLanguageId" = ${RU} AND c."titleTranslated" = ${title} AND l.stage = 'mission'`;
}
const rows = await sql`SELECT c."titleTranslated" t, l.title, l.mode FROM "SpeakingLesson" l JOIN "SpeakingCategory" c ON c.id = l."categoryId"
                        WHERE c."targetLanguageId" = ${RU} AND l.stage = 'mission' ORDER BY c."order"`;
console.table(rows);
