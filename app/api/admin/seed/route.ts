import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const results: string[] = [];

  try {
    // ── Users ───────────────────────────────────────────────────────────
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      for (let i = 1; i <= 10; i++) {
        const isPremium = i <= 3;
        const user = await prisma.user.create({
          data: {
            name: `Корбари ${i}`,
            email: `user${i}@ramz.tj`,
            passwordHash: 'seed_hash_placeholder',
            isPremium,
            premiumPlan: isPremium ? 'yearly' : null,
            premiumStartedAt: isPremium ? new Date() : null,
            premiumExpiresAt: isPremium ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null,
            totalXp: Math.floor(Math.random() * 20000),
            streak: Math.floor(Math.random() * 100),
          }
        });

        if (isPremium) {
          await prisma.subscription.create({
            data: {
              userId: user.id,
              plan: 'yearly',
              status: 'active',
              googleProductId: 'ramz_yearly',
              startedAt: new Date(),
              expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            }
          });
          await prisma.payment.create({
            data: {
              userId: user.id,
              amount: 29.99,
              plan: 'yearly',
              status: 'success',
            }
          });
        }
      }
      results.push('✅ 10 корбар, 3 обуна ва 3 пардохт ворид карда шуд');
    } else {
      results.push(`⚠️ Корбарон аллакай мавҷуданд (${userCount})`);
    }

    // ── Languages ───────────────────────────────────────────────────────
    const langCount = await prisma.language.count();
    if (langCount === 0) {
      await prisma.language.createMany({
        data: [
          { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', sortOrder: 1 },
          { code: 'ru', name: 'Русский', nativeName: 'Русский', flag: '🇷🇺', sortOrder: 2 },
          { code: 'de', name: 'Deutsch', nativeName: 'Deutsch', flag: '🇩🇪', sortOrder: 3 },
          { code: 'fr', name: 'Français', nativeName: 'Français', flag: '🇫🇷', sortOrder: 4 },
        ]
      });
      results.push('✅ 4 забон ворид карда шуд');
    } else {
      results.push(`⚠️ Забонҳо аллакай мавҷуданд (${langCount})`);
    }

    // ── Courses ─────────────────────────────────────────────────────────
    const courseCount = await prisma.course.count();
    if (courseCount === 0) {
      const langEn = await prisma.language.findUnique({ where: { code: 'en' } });
      if (langEn) {
        const course = await prisma.course.create({
          data: {
            languageId: langEn.id,
            level: 'A1',
            title: 'Забони Англисӣ барои Навомӯзон',
            emoji: '🎓',
            color: '#4F46E5',
          }
        });

        const unit = await prisma.unit.create({
          data: {
            courseId: course.id,
            title: 'Саломдиҳӣ ва Муарафӣ',
            emoji: '👋',
            color: '#10B981',
          }
        });

        const lesson = await prisma.lesson.create({
          data: {
            unitId: unit.id,
            title: 'Саломдиҳии Асосӣ',
            titleTranslations: { tg: 'Саломдиҳии Асосӣ', ru: 'Базовые приветствия', en: 'Basic Greetings' },
            emoji: '🤝',
            xpReward: 50,
            estimatedMin: 5,
          }
        });

        const wordsData = [
          { word: 'Hello', translation: 'Салом', emoji: '👋', difficulty: 1 },
          { word: 'Goodbye', translation: 'Хайр', emoji: '✌️', difficulty: 1 },
          { word: 'Thank you', translation: 'Ташаккур', emoji: '🙏', difficulty: 1 },
          { word: 'Yes', translation: 'Бале', emoji: '✅', difficulty: 1 },
          { word: 'No', translation: 'Не', emoji: '❌', difficulty: 1 },
        ];
        for (const wd of wordsData) {
          const w = await prisma.word.create({ data: { langFrom: 'en', langTo: 'tg', ...wd } });
          await prisma.lessonWord.create({ data: { lessonId: lesson.id, wordId: w.id } });
        }
        results.push('✅ 1 курс, 1 модул, 1 дарс ва 5 калима ворид карда шуд');
      }
    } else {
      results.push(`⚠️ Курсҳо аллакай мавҷуданд (${courseCount})`);
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error('SEED ERROR:', error?.message);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
