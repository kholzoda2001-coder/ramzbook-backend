import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);

const R = [
  ['general', 'Қоидаҳои асосии талаффуз',
    'Забони туркӣ забони фонетикӣ аст, яъне калимаҳо чихеле ки навишта мешаванд, ҳамон тавр хонда мешаванд.\n' +
    'Дар забони туркӣ ҳарфҳои W, X ва Q вуҷуд надоранд, аммо ҳарфҳои махсуси Ç, Ğ, I, İ, Ö, Ş, Ü истифода мешаванд.'],
  
  ['vowel', 'Садонокҳо (Ünlüler)',
    'Дар забони туркӣ 8 садонок вуҷуд дорад, ки ба ду гурӯҳ тақсим мешаванд:\n' +
    '1. **Садонокҳои сахт (Kalın ünlüler)**: a, ı, o, u\n' +
    '2. **Садонокҳои нарм (İnce ünlüler)**: e, i, ö, ü\n\n' +
    'Қоидаи мувофиқати садонокҳо (Ünlü Uyumu) дар забони туркӣ хеле муҳим аст: агар калима бо садоноки сахт оғоз шавад, пасвандҳои он низ бояд садоноки сахт дошта бошанд.'],
  
  ['vowel', 'Фарқияти I ва İ',
    'Дар забони туркӣ ҳарфи **İ (нуқтадор)** ҳам дар шакли калон ва ҳам дар шакли хурд (İ, i) ба мисли "И"-и тоҷикӣ хонда мешавад.\n' +
    'Ҳарфи **I (бе нуқта)** ҳам дар шакли калон ва ҳам дар шакли хурд (I, ı) ҳамчун садои ғафс ва амиқ (ба монанди "Ы"-и русӣ) талаффуз карда мешавад.\n\n' +
    '- İstanbul (Истанбул)\n' +
    '- Irmak (Ырмак)'],
    
  ['vowel', 'Садонокҳои Ö ва Ü',
    'Ҳарфҳои **Ö** ва **Ü** садонокҳои нарм мебошанд:\n' +
    '- **Ö (ö)**: мисли садои омехтаи "О" ва "Е" (о-и нарм). Мисол: Göz (Гөз - Чашм).\n' +
    '- **Ü (ü)**: мисли садои омехтаи "У" ва "Ю" (у-и нарм). Мисол: Üç (Үч - Се).'],

  ['consonant', 'Ҳамсадоҳои муҳим: C ва Ç',
    'Дар забони туркӣ ҳарфи **C** ҳамеша ҳамчун **"Ҷ"** хонда мешавад. Ҳеҷ гоҳ "К" ё "С" талаффуз намешавад.\n' +
    'Мисол: Cami (Ҷамӣ), Sucuk (Суҷук).\n\n' +
    'Ҳарфи **Ç** бошад, ҳамеша ҳамчун **"Ч"** хонда мешавад.\n' +
    'Мисол: Çay (Чай), Çok (Чок).'],

  ['consonant', 'Ҳарфи Ğ (Yumuşak G)',
    'Ҳарфи **Ğ (Юмушак Гэ)** ҳеҷ гоҳ дар аввали калима намеояд ва садои мустақили худро надорад. Вазифаи он дароз кардани садоноки пеш аз он мебошад.\n' +
    '- Агар баъди садоноки сахт (a, ı, o, u) биёяд, садонокро каме дароз мекунад: Ağaç (Аач), Dağ (Даа).\n' +
    '- Агар баъди садоноки нарм (e, i, ö, ü) биёяд, садои "Й" медиҳад: Öğretmen (Ойретмен), Değil (Дейил).'],

  ['consonant', 'Ҳамсадоҳои Ş ва Y',
    '- **Ş (ş)**: Ҳамеша ҳамчун **"Ш"** талаффуз мешавад. Мисол: Şeker (Шекер), Beş (Беш).\n' +
    '- **Y (y)**: Ҳамеша ҳамчун **"Й"** талаффуз мешавад. Мисол: Yol (Йол), Ay (Ай).'],
];

async function run() {
  const sql = neon(env.DATABASE_URL);
  
  const trLang = await sql`SELECT id FROM "Language" WHERE code='tr'`;
  const tgLang = await sql`SELECT id FROM "Language" WHERE code='tg'`;
  if (!trLang.length || !tgLang.length) throw new Error("Languages not found");
  
  const TR = trLang[0].id;
  const TG = tgLang[0].id;

  await sql`DELETE FROM "AlphabetRule" WHERE "targetLanguageId"=${TR} AND "nativeLanguageId"=${TG}`;
  
  let ok = 0;
  for (const [cat, title, text] of R) {
    await sql`INSERT INTO "AlphabetRule" ("id", "targetLanguageId", "nativeLanguageId", "category", "title", "body") 
      VALUES (gen_random_uuid()::text, ${TR}, ${TG}, ${cat}, ${title}, ${text})`;
    ok++;
  }

  console.log(`Inserted ${ok} alphabet rules.`);
  await sql`INSERT INTO "AppSetting" (key, "valueJson", "updatedAt") VALUES ('content_version','"1"',NOW()) ON CONFLICT (key) DO UPDATE SET "updatedAt"=NOW()`;
}
run().catch(console.error);
