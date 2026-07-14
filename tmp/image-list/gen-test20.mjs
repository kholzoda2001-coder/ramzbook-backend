import { writeFileSync, existsSync } from 'fs';

const STYLE = '3D rendered icon, soft matte clay plastic look, single object centered in frame, ' +
  'front 3/4 view, rounded friendly shapes, vibrant soft pastel colors, smooth soft studio lighting, ' +
  'one subtle soft shadow directly beneath, plain white background, no face no eyes no mouth no smile, ' +
  'no text no letters no numbers no logos, no border, square';

const items = [
  { file: 'adult', subject: 'a single adult person standing, simple neutral outfit, full body, arms at sides, no facial features' },
  { file: 'airplane', subject: 'a commercial passenger airplane, side view, flying pose' },
  { file: 'ambulance', subject: 'an ambulance van with a red cross on the side, side view' },
  { file: 'animal', subject: 'a simple paw print shape' },
  { file: 'apple', subject: 'a single red apple with a small green leaf' },
  { file: 'arm', subject: 'a bent human arm icon showing bicep, plain, no hand detail' },
  { file: 'aunt', subject: 'a single adult woman standing, simple neutral outfit, full body, no facial features' },
  { file: 'autumn', subject: 'a small tree with orange and red falling leaves' },
  { file: 'baby', subject: 'a baby sitting, wearing a simple onesie, chubby, no facial features' },
  { file: 'backpack', subject: 'a school backpack, closed, side view' },
  { file: 'bag', subject: 'a simple tote shopping bag' },
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
let ok = 0, fail = 0;
for (let i = 0; i < items.length; i++) {
  const it = items[i];
  const prompt = `${STYLE}, ${it.subject}`;
  const url = `https://image.pollinations.ai/prompt/${encode(prompt)}?width=1024&height=1024&nologo=true&seed=${100 + i}&model=flux`;
  const dest = new URL(`./test20/${it.file}.png`, import.meta.url);
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const buf = Buffer.from(await r.arrayBuffer());
    writeFileSync(dest, buf);
    console.log(`✅ ${it.file} (${buf.length} bytes)`);
    ok++;
  } catch (e) {
    console.log(`❌ ${it.file}: ${e.message}`);
    fail++;
  }
}
console.log(`\nТайёр: ${ok} муваффақ, ${fail} ноком`);
