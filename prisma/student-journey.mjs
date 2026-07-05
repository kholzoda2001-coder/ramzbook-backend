// ── Симулятсияи пурраи сафари хонанда: тоҷик → англисӣ A1, аз сифр то охир ──
// Ҳар қадам аз API-и воқеии production (admin.ramz.tj) — айнан мисли барнома.
const BASE = 'https://admin.ramz.tj/api/mobile';
const has = (s) => typeof s === 'string' && s.trim().length > 0;
const issues = [];
const warn = (where, what) => issues.push({ where, what });

async function j(path) {
  const r = await fetch(BASE + path);
  if (!r.ok) throw new Error(`${path} → HTTP ${r.status}`);
  return r.json();
}

// ── ҚАДАМИ 1: Интихоби забонҳо (экрани onboarding) ──
console.log('══ ҚАДАМИ 1: Интихоби забон (модарӣ: тоҷикӣ, омӯзиш: англисӣ) ══');
const nativeRes = await j('/languages/native');
const natives = nativeRes.languages ?? nativeRes;
console.log(`Забонҳои модарӣ дар рӯйхат: ${natives.map(l=>l.code).join(', ')}`);
const tg = natives.find(l => l.code === 'tg');
if (!tg) { warn('onboarding', 'Забони тоҷикӣ (tg) дар рӯйхати модарӣ НЕСТ!'); process.exit(1); }
console.log(`✅ Интихоб: ${tg.nativeName ?? tg.name} ${tg.flag ?? ''}`);

const targetRes = await j(`/languages/target?nativeLanguageId=${tg.id}`);
const targets = targetRes.languages ?? targetRes;
console.log(`Забонҳои омӯзиш барои тоҷикзабон: ${targets.map(l=>`${l.code}(${l.courseCount} курс)`).join(', ')}`);
const en = targets.find(l => l.code === 'en');
if (!en) { warn('onboarding', 'Англисӣ дар рӯйхати омӯзиш НЕСТ!'); process.exit(1); }
console.log(`✅ Интихоб: ${en.name} ${en.flag ?? ''} — ${en.courseCount} курс`);

// ── ҚАДАМИ 2: Гирифтани курсҳо (роадмап) ──
console.log('\n══ ҚАДАМИ 2: Роадмапи курс (en→tg) ══');
const coursesRes = await j(`/courses?targetLanguageId=${en.id}&nativeLanguageId=${tg.id}`);
const courses = coursesRes.courses ?? coursesRes;
console.log(`Курсҳо: ${courses.map(c=>c.level).join(', ') || 'ҲЕҶ!'}`);
const a1 = courses.find(c => c.level === 'A1');
if (!a1) { console.error('Курси A1 нест!'); process.exit(1); }
console.log(`Курси A1: "${a1.title}" ${a1.emoji} — ${a1.modules.length} модул`);
for (const m of a1.modules) {
  console.log(`  М${m.order}: ${m.titleTranslated} ${m.emoji} — ${m.lessonCount} дарс${m.isPremium?' 🔒Premium':''}${m.isBoss?' 👑Boss':''}`);
}

// ── ҚАДАМИ 3: Хондани ҲАР дарс (плеери дарс) ──
console.log('\n══ ҚАДАМИ 3: Хондани ҳамаи дарсҳо як-як ══');
let totalLessons = 0, okLessons = 0;
let audioUrls = []; // for sampling later

for (const m of a1.modules) {
  for (let li = 0; li < m.lessons.length; li++) {
    const stub = m.lessons[li];
    totalLessons++;
    let L;
    try { L = await j(`/lessons/${stub.id}`); }
    catch (e) { warn(`M${m.order}/${stub.title}`, `Дарс кушода нашуд: ${e.message}`); continue; }
    const lesson = L.lesson ?? L;
    const comp = lesson.component;
    const wordCount = (lesson.words ?? []).length;
    const tagBase = `M${m.order} [${stub.order}] ${lesson.titleTranslated || lesson.title}`;
    const easyMode = li <= 1; // 2 дарси аввали модул — режими осон

    const skill = lesson.skillType;
    let verdict = [];

    if (skill === 'vocabulary') {
      if (wordCount === 0) { warn(tagBase, 'Дарси луғат бе калима!'); continue; }
      // ҳар калима — 7 майдон
      for (const w of lesson.words) {
        const missing = [];
        if (!has(w.translation)) missing.push('тарҷума');
        if (!has(w.ipa)) missing.push('IPA');
        if (!has(w.ipaTajik)) missing.push('талаффузи тоҷикӣ');
        if (!has(w.emoji)) missing.push('эмоҷи');
        if (!has(w.example)) missing.push('ҷумлаи мисол');
        if (!has(w.exampleTrans)) missing.push('тарҷумаи мисол');
        if (missing.length) warn(tagBase, `«${w.word}»: ${missing.join(', ')} нест`);
        if (has(w.audioUrl)) audioUrls.push(w.audioUrl);
      }
      // машқи интихоб (choose) дистрактор мехоҳад: ≥4 калима бо асосҳои гуногуни тоҷикӣ
      const base = (s) => (s||'').replace(/\s*\(.*?\)\s*/g,'').trim().toLowerCase();
      const bases = new Set(lesson.words.map(w=>base(w.translation)));
      if (bases.size < 4) warn(tagBase, `Танҳо ${bases.size} тарҷумаи гуногун — барои дистракторҳои choose камӣ мекунад`);
      // cloze/build: ҷумлаи ≥3 калима лозим — чанд калима имкони машқи истеҳсол дорад?
      const prodOk = lesson.words.filter(w => has(w.example) && w.example.trim().split(/\s+/).length >= 3).length;
      if (prodOk === 0) warn(tagBase, 'Ягон калима ҷумлаи ≥3-калимагӣ надорад (cloze/build ғайриимкон, fallback → type)');
      verdict.push(`${wordCount} калима`);
      if (easyMode) verdict.push('осон(тап)');
    }

    if (skill === 'grammar') {
      if (!comp || comp.type !== 'grammar') { warn(tagBase, 'Компоненти грамматика пайваст НЕСТ!'); continue; }
      if (!has(comp.explanation)) warn(tagBase, 'Тавзеҳи грамматика холӣ');
      if ((comp.exercises??[]).length === 0) warn(tagBase, 'Машқи грамматика НЕСТ');
      for (const ex of comp.exercises) {
        if (!has(ex.answer)) warn(tagBase, `Машқи ${ex.type}: ҷавоб холӣ`);
        if (ex.type === 'choose' && (!Array.isArray(ex.options) || !ex.options.includes(ex.answer)))
          warn(tagBase, `Машқи choose: ҷавоб «${ex.answer}» дар опсияҳо нест`);
        if (ex.type === 'reorder') {
          // плиткаҳо омехта дода мешаванд — муқоисаи multiset (калимаҳо новобаста аз тартиб)
          const norm = (s)=>s.toLowerCase().replace(/[.,!?';:’]/g,'').replace(/\s+/g,' ').trim();
          const a = norm(ex.answer).split(' ').sort().join('|');
          const b = (ex.options??[]).map(norm).join(' ').split(' ').filter(Boolean).sort().join('|');
          if (a !== b)
            warn(tagBase, `Машқи reorder: калимаҳо ҷумлаи ҷавобро намесозанд («${ex.answer}» ≠ «${(ex.options??[]).join(' ')}»)`);
        }
      }
      for (const e of (comp.examples??[])) if (has(e.audioUrl)) audioUrls.push(e.audioUrl);
      verdict.push(`${(comp.exercises??[]).length} машқ, ${(comp.examples??[]).length} мисол`);
    }

    if (skill === 'speaking') {
      if (!comp || comp.type !== 'dialogue') { warn(tagBase, 'Муколама пайваст НЕСТ!'); continue; }
      const lines = comp.lines ?? [];
      if (lines.length < 2) warn(tagBase, 'Муколама аз 2 сатр кам');
      if (!lines.some(l => l.isUser)) warn(tagBase, 'Ягон сатри корбар (isUser) нест — хонанда гап намезанад!');
      for (const l of lines) { if (!has(l.translation)) warn(tagBase, `Сатри «${(l.text||'').slice(0,25)}»: тарҷума нест`); if (has(l.audioUrl)) audioUrls.push(l.audioUrl); }
      verdict.push(`${lines.length} сатр`);
    }

    if (skill === 'listening' || skill === 'reading' || skill === 'review' || skill === 'test') {
      if (!comp || comp.type !== 'comprehension') { warn(tagBase, `Дарси ${skill} компоненти comprehension НАДОРАД!`); continue; }
      if (!has(comp.passage)) warn(tagBase, 'Матн (passage) холӣ');
      if (!has(comp.passageTranslated)) warn(tagBase, 'Тарҷумаи матн нест');
      const qs = comp.questions ?? [];
      if (qs.length === 0) warn(tagBase, 'Савол НЕСТ');
      for (const q of qs) {
        const opts = Array.isArray(q.options) ? q.options : [];
        if (opts.length < 2) warn(tagBase, `Савол «${(q.question||'').slice(0,30)}»: аз 2 опсия кам`);
        if (q.correctIndex == null || q.correctIndex < 0 || q.correctIndex >= opts.length)
          warn(tagBase, `Савол «${(q.question||'').slice(0,30)}»: correctIndex берун аз ҳудуд`);
      }
      if (skill === 'test') {
        // дарвозаи 80%: бо n савол, чанд хато ҷоиз аст?
        const n = qs.length; const allowedWrong = Math.floor(n - 0.8*n);
        verdict.push(`имтиҳон: ${n} савол, хатои ҷоиз=${allowedWrong}${allowedWrong===0?' ⚠️(бояд 100% занад!)':''}`);
        if (allowedWrong === 0) warn(tagBase, `Имтиҳон ${n} савол дорад — барои гузаштан аз 80% бояд ҲАМАро дуруст занад (4/5 = 80% мешуд)`);
      } else verdict.push(`${qs.length} савол`);
      if (has(comp.audioUrl)) audioUrls.push(comp.audioUrl);
      else if (skill === 'listening') verdict.push('аудио: device-TTS');
    }

    if (skill === 'writing') {
      if (wordCount === 0 && !comp) warn(tagBase, 'Дарси навиштан ҳам калима ҳам компонент надорад');
      else verdict.push(`${wordCount} калима барои навиштан`);
    }

    okLessons++;
    console.log(`  ✅ ${tagBase} — ${skill}${verdict.length? ' ('+verdict.join(', ')+')':''}`);
  }
}

// ── ҚАДАМИ 4: Санҷиши аудио (интихобан 15 URL) ──
console.log('\n══ ҚАДАМИ 4: Санҷиши аудио (намунаи тасодуфӣ) ══');
const sample = audioUrls.sort(() => Math.random() - 0.5).slice(0, 15);
let audioOk = 0, audioFail = 0;
for (const u of sample) {
  try {
    const r = await fetch(u, { method: 'HEAD' });
    if (r.ok) audioOk++;
    else { audioFail++; warn('audio', `${r.status} → ${u.slice(-50)}`); }
  } catch (e) { audioFail++; warn('audio', `${e.message} → ${u.slice(-50)}`); }
}
console.log(`Аз ${sample.length} URL-и санҷидашуда: ${audioOk} ✅ / ${audioFail} ❌  (ҳамагӣ URL дар курс: ${audioUrls.length})`);

// ── ҲИСОБОТ ──
console.log('\n════════ ҲИСОБОТИ ХОНАНДА ════════');
console.log(`Дарсҳои кушодашуда: ${okLessons}/${totalLessons}`);
console.log(`Мушкилот ёфтшуда: ${issues.length}`);
const grouped = {};
for (const i of issues) { (grouped[i.where] ??= []).push(i.what); }
for (const [where, whats] of Object.entries(grouped)) {
  console.log(`\n⚠️ ${where}:`);
  for (const w of whats) console.log(`   - ${w}`);
}
if (!issues.length) console.log('🎉 ҲЕҶ мушкилот нест!');
