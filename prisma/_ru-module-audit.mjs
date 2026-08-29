// АУДИТИ МОДУЛ — курси русӣ A1. Сатҳ-агностик: рақами модулро қабул мекунад.
//
// Ҳамон панҷ меҳваре, ки дар `Russian_A1_M1_M2_Final_Verification.md` санҷида
// шуд, то натиҷаҳо муқоисашаванда бошанд:
//   A · сохтор — дарси канда ҳаст?
//   B · луғат — аудио / ipa / ipaTajik / мисол
//   C · грамматика — варақаи ⚡, фоссили англисӣ, истилоҳи ҷинс, тавзеҳи машқ
//   D · фаҳмиш — тавзеҳи ХОЛӢ, тавзеҳи ДУРӮҒГӮ, иқтибоси нодуруст
//   E · оҳанг — ихтилофи «ты↔Шумо», регистри русӣ, муколама/isUser/аудио
//
//   node prisma/_ru-module-audit.mjs 2 3      # модулҳои order=2 ва order=3
//   node prisma/_ru-module-audit.mjs 2 3 --json
import { connect, COURSE_RU_A1 as C } from './_ru-fix-lib.mjs';

const sql = connect();
const ORDERS = process.argv.slice(2).filter((a) => /^\d+$/.test(a)).map(Number);
const JSON_OUT = process.argv.includes('--json');
if (ORDERS.length === 0) {
  console.error('Истифода: node prisma/_ru-module-audit.mjs <order> [<order>…]');
  process.exit(1);
}

const mods = await sql`
  SELECT id,title,"titleTranslated" tt,"order" FROM "Module"
  WHERE "courseId"=${C} AND "order"=ANY(${ORDERS}) ORDER BY "order"`;
const MIDS = mods.map((m) => m.id);
const NAME = Object.fromEntries(mods.map((m) => [m.id, `M${m.order + 1}`]));

const findings = [];
const add = (sev, code, where, msg) => findings.push({ sev, code, where, msg });
const H = (s) => console.log(`\n${'═'.repeat(74)}\n  ${s}\n${'═'.repeat(74)}`);

console.log(`\nКурс: русӣ A1 · модулҳо: ${mods.map((m) => `${NAME[m.id]} «${m.tt}»`).join(' · ')}`);

// ═══════════════════════════════════════════════════════════ A · СОХТОР
H('A · Сохтор');
const lessons = await sql`
  SELECT l.id,l.title,l."titleTranslated" tt,l."skillType" st,l."order" o,l."moduleId" mid,
         l."grammarTopicId" g,l."dialogueId" d,l."comprehensionId" cp,
         (SELECT count(*)::int FROM "Word" w WHERE w."lessonId"=l.id) wc
  FROM "Lesson" l WHERE l."moduleId"=ANY(${MIDS}) ORDER BY l."moduleId",l."order"`;
for (const m of mods) {
  const ls = lessons.filter((l) => l.mid === m.id);
  const by = {};
  for (const l of ls) by[l.st] = (by[l.st] || 0) + 1;
  console.log(`  ${NAME[m.id]}: ${ls.length} дарс · ${Object.entries(by).map(([k, v]) => `${v} ${k}`).join(' · ')}`);
}
for (const l of lessons) {
  if (!l.g && !l.d && !l.cp && l.wc === 0) {
    add('P0', 'A1-EMPTY', `${NAME[l.mid]} #${l.o} ${l.st}`, `дарси КАНДА: «${l.tt}» — на калима, на компонент`);
  }
}
console.log(findings.some((f) => f.code === 'A1-EMPTY') ? '  ⚠️ дарси канда ҳаст' : '  ✅ ягон дарси канда нест');

// ═══════════════════════════════════════════════════════════ B · ЛУҒАТ
H('B · Луғат');
const words = await sql`
  SELECT w.*,l."moduleId" mid,l."order" lo,l."titleTranslated" lt
  FROM "Word" w JOIN "Lesson" l ON w."lessonId"=l.id
  WHERE l."moduleId"=ANY(${MIDS}) ORDER BY l."moduleId",l."order",w."order"`;
const miss = { audioUrl: [], ipa: [], example: [], exampleTrans: [], emoji: [], partOfSpeech: [] };
for (const w of words) {
  for (const k of Object.keys(miss)) if (!w[k] || !String(w[k]).trim()) miss[k].push(w);
}
console.log(`  Калимаҳо: ${words.length} (ягона: ${new Set(words.map((w) => w.word.toLowerCase())).size})`);
for (const [k, v] of Object.entries(miss)) {
  console.log(`    ${k.padEnd(14)} ${words.length - v.length}/${words.length}${v.length ? '  ← ' + v.slice(0, 6).map((w) => w.word).join(', ') + (v.length > 6 ? '…' : '') : ''}`);
  if (v.length) add(k === 'audioUrl' ? 'P0' : 'P1', `B-${k}`, `${v.length} калима`, `«${k}» намерасад: ${v.slice(0, 8).map((w) => `${NAME[w.mid]}#${w.lo} ${w.word}`).join(', ')}${v.length > 8 ? '…' : ''}`);
}
// ipaTajik: холӣ ҳамеша боги нест (талаффуз = навишт), пас танҳо ҳисоб мешавад.
const noIpaTj = words.filter((w) => !w.ipaTajik || !w.ipaTajik.trim());
console.log(`    ipaTajik       ${words.length - noIpaTj.length}/${words.length}${noIpaTj.length ? '  (холӣ: ' + noIpaTj.slice(0, 8).map((w) => w.word).join(', ') + (noIpaTj.length > 8 ? '…' : '') + ')' : ''}`);
// Такрори калима дар дохили модул
const seen = {};
for (const w of words) {
  const k = `${w.mid}|${w.word.toLowerCase()}`;
  (seen[k] ||= []).push(w);
}
const dupes = Object.values(seen).filter((v) => v.length > 1);
if (dupes.length) {
  console.log(`  ⚠️ такрори калима дар як модул: ${dupes.length}`);
  for (const d of dupes.slice(0, 10)) console.log(`      ${NAME[d[0].mid]} «${d[0].word}» × ${d.length} (дарсҳои ${d.map((x) => '#' + x.lo).join(', ')})`);
  add('P2', 'B-DUP', `${dupes.length} калима`, `дар як модул такрор: ${dupes.slice(0, 6).map((d) => `${NAME[d[0].mid]} «${d[0].word}»×${d.length}`).join(', ')}`);
} else console.log('  ✅ такрори калима нест');

// ═══════════════════════════════════════════════════════════ C · ГРАММАТИКА
H('C · Грамматика');
const gts = await sql`
  SELECT g.id,g.title,g."titleTranslated" tt,g.explanation ex,l."moduleId" mid,l."order" lo
  FROM "GrammarTopic" g JOIN "Lesson" l ON l."grammarTopicId"=g.id
  WHERE l."moduleId"=ANY(${MIDS}) ORDER BY l."moduleId",l."order"`;
const ENG = /\bto be\b|\bam\/is\/are\b|\barticle\b|артикл|англисӣ\s+(забон|мисол)|дар\s+англисӣ/iu;
const GENDER_RU = /мужской|женский|средний/iu;
const GENDER_TJ = /муздаккар|муаннас|бетараф/iu;
for (const g of gts) {
  const zap = g.ex.includes('⚡');
  const i = g.ex.indexOf('⚡');
  const eng = ENG.test(g.ex);
  console.log(`\n  [${NAME[g.mid]} #${g.lo}] ${g.title} | ${g.tt}`);
  console.log(`      дарозӣ=${g.ex.length}  ⚡=${zap ? `ҲА (дар ${Math.round((100 * i) / g.ex.length)}%)` : 'НЕСТ'}  англисӣ=${eng ? 'ҲА' : 'не'}`);
  if (!zap) add('P1', 'C-NOZAP', `${NAME[g.mid]} #${g.lo} «${g.tt}»`, 'варақаи «⚡ Фарқ аз тоҷикӣ» НЕСТ');
  if (eng) add('P1', 'C-ENG', `${NAME[g.mid]} #${g.lo} «${g.tt}»`, `ишора ба АНГЛИСӢ: ${(g.ex.match(ENG) || [''])[0]}`);
  // Фоссили англисӣ дар УНВОН. Ҷудо санҷида мешавад, чунки унвон сутуни дигар
  // аст ва скани `explanation` онро НАМЕБИНАД — маҳз ҳамин ҷо «Was / Were»
  // пинҳон монда буд. `II`, `IV` ва ғ. рақами римӣ мебошанд, на англисӣ.
  const lat = g.tt.match(/[A-Za-z][A-Za-z'’]+/g)?.filter((x) => !/^[IVXLC]+$/.test(x));
  if (lat?.length) add('P0', 'C-ENGTITLE', `${NAME[g.mid]} #${g.lo}`, `унвони ТОҶИКӢ англисӣ аст: «${g.tt}» (русӣ: «${g.title}»)`);
  if (GENDER_RU.test(g.ex) && !GENDER_TJ.test(g.ex)) add('P1', 'C-GENDER', `${NAME[g.mid]} #${g.lo} «${g.tt}»`, 'истилоҳи ҷинси РУСӢ бе ҷуфти ТОҶИКӢ');
  if (/Ҷонишинҳои\s+фоилӣ/u.test(g.ex)) add('P2', 'C-FOSSIL', `${NAME[g.mid]} #${g.lo}`, 'фоссили «фоилӣ»');
}
if (gts.length === 0) console.log('  (мавзӯи грамматикӣ нест)');

const gex = await sql`
  SELECT ge.*,g."titleTranslated" gt,l."moduleId" mid,l."order" lo
  FROM "GrammarTopic" g JOIN "Lesson" l ON l."grammarTopicId"=g.id
  JOIN "GrammarExercise" ge ON ge."topicId"=g.id
  WHERE l."moduleId"=ANY(${MIDS}) ORDER BY l."moduleId",g."order",ge."order"`;
const gexNoExp = gex.filter((e) => !e.explanation || !e.explanation.trim());
console.log(`\n  Машқҳои грамматикӣ: ${gex.length} · тавзеҳ ${gex.length - gexNoExp.length}/${gex.length}`);
if (gexNoExp.length) add('P0', 'C-EXNOEXP', `${gexNoExp.length} машқ`, `бе тавзеҳ: ${gexNoExp.slice(0, 6).map((e) => `${NAME[e.mid]}#${e.lo} «${e.prompt.slice(0, 30)}»`).join(', ')}`);
// «ҷавоб ҳамеша якум»
const gexOpts = gex.filter((e) => e.options);
const distr = {};
for (const e of gexOpts) {
  const o = Array.isArray(e.options) ? e.options : JSON.parse(e.options);
  const i = o.indexOf(e.answer);
  if (i >= 0) distr[i] = (distr[i] || 0) + 1;
}
console.log(`  Тақсими ҷавоби дуруст (choose): ${JSON.stringify(distr)}`);
const tot = Object.values(distr).reduce((a, b) => a + b, 0);
if (tot > 6 && (distr[0] || 0) / tot > 0.55) add('P1', 'C-FIRST', 'GrammarExercise', `ҷавоб аксаран ЯКУМ (${distr[0]}/${tot})`);

const gexa = await sql`
  SELECT ge.*,l."moduleId" mid FROM "GrammarTopic" g JOIN "Lesson" l ON l."grammarTopicId"=g.id
  JOIN "GrammarExample" ge ON ge."topicId"=g.id WHERE l."moduleId"=ANY(${MIDS})`;
const gexaNoAudio = gexa.filter((e) => !e.audioUrl);
console.log(`  Мисолҳои грамматикӣ: ${gexa.length} · аудио ${gexa.length - gexaNoAudio.length}/${gexa.length}`);
if (gexaNoAudio.length) add('P1', 'C-EXAUDIO', `${gexaNoAudio.length} мисол`, `бе аудио: ${gexaNoAudio.slice(0, 5).map((e) => e.sentence).join(' | ')}`);

// ═══════════════════════════════════════════════════════════ D · ФАҲМИШ
H('D · Фаҳмиш (Comprehension)');
const cqs = await sql`
  SELECT q.id,q.question qq,q."questionTranslated" qt,q.options o,q."correctIndex" ci,q.explanation ex,
         ce."titleTranslated" ct,ce.passage p,ce.kind,ce."audioUrl" cau,l."moduleId" mid,l."order" lo,l."skillType" st
  FROM "ComprehensionExercise" ce JOIN "Lesson" l ON l."comprehensionId"=ce.id
  JOIN "ComprehensionQuestion" q ON q."exerciseId"=ce.id
  WHERE l."moduleId"=ANY(${MIDS}) ORDER BY l."moduleId",l."order",q."order"`;
const norm = (s) => (s || '').toLowerCase().replace(/[«»"'.,!?—–-]/g, ' ').replace(/\s+/g, ' ').trim();
function quotes(ex) {
  if (!/Матн/.test(ex)) return [];
  const out = [];
  for (const m of ex.matchAll(/(на\s*)?«([^»]+)»/g)) if (!m[1]) out.push(m[2]);
  const a = ex.match(/Матн:\s*([^.!?]+[.!?])/);
  if (a) out.push(a[1]);
  return out.filter((q) => /[а-яё]/i.test(q));
}
let blank = 0, lying = 0, badq = 0;
for (const q of cqs) {
  const opts = Array.isArray(q.o) ? q.o : JSON.parse(q.o);
  const correct = opts[q.ci];
  const where = `${NAME[q.mid]} #${q.lo} ${q.st} «${q.ct}»`;
  if (correct === undefined) { add('P0', 'D-BADIDX', where, `correctIndex=${q.ci} берун аз ${opts.length} вариант — «${q.qq}»`); continue; }
  if (!q.ex || !q.ex.trim()) { blank++; add('P0', 'D-NOEXP', where, `тавзеҳ НЕСТ — «${q.qq}»`); continue; }
  const ex = norm(q.ex);
  if (!ex.includes(norm(correct))) {
    const wrong = opts.filter((o, i) => i !== q.ci && norm(o).length > 4 && ex.includes(norm(o)));
    if (wrong.length) { lying++; add('P0', 'D-LYING', where, `тавзеҳ варианти ГАЛАТро номид (${JSON.stringify(wrong)}), ҷавоб «${correct}» — «${q.qq}»`); continue; }
  }
  if (q.p) {
    const bad = quotes(q.ex).filter((x) => !norm(q.p).includes(norm(x)));
    if (bad.length) { badq++; add('P1', 'D-BADQUOTE', where, `иқтибос дар матн нест: ${JSON.stringify(bad)}`); }
    // Тавзеҳ метавонад ҷавоби ДУРУСТро дошта бошад ва БОЗ ҲАМ матнро вайрон
    // кунад: «урок английского в десять» дар ҷои «урок русского в десять».
    // `D-LYING` инро НАМЕГИРАД, чунки он танҳо вақте кор мекунад, ки ҷавоби
    // дуруст номбар нашуда бошад.
    //
    // ⚠️ «ҳар порчаи кириллӣ бояд дар матн бошад» КОР НАМЕКУНАД: тоҷикӣ ҳам
    // кириллист, пас ҳар шарҳи тоҷикӣ («Сара зан аст») бардурӯғ дод мезад.
    // Аломати ВОҚЕӢ наздикшавӣ аст: порча бо ҶУМЛАИ матн 60–99% калима
    // мушторак дорад — яъне НУСХАи он аст, вале як калимаи мазмунӣ фарқ
    // мекунад. Шарҳи тоҷикӣ бо ҷумлаи русӣ қариб ҳеҷ калима мушторак надорад,
    // пас ба ин дом намеафтад.
    //
    // ⚠️ ИСТИСНО: саволи ТАРҶУМА. Он ба матн такя намекунад — тавзеҳаш ҷавоби
    // мустақил медиҳад («Сколько это стоит?»), ки метавонад тасодуфан бо
    // ҷумлаи матн («Сколько стоит этот хлеб?») калимаҳо мушторак дошта бошад.
    // Ин НУСХАБАРДОРИИ ғалат нест, пас чунин саволҳо аз санҷиш мебароянд.
    const isTranslation = /Переведите|Тарҷума|по-русски|ба русӣ|Как будет/i.test(q.qq + ' ' + (q.qt || ''));
    const sents = isTranslation ? [] : q.p.split(/[.!?]+/).map(norm).filter((s) => s.split(' ').length >= 3);
    for (const chunk of (q.ex.match(/[А-Яа-яЁё][А-Яа-яЁё\s]{10,}/g) || [])) {
      const cw = norm(chunk).split(' ').filter((w) => w.length > 2);
      if (cw.length < 3) continue;
      let best = 0, bestS = '';
      for (const s of sents) {
        const sw = new Set(s.split(' '));
        const hit = cw.filter((w) => sw.has(w)).length / cw.length;
        if (hit > best) { best = hit; bestS = s; }
      }
      if (best >= 0.6 && best < 1) {
        const sw = new Set(bestS.split(' '));
        add('P0', 'D-CONTRADICT', where,
          `тавзеҳ матнро НОДУРУСТ такрор мекунад: «${chunk.trim()}» ↔ матн: «${bestS}» (калимаи бегона: ${cw.filter((w) => !sw.has(w)).join(', ')})`);
        break;
      }
    }
  }
}
const exs = await sql`
  SELECT ce.id,ce."titleTranslated" ct,ce.kind,ce."audioUrl" au,l."moduleId" mid,l."order" lo
  FROM "ComprehensionExercise" ce JOIN "Lesson" l ON l."comprehensionId"=ce.id
  WHERE l."moduleId"=ANY(${MIDS}) ORDER BY l."moduleId",l."order"`;
console.log(`  Машқҳо: ${exs.length} · саволҳо: ${cqs.length}`);
console.log(`  Тавзеҳ: ${cqs.length - blank}/${cqs.length}  ·  дурӯғгӯ: ${lying}  ·  иқтибоси бад: ${badq}`);
for (const e of exs) {
  if (e.kind === 'listening' && !e.au) add('P0', 'D-NOAUDIO', `${NAME[e.mid]} #${e.lo}`, `машқи ШУНАВОӢ бе аудио: «${e.ct}»`);
}
const cnt = {};
for (const q of cqs) cnt[q.ci] = (cnt[q.ci] || 0) + 1;
console.log(`  Тақсими correctIndex: ${JSON.stringify(cnt)}`);
if (cqs.length > 8 && (cnt[0] || 0) / cqs.length > 0.55) add('P1', 'D-FIRST', 'ComprehensionQuestion', `ҷавоб аксаран ЯКУМ (${cnt[0]}/${cqs.length})`);

// ═══════════════════════════════════════════════════════════ E · ОҲАНГ
H('E · Оҳанг ва муколама');
const INF = /(^|[^а-яё])(ты|тебя|тебе|твой|твоя|твоё|твои)($|[^а-яё])/i;
const FORM_RU = /(^|[^а-яё])(вы|вас|вам|ваш|ваша|здравствуйте)($|[^а-яё])/i;
const FORM_TJ = /Шумо|шумо|ҳастед|доред|мекунед|кунед\b/;
const INF_TJ = /(^|[^а-яёӣӯқғҳҷ])[Тт]у($|[^а-яёӣӯқғҳҷa-z])|ҳастӣ|доришӣ|мекунӣ/u;

function checkPair(ru, tg, where, what) {
  if (INF.test(ru) && FORM_TJ.test(tg) && !INF_TJ.test(tg)) {
    add('P0', 'E-TUSHUMO', where, `русӣ БЕТАКАЛЛУФ, тоҷикӣ РАСМӢ — ${what}: «${ru}» → «${tg}»`);
    return true;
  }
  if (FORM_RU.test(ru) && !/здравствуйте/i.test(ru) && INF_TJ.test(tg) && !FORM_TJ.test(tg)) {
    add('P1', 'E-VYTU', where, `русӣ РАСМӢ, тоҷикӣ БЕТАКАЛЛУФ — ${what}: «${ru}» → «${tg}»`);
    return true;
  }
  return false;
}
let clash = 0;
for (const w of words) {
  if (checkPair(`${w.word} ${w.example || ''}`, `${w.translation} ${w.exampleTrans || ''}`, `${NAME[w.mid]} #${w.lo}`, `калимаи «${w.word}»`)) clash++;
}
for (const e of gexa) {
  if (checkPair(e.sentence, e.translation, `${NAME[e.mid]}`, 'мисоли грамматикӣ')) clash++;
}
const dls = await sql`
  SELECT dl.*,d."titleTranslated" dt,l."moduleId" mid,l."order" lo
  FROM "Dialogue" d JOIN "Lesson" l ON l."dialogueId"=d.id
  JOIN "DialogueLine" dl ON dl."dialogueId"=d.id
  WHERE l."moduleId"=ANY(${MIDS}) ORDER BY l."moduleId",l."order",dl."order"`;
for (const d of dls) {
  if (checkPair(d.text, d.translation, `${NAME[d.mid]} #${d.lo} сатри ${d.order}`, 'муколама')) clash++;
}
for (const q of cqs) {
  if (q.qt && checkPair(q.qq, q.qt, `${NAME[q.mid]} #${q.lo}`, 'саволи фаҳмиш')) clash++;
}
console.log(`  Ихтилофи «ты↔Шумо»: ${clash}`);

// Муколама: аудио, isUser, регистри дохилӣ
const dlgIds = [...new Set(dls.map((d) => d.dialogueId))];
console.log(`  Муколамаҳо: ${dlgIds.length}`);
for (const did of dlgIds) {
  const ls = dls.filter((d) => d.dialogueId === did).sort((a, b) => a.order - b.order);
  const w = `${NAME[ls[0].mid]} #${ls[0].lo} «${ls[0].dt}»`;
  const noAu = ls.filter((x) => !x.audioUrl).length;
  const users = ls.filter((x) => x.isUser).length;
  let alt = true;
  for (let i = 1; i < ls.length; i++) if (ls[i].isUser === ls[i - 1].isUser) alt = false;
  const all = ls.map((x) => x.text).join(' ');
  const mixed = FORM_RU.test(all) && INF.test(all);
  console.log(`    ${w}: ${ls.length} сатр · аудио ${ls.length - noAu}/${ls.length} · isUser ${users} · навбат ${alt ? 'ҳа' : 'НЕ'}${mixed ? ' · РЕГИСТРИ ОМЕХТА' : ''}`);
  if (noAu) add('P0', 'E-DLGAUDIO', w, `${noAu} сатри муколама бе аудио`);
  if (users === 0) add('P0', 'E-NOUSER', w, 'ягон сатри isUser=true нест — микрофон ҲЕҶ ГОҲ кушода намешавад');
  if (!alt) add('P1', 'E-NOALT', w, 'сатрҳои isUser навбатан нестанд');
  if (mixed) add('P1', 'E-REGISTER', w, 'дар ЯК муколама ҳам «Здравствуйте/вы», ҳам «ты»');
}

// ═══════════════════════════════════════════════════════════ ХУЛОСА
H('ХУЛОСА');
const bySev = { P0: [], P1: [], P2: [] };
for (const f of findings) bySev[f.sev].push(f);
for (const s of ['P0', 'P1', 'P2']) {
  console.log(`\n  ${s === 'P0' ? '🔴' : s === 'P1' ? '🟠' : '🟡'} ${s} — ${bySev[s].length}`);
  const byCode = {};
  for (const f of bySev[s]) (byCode[f.code] ||= []).push(f);
  for (const [code, fs] of Object.entries(byCode)) {
    console.log(`     [${code}] × ${fs.length}`);
    for (const f of fs.slice(0, 12)) console.log(`        · ${f.where} — ${f.msg}`);
    if (fs.length > 12) console.log(`        … боз ${fs.length - 12}`);
  }
}
console.log(`\n  ҲАМАГӢ: ${findings.length} (P0=${bySev.P0.length} P1=${bySev.P1.length} P2=${bySev.P2.length})\n`);
if (JSON_OUT) console.log(JSON.stringify(findings, null, 2));
