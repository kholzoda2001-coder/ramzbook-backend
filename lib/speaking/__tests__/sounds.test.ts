import { describe, it, expect } from 'vitest';
import {
  rollWeek,
  addHit,
  buildSoundReport,
  WEEK_MS,
  MAX_EXAMPLES,
  type SoundRow,
} from '@/lib/speaking/sounds';

const T0 = new Date('2026-09-06T10:00:00Z');
const plus = (ms: number) => new Date(T0.getTime() + ms);

const row = (over: Partial<SoundRow> = {}): SoundRow => ({
  phoneme: 'th',
  curAttempts: 0,
  curSum: 0,
  curStart: T0,
  prevAttempts: 0,
  prevSum: 0,
  examples: [],
  ...over,
});

describe('гардиши ҳафта', () => {
  it('дар дохили ҳафта чизе намегардад', () => {
    const r = row({ curAttempts: 5, curSum: 300 });
    expect(rollWeek(r, plus(WEEK_MS - 1))).toBe(r);
  });

  it('баъди ҳафта сатили ҷорӣ ба ГУЗАШТА мегузарад', () => {
    const r = rollWeek(row({ curAttempts: 5, curSum: 300 }), plus(WEEK_MS));
    expect(r.prevAttempts).toBe(5);
    expect(r.prevSum).toBe(300);
    expect(r.curAttempts).toBe(0);
    expect(r.curSum).toBe(0);
    expect(r.curStart.getTime()).toBe(plus(WEEK_MS).getTime());
  });

  it('баъди ДУ ҳафта «гузашта» ҳам пок мешавад', () => {
    // Холи дуҳафтаинаро ҳамчун «ҳафтаи гузашта» нишон додан дурӯғ мебуд.
    const r = rollWeek(
      row({ curAttempts: 5, curSum: 300, prevAttempts: 9, prevSum: 500 }),
      plus(2 * WEEK_MS),
    );
    expect(r.prevAttempts).toBe(0);
    expect(r.prevSum).toBe(0);
  });

  it('сатри додашуда ТАҒЙИР намеёбад (функсияи соф)', () => {
    const r = row({ curAttempts: 5, curSum: 300 });
    rollWeek(r, plus(WEEK_MS));
    expect(r.curAttempts).toBe(5);
  });
});

describe('иловаи кӯшиш', () => {
  it('хол ва шумора ҷамъ мешаванд', () => {
    let r = row();
    r = addHit(r, { phoneme: 'th', score: 40, word: 'thank' });
    r = addHit(r, { phoneme: 'th', score: 60, word: 'three' });
    expect(r.curAttempts).toBe(2);
    expect(r.curSum).toBe(100);
    expect(r.examples).toEqual(['thank', 'three']);
  });

  it('намунаи такрорӣ дубора илова намешавад', () => {
    let r = row();
    r = addHit(r, { phoneme: 'th', score: 40, word: 'Thank' });
    r = addHit(r, { phoneme: 'th', score: 50, word: 'thank' });
    expect(r.examples).toEqual(['thank']);
    expect(r.curAttempts).toBe(2);
  });

  it(`намунаҳо аз ${MAX_EXAMPLES} зиёд намешаванд`, () => {
    let r = row();
    for (const w of ['a', 'b', 'c', 'd', 'e']) {
      r = addHit(r, { phoneme: 'th', score: 50, word: w });
    }
    expect(r.examples).toHaveLength(MAX_EXAMPLES);
  });

  it('кӯшиши бе калима ҳам ҳисоб мешавад', () => {
    const r = addHit(row(), { phoneme: 'th', score: 70 });
    expect(r.curAttempts).toBe(1);
    expect(r.examples).toEqual([]);
  });
});

describe('сохтани ҳисобот', () => {
  const rows: SoundRow[] = [
    row({ phoneme: 'th', curAttempts: 10, curSum: 680, prevAttempts: 8, prevSum: 328, examples: ['thank'] }),
    row({ phoneme: 'r', curAttempts: 14, curSum: 532, examples: ['rice', 'bread'] }),
    row({ phoneme: 'w', curAttempts: 6, curSum: 426 }),
    row({ phoneme: 'z', curAttempts: 2, curSum: 60 }), // кам кӯшиш
  ];

  it('садоҳои СУСТ аввал меоянд, аз пасттарин', () => {
    const rep = buildSoundReport(rows);
    expect(rep.map((r) => r.phoneme)).toEqual(['r', 'th', 'w']);
    expect(rep[0].weak).toBe(true);
    expect(rep[0].score).toBe(38);
  });

  it('садои камкӯшиш ба ҳисобот НАМЕОЯД', () => {
    // 2 кӯшиш рақами тасодуфист — ҳисобот набояд аз он хулоса барорад.
    expect(buildSoundReport(rows).some((r) => r.phoneme === 'z')).toBe(false);
  });

  it('ҳафтаи гузашта барои тирчаи «беҳтар шуд»', () => {
    const th = buildSoundReport(rows).find((r) => r.phoneme === 'th')!;
    expect(th.score).toBe(68);
    expect(th.prevScore).toBe(41);
  });

  it('бе маълумоти ҳафтаи гузашта → null, на сифр', () => {
    // Сифр «хеле бад буд»-ро мефаҳмонад; `null` = «намедонем».
    const r = buildSoundReport(rows).find((x) => x.phoneme === 'r')!;
    expect(r.prevScore).toBeNull();
  });

  it('рӯйхати холӣ хато намедиҳад', () => {
    expect(buildSoundReport([])).toEqual([]);
  });
});
