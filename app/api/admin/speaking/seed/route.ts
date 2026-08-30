import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import food from '@/content/speaking/ordering_food_en_tg.json';
import meeting from '@/content/speaking/meeting_people_en_tg.json';
import shopping from '@/content/speaking/shopping_en_tg.json';
import directions from '@/content/speaking/directions_en_tg.json';
import travel from '@/content/speaking/travel_en_tg.json';
import hotel from '@/content/speaking/hotel_en_tg.json';
import family from '@/content/speaking/family_people_en_tg.json';

/** Ҳамаи бастаҳо. Илова кардани боби нав = як сатр дар ин рӯйхат. */
const PACKS = [food, meeting, shopping, directions, travel, hotel, family];

export const dynamic = 'force-dynamic';

/**
 * Мазмуни ТАЙЁРи спикингро ба база мегузорад.
 *
 * Чаро ин роҳ ҳаст: базаи Neon аз ҳар мошин дастрас нест (порти 5432 баста),
 * пас скрипти `scripts/seed_speaking_en_tg.cjs` ҳамеша кор карда
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
 * `?slug=hotel_en_tg` танҳо як бобро мегузорад; бе он ҲАМА бобҳо.
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

type Pack = (typeof PACKS)[number];

async function apply(pack: Pack) {
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

/** Кадом бастаҳо кор карда шаванд — ҳама ё яктояш. */
function pick(slug: string | null): Pack[] {
  if (!slug) return PACKS;
  const one = PACKS.find((p) => p.slug === slug);
  return one ? [one] : [];
}

/** Бастаҳоро ПАЙ ДАР ПАЙ мегузорад — Neon пайвасти маҳдуд дорад. */
async function applyAll(packs: Pack[]) {
  const results = [];
  for (const p of packs) results.push(await apply(p));
  return {
    packs: results.length,
    totalItems: results.reduce((n, r) => n + r.totalItems, 0),
    chapters: results,
  };
}

export async function GET(req: NextRequest) {
  try {
    const slug = req.nextUrl.searchParams.get('slug');
    const chosen = pick(slug);
    if (chosen.length === 0) {
      return NextResponse.json(
        { error: `No content pack with slug "${slug}".` },
        { status: 404 },
      );
    }

    if (req.nextUrl.searchParams.get('apply') === '1') {
      return NextResponse.json({ ok: true, ...(await applyAll(chosen)) });
    }

    // Пешнамоиш — ҳеҷ чиз навишта намешавад.
    return NextResponse.json({
      preview: true,
      hint: 'Барои сабт: ?apply=1 (ё ?slug=…&apply=1 барои як боб)',
      packs: chosen.map((p) => ({
        slug: p.slug,
        pair: `${p.targetLanguage} → ${p.nativeLanguage}`,
        category: `${p.category.emoji} ${p.category.titleTranslated}`,
        lessons: p.lessons.map((l) => ({
          number: l.order + 1,
          title: l.title,
          words: l.items.filter((i) => i.kind === 'word').length,
          sentences: l.items.filter((i) => i.kind !== 'word').length,
        })),
        totalItems: p.lessons.reduce((n, l) => n + l.items.length, 0),
      })),
    });
  } catch (err: unknown) {
    console.error('[admin/speaking/seed GET]', err);
    const message = err instanceof Error ? err.message : 'Seed failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const chosen = pick(req.nextUrl.searchParams.get('slug'));
    if (chosen.length === 0) {
      return NextResponse.json({ error: 'Unknown slug.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, ...(await applyAll(chosen)) });
  } catch (err: unknown) {
    console.error('[admin/speaking/seed POST]', err);
    const message = err instanceof Error ? err.message : 'Seed failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
