// Як бастаи спикингро аз `content/speaking/<slug>.json` ба база мегузорад.
//
// Prisma аз ин мошин ба Neon намерасад (порти 5432 баста) — драйвери HTTP.
// Идемпотент аз рӯи (ҷуфти забон, унвони боб): боби ҳамном аввал НЕСТ карда
// мешавад, баъд аз нав навишта мешавад.
//
//   node prisma/_seed-speaking-http.mjs meeting_people_en_tg
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);

const slug = process.argv[2];
if (!slug) { console.error('slug lozim'); process.exit(1); }
const pack = JSON.parse(
  readFileSync(new URL(`../content/speaking/${slug}.json`, import.meta.url), 'utf8'));

let n = 0;
const cuid = () =>
  'c' + Date.now().toString(36) + (n++).toString(36).padStart(3, '0') +
  Math.random().toString(36).slice(2, 10);

const [tgt] = await sql.query(`SELECT id FROM "Language" WHERE code = $1`, [pack.targetLanguage]);
const [nat] = await sql.query(`SELECT id FROM "Language" WHERE code = $1`, [pack.nativeLanguage]);
if (!tgt || !nat) { console.error('zabon nayoft'); process.exit(1); }

const c = pack.category;
await sql.query(
  `DELETE FROM "SpeakingCategory"
     WHERE "targetLanguageId" = $1 AND "nativeLanguageId" = $2 AND "titleTranslated" = $3`,
  [tgt.id, nat.id, c.titleTranslated]);

const catId = cuid();
await sql.query(
  `INSERT INTO "SpeakingCategory"
     (id, "targetLanguageId", "nativeLanguageId", title, "titleTranslated",
      scenario, emoji, "order", "isPremium", "isActive", "createdAt")
   VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, NOW())`,
  [catId, tgt.id, nat.id, c.title, c.titleTranslated, c.scenario ?? null,
   c.emoji ?? '🎙️', c.order ?? 0, !!c.isPremium, c.isActive !== false]);

let lessons = 0, items = 0;
for (const L of pack.lessons) {
  const lid = cuid();
  await sql.query(
    `INSERT INTO "SpeakingLesson" (id, "categoryId", title, "order", "isActive", "createdAt")
     VALUES ($1,$2,$3,$4,true, NOW())`,
    [lid, catId, L.title ?? null, L.order ?? 0]);
  lessons++;
  for (const i of L.items) {
    await sql.query(
      `INSERT INTO "SpeakingItem"
         (id, "lessonId", kind, text, translation, literal, note,
          cue, "cueTranslation", "audioUrl", "order")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NULL,$10)`,
      [cuid(), lid, i.kind, i.text, i.translation, i.literal ?? null,
       i.note ?? null, i.cue ?? null, i.cueTranslation ?? null, i.order ?? 0]);
    items++;
  }
}
console.log('%s -> bob:1 dars:%d vohid:%d', slug, lessons, items);
