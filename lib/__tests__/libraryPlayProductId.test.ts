import { describe, expect, it } from 'vitest';
import { normalizePlayProductId, PLAY_PRODUCT_ID_MAX } from '@/lib/library/shared';

describe('normalizePlayProductId', () => {
  it('холӣ → null (Play пайваст нест)', () => {
    for (const v of [undefined, null, '', '   ']) {
      expect(normalizePlayProductId(v)).toEqual({ ok: true, value: null });
    }
  });

  it('ID-и дуруст нигоҳ дошта мешавад (бо тоза кардани фосилаи канор)', () => {
    expect(normalizePlayProductId(' library_audio_2001 ')).toEqual({
      ok: true,
      value: 'library_audio_2001',
    });
    expect(normalizePlayProductId('a.b_c9')).toEqual({ ok: true, value: 'a.b_c9' });
    expect(normalizePlayProductId('9lib')).toEqual({ ok: true, value: '9lib' });
  });

  it('ҳарфи калон, фосила, тире ва ҳарфи тоҷикӣ рад мешаванд', () => {
    for (const bad of ['Library_1', 'lib 1', 'lib-1', 'китоб', '_lib', '.lib', 'lib$']) {
      expect(normalizePlayProductId(bad).ok, bad).toBe(false);
    }
  });

  it('аз 40 ҳарф дарозтар рад мешавад, дақиқан 40 — не', () => {
    expect(normalizePlayProductId('a'.repeat(PLAY_PRODUCT_ID_MAX)).ok).toBe(true);
    expect(normalizePlayProductId('a'.repeat(PLAY_PRODUCT_ID_MAX + 1)).ok).toBe(false);
  });
});
