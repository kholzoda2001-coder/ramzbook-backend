import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  const results: string[] = [];

  try {
    // 1. ── Users (10 users: 5 Free, 5 Premium) ──────────────────────
    const userCount = await prisma.user.count();
    if (userCount < 10) {
      const hash = await bcrypt.hash('password123', 10);
      for (let i = 1; i <= 10; i++) {
        const isPremium = i <= 5;
        const user = await prisma.user.create({
          data: {
            name: `Test User ${i}`,
            email: `user${i}@ramz.tj`,
            passwordHash: hash,
            isPremium,
            premiumPlan: isPremium ? 'yearly' : null,
            premiumStartedAt: isPremium ? new Date() : null,
            premiumExpiresAt: isPremium ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null,
            totalXp: Math.floor(Math.random() * 20000),
            streak: Math.floor(Math.random() * 100),
            gems: Math.floor(Math.random() * 500),
          }
        });

        if (isPremium) {
          await prisma.subscription.create({
            data: {
              userId: user.id,
              plan: 'yearly',
              status: 'active',
              googleProductId: 'ramz_yearly',
              googlePurchaseToken: `token_test_${i}_${Date.now()}`,
              startedAt: new Date(),
              expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            }
          });
          await prisma.payment.create({
            data: {
              userId: user.id,
              amount: 29.99,
              currency: 'USD',
              plan: 'yearly',
              status: 'success',
            }
          });
        }
      }
      results.push('✅ 10 корбар (5 Premium, 5 Free), 5 обуна ва 5 пардохт ворид карда шуд');
    } else {
      results.push(`⚠️ Корбарон аллакай мавҷуданд (${userCount})`);
    }

    // 2. ── Languages (3 langs) ──────────────────────────────────────────
    const langCount = await prisma.language.count();
    if (langCount === 0) {
      await prisma.language.createMany({
        data: [
          { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', sortOrder: 1 },
          { code: 'ru', name: 'Русский', nativeName: 'Русский', flag: '🇷🇺', sortOrder: 2 },
          { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', sortOrder: 3 },
        ]
      });
      results.push('✅ 3 забон ворид карда шуд');
    } else {
      results.push(`⚠️ Забонҳо аллакай мавҷуданд (${langCount})`);
    }

    // 3. ── Courses, Units, Lessons, Words ──────────────────────────────
    const courseCount = await prisma.course.count();
    if (courseCount === 0) {
      const langEn = await prisma.language.findUnique({ where: { code: 'en' } });
      if (langEn) {
        const levels = ['A1', 'A2', 'B1', 'B2', 'C1'];
        let wordCounter = 1;
        let lessonIdList: string[] = [];
        
        for (let i = 0; i < levels.length; i++) {
          const course = await prisma.course.create({
            data: {
              languageId: langEn.id,
              level: levels[i],
              title: `Англисӣ - Сатҳи ${levels[i]}`,
              emoji: '📚',
              color: '#4F46E5',
              sortOrder: i,
            }
          });

          // 30 units (6 per level)
          for (let u = 1; u <= 6; u++) {
            const unit = await prisma.unit.create({
              data: {
                courseId: course.id,
                title: `Модули ${u}`,
                emoji: '🎯',
                color: '#10B981',
                sortOrder: u,
                isPremium: levels[i] !== 'A1',
              }
            });

            // 60 lessons (10 per level = 1 or 2 per unit)
            // Just add 2 lessons per unit (6 * 2 = 12 lessons per level, approx 60 total)
            for (let l = 1; l <= 2; l++) {
               const lesson = await prisma.lesson.create({
                 data: {
                   unitId: unit.id,
                   title: `Дарси ${u}.${l}`,
                   titleTranslations: { tg: `Дарси ${u}.${l}`, ru: `Урок ${u}.${l}`, en: `Lesson ${u}.${l}`, uz: `Dars ${u}.${l}` },
                   emoji: '📝',
                   xpReward: 50 + (i * 10),
                   estimatedMin: 5,
                   sortOrder: l,
                 }
               });
               lessonIdList.push(lesson.id);

               // Add words (approx 200 total -> 3-4 per lesson)
               for (let w = 1; w <= 3; w++) {
                 const word = await prisma.word.create({
                   data: {
                     langFrom: 'en',
                     langTo: 'tg',
                     word: `Word ${wordCounter}`,
                     translation: `Тарҷумаи ${wordCounter}`,
                     difficulty: i + 1,
                   }
                 });
                 await prisma.lessonWord.create({
                   data: {
                     lessonId: lesson.id,
                     wordId: word.id,
                   }
                 });
                 wordCounter++;
               }
            }
          }
        }
        results.push(`✅ 5 курс, 30 модул, ~60 дарс ва ~180 калима ворид карда шуд`);
        
        // Add 20 UserProgress records
        const someUsers = await prisma.user.findMany({ take: 5 });
        if (someUsers.length > 0 && lessonIdList.length > 0) {
           let progressCount = 0;
           for (const user of someUsers) {
             for (let p = 0; p < 4; p++) {
               await prisma.userProgress.create({
                 data: {
                   userId: user.id,
                   lessonId: lessonIdList[p],
                   isCompleted: true,
                   accuracy: 95,
                   xpEarned: 50,
                   timeSpent: 120,
                   completedAt: new Date()
                 }
               });
               progressCount++;
             }
           }
           results.push(`✅ ${progressCount} сабти UserProgress илова шуд`);
        }
      }
    } else {
      results.push(`⚠️ Курсҳо аллакай мавҷуданд (${courseCount})`);
    }

    // 4. ── Achievements (15) ──────────────────────────────────────────
    const achCount = await prisma.achievement.count();
    if (achCount === 0) {
      const achievements = [
        { code: 'streak_3', name: 'Оғози хуб', rarity: 'common', type: 'streak', val: 3, xp: 50 },
        { code: 'streak_7', name: 'Як ҳафта', rarity: 'common', type: 'streak', val: 7, xp: 100 },
        { code: 'streak_30', name: 'Оташ', rarity: 'rare', type: 'streak', val: 30, xp: 500 },
        { code: 'streak_100', name: 'Афсонавӣ', rarity: 'epic', type: 'streak', val: 100, xp: 2000 },
        { code: 'streak_365', name: 'Худои Забон', rarity: 'legendary', type: 'streak', val: 365, xp: 5000 },
        
        { code: 'xp_1000', name: 'Донишҷӯ', rarity: 'common', type: 'xp', val: 1000, xp: 100 },
        { code: 'xp_5000', name: 'Олим', rarity: 'rare', type: 'xp', val: 5000, xp: 500 },
        { code: 'xp_10000', name: 'Донишманд', rarity: 'epic', type: 'xp', val: 10000, xp: 1000 },
        { code: 'xp_50000', name: 'Нобиға', rarity: 'legendary', type: 'xp', val: 50000, xp: 5000 },
        
        { code: 'lessons_10', name: 'Навомӯз', rarity: 'common', type: 'lessons', val: 10, xp: 50 },
        { code: 'lessons_50', name: 'Устувор', rarity: 'rare', type: 'lessons', val: 50, xp: 250 },
        { code: 'lessons_100', name: 'Устод', rarity: 'epic', type: 'lessons', val: 100, xp: 1000 },
        { code: 'lessons_500', name: 'Муаллим', rarity: 'legendary', type: 'lessons', val: 500, xp: 5000 },
        
        { code: 'words_100', name: 'Луғатдон', rarity: 'common', type: 'words', val: 100, xp: 100 },
        { code: 'premium', name: 'Premium Аъзо', rarity: 'epic', type: 'premium', val: 1, xp: 1000 },
      ];
      
      for (const a of achievements) {
        await prisma.achievement.create({
          data: {
            code: a.code,
            name: a.name,
            nameTranslations: { tg: a.name, ru: a.name, en: a.name, uz: a.name },
            description: `Reach ${a.val} ${a.type}`,
            descriptionTranslations: { tg: `Расидан ба ${a.val}`, ru: `Reach ${a.val}`, en: `Reach ${a.val}`, uz: `Reach ${a.val}` },
            emoji: '🏆',
            rarity: a.rarity,
            conditionType: a.type,
            conditionValue: a.val,
            xpReward: a.xp,
            gemsReward: Math.floor(a.xp / 10),
          }
        });
      }
      results.push('✅ 15 Дастовард (Achievements) ворид карда шуд');
    } else {
      results.push(`⚠️ Дастовардҳо аллакай мавҷуданд (${achCount})`);
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error('SEED ERROR:', error?.message);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
