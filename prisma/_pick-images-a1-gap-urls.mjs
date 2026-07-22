// Партияи 2-юми расмҳои A1 — калимаҳое, ки баъд аз ТАҲЛИЛИ ДАРС-БА-ДАРС
// бехатар дониста шуданд (акс акнун дар корти «Калимаи нав» ҳам меистад).
//
// Меъёри интихоб: хатари омехташавӣ маҳз дар ДОХИЛИ як дарс аст — вариантҳои
// нодуруст танҳо аз калимаҳои ҳамон дарс гирифта мешаванд. Пас ҳар номзад бо
// рӯйхати пурраи дарсаш санҷида шуд.
//
// РАД шуданд (сабаб дар қавс):
//   T-Shirt (Shirt✅ дар ҳамон дарс), Jacket (Coat✅), Hat (Cap✅),
//   Skirt (Dress✅), Jeans (Pants✅), Sneakers (Shoes✅, Boots✅),
//   Glasses ва Sunglasses (як эмоҷӣ, як дарс), Notebook (Book дар ҳамон дарс),
//   Hot Chocolate (≈Coffee), River ва Lake (як дарс), Earth ва World,
//   Board (Classroom✅ худаш тахтаро нишон медиҳад), Coin (Money/Cash/Dollar),
//   Star (акси «ситора» дар амал осмон аст), Home (≈House✅), Room (умумӣ),
//   одамон/касбҳо, рӯзу моҳҳо, аломатҳои самт, мафҳумҳои абстрактӣ.
import { writeFileSync } from 'fs';

const OBJECT_STYLE =
  'professional realistic photograph, natural real-world object, shot with a DSLR camera, ' +
  'soft natural studio lighting, shallow depth of field, plain clean neutral light grey background, ' +
  'centered, sharp focus, high detail, no text, no watermark, no logo, no illustration, ' +
  'no cartoon, no 3D render, photorealistic, ';

const SCENE_STYLE =
  'professional realistic photograph, shot with a DSLR camera, natural daylight, ' +
  'sharp focus, high detail, photorealistic, no people, no readable text anywhere, ' +
  'all signs blank, no watermark, no logo, no illustration, no cartoon, ';

// [калид, промпт, услуб]
const ITEMS = [
  // — ашёи ягона —
  ['coffee',    'a white ceramic cup of hot black coffee with crema, seen from a slight angle, steam rising', 'obj'],
  ['soda',      'a tall clear glass of dark brown fizzy cola with ice cubes and rising bubbles', 'obj'],
  ['book',      'a single closed hardcover book with a plain dark cover lying flat on a table', 'obj'],
  ['lamp',      'a single switched-on table lamp with a fabric shade standing on a table', 'obj'],
  ['clock',     'a single round white wall clock with black hands showing ten past ten, hanging on a plain wall', 'obj'],
  ['map',       'an open folded paper road map spread out flat, colourful roads and areas, no readable place names', 'obj'],
  ['fire',      'close-up of bright orange and yellow flames of a burning campfire against a dark background', 'obj'],
  // — саҳнаҳо (объекти ягона намешавад) —
  ['office',    'wide interior view of a modern open-plan office with desks, office chairs and computer monitors', 'scene'],
  ['library',   'wide interior view of a public library with tall wooden shelves full of books and a reading table', 'scene'],
  ['bridge',    'a long stone road bridge crossing over a wide river, seen from the riverbank, daylight', 'scene'],
  ['apartment', 'exterior of a tall modern residential apartment building with many balconies, street view, blank signs', 'scene'],
];

let seed = 1400;
const rows = ITEMS.map(([key, prompt, kind]) => {
  const full = (kind === 'scene' ? SCENE_STYLE : OBJECT_STYLE) + prompt;
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(full)}` +
    `?width=1024&height=1024&nologo=true&seed=${seed++}&model=flux`;
  return `${key}\t${url}`;
});

writeFileSync(new URL('./_pick-a1-gap-urls.tsv', import.meta.url), rows.join('\n') + '\n');
console.log(`TSV тайёр: ${rows.length} расм`);
