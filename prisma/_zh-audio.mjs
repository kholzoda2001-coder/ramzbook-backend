import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync, statSync } from 'fs';
import { execFileSync } from 'child_process';
import { createHash } from 'crypto';
import { neon } from '@neondatabase/serverless';

const argv = process.argv.slice(2);
const GEN = argv.includes('--gen'), PUSH = argv.includes('--push'), APPLY = argv.includes('--apply');

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')
    .filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sql = neon(env.DATABASE_URL);
const q = (t, p) => (p ? sql.query(t, p) : sql.query(t));

const WORK = 'tmp/zh-audio';
const REPO = `${process.env.TEMP}/ramz-audio-audio`.replace(/\\/g, '/');
const CDN = 'https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio';
const URLS = `${WORK}/urls.json`;

function probeAll() {
  execFileSync('python', ['_de-audio-check.py', WORK, `${WORK}/probe.json`],
    { encoding: 'utf8', env: { ...process.env, PYTHONUTF8: '1' }, maxBuffer: 1 << 26 });
  return JSON.parse(readFileSync(`${WORK}/probe.json`, 'utf8'));
}

async function collect() {
  const [{id: ZH}] = await q(`SELECT id FROM "Language" WHERE code='zh'`);
  const [{id: TG}] = await q(`SELECT id FROM "Language" WHERE code='tg'`);
  const [{id: COURSE}] = await q(`SELECT id FROM "Course" WHERE "targetLanguageId"=$1 AND "nativeLanguageId"=$2`, [ZH, TG]);

  const items = [];
  const add = (kind, id, text, file, table) =>
    items.push({ kind, id, text: (text || '').replace(/\s+/g, ' ').trim(), file, table });

  for (const w of await q(
    `SELECT w.id, w.word FROM "Word" w JOIN "Lesson" l ON w."lessonId"=l.id
     JOIN "Module" m ON l."moduleId"=m.id WHERE m."courseId"=$1 ORDER BY m."order", l."order", w."order"`, [COURSE]))
    add('word', w.id, w.word, `${w.id}.mp3`, 'Word');

  for (const d of await q(
    `SELECT x.id, x.text FROM "DialogueLine" x JOIN "Dialogue" d ON x."dialogueId"=d.id
     WHERE d."courseId"=$1 ORDER BY d."order", x."order"`, [COURSE]))
    add('line', d.id, d.text, `line_${d.id}.mp3`, 'DialogueLine');

  for (const g of await q(
    `SELECT e.id, e.sentence FROM "GrammarExample" e JOIN "GrammarTopic" t ON e."topicId"=t.id
     WHERE t."courseId"=$1 ORDER BY t."order", e."order"`, [COURSE]))
    add('gex', g.id, g.sentence, `gex_${g.id}.mp3`, 'GrammarExample');

  for (const c of await q(
    `SELECT id, passage FROM "ComprehensionExercise" WHERE "courseId"=$1 ORDER BY "order"`, [COURSE]))
    add('comp', c.id, c.passage, `comp_${c.id}.mp3`, 'ComprehensionExercise');

  for (const l of await q(
    `SELECT id, uppercase FROM "AlphabetLetter" WHERE "targetLanguageId"=$1 AND "nativeLanguageId"=$2 ORDER BY "order"`, [ZH, TG])) {
    let text = l.uppercase;
    if (text === 'Ü') text = 'yu';
    add('letter', l.id, text, `letter_${l.id}.mp3`, 'AlphabetLetter');
  }

  for (const o of await q(
    `SELECT id, word FROM "OnboardingWord" WHERE "targetLanguageId"=$1 AND "nativeLanguageId"=$2 ORDER BY "order"`, [ZH, TG]))
    add('onb', o.id, o.word, `onb_${o.id}.mp3`, 'OnboardingWord');

  return items.filter(it => it.text);
}

const items = await collect();
const byKind = {};
items.forEach(it => { byKind[it.kind] = (byKind[it.kind] || 0) + 1; });
console.log(`Ҷамъ: ${items.length} файл  ${JSON.stringify(byKind)}`);

const rel = it => `audio/zh/${it.file}`;
const url = (it, sha) => `${CDN}@${sha}/${rel(it)}`;
const md5 = b => createHash('md5').update(b).digest('hex');

if (GEN) {
  mkdirSync(WORK, { recursive: true });
  console.log(`\n== 1. Сабт (edge-tts · zh-CN-XiaoxiaoNeural) ==`);
  for (let pass = 1; pass <= 4; pass++) {
    const left = items.filter(it => !existsSync(`${WORK}/${it.file}`) || statSync(`${WORK}/${it.file}`).size < 800);
    if (!left.length) { console.log('  ҳама тайёр'); break; }
    writeFileSync(`${WORK}/items.json`,
      JSON.stringify(left.map(it => ({ id: it.file.replace(/\.mp3$/, ''), text: it.text })), null, 1));
    console.log(`  кӯшиши ${pass}: ${left.length} файл`);
    const out = execFileSync('python', ['_zh-tts.py', WORK, `${WORK}/items.json`],
      { encoding: 'utf8', env: { ...process.env, PYTHONUTF8: '1' }, maxBuffer: 1 << 26 });
    console.log('  ' + out.trim().split('\n').slice(-1).join(''));
  }

  console.log('\n== 2. Санҷиши МАҲАЛЛӢ ==');
  const probe = probeAll();
  const bad = [];
  let mn = 99, mx = 0;
  for (const it of items) {
    const p = `${WORK}/${it.file}`;
    if (!existsSync(p)) { bad.push(`${it.kind} ${it.id}: файл нест`); continue; }
    const buf = readFileSync(p);
    const pr = probe[it.file] || { sec: 0, max_db: -99 };
    it.sec = pr.sec; it.md5 = md5(buf);
    const words = it.text.split(/\s+/).length;
    const label = `${it.kind} «${it.text.slice(0, 32)}»`;
    const lo = 0.3, hi = words * 2.0 + 5;
    if (buf.length < 800) bad.push(`${label}: файл ${buf.length}B — хеле хурд`);
    else if (pr.max_db < -35) bad.push(`${label}: max ${pr.max_db} dB — ХОМӮШ`);
    else if (pr.sec < lo) bad.push(`${label}: ${pr.sec}s < ${lo.toFixed(2)}s — кӯтоҳ`);
    else if (pr.sec > hi) bad.push(`${label}: ${pr.sec}s > ${hi.toFixed(2)}s — дароз`);
    mn = Math.min(mn, pr.sec); mx = Math.max(mx, pr.sec);
  }

  console.log(`  муддат: ${mn.toFixed(2)}s … ${mx.toFixed(2)}s`);
  if (bad.length) { console.error(`\n⛔ ${bad.length} мушкил:`); bad.slice(0, 40).forEach(b => console.error('  ' + b)); process.exit(1); }
  console.log(`  ✓ ҳамаи ${items.length} файл солим`);
  writeFileSync(`${WORK}/manifest.json`, JSON.stringify(
    Object.fromEntries(items.map(it => [it.file, { md5: it.md5, sec: it.sec, text: it.text, kind: it.kind, id: it.id, table: it.table }])), null, 1));
}

if (PUSH) {
  const man = JSON.parse(readFileSync(`${WORK}/manifest.json`, 'utf8'));
  const git = a => execFileSync('git', a, { cwd: REPO, encoding: 'utf8', maxBuffer: 1 << 26 }).trim();
  if (!existsSync(`${REPO}/.git/HEAD`)) {
    console.log(`Клони ${REPO} нест. Клон мекунем...`);
    execFileSync('git', ['clone', 'https://github.com/kholzoda2001-coder/ramz-audio.git', REPO], { stdio: 'inherit' });
  }
  console.log('\n== 3. Push ба ramz-audio ==');
  git(['fetch', '--depth', '1', 'origin', 'main']);
  git(['reset', '--hard', 'origin/main']);
  git(['clean', '-fd']);
  const sparse = git(['sparse-checkout', 'list']).split('\n').map(s => s.trim());
  if (!sparse.includes('audio/zh')) git(['sparse-checkout', 'add', 'audio/zh']);
  mkdirSync(`${REPO}/audio/zh`, { recursive: true });
  for (const it of items) copyFileSync(`${WORK}/${it.file}`, `${REPO}/${rel(it)}`);
  for (let i = 0; i < items.length; i += 150) git(['add', ...items.slice(i, i + 150).map(rel)]);
  if (git(['status', '--porcelain']).trim()) {
    git(['-c', 'user.name=RAMZ Content', '-c', 'user.email=help@ramz.tj', 'commit', '-q', '-m',
      `zh: ${items.length} audio files (zh-CN-XiaoxiaoNeural)`]);
    git(['push', '-q', 'origin', 'HEAD:main']);
    console.log('  ✓ push шуд');
  } else console.log('  (тағйир нест)');
  const sha = git(['rev-parse', 'HEAD']);
  console.log(`  commit ${sha}`);

  console.log('\n== 4. Санҷиши ЗИНДА аз CDN ==');
  let pending = items.slice();
  for (let round = 1; round <= 8 && pending.length; round++) {
    const next = [];
    for (let i = 0; i < pending.length; i += 16) {
      await Promise.all(pending.slice(i, i + 16).map(async it => {
        try {
          const r = await fetch(url(it, sha));
          if (!r.ok) { next.push(it); return; }
          const b = Buffer.from(await r.arrayBuffer());
          if (md5(b) !== man[it.file].md5) next.push(it);
        } catch { next.push(it); }
      }));
    }
    console.log(`  давр ${round}: ${pending.length - next.length}/${pending.length} тасдиқ шуд`);
    pending = next;
    if (pending.length) await new Promise(r => setTimeout(r, 5000));
  }
  if (pending.length) { console.error(`⛔ ${pending.length} файл аз CDN наомад — база даст нахӯрд`); process.exit(1); }
  writeFileSync(URLS, JSON.stringify({ sha, urls: Object.fromEntries(items.map(it => [it.file, url(it, sha)])) }, null, 1));
  console.log(`  ✓ ҳамаи ${items.length} файл md5-и айнан баробар`);
}

if (APPLY) {
  const { sha, urls } = JSON.parse(readFileSync(URLS, 'utf8'));
  console.log(`\n== 5. Навиштани база (commit ${sha.slice(0, 8)}) ==`);
  const byTable = {};
  items.forEach(it => { (byTable[it.table] = byTable[it.table] || []).push(it); });
  for (const [table, list] of Object.entries(byTable)) {
    for (let i = 0; i < list.length; i += 100) {
      const chunk = list.slice(i, i + 100);
      const values = chunk.map((_, k) => `($${k * 2 + 1}, $${k * 2 + 2})`).join(',');
      await q(`UPDATE "${table}" t SET "audioUrl" = v.u FROM (VALUES ${values}) AS v(id, u) WHERE t.id = v.id`,
        chunk.flatMap(it => [it.id, urls[it.file]]));
    }
    console.log(`  ${table}: ${list.length} сатр`);
  }
  
  const [{id: ZH}] = await q(`SELECT id FROM "Language" WHERE code='zh'`);
  const [{id: TG}] = await q(`SELECT id FROM "Language" WHERE code='tg'`);
  const [{id: COURSE}] = await q(`SELECT id FROM "Course" WHERE "targetLanguageId"=$1 AND "nativeLanguageId"=$2`, [ZH, TG]);
  
  await q(`UPDATE "Module" SET "contentVersion" = "contentVersion" + 1 WHERE "courseId"=$1`, [COURSE]);
  await q(`UPDATE "AppSetting" SET "updatedAt" = NOW() WHERE key='content_version'`);
  const [left] = await q(
    `SELECT count(*)::int n FROM "Word" w JOIN "Lesson" l ON w."lessonId"=l.id JOIN "Module" m ON l."moduleId"=m.id
     WHERE m."courseId"=$1 AND coalesce(w."audioUrl",'')=''`, [COURSE]);
  console.log(`  ✓ contentVersion нав шуд · калимаи бе аудио: ${left.n}`);
}

if (!GEN && !PUSH && !APPLY) console.log('\n(нақша) --gen → --push → --apply');
