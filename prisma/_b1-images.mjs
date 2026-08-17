// B1 pictures — the concrete words only.
//
// 248 B1 words have no picture, but most of them name an idea, not a thing:
// knowledge, opportunity, loyalty, tolerance, perseverance, hypothesis. The A1
// and A2 rounds showed exactly what happens when those are sent to the
// generator — "law" came back a golden ladle, "custom" came back two women
// kissing. So this list is only the ~90 that a camera can actually point at,
// and the remaining ~160 keep their emoji on purpose.
//
// Prompts follow what worked in the earlier rounds: one subject, plainly named,
// clothed people, and an explicit ban on text (signs came back covered in
// invented letters otherwise).
import { writeFileSync } from 'fs';

const OBJECT = 'professional realistic photograph, single real object, DSLR, soft studio light, plain neutral light grey background, centered, sharp focus, high detail, no text, no letters, no watermark, no logo, no illustration, no cartoon, photorealistic, ';
const SCENE = 'professional realistic photograph, DSLR, natural daylight, sharp focus, photorealistic, no readable text, no letters, all signs blank, no watermark, no logo, no cartoon, ';
const PERSON = 'professional realistic photograph, DSLR, soft natural light, sharp focus, photorealistic, fully clothed, modest clothing, natural anatomy, correct hands, no bare skin, no text, no watermark, ';

const P = {
  // ── M1 travel ──
  accommodation: ['the exterior of a small hotel building with balconies', SCENE],
  accident: ['a car with a badly dented front bumper stopped at the roadside after a crash', SCENE],
  // ── M3 film and music ──
  director: ['a film director holding a clapperboard on a film set', PERSON],
  scene: ['a film set with lights, camera and crew during a shoot', SCENE],
  soundtrack: ['headphones lying on a music score with a small speaker', OBJECT],
  composer: ['a composer sitting at a grand piano writing music', PERSON],
  rhythm: ['a drum kit with drumsticks resting on the snare', OBJECT],
  // ── M4 environment ──
  global_warming: ['a melting glacier breaking into the sea under a hot sun', SCENE],
  agriculture: ['a tractor working in a large green farm field', SCENE],
  roots: ['thick tree roots spreading over the forest ground', OBJECT],
  disaster: ['a flooded street with water covering cars after heavy rain', SCENE],
  // ── M5 health ──
  nausea: ['a fully clothed person sitting on a sofa holding their stomach, feeling unwell', PERSON],
  dizziness: ['a fully clothed person steadying themselves against a wall, feeling faint', PERSON],
  fatigue: ['a fully clothed person asleep at a desk beside a laptop, exhausted', PERSON],
  therapy: ['a calm counselling room with two armchairs facing each other', SCENE],
  remedy: ['a cup of herbal tea with dried herbs and lemon beside it', OBJECT],
  recovery: ['a patient in a hospital bed smiling, sitting up under a blanket', PERSON],
  check_up: ['a doctor listening to a patient with a stethoscope in a clinic', SCENE],
  balanced_diet: ['a plate divided into vegetables, rice and grilled chicken', OBJECT],
  calorie: ['a kitchen scale with a bowl of food on it', OBJECT],
  protein: ['eggs, fish and beans arranged together on a wooden board', OBJECT],
  hydration: ['a clear glass of water beside a full water bottle', OBJECT],
  portion: ['a single measured serving of rice on a small plate', OBJECT],
  fibre: ['a bowl of oats, beans and fresh green vegetables', OBJECT],
  nutrient: ['a colourful assortment of fresh fruit and vegetables', OBJECT],
  // ── M6 technology ──
  hardware: ['computer parts on a desk: a motherboard, RAM sticks and a fan', OBJECT],
  storage: ['two external hard drives and a memory stick on a desk', OBJECT],
  wi_fi: ['a white wireless router with three antennas on a shelf', OBJECT],
  signal: ['a tall mobile phone mast against a clear blue sky', SCENE],
  search_engine: ['a laptop on a desk showing an empty browser search box', OBJECT],
  inbox: ['a laptop screen showing a list of unread email messages', OBJECT],
  spam: ['an overflowing metal bin full of crumpled junk mail letters', OBJECT],
  profile: ['a phone screen showing a round user avatar and a follow button', OBJECT],
  influencer: ['a young person filming themselves with a phone on a tripod and a ring light', PERSON],
  livestream: ['a streaming setup with a camera, microphone and ring light on a desk', OBJECT],
  screenshot: ['a hand holding a phone that displays a captured screen image', OBJECT],
  hacker: ['a hooded figure typing at a keyboard in a dark room lit by screens', PERSON],
  bluetooth: ['a pair of small wireless earbuds beside their charging case', OBJECT],
  // ── M7 money ──
  expense: ['a pile of paper shop receipts spread on a table', OBJECT],
  transaction: ['a hand holding a bank card at a payment terminal', SCENE],
  mortgage: ['a set of house keys resting on a printed document beside a small model house', OBJECT],
  pension: ['an elderly couple sitting together on a park bench', PERSON],
  insurance: ['a folded insurance document beside a pen and a small car model', OBJECT],
  warranty: ['a printed certificate with a gold seal and a red ribbon', OBJECT],
  retail: ['the bright interior of a clothing shop with rails of clothes', SCENE],
  shopper: ['a person walking out of a shop carrying several paper shopping bags', PERSON],
  tax: ['a printed form on a desk with a calculator and a pen', OBJECT],
  fine: ['a parking penalty notice tucked under a car windscreen wiper', OBJECT],
  membership: ['a plastic membership card held in a hand', OBJECT],
  // ── M8 relationships ──
  marriage: ['a bride and groom standing together outdoors, wedding day', PERSON],
  engagement: ['a diamond engagement ring in an open velvet box', OBJECT],
  sibling: ['two children standing side by side smiling, full body', PERSON],
  relative: ['a family of several people standing in a row outdoors, wide shot', SCENE],
  ancestor: ['old sepia family photographs spread on a wooden table', OBJECT],
  generation: ['a grandmother, a mother and a child standing side by side, full body', PERSON],
  // ── M9 food ──
  ingredient: ['flour, eggs, butter and sugar laid out on a kitchen counter', OBJECT],
  cuisine: ['a table spread with several different traditional dishes', SCENE],
  reservation: ['a restaurant table set for two with a small blank card stand', OBJECT],
  vegetarian: ['a plate of grilled vegetables, rice and salad', OBJECT],
  vegan: ['a bowl of beans, avocado, tomatoes and leafy greens', OBJECT],
  // ── M10 science ──
  experiment: ['a scientist in a white coat holding a test tube in a laboratory', PERSON],
  research: ['a laboratory bench with a microscope, notebooks and glassware', SCENE],
  formula: ['a blackboard covered in handwritten mathematical symbols', OBJECT],
  atom: ['a three dimensional model of an atom with orbiting electrons', OBJECT],
  molecule: ['a ball and stick molecular model on a table', OBJECT],
  chemical: ['laboratory bottles filled with coloured liquids on a shelf', OBJECT],
  reaction: ['a beaker of liquid bubbling and giving off vapour in a lab', OBJECT],
  radiation: ['a yellow and black radiation hazard sign on a metal door', OBJECT],
  universe: ['a deep field of stars and coloured nebulae in space', SCENE],
  galaxy: ['a bright spiral galaxy seen from space', SCENE],
  orbit: ['a satellite circling the Earth seen from space', SCENE],
  gene: ['a glowing double helix DNA strand', OBJECT],
  cell: ['a magnified view of living cells under a microscope', OBJECT],
  // ── M11 society ──
  ritual: ['people in traditional dress performing a ceremony with candles', SCENE],
  celebration: ['a crowd celebrating outdoors with balloons and colourful lights', SCENE],
  pilgrimage: ['a long line of pilgrims walking along a mountain path', SCENE],
  household: ['a family sitting together in a living room at home', SCENE],
  neighbourhood: ['a quiet residential street of houses with front gardens', SCENE],
  religion: ['the interior of a large place of worship with tall arches', SCENE],
  politician: ['a person in a suit speaking at a podium with microphones', PERSON],
  donation: ['hands dropping coins and notes into a cardboard donation box', SCENE],
  // ── M12 development ──
  milestone: ['an old stone milestone marker beside a country road', OBJECT],
  workload: ['a tall stack of paper files and folders on an office desk', OBJECT],
  networking: ['people in business clothes talking and shaking hands at an event', SCENE],
  resume: ['a printed one page document on a desk beside a pen and glasses', OBJECT],
};

let seed = 61000;
const rows = [];
for (const [k, [prompt, style]] of Object.entries(P)) {
  rows.push(`${k}\thttps://image.pollinations.ai/prompt/${encodeURIComponent(style + prompt)}?width=1024&height=1024&nologo=true&seed=${seed++}&model=flux`);
}
writeFileSync(new URL('./_b1-images-urls.tsv', import.meta.url), rows.join('\n') + '\n');
console.log(`TSV: ${rows.length} расм`);
console.log('Қасдан бе расм мемонанд: ~160 мафҳуми абстрактӣ (дониш, имконият, садоқат, адолат, собитқадамӣ, назария…)');
