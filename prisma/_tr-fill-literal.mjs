// Транскрипсияи тоҷикии бастаҳои «Гуфтор»-и туркӣ — аз `_tr-tajik.mjs` (28.09.2026), ҳамон
// транслитератори корти калимаи курс. Нусхаи `_ko-fill-literal.mjs`.
//
// ЧАРО ҷудо: хониш бояд айнан ҳамон бошад, ки корти калима, алифбо ва дарси
// шиносоии курс нишон медиҳанд. Генератори Python (`_tr_packs_lib.py`) `literal`-ро
// холӣ мегузорад; ин скрипт онро аз ҳамон транслитератор пур мекунад.
//
//   node prisma/_tr-fill-literal.mjs <slug>…
//
// Аввал худсанҷиши транслитератор (17 мисол) — агар шикаста бошад, ҳеҷ чиз навишта намешавад.
// «{job}» — `literal` қасдан холӣ (барнома `translit`-ро иваз намекунад); «___» мемонад.
import { readFileSync, writeFileSync } from 'fs';
import { toTajik, selfTest } from './_tr-tajik.mjs';

console.log(`✓ худсанҷиши транслитератор: ${selfTest()} мисол`);

const lit = (text) => {
  if (!text || text.includes('{')) return null;
  return text
    .split(/\s+/)
    .map((tok) => (tok.includes('___') ? '___' : toTajik(tok)))
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
