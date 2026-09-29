// Буриши хомӯшии САРИ аудиои курсҳо (корбар, 29.09.2026: «вақте саҳифаи калима, муколама
// ё дарс кушода мешавад, овоз каме дер меояд»).
//
// Ченак аз CDN: калимаҳои РУСӢ миёна 0.56 с (то 0.84 с) хомӯшӣ дар сар доранд
// (Chirp3-HD-Kore), англисӣ баъзан то 0.68 с. Пилот (40 файл): 0.55–0.84 → 0.06 с,
// нутқ ±0.02 с — ҳеҷ садо бурида нашуд (`tools/trim_lead.py` худаш месанҷад).
// Танҳо файлҳое, ки хомӯшиашон ≥ --min (пешфарз 0.25 с) — хомӯшии табиии ~0.2 с-и
// edge-tts (de, tr, zh) даст нахӯрдааст: repo-и ramz-audio маҳдудияти jsDelivr дорад.
//
//   node prisma/_audio-trim-lead.mjs            # нақша
//   node prisma/_audio-trim-lead.mjs --gen      # зеркашӣ + ченак + буриш → tmp/trim-lead/
//   node prisma/_audio-trim-lead.mjs --push     # ramz-audio + md5 аз CDN
//   node prisma/_audio-trim-lead.mjs --apply    # база: URL-и нав + contentVersion
// Ҳар қадам идемпотент аст.
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs';
import { execFileSync, spawnSync } from 'child_process';
import { createHash } from 'crypto';
import { neon } from '@neondatabase/serverless';

const argv = process.argv.slice(2);
const GEN = argv.includes('--gen'), PUSH = argv.includes('--push'), APPLY = argv.includes('--apply');
const MIN = argv.includes('--min') ? Number(argv[argv.indexOf('--min') + 1]) : 0.25;
const WORK = 'tmp/trim-lead';
// Клони sparse-и ramz-audio: `RAMZ_AUDIO_REPO`, вагарна `%TEMP%/ramz-audio-audio`.
const REPO = (process.env.RAMZ_AUDIO_REPO || `${process.env.TEMP}/ramz-audio-audio`).replace(/\\/g, '/');
const CDN = 'https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio';
const PYEXE = 'C:/Users/ASUS1/AppData/Local/Python/pythoncore-3.14-64/python.exe';
const PY = { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' }, maxBuffer: 1 << 28 };
const env = Object.fromEntries(readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')
  .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
  .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sql = neon(env.DATABASE_URL);

// Ҷадвалҳои дарсҳои роҳнамо (на «Гуфтор» — он хомӯширо ҳангоми сабт мебурад).
const TABLES = [
  ['Word', 'audioUrl'], ['DialogueLine', 'audioUrl'], ['GrammarExample', 'audioUrl'],
  ['GrammarExercise', 'audioUrl'], ['ComprehensionExercise', 'audioUrl'], ['Phrase', 'audioUrl'],
  ['OnboardingWord', 'audioUrl'], ['AlphabetLetter', 'audioUrl'],
];
const urls = new Map(); // url → key
for (const [t, c] of TABLES) {
  for (const r of await sql.query(`SELECT DISTINCT "${c}" u FROM "${t}" WHERE "${c}" LIKE '${CDN}%'`)) {
    if (!urls.has(r.u)) urls.set(r.u, createHash('md5').update(r.u).digest('hex').slice(0, 20));
  }
}
console.log(`файлҳои CDN дар дарсҳо: ${urls.size} · ҳадди буриш: ${MIN} с`);

mkdirSync(`${WORK}/out`, { recursive: true });
const REPORT = `${WORK}/report.json`;
const report = existsSync(REPORT) ? JSON.parse(readFileSync(REPORT, 'utf8')) : {};
const trimmed = () => [...urls].filter(([, k]) => report[k]?.status === 'trimmed' && existsSync(`${WORK}/out/${k}.mp3`));

if (GEN) {
  const todo = [...urls].filter(([, k]) => !report[k] || report[k].status === 'error').map(([u, k]) => ({ key: k, url: u }));
  console.log(`\n== Ченак ва буриш: ${todo.length} файл ==`);
  for (let i = 0; i < todo.length; i += 400) {
    const batch = todo.slice(i, i + 400);
    writeFileSync(`${WORK}/batch.json`, JSON.stringify(batch));
    const r = spawnSync(PYEXE, ['../tools/trim_lead.py', `${WORK}/batch.json`, `${WORK}/out`, `${WORK}/batch-report.json`, '--min', String(MIN)], PY);
    if (r.status !== 0) { console.error(r.stderr); process.exit(1); }
    Object.assign(report, JSON.parse(readFileSync(`${WORK}/batch-report.json`, 'utf8')));
    writeFileSync(REPORT, JSON.stringify(report));
    console.log(`  ${Math.min(i + 400, todo.length)}/${todo.length} ${r.stdout.trim()}`);
  }
  const st = {};
  for (const [, k] of urls) st[report[k]?.status ?? 'нест'] = (st[report[k]?.status ?? 'нест'] || 0) + 1;
  console.log('ҳолат:', JSON.stringify(st));
  const gain = trimmed().map(([, k]) => report[k].onset - report[k].onset_after);
  if (gain.length) console.log(`буридашуда: ${gain.length} · миёна тезтар ${(gain.reduce((a, b) => a + b, 0) / gain.length).toFixed(2)} с`);
}

// ── Push ─────────────────────────────────────────────────────────────────────
const URLS = `${WORK}/urls.json`;
const md5f = (p) => createHash('md5').update(readFileSync(p)).digest('hex');
if (PUSH) {
  const list = trimmed();
  const git = (a) => execFileSync('git', a, { cwd: REPO, encoding: 'utf8', maxBuffer: 1 << 26 }).trim();
  if (!existsSync(`${REPO}/.git/HEAD`)) throw new Error(`клони ${REPO} нест`);
  const rel = (k) => `audio/lead/${k}.mp3`;
  for (let attempt = 1; ; attempt++) {
    git(['fetch', '--depth', '1', 'origin', 'main']);
    git(['reset', '--hard', 'origin/main']);
    if (!git(['sparse-checkout', 'list']).split('\n').includes('audio/lead')) git(['sparse-checkout', 'add', 'audio/lead']);
    mkdirSync(`${REPO}/audio/lead`, { recursive: true });
    for (const [, k] of list) copyFileSync(`${WORK}/out/${k}.mp3`, `${REPO}/${rel(k)}`);
    for (let i = 0; i < list.length; i += 200) git(['add', ...list.slice(i, i + 200).map(([, k]) => rel(k))]);
    if (!git(['status', '--porcelain']).trim()) break;
    git(['-c', 'user.name=RAMZ Content', '-c', 'user.email=help@ramz.tj', 'commit', '-q', '-m',
      `Trim leading silence (>= ${MIN}s) from ${list.length} course audio files`]);
    try { git(['push', '-q', 'origin', 'HEAD:main']); break; } catch (e) {
      if (attempt >= 4) throw e;
      console.log(`  push рад шуд (кӯшиши ${attempt}) — аз нав`);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
  const sha = git(['rev-parse', 'HEAD']);
  console.log(`commit: ${sha}`);
  const prev = existsSync(URLS) ? JSON.parse(readFileSync(URLS, 'utf8')) : {};
  const local = Object.fromEntries(list.map(([, k]) => [k, md5f(`${WORK}/out/${k}.mp3`)]));
  const url = (k) => prev[k]?.md5 === local[k] ? prev[k].url : `${CDN}@${sha}/${rel(k)}`;
  let pending = list.map(([, k]) => k).filter((k) => prev[k]?.md5 !== local[k]);
  console.log(`санҷиши CDN: ${pending.length} файли нав`);
  for (let a = 1; a <= 8 && pending.length; a++) {
    const next = [];
    for (let i = 0; i < pending.length; i += 150) {
      const part = pending.slice(i, i + 150);
      const r = spawnSync(PYEXE, ['../tools/audio_check.py', ...part.map(url)], PY);
      const m = JSON.parse(r.stdout || '{}');
      for (const k of part) if (m[url(k)]?.md5 !== local[k]) next.push(k);
    }
    pending = next;
    if (pending.length) { console.log(`CDN кӯшиши ${a}: ${pending.length} ҳанӯз нест…`); await new Promise((r) => setTimeout(r, 15000)); }
  }
  if (pending.length) { console.error(`⛔ CDN: ${pending.length} файл md5 надод — база даст нахӯрд`); process.exit(1); }
  writeFileSync(URLS, JSON.stringify({ ...prev, ...Object.fromEntries(list.map(([, k]) => [k, { url: url(k), md5: local[k] }])) }, null, 1));
  console.log(`✓ CDN: ${list.length} файл md5-и айнан баробар`);
}

// ── Навиштан ба база ─────────────────────────────────────────────────────────
if (APPLY) {
  const map = JSON.parse(readFileSync(URLS, 'utf8'));
  const pairs = trimmed().filter(([, k]) => map[k]).map(([u, k]) => [u, map[k].url]);
  let n = 0;
  for (const [t, c] of TABLES) {
    for (let i = 0; i < pairs.length; i += 200) {
      const chunk = pairs.slice(i, i + 200);
      const values = chunk.map((_, j) => `($${j * 2 + 1}, $${j * 2 + 2})`).join(',');
      const r = await sql.query(`UPDATE "${t}" x SET "${c}" = v.nu FROM (VALUES ${values}) AS v(ou, nu)
        WHERE x."${c}" = v.ou RETURNING 1`, chunk.flat());
      n += r.length;
    }
  }
  // Ҳамаи курсҳо contentVersion+1 мегиранд (буриш дар ҳамаи забонҳо) + парчами глобалӣ,
  // то кэши Hive-и телефонҳо URL-и навро гирад.
  const mods = await sql.query(`UPDATE "Module" SET "contentVersion" = "contentVersion" + 1 RETURNING id`);
  const [g] = await sql.query(`SELECT "valueJson" v FROM "AppSetting" WHERE key='content_version'`);
  const next = String(Number(String(g?.v ?? '0').replace(/"/g, '')) + 1);
  await sql.query(`UPDATE "AppSetting" SET "valueJson"=$1, "updatedAt"=now() WHERE key='content_version'`, [next]);
  console.log(`✅ ${n} сатр URL-и нав гирифт · ${mods.length} бахш contentVersion+1 · content_version → ${next}`);
}

if (!GEN && !PUSH && !APPLY) console.log('\n(нақша) --gen → --push → --apply');
