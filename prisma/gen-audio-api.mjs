import { writeFileSync, existsSync, readFileSync } from 'fs';
import { execSync } from 'child_process';

// Generates studio audio WITHOUT ever touching Neon directly. The item list
// (id + text) comes from the production API (admin.ramz.tj — always reachable,
// it runs next to the DB). TTS clips are named {id}.mp3 and pushed to the CDN;
// the app plays them by id-convention, so no database write is needed either.
// This sidesteps the flaky laptop→Neon connection completely.

const AUDIO_DIR = process.argv[2];
if (!AUDIO_DIR) throw new Error('Usage: node gen-audio-api.mjs <ramz-audio/audio/en dir>');
const REPO = AUDIO_DIR.replace(/[\\/]audio[\\/]en$/, '');
const BASE = 'https://admin.ramz.tj/api/mobile';
const TG = 'cmpk1cr9o0000bo0h1mheyoad';
const EN = 'cmppaul1k0001xrdbc2woi3fj';

let KEY = process.env.OPENAI_API_KEY;
if (!KEY) { try { KEY = (readFileSync(new URL('../.env', import.meta.url), 'utf8').match(/OPENAI_API_KEY\s*=\s*"?([^"\n\r]+)"?/) || [])[1]; } catch {} }
if (!KEY) throw new Error('OPENAI_API_KEY missing');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function api(path) {
  for (let a = 0; a < 6; a++) {
    try { const r = await fetch(BASE + path); if (r.ok) return r.json(); throw new Error('HTTP ' + r.status); }
    catch (e) { if (a === 5) throw e; await sleep(2500); }
  }
}
async function tts(text) {
  for (let a = 0; a < 6; a++) {
    try {
      const r = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST', headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'gpt-4o-mini-tts', voice: 'nova', input: text, response_format: 'mp3' }),
      });
      if (r.status === 429 || r.status >= 500) { await sleep(3000 * (a + 1)); continue; }
      if (!r.ok) throw new Error(`TTS ${r.status}: ${(await r.text()).slice(0, 100)}`);
      return Buffer.from(await r.arrayBuffer());
    } catch (e) { if (a === 5) throw e; await sleep(2000); }
  }
}
async function pool(list, n, worker) {
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < list.length) await worker(list[i++]); }));
}

// ── gather every audio item (id + text) from the API ──
console.log('Рӯйхат аз API (боэътимод)...');
const courses = (await api(`/courses?targetLanguageId=${EN}&nativeLanguageId=${TG}`)).courses;
const items = [];
const seen = new Set();
for (const c of courses) {
  if (!['A1', 'A2'].includes(c.level)) continue;
  for (const m of (c.modules || [])) {
    for (const stub of (m.lessons || [])) {
      let L; try { L = await api(`/lessons/${stub.id}`); } catch { continue; }
      const les = L.lesson || L;
      for (const w of (les.words || [])) {
        if (w.id && !seen.has(w.id) && (w.word || '').trim() && !(w.audioUrl || '').trim()) { items.push({ id: w.id, text: w.word }); seen.add(w.id); }
      }
      const comp = les.component;
      if (comp) {
        for (const e of (comp.examples || [])) if (e.id && !seen.has(e.id) && (e.sentence || '').trim() && !(e.audioUrl || '').trim()) { items.push({ id: e.id, text: e.sentence }); seen.add(e.id); }
        for (const ln of (comp.lines || [])) if (ln.id && !seen.has(ln.id) && (ln.text || '').trim() && !(ln.audioUrl || '').trim()) { items.push({ id: ln.id, text: ln.text }); seen.add(ln.id); }
        if (comp.id && comp.passage && !seen.has(comp.id) && !(comp.audioUrl || '').trim()) { items.push({ id: comp.id, text: comp.passage }); seen.add(comp.id); }
      }
    }
  }
}
console.log(`Бе аудио: ${items.length} айтем`);

// ── TTS → mp3 files (resumable) ──
let gen = 0, skip = 0, fail = 0;
await pool(items, 4, async (it) => {
  const path = `${AUDIO_DIR}/${it.id}.mp3`;
  if (existsSync(path)) { skip++; return; }
  try { writeFileSync(path, await tts(it.text.trim())); gen++; if (gen % 100 === 0) console.log(`  ...тавлид ${gen}/${items.length}`); }
  catch (e) { fail++; console.log(`  ❌ ${it.id}: ${(e.message || '').slice(0, 70)}`); }
});
console.log(`Файлҳо: ${gen} нав, ${skip} мавҷуд, ${fail} ноком`);

// ── commit & push CDN (no DB, no audioUrl write needed) ──
if (gen > 0) {
  try {
    execSync('git add audio/en', { cwd: REPO, stdio: 'inherit' });
    execSync('git -c user.email="255218020+kholzoda2001-coder@users.noreply.github.com" -c user.name="kholzoda2001-coder" commit -m "Add studio audio (nova) — A1+A2 English"', { cwd: REPO, stdio: 'inherit' });
    execSync('git push origin HEAD', { cwd: REPO, stdio: 'inherit' });
    console.log('✅ push ба CDN шуд');
  } catch (e) { console.log('⚠️ git:', (e.message || '').slice(0, 120)); }
}
console.log(`🎧 ТАМОМ: ${gen} клипи нав дар CDN. Барнома онҳоро аз рӯи id мебарорад — бе Neon.`);
