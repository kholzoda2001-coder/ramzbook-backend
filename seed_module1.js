const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const match = env.match(/DATABASE_URL="([^"]+)"/);
if (match) process.env.DATABASE_URL = match[1] + (match[1].includes('?') ? '&' : '?') + 'connection_limit=1&connect_timeout=60';
console.log("DB URL parsed successfully?", !!process.env.DATABASE_URL);


const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL + (process.env.DATABASE_URL.includes('?') ? '&' : '?') + 'connection_limit=1&connect_timeout=60' }
  }
});

async function seed() {
  const en = await prisma.language.findFirst({ where: { code: 'en' } });
  const tg = await prisma.language.findFirst({ where: { code: 'tg' } });

  if (!en || !tg) {
    console.error('Languages missing!');
    return;
  }

  // Find A1 course for EN -> TG
  let course = await prisma.course.findFirst({
    where: { targetLanguageId: en.id, nativeLanguageId: tg.id, level: 'A1' }
  });

  if (!course) {
    course = await prisma.course.create({
      data: {
        targetLanguageId: en.id,
        nativeLanguageId: tg.id,
        level: 'A1',
        title: 'Англисӣ сатҳи A1',
        description: 'Сатҳи ибтидоӣ барои навомӯзон',
        isActive: true,
      }
    });
    console.log('Created Course A1');
  }

  // Delete existing "greetings introductions" module if exists to start fresh
  await prisma.module.deleteMany({
    where: { courseId: course.id, title: 'greetings introductions' }
  });

  // Create Module
  const moduleData = await prisma.module.create({
    data: {
      courseId: course.id,
      title: 'greetings introductions',
      titleTranslated: 'Салом ва Шиносоӣ',
      description: 'Салом ва Шиносоӣ',
      emoji: '👋',
      order: 1,
    }
  });

  console.log('Created Module 1');

  const lessons = [
    {
      title: 'Саломҳои асосӣ',
      goal: 'Ёд гирифтани салом ва хайрухуш',
      order: 1,
      xpReward: 20,
      words: [
        { word: 'Hello', translation: 'Салом', ipa: '/həˈləʊ/', ipaTajik: 'ҳелоу', emoji: '👋', example: 'Hello, world!', exampleTrans: 'Салом, дунё!' },
        { word: 'Hi', translation: 'Салом (оддӣ)', ipa: '/haɪ/', ipaTajik: 'ҳай', emoji: '🙋', example: 'Hi there!', exampleTrans: 'Салом ба ҳама!' },
        { word: 'Goodbye', translation: 'Хайр', ipa: '/ɡʊdˈbaɪ/', ipaTajik: 'гудбай', emoji: '🚶', example: 'Goodbye, see you!', exampleTrans: 'Хайр, то дидор!' },
        { word: 'Yes', translation: 'Бале', ipa: '/jes/', ipaTajik: 'йес', emoji: '✅', example: 'Yes, please.', exampleTrans: 'Бале, лутфан.' },
        { word: 'No', translation: 'Не', ipa: '/nəʊ/', ipaTajik: 'ноу', emoji: '❌', example: 'No, thank you.', exampleTrans: 'Не, ташаккур.' },
      ]
    },
    {
      title: 'Одоби муошират',
      goal: 'Истифодаи лутфан ва ташаккур',
      order: 2,
      xpReward: 20,
      words: [
        { word: 'Please', translation: 'Лутфан / Илтимос', ipa: '/pliːz/', ipaTajik: 'плииз', emoji: '🙏', example: 'Yes, please.', exampleTrans: 'Бале, лутфан.' },
        { word: 'Thank you', translation: 'Ташаккур / Раҳмат', ipa: '/ˈθæŋk ˌjuː/', ipaTajik: 'сэнк ю', emoji: '💖', example: 'Thank you very much.', exampleTrans: 'Ташаккури зиёд.' },
        { word: 'Sorry', translation: 'Мебахшед', ipa: '/ˈsɒr.i/', ipaTajik: 'сори', emoji: '😔', example: 'I am sorry.', exampleTrans: 'Ман узр мепурсам.' },
        { word: 'Excuse me', translation: 'Узр мепурсам (барои ҷалб)', ipa: '/ɪkˈskjuːz ˌmiː/', ipaTajik: 'икскюуз ми', emoji: '☝️', example: 'Excuse me, sir.', exampleTrans: 'Узр мепурсам, ҷаноб.' },
        { word: 'OK', translation: 'Хуб / Майлаш', ipa: '/ˌəʊˈkeɪ/', ipaTajik: 'окей', emoji: '👌', example: 'Are you OK?', exampleTrans: 'Шумо нағз ҳастед?' },
      ]
    },
    {
      title: 'Ман ва Ту',
      goal: 'Омӯхтани ҷонишинҳои аввалин',
      order: 3,
      xpReward: 20,
      words: [
        { word: 'I', translation: 'Ман', ipa: '/aɪ/', ipaTajik: 'ай', emoji: '👤', example: 'I am a student.', exampleTrans: 'Ман донишҷӯ ҳастам.' },
        { word: 'You', translation: 'Ту / Шумо', ipa: '/juː/', ipaTajik: 'юу', emoji: '👉', example: 'You are my friend.', exampleTrans: 'Ту дӯсти ман ҳастӣ.' },
        { word: 'Am', translation: 'Ҳастам', ipa: '/æm/', ipaTajik: 'ам', emoji: '✨', example: 'I am happy.', exampleTrans: 'Ман хурсанд ҳастам.' },
        { word: 'Are', translation: 'Ҳастӣ / Ҳастед', ipa: '/ɑːr/', ipaTajik: 'ар', emoji: '🤝', example: 'You are ready.', exampleTrans: 'Шумо омода ҳастед.' },
        { word: 'Name', translation: 'Ном', ipa: '/neɪm/', ipaTajik: 'нейм', emoji: '📛', example: 'My name is Ali.', exampleTrans: 'Номи ман Алӣ аст.' },
      ]
    },
    {
      title: 'Мулоқот',
      goal: 'Калимаҳо барои шиносоӣ',
      order: 4,
      xpReward: 20,
      words: [
        { word: 'Nice', translation: 'Хуб / Нағз', ipa: '/naɪs/', ipaTajik: 'найс', emoji: '🌟', example: 'Nice to meet you.', exampleTrans: 'Аз шиносоӣ шодам.' },
        { word: 'Meet', translation: 'Мулоқот кардан', ipa: '/miːt/', ipaTajik: 'миит', emoji: '🫂', example: 'Let us meet tomorrow.', exampleTrans: 'Биёед фардо мулоқот кунем.' },
        { word: 'Friend', translation: 'Дӯст', ipa: '/frend/', ipaTajik: 'френд', emoji: '🧑‍🤝‍🧑', example: 'He is my friend.', exampleTrans: 'Вай дӯсти ман аст.' },
        { word: 'Good', translation: 'Хуб / Нек', ipa: '/ɡʊd/', ipaTajik: 'гуд', emoji: '👍', example: 'Good job!', exampleTrans: 'Кори хуб!' },
        { word: 'Morning', translation: 'Субҳ / Пагоҳӣ', ipa: '/ˈmɔː.nɪŋ/', ipaTajik: 'моорнинг', emoji: '🌅', example: 'Good morning!', exampleTrans: 'Субҳ ба хайр!' },
      ]
    }
  ];

  for (const l of lessons) {
    const createdLesson = await prisma.lesson.create({
      data: {
        moduleId: moduleData.id,
        title: l.title,
        titleTranslated: l.title,
        goal: l.goal,
        emoji: '📚',
        order: l.order,
        xpReward: l.xpReward,
      }
    });

    for (let i = 0; i < l.words.length; i++) {
      const w = l.words[i];
      await prisma.word.create({
        data: {
          lessonId: createdLesson.id,
          word: w.word,
          translation: w.translation,
          ipa: w.ipa,
          ipaTajik: w.ipaTajik,
          emoji: w.emoji,
          example: w.example,
          exampleTrans: w.exampleTrans,
          order: i + 1,
        }
      });
    }
  }

  console.log('Successfully seeded 4 Lessons with 5 words each!');
}

seed().finally(() => prisma.$disconnect());
