// Симулятсияи хонандаи воқеӣ дар B1: ҳар дарсро мекушояд, машқҳоро месозад
// (айнан мисли LessonRunner бо harderLevel=true) ва таҷрибаро баҳо медиҳад.
const BASE = 'https://admin.ramz.tj/api/mobile';
const has = (s) => typeof s === 'string' && s.trim().length > 0;
const wc = (s) => (s || '').trim().split(/\s+/).filter(Boolean).length;
const j = async (p) => { const r = await fetch(BASE + p); if (!r.ok) throw new Error(p + ' ' + r.status); return r.json(); };

const nat = (await j('/languages/native')).languages; const tg = nat.find(l => l.code === 'tg');
const tgt = (await j('/languages/target?nativeLanguageId=' + tg.id)).languages; const en = tgt.find(l => l.code === 'en');
const cs = (await j(`/courses?targetLanguageId=${en.id}&nativeLanguageId=${tg.id}`)).courses;
const b1 = cs.find(c => c.level === 'B1');

// ── ҳамчун LessonRunner (harderLevel=true) машқҳоро месозем ──
// қоидаҳо аз unit_lesson_screen.dart: pick=нест, spell→type, dictate агар audioUrl,
// prodVariant%5: 1=build(агар canBuild) 2=cloze(агар canCloze) 3=dictate 4=speak 0=type
const mix = { type: 0, build: 0, cloze: 0, dictate: 0, speak: 0, listen: 0, tapWord: 0, match: 0 };
let vocabLessons = 0, totalWords = 0, exampleWordCounts = [], monotone = [];
let clozeReady = 0, clozeMiss = 0, buildOk = 0, buildMiss = 0;
const issues = [];
const grammarStats = { topics: 0, ex: 0, types: {}, explWords: [] };
const dlg = { n: 0, lines: 0, userLines: 0, avgLineWords: [] };
const listening = [], reading = [];
let writingWords = 0, writingLessons = 0;
const exams = [];

for (const m of b1.modules) {
  for (const st of m.lessons) {
    const L = await j('/lessons/' + st.id); const l = L.lesson || L; const c = l.component;
    const skill = l.skillType; const words = l.words || [];
    const tag = `M${m.order} ${l.titleTranslated || l.title}`;

    if (skill === 'vocab' || skill === 'vocabulary') {
      vocabLessons++; totalWords += words.length;
      let recogVariant = 0, prodVariant = 0;
      for (let i = 0; i < words.length; i++) {
        const w = words[i];
        exampleWordCounts.push(wc(w.example));
        // recognition (harderLevel: no pick → listen/tapWord alternate of 3, pick→tapWord)
        switch (recogVariant++ % 3) { case 0: mix.listen++; break; default: mix.tapWord++; }
        // production
        const correct = (w.example || '').trim().split(/\s+/).filter(Boolean);
        const tw = (w.word || '').trim();
        const inEx = correct.map(t => t.replace(/[^\w'-]/g, '').toLowerCase()).includes(tw.toLowerCase());
        const canCloze = tw && !tw.includes(' ') && correct.length >= 3 && inEx;
        const canBuild = correct.length >= 3 && correct.length <= 8 && has(w.exampleTrans || w.exampleTranslation);
        if (canCloze) clozeReady++; else clozeMiss++;
        if (canBuild) buildOk++; else buildMiss++;
        switch (prodVariant++ % 5) {
          case 1: canBuild ? mix.build++ : mix.type++; break;
          case 2: canCloze ? mix.cloze++ : mix.type++; break;
          case 3: has(w.audioUrl) ? mix.dictate++ : mix.type++; break;
          case 4: mix.speak++; break;
          default: mix.type++;
        }
      }
      mix.match += Math.ceil(words.length / 5);
      // якрангии мисолҳо (ҳамон паттерн такрор?)
      const starts = words.map(w => (w.example || '').split(' ').slice(0, 2).join(' ').toLowerCase());
      const dupStart = starts.length - new Set(starts).size;
      if (dupStart > words.length / 2) monotone.push(tag);
    }
    else if (skill === 'grammar') {
      grammarStats.topics++;
      const exs = c?.exercises || [];
      grammarStats.ex += exs.length;
      grammarStats.explWords.push(wc(c?.explanation));
      for (const e of exs) grammarStats.types[e.type] = (grammarStats.types[e.type] || 0) + 1;
      if (exs.length < 6) issues.push(`${tag}: танҳо ${exs.length} машқи грамматика`);
    }
    else if (skill === 'speaking') {
      dlg.n++; const lines = c?.lines || [];
      dlg.lines += lines.length; dlg.userLines += lines.filter(x => x.isUser).length;
      for (const x of lines) dlg.avgLineWords.push(wc(x.text));
    }
    else if (skill === 'listening') listening.push({ tag, words: wc(c?.passage), q: (c?.questions || []).length, audio: has(c?.audioUrl) });
    else if (skill === 'reading') reading.push({ tag, words: wc(c?.passage), q: (c?.questions || []).length });
    else if (skill === 'writing') { writingLessons++; writingWords += words.length; }
    else if (skill === 'test') {
      const qs = c?.questions || []; exams.push({ tag, n: qs.length, allowedWrong: Math.floor(qs.length - 0.8 * qs.length) });
    }
  }
}

const avg = a => a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : 0;
const total = Object.values(mix).reduce((a, b) => a + b, 0);
console.log('══════ ТАҶРИБАИ ХОНАНДА (симулятсияи LessonRunner, harderLevel=true) ══════');
console.log(`Дарси луғат: ${vocabLessons} | калима: ${totalWords} | мисоли миёна: ${avg(exampleWordCounts)} калима`);
console.log('Тақсими машқҳо:', Object.entries(mix).map(([k, v]) => `${k}=${v}(${Math.round(100 * v / total)}%)`).join(' '));
console.log(`  → истеҳсоли воқеӣ (type+build+cloze+dictate): ${Math.round(100 * (mix.type + mix.build + mix.cloze + mix.dictate) / total)}%`);
console.log(`cloze имконпазир: ${clozeReady}/${clozeReady + clozeMiss} | build имконпазир: ${buildOk}/${buildOk + buildMiss}`);
console.log(`Мисолҳои якранг (нимаш як хел сар мешавад): ${monotone.length ? monotone.join('; ') : 'нест ✅'}`);
console.log(`\nГрамматика: ${grammarStats.topics} дарс, ${grammarStats.ex} машқ, тавзеҳи миёна ${avg(grammarStats.explWords)} калима`);
console.log('  навъҳо:', Object.entries(grammarStats.types).map(([k, v]) => `${k}=${v}`).join(' '));
console.log(`\nМуколама: ${dlg.n} дарс, ${dlg.lines} сатр (хонанда мегӯяд: ${dlg.userLines}), сатри миёна ${avg(dlg.avgLineWords)} калима`);
console.log(`\nШунавоӣ: ${listening.length} дарс | матн ${avg(listening.map(x => x.words))} кал | савол ${avg(listening.map(x => x.q))} | аудиои воқеӣ: ${listening.filter(x => x.audio).length}/${listening.length}`);
console.log(`Хониш: ${reading.length} дарс | матн ${avg(reading.map(x => x.words))} кал | савол ${avg(reading.map(x => x.q))}`);
console.log(`Навиштан: ${writingLessons} дарс (${writingWords} калима — машқи type)`);
console.log(`Имтиҳонҳо: ${exams.length} | саволҳо: ${exams.map(e => e.n).join(',')} | хатои ҷоиз: ${exams.map(e => e.allowedWrong).join(',')}`);
if (issues.length) { console.log('\n⚠️ Мушкилот:'); for (const i of issues) console.log('  - ' + i); } else console.log('\n✅ Мушкилоти сохторӣ нест');
