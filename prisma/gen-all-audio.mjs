import { PrismaClient } from '@prisma/client';
import { writeFileSync, existsSync, readFileSync } from 'fs';
import { execSync } from 'child_process';

// Generates studio TTS (OpenAI gpt-4o-mini-tts, voice "nova" — matches the
// course's existing audio) for EVERY A1+A2 English item still missing audio:
// words, grammar-example sentences, dialogue lines, and comprehension passages.
// Files land in ramz-audio/audio/en/{id}.mp3 → pushed to GitHub → served by
// jsDelivr → audioUrl written to the DB. Resumable (skips existing files) and
// tolerant of Neon's intermittent connection (retry wrappers everywhere).
// Key is read from backend/.env (git-ignored) — never hard-coded.

const prisma = new PrismaClient();
const AUDIO_DIR = process.argv[2];
if (!AUDIO_DIR) throw new Error('Usage: node gen-all-audio.mjs <ramz-audio/audio/en dir>');
const REPO = AUDIO_DIR.replace(/[\\/]audio[\\/]en$/, '');

// Key from the environment (GitHub Actions secret) first, else the local
// git-ignored .env — never hard-coded.
let KEY = process.env.OPENAI_API_KEY;
if (!KEY) {
  try { KEY = (readFileSync(new URL('../.env', import.meta.url), 'utf8').match(/OPENAI_API_KEY\s*=\s*"?([^"\n\r]+)"?/) || [])[1]; } catch {}
}
if (!KEY) throw new Error('OPENAI_API_KEY missing (env or .env)');

const CDN = (id) => `https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio@main/audio/en/${id}.mp3`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function withRetry(fn, tries = 40, wait = 5000) {
  for (let i = 0; i < tries; i++) { try { return await fn(); } catch (e) { if (i === tries - 1) throw e; await sleep(wait); } }
}

async function tts(text) {
  for (let a = 0; a < 6; a++) {
    try {
      const res = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'gpt-4o-mini-tts', voice: 'nova', input: text, response_format: 'mp3' }),
      });
      if (res.status === 429 || res.status >= 500) { await sleep(3000 * (a + 1)); continue; }
      if (!res.ok) throw new Error(`TTS ${res.status}: ${(await res.text()).slice(0, 120)}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (e) { if (a === 5) throw e; await sleep(2000); }
  }
}

// simple concurrency pool
async function pool(list, n, worker) {
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (i < list.length) { const idx = i++; await worker(list[idx]); }
  }));
}

async function main() {
  // ── Phase 1: load the item list gathered by gen-audio-fetch.mjs (no DB here,
  // so the long TTS work can never fail on Neon's flaky connection) ──
  if (!existsSync('tmp/audio-items.json')) {
    throw new Error('tmp/audio-items.json нест — аввал `node prisma/gen-audio-fetch.mjs`-ро иҷро кунед');
  }
  const valid = JSON.parse(readFileSync('tmp/audio-items.json', 'utf8')).filter((it) => (it.text || '').trim().length > 0);
  const byModel = valid.reduce((a, it) => ((a[it.model] = (a[it.model] || 0) + 1), a), {});
  console.log(`Барои тавлид: ${valid.length} айтем ${JSON.stringify(byModel)}`);

  // ── Phase 2: TTS → mp3 files (resumable, concurrency 4) ──
  let gen = 0, skip = 0, fail = 0;
  const done = [];
  await pool(valid, 4, async (it) => {
    const path = `${AUDIO_DIR}/${it.id}.mp3`;
    if (existsSync(path)) { skip++; done.push(it); return; }
    try {
      const buf = await tts(it.text.trim());
      writeFileSync(path, buf);
      gen++; done.push(it);
      if (gen % 100 === 0) console.log(`  ...тавлид ${gen}/${valid.length}`);
    } catch (e) { fail++; console.log(`  ❌ ${it.id} (${it.model}): ${(e.message || '').slice(0, 80)}`); }
  });
  console.log(`Файлҳо: ${gen} нав, ${skip} мавҷуд, ${fail} ноком`);
  writeFileSync('tmp/audio-done.json', JSON.stringify(done));

  // ── Phase 3: commit & push the audio repo ──
  if (done.length) {
    console.log('git push ramz-audio...');
    try {
      execSync('git add audio/en', { cwd: REPO, stdio: 'inherit' });
      execSync('git -c user.email="255218020+kholzoda2001-coder@users.noreply.github.com" -c user.name="kholzoda2001-coder" commit -m "Add A1+A2 English studio audio (nova)"', { cwd: REPO, stdio: 'inherit' });
      execSync('git push origin HEAD', { cwd: REPO, stdio: 'inherit' });
      console.log('✅ push шуд');
    } catch (e) { console.log('⚠️ git:', (e.message || '').slice(0, 150)); }
  }

  // ── Phase 4: write audioUrl to the DB (chunked transactions, retry) ──
  console.log('DB навсозӣ...');
  let upd = 0;
  for (let i = 0; i < done.length; i += 50) {
    const chunk = done.slice(i, i + 50);
    try {
      await withRetry(() => prisma.$transaction(
        chunk.map((it) => prisma[it.model].update({ where: { id: it.id }, data: { audioUrl: CDN(it.id) } }))
      ), 30);
      upd += chunk.length;
      if (upd % 200 === 0 || i + 50 >= done.length) console.log(`  ...DB ${upd}/${done.length}`);
    } catch (e) { console.log(`  ⚠️ chunk @${i}: ${(e.message || '').slice(0, 70)}`); }
  }
  await withRetry(() => prisma.appSetting.update({ where: { key: 'content_version' }, data: { valueJson: '"1"' } }));
  console.log(`✅ ТАМОМ: ${gen} тавлид, ${upd} DB навсозӣ, content_version bump.`);
  await prisma.$disconnect();
}

main().catch(async (e) => { console.error('FATAL', e.message); await prisma.$disconnect().catch(() => {}); process.exit(1); });
