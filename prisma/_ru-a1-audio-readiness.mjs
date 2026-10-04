// Омодагии АУДИОИ курси РУСӢ A1 — ТАНҲО-ХОНДАН, ба база ҳеҷ чиз навишта намешавад.
//
// Ҳар чизе ки дар A1 садо дорад (ё бояд дошта бошад) ҷамъ мешавад ва ҳар файл аз CDN
// воқеан кашида ва чен карда мешавад (`tools/audio_check.py`):
//   калима · мисол/машқи грамматика · сатри муколама · матн · ибора · ҳарфи алифбо ·
//   калимаи онбординг · саволи тести сатҳ (A1, шунавоӣ).
//
// Мушкил ҳисоб мешавад: `audioUrl` нест · HTTP-хато (403/404) · хомӯш (нутқ < 0.12 с) ·
// буридашуда (5760 байт / 0.36 с — имзои маълум) · ҳамон файл (md5) барои матнҳои
// ГУНОГУН · суръати нутқ берун аз меъёр (ҷумла: ҳарф ÷ сонияи нутқ > 22 = аудио ба матн
// мувофиқ нест — ниг. [[ramz-audio-audit]]).
//
//   node prisma/_ru-a1-audio-readiness.mjs            # ҳама
//   node prisma/_ru-a1-audio-readiness.mjs --no-fetch # танҳо база, бе кашидани файлҳо
import { spawnSync } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import { connect, COURSE_RU_A1, RU, TG } from './_ru-fix-lib.mjs';

const sql = connect();
const FETCH = !process.argv.includes('--no-fetch');

const mods = await sql`SELECT id,"order",title,"isActive" FROM "Module" WHERE "courseId"=${COURSE_RU_A1} ORDER BY "order"`;
const lessons = await sql`
  SELECT l.id,l."order",l.title,l."isActive",l."skillType",l."grammarTopicId" gid,
         l."phraseCollectionId" pid,l."dialogueId" did,l."comprehensionId" cid,
         m."order" mo,m."isActive" mact
  FROM "Lesson" l JOIN "Module" m ON m.id=l."moduleId"
  WHERE m."courseId"=${COURSE_RU_A1} ORDER BY m."order",l."order"`;
const live = lessons.filter((l) => l.isActive && l.mact);
const where = (l) => `M${l.mo}·Д${l.order}`;

const items = []; // {kind, where, text, url}
const add = (kind, w, text, url, answer) => items.push({ kind, where: w, text: (text ?? '').trim(), url: url || null, answer });

const lessonIds = live.map((l) => l.id);
const words = await sql`SELECT "lessonId",word,"audioUrl" FROM "Word" WHERE "lessonId" = ANY(${lessonIds})`;
const byLesson = Object.fromEntries(live.map((l) => [l.id, l]));
for (const w of words) add('калима', where(byLesson[w.lessonId]), w.word, w.audioUrl);

const firstUse = (key) => {
  const m = new Map();
  for (const l of live) if (l[key] && !m.has(l[key])) m.set(l[key], where(l));
  return m;
};
const gUse = firstUse('gid'), pUse = firstUse('pid'), dUse = firstUse('did'), cUse = firstUse('cid');

if (gUse.size) {
  for (const e of await sql`SELECT "topicId",sentence,"audioUrl" FROM "GrammarExample" WHERE "topicId" = ANY(${[...gUse.keys()]})`)
    add('мисоли грамматика', gUse.get(e.topicId), e.sentence, e.audioUrl);
  for (const e of await sql`SELECT "topicId",answer,prompt,"audioUrl" FROM "GrammarExercise" WHERE "topicId" = ANY(${[...gUse.keys()]})`)
    add('машқи грамматика', gUse.get(e.topicId), e.prompt.includes('___') ? e.prompt.replace(/_{2,}/, e.answer) : e.answer, e.audioUrl,
      e.prompt.includes('___') && !/→|:/.test(e.prompt) ? undefined : e.answer);
}
if (dUse.size)
  for (const d of await sql`SELECT "dialogueId",text,"audioUrl" FROM "DialogueLine" WHERE "dialogueId" = ANY(${[...dUse.keys()]})`)
    add('сатри муколама', dUse.get(d.dialogueId), d.text, d.audioUrl);
if (cUse.size)
  for (const c of await sql`SELECT id,kind,passage,"audioUrl" FROM "ComprehensionExercise" WHERE id = ANY(${[...cUse.keys()]})`)
    add(c.kind === 'listening' ? 'матни шунавоӣ' : 'матни хониш', cUse.get(c.id), c.passage, c.audioUrl);
if (pUse.size)
  for (const p of await sql`SELECT "collectionId",text,"audioUrl" FROM "Phrase" WHERE "collectionId" = ANY(${[...pUse.keys()]})`)
    add('ибора', pUse.get(p.collectionId), p.text, p.audioUrl);

for (const a of await sql`SELECT uppercase,"audioUrl" FROM "AlphabetLetter" WHERE "targetLanguageId"=${RU} AND "nativeLanguageId"=${TG}`)
  add('ҳарфи алифбо', 'Алифбо', a.uppercase, a.audioUrl);
for (const o of await sql`SELECT word,"audioUrl" FROM "OnboardingWord" WHERE "targetLanguageId"=${RU} AND "nativeLanguageId"=${TG}`)
  add('калимаи онбординг', 'Онбординг', o.word, o.audioUrl);
for (const p of await sql`SELECT prompt,"audioUrl",skill FROM "PlacementQuestion"
                          WHERE "targetLanguageId"=${RU} AND "nativeLanguageId"=${TG} AND "cefrLevel"='A1' AND "isActive"`)
  if (p.skill === 'listening' || p.audioUrl) add('тести сатҳ (шунавоӣ)', 'Тести сатҳ', p.prompt, p.audioUrl);

// ── 1. Аз база ──────────────────────────────────────────────────────────
const kinds = [...new Set(items.map((i) => i.kind))];
const missing = items.filter((i) => !i.url && !(i.kind === 'матни хониш'));
const readingNoAudio = items.filter((i) => !i.url && i.kind === 'матни хониш');
const atMain = items.filter((i) => i.url && /@main\//.test(i.url));
const blob = items.filter((i) => i.url && /blob\.vercel-storage\.com/.test(i.url));

// Як URL барои ду матни ГУНОГУН (калимаҳои такрории дарси навиштан — ҳамон матн — хато нест).
// «(аз они ман)» — ишораи тоҷикии машқ, на қисми ҷумла.
const norm = (s) => s.replace(/\(.*?\)/g, '').toLowerCase().replace(/[.,!?…—–«»"'():;]/g, '').replace(/ё/g, 'е').replace(/\s+/g, ' ').trim();
const urlTexts = new Map();
for (const i of items) if (i.url) {
  if (!urlTexts.has(i.url)) urlTexts.set(i.url, new Set());
  urlTexts.get(i.url).add(norm(i.text));
}
const sharedUrl = [...urlTexts].filter(([, t]) => t.size > 1);

console.log(`\nКурси русӣ A1: ${mods.length} модул (${mods.filter((m) => m.isActive).length} фаъол), ` +
  `${lessons.length} дарс (${live.length} фаъол)\n`);
console.log('Навъ'.padEnd(24), 'ҳама'.padStart(5), 'бо аудио'.padStart(9), 'бе аудио'.padStart(9));
for (const k of kinds) {
  const all = items.filter((i) => i.kind === k);
  const has = all.filter((i) => i.url).length;
  console.log(k.padEnd(24), String(all.length).padStart(5), String(has).padStart(9), String(all.length - has).padStart(9));
}

const show = (title, list, f = (i) => `${i.where.padEnd(11)} ${i.kind.padEnd(18)} «${i.text.slice(0, 60)}»`) => {
  console.log(`\n${list.length ? '❌' : '✅'} ${title}: ${list.length}`);
  for (const i of list.slice(0, 40)) console.log('   ', f(i));
  if (list.length > 40) console.log(`    … ва боз ${list.length - 40}`);
};
show('Бе audioUrl', missing);
if (readingNoAudio.length) console.log(`\nℹ️  Матни хониш бе аудио: ${readingNoAudio.length} (барои хониш аудио ҳатмӣ нест)`);
show('Як URL — матнҳои гуногун', sharedUrl, ([u, t]) => `${[...t].join(' | ').slice(0, 90)}  ← ${u.split('/').pop()}`);
console.log(`\nℹ️  Пайванд ба @main (кэши jsDelivr то 7 рӯз): ${atMain.length} · Vercel Blob: ${blob.length}`);

if (!FETCH) process.exit(0);

// ── 2. Худи файлҳо ──────────────────────────────────────────────────────
const urls = [...urlTexts.keys()];
console.log(`\nКашидан ва чен кардани ${urls.length} файл…`);
const meas = {};
for (let i = 0; i < urls.length; i += 120) {
  // `py` — дар Git Bash `python` ба 3.11-и бе numpy мерасад.
  const r = spawnSync(process.env.RAMZ_PY || 'py', ['../tools/audio_check.py', ...urls.slice(i, i + 120)],
    { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8' }, maxBuffer: 1 << 26 });
  if (r.status !== 0) throw new Error(r.stderr);
  Object.assign(meas, JSON.parse(r.stdout));
  process.stdout.write(`  ${Math.min(i + 120, urls.length)}/${urls.length}\r`);
}
console.log();

const withM = items.filter((i) => i.url).map((i) => ({ ...i, m: meas[i.url] }));
const broken = withM.filter((i) => i.m?.error);
const ok = withM.filter((i) => i.m && !i.m.error);
// ⚠️ `speech` (фреймҳо > 8% peak) ҳамсадоҳои бесадоро намешуморад: «Суп», «Чек», «Шесть»-и
// солим 0.10 с, «Кто»/«Сыр» 0.12 с (03.10.2026, Kore аз нав ҳамон 0.10 дод). Пас «хомӯш» =
// амалан бе садо, на «кӯтоҳ».
const silent = ok.filter((i) => i.m.speech < 0.06 || i.m.peak < 0.02);
// 5760 байт ТАНҲО дар 128 kbps (0.36 с) имзои буриш аст; дар 64 kbps он 0.72 с-и муқаррарист.
const clipped = ok.filter((i) => i.m.dur <= 0.37 && i.kind !== 'ҳарфи алифбо');
const SENT = new Set(['мисоли грамматика', 'машқи грамматика', 'сатри муколама', 'матни шунавоӣ', 'матни хониш', 'ибора']);
// Ҳарф ÷ (дарозӣ − хомӯшии сар), на ÷ `speech` (ниг. боло): дар A1 p99 = 15, max = 19.
// Машқи «___» танҳо ҶАВОБРО садо медиҳад — матни дастур («стол → », «Инкор:») ҳисоб намешавад.
const spoken = (i) => (i.kind === 'машқи грамматика' ? i.answer ?? i.text : i.text).replace(/\(.*?\)/g, '');
const rate = (i) => spoken(i).replace(/[^А-Яа-яЁё]/g, '').length / Math.max(i.m.dur - i.m.lead, 0.05);
const fast = ok.filter((i) => SENT.has(i.kind) && spoken(i).length >= 12 && rate(i) > 20);
const slow = ok.filter((i) => SENT.has(i.kind) && spoken(i).length >= 30 && rate(i) < 4);

const md5Texts = new Map();
for (const i of ok) {
  if (!md5Texts.has(i.m.md5)) md5Texts.set(i.m.md5, new Set());
  md5Texts.get(i.m.md5).add(norm(i.text));
}
const sameFile = [...md5Texts].filter(([, t]) => t.size > 1);

show('Файл кушода намешавад (HTTP/шабака)', broken, (i) => `${i.where.padEnd(11)} ${i.kind.padEnd(18)} «${i.text.slice(0, 40)}» — ${i.m.error}`);
show('Хомӯш / қариб хомӯш', silent, (i) => `${i.where.padEnd(11)} ${i.kind.padEnd(18)} «${i.text.slice(0, 40)}» нутқ ${i.m.speech}с · peak ${i.m.peak}`);
show('Буридашуда (≤0.37 с / 5760 байт)', clipped, (i) => `${i.where.padEnd(11)} ${i.kind.padEnd(18)} «${i.text.slice(0, 40)}» ${i.m.dur}с · ${i.m.bytes} байт`);
show('Ҷумла хеле тез (аудио ба матн мувофиқ нест?)', fast, (i) => `${i.where.padEnd(11)} ${i.kind.padEnd(18)} «${i.text.slice(0, 50)}» ${rate(i).toFixed(1)} ҳарф/с`);
show('Ҷумла хеле суст (аудио ба матн мувофиқ нест?)', slow, (i) => `${i.where.padEnd(11)} ${i.kind.padEnd(18)} «${i.text.slice(0, 50)}» ${rate(i).toFixed(1)} ҳарф/с`);
show('Ҳамон файл (md5) — матнҳои гуногун', sameFile, ([h, t]) => `${[...t].join(' | ').slice(0, 100)}  (${h.slice(0, 8)})`);

const issues = missing.length + sharedUrl.length + broken.length + silent.length + clipped.length + fast.length + slow.length + sameFile.length;
console.log(`\n${'═'.repeat(60)}\n  ${withM.length} аудио санҷида шуд · мушкилот: ${issues}\n${'═'.repeat(60)}`);

mkdirSync('tmp', { recursive: true });
writeFileSync('tmp/ru-a1-audio-readiness.json', JSON.stringify({ items: withM, missing }, null, 1));
