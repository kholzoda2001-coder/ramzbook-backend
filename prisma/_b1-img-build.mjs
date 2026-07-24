// B1 расмҳо — рӯйхати ДАСТӢ интихобшуда (Pollinations FLUX, ройгон).
//
// Чаро дастӣ: B1 сатҳи абстрактарин аст. Категоризатори худкор 299 калимаро
// «объект» гуфт, вале аксарашон мафҳуманд (Knowledge, Trust, Democracy,
// Confidence, Patience, Equality…) — расми тозаашон вуҷуд надорад. Танҳо
// чизҳое интихоб шуданд, ки акс онҳоро БЕ ШУБҲА нишон медиҳад.
import { writeFileSync } from 'fs';

const OBJ='professional realistic photograph, single real object, DSLR, soft studio light, plain neutral light grey background, centered, sharp focus, high detail, no text, no watermark, no logo, no illustration, no cartoon, photorealistic, ';
const SCENE='professional realistic photograph, DSLR, natural daylight, sharp focus, photorealistic, no readable text, all signs blank, no watermark, no logo, no cartoon, ';
const PERSON='professional realistic portrait photograph, DSLR, soft natural light, plain neutral background, sharp focus, photorealistic, no text, no watermark, ';

// [калид, промпт, услуб]
const ITEMS = [
  // ── технология (объектҳои тоза) ──
  ['smartphone','a modern smartphone with a blank screen',OBJ],
  ['touchscreen','a finger touching a tablet touchscreen',OBJ],
  ['router','a wifi router with antennas',OBJ],
  ['headset','a headset with microphone',OBJ],
  ['microphone','a studio microphone on a stand',OBJ],
  ['robot','a friendly humanoid robot standing',OBJ],
  ['satellite','a satellite orbiting above Earth in space',OBJ],
  ['spacecraft','a spacecraft floating in outer space',OBJ],
  ['rocket','a rocket launching with flames and smoke',SCENE],
  ['astronaut','an astronaut in a white space suit',PERSON],
  ['gadget','several small electronic gadgets on a table',OBJ],
  // ── ошхона / хӯрок ──
  ['blender','a kitchen blender with a glass jug',OBJ],
  ['apron','a cooking apron hanging on a hook',OBJ],
  ['cutlery','a set of fork knife and spoon',OBJ],
  ['crockery','a stack of ceramic plates and bowls',OBJ],
  ['menu','an open restaurant menu book',OBJ],
  ['takeaway','takeaway food in paper containers',OBJ],
  ['leftovers','leftover food stored in a container',OBJ],
  ['appetiser','a small appetiser plate with finger food',OBJ],
  ['gravy','a jug of brown gravy sauce',OBJ],
  ['seasoning','small bowls of colorful seasoning spices',OBJ],
  ['beverage','several glasses of different drinks',OBJ],
  // ── тиб ──
  ['painkiller','a blister pack of painkiller tablets',OBJ],
  ['vaccine','a vaccine vial and syringe',OBJ],
  ['antibiotic','a box and bottle of antibiotic pills',OBJ],
  ['rash','a red skin rash close up on an arm',OBJ],
  ['swelling','a swollen ankle close up',OBJ],
  ['surgery','a surgical operating room with a team of surgeons',SCENE],
  ['laboratory','a science laboratory with microscopes and glassware',SCENE],
  ['workout','a person exercising with dumbbells in a gym',PERSON],
  // ── табиат / офат ──
  ['earthquake','a street with cracked ground and damaged buildings after an earthquake',SCENE],
  ['flood','a flooded street with water covering cars',SCENE],
  ['hurricane','palm trees bending in a violent hurricane storm',SCENE],
  ['volcano','an erupting volcano with lava and smoke',SCENE],
  ['drought','dry cracked earth in a drought landscape',SCENE],
  ['wildlife','wild animals grazing in a savanna landscape',SCENE],
  ['crop','a golden wheat crop field ready for harvest',SCENE],
  ['habitat','a lush green forest animal habitat',SCENE],
  // ── шаҳр / нақлиёт ──
  ['traffic_jam','a long traffic jam of cars on a city road',SCENE],
  ['vehicle','a modern car parked on a road',OBJ],
  ['terminal','an airport terminal interior with departure area',SCENE],
  ['gate','an airport boarding gate with seats and a jet bridge',SCENE],
  ['reception','a hotel reception desk in a lobby',SCENE],
  ['landmark','a famous stone landmark monument in a city',SCENE],
  // ── савдо ──
  ['checkout','a supermarket checkout counter with a conveyor belt',SCENE],
  ['aisle','a supermarket aisle with shelves of products',SCENE],
  ['coupon','a paper discount coupon',OBJ],
  ['debit_card','a plain plastic debit bank card',OBJ],
  ['statement','a printed bank statement paper with numbers',OBJ],
  // ── санъат / фарҳанг ──
  ['sculpture','a marble sculpture statue in a gallery',OBJ],
  ['exhibition','an art exhibition hall with visitors viewing artwork',SCENE],
  ['costume','a colorful traditional festival costume',OBJ],
  ['performance','a live stage performance with performers and lights',SCENE],
  // ── таҳсил / кор ──
  ['lecture','a university lecture hall with a speaker and students',SCENE],
  // NB: «Résumé» партофта шуд — барнома онро ба калиди аксентдор «résumé»
  // табдил медиҳад, ки номи файли CDN-ро номутмаин мекунад (URL-encoding).
  ['scholarship','a graduation certificate with a ribbon',OBJ],
  ['mentor','an older mentor advising a younger person at a desk',SCENE],
  ['teamwork','a team of people working together around a table',SCENE],
  ['startup','a young team working in a modern startup office',SCENE],
];

let seed=8000;
const rows=ITEMS.map(([key,prompt,style])=>{
  const full=style+prompt;
  return `${key}\thttps://image.pollinations.ai/prompt/${encodeURIComponent(full)}?width=1024&height=1024&nologo=true&seed=${seed++}&model=flux`;
});
writeFileSync(new URL('./_b1-img-urls.tsv',import.meta.url),rows.join('\n')+'\n');
console.log('TSV тайёр:',rows.length,'расм');
