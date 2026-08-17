// Як модули арабиро қадам ба қадам мегузарад — маҳз тавре ки ХОНАНДА мебинад.
// Ҳама чизро чоп мекунад (калима, машқ, матн, муколама) + санҷишҳо.
//
//   node prisma/_ar-module-walk.mjs <тартиби модул> [--full]
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);
const q = (t, p) => sql.query(t, p);

const ORDER = Number(process.argv[2] ?? 0);
const FULL = process.argv.includes('--full');
const COURSE = 'cmqdqfv7300021rcswj4fy6vf';

const P = [];
const soft = [];
const bad = (a, m) => P.push(`[${a}] ${m}`);
const gnorm = s => String(s).toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim();
const normImageKey = w => w.toLowerCase().trim().replace(/[ً-ٰٟۖ-ۭـ]/g, '').replace(/['’.,!?]/g, '').replace(/\s+/g, '_');
const TASHKEEL = /[ً-ْٰ]/;

const [mod] = await q(`SELECT * FROM "Module" WHERE "courseId"='${COURSE}' AND "order"=${ORDER} AND "isActive"=true`);
if (!mod) { console.log('чунин модули фаъол нест'); process.exit(1); }
console.log(`${mod.emoji} МОДУЛИ ${mod.order}: ${mod.title} — «${mod.titleTranslated}»\n`);

// Расмҳои CDN
let cdn = new Set();
try {
  const tree = await (await fetch('https://api.github.com/repos/kholzoda2001-coder/ramz-audio/git/trees/main?recursive=1')).json();
  cdn = new Set((tree.tree ?? []).filter(t => t.path.startsWith('images/ar/')).map(t => t.path.replace('images/ar/', '').replace(/\.png$/, '')));
} catch { console.log('(рӯйхати расм гирифта нашуд)'); }

// Дарси хомӯши БОЙГОНӢ (order >= 100) ба хонанда намеравад — санҷиш намешавад.
const allLessons = await q(`SELECT * FROM "Lesson" WHERE "moduleId"='${mod.id}' ORDER BY "order"`);
const archived = allLessons.filter(l => l.order >= 100);
const lessons = allLessons.filter(l => l.order < 100);
if (archived.length) console.log(`(дар бойгонӣ: ${archived.map(l => `«${l.titleTranslated}»`).join(' · ')})`);
console.log(`дарсҳо: ${lessons.length}\n${'═'.repeat(70)}`);

let nWords = 0, nAudioBad = 0, nPic = 0, nPicHave = 0;
const allTr = new Map();

for (const l of lessons) {
  const tag = l.isActive ? '' : '  ⛔ХОМӮШ';
  console.log(`\n▸ ${l.order + 1}. ${l.emoji} «${l.titleTranslated}» (${l.title}) · ${l.skillType} · ${l.xpReward}xp${tag}`);
  if (!l.isActive) bad('дарс', `«${l.titleTranslated}» хомӯш аст`);

  const words = await q(`SELECT * FROM "Word" WHERE "lessonId"='${l.id}' ORDER BY "order"`);
  if (words.length) {
    console.log(`  калимаҳо: ${words.length}`);
    for (const w of words) {
      nWords++;
      const isNoun = (w.partOfSpeech ?? '').trim().toLowerCase() === 'noun';
      const key = normImageKey(w.word);
      const hasPic = cdn.has(key);
      if (isNoun && (w.emoji ?? '').trim()) { nPic++; if (hasPic) nPicHave++; }
      const flags = [
        !w.audioUrl?.trim() && 'БЕ АУДИО',
        !w.ipaTajik?.trim() && 'БЕ ХОНИШ',
        !w.example?.trim() && 'БЕ МИСОЛ',
        !w.exampleTrans?.trim() && 'БЕ ТАРҶУМАИ МИСОЛ',
        !w.partOfSpeech?.trim() && 'БЕ POS',
        !TASHKEEL.test(w.word) && 'бе ҳаракат',
        isNoun && (w.emoji ?? '').trim() && !hasPic && 'бе расм',
      ].filter(Boolean);
      if (FULL || flags.length) {
        console.log(`    ${w.word.padEnd(18)} ${String(w.translation).padEnd(26)} ${String(w.ipaTajik ?? '—').padEnd(20)} ${w.emoji ?? ''} ${flags.length ? '⚠ ' + flags.join(', ') : ''}`);
      }
      if (FULL) console.log(`        мисол: ${w.example} — ${w.exampleTrans}`);
      if (!w.audioUrl?.trim()) bad('калима', `«${w.word}» аудио надорад`);
      if (!w.ipaTajik?.trim()) bad('калима', `«${w.word}» хониши тоҷикӣ надорад`);
      const k = String(w.translation).trim().toLowerCase();
      allTr.set(k, [...(allTr.get(k) ?? []), w.word]);
    }
    // Дар як дарс тарҷумаи такрорӣ = машқи интихоб ду ҷавоби дуруст медиҳад.
    const tr = words.map(w => String(w.translation).trim().toLowerCase());
    if (new Set(tr).size !== tr.length) bad('дарс', `«${l.titleTranslated}»: тарҷумаи такрорӣ дар як дарс`);
    if (words.length < 4 && l.skillType === 'vocab') bad('дарс', `«${l.titleTranslated}»: ${words.length} калима — барои 4 вариант кам`);
  }

  if (l.grammarTopicId) {
    const [g] = await q(`SELECT * FROM "GrammarTopic" WHERE id='${l.grammarTopicId}'`);
    const ex = await q(`SELECT * FROM "GrammarExercise" WHERE "topicId"='${g.id}' ORDER BY "order"`);
    const exm = await q(`SELECT * FROM "GrammarExample" WHERE "topicId"='${g.id}' ORDER BY "order"`);
    const rl = await q(`SELECT * FROM "GrammarRule" WHERE "topicId"='${g.id}' ORDER BY "order"`);
    console.log(`  грамматика: «${g.titleTranslated}» · ${rl.length} қоида · ${exm.length} мисол · ${ex.length} машқ`);
    if (FULL) {
      console.log(`    тавзеҳ: ${String(g.explanation).replace(/\n/g, '\n            ').slice(0, 600)}`);
      for (const x of exm) console.log(`    мисол: ${x.sentence} — ${x.translation}${x.highlight ? `  [${x.highlight}]` : ''}`);
    }
    const posn = {};
    for (const e of ex) {
      const opts = Array.isArray(e.options) ? e.options.map(String) : [];
      if (FULL) console.log(`    ${e.type}: ${String(e.prompt).slice(0, 60)} → ${e.answer}  ${opts.length ? `[${opts.join(' | ')}]` : ''}`);
      if (e.type !== 'reorder' && opts.length > 1) {
        const i = opts.map(gnorm).indexOf(gnorm(e.answer));
        if (i < 0) bad('грамматика', `«${g.titleTranslated}»: ҷавоб «${e.answer}» дар вариантҳо нест`);
        else posn[i] = (posn[i] ?? 0) + 1;
        // Фарқи ҳаракат хато НЕСТ: барнома барои чунин рӯйхат ба муқоисаи сахт
      // мегузарад (grammar_models.dart → strictGrading).
      if (new Set(opts.map(o => o.trim())).size !== opts.length) bad('грамматика', `«${g.titleTranslated}»: ду варианти АЙНАН якхела — [${opts.join(' | ')}]`);
      }
      if (e.type === 'reorder' && opts.length) {
        const a = gnorm(e.answer).split(' ').sort().join(' ');
        const b = opts.map(gnorm).join(' ').split(' ').filter(Boolean).sort().join(' ');
        if (a !== b) bad('грамматика', `«${g.titleTranslated}»: пораҳо «${b}» ≠ ҷавоб «${a}»`);
        if (opts.map(gnorm).join(' ') === gnorm(e.answer)) bad('грамматика', `«${g.titleTranslated}»: пораҳо аллакай ба тартиби ҷавоб`);
      }
      if (!e.explanation?.trim()) bad('грамматика', `«${g.titleTranslated}»: машқ бе тавзеҳ`);
      for (const x of exm) if (x.highlight && !x.sentence.includes(x.highlight)) bad('грамматика', `«${g.titleTranslated}»: highlight «${x.highlight}» дар ҷумла нест`);
    }
    console.log(`    ҷойи ҷавоб: ${JSON.stringify(posn)}`);
  }

  if (l.dialogueId) {
    const [d] = await q(`SELECT * FROM "Dialogue" WHERE id='${l.dialogueId}'`);
    const ln = await q(`SELECT * FROM "DialogueLine" WHERE "dialogueId"='${d.id}' ORDER BY "order"`);
    const mine = ln.filter(x => x.isUser).length;
    console.log(`  муколама: «${d.titleTranslated}» · ${ln.length} сатр · сатри ман (микрофон): ${mine}`);
    if (FULL) for (const x of ln) console.log(`    ${x.isUser ? '🎤' : '🔊'} [${x.speaker}] ${x.text} — ${x.translation}`);
    if (!mine) bad('муколама', `«${d.titleTranslated}»: микрофон намебарояд`);
    const noAud = ln.filter(x => !x.audioUrl?.trim()).length;
    if (noAud) bad('муколама', `«${d.titleTranslated}»: ${noAud} сатр бе аудио`);
  }

  if (l.comprehensionId) {
    const [c] = await q(`SELECT * FROM "ComprehensionExercise" WHERE id='${l.comprehensionId}'`);
    const qs = await q(`SELECT * FROM "ComprehensionQuestion" WHERE "exerciseId"='${c.id}' ORDER BY "order"`);
    console.log(`  ${c.kind ?? 'матн'}: «${c.titleTranslated}» · ${qs.length} савол · аудио: ${c.audioUrl ? 'ҳаст' : 'НЕСТ'}`);
    if (FULL) {
      console.log(`    матн: ${String(c.passage).slice(0, 300)}`);
      console.log(`    тарҷума: ${String(c.passageTranslated).slice(0, 300)}`);
    }
    const posn = {};
    for (const x of qs) {
      const opts = (x.options ?? []).map(String);
      if (FULL) console.log(`    ${x.question} → ${opts[x.correctIndex]}  [${opts.join(' | ')}]`);
      posn[x.correctIndex] = (posn[x.correctIndex] ?? 0) + 1;
      if (x.correctIndex < 0 || x.correctIndex >= opts.length) bad('хониш', `«${c.titleTranslated}»: correctIndex берун аз ҳудуд`);
      if (new Set(opts.map(o => o.trim())).size !== opts.length) bad('хониш', `«${c.titleTranslated}»: ду варианти АЙНАН якхела — [${opts.join(' | ')}]`);
      if (!x.explanation?.trim()) bad('хониш', `«${c.titleTranslated}»: савол бе тавзеҳ`);
      // Матн бояд ҷавобро дошта бошад — вагарна савол аз ҳаво аст.
      // Танҳо ҷавоби АРАБӢ санҷида мешавад (саволи луғавӣ ҷавоби тоҷикӣ дорад)
      // ва муқоиса аз рӯи РЕША (3 ҳарфи аввал) меравад: صديقي ва صديقها шакли
      // ҳамон калимаанд, вале айнан баробар нестанд.
      //
      // ⚠️ Саволи ЛУҒАВӢ/ГРАММАТИКӢ ин қоидаро иҷро карда наметавонад ва набояд
      // ҳам: «مَا مَعْنَى فُلَان؟» ё «Тарҷума кунед» ба матн вобаста нест. Онҳо
      // аз рӯи худи савол шинохта мешаванд.
      // Имтиҳон ва такрор матни ҳикоягӣ надоранд — «матн»-ашон сарлавҳаи худи
      // қадам аст, пас саволҳо аз рӯи ЛУҒАТИ модул мераванд, на аз рӯи матн.
      const service = /^(имтиҳони|такрори|биёед)/i.test((c.passageTranslated ?? '').trim());
      const qtext = `${x.question ?? ''} ${x.questionTranslated ?? ''}`;
      // «أكمل» = ҷои холиро пур кунед — ин саволи ГРАММАТИКӢ аст ва ҷавобаш
      // (шакли дуруст) набояд дар матн бошад. Ҳамин тавр «… بالعربية؟».
      const lexical = /مَا مَعْنَى|معنى|ترجم|تعني|اختر الفعل|أكمل|بالعربية|Тарҷума|чӣ маъно|кадомаш дуруст|Феъли дуруст|Пур кунед/i.test(qtext);
      const ans = opts[x.correctIndex] ?? '';
      if (!service && !lexical && /[ء-ي]/.test(ans)) {
        const stem = w => w.replace(/^(ال|و|ف|ب|ل)/, '').slice(0, 3);
        const parts = gnorm(ans).split(' ').filter(w => w.length > 2).map(stem);
        const hay = gnorm(c.passage ?? '');
        // Ҳушдори МУЛОЙИМ: ҷавоб метавонад аз матн ХУЛОСА бошад («أخوان» дар
        // матн → ҷавоб «اثنان»), пас ин рӯйхати «худат бубин» аст, на хато.
        if (parts.length && !parts.some(s => hay.split(' ').some(w => stem(w) === s)))
          soft.push(`«${c.titleTranslated}»: ҷавоби «${ans}» дар матн айнан нест — хулоса аст ё хато?`);
      }
    }
    console.log(`    ҷойи ҷавоб: ${JSON.stringify(posn)}`);
    if (!c.passageTranslated?.trim()) bad('хониш', `«${c.titleTranslated}»: тарҷумаи матн нест`);
  }

  if (!words.length && !l.grammarTopicId && !l.dialogueId && !l.comprehensionId && !l.phraseCollectionId)
    bad('дарс', `«${l.titleTranslated}»: ХОЛӢ — на калима, на ҷузъ`);
}

// Унвони такрорӣ дар дохили модул
const titles = lessons.filter(l => l.isActive).map(l => l.titleTranslated.trim().toLowerCase());
for (const t of new Set(titles.filter((x, i) => titles.indexOf(x) !== i))) bad('модул', `унвони дарси такрорӣ «${t}»`);

// ── Аудио ───────────────────────────────────────────────────────────────────
console.log(`\n${'═'.repeat(70)}\nАУДИО`);
const auds = await q(`SELECT w.word, w."audioUrl" FROM "Word" w JOIN "Lesson" l ON w."lessonId"=l.id WHERE l."moduleId"='${mod.id}' AND w."audioUrl" <> ''`);
function dur(b) {
  const BR2 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];
  const BR1 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
  const SR = { 3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000] };
  let i = 0, d = 0, g = 0;
  if (b[0] === 0x49 && b[1] === 0x44 && b[2] === 0x33) i = 10 + ((b[6] << 21) | (b[7] << 14) | (b[8] << 7) | b[9]);
  while (i < b.length - 4 && g++ < 400000) {
    if (b[i] === 0xFF && (b[i + 1] & 0xE0) === 0xE0) {
      const ver = (b[i + 1] >> 3) & 3, layer = (b[i + 1] >> 1) & 3, t = SR[ver];
      if (layer === 1 && t) {
        const br = (ver === 3 ? BR1 : BR2)[(b[i + 2] >> 4) & 15], sr = t[(b[i + 2] >> 2) & 3], pad = (b[i + 2] >> 1) & 1;
        if (br && sr) { const spf = ver === 3 ? 1152 : 576; d += spf / sr; i += Math.floor(spf / 8 * 1000 * br / sr) + pad; continue; }
      }
    }
    i++;
  }
  return d;
}
const md5s = new Map();
for (const a of auds) {
  try {
    const r = await fetch(a.audioUrl);
    if (!r.ok) { bad('аудио', `${a.word}: HTTP ${r.status}`); nAudioBad++; continue; }
    const b = Buffer.from(await r.arrayBuffer());
    const d = dur(b);
    const h = b.length;
    if (d < 0.4) { bad('аудио', `${a.word}: ${d.toFixed(2)}с — қариб холӣ`); nAudioBad++; }
    if (md5s.has(h) && md5s.get(h) !== a.word) { /* андоза баробар — ҳушдор не */ }
    md5s.set(h, a.word);
  } catch (e) { bad('аудио', `${a.word}: ${e.message}`); nAudioBad++; }
}
console.log(`чен шуд: ${auds.length} клип · мушкил: ${nAudioBad}`);

console.log(`\n${'═'.repeat(70)}\nҶАМЪБАСТ — модули ${mod.order} «${mod.titleTranslated}»`);
console.log(`дарс ${lessons.length} · калима ${nWords} · исми расмталаб ${nPic} (расм дорад ${nPicHave})`);
if (!P.length) console.log('\n✓ дар ин санҷишҳо мушкил ёфт нашуд.');
else { console.log(`\n${P.length} мушкил:`); for (const p of P) console.log(`  • ${p}`); }
