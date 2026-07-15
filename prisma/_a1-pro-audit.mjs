// Аудити КАСБИИ A1: контент + маълумоти UX + симулятсияи муҳаррики машқ + суръат.
const BASE = 'https://admin.ramz.tj/api/mobile';
const has = (s) => typeof s === 'string' && s.trim().length > 0;
const wc = (s) => (s || '').trim().split(/\s+/).filter(Boolean).length;
const j = async (p) => { const t0 = Date.now(); const r = await fetch(BASE + p); const ms = Date.now() - t0; if (!r.ok) throw new Error(p + ' ' + r.status); const data = await r.json(); return { data, ms, bytes: +(r.headers.get('content-length') || 0) }; };
const norm = (s) => (s || '').toLowerCase().replace(/[.,!?';:’"]/g, '').replace(/\s+/g, ' ').trim();
const base = (s) => (s || '').replace(/\s*\(.*?\)\s*/g, '').trim().toLowerCase();

const issues = { critical: [], major: [], minor: [] };
const C = (t) => issues.critical.push(t), M = (t) => issues.major.push(t), m = (t) => issues.minor.push(t);
const perf = { lessonMs: [], lessonBytes: [] };

// ── 0. Роадмап ──
const nat = (await j('/languages/native')).data.languages; const tg = nat.find(l => l.code === 'tg');
const tgt = (await j('/languages/target?nativeLanguageId=' + tg.id)).data.languages; const en = tgt.find(l => l.code === 'en');
const cr = await j(`/courses?targetLanguageId=${en.id}&nativeLanguageId=${tg.id}`);
const a1 = cr.data.courses.find(c => c.level === 'A1');
console.log(`Роадмап: ${cr.ms}ms, ${(JSON.stringify(cr.data).length / 1024).toFixed(0)}KB | A1: ${a1.modules.length} модул`);

// module order + lesson order
const mOrders = a1.modules.map(x => x.order).sort((a, b) => a - b);
for (let i = 0; i < mOrders.length; i++) if (mOrders[i] !== i) { C(`Тартиби модул шикаста: интизор ${i}, ҳаст ${mOrders[i]}`); break; }

const stats = { lessons: 0, words: 0, uniq: new Set(), skills: {}, audioUrls: [], emojiDupPick: 0, keycap2: [], sameTranslPair: 0 };
const engine = { listen: 0, tapWord: 0, pick: 0, spell: 0, type: 0, build: 0, cloze: 0, dictate: 0, speak: 0, choose: 0, match: 0 };
const allWordTexts = new Map(); // word → count (duplicates across lessons)

// _isPicturable rough check needs partOfSpeech + emoji uniqueness in-lesson
const kPickBlocked = new Set(['📅', '🎂', '🎉', '🌆', '🏙️', '🏙', '📆', '🗓️']); // subset heuristic

for (const mod of a1.modules) {
  const lOrders = mod.lessons.map(x => x.order).sort((a, b) => a - b);
  for (let i = 0; i < lOrders.length; i++) if (lOrders[i] !== i) { M(`M${mod.order} тартиби дарс шикаста (интизор ${i}, ҳаст ${lOrders[i]})`); break; }

  for (const stub of mod.lessons) {
    stats.lessons++;
    let L;
    try { L = await j(`/lessons/${stub.id}`); } catch (e) { C(`M${mod.order} «${stub.title}» кушода нашуд`); continue; }
    perf.lessonMs.push(L.ms); perf.lessonBytes.push(JSON.stringify(L.data).length);
    const l = L.data.lesson || L.data; const comp = l.component; const words = l.words || [];
    const tag = `M${mod.order} «${l.titleTranslated || l.title}»`;
    const skill = l.skillType; stats.skills[skill] = (stats.skills[skill] || 0) + 1;

    if (skill === 'vocabulary' || skill === 'vocab') {
      if (!words.length) { C(`${tag}: луғат бе калима`); continue; }
      stats.words += words.length;
      const emojiCount = {};
      const translSet = new Set();
      for (const w of words) {
        stats.uniq.add(norm(w.word));
        allWordTexts.set(norm(w.word), (allWordTexts.get(norm(w.word)) || 0) + 1);
        const missing = [];
        if (!has(w.translation)) missing.push('тарҷума');
        if (!has(w.ipa)) missing.push('IPA');
        if (!has(w.ipaTajik)) missing.push('талаффузи тоҷикӣ');
        if (!has(w.emoji)) missing.push('эмоҷи');
        if (!has(w.example)) missing.push('мисол');
        if (!has(w.exampleTrans)) missing.push('тарҷумаи мисол');
        if (missing.length) M(`${tag} «${w.word}»: ${missing.join(', ')} НЕСТ`);
        if (!has(w.audioUrl)) M(`${tag} «${w.word}»: аудио нест`);
        else stats.audioUrls.push(w.audioUrl);
        if (has(w.example) && wc(w.example) < 3) m(`${tag} «${w.word}»: мисоли <3 калима`);
        translSet.add(base(w.translation));
        const ek = (w.emoji || '').replace(/️/g, '');
        emojiCount[ek] = (emojiCount[ek] || 0) + 1;
        if (/⃣.*⃣/.test(w.emoji || '')) stats.keycap2.push(`${tag} ${w.word}=${w.emoji}`);

        // engine simulation (A1, non-easy): recognition rotate 3 (listen/pick-or-tap/tap), production rotate 5
        // production: 0/type-or-spell 1/build 2/cloze 3/dictate 4/speak
        const tw = (w.word || '').trim();
        const spellable = tw.length >= 2 && tw.length <= 12 && /^[A-Za-z]+$/.test(tw);
        const correct = (w.example || '').trim().split(/\s+/).filter(Boolean);
        const inEx = correct.map(t => t.replace(/[^\w'-]/g, '').toLowerCase()).includes(tw.toLowerCase());
        const canCloze = tw && !tw.includes(' ') && correct.length >= 3 && inEx;
        const canBuild = correct.length >= 3 && correct.length <= 8 && has(w.exampleTrans);
        const i = words.indexOf(w);
        switch (i % 3) { case 0: engine.listen++; break; case 1: engine.pick++; break; default: engine.tapWord++; }
        switch (i % 5) {
          case 1: canBuild ? engine.build++ : (spellable ? engine.spell++ : engine.type++); break;
          case 2: canCloze ? engine.cloze++ : (spellable ? engine.spell++ : engine.type++); break;
          case 3: has(w.audioUrl) ? engine.dictate++ : (spellable ? engine.spell++ : engine.type++); break;
          case 4: engine.speak++; break;
          default: spellable ? engine.spell++ : engine.type++;
        }
      }
      engine.match += Math.ceil(words.length / 5);
      if (translSet.size < 4 && words.length >= 4) M(`${tag}: <4 тарҷумаи гуногун (дистрактор суст)`);
      // synonyms with identical base translation in one lesson → match/distractor risk (handled by code, but flag >2)
      const counts = {}; for (const w of words) counts[base(w.translation)] = (counts[base(w.translation)] || 0) + 1;
      for (const [k, v] of Object.entries(counts)) if (v > 2) m(`${tag}: ${v} калима бо тарҷумаи якхела «${k}»`);
    }
    else if (skill === 'grammar') {
      if (!comp || comp.type !== 'grammar') { C(`${tag}: грамматика напайваст!`); continue; }
      if (!has(comp.explanation)) M(`${tag}: тавзеҳ холӣ`);
      const exs = comp.exercises || [];
      if (exs.length < 5) M(`${tag}: танҳо ${exs.length} машқ`);
      for (const ex of exs) {
        if (!has(ex.answer)) M(`${tag} [${ex.type}]: ҷавоб холӣ`);
        if (ex.type === 'choose' && (!Array.isArray(ex.options) || !ex.options.includes(ex.answer))) M(`${tag} choose: ҷавоб дар опсияҳо нест`);
        if (ex.type === 'choose' && Array.isArray(ex.options) && new Set(ex.options).size !== ex.options.length) m(`${tag} choose: опсияи такрорӣ`);
        if (ex.type === 'reorder') {
          const a = norm(ex.answer).split(' ').sort().join('|');
          const b = (ex.options ?? []).map(norm).join(' ').split(' ').filter(Boolean).sort().join('|');
          if (a !== b) C(`${tag} reorder: плиткаҳо ҷавобро НАМЕСОЗАНД («${ex.answer}»)`);
        }
        if (ex.type === 'error_correction') {
          const a = wc(ex.prompt), b = wc(ex.answer);
          if (a !== b) C(`${tag} error_correction: калима нобаробар (${a}≠${b})`);
        }
      }
      for (const e of (comp.examples || [])) { if (has(e.audioUrl)) stats.audioUrls.push(e.audioUrl); else m(`${tag}: мисоли грамматикӣ бе аудио`); }
    }
    else if (skill === 'speaking') {
      if (!comp || comp.type !== 'dialogue') { C(`${tag}: муколама напайваст`); continue; }
      const lines = comp.lines || [];
      if (lines.length < 4) M(`${tag}: муколамаи кӯтоҳ (${lines.length})`);
      if (!lines.some(x => x.isUser)) C(`${tag}: ягон сатри isUser нест — хонанда гап намезанад`);
      for (const x of lines) { if (!has(x.translation)) M(`${tag}: сатр бе тарҷума`); if (has(x.audioUrl)) stats.audioUrls.push(x.audioUrl); else m(`${tag}: сатри муколама бе аудио`); }
    }
    else if (['listening', 'reading', 'review', 'test'].includes(skill)) {
      if (!comp || comp.type !== 'comprehension') { C(`${tag}: comprehension напайваст`); continue; }
      if (!has(comp.passage)) C(`${tag}: матн холӣ`);
      if (!has(comp.passageTranslated)) M(`${tag}: тарҷумаи матн нест`);
      const qs = comp.questions || [];
      if (!qs.length) C(`${tag}: савол нест`);
      for (const q of qs) {
        const opts = Array.isArray(q.options) ? q.options : [];
        if (opts.length < 2) M(`${tag}: савол <2 опсия`);
        if (q.correctIndex == null || q.correctIndex < 0 || q.correctIndex >= opts.length) C(`${tag}: correctIndex берун`);
        if (!has(q.questionTranslated)) m(`${tag}: савол бе тарҷума`);
      }
      if (qs.length >= 4 && new Set(qs.map(q => q.correctIndex)).size === 1) M(`${tag}: ҳамаи ҷавобҳо дар як мавқеъ`);
      if (skill === 'test') { const n = qs.length; if (Math.floor(n - 0.8 * n) === 0 && n < 5) M(`${tag}: имтиҳони ${n}-саволӣ = 100% лозим`); }
      if (skill === 'listening' && !has(comp.audioUrl)) M(`${tag}: шунавоӣ бе аудиои студиявӣ`);
      if (has(comp.audioUrl)) stats.audioUrls.push(comp.audioUrl);
    }
    else if (skill === 'writing') { if (!words.length) C(`${tag}: навиштан бе калима`); }
    else m(`${tag}: skillType номаълум ${skill}`);
  }
}

// duplicates across course
const dups = [...allWordTexts.entries()].filter(([, v]) => v > 1);
if (dups.length) m(`Калимаҳои такрорӣ дар курс: ${dups.length} (${dups.slice(0, 8).map(([k, v]) => `${k}×${v}`).join(', ')}…)`);

// ── Аудио CDN sampling (25 файл, суръат + дастрасӣ) ──
const uniqA = [...new Set(stats.audioUrls)];
const sample = uniqA.sort(() => Math.random() - 0.5).slice(0, 25);
let aOk = 0, aFail = 0; const aMs = [];
for (const u of sample) {
  const t0 = Date.now();
  try { const r = await fetch(u, { method: 'HEAD' }); (r.ok ? aOk++ : aFail++); aMs.push(Date.now() - t0); } catch { aFail++; }
}

const avg = (a) => a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : 0;
const p95 = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length * 0.95)] || 0; };

console.log('\n════════ НАТИҶАИ АУДИТ ════════');
console.log(`Дарсҳо: ${stats.lessons} | Калима: ${stats.words} (${stats.uniq.size} ягона) | Малакаҳо:`, Object.entries(stats.skills).map(([k, v]) => `${k}=${v}`).join(' '));
console.log(`Аудио URL: ${uniqA.length} | CDN намуна: ${aOk}✅/${aFail}❌ | latency avg ${avg(aMs)}ms p95 ${p95(aMs)}ms`);
console.log(`Эмоҷии keycap-дукарата (акнун FittedBox ҳал кард): ${stats.keycap2.length}`);
console.log(`\n⚡ Суръат: дарс avg ${avg(perf.lessonMs)}ms p95 ${p95(perf.lessonMs)}ms | ҳаҷми дарс avg ${(avg(perf.lessonBytes) / 1024).toFixed(1)}KB max ${(Math.max(...perf.lessonBytes) / 1024).toFixed(1)}KB`);
const tot = Object.values(engine).reduce((a, b) => a + b, 0);
console.log(`\n🎮 Муҳаррики машқ (симулятсия): ${Object.entries(engine).map(([k, v]) => `${k}=${v}(${Math.round(100 * v / tot)}%)`).join(' ')}`);
console.log(`   Истеҳсол (spell+type+build+cloze+dictate): ${Math.round(100 * (engine.spell + engine.type + engine.build + engine.cloze + engine.dictate) / tot)}%`);

console.log(`\n🔴 КРИТИКӢ (${issues.critical.length}):`); for (const t of issues.critical.slice(0, 15)) console.log('   ' + t);
console.log(`🟠 МУҲИМ (${issues.major.length}):`); for (const t of [...new Set(issues.major)].slice(0, 20)) console.log('   ' + t);
console.log(`🟡 ХУРД (${issues.minor.length}):`); for (const t of [...new Set(issues.minor)].slice(0, 15)) console.log('   ' + t);
