// A1 pictures, round 2 of the clean-up: the 12 remaining bad ones found by
// reviewing all 317 existing images on contact sheets.
//
// Six are body parts (arm, back, head, leg, stomach, headache). Every one came
// back as bare skin — a shirtless torso for "back", a bare midriff for
// "stomach". These prompts put clothes on the subject and frame the part
// THROUGH the clothing, which is what fixed the same failure in the A2 batch.
//
// The other six simply missed: "bandage" produced a toilet roll, "snow" a pile
// of white powder, "plaster" a plain cylinder, "animal" a pack of dogs with
// melted faces, "drive" a pair of malformed hands, "nose" a nose floating on
// its own. All six are ordinary things, so they get plainer, more literal
// prompts rather than being dropped.
import { writeFileSync } from 'fs';

const OBJECT = 'professional realistic photograph, single real object, DSLR, soft studio light, plain neutral light grey background, centered, sharp focus, high detail, no text, no letters, no watermark, no logo, no illustration, no cartoon, photorealistic, ';
const SCENE = 'professional realistic photograph, DSLR, natural daylight, sharp focus, photorealistic, no readable text, no watermark, no logo, no cartoon, ';
const PERSON = 'professional realistic photograph, DSLR, soft natural light, plain neutral background, sharp focus, photorealistic, fully clothed, modest clothing, natural anatomy, correct hands, no bare skin, no text, no watermark, ';

const P = {
  // ── body parts: clothed, part shown through or beside the clothing ──
  head: ['a side profile portrait of a person wearing a shirt, head and face clearly visible', PERSON],
  arm: ['a person in a short-sleeved t-shirt holding one arm out straight to the side', PERSON],
  back: ['a person wearing a plain shirt photographed from behind, upper back view', PERSON],
  leg: ['a person wearing trousers and shoes, legs shown standing', PERSON],
  stomach: ['a person in a t-shirt resting both hands flat on their stomach', PERSON],
  headache: ['a fully clothed person in a jumper pressing both temples with their fingers, pained expression', PERSON],
  // ── plain objects the first pass got wrong ──
  bandage: ['a rolled white medical gauze bandage next to a folded bandage strip', OBJECT],
  plaster: ['several adhesive fabric sticking plasters for a cut, scattered', OBJECT],
  snow: ['fresh white snow lying deep on the ground with footprints, winter', SCENE],
  nose: ['a front portrait of a persons face with the nose in sharp focus', PERSON],
  animal: ['a cow, a horse and a sheep standing together in a green field', SCENE],
  drive: ['a person in a jacket sitting in a car seat with both hands on the steering wheel, seen from the passenger side', PERSON],
};

let seed = 52000;
const rows = [];
for (const [k, [prompt, style]] of Object.entries(P)) {
  rows.push(`${k}\thttps://image.pollinations.ai/prompt/${encodeURIComponent(style + prompt)}?width=1024&height=1024&nologo=true&seed=${seed++}&model=flux`);
}
writeFileSync(new URL('./_a1-images-fix2-urls.tsv', import.meta.url), rows.join('\n') + '\n');
console.log(`TSV: ${rows.length} расм`);
