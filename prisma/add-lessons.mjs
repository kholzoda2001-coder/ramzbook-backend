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

  // Create a new module
  const module = await prisma.module.create({
    data: {
      courseId: course.id,
      title: 'Everyday Life',
      titleTranslated: 'Ҳаёти ҳаррӯза',
      emoji: '🏠',
      color: '#3B82F6', // Blue
      order: 1, // second module
      isPremium: false,
      isActive: true,
      lessons: {
        create: [
          {
            title: 'Colors and Clothes',
            titleTranslated: 'Рангҳо ва либосҳо',
            type: 'vocab',
            cefrLevel: 'A1',
            skillType: 'vocab',
            emoji: '🎨',
            xpReward: 60,
            duration: 6,
            order: 0,
            words: {
              create: [
                {
                  word: 'Red', translation: 'Сурх', emoji: '🔴', 
                  audioUrl: '/audio/en/red.mp3', ipa: '/red/',
                  example: 'The apple is red.', exampleTrans: 'Себ сурх аст.'
                },
                {
                  word: 'Blue', translation: 'Кабуд', emoji: '🔵',
                  audioUrl: '/audio/en/blue.mp3', ipa: '/bluː/',
                  example: 'The sky is blue.', exampleTrans: 'Осмон кабуд аст.'
                },
                {
                  word: 'Shirt', translation: 'Курта', emoji: '👕',
                  audioUrl: '/audio/en/shirt.mp3', ipa: '/ʃɜːrt/',
                  example: 'I like this shirt.', exampleTrans: 'Ман ин куртаро дӯст медорам.'
                },
                {
                  word: 'Pants', translation: 'Шим', emoji: '👖',
                  audioUrl: '/audio/en/pants.mp3', ipa: '/pænts/',
                  example: 'These are my pants.', exampleTrans: 'Ин шимҳои ман мебошанд.'
                }
              ]
            }
          },
          {
            title: 'Food and Drinks',
            titleTranslated: 'Хӯрок ва нӯшокиҳо',
            type: 'vocab',
            cefrLevel: 'A1',
            skillType: 'vocab',
            emoji: '🍔',
            xpReward: 60,
            duration: 6,
            order: 1,
            words: {
              create: [
                {
                  word: 'Water', translation: 'Об', emoji: '💧',
                  audioUrl: '/audio/en/water.mp3', ipa: '/ˈwɔːtər/',
                  example: 'I drink water.', exampleTrans: 'Ман об менӯшам.'
                },
                {
                  word: 'Bread', translation: 'Нон', emoji: '🍞',
                  audioUrl: '/audio/en/bread.mp3', ipa: '/bred/',
                  example: 'I eat bread.', exampleTrans: 'Ман нон мехӯрам.'
                },
                {
                  word: 'Apple', translation: 'Себ', emoji: '🍎',
                  audioUrl: '/audio/en/apple.mp3', ipa: '/ˈæpəl/',
                  example: 'An apple is sweet.', exampleTrans: 'Себ ширин аст.'
                },
                {
                  word: 'Tea', translation: 'Чой', emoji: '🍵',
                  audioUrl: '/audio/en/tea.mp3', ipa: '/tiː/',
                  example: 'I like green tea.', exampleTrans: 'Ман чойи сабзро дӯст медорам.'
                }
              ]
            }
          }
        ]
      }
    }
  });

  console.log("Added 1 module and 2 lessons!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
