// Offline duplicate checker — no DB. Reads tmp/existing-words.json PLUS the
// vocab words from every a2-m*.mjs already authored, so a new module can be
// checked against A1 + all prior A2 modules even while the DB is unreachable.
import { readFileSync, readdirSync } from 'fs';

const { words } = JSON.parse(readFileSync('tmp/existing-words.json', 'utf8'));
const reserved = new Set(words);

// pull vocab words from prior module files
function vocabWords(file) {
  const src = readFileSync('prisma/' + file, 'utf8');
  const vocabSrc = src.slice(src.indexOf('vocab:'), src.indexOf('grammar:'));
  const re = /W\('([^']+)'/g; let m; const list = [];
  while ((m = re.exec(vocabSrc))) list.push(m[1]);
  return list;
}

const target = process.argv[2]; // e.g. a2-m4.mjs
const priorFiles = readdirSync('prisma').filter(f => /^a2-m\d+\.mjs$/.test(f) && f !== target).sort();
for (const f of priorFiles) for (const w of vocabWords(f)) reserved.add(w.toLowerCase().trim());

const list = vocabWords(target);
const seen = new Set(); const dupSelf = []; const dupEx = [];
for (const w of list) { const k = w.toLowerCase().trim(); if (reserved.has(k)) dupEx.push(w); if (seen.has(k)) dupSelf.push(w); seen.add(k); }
console.log(`${target}: ${list.length} калима | reserved base: ${reserved.size} (${priorFiles.join(',')})`);
console.log('такрор бо мавҷуда:', dupEx.length ? dupEx.join(', ') : 'НЕСТ ✅');
console.log('такрори дохилӣ:', dupSelf.length ? dupSelf.join(', ') : 'НЕСТ ✅');
