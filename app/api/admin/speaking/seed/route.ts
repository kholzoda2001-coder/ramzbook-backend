import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import pack from '@/content/speaking/ordering_food_en_tg.json';

export const dynamic = 'force-dynamic';

/**
 * Мазмуни ТАЙЁРи спикингро ба база мегузорад.
 *
 * Чаро ин роҳ ҳаст: базаи Neon аз ҳар мошин дастрас нест (порти 5432 баста),
 * пас скрипти `scripts/seed_speaking_food_en_tg.cjs` ҳамеша кор карда
 * наметавонад. Ин роҳ дар сервери Vercel иҷро мешавад — он ҳамеша ба база
 * мерасад. Мазмун ҲАМОН файли JSON аст, ки скрипт мехонад.
 *
 * Ҳимоя: `middleware.ts` тамоми `/api/admin/*`-ро бо кукии `admin_token`
 * мебандад — яъне танҳо админи воридшуда даъват карда метавонад.
 *
 *   GET  /api/admin/speaking/seed            → пешнамоиш, ҳеҷ чиз навишта намешавад
 *   GET  /api/admin/speaking/seed?apply=1    → менависад (аз браузер қулай)
 *   POST /api/admin/speaking/seed            → менависад
 *
 * ИДЕМПОТЕНТ: боб аз рӯи унвон, дарс аз рӯи `order` ёфта мешавад ва id-ашон
 * НИГОҲ ДОШТА мешавад — яъне `SpeakingProgress`-и корбарон намесӯзад;
 * танҳо воҳидҳо аз нав навишта мешаванд.
 */

type Item = {
  order: number;
  kind: string;
  text: string;
  translation: string;
  literal: string | null;
  note: string | null;
  cue: string | null;
  cueTranslation: string | null;
};

async function apply() {
  const target = await prisma.language.findUnique({
    where: { code: pack.targetLanguage },
    select: { id: true },
  });
  const native = await prisma.language.findUnique({
    where: { code: pack.nativeLanguage },
    select: { id: true },
  });

  if (!target || !native) {
    throw new Error(
      `Забон ёфт нашуд: ${pack.targetLanguage} → ${pack.nativeLanguage}.`,
    );
  }

  const existing = await prisma.speakingCategory.findFirst({
    where: {
      targetLanguageId: target.id,
      nativeLanguageId: native.id,
      title: pack.category.title,
    },
    select: { id: true },
  });

  const category = existing
    ? await prisma.speakingCategory.update({
        where: { id: existing.id },
        data: pack.category,
      })
    : await prisma.speakingCategory.create({
        data: {
          ...pack.category,
          targetLanguageId: target.id,
          nativeLanguageId: native.id,
        },
      });

  for (const spec of pack.lessons) {
    const found = await prisma.speakingLesson.findFirst({
      where: { categoryId: category.id, order: spec.order },
      select: { id: true },
    });

    const lesson = found
      ? await prisma.speakingLesson.update({
          where: { id: found.id },
          data: { title: spec.title, isActive: true },
        })
      : await prisma.speakingLesson.create({
          data: {
            categoryId: category.id,
            title: spec.title,
            order: spec.order,
            isActive: true,
          },
        });

    if (found) {
      await prisma.speakingItem.deleteMany({ where: { lessonId: lesson.id } });
    }

    await prisma.speakingItem.createMany({
      data: (spec.items as Item[]).map((it) => ({ ...it, lessonId: lesson.id })),
    });
  }

  const stored = await prisma.speakingLesson.findMany({
    where: { categoryId: category.id },
    orderBy: { order: 'asc' },
    select: { title: true, order: true, _count: { select: { items: true } } },
  });

  return {
    created: !existing,
    categoryId: category.id,
    category: `${category.emoji} ${category.titleTranslated}`,
    lessons: stored.map((l) => ({
      number: l.order + 1,
      title: l.title,
      items: l._count.items,
    })),
    totalItems: stored.reduce((n, l) => n + l._count.items, 0),
  };
}

export async function GET(req: NextRequest) {
  try {
    if (req.nextUrl.searchParams.get('apply') === '1') {
      return NextResponse.json({ ok: true, ...(await apply()) });
    }

    // Пешнамоиш — ҳеҷ чиз навишта намешавад.
    return NextResponse.json({
      preview: true,
      hint: 'Барои сабт: ?apply=1',
      slug: pack.slug,
      pair: `${pack.targetLanguage} → ${pack.nativeLanguage}`,
      category: `${pack.category.emoji} ${pack.category.titleTranslated}`,
      lessons: pack.lessons.map((l) => ({
        number: l.order + 1,
        title: l.title,
        words: l.items.filter((i) => i.kind === 'word').length,
        sentences: l.items.filter((i) => i.kind !== 'word').length,
      })),
      totalItems: pack.lessons.reduce((n, l) => n + l.items.length, 0),
    });
  } catch (err: unknown) {
    console.error('[admin/speaking/seed GET]', err);
    const message = err instanceof Error ? err.message : 'Seed failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST() {
  try {
    return NextResponse.json({ ok: true, ...(await apply()) });
  } catch (err: unknown) {
    console.error('[admin/speaking/seed POST]', err);
    const message = err instanceof Error ? err.message : 'Seed failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
