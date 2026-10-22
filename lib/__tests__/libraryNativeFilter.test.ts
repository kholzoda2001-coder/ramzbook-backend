import { describe, expect, it } from 'vitest';
import { resolveNativeFilter } from '@/lib/library/shared';

describe('resolveNativeFilter', () => {
  it('prefers the app-sent ?native over the stored account language', () => {
    expect(resolveNativeFilter('ru', 'tg')).toBe('ru');
  });
  it('falls back to the account language', () => {
    expect(resolveNativeFilter(null, 'tg')).toBe('tg');
    expect(resolveNativeFilter('', 'TG ')).toBe('tg');
  });
  it('works for guests who only send ?native', () => {
    expect(resolveNativeFilter('Tg', undefined)).toBe('tg');
  });
  it('no language at all means no filter', () => {
    expect(resolveNativeFilter(null, null)).toBe('');
    expect(resolveNativeFilter(undefined, '')).toBe('');
  });
  it('ignores garbage instead of filtering everything away', () => {
    expect(resolveNativeFilter("tg' OR 1=1", 'ru')).toBe('ru');
    expect(resolveNativeFilter('x', null)).toBe('');
  });
});
