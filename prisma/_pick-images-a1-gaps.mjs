// Ҳисоботи «кадом калимаи A1 акс надорад» — барои марҳилаи дувуми расмҳо
// (акс акнун дар корти «Калимаи нав» ҳам нишон дода мешавад, пас холигиҳо
// бештар ба чашм мерасанд).
//
// Танҳо МЕХОНАД: чизе тағйир намедиҳад. Натиҷа → _pick-images-a1-gaps.json
import { SignJWT } from 'jose';
import { readFileSync, writeFileSync } from 'fs';
import { execFileSync } from 'child_process';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const BASE = 'https://admin.ramz.tj';
const jwt = await new SignJWT({ username: 'admin', role: 'admin' })
  .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('2h')
  .sign(new TextEncoder().encode(env.JWT_SECRET));

const api = async (path) => {
  for (let i = 0; i < 4; i++) {
    const r = await fetch(BASE + path, { headers: { Cookie: `admin_token=${jwt}` } });
    if (r.ok) return r.json();
    await new Promise(s => setTimeout(s, 800 * (i + 1))); // Neon cold start
  }
  throw new Error('API: ' + path);
};

// Ҳамон меъёри барнома: аввал калидро нормалӣ мекунем (images/en/<key>.png).
const normKey = (w) => w.trim().toLowerCase()
  .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

const { courses } = await api('/api/admin/courses?level=A1');
// Диққат: номи забон дар база тоҷикист («Англисӣ»), пас аз рӯи КОД меҷӯем.
const course = courses.find(c => c.targetLanguage?.code === 'en');
if (!course) { console.error('курси A1-и англисӣ ёфт нашуд'); process.exit(1); }

const { modules } = await api(`/api/admin/modules?courseId=${course.id}`);
const out = [];
for (const m of modules) {
  const { lessons } = await api(`/api/admin/lessons?moduleId=${m.id}`);
  for (const l of lessons ?? []) {
    const { words } = await api(`/api/admin/words?lessonId=${l.id}&limit=500`);
    for (const w of words ?? []) {
      out.push({
        module: m.title, moduleOrder: m.order, lesson: l.title,
        word: w.word, tajik: w.translation ?? w.tajik ?? '',
        pos: (w.partOfSpeech ?? '').toLowerCase(),
        emoji: w.emoji ?? '', key: normKey(w.word),
      });
    }
  }
  console.log(`  ${m.title}: ${out.length} калима то ин ҷо`);
}

// Кадом калид аллакай дар CDN ҳаст (як дархост, на садто).
const tree = JSON.parse(execFileSync('curl', ['-s',
  'https://api.github.com/repos/kholzoda2001-coder/ramz-audio/git/trees/main?recursive=1'],
  { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }));
const have = new Set(tree.tree.filter(t => t.path.startsWith('images/en/'))
  .map(t => t.path.slice('images/en/'.length).replace(/\.png$/, '')));

const nouns = out.filter(w => w.pos === 'noun');
const missing = nouns.filter(w => !have.has(w.key));
writeFileSync(new URL('./_pick-images-a1-gaps.json', import.meta.url),
  JSON.stringify({
    total: out.length, nouns: nouns.length, have: have.size, missing,
    // Ҳамаи калимаҳо бо нишони «акс дорад» — то ҳангоми интихоб бинем, ки дар
    // ҲАМОН ДАРС аллакай кадом ашё акс дорад (хатари омехташавӣ маҳз дар як
    // дарс аст: варианти нодуруст танҳо аз калимаҳои ҳамон дарс гирифта мешавад).
    all: out.map(w => ({ ...w, hasImage: have.has(w.key) })),
  }, null, 2));

console.log(`\nҲамагӣ калима: ${out.length} | исм: ${nouns.length}`);
console.log(`Акс дар CDN: ${have.size} | исми бе акс: ${missing.length}`);
console.log('\n— Исмҳои бе акс (аз рӯи модул) —');
let cur = '';
for (const w of missing) {
  if (w.module !== cur) { cur = w.module; console.log(`\n[${cur}]`); }
  process.stdout.write(`${w.word}(${w.emoji}) `);
}
console.log();
