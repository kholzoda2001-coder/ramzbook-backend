// Аудити пурраи ҳамаи мазмуни олмонӣ (de → tg) — аз рӯи он чи ХОНАНДА мебинад.
// Танҳо мехонад, чизе намеқавад.
//
//   node prisma/_de-audit.mjs
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);
const q = t => sql.query(t);

const BASE = 'https://admin.ramz.tj';
const DE = 'cmqdhvfj200001z591mfrnj4z';
const TG = 'cmpk1cr9o0000bo0h1mheyoad';
const COURSE = 'cmqdhwb5q00021z597df2767m';

const problems = [];
const P = (area, msg) => problems.push(`[${area}] ${msg}`);
const head = t => console.log(`\n${'─'.repeat(60)}\n${t}\n${'─'.repeat(60)}`);

// Санҷиши дастрасии URL бо ҳамгироии сабук.
const seenUrl = new Map();
async function reachable(url) {
  if (seenUrl.has(url)) return seenUrl.get(url);
  let ok = false;
  try { ok = (await fetch(url, { method: 'HEAD' })).ok; } catch { ok = false; }
  seenUrl.set(url, ok);
  return ok;
}

// ── 1. Забон ────────────────────────────────────────────────────────────────
head('1. Забон');
const [lang] = await q(`SELECT * FROM "Language" WHERE id='${DE}'`);
console.log(`${lang.flag} ${lang.name} / ${lang.nativeName} · tts=${lang.ttsLocale} · dir=${lang.direction} · hasIPA=${lang.hasIPA}`);
console.log(`isActive=${lang.isActive} · canBeTarget=${lang.canBeTarget} · badge=${lang.badge}`);
if (!lang.ttsLocale) P('забон', 'ttsLocale холӣ — TTS-и дастгоҳ забонро намедонад');
if (!lang.isActive) console.log('  ℹ isActive=false — қасдан: курс ҳанӯз тайёр нест');

// ── 2. Дарси шиносоӣ ────────────────────────────────────────────────────────
head('2. Дарси шиносоӣ (OnboardingWord)');
const ob = await q(`SELECT * FROM "OnboardingWord" WHERE "targetLanguageId"='${DE}' AND "nativeLanguageId"='${TG}' ORDER BY "order"`);
console.log(`калимаҳо: ${ob.length}`);
for (const w of ob) {
  const miss = ['word', 'translation', 'transcription', 'transcriptionTajik', 'emoji', 'example', 'exampleTrans', 'audioUrl']
    .filter(f => !w[f] || !String(w[f]).trim());
  if (miss.length) P('шиносоӣ', `${w.word}: ${miss.join(', ')} нест`);
  const opts = w.options ?? [];
  if (opts.length !== 4) P('шиносоӣ', `${w.word}: ${opts.length} вариант (бояд 4)`);
  if (!opts.includes(w.translation)) P('шиносоӣ', `${w.word}: ҷавоби дуруст дар вариантҳо нест`);
  if (w.audioUrl && !await reachable(w.audioUrl)) P('шиносоӣ', `${w.word}: аудио дастнорас`);
}
if (ob.length < 3) P('шиносоӣ', `танҳо ${ob.length} калима`);
console.log(`✓ санҷида шуд: майдонҳо, вариантҳо, аудио`);

// ── 3. Сатҳсанҷӣ ────────────────────────────────────────────────────────────
head('3. Сатҳсанҷӣ (PlacementQuestion)');
const pl = await q(`SELECT * FROM "PlacementQuestion" WHERE "targetLanguageId"='${DE}' AND "nativeLanguageId"='${TG}' ORDER BY "cefrLevel", "order"`);
const byLvl = pl.reduce((a, x) => ((a[x.cefrLevel] = (a[x.cefrLevel] ?? 0) + 1), a), {});
console.log(`саволҳо: ${pl.length} ${JSON.stringify(byLvl)}`);
for (const x of pl) {
  const opts = x.options ?? [];
  if (!opts.includes(x.answer)) P('сатҳсанҷӣ', `#${x.order}: ҷавоб дар вариантҳо нест`);
  if (new Set(opts).size !== opts.length) P('сатҳсанҷӣ', `#${x.order}: варианти такрорӣ`);
  if (!x.promptTranslated) P('сатҳсанҷӣ', `#${x.order}: тарҷумаи тоҷикӣ нест`);
  if (!x.explanation) P('сатҳсанҷӣ', `#${x.order}: тавзеҳ нест`);
  if (!x.isActive) P('сатҳсанҷӣ', `#${x.order}: isActive=false`);
}
const mobPl = await (await fetch(`${BASE}/api/mobile/placement?targetLanguageId=${DE}&nativeLanguageId=${TG}`)).json();
if ((mobPl.questions ?? []).some(x => x.answer !== undefined)) P('сатҳсанҷӣ', 'ҷавоби дуруст ба муштарӣ мефарояд');
console.log(`✓ ба барнома мераванд: ${(mobPl.questions ?? []).length} савол, ҷавобҳо пинҳон`);

// ── 4. Алифбо ───────────────────────────────────────────────────────────────
head('4. Алифбо');
const al = await (await fetch(`${BASE}/api/mobile/alphabet?targetLanguageId=${DE}&nativeLanguageId=${TG}`)).json();
const letters = al.letters ?? [], rules = al.rules ?? [];
console.log(`ҳарфҳо: ${letters.length} · қоидаҳо: ${rules.length}`);
for (const l of letters) {
  const miss = ['uppercase', 'lowercase', 'ipa', 'tajikTranscription', 'audioUrl'].filter(f => !l[f]);
  if (miss.length) P('алифбо', `${l.uppercase}: ${miss.join(', ')} нест`);
  if (l.audioUrl && !await reachable(l.audioUrl)) P('алифбо', `${l.uppercase}: аудио дастнорас`);
}
if (letters.length !== 30) P('алифбо', `${letters.length} ҳарф (бояд 30)`);
const ord = letters.map(l => l.order);
if (!ord.every((v, i) => i === 0 || ord[i - 1] < v)) P('алифбо', 'тартиб афзоянда нест');
for (const c of ['general', 'vowel', 'consonant']) {
  if (!rules.some(r => r.category === c)) P('алифбо', `қоидаҳои «${c}» нестанд`);
}
console.log(`✓ санҷида шуд: майдонҳо, аудио, тартиб, қоидаҳо`);

// ── 5. Курс ─────────────────────────────────────────────────────────────────
head('5. Курс A1');
const [course] = await q(`SELECT * FROM "Course" WHERE id='${COURSE}'`);
console.log(`«${course.title}» · isActive=${course.isActive}`);
const mods = await q(`SELECT id, "order", title, "titleTranslated", emoji, "isActive" FROM "Module" WHERE "courseId"='${COURSE}' ORDER BY "order"`);
const orders = mods.map(m => m.order);
console.log(`модулҳо: ${mods.length} · тартиб: ${orders.join(',')}`);
const gaps = [];
for (let i = 0; i < orders.length; i++) if (orders[i] !== i) gaps.push(`${orders[i]}→${i}`);
if (gaps.length) P('курс', `тартиби модулҳо пайваста нест (сӯрохӣ): ${orders.join(',')}`);
for (const m of mods) {
  if (!m.titleTranslated?.trim()) P('курс', `модули ${m.order}: тарҷумаи ном нест`);
  if (!m.emoji) P('курс', `модули ${m.order}: эмоҷӣ нест`);
  if (!m.isActive) P('курс', `модули ${m.order}: isActive=false`);
}

const lessons = await q(`SELECT l.*, m."order" AS morder FROM "Lesson" l JOIN "Module" m ON l."moduleId"=m.id WHERE m."courseId"='${COURSE}' ORDER BY m."order", l."order"`);
console.log(`дарсҳо: ${lessons.length}`);
for (const l of lessons) {
  if (!l.titleTranslated?.trim()) P('курс', `дарси «${l.title}»: тарҷумаи ном нест`);
  if (!l.isActive) P('курс', `дарси «${l.title}»: isActive=false`);
}
// Дарси холӣ — хонанда экрани холӣ мебинад. Дарси грамматика/хониш/муколама
// калима надорад ва набояд дошта бошад: он ба ҷузъи худ пайваст аст.
const empty = await q(`SELECT l.title FROM "Lesson" l JOIN "Module" m ON l."moduleId"=m.id
  WHERE m."courseId"='${COURSE}'
    AND (SELECT COUNT(*) FROM "Word" w WHERE w."lessonId"=l.id)=0
    AND l."grammarTopicId" IS NULL AND l."dialogueId" IS NULL
    AND l."comprehensionId" IS NULL AND l."phraseCollectionId" IS NULL`);
for (const e of empty) P('курс', `дарси «${e.title}» на калима дорад, на ба чизе пайваст аст`);

const words = await q(`SELECT w.*, l.title AS lesson, l."skillType" FROM "Word" w JOIN "Lesson" l ON w."lessonId"=l.id
  JOIN "Module" m ON l."moduleId"=m.id WHERE m."courseId"='${COURSE}' ORDER BY m."order", l."order", w."order"`);
const noAudio = words.filter(w => !w.audioUrl?.trim()).length;
const noIpa = words.filter(w => !w.ipa?.trim()).length;
const noIpaTj = words.filter(w => !w.ipaTajik?.trim()).length;
const noEx = words.filter(w => !w.example?.trim()).length;
const noExTr = words.filter(w => !w.exampleTrans?.trim()).length;
console.log(`калимаҳо: ${words.length}`);
console.log(`  бе аудио: ${noAudio} · бе IPA: ${noIpa} · бе хониши тоҷикӣ: ${noIpaTj} · бе мисол: ${noEx} · бе тарҷумаи мисол: ${noExTr}`);
if (noAudio) P('курс', `${noAudio} калима аудио надорад`);
if (noIpaTj) P('курс', `${noIpaTj} калима хониши тоҷикӣ (ipaTajik) надорад`);
if (noEx) P('курс', `${noEx} калима мисол надорад`);
if (noExTr) P('курс', `${noExTr} калима тарҷумаи мисол надорад`);

// Такрори калима — дар машқ ду ҷавоби якхела медиҳад.
// Танҳо айнан якхела будан хатост. Ҷуфти «sie»/«Sie» такрор НЕСТ: дар олмонӣ
// маҳз ҳарфи калон онҳоро фарқ мекунад ва ин худ мавзӯи омӯзиш аст — вале
// агар тарҷумаашон ҳам мувофиқ ояд, машқ ҷавоби дуҳела медиҳад.
// Дарси навиштан қасдан калимаҳои ҳамон модулро такрор мекунад (ҳамин тавр дар
// англисӣ ҳам сохта шудааст) — ин такрори омӯзишист, на хато.
const uniqWords = words.filter(w => w.skillType !== 'writing');

const dup = new Map();
for (const w of uniqWords) {
  const k = w.word.trim();
  dup.set(k, [...(dup.get(k) ?? []), w]);
}
for (const [k, arr] of dup) if (arr.length > 1) P('курс', `калимаи айнан такрорӣ: «${k}» ×${arr.length}`);

const byLower = new Map();
for (const w of uniqWords) {
  const k = w.word.trim().toLowerCase();
  byLower.set(k, [...(byLower.get(k) ?? []), w]);
}
for (const [k, arr] of byLower) {
  if (arr.length < 2) continue;
  const parts = arr.map(w => new Set(w.translation.split('/').map(s => s.trim().toLowerCase()).filter(Boolean)));
  const overlap = parts.some((a, i) => parts.some((b, j) => i !== j && [...a].some(x => b.has(x))));
  if (overlap) P('курс', `«${k}»: калимаҳои танҳо бо ҳарфи калон фарқкунанда тарҷумаи муштарак доранд`);
}

// Машқи «интихоб» ба тарҷумаҳои ФАРҚКУНАНДА дар як дарс такя мекунад.
const perLesson = new Map();
for (const w of words) {
  const arr = perLesson.get(w.lessonId) ?? [];
  arr.push(w);
  perLesson.set(w.lessonId, arr);
}
for (const [, arr] of perLesson) {
  const tr = arr.map(w => w.translation.trim().toLowerCase());
  if (new Set(tr).size !== tr.length) P('курс', `дарси «${arr[0].lesson}»: тарҷумаи такрорӣ (машқи интихоб вайрон мешавад)`);
  if (arr.length < 4) P('курс', `дарси «${arr[0].lesson}»: танҳо ${arr.length} калима — барои 4 варианти ҷавоб кам аст`);
}

// ── 6. Ҷамъбаст ─────────────────────────────────────────────────────────────
head('ҶАМЪБАСТ');
if (!problems.length) console.log('✓ Ҳеҷ мушкил ёфт нашуд.');
else {
  console.log(`${problems.length} мушкил:\n`);
  for (const p of problems) console.log(`  • ${p}`);
}
