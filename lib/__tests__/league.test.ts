import { describe, expect, it, vi } from 'vitest';

vi.mock('../prisma', () => ({ prisma: {} }));

import { lessonsForXpGap, secondsUntilWeekEnd, weekEndsAt, weekKeyFor } from '../league';

/** Рейтинги ҳафта (12.10.2026): ҳафта аз ДУШАНБЕ 00:00 UTC (05:00 Душанбе). */
describe('league week', () => {
  it('ҳар рӯзи ҳафта ба душанбеи ҳамон ҳафта меафтад', () => {
    expect(weekKeyFor(new Date('2026-10-12T00:00:00Z'))).toBe('2026-10-12'); // душанбе
    expect(weekKeyFor(new Date('2026-10-14T13:00:00Z'))).toBe('2026-10-12'); // чоршанбе
    expect(weekKeyFor(new Date('2026-10-18T23:59:59Z'))).toBe('2026-10-12'); // якшанбе
    expect(weekKeyFor(new Date('2026-10-11T23:59:59Z'))).toBe('2026-10-05');
  });

  it('душанбе 04:59 вақти Душанбе ҳанӯз ҳафтаи гузашта аст', () => {
    // 04:59 Душанбе = 23:59 UTC-и якшанбе.
    expect(weekKeyFor(new Date('2026-10-11T23:59:00Z'))).toBe('2026-10-05');
  });

  it('анҷоми ҳафта ва шумориш', () => {
    expect(weekEndsAt('2026-10-12').toISOString()).toBe('2026-10-19T00:00:00.000Z');
    expect(secondsUntilWeekEnd('2026-10-12', new Date('2026-10-18T23:00:00Z'))).toBe(3600);
    expect(secondsUntilWeekEnd('2026-10-12', new Date('2026-10-20T00:00:00Z'))).toBe(0);
  });

  it('хатти фарқият: ҳадди ақал 1 дарс, баробар = 0', () => {
    expect(lessonsForXpGap(0, 60)).toBe(0);
    expect(lessonsForXpGap(1, 60)).toBe(1);
    expect(lessonsForXpGap(121, 60)).toBe(3);
  });
});
