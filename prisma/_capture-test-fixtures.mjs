// Fixture барои тестҳои frontend: ҷавоби API як бор гирифта, ба файл нигоҳ
// дошта мешавад, то люксаи тест БЕ интернет ва бе вобастагӣ аз ҳолати
// продакшн кор кунад.
//
//   node prisma/_capture-test-fixtures.mjs            # аз сервери МАҲАЛЛӢ
//   BASE=https://admin.ramz.tj node prisma/_capture-test-fixtures.mjs
//
// ID-ҳо аз ХУДИ файлҳои тест хонда мешаванд — пас вақте тест дарси нав илова
// мекунад, ҳамин фармон кифоя аст ва рӯйхати дастӣ нигоҳ доштан лозим нест.
//
// Чаро ин лозим шуд: 21.09.2026 интернет қатъ шуд ва 42 тест афтод
// (`OfflineCacheEmptyException`), ҳар кадом 3 дақиқа таймаут мешуд.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'fs';

const BASE = process.env.BASE ?? 'http://localhost:3000';
const FE = new URL('../../frontend/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const TEST_DIR = FE + 'test/';
const OUT = FE + 'test/fixtures/';

/** Файлҳое, ки мазмунро аз API мегиранд. */
const FILES = readdirSync(TEST_DIR).filter(
  (f) => f.endsWith('_test.dart') && (f.startsWith('ko_') || f.startsWith('e2e_')),
);

const ids = new Set();
for (const f of FILES) {
  const src = readFileSync(TEST_DIR + f, 'utf8');
  for (const m of src.matchAll(/'(cm[a-z0-9]{20,})'/g)) ids.add(m[1]);
}
console.log(`${FILES.length} файли тест · ${ids.size} ID`);

mkdirSync(OUT + 'lessons', { recursive: true });
mkdirSync(OUT + 'alphabet', { recursive: true });

const get = async (path) => {
  const r = await fetch(BASE + path);
  if (!r.ok) return null;
  return r.json();
};

// ── Дарсҳо ────────────────────────────────────────────────────────────────
let lessons = 0, skipped = 0;
for (const id of ids) {
  const data = await get(`/api/mobile/lessons/${id}`);
  // ID-и забон/модул низ дар файлҳо ҳаст — онҳо дарс нестанд ва 404 медиҳанд.
  if (!data) { skipped++; continue; }
  writeFileSync(`${OUT}lessons/${id}.json`, JSON.stringify(data, null, 1), 'utf8');
  lessons++;
}
console.log(`дарс: ${lessons} нигоҳ дошта шуд · ${skipped} ID дарс набуд`);

// ── Алифбо ───────────────────────────────────────────────────────────
// ҲАРФҲО ва ҚОИДАҲО аз ЯК endpoint меоянд (`letters` ва `rules`), вале дар
// кэш ду калиди ҷудо доранд — ҳамон тавре ки `getAlphabet`/`getAlphabetRules`
// онҳоро мепурсанд.
//
// ⚠️ Тести `ko_alphabet_card_probe` ЧОР забонро мегирад, на танҳо
// кореягиро: корти ҳарф бояд дар ҳар алифбо бе overflow кашида шавад.
const NATIVE = 'cmpk1cr9o0000bo0h1mheyoad'; // тоҷикӣ
const TARGETS = {
  ko: 'cmtkb6u4i000pd8149oc',
  de: 'cmqdhvfj200001z591mfrnj4z',
  ru: 'cmpqk40yz00009rhl1uazdfi3',
  ar: 'cmqdqfuxi00001rcsseeq42fi',
};
for (const [name, TARGET] of Object.entries(TARGETS)) {
  const alpha = await get(
    `/api/mobile/alphabet?targetLanguageId=${TARGET}&nativeLanguageId=${NATIVE}`);
  if (!alpha) { console.log(`  ⚠ ${name}: алифбо ҷавоб нашуд`); continue; }
  for (const [kind, list] of [
    ['alphabet', alpha.letters ?? []],
    ['alphabet_rules', alpha.rules ?? []],
  ]) {
    writeFileSync(`${OUT}alphabet/${kind}_${NATIVE}_${TARGET}.json`,
                  JSON.stringify(list, null, 1), 'utf8');
    console.log(`  ${name} ${kind}: ${list.length} сатр`);
  }
}

// ── Курсҳо (барои e2e) ────────────────────────────────────────────────────
const courses = await get(`/api/mobile/courses?nativeLanguageId=${NATIVE}&targetLanguageId=${TARGETS.ko}`);
if (courses) {
  const list = Array.isArray(courses) ? courses : (courses.courses ?? courses);
  writeFileSync(`${OUT}courses.json`, JSON.stringify(list, null, 1), 'utf8');
  console.log(`  курсҳо: ${Array.isArray(list) ? list.length : '?'}`);
}

console.log(`\nfixture дар ${OUT}`);
if (!existsSync(OUT + 'lessons')) process.exit(1);
