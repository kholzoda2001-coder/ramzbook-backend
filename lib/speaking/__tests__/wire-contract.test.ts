import { describe, it, expect } from 'vitest';
import { toWire, type Step, type StepKind } from '@/lib/speaking/engine';

/**
 * ШАРТНОМАИ СИМ — он чи ба телефони корбар меравад.
 *
 * ⚠️ ИН ФАЙЛ ҲЕҶ ГОҲ ФРИЗЗ КАРДА НАМЕШАВАД ва ҳеҷ гоҳ «нарм» карда
 * намешавад. Агар он сурх шавад, ин маънои шикастани клиентҳои
 * АЛЛАКАЙ насбшударо дорад — на камбудии тест.
 *
 * Қадамҳо дастӣ сохта мешаванд: ин қабат ба ТАРТИБ, ба муҳаррик ва ба
 * мазмуни воқеӣ тамоман вобаста нест. Тартиб дар `ordering.test.ts`.
 */

function step(kind: StepKind, over: Partial<Step> = {}): Step {
  return {
    stepId: `it1:${kind}:0`,
    itemId: 'it1',
    kind,
    prompt: 'салом',
    target: 'hello',
    translation: 'салом',
    literal: 'ҳелло',
    note: 'эзоҳ',
    cue: 'Hi there!',
    cueTranslation: 'Салом!',
    audioUrl: 'https://cdn/a.mp3',
    badge: 'none',
    targetWords: ['hello'],
    showSlots: false,
    timerMs: null,
    ...over,
  };
}

describe('шартномаи сим · тартиби калидҳо', () => {
  it('say — 10 калид бо тартиби қатъӣ', () => {
    expect(Object.keys(toWire(step('say'), 1))).toEqual([
      'kind', 'badge', 'target', 'itemId',
      'translit', 'meaning', 'grammar', 'audioUrl', 'cue', 'cueTranslation',
    ]);
  });

  it('wordEcho — ҳамон 10 калид', () => {
    expect(Object.keys(toWire(step('wordEcho'), 1))).toEqual([
      'kind', 'badge', 'target', 'itemId',
      'translit', 'meaning', 'grammar', 'audioUrl', 'cue', 'cueTranslation',
    ]);
  });

  it('translate — 11 калид, prompt ва targetWords дар ҷои 3–4', () => {
    expect(Object.keys(toWire(step('translate'), 1))).toEqual([
      'kind', 'badge', 'prompt', 'targetWords', 'itemId',
      'translit', 'meaning', 'grammar', 'audioUrl', 'cue', 'cueTranslation',
    ]);
  });

  it('recall — 10 калид, тартиби ДИГАР', () => {
    expect(Object.keys(toWire(step('recall'), 1))).toEqual([
      'kind', 'badge', 'itemId', 'prompt', 'target', 'targetWords',
      'translit', 'meaning', 'grammar', 'audioUrl',
    ]);
  });
});

describe('шартномаи сим · cue', () => {
  it('recall ҲЕҶ ГОҲ cue намедиҳад', () => {
    const w = toWire(step('recall'), 1);
    expect(w).not.toHaveProperty('cue');
    expect(w).not.toHaveProperty('cueTranslation');
  });

  it('translate ҲАМЕША cue медиҳад — ҳатто вақте холӣ аст', () => {
    const w = toWire(step('translate', { cue: null, cueTranslation: null }), 1);
    expect(w).toHaveProperty('cue', '');
    expect(w).toHaveProperty('cueTranslation', '');
  });

  it('say ҳамеша cue медиҳад', () => {
    expect(toWire(step('say'), 1)).toHaveProperty('cue', 'Hi there!');
  });
});

describe('шартномаи сим · майдонҳои дохилӣ', () => {
  for (const kind of ['say', 'wordEcho', 'translate', 'recall'] as const) {
    it(`${kind} · ev=1 ҳеҷ stepId/showSlots/timerMs намедиҳад`, () => {
      const w = toWire(step(kind, { showSlots: true, timerMs: 4000 }), 1);
      expect(w).not.toHaveProperty('stepId');
      expect(w).not.toHaveProperty('showSlots');
      expect(w).not.toHaveProperty('timerMs');
    });
  }
});

describe('шартномаи сим · null → сатри холӣ', () => {
  it('literal/note/audioUrl/cue-и null ба "" табдил меёбанд, на ба null', () => {
    const w = toWire(
      step('say', { literal: null, note: null, audioUrl: null, cue: null, cueTranslation: null }),
      1,
    );
    expect(w.translit).toBe('');
    expect(w.grammar).toBe('');
    expect(w.audioUrl).toBe('');
    expect(w.cue).toBe('');
    expect(w.cueTranslation).toBe('');
  });
});

describe('шартномаи сим · гейти версия (§10.2)', () => {
  // Шартнома ҲАМОН аст: клиенти кӯҳна навъи навро ҳеҷ гоҳ намегирад.
  // Танҳо сабаб иваз шуд — «ҳанӯз нест» → «танҳо аз ev≥2».
  for (const kind of ['chunk', 'swap'] as const) {
    it(`${kind} дар ev=1 истисно мепартояд, на шакли тахминӣ`, () => {
      expect(() => toWire(step(kind), 1)).toThrow(/ev≥2/);
    });
  }

  it('chunk дар ev=2 ҳамон шакли `say`-ро мегирад (+ 3 майдони нав)', () => {
    expect(Object.keys(toWire(step('chunk'), 2))).toEqual([
      'kind', 'badge', 'target', 'itemId',
      'translit', 'meaning', 'grammar', 'audioUrl', 'cue', 'cueTranslation',
      'stepId', 'showSlots', 'timerMs',
    ]);
  });

  it('swap дар ev=2 ҳамон шакли `translate`-ро мегирад (+ 3 майдони нав)', () => {
    expect(Object.keys(toWire(step('swap', { showSlots: true, timerMs: 4000 }), 2))).toEqual([
      'kind', 'badge', 'prompt', 'targetWords', 'itemId',
      'translit', 'meaning', 'grammar', 'audioUrl', 'cue', 'cueTranslation',
      'stepId', 'showSlots', 'timerMs',
    ]);
  });

  it('навъҳои кӯҳна дар ev=2 низ шакли худро нигоҳ медоранд', () => {
    const w = toWire(step('say'), 2);
    expect(Object.keys(w).slice(0, 10)).toEqual([
      'kind', 'badge', 'target', 'itemId',
      'translit', 'meaning', 'grammar', 'audioUrl', 'cue', 'cueTranslation',
    ]);
  });
});
