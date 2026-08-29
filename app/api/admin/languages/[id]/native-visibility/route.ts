import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

/**
 * PUT /api/admin/languages/[id]/native-visibility   { canBeNative: boolean }
 *
 * Забонро ҳамчун забони МОДАРӢ (= забони интерфейс) фаъол/хомӯш мекунад ва
 * ҳамроҳи он ҳамаи забонҳои ОМӮЗИШИИ тобеи онро пинҳон мекунад.
 *
 * ЧАРО `canBeNative`, на `isActive`:
 * `isActive` ЯК сутун барои ҲАР ДУ нақш аст. Англисӣ ҳамзамон забони модарӣ
 * (интерфейс) ва забони омӯзиш аст — агар мо «англисӣ ҳамчун модарӣ»-ро бо
 * `isActive: false` хомӯш кунем, он аз рӯйхати забонҳои ОМӮЗИШ низ нопадид
 * мешавад ва курси асосии тоҷикӣ→англисӣ мемирад. `canBeNative` бошад маҳз
 * ба ҳамон як нақш тааллуқ дорад, пас хомӯш кардани он ба тарафи омӯзишӣ
 * даст намерасонад.
 *
 * ЧАРО ҳеҷ курс НАВИШТА намешавад:
 * Ба ҷои `Course.isActive = false` кардан, се дарвозаи мобилӣ ҳангоми ХОНДАН
 * месанҷанд, ки забони модарӣ фаъол аст ё не:
 *
 *   • GET /api/mobile/languages/native  — `canBeNative: true` талаб мекунад
 *   • GET /api/mobile/languages/target  — забони модариро месанҷад
 *   • GET /api/mobile/courses           — ҳамон санҷиш дар `where`
 *
 * Ин муҳим аст: агар мо курсҳоро менавиштем, баргардонидан онҳое курсҳоеро,
 * ки админ ҶУДОГОНА хомӯш карда буд, хомӯшона зинда мекард. Ҳоло ҳолати ҳар
 * курс дасти нахӯрда мемонад ва ҳамон дархост бо `canBeNative: true`
 * ҳамаашро айнан барқарор мекунад.
 *
 * Ҳеҷ чиз НЕСТ намешавад: на курс, на дарс, на прогресси хонанда.
 *
 * КЭШИ ТЕЛЕФОНҲО: `Language` дар `CONTENT_MODELS`-и `lib/prisma.ts` ҳаст, пас
 * ҳамин `update` худкор `AppSetting.content_version`-ро мебардорад. Барнома
 * онро дар ҳар кушодан мепурсад ва кэши худро бекор мекунад — яъне тағйир
 * фавран мерасад, на баъди мӯҳлати TTL.
 */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = (await req.json()) as { canBeNative?: boolean };
    if (typeof body.canBeNative !== 'boolean') {
      return NextResponse.json(
        { error: 'canBeNative (boolean) лозим аст' },
        { status: 400 },
      );
    }
    const canBeNative = body.canBeNative;

    const language = await prisma.language.findUnique({
      where: { id: params.id },
      select: { id: true, code: true, name: true, nativeName: true, canBeNative: true },
    });
    if (!language) {
      return NextResponse.json({ error: 'Забон ёфт нашуд' }, { status: 404 });
    }

    await prisma.language.update({
      where: { id: params.id },
      data: { canBeNative },
    });

    // ── Таъсир: чанд курс ва чанд забони омӯзишӣ пинҳон/боз мешавад ──
    const courses = await prisma.course.findMany({
      where: { nativeLanguageId: params.id, isActive: true },
      select: { targetLanguageId: true },
    });
    const targetLanguages = new Set(courses.map((c) => c.targetLanguageId)).size;

    // Хонандагоне, ки маҳз ҳамин забонро ҳамчун забони модарӣ доранд —
    // баъд аз хомӯш кардан онҳо роҳнамои ХОЛӢ мебинанд.
    const affectedLearners = await prisma.user.count({
      where: { nativeLang: language.code },
    });

    revalidatePath('/admin/languages');
    revalidatePath('/admin/courses');

    return NextResponse.json({
      ok: true,
      language: language.nativeName || language.name,
      canBeNative,
      coursesHidden: courses.length,
      targetLanguagesHidden: targetLanguages,
      affectedLearners,
    });
  } catch (err: any) {
    console.error('[admin/languages/native-visibility]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
