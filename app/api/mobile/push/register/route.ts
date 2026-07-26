import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/mobile/push/register
 * Body: { token: string, platform?: 'android' | 'ios' }
 *
 * Барномаи мобилӣ баъди гирифтани FCM token инро даъват мекунад. Token-ро
 * ба корбари ҷорӣ пайваст мекунем (upsert — агар token аллакай бошад, соҳибашро
 * нав мекунем: як дастгоҳ метавонад аз аккаунт ба аккаунт гузарад).
 */
export async function POST(req: Request) {
  try {
    const user = await authenticate(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const token = (body?.token ?? '').toString().trim();
    const platform = body?.platform === 'ios' ? 'ios' : 'android';
    if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 });

    await prisma.deviceToken.upsert({
      where: { token },
      create: { token, platform, userId: user.id },
      update: { userId: user.id, platform },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Push register error:', error);
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 400 });
  }
}
