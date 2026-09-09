import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';
import { getHearts } from '@/lib/hearts';
import { checkStreakDecayDetailed } from '@/lib/xp';
import { checkAndUpdatePremium } from '@/lib/premium';
import { getClientIp, getCountryFromIp } from '@/lib/geo';
import { languageStats } from '@/lib/languageStats';

export async function GET(req: Request) {
  try {
    const user = await authenticate(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Update dynamic stats.
    // NOTE: streak is ADVANCED only when XP is earned (see lib/xp.ts awardXp).
    // Here we only DECAY a broken streak — opening the app must never fake a streak.
    await checkAndUpdatePremium(user.id);
    // Натиҷаро нигоҳ медорем: барнома бояд ДОНАД, ки freeze сарф шуд ё
    // streak шикаст — вагарна ин лаҳзаҳо хомӯш мемонанд (ниг. поён).
    const streakEvent = await checkStreakDecayDetailed(user.id);
    const heartsData = await getHearts(user.id);

    // ── Background IP Geolocation ────────────────────────────────────────────
    // Check if the user has no country yet and detect it from their IP.
    // This fires once per user and is completely non-blocking.
    const userCountryCheck = await prisma.user.findUnique({
      where: { id: user.id },
      select: { country: true },
    });
    if (!userCountryCheck?.country) {
      const clientIp = getClientIp(req);
      getCountryFromIp(clientIp).then((countryCode) => {
        if (countryCode) {
          prisma.user
            .update({ where: { id: user.id }, data: { country: countryCode } })
            .catch(() => {});
        }
      }).catch(() => {});
    }
    // ─────────────────────────────────────────────────────────────────────────

    // Fetch fresh user data
    const freshUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        totalXp: true,
        weeklyXp: true,
        // Барои фоизи ҳар курс: курс ба ҶУФТИ забон вобаста аст.
        nativeLang: true,
        gems: true,
        streak: true,
        longestStreak: true,
        streakFreezesAvailable: true,
        streakFreezesUsed: true,
        level: true,
        isPremium: true,
        premiumPlan: true,
        premiumExpiresAt: true,
      },
    });

    if (!freshUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Real lesson/word counts for the home stats grid.
    const completed = await prisma.userProgress.findMany({
      where: { userId: user.id, isCompleted: true },
      select: { lessonId: true },
    });
    const lessonsCompleted = completed.length;
    const wordsLearned = completed.length
      ? await prisma.word.count({ where: { lessonId: { in: completed.map((c) => c.lessonId) } } })
      : 0;

    // Пешрафт БО ЗАБОНҲО — рӯйхати «Забонҳои омӯзишӣ» дар профил.
    //
    // Бе ин рӯйхат рақами УМУМИРО ба забони ФАЪОЛ мечаспонд ва ба
    // дигарон сифр медод: интихоби забонро иваз мекардӣ — ҳамон 8438 XP
    // ба забони нав мекӯчид. Ниг. `lib/languageStats.ts`.
    //
    // Хатогӣ дархостро НАМЕШИКАНАД: ин майдон ороишист ва набудани он
    // барномаро ба рафтори пештара бармегардонад.
    let byLanguage: Awaited<ReturnType<typeof languageStats>> = [];
    try {
      byLanguage = await languageStats(prisma, user.id, freshUser.nativeLang);
    } catch (e) {
      console.error('[users/stats] byLanguage', e);
    }

    return NextResponse.json({
      ...freshUser,
      lessonsCompleted,
      wordsLearned,
      byLanguage,
      hearts: heartsData.hearts,
      maxHearts: heartsData.maxHearts,
      nextRegenSeconds: heartsData.nextRegenSeconds,
      regenMinutes: (heartsData as any).regenMinutes ?? 30,
      // Ду рӯйдоди ЯКБОРА (танҳо дар ҳамон дархосте ки онҳо рух доданд):
      //   streakFreezeUsed — freeze streak-ро наҷот дод → лаҳзаи ҷашн;
      //   streakLost       — streak шикаст → пешниҳоди барқарорсозӣ.
      // Бе инҳо ҳарду хомӯш мемонданд ва корбар намефаҳмид чӣ шуд.
      streakFreezeUsed: streakEvent.freezeUsed,
      streakLost: streakEvent.streakLost,
    });
  } catch (error: any) {
    console.error('Stats fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
