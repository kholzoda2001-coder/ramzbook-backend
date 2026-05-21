import { prisma } from './prisma';

export async function checkAndUpdatePremium(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return false;
  
  if (!user.isPremium) return false;
  if (user.premiumPlan === 'lifetime') return true;
  
  // Check expiration
  if (user.premiumExpiresAt && user.premiumExpiresAt < new Date()) {
    // Downgrade
    await prisma.user.update({
      where: { id: userId },
      data: {
        isPremium: false,
        premiumPlan: null,
        premiumExpiresAt: null,
        hearts: 5,
        maxHearts: 5,
        streakFreezesAvailable: 1,
      },
    });
    return false;
  }
  
  return true;
}

export async function activatePremium(
  userId: string,
  plan: 'monthly' | 'yearly' | 'lifetime',
  expiresAt: Date | null,
  purchaseToken: string,
  orderId: string,
  productId: string,
) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      isPremium: true,
      premiumPlan: plan,
      premiumStartedAt: new Date(),
      premiumExpiresAt: expiresAt,
      hearts: 999,
      maxHearts: 999,
      streakFreezesAvailable: 999,
    },
  });
  
  await prisma.subscription.upsert({
    where: { googlePurchaseToken: purchaseToken },
    create: {
      userId,
      plan,
      status: 'active',
      googlePurchaseToken: purchaseToken,
      googleOrderId: orderId,
      googleProductId: productId,
      expiresAt,
    },
    update: {
      status: 'active',
      expiresAt,
    },
  });
}
