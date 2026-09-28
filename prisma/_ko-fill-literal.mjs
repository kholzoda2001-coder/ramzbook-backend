// Транскрипсияи тоҷикии бастаҳои «Гуфтор»-и кореягӣ — аз `_ko-tajik.mjs` (28.09.2026).
//
// ЧАРО ҷудо: хониш бояд айнан ҳамон бошад, ки корти калима, алифбо ва дарси
// шиносоии курс нишон медиҳанд. Генератори Python (`_ko_packs_lib.py`) `literal`-ро
// холӣ мегузорад; ин скрипт онро аз ҳамон транслитератор пур мекунад.
//
//   node prisma/_ko-fill-literal.mjs <slug>…
//
// Аввал худсанҷиши транслитератор (~200 мисол) — агар шикаста бошад, ҳеҷ чиз навишта намешавад.
// «{job}» — `literal` қасдан холӣ (барнома `translit`-ро иваз намекунад); «___» мемонад.
import { readFileSync, writeFileSync } from 'fs';
import { hangulToTajik, selfTest } from './_ko-tajik.mjs';

console.log(`✓ худсанҷиши транслитератор: ${selfTest()} мисол`);

const lit = (text) => {
  if (!text || text.includes('{')) return null;
  return text
    .split(/\s+/)
    .map((tok) => (tok.includes('___') ? '___' : hangulToTajik(tok)))
    .filter(Boolean)
    .join(' ');
};

for (const slug of process.argv.slice(2)) {
  const path = `content/speaking/${slug}.json`;
  const j = JSON.parse(readFileSync(path, 'utf8'));
  let n = 0;
  for (const L of j.lessons) for (const it of L.items) {
    it.literal = lit(it.text);
    if (it.literal) n++;
  }
  writeFileSync(path, JSON.stringify(j, null, 2) + '\n');
  console.log(`${slug}: ${n} транскрипсия`);
}
