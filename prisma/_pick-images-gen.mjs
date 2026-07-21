// Сохтани расмҳои машқи «pick» — услуби ягона, мисли 5 расми мавҷуда:
// аксбардории воқеӣ, ЯК объект, заминаи хокистарии соф, мураббаъ.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { A1_PICK, HINT } from './_pick-images-a1.mjs';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
if (!env.OPENAI_API_KEY) { console.error('OPENAI_API_KEY нест'); process.exit(1); }

const REPO = process.argv[2];
if (!REPO) { console.error('роҳи репои ramz-audio лозим'); process.exit(1); }
const only = process.argv[3] ? process.argv[3].split(',') : null; // намуна барои санҷиш

const dir = `${REPO}/images/en`;
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

const label = k => k.replace(/_/g, ' ');
const all = [...new Set(Object.values(A1_PICK).flat())];
const todo = (only ?? all).filter(k => !existsSync(`${dir}/${k}.png`));

console.log(`Месозам: ${todo.length} расм${only ? ' (намуна)' : ''}\n`);
let ok = 0, fail = 0;
for (const key of todo) {
  const subject = HINT[key] ?? label(key);
  // Услуби ягона + талаботи возеҳият: ЯК объект, бе матн, бе одам (ба ҷуз
  // узвҳои бадан), то сурат маҳз ҳамон калимаро нишон диҳад.
  const prompt =
    `A clean, realistic product-style photograph of ${subject}. ` +
    `Exactly one subject, centred, filling most of the frame, sharp focus, ` +
    `even soft studio lighting, plain light grey seamless background. ` +
    `No text, no letters, no watermark, no people (unless the subject itself is a body part), ` +
    `no other objects that could be confused for the subject. ` +
    `Simple and instantly recognisable to a child learning the word "${label(key)}".`;

  try {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-image-1', prompt, size: '1024x1024', n: 1 }),
    });
    if (!res.ok) { console.log(`  ✗ ${key}: ${res.status} ${(await res.text()).slice(0, 110)}`); fail++; continue; }
    const j = await res.json();
    const b64 = j.data?.[0]?.b64_json;
    if (!b64) { console.log(`  ✗ ${key}: ҷавоб бе тасвир`); fail++; continue; }
    const buf = Buffer.from(b64, 'base64');
    writeFileSync(`${dir}/${key}.png`, buf);
    ok++;
    console.log(`  ✓ ${key}  (${(buf.length / 1024).toFixed(0)}KB)`);
  } catch (e) {
    console.log(`  ✗ ${key}: ${e.message}`); fail++;
  }
}
console.log(`\nСохта шуд: ${ok} | Хато: ${fail}`);
