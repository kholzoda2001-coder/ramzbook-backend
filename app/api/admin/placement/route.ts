import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeCefrLevel } from '@/lib/cefr';

export const dynamic = 'force-dynamic';

/** Allowed placement skill tags (language-agnostic). */
const PLACEMENT_SKILLS = ['overall', 'reading', 'writing', 'listening', 'speaking', 'grammar', 'vocab'];
function normSkill(s: unknown): string {
  return typeof s === 'string' && PLACEMENT_SKILLS.includes(s) ? s : 'overall';
}

/** Coerce a raw value into a clean string[] of options. */
function normOptions(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((o) => (typeof o === 'string' ? o.trim() : String(o ?? '').trim())).filter((o) => o.length > 0);
}

/**
 * GET /api/admin/placement?targetLanguageId=X&nativeLanguageId=Y
 * Lists placement questions for a language pair (or all if no filter). Includes
 * the correct answer — this is the admin view, unlike the mobile endpoint.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const targetLanguageId = searchParams.get('targetLanguageId') || undefined;
    const nativeLanguageId = searchParams.get('nativeLanguageId') || undefined;

    const questions = await prisma.placementQuestion.findMany({
      where: { targetLanguageId, nativeLanguageId },
      orderBy: [{ cefrLevel: 'asc' }, { order: 'asc' }],
      include: {
        targetLanguage: { select: { flag: true, name: true } },
        nativeLanguage: { select: { flag: true, nativeName: true } },
      },
    });
    return NextResponse.json({ questions });
  } catch (err: any) {
    console.error('[admin/placement GET]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/placement
 * Body: { targetLanguageId, nativeLanguageId, cefrLevel, skill, prompt,
 *         promptTranslated?, options[], answer, explanation?, audioUrl?, order? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const level = normalizeCefrLevel(body.cefrLevel);
    const prompt = (body.prompt ?? '').trim();
    const options = normOptions(body.options);
    const answer = (body.answer ?? '').trim();

    if (!body.targetLanguageId || !body.nativeLanguageId || !level || !prompt) {
      return NextResponse.json(
        { error: 'targetLanguageId, nativeLanguageId, valid cefrLevel and prompt are required' },
        { status: 400 },
      );
    }
    if (options.length < 2) {
      return NextResponse.json({ error: 'At least 2 options are required' }, { status: 400 });
    }
    if (!answer || !options.includes(answer)) {
      return NextResponse.json({ error: 'answer must be one of the options' }, { status: 400 });
    }

    const question = await prisma.placementQuestion.create({
      data: {
        targetLanguageId: body.targetLanguageId,
        nativeLanguageId: body.nativeLanguageId,
        cefrLevel: level,
        skill: normSkill(body.skill),
        prompt,
        promptTranslated: (body.promptTranslated ?? '').trim() || null,
        options,
        answer,
        explanation: (body.explanation ?? '').trim() || null,
        audioUrl: (body.audioUrl ?? '').trim() || null,
        order: typeof body.order === 'number' ? body.order : 0,
        isActive: body.isActive !== undefined ? !!body.isActive : true,
      },
    });
    return NextResponse.json({ success: true, question });
  } catch (err: any) {
    console.error('[admin/placement POST]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
