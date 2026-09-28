// Роҳи «Сохтмон» 9 → 17 вазъият (28.09.2026): вазъиятҳои умумӣ ва сохтмонии
// мавҷуда ҷой медиҳанд, то 8 вазъияти нав байни онҳо ояд. Тартиби НИСБИИ
// вазъиятҳои умумӣ (барои нишаҳои дигар) иваз намешавад.
// Ҳам JSON (`content/speaking`) ва ҳам база (SQL — seed аудиоро мекушад).
//   node prisma/_ru-build-reorder.mjs [--dry]
import { readFileSync, writeFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';
const env = Object.fromEntries(readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')]; }));
const sql = neon(env.DATABASE_URL);
const dry = process.argv.includes('--dry');
const MOVE = { doctor_ru_tg: 6, safety_ru_tg: 8, market_ru_tg: 10, pay_ru_tg: 12, rent_ru_tg: 14, docs_ru_tg: 16 };
for (const [slug, order] of Object.entries(MOVE)) {
  const p = `content/speaking/${slug}.json`;
  const j = JSON.parse(readFileSync(p, 'utf8'));
  const tt = j.category.titleTranslated;
  const was = j.category.order;
  j.category.order = order;
  if (!dry) writeFileSync(p, JSON.stringify(j, null, 2) + '\n', 'utf8');
  const rows = dry
    ? await sql`SELECT c.id FROM "SpeakingCategory" c JOIN "Language" t ON t.id=c."targetLanguageId" JOIN "Language" n ON n.id=c."nativeLanguageId" WHERE t.code='ru' AND n.code='tg' AND c."titleTranslated"=${tt}`
    : await sql`UPDATE "SpeakingCategory" c SET "order"=${order} FROM "Language" t, "Language" n WHERE t.id=c."targetLanguageId" AND n.id=c."nativeLanguageId" AND t.code='ru' AND n.code='tg' AND c."titleTranslated"=${tt} RETURNING c.id`;
  console.log(`${tt}: ${was} → ${order} (${rows.length} сатр)${dry ? ' [dry]' : ''}`);
  if (rows.length !== 1) throw new Error(`«${tt}»: интизор 1 сатр, ${rows.length}`);
}
