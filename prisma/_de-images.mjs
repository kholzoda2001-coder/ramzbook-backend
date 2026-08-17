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
