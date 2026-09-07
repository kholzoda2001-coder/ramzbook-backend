// Аудиои бахши ГУФТОР: тавлид (edge-tts) → push ба CDN → навиштани `audioUrl`.
//
// ── Ҳолати пеш аз ин ───────────────────────────────────────────────────────
// Ҳамаи 309 воҳиди гуфтор `audioUrl = NULL` доштанд, пас барнома ҳар ҷумларо
// бо TTS-и ДАСТГОҲ мехонд. Он ҳам сифаташ аз телефон ба телефон фарқ мекунад,
// ҳам дар баъзе дастгоҳҳо забони англисӣ насб нест → хомӯшии пурра.
//
// ── Роҳ ────────────────────────────────────────────────────────────────────
//   1. воҳидҳоро аз база мегирем (танҳо онҳое, ки `audioUrl` надоранд);
//   2. edge-tts файлҳоро дар нусхаи МАҲАЛЛИИ `ramz-audio` месозад;
//   3. commit + push → SHA;
//   4. `audioUrl` бо SQL-и мустақим навишта мешавад;
//   5. `content_version` ламс мешавад;
//   6. санҷиши воқеӣ: ҳар URL кашида мешавад, дарозӣ ва такрор чен мешавад.
//
// ⚠️ URL-и jsDelivr ба SHA-и КОММИТ баста мешавад, на ба шоха. Бе он кэши
// jsDelivr метавонад нусхаи кӯҳнаро моҳҳо нигоҳ дорад.
//
// ⚠️ Такроршаванда: файли мавҷуд аз нав сохта намешавад ва танҳо воҳидҳои
// бе `audioUrl` гирифта мешаванд — скриптро бехатар аз нав давондан мумкин.
//
//   node prisma/_speaking-audio.mjs <ramz-audio dir> [--dry]
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { execFileSync, execSync } from 'child_process';
import { createHash } from 'crypto';
import { neon } from '@neondatabase/serverless';

const REPO = process.argv[2];
if (!REPO) throw new Error('Истифода: node prisma/_speaking-audio.mjs <ramz-audio dir> [--dry]');
const DRY = process.argv.includes('--dry');
// Танҳо санҷиш, бе тавлид — то натиҷаро баъдтар ҳам дубора дида тавонем.
// Бе ин байрақ скрипт ҳангоми «ҳама аудио дорад» барвақт мебарояд ва
// санҷиш ҳеҷ гоҳ намерасад.
const VERIFY_ONLY = process.argv.includes('--verify');

const AUDIO_DIR = `${REPO}/audio/en`;
mkdirSync(AUDIO_DIR, { recursive: true });

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);

// ── 1. Воҳидҳо ──────────────────────────────────────────────────────────────
const items = await sql.query(
  `SELECT id, kind, text FROM "SpeakingItem"
   WHERE "audioUrl" IS NULL AND length(trim(text)) > 0
   ORDER BY "order"`);
const total = await sql.query(`SELECT count(*)::int n FROM "SpeakingItem"`);
console.log(`Воҳидҳои гуфтор: ${total[0].n} · бе аудио: ${items.length}`);
if (items.length === 0 && !VERIFY_ONLY) {
  console.log('Ҳама чиз аллакай аудио дорад. Барои санҷиш: --verify');
  process.exit(0);
}

const byKind = items.reduce((a, i) => (a[i.kind] = (a[i.kind] || 0) + 1, a), {});
console.log('навъҳо:', JSON.stringify(byKind));

if (DRY) {
  console.log('\n--dry: тавлид ва навиштан НАШУД. Намунаҳо:');
  items.slice(0, 8).forEach(i => console.log(`  ${i.id}  ${JSON.stringify(i.text)}`));
  process.exit(0);
}

// ── 2. Тавлид ───────────────────────────────────────────────────────────────
if (!VERIFY_ONLY) {
console.log('\n== Қадами 1: тавлид (edge-tts, en-US-AriaNeural) ==');
const listPath = `${REPO}/_speaking-items.json`;
writeFileSync(listPath, JSON.stringify(items.map(i => ({ id: i.id, text: i.text })), null, 1));
const out = execFileSync('python', ['prisma/_speaking-tts.py', AUDIO_DIR, listPath],
  { encoding: 'utf8', env: { ...process.env, PYTHONUTF8: '1' }, maxBuffer: 32 * 1024 * 1024 });
console.log(out.trim().split('\n').slice(-3).join('\n'));

const made = items.filter(i => existsSync(`${AUDIO_DIR}/${i.id}.mp3`));
if (made.length !== items.length) {
  console.log(`⚠️ ${items.length - made.length} файл сохта нашуд — скриптро аз нав давонед.`);
}
if (made.length === 0) process.exit(1);

// ── 3. Commit + push ────────────────────────────────────────────────────────
console.log('\n== Қадами 2: commit + push ==');
const dirty = execSync('git status --porcelain audio/en', { cwd: REPO }).toString().trim();
if (dirty) {
  execSync('git add audio/en', { cwd: REPO, stdio: 'inherit' });
  execSync(
    'git -c user.email="255218020+kholzoda2001-coder@users.noreply.github.com" '
    + '-c user.name="kholzoda2001-coder" commit -m "Speaking audio (edge-tts, en-US-AriaNeural)"',
    { cwd: REPO, stdio: 'inherit' });
  execSync('git push origin HEAD', { cwd: REPO, stdio: 'inherit' });
} else {
  console.log('  тағйирот нест — коммити ҷорӣ истифода мешавад');
}
const sha = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim();
console.log('SHA:', sha);

const cdn = id => `https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio@${sha}/audio/en/${id}.mp3`;

// ── 4. Навиштани audioUrl ───────────────────────────────────────────────────
console.log('\n== Қадами 3: навиштани audioUrl ==');
let wrote = 0;
for (const i of made) {
  await sql.query(`UPDATE "SpeakingItem" SET "audioUrl"=$1 WHERE id=$2`, [cdn(i.id), i.id]);
  wrote++;
  if (wrote % 50 === 0) console.log(`  ...${wrote}/${made.length}`);
}
console.log(`  навишта шуд: ${wrote}`);

// Кэши мазмун: сатрҳо тавассути SQL иваз шуданд, пас миёнабури `lib/prisma.ts`
// кор накард — бе ин ламс тағйир то тамом шудани TTL ба хонанда намерасад.
await sql.query(
  `INSERT INTO "AppSetting" (key, "valueJson", "updatedAt") VALUES ('content_version', '"1"', NOW())
   ON CONFLICT (key) DO UPDATE SET "updatedAt" = NOW()`);
console.log('  content_version ламс шуд');
}

// ── 5. Санҷиши ВОҚЕӢ ────────────────────────────────────────────────────────
// Ҳамон усуле, ки барои алифбо кор кард: ҳар файл кашида мешавад, дарозӣ ва
// такрори байтӣ чен мешавад. Пайванди «200 медиҳад» кофӣ нест — файл
// метавонад холӣ ё нусхаи воҳиди дигар бошад.
console.log('\n== Қадами 4: санҷиш ==');
const RATES = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
function duration(b) {
  let i = 0, frames = 0, sr = 0;
  if (b[0] === 0x49 && b[1] === 0x44 && b[2] === 0x33) i = 10 + ((b[6] << 21) | (b[7] << 14) | (b[8] << 7) | b[9]);
  while (i < b.length - 4) {
    if (b[i] === 0xFF && (b[i + 1] & 0xE0) === 0xE0) {
      const ver = (b[i + 1] >> 3) & 3, br = RATES[(b[i + 2] >> 4) & 0xF];
      let s = [44100, 48000, 32000][(b[i + 2] >> 2) & 3];
      const pad = (b[i + 2] >> 1) & 1;
      if (!br || !s) { i++; continue; }
      if (ver === 2) s /= 2;
      i += Math.floor(144000 * br / s) + pad; frames++; sr = s;
    } else i++;
  }
  return sr ? frames * 1152 / sr : 0;
}

// Санҷиши МАҲАЛЛӢ — ҳамаи 309, зуд ва бе шабака.
const rows = await sql.query(
  `SELECT id, kind, text, "audioUrl" FROM "SpeakingItem" ORDER BY "order"`);
const seen = new Map();
let bad = 0, noUrl = 0, dup = 0, short = 0;
const secs = [];
for (const r of rows) {
  if (!r.audioUrl) { noUrl++; continue; }
  const p = `${AUDIO_DIR}/${r.id}.mp3`;
  if (!existsSync(p)) continue; // файли коммитҳои пештара
  const b = readFileSync(p);
  const md5 = createHash('md5').update(b).digest('hex');
  const sec = duration(b);
  secs.push(sec);
  // ⚠️ Такрори байтӣ ин ҷо ХАТО НЕСТ, агар матн ҳамон бошад: як калима
  // («how much», «bill») дар чанд дарс такрор мешавад ва бояд ҳамон садоро
  // диҳад. Хато он аст, ки ду матни ГУНОГУН як файл гиранд — маҳз он маънои
  // «TTS чизи дигар хонд» ё «файлҳо омехта шуданд»-ро дорад.
  const prev = seen.get(md5);
  if (prev !== undefined && prev !== r.text) {
    console.log(`  ✗ ${JSON.stringify(r.text)} — ҳамон садо бо ${JSON.stringify(prev)}`);
    dup++; bad++;
  }
  seen.set(md5, r.text);
  // Ҳатто кӯтоҳтарин калима (2 ҳарф) аз 0.25s дарозтар аст; аз 12s дарозтар
  // ягон ҷумлаи ин бахш нест (макс 34 ҳарф).
  if (sec < 0.25 || sec > 12) {
    console.log(`  ✗ ${JSON.stringify(r.text)} — ${sec.toFixed(2)}s берун аз меъёр`);
    short++; bad++;
  }
}
secs.sort((a, b) => a - b);
console.log(`  файлҳо: ${secs.length} · min ${secs[0]?.toFixed(2)}s · median ${secs[Math.floor(secs.length / 2)]?.toFixed(2)}s · max ${secs[secs.length - 1]?.toFixed(2)}s`);
console.log(`  бе audioUrl: ${noUrl} · такрорӣ: ${dup} · берун аз меъёр: ${short}`);

// Санҷиши ШАБАКАВӢ — намуна, чунки jsDelivr баъди push вақт мехоҳад.
console.log('\n  санҷиши CDN (намунаи 5):');
const sample = rows.filter(r => r.audioUrl).slice(0, 5);
for (const r of sample) {
  const res = await fetch(r.audioUrl).catch(() => null);
  console.log(`    ${res && res.ok ? 'OK ' : '✗  '} ${res ? res.status : 'ERR'}  ${JSON.stringify(r.text)}`);
}

console.log(`\nМушкилот: ${bad}`);
