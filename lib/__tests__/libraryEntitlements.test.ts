import { describe, expect, it } from 'vitest';
import {
  buildEntitlementsSnapshot,
  type EntitlementsUser,
} from '../libraryEntitlements';

const NOW = new Date('2026-10-18T10:00:00.000Z');
const FUTURE = new Date('2026-11-17T10:00:00.000Z');
const PAST = new Date('2026-10-01T10:00:00.000Z');

const user = (over: Partial<EntitlementsUser> = {}): EntitlementsUser => ({
  isPremium: false,
  premiumPlan: null,
  premiumExpiresAt: null,
  subscriptionEndsAt: null,
  trialEndsAt: null,
  trialUsed: false,
  ...over,
});

const snap = (
  u: EntitlementsUser,
  opts: { premiumNow?: boolean; owned?: string[] } = {},
) =>
  buildEntitlementsSnapshot({
    user: u,
    isPremiumNow: opts.premiumNow ?? false,
    ownedItemIds: opts.owned ?? [],
    now: NOW,
  });

describe('buildEntitlementsSnapshot', () => {
  it('корбари ройгон: ҳама холӣ, serverTime аз `now`', () => {
    expect(snap(user())).toEqual({
      serverTime: '2026-10-18T10:00:00.000Z',
      isPremium: false,
      proPlan: null,
      proExpiresAt: null,
      inTrial: false,
      trialEndsAt: null,
      trialUsed: false,
      ownedItemIds: [],
    });
  });

  it('PRO-и моҳона: нақша ва мӯҳлат', () => {
    const s = snap(
      user({ isPremium: true, premiumPlan: 'monthly', premiumExpiresAt: FUTURE }),
      { premiumNow: true },
    );
    expect(s.isPremium).toBe(true);
    expect(s.proPlan).toBe('monthly');
    expect(s.proExpiresAt).toBe('2026-11-17T10:00:00.000Z');
    expect(s.inTrial).toBe(false);
  });

  it('нақшаи 6-моҳа: «sixmonths» ва номҳои кӯҳна ҳамон мешаванд', () => {
    for (const raw of ['sixmonths', '6_months', 'six_months', 'SIXMONTHS']) {
      const s = snap(
        user({ isPremium: true, premiumPlan: raw, premiumExpiresAt: FUTURE }),
        { premiumNow: true },
      );
      expect(s.proPlan, raw).toBe('sixmonths');
    }
  });

  it('lifetime: мӯҳлат нест (null), ҳатто агар майдон пур бошад', () => {
    const s = snap(
      user({ isPremium: true, premiumPlan: 'lifetime', premiumExpiresAt: FUTURE }),
      { premiumNow: true },
    );
    expect(s.proPlan).toBe('lifetime');
    expect(s.proExpiresAt).toBeNull();
  });

  it('мӯҳлати `premiumExpiresAt` набошад, майдони канонӣ ба кор меояд', () => {
    const s = snap(
      user({ isPremium: true, premiumPlan: 'yearly', subscriptionEndsAt: FUTURE }),
      { premiumNow: true },
    );
    expect(s.proExpiresAt).toBe('2026-11-17T10:00:00.000Z');
  });

  it('мӯҳлат гузашт (checkAndUpdatePremium → false): PRO нест, дар ҳоле ки майдон ҳанӯз true', () => {
    // `user.isPremium` метавонад кӯҳна бошад; ҳақиқат — натиҷаи функсия.
    const s = snap(
      user({ isPremium: true, premiumPlan: 'monthly', premiumExpiresAt: PAST }),
      { premiumNow: false },
    );
    expect(s.isPremium).toBe(false);
    expect(s.proPlan).toBeNull();
    expect(s.proExpiresAt).toBeNull();
  });

  it('озмоиши ҷорӣ: inTrial + trialEndsAt', () => {
    const s = snap(
      user({
        isPremium: true,
        premiumPlan: 'yearly',
        premiumExpiresAt: FUTURE,
        trialEndsAt: FUTURE,
        trialUsed: true,
      }),
      { premiumNow: true },
    );
    expect(s.inTrial).toBe(true);
    expect(s.trialEndsAt).toBe('2026-11-17T10:00:00.000Z');
    expect(s.trialUsed).toBe(true);
  });

  it('озмоиш ТАМОМ шуд: inTrial = false, вале trialUsed = true (нишони «Обуна шудан»)', () => {
    const s = snap(user({ trialEndsAt: PAST, trialUsed: true }));
    expect(s.inTrial).toBe(false);
    expect(s.trialEndsAt).toBeNull();
    expect(s.trialUsed).toBe(true);
  });

  it('роҳи Google Play: танҳо trialEndsAt гузошта мешавад, trialUsed false — бо ҳамин ҳам «истифода шуд»', () => {
    const s = snap(user({ trialEndsAt: PAST, trialUsed: false }));
    expect(s.trialUsed).toBe(true);
  });

  it('озмоиш набуд: trialUsed = false', () => {
    expect(snap(user()).trialUsed).toBe(false);
  });

  it('озмоиши гузашта, вале PRO нест: inTrial нест (обуна бекор шуд)', () => {
    const s = snap(
      user({ isPremium: true, premiumPlan: 'monthly', trialEndsAt: FUTURE }),
      { premiumNow: false },
    );
    expect(s.inTrial).toBe(false);
    expect(s.trialEndsAt).toBeNull();
  });

  it('ownedItemIds: беихтилоф, бе такрор, бо тартиби устувор', () => {
    const s = snap(user(), { owned: ['c', 'a', 'b', 'a'] });
    expect(s.ownedItemIds).toEqual(['a', 'b', 'c']);
  });

  it('Set низ мешавад', () => {
    const s = buildEntitlementsSnapshot({
      user: user(),
      isPremiumNow: false,
      ownedItemIds: new Set(['z', 'y']),
      now: NOW,
    });
    expect(s.ownedItemIds).toEqual(['y', 'z']);
  });

  it('хариди воҳид аз обуна МУСТАҚИЛ: PRO тамом шуд, воҳидҳо мемонанд', () => {
    const s = snap(user({ premiumExpiresAt: PAST }), {
      premiumNow: false,
      owned: ['book-1', 'audio-9'],
    });
    expect(s.isPremium).toBe(false);
    expect(s.ownedItemIds).toEqual(['audio-9', 'book-1']);
  });

  it('нарх ва маълумоти пардохт дар тасвир НЕСТ', () => {
    const s = snap(
      user({ isPremium: true, premiumPlan: 'yearly', premiumExpiresAt: FUTURE }),
      { premiumNow: true, owned: ['x'] },
    );
    const json = JSON.stringify(s);
    for (const bad of ['price', 'Price', 'amount', 'currency', 'token', 'orderId']) {
      expect(json).not.toContain(bad);
    }
  });
});
