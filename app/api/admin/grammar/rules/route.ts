import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/** POST /api/admin/grammar/rules — add a rule to a topic.
 *  Body: { topicId, pattern, note?, order? } */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { topicId?: string; pattern?: string; note?: string; order?: number };
    const pattern = (body.pattern ?? '').trim();
    if (!body.topicId || !pattern) {
      return NextResponse.json({ error: 'topicId and pattern are required' }, { status: 400 });
    }
    const order = body.order ?? (await prisma.grammarRule.count({ where: { topicId: body.topicId } }));
    const rule = await prisma.grammarRule.create({
      data: { topicId: body.topicId, pattern, note: body.note?.trim() || null, order },
    });
    return NextResponse.json({ success: true, rule });
  } catch (err: any) {
    console.error('[admin/grammar/rules POST]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
