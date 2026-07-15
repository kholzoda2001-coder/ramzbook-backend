// B1 аудио: тавлиди TTS (nova) → push ба CDN → навиштани audioUrl (admin API).
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';
import { SignJWT } from 'jose';

const REPO = process.argv[2];
if (!REPO) throw new Error('Usage: node _b1-audio.mjs <ramz-audio dir>');
const AUDIO_DIR = `${REPO}/audio/en`;
if (!existsSync(AUDIO_DIR)) mkdirSync(AUDIO_DIR, { recursive: true });
const ORIGIN = 'https://admin.ramz.tj';
const BASE = ORIGIN + '/api/mobile';
const has = (s) => typeof s === 'string' && s.trim().length > 0;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const env = readFileSync('.env', 'utf8');
const SECRET = (env.match(/^\s*JWT_SECRET\s*=\s*"?([^"\n\r]+)/m) || [])[1];
const KEY = process.env.OPENAI_KEY;
if (!KEY) throw new Error('OPENAI_KEY env нест');

async function api(p) { for (let a = 0; a < 6; a++) { try { const r = await fetch(BASE + p); if (r.ok) return r.json(); throw 0; } catch { if (a === 5) throw new Error(p); await sleep(2000); } } }
async function tts(text) {
  for (let a = 0; a < 6; a++) {
    const r = await fetch('https://api.openai.com/v1/audio/speech', { method: 'POST', headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'gpt-4o-mini-tts', voice: 'nova', input: text, response_format: 'mp3' }) });
    if (r.status === 429 || r.status >= 500) { await sleep(3000 * (a + 1)); continue; }
    if (!r.ok) throw new Error(`TTS ${r.status}: ${(await r.text()).slice(0, 80)}`);
    return Buffer.from(await r.arrayBuffer());
  }
}
async function poolRun(list, n, worker) { let i = 0; await Promise.all(Array.from({ length: n }, async () => { while (i < list.length) await worker(list[i++]); })); }

// ── collect B1 missing-audio ──
const nat = (await api('/languages/native')).languages; const tg = nat.find((l) => l.code === 'tg');
const tgt = (await api('/languages/target?nativeLanguageId=' + tg.id)).languages; const en = tgt.find((l) => l.code === 'en');
const courses = (await api(`/courses?targetLanguageId=${en.id}&nativeLanguageId=${tg.id}`)).courses;
const b1 = courses.find((c) => c.level === 'B1');
const items = []; const seen = new Set();
const add = (id, kind, text) => { if (id && !seen.has(id) && has(text)) { items.push({ id, kind, text: text.trim() }); seen.add(id); } };
for (const m of b1.modules) for (const stub of m.lessons) {
  let L; try { L = await api(`/lessons/${stub.id}`); } catch { continue; }
  const les = L.lesson || L;
  for (const w of (les.words || [])) if (!has(w.audioUrl)) add(w.id, 'word', w.word);
  const c = les.component;
  if (c) {
    for (const e of (c.examples || [])) if (!has(e.audioUrl)) add(e.id, 'grammarExample', e.sentence || e.text);
    for (const ln of (c.lines || [])) if (!has(ln.audioUrl)) add(ln.id, 'dialogueLine', ln.text);
    if (c.type === 'comprehension' && !has(c.audioUrl)) add(c.id, 'comprehension', c.passage);
  }
}
const byKind = items.reduce((a, it) => (a[it.kind] = (a[it.kind] || 0) + 1, a), {});
console.log(`B1 бе аудио: ${items.length} →`, byKind);

// ── generate ──
let gen = 0, skip = 0, fail = 0; const failed = [];
await poolRun(items, 4, async (it) => {
  const path = `${AUDIO_DIR}/${it.id}.mp3`;
  if (existsSync(path)) { skip++; return; }
  try { const b = await tts(it.text); if (b.length < 400) throw new Error('mp3 too small'); writeFileSync(path, b); gen++; if (gen % 50 === 0) console.log(`  ...тавлид ${gen}/${items.length}`); }
  catch (e) { fail++; failed.push(it.id); console.log(`  ❌ ${it.id}: ${(e.message || '').slice(0, 70)}`); }
});
console.log(`Файлҳо: ${gen} нав, ${skip} мавҷуд, ${fail} ноком`);
if (fail > 0) { console.log('НОКОМ:', failed.slice(0, 20).join(',')); throw new Error('баъзе TTS ноком — дубора давонед (resumable)'); }

// ── commit + push, SHA ──
let sha;
if (gen > 0) {
  execSync('git add audio/en', { cwd: REPO, stdio: 'inherit' });
  execSync('git -c user.email="255218020+kholzoda2001-coder@users.noreply.github.com" -c user.name="kholzoda2001-coder" commit -m "B1 studio audio (nova)"', { cwd: REPO, stdio: 'inherit' });
  execSync('git push origin HEAD', { cwd: REPO, stdio: 'inherit' });
}
sha = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim();
console.log('SHA:', sha);

// ── write audioUrl via admin API ──
const token = await new SignJWT({ username: 'admin', role: 'admin' }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('24h').sign(new TextEncoder().encode(SECRET));
const EP = { word: id => `/api/admin/words/${id}`, grammarExample: id => `/api/admin/grammar/examples/${id}`, dialogueLine: id => `/api/admin/dialogues/lines/${id}`, comprehension: id => `/api/admin/comprehensions/${id}` };
const cdn = id => `https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio@${sha}/audio/en/${id}.mp3`;
async function put(it) {
  for (let a = 0; a < 5; a++) {
    try { const r = await fetch(ORIGIN + EP[it.kind](it.id), { method: 'PUT', headers: { 'Content-Type': 'application/json', Cookie: 'admin_token=' + token }, body: JSON.stringify({ audioUrl: cdn(it.id) }) }); if (r.ok) return true; if (r.status >= 500 || r.status === 429) { await sleep(1500 * (a + 1)); continue; } console.log('❌', it.kind, it.id, r.status); return false; } catch { await sleep(1500); }
  }
  return false;
}
const linkable = items.filter(it => existsSync(`${AUDIO_DIR}/${it.id}.mp3`));
let ok = 0, lf = 0; let k = 0;
await Promise.all(Array.from({ length: 6 }, async () => { while (k < linkable.length) { const it = linkable[k++]; (await put(it)) ? ok++ : lf++; if (ok % 100 === 0 && ok) console.log(`  ...навишта ${ok}`); } }));
console.log(`✅ Навишта: ${ok} | Ноком: ${lf}`);
