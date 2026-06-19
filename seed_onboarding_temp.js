const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  const en = await prisma.language.findFirst({ where: { code: 'en' }});
  const tg = await prisma.language.findFirst({ where: { code: 'tg' }});

  if (!en || !tg) {
    console.error('Languages missing!');
    return;
  }

  console.log(`English ID: ${en.id}, Tajik ID: ${tg.id}`);

  await prisma.onboardingWord.deleteMany({
    where: { targetLanguageId: en.id, nativeLanguageId: tg.id }
  });

  const words = [
    {
      targetLanguageId: en.id,
      nativeLanguageId: tg.id,
      word: 'Welcome',
      translation: 'Хуш омадед',
      transcription: '/ˈwel.kəm/',
      transcriptionTajik: 'велком',
      emoji: '👋',
      example: 'Welcome to our app!',
      exampleTrans: 'Хуш омадед ба барномаи мо!',
      options: ['Хуш омадед', 'Хайр', 'Салом', 'Ташаккур'],
      order: 1
    },
    {
      targetLanguageId: en.id,
      nativeLanguageId: tg.id,
      word: 'Hello',
      translation: 'Салом',
      transcription: '/heˈləʊ/',
      transcriptionTajik: 'ҳелоу',
      emoji: '🤝',
      example: 'Hello, my friend!',
      exampleTrans: 'Салом, дӯсти ман!',
      options: ['Салом', 'Раҳмат', 'Хуб', 'Бале'],
      order: 2
    },
    {
      targetLanguageId: en.id,
      nativeLanguageId: tg.id,
      word: 'Yes',
      translation: 'Бале',
      transcription: '/jes/',
      transcriptionTajik: 'йес',
      emoji: '✅',
      example: 'Yes, I can!',
      exampleTrans: 'Бале, ман метавонам!',
      options: ['Бале', 'Не', 'Шояд', 'Хайр'],
      order: 3
    },
    {
      targetLanguageId: en.id,
      nativeLanguageId: tg.id,
      word: 'Best',
      translation: 'Беҳтарин',
      transcription: '/best/',
      transcriptionTajik: 'бест',
      emoji: '🏆',
      example: 'You are the best!',
      exampleTrans: 'Шумо беҳтарин ҳастед!',
      options: ['Беҳтарин', 'Бадтарин', 'Хурд', 'Калон'],
      order: 4
    }
  ];

  for (const w of words) {
    await prisma.onboardingWord.create({ data: w });
  }

  console.log('Successfully seeded 4 Onboarding Words!');
}

seed().finally(() => prisma.$disconnect());
