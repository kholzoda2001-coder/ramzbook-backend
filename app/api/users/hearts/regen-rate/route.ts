import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import { setRegenRate } from '@/lib/hearts';

/**
 * POST /api/users/hearts/regen-rate
 * Body: { level: string, moduleIndex: number }
 *
 * Барномаи мобилӣ ҳангоми кушодани дарс инро даъват мекунад — суръати
 * барқароршавии дил вобаста ба сатҳ+модул муайян ва сабт мешавад (сервер аз
 * рӯи level+moduleIndex ҳисоб мекунад, на аз рақами омада — зидди қаллобӣ).
 */
export async function POST(req: Request) {
  try {
    const user = await authenticate(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const level = (body?.level ?? 'a1').toString();
    const moduleIndex = Number(body?.moduleIndex ?? 0);

    const result = await setRegenRate(user.id, level, moduleIndex);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Regen rate error:', error);
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 400 });
  }
}
