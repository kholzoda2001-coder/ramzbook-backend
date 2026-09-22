import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';
import { SignJWT } from 'jose';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);
const DRY = process.argv.includes('--dry');

let n = 0;
const cuid = () =>
  'c' + Date.now().toString(36) + (n++).toString(36).padStart(3, '0') +
  Math.random().toString(36).slice(2, 10);

const L = [
  // Тонҳо (Tones) - Ҳамчун 'sign' нишон медиҳем
  ['1', 'ā', 'Тони 1', 'Ҳамвор ва баланд (мисли овезон кардани овоз)', 'sign'],
  ['2', 'á', 'Тони 2', 'Болораванда (мисли савол додан: "Чӣ?")', 'sign'],
  ['3', 'ǎ', 'Тони 3', 'Пастшаванда-болораванда (мисли "А-ҳа")', 'sign'],
  ['4', 'à', 'Тони 4', 'Сахт пастшаванда (мисли фармон додан: "Не!")', 'sign'],

  // Ҳамсадоҳо (Initials - Consonants)
  ['B', 'b', '/p/', 'Б (бе ҷаранг, мисли п)', 'consonant'],
  ['P', 'p', '/pʰ/', 'П (бо нафас, пҳ)', 'consonant'],
  ['M', 'm', '/m/', 'М', 'consonant'],
  ['F', 'f', '/f/', 'Ф', 'consonant'],
  ['D', 'd', '/t/', 'Д (бе ҷаранг, мисли т)', 'consonant'],
  ['T', 't', '/tʰ/', 'Т (бо нафас, тҳ)', 'consonant'],
  ['N', 'n', '/n/', 'Н', 'consonant'],
  ['L', 'l', '/l/', 'Л', 'consonant'],
  ['G', 'g', '/k/', 'Г (бе ҷаранг, мисли к)', 'consonant'],
  ['K', 'k', '/kʰ/', 'К (бо нафас, кҳ)', 'consonant'],
  ['H', 'h', '/x/', 'Х (нарм)', 'consonant'],
  ['J', 'j', '/tɕ/', 'Ҷ (бисёр нарм, мисли Ҷ дар "Ҷопон")', 'consonant'],
  ['Q', 'q', '/tɕʰ/', 'Ч (нарм ва бо нафас)', 'consonant'],
  ['X', 'x', '/ɕ/', 'С (нарм, ба Ш наздик)', 'consonant'],
  ['ZH', 'zh', '/ʈʂ/', 'Ҷ (сахт)', 'consonant'],
  ['CH', 'ch', '/ʈʂʰ/', 'Ч (сахт ва бо нафас)', 'consonant'],
  ['SH', 'sh', '/ʂ/', 'Ш (сахт)', 'consonant'],
  ['R', 'r', '/ʐ/', 'Ж (ё Р-и нарм)', 'consonant'],
  ['Z', 'z', '/ts/', 'ДЗ', 'consonant'],
  ['C', 'c', '/tsʰ/', 'С (мисли ТС бо нафас)', 'consonant'],
  ['S', 's', '/s/', 'С', 'consonant'],
  ['Y', 'y', '/j/', 'Й (ё И)', 'consonant'],
  ['W', 'w', '/w/', 'В (мисли W дар англисӣ)', 'consonant'],

  // Садонокҳо (Finals - Vowels)
  ['A', 'a', '/a/', 'А', 'vowel'],
  ['O', 'o', '/o/', 'О', 'vowel'],
  ['E', 'e', '/ɤ/', 'Э (ё Ы-и баланд)', 'vowel'],
  ['I', 'i', '/i/', 'И', 'vowel'],
  ['U', 'u', '/u/', 'У', 'vowel'],
  ['Ü', 'ü', '/y/', 'Ю (У-и мулоим)', 'vowel'],
  ['AI', 'ai', '/ai/', 'АЙ', 'vowel'],
  ['EI', 'ei', '/ei/', 'ЭЙ', 'vowel'],
  ['AO', 'ao', '/au/', 'АО', 'vowel'],
  ['OU', 'ou', '/ou/', 'ОУ', 'vowel'],
  ['AN', 'an', '/an/', 'АН', 'vowel'],
  ['EN', 'en', '/ən/', 'ЭН', 'vowel'],
  ['ANG', 'ang', '/aŋ/', 'АНГ (Г талаффуз намешавад, аз бинӣ)', 'vowel'],
  ['ENG', 'eng', '/əŋ/', 'ЭНГ (аз бинӣ)', 'vowel'],
  ['ONG', 'ong', '/ʊŋ/', 'ОНГ (аз бинӣ)', 'vowel'],
];

const RULES = [
  {
    category: 'general',
    title: 'Пиниин чист?',
    body: 'Забони хитоӣ алифбо надорад, балки аз **Иероглифҳо** (мисли 你, 好) иборат аст. Барои хондани онҳо системаи **Пиниин (Pinyin)** истифода мешавад, ки калимаҳои хитоиро бо ҳарфҳои лотинӣ менависад.'
  },
  {
    category: 'general',
    title: '4 Оҳанг (Тонҳо)',
    body: 'Дар забони хитоӣ як калима метавонад 4 маъно дошта бошад, агар бо оҳанги гуногун гуфта шавад!\n\n1. **ā (ҳамвор):** Овоз баланд ва рост меистад (mā - модар).\n2. **á (болораванда):** Овоз ба боло меравад, мисли ҳайрон шудан: "Чӣ?" (má - зиғир).\n3. **ǎ (паст-боло):** Овоз паст мешаваду боз боло меравад (mǎ - асп).\n4. **à (пастшаванда):** Овоз сахт ва кӯтоҳ паст мешавад (mà - дашном).'
  },
  {
    category: 'consonant',
    title: 'Қоидаи нафаскашӣ (Аспиратсия)',
    body: 'Дар Пиниин ҳарфҳои **p, t, k, q, c, ch** бояд ҳатман бо нафаси сахт (баровардани ҳаво аз даҳон) талаффуз шаванд. Агар ҳаво набарояд, хитоиҳо мефикранд, ки шумо ҳарфҳои **b, d, g, j, z, zh**-ро гуфтед.'
  },
  {
    category: 'consonant',
    title: 'Фарқи X, J, Q ва SH, ZH, CH',
    body: 'Ҳарфҳои **J, Q, X** бисёр нарм талаффуз мешаванд (забон ба дандонҳои поён мерасад). Аммо ҳарфҳои **ZH, CH, SH** сахт талаффуз мешаванд ва нӯги забон ба боло (ком) бардошта мешавад.'
  },
  {
    category: 'vowel',
    title: 'Овози Ü (Ю-и мулоим)',
    body: 'Ҳарфи **ü** мисли У навишта мешавад, аммо лабҳоятонро мисли "У" кунед ва овози "И"-ро бароред. Он ба ҳарфи Ю-и русӣ дар калимаи "мюсли" монанд аст.'
  },
  {
    category: 'vowel',
    title: 'Овози бинии NG',
    body: 'Агар дар охир **ng** бошад (масалан *ang, eng*), ҳарфи "Г" тамоман хонда намешавад! Ин фақат нишон медиҳад, ки овоз бояд аз бинӣ (назалӣ) барояд.'
  }
];

async function main() {
  const zh = await sql`SELECT id FROM "Language" WHERE code = 'zh'`;
  if (!zh.length) return console.log('❌ Забони хитоӣ (zh) ёфт нашуд');
  const tg = await sql`SELECT id FROM "Language" WHERE code = 'tg'`;

  const zhId = zh[0].id;
  const tgId = tg[0].id;

  if (!DRY) {
    await sql`DELETE FROM "AlphabetLetter" WHERE "targetLanguageId" = ${zhId}`;
    await sql`DELETE FROM "AlphabetRule" WHERE "targetLanguageId" = ${zhId}`;
    console.log('Кӯҳнаҳо тоза шуданд.');
  }

  const values = L.map((row, i) => [
    cuid(), zhId, tgId, row[0], row[1], row[2], row[3], row[4], i * 10, new Date().toISOString()
  ]);

  if (!DRY) {
    for (const v of values) {
      await sql`
        INSERT INTO "AlphabetLetter" (id, "targetLanguageId", "nativeLanguageId", uppercase, lowercase, ipa, "tajikTranscription", category, "order", "createdAt")
        VALUES (${v[0]}, ${v[1]}, ${v[2]}, ${v[3]}, ${v[4]}, ${v[5]}, ${v[6]}, ${v[7]}, ${v[8]}, ${v[9]})
      `;
    }
    console.log(`✅ ${values.length} қисмҳои Пиниин ворид шуданд`);
  }

  const rValues = RULES.map((r, i) => [
    cuid(), zhId, tgId, r.category, r.title, r.body, i * 10, new Date().toISOString()
  ]);

  if (!DRY) {
    for (const v of rValues) {
      await sql`
        INSERT INTO "AlphabetRule" (id, "targetLanguageId", "nativeLanguageId", category, title, body, "order", "createdAt")
        VALUES (${v[0]}, ${v[1]}, ${v[2]}, ${v[3]}, ${v[4]}, ${v[5]}, ${v[6]}, ${v[7]})
      `;
    }
    console.log(`✅ ${RULES.length} қоида ворид шуд`);
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
