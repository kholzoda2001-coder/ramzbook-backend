import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Check if we already have users
  const count = await prisma.user.count()
  if (count > 0) {
    console.log('Database already has data. Skipping user seed.')
    // We will just proceed to seed other things if they are missing
  } else {
    // Create 10 sample users
    for (let i = 1; i <= 10; i++) {
      const isPremium = i <= 3;
      const user = await prisma.user.create({
        data: {
          name: `Корбари ${i}`,
          email: `user${i}@example.com`,
          passwordHash: 'dummy_hash',
          isPremium: isPremium,
          premiumPlan: isPremium ? 'yearly' : null,
          totalXp: Math.floor(Math.random() * 20000),
          streak: Math.floor(Math.random() * 100),
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000))
        }
      });

      if (isPremium) {
        // Create Subscription
        await prisma.subscription.create({
          data: {
            userId: user.id,
            plan: 'yearly',
            status: 'ACTIVE',
            googleProductId: 'ramz_yearly',
            startedAt: new Date(Date.now() - 100000000)
          }
        });
        // Create Payment
        await prisma.payment.create({
          data: {
            userId: user.id,
            amount: 29.99,
            plan: 'yearly',
            status: 'success',
            createdAt: new Date(Date.now() - 100000000)
          }
        });
      }
    }
    console.log('Seeded 10 sample users with subscriptions.');
  }

  // Create Language if not exist
  let langEn = await prisma.language.findUnique({ where: { code: 'en' } });
  if (!langEn) {
    langEn = await prisma.language.create({
      data: {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        flag: '🇬🇧'
      }
    });
    console.log('Seeded English language.');
  }

  // Create Course if not exist
  const courseCount = await prisma.course.count();
  if (courseCount === 0) {
    const course = await prisma.course.create({
      data: {
        languageId: langEn.id,
        level: 'A1',
        title: 'English for Beginners',
        emoji: '🎓',
        color: '#4F46E5',
      }
    });

    // Create Unit
    const unit = await prisma.unit.create({
      data: {
        courseId: course.id,
        title: 'Greetings & Basics',
        emoji: '👋',
        color: '#10B981'
      }
    });

    // Create Lesson
    const lesson = await prisma.lesson.create({
      data: {
        unitId: unit.id,
        title: 'Saying Hello',
        titleTranslations: { tg: 'Салом гуфтан', ru: 'Приветствие' },
        emoji: '🤝',
        xpReward: 50,
        estimatedMin: 5
      }
    });

    // Create Words
    const word1 = await prisma.word.create({
      data: {
        langFrom: 'en',
        langTo: 'tg',
        word: 'Hello',
        translation: 'Салом',
      }
    });
    
    const word2 = await prisma.word.create({
      data: {
        langFrom: 'en',
        langTo: 'tg',
        word: 'World',
        translation: 'Ҷаҳон',
      }
    });

    await prisma.lessonWord.create({ data: { lessonId: lesson.id, wordId: word1.id }});
    await prisma.lessonWord.create({ data: { lessonId: lesson.id, wordId: word2.id }});
    console.log('Seeded course, unit, lesson, and words.');
  } else {
    console.log('Courses already exist. Skipping course seed.');
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
