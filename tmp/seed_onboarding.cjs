const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Get language IDs
  const languages = await prisma.language.findMany({
    where: { OR: [{ code: 'en' }, { code: 'tg' }] },
    select: { id: true, code: true, name: true }
  });
  console.log('Languages found:', JSON.stringify(languages));

  const en = languages.find(l => l.code === 'en');
  const tg = languages.find(l => l.code === 'tg');

  if (!en || !tg) {
    console.error('English or Tajik language not found!');
    return;
  }

  console.log(`English ID: ${en.id}, Tajik ID: ${tg.id}`);

  // Delete existing onboarding words for this pair (clean start)
  await prisma.onboardingWord.deleteMany({
    where: { targetLanguageId: en.id, nativeLanguageId: tg.id }
  });

  // Insert 3 onboarding words
  const words = [
    {
      targetLanguageId: en.id,
      nativeLanguageId: tg.id,
      word: 'Hello',
      translation: 'Салом',
      transcription: '/həˈloʊ/',
      transcriptionTajik: 'Ҳелоу',
      emoji: '👋',
      example: 'Hello, friend!',
      exampleTrans: 'Салом, дӯстам!',
      options: ['Салом', 'Хайр', 'Ташаккур', 'Бале'],
      audioUrl: '',
      order: 0,
    },
    {
      targetLanguageId: en.id,
      nativeLanguageId: tg.id,
      word: 'Yes',
      translation: 'Бале',
      transcription: '/jɛs/',
      transcriptionTajik: 'Йес',
      emoji: '✅',
      example: 'Yes, please!',
      exampleTrans: 'Бале, лутфан!',
      options: ['Бале', 'Не', 'Салом', 'Хайр'],
      audioUrl: '',
      order: 1,
    },
    {
      targetLanguageId: en.id,
      nativeLanguageId: tg.id,
      word: 'Thank you',
      translation: 'Ташаккур',
      transcription: '/ˈθæŋk juː/',
      transcriptionTajik: 'Тэнк ю',
      emoji: '🙏',
      example: 'Thank you very much!',
      exampleTrans: 'Ташаккури зиёд!',
      options: ['Ташаккур', 'Бале', 'Салом', 'Не'],
      audioUrl: '',
      order: 2,
    },
  ];

  for (const w of words) {
    const created = await prisma.onboardingWord.create({ data: w });
    console.log(`Created: ${created.word} -> ${created.translation}`);
  }

  console.log('Done! 3 onboarding words added for English (Tajik native).');
}

main().catch(console.error).finally(() => prisma.$disconnect());
