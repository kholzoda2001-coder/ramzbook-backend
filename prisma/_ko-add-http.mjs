/**
 * Кореягиро ҳамчун забони ОМӮЗИШ барои тоҷикзабонон илова мекунад.
 *
 * ЧАРО скрипт, на панели админ: форми `/admin/courses/new` забонро ҳамеша бо
 * `isActive: true` месозад ва `POST /api/admin/courses` `canBeTarget`-ро маҷбуран
 * рост мекунад — яъне 🇰🇷 ҳамон лаҳза дар онбординги телефонҳо пайдо мешуд ва
 * хонанда ба курси ХОЛӢ медаромад. Ин ҷо ҳарду бо `isActive = false` сохта
 * мешаванд, ҳамон тавре ки арабӣ/олмонӣ/туркӣ/хитоӣ/ҷопонӣ нигоҳ дошта шудаанд.
 *
 * Порти 5432 аз ин шабака баста аст — драйвери HTTP, ниг. дигар `_*-http.mjs`.
 * Идемпотент: такрор иҷро кардан сатри дубора намесозад.
 */
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);

let n = 0;
const cuid = () =>
  'c' + Date.now().toString(36) + (n++).toString(36).padStart(3, '0') +
  Math.random().toString(36).slice(2, 10);

// ── 1. Забон ────────────────────────────────────────────────────────────────
let [ko] = await sql.query(`SELECT * FROM "Language" WHERE code = 'ko'`);
if (ko) {
  console.log('• Забони «ko» аллакай ҳаст:', ko.id, '— нав сохта намешавад');
} else {
  const id = cuid();
  await sql.query(
    `INSERT INTO "Language"
       (id, code, name, "nativeName", flag, "canBeNative", "canBeTarget",
        badge, "learnerCount", "order", "isActive", "createdAt",
        "ttsLocale", "sttLocale", direction, "fontFamily", "hasIPA")
     VALUES ($1,'ko','Кореягӣ','한국어','🇰🇷', false, true,
             NULL, NULL, 6, false, NOW(),
             'ko-KR','ko-KR','ltr', NULL, true)`, [id]);
  [ko] = await sql.query(`SELECT * FROM "Language" WHERE code = 'ko'`);
  console.log('✓ Забони кореягӣ сохта шуд:', id);
}

// ── 2. Курси ko → tg, A1 ────────────────────────────────────────────────────
const [tg] = await sql.query(`SELECT id FROM "Language" WHERE code = 'tg'`);
if (!tg) { console.error('✗ Забони модарии «tg» ёфт нашуд — қатъ'); process.exit(1); }

const [dup] = await sql.query(
  `SELECT id FROM "Course"
    WHERE "targetLanguageId" = $1 AND "nativeLanguageId" = $2 AND level = 'A1'`,
  [ko.id, tg.id]);

if (dup) {
  console.log('• Курси ko→tg A1 аллакай ҳаст:', dup.id);
} else {
  const cid = cuid();
  await sql.query(
    `INSERT INTO "Course"
       (id, "targetLanguageId", "nativeLanguageId", level, title, description,
        emoji, color, "order", "isActive", "createdAt")
     VALUES ($1, $2, $3, 'A1', 'Забони кореягӣ — A1',
             'Аз нол: ҳангул, талаффуз, саломпурсӣ, рақамҳо, оила ва гуфтугӯи ҳаррӯза',
             '🇰🇷', '#7C3AED', 0, false, NOW())`, [cid, ko.id, tg.id]);
  console.log('✓ Курси ko→tg A1 сохта шуд:', cid);
}

// ── 3. Санҷиш ───────────────────────────────────────────────────────────────
console.log('\n── Натиҷа ──');
const [row] = await sql.query(
  `SELECT code, name, "nativeName", flag, "canBeTarget", "canBeNative",
          "isActive", "ttsLocale", "sttLocale", direction, "hasIPA", "order"
     FROM "Language" WHERE code = 'ko'`);
console.log('Language:', JSON.stringify(row));
for (const c of await sql.query(
  `SELECT c.level, c.title, c.emoji, c.color, c."isActive",
          (SELECT COUNT(*) FROM "Module" m WHERE m."courseId" = c.id) modules
     FROM "Course" c WHERE c."targetLanguageId" = $1`, [ko.id]))
  console.log('Course  :', JSON.stringify(c));
