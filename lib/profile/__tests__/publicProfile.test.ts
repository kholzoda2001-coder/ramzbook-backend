import { describe, expect, it } from 'vitest';
import {
  WEEK_DAYS,
  coursePercent,
  dayKey,
  presence,
  publicName,
  weekStrip,
} from '../publicProfile';

const d = (s: string) => new Date(`${s}T00:00:00.000Z`);

describe('publicName', () => {
  it('танҳо ҷузъи аввалро мемонад', () => {
    expect(publicName('Izatullo Kholzoda')).toBe('Izatullo');
    expect(publicName('anna.petrova')).toBe('Anna');
    expect(publicName('jean-luc')).toBe('Jean');
  });

  it('почтаро НАМЕГУЗАРОНАД', () => {
    // Ҳимояи асосӣ: ном майдони озод аст ва бисёр корбарон почта менависанд.
    expect(publicName('kholzoda2001@gmail.com')).toBe('Kholzoda2001');
    expect(publicName('kholzoda2001@gmail.com')).not.toContain('@');
  });

  it('номи холӣ ба сатри холӣ табдил мешавад', () => {
    expect(publicName('')).toBe('');
    expect(publicName('   ')).toBe('');
    expect(publicName(null)).toBe('');
    expect(publicName(undefined)).toBe('');
  });

  it('идемпотент аст — барнома онро бори дуюм гузаронда метавонад', () => {
    const once = publicName('Izatullo Kholzoda');
    expect(publicName(once)).toBe(once);
  });
});

describe('weekStrip', () => {
  const today = d('2026-09-07');

  it('ҳамеша 7 рӯз медиҳад', () => {
    expect(weekStrip([], today)).toHaveLength(WEEK_DAYS);
  });

  it('рӯзи БЕ фаъолият сифр мешавад, на нест', () => {
    // Агар мо сатрҳои холиро мепартофтем, навор кӯтоҳ мешуд ва рӯзи
    // корнакарда ба назар намерасид.
    const w = weekStrip([{ date: d('2026-09-05'), xp: 120 }], today);
    expect(w.map((x) => x.xp)).toEqual([0, 0, 0, 0, 120, 0, 0]);
  });

  it('рӯзи охирин ҳамеша имрӯз аст', () => {
    const w = weekStrip([], today);
    expect(w[w.length - 1].date).toBe('2026-09-07');
    expect(w[0].date).toBe('2026-09-01');
  });

  it('тартиб аз кӯҳна ба нав аст', () => {
    const w = weekStrip([], today);
    const sorted = [...w].sort((a, b) => a.date.localeCompare(b.date));
    expect(w).toEqual(sorted);
  });

  it('рӯзи берун аз ҳафта ба навор намеояд', () => {
    const w = weekStrip(
      [
        { date: d('2026-08-20'), xp: 999 },
        { date: d('2026-09-07'), xp: 40 },
      ],
      today,
    );
    expect(w.some((x) => x.xp === 999)).toBe(false);
    expect(w[w.length - 1].xp).toBe(40);
  });

  it('аз болои марзи моҳ дуруст мегузарад', () => {
    const w = weekStrip([], d('2026-03-02'));
    expect(w[0].date).toBe('2026-02-24');
    expect(w[w.length - 1].date).toBe('2026-03-02');
  });
});

describe('coursePercent', () => {
  it('ҳисоби оддӣ', () => {
    expect(coursePercent(31, 50)).toBe(62);
    expect(coursePercent(0, 50)).toBe(0);
    expect(coursePercent(50, 50)).toBe(100);
  });

  it('курси ХОЛӢ `NaN` намедиҳад', () => {
    expect(coursePercent(0, 0)).toBe(0);
    expect(coursePercent(5, 0)).toBe(0);
  });

  it('ҳеҷ гоҳ аз 100 намегузарад', () => {
    // Дарси нофаъол шуда метавонад: шумораи хатмшуда аз ҳозира зиёд шавад.
    expect(coursePercent(60, 50)).toBe(100);
  });
});

describe('presence', () => {
  const now = d('2026-09-07');

  it('имрӯз хондааст', () => {
    expect(presence(new Date('2026-09-07T23:10:00Z'), now)).toBe('today');
  });

  it('дар ҳафтаи охир', () => {
    expect(presence(d('2026-09-06'), now)).toBe('week');
    expect(presence(d('2026-09-01'), now)).toBe('week');
  });

  it('кӯҳнатар аз ҳафта', () => {
    expect(presence(d('2026-08-31'), now)).toBe('away');
  });

  it('ҳеҷ гоҳ нахондааст', () => {
    expect(presence(null, now)).toBe('away');
    expect(presence(undefined, now)).toBe('away');
  });
});

describe('dayKey', () => {
  it('вақти рӯзро намебарад', () => {
    expect(dayKey(new Date('2026-09-07T18:45:00Z'))).toBe('2026-09-07');
  });
});
