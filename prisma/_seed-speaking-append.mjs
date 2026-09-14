// Дарсҳои НАВи бастаро ба боби МАВҶУДА илова мекунад — бе нест кардан.
//
// Чаро: `_seed-speaking-http.mjs` бобро нест карда аз нав месозад → `audioUrl`-и
// воҳидҳо ва `SpeakingProgress`-и корбарон мемиранд. Ин скрипт боби ҳамон ҷуфти
// забон ва `titleTranslated`-ро меёбад ва танҳо дарсҳоеро месозад, ки `order`-и
// онҳо дар база НЕСТ. Дарсҳои мавҷуда даст намехӯранд.
//
//   node prisma/_seed-speaking-append.mjs meeting_people_ar_tg [--dry]
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);

const slug = process.argv[2];
const DRY = process.argv.includes('--dry');
if (!slug) { console.error('slug lozim'); process.exit(1); }
const pack = JSON.parse(readFileSync(new URL(`../content/speaking/${slug}.json`, import.meta.url), 'utf8'));

let n = 0;
const cuid = () =>
  'c' + Date.now().toString(36) + (n++).toString(36).padStart(3, '0') + Math.random().toString(36).slice(2, 10);

const [tgt] = await sql.query(`SELECT id FROM "Language" WHERE code = $1`, [pack.targetLanguage]);
const [nat] = await sql.query(`SELECT id FROM "Language" WHERE code = $1`, [pack.nativeLanguage]);
if (!tgt || !nat) { console.error('zabon nayoft'); process.exit(1); }

const [cat] = await sql.query(
  `SELECT id FROM "SpeakingCategory" WHERE "targetLanguageId" = $1 AND "nativeLanguageId" = $2 AND "titleTranslated" = $3`,
  [tgt.id, nat.id, pack.category.titleTranslated]);
if (!cat) { console.error('bob nayoft — avval _seed-speaking-http.mjs'); process.exit(1); }

const existing = await sql.query(`SELECT "order", title FROM "SpeakingLesson" WHERE "categoryId" = $1`, [cat.id]);
const byOrder = new Map(existing.map(r => [r.order, r.title]));

let lessons = 0, items = 0;
for (const L of pack.lessons) {
  if (byOrder.has(L.order)) {
    if (byOrder.get(L.order) !== L.title) {
      console.error(`order ${L.order}: dar baza «${byOrder.get(L.order)}», dar JSON «${L.title}» — qat`);
      process.exit(1);
    }
    continue;
  }
  lessons++; items += L.items.length;
  if (DRY) continue;
  const lid = cuid();
  await sql.query(
    `INSERT INTO "SpeakingLesson" (id, "categoryId", title, "order", "isActive", "createdAt") VALUES ($1,$2,$3,$4,true, NOW())`,
    [lid, cat.id, L.title ?? null, L.order]);
  for (const i of L.items) {
    await sql.query(
      `INSERT INTO "SpeakingItem"
         (id, "lessonId", kind, text, translation, literal, note, cue, "cueTranslation", "audioUrl", "order", "wordCount")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NULL,$10,$11)`,
      [cuid(), lid, i.kind, i.text, i.translation, i.literal ?? null, i.note ?? null,
       i.cue ?? null, i.cueTranslation ?? null, i.order ?? 0, i.text.trim().split(/\s+/).filter(Boolean).length]);
  }
}
console.log('%s -> mavjud:%d nav dars:%d vohid:%d%s', slug, existing.length, lessons, items, DRY ? ' (--dry)' : '');
