// Аудиои дарси шиносоии олмонӣ (de → tg) бо овози интихобшуда.
//
// Овоз: de-DE-KatjaNeural (edge-tts) — ниг. эзоҳи `_de-tts.py`.
// Ҷараён: калимаҳо аз admin API → `_de-tts.py` файлҳоро месозад →
// `POST /api/admin/upload` (Vercel Blob) → `PUT /api/admin/onboarding {audioUrl}`
// → санҷиши ниҳоӣ (HTTP + давомнокӣ + такрор набудани файлҳо).
//
//   node prisma/_de-onboarding-voice.mjs
import { SignJWT } from 'jose';
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs';
import { execFileSync } from 'child_process';
import { createHash } from 'crypto';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);

const BASE = 'https://admin.ramz.tj';
const DE = 'cmqdhvfj200001z591mfrnj4z';
const TG = 'cmpk1cr9o0000bo0h1mheyoad';
const WORK = 'tmp/de-onboarding-audio';

const token = await new SignJWT({ username: 'admin', role: 'admin' })
  .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('2h')
  .sign(new TextEncoder().encode(env.JWT_SECRET));
const H = { 'Content-Type': 'application/json', Cookie: `admin_token=${token}` };

const get = async () => (await (await fetch(
  `${BASE}/api/admin/onboarding?targetLanguageId=${DE}&nativeLanguageId=${TG}`, { headers: H })).json()).words;

// Давомнокии MP3-и CBR аз рӯи фреймҳо — барои санҷиши суръати талаффуз.
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

// ── 1. Тавлид ───────────────────────────────────────────────────────────────
const words = (await get()).sort((a, b) => a.order - b.order);
mkdirSync(WORK, { recursive: true });
writeFileSync(`${WORK}/items.json`, JSON.stringify(words.map(w => ({ id: w.id, text: w.word })), null, 1));

console.log('== Қадами 1: тавлид (edge-tts) ==');
console.log(execFileSync('python', ['prisma/_de-tts.py', WORK, `${WORK}/items.json`],
  { encoding: 'utf8', env: { ...process.env, PYTHONUTF8: '1' } }));

// ── 2. Бор кардан ва пайвастан ──────────────────────────────────────────────
console.log('== Қадами 2: бор кардан ва пайвастан ==');
for (const w of words) {
  const buf = readFileSync(`${WORK}/${w.id}.mp3`);
  const fd = new FormData();
  fd.append('file', new File([buf], `de_onboarding_${w.id}.mp3`, { type: 'audio/mpeg' }));
  const up = await fetch(`${BASE}/api/admin/upload`, {
    method: 'POST', headers: { Cookie: `admin_token=${token}` }, body: fd,
  });
  const body = await up.json();
  if (!up.ok || !body.url) { console.log(`  ✗ ${w.word}: upload ${up.status} ${JSON.stringify(body).slice(0, 120)}`); continue; }
  const res = await fetch(`${BASE}/api/admin/onboarding`, {
    method: 'PUT', headers: H, body: JSON.stringify({ ...w, audioUrl: body.url }),
  });
  console.log(res.ok ? `  ✓ ${w.word}` : `  ✗ ${w.word}: ${(await res.text()).slice(0, 120)}`);
}

// ── 3. Санҷиш ───────────────────────────────────────────────────────────────
console.log('\n== Қадами 3: санҷиш ==');
const seen = new Set();
let bad = 0;
for (const w of (await get()).sort((a, b) => a.order - b.order)) {
  const r = await fetch(w.audioUrl);
  if (!r.ok) { console.log(`  ✗ ${w.word}: HTTP ${r.status}`); bad++; continue; }
  const b = Buffer.from(await r.arrayBuffer());
  const md5 = createHash('md5').update(b).digest('hex').slice(0, 8);
  const sec = duration(b);
  const dup = seen.has(md5); seen.add(md5);
  // Калимаи алоҳида бояд на хеле тез ва на бурида бошад.
  const slow = sec >= 0.6 && sec <= 2.0;
  if (dup || !slow) bad++;
  console.log(`  ${dup || !slow ? '⚠' : '✓'} ${w.word.padEnd(6)} ${sec.toFixed(2)}s  ${(b.length / 1024).toFixed(1)}KB  md5=${md5}${dup ? '  ТАКРОРӢ' : ''}${slow ? '' : '  суръат берун аз меъёр'}`);
}
console.log(`\nМушкилот: ${bad}`);
