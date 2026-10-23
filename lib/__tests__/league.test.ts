import { describe, expect, it, vi } from 'vitest';

vi.mock('../prisma', () => ({ prisma: {} }));

import { BOARD_SIZE, fillBoard, lessonsForXpGap, secondsUntilWeekEnd, weekEndsAt, weekKeyFor, type RankedRow } from '../league';

const row = (id: string, xp: number, rank: number, total = 12): RankedRow => ({
  id, name: id, avatarUrl: null, level: 'A1', streak: 0, xp, rank, total,
});
const person = (id: string) => ({ id, name: id, avatarUrl: null, level: 'A1', streak: 0 });

/** 23.10.2026: ҷадвали ҳафта ҳамеша 30 нафар — ҷойҳои холӣ бо 0-XP пур мешаванд. */
describe('fillBoard', () => {
  it('12 XP-дор + 0-XP-ҳо → ҳамагӣ 30, ҷойҳо 13…30, XP 0', () => {
    const ranked = Array.from({ length: 12 }, (_, i) => row(`u${i}`, 500 - i * 10, i + 1));
    const fill = Array.from({ length: 40 }, (_, i) => person(`z${i}`));
    const out = fillBoard(ranked, fill);
    expect(out).toHaveLength(BOARD_SIZE);
    expect(out.slice(0, 12).map((r) => r.id)).toEqual(ranked.map((r) => r.id));
    expect(out[12]).toMatchObject({ id: 'z0', rank: 13, xp: 0, total: 12 });
    expect(out[29]).toMatchObject({ rank: 30, xp: 0 });
  });
  it('такрор нест; хонандаи берун аз 30 бетағйир', () => {
    const ranked = [row('a', 90, 1), row('b', 80, 2), row('me', 5, 47)];
    const out = fillBoard(ranked, [person('a'), person('c')]);
    expect(out.map((r) => r.id)).toEqual(['a', 'b', 'c', 'me']);
    expect(out.find((r) => r.id === 'me')?.rank).toBe(47);
  });
  it('корбарони кам — ҳамон қадар, ки ҳаст', () => {
    expect(fillBoard([row('a', 10, 1)], [person('b')])).toHaveLength(2);
  });
});

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
