/**
 * Курси вазъиятҳо (26.09.2026): зинаҳо ва навъҳои ev ≥ 3.
 *
 * Қулф мекунад:
 *   • зинаҳои осон (`words`/`chunks`) чунк ва думи «аз хотира» надоранд;
 *   • `dialogue`: гӯш → «кадомашро шунидӣ?» → навбатҳо бо ният;
 *   • `mission`: навбатҳо БЕ корти ният, бо рӯйхати ҳадафҳо;
 *   • клиенти кӯҳна (ev < 3) ҳеҷ гоҳ навъи навро намегирад;
 *   • валидатори зинаҳо.
 */
import { describe, expect, it } from 'vitest';
import {
  configForEv,
  generateSteps,
  toWire,
  DEFAULT_CONFIG,
  type EngineItem,
} from '../engine';
import { validateStage } from '../validate';

const turn = (
  id: string,
  cue: string,
  text: string,
  intent: string,
  accepts: string[] = [],
): EngineItem => ({
  id,
  kind: 'turn',
  text,
  translation: `tr-${id}`,
  literal: null,
  note: null,
  cue,
  cueTranslation: `cue-tr-${id}`,
  audioUrl: `https://cdn/${id}.mp3`,
  intent,
  accepts,
});

const word = (id: string, text: string): EngineItem => ({
  id,
  kind: 'word',
  text,
  translation: `tr-${id}`,
  literal: null,
  note: null,
  cue: null,
  cueTranslation: null,
  audioUrl: null,
});

const sentence = (id: string, text: string): EngineItem => ({
  ...word(id, text),
  kind: 'sentence',
});

const doctor = [
  turn('t1', 'Что вас беспокоит?', 'Голова болит.', 'Бигӯ, ки сарат дард мекунад', [
    'У меня болит голова.',
  ]),
  turn('t2', 'Когда это началось?', 'Со вчера.', 'Бигӯ, ки аз дирӯз'),
  turn('t3', 'Температура есть?', 'Нет, температуры нет.', 'Бигӯ, ки табат нест'),
  turn('t4', 'Вот рецепт.', 'Спасибо, доктор.', 'Ташаккур гӯй'),
];

const v3 = configForEv(3, DEFAULT_CONFIG);

describe('зинаҳои осон', () => {
  it('«words»: танҳо say → translate, бе чунк ва бе «аз хотира»', () => {
    const items = [word('a', 'Врач'), word('b', 'Голова'), word('c', 'Да'), word('d', 'Нет')];
    const steps = generateSteps(items, v3, { repeat: false, stage: 'words' });
    const kinds = new Set(steps.map((s) => s.kind));
    expect([...kinds].sort()).toEqual(['say', 'translate']);
  });

  it('«chunks»: «аз хотира» нест (доми `slice(-0)`)', () => {
    const items = [
      word('a', 'Болит'),
      sentence('s1', 'Болит голова'),
      sentence('s2', 'Болит живот'),
      sentence('s3', 'Болит спина'),
    ];
    const steps = generateSteps(items, v3, { repeat: false, stage: 'chunks' });
    expect(steps.some((s) => s.kind === 'recall')).toBe(false);
  });

  it('«sentences»: чунк нест, ҳатто барои ҷумлаи 4-калимагӣ', () => {
    const items = [
      word('a', 'болит'),
      word('b', 'голова'),
      sentence('s1', 'У меня болит голова.'),
      sentence('s2', 'У меня болит живот.'),
      sentence('s3', 'У меня болит зуб.'),
    ];
    const steps = generateSteps(items, v3, { repeat: false, stage: 'sentences' });
    expect(steps.some((s) => s.kind === 'chunk')).toBe(false);
  });

  it('дарси КӮҲНА (бе зина) — рафтор бетағйир: чунк ҳаст', () => {
    const items = [
      word('a', 'water'),
      word('b', 'please'),
      sentence('s1', 'I want water, please.'),
      sentence('s2', 'I want tea, please.'),
      sentence('s3', 'I want juice, please.'),
    ];
    const steps = generateSteps(items, configForEv(2, DEFAULT_CONFIG), { repeat: false });
    expect(steps.some((s) => s.kind === 'chunk')).toBe(true);
  });
});

describe('«dialogue»', () => {
  const steps = generateSteps(doctor, v3, { repeat: false, stage: 'dialogue' });

  it('тартиб: listen → heard ×2 → turn ×4', () => {
    expect(steps.map((s) => s.kind)).toEqual([
      'listen',
      'heard',
      'heard',
      'turn',
      'turn',
      'turn',
      'turn',
    ]);
  });

  it('муколамаи пурра: ҳамсӯҳбат ва хонанда навбат ба навбат', () => {
    const lines = steps[0].lines!;
    expect(lines).toHaveLength(8);
    expect(lines[0]).toMatchObject({ who: 'partner', text: 'Что вас беспокоит?' });
    expect(lines[1]).toMatchObject({ who: 'me', text: 'Голова болит.' });
  });

  it('«шунидӣ?»: 3 вариант, ҷавоб дар дохил ва на ҳамеша якум', () => {
    const heard = steps.filter((s) => s.kind === 'heard');
    for (const h of heard) {
      expect(h.options).toHaveLength(3);
      expect(h.options![h.answerIndex!]).toBe(h.target);
      expect(new Set(h.options!.map((o) => o.toLowerCase())).size).toBe(3);
    }
    expect(new Set(heard.map((h) => h.answerIndex)).size).toBeGreaterThan(1);
  });

  it('навбат: ният намоён, ҷавобҳои иловагӣ мераванд', () => {
    const t = steps.find((s) => s.kind === 'turn')!;
    expect(t.intent).toBe('Бигӯ, ки сарат дард мекунад');
    expect(t.hideIntent).toBe(false);
    expect(t.accepts).toEqual(['У меня болит голова.']);
    expect(t.cue).toBe('Что вас беспокоит?');
    expect(t.itemId).toBe('t1');
    expect(t.goals).toBeUndefined();
  });

  it('шакли сим (ev 3) ҳамаи майдонҳоро дорад', () => {
    const w = steps.map((s) => toWire(s, 3));
    expect(w[0].lines).toHaveLength(8);
    expect(w[1].options).toHaveLength(3);
    const t = w.find((x) => x.kind === 'turn')!;
    expect(t.intent).toBeTruthy();
    expect(t.accepts).toEqual(['У меня болит голова.']);
  });
});

describe('«mission»', () => {
  const steps = generateSteps(doctor, v3, { repeat: false, stage: 'mission' });

  it('танҳо навбатҳо, корти ният пинҳон, рӯйхати ҳадафҳо', () => {
    expect(steps.every((s) => s.kind === 'turn')).toBe(true);
    expect(steps.every((s) => s.hideIntent)).toBe(true);
    expect(steps[0].goals).toEqual(doctor.map((t) => t.intent));
    expect(steps.map((s) => s.goalIndex)).toEqual([0, 1, 2, 3]);
  });
});

describe('клиенти кӯҳна', () => {
  it('ev 2 навъи навро НАМЕГИРАД — навбат ҳамчун машқи оддӣ', () => {
    const steps = generateSteps(doctor, configForEv(2, DEFAULT_CONFIG), {
      repeat: false,
      stage: 'dialogue',
    });
    expect(steps.some((s) => ['listen', 'heard', 'turn'].includes(s.kind))).toBe(false);
    expect(steps.length).toBeGreaterThan(0);
    // ҳеҷ қадам ба сими ev 2 хато намедиҳад
    expect(() => steps.map((s) => toWire(s, 2))).not.toThrow();
  });

  it('toWire навъи навро барои ev < 3 рад мекунад', () => {
    const s = generateSteps(doctor, v3, { repeat: false, stage: 'dialogue' });
    expect(() => toWire(s[0], 2)).toThrow();
  });
});

describe('валидатори зинаҳо', () => {
  it('«words»: ҷумла ва калимаи дароз — хато', () => {
    const codes = validateStage('words', [
      word('a', 'Врач'),
      sentence('s', 'У меня болит голова.'),
      word('b', 'очень сильно болит'),
    ]).map((i) => i.code);
    expect(codes).toContain('E_STAGE_KIND');
    expect(codes).toContain('E_STAGE_TOO_LONG');
  });

  it('«sentences»: то 4 калима — бе хато', () => {
    expect(validateStage('sentences', [sentence('s', 'У меня болит голова.')])).toEqual([]);
  });

  it('«dialogue»: навбат бе ҷумлаи ҳамсӯҳбат — хато; кам аз 2 навбат — хато', () => {
    const bad = { ...doctor[0], cue: null };
    const codes = validateStage('dialogue', [bad]).map((i) => i.code);
    expect(codes).toContain('E_TURN_NO_CUE');
    expect(codes).toContain('E_STAGE_FEW_TURNS');
  });

  it('«mission»: ҳадди ақал 3 навбат', () => {
    const codes = validateStage('mission', doctor.slice(0, 2)).map((i) => i.code);
    expect(codes).toContain('E_STAGE_FEW_TURNS');
    expect(validateStage('mission', doctor).filter((i) => i.severity === 'error')).toEqual([]);
  });
});
