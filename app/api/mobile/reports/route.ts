import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { moduleIdForLesson } from '@/lib/contentVersion';

export const dynamic = 'force-dynamic';

/** Ҳадди рӯзонаи гузоришҳо аз як корбар. */
const MAX_REPORTS_PER_DAY = 10;

const REASONS = new Set(['wrong_translation', 'spelling', 'unnatural', 'other']);

/**
 * POST /api/mobile/reports
 *
 * Body: { lessonId, contentId, exerciseType, field, value, reason,
 *         suggestion?, moduleId?, uiLanguage?, course?, appVersion? }
 *
 * ДУ МУҲОФИЗ:
 *
 * 1. Лимити рӯзона (10) — гузориш «5 алмос» медиҳад, пас бе лимит он ба
 *    фермаи алмос табдил меёфт.
 *
 * 2. Такрор аз ҲАМОН корбар барои ҳамон `contentId + field`, то он ки ҳолат
 *    ҳанӯз `new` аст, рад мешавад (409). Ҳамон корбар набояд як хаторо ду бор
 *    «фурӯшад». Вале агар гузориши пешина аллакай `fixed`/`rejected` бошад,
 *    гузориши нав ИҶОЗАТ дода мешавад — мазмун метавонад дубора вайрон шавад.
 *
 * ⚠️ Санҷиши такрор дар код аст, на дар индекси уникалӣ: шарти он ба ҲОЛАТ
 * баста аст (`status = 'new'`), ва индекси уникалии қисман дар Prisma эълон
 * намешавад. Дар ин миқёс (гузоришҳои дастии одам) пойга воқеӣ нест; агар
 * шавад, дуюмаш танҳо як сатри изофӣ месозад, ки панел ба ҳар ҳол дар як
 * гурӯҳ ҷамъ мекунад.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await authenticate(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const lessonId = String(body?.lessonId ?? '').trim();
    const contentId = String(body?.contentId ?? '').trim();
    const field = String(body?.field ?? '').trim();
    const reason = String(body?.reason ?? '').trim();
    const value = String(body?.value ?? '');
    const exerciseType = String(body?.exerciseType ?? '').trim() || 'unknown';

    if (!lessonId || !contentId || !field) {
      return NextResponse.json(
        { error: 'lessonId, contentId and field are required' },
        { status: 400 },
      );
    }
    if (!REASONS.has(reason)) {
      return NextResponse.json({ error: 'unknown reason' }, { status: 400 });
    }

    // ── Лимити рӯзона ──────────────────────────────────────────────────────
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const todayCount = await prisma.contentReport.count({
      where: { userId: user.id, createdAt: { gte: since } },
    });
    if (todayCount >= MAX_REPORTS_PER_DAY) {
      return NextResponse.json(
        { error: 'daily-limit', limit: MAX_REPORTS_PER_DAY },
        { status: 429 },
      );
    }

    // ── Такрор ─────────────────────────────────────────────────────────────
    const existing = await prisma.contentReport.findFirst({
      where: { userId: user.id, contentId, field, status: 'new' },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'duplicate', reportId: existing.id },
        { status: 409 },
      );
    }

    const moduleId =
      (body?.moduleId ? String(body.moduleId).trim() : '') ||
      (await moduleIdForLesson(lessonId));

    const report = await prisma.contentReport.create({
      data: {
        userId: user.id,
        lessonId,
        moduleId: moduleId || null,
        contentId,
        exerciseType,
        field,
        // Қимат метавонад матни дароз бошад (ҷумлаи мисол) — маҳдуд мекунем,
        // то як гузориши вайрон сатрро варам накунад.
        value: value.slice(0, 2000),
        reason,
        suggestion: body?.suggestion ? String(body.suggestion).slice(0, 2000) : null,
        uiLanguage: body?.uiLanguage ? String(body.uiLanguage).slice(0, 12) : null,
        course: body?.course ? String(body.course).slice(0, 32) : null,
        appVersion: body?.appVersion ? String(body.appVersion).slice(0, 32) : null,
      },
      select: { id: true, createdAt: true },
    });

    return NextResponse.json({ success: true, report });
  } catch (err: any) {
    console.error('[mobile/reports POST]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
