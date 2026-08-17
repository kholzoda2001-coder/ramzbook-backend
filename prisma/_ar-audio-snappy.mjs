// Ҳамаи аудиои арабиро «зуд» мекунад: хомӯшии сару охирро мебарорад.
//
// Чаро: edge-tts ҳар клипро бо ~0.19с хомӯшии САР ва ~1.2с хомӯшии ОХИР
// месозад. Хомӯшии сар маҳз ҳамон таъхирест, ки хонанда ҳангоми пахши ҳарф ё
// калима ҳис мекунад; хомӯшии охир файлро се баробар вазнин мекунад (боз ҳам
// таъхир, ин дафъа шабакавӣ). Ченкунӣ: ҳарфи алифбо 1.78с буд, аз он ҳамагӣ
// 0.35с садо.
//
// Ду ҷои нигоҳдорӣ:
//   • репои `ramz-audio` (jsDelivr) — калима, матн, мисол, муколама
//   • Vercel Blob — алифбо, шиносоӣ ва 86 калимаи қадимӣ
//
//   node prisma/_ar-audio-snappy.mjs --dry        // танҳо ҳисоб
//   node prisma/_ar-audio-snappy.mjs --blob       // танҳо Blob (алифбо+шиносоӣ)
//   node prisma/_ar-audio-snappy.mjs --cdn        // танҳо репои аудио
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, copyFileSync, rmSync } from 'fs';
import { execFileSync } from 'child_process';
import { SignJWT } from 'jose';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);
const q = (t, p) => sql.query(t, p);

const DRY = process.argv.includes('--dry');
const ONLY_BLOB = process.argv.includes('--blob');
const ONLY_CDN = process.argv.includes('--cdn');
const AR = 'cmqdqfuxi00001rcsseeq42fi';
const COURSE = 'cmqdqfv7300021rcswj4fy6vf';
const BASE = 'https://admin.ramz.tj';
const CDN = 'https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio';
const REPO = `${process.env.TEMP}/ramz-audio-audio`.replace(/\\/g, '/');
const WORK = 'tmp/ar-snappy';

const rows = [];
const add = (table, arr) => { for (const r of arr) if (r.audioUrl?.trim()) rows.push({ table, id: r.id, url: r.audioUrl }); };
add('Word', await q(`SELECT w.id, w."audioUrl" FROM "Word" w JOIN "Lesson" l ON w."lessonId"=l.id JOIN "Module" m ON l."moduleId"=m.id WHERE m."courseId"='${COURSE}'`));
add('ComprehensionExercise', await q(`SELECT id, "audioUrl" FROM "ComprehensionExercise" WHERE "courseId"='${COURSE}'`));
add('GrammarExample', await q(`SELECT x.id, x."audioUrl" FROM "GrammarExample" x JOIN "GrammarTopic" t ON x."topicId"=t.id WHERE t."courseId"='${COURSE}'`));
add('DialogueLine', await q(`SELECT x.id, x."audioUrl" FROM "DialogueLine" x JOIN "Dialogue" d ON x."dialogueId"=d.id WHERE d."courseId"='${COURSE}'`));
add('OnboardingWord', await q(`SELECT id, "audioUrl" FROM "OnboardingWord" WHERE "targetLanguageId"='${AR}'`));
add('AlphabetLetter', await q(`SELECT id, "audioUrl" FROM "AlphabetLetter" WHERE "targetLanguageId"='${AR}'`));

const isBlob = u => u.includes('blob.vercel-storage.com');
const blobRows = rows.filter(r => isBlob(r.url));
const cdnRows = rows.filter(r => !isBlob(r.url));
console.log(`клипҳо: ${rows.length} (репо ${cdnRows.length} · Blob ${blobRows.length})`);
if (DRY) process.exit(0);

// ── боргирӣ ва буриш ────────────────────────────────────────────────────────
async function pool(items, n, fn) {
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; await fn(items[k], k); } }));
}
async function download(list, dir) {
  mkdirSync(dir, { recursive: true });
  let done = 0, fail = 0;
  await pool(list, 10, async (r) => {
    try {
      const res = await fetch(r.url);
      if (!res.ok) { fail++; return; }
      writeFileSync(`${dir}/${r.id}.mp3`, Buffer.from(await res.arrayBuffer()));
    } catch { fail++; }
    if (++done % 100 === 0) process.stdout.write(`  ${done}/${list.length}\r`);
  });
  console.log(`  боргирӣ: ${done - fail}/${list.length}${fail ? ` · нокомӣ ${fail}` : ''}`);
}
function trim(dirIn, dirOut) {
  const out = execFileSync('python', ['prisma/_ar-trim.py', dirIn, dirOut],
    { encoding: 'utf8', env: { ...process.env, PYTHONUTF8: '1' } });
  console.log('  ' + out.trim().split('\n').slice(-2).join('\n  '));
}

// ── 1. Blob (алифбо, шиносоӣ, калимаҳои қадимӣ) ─────────────────────────────
if (!ONLY_CDN && blobRows.length) {
  console.log('\n== Blob ==');
  rmSync(`${WORK}/blob-in`, { recursive: true, force: true });
  rmSync(`${WORK}/blob-out`, { recursive: true, force: true });
  await download(blobRows, `${WORK}/blob-in`);
  trim(`${WORK}/blob-in`, `${WORK}/blob-out`);
  const token = await new SignJWT({ username: 'admin', role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('2h')
    .sign(new TextEncoder().encode(env.JWT_SECRET));
  let up = 0;
  for (const r of blobRows) {
    const path = `${WORK}/blob-out/${r.id}.mp3`;
    if (!existsSync(path)) continue;
    const fd = new FormData();
    fd.append('file', new File([readFileSync(path)], `ar_snappy_${r.id}.mp3`, { type: 'audio/mpeg' }));
    const res = await fetch(`${BASE}/api/admin/upload`, { method: 'POST', headers: { Cookie: `admin_token=${token}` }, body: fd });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.url) { console.log(`  ✗ ${r.table}/${r.id}: upload ${res.status}`); continue; }
    await q(`UPDATE "${r.table}" SET "audioUrl"=$1 WHERE id=$2`, [body.url, r.id]);
    up++;
  }
  console.log(`  сабт шуд: ${up}/${blobRows.length}`);
}

// ── 2. Репои аудио ──────────────────────────────────────────────────────────
if (!ONLY_BLOB && cdnRows.length) {
  console.log('\n== Репои ramz-audio ==');
  rmSync(`${WORK}/cdn-in`, { recursive: true, force: true });
  rmSync(`${WORK}/cdn-out`, { recursive: true, force: true });
  await download(cdnRows, `${WORK}/cdn-in`);
  trim(`${WORK}/cdn-in`, `${WORK}/cdn-out`);

  const git = (args) => execFileSync('git', args, { cwd: REPO, encoding: 'utf8' }).trim();
  if (!existsSync(REPO)) {
    execFileSync('git', ['clone', '--depth', '1', '--filter=blob:none', '--no-checkout',
      'https://github.com/kholzoda2001-coder/ramz-audio', REPO], { encoding: 'utf8' });
    git(['sparse-checkout', 'set', 'audio/ar']);
    git(['checkout', 'main']);
  } else { git(['fetch', '--depth', '1', 'origin', 'main']); git(['reset', '--hard', 'origin/main']); }

  // Номи файл дар репо = id-и сабт (ҳамон қоидаи мавҷуда).
  let copied = 0;
  for (const f of readdirSync(`${WORK}/cdn-out`)) { copyFileSync(`${WORK}/cdn-out/${f}`, `${REPO}/audio/ar/${f}`); copied++; }
  console.log(`  ба репо: ${copied} файл`);
  git(['add', 'audio/ar']);
  if (git(['status', '--porcelain']).trim()) {
    git(['-c', 'user.name=RAMZ Content', '-c', 'user.email=help@ramz.tj',
      'commit', '-m', `Trim leading/trailing silence from Arabic audio (${copied} clips)`]);
    git(['push', 'origin', 'main']);
  }
  const sha = git(['rev-parse', 'HEAD']);
  console.log(`  commit: ${sha}`);
  let n = 0;
  for (const r of cdnRows) {
    if (!existsSync(`${WORK}/cdn-out/${r.id}.mp3`)) continue;
    await q(`UPDATE "${r.table}" SET "audioUrl"=$1 WHERE id=$2`, [`${CDN}@${sha}/audio/ar/${r.id}.mp3`, r.id]);
    n++;
  }
  console.log(`  сабт шуд: ${n}/${cdnRows.length}`);
}

await q(`UPDATE "AppSetting" SET "updatedAt"=NOW() WHERE key='content_version'`);
console.log('\ncontent_version ламс шуд.');
