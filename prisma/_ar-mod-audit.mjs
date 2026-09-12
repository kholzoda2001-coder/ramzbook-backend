// Аудити УМУМИИ як модули арабии A1 — ҳамаи санҷишҳое, ки дар Модули 1
// таҳия шуданд, вале акнун ба ҲАР модул кор мекунанд.
//
//   node prisma/_ar-mod-audit.mjs 1          // модули №1 (дуюм дар роҳ)
//   node prisma/_ar-mod-audit.mjs 1 --live   // + санҷиши аудио бо HTTP
//
// Ҳар банд ё ✅ ё ❌ — бе «шояд». Рамзи баромад 0 танҳо вақте ҳама сабз аст.
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }),
);
const sql = neon(env.DATABASE_URL);
const ORDER = Number(process.argv[2] ?? 0);
const LIVE = process.argv.includes('--live');

const AR = /[ء-ي]/;
const strip = (s) => (s ?? '').replace(/[ً-ْٰـ]/g, '')
  .replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').trim();
/// Нисбати ҳаракат ба ҳарф. Матни пурра ҳаракатдор ~0.5, матни луч ~0.05.
const harRatio = (t) => {
  const letters = ((t ?? '').match(/[ء-ي]/g) ?? []).length;
  const marks = ((t ?? '').match(/[ً-ْٰ]/g) ?? []).length;
  return letters ? marks / letters : 1;
};
/// ⚠️ `\b` бо кириллӣ КОР НАМЕКУНАД — ҳамон доми аудити русӣ.
const bound = (w) => new RegExp(`(^|[^\\u0400-\\u04ff\\w])${w}([^\\u0400-\\u04ff\\w]|$)`, 'i');

let fail = 0;
const check = (id, ok, title, detail = '') => {
  if (!ok) fail++;
  console.log(`${ok ? '✅' : '❌'} ${id} — ${title}${detail ? '\n     ' + detail : ''}`);
};

// ── Маълумот ───────────────────────────────────────────────────────────
const [course] = await sql.query(`
  SELECT c.id FROM "Course" c
    JOIN "Language" t ON t.id=c."targetLanguageId"
    JOIN "Language" n ON n.id=c."nativeLanguageId"
   WHERE t.code='ar' AND n.code='tg' AND c.level='A1'`);
const [mod] = await sql.query(
  `SELECT id, "order", "titleTranslated", "canDoStatement", "contentVersion"
     FROM "Module" WHERE "courseId"=$1 AND "order"=$2`, [course.id, ORDER]);
if (!mod) { console.error(`Модули №${ORDER} нест`); process.exit(2); }
const lessons = await sql.query(
  `SELECT id, "order", "skillType", "titleTranslated", "dialogueId", "comprehensionId", "grammarTopicId"
     FROM "Lesson" WHERE "moduleId"=$1 AND "isActive" ORDER BY "order"`, [mod.id]);
// ⚠️ `isActive=false` — дарс дар API НЕСТ (`app/api/mobile/courses/route.ts:42`
// `where: { isActive: true }`). Пеш аудит онҳоро мешумурд ва айби дарсеро
// гузориш медод, ки хонанда ҳеҷ гоҳ намебинад — H1 «20 калима бе
// транскрипсия»-и Модули 4 маҳз аз ҳамин ҷо буд.
const lids = lessons.map((l) => l.id);
const words = await sql.query(
  `SELECT id, "lessonId", "order", word, translation, emoji, "ipaTajik", example, "exampleTrans", "audioUrl"
     FROM "Word" WHERE "lessonId"=ANY($1) ORDER BY "lessonId", "order"`, [lids]);

console.log(`\n═══ Модул ${mod.order}: ${mod.titleTranslated} · ${lessons.length} дарс · ${words.length} калима ═══\n`);

// ── Маҷмӯи «ОМӮХТАШУДА» ────────────────────────────────────────────────
// = матни калима + ҷумлаи мисоли он + мисол/машқи грамматика. Ҳар кадоми
// онҳо БО ТАРҶУМА нишон дода мешаванд, пас калимаи даруни онҳо ношинос нест.
/// Решаи калима — ЯК меъёр барои ҳар ду тараф.
///
/// ⚠️ Доми сабтшуда: пеш танҳо тарафи САНҶИШШАВАНДА пешояндро мепартофт,
/// вале маҷмӯи «омӯхташуда» шакли ПУРРАро нигоҳ медошт. Дар натиҷа
/// `وَالعَرَبِيَّةَ` (и таълимшуда) ба `العربيه` рост намеомад — хатои бардурӯғ.
/// Акнун ҳар ду тараф аз ҳамин функсия мегузаранд.
///
/// Бардошта мешавад: пешоянд (و، ف، ب، ل), артикли ال, пешоянди феълии
/// ҳозира (أ/ت/ي/ن) ва бандаки мулкӣ (ي، ه، ها، هم، ك).
const stem = (raw) => {
  let t = strip(raw).replace(/[.،؟!:'’«»—-]/g, '');
  if (!t) return '';
  t = t.replace(/^(و|ف|ب|ل)(?=ال)/, '');   // والـ → الـ
  t = t.replace(/^ال/, '');                  // الـ → ـ
  t = t.replace(/^(و|ف|ب|ل)/, '');            // وـ → ـ
  t = t.replace(/(ها|هم|ي|ه|ك)$/, '');       // бандаки мулкӣ
  return t;
};
/// Шакли феълии ҳозира: أعيش / تعيش / نعيش ↔ يعيش — як реша.
const verbStems = (t) => {
  const out = new Set([t]);
  if (t.length >= 4 && /^[أاتين]/.test(t)) out.add(t.slice(1));
  return out;
};

const taught = new Set();
const teach = (t) => {
  for (const x of strip(t).replace(/[.،؟!:'’«»]/g, ' ').split(/\s+/)) {
    if (!x) continue;
    taught.add(x);
    const st = stem(x);
    if (st) for (const v of verbStems(st)) taught.add(v);
  }
};
for (const w of words) { teach(w.word); teach(w.example); }
for (const l of lessons) {
  if (!l.grammarTopicId) continue;
  for (const e of await sql.query(`SELECT sentence FROM "GrammarExample" WHERE "topicId"=$1`, [l.grammarTopicId])) teach(e.sentence);
  for (const x of await sql.query(`SELECT prompt, options, answer FROM "GrammarExercise" WHERE "topicId"=$1`, [l.grammarTopicId])) {
    teach(x.prompt); teach(String(x.answer).replace(/\(.*?\)/g, ''));
    for (const o of (x.options ?? [])) teach(String(o).replace(/\(.*?\)/g, ''));
  }
  const [g] = await sql.query(`SELECT explanation FROM "GrammarTopic" WHERE id=$1`, [l.grammarTopicId]);
  if (g) teach(g.explanation);
}
// Модулҳои ПЕШТАРА низ таълим додаанд.
const prevWords = new Set();
for (const pm of await sql.query(
  `SELECT id FROM "Module" WHERE "courseId"=$1 AND "order" < $2`, [course.id, ORDER])) {
  const pl = await sql.query(`SELECT id FROM "Lesson" WHERE "moduleId"=$1 AND "isActive"`, [pm.id]);
  if (!pl.length) continue;
  for (const w of await sql.query(`SELECT word, example FROM "Word" WHERE "lessonId"=ANY($1)`,
    [pl.map((x) => x.id)])) { teach(w.word); teach(w.example); prevWords.add(strip(w.word)); }
}
const NAMES = new Set(['احمد', 'كريم', 'ساره', 'عمر', 'ليلي', 'رستم', 'حنان', 'موسكو']);
const known = (t) => {
  const raw = strip(t).replace(/[.،؟!:'’«»]/g, '');
  if (!raw || !AR.test(raw)) return true;
  if (NAMES.has(raw) || raw.length <= 2) return true;
  if (taught.has(raw)) return true;
  const st = stem(raw);
  if (!st) return true;
  for (const v of verbStems(st)) if (taught.has(v)) return true;
  // Танвин/бандаки иловагӣ: صديقتي ← صديقة
  const alt = st.replace(/ت$/, '');
  return taught.has(alt);
};

// ── D2: матн/савол калимаи наомӯхта надорад ────────────────────────────
{
  const off = [];
  for (const l of lessons) {
    const texts = [];
    if (l.comprehensionId) {
      const [c] = await sql.query(`SELECT passage FROM "ComprehensionExercise" WHERE id=$1`, [l.comprehensionId]);
      if (c) texts.push(c.passage);
      for (const q of await sql.query(`SELECT question, options, "questionTranslated" qt FROM "ComprehensionQuestion" WHERE "exerciseId"=$1`, [l.comprehensionId])) {
        texts.push(q.question);
        for (const o of (q.options ?? [])) texts.push(String(o));
        if (!(q.qt ?? '').trim()) off.push(`Д${l.order}: савол бе тарҷумаи тоҷикӣ`);
      }
    }
    if (l.dialogueId) for (const s of await sql.query(`SELECT text FROM "DialogueLine" WHERE "dialogueId"=$1`, [l.dialogueId])) texts.push(s.text);
    if (!texts.length) continue;
    const unk = [...new Set(texts.join(' ').split(/\s+/).filter((t) => !known(t)))];
    if (unk.length) off.push(`Д${l.order} [${l.skillType}]: ${unk.join(' ')}`);
  }
  // Калимаи дарси НАВИШТАН низ бояд аллакай таълим шуда бошад.
  for (const l of lessons.filter((x) => x.skillType === 'writing')) {
    const others = words.filter((w) => w.lessonId !== l.id).map((w) => strip(w.word));
    const prev = new Set(others);
    const unk = words.filter((w) => w.lessonId === l.id
      && !prev.has(strip(w.word)) && !prevWords.has(strip(w.word)));
    if (unk.length) off.push(`Д${l.order} [writing]: калимаи ТАЪЛИМНАШУДА — ${unk.map((w) => w.word).join(' ')}`);
  }
  check('D2', off.length === 0, 'матн/савол/навиштан танҳо калимаҳои омӯхташуда', off.join('\n     '));
}

// ── D3: ҳаракат ─────────────────────────────────────────────────────────
{
  const bad = [];
  for (const l of lessons) {
    if (l.comprehensionId) {
      const [c] = await sql.query(`SELECT passage FROM "ComprehensionExercise" WHERE id=$1`, [l.comprehensionId]);
      if (c && harRatio(c.passage) < 0.3) bad.push(`Д${l.order} матн (${harRatio(c.passage).toFixed(2)})`);
    }
    if (l.dialogueId) {
      const ls = await sql.query(`SELECT text FROM "DialogueLine" WHERE "dialogueId"=$1`, [l.dialogueId]);
      const low = ls.filter((s) => harRatio(s.text) < 0.3);
      if (low.length) bad.push(`Д${l.order} муколама: ${low.length}/${ls.length} сатр`);
    }
    if (l.grammarTopicId) {
      const ex = await sql.query(`SELECT sentence FROM "GrammarExample" WHERE "topicId"=$1`, [l.grammarTopicId]);
      const low = ex.filter((e) => harRatio(e.sentence) < 0.3);
      if (low.length) bad.push(`Д${l.order} мисоли грамматика: ${low.length}/${ex.length}`);
    }
  }
  check('D3', bad.length === 0, 'матн, муколама ва мисоли грамматика ҳаракатдоранд', bad.join('\n     '));
}

// ── D4: як шакли муроҷиат ───────────────────────────────────────────────
{
  const rows = [];
  for (const l of lessons) {
    if (l.dialogueId) for (const s of await sql.query(`SELECT translation FROM "DialogueLine" WHERE "dialogueId"=$1`, [l.dialogueId])) rows.push(s.translation);
    if (l.comprehensionId) for (const q of await sql.query(`SELECT "questionTranslated" t FROM "ComprehensionQuestion" WHERE "exerciseId"=$1`, [l.comprehensionId])) rows.push(q.t ?? '');
    if (l.grammarTopicId) {
      for (const e of await sql.query(`SELECT translation FROM "GrammarExample" WHERE "topicId"=$1`, [l.grammarTopicId])) rows.push(e.translation);
      for (const x of await sql.query(`SELECT "promptTranslated" t FROM "GrammarExercise" WHERE "topicId"=$1`, [l.grammarTopicId])) rows.push(x.t ?? '');
    }
  }
  for (const w of words) if (w.exampleTrans) rows.push(w.exampleTrans);
  const tu = rows.filter((t) => [' дорӣ', 'ҳастӣ', 'номат', 'куҷоӣ', 'мезанӣ', 'мекунӣ'].some((x) => t.includes(x)) || bound('ту').test(t));
  const shumo = rows.filter((t) => bound('шумо').test(t) || bound('шуморо').test(t) || t.includes('ҳастед') || t.includes('мезанед'));
  check('D4', !(tu.length && shumo.length), 'дар модул танҳо ЯК шакли муроҷиат',
    `ту: ${tu.length} · Шумо: ${shumo.length}` +
    (tu.length && shumo.length ? `\n     Шумо → ${shumo.slice(0, 4).join(' | ')}` : ''));
}

// ── D5: як ҷумла — як тарҷума ───────────────────────────────────────────
{
  const by = new Map();
  for (const w of words) {
    if (!w.example) continue;
    const k = w.example.replace(/\s+/g, ' ').trim();
    if (!by.has(k)) by.set(k, new Set());
    by.get(k).add((w.exampleTrans ?? '').trim());
  }
  const cl = [...by].filter(([, v]) => v.size > 1).map(([k, v]) => `${k} → ${[...v].join('  ⟷  ')}`);
  check('D5', cl.length === 0, 'як ҷумла — як тарҷума', cl.join('\n     '));
}

// ── D6: як калима — як шакл/эмоҷӣ/транскрипсия ──────────────────────────
{
  const by = new Map();
  for (const w of words) {
    const k = strip(w.word);
    if (!by.has(k)) by.set(k, { emoji: new Set(), ipa: new Set(), form: new Set(), tr: new Set() });
    const c = by.get(k);
    c.emoji.add(w.emoji ?? ''); c.ipa.add(w.ipaTajik ?? ''); c.form.add(w.word); c.tr.add(w.translation ?? '');
  }
  const bad = [];
  for (const [k, v] of by) {
    if (v.form.size > 1) bad.push(`${k}: навишт ${[...v.form].join(' / ')}`);
    if (v.emoji.size > 1) bad.push(`${k}: эмоҷӣ ${[...v.emoji].join(' ')}`);
    if (v.ipa.size > 1) bad.push(`${k}: транскрипсия ${[...v.ipa].join(' / ')}`);
    if (v.tr.size > 1) bad.push(`${k}: тарҷума ${[...v.tr].join(' / ')}`);
  }
  check('D6', bad.length === 0, 'як калима — як шакл/эмоҷӣ/транскрипсия/тарҷума', bad.join('\n     '));
}

// ── D8: тартиби калимаҳо 1..N ───────────────────────────────────────────
{
  const bad = [];
  for (const l of lessons) {
    const ws = words.filter((w) => w.lessonId === l.id);
    if (!ws.length) continue;
    const o = ws.map((w) => w.order);
    const want = [...Array(ws.length).keys()].map((i) => i + 1);
    if (JSON.stringify([...o].sort((a, b) => a - b)) !== JSON.stringify(want)) bad.push(`Д${l.order}: ${o.join(',')} → бояд ${want.join(',')}`);
  }
  check('D8', bad.length === 0, 'тартиби калимаҳо 1..N бе такрор ва холигӣ', bad.join('\n     '));
}

// ── D10: мисоли такрорӣ дар як дарс ─────────────────────────────────────
{
  const bad = [];
  for (const l of lessons) {
    const ex = words.filter((w) => w.lessonId === l.id && w.example).map((w) => w.example.trim());
    const dup = ex.filter((e, i) => ex.indexOf(e) !== i);
    if (dup.length) bad.push(`Д${l.order}: «${[...new Set(dup)].join('», «')}»`);
  }
  check('D10', bad.length === 0, 'дар як дарс мисоли такрорӣ нест', bad.join('\n     '));
}

// ── D12: canDoStatement ─────────────────────────────────────────────────
check('D12', !!(mod.canDoStatement ?? '').trim(), 'модул canDoStatement дорад', mod.canDoStatement ?? '(холӣ)');

// ── D13: калима дар мисоли ХУДАШ ҳамон шакл ─────────────────────────────
{
  const bad = [];
  for (const w of words) {
    if (!w.example) continue;
    const bw = strip(w.word).replace(/[.،؟!]/g, '');
    if (!bw || !strip(w.example).includes(bw)) continue;
    const core = w.word.replace(/[.،؟!]+$/, '');
    if ([core, core.replace(/^(اِ|اُ|اَ)/, 'ا')].some((f) => w.example.includes(f))) continue;
    bad.push(`${w.word}  →  ${w.example}`);
  }
  check('D13', bad.length === 0, 'калима дар мисоли худаш ҳамон шаклро дорад', bad.join('\n     '));
}

// ── D14: ду тарҷумаи якхела дар як дарс (қулфи бозии мач) ───────────────
{
  const bad = [];
  for (const l of lessons) {
    const seen = new Map();
    for (const w of words.filter((x) => x.lessonId === l.id)) {
      const k = (w.translation ?? '').trim().toLowerCase();
      if (seen.has(k)) bad.push(`Д${l.order}: «${w.translation}» — ${seen.get(k)} ва ${w.word}`);
      seen.set(k, w.word);
    }
  }
  check('D14', bad.length === 0, 'дар як дарс ду тарҷумаи якхела нест', bad.join('\n     '));
}

// ── D15: як эмоҷӣ ба ду калимаи як дарс ─────────────────────────────────
{
  const bad = [];
  for (const l of lessons) {
    const seen = new Map();
    for (const w of words.filter((x) => x.lessonId === l.id)) {
      if (!w.emoji) continue;
      if (seen.has(w.emoji)) bad.push(`Д${l.order}: ${w.emoji} — «${seen.get(w.emoji)}» ва «${w.translation}»`);
      seen.set(w.emoji, w.translation);
    }
  }
  check('D15', bad.length === 0, 'дар як дарс як эмоҷӣ ду маротиба нест', bad.join('\n     '));
}

// ── D16: тарҷума бо ҳарфи КАЛОН сар мешавад ─────────────────────────────
{
  const bad = words.filter((w) => {
    const t = (w.translation ?? '').trim();
    const f = t[0];
    return f && f.toLowerCase() === f && f.toUpperCase() !== f;
  });
  check('D16', bad.length === 0, 'ҳар тарҷума бо ҳарфи калон сар мешавад',
    bad.map((w) => `${w.word}: «${w.translation}»`).join('\n     '));
}

// ── H: саломатии умумӣ ──────────────────────────────────────────────────
check('H1', words.every((w) => w.ipaTajik), 'ҳама калима транскрипсияи тоҷикӣ дорад');
check('H2', words.every((w) => w.emoji), 'ҳама калима эмоҷӣ дорад');
check('H3', words.every((w) => w.example && w.exampleTrans), 'ҳама калима мисол ва тарҷумаи он дорад');
check('H4', words.every((w) => w.audioUrl), 'ҳама калима аудио дорад',
  words.filter((w) => !w.audioUrl).map((w) => w.word).join(' '));

// ── V2: вариантҳои ҷавоб ────────────────────────────────────────────────
{
  const bad = [];
  for (const l of lessons.filter((x) => x.comprehensionId)) {
    const qs = await sql.query(`SELECT question, options, "correctIndex" ci, "order" o FROM "ComprehensionQuestion" WHERE "exerciseId"=$1 ORDER BY "order"`, [l.comprehensionId]);
    if (!qs.length) { bad.push(`Д${l.order}: ягон савол нест`); continue; }
    for (const x of qs) {
      const o = x.options ?? [];
      if (o.length < 2) bad.push(`Д${l.order} с${x.o}: ${o.length} вариант`);
      if (x.ci < 0 || x.ci >= o.length) bad.push(`Д${l.order} с${x.o}: correctIndex=${x.ci} аз ${o.length}`);
      const dup = o.filter((v, i) => o.indexOf(v) !== i);
      if (dup.length) bad.push(`Д${l.order} с${x.o}: варианти такрорӣ «${dup[0]}»`);
    }
  }
  check('V2', bad.length === 0, 'ҳар савол вариантҳои дуруст ва беназир дорад', bad.join('\n     '));
}

// ── V3: муколама сатри «ман» дорад ──────────────────────────────────────
{
  const bad = [];
  for (const l of lessons.filter((x) => x.dialogueId)) {
    const [r] = await sql.query(`SELECT count(*) FILTER (WHERE "isUser") u, count(*) n FROM "DialogueLine" WHERE "dialogueId"=$1`, [l.dialogueId]);
    if (Number(r.u) === 0) bad.push(`Д${l.order}: ${r.n} сатр, ягонтоаш «ман» нест`);
  }
  check('V3', bad.length === 0, 'муколама сатри «ман» дорад (микрофон)', bad.join('\n     '));
}

// ── V5: дарси холӣ нест ─────────────────────────────────────────────────
{
  const bad = lessons.filter((l) => !words.some((w) => w.lessonId === l.id)
    && !l.comprehensionId && !l.dialogueId && !l.grammarTopicId)
    .map((l) => `Д${l.order} [${l.skillType}]`);
  check('V5', bad.length === 0, 'ҳар дарс мазмун дорад', bad.join(', '));
}

// ── V1 (--live): аудио воқеан кушода мешавад ────────────────────────────
if (LIVE) {
  const urls = [];
  for (const w of words) urls.push([w.audioUrl, `калима ${w.word}`]);
  for (const l of lessons.filter((x) => x.comprehensionId)) {
    const [c] = await sql.query(`SELECT "audioUrl" u, "titleTranslated" t FROM "ComprehensionExercise" WHERE id=$1`, [l.comprehensionId]);
    if (c) urls.push([c.u, `матн ${c.t}`]);
  }
  for (const l of lessons.filter((x) => x.dialogueId)) {
    for (const s of await sql.query(`SELECT "audioUrl" u, text t FROM "DialogueLine" WHERE "dialogueId"=$1`, [l.dialogueId])) urls.push([s.u, `муколама ${s.t}`]);
  }
  const missing = urls.filter(([u]) => !u);
  const bad = [];
  let n = 0;
  for (const [u, label] of urls) {
    if (!u) continue;
    try {
      const r = await fetch(u, { headers: { Range: 'bytes=0-64' } });
      if (!r.ok && r.status !== 206) bad.push(`${label} → HTTP ${r.status}`);
      n++;
    } catch (e) { bad.push(`${label} → ${e.message}`); }
  }
  check('V1', missing.length === 0 && bad.length === 0, `ҳар аудио кушода мешавад (${n})`,
    [...missing.map(([, l]) => `${l}: аудио НЕСТ`), ...bad].join('\n     '));
}

console.log(`\n${fail === 0 ? '🎉 ҲАМА ТОЗА' : `⚠️  ${fail} банд ислоҳ талаб мекунад`}`);
process.exit(fail === 0 ? 0 : 1);
