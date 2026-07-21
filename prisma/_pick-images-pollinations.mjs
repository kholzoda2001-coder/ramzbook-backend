// URL-ҳои Pollinations.ai (FLUX, РОЙГОН, бе калид) барои расмҳои камбуди pick.
// Ҳамон пайплайни пешина (tmp/image-list/dl-photo.sh): TSV → curl-и пайдарпай.
// Ин скрипт танҳо TSV месозад; зеркашӣ дар bash (429-и Pollinations параллелро
// намебардорад, ва fetch-и Node дар Windows овезон мешавад — curl боэътимод).
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { A1_PICK } from './_pick-images-a1.mjs';

const REPO = process.argv[2];
if (!REPO) { console.error('роҳи репои ramz-audio лозим'); process.exit(1); }

// Услуби асосӣ — айнан мисли партияи пешинаи Pollinations (услуби тасдиқшуда).
const BASE_STYLE =
  'professional realistic photograph, natural real-world object, shot with a DSLR camera, ' +
  'soft natural studio lighting, shallow depth of field, plain clean neutral light grey background, ' +
  'centered, sharp focus, high detail, no text, no watermark, no logo, no illustration, ' +
  'no cartoon, no 3D render, photorealistic, ';

// Ҳуҷраҳо ва биноҳо услуби САҲНА мехоҳанд (на объекти ягона) — дарси партияи
// OpenAI: "bathroom" → ҳоҷатхонаи танҳо, "SCHOOL" → матн рӯи бино.
const SCENE_STYLE =
  'professional realistic photograph, shot with a DSLR camera, natural daylight, ' +
  'sharp focus, high detail, photorealistic, no people, no readable text anywhere, ' +
  'all signs blank, no watermark, no logo, no illustration, no cartoon, ';

const SCENES = {
  // ҳуҷраҳо — намуди васеи дохилӣ, чанд ашёи хоси ҳуҷра якҷоя
  living_room: 'wide interior view of a cozy residential living room with a sofa, coffee table and TV',
  dining_room: 'wide interior view of a residential dining room with a dining table and chairs set for a meal',
  bathroom: 'wide interior view of a modern residential bathroom showing the sink, mirror, shower and bathtub together',
  kitchen: 'wide interior view of a residential kitchen showing cabinets, a sink, a stove and a fridge together',
  bedroom: 'wide interior view of a cozy residential bedroom with a made bed, nightstand and window',
  hallway: 'interior view of a home hallway corridor with doors along the walls',
  classroom: 'wide interior view of a school classroom with rows of desks and a green chalkboard',
  garage: 'interior of a home garage with a parked car inside, door open',
  garden: 'a beautiful home backyard garden with flower beds, green plants and a small path',
  farm: 'a farm scene with a red barn, green fields and a wooden fence under a blue sky',
  house: 'exterior of a small cozy single-family house with a pitched roof, front door and windows, front view',
  // биноҳо — намуди беруна, аломатҳо холӣ (бе навиштаҷот)
  school: 'street-level exterior of a two-storey school building with a schoolyard and flagpole, blank sign',
  mosque: 'exterior of a beautiful mosque with a dome and minarets, clear sky',
  hotel: 'exterior of a modern hotel building entrance with a canopy and luggage trolley, blank sign',
  restaurant: 'interior of a restaurant with set tables, wine glasses and warm lighting',
  hospital: 'exterior of a modern hospital building with a large red cross symbol only, ambulance parked outside, blank signs',
  pharmacy: 'exterior of a pharmacy shop entrance with a green cross symbol only, blank signs',
  bakery: 'interior of a bakery with shelves of fresh bread and pastries on display',
  museum: 'exterior of a classical museum building with tall stone columns and wide steps',
  stadium: 'aerial view of a large open football stadium with green pitch and stands',
  post_office: 'exterior of a small post office building with a blue mailbox in front, blank sign',
  police_station: 'exterior of a police station building with a parked police car in front, blank signs',
  mall: 'wide interior view of a modern shopping mall atrium with escalators and shop fronts, blank signs',
  park: 'a green city park with trees, a walking path and wooden benches',
  cinema: 'interior of a cinema hall with rows of red seats facing a large blank screen',
  bank: 'exterior of a solid classical bank building with columns, blank sign',
  cafe: 'interior of a cozy cafe with small tables, a coffee machine on the counter and cups',
  zoo: 'a zoo scene with an open giraffe enclosure and a walking path with a wooden fence',
  supermarket: 'wide interior view of a supermarket aisle with shelves full of colourful products, blank labels',
  // 8 объекте ки аз лимити биллинг намонда буданд
  stone: 'a single smooth grey rock lying on the ground',
  mountain: 'a high snow-capped mountain peak under a clear blue sky',
  beach: 'a sandy beach with gentle sea waves, seen from the shore',
  sea: 'the open blue sea with waves to the horizon, no shore visible',
  moon: 'the full bright moon in a dark night sky',
  tree: 'a single large green leafy tree standing alone in a field',
};

const all = [...new Set(Object.values(A1_PICK).flat())];
const rows = [];
let seed = 700;
for (const key of all) {
  if (existsSync(`${REPO}/images/en/${key}.png`)) continue;
  const scene = SCENES[key];
  const prompt = scene
    ? SCENE_STYLE + scene
    : BASE_STYLE + `a real ${key.replace(/_/g, ' ')}`;
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}` +
    `?width=1024&height=1024&nologo=true&seed=${seed++}&model=flux`;
  rows.push(`${key}\t${url}`);
}
writeFileSync(new URL('./_pick-missing-urls.tsv', import.meta.url), rows.join('\n') + '\n');
console.log(`TSV тайёр: ${rows.length} расм барои зеркашӣ`);
