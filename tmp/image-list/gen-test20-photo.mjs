import { writeFileSync, existsSync, mkdirSync } from 'fs';

const DIR = new URL('./test20-photo/', import.meta.url);
try { mkdirSync(DIR, { recursive: true }); } catch {}

// Fully natural/realistic photograph style — no 3D render, no illustration.
const STYLE = 'professional realistic photograph, natural real-world object, shot with a DSLR camera, ' +
  'soft natural studio lighting, shallow depth of field, plain clean neutral light grey background, ' +
  'centered, sharp focus, high detail, no text, no watermark, no logo, no illustration, no cartoon, ' +
  'no 3D render, photorealistic';

const items = [
  { file: 'adult', subject: 'a real adult person standing, casual everyday clothing, full body, candid photo, face not the focus' },
  { file: 'airplane', subject: 'a real commercial passenger airplane on a runway, side view' },
  { file: 'ambulance', subject: 'a real ambulance vehicle, side view' },
  { file: 'animal', subject: 'a close-up photo of an animal paw print in soil' },
  { file: 'apple', subject: 'a single fresh red apple' },
  { file: 'arm', subject: 'a photo of a human arm and bicep, plain, no other body parts visible' },
  { file: 'aunt', subject: 'a real adult woman standing, casual everyday clothing, full body, candid photo, face not the focus' },
  { file: 'autumn', subject: 'a real tree branch with orange and red autumn leaves' },
  { file: 'baby', subject: 'a real baby sitting, wearing a simple onesie' },
  { file: 'backpack', subject: 'a real school backpack, closed, studio product photo' },
  { file: 'bag', subject: 'a real fabric tote shopping bag, studio product photo' },
  { file: 'bakery', subject: 'a real photo of fresh bread loaves and a croissant on a wooden tray' },
  { file: 'banana', subject: 'a single fresh yellow banana' },
  { file: 'bandage', subject: 'a real adhesive bandage strip, studio product photo' },
  { file: 'bank', subject: 'a real bank building exterior with columns' },
  { file: 'basket', subject: 'a real empty woven wicker basket, studio product photo' },
  { file: 'bathroom', subject: 'a real freestanding white bathtub, photo' },
  { file: 'beach', subject: 'a real beach umbrella planted in sand on a beach' },
  { file: 'bear', subject: 'a real bear standing outdoors, side view, natural wildlife photo' },
  { file: 'bed', subject: 'a real single bed with a pillow and folded blanket, side view, photo' },
];

const encode = (s) => encodeURIComponent(s);

async function fetchWithTimeout(url, ms) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try { return await fetch(url, { signal: ctrl.signal }); }
  finally { clearTimeout(t); }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

for (let i = 0; i < items.length; i++) {
  const it = items[i];
  const dest = new URL(`./test20-photo/${it.file}.png`, import.meta.url);
  if (existsSync(dest)) { console.log(`⏭️  ${it.file} (skip, exists)`); continue; }
  const prompt = `${STYLE}, ${it.subject}`;
  const url = `https://image.pollinations.ai/prompt/${encode(prompt)}?width=1024&height=1024&nologo=true&seed=${400 + i}&model=flux`;
  let done = false;
  for (let attempt = 0; attempt < 4 && !done; attempt++) {
    try {
      const r = await fetchWithTimeout(url, 40000);
      if (r.status === 429) { console.log(`  429 ${it.file}, waiting...`); await sleep(10000); continue; }
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const buf = Buffer.from(await r.arrayBuffer());
      writeFileSync(dest, buf);
      console.log(`✅ ${it.file} (${buf.length} bytes)`);
      done = true;
    } catch (e) {
      console.log(`  retry ${it.file} (${attempt + 1}/4): ${e.message}`);
      await sleep(5000);
    }
  }
  if (!done) console.log(`❌ ${it.file}: gave up`);
  await sleep(3000);
}
console.log('\nТайёр.');
