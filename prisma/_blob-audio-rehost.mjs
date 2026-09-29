// Кӯчонидани аудиое, ки ҳанӯз ба Vercel Blob ишора мекунад (store БАСТА — HTTP 403,
// санҷиши зинда 29.09.2026: курси кореягӣ ПУРРА, арабӣ 85 калима + 30 ҳарф + 4 шиносоӣ),
// ба GitHub + jsDelivr (ramz-audio) — ҳамон роҳи `_de-audio-rehost.mjs`, вале барои ҳар
// забон ва ҳар ҷадвал. Бе ин барнома ба ҷои овози курс TTS-и телефонро мехонад.
//
// Файлҳои кӯҳна гирифта НАМЕШАВАНД (403) — ҳама аз нав бо ОВОЗИ ХУДИ КУРС:
//   ko  Google ko-KR-Chirp3-HD-Despina (`speakReliable`: ҳиҷои якка садоноки дуруст,
//       вагарна Neural2) + буриши хомӯшии сар — мисли `_ko-module-build.mjs`
//   ar  edge ar-SA-ZariyahNeural + буриш — мисли `_ar-audio-snappy.mjs`
// Матн аз худи база: Word.word, DialogueLine.text, GrammarExample.sentence,
// ComprehensionExercise.passage, OnboardingWord.word; ҳарф — НОМИ ҳарф (ҳамон ҷадвали
// `_ko-alphabet-audio.mjs` / `_ar-alphabet-audio.mjs`).
// Матни якхела ЯК файл мегирад (калимаҳои такрории модулҳо).
//
//   node prisma/_blob-audio-rehost.mjs                  # нақша
//   node prisma/_blob-audio-rehost.mjs --gen [--lang ko] # сабт + санҷиши акустикӣ
//   node prisma/_blob-audio-rehost.mjs --push           # ramz-audio + md5 аз CDN
//   node prisma/_blob-audio-rehost.mjs --apply          # база + contentVersion
// Ҳар қадам идемпотент аст.
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs';
import { execFileSync, spawnSync } from 'child_process';
import { createHash } from 'crypto';
import { neon } from '@neondatabase/serverless';
import { speakReliable, useTrimOrRaw, checkEnergy } from './_ko-tts-google.mjs';

const argv = process.argv.slice(2);
const GEN = argv.includes('--gen'), PUSH = argv.includes('--push'), APPLY = argv.includes('--apply');
const ONLY = argv.includes('--lang') ? argv[argv.indexOf('--lang') + 1] : null;

const WORK = 'tmp/blob-rehost';
// Клони sparse-и ramz-audio: `RAMZ_AUDIO_REPO`, вагарна `%TEMP%/ramz-audio-audio`.
const REPO = (process.env.RAMZ_AUDIO_REPO || `${process.env.TEMP}/ramz-audio-audio`).replace(/\\/g, '/');
const CDN = 'https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio';
const PY = { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' }, maxBuffer: 1 << 26 };
const env = Object.fromEntries(readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')
  .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
  .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sql = neon(env.DATABASE_URL);

const VOICES = {
  ko: { engine: 'ko', voice: 'ko-KR-Chirp3-HD-Despina' },
  ar: { engine: 'edge', voice: 'ar-SA-ZariyahNeural' },
};
// Номи ҳарф — айнан аз `_ko-alphabet-audio.mjs` ва `_ar-alphabet-audio.mjs`.
const LETTER = {
  ko: {
    'ㅏ': '아', 'ㅑ': '야', 'ㅓ': '어', 'ㅕ': '여', 'ㅗ': '오', 'ㅛ': '요', 'ㅜ': '우', 'ㅠ': '유', 'ㅡ': '으', 'ㅣ': '이',
    'ㄱ': '기역', 'ㄴ': '니은', 'ㄷ': '디귿', 'ㄹ': '리을', 'ㅁ': '미음', 'ㅂ': '비읍', 'ㅅ': '시옷', 'ㅇ': '이응',
    'ㅈ': '지읒', 'ㅊ': '치읓', 'ㅋ': '키읔', 'ㅌ': '티읕', 'ㅍ': '피읖', 'ㅎ': '히읗',
    'ㄲ': '쌍기역', 'ㄸ': '쌍디귿', 'ㅃ': '쌍비읍', 'ㅆ': '쌍시옷', 'ㅉ': '쌍지읒',
    'ㅐ': '애', 'ㅒ': '얘', 'ㅔ': '에', 'ㅖ': '예', 'ㅘ': '와', 'ㅙ': '왜', 'ㅚ': '외', 'ㅝ': '워', 'ㅞ': '웨', 'ㅟ': '위', 'ㅢ': '의',
  },
  ar: {
    'ا': 'أَلِف', 'ب': 'بَاء', 'ت': 'تَاء', 'ث': 'ثَاء', 'ج': 'جِيم', 'ح': 'حَاء', 'خ': 'خَاء', 'د': 'دَال', 'ذ': 'ذَال',
    'ر': 'رَاء', 'ز': 'زَاي', 'س': 'سِين', 'ش': 'شِين', 'ص': 'صَاد', 'ض': 'ضَاد', 'ط': 'طَاء', 'ظ': 'ظَاء', 'ع': 'عَيْن',
    'غ': 'غَيْن', 'ف': 'فَاء', 'ق': 'قَاف', 'ك': 'كَاف', 'ل': 'لَام', 'م': 'مِيم', 'ن': 'نُون', 'ه': 'هَاء', 'و': 'وَاو',
    'ي': 'يَاء', 'ء': 'هَمْزَة', 'ة': 'تَاء مَرْبُوطَة',
  },
};

// ── Ҷамъоварӣ: ҳар сатре, ки audioUrl-аш ба Blob ишора мекунад ─────────────────
const B = `LIKE '%blob.vercel-storage.com%'`;
const L = (col) => `(SELECT code FROM "Language" WHERE id = ${col})`;
const SRC = [
  ['Word', 'word', `SELECT w.id, w.word t, ${L('c."targetLanguageId"')} lang, m.id mid FROM "Word" w JOIN "Lesson" le ON le.id=w."lessonId" JOIN "Module" m ON m.id=le."moduleId" JOIN "Course" c ON c.id=m."courseId" WHERE w."audioUrl" ${B}`],
  ['DialogueLine', 'line', `SELECT x.id, x.text t, ${L('c."targetLanguageId"')} lang, NULL mid, c.id cid FROM "DialogueLine" x JOIN "Dialogue" d ON d.id=x."dialogueId" JOIN "Course" c ON c.id=d."courseId" WHERE x."audioUrl" ${B}`],
  ['GrammarExample', 'gex', `SELECT e.id, e.sentence t, ${L('c."targetLanguageId"')} lang, NULL mid, c.id cid FROM "GrammarExample" e JOIN "GrammarTopic" g ON g.id=e."topicId" JOIN "Course" c ON c.id=g."courseId" WHERE e."audioUrl" ${B}`],
  ['ComprehensionExercise', 'comp', `SELECT x.id, x.passage t, ${L('c."targetLanguageId"')} lang, NULL mid, c.id cid FROM "ComprehensionExercise" x JOIN "Course" c ON c.id=x."courseId" WHERE x."audioUrl" ${B}`],
  ['OnboardingWord', 'onb', `SELECT o.id, o.word t, ${L('o."targetLanguageId"')} lang, NULL mid FROM "OnboardingWord" o WHERE o."audioUrl" ${B}`],
  ['AlphabetLetter', 'letter', `SELECT a.id, a.uppercase t, ${L('a."targetLanguageId"')} lang, NULL mid FROM "AlphabetLetter" a WHERE a."audioUrl" ${B}`],
];
const rows = [], problems = [];
for (const [table, kind, q] of SRC) {
  for (const r of await sql.query(q)) {
    let text = String(r.t ?? '').replace(/\s+/g, ' ').trim();
    if (kind === 'letter') text = LETTER[r.lang]?.[r.t] ?? '';
    if (!VOICES[r.lang]) { problems.push(`${table} ${r.id}: овози «${r.lang}» муайян нест`); continue; }
    if (!text) { problems.push(`${table} ${r.id}: матн нест («${r.t}»)`); continue; }
    rows.push({ table, kind, id: r.id, lang: r.lang, text, mid: r.mid, cid: r.cid });
  }
}
// Як матн = як файл (номи файл аз hash-и матн — такрорҳо ҳамон URL-ро мегиранд).
const keyOf = (r) => createHash('md5').update(`${r.lang}|${r.kind === 'comp' ? 'comp' : 'x'}|${r.text}`).digest('hex').slice(0, 20);
const clips = new Map();
for (const r of rows) {
  r.key = keyOf(r);
  if (!clips.has(r.key)) clips.set(r.key, { key: r.key, lang: r.lang, text: r.text, kind: r.kind });
}
const byGroup = {};
for (const r of rows) byGroup[`${r.lang} ${r.table}`] = (byGroup[`${r.lang} ${r.table}`] || 0) + 1;
console.log(`сатрҳо: ${rows.length} · клипҳои ягона: ${clips.size}`);
console.table(byGroup);
if (problems.length) { console.log('⚠️ бе аудио мемонанд:'); problems.forEach((p) => console.log('  ' + p)); }

mkdirSync(WORK, { recursive: true });
const MANIFEST = `${WORK}/manifest.json`;
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {};
const saveManifest = () => writeFileSync(MANIFEST, JSON.stringify(manifest, null, 1));
const finalPath = (c) => `${WORK}/final/${c.lang}/${c.key}.mp3`;
const isDone = (c) => manifest[c.key]?.ok && manifest[c.key].text === c.text && existsSync(finalPath(c));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function pool(list, n, fn) {
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < list.length) await fn(list[i++]); }));
}
/** Google ko-KR-Neural2-B — эҳтиётӣ барои ҳиҷои якка; танҳо клипи бо садо. */
async function googleNeural2(text) {
  for (let a = 0; a < 4; a++) {
    const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${env.GOOGLE_TTS_KEY}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: { text }, voice: { languageCode: 'ko-KR', name: 'ko-KR-Neural2-B' }, audioConfig: { audioEncoding: 'MP3' } }),
    });
    const d = await res.json().catch(() => ({}));
    if (res.ok && d.audioContent) {
      const buf = Buffer.from(d.audioContent, 'base64');
      mkdirSync(`${WORK}/probe`, { recursive: true });
      const p = `${WORK}/probe/_n2_${createHash('md5').update(text).digest('hex').slice(0, 8)}.mp3`;
      writeFileSync(p, buf);
      if (checkEnergy([p]).length === 0) return buf;
    }
    await sleep(1500 * (a + 1));
  }
  throw new Error('Neural2-B ҳам хомӯш');
}

/** Ченаки акустикӣ (`tools/audio_check.py`): peak, speech, lead, dur, md5. */
function measure(paths) {
  const out = {};
  for (let i = 0; i < paths.length; i += 120) {
    const r = spawnSync('python', ['../tools/audio_check.py', ...paths.slice(i, i + 120)], PY);
    if (r.status !== 0) throw new Error(r.stderr);
    Object.assign(out, JSON.parse(r.stdout));
  }
  return out;
}
/** Ҳамон меъёрҳои `_grammar-ex-audio.mjs`; матни хониш (comp) то 120 с. */
function verdict(c, m) {
  if (!m || m.error) return `хато: ${m?.error ?? 'ченак нест'}`;
  const letters = (c.text.replace(/[ً-ْٰ]/g, '').match(/\p{L}/gu) ?? []).length;
  const perLetter = m.speech / Math.max(letters, 1);
  if (m.peak < 0.15) return `хомӯш (peak ${m.peak})`;
  const minSpeech = letters <= 1 ? 0.1 : letters <= 3 ? 0.12 : 0.25;
  if (m.speech < minSpeech) return `нутқ кам (${m.speech}s)`;
  if (m.lead > 0.6) return `хомӯшии сар ${m.lead}s`;
  if (m.dur > (c.kind === 'comp' ? 120 : 20)) return `хеле дароз ${m.dur}s`;
  if (perLetter < 0.025) return `хеле тез/бурида (${perLetter.toFixed(3)} s/ҳарф)`;
  if (perLetter > (letters <= 3 ? 1.0 : 0.45)) return `хеле суст/бегона (${perLetter.toFixed(3)} s/ҳарф)`;
  return null;
}

// ── Тавлид ───────────────────────────────────────────────────────────────────
if (GEN) {
  const todo = [...clips.values()].filter((c) => (!ONLY || c.lang === ONLY) && !isDone(c));
  console.log(`\n== Тавлид: ${todo.length} клип ==`);
  for (const lang of [...new Set(todo.map((c) => c.lang))]) {
    const list = todo.filter((c) => c.lang === lang);
    const v = VOICES[lang];
    const RAW = `${WORK}/raw/${lang}`, TRIM = `${WORK}/trim/${lang}`, FIN = `${WORK}/final/${lang}`;
    for (const d of [RAW, TRIM, FIN]) mkdirSync(d, { recursive: true });
    console.log(`\n-- ${lang} · ${v.voice}: ${list.length}`);
    const failed = new Set();
    if (v.engine === 'edge') {
      writeFileSync(`${RAW}/items.json`, JSON.stringify(list.map((c) => ({ id: c.key, text: c.text }))));
      const r = spawnSync('python', ['prisma/_ar-tts.py', RAW, `${RAW}/items.json`, v.voice], PY);
      const lines = (r.stdout ?? '').split('\n');
      for (const l of lines.filter((l) => l.startsWith('FAIL'))) { console.log('  ' + l); failed.add(l.split(/\s+/)[1].replace(':', '')); }
      console.log('  ' + lines.filter(Boolean).slice(-1)[0]);
    } else {
      let n = 0;
      // Клипи хоми аллакай сохташуда (кӯшиши пешина) аз нав сохта намешавад —
      // Google TTS пул аст ва Chirp3 ҳар бор нусхаи дигар медиҳад.
      const need = list.filter((c) => !existsSync(`${RAW}/${c.key}.mp3`));
      if (need.length < list.length) console.log(`  ${list.length - need.length} клипи хом аз кӯшиши пешина`);
      await pool(need, 4, async (c) => {
        try {
          const { buf, variant, attempts } = await speakReliable(c.text, { apiKey: env.GOOGLE_TTS_KEY, workDir: `${WORK}/probe` });
          if (variant !== 'plain' || attempts > 1) console.log(`  ↻ «${c.text.slice(0, 30)}»: ${variant}, ${attempts} кӯшиш`);
          writeFileSync(`${RAW}/${c.key}.mp3`, buf);
        } catch (e) {
          // Ҳиҷои ЯККАИ баста («삼», «백»): санҷиши садонок 17 кӯшишро рад кард. Neural2-B
          // (100% дар ченаки ҳиҷои якка — хотираи ramz-ko-alphabet-voice) бо санҷиши садо.
          try {
            const buf = await googleNeural2(c.text);
            writeFileSync(`${RAW}/${c.key}.mp3`, buf);
            console.log(`  ↻ «${c.text}»: Neural2-B (эҳтиётӣ)`);
          } catch (e2) { failed.add(c.key); console.log(`  ✗ «${c.text.slice(0, 40)}»: ${e.message} · ${e2.message}`); }
        }
        if (++n % 50 === 0) console.log(`  ${n}/${need.length}`);
      });
    }
    const made = list.filter((c) => !failed.has(c.key));
    console.log('  ' + execFileSync('python', ['prisma/_ar-trim.py', RAW, TRIM], PY).trim().split('\n').slice(-1)[0]);
    // Бо қисмҳо: 995 роҳ дар як фармон аз ҳадди сатри фармони Windows мегузашт
    // (`_audio-energy.py: 0 натиҷа барои 995 файл`, 29.09.2026).
    const still = [];
    let usedRaw = 0;
    for (let i = 0; i < made.length; i += 150) {
      const r = useTrimOrRaw(made.slice(i, i + 150).map((c) => [`${RAW}/${c.key}.mp3`, `${TRIM}/${c.key}.mp3`]));
      still.push(...r.still);
      usedRaw += r.usedRaw;
    }
    if (usedRaw) console.log(`  ${usedRaw} клипи кӯтоҳ бе буриш монд`);
    // `_audio-energy.py` ≥ 0.20 с садои баланд мехоҳад — номи кӯтоҳи ҳарфи арабӣ
    // («تَاء» = «тоо») солим аст (peak 0.54–0.62), вале 0.12–0.18 с дорад → «хомӯш»-и
    // бардурӯғ (6 ҳарф, 29.09.2026). Ченаки дуюм: peak ≥ 0.3 ва нутқ ≥ 0.1 с → клипи хом.
    const stillKeys = still.map((p) => p.split('/').pop().replace('.mp3', ''));
    const reM = stillKeys.length ? measure(stillKeys.map((k) => `${RAW}/${k}.mp3`)) : {};
    for (const k of stillKeys) {
      const mm = reM[`${RAW}/${k}.mp3`];
      if (mm && !mm.error && mm.peak >= 0.3 && mm.speech >= 0.1) { copyFileSync(`${RAW}/${k}.mp3`, `${TRIM}/${k}.mp3`); continue; }
      failed.add(k);
      console.log(`  ✗ «${clips.get(k)?.text.slice(0, 40)}»: ҳатто клипи хом хомӯш аст`);
    }
    for (const c of made) if (!failed.has(c.key)) copyFileSync(`${TRIM}/${c.key}.mp3`, finalPath(c));
    const ready = list.filter((c) => !failed.has(c.key));
    // Хомӯшии сари боқимонда (Chirp3: 0.62–0.82 с дар 43 клип — `_ar-trim.py` онро
    // намебурад) → `tools/trim_lead.py`: ҳадди ҳассос + 60 мс захира + санҷиши нутқ.
    if (ready.length) {
      const LEAD = `${WORK}/lead/${lang}`;
      mkdirSync(LEAD, { recursive: true });
      writeFileSync(`${LEAD}/items.json`, JSON.stringify(ready.map((c) => ({ key: c.key, url: finalPath(c) }))));
      const r = spawnSync('python', ['../tools/trim_lead.py', `${LEAD}/items.json`, LEAD, `${LEAD}/report.json`, '--min', '0.2'], PY);
      if (r.status !== 0) throw new Error(`trim_lead: ${r.stderr}`);
      const rep = JSON.parse(readFileSync(`${LEAD}/report.json`, 'utf8'));
      let cut = 0;
      for (const c of ready) if (rep[c.key]?.status === 'trimmed') { copyFileSync(`${LEAD}/${c.key}.mp3`, finalPath(c)); cut++; }
      console.log(`  хомӯшии сар бурида шуд: ${cut} · ${r.stdout.trim()}`);
    }
    const m = measure(ready.map(finalPath));
    let bad = 0;
    for (const c of ready) {
      const why = verdict(c, m[finalPath(c)]);
      if (why) { bad++; console.log(`  ✗ «${c.text.slice(0, 40)}»: ${why}`); continue; }
      manifest[c.key] = { text: c.text, lang: c.lang, md5: m[finalPath(c)].md5, ok: true };
    }
    saveManifest();
    console.log(`  ✓ ${ready.length - bad}/${list.length}${bad + failed.size ? ` · ${bad + failed.size} НОКОМ (--gen-ро такрор кунед)` : ''}`);
  }
}

// ── Push ─────────────────────────────────────────────────────────────────────
const URLS = `${WORK}/urls.json`;
const scope = [...clips.values()].filter((c) => !ONLY || c.lang === ONLY);
if (PUSH) {
  const notDone = scope.filter((c) => !isDone(c));
  if (notDone.length) { console.error(`⛔ ${notDone.length} клип ҳанӯз тайёр нест — аввал --gen`); process.exit(1); }
  const git = (a) => execFileSync('git', a, { cwd: REPO, encoding: 'utf8', maxBuffer: 1 << 26 }).trim();
  if (!existsSync(`${REPO}/.git/HEAD`)) throw new Error(`клони ${REPO} нест`);
  const rel = (c) => `audio/rehost/${c.lang}/${c.key}.mp3`;
  for (let attempt = 1; ; attempt++) {
    git(['fetch', '--depth', '1', 'origin', 'main']);
    git(['reset', '--hard', 'origin/main']);
    if (!git(['sparse-checkout', 'list']).split('\n').includes('audio/rehost')) git(['sparse-checkout', 'add', 'audio/rehost']);
    for (const c of scope) {
      mkdirSync(`${REPO}/audio/rehost/${c.lang}`, { recursive: true });
      copyFileSync(finalPath(c), `${REPO}/${rel(c)}`);
    }
    for (let i = 0; i < scope.length; i += 200) git(['add', ...scope.slice(i, i + 200).map(rel)]);
    if (!git(['status', '--porcelain']).trim()) break;
    git(['-c', 'user.name=RAMZ Content', '-c', 'user.email=help@ramz.tj', 'commit', '-q', '-m',
      `Rehost ${scope.length} course audio files from the blocked Vercel Blob (ko, ar)`]);
    try { git(['push', '-q', 'origin', 'HEAD:main']); break; } catch (e) {
      // Скрипти дигар (мас. аудиои «Гуфтор») ҳамзамон push кард → аз нав.
      if (attempt >= 4) throw e;
      console.log(`  push рад шуд (кӯшиши ${attempt}) — аз нав`);
      await sleep(5000);
    }
  }
  const sha = git(['rev-parse', 'HEAD']);
  console.log(`commit: ${sha}`);
  const prev = existsSync(URLS) ? JSON.parse(readFileSync(URLS, 'utf8')) : {};
  const known = (c) => (prev[c.key]?.md5 === manifest[c.key].md5 ? prev[c.key].url : null);
  const url = (c) => `${CDN}@${sha}/${rel(c)}`;
  let pending = scope.filter((c) => !known(c));
  console.log(`санҷиши CDN: ${pending.length} файли нав`);
  for (let a = 1; a <= 8 && pending.length; a++) {
    const m = measure(pending.map(url));
    pending = pending.filter((c) => m[url(c)]?.md5 !== manifest[c.key].md5);
    if (pending.length) { console.log(`CDN кӯшиши ${a}: ${pending.length} ҳанӯз нест…`); await sleep(15000); }
  }
  if (pending.length) { console.error(`⛔ CDN: ${pending.length} файл md5 надод — база даст нахӯрд`); process.exit(1); }
  writeFileSync(URLS, JSON.stringify({ ...prev, ...Object.fromEntries(scope.map((c) =>
    [c.key, { url: known(c) ?? url(c), md5: manifest[c.key].md5 }])) }, null, 1));
  console.log(`✓ CDN: ҳамаи ${scope.length} файл md5-и айнан баробар`);
}

// ── Навиштан ба база ─────────────────────────────────────────────────────────
if (APPLY) {
  if (!existsSync(URLS)) { console.error('⛔ urls.json нест — аввал --push'); process.exit(1); }
  const urls = JSON.parse(readFileSync(URLS, 'utf8'));
  const todo = rows.filter((r) => (!ONLY || r.lang === ONLY) && urls[r.key]);
  const byTable = {};
  for (const r of todo) (byTable[r.table] ??= []).push(r);
  for (const [table, list] of Object.entries(byTable)) {
    for (let i = 0; i < list.length; i += 100) {
      const chunk = list.slice(i, i + 100);
      const values = chunk.map((_, k) => `($${k * 2 + 1}, $${k * 2 + 2})`).join(',');
      // Танҳо сатре, ки ҲАНӮЗ ба Blob ишора мекунад — кори дастии байниро намекӯбад.
      await sql.query(`UPDATE "${table}" t SET "audioUrl" = v.u FROM (VALUES ${values}) AS v(id, u)
        WHERE t.id = v.id AND t."audioUrl" ${B}`, chunk.flatMap((r) => [r.id, urls[r.key].url]));
    }
    console.log(`  ${table}: ${list.length}`);
  }
  // Навиштани мустақими SQL `contentVersion`-ро намезанад → дастӣ: ҳамаи бахшҳои
  // курсҳое, ки аудио гирифтанд, + парчами глобалӣ (кэши Hive-и телефонро нав мекунад).
  const courseIds = new Set(todo.map((r) => r.cid).filter(Boolean));
  for (const mid of new Set(todo.map((r) => r.mid).filter(Boolean))) {
    const [m] = await sql.query(`SELECT "courseId" FROM "Module" WHERE id=$1`, [mid]);
    if (m) courseIds.add(m.courseId);
  }
  const mods = await sql.query(`UPDATE "Module" SET "contentVersion" = "contentVersion" + 1
    WHERE "courseId" = ANY($1) RETURNING id`, [[...courseIds]]);
  const [g] = await sql.query(`SELECT "valueJson" v FROM "AppSetting" WHERE key='content_version'`);
  const next = String(Number(String(g?.v ?? '0').replace(/"/g, '')) + 1);
  await sql.query(`UPDATE "AppSetting" SET "valueJson"=$1, "updatedAt"=now() WHERE key='content_version'`, [next]);
  console.log(`✅ ${todo.length} сатр · ${mods.length} бахш contentVersion+1 · content_version → ${next}`);
}

if (!GEN && !PUSH && !APPLY) console.log('\n(нақша) --gen → --push → --apply');
