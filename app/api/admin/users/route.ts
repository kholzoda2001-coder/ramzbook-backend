import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        isPremium: true,
        premiumPlan: true,
        totalXp: true,
        streak: true,
        createdAt: true,
        lastActiveAt: true,
      },
    });

    // Map to shape the client expects
    const mapped = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: null,            // Schema has no phone field
      isActive: true,         // Schema has no isActive, assume all active
      isPremium: u.isPremium,
      premiumPlan: u.premiumPlan,
      totalXp: u.totalXp,
      streak: u.streak,
      createdAt: u.createdAt,
      lastActiveAt: u.lastActiveAt,
    }));

    return NextResponse.json(mapped);
  } catch (error: any) {
    console.error('USERS API ERROR:', error?.message);
    return NextResponse.json({ error: error?.message || 'Хатои сервер' }, { status: 500 });
  }
}
