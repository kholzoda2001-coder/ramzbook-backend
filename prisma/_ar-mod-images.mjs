// Кадом калимаҳои як модул расм доранд ва он расмҳо дар CDN зиндаанд?
//
// Расм дар барнома аз рӯи МАТНИ калима сохта мешавад:
//   cdn.jsdelivr.net/gh/.../images/<lang>/<калима>.png
// (ниг. `offline_repository.dart` ва `course_roadmap_screen.dart`).
// Пас ҳар тағйири матни калима метавонад расмро хомӯшона гум кунад —
// маҳз барои ҳамин ин санҷиш баъди ҳар ислоҳи мазмун лозим аст.
//
//   node prisma/_ar-mod-images.mjs 1
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }),
);
const sql = neon(env.DATABASE_URL);
const ORDER = Number(process.argv[2] ?? 0);
const CDN = 'https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio@main/images/ar';

const [course] = await sql.query(`SELECT c.id FROM "Course" c
  JOIN "Language" t ON t.id=c."targetLanguageId"
  JOIN "Language" n ON n.id=c."nativeLanguageId"
 WHERE t.code='ar' AND n.code='tg' AND c.level='A1'`);
const [mod] = await sql.query(
  `SELECT id, "titleTranslated" t FROM "Module" WHERE "courseId"=$1 AND "order"=$2`, [course.id, ORDER]);
const ls = await sql.query(`SELECT id, "order" o FROM "Lesson" WHERE "moduleId"=$1`, [mod.id]);
const words = await sql.query(
  `SELECT w.word, w.translation, l."order" lo FROM "Word" w
     JOIN "Lesson" l ON l.id=w."lessonId"
    WHERE w."lessonId"=ANY($1) ORDER BY l."order", w."order"`, [ls.map((x) => x.id)]);

console.error(`Модул ${ORDER}: ${mod.t} · ${words.length} калима`);
let have = 0;
const found = [];
// ⚠️ Айнан ҳамон меъёри барнома — `_normImageKey` дар
// `course_roadmap_screen.dart`: ҳарфи хурд, ҳаракатҳо бароварда,
// аломати китобатӣ бароварда, фосила → `_`. Бе ин, санҷиш «расм нест»
// мегӯяд, дар ҳоле ки барнома онро дуруст меёбад.
const normKey = (w) => w
  .toLowerCase()
  .trim()
  .replace(/[ً-ٰٟۖ-ۭـ]/g, '')
  .replace(/['’.,!?]/g, '')
  .replace(/\s+/g, '_');

for (const w of words) {
  const key = normKey(w.word);
  const url = `${CDN}/${encodeURIComponent(key)}.png`;
  let ok = false;
  try {
    const r = await fetch(url, { method: 'HEAD' });
    ok = r.ok;
  } catch { ok = false; }
  if (ok) { have++; found.push({ url, tg: w.translation, word: w.word, lesson: w.lo }); }
}

if (process.argv.includes('--json')) {
  // Такрори як калима дар ду дарс як расм аст — як бор кофӣ.
  const seen = new Set();
  const uniq = found.filter((f) => !seen.has(f.url) && seen.add(f.url));
  process.stdout.write(JSON.stringify(uniq, null, 1));
} else {
  for (const f of found) console.log(`  🖼  Д${f.lesson}  ${f.word}  «${f.tg}»`);
  console.log(`\nРасм доранд: ${have} аз ${words.length}`);
  if (!have) console.log('→ ҳамаи кортҳо эмоҷӣ нишон медиҳанд (расми шикаста нест).');
}
