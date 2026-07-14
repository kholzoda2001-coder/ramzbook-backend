import { writeFileSync, existsSync } from 'fs';

const STYLE = '3D rendered icon, soft matte clay plastic look, single object centered in frame, ' +
  'front 3/4 view, rounded friendly shapes, vibrant soft pastel colors, smooth soft studio lighting, ' +
  'one subtle soft shadow directly beneath, plain white background, no face no eyes no mouth no smile, ' +
  'no text no letters no numbers no logos, no border, square';

const items = [
  { file: 'bakery', subject: 'a few bread loaves and a croissant on a small tray' },
  { file: 'banana', subject: 'a single yellow banana' },
  { file: 'bandage', subject: 'a curved adhesive bandage strip' },
  { file: 'bank', subject: 'a bank building with classic columns and a triangular roof' },
  { file: 'basket', subject: 'an empty woven wicker basket' },
  { file: 'bathroom', subject: 'a freestanding bathtub' },
  { file: 'beach', subject: 'a beach umbrella planted in sand' },
  { file: 'bear', subject: 'a bear standing on all fours, side view, natural neutral pose' },
  { file: 'bed', subject: 'a single bed with a pillow and folded blanket, side view' },
];

const encode = (s) => encodeURIComponent(s);

async function fetchWithTimeout(url, ms) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try { return await fetch(url, { signal: ctrl.signal }); }
  finally { clearTimeout(t); }
}

async function gen(it, seed) {
  const dest = new URL(`./test20/${it.file}.png`, import.meta.url);
  if (existsSync(dest)) { console.log(`⏭️  ${it.file} (skip, exists)`); return; }
  const prompt = `${STYLE}, ${it.subject}`;
  const url = `https://image.pollinations.ai/prompt/${encode(prompt)}?width=1024&height=1024&nologo=true&seed=${seed}&model=flux`;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetchWithTimeout(url, 45000);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const buf = Buffer.from(await r.arrayBuffer());
      writeFileSync(dest, buf);
      console.log(`✅ ${it.file} (${buf.length} bytes)`);
      return;
    } catch (e) {
      console.log(`  retry ${it.file} (${attempt + 1}/3): ${e.message}`);
    }
  }
  console.log(`❌ ${it.file}: gave up after 3 attempts`);
}

// modest concurrency (3 at once) to speed up without hammering the free service
let i = 0;
await Promise.all(Array.from({ length: 3 }, async () => {
  while (i < items.length) {
    const idx = i++;
    await gen(items[idx], 200 + idx);
  }
}));
console.log('\nТайёр.');
