// Аудиои бахши ГУФТОР — АНГЛИСӢ: тавлиди нав + буриши хомӯшии клипҳои кӯҳна.
//
// ── Ду мушкиле, ки ин скрипт ҳал мекунад ───────────────────────────────────
// 1. 188 воҳиди нави боби «Шиносоӣ» (дарсҳои 6–26) аудио надоштанд → TTS-и
//    дастгоҳ мехонд, ки дар баъзе телефонҳо тамоман хомӯш аст.
// 2. Ҳамаи 309 клипи кӯҳна рост аз edge-tts ба CDN рафта буданд: ҳар яке
//    ~0.22с хомӯшии САР ва ~1.1с хомӯшии ОХИР дорад (ченак 20.09.2026).
//    Хомӯшии сар ҳамон «таъхир»-ест, ки хонанда ҳангоми пахши 🔊 ҳис мекунад.
//    Бастаҳои `ru`/`ar` аллакай бурида шудаанд — ин ҷо ҳамон қоида ба
//    англисӣ оварда мешавад.
//
// ── Чаро jsDelivr, на Vercel Blob ──────────────────────────────────────────
// 🔴 20.09.2026: анбори Blob МУВАҚҚАТАН БАСТА аст — `put()` «This store has
// been suspended» медиҳад ва ҳамаи URL-ҳои мавҷудаи Blob 403 бармегардонанд.
// Пас бахши англисӣ дар ҳамон роҳи кории худ мемонад: репои `ramz-audio` →
// jsDelivr. URL ба SHA-и КОММИТ баста мешавад, вагарна кэши jsDelivr нусхаи
// кӯҳнаро моҳҳо нигоҳ медорад — барои ҳамин баъди буриш URL низ нав мешавад.
//
// Овоз: `en-US-AriaNeural` — ҳамон овози 309 клипи мавҷуда (`_speaking-tts.py`).
//
//   node prisma/_en-speaking-audio.mjs <ramz-audio dir> [--dry] [--no-push]
//
// Идемпотент: файли аллакай буридашуда аз нав бурида намешавад (танҳо
// онҳое, ки хомӯшии сарашон аз ҳад зиёд аст), воҳиди аудиодор аз нав
// тавлид намешавад.
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, copyFileSync } from 'fs';
import { execFileSync, execSync, spawnSync } from 'child_process';
import { neon } from '@neondatabase/serverless';

const REPO = process.argv[2];
if (!REPO || REPO.startsWith('--')) throw new Error('Истифода: node prisma/_en-speaking-audio.mjs <ramz-audio dir>');
const DRY = process.argv.includes('--dry');
const NO_PUSH = process.argv.includes('--no-push');

const VOICE = 'en-US-AriaNeural';
const CDN_DIR = `${REPO}/audio/en`;
const WORK = 'tmp/en-speaking-audio';
const TRIM = `${WORK}-trim`;
const PY = { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' }, maxBuffer: 1 << 26 };
/** Хомӯшии сар аз ин зиёд бошад — клип бурида мешавад. */
const LEAD_MAX = 0.12;

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }),
);
const sql = neon(env.DATABASE_URL);

/** Ченаки акустикӣ; калон бошад, ба гурӯҳҳо тақсим мешавад (маҳдудияти cmd). */
const measure = (paths) => {
  const out = {};
  for (let i = 0; i < paths.length; i += 60) {
    const r = spawnSync('python', ['../tools/audio_check.py', ...paths.slice(i, i + 60)], PY);
    if (r.status !== 0) throw new Error(r.stderr);
    Object.assign(out, JSON.parse(r.stdout));
  }
  return out;
};
/**
 * Клипи солим?
 *
 * ⚠️ Ҳадди СОБИТИ «нутқ» (мисли скриптҳои ar/ru) барои англисӣ кор
 * НАМЕКУНАД: `audio_check.py` фреймро аз рӯи энергия месанҷад, вале
 * ҳуштакҳои оғози калима («straight», «spell») энергияи хеле паст доранд
 * ва ҳамчун ХОМӮШӢ шумурда мешаванд — клипи комилан солими «straight»
 * ҳамагӣ 0.20с «нутқ» дод ва ҳадди 0.25с онро рад кард.
 *
 * Пас меъёр НИСБӢ аст: буриш набояд нутқро КӮТОҲ кунад. Нусхаи хом
 * нуқтаи муқоиса мешавад.
 */
const passes = (m) => m && !m.error && m.peak >= 0.25 && m.speech >= 0.1 && m.dur >= 0.25;
const keptSpeech = (cut, raw) => passes(cut) && cut.speech >= (raw?.speech ?? 0) * 0.8;

mkdirSync(WORK, { recursive: true });
mkdirSync(TRIM, { recursive: true });

// ── 1. Воҳидҳо ──────────────────────────────────────────────────────────────
const EN = (await sql.query(`SELECT id FROM "Language" WHERE code = 'en'`))[0].id;
const items = await sql.query(
  `SELECT i.id, i.text, i."audioUrl" au, l."order" AS lesson, c."titleTranslated" AS cat, c."order" AS cord
     FROM "SpeakingItem" i
     JOIN "SpeakingLesson" l ON i."lessonId" = l.id
     JOIN "SpeakingCategory" c ON l."categoryId" = c.id
    WHERE c."targetLanguageId" = $1
    ORDER BY c."order", l."order", i."order"`, [EN]);
const fresh = items.filter((i) => !i.au);
console.log(`Воҳидҳои гуфтори англисӣ: ${items.length} · бе аудио: ${fresh.length}`);

// ── 2. Манбаи садо ──────────────────────────────────────────────────────────
// Нав → edge-tts; кӯҳна → нусхаи маҳаллии репои CDN (ё кашидан аз URL).
if (fresh.length && !DRY) {
  console.log(`\n== Тавлиди нав (${VOICE}) ==`);
  const job = `${WORK}/_job.json`;
  let pending = fresh;
  for (let attempt = 0; attempt < 3 && pending.length; attempt++) {
    writeFileSync(job, JSON.stringify(pending.map((i) => ({ id: i.id, text: i.text }))));
    for (const i of pending) if (existsSync(`${WORK}/${i.id}.mp3`)) rmSync(`${WORK}/${i.id}.mp3`);
    spawnSync('python', ['prisma/_speaking-tts.py', WORK, job], { ...PY, stdio: 'inherit' });
    const have = pending.filter((i) => existsSync(`${WORK}/${i.id}.mp3`));
    const m = measure(have.map((i) => `${WORK}/${i.id}.mp3`));
    pending = pending.filter((i) => {
      const v = m[`${WORK}/${i.id}.mp3`];
      if (passes(v)) return false;
      if (v) console.log(`  ↻ «${i.text}» peak=${v.peak} нутқ=${v.speech}`);
      return true;
    });
  }
  if (pending.length) { console.error(`⛔ садо надод: ${pending.map((i) => i.text).join(', ')}`); process.exit(1); }
}

const old = items.filter((i) => i.au);
for (const it of old) {
  const src = `${CDN_DIR}/${it.id}.mp3`;
  const dst = `${WORK}/${it.id}.mp3`;
  if (existsSync(dst)) continue;
  if (existsSync(src)) { copyFileSync(src, dst); continue; }
  if (DRY) continue;
  const r = await fetch(it.au);
  if (!r.ok) { console.error(`⛔ ${r.status} ${it.au}`); process.exit(1); }
  writeFileSync(dst, Buffer.from(await r.arrayBuffer()));
}

// ── 3. Кадомаш буридан лозим ────────────────────────────────────────────────
const have = items.filter((i) => existsSync(`${WORK}/${i.id}.mp3`));
const before = measure(have.map((i) => `${WORK}/${i.id}.mp3`));
const need = have.filter((i) => {
  const m = before[`${WORK}/${i.id}.mp3`];
  return !i.au || !m || m.lead > LEAD_MAX;
});
{
  const lead = have.map((i) => before[`${WORK}/${i.id}.mp3`]?.lead ?? 0).sort((a, b) => a - b);
  const dur = have.map((i) => before[`${WORK}/${i.id}.mp3`]?.dur ?? 0).sort((a, b) => a - b);
  console.log(`\nПеш аз буриш: хомӯшии сар median ${lead[Math.floor(lead.length / 2)]}s · дарозӣ median ${dur[Math.floor(dur.length / 2)]}s`);
  console.log(`Буридан лозим: ${need.length} аз ${have.length}`);
}
if (DRY) { console.log('--dry: ҳеҷ чиз бурида ва бор нашуд.'); process.exit(0); }

// ── 4. Буриш ва муҳофиз ─────────────────────────────────────────────────────
for (const i of need) if (existsSync(`${TRIM}/${i.id}.mp3`)) rmSync(`${TRIM}/${i.id}.mp3`);
// `_ar-trim.py` тамоми ҷузвдонро мебурад — файлҳои нолозимро муваққатан
// ҷудо мекунем, то ҳар давидан танҳо бо `need` кор кунад.
{
  const box = `${WORK}-src`;
  if (existsSync(box)) rmSync(box, { recursive: true });
  mkdirSync(box, { recursive: true });
  for (const i of need) copyFileSync(`${WORK}/${i.id}.mp3`, `${box}/${i.id}.mp3`);
  console.log(execFileSync('python', ['prisma/_ar-trim.py', box, TRIM], PY).trim());
}
{
  const cut = measure(need.map((i) => `${TRIM}/${i.id}.mp3`));
  for (const it of need) {
    if (keptSpeech(cut[`${TRIM}/${it.id}.mp3`], before[`${WORK}/${it.id}.mp3`])) continue;
    if (passes(before[`${WORK}/${it.id}.mp3`])) {
      copyFileSync(`${WORK}/${it.id}.mp3`, `${TRIM}/${it.id}.mp3`);
      console.log(`  ↩ «${it.text}»: нусхаи бурида хомӯш шуд → хом`);
    } else { console.error(`⛔ файли хомӯш баъди буриш: «${it.text}»`); process.exit(1); }
  }
}
// peak ≥0.97 → 15% оромтар (ниг. `_ru-speaking-audio.mjs`).
const FFMPEG = execFileSync('python', ['-c', 'import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())'], PY).trim();
{
  const pre = measure(need.map((i) => `${TRIM}/${i.id}.mp3`));
  for (const it of need) {
    const p = `${TRIM}/${it.id}.mp3`;
    if (pre[p].peak < 0.97) continue;
    const tmp = `${TRIM}/${it.id}.vol.mp3`;
    execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-i', p, '-af', 'volume=0.85', '-ar', '24000', '-ac', '1', '-b:a', '64k', tmp]);
    copyFileSync(tmp, p);
    rmSync(tmp);
    console.log(`  🔉 «${it.text}»: peak ${pre[p].peak} → оромтар`);
  }
}
{
  const final = measure(need.map((i) => `${TRIM}/${i.id}.mp3`));
  let bad = 0;
  const lead = [];
  const dur = [];
  for (const it of need) {
    const m = final[`${TRIM}/${it.id}.mp3`];
    lead.push(m.lead); dur.push(m.dur);
    const raw = before[`${WORK}/${it.id}.mp3`];
    const ok = m.peak < 0.995 && keptSpeech(m, raw);
    if (!ok) { console.log(`  ✗ ${it.cat} L${it.lesson + 1} «${it.text}» ${m.dur}s нутқ=${m.speech}s пеш=${m.lead}s peak=${m.peak}`); bad++; }
  }
  lead.sort((a, b) => a - b); dur.sort((a, b) => a - b);
  console.log(`Баъди буриш: median пеш ${lead[Math.floor(lead.length / 2)]}s · дарозӣ ${dur[Math.floor(dur.length / 2)]}s · бад ${bad}`);
  if (bad) { console.error('⛔ файли бад ҳаст — ҳеҷ чиз ба CDN нарафт'); process.exit(1); }
}

// ── 5. Ба репои CDN ва push ─────────────────────────────────────────────────
for (const it of need) copyFileSync(`${TRIM}/${it.id}.mp3`, `${CDN_DIR}/${it.id}.mp3`);
console.log(`\n== Ба репо: ${need.length} файл ==`);
const dirty = execSync('git status --porcelain audio/en', { cwd: REPO }).toString().trim();
if (dirty && !NO_PUSH) {
  execSync('git add audio/en', { cwd: REPO, stdio: 'inherit' });
  execSync(
    'git -c user.email="255218020+kholzoda2001-coder@users.noreply.github.com" '
    + '-c user.name="kholzoda2001-coder" commit -m "Speaking EN: 188 new clips + silence trim for the whole section"',
    { cwd: REPO, stdio: 'inherit' });
  execSync('git push origin HEAD', { cwd: REPO, stdio: 'inherit' });
} else if (!dirty) {
  console.log('  тағйирот нест — коммити ҷорӣ истифода мешавад');
}
const sha = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim();
const cdn = (id) => `https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio@${sha}/audio/en/${id}.mp3`;
console.log('SHA:', sha);

// ── 6. Навиштани audioUrl ───────────────────────────────────────────────────
// ⚠️ URL-и клипҳои БУРИДАШУДА низ нав мешавад: он ба SHA баста аст ва бе
// иваз кардан хонанда нусхаи кӯҳнаро (аз кэши jsDelivr) мегирад.
const backup = need.map((i) => ({ id: i.id, text: i.text, old: i.au }));
writeFileSync(`${WORK}/_backup-urls.json`, JSON.stringify(backup, null, 1));
let wrote = 0;
for (const it of need) {
  await sql.query(`UPDATE "SpeakingItem" SET "audioUrl" = $1 WHERE id = $2`, [cdn(it.id), it.id]);
  if (++wrote % 50 === 0) console.log(`  ...${wrote}/${need.length}`);
}
await sql.query(
  `INSERT INTO "AppSetting" (key, "valueJson", "updatedAt") VALUES ('content_version', '"1"', NOW())
   ON CONFLICT (key) DO UPDATE SET "updatedAt" = NOW()`);
console.log(`навишта шуд: ${wrote} · content_version ламс шуд`);
