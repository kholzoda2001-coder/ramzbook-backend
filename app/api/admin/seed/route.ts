import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import seedData from '@/prisma/seed-data.json';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type SeedWord = { w: string; t: string; e?: string; ipa?: string; ex?: string; exT?: string };
type SeedLesson = { title: string; titleTranslated: string; type: string; emoji: string; words: SeedWord[] };
type SeedModule = { title: string; titleTranslated: string; emoji: string; lessons: SeedLesson[] };
type SeedCourse = { level: string; title: string; description: string; emoji: string; color: string; modules: SeedModule[] };
type SeedLang = {
  code: string; name: string; nativeName: string; flag: string;
  canBeNative: boolean; canBeTarget: boolean; badge: string | null; learnerCount: string | null; order: number;
};
type SeedFile = { languages: SeedLang[]; courses: SeedCourse[]; ui: Record<string, Record<string, string>> };

/**
 * POST /api/admin/seed — destructive re-seed of all learning content + UI strings
 * from prisma/seed-data.json (target=English, native=Tajik pair).
 */
export async function POST() {
  try {
    const data = seedData as SeedFile;

    // 1. Languages
    const langByCode: Record<string, { id: string }> = {};
    for (const l of data.languages) {
      const lang = await prisma.language.upsert({ where: { code: l.code }, create: l, update: l });
      langByCode[l.code] = lang;
    }

    // 2. Wipe content
    await prisma.userProgress.deleteMany({});
    await prisma.word.deleteMany({});
    await prisma.lesson.deleteMany({});
    await prisma.module.deleteMany({});
    await prisma.course.deleteMany({});

    const target = langByCode['en'];
    const native = langByCode['tg'];
    if (!target || !native) {
      return NextResponse.json({ error: 'Seed requires en + tg languages' }, { status: 500 });
    }

    let modules = 0, lessons = 0, words = 0;

    for (let ci = 0; ci < data.courses.length; ci++) {
      const c = data.courses[ci];
      const course = await prisma.course.create({
        data: {
          targetLanguageId: target.id,
          nativeLanguageId: native.id,
          level: c.level,
          title: c.title,
          description: c.description,
          emoji: c.emoji,
          color: c.color,
          order: ci,
          isActive: true,
        },
      });

      for (let mi = 0; mi < c.modules.length; mi++) {
        const m = c.modules[mi];
        const module = await prisma.module.create({
          data: {
            courseId: course.id,
            title: m.title,
            titleTranslated: m.titleTranslated,
            emoji: m.emoji,
            order: mi,
            isPremium: ci > 0,
            isActive: true,
          },
        });
        modules++;

        for (let li = 0; li < m.lessons.length; li++) {
          const l = m.lessons[li];
          const lesson = await prisma.lesson.create({
            data: {
              moduleId: module.id,
              title: l.title,
              titleTranslated: l.titleTranslated,
              type: l.type,
              emoji: l.emoji,
              xpReward: 60,
              duration: 5,
              order: li,
              isPremium: ci > 0,
              isActive: true,
            },
          });
          lessons++;

          await prisma.word.createMany({
            data: l.words.map((w, wi) => ({
              lessonId: lesson.id,
              word: w.w,
              translation: w.t,
              emoji: w.e ?? null,
              ipa: w.ipa ?? null,
              example: w.ex ?? null,
              exampleTrans: w.exT ?? null,
              difficulty: 1,
              order: wi,
            })),
          });
          words += l.words.length;
        }
      }
    }

    // 3. UI translations
    let ui = 0;
    for (const code of ['tg', 'ru', 'en']) {
      const lang = langByCode[code];
      if (!lang) continue;
      for (const [key, vals] of Object.entries(data.ui)) {
        const value = vals[code] ?? vals.en ?? key;
        await prisma.uiTranslation.upsert({
          where: { languageId_key: { languageId: lang.id, key } },
          create: { languageId: lang.id, key, value },
          update: { value },
        });
        ui++;
      }
    }

    return NextResponse.json({
      success: true,
      languages: data.languages.length,
      courses: data.courses.length,
      modules, lessons, words, uiTranslations: ui,
    });
  } catch (err: any) {
    console.error('[admin/seed]', err);
    return NextResponse.json({ error: err?.message ?? 'Seed failed' }, { status: 500 });
  }
}
