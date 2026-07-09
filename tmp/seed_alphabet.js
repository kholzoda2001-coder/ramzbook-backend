// One-off seed: populate AlphabetLetter for English (26) and Russian (33),
// matching the data that used to be hardcoded in frontend/lib/screens/alphabet_screen.dart.
// Run with: node tmp/seed_alphabet.js   (needs DB connectivity — direct URL if pooler is unreachable)
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const TAJIK_NATIVE_ID = 'cmpk1cr9o0000bo0h1mheyoad';
const ENGLISH_TARGET_ID = 'cmppaul1k0001xrdbc2woi3fj';
const RUSSIAN_TARGET_ID = 'cmpqk40yz00009rhl1uazdfi3';

const englishVowels = [
  ['A', 'a', '/eɪ/', 'Эй'],
  ['E', 'e', '/iː/', 'И'],
  ['I', 'i', '/aɪ/', 'Ай'],
  ['O', 'o', '/oʊ/', 'Оу'],
  ['U', 'u', '/juː/', 'Ю'],
  ['Y', 'y', '/waɪ/', 'Уай'],
];

const englishConsonants = [
  ['B', 'b', '/biː/', 'Би'],
  ['C', 'c', '/siː/', 'Си'],
  ['D', 'd', '/diː/', 'Ди'],
  ['F', 'f', '/ɛf/', 'Эф'],
  ['G', 'g', '/dʒiː/', 'Ҷи'],
  ['H', 'h', '/eɪtʃ/', 'Эйч'],
  ['J', 'j', '/dʒeɪ/', 'Ҷей'],
  ['K', 'k', '/keɪ/', 'Кей'],
  ['L', 'l', '/ɛl/', 'Эл'],
  ['M', 'm', '/ɛm/', 'Эм'],
  ['N', 'n', '/ɛn/', 'Эн'],
  ['P', 'p', '/piː/', 'Пи'],
  ['Q', 'q', '/kjuː/', 'Кю'],
  ['R', 'r', '/ɑːr/', 'Ар'],
  ['S', 's', '/ɛs/', 'Эс'],
  ['T', 't', '/tiː/', 'Ти'],
  ['V', 'v', '/viː/', 'Ви'],
  ['W', 'w', '/ˈdʌbəl.juː/', 'Дабл ю'],
  ['X', 'x', '/ɛks/', 'Экс'],
  ['Z', 'z', '/ziː/', 'Зи'],
];

const russianVowels = [
  ['А', 'а', '/a/', 'А'],
  ['Е', 'е', '/je/', 'Йе'],
  ['Ё', 'ё', '/jo/', 'Йо (ҳамеша зада)'],
  ['И', 'и', '/i/', 'И'],
  ['О', 'о', '/o/', 'О'],
  ['У', 'у', '/u/', 'У'],
  ['Ы', 'ы', '/ɨ/', 'Ы (дар тоҷикӣ нест)'],
  ['Э', 'э', '/e/', 'Э'],
  ['Ю', 'ю', '/ju/', 'Йу'],
  ['Я', 'я', '/ja/', 'Йа'],
];

const russianConsonants = [
  ['Б', 'б', '/b/', 'Б'],
  ['В', 'в', '/v/', 'В'],
  ['Г', 'г', '/g/', 'Г'],
  ['Д', 'д', '/d/', 'Д'],
  ['Ж', 'ж', '/ʐ/', 'Ж'],
  ['З', 'з', '/z/', 'З'],
  ['Й', 'й', '/j/', 'Й (нимсадонок)'],
  ['К', 'к', '/k/', 'К'],
  ['Л', 'л', '/l/', 'Л'],
  ['М', 'м', '/m/', 'М'],
  ['Н', 'н', '/n/', 'Н'],
  ['П', 'п', '/p/', 'П'],
  ['Р', 'р', '/r/', 'Р'],
  ['С', 'с', '/s/', 'С'],
  ['Т', 'т', '/t/', 'Т'],
  ['Ф', 'ф', '/f/', 'Ф'],
  ['Х', 'х', '/x/', 'Х'],
  ['Ц', 'ц', '/ts/', 'Тс'],
  ['Ч', 'ч', '/tɕ/', 'Ч'],
  ['Ш', 'ш', '/ʂ/', 'Ш'],
  ['Щ', 'щ', '/ɕː/', 'Щ (ш-и нарму дароз)'],
];

const russianSigns = [
  ['Ъ', 'ъ', '—', 'Аломати сахт (садо надорад)'],
  ['Ь', 'ь', '—', 'Аломати нарм (мулоим мекунад)'],
];

// Full alphabet in true alphabetical order — `order` is the letter's GLOBAL
// position here, NOT its index within its category. This is what makes the
// combined "Алфавит" tab read A,B,C,D,E… instead of interleaving vowels and
// consonants (each of which used to restart at 0).
const EN_ORDER = 'abcdefghijklmnopqrstuvwxyz';
const RU_ORDER = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';

async function seed(targetLanguageId, group, category, orderStr, { includeIpa = true } = {}) {
  for (const [uppercase, lowercase, ipa, tajikTranscription] of group) {
    await prisma.alphabetLetter.create({
      data: {
        targetLanguageId,
        nativeLanguageId: TAJIK_NATIVE_ID,
        uppercase,
        lowercase,
        // International IPA is only useful when the script itself is
        // unfamiliar (Latin, for a Tajik/Cyrillic reader). Cyrillic-script
        // targets (Russian) skip it — the Tajik hint alone is enough — by
        // simply leaving it blank in the data, not a hardcoded language
        // check in the Flutter UI (it renders IPA only when non-empty).
        ipa: includeIpa ? ipa : null,
        tajikTranscription,
        category,
        order: orderStr.indexOf(lowercase.toLowerCase()),
      },
    });
  }
}

async function main() {
  // Idempotent: wipe any existing rows for these two pairs first, so this
  // script can be safely re-run (e.g. after fixing a typo in the data above).
  await prisma.alphabetLetter.deleteMany({
    where: {
      nativeLanguageId: TAJIK_NATIVE_ID,
      targetLanguageId: { in: [ENGLISH_TARGET_ID, RUSSIAN_TARGET_ID] },
    },
  });

  await seed(ENGLISH_TARGET_ID, englishVowels, 'vowel', EN_ORDER);
  await seed(ENGLISH_TARGET_ID, englishConsonants, 'consonant', EN_ORDER);
  await seed(RUSSIAN_TARGET_ID, russianVowels, 'vowel', RU_ORDER, { includeIpa: false });
  await seed(RUSSIAN_TARGET_ID, russianConsonants, 'consonant', RU_ORDER, { includeIpa: false });
  await seed(RUSSIAN_TARGET_ID, russianSigns, 'sign', RU_ORDER, { includeIpa: false });

  const enCount = await prisma.alphabetLetter.count({ where: { targetLanguageId: ENGLISH_TARGET_ID } });
  const ruCount = await prisma.alphabetLetter.count({ where: { targetLanguageId: RUSSIAN_TARGET_ID } });
  console.log(`English letters: ${enCount} (expect 26)`);
  console.log(`Russian letters: ${ruCount} (expect 33)`);
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
