// Retry for the A2 pictures the first pass got wrong. Reviewed by eye on a
// contact sheet: 41 of 149 were unusable — abstract prompts drifted (law came
// back a golden ladle), "no readable text" was ignored on signs, and a few
// body-part prompts came back with bare skin, which this app must never show.
//
// The retry prompts are deliberately blunter: one concrete object, named
// plainly, with the clothing/framing spelled out where the first try went bare.
// Five words are dropped instead of retried — custom, tradition, heritage,
// citizen, region name a relationship or an idea, not a thing a camera can
// point at, so they keep their emoji.
import { writeFileSync } from 'fs';

const OBJECT = 'professional realistic photograph, single real object, DSLR, soft studio light, plain neutral light grey background, centered, sharp focus, high detail, no text, no letters, no watermark, no logo, no illustration, no cartoon, photorealistic, ';
const SCENE = 'professional realistic photograph, DSLR, natural daylight, sharp focus, photorealistic, no readable text, no letters, all signs blank, no watermark, no logo, no cartoon, ';
const PERSON = 'professional realistic photograph, DSLR, soft natural light, sharp focus, photorealistic, fully clothed, modest clothing, no text, no watermark, ';

const P = {
  // ── objects the first pass turned into abstract blobs ──
  wifi: ['a white wireless internet router with three antennas standing on a desk', OBJECT],
  temperature: ['a digital medical thermometer lying on a white surface', OBJECT],
  weight: ['a white bathroom weighing scale standing on a tiled floor', OBJECT],
  podcast: ['a large silver studio microphone on a boom arm with black headphones beside it', OBJECT],
  link: ['a close-up of two connected steel chain links', OBJECT],
  network: ['a server rack filled with many colourful ethernet network cables', OBJECT],
  report: ['a printed business report on a desk showing bar charts and graphs', OBJECT],
  currency: ['a pile of paper banknotes and metal coins of different countries', OBJECT],
  collecting: ['an open stamp album with rows of postage stamps and old coins beside it', OBJECT],
  budget: ['a notebook page of handwritten numbers next to a pocket calculator', OBJECT],
  guarantee: ['an official certificate on paper with a gold seal and a red ribbon', OBJECT],
  fuel: ['a red petrol pump nozzle held at a car fuel tank at a petrol station', OBJECT],
  floor: ['a lift elevator button panel with round numbered buttons', OBJECT],
  discount: ['a bright red percentage discount price tag hanging on a shirt', OBJECT],
  headline: ['a stack of folded printed newspapers on a table', OBJECT],
  // ── phone / computer screens ──
  message: ['a smartphone held in a hand showing a chat with green speech bubbles', OBJECT],
  post: ['a smartphone screen showing a social media photo post with a heart icon', OBJECT],
  comment: ['a smartphone screen showing several speech bubble comments under a photo', OBJECT],
  contact: ['a smartphone screen showing an address book contact list with photo avatars', OBJECT],
  account: ['a computer login screen showing a round user avatar icon and a padlock', OBJECT],
  // ── scenes ──
  service: ['a waiter in a white uniform carrying a tray of food to a restaurant table', SCENE],
  bargain: ['a buyer and a seller shaking hands over goods at a market stall', SCENE],
  audience: ['rows of seated people in a theatre clapping and watching a show', SCENE],
  advertisement: ['a huge blank white empty billboard standing beside a city road', SCENE],
  firm: ['a modern glass office tower photographed from the street looking up', SCENE],
  climate: ['dry cracked desert ground under a blazing sun, heat haze', SCENE],
  government: ['a grand classical government building with tall columns and flags outside', SCENE],
  charity: ['hands dropping coins and banknotes into a cardboard donation box', SCENE],
  announcement: ['a person in a jacket speaking into a handheld megaphone outdoors', SCENE],
  campaign: ['a crowd of people outdoors holding up completely blank white placards', SCENE],
  law: ['a wooden judges gavel resting on its round wooden sound block on a desk', OBJECT],
  // ── body / health: clothed, no bare skin ──
  skin: ['a close-up of the back of a healthy human hand, skin texture', OBJECT],
  ache: ['a fully clothed person in a jumper pressing both hands to their lower back in pain', PERSON],
  cramp: ['a runner in a tracksuit sitting on a running track gripping their calf through the fabric', PERSON],
  injury: ['a knee wrapped in a clean white medical bandage, trouser leg rolled up', OBJECT],
  offer: ['a shop window with a large blank red sale sign board, no writing', SCENE],
};

// No photograph can single these out — they stay emoji.
const DROP = ['custom', 'tradition', 'heritage', 'citizen', 'region'];

let seed = 21000;
const rows = [];
for (const [k, [prompt, style]] of Object.entries(P)) {
  rows.push(`${k}\thttps://image.pollinations.ai/prompt/${encodeURIComponent(style + prompt)}?width=1024&height=1024&nologo=true&seed=${seed++}&model=flux`);
}
writeFileSync(new URL('./_a2-images-retry-urls.tsv', import.meta.url), rows.join('\n') + '\n');
console.log(`Retry TSV: ${rows.length} расм`);
console.log(`Партофта шуд (эмоҷӣ мемонанд): ${DROP.length} — ${DROP.join(', ')}`);
