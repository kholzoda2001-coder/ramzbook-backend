import { describe, expect, it } from 'vitest';
import {
  FREE_FREEZE_CAP,
  MAX_FREEZES_HELD,
  PREMIUM_FREEZE_CAP,
  freezeCap,
  needsRefill,
  refilledCount,
} from '../streakFreezes';

describe('сиёсати freeze', () => {
  const tz = 300;

  it('ҳадди Premium аз ройгон зиёд, вале МАҲДУД аст', () => {
    expect(FREE_FREEZE_CAP).toBe(1);
    expect(PREMIUM_FREEZE_CAP).toBe(2);
    // Ҳамин ҷо буд боги асосӣ: пеш ин 999 буд, яъне силсила ҳеҷ гоҳ
    // намешикаст ва 🔥 барои 46 аз 48 Premium бемаъно буд.
    expect(PREMIUM_FREEZE_CAP).toBeLessThan(10);
    expect(freezeCap(true)).toBe(PREMIUM_FREEZE_CAP);
    expect(freezeCap(false)).toBe(FREE_FREEZE_CAP);
  });

  it('харид низ аз ҳамон ҳад намегузарад', () => {
    expect(MAX_FREEZES_HELD).toBe(PREMIUM_FREEZE_CAP);
  });

  describe('пуркунии моҳона', () => {
    const now = new Date('2026-09-09T05:00:00.000Z');

    it('ҳеҷ гоҳ пур нашуда → лозим аст', () => {
      expect(needsRefill({ freezesRefilledAt: null, tzOffsetMin: tz }, now)).toBe(true);
    });

    it('дар ҳамин моҳ пур шуда → лозим НЕСТ', () => {
      expect(needsRefill({ freezesRefilledAt: new Date('2026-09-01T05:00:00.000Z'), tzOffsetMin: tz }, now)).toBe(false);
    });

    it('моҳи гузашта пур шуда → лозим аст', () => {
      expect(needsRefill({ freezesRefilledAt: new Date('2026-08-31T10:00:00.000Z'), tzOffsetMin: tz }, now)).toBe(true);
    });

    it('пуркунӣ рақами мавҷударо КАМ намекунад (хариди корбар нест намешавад)', () => {
      expect(refilledCount(5, false)).toBe(5);
      expect(refilledCount(0, false)).toBe(FREE_FREEZE_CAP);
      expect(refilledCount(0, true)).toBe(PREMIUM_FREEZE_CAP);
      expect(refilledCount(1, true)).toBe(PREMIUM_FREEZE_CAP);
    });
  });
});
