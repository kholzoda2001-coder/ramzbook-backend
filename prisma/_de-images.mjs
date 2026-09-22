// Расм барои исмҳои олмонӣ.
//
// Барнома расмро на аз база, балки аз рӯи ҚОИДАИ НОМ мегирад:
//   https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio@main/images/de/<калид>.png
// Калид = калима бо ҳарфи хурд, аломатҳо тоза, фосила → «_»
// (`course_roadmap_screen.dart` → `_normImageKey`). Яъне «die Mutter» файли
// `die_mutter.png`-ро меҷӯяд. Манифест нест: агар файл бошад — намоён мешавад,
// набошад — эмоҷӣ мемонад.
//
// ⚠️ Барнома расмро ТАНҲО ба калимаи `partOfSpeech == 'noun'` нишон медиҳад
// (`_showIntroPhoto`). Барои ҳамин `_de-pos.mjs` бояд пеш аз ин иҷро шавад.
//
// Ин скрипт худи расмро НАМЕСОЗАД — TSV-и «калид → URL»-ро месозад, ки
// `_de-images-dl.sh` онро пай дар пай бор мекунад (эндпойнти ройгон ба
// дархостҳои мувозӣ 429 медиҳад).
//
//   node prisma/_de-images.mjs <тартиби модул>   # TSV месозад
import { readFileSync, writeFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);
const COURSE = 'cmqdhwb5q00021z597df2767m';
const MOD = Number(process.argv[2] ?? 1);

// Услуб — аз рӯи расмҳои англисӣ, ки дар CDN аллакай ҳастанд ва хуб баромаданд.
//
// Кӯшиши аввал ноком шуд ва сабабаш дар промпт буд, на дар генератор:
//   • «plain neutral light grey background» → ҳама чиз хокистарии мурда шуд
//   • «modest clothing» → ҳама дар ҷомаи якхелаи дароз баромаданд
//   • «full body» → одам дур меистад ва рӯй вайрон мешавад
// Ҳал: пасзаминаи ГАРМ, либоси ҳаррӯза, ва кадри то камар — FLUX рӯйро дар
// портрет хеле беҳтар мекашад.
// Кӯшиши дуюм ҳам нокифоя буд: сифат хуб шуд, вале маъно не — «portrait
// photograph» модели ҷавонро меорад, на модари чилсола. Дарси асосӣ:
//   калимаи ХЕШОВАНДӢ бо портрети ЯК нафар нишон дода намешавад.
// «Модар» = зан + кӯдак дар як кадр; «бобо» = мӯйсафед + набера. Маҳз ҳамин
// сабаби хуб баромадани расми англисии `mother.png` буд.
const PERSON = 'candid photograph, DSLR, 85mm lens, soft warm natural light, warm home interior background, waist-up, sharp focus, photorealistic, natural skin texture, realistic proportions, wearing a simple t-shirt, high neckline, no text, no watermark, no logo, ';
const GROUP = 'candid family photograph, DSLR, soft warm natural light, warm home interior background, waist-up, sharp focus, photorealistic, natural skin texture, realistic proportions, wearing simple everyday clothes, high neckline, warm smiles, no text, no watermark, no logo, ';
const SCENE = 'professional realistic photograph, DSLR, natural daylight, sharp focus, photorealistic, no readable text, no watermark, no logo, ';

// Тавсифи саҳна барои ҳар исм. Калид = матни калима дар база.
// Чизе ки дар ин ҷо нест, расм намегирад ва эмоҷии худро нигоҳ медорад.
const P = {
  'der Körper': ['a full human body silhouette, anatomical model, medical style', SCENE],
  'der Kopf': ['a human head in profile, detailed drawing', SCENE],
  'das Gesicht': ['a human face looking forward', SCENE],
  'das Auge': ['a close up of a human eye with blue iris', SCENE],
  'das Ohr': ['a close up of a human ear', SCENE],
  'die Nase': ['a close up of a human nose', SCENE],
  'der Mund': ['a close up of a human mouth with lips', SCENE],
  'der Zahn': ['a single clean white tooth, medical style', SCENE],
  'der Hals': ['a human neck and throat area', SCENE],
  'der Rücken': ['a human back, anatomical drawing', SCENE],
  'der Bauch': ['a human stomach area, midriff', SCENE],
  'der Arm': ['a human arm showing muscles', SCENE],
  'die Hand': ['a human hand with five fingers open', SCENE],
  'der Finger': ['a close up of a single human pointing finger', SCENE],
  'das Bein': ['a human leg, standing', SCENE],
  'der Fuß': ['a human foot, bare', SCENE],
  'die Gesundheit': ['a glowing green cross symbol with a heart, health concept', SCENE],
  'die Schmerzen': ['a person holding their head in pain, red glowing pain area', SCENE],
  'das Fieber': ['a thermometer showing high temperature next to a sweating face', SCENE],
  'der Husten': ['a person coughing into their hand, illustration', SCENE],
  'der Schnupfen': ['a person blowing their nose into a tissue', SCENE],
  'der Arzt': ['a male doctor in a white coat with a stethoscope', SCENE],
  'die Ärztin': ['a female doctor in a white coat with a stethoscope', SCENE],
  'die Apotheke': ['a pharmacy building with a green cross sign', SCENE],
  'das Medikament': ['a bottle of medicine and some pills', SCENE],
  'die Tablette': ['a white round pill on a blue background', SCENE],
  'der Termin': ['a calendar page with a red circle on a date, appointment', SCENE],

  'der Morgen': ['a beautiful sunrise over a quiet landscape, morning light', SCENE],
  'der Vormittag': ['a bright late morning in a city, people walking, 10 AM sunlight', SCENE],
  'der Mittag': ['bright midday sun high in the sky over a town square', SCENE],
  'der Nachmittag': ['golden afternoon sunlight hitting a park, people relaxing', SCENE],
  'der Abend': ['a beautiful sunset over a city skyline, evening colors', SCENE],
  'die Nacht': ['a dark night sky with a bright moon and stars over a quiet house', SCENE],
  'die Uhr': ['a classic wall clock showing the time, close up', SCENE],
  'die Minute': ['a modern digital stopwatch or timer showing seconds and minutes', SCENE],
  'die Familie': ['a happy family of four together, a mother, a father, a young son and a young daughter, all four faces clearly visible', GROUP],
  'der Vater': ['a middle aged father holding his young son on his arm, both smiling, both faces clearly visible', GROUP],
  'die Mutter': ['a middle aged mother holding her young daughter on her arm, both smiling, both faces clearly visible', GROUP],
  'das Kind': ['one happy child about six years old alone, playing', PERSON],
  'die Eltern': ['a married couple, one man and one woman about forty years old, side by side, both faces clearly visible', GROUP],
  'die Geschwister': ['a brother and a sister about ten years old side by side, both faces clearly visible', GROUP],
  'der Bruder': ['two brothers together, one teenage boy and one younger boy side by side, both faces clearly visible', GROUP],
  'die Schwester': ['two sisters together, one teenage girl and one younger girl side by side, both faces clearly visible', GROUP],
  'der Sohn': ['a father with his young son beside him, the boy in front, both faces clearly visible', GROUP],
  'die Tochter': ['a mother with her young daughter beside her, the girl in front, both faces clearly visible', GROUP],
  'die Großmutter': ['an elderly grandmother sitting with her young granddaughter beside her, both smiling, both faces clearly visible', GROUP],
  'der Großvater': ['an elderly grandfather sitting with his young grandson beside him, both smiling, both faces clearly visible', GROUP],
  'die Großeltern': ['an elderly couple, one grey haired man and one grey haired woman side by side, both faces clearly visible', GROUP],
  'das Enkelkind': ['an elderly grandmother holding her small grandchild, both smiling, both faces clearly visible', GROUP],
  'der Onkel': ['one adult man with his young nephew beside him, both faces clearly visible', GROUP],
  'die Tante': ['one adult woman with her young niece beside her, both faces clearly visible', GROUP],
  'der Cousin': ['two teenage boys of the same age side by side as cousins, both faces clearly visible', GROUP],
  'die Cousine': ['two teenage girls of the same age side by side as cousins, both faces clearly visible', GROUP],
  'die Person': ['one single adult person alone in the centre of the frame, neutral friendly expression', PERSON],
  'die Leute': ['a group of six different people of different ages standing together in a bright hall', SCENE],

  'das Brot': ['a loaf of fresh crusty bread on a wooden cutting board', SCENE],
  'die Butter': ['a block of yellow butter on a small ceramic dish', SCENE],
  'der Käse': ['a piece of yellow cheese with holes on a wooden board', SCENE],
  'die Marmelade': ['a glass jar of red strawberry jam on a table', SCENE],
  'das Ei': ['a single brown chicken egg on a white plate', SCENE],
  'das Frühstück': ['a healthy breakfast table with bread, butter, eggs and coffee', SCENE],
  
  'der Apfel': ['a fresh red apple with a green leaf on a table', SCENE],
  'die Banane': ['a ripe yellow banana on a white table', SCENE],
  'die Orange': ['a round bright orange fruit on a wooden table', SCENE],
  'die Erdbeere': ['a fresh red strawberry on a white plate', SCENE],
  'die Traube': ['a bunch of fresh green grapes', SCENE],
  'das Obst': ['a bowl full of fresh fruits, apples, bananas, oranges', SCENE],
  
  'die Tomate': ['a fresh red tomato with water drops on it', SCENE],
  'die Kartoffel': ['a raw brown potato on a wooden table', SCENE],
  'die Zwiebel': ['a brown onion on a cutting board', SCENE],
  'der Salat': ['a bowl of fresh green salad with tomatoes', SCENE],
  'die Karotte': ['a fresh orange carrot with green top', SCENE],
  'das Gemüse': ['a basket full of fresh vegetables, tomatoes, carrots, onions', SCENE],
  
  'das Fleisch': ['a raw piece of red meat on a wooden cutting board', SCENE],
  'das Hähnchen': ['a roasted chicken on a plate', SCENE],
  'die Wurst': ['a grilled sausage on a white plate', SCENE],
  'der Fisch': ['a whole fresh fish on a plate with lemon', SCENE],
  'das Mittagessen': ['a hot plate of food for lunch on a table', SCENE],
  'das Abendessen': ['a cozy dinner table with warm food and candles', SCENE],
  
  'das Wasser': ['a clear glass of fresh water', SCENE],
  'der Kaffee': ['a white ceramic cup of hot coffee with latte art', SCENE],
  'der Tee': ['a warm cup of tea with a tea bag string', SCENE],
  'der Saft': ['a glass of fresh orange juice', SCENE],
  'die Milch': ['a glass of fresh white milk', SCENE],
  'das Getränk': ['a refreshing cold drink in a glass with ice', SCENE],
  
  'das Restaurant': ['the cozy interior of a modern restaurant with empty tables', SCENE],
  'die Speisekarte': ['an open restaurant menu on a wooden table', SCENE],
  'die Rechnung': ['a paper receipt on a small restaurant tray', SCENE],
  
  'der Teller': ['an empty white ceramic plate on a table', SCENE],
  'das Glas': ['an empty drinking glass on a table', SCENE],
  'die Tasse': ['an empty white coffee cup', SCENE],
  'das Messer': ['a silver dining knife on a white napkin', SCENE],
  'die Gabel': ['a silver dining fork on a white napkin', SCENE],
  'der Löffel': ['a silver dining spoon on a white napkin', SCENE],

  'das Haus': ['a beautiful modern two-story house with a small front yard', SCENE],
  'die Wohnung': ['a bright modern apartment interior with large windows', SCENE],
  'der Balkon': ['a cozy apartment balcony with some plants and a chair', SCENE],
  'der Garten': ['a green garden with grass, trees and bright sunlight', SCENE],
  'die Treppe': ['a wooden staircase inside a house', SCENE],
  
  'das Zimmer': ['a clean bright empty room with white walls', SCENE],
  'das Wohnzimmer': ['a cozy living room with a sofa, a rug and a coffee table', SCENE],
  'das Schlafzimmer': ['a cozy bedroom with a large comfortable bed and pillows', SCENE],
  'die Küche': ['a modern clean kitchen with white cabinets', SCENE],
  'das Badezimmer': ['a clean modern bathroom with a white bathtub and mirror', SCENE],
  'der Flur': ['a bright hallway in a house with a door and a shoe rack', SCENE],
  
  'das Bett': ['a large comfortable bed with white sheets and pillows', SCENE],
  'der Schrank': ['a tall wooden wardrobe closet in a bedroom', SCENE],
  'der Tisch': ['a simple wooden dining table', SCENE],
  'der Stuhl': ['a modern wooden dining chair', SCENE],
  'das Sofa': ['a comfortable grey sofa in a living room', SCENE],
  'die Möbel': ['a room filled with various modern furniture pieces', SCENE],
  
  'die Lampe': ['a modern floor lamp illuminating a cozy corner', SCENE],
  'der Teppich': ['a soft fluffy rug on a wooden floor', SCENE],
  'das Regal': ['a wooden bookshelf filled with books', SCENE],
  'der Spiegel': ['a large wall mirror in a room', SCENE],

  // Modul 8
  'die Stadt': ['a beautiful bustling city street with modern buildings', SCENE],
  'der Bahnhof': ['a busy train station platform with a train waiting', SCENE],
  'der Flughafen': ['a modern airport terminal with an airplane visible outside', SCENE],
  'das Hotel': ['a luxurious hotel building with a grand entrance', SCENE],
  'die Apotheke': ['a modern pharmacy with medicine shelves', SCENE],
  'die Post': ['a post office building with yellow signs', SCENE],
  'die Bank': ['a modern bank building from the outside', SCENE],
  'die Schule': ['a school building with a playground', SCENE],
  'das Krankenhaus': ['a modern hospital building', SCENE],
  'das Museum': ['a grand museum building with columns', SCENE],
  'der Park': ['a beautiful green park with trees and a path', SCENE],
  'das Restaurant': ['a cozy restaurant with tables and chairs', SCENE],
  'die Straße': ['a paved city street with sidewalks', SCENE],
  'die Ecke': ['a street corner in a city', SCENE],
  'der Weg': ['a path through a field or forest', SCENE],
  'das Auto': ['a modern red car parked on a street', SCENE],
  'der Bus': ['a yellow city bus on a street', SCENE],
  'der Zug': ['a fast modern train on railway tracks', SCENE],
  'die U-Bahn': ['an underground subway train arriving at a station', SCENE],
  'das Fahrrad': ['a modern bicycle parked outdoors', SCENE],
  'das Flugzeug': ['a large passenger airplane flying in the sky', SCENE],

  'das Bild': ['a framed painting hanging on a white wall', SCENE],
  'der Sessel': ['a comfortable reading armchair', SCENE],
  
  'der Fernseher': ['a large flat screen TV on a TV stand in a living room', SCENE],
  'der Kühlschrank': ['a modern silver refrigerator in a kitchen', SCENE],
  'die Waschmaschine': ['a white washing machine in a modern bathroom', SCENE],
  'das Fenster': ['a large open window showing daylight', SCENE],
  'die Tür': ['a closed white wooden interior door', SCENE],
  'der Schlüssel': ['a silver house key on a wooden table', SCENE],
  'das Hemd': "a folded formal men's shirt on a wooden table, bright studio lighting, realistic, photography",
  'das Kleid': 'a beautiful dress hanging on a hanger, clean background, 8k, photorealistic',
  'die Kleidung': 'a stack of various folded clothes, colorful, wardrobe, realistic lighting',
  'das T-Shirt': 'a plain white t-shirt laid flat on a table, top-down view, realistic',
  'der Pullover': 'a warm knitted sweater, cozy, high detail, studio lighting',
  'die Jacke': 'a winter jacket hanging on a hook, realistic, high quality',
  'die Hose': 'a pair of classic trousers folded neatly, realistic photography',
  'die Jeans': 'a pair of blue denim jeans folded on a wooden surface, high detail',
  'der Schuh': 'a single brown leather shoe on a clean background, product photography',
  'der Stiefel': 'a winter boot on a white background, realistic, detailed',
  'der Rock': 'a stylish skirt hanging on a hanger, studio lighting, photorealistic',
  'die Socke': 'a pair of warm socks on a wooden floor, cozy lighting',
  'die Tasche': 'a leather handbag on a table, fashion photography, 8k',
  'die Brille': 'a pair of reading glasses on a desk, close up, realistic',
  'die Mütze': 'a knitted winter beanie hat, cozy, high resolution',
  'der Schal': 'a warm woolen scarf, soft lighting, realistic',
  'der Hut': 'a classic fedora hat on a table, studio lighting',
  'der Gürtel': 'a brown leather belt coiled on a table, macro photography',
  'das Geschäft': 'a modern clothing store interior, bright lighting, realistic',
  'die Größe': 'a clothing size tag showing "M", macro shot, highly detailed',
  'das Geld': 'euro banknotes and coins on a table, close up, realistic',
  'der Preis': 'a price tag hanging from a piece of clothing, close up',
  'die Kasse': 'a modern cash register in a store, bright, realistic',
  'die Erdbeere': 'a fresh red strawberry with green leaves on a white background, highly detailed, macro food photography',
  'die Traube': 'a bunch of fresh green grapes, water droplets, photorealistic',
  'die Wurst': 'a single cooked sausage on a white plate, realistic food photography',
  'die Treppe': 'a modern wooden staircase indoors, bright lighting, 8k',
  'das Fenster': 'a bright window with sunlight coming in, indoor view, realistic',
};

const words = await sql.query(
  `SELECT DISTINCT w.word, w."partOfSpeech" FROM "Word" w
   JOIN "Lesson" l ON w."lessonId"=l.id JOIN "Module" m ON l."moduleId"=m.id
   WHERE m."courseId"='${COURSE}' AND m."order"=${MOD} ORDER BY w.word`);

// Ҳамон нормализатсияе, ки барнома дорад — вагарна файл ҳеҷ гоҳ ёфт намешавад.
const key = w => w.toLowerCase().trim()
  .replace(/['’.,!?]/g, '')
  .replace(/\s+/g, '_');

const rows = [];
const skipped = [];
for (const w of words) {
  if (w.partOfSpeech !== 'noun') { skipped.push(`${w.word} (${w.partOfSpeech})`); continue; }
  const p = P[w.word];
  if (!p) { skipped.push(`${w.word} (тавсиф нест)`); continue; }
  const [scene, style] = p;
  const url = 'https://image.pollinations.ai/prompt/' + encodeURIComponent(style + scene)
    + `?width=1024&height=1024&nologo=true&seed=${73000 + rows.length}&model=flux`;
  rows.push(`${key(w.word)}\t${url}`);
}

writeFileSync(new URL('./_de-images-urls.tsv', import.meta.url), rows.join('\n') + '\n');
console.log(`Модули ${MOD}: ${words.length} калима`);
console.log(`Расм месозем: ${rows.length}`);
console.log(`Гузашт: ${skipped.length} — ${skipped.join(', ')}`);
console.log(`\nФайлҳо: ${rows.map(r => r.split('\t')[0] + '.png').join(', ')}`);
console.log('\nАкнун:  bash prisma/_de-images-dl.sh <роҳ ба images/de>');
