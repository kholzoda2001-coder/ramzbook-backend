import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  generateSteps,
  toWire,
  toEngineItem,
  DEFAULT_CONFIG,
  ENGINE_VERSION,
} from '@/lib/speaking/engine';
import { validateLessonById } from '@/lib/speaking/validateDb';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/speaking/preview?lessonId=<id>[&ev=1]
 * → { engineVersion, config, steps, issues }
 *
 * ЧАРО ин муҳимтарин қисми админ аст: то ин ҷо ягона роҳи дидани он, ки
 * хонанда ВОҚЕАН чиро мебинад, нашр кардан ва телефонро кушодан буд.
 * Акнун ҳамон `generateSteps` ва ҳамон `validateLesson`, ки барнома
 * истифода мебарад, пеш аз нашр дар браузер иҷро мешаванд.
 *
 * ⚠️ Ҳамон муҳаррик, на нусхаи он. Агар ин ҷо коди ҷудо мебуд,
 * пешнамоиш ва воқеият бешубҳа аз ҳам дур мешуданд.
 */
export async function GET(req: NextRequest) {
  try {
    const lessonId = req.nextUrl.searchParams.get('lessonId')?.trim();
    if (!lessonId) {
      return NextResponse.json({ error: 'lessonId is required' }, { status: 400 });
    }

    // `ev` — барои дидани он, ки клиенти КӮҲНА чиро мегирад (§10.2).
    const ev = Number(req.nextUrl.searchParams.get('ev') ?? '1') || 1;

    const lesson = await prisma.speakingLesson.findUnique({
      where: { id: lessonId },
      select: {
        id: true,
        title: true,
        order: true,
        category: { select: { title: true, titleTranslated: true, emoji: true } },
        items: {
          orderBy: { order: 'asc' },
          select: {
            id: true, kind: true, text: true, translation: true, literal: true,
            note: true, audioUrl: true, cue: true, cueTranslation: true,
            chainOverride: true, swaps: true, wordCount: true,
          },
        },
      },
    });
    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // Ҳамон филтри роути хонанда: воҳиди бе матн машқ дода наметавонад.
    const usable = lesson.items.filter((i) => i.text.trim() && i.translation.trim());

    const steps = generateSteps(
      usable.map((i) => ({
        ...toEngineItem(i),
        chainOverride: i.chainOverride,
        swaps: i.swaps,
      })),
      DEFAULT_CONFIG,
      { repeat: false },
    );

    const issues = await validateLessonById(lessonId);

    return NextResponse.json({
      engineVersion: ENGINE_VERSION,
      config: DEFAULT_CONFIG,
      lesson: {
        id: lesson.id,
        title: lesson.title,
        number: lesson.order + 1,
        category: lesson.category,
        items: lesson.items.length,
        usable: usable.length,
      },
      steps: steps.map((s) => ({
        // Барои админ ҳам шакли сим ва ҳам маълумоти дохилӣ лозим аст.
        ...toWire(s, ev),
        _stepId: s.stepId,
        _showSlots: s.showSlots,
        _timerMs: s.timerMs,
      })),
      issues,
    });
  } catch (err: any) {
    console.error('[admin/speaking/preview]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
