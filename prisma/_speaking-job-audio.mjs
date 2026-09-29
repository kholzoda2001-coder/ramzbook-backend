// Аудиои ҷумлаҳои «Гуфтор» бо `{job}` — барои ҲАР ҳадаф бо овози курс (29.09.2026).
//
// Санҷиши зинда: «I am a builder» бо овози роботии телефон садо медод — ҷумлаи
// шахсисозишуда аудиои тайёр надошт. Акнун ҳар ҷумла 5 клип дорад
// (build/drive/service/study/life) ва `SpeakingItem.audioUrl` = `…/<id>_{goal}.mp3`;
// барнома `{goal}`-ро бо ҳадафи хонанда иваз мекунад (`speaking_persona.dart`
// `_personalAudio`). Версияи кӯҳнаи барнома URL-ро айнан мехонад → 404 → TTS (мисли пештара).
//
// Касбҳо — айнан ҷадвали `SpeakingPersona._jobs` (frontend).
//
//   node prisma/_speaking-job-audio.mjs            # нақша
//   node prisma/_speaking-job-audio.mjs --gen      # сабт + буриши хомӯшии сар + санҷиш
//   node prisma/_speaking-job-audio.mjs --push     # ramz-audio + md5 аз CDN
//   node prisma/_speaking-job-audio.mjs --apply    # SpeakingItem.audioUrl (танҳо холӣ)
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs';
import { execFileSync, spawnSync } from 'child_process';
import { createHash } from 'crypto';
import { neon } from '@neondatabase/serverless';
import { speakReliable } from './_ko-tts-google.mjs';

const argv = process.argv.slice(2);
const GEN = argv.includes('--gen'), PUSH = argv.includes('--push'), APPLY = argv.includes('--apply');
const WORK = 'tmp/job-audio';
const REPO = (process.env.RAMZ_AUDIO_REPO || `${process.env.TEMP}/ramz-audio-audio`).replace(/\\/g, '/');
const CDN = 'https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio';
const PYEXE = 'C:/Users/ASUS1/AppData/Local/Python/pythoncore-3.14-64/python.exe';
const PY = { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' }, maxBuffer: 1 << 26 };
const env = Object.fromEntries(readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')
  .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
  .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sql = neon(env.DATABASE_URL);

const JOBS = {
  build: { ru: 'строитель', en: 'a builder', de: 'Bauarbeiter', tr: 'inşaat işçisiyim', ar: 'عَامِلُ بِنَاء', ko: '건설 노동자예요' },
  drive: { ru: 'водитель', en: 'a driver', de: 'Fahrer', tr: 'şoförüm', ar: 'سَائِق', ko: '운전기사예요' },
  service: { ru: 'продавец', en: 'a salesperson', de: 'Verkäufer', tr: 'satıcıyım', ar: 'بَائِع', ko: '판매원이에요' },
  study: { ru: 'студент', en: 'a student', de: 'Student', tr: 'öğrenciyim', ar: 'طَالِب', ko: '학생이에요' },
  life: { ru: 'рабочий', en: 'a worker', de: 'Arbeiter', tr: 'işçiyim', ar: 'عَامِل', ko: '노동자예요' },
};
// Овози «Гуфтор»-и ҳар забон — ҳамон `LANGS`-и `_speaking-audio-lang.mjs`.
const VOICE = {
  ru: { engine: 'google', lc: 'ru-RU', voice: 'ru-RU-Chirp3-HD-Kore' },
  en: { engine: 'google', lc: 'en-US', voice: 'en-US-Chirp3-HD-Kore' },
  ar: { engine: 'edge', voice: 'ar-SA-ZariyahNeural' },
  ko: { engine: 'ko' },
  tr: { engine: 'edge', voice: 'tr-TR-EmelNeural' },
  de: { engine: 'edge', voice: 'de-DE-KatjaNeural' },
};

const rows = await sql.query(`SELECT i.id, i.text, i."audioUrl", l.code lang FROM "SpeakingItem" i
  JOIN "SpeakingLesson" s ON s.id=i."lessonId" JOIN "SpeakingCategory" c ON c.id=s."categoryId"
  JOIN "Language" l ON l.id=c."targetLanguageId"
  WHERE i.text LIKE '%{job}%' AND i.text NOT LIKE '%{name}%'`);
const clips = [];
for (const r of rows) {
  if (!VOICE[r.lang]) { console.log(`  — ${r.lang}: овоз нест, гузашт «${r.text}»`); continue; }
  for (const goal of Object.keys(JOBS)) {
    clips.push({ id: r.id, lang: r.lang, goal, key: `${r.id}_${goal}`, text: r.text.replace('{job}', JOBS[goal][r.lang]) });
  }
}
console.log(`ҷумлаҳо: ${rows.length} · клипҳо: ${clips.length}`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const md5f = (p) => createHash('md5').update(readFileSync(p)).digest('hex');
const RAW = `${WORK}/raw`, FIN = `${WORK}/final`;
for (const d of [RAW, FIN]) mkdirSync(d, { recursive: true });

function measure(paths) {
  const out = {};
  for (let i = 0; i < paths.length; i += 100) {
    const r = spawnSync(PYEXE, ['../tools/audio_check.py', ...paths.slice(i, i + 100)], PY);
    Object.assign(out, JSON.parse(r.stdout || '{}'));
  }
  return out;
}
async function google(text, lc, voice) {
  for (let a = 0; a < 4; a++) {
    const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${env.GOOGLE_TTS_KEY}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: { text }, voice: { languageCode: lc, name: voice }, audioConfig: { audioEncoding: 'MP3' } }),
    });
    const d = await res.json().catch(() => ({}));
    if (res.ok && d.audioContent) return Buffer.from(d.audioContent, 'base64');
    await sleep(1500 * (a + 1));
  }
  throw new Error('Google TTS');
}
function edge(text, voice, out) {
  const r = spawnSync(PYEXE, ['-m', 'edge_tts', '--voice', voice, '--text', text, '--write-media', out], { ...PY, timeout: 30000 });
  if (r.status !== 0 || !existsSync(out)) throw new Error('edge-tts');
}
const good = (m) => m && !m.error && m.peak >= 0.3 && m.speech >= 0.3;

if (GEN) {
  for (const c of clips.filter((c) => !existsSync(`${FIN}/${c.key}.mp3`))) {
    const v = VOICE[c.lang];
    const raw = `${RAW}/${c.key}.mp3`;
    let ok = false;
    for (let a = 0; a < 4 && !ok; a++) {
      try {
        if (v.engine === 'edge') edge(c.text, v.voice, raw);
        else if (v.engine === 'ko') writeFileSync(raw, (await speakReliable(c.text, { apiKey: env.GOOGLE_TTS_KEY, workDir: `${WORK}/probe` })).buf);
        else writeFileSync(raw, await google(c.text, v.lc, v.voice));
        ok = good(measure([raw])[raw]); // Chirp3 гоҳ клипи хомӯш медиҳад
      } catch (e) { console.log(`  ↻ «${c.text}»: ${e.message}`); }
    }
    console.log(`  ${ok ? '✓' : '✗'} ${c.lang} ${c.goal.padEnd(7)} «${c.text}»`);
  }
  // Хомӯшии сар — ҳамон `tools/trim_lead.py` (ҳадди шувво + 60 мс захира + санҷиши нутқ).
  const made = clips.filter((c) => existsSync(`${RAW}/${c.key}.mp3`));
  writeFileSync(`${WORK}/items.json`, JSON.stringify(made.map((c) => ({ key: c.key, url: `${RAW}/${c.key}.mp3` }))));
  const r = spawnSync(PYEXE, ['../tools/trim_lead.py', `${WORK}/items.json`, `${WORK}/lead`, `${WORK}/lead.json`, '--min', '0.15'], PY);
  console.log('буриш:', r.stdout.trim());
  const rep = JSON.parse(readFileSync(`${WORK}/lead.json`, 'utf8'));
  for (const c of made) copyFileSync(rep[c.key]?.status === 'trimmed' ? `${WORK}/lead/${c.key}.mp3` : `${RAW}/${c.key}.mp3`, `${FIN}/${c.key}.mp3`);
  const m = measure(made.map((c) => `${FIN}/${c.key}.mp3`));
  const bad = made.filter((c) => !good(m[`${FIN}/${c.key}.mp3`]) || m[`${FIN}/${c.key}.mp3`].lead > 0.3);
  bad.forEach((c) => console.log(`  ✗ санҷиш: «${c.text}» ${JSON.stringify(m[`${FIN}/${c.key}.mp3`])}`));
  console.log(`тайёр: ${made.length - bad.length}/${clips.length}`);
  if (bad.length || made.length < clips.length) process.exit(1);
}

const URLS = `${WORK}/sha.json`;
if (PUSH) {
  if (clips.some((c) => !existsSync(`${FIN}/${c.key}.mp3`))) { console.error('⛔ аввал --gen'); process.exit(1); }
  const git = (a) => execFileSync('git', a, { cwd: REPO, encoding: 'utf8', maxBuffer: 1 << 26 }).trim();
  const rel = (c) => `audio/job/${c.lang}/${c.key}.mp3`;
  for (let attempt = 1; ; attempt++) {
    git(['fetch', '--depth', '1', 'origin', 'main']);
    git(['reset', '--hard', 'origin/main']);
    if (!git(['sparse-checkout', 'list']).split('\n').includes('audio/job')) git(['sparse-checkout', 'add', 'audio/job']);
    for (const c of clips) { mkdirSync(`${REPO}/audio/job/${c.lang}`, { recursive: true }); copyFileSync(`${FIN}/${c.key}.mp3`, `${REPO}/${rel(c)}`); }
    git(['add', ...clips.map(rel)]);
    if (!git(['status', '--porcelain']).trim()) break;
    git(['-c', 'user.name=RAMZ Content', '-c', 'user.email=help@ramz.tj', 'commit', '-q', '-m',
      `Speaking: recorded audio for {job} phrases, one clip per goal (${clips.length})`]);
    try { git(['push', '-q', 'origin', 'HEAD:main']); break; } catch (e) { if (attempt >= 4) throw e; await sleep(5000); }
  }
  const sha = git(['rev-parse', 'HEAD']);
  const url = (c) => `${CDN}@${sha}/${rel(c)}`;
  let pending = clips;
  for (let a = 0; a < 8 && pending.length; a++) {
    const m = measure(pending.map(url));
    pending = pending.filter((c) => m[url(c)]?.md5 !== md5f(`${FIN}/${c.key}.mp3`));
    if (pending.length) { console.log(`CDN: ${pending.length} ҳанӯз нест`); await sleep(15000); }
  }
  if (pending.length) { console.error('⛔ CDN'); process.exit(1); }
  writeFileSync(URLS, JSON.stringify({ sha }));
  console.log(`✓ CDN: ${clips.length} файл md5 баробар · ${sha}`);
}

if (APPLY) {
  const { sha } = JSON.parse(readFileSync(URLS, 'utf8'));
  let n = 0;
  for (const r of rows.filter((r) => VOICE[r.lang])) {
    const tpl = `${CDN}@${sha}/audio/job/${r.lang}/${r.id}_{goal}.mp3`;
    const u = await sql.query(`UPDATE "SpeakingItem" SET "audioUrl"=$1 WHERE id=$2 AND coalesce("audioUrl",'')='' RETURNING 1`, [tpl, r.id]);
    n += u.length;
  }
  console.log(`✅ ${n} ҷумла URL-и қолабӣ гирифт`);
}
if (!GEN && !PUSH && !APPLY) console.log('(нақша) --gen → --push → --apply');
