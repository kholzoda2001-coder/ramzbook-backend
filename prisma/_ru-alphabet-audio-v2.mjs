// Аудиои НАВИ 33 ҳарфи алифбои русӣ (ru → tg) — ором, пурра ва якхела баланд.
//
// ЧАРО (санҷиш 11.09.2026, tools/alpha_audio_probe.py): партияи 22.08
// (edge-tts Svetlana) ҳарфро дар 0.12–0.30 с «мепаронд» («Ка», «Ы», «А» ≈ 0.12 с)
// ва баландӣ то 4.9 dB фарқ мекард. Корбар: «овозашон ба ман писанд наомад».
// Озмоиши 7 овоз: Google Chirp3-HD барои ҳарфи ягона РАД шуд (файлҳои хомӯш,
// таъхири 1 с); Google Wavenet бо SSML «rate=slow, pitch=-1st» нутқи 0.26–0.92 с,
// таъхири ≤ 0.3 с, оҳанги фуроянда ва 0 клиппинг дод.
//
// ТАРТИБ (ҳар қадам пеш аз навбатӣ месанҷад):
//   тавлид + баробарсозии баландӣ (tools/alpha_tts_final.py, −18 dBFS ± 1)
//   → санҷиши МАҲАЛЛӢ (хомӯш, кӯтоҳ, таъхир, клиппинг, хатои дешифргар)
//   → нусхаи эҳтиётии URL-ҳои кӯҳна → push ба ramz-audio (alphabet/ru/<id>.mp3)
//   → CDN (md5 = маҳаллӣ) → сабт дар база → content_version → санҷиш аз API.
//
//   node prisma/_ru-alphabet-audio-v2.mjs --voice ru-RU-Wavenet-C --dry
//   node prisma/_ru-alphabet-audio-v2.mjs --voice ru-RU-Wavenet-C
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs';
import { execFileSync, spawnSync } from 'child_process';
import { connect, RU, TG } from './_ru-fix-lib.mjs';

const sql = connect();
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const DRY = process.argv.includes('--dry');
const VOICE = arg('--voice');
if (!/^ru-RU-Wavenet-[A-E]$/.test(VOICE || '')) throw new Error('--voice ru-RU-Wavenet-A…E лозим аст');
const WORK = `tmp/ru-alphabet-v2/${VOICE}`;
const REPO = `${process.env.TEMP}/ramz-audio-audio`.replace(/\\/g, '/');
const CDN = 'https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio';
const API = 'https://admin.ramz.tj/api/mobile';
const PY = { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' }, maxBuffer: 1 << 26 };

const letters = await sql`SELECT id,uppercase u,"audioUrl" au FROM "AlphabetLetter"
  WHERE "targetLanguageId"=${RU} AND "nativeLanguageId"=${TG} ORDER BY "order"`;
if (letters.length !== 33) throw new Error(`33 ҳарф интизор буд, ${letters.length} ёфт шуд`);

// ── 0. Нусхаи эҳтиётӣ (як бор) ───────────────────────────────────────────────
const BACKUP = '../tmp/ru-alphabet-audio-BACKUP-2026-09-11.json';
if (!existsSync(BACKUP)) {
  writeFileSync(BACKUP, JSON.stringify(letters, null, 1));
  console.log(`нусхаи эҳтиётӣ: ${BACKUP}`);
}

// ── 1. Тавлид ────────────────────────────────────────────────────────────────
mkdirSync(WORK, { recursive: true });
writeFileSync(`${WORK}/items.json`, JSON.stringify(letters.map((l) => ({ id: l.id, letter: l.u }))));
console.log(`\n== Тавлид: ${VOICE} ==`);
const gen = spawnSync('python', ['../tools/alpha_tts_final.py', VOICE, WORK, `${WORK}/items.json`], PY);
if (gen.status !== 0) throw new Error(`тавлид: ${gen.stderr}`);
console.log(gen.stdout.trim().split('\n').slice(-1)[0]);

// ── 2. Санҷиши маҳаллӣ ───────────────────────────────────────────────────────
const probeIn = `${WORK}/probe.json`;
writeFileSync(probeIn, JSON.stringify(letters.map((l) => ({ label: l.u, src: `${WORK}/${l.id}.mp3`, id: l.id }))));
const pr = spawnSync('python', ['../tools/alpha_audio_probe.py', probeIn], PY);
if (pr.status !== 0) throw new Error(pr.stderr);
const probe = JSON.parse(readFileSync(probeIn.replace('.json', '.probe.json'), 'utf8'));
const chk = spawnSync('python', ['../tools/audio_check.py', ...letters.map((l) => `${WORK}/${l.id}.mp3`)], PY);
const decoderErr = /error/i.test(chk.stderr);
let bad = 0;
for (const p of probe) {
  const why = [];
  if (p.error) why.push(p.error);
  else {
    if (p.speech < 0.2) why.push(`нутқ ${p.speech}s`);
    if (p.lead > 0.35) why.push(`таъхир ${p.lead}s`);
    if (p.peak > 0.98) why.push(`клиппинг ${p.peak}`);
    if (Math.abs(p.loud_db + 18) > 1.5) why.push(`баландӣ ${p.loud_db} dB`);
    if (p.slope && p.slope > 1.2) why.push(`оҳанги боло ${p.slope}`);
  }
  if (why.length) { bad++; console.log(`  ✗ ${p.label}: ${why.join(', ')}`); }
}
const L = probe.filter((p) => !p.error).map((p) => p.loud_db);
console.log(`  33 файл · нутқ ${Math.min(...probe.map((p) => p.speech)).toFixed(2)}–${Math.max(...probe.map((p) => p.speech)).toFixed(2)}s`
  + ` · баландӣ ${Math.min(...L).toFixed(1)}…${Math.max(...L).toFixed(1)} dB · дешифргар: ${decoderErr ? 'ХАТО' : 'тоза'} · бад: ${bad}`);

// ── 2b. САДОНОКИ ҲАР ҲАРФ ───────────────────────────────────────────────────
// Дарвозаи нав (12.09.2026). Санҷишҳои боло «файл солим аст»-ро мегӯянд, вале
// НЕ «файл ҳамон ҳарфро мегӯяд». Маҳз ҳамин холигӣ О=А-ро се ҳафта зинда нигоҳ
// дошт: ҳар ду файл солим буданд ва ҳар ду [а] мегуфтанд.
// Ы истиснои САБТШУДА аст: ҳеҷ як овози ru-RU (Wavenet A/C/E, Chirp3, edge)
// [ɨ]-и аслӣ намедиҳад — ҳам дар ҳарф, ҳам дар калимаи «вы/ты/мы» F2 ≈ 2500.
// Барои он сабти ОДАМ лозим; то он вақт огоҳӣ чоп мешавад, вале дарвоза намебандад.
const Y_EXCEPTION = new Set(['Ы']);
let vowelBad = 0;
for (const l of letters) {
  const r = spawnSync('python', ['prisma/_ru-vowel-check.py', `${WORK}/${l.id}.mp3`, l.u], PY);
  let j; try { j = JSON.parse((r.stdout || '').trim()); } catch { j = null; }
  if (!j) { vowelBad++; console.log(`  ✗ ${l.u}: санҷиши садонок иҷро нашуд`); continue; }
  if (j.ok) continue;
  const msg = `${l.u}: F1=${j.f1} F2=${j.f2} — қоидаи «${j.rule}» нагузашт`;
  if (Y_EXCEPTION.has(l.u)) console.log(`  ⚠ ${msg} (истиснои сабтшуда — TTS [ы] надорад)`);
  else { vowelBad++; console.log(`  ✗ ${msg}`); }
}
console.log(`  садонок: ${33 - vowelBad} аз 33 дуруст${vowelBad ? '' : ' (Ы — истисно)'}`);

// ── 2c. ДУ ҲАРФ ЯК САБТ НАБОШАД ─────────────────────────────────────────────
const dupRes = spawnSync('python', ['prisma/_ru-dup-check.py', ...letters.map((l) => `${WORK}/${l.id}.mp3`)], PY);
let dup; try { dup = JSON.parse((dupRes.stdout || '').trim()); } catch { dup = null; }
const dupBad = !dup || dupRes.status !== 0;
if (dup) {
  const name = (p) => letters.find((l) => p.endsWith(`${l.id}.mp3`))?.u ?? p;
  console.log(`  такрор: баландтарин ҳамбастагӣ ${dup.max}`
    + (dup.pairs.length ? ` (${dup.pairs.slice(0, 3).map(([c, a, b]) => `${name(a)}↔${name(b)} ${c}`).join(', ')})` : ''));
}
if (dupBad) console.log('  ✗ ду ҳарф як сабтанд');

if (bad || decoderErr || vowelBad || dupBad) { console.error('⛔ Санҷиши маҳаллӣ нагузашт — ҳеҷ чиз бор нашуд.'); process.exit(1); }
if (DRY) { console.log(`\n--dry: файлҳо дар ${WORK} тайёр ва санҷидаанд; ҳеҷ чиз бор/сабт нашуд.`); process.exit(0); }

// ── 3. Push ──────────────────────────────────────────────────────────────────
const git = (a) => execFileSync('git', a, { cwd: REPO, encoding: 'utf8' }).trim();
if (!existsSync(`${REPO}/.git/HEAD`)) throw new Error(`Клони ${REPO} нест`);
git(['fetch', '--depth', '1', 'origin', 'main']);
git(['reset', '--hard', 'origin/main']);
if (!git(['sparse-checkout', 'list']).split('\n').includes('alphabet/ru')) git(['sparse-checkout', 'add', 'alphabet/ru']);
mkdirSync(`${REPO}/alphabet/ru`, { recursive: true });
for (const l of letters) copyFileSync(`${WORK}/${l.id}.mp3`, `${REPO}/alphabet/ru/${l.id}.mp3`);
git(['add', ...letters.map((l) => `alphabet/ru/${l.id}.mp3`)]);
if (git(['status', '--porcelain']).trim()) {
  git(['-c', 'user.name=RAMZ Content', '-c', 'user.email=help@ramz.tj', 'commit', '-m',
    `Russian alphabet: re-record 33 letter names (${VOICE}, slow, loudness-matched)`]);
  git(['push', 'origin', 'HEAD:main']);
  console.log('\npush шуд');
}
const sha = git(['rev-parse', 'HEAD']);
console.log(`commit: ${sha}`);

// ── 4. CDN ───────────────────────────────────────────────────────────────────
const md5 = (paths) => JSON.parse(spawnSync('python', ['../tools/audio_check.py', ...paths], PY).stdout);
const local = md5(letters.map((l) => `${WORK}/${l.id}.mp3`));
for (const l of letters) l.url = `${CDN}@${sha}/alphabet/ru/${l.id}.mp3`;
let cdnBad = 33;
for (let a = 1; a <= 6 && cdnBad; a++) {
  const cdn = md5(letters.map((l) => l.url));
  cdnBad = letters.filter((l) => cdn[l.url]?.md5 !== local[`${WORK}/${l.id}.mp3`].md5).length;
  if (cdnBad) { console.log(`кӯшиши ${a}: ${cdnBad} ҳанӯз нест…`); await new Promise((r) => setTimeout(r, 10000)); }
}
if (cdnBad) { console.error('⛔ CDN — база даст нахӯрд.'); process.exit(1); }
console.log('✓ CDN: 33 файл md5 айнан баробар');

// ── 5. Сабт ──────────────────────────────────────────────────────────────────
for (const l of letters) {
  await sql`UPDATE "AlphabetLetter" SET "audioUrl"=${l.url} WHERE id=${l.id} AND "audioUrl"=${l.au}`;
  const [r] = await sql`SELECT "audioUrl" au FROM "AlphabetLetter" WHERE id=${l.id}`;
  if (r.au !== l.url) throw new Error(`ТАСДИҚ НАШУД: ${l.u}`);
}
console.log('✓ база: 33 истинод нав');
const [g] = await sql`SELECT "valueJson" v FROM "AppSetting" WHERE key='content_version'`;
const next = String(Number(String(g?.v ?? '0').replace(/"/g, '')) + 1);
await sql`UPDATE "AppSetting" SET "valueJson"=${next}, "updatedAt"=now() WHERE key='content_version'`;
console.log(`✓ content_version ${g?.v} → ${next}`);

// ── 6. Санҷиш аз API-и продакшн ─────────────────────────────────────────────
const j = await (await fetch(`${API}/alphabet?targetLanguageId=${RU}&nativeLanguageId=${TG}`)).json();
const apiLetters = j.letters ?? j;
const urls = apiLetters.map((x) => x.audioUrl);
const stale = apiLetters.filter((x) => !String(x.audioUrl).includes(`@${sha}/alphabet/ru/`));
const live = md5(urls);
const silent = Object.entries(live).filter(([, v]) => v.error || v.peak < 0.1);
console.log(`API: ${apiLetters.length} ҳарф · URL-и кӯҳна: ${stale.length} · хомӯш/шикаста: ${silent.length}`);
if (apiLetters.length !== 33 || stale.length || silent.length) { console.error('❌ API ҳанӯз пурра нав нест'); process.exit(1); }
console.log('✅ ҲАМАИ 33 ҲАРФ АЗ API БО АУДИОИ НАВ');
