// Транскрипсияи тоҷикии бастаҳои «Гуфтор»-и олмонӣ (29.09.2026).
//
// Имлои олмонӣ фонетикӣ НЕСТ (vs туркӣ) → транскрипсия аз ЛУҒАТИ калимаҳо:
//   1) Word.ipaTajik-и курси олмонӣ (698 калима, «der Gürtel» → «дэ:а гю́ртэл»);
//   2) SpeakingItem.literal-и боби кӯҳнаи «Kennenlernen»;
//   3) `prisma/_de-extra-ipa.json` — IPA-и дастии калимаҳои нав → `ipaToTajik`
//      (ҳамон табдилдиҳандае, ки корти калимаи курсро месозад).
// Калимаи номаълум → рӯйхат ва ҳеҷ чиз навишта намешавад (хониши тахминӣ нест).
//
//   node prisma/_de-fill-literal.mjs <slug>…
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { neon } from '@neondatabase/serverless';
import { ipaToTajik, selfTest } from './_de-tajik.mjs';

console.log(`✓ худсанҷиши транслитератор: ${selfTest()} мисол`);
const env = Object.fromEntries(readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')
  .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
  .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sql = neon(env.DATABASE_URL);

const norm = (t) => t.toLowerCase().replace(/[.,!?;:„“”"«»()]/g, '').trim();
const votes = {};
const vote = (src, tj) => {
  const a = src.split(/\s+/).map(norm).filter(Boolean);
  const b = tj.replace(/[.,!?]/g, '').split(/\s+/).filter(Boolean);
  if (!a.length || a.length !== b.length) return;
  a.forEach((w, i) => { ((votes[w] ??= {})[b[i]] = (votes[w][b[i]] ?? 0) + 1); });
};
for (const r of await sql.query(`SELECT w.word t, w."ipaTajik" l FROM "Word" w JOIN "Lesson" le ON le.id=w."lessonId"
  JOIN "Module" m ON m.id=le."moduleId" JOIN "Course" c ON c.id=m."courseId" JOIN "Language" g ON g.id=c."targetLanguageId"
  WHERE g.code='de' AND coalesce(w."ipaTajik",'')<>''`)) vote(r.t, r.l);
for (const r of await sql.query(`SELECT i.text t, i.literal l FROM "SpeakingItem" i JOIN "SpeakingLesson" s ON s.id=i."lessonId"
  JOIN "SpeakingCategory" c ON c.id=s."categoryId" JOIN "Language" g ON g.id=c."targetLanguageId"
  WHERE g.code='de' AND coalesce(i.literal,'')<>'' AND i.text NOT LIKE '%{%'`)) vote(r.t, r.l);
const dict = Object.fromEntries(Object.entries(votes).map(([w, v]) => [w, Object.entries(v).sort((x, y) => y[1] - x[1])[0][0]]));
const EXTRA = existsSync('prisma/_de-extra-ipa.json') ? JSON.parse(readFileSync('prisma/_de-extra-ipa.json', 'utf8')) : {};
console.log(`луғат: ${Object.keys(dict).length} калима · IPA-и дастӣ: ${Object.keys(EXTRA).length}`);

const unknown = new Map();
const lit = (text) => {
  if (!text || text.includes('{')) return null;
  return text.split(/\s+/).map((tok) => {
    if (tok.includes('___')) return '___';
    const w = norm(tok);
    if (!w) return '';
    // IPA-и дастӣ бар луғат бартарӣ дорад (барои ислоҳи хониши нодурусти луғат).
    if (EXTRA[w]) return ipaToTajik(EXTRA[w]);
    if (dict[w]) return dict[w];
    unknown.set(w, (unknown.get(w) ?? 0) + 1);
    return '?';
  }).filter(Boolean).join(' ');
};

const packs = process.argv.slice(2).map((slug) => [slug, JSON.parse(readFileSync(`content/speaking/${slug}.json`, 'utf8'))]);
for (const [, j] of packs) for (const L of j.lessons) for (const it of L.items) it.literal = lit(it.text);
if (unknown.size) {
  console.log(`\n⛔ ${unknown.size} калима дар луғат нест — IPA-ро ба prisma/_de-extra-ipa.json илова кунед:`);
  console.log(JSON.stringify(Object.fromEntries([...unknown.keys()].sort().map((k) => [k, ''])), null, 1));
  process.exit(1);
}
for (const [slug, j] of packs) {
  writeFileSync(`content/speaking/${slug}.json`, JSON.stringify(j, null, 2) + '\n');
  console.log(`${slug}: транскрипсия пур шуд`);
}
