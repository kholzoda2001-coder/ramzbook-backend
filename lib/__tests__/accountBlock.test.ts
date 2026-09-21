/**
 * Манъи ҳисоб — қоидаи «набудани майдон = ФАЪОЛ».
 */
import { describe, it, expect } from 'vitest';
import { isBlocked, BLOCKED_ERROR } from '../accountBlock';

describe('isBlocked', () => {
  it('танҳо `false`-и АНИҚ манъ аст', () => {
    expect(isBlocked({ isActive: false })).toBe(true);
    expect(isBlocked({ isActive: true })).toBe(false);
  });
  it('набудан/холӣ будан корбарро НАМЕБАНДАД', () => {
    // Бе ин қоида як `select`-и фаромӯшшуда тамоми вурудро мекушт.
    expect(isBlocked({})).toBe(false);
    expect(isBlocked({ isActive: null })).toBe(false);
    expect(isBlocked(null)).toBe(false);
    expect(isBlocked(undefined)).toBe(false);
  });
  it('паём ба хонанда тоҷикӣ аст', () => {
    expect(BLOCKED_ERROR).toContain('манъ');
  });
});
