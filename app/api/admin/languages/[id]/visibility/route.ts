import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * PUT /api/admin/languages/[id]/visibility   { isActive: boolean }
 *
 * Забонро дар ТАМОМИ барнома фаъол/хомӯш мекунад — як амал ба ҷои даҳҳо пахш.
 *
 * Чаро як endpoint-и алоҳида лозим шуд: барои пурра пинҳон кардани як забон
 * ДУ ҷойро бояд иваз кард, вагарна барнома дар ҳолати нимкора мемонад:
 *
 *   1. `Language.isActive` — рӯйхати забонҳо дар ОНБОРДИНГ ва интихобкунандаи
 *      забон дар ПРОФИЛ (ҳарду аз /api/mobile/languages/target мегиранд, ки
 *      `where: { isActive: true }` дорад).
 *
 *   2. Ҳамаи `Course.isActive` — худи мазмун. Бе ин, забон аз рӯйхат нопадид
 *      мешавад, вале корбаре ки онро аллакай интихоб кардааст, ҳанӯз дарсҳоро
 *      мебинад.
 *
 * Ҳарду дар ЯК транзаксия иваз мешаванд, то ҳолати нимкора пайдо нашавад.
 *
 * Бебозгашт НЕСТ: ҳеҷ чиз нест намешавад — на дарс, на калима, на прогресси
 * корбар. Ҳамон дархост бо `isActive: true` ҳамаашро бармегардонад. Маҳз
 * барои ҳамин ин ба ҷои DELETE тавсия дода мешавад (ва DELETE барои курси
 * истифодашуда умуман кор намекунад: UserProgress → Lesson ягон onDelete
 * надорад, пас Postgres онро рад мекунад).
 */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = (await req.json()) as { isActive?: boolean };
    if (typeof body.isActive !== 'boolean') {
      return NextResponse.json({ error: 'isActive (boolean) лозим аст' }, { status: 400 });
    }
    const isActive = body.isActive;

    const language = await prisma.language.findUnique({
      where: { id: params.id },
      select: { id: true, name: true, code: true },
    });
    if (!language) {
      return NextResponse.json({ error: 'Забон ёфт нашуд' }, { status: 404 });
    }

    const [, courses] = await prisma.$transaction([
      prisma.language.update({ where: { id: params.id }, data: { isActive } }),
      prisma.course.updateMany({
        where: { targetLanguageId: params.id },
        data: { isActive },
      }),
    ]);

    // Хонандагоне ки ин забонро ҳамчун ҳадаф доранд — барои огоҳии админ.
    const affectedLearners = await prisma.user.count({
      where: { targetLang: language.code },
    });

    return NextResponse.json({
      ok: true,
      language: language.name,
      isActive,
      coursesUpdated: courses.count,
      affectedLearners,
    });
  } catch (err: any) {
    console.error('[admin/languages/visibility]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
