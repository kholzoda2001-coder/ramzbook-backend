// Қадами 3: audioUrl-и файлҳои боршударо ба база мебандад.
import { SignJWT } from 'jose';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const BASE = 'https://admin.ramz.tj';
const CDN = 'https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio@main/audio';

const token = await new SignJWT({ username: 'admin', role: 'admin' })
  .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('2h')
  .sign(new TextEncoder().encode(env.JWT_SECRET));
const H = { 'Content-Type': 'application/json', Cookie: `admin_token=${token}` };

const made = JSON.parse(readFileSync(new URL('./_onboarding-audio-made.json', import.meta.url), 'utf8'));
let ok = 0, fail = 0;
for (const m of made) {
  const url = `${CDN}/${m.code}/${m.id}.mp3`;
  // Файл дар CDN воқеан ҳаст? (jsDelivr баъд аз push каме вақт мегирад)
  const head = await fetch(url, { method: 'HEAD' });
  if (!head.ok) { console.log(`  ⏳ ${m.code}/${m.word}: CDN ҳанӯз ${head.status} — баъд такрор кунед`); fail++; continue; }

  const res = await fetch(`${BASE}/api/admin/onboarding`, {
    method: 'PUT', headers: H,
    body: JSON.stringify({ ...m.rec, audioUrl: url }),
  });
  if (res.ok) { ok++; console.log(`  ✓ ${m.code}/${m.word}`); }
  else { fail++; console.log(`  ✗ ${m.code}/${m.word}: ${(await res.text()).slice(0, 90)}`); }
}
console.log(`\nБаста шуд: ${ok} | Монд: ${fail}`);
