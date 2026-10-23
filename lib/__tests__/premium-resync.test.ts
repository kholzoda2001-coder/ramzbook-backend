// 23.10.2026 (ҳисоби kholzoda10): обуна тамом шуд, баъд Google пулро гирифт (account
// hold → recovered), вале Premium барнагашт — танҳо вебхук буд. Ин санҷишҳо роҳи
// эҳтиётиро нигоҳ медоранд: пеш аз downgrade худи Google пурсида мешавад.
import { beforeEach, describe, expect, it, vi } from 'vitest';

type Row = Record<string, unknown>;
let user: Row | null;
let sub: Row | null;
let google: { expiryTimeMillis?: string; autoRenewing?: boolean } | Error;
const userUpdates: Row[] = [];
const subUpdates: Row[] = [];
let googleCalls = 0;

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: async () => user,
      update: async (a: { data: Row }) => {
        userUpdates.push(a.data);
        return a.data;
      },
    },
    subscription: {
      findFirst: async () => sub,
      update: async (a: { data: Row }) => {
        subUpdates.push(a.data);
        return a.data;
      },
    },
    $transaction: async (ops: Promise<unknown>[]) => Promise.all(ops),
  },
}));

vi.mock('@/lib/googlePlay', () => ({
  PACKAGE_NAME: 'com.ramzbook.tj',
  PRODUCT_PLAN: { vip_monthly: 'monthly', ramz_lifetime: 'lifetime' },
  getPublisher: () => ({
    purchases: {
      subscriptions: {
        get: async () => {
          googleCalls++;
          if (google instanceof Error) throw google;
          return { data: google };
        },
      },
    },
  }),
}));

import { checkAndUpdatePremium, googleSubActive } from '@/lib/premium';

const DAY = 86_400_000;
let n = 0;

beforeEach(() => {
  userUpdates.length = 0;
  subUpdates.length = 0;
  googleCalls = 0;
  // ҳар санҷиш корбари нав — throttle-и як-соата халал намерасонад
  n++;
  sub = {
    id: 's1',
    googlePurchaseToken: 'tok',
    googleProductId: 'vip_monthly',
    expiresAt: new Date(Date.now() - 3 * DAY),
  };
});

describe('googleSubActive', () => {
  it('мӯҳлат дар оянда → сана; гузашта/холӣ → null', () => {
    const now = Date.now();
    expect(googleSubActive({ expiryTimeMillis: String(now + DAY) }, now)?.getTime()).toBe(now + DAY);
    expect(googleSubActive({ expiryTimeMillis: String(now - 1) }, now)).toBeNull();
    expect(googleSubActive({}, now)).toBeNull();
  });
});

describe('checkAndUpdatePremium — Google пулро дертар гирифт', () => {
  it('мӯҳлат гузашт, вале Google тамдид кард → Premium мемонад (на downgrade)', async () => {
    const until = Date.now() + 27 * DAY;
    user = { id: `u${n}`, isPremium: true, premiumPlan: 'monthly', premiumExpiresAt: new Date(Date.now() - DAY) };
    google = { expiryTimeMillis: String(until), autoRenewing: true };
    expect(await checkAndUpdatePremium(`u${n}`)).toBe(true);
    expect(userUpdates).toHaveLength(1);
    expect(userUpdates[0]).toMatchObject({ isPremium: true, premiumExpiresAt: new Date(until), hearts: 999 });
    expect(subUpdates[0]).toMatchObject({ status: 'active', expiresAt: new Date(until) });
  });

  it('🔴 аллакай downgrade шуда (isPremium false), Google барқарор кард → Premium бармегардад', async () => {
    user = { id: `u${n}`, isPremium: false, premiumPlan: null, premiumExpiresAt: null };
    google = { expiryTimeMillis: String(Date.now() + 25 * DAY) };
    expect(await checkAndUpdatePremium(`u${n}`)).toBe(true);
    expect(userUpdates[0]).toMatchObject({ isPremium: true, premiumPlan: 'monthly', maxHearts: 999 });
  });

  it('Google ҳам тамом гуфт (hold/бекор) → downgrade, мисли пештар', async () => {
    user = { id: `u${n}`, isPremium: true, premiumPlan: 'monthly', premiumExpiresAt: new Date(Date.now() - DAY) };
    google = { expiryTimeMillis: String(Date.now() - DAY) };
    expect(await checkAndUpdatePremium(`u${n}`)).toBe(false);
    expect(userUpdates[0]).toMatchObject({ isPremium: false, hearts: 5 });
  });

  it('хатои Google → downgrade (на Premium-и бепул), ва дар як соат дубора намепурсад', async () => {
    user = { id: `u${n}`, isPremium: false, premiumPlan: null, premiumExpiresAt: null };
    google = new Error('boom');
    expect(await checkAndUpdatePremium(`u${n}`)).toBe(false);
    expect(await checkAndUpdatePremium(`u${n}`)).toBe(false);
    expect(googleCalls).toBe(1);
  });

  it('обунаи Google нест (промо/админ) → бе дархост ба Google', async () => {
    sub = null;
    user = { id: `u${n}`, isPremium: false, premiumPlan: null, premiumExpiresAt: null };
    expect(await checkAndUpdatePremium(`u${n}`)).toBe(false);
    expect(googleCalls).toBe(0);
  });

  it('Premium-и зинда → Google пурсида намешавад', async () => {
    user = { id: `u${n}`, isPremium: true, premiumPlan: 'monthly', premiumExpiresAt: new Date(Date.now() + DAY) };
    expect(await checkAndUpdatePremium(`u${n}`)).toBe(true);
    expect(googleCalls).toBe(0);
  });
});
