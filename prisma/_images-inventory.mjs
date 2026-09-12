// Инвентари РАСМҲО — кадом расмро хонанда воқеан мебинад ва бо кадом тартиб.
//
// Чаро: расмҳо дар CDN (`ramz-audio@main/images/<lang>/<калима>.png`) ҷамъ
// шудаанд, вале ҳеҷ рӯйхате нест, ки кадомашон дар дарс баромада истодаанд ва
// кадомаш бо чашм дида шудааст. Бе ин тартиб «ҳамаро аз нав бинем» кори
// беохир аст.
//
// Тартиб = ҳамон тартибе ки ХОНАНДА мебинад: сатҳ → модул → дарс → калима.
// Пас ислоҳ аз он ҷое сар мешавад, ки бештар одам мебинад.
//
//   node prisma/_images-inventory.mjs > tmp/images-inventory.json
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }),
);
const sql = neon(env.DATABASE_URL);

// Ҳамон нормализатсияе ки барнома мекунад (course_roadmap_screen._normImageKey).
function imageKey(word) {
  return (word ?? '')
    .toLowerCase()
    .trim()
    .replace(/[ً-ٰٕـ]/g, '')   // ҳаракатҳои арабӣ
    .replace(/['’.,!?]/g, '')
    .replace(/\s+/g, '_');
}

// 1. Файлҳои воқеии CDN.
const tree = await (await fetch(
  'https://api.github.com/repos/kholzoda2001-coder/ramz-audio/git/trees/main?recursive=1',
  { headers: { Accept: 'application/vnd.github+json' } },
)).json();
const onCdn = new Set(
  (tree.tree ?? [])
    .filter((x) => x.type === 'blob' && x.path.startsWith('images/'))
    .map((x) => x.path.replace(/^images\//, '').replace(/\.png$/i, '')),
);

// 2. Калимаҳо бо тартиби намоиш.
const rows = await sql.query(`
  SELECT t.code AS lang, c.level, m."order" AS m_ord, m.title AS module,
         l."order" AS l_ord, w."order" AS w_ord, w.word, w.translation
    FROM "Word" w
    JOIN "Lesson" l ON l.id = w."lessonId"
    JOIN "Module" m ON m.id = l."moduleId"
    JOIN "Course" c ON c.id = m."courseId"
    JOIN "Language" t ON t.id = c."targetLanguageId"
   WHERE c."isActive"
   ORDER BY t.code, c.level, m."order", l."order", w."order"`);

const seen = new Set();
const items = [];
for (const r of rows) {
  const key = imageKey(r.word);
  if (!key) continue;
  const path = `${r.lang}/${key}`;
  if (!onCdn.has(path)) continue;        // расм нест — эмоҷӣ мебарояд
  if (seen.has(path)) continue;          // ҳамон калима дар ду дарс
  seen.add(path);
  items.push({
    lang: r.lang,
    level: r.level,
    module: `M${r.m_ord}`,
    moduleTitle: r.module,
    word: r.word,
    tg: r.translation,
    url: `https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio@main/images/${path}.png`,
  });
}

// 3. Расмҳое ки дар CDN ҳастанд, вале ба ягон калима намерасанд — «ятим».
const orphans = [...onCdn].filter((p) => !seen.has(p));

const summary = {};
for (const it of items) {
  const k = `${it.lang} ${it.level}`;
  summary[k] = (summary[k] ?? 0) + 1;
}

console.error('── Расмҳое ки хонанда МЕБИНАД ──');
console.error(Object.entries(summary).sort().map(([k, n]) => `${k}: ${n}`).join('\n'));
console.error(`\nҶамъ: ${items.length} · дар CDN: ${onCdn.size} · ятим (истифода намешаванд): ${orphans.length}`);

process.stdout.write(JSON.stringify({ items, orphans, total: onCdn.size }, null, 0));
