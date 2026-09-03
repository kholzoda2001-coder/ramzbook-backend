import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';
const env = Object.fromEntries(
  readFileSync('C:/Users/ASUS1/Desktop/RAMZ/backend/.env', 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);

console.log('=== ALL LANGUAGES ===');
const langs = await sql.query(`SELECT id, code, name, "nativeName", flag, "canBeNative", "canBeTarget", badge, "learnerCount", "order", "isActive", "ttsLocale", "sttLocale", direction, "hasIPA" FROM "Language" ORDER BY "order"`);
for (const l of langs) console.log(JSON.stringify(l));

const ko = langs.find(l => l.code === 'ko' || l.code === 'ko-KR' || /korea/i.test(l.name));
console.log('\n=== KO LANGUAGE ROW ===');
console.log(ko ? JSON.stringify(ko, null, 2) : 'НЕСТ дар ҷадвали Language');

console.log('\n=== COURSES (all) ===');
const courses = await sql.query(`SELECT c.id, c.level, c.title, c."isActive", t.code AS target, n.code AS native,
  (SELECT COUNT(*) FROM "Module" m WHERE m."courseId"=c.id) AS modules
  FROM "Course" c JOIN "Language" t ON t.id=c."targetLanguageId" JOIN "Language" n ON n.id=c."nativeLanguageId" ORDER BY t.code, c.level`);
for (const c of courses) console.log(`${c.target}->${c.native} ${c.level} | active=${c.isActive} | modules=${c.modules} | ${c.title}`);

console.log('\n=== LIBRARY ITEMS by targetLang ===');
const lib = await sql.query(`SELECT "targetLang", COUNT(*) c FROM "LibraryItem" GROUP BY "targetLang" ORDER BY 1`);
for (const r of lib) console.log(`${r.targetLang}: ${r.c}`);

console.log('\n=== LIBRARY ITEMS ko (detail) ===');
const libko = await sql.query(`SELECT i.id, i.title, i.type, i."targetLang", i."nativeLang", i."isActive", i."mediaUrl", (SELECT COUNT(*) FROM "LibraryPage" p WHERE p."itemId"=i.id) pages FROM "LibraryItem" i WHERE i."targetLang" ILIKE 'ko%'`);
console.log(libko.length ? libko.map(r=>JSON.stringify(r)).join('\n') : '(нест)');

if (ko) {
  console.log('\n=== SPEAKING for ko ===');
  const sp = await sql.query(`SELECT id, title, "titleTranslated", "isActive" FROM "SpeakingCategory" WHERE "targetLanguageId"=$1`, [ko.id]);
  console.log(sp.length ? sp.map(r=>JSON.stringify(r)).join('\n') : '(нест)');

  console.log('\n=== ALPHABET / other ko tables ===');
  for (const t of ['AlphabetLetter','AlphabetRule','UiTranslation']) {
    try {
      const r = await sql.query(`SELECT COUNT(*) c FROM "${t}" WHERE "languageId"=$1`, [ko.id]);
      console.log(`${t}: ${r[0].c}`);
    } catch (e) { console.log(`${t}: ? (${e.message.slice(0,60)})`); }
  }
}
