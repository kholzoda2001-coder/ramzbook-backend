import type { PrismaClient } from '@prisma/client';

/**
 * Пешрафти ЯК забон — на ҷамъи умумии корбар.
 */
export type LanguageStat = {
  /** `en`, `ar`, `ru`… */
  code: string;
  /** XP-и маҳз ҳамин забон. */
  xp: number;
  /** Дарсҳои анҷомёфтаи ҳамин забон. */
  lessons: number;
  /** Сатҳи CEFR-и ҳамин забон (`UserLanguage.currentLevel`). */
  level: string;
  /** Фоизи курси ҳамин забон, 0..100. */
  percent: number;
};

/**
 * Пешрафт БО ЗАБОНҲО.
 *
 * ── Боге, ки ин файл мебандад ──────────────────────────────────────────────
 *
 * Рӯйхати «Забонҳои омӯзишӣ» дар профил рақамҳои УМУМИИ корбарро ба забони
 * ФАЪОЛ мечаспонд, ва ба ҳамаи дигарон сифр медод. Яъне корбар англисиро
 * интихоб мекард — 8438 XP ва 83 дарс ба англисӣ мерафт; арабиро интихоб
 * мекард — ҲАМОН 8438 ба арабӣ мерафт. Рақам на ба забон, балки ба
 * интихоб вобаста буд.
 *
 * ⚠️ ЧАРО `UserLanguage.xp` ИСТИФОДА НАМЕШАВАД. Он майдон дар схема ҳаст,
 * вале дар тамоми код ҳеҷ гоҳ НАВИШТА намешавад — танҳо хонда, нест ва
 * (дар placement) сатҳаш нав карда мешавад. Яъне он ҳамеша 0 аст. Агар
 * ин ҷо ба он такя мекардем, ҳамаи забонҳо сифр нишон медоданд ва боги
 * нав ба ҷои кӯҳна мебаромад.
 *
 * Манбаи ҲАҚИҚАТ `UserProgress` аст: ҳар сатр як дарси анҷомёфта бо
 * `xpEarned`-и худаш, ва дарс тавассути занҷири
 * `Lesson → Module → Course → targetLanguage` ба забон мебандад.
 *
 * ⚠️ XP-и бахши ГУФТОР ин ҷо намеояд: он дар `SpeakingProgress` зиндагӣ
 * мекунад ва ба `Course`/`Lesson` тамоман даст намезанад (қасдан — ниг.
 * шарҳи схема). Пас ҷамъи `byLanguage` метавонад аз `totalXp`-и умумӣ
 * камтар бошад, ва ин ДУРУСТ аст: ин ҷо «пешрафти курс» нишон дода
 * мешавад, на ҳамаи XP-и ҳаёт.
 */
export async function languageStats(
  prisma: PrismaClient,
  userId: string,
  nativeLang: string,
): Promise<LanguageStat[]> {
  // ── Манбаи рӯйхат ─────────────────────────────────────────────────────────
  //
  // 🔴 Даҳшати ЧЕНШУДА (`prisma/_check-lang-stats.mjs` дар базаи истеҳсолӣ):
  // ҷадвали `UserLanguage` барои корбарони воқеӣ ТАМОМАН ХОЛӢ аст — на «xp=0»,
  // балки ҳеҷ сатр нест. Корбари 21 021 XP-дор бо 284 дарси англисӣ дар он ҷо
  // сифр сатр дорад.
  //
  // Пас рӯйхат аз он ҷо гирифта НАМЕШАВАД: агар мегирифтем, ҷавоб барои
  // аксари корбарон холӣ мебаромад ва ислоҳ хомӯшона кор намекард.
  //
  // Ҳақиқат `UserProgress` аст. Барнома худаш медонад, ки корбар ба кадом
  // забонҳо навишта шудааст; вазифаи ин ҷо танҳо ҷавоб додан ба саволи
  // «дар ҳар забон чӣ қадар пешрафт ҳаст». Забони бе пешрафт дар ҷавоб
  // намеояд ва барнома барои он сифр нишон медиҳад — ки ДУРУСТ аст.
  const done = await prisma.userProgress.findMany({
    where: { userId, isCompleted: true },
    select: {
      xpEarned: true,
      lesson: {
        select: {
          module: {
            select: {
              course: {
                select: { targetLanguage: { select: { code: true } } },
              },
            },
          },
        },
      },
    },
  });

  const agg = new Map<string, { xp: number; lessons: number }>();
  for (const row of done) {
    const code = row.lesson?.module?.course?.targetLanguage?.code;
    if (!code) continue;
    const cur = agg.get(code) ?? { xp: 0, lessons: 0 };
    cur.xp += row.xpEarned;
    cur.lessons += 1;
    agg.set(code, cur);
  }

  // Сатҳи CEFR — агар сатри `UserLanguage` бошад. Набошад, `A1`.
  const levels = new Map<string, string>();
  try {
    const rows = await prisma.userLanguage.findMany({
      where: { userId },
      select: { currentLevel: true, language: { select: { code: true } } },
    });
    for (const r of rows) {
      if (r.language?.code) levels.set(r.language.code, r.currentLevel);
    }
  } catch {
    // Сатҳ ороишист — набудани он набояд рақамҳоро нест кунад.
  }

  // `[...map.keys()]` не: `tsconfig` ба ES5 нишон мегирад ва спред аз рӯи
  // итератор он ҷо TS2802 медиҳад (ҳамон доме, ки дар роути `lookup` бо
  // флаги `u` буд).
  const codes = Array.from(agg.keys());
  if (codes.length === 0) return [];

  // Фоиз ба ҶУФТИ забон вобаста аст: курс = забони ҳадаф + забони модарӣ.
  const totals = await Promise.all(
    codes.map((code) =>
      prisma.lesson.count({
        where: {
          isActive: true,
          module: {
            isActive: true,
            course: {
              isActive: true,
              targetLanguage: { code },
              nativeLanguage: { code: nativeLang },
            },
          },
        },
      }),
    ),
  );

  return codes
    .map((code, i) => {
      const a = agg.get(code)!;
      const total = totals[i];
      return {
        code,
        xp: a.xp,
        lessons: a.lessons,
        level: levels.get(code) ?? 'A1',
        // Дарси анҷомёфта метавонад аз ҷуфти ДИГАР бошад (корбар забони
        // модариро иваз кардааст), пас маҳдуд карда мешавад — вагарна 140%.
        percent: total > 0 ? Math.min(100, Math.round((a.lessons / total) * 100)) : 0,
      };
    })
    .sort((x, y) => y.xp - x.xp);
}
