import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isTestAccount } from '@/lib/admin/realUser';
import { liveStreak } from '@/lib/streakDisplay';
import { LEVEL_ORDER } from '@/lib/admin/userFilters';

type StudyRow = { uid: string; code: string; level: string; lessons: number };

/**
 * Забон ва сатҳи ВОҚЕИИ ҳар корбар — аз прогресси хондашуда.
 *
 * 🔴 Чаро лозим шуд: филтрҳои саҳифа ба `User.targetLang` ва `User.level`
 * такя мекарданд. Ченаки продакшн (21.09.2026, 271 корбар):
 *   · `targetLang` дар 180 сатр NULL — 79 корбари ВОҚЕАН хонанда (яке 234
 *     дарси англисӣ) дар филтри забон умуман пайдо намешуданд;
 *   · `level` дар ҲАМА 271 сатр 'A1' — филтри сатҳ як вариант дошт ва
 *     ҳеҷ чизро ҷудо намекард, ҳол он ки дар база A2 ва B1 ҳаст;
 *   · 18 корбар ЯКЧАНД забон меомӯзанд — як сутун онро ифода карда
 *     наметавонад.
 * Як пурсиши гурӯҳӣ (≈170 сатр) ин ҳар серо ҳал мекунад.
 */
async function studyMap(): Promise<Map<string, { langs: string[]; level: string; lessons: number }>> {
  const rows = await prisma.$queryRaw<StudyRow[]>`
    SELECT up."userId" AS uid, tl.code AS code, c.level AS level, COUNT(*)::int AS lessons
    FROM "UserProgress" up
    JOIN "Lesson" le ON le.id = up."lessonId"
    JOIN "Module" m  ON m.id  = le."moduleId"
    JOIN "Course" c  ON c.id  = m."courseId"
    JOIN "Language" tl ON tl.id = c."targetLanguageId"
    WHERE up."isCompleted" = true
    GROUP BY 1, 2, 3
  `;

  const map = new Map<string, { langs: string[]; level: string; lessons: number }>();
  for (const r of rows) {
    const cur = map.get(r.uid) ?? { langs: [], level: 'A1', lessons: 0 };
    if (!cur.langs.includes(r.code)) cur.langs.push(r.code);
    if (LEVEL_ORDER.indexOf(r.level) > LEVEL_ORDER.indexOf(cur.level)) cur.level = r.level;
    cur.lessons += r.lessons;
    map.set(r.uid, cur);
  }
  return map;
}

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const study = await studyMap();
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        isPremium: true,
        premiumPlan: true,
        premiumExpiresAt: true,
        totalXp: true,
        streak: true,
        lastActiveDate: true,
        tzOffsetMin: true,
        streakFreezesAvailable: true,
        createdAt: true,
        lastActiveAt: true,
        interfaceLang: true,
        targetLang: true,
        level: true,
        country: true,
      },
    });

    const now = new Date();
    // Map to shape the client expects. `phone`/`isActive` used to be
    // hardcoded to null/true here with comments claiming the schema had no
    // such fields — it does; that was simply wrong, and hid every real
    // phone number and any deactivated account's true status. `isPremium`
    // is recomputed from the real expiry instead of passed through as-is,
    // since the stored flag isn't reliably cleared when a plan expires
    // (see lib/premium.ts checkAndUpdatePremium).
    const mapped = users.map(u => {
      const st = study.get(u.id);
      return {
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      isActive: u.isActive,
      isPremium: u.isPremium && (u.premiumPlan === 'lifetime' || (!!u.premiumExpiresAt && u.premiumExpiresAt >= now)),
      premiumPlan: u.premiumPlan,
      totalXp: u.totalXp,
      // Силсилаи ЗИНДА, на майдони яхбастаи база — ниг. lib/streakDisplay.ts.
      streak: liveStreak(u, now),
      createdAt: u.createdAt,
      lastActiveAt: u.lastActiveAt,
      interfaceLang: u.interfaceLang,
      targetLang: u.targetLang,
      level: u.level,
      country: u.country,
      // Flagged HERE, not in the page: the definition lives in
      // lib/admin/realUser.ts and pulls in `@prisma/client`, which must not
      // reach the client bundle. The list still shows every account — the
      // flag only lets the page say how many of them are test accounts, so
      // its total stops contradicting the Dashboard.
      isTest: isTestAccount(u),
      // Ҳақиқат аз прогресс — филтрҳои «Забони омӯзишӣ» ва «Сатҳ» маҳз
      // инҳоро мехонанд, на сутунҳои кӯҳнаи `targetLang`/`level`.
      langs: st?.langs ?? [],
      studyLevel: st?.level ?? null,
      lessonsDone: st?.lessons ?? 0,
      };
    });

    return NextResponse.json(mapped);
  } catch (error: any) {
    console.error('USERS API ERROR:', error?.message);
    return NextResponse.json({ error: error?.message || 'Хатои сервер' }, { status: 500 });
  }
}
