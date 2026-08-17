// Алифбои олмонӣ (de → tg) — 30 ҳарф: A–Z + Ä Ö Ü + ß.
//
// `tajikTranscription` = НОМИ ҳарф бо хатти тоҷикӣ (ҳамон тавре ки алифбои
// англисӣ сохта шудааст: A → «Эй»), на садои он дар калима — садоҳо кори
// қоидаҳоянд (`_de-alphabet-rules.mjs`).
//
// ß категорияи `sign` мегирад: машқи «ҳарфи калон ↔ хурд» барои он маъно
// надорад (ҳарфи калонаш ẞ дар амал қариб истифода намешавад), ва экрани машқ
// `category == 'sign'`-ро аз драйв мебарорад. Дар таби «Ҳамсадоҳо» намоён
// мемонад, чунки таб = `category != 'vowel'`.
//
//   node prisma/_de-alphabet.mjs          # месозад/навсозӣ мекунад + месанҷад
//   node prisma/_de-alphabet.mjs --check  # танҳо месанҷад
import { SignJWT } from 'jose';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);

const BASE = 'https://admin.ramz.tj';
const DE = 'cmqdhvfj200001z591mfrnj4z';
const TG = 'cmpk1cr9o0000bo0h1mheyoad';
const CHECK_ONLY = process.argv.includes('--check');

const token = await new SignJWT({ username: 'admin', role: 'admin' })
  .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('2h')
  .sign(new TextEncoder().encode(env.JWT_SECRET));
const H = { 'Content-Type': 'application/json', Cookie: `admin_token=${token}` };

// [ҳарфи калон, хурд, IPA-и НОМИ ҳарф, номи ҳарф бо тоҷикӣ, категория]
const L = [
  ['A', 'a', '/aː/', 'а', 'vowel'],
  ['B', 'b', '/beː/', 'бэ', 'consonant'],
  ['C', 'c', '/tseː/', 'цэ', 'consonant'],
  ['D', 'd', '/deː/', 'дэ', 'consonant'],
  ['E', 'e', '/eː/', 'э', 'vowel'],
  ['F', 'f', '/ɛf/', 'эф', 'consonant'],
  ['G', 'g', '/ɡeː/', 'гэ', 'consonant'],
  ['H', 'h', '/haː/', 'ҳа', 'consonant'],
  ['I', 'i', '/iː/', 'и', 'vowel'],
  ['J', 'j', '/jɔt/', 'йот', 'consonant'],
  ['K', 'k', '/kaː/', 'ка', 'consonant'],
  ['L', 'l', '/ɛl/', 'эл', 'consonant'],
  ['M', 'm', '/ɛm/', 'эм', 'consonant'],
  ['N', 'n', '/ɛn/', 'эн', 'consonant'],
  ['O', 'o', '/oː/', 'о', 'vowel'],
  ['P', 'p', '/peː/', 'пэ', 'consonant'],
  ['Q', 'q', '/kuː/', 'ку', 'consonant'],
  ['R', 'r', '/ɛʁ/', 'эр', 'consonant'],
  ['S', 's', '/ɛs/', 'эс', 'consonant'],
  ['T', 't', '/teː/', 'тэ', 'consonant'],
  ['U', 'u', '/uː/', 'у', 'vowel'],
  ['V', 'v', '/faʊ/', 'фау', 'consonant'],
  ['W', 'w', '/veː/', 'вэ', 'consonant'],
  ['X', 'x', '/ɪks/', 'икс', 'consonant'],
  ['Y', 'y', '/ˈʏpsilɔn/', 'ипсилон', 'vowel'],
  ['Z', 'z', '/tsɛt/', 'цэт', 'consonant'],
  ['Ä', 'ä', '/ɛː/', 'э (кушода)', 'vowel'],
  ['Ö', 'ö', '/øː/', 'ё (лабмудаввар)', 'vowel'],
  ['Ü', 'ü', '/yː/', 'ю (лабмудаввар)', 'vowel'],
  ['ẞ', 'ß', '/ɛsˈtsɛt/', 'эсцэт', 'sign'],
];

// ── 0. Санҷиши рӯйхат ───────────────────────────────────────────────────────
{
  let bad = 0;
  const seen = new Set();
  for (const [up, low, ipa, tj, cat] of L) {
    const e = [];
    if (!up || !low) e.push('ҳарф холӣ');
    if (up !== up.toUpperCase() || (low !== low.toLowerCase() && low !== 'ß')) e.push('калон/хурд омехта');
    if (!/^\/.+\/$/.test(ipa)) e.push('IPA бе слэш');
    if (!tj.trim()) e.push('номи тоҷикӣ нест');
    if (!['vowel', 'consonant', 'sign'].includes(cat)) e.push(`категорияи номаълум: ${cat}`);
    if (seen.has(up)) e.push('такрорӣ');
    seen.add(up);
    if (e.length) { bad++; console.log(`  ✗ ${up}: ${e.join(', ')}`); }
  }
  const cats = L.reduce((a, l) => ((a[l[4]] = (a[l[4]] ?? 0) + 1), a), {});
  if (L.length !== 30) { console.log(`  ✗ ${L.length} ҳарф (бояд 30)`); bad++; }
  if (bad) { console.error(`\n${bad} хато — навишта нашуд.`); process.exit(1); }
  console.log(`✓ Рӯйхат тоза: ${L.length} ҳарф ${JSON.stringify(cats)}`);
}

const list = async () => (await (await fetch(
  `${BASE}/api/admin/alphabet?targetLanguageId=${DE}&nativeLanguageId=${TG}`, { headers: H })).json()).letters;

// ── 1. Сабт (идемпотентӣ: мавҷударо PUT, набударо POST) ─────────────────────
if (!CHECK_ONLY) {
  console.log('\n== Қадами 1: сабт ==');
  const byUpper = new Map((await list()).map(x => [x.uppercase, x]));
  let made = 0, upd = 0;
  for (let i = 0; i < L.length; i++) {
    const [uppercase, lowercase, ipa, tajikTranscription, category] = L[i];
    const payload = {
      targetLanguageId: DE, nativeLanguageId: TG,
      uppercase, lowercase, ipa, tajikTranscription, category, order: i + 1,
    };
    const cur = byUpper.get(uppercase);
    const res = cur
      ? await fetch(`${BASE}/api/admin/alphabet`, { method: 'PUT', headers: H, body: JSON.stringify({ id: cur.id, ...payload }) })
      : await fetch(`${BASE}/api/admin/alphabet`, { method: 'POST', headers: H, body: JSON.stringify(payload) });
    if (res.ok) { cur ? upd++ : made++; }
    else console.log(`  ✗ ${uppercase}: ${(await res.text()).slice(0, 120)}`);
  }
  console.log(`  сохта шуд: ${made} · навсозӣ: ${upd}`);
}

// ── 2. Санҷиши он чи ба барнома меравад ─────────────────────────────────────
console.log('\n== Қадами 2: /api/mobile/alphabet ==');
const mob = await (await fetch(`${BASE}/api/mobile/alphabet?targetLanguageId=${DE}&nativeLanguageId=${TG}`)).json();
const letters = mob.letters ?? [];
let bad = 0;
const cats = {};
for (const x of letters) {
  cats[x.category] = (cats[x.category] ?? 0) + 1;
  const e = [];
  if (!x.ipa) e.push('IPA нест');
  if (!x.tajikTranscription) e.push('номи тоҷикӣ нест');
  if (!x.uppercase || !x.lowercase) e.push('ҳарф нопурра');
  if (e.length) { bad++; console.log(`  ✗ ${x.uppercase}: ${e.join(', ')}`); }
}
const order = letters.map(x => x.order);
const sorted = order.every((v, i) => i === 0 || order[i - 1] < v);
console.log(`  ҳарфҳо: ${letters.length} ${JSON.stringify(cats)}`);
console.log(`  ${sorted ? '✓' : '✗'} тартиб афзоянда`);
console.log(`  ${letters.length === 30 ? '✓' : '✗'} 30 ҳарф`);
// Табҳои экран: Садонокҳо = vowel, Ҳамсадоҳо = ҳама чизи дигар.
const vowels = letters.filter(x => x.category === 'vowel').map(x => x.uppercase);
const cons = letters.filter(x => x.category !== 'vowel').map(x => x.uppercase);
console.log(`  таби Садонокҳо (${vowels.length}): ${vowels.join(' ')}`);
console.log(`  таби Ҳамсадоҳо (${cons.length}): ${cons.join(' ')}`);
// Машқ ҳарфҳои `sign`-ро намегирад.
const drillable = letters.filter(x => x.category !== 'sign').length;
console.log(`  дар машқ иштирок мекунад: ${drillable}`);
console.log(`\nМушкилот: ${bad + (sorted ? 0 : 1) + (letters.length === 30 ? 0 : 1)}`);
