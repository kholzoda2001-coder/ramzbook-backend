// TSV-и Pollinations (РОЙГОН) барои феълҳои амал + ду исми фаромӯшшуда.
// Феъл акси САҲНА мехоҳад (одам амалро иҷро мекунад), на объекти ягона —
// вагарна "eat" ба табақи хӯрок табдил мешавад ва бо "food" омехта мегардад.
import { writeFileSync, existsSync } from 'fs';

const REPO = process.argv[2];
if (!REPO) { console.error('роҳи репо лозим'); process.exit(1); }

const STYLE =
  'professional realistic photograph, shot with a DSLR camera, soft natural lighting, ' +
  'sharp focus, high detail, photorealistic, plain clean neutral light grey background, ' +
  'no text, no watermark, no logo, no illustration, no cartoon, no 3D render, ';

// Тавсифи ҳар феъл: амал возеҳ, рӯй асосӣ НЕ (то "man/woman" нашавад),
// дасту амал дар маркази кадр.
const SUBJ = {
  wash: 'close view of two hands being washed with soap and running water at a sink',
  brush: 'close view of a person brushing their teeth with a toothbrush, foam visible',
  eat: 'a person taking a bite of food with a fork, mouth open, plate in front',
  drink: 'a person drinking water from a glass, glass raised to the mouth',
  cook: 'a person cooking in a pan on a stove, stirring with a spoon, steam rising',
  read: 'a person sitting and reading an open book, holding it with both hands',
  write: 'close view of a hand writing with a pen in an open notebook',
  listen: 'a person wearing headphones with eyes closed, listening to music',
  watch: 'a person sitting on a sofa watching a television screen from behind',
  sleep: 'a person sleeping peacefully in bed under a blanket, eyes closed, night',
  run: 'a person running fast outdoors on a track, both feet off the ground, side view',
  walk: 'a person walking calmly along a path outdoors, full body, side view',
  swim: 'a person swimming in a blue swimming pool, arms mid-stroke, water splashing',
  play: 'two children playing together with a ball on grass, laughing',
  drive: 'close view of two hands on a car steering wheel from the driver seat, road ahead',
  laugh: 'a person laughing out loud with a wide open smile, head slightly back',
  cry: 'a person crying with tears running down the cheek, sad expression',
  pay: 'a hand handing over banknotes to a cashier hand at a shop counter',
  work: 'a person working at an office desk with a laptop and papers',
  speak: 'a person talking and gesturing with one hand, mouth open mid-speech',
  // ду исми фаромӯшшуда
  forest: 'a dense green forest with many tall trees and sunlight through the leaves',
  leaf: 'a single green leaf, close up, isolated',
};

const rows = [];
let seed = 900;
for (const [key, subject] of Object.entries(SUBJ)) {
  if (existsSync(`${REPO}/images/en/${key}.png`)) continue;
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(STYLE + subject)}` +
    `?width=1024&height=1024&nologo=true&seed=${seed++}&model=flux`;
  rows.push(`${key}\t${url}`);
}
writeFileSync(new URL('./_pick-verbs-urls.tsv', import.meta.url), rows.join('\n') + '\n');
console.log(`TSV тайёр: ${rows.length} расм`);
