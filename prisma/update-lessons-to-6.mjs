import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const newWords = {
    'Days of the Week': [
      {
        word: 'Tuesday', translation: 'Сешанбе', emoji: '2️⃣',
        audioUrl: '/audio/en/tuesday.mp3', ipa: '/ˈtjuːzdeɪ/',
        example: 'See you on Tuesday.', exampleTrans: 'То рӯзи сешанбе.'
      },
      {
        word: 'Tomorrow', translation: 'Фардо', emoji: '⏭️',
        audioUrl: '/audio/en/tomorrow.mp3', ipa: '/təˈmɒroʊ/',
        example: 'Tomorrow is a new day.', exampleTrans: 'Фардо рӯзи нав аст.'
      }
    ],
    'My Daily Routine': [
      {
        word: 'Lunch', translation: 'Хӯроки нисфирӯзӣ', emoji: '🍲',
        audioUrl: '/audio/en/lunch.mp3', ipa: '/lʌntʃ/',
        example: 'I eat lunch at noon.', exampleTrans: 'Ман нисфирӯзӣ хӯрок мехӯрам.'
      },
      {
        word: 'Shower', translation: 'Душ қабул кардан', emoji: '🚿',
        audioUrl: '/audio/en/shower.mp3', ipa: '/ˈʃaʊər/',
        example: 'I take a shower.', exampleTrans: 'Ман душ қабул мекунам.'
      }
    ],
    'Hobbies and Free Time': [
      {
        word: 'Dance', translation: 'Рақсидан', emoji: '💃',
        audioUrl: '/audio/en/dance.mp3', ipa: '/dɑːns/',
        example: 'She likes to dance.', exampleTrans: 'Ӯ рақсиданро дӯст медорад.'
      },
      {
        word: 'Draw', translation: 'Расм кашидан', emoji: '🖍️',
        audioUrl: '/audio/en/draw.mp3', ipa: '/drɔː/',
        example: 'I draw a picture.', exampleTrans: 'Ман расм мекашам.'
      }
    ],
    'Weather and Seasons': [
      {
        word: 'Snow', translation: 'Барф', emoji: '❄️',
        audioUrl: '/audio/en/snow.mp3', ipa: '/snoʊ/',
        example: 'The snow is white.', exampleTrans: 'Барф сафед аст.'
      },
      {
        word: 'Spring', translation: 'Баҳор', emoji: '🌸',
        audioUrl: '/audio/en/spring.mp3', ipa: '/sprɪŋ/',
        example: 'Flowers bloom in spring.', exampleTrans: 'Дар баҳор гулҳо мешукуфанд.'
      }
    ],
    'Basic Actions': [
      {
        word: 'Run', translation: 'Давидан', emoji: '🏃‍♂️',
        audioUrl: '/audio/en/run.mp3', ipa: '/rʌn/',
        example: 'I run very fast.', exampleTrans: 'Ман хеле тез медавам.'
      },
      {
        word: 'Walk', translation: 'Роҳ гаштан', emoji: '🚶‍♂️',
        audioUrl: '/audio/en/walk.mp3', ipa: '/wɔːk/',
        example: 'We walk in the park.', exampleTrans: 'Мо дар боғ роҳ мегардем.'
      }
    ]
  };

  for (const [lessonTitle, words] of Object.entries(newWords)) {
    const lesson = await prisma.lesson.findFirst({
      where: { title: lessonTitle },
      orderBy: { id: 'desc' } // Get the most recently added one
    });

    if (lesson) {
      for (const word of words) {
        await prisma.word.create({
          data: {
            ...word,
            lessonId: lesson.id
          }
        });
      }
      console.log(`Added 2 words to "${lessonTitle}"`);
    } else {
      console.log(`Lesson "${lessonTitle}" not found!`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
