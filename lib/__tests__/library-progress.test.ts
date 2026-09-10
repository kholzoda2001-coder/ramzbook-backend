import { describe, expect, it } from 'vitest';
import { isStaleRead, normaliseClientTime } from '../libraryProgress';

/**
 * Қоидаи ҳалли низои ҷои хониш — маҳз ҳамон чиз, ки талаби корбар аст:
 * «дар ягон ҳолат барнома прогресси хонандаро дар китобҳо нест накунад».
 *
 * Роут МАҲЗ ҳамин ду функсияро истифода мебарад (`lib/libraryProgress.ts`) —
 * ин ҷо нусхаи онҳо санҷида намешавад, балки худашон.
 */

describe('ҷои хониш — соати мизоҷ', () => {
  const now = new Date('2026-09-10T10:00:00.000Z');

  it('вақти муқаррарӣ қабул мешавад', () => {
    const t = new Date('2026-09-10T09:30:00.000Z');
    expect(normaliseClientTime(t, now)).toEqual(t);
  });

  it('вақти ОЯНДА рад мешавад — телефони бо соати нодуруст сатрро то абад қулф намекунад', () => {
    const future = new Date('2027-01-01T00:00:00.000Z');
    expect(normaliseClientTime(future, now)).toEqual(now);
  });

  it('вақти вайрон ё холӣ → ҳозира', () => {
    expect(normaliseClientTime(null, now)).toEqual(now);
    expect(normaliseClientTime(new Date('чизи вайрон'), now)).toEqual(now);
  });
});

describe('ҷои хониш — кадом сатр ғолиб меояд', () => {
  const older = new Date('2026-09-09T10:00:00.000Z');
  const newer = new Date('2026-09-10T10:00:00.000Z');

  it('сатри НАВтар менависад', () => {
    expect(isStaleRead(newer, older)).toBe(false);
  });

  it('сатри КӮҲНАТАР рад мешавад — телефони офлайнмонда прогрессро ба ақиб намепартояд', () => {
    expect(isStaleRead(older, newer)).toBe(true);
  });

  it('сатри нав (ҳанӯз чизе нест) ҳамеша менависад', () => {
    expect(isStaleRead(older, null)).toBe(false);
  });

  it('вақти БАРОБАР менависад — такрори ҳамон дастгоҳ зарар надорад', () => {
    expect(isStaleRead(newer, newer)).toBe(false);
  });
});
