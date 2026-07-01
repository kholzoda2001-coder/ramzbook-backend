import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.findFirst({
    where: {
      targetLanguage: { code: 'en' },
      nativeLanguage: { code: 'tg' },
      level: 'A1'
    }
  });

  if (!course) {
    console.log("Course not found!");
    return;
  }

  // Create a new module for the 5 lessons
  const module = await prisma.module.create({
    data: {
      courseId: course.id,
      title: 'Time and Activities',
      titleTranslated: 'Вақт ва машғулиятҳо',
      emoji: '⏱️',
      color: '#F59E0B', // Gold
      order: 2, // third module
      isPremium: false,
      isActive: true,
      lessons: {
        create: [
          {
            title: 'Days of the Week',
            titleTranslated: 'Рӯзҳои ҳафта',
            type: 'vocab',
            cefrLevel: 'A1',
            skillType: 'vocab',
            emoji: '📅',
            xpReward: 60,
            duration: 6,
            order: 0,
            words: {
              create: [
                {
                  word: 'Monday', translation: 'Душанбе', emoji: '1️⃣',
                  audioUrl: '/audio/en/monday.mp3', ipa: '/ˈmʌndeɪ/',
                  example: 'I work on Monday.', exampleTrans: 'Ман рӯзи душанбе кор мекунам.'
                },
                {
                  word: 'Friday', translation: 'Ҷумъа', emoji: '5️⃣',
                  audioUrl: '/audio/en/friday.mp3', ipa: '/ˈfraɪdeɪ/',
                  example: 'Friday is a good day.', exampleTrans: 'Ҷумъа рӯзи хуб аст.'
                },
                {
                  word: 'Weekend', translation: 'Охири ҳафта (Шанбе ва Якшанбе)', emoji: '🎉',
                  audioUrl: '/audio/en/weekend.mp3', ipa: '/ˈwiːkɛnd/',
                  example: 'I rest on the weekend.', exampleTrans: 'Ман дар охири ҳафта истироҳат мекунам.'
                },
                {
                  word: 'Today', translation: 'Имрӯз', emoji: '📍',
                  audioUrl: '/audio/en/today.mp3', ipa: '/təˈdeɪ/',
                  example: 'Today is a beautiful day.', exampleTrans: 'Имрӯз рӯзи зебо аст.'
                }
              ]
            }
          },
          {
            title: 'My Daily Routine',
            titleTranslated: 'Реҷаи ҳаррӯзаи ман',
            type: 'vocab',
            cefrLevel: 'A1',
            skillType: 'vocab',
            emoji: '⏰',
            xpReward: 65,
            duration: 7,
            order: 1,
            words: {
              create: [
                {
                  word: 'Wake up', translation: 'Аз хоб бедор шудан', emoji: '🥱',
                  audioUrl: '/audio/en/wake_up.mp3', ipa: '/weɪk ʌp/',
                  example: 'I wake up early.', exampleTrans: 'Ман барвақт аз хоб бедор мешавам.'
                },
                {
                  word: 'Breakfast', translation: 'Наҳорӣ', emoji: '🍳',
                  audioUrl: '/audio/en/breakfast.mp3', ipa: '/ˈbrɛkfəst/',
                  example: 'I eat breakfast.', exampleTrans: 'Ман наҳорӣ мехӯрам.'
                },
                {
                  word: 'Work', translation: 'Кор кардан', emoji: '💼',
                  audioUrl: '/audio/en/work.mp3', ipa: '/wɜːrk/',
                  example: 'I work every day.', exampleTrans: 'Ман ҳар рӯз кор мекунам.'
                },
                {
                  word: 'Sleep', translation: 'Хоб рафтан', emoji: '😴',
                  audioUrl: '/audio/en/sleep.mp3', ipa: '/sliːp/',
                  example: 'I sleep at night.', exampleTrans: 'Ман шабона хоб меравам.'
                }
              ]
            }
          },
          {
            title: 'Hobbies and Free Time',
            titleTranslated: 'Машғулиятҳо ва вақти холӣ',
            type: 'vocab',
            cefrLevel: 'A1',
            skillType: 'vocab',
            emoji: '⚽',
            xpReward: 60,
            duration: 6,
            order: 2,
            words: {
              create: [
                {
                  word: 'Read', translation: 'Хондан', emoji: '📖',
                  audioUrl: '/audio/en/read.mp3', ipa: '/riːd/',
                  example: 'I read a book.', exampleTrans: 'Ман китоб мехонам.'
                },
                {
                  word: 'Play', translation: 'Бозӣ кардан', emoji: '🎮',
                  audioUrl: '/audio/en/play.mp3', ipa: '/pleɪ/',
                  example: 'They play football.', exampleTrans: 'Онҳо футбол бозӣ мекунанд.'
                },
                {
                  word: 'Music', translation: 'Мусиқӣ', emoji: '🎵',
                  audioUrl: '/audio/en/music.mp3', ipa: '/ˈmjuːzɪk/',
                  example: 'I listen to music.', exampleTrans: 'Ман мусиқӣ гӯш мекунам.'
                },
                {
                  word: 'Watch', translation: 'Тамошо кардан', emoji: '📺',
                  audioUrl: '/audio/en/watch.mp3', ipa: '/wɒtʃ/',
                  example: 'I watch a movie.', exampleTrans: 'Ман филм тамошо мекунам.'
                }
              ]
            }
          },
          {
            title: 'Weather and Seasons',
            titleTranslated: 'Обу ҳаво ва фаслҳо',
            type: 'vocab',
            cefrLevel: 'A1',
            skillType: 'vocab',
            emoji: '☀️',
            xpReward: 60,
            duration: 5,
            order: 3,
            words: {
              create: [
                {
                  word: 'Sun', translation: 'Офтоб', emoji: '🌞',
                  audioUrl: '/audio/en/sun.mp3', ipa: '/sʌn/',
                  example: 'The sun is hot.', exampleTrans: 'Офтоб гарм аст.'
                },
                {
                  word: 'Rain', translation: 'Борон', emoji: '🌧️',
                  audioUrl: '/audio/en/rain.mp3', ipa: '/reɪn/',
                  example: 'I like the rain.', exampleTrans: 'Ман боронро дӯст медорам.'
                },
                {
                  word: 'Summer', translation: 'Тобистон', emoji: '🏖️',
                  audioUrl: '/audio/en/summer.mp3', ipa: '/ˈsʌmər/',
                  example: 'Summer is hot.', exampleTrans: 'Тобистон гарм аст.'
                },
                {
                  word: 'Winter', translation: 'Зимистон', emoji: '⛄',
                  audioUrl: '/audio/en/winter.mp3', ipa: '/ˈwɪntər/',
                  example: 'Winter is cold.', exampleTrans: 'Зимистон хунук аст.'
                }
              ]
            }
          },
          {
            title: 'Basic Actions',
            titleTranslated: 'Амалҳои оддӣ',
            type: 'vocab',
            cefrLevel: 'A1',
            skillType: 'vocab',
            emoji: '🏃',
            xpReward: 70,
            duration: 7,
            order: 4,
            words: {
              create: [
                {
                  word: 'Go', translation: 'Рафтан', emoji: '🚶',
                  audioUrl: '/audio/en/go.mp3', ipa: '/ɡoʊ/',
                  example: 'I go to school.', exampleTrans: 'Ман ба мактаб меравам.'
                },
                {
                  word: 'Stop', translation: 'Истодан', emoji: '🛑',
                  audioUrl: '/audio/en/stop.mp3', ipa: '/stɒp/',
                  example: 'Please stop here.', exampleTrans: 'Лутфан дар ин ҷо истед.'
                },
                {
                  word: 'Look', translation: 'Нигоҳ кардан', emoji: '👀',
                  audioUrl: '/audio/en/look.mp3', ipa: '/lʊk/',
                  example: 'Look at this.', exampleTrans: 'Ба ин нигоҳ кунед.'
                },
                {
                  word: 'Listen', translation: 'Гӯш кардан', emoji: '👂',
                  audioUrl: '/audio/en/listen.mp3', ipa: '/ˈlɪsən/',
                  example: 'Listen to me.', exampleTrans: 'Ба ман гӯш кунед.'
                }
              ]
            }
          }
        ]
      }
    }
  });

  console.log("Added new module with 5 lessons to A1!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
