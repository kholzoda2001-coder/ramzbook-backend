// Аудиои машқҳои ГРАММАТИКА — барои ҲАМАИ забонҳо, ҳар кадом бо овози худи курс.
//
// Хонанда баъди «Санҷиш» ҷумлаи дурустро бо 🔊 / 🐢 мешунавад — айнан мисли
// дарсҳо (талаби корбар, 2026-09-12: «айнан мисли дигар забонҳо»). Ҷумла аз
// prompt + answer сохта мешавад (`_grammar-ex-text.mjs`); машқи шубҳанок аудио
// намегирад ва барнома тугмаро нишон намедиҳад.
//
// Овоз = ҳамон овози мисолҳои грамматикаи ҳамон курс (аз имзои MP3 муайян шуд,
// 2026-09-12; ниг. хотираи ramz-audio-hosting):
//   en A1  edge  en-US-AriaNeural          (48 kbps — ҳамаи A1)
//   en A2  google en-US-Neural2-F          (nova-и A2 дигар дастрас нест; ибораҳои A2 = Neural2-F)
//   en B1  google en-US-Neural2-F          (64 kbps — мисолҳои B1)
//   ru     google ru-RU-Chirp3-HD-Kore     (қарори доимии корбар барои тамоми русӣ)
//   ar     edge  ar-SA-ZariyahNeural + буриши хомӯшӣ (`_ar-trim.py`), мисли курс
//   ko     google ko-KR-Chirp3-HD-Despina (`speakReliable`) + буриш, мисли курс
//   de     edge  de-DE-KatjaNeural
//
//   node prisma/_grammar-ex-audio.mjs                    # нақша — ҳеҷ чиз сохта намешавад
//   node prisma/_grammar-ex-audio.mjs --gen [--lang ko]  # тавлид + санҷиш → tmp/gx-audio/final/<lang>/<id>.mp3
//   node prisma/_grammar-ex-audio.mjs --push             # ramz-audio: commit + push + md5-и CDN → tmp/gx-audio/urls.json
//   node prisma/_grammar-ex-audio.mjs --apply            # база: сутун + audioUrl + contentVersion
//   … --regen id1,id2                                    # ин машқҳоро аз нав сабт кун
//
// Ҳар қадам идемпотент аст: дубора иҷро кардан танҳо чизи нав/тағйирёфтаро мекунад.
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs';
import { execFileSync, spawnSync } from 'child_process';
import { connect } from './_ru-fix-lib.mjs';
import { exerciseSentence } from './_grammar-ex-text.mjs';
import { speakReliable, useTrimOrRaw, checkEnergy } from './_ko-tts-google.mjs';

const argv = process.argv.slice(2);
const GEN = argv.includes('--gen'), PUSH = argv.includes('--push'), APPLY = argv.includes('--apply');
const ONLY = argv.includes('--lang') ? argv[argv.indexOf('--lang') + 1] : null;
const REGEN = new Set(argv.includes('--regen') ? argv[argv.indexOf('--regen') + 1].split(',') : []);

const WORK = 'tmp/gx-audio';
const REPO = `${process.env.TEMP}/ramz-audio-audio`.replace(/\\/g, '/');
const CDN = 'https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio';
const PY = { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' }, maxBuffer: 1 << 26 };
const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }),
);

const VOICES = {
  'en:A1': { engine: 'edge', voice: 'en-US-AriaNeural' },
  'en:A2': { engine: 'google', lc: 'en-US', voice: 'en-US-Neural2-F' },
  'en:B1': { engine: 'google', lc: 'en-US', voice: 'en-US-Neural2-F' },
  // Chirp3-HD-Kore дар ҷумлаҳо ~0.7–0.96 с хомӯшии САР медиҳад (127/264, 2026-09-12) —
  // таъхири ҳискунанда баъди пахши 🔊 → мисли ar/ko бурида мешавад.
  // `rev` ба калиди манифест медарояд → ҳамаи клипҳои русӣ бо буриш аз нав сабт
  // мешаванд (на танҳо нокомҳо), то тамоми курс якхела бошад.
  ru: { engine: 'google', lc: 'ru-RU', voice: 'ru-RU-Chirp3-HD-Kore', trim: true, rev: 2 },
  ar: { engine: 'edge', voice: 'ar-SA-ZariyahNeural', trim: true },
  ko: { engine: 'ko', voice: 'ko-KR-Chirp3-HD-Despina', trim: true },
  de: { engine: 'edge', voice: 'de-DE-KatjaNeural' },
};
const voiceOf = (lang, level) => VOICES[`${lang}:${level}`] ?? VOICES[lang];
const vkeyOf = (v) => `${v.engine}:${v.voice}${v.rev ? `#${v.rev}` : ''}`;

const sql = connect();
const hasCol = (await sql`SELECT 1 FROM information_schema.columns WHERE table_name='GrammarExercise' AND column_name='audioUrl'`).length > 0;
const rows = await sql.query(`
  SELECT e.id, e.type, e.prompt, e.answer, ${hasCol ? 'e."audioUrl"' : 'NULL'} AS "audioUrl",
         tl.code AS lang, c.level, c.id AS cid, t.id AS tid
  FROM "GrammarExercise" e
  JOIN "GrammarTopic" t ON t.id = e."topicId"
  JOIN "Course" c ON c.id = t."courseId"
  JOIN "Language" tl ON tl.id = c."targetLanguageId"
  ORDER BY tl.code, c.level, t."order", e."order"`);

mkdirSync(WORK, { recursive: true });
const MANIFEST = `${WORK}/manifest.json`;
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {};
for (const id of REGEN) delete manifest[id];
const saveManifest = () => writeFileSync(MANIFEST, JSON.stringify(manifest, null, 1));
const finalPath = (it) => `${WORK}/final/${it.lang}/${it.id}.mp3`;

// Ҷавоби ЯККАКАЛИМА, ки дар дарсҳои ҳамон курс сабт шудааст («백», «만»,
// «einundzwanzig»): ҳамон клипи дарс гузошта мешавад — хонанда айнан ҳамон
// овозеро мешунавад, ки калимаро бо он омӯхт. (Chirp3 ҳиҷои яккаро аксар вақт
// хомӯш ё бо садоноки дигар медиҳад — «백» 17 кӯшиш, 2026-09-12.)
const normKey = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
const wordClip = {};
for (const w of await sql`SELECT w.word, w."audioUrl" au, m."courseId" cid FROM "Word" w
    JOIN "Lesson" l ON l.id = w."lessonId" JOIN "Module" m ON m.id = l."moduleId"
    WHERE coalesce(w."audioUrl", '') <> ''`) wordClip[`${w.cid}|${normKey(w.word)}`] ??= w.au;

const items = [], skipped = [];
for (const r of rows) {
  const v = voiceOf(r.lang, r.level);
  const { text, reason } = exerciseSentence(r, r.lang);
  if (!v) { skipped.push({ ...r, reason: `овози «${r.lang} ${r.level}» муайян нашудааст` }); continue; }
  if (!text) { skipped.push({ ...r, reason }); continue; }
  const reuse = /\s/.test(text) ? null : wordClip[`${r.cid}|${normKey(text)}`] ?? null;
  items.push({ ...r, text, v, reuse, vkey: reuse ? `word-clip:${reuse}` : vkeyOf(v) });
}
const isDone = (it) => {
  const m = manifest[it.id];
  return m && m.ok && m.text === it.text && m.vkey === it.vkey && existsSync(finalPath(it));
};

// ── Нақша ────────────────────────────────────────────────────────────────────
const byGroup = {};
for (const it of items) {
  const k = `${it.lang} ${it.level} · ${it.vkey}`;
  byGroup[k] ??= { total: 0, done: 0 };
  byGroup[k].total++;
  if (isDone(it)) byGroup[k].done++;
}
console.log(`машқҳо: ${rows.length} · бо аудио: ${items.length} · бе аудио: ${skipped.length} · сутуни audioUrl дар база: ${hasCol ? 'ҳаст' : 'НЕСТ'}`);
console.table(Object.entries(byGroup).map(([k, v]) => ({ гурӯҳ: k, ҳама: v.total, тайёр: v.done })));
for (const s of skipped) console.log(`  — бе аудио (${s.reason}): ${s.prompt} + ${s.answer}`);

// ── Тавлид ───────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function pool(list, n, fn) {
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < list.length) await fn(list[i++]); }));
}
async function googleSynth(text, lc, voice) {
  for (let a = 0; a < 4; a++) {
    const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${env.GOOGLE_TTS_KEY}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: { text }, voice: { languageCode: lc, name: voice }, audioConfig: { audioEncoding: 'MP3' } }),
    });
    const d = await res.json().catch(() => ({}));
    if (res.ok && d.audioContent) return Buffer.from(d.audioContent, 'base64');
    if (a === 3) throw new Error(`TTS ${res.status}: ${JSON.stringify(d).slice(0, 160)}`);
    await sleep(1500 * (a + 1));
  }
}

/** Ченаки акустикӣ (`tools/audio_check.py`) — бо қисмҳо, то сатри фармон дароз нашавад. */
function measure(paths) {
  const out = {};
  for (let i = 0; i < paths.length; i += 120) {
    const r = spawnSync('python', ['../tools/audio_check.py', ...paths.slice(i, i + 120)], PY);
    if (r.status !== 0) throw new Error(r.stderr);
    Object.assign(out, JSON.parse(r.stdout));
  }
  return out;
}
/** Файли хомӯш, буридашуда ё «гуфтори бегона» ҳеҷ гоҳ ба база намеравад. */
function verdict(it, m) {
  if (!m || m.error) return `хато: ${m?.error ?? 'ченак нест'}`;
  const letters = (it.text.replace(/[ً-ْٰ]/g, '').match(/\p{L}/gu) ?? []).length;
  const perLetter = m.speech / Math.max(letters, 1);
  if (m.peak < 0.15) return `хомӯш (peak ${m.peak})`;
  // Ҳиҷои якка табиатан кӯтоҳ аст: «백» бо ҳамсадои басташаванда дар охир дар
  // клипи ДУРУСТИ дарс (садоноки ㅐ тасдиқ, F2 2590) танҳо 0.12 с садои баланд
  // дорад. Ҳадди ҷумла ба он намерасад.
  // Калимаи 3-ҳарфа («под», «كتب») ҳам ҳамин тавр: ~0.12–0.2 с садои баланд.
  const minSpeech = letters <= 1 ? 0.1 : letters <= 3 ? 0.12 : 0.25;
  if (m.speech < minSpeech) return `нутқ кам (${m.speech}s)`;
  if (m.lead > 0.6) return `хомӯшии сар ${m.lead}s`;
  if (m.dur > 20) return `хеле дароз ${m.dur}s`;
  if (perLetter < 0.025) return `хеле тез/бурида (${perLetter.toFixed(3)} s/ҳарф)`;
  if (perLetter > (letters <= 3 ? 1.0 : 0.45)) return `хеле суст/бегона (${perLetter.toFixed(3)} s/ҳарф)`;
  return null;
}

if (GEN) {
  const todo = items.filter((it) => (!ONLY || it.lang === ONLY) && !isDone(it));
  console.log(`\n== Тавлид: ${todo.length} клип ==`);
  const reuse = todo.filter((it) => it.reuse);
  if (reuse.length) {
    console.log(`\n-- клипи калимаи дарс: ${reuse.length}`);
    await pool(reuse, 8, async (it) => {
      mkdirSync(`${WORK}/final/${it.lang}`, { recursive: true });
      const res = await fetch(it.reuse);
      if (res.ok) writeFileSync(finalPath(it), Buffer.from(await res.arrayBuffer()));
      else console.log(`  ✗ «${it.text}»: HTTP ${res.status}`);
    });
    const got = reuse.filter((it) => existsSync(finalPath(it)));
    const m = measure(got.map(finalPath));
    for (const it of reuse) {
      const why = got.includes(it) ? verdict(it, m[finalPath(it)]) : 'зеркашӣ нашуд';
      if (!why) {
        manifest[it.id] = { text: it.text, vkey: it.vkey, lang: it.lang, md5: m[finalPath(it)].md5, ok: true };
        continue;
      }
      // Клипи дарс санҷишро нагузашт → ҳамон калима бо овози курс нав сабт мешавад.
      console.log(`  ↻ «${it.text}»: клипи дарс (${why}) → сабти нав`);
      it.reuse = null;
      it.vkey = vkeyOf(it.v);
    }
    saveManifest();
    console.log(`  ✓ ${reuse.filter(isDone).length}/${reuse.length}`);
  }
  const groups = {};
  for (const it of todo.filter((x) => !x.reuse)) (groups[`${it.lang}|${it.vkey}`] ??= []).push(it);
  for (const [g, list] of Object.entries(groups)) {
    const [lang] = g.split('|');
    const v = list[0].v;
    const slug = g.replace(/[^a-z0-9]+/gi, '_');
    const RAW = `${WORK}/raw/${slug}`, TRIM = `${WORK}/trim/${slug}`, FIN = `${WORK}/final/${lang}`;
    for (const d of [RAW, TRIM, FIN]) mkdirSync(d, { recursive: true });
    console.log(`\n-- ${g}: ${list.length}`);
    const failed = new Set();
    if (v.engine === 'edge') {
      writeFileSync(`${RAW}/items.json`, JSON.stringify(list.map((it) => ({ id: it.id, text: it.text }))));
      const r = spawnSync('python', ['prisma/_ar-tts.py', RAW, `${RAW}/items.json`, v.voice], PY);
      const lines = (r.stdout ?? '').split('\n');
      for (const l of lines.filter((l) => l.startsWith('FAIL'))) { console.log('  ' + l); failed.add(l.split(/\s+/)[1].replace(':', '')); }
      console.log('  ' + lines.filter(Boolean).slice(-1)[0]);
    } else {
      let n = 0;
      await pool(list, v.engine === 'ko' ? 4 : 6, async (it) => {
        try {
          if (v.engine === 'ko') {
            const { buf, variant, attempts } = await speakReliable(it.text, { apiKey: env.GOOGLE_TTS_KEY, workDir: `${WORK}/probe` });
            if (variant !== 'plain' || attempts > 1) console.log(`  ↻ «${it.text}»: ${variant}, ${attempts} кӯшиш`);
            writeFileSync(`${RAW}/${it.id}.mp3`, buf);
          } else {
            // Chirp3-HD гоҳ клипи хомӯш медиҳад (ниг. `_ko-tts-google.mjs`) → садо санҷида мешавад.
            let ok = false;
            for (let k = 0; k < 4 && !ok; k++) {
              writeFileSync(`${RAW}/${it.id}.mp3`, await googleSynth(it.text, v.lc, v.voice));
              ok = checkEnergy([`${RAW}/${it.id}.mp3`]).length === 0;
              if (!ok) console.log(`  ↻ «${it.text.slice(0, 40)}»: хомӯш, кӯшиши ${k + 2}`);
            }
            if (!ok) throw new Error('4 бор хомӯш');
          }
        } catch (e) { failed.add(it.id); console.log(`  ✗ «${it.text.slice(0, 40)}»: ${e.message}`); }
        if (++n % 50 === 0) console.log(`  ${n}/${list.length}`);
      });
    }
    const made = list.filter((it) => !failed.has(it.id));
    if (v.trim) {
      console.log('  ' + execFileSync('python', ['prisma/_ar-trim.py', RAW, TRIM], PY).trim().split('\n').slice(-1)[0]);
      const { still, usedRaw } = useTrimOrRaw(made.map((it) => [`${RAW}/${it.id}.mp3`, `${TRIM}/${it.id}.mp3`]));
      if (usedRaw) console.log(`  ${usedRaw} клипи кӯтоҳ бе буриш монд`);
      for (const p of still) failed.add(p.split('/').pop().replace('.mp3', ''));
      for (const it of made) if (!failed.has(it.id)) copyFileSync(`${TRIM}/${it.id}.mp3`, finalPath(it));
    } else {
      for (const it of made) copyFileSync(`${RAW}/${it.id}.mp3`, finalPath(it));
    }
    const ready = list.filter((it) => !failed.has(it.id));
    const m = measure(ready.map(finalPath));
    let bad = 0;
    for (const it of ready) {
      const why = verdict(it, m[finalPath(it)]);
      if (why) { bad++; console.log(`  ✗ «${it.text}»: ${why}`); continue; }
      manifest[it.id] = { text: it.text, vkey: it.vkey, lang: it.lang, md5: m[finalPath(it)].md5, ok: true };
    }
    saveManifest();
    console.log(`  ✓ ${ready.length - bad}/${list.length} тайёр${bad + failed.size ? ` · ${bad + failed.size} НОКОМ (--gen-ро такрор кунед)` : ''}`);
  }
}

// ── Push ба ramz-audio ───────────────────────────────────────────────────────
const URLS = `${WORK}/urls.json`;
if (PUSH) {
  const notDone = items.filter((it) => !isDone(it));
  if (notDone.length) { console.error(`⛔ ${notDone.length} клип ҳанӯз тайёр нест — аввал --gen`); process.exit(1); }
  const git = (a) => execFileSync('git', a, { cwd: REPO, encoding: 'utf8' }).trim();
  if (!existsSync(`${REPO}/.git/HEAD`)) throw new Error(`клони ${REPO} нест`);
  git(['fetch', '--depth', '1', 'origin', 'main']);
  git(['reset', '--hard', 'origin/main']);
  // Папкаи НАВ — sparse-checkout ҳазорҳо файли кӯҳнаи en/ko-ро зеркашӣ намекунад.
  if (!git(['sparse-checkout', 'list']).split('\n').includes('audio/gx')) git(['sparse-checkout', 'add', 'audio/gx']);
  const rel = (it) => `audio/gx/${it.lang}/${it.id}.mp3`;
  for (const it of items) {
    mkdirSync(`${REPO}/audio/gx/${it.lang}`, { recursive: true });
    copyFileSync(finalPath(it), `${REPO}/${rel(it)}`);
  }
  for (let i = 0; i < items.length; i += 200) git(['add', ...items.slice(i, i + 200).map(rel)]);
  if (git(['status', '--porcelain']).trim()) {
    git(['-c', 'user.name=RAMZ Content', '-c', 'user.email=help@ramz.tj', 'commit', '-q', '-m',
      'Grammar exercises: correct-sentence audio for every course (en, ru, ar, ko, de)']);
    git(['push', '-q', 'origin', 'HEAD:main']);
  }
  const sha = git(['rev-parse', 'HEAD']);
  console.log(`commit: ${sha}`);
  const url = (it) => `${CDN}@${sha}/${rel(it)}`;
  let pending = items;
  for (let a = 1; a <= 8 && pending.length; a++) {
    const m = measure(pending.map(url));
    pending = pending.filter((it) => m[url(it)]?.md5 !== manifest[it.id].md5);
    if (pending.length) { console.log(`CDN кӯшиши ${a}: ${pending.length} ҳанӯз нест…`); await sleep(15000); }
  }
  if (pending.length) { console.error(`⛔ CDN: ${pending.length} файл md5 надод — база даст нахӯрд`); process.exit(1); }
  writeFileSync(URLS, JSON.stringify(Object.fromEntries(items.map((it) => [it.id, url(it)])), null, 1));
  console.log(`✓ CDN: ҳамаи ${items.length} файл md5-и айнан баробар · ${URLS}`);
}

// ── Навиштан ба база ─────────────────────────────────────────────────────────
if (APPLY) {
  if (!existsSync(URLS)) { console.error('⛔ urls.json нест — аввал --push'); process.exit(1); }
  const urls = JSON.parse(readFileSync(URLS, 'utf8'));
  // Ҳамон сутуне, ки `prisma db push` аз `String?` месозад — деплой баъдан drift намебинад.
  await sql`ALTER TABLE "GrammarExercise" ADD COLUMN IF NOT EXISTS "audioUrl" TEXT`;
  const fresh = await sql`SELECT id, type, prompt, answer, "audioUrl" FROM "GrammarExercise"`;
  const byId = Object.fromEntries(fresh.map((r) => [r.id, r]));
  const writes = [], topics = new Set();
  for (const it of items) {
    const r = byId[it.id];
    const u = urls[it.id];
    if (!r || !u || r.audioUrl === u) continue;
    // Машқ баъди сабт тағйир ёфта бошад — аудиои кӯҳна ҷумлаи дигарро мегӯяд.
    if (exerciseSentence(r, it.lang).text !== manifest[it.id].text) { console.log(`  ! тағйир ёфт, гузашт: ${r.prompt}`); continue; }
    writes.push(sql`UPDATE "GrammarExercise" SET "audioUrl"=${u} WHERE id=${it.id} AND prompt=${r.prompt} AND answer=${r.answer}`);
    topics.add(it.tid);
  }
  for (let i = 0; i < writes.length; i += 100) await sql.transaction(writes.slice(i, i + 100));
  const cnt = await sql`SELECT tl.code, count(e."audioUrl") n, count(*) total FROM "GrammarExercise" e
    JOIN "GrammarTopic" t ON t.id=e."topicId" JOIN "Course" c ON c.id=t."courseId" JOIN "Language" tl ON tl.id=c."targetLanguageId"
    GROUP BY 1 ORDER BY 1`;
  console.table(cnt);
  if (writes.length) {
    // Навиштани мустақими SQL `lib/contentVersion.ts`-ро иҷро намекунад → дастӣ:
    // бахшҳое, ки ин мавзӯъҳоро таълим медиҳанд + парчами глобалӣ.
    const mods = await sql`UPDATE "Module" SET "contentVersion" = "contentVersion" + 1
      WHERE id IN (SELECT DISTINCT "moduleId" FROM "Lesson" WHERE "grammarTopicId" = ANY(${[...topics]})) RETURNING id`;
    const [g] = await sql`SELECT "valueJson" v FROM "AppSetting" WHERE key='content_version'`;
    const next = String(Number(String(g?.v ?? '0').replace(/"/g, '')) + 1);
    await sql`UPDATE "AppSetting" SET "valueJson"=${next}, "updatedAt"=now() WHERE key='content_version'`;
    console.log(`✅ ${writes.length} машқ аудио гирифт · ${mods.length} бахш contentVersion+1 · content_version → ${next}`);
  } else console.log('Ҳама аллакай навишта шудааст.');
}

if (!GEN && !PUSH && !APPLY) console.log('\n(нақша) --gen → --push → --apply');
