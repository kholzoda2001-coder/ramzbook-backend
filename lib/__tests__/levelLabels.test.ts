import { describe, expect, it } from 'vitest';
import { cleanLevelLabels, levelLabel, MAX_LABEL_LEN } from '../levelLabels';

describe('levelLabels', () => {
  it('танҳо кодҳои маълум, бе холӣ ва бе такрори худи код', () => {
    expect(
      cleanLevelLabels({ A1: ' TOPIK  I ', a2: 'TOPIK II', B1: '', X9: 'bad', C1: 5, B2: 'B2' }),
    ).toEqual({ A1: 'TOPIK I', A2: 'TOPIK II' });
  });

  it('вуруди нодуруст → {} (ҳама пешфарз)', () => {
    for (const v of [null, undefined, 'A1', 5, [], ['A1']]) expect(cleanLevelLabels(v)).toEqual({});
  });

  it('дарозӣ маҳдуд аст', () => {
    expect(cleanLevelLabels({ A1: 'x'.repeat(100) }).A1).toHaveLength(MAX_LABEL_LEN);
  });

  it('levelLabel: тамға ё худи код (ба ҳарфи калон)', () => {
    const ja = { A1: 'N5', A2: 'N4' };
    expect(levelLabel(ja, 'A1')).toBe('N5');
    expect(levelLabel(ja, 'a2')).toBe('N4');
    expect(levelLabel(ja, 'B1')).toBe('B1');
    expect(levelLabel(null, 'A1')).toBe('A1');
  });
});
