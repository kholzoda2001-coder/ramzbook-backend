// Партияи 3 — 133 расм барои A1 (80 объект + 53 одам/касб). Ройгон (Pollinations FLUX).
// Танҳо TSV месозад; зеркашӣ дар bash.
import { readFileSync, writeFileSync } from 'fs';

const cat = JSON.parse(readFileSync(new URL('./_a1-categorize.json', import.meta.url), 'utf8'));

// Гурӯҳҳое ки расми ТОЗА намешаванд — хориҷ.
const DAYS=/^(monday|tuesday|wednesday|thursday|friday|saturday|sunday|january|february|march|april|may|june|july|august|september|october|november|december|afternoon|evening|night|morning|birthday|season|years)$/i;
const COLOR=/^(red|blue|green|yellow|black|white|orange|purple|pink|brown|gray|grey|silver|gold|dark blue|light green|maroon|navy|beige|bright|dark|colorful|pale)$/i;
const ADJ=/^(young|old|tall|short|strong|nice|big|small|new|beautiful|comfortable|dirty|clean|ugly|long|tight|loose|hot|warm|cold|hungry|full|thirsty|weak|elderly|good afternoon|good evening|good night|good morning|married|single|fun|cheap|expensive)$/i;
const PREP=/^(under|next to|between|above|below|near|behind|in front of|across from|far|left|right|straight)$/i;
const VERB=/^(live|learn|wake up|get up|go|study|come|make|like|want|buy|cost|need|try on|return|turn|find|arrive|feel|smile|hurt|rest|change)$/i;
const IMAGELESS=/^(what|who|air|one hundred|kilo|entrance|exit|appointment|job|address)$/i; // калима вале расми тоза не

// Промптҳои дастӣ (одам/касб/саҳна/касалӣ — умумӣ кор намекунад).
const OBJECT='professional realistic photograph, single real object, DSLR, soft studio light, plain neutral light grey background, centered, sharp focus, high detail, no text, no watermark, no logo, no illustration, no cartoon, photorealistic, ';
const SCENE='professional realistic photograph, DSLR, natural daylight, sharp focus, photorealistic, no readable text, all signs blank, no watermark, no logo, no cartoon, ';
const PERSON='professional realistic portrait photograph, DSLR, soft natural light, plain neutral background, warm friendly, sharp focus, photorealistic, no text, no watermark, ';

const P = {
  // ── одамон ──
  man:['a middle-aged adult man smiling, upper body portrait',PERSON],
  woman:['a middle-aged adult woman smiling, upper body portrait',PERSON],
  boy:['a young boy about 8 years old smiling, portrait',PERSON],
  girl:['a young girl about 8 years old smiling, portrait',PERSON],
  baby:['a cute smiling baby, portrait',PERSON],
  friend:['two happy young friends standing together, smiling',PERSON],
  person:['a single adult person standing, neutral portrait',PERSON],
  stranger:['an unfamiliar adult person on a city street, slight distance',SCENE],
  everyone:['a diverse group of many people together, wide shot',SCENE],
  group:['a group of several people standing together',SCENE],
  team:['a sports team of people in matching jerseys posing together',SCENE],
  teenager:['a teenager about 15 years old, portrait',PERSON],
  child:['a small child about 5 years old, portrait',PERSON],
  adult:['a grown adult person, full upper-body portrait',PERSON],
  twins:['two identical twin babies side by side',PERSON],
  // ── хешутабор ──
  father:['a happy father holding his young child, warm family portrait',PERSON],
  mother:['a happy mother holding her young child, warm family portrait',PERSON],
  son:['a young boy standing next to his father, family',PERSON],
  daughter:['a young girl standing next to her mother, family',PERSON],
  family:['a happy family of parents and children together',SCENE],
  husband:['a smiling adult man wearing a wedding ring, portrait',PERSON],
  wife:['a smiling adult woman wearing a wedding ring, portrait',PERSON],
  parents:['a mother and father couple standing with their children',SCENE],
  brother:['two young brothers boys standing together smiling',PERSON],
  sister:['two young sisters girls standing together smiling',PERSON],
  grandfather:['a happy elderly grey-haired man, portrait',PERSON],
  grandmother:['a happy elderly grey-haired woman, portrait',PERSON],
  uncle:['a friendly adult man with a young child, family',PERSON],
  aunt:['a friendly adult woman with a young child, family',PERSON],
  cousin:['two young cousins children playing together',PERSON],
  nephew:['a young boy with his adult uncle, family',PERSON],
  niece:['a young girl with her adult aunt, family',PERSON],
  grandparent:['an elderly grandparent with a grandchild',PERSON],
  colleague:['two office coworkers in business clothes talking',SCENE],
  neighbour:['two neighbours chatting over a garden fence',SCENE],
  classmate:['two students sitting together in a classroom',SCENE],
  // ── касбҳо ──
  manager:['a confident business manager in a suit in an office',PERSON],
  guest:['a welcomed guest arriving at a home doorway with a suitcase',SCENE],
  engineer:['a construction engineer wearing a yellow hard hat and safety vest, holding blueprints',PERSON],
  driver:['a taxi driver sitting behind the steering wheel of a car',PERSON],
  builder:['a construction builder in a hard hat holding tools at a building site',PERSON],
  seller:['a market seller standing behind a stall of goods',PERSON],
  farmer:['a farmer in work clothes standing in a green field',PERSON],
  cashier:['a cashier standing at a supermarket checkout register',PERSON],
  customer:['a shopper customer holding a shopping basket in a store',SCENE],
  shop_assistant:['a friendly shop assistant helping in a clothing store',SCENE],
  doctor:['a doctor in a white coat with a stethoscope, smiling',PERSON],
  nurse:['a nurse in medical scrubs in a hospital, smiling',PERSON],
  patient:['a patient lying in a hospital bed',SCENE],
  pharmacist:['a pharmacist in a white coat behind a pharmacy counter',PERSON],
  teacher:['a teacher standing at a chalkboard in a classroom',SCENE],
  student:['a student with a backpack and books, smiling',PERSON],

  // ── объектҳои мушаххас ──
  email:['a large white envelope with a bright blue @ email symbol on it',OBJECT],
  salary:['a stack of paper money banknotes with coins, income',OBJECT],
  company:['a modern glass corporate office tower building, exterior',SCENE],
  one_hundred:['', ''], // (хориҷ)
  breakfast:['a breakfast plate with fried eggs, toast and a cup of coffee, top view',OBJECT],
  lunch:['a lunch plate with a sandwich and salad, top view',OBJECT],
  dinner:['a dinner plate with grilled meat, rice and vegetables, top view',OBJECT],
  meal:['a full dinner table set with several dishes of food',SCENE],
  snack:['a small bowl of mixed nuts and crackers snack',OBJECT],
  hot_chocolate:['a mug of hot chocolate with whipped cream and cocoa',OBJECT],
  room:['a wide interior view of a simple furnished room',SCENE],
  home:['a cozy small family house exterior at daytime, front view',SCENE],
  notebook:['a single closed spiral notebook on a desk',OBJECT],
  money:['a fanned stack of paper banknotes cash',OBJECT],
  cash:['a pile of paper banknote bills, cash',OBJECT],
  coin:['a few shiny metal coins stacked',OBJECT],
  card:['a single blank plastic bank card',OBJECT],
  dollar:['a stack of green dollar banknotes',OBJECT],
  credit_card:['a single blank plastic credit card, close up',OBJECT],
  store:['exterior of a small shop store front with a display window',SCENE],
  product:['several boxed retail products on a shelf',OBJECT],
  t_shirt:['a single plain folded cotton t-shirt',OBJECT],
  jacket:['a single casual jacket on a hanger',OBJECT],
  hat:['a single stylish hat',OBJECT],
  skirt:['a single womans skirt on a hanger',OBJECT],
  jeans:['a single pair of folded blue denim jeans',OBJECT],
  sneakers:['a single pair of white sneakers shoes',OBJECT],
  glasses:['a single pair of eyeglasses with clear lenses',OBJECT],
  sunglasses:['a single pair of dark sunglasses',OBJECT],
  package:['a closed cardboard delivery package box',OBJECT],
  train_station:['a train station platform with a train arriving',SCENE],
  subway:['an underground subway metro station platform',SCENE],
  head:['a side profile of a human head and face',OBJECT],
  stomach:['a person pointing to their stomach belly area',OBJECT],
  back:['the back of a persons body, upper back view',OBJECT],
  headache:['a person holding their head with both hands in pain, headache',PERSON],
  stomachache:['a person clutching their stomach in pain',PERSON],
  toothache:['a person holding their cheek with a toothache in pain',PERSON],
  fever:['a sick person in bed holding a thermometer, fever',PERSON],
  cough:['a person coughing into their hand, sick',PERSON],
  sore_throat:['a person touching their sore throat neck in discomfort',PERSON],
  clinic:['exterior of a small modern medical clinic building',SCENE],
  medicine:['several bottles of medicine and pill packs',OBJECT],
  prescription:['a doctor handwritten prescription paper note',OBJECT],
  pill:['a small pile of white and colored pills tablets',OBJECT],
  bandage:['a roll of white medical bandage',OBJECT],
  plaster:['adhesive plaster bandage strips',OBJECT],
  wind:['trees and grass bending strongly in the wind on a field',SCENE],
  sky:['a clear blue sky with a few white clouds',SCENE],
  spring:['a spring meadow full of blooming flowers and green grass',SCENE],
  summer:['a bright sunny summer beach with clear sky',SCENE],
  autumn:['an autumn forest with orange and yellow falling leaves',SCENE],
  winter:['a snowy winter landscape with snow-covered trees',SCENE],
  animal:['a group of different wild animals together in nature',SCENE],
  pet:['a cute pet dog and cat sitting together',OBJECT],
  bird:['a small colorful bird perched on a branch',OBJECT],
  wolf:['a grey wolf standing in a forest',OBJECT],
  hill:['a single green rolling grassy hill under blue sky',SCENE],
  river:['a wide flowing river between green banks',SCENE],
  lake:['a calm blue mountain lake surrounded by trees',SCENE],
  star:['a bright shining star in the dark night sky',OBJECT],
  earth:['planet Earth seen from space, blue and green globe',OBJECT],
  class:['a classroom full of desks with a chalkboard',SCENE],
  board:['a green school chalkboard on a classroom wall',OBJECT],
  lesson:['an open textbook and notebook with a pen on a desk',OBJECT],
  homework:['a school worksheet with handwriting and a pencil',OBJECT],
  paper:['a single blank white sheet of paper',OBJECT],
  exam:['a school exam test paper with a pencil',OBJECT],
};

const skip = new Set();
let seed = 3000;
const rows = [];
const seen = new Set();
for (const w of cat.picturable_missing) {
  const k = w.key;
  if (seen.has(k)) continue; seen.add(k);
  if (DAYS.test(w.word)||COLOR.test(w.word)||ADJ.test(w.word)||PREP.test(w.word)||VERB.test(w.word)||IMAGELESS.test(w.word)) continue;
  const spec = P[k];
  if (!spec || !spec[0]) { skip.add(w.word); continue; }
  const [prompt, style] = spec;
  const full = style + prompt;
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(full)}?width=1024&height=1024&nologo=true&seed=${seed++}&model=flux`;
  rows.push(`${k}\t${url}`);
}
writeFileSync(new URL('./_a1-img133-urls.tsv', import.meta.url), rows.join('\n') + '\n');
console.log(`TSV тайёр: ${rows.length} расм`);
if (skip.size) console.log(`\nбе промпт монданд (${skip.size}): ${[...skip].join(', ')}`);
