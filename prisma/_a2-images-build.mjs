// A2 images — batch 1. Free generation via Pollinations FLUX (no key), exactly
// the pipeline used for A1 (see _a1-img133-build.mjs). Writes a TSV only;
// downloading happens in bash, sequentially, because parallel requests get 429.
//
// Which words get a photo: the picture is shown on the "new word" INTRO card,
// where the answer is already written underneath, so a photo only has to
// ILLUSTRATE the word — it doesn't have to single it out the way the A1
// picture-choice drill did. (`pick` is off from A2 up.) So people and jobs are
// fine here; what is left out is what no photograph can show at all — pure
// abstractions (purpose, freedom, truth), amounts (half, dozen, litre) and
// bookkeeping words (income, debt, fee).
import { readFileSync, writeFileSync } from 'fs';

const need = JSON.parse(readFileSync(new URL('../a2_need_images.json', import.meta.url), 'utf8'));

const OBJECT = 'professional realistic photograph, single real object, DSLR, soft studio light, plain neutral light grey background, centered, sharp focus, high detail, no text, no watermark, no logo, no illustration, no cartoon, photorealistic, ';
const SCENE = 'professional realistic photograph, DSLR, natural daylight, sharp focus, photorealistic, no readable text, all signs blank, no watermark, no logo, no cartoon, ';
const PERSON = 'professional realistic portrait photograph, DSLR, soft natural light, plain neutral background, warm friendly, sharp focus, photorealistic, no text, no watermark, ';

// Nothing a camera can point at — these keep their emoji.
const SKIP = new Set([
  'half', 'dozen', 'litre', 'energy', 'strength', 'wellbeing',
  'purpose', 'goal', 'ambition', 'wish', 'future', 'motivation', 'chance',
  'opportunity', 'decision', 'experience', 'achievement', 'success',
  'justice', 'freedom', 'truth', 'fact', 'rumour', 'duty',
  'income', 'wage', 'debt', 'fee', 'loan',
  'memory', 'moment', 'past', 'habit', 'routine', 'spare_time', 'chore',
  'issue', 'brand',
]);

const P = {
  // ── M0 stories / past ──
  story: ['an open storybook with illustrated pages on a table', OBJECT],
  adventure: ['a hiker with a backpack standing on a mountain ridge looking out', SCENE],
  holiday: ['a sunny tropical beach with palm trees and a sun lounger', SCENE],
  childhood: ['young children playing happily together outdoors', SCENE],
  event: ['a crowd celebrating at an outdoor party with lights and balloons', SCENE],
  dream: ['a person sleeping peacefully in bed at night', SCENE],
  trip: ['a packed suitcase and travel items ready by a door', OBJECT],
  // ── M1 roles ──
  boss: ['a confident manager in a suit standing in a modern office', PERSON],
  owner: ['a proud small shop owner standing in the doorway of their shop', SCENE],
  member: ['a person holding a membership card, smiling', PERSON],
  // ── M2 home routine ──
  housework: ['a person vacuuming and tidying a living room', SCENE],
  laundry: ['a basket full of folded clean laundry next to a washing machine', OBJECT],
  mess: ['a very untidy messy bedroom with clothes and objects scattered', SCENE],
  schedule: ['a weekly wall planner calendar with colourful markings', OBJECT],
  nap: ['a person taking a short nap on a sofa in the afternoon', SCENE],
  series: ['a television screen showing a drama series in a living room', SCENE],
  diary: ['an open personal diary notebook with a pen', OBJECT],
  evening_walk: ['a person walking along a park path at sunset', SCENE],
  // ── M3 quantities ──
  carton: ['a cardboard carton of milk', OBJECT],
  packet: ['a sealed food packet bag of crisps', OBJECT],
  piece: ['a single slice of cake on a plate', OBJECT],
  bunch: ['a large bunch of purple grapes', OBJECT],
  loaf: ['a whole loaf of fresh bread', OBJECT],
  jar: ['a glass jar of honey with the lid on', OBJECT],
  spoonful: ['a spoon heaped full of sugar', OBJECT],
  // ── M4 travel ──
  journey: ['a long empty road stretching towards distant mountains', SCENE],
  tour: ['a group of tourists with a guide at a landmark', SCENE],
  departure: ['a passenger aeroplane taking off from a runway', SCENE],
  arrival: ['a passenger aeroplane landing at an airport', SCENE],
  delay: ['travellers waiting on chairs in an airport terminal, tired', SCENE],
  passenger: ['a traveller sitting in an aeroplane seat looking out of the window', PERSON],
  customs: ['an airport customs inspection desk with luggage', SCENE],
  crew: ['a smiling flight attendant crew standing in an aeroplane cabin', PERSON],
  booking: ['a laptop showing a hotel reservation next to a passport', OBJECT],
  view: ['a beautiful panoramic mountain valley view', SCENE],
  floor: ['a lift button panel showing numbered floors in a building', OBJECT],
  sightseeing: ['tourists photographing a famous historic monument', SCENE],
  // ── M5 transport ──
  distance: ['a long straight road disappearing towards the horizon', SCENE],
  fare: ['a hand paying coins to a bus driver', SCENE],
  route: ['a paper road map with a marked route and a pin', OBJECT],
  traffic: ['a busy city street full of cars in slow traffic', SCENE],
  passengers: ['many passengers sitting inside a bus', SCENE],
  rush_hour: ['a crowded city road jammed with cars at rush hour', SCENE],
  // ── M6 work ──
  firm: ['a modern glass office building exterior', SCENE],
  meeting: ['colleagues sitting around a table in a business meeting', SCENE],
  interview: ['a job interview, two people talking across a desk', SCENE],
  staff: ['a team of employees standing together in an office', PERSON],
  contract: ['a printed contract document with a pen ready to sign', OBJECT],
  shift: ['a worker checking a wall clock at the start of their shift', SCENE],
  deadline: ['a desk calendar with a date circled in red next to a clock', OBJECT],
  employee: ['an office worker at a desk with a computer, smiling', PERSON],
  report: ['a printed business report with charts on a desk', OBJECT],
  document: ['a stack of official paper documents', OBJECT],
  presentation: ['a person presenting charts on a screen to colleagues', SCENE],
  task: ['a paper to-do checklist with ticked boxes and a pen', OBJECT],
  project: ['a team planning with sticky notes on a whiteboard', SCENE],
  client: ['a businessperson shaking hands with a client', SCENE],
  career: ['a person in business clothes walking confidently up office stairs', SCENE],
  // ── M7 health ──
  skin: ['a close-up of clean healthy human skin on an arm', OBJECT],
  migraine: ['a person pressing both temples with a severe headache', PERSON],
  temperature: ['a digital medical thermometer showing a reading', OBJECT],
  cramp: ['an athlete gripping their calf muscle in pain', PERSON],
  ache: ['a person holding their lower back in discomfort', PERSON],
  injury: ['a bandaged injured knee on a person', OBJECT],
  flu: ['a sick person wrapped in a blanket blowing their nose with tissues', PERSON],
  dose: ['a measuring cup of liquid medicine next to a bottle', OBJECT],
  treatment: ['a doctor treating a patient in a clinic room', SCENE],
  checkup: ['a doctor listening to a patient with a stethoscope', SCENE],
  ward: ['a tidy hospital ward with several beds', SCENE],
  diet: ['a healthy plate of salad and vegetables', OBJECT],
  nutrition: ['an assortment of fresh healthy foods on a table', OBJECT],
  weight: ['a bathroom weighing scale on a floor', OBJECT],
  muscle: ['a strong flexed human arm muscle close-up', OBJECT],
  fitness: ['a person exercising with dumbbells in a gym', SCENE],
  stress: ['a stressed person at a desk holding their head, overwhelmed', PERSON],
  // ── M8 free time ──
  collecting: ['a collection of old coins and stamps laid out neatly', OBJECT],
  concert: ['a live music concert with a lit stage and a crowd', SCENE],
  instrument: ['several musical instruments together, guitar and violin', OBJECT],
  choir: ['a choir of singers standing in rows singing together', SCENE],
  audience: ['an audience clapping in a full theatre', SCENE],
  stage: ['an empty lit theatre stage with red curtains', SCENE],
  comedy: ['a stand-up comedian on stage and a laughing audience', SCENE],
  podcast: ['a podcast microphone with headphones on a desk', OBJECT],
  festival: ['a colourful outdoor festival crowd with flags and lights', SCENE],
  hobby: ['a person happily painting at an easel at home', SCENE],
  fan: ['excited sports fans cheering in a stadium', SCENE],
  amateur: ['a beginner learning to play a guitar at home', SCENE],
  // ── M9 technology ──
  device: ['a smartphone, tablet and laptop lying together', OBJECT],
  website: ['a laptop screen showing a clean blank webpage layout', OBJECT],
  app: ['a smartphone home screen full of colourful app icons', OBJECT],
  password: ['a login screen with a password field of dots and a padlock', OBJECT],
  account: ['a computer screen showing a user profile page with an avatar', OBJECT],
  browser: ['a laptop showing an open web browser window', OBJECT],
  wifi: ['a white wireless wifi router with antennas', OBJECT],
  link: ['a metal chain link close-up', OBJECT],
  network: ['server racks with many glowing network cables', OBJECT],
  message: ['a smartphone showing a chat conversation with speech bubbles', OBJECT],
  notification: ['a smartphone lock screen showing notification banners', OBJECT],
  social_media: ['a person scrolling a social media feed on a phone', SCENE],
  post: ['a smartphone showing a social media photo post', OBJECT],
  comment: ['a phone screen showing comment bubbles under a post', OBJECT],
  contact: ['a smartphone showing a contacts list with avatars', OBJECT],
  video_call: ['a laptop screen showing a video call with several people', SCENE],
  emoji: ['a smartphone keyboard showing a grid of yellow emoji faces', OBJECT],
  screen_time: ['a person looking tired at a glowing phone screen late at night', SCENE],
  // ── M10 environment ──
  pollution: ['factory chimneys releasing thick smoke into a grey sky', SCENE],
  climate: ['a dry cracked earth field under a blazing hot sun', SCENE],
  environment: ['a clean green forest with a clear river', SCENE],
  fuel: ['a petrol pump nozzle at a fuel station', OBJECT],
  // ── M12 money ──
  payment: ['a hand paying with a bank card at a payment terminal', SCENE],
  invoice: ['a printed invoice bill with figures and a pen', OBJECT],
  discount: ['a red sale discount price tag on clothing', OBJECT],
  budget: ['a notebook of household budget figures with a calculator', OBJECT],
  currency: ['banknotes and coins of several different countries', OBJECT],
  tip: ['coins and a banknote left on a restaurant table', OBJECT],
  savings: ['a piggy bank with coins beside it', OBJECT],
  bargain: ['a buyer and seller agreeing a price at a market stall', SCENE],
  offer: ['a bright special offer sign board in a shop window', SCENE],
  refund: ['a shop worker handing money back to a customer at a counter', SCENE],
  guarantee: ['an official warranty certificate document with a seal', OBJECT],
  deposit: ['a person using a cash machine ATM', SCENE],
  bill: ['a restaurant bill receipt on a small tray with a pen', OBJECT],
  service: ['a waiter serving a plate to a table in a restaurant', SCENE],
  // ── M13 society / media ──
  community: ['neighbours of all ages gathered happily in a local street', SCENE],
  society: ['a large diverse crowd of people in a city square', SCENE],
  citizen: ['a person proudly holding an identity document', PERSON],
  government: ['a grand classical government parliament building', SCENE],
  law: ['a wooden judges gavel and brass scales of justice', OBJECT],
  population: ['a very large dense crowd of people seen from above', SCENE],
  culture: ['performers in traditional folk costume dancing', SCENE],
  article: ['an open newspaper page with columns of text', OBJECT],
  headline: ['a folded newspaper front page held in a hand', OBJECT],
  channel: ['a television remote control in front of a TV screen', OBJECT],
  advertisement: ['a large blank billboard beside a city road', SCENE],
  announcement: ['a person speaking into a megaphone to a crowd', SCENE],
  reporter: ['a news reporter holding a microphone in front of a camera', PERSON],
  nation: ['many colourful national flags flying on poles', OBJECT],
  border: ['a border crossing checkpoint barrier on a road', SCENE],
  continent: ['a world globe showing the continents', OBJECT],
  region: ['a map with a highlighted region and a location pin', OBJECT],
  immigrant: ['a family arriving with suitcases at an airport terminal', SCENE],
  tradition: ['a traditional cultural ceremony with people in folk dress', SCENE],
  custom: ['two people greeting each other in a traditional way', SCENE],
  heritage: ['an ancient historic stone monument', SCENE],
  capital: ['a capital city skyline with grand buildings', SCENE],
  election: ['a person putting a ballot paper into a ballot box', SCENE],
  volunteer: ['smiling volunteers in vests handing out supplies', SCENE],
  charity: ['hands giving a donation box to people in need', SCENE],
  campaign: ['people holding up blank placards at a public campaign', SCENE],
};

let seed = 7000;
const rows = [];
const noPrompt = [];
for (const w of need) {
  const k = w.key;
  if (SKIP.has(k)) continue;
  const spec = P[k];
  if (!spec) { noPrompt.push(w.word); continue; }
  const full = spec[1] + spec[0];
  rows.push(`${k}\thttps://image.pollinations.ai/prompt/${encodeURIComponent(full)}?width=1024&height=1024&nologo=true&seed=${seed++}&model=flux`);
}
writeFileSync(new URL('./_a2-images-urls.tsv', import.meta.url), rows.join('\n') + '\n');
console.log(`TSV тайёр: ${rows.length} расм`);
console.log(`Қасдан эмоҷӣ монданд (абстракт): ${need.filter(w => SKIP.has(w.key)).length}`);
if (noPrompt.length) console.log(`\n⚠️ БЕ ПРОМПТ монданд (${noPrompt.length}): ${noPrompt.join(', ')}`);
