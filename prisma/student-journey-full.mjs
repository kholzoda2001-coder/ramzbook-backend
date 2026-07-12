// ── Симулятсияи ПУРРАИ сафари хонанда: тоҷик → англисӣ, A1 + A2, аз алифбо то дарси охирин ──
// Ҳар қадам аз API-и воқеии production (admin.ramz.tj) — айнан мисли барнома.
// 3 нигоҳи тестер: (1) навомӯзи мутлақ, (2) хонандаи ботаҷриба (A2 бояд сахттар), (3) бесабр (шавқоварӣ).
const BASE = 'https://admin.ramz.tj/api/mobile';
const has = (s) => typeof s === 'string' && s.trim().length > 0;
const issues = [];
const warn = (where, what) => issues.push({ where, what });
const stats = { A1: {}, A2: {} };
async function j(path) {
  const r = await fetch(BASE + path);
  if (!r.ok) throw new Error(`${path} → HTTP ${r.status}`);
  return r.json();
}

// ══ ҚАДАМИ 0: Onboarding — интихоби забон ══
console.log('══ ҚАДАМИ 0: Onboarding (модарӣ: тоҷикӣ → омӯзиш: англисӣ) ══');
const natives = (await j('/languages/native')).languages;
const tg = natives.find(l => l.code === 'tg');
if (!tg) { console.error('тоҷикӣ нест!'); process.exit(1); }
const targets = (await j(`/languages/target?nativeLanguageId=${tg.id}`)).languages;
const en = targets.find(l => l.code === 'en');
if (!en) { console.error('англисӣ нест!'); process.exit(1); }
console.log(`✅ tg → en (${en.courseCount} курс)`);

// ══ ҚАДАМИ 1: АЛИФБО (аввалин қадами навомӯзи мутлақ) ══
console.log('\n══ ҚАДАМИ 1: Алифбо (навомӯзи мутлақ аз ин ҷо сар мекунад) ══');
try {
  const alpha = await j(`/alphabet?targetLanguageId=${en.id}&nativeLanguageId=${tg.id}`);
  const letters = alpha.letters ?? alpha;
  if (!Array.isArray(letters) || letters.length === 0) warn('алифбо', 'Алифбои англисӣ ХОЛӢ — навомӯз аз куҷо сар кунад?');
  else {
    let noTaj = 0, noAudio = 0;
    for (const l of letters) { if (!has(l.tajikTranscription)) noTaj++; if (!has(l.audioUrl)) noAudio++; }
    console.log(`✅ ${letters.length} ҳарф | бе талаффузи тоҷикӣ: ${noTaj} | бе аудио: ${noAudio}`);
    if (noTaj > 0) warn('алифбо', `${noTaj} ҳарф талаффузи тоҷикӣ надорад`);
  }
} catch (e) { warn('алифбо', `API хато: ${e.message}`); }

// ══ ҚАДАМИ 2: Роадмап — ҳарду курс ══
console.log('\n══ ҚАДАМИ 2: Роадмап (A1 + A2) ══');
const courses = (await j(`/courses?targetLanguageId=${en.id}&nativeLanguageId=${tg.id}`)).courses
  ?? (await j(`/courses?targetLanguageId=${en.id}&nativeLanguageId=${tg.id}`));
for (const c of courses) console.log(`  ${c.level}: "${c.title}" — ${c.modules.length} модул`);
const audioUrls = [];

// ── Санҷандаи як курс ──
async function walkCourse(course, level) {
  console.log(`\n══════ ${level}: ҳар дарс як-як (мисли хонанда) ══════`);
  const S = stats[level];
  S.modules = course.modules.length; S.lessons = 0; S.ok = 0;
  S.skills = {}; S.words = 0; S.clozeReady = 0; S.clozeFallback = 0;
  S.grammarEx = 0; S.dialogueLines = 0; S.passageWords = []; S.examGate = [];

  // тартиби модулҳо бояд бефосила бошад (0,1,2,...)
  const orders = course.modules.map(m => m.order).sort((a,b)=>a-b);
  for (let i = 0; i < orders.length; i++) if (orders[i] !== i) { warn(`${level} роадмап`, `Тартиби модулҳо шикаста: интизор ${i}, ҳаст ${orders[i]} — модул афтида ё order ғалат!`); break; }

  for (const m of course.modules) {
    for (let li = 0; li < m.lessons.length; li++) {
      const stub = m.lessons[li];
      S.lessons++;
      let L;
      try { L = await j(`/lessons/${stub.id}`); }
      catch (e) { warn(`${level} M${m.order}/${stub.title}`, `Дарс кушода нашуд: ${e.message}`); continue; }
      const lesson = L.lesson ?? L;
      const comp = lesson.component;
      const words = lesson.words ?? [];
      const tag = `${level} M${m.order}[${stub.order}] ${lesson.titleTranslated || lesson.title}`;
      const skill = lesson.skillType;
      S.skills[skill] = (S.skills[skill] || 0) + 1;

      if (skill === 'vocabulary') {
        if (words.length === 0) { warn(tag, 'Дарси луғат бе калима!'); continue; }
        S.words += words.length;
        for (const w of words) {
          const missing = [];
          if (!has(w.translation)) missing.push('тарҷума');
          if (!has(w.ipa)) missing.push('IPA');
          if (!has(w.ipaTajik)) missing.push('талаффузи тоҷикӣ');
          if (!has(w.emoji)) missing.push('эмоҷи');
          if (!has(w.example)) missing.push('мисол');
          if (!has(w.exampleTrans)) missing.push('тарҷумаи мисол');
          if (missing.length) warn(tag, `«${w.word}»: ${missing.join(', ')} нест`);
          if (has(w.audioUrl)) audioUrls.push(w.audioUrl);
          // cloze-check: калима айнан дар мисол ҳаст? (fix-и қаблӣ: cloze танҳо агар wordInExample)
          if (has(w.example)) {
            const inEx = w.example.toLowerCase().includes(w.word.toLowerCase());
            if (inEx) S.clozeReady++; else S.clozeFallback++;
          }
          // мисол бояд ҷумлаи воқеӣ бошад (>=3 калима) — вагарна машқи build/cloze намешавад
          if (has(w.example) && w.example.trim().split(/\s+/).length < 3) warn(tag, `«${w.word}»: мисоли хеле кӯтоҳ (<3 калима)`);
        }
        // дистракторҳо
        const base = (s) => (s||'').replace(/\s*\(.*?\)\s*/g,'').trim().toLowerCase();
        if (new Set(words.map(w=>base(w.translation))).size < 4) warn(tag, 'Барои дистракторҳои choose <4 тарҷумаи гуногун');
      }

      if (skill === 'grammar') {
        if (!comp || comp.type !== 'grammar') { warn(tag, 'Компоненти грамматика пайваст НЕСТ!'); continue; }
        if (!has(comp.explanation)) warn(tag, 'Тавзеҳ холӣ');
        const exs = comp.exercises ?? [];
        S.grammarEx += exs.length;
        if (exs.length === 0) warn(tag, 'Машқ НЕСТ');
        const types = new Set(exs.map(e=>e.type));
        if (exs.length >= 6 && types.size < 3) warn(tag, `Машқҳо якранг (${[...types].join(',')}) — шавқоварӣ паст`);
        for (const ex of exs) {
          if (!has(ex.answer)) warn(tag, `Машқи ${ex.type}: ҷавоб холӣ`);
          if (ex.type === 'choose') {
            if (!Array.isArray(ex.options) || !ex.options.includes(ex.answer)) warn(tag, `choose: ҷавоб «${ex.answer}» дар опсияҳо нест`);
            else if (new Set(ex.options).size !== ex.options.length) warn(tag, `choose: опсияҳои такрорӣ (${ex.options.join('/')})`);
          }
          if (ex.type === 'reorder') {
            const norm = (s)=>s.toLowerCase().replace(/[.,!?';:’]/g,'').replace(/\s+/g,' ').trim();
            const a = norm(ex.answer).split(' ').sort().join('|');
            const b = (ex.options??[]).map(norm).join(' ').split(' ').filter(Boolean).sort().join('|');
            if (a !== b) warn(tag, `reorder: плиткаҳо ҷавобро намесозанд («${ex.answer}»)`);
          }
        }
        for (const e of (comp.examples??[])) if (has(e.audioUrl)) audioUrls.push(e.audioUrl);
      }

      if (skill === 'speaking') {
        if (!comp || comp.type !== 'dialogue') { warn(tag, 'Муколама пайваст НЕСТ!'); continue; }
        const lines = comp.lines ?? [];
        S.dialogueLines += lines.length;
        if (lines.length < 4) warn(tag, `Муколамаи кӯтоҳ (${lines.length} сатр)`);
        if (!lines.some(l => l.isUser)) warn(tag, 'Ягон сатри isUser нест — хонанда гап намезанад!');
        for (const l of lines) { if (!has(l.translation)) warn(tag, `Сатр «${(l.text||'').slice(0,25)}»: тарҷума нест`); if (has(l.audioUrl)) audioUrls.push(l.audioUrl); }
      }

      if (['listening','reading','review','test'].includes(skill)) {
        if (!comp || comp.type !== 'comprehension') { warn(tag, `${skill}: комп. comprehension НАДОРАД!`); continue; }
        if (!has(comp.passage)) warn(tag, 'Матн холӣ');
        if (!has(comp.passageTranslated)) warn(tag, 'Тарҷумаи матн нест');
        const pw = (comp.passage||'').trim().split(/\s+/).length;
        S.passageWords.push(pw);
        const qs = comp.questions ?? [];
        if (qs.length === 0) warn(tag, 'Савол НЕСТ');
        for (const q of qs) {
          const opts = Array.isArray(q.options) ? q.options : [];
          if (opts.length < 2) warn(tag, `Савол «${(q.question||'').slice(0,30)}»: <2 опсия`);
          if (q.correctIndex == null || q.correctIndex < 0 || q.correctIndex >= opts.length) warn(tag, `Савол «${(q.question||'').slice(0,30)}»: correctIndex берун`);
        }
        // ҷолибӣ: ҳамаи ҷавобҳо дар як ҷой (мас. ҳамеша индекси 0)? — хонанда бе хондан ҳам мегузарад
        if (qs.length >= 4 && new Set(qs.map(q=>q.correctIndex)).size === 1)
          warn(tag, `Ҳамаи ${qs.length} ҷавоби дуруст дар ҳамон индекси ${qs[0].correctIndex} — хонанда намунаро пай мебарад!`);
        if (skill === 'test') {
          const n = qs.length; const allowedWrong = Math.floor(n - 0.8*n);
          S.examGate.push({ n, allowedWrong });
          if (allowedWrong === 0 && n < 5) warn(tag, `Имтиҳони ${n}-саволӣ бо дарвозаи 80% = бояд 100% занад`);
        }
        if (has(comp.audioUrl)) audioUrls.push(comp.audioUrl);
      }

      if (skill === 'writing') {
        if (words.length === 0) warn(tag, 'Дарси навиштан бе калима!');
        else for (const w of words) { if (!has(w.translation)) warn(tag, `writing «${w.word}»: тарҷума нест`); }
      }

      S.ok++;
    }
  }
  console.log(`${level}: ${S.ok}/${S.lessons} дарс солим хонда шуд.`);
}

const a1 = courses.find(c => c.level === 'A1');
const a2 = courses.find(c => c.level === 'A2');
if (a1) await walkCourse(a1, 'A1'); else warn('роадмап', 'A1 НЕСТ');
if (a2) await walkCourse(a2, 'A2'); else warn('роадмап', 'A2 НЕСТ');

// ══ ҚАДАМИ 4: A2 бояд аз A1 САХТТАР бошад (нигоҳи хонандаи ботаҷриба) ══
console.log('\n══ ҚАДАМИ 4: Муқоисаи душворӣ A1 ↔ A2 ══');
const avg = (a) => a.length ? Math.round(a.reduce((x,y)=>x+y,0)/a.length) : 0;
const p1 = avg(stats.A1.passageWords||[]), p2 = avg(stats.A2.passageWords||[]);
console.log(`Дарозии миёнаи матн: A1=${p1} калима, A2=${p2} калима ${p2>p1?'✅ A2 дарозтар':'⚠️'}`);
if (p2 <= p1) warn('душворӣ', `Матнҳои A2 (${p2}) аз A1 (${p1}) дарозтар НЕСТАНД`);
console.log(`Луғат: A1=${stats.A1.words}, A2=${stats.A2.words}`);
console.log(`Машқи грамматика: A1=${stats.A1.grammarEx}, A2=${stats.A2.grammarEx}`);
console.log(`Сатрҳои муколама: A1=${stats.A1.dialogueLines}, A2=${stats.A2.dialogueLines}`);
console.log(`Cloze омода (калима дар мисол): A1=${stats.A1.clozeReady}/${stats.A1.clozeReady+stats.A1.clozeFallback}, A2=${stats.A2.clozeReady}/${stats.A2.clozeReady+stats.A2.clozeFallback}`);

// ══ ҚАДАМИ 5: Пуррагии малакаҳо дар ҳар сатҳ ══
console.log('\n══ ҚАДАМИ 5: Пӯшиши малакаҳо (CEFR) ══');
for (const lv of ['A1','A2']) {
  const sk = stats[lv].skills || {};
  console.log(`${lv}: ${Object.entries(sk).map(([k,v])=>`${k}=${v}`).join(', ')}`);
  for (const need of ['vocabulary','grammar','listening','speaking','reading','writing','test'])
    if (!sk[need]) warn(`${lv} малакаҳо`, `${need} тамоман НЕСТ!`);
}

// ══ ҚАДАМИ 6: Аудио (намунаи 20 URL) ══
console.log('\n══ ҚАДАМИ 6: Аудио (намунаи тасодуфӣ) ══');
const sample = audioUrls.sort(() => Math.random() - 0.5).slice(0, 20);
let audioOk = 0, audioFail = 0;
for (const u of sample) {
  try { const r = await fetch(u, { method: 'HEAD' }); if (r.ok) audioOk++; else { audioFail++; warn('audio', `${r.status} → …${u.slice(-45)}`); } }
  catch (e) { audioFail++; warn('audio', `${e.message} → …${u.slice(-45)}`); }
}
console.log(`${audioOk}✅/${audioFail}❌ аз ${sample.length} (ҳамагӣ URL: ${audioUrls.length})`);

// ══ ҲИСОБОТ ══
console.log('\n════════ ҲИСОБОТИ ТЕСТЕР ════════');
console.log(`Мушкилот: ${issues.length}`);
const grouped = {};
for (const i of issues) (grouped[i.where] ??= []).push(i.what);
for (const [where, whats] of Object.entries(grouped)) {
  console.log(`\n⚠️ ${where}:`);
  for (const w of [...new Set(whats)]) console.log(`   - ${w}`);
}
if (!issues.length) console.log('🎉 ҲЕҶ мушкилот нест!');
