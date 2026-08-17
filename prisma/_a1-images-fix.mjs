// A1 pictures: replace 7 malformed people photos + add 21 that were missing.
//
// The 7 replacements are all group shots. Reviewing the existing A1 set on a
// contact sheet showed the failures cluster in exactly one place: the more
// people in frame, the more likely a face or a limb is deformed. In `uncle`
// (the one the learner noticed) a child's head grows out of the man's shoulder.
// So the retry prompts cut the head-count and pull the camera back to full
// body — small merged faces are what the generator gets wrong.
//
// The 21 additions are words left picture-less in the first A1 pass but which a
// photograph shows plainly (birthday, music, price tag, t-shirt, the four times
// of day…). Deliberately still WITHOUT a picture: names, ages, dates, weekdays,
// months, countries and languages (a flag says it better), sizes and colours,
// and left/right/straight — a photo of a road can't say which way.
import { writeFileSync } from 'fs';

const OBJECT = 'professional realistic photograph, single real object, DSLR, soft studio light, plain neutral light grey background, centered, sharp focus, high detail, no text, no letters, no watermark, no logo, no illustration, no cartoon, photorealistic, ';
const SCENE = 'professional realistic photograph, DSLR, natural daylight, sharp focus, photorealistic, no readable text, all signs blank, no watermark, no logo, no cartoon, ';
const PERSON = 'professional realistic photograph, DSLR, soft natural light, plain neutral background, sharp focus, photorealistic, fully clothed, modest clothing, natural anatomy, correct hands, no text, no watermark, ';

const P = {
  // ── 7 replacements: fewer people, full body, faces far apart ──
  uncle: ['one adult man standing next to one boy, both full body, standing apart side by side, both faces clearly visible', PERSON],
  aunt: ['one adult woman standing next to one girl, both full body, standing apart side by side, both faces clearly visible', PERSON],
  twins: ['two identical baby boys in white clothes sitting apart side by side on a plain blanket, full body', PERSON],
  family: ['a family of four standing in a row outdoors, full body, clearly separated, wide shot', SCENE],
  parents: ['one mother and one father standing side by side smiling, full body, no children', PERSON],
  group: ['five people standing in a row outdoors, full body, clearly separated, wide shot', SCENE],
  team: ['a football team in matching jerseys standing in one straight row on a pitch, full body, wide shot', SCENE],
  // ── 21 additions ──
  birthday: ['a birthday cake with lit candles on a table', OBJECT],
  music: ['a pair of headphones next to a guitar and sheet music', OBJECT],
  game: ['a board game with dice and coloured pieces on a table', OBJECT],
  price: ['a blank paper price tag tied with string to a product', OBJECT],
  sale: ['a shop window with a large blank red sale sign board', SCENE],
  list: ['a handwritten shopping list on a notepad with a pen', OBJECT],
  't-shirt': ['a single plain folded cotton t-shirt', OBJECT],
  kilo: ['a kitchen weighing scale with metal weights beside it', OBJECT],
  corner: ['a street corner where two city roads meet, buildings on both sides', SCENE],
  sick: ['a person lying in bed under a blanket holding a thermometer, unwell', PERSON],
  tired: ['a person yawning at a desk, rubbing their eyes, exhausted', PERSON],
  appointment: ['a doctors waiting room with chairs and a reception desk', SCENE],
  accident: ['a damaged car with a dented front on a road after a crash', SCENE],
  danger: ['a bright yellow triangular warning sign on a post, blank symbol', OBJECT],
  weather: ['a wide sky with sun, white clouds and distant rain', SCENE],
  world: ['a detailed world globe on a stand', OBJECT],
  smile: ['a close-up of a happy person smiling widely, portrait', PERSON],
  morning: ['a sunrise over a quiet green field, early morning light', SCENE],
  afternoon: ['a bright sunny midday street with short shadows', SCENE],
  evening: ['a warm orange sunset over a calm town skyline', SCENE],
  night: ['a dark night sky full of stars over a quiet landscape', SCENE],
};

let seed = 41000;
const rows = [];
for (const [k, [prompt, style]] of Object.entries(P)) {
  rows.push(`${k}\thttps://image.pollinations.ai/prompt/${encodeURIComponent(style + prompt)}?width=1024&height=1024&nologo=true&seed=${seed++}&model=flux`);
}
writeFileSync(new URL('./_a1-images-fix-urls.tsv', import.meta.url), rows.join('\n') + '\n');
console.log(`TSV: ${rows.length} расм (7 иваз + 21 нав)`);
