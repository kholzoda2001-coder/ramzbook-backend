import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

/**
 * DELETE /api/users/account
 * Permanently deletes the signed-in user and ALL of their personal data.
 * Required by Google Play (in-app account deletion). Runs in a single
 * transaction so it is all-or-nothing. Public content (courses, words, …) is
 * never touched — only rows that belong to this user.
 */
export async function DELETE(req: Request) {
  try {
    const user = await authenticate(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = user.id;

    await prisma.$transaction([
      // Child rows that reference the user (no DB-level cascade on these).
      prisma.userProgress.deleteMany({ where: { userId } }),
      prisma.userAchievement.deleteMany({ where: { userId } }),
      prisma.userLanguage.deleteMany({ where: { userId } }),
      prisma.dailyXp.deleteMany({ where: { userId } }),
      prisma.dailyTask.deleteMany({ where: { userId } }),
      prisma.gemTransaction.deleteMany({ where: { userId } }),
      prisma.subscription.deleteMany({ where: { userId } }),
      prisma.payment.deleteMany({ where: { userId } }),
      prisma.paymentTransaction.deleteMany({ where: { userId } }),
      prisma.promoRedemption.deleteMany({ where: { userId } }),
      prisma.paywallEvent.deleteMany({ where: { userId } }),
      // refreshTokens and srsCards cascade on user delete, but clear explicitly
      // so the transaction is self-contained and order-independent.
      prisma.refreshToken.deleteMany({ where: { userId } }),
      prisma.srsCard.deleteMany({ where: { userId } }),
      // Finally remove the account itself.
      prisma.user.delete({ where: { id: userId } }),
    ]);

    return NextResponse.json({ ok: true, deleted: true });
  } catch (error: any) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete account' },
      { status: 500 },
    );
  }
}
