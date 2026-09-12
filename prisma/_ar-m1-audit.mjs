// Аудити Модули 1-и арабӣ — ҲАР даъвои гузориши «студентҳои рақамӣ» бо
// маълумоти ХОМ тасдиқ ё рад мешавад. Ҳамин файл баъди ислоҳ низ иҷро
// мешавад: ҳар банд бояд ✅ шавад.
//
//   node prisma/_ar-m1-audit.mjs
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }),
);
const sql = neon(env.DATABASE_URL);

const [course] = await sql.query(`
  SELECT c.id FROM "Course" c
    JOIN "Language" t ON t.id = c."targetLanguageId"
    JOIN "Language" n ON n.id = c."nativeLanguageId"
   WHERE t.code='ar' AND n.code='tg' AND c.level='A1'`);
const [mod] = await sql.query(
  `SELECT id, "canDoStatement" FROM "Module" WHERE "courseId"=$1 ORDER BY "order" LIMIT 1`, [course.id]);
const lessons = await sql.query(
  `SELECT id, "order", "skillType", "titleTranslated", "dialogueId", "comprehensionId",
          "grammarTopicId"
     FROM "Lesson" WHERE "moduleId"=$1 ORDER BY "order"`, [mod.id]);
const lids = lessons.map((l) => l.id);
const words = await sql.query(
  `SELECT id, "lessonId", "order", word, translation, emoji, "ipaTajik", example, "exampleTrans"
     FROM "Word" WHERE "lessonId" = ANY($1) ORDER BY "lessonId", "order"`, [lids]);

// Ҳаракатҳои арабӣ: фатҳа…сукун + шадда + танвинҳо.
const HARAKAT = /[ً-ْٰ]/;
const AR = /[ء-ي]/;

let fail = 0;
const check = (id, ok, title, detail = '') => {
  if (!ok) fail++;
  console.log(`${ok ? '✅' : '❌'} ${id} — ${title}${detail ? '\n     ' + detail : ''}`);
};

// ── D1: мисоли «кӣ» бояд مَنْ бошад, на مِن ────────────────────────────
{
  const w = words.find((x) => x.word.includes('مَن') && x.translation === 'Кӣ');
  const bad = w && /مِن\s/.test(w.example ?? '');
  check('D1', !bad, 'мисоли калимаи «Кӣ» бояд مَنْ дошта бошад, на مِن',
    w ? `ҳозир: ${w.example}` : 'калима ёфт нашуд');
}

// ── D2: матн/савол калимаи НАОМӮХТА надошта бошад ──────────────────────
{
  // ⚠️ «ОМҮХТАШУДА» = матни калима + ҷумлаи мисоли ҳар калима + мисол ва
  // машқҳои грамматика. Мисол ҳамеша БО ТАРҶУМА нишон дода мешавад,
  // пас калимаи даруни он барои хонанда ношинос нест.
  const strip = (s) => s.replace(/[ً-ْٰـ]/g, '')
    .replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').trim();
  const taught = new Set();
  const teach = (t) => { for (const x of strip(t ?? '').replace(/[.،؟!:'’]/g, ' ').split(/\s+/)) if (x) taught.add(x); };
  for (const w of words) { teach(w.word); teach(w.example); }
  for (const l of lessons) {
    if (!l.grammarTopicId) continue;
    const ex = await sql.query(`SELECT sentence FROM "GrammarExample" WHERE "topicId"=$1`, [l.grammarTopicId]);
    for (const e of ex) teach(e.sentence);
    const xs = await sql.query(`SELECT prompt, options, answer FROM "GrammarExercise" WHERE "topicId"=$1`, [l.grammarTopicId]);
    for (const x of xs) { teach(x.prompt); teach(String(x.answer).replace(/\(.*?\)/g, ''));
      for (const o of (x.options ?? [])) teach(String(o).replace(/\(.*?\)/g, '')); }
  }
  // Номҳои хос — санҷида намешаванд.
  const NAMES = new Set(['احمد', 'كريم', 'ساره', 'عمر', 'ليلي', 'رستم']);
  const known = (t) => {
    const s = strip(t).replace(/[.،؟!:'’]/g, '');
    if (!s || !AR.test(s)) return true;
    if (NAMES.has(s)) return true;
    // Як-ду ҳарфи боқимонда = пайвандак/пешоянд (و، ب، ل، يا), на калимаи нав.
    if (s.length <= 2) return true;
    const cands = new Set([s]);
    for (const base of [s, s.replace(/^(ال|وال|فال|بال|لل|و|ف|ب|ل)/, '')]) {
      cands.add(base);
      cands.add(base.replace(/(ها|هم|ي|ه|ك)$/, ''));
      cands.add(base.replace(/ت$/, ''));            // صديقتي ← صديقه
      cands.add(base.replace(/(ي|ه)$/, '').replace(/ت$/, ''));
    }
    for (const c of cands) if (c && taught.has(c)) return true;
    return false;
  };
  const offenders = [];
  for (const l of lessons) {
    const texts = [];
    if (l.comprehensionId) {
      const [c] = await sql.query(`SELECT passage FROM "ComprehensionExercise" WHERE id=$1`, [l.comprehensionId]);
      if (c) texts.push(c.passage);
      const qs = await sql.query(`SELECT question, options FROM "ComprehensionQuestion" WHERE "exerciseId"=$1`, [l.comprehensionId]);
      for (const q of qs) { texts.push(q.question); for (const o of (q.options ?? [])) texts.push(String(o)); }
    }
    if (l.dialogueId) {
      const ls = await sql.query(`SELECT text FROM "DialogueLine" WHERE "dialogueId"=$1`, [l.dialogueId]);
      for (const s of ls) texts.push(s.text);
    }
    if (!texts.length) continue;
    const unk = [...new Set(texts.join(' ').split(/\s+/).filter((t) => !known(t)))];
    if (unk.length) offenders.push(`Д${l.order} [${l.skillType}]: ${unk.join(' ')}`);
    // Ҳар савол бояд тарҷумаи тоҷикӣ дошта бошад — бе он матни савол девор аст.
    if (l.comprehensionId) {
      const qs = await sql.query(`SELECT question, "questionTranslated" FROM "ComprehensionQuestion" WHERE "exerciseId"=$1`, [l.comprehensionId]);
      const noTr = qs.filter((q) => !(q.questionTranslated ?? '').trim());
      if (noTr.length) offenders.push(`Д${l.order}: ${noTr.length} савол бе тарҷумаи тоҷикӣ`);
    }
  }
  check('D2', offenders.length === 0, 'матн/савол танҳо калимаҳои омӯхташуда дошта бошанд',
    offenders.join('\n     '));
}

// ── D3: матнҳо ва муколама ҳаракатдор бошанд ──────────────────────────
{
  // Мавҷудияти як ҳаракат кофӣ нест: `مرحباً` танҳо танвин дорад ва
  // боз ҳам хонда намешавад. Нисбати ҳаракат/ҳарф ҳисоб мешавад;
  // матни пурра ҳаракатдор ~0.5+ аст, матни луч ~0.05.
  const ratio = (t) => {
    const letters = (t.match(/[\u0621-\u064a]/g) ?? []).length;
    const marks = (t.match(/[\u064b-\u0652\u0670]/g) ?? []).length;
    return letters ? marks / letters : 1;
  };
  const MIN = 0.3;
  const bad = [];
  for (const l of lessons) {
    if (l.comprehensionId) {
      const [c] = await sql.query(`SELECT passage FROM "ComprehensionExercise" WHERE id=$1`, [l.comprehensionId]);
      if (c && ratio(c.passage) < MIN) bad.push(`Д${l.order} матн (${ratio(c.passage).toFixed(2)})`);
    }
    if (l.dialogueId) {
      const ls = await sql.query(`SELECT text FROM "DialogueLine" WHERE "dialogueId"=$1`, [l.dialogueId]);
      const low = ls.filter((s) => ratio(s.text) < MIN);
      if (low.length) bad.push(`Д${l.order} муколама: ${low.length} сатр`);
    }
  }
  check('D3', bad.length === 0, 'матн ва муколама ҳаракат дошта бошанд', bad.join(', '));
}

// ── D4: «ту» ва «Шумо» омехта нашаванд ────────────────────────────────
{
  const rows = [];
  for (const l of lessons) {
    if (!l.dialogueId) continue;
    const ls = await sql.query(`SELECT translation FROM "DialogueLine" WHERE "dialogueId"=$1`, [l.dialogueId]);
    for (const s of ls) rows.push(s.translation);
  }
  for (const w of words) if (w.exampleTrans) rows.push(w.exampleTrans);
  // ⚠️ `\b` бо кириллӣ КОР НАМЕКУНАД (JS онҳоро ҳарфи калима намеҳисобад)
  // — ҳамон доме ки дар аудити русӣ сабт шуда буд. Фосила/киноя дастӣ.
  const bound = (w) => new RegExp(`(^|[^\\u0400-\\u04ff\\w])${w}([^\\u0400-\\u04ff\\w]|$)`, 'i');
  const tu = rows.filter((t) => [' дорӣ', 'ҳастӣ', 'номат'].some((w) => t.includes(w)) || bound('ту').test(t));
  const shumo = rows.filter((t) => bound('шумо').test(t) || bound('шуморо').test(t));
  check('D4', !(tu.length && shumo.length), 'дар модул танҳо ЯК шакли муроҷиат',
    `ту: ${tu.length} ҷой · Шумо: ${shumo.length} ҷой` +
    (tu.length && shumo.length ? `\n     ту → ${tu.slice(0, 3).join(' | ')}\n     Шумо → ${shumo.slice(0, 3).join(' | ')}` : ''));
}

// ── D5: як ҷумлаи арабӣ — як тарҷума ──────────────────────────────────
{
  const byEx = new Map();
  for (const w of words) {
    if (!w.example) continue;
    const k = w.example.replace(/\s+/g, ' ').trim();
    (byEx.get(k) ?? byEx.set(k, new Set()).get(k)).add((w.exampleTrans ?? '').trim());
  }
  const clashes = [...byEx].filter(([, v]) => v.size > 1)
    .map(([k, v]) => `${k} → ${[...v].join('  ⟷  ')}`);
  check('D5', clashes.length === 0, 'як ҷумла — як тарҷума', clashes.join('\n     '));
}

// ── D6: як калима — як эмоҷӣ, як транскрипсия, як навишт ──────────────
{
  const norm = (s) => s.replace(/[ً-ْٰـ]/g, '').replace(/[أإآ]/g, 'ا').trim();
  const by = new Map();
  for (const w of words) {
    const k = norm(w.word);
    const cur = by.get(k) ?? { emoji: new Set(), ipa: new Set(), form: new Set() };
    cur.emoji.add(w.emoji ?? ''); cur.ipa.add(w.ipaTajik ?? ''); cur.form.add(w.word);
    by.set(k, cur);
  }
  const bad = [];
  for (const [k, v] of by) {
    if (v.emoji.size > 1) bad.push(`${k}: эмоҷӣ ${[...v.emoji].join(' ')}`);
    if (v.ipa.size > 1) bad.push(`${k}: транскрипсия ${[...v.ipa].join(' / ')}`);
    if (v.form.size > 1) bad.push(`${k}: навишт ${[...v.form].join(' / ')}`);
  }
  // `أنتَ` бе ҳаракати пурра
  const anta = words.find((w) => norm(w.word) === 'انت');
  if (anta && anta.word !== 'أَنْتَ') bad.push(`«ту» навишта шудааст «${anta.word}», бояд «أَنْتَ»`);
  check('D6', bad.length === 0, 'як калима — як шакл/эмоҷӣ/транскрипсия', bad.join('\n     '));
}

// ── D7: тоҷикии ғалат ─────────────────────────────────────────────────
{
  const BAD = ['Маафаш', 'бубахшед мегӯям', 'Ин (аст)'];
  const hits = [];
  for (const w of words) {
    for (const b of BAD) {
      if ((w.translation ?? '').includes(b)) hits.push(`${w.word}: «${w.translation}»`);
      if ((w.exampleTrans ?? '').includes(b)) hits.push(`${w.word} (мисол): «${w.exampleTrans}»`);
    }
  }
  check('D7', hits.length === 0, 'тоҷикии дуруст', [...new Set(hits)].join('\n     '));
}

// ── D8: тартиби калимаҳо — бе такрор ва бе холигӣ ─────────────────────
{
  const bad = [];
  for (const l of lessons) {
    const ws = words.filter((w) => w.lessonId === l.id);
    if (!ws.length) continue;
    const ords = ws.map((w) => w.order);
    const dup = ords.filter((o, i) => ords.indexOf(o) !== i);
    const want = [...Array(ws.length).keys()].map((i) => i + 1);
    if (dup.length) bad.push(`Д${l.order}: рақами такрорӣ ${[...new Set(dup)].join(',')} (${ords.join(',')})`);
    else if (JSON.stringify([...ords].sort((a, b) => a - b)) !== JSON.stringify(want)) {
      bad.push(`Д${l.order}: тартиб ${ords.join(',')} — бояд ${want.join(',')}`);
    }
  }
  check('D8', bad.length === 0, 'тартиби калимаҳо 1..N бе такрор', bad.join('\n     '));
}

// ── D9: «Вақтҳои Рӯз» танҳо вақт ──────────────────────────────────────
{
  const l = lessons.find((x) => x.titleTranslated.includes('Вақтҳои'));
  const ws = l ? words.filter((w) => w.lessonId === l.id) : [];
  const off = ws.filter((w) => /Хуш омадед/i.test(w.translation));
  check('D9', off.length === 0, '«Вақтҳои Рӯз» танҳо вақти рӯзро дорад',
    off.map((w) => `${w.word} — ${w.translation}`).join(', '));
}

// ── D10: мисоли такрорӣ дар як дарс ───────────────────────────────────
{
  const bad = [];
  for (const l of lessons) {
    const ex = words.filter((w) => w.lessonId === l.id && w.example).map((w) => w.example.trim());
    const dup = ex.filter((e, i) => ex.indexOf(e) !== i);
    if (dup.length) bad.push(`Д${l.order}: «${[...new Set(dup)].join('», «')}»`);
  }
  check('D10', bad.length === 0, 'дар як дарс мисоли такрорӣ нест', bad.join('\n     '));
}

// ── D13: калима дар МИСОЛИ ХУДАШ ҳамон шаклро дошта бошад ──────
{
  // Ҳангоми хондан баромад: корт `اِسْمِي` мегӯяд, вале мисоли ҳамон
  // корт `اسْمِي` — як калима, ду шакл, дар ЯК экран. Барои хонандае
  // ки алифборо ҳанӯз азхуд накардааст, ин ду калимаи гуногун аст.
  const bare = (t) => t.replace(/[\u064b-\u0652\u0670\u0640]/g, '');
  const bad = [];
  for (const w of words) {
    if (!w.example) continue;
    const bw = bare(w.word).replace(/[.\u060c\u061f!]/g, '');
    const be = bare(w.example);
    if (!bw || !be.includes(bw)) continue;      // мисол ин калимаро надорад
    // Шакли ПУРРА бояд дар мисол бошад (ё бо пешоянди ال/و/ب/ل).
    // Аломати китобатии ОХИРИ калима (`؟` дар «مَا اسْمُكَ؟») набояд ба
    // муқоиса дарояд — дар мисол он ҷои дигар меистад.
    const core = w.word.replace(/[.،؟!]+$/, '');
    const forms = [core, core.replace(/^(اِ|اُ|اَ)/, 'ا')];
    if (forms.some((f) => w.example.includes(f))) continue;
    bad.push(`${w.word}  →  ${w.example}`);
  }
  check('D13', bad.length === 0,
    'калима дар мисоли худаш ҳамон шаклро дорад', bad.join('\n     '));
}

// ── D14: дар як дарс ду калима тарҷумаи ЯКХЕЛА надошта бошанд ────
{
  // ⚠️ Ду тарҷумаи якхела дар як дарс бозии мачро қулф мекунад —
  // дар RU-A1 ҳамин курсро кушта буд (ниг. ramz-translation-collision).
  const bad = [];
  for (const l of lessons) {
    const ws = words.filter((w) => w.lessonId === l.id);
    const seen = new Map();
    for (const w of ws) {
      const k = (w.translation ?? '').trim().toLowerCase();
      if (seen.has(k)) bad.push(`Д${l.order}: «${w.translation}» — ${seen.get(k)} ва ${w.word}`);
      seen.set(k, w.word);
    }
  }
  check('D14', bad.length === 0,
    'дар як дарс ду тарҷумаи якхела нест (қулфи бозии мач)', bad.join('\n     '));
}

// ── D12: canDoStatement ───────────────────────────────────────────────
check('D12', !!(mod.canDoStatement ?? '').trim(), 'модул canDoStatement дорад',
  `ҳозир: ${mod.canDoStatement ?? '(холӣ)'}`);

// ── Санҷишҳои умумии саломатӣ ─────────────────────────────────────────
check('H1', words.every((w) => w.ipaTajik), 'ҳама калима транскрипсияи тоҷикӣ дорад');
check('H2', words.every((w) => w.emoji), 'ҳама калима эмоҷӣ дорад');
check('H3', words.every((w) => w.example && w.exampleTrans), 'ҳама калима мисол ва тарҷумаи он дорад');

console.log(`\n${fail === 0 ? '🎉 ҲАМА ТОЗА' : `⚠️  ${fail} банд ҳанӯз ислоҳ талаб мекунад`}`);
process.exit(fail === 0 ? 0 : 1);
