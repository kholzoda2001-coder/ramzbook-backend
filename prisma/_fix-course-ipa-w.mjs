// Курси АНГЛИСӢ: `Word.ipaTajik` — садои /w/ аз «у» ба «в».
//
// Чаро: тарзи хониши тоҷикӣ — «уонт» ҳамчун «u-ont» хонда мешавад.
// Бастаҳои Speaking (`content/speaking/*.json`) аллакай ислоҳ
// шуданд (2026-09-06) — ин скрипт ҳамон қоидаро ба курс мебарад.
//
// ⚠️ ТАНҲО курсҳои англисӣ: дар русӣ/олмонӣ «у» + садонок садои /w/ НЕСТ.
// ⚠️ Аз ин мошин база дастрас нест (connect timeout) — аз шабакаи
//    дигар ё аз муҳити Vercel иҷро кунед.
//
// Иҷро:  node prisma/_fix-course-ipa-w.mjs            → намоиш (бе тағйир)
//        node prisma/_fix-course-ipa-w.mjs --apply    → менависад
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync('C:/Users/ASUS1/Desktop/RAMZ/backend/.env', 'utf8')
    .split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);
const APPLY = process.argv.includes('--apply');

// Ҳамон қоидаи бастаҳои спикинг: «у» дар ОҒОЗи калима + садонок.
const W_RE = /(^|[\s(«"])у(?=[оаэиеӣяёюу])/g;

const rows = await sql.query(
  `SELECT w.id, w.word, w."ipaTajik", lg.code AS lang
     FROM "Word" w
     JOIN "Lesson" l  ON l.id = w."lessonId"
     JOIN "Module" m  ON m.id = l."moduleId"
     JOIN "Course" c  ON c.id = m."courseId"
     JOIN "Language" lg ON lg.id = c."targetLanguageId"
    WHERE lg.code = 'en' AND w."ipaTajik" IS NOT NULL`
);

const hits = rows
  .map((r) => ({ ...r, next: r.ipaTajik.replace(W_RE, '$1в') }))
  .filter((r) => r.next !== r.ipaTajik);

console.log(`Калимаи англисӣ бо ipaTajik: ${rows.length}`);
console.log(`Тағйир лозим: ${hits.length}\n`);

const forms = new Map();
for (const h of hits) {
  for (const w of h.ipaTajik.split(/\s+/)) {
    if (/^у[оаэиеӣяёюу]/.test(w)) {
      if (!forms.has(w)) forms.set(w, []);
      forms.get(w).push(h.word);
    }
  }
}
console.log(`Шаклҳои гуногун: ${forms.size}`);
for (const [f, ws] of [...forms].sort()) {
  console.log(`  ${f.padEnd(14)} → в${f.slice(1).padEnd(13)} | ${[...new Set(ws)].slice(0, 4).join(', ')}`);
}

if (!APPLY) {
  console.log('\n(намоиш — база тағйир НАЁФТ. Барои татбиқ: --apply)');
  process.exit(0);
}

let n = 0;
for (const h of hits) {
  await sql.query(`UPDATE "Word" SET "ipaTajik" = $1 WHERE id = $2`, [h.next, h.id]);
  n++;
}
console.log(`\n✅ ТАТБИҚ ШУД: ${n} сатр нав шуд.`);
