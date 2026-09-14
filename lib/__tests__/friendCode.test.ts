import { describe, it, expect } from 'vitest';
import {
  FRIEND_CODE_ALPHABET,
  FRIEND_INVITE_GEMS,
  FRIEND_MESSAGES,
  PERSONAL_CODE_EXPIRES_AT,
  friendRedeemError,
  isPersonalCode,
  normalizeFriendCode,
} from '@/lib/friendCode';

/**
 * «Даъвати дӯст» (2026-09-14): дар база 40 рамз, 0 истифода. Ин файл қоидаҳои
 * рамзи ДОИМӢ ва ворид кардани онро қулф мекунад.
 */

const NOW = new Date('2026-09-14T12:00:00.000Z');
const personal = { creatorUserId: 'owner', expiresAt: PERSONAL_CODE_EXPIRES_AT, consumedAt: null };

describe('normalizeFriendCode', () => {
  it('ҳарфи хурд, фосила ва аломатро мепартояд', () => {
    expect(normalizeFriendCode(' pzu-edp ')).toBe('PZUEDP');
    expect(normalizeFriendCode('p z u e d p')).toBe('PZUEDP');
    expect(normalizeFriendCode(undefined)).toBe('');
    expect(normalizeFriendCode(null)).toBe('');
  });
});

describe('isPersonalCode', () => {
  it('рамзи абадии истифоданашуда — шахсӣ', () => {
    expect(isPersonalCode(personal)).toBe(true);
  });
  it('даъвати кӯҳнаи 24-соата — шахсӣ НЕСТ', () => {
    expect(isPersonalCode({ expiresAt: new Date('2026-09-15T00:00:00Z'), consumedAt: null })).toBe(false);
  });
  it('сатри дӯстӣ (истифодашуда) — шахсӣ НЕСТ', () => {
    expect(isPersonalCode({ expiresAt: PERSONAL_CODE_EXPIRES_AT, consumedAt: NOW })).toBe(false);
  });
});

describe('friendRedeemError', () => {
  const base = { code: 'PZUEDP', userId: 'friend', invite: personal, alreadyFriends: false, now: NOW };

  it('рамзи шахсии дигарон — қабул', () => {
    expect(friendRedeemError(base)).toBeNull();
  });

  it('рамзи шахсӣ НАМЕСӮЗАД ва БОРҲО кор мекунад', () => {
    const farFuture = new Date('2090-01-01T00:00:00Z');
    expect(friendRedeemError({ ...base, now: farFuture })).toBeNull();
    expect(friendRedeemError({ ...base, userId: 'another-friend' })).toBeNull();
  });

  it('холӣ / нодуруст / худам / аллакай дӯст', () => {
    expect(friendRedeemError({ ...base, code: '' })).toBe(FRIEND_MESSAGES.empty);
    expect(friendRedeemError({ ...base, invite: null })).toBe(FRIEND_MESSAGES.invalid);
    expect(friendRedeemError({ ...base, userId: 'owner' })).toBe(FRIEND_MESSAGES.self);
    expect(friendRedeemError({ ...base, alreadyFriends: true })).toBe(FRIEND_MESSAGES.alreadyFriends);
  });

  it('сатри дӯстӣ ҳамчун рамз — «истифода шудааст»', () => {
    expect(friendRedeemError({ ...base, invite: { ...personal, consumedAt: NOW } })).toBe(FRIEND_MESSAGES.used);
  });

  it('даъвати кӯҳнаи 24-соата то анҷоми мӯҳлат кор мекунад, баъд — «мӯҳлат тамом»', () => {
    const legacy = { creatorUserId: 'owner', expiresAt: new Date('2026-09-15T00:00:00Z'), consumedAt: null };
    expect(friendRedeemError({ ...base, invite: legacy })).toBeNull();
    expect(friendRedeemError({ ...base, invite: legacy, now: new Date('2026-09-16T00:00:00Z') })).toBe(
      FRIEND_MESSAGES.expired,
    );
  });

  it('худам пеш аз «аллакай дӯст» санҷида мешавад', () => {
    expect(friendRedeemError({ ...base, userId: 'owner', alreadyFriends: true })).toBe(FRIEND_MESSAGES.self);
  });
});

describe('константаҳо', () => {
  it('100 алмос ва алифбои бе 0/O/1/I/L', () => {
    expect(FRIEND_INVITE_GEMS).toBe(100);
    expect(FRIEND_CODE_ALPHABET).not.toMatch(/[01OIL]/);
  });
});
