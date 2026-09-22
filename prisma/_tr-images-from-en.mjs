// Расми калимаҳои ТУРКИРО аз курси АНГЛИСӢ мегирад.
//
// Чаро: барнома расмро аз рӯи НОМИ ФАЙЛ мебардорад (`images/<lang>/<калима>.png`)
// ва барои англисӣ 300+ акс аллакай бор шудааст. Калимаи арабӣ ва англисӣ як
// тарҷумаи тоҷикӣ доранд — «رَجُل» ва «man» ҳарду «Мард»-анд — пас ҳамон акс
// барои ҳарду дуруст аст. Ба ҷои тавлиди акси нав (Pollinations дар олмонӣ
// натиҷаи корӣ надод) нусхаи файли англисӣ бо номи арабӣ гузошта мешавад.
//
// Мутобиқат аз рӯи ТАРҶУМАИ ТОҶИКӢ меравад, на аз рӯи маъно — пас ҳеҷ гоҳ акси
// нодуруст намеояд: агар тарҷума як хел бошад, хонанда ҳамон чизро мебинад.
//
//   node prisma/_tr-images-from-en.mjs --dry
//   node prisma/_tr-images-from-en.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { execFileSync } from 'child_process';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);
const q = t => sql.query(t);

const DRY = process.argv.includes('--dry');
const TR_COURSE = 'cmqdgwx740002c7nfgyzaaj8v';
const SRC_COURSES = {
  en: ['cmqkvhu8p0001o5r7nkbeo4jm', 'cmrdzoby700018vk3td9vuag3', 'cmrjtyqkb0001nzwfu2pobutk'],
  ru: ['cmq95o7ic0001qsy5l76202bw'],
};
const CDN = 'https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio@main/images';
const REPO = `${process.env.TEMP}/ramz-audio-img-tr`.replace(/\\/g, '/');
const WORK = 'tmp/tr-img';

const key = w => w.toLowerCase().trim().replace(/[ً-ٰٟۖ-ۭـ]/g, '').replace(/['’.,!?]/g, '').replace(/\s+/g, '_');
// Тарҷума → калиди муқоиса: «Амак (аз тарафи падар)» → «амак», «То дидор / Хайр» → «то дидор».
const trKey = t => String(t).toLowerCase().replace(/\(.*?\)/g, '').split('/')[0]
  .replace(/[.,!?]/g, '').replace(/\s+/g, ' ').trim();

// ── файлҳои мавҷуда ─────────────────────────────────────────────────────────
const tree = await (await fetch('https://api.github.com/repos/kholzoda2001-coder/ramz-audio/git/trees/main?recursive=1')).json();
if (!tree.tree) { console.log('GitHub API ҷавоб надод (rate limit?) — баъдтар такрор кунед'); process.exit(1); }
const have = { tr: new Set(), en: new Set(), ru: new Set() };
for (const t of tree.tree) {
  const m = /^images\/(tr|en|ru)\/(.+)\.png$/.exec(t.path);
  if (m) have[m[1]].add(m[2]);
}
console.log(`расмҳо дар CDN: tr ${have.tr.size} · en ${have.en.size} · ru ${have.ru.size}`);

// ── калимаҳо ────────────────────────────────────────────────────────────────
const trWords = await q(`SELECT DISTINCT w.word, w.translation, m."titleTranslated" mt FROM "Word" w
  JOIN "Lesson" l ON w."lessonId"=l.id JOIN "Module" m ON l."moduleId"=m.id
  WHERE m."courseId"='${TR_COURSE}' AND m."isActive" AND l."isActive"
    AND w."partOfSpeech"='noun' AND w.emoji <> ''`);
const srcWords = [];
for (const [lang, courses] of Object.entries(SRC_COURSES)) {
  const rs = await q(`SELECT DISTINCT w.word, w.translation FROM "Word" w
    JOIN "Lesson" l ON w."lessonId"=l.id JOIN "Module" m ON l."moduleId"=m.id
    WHERE m."courseId" IN (${courses.map(c => `'${c}'`).join(',')}) AND m."isActive" AND l."isActive"`);
  for (const r of rs) srcWords.push({ ...r, lang });
}

// тарҷумаи тоҷикӣ → калимаи англисие, ки акс дорад
const enByTr = new Map();
for (const w of srcWords) {
  const k = key(w.word);
  if (!have[w.lang].has(k)) continue;
  const t = trKey(w.translation);
  if (!enByTr.has(t)) enByTr.set(t, { lang: w.lang, key: k });
}
console.log(`калимаи манбаи аксдор: ${enByTr.size} тарҷумаи ягона`);

// ── Мутобиқати РАД шуда ──────────────────────────────────────────────────────
// Мутобиқат аз рӯи тарҷумаи тоҷикӣ меравад, вале тоҷикӣ баъзан ду мафҳуми
// олмониро як хел мегӯяд. Ин рӯйхат маҳз ҳамон ҷойҳост, ки акс МАЪНОИ ДИГАР
// нишон медиҳад — санҷиши дастии 20.09.2026.
const BLOCK = new Map([
  ['Pazartesi', '«Душанбе» дар тоҷикӣ ҳам РӮЗ ҳам ШАҲР аст — акс шаҳри Душанбе мебуд'],
  ['Kol', 'Kol = бозу, вале акс панҷа (hand) аст — он ба El тааллуқ дорад'],
]);


// ── Мутобиқати ДАСТӢ ─────────────────────────────────────────────────────────
// Ин калимаҳо акси ДУРУСТ доранд, вале тарҷумаи тоҷикиашон бо англисӣ ҳарф ба
// ҳарф рост намеояд, пас худкор ёфт намешавад. Калид аз `images/en/` гирифта
// шуд ва дастӣ тасдиқ гардид (20.09.2026).
const OVERRIDE = new Map([
  ['Garson', 'waiter'],
  ['Çiftlik', 'farm'],
  ['Köprü', 'bridge'],
  ['Cami', 'mosque'],
  ['Kütüphane', 'library'],
  ['Bal', 'honey'],
  ['Pirinç', 'rice'],
  ['Makarna', 'pasta'],
  ['Sabun', 'soap'],
  ['Kalem', 'pen'],
  ['Defter', 'notebook'],
  ['Kutu', 'box'],
  ['Dede', 'grandfather'],
  ['Nine', 'grandmother'],
  ['Teyze', 'aunt'],
  ['Oğlan', 'boy'],
  ['Tablo', 'picture'],
  ['Reçete', 'prescription'],
  ['Postane', 'post_office'],
  ['Toplantı', 'meeting'],
  ['El', 'hand'],        // «Даст (панҷа)» бо англисии hand рост меояд
  ['Ofis', 'office'],    // «Дафтар» дар тоҷикӣ ҳам notebook ҳам office аст
  ['Bahçe', 'garden'],   // на park.png — Park калимаи алоҳидаи ҳамин курс аст
  ['Park', 'park'],
  ['Parmak', 'finger'],
  ['Kalem', 'pen'],
  ['Defter', 'notebook'],
  ['Resim', 'picture'],
  ['Top', 'ball'],
  ['Tavuk', 'chicken'],
  ['Çilek', 'strawberry'],
  ['Kız', 'girl'],
  ['Adam', 'man'],
  ['Anne', 'mother'],
  ['Dede', 'grandfather'],
  ['Nine', 'grandmother'],
  ['Ceket', 'jacket'],
  ['Kazak', 'sweater'],
  ['Etek', 'skirt'],
  ['Koltuk', 'sofa'],
  ['Salon', 'living_room'],
  ['Yatak odası', 'bedroom'],
  ['Fabrika', 'factory'],
  ['Hemşire', 'nurse'],
  ['Öğrenci', 'student'],
  ['Doktor', 'doctor'],
  ['Sinema', 'cinema'],
  ['Piyano', 'piano'],
  ['Hap', 'pill'],
  ['İğne', 'syringe'],
  ['Bere', 'cap'],
  ['Kutu', 'box'],
  ['Oyuncak', 'toy'],
]);


const missing = trWords.filter(w => !have.tr.has(key(w.word)));
const plan = [];
const takenSrc = new Map();   // калиди манбаъ → калимаи олмоние, ки онро гирифт
const refused = [];
for (const w of missing) {
  const en = OVERRIDE.has(w.word)
    ? { lang: 'en', key: OVERRIDE.get(w.word) }
    : enByTr.get(trKey(w.translation));
  if (!en) continue;
  // Мутобиқати дастӣ аз ҳама болотар аст — маҳз он хатои худкорро ислоҳ мекунад.
  if (!OVERRIDE.has(w.word) && BLOCK.has(w.word)) { refused.push(`${w.word}: ${BLOCK.get(w.word)}`); continue; }
  // Як акс ба ДУ калимаи олмонӣ нашавад: дар як дарс ду корти якхела
  // хонандаро боварӣ медиҳад, ки ҳарду як чизанд (der Hut ↔ die Mütze).
  const srcKey = `${en.lang}/${en.key}`;
  if (takenSrc.has(srcKey)) { refused.push(`${w.word}: ҳамон акс аллакай ба «${takenSrc.get(srcKey)}» дода шуд`); continue; }
  takenSrc.set(srcKey, w.word);
  plan.push({ de: key(w.word), word: w.word, tr: w.translation, en: en.key, lang: en.lang, mt: w.mt });
}
console.log(`\nисми туркии бе акс: ${missing.length}`);
console.log(`аз онҳо аз англисӣ гирифта мешавад: ${plan.length}`);
for (const p of plan) console.log(`  ${p.word.padEnd(20)} «${p.tr}»  ←  images/${p.lang}/${p.en}.png`);
if (refused.length) {
  console.log(`
РАД шуд (${refused.length}):`);
  refused.forEach(r => console.log(`  ✗ ${r}`));
}
const still = missing.filter(w => !enByTr.get(trKey(w.translation)));
console.log(`\nбе акс мемонад: ${still.length} — ${still.slice(0, 25).map(w => w.translation).join(' · ')}${still.length > 25 ? ' …' : ''}`);
if (DRY || !plan.length) process.exit(0);

// ── боргирӣ ва push ─────────────────────────────────────────────────────────
mkdirSync(WORK, { recursive: true });
let got = 0;
for (const p of plan) {
  const url = `${CDN}/${p.lang}/${encodeURIComponent(p.en)}.png`;
  const r = await fetch(url);
  if (!r.ok) { console.log(`  ✗ ${p.en}: HTTP ${r.status}`); continue; }
  writeFileSync(`${WORK}/${p.de}.png`, Buffer.from(await r.arrayBuffer()));
  got++;
}
console.log(`\nборгирӣ шуд: ${got}/${plan.length}`);

const git = (args) => execFileSync('git', args, { cwd: REPO, encoding: 'utf8' }).trim();
if (!existsSync(REPO)) {
  execFileSync('git', ['clone', '--depth', '1', '--filter=blob:none', '--no-checkout',
    'https://github.com/kholzoda2001-coder/ramz-audio', REPO], { encoding: 'utf8' });
  git(['sparse-checkout', 'set', 'images/tr']);
  git(['checkout', 'main']);
} else { git(['fetch', '--depth', '1', 'origin', 'main']); git(['reset', '--hard', 'origin/main']); }
mkdirSync(`${REPO}/images/tr`, { recursive: true });
for (const p of plan) {
  if (!existsSync(`${WORK}/${p.de}.png`)) continue;
  writeFileSync(`${REPO}/images/tr/${p.de}.png`, readFileSync(`${WORK}/${p.de}.png`));
}
git(['add', 'images/tr']);
if (git(['status', '--porcelain']).trim()) {
  git(['-c', 'user.name=RAMZ Content', '-c', 'user.email=help@ramz.tj',
    'commit', '-m', `tr: reuse existing photos for Turkish words with the same Tajik translation (${got})`]);
  git(['push', 'origin', 'main']);
  console.log('push шуд');
} else console.log('тағйире нест');

// Расм аз рӯи ном бор мешавад (@main), пас навсозии база лозим НЕСТ.
console.log('\nсанҷиш:');
let ok = 0;
for (const p of plan.slice(0, 8)) {
  const r = await fetch(`${CDN}/tr/${encodeURIComponent(p.de)}.png`, { method: 'HEAD' });
  console.log(`  ${p.word}: HTTP ${r.status}`);
  if (r.ok) ok++;
}
console.log(`  ${ok}/8 намуна дастрас (jsDelivr метавонад чанд дақиқа кэшро нав кунад)`);
