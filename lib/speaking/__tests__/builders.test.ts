import { describe, it, expect } from 'vitest';
import {
  buildChain,
  buildSwaps,
  generateSteps,
  configForEv,
  DEFAULT_CONFIG,
  type EngineItem,
} from '@/lib/speaking/engine';

/** Намунаи §2.3–2.4 — маҳз ҳамон ҷумлаи ҳуҷҷат. */
const sentence = 'My name is Muhammad';

const item = (over: Partial<EngineItem> = {}): EngineItem => ({
  id: 'i1',
  kind: 'sentence',
  text: sentence,
  translation: 'Номи ман Муҳаммад аст',
  literal: null,
  note: null,
  cue: null,
  cueTranslation: null,
  audioUrl: null,
  chainOverride: [],
  swaps: [],
  ...over,
});

describe('§2.3 buildChain', () => {
  // ⚠️ Намунаи §2.3 «is Muhammad» ва «name is Muhammad» интизор дошт.
  // «is Muhammad» маҳз он чунки бадест, ки алгоритми нав бартараф мекунад:
  // он хабарро аз фоил меканад. Ҳоло чунк аз марзи ТАРКИБ бурида мешавад.
  it('чунк дар мобайни таркиб сар намешавад', () => {
    expect(buildChain(sentence, DEFAULT_CONFIG)).toEqual(['name is Muhammad']);
  });

  it('муайянкунанда чункро сар карда МЕТАВОНАД', () => {
    expect(buildChain('This is my mother.', DEFAULT_CONFIG)).toEqual(['my mother.']);
    expect(buildChain('I have a brother.', DEFAULT_CONFIG)).toEqual(['a brother.']);
  });

  it('муайянкунанда/адад аз исми худ канда намешавад', () => {
    expect(buildChain('He is ten years old.', DEFAULT_CONFIG)).toEqual(['ten years old.']);
    expect(buildChain('Can I have a table for two?', DEFAULT_CONFIG))
      .toEqual(['a table for two?']);
  });

  it('таркиби «калимаи саволӣ + …» шикаста намешавад', () => {
    expect(buildChain('What time is breakfast?', DEFAULT_CONFIG)).toEqual([]);
    expect(buildChain('How much is it?', DEFAULT_CONFIG)).toEqual([]);
  });

  it('чунк бо пешоянд ё феъли ёридиҳанда сар намешавад', () => {
    expect(buildChain('Three glasses of water, please.', DEFAULT_CONFIG))
      .toEqual(['water, please.']);
    expect(buildChain('I want to buy that.', DEFAULT_CONFIG)).toEqual(['buy that.']);
  });

  it('ҳар зина суффикси ҷумла аст', () => {
    for (const seg of buildChain(sentence, DEFAULT_CONFIG)) {
      expect(sentence.endsWith(seg)).toBe(true);
    }
  });

  it('аз кӯтоҳ ба дароз меравад', () => {
    const lens = buildChain(sentence, DEFAULT_CONFIG).map((s) => s.split(' ').length);
    expect(lens).toEqual([...lens].sort((a, b) => a - b));
  });

  it('ҷумлаи аз minChainWords кӯтоҳтар занҷир намедиҳад', () => {
    expect(buildChain('Thank you', DEFAULT_CONFIG)).toEqual([]);
  });

  it('аз maxChainSteps зиёд намедиҳад', () => {
    const long = 'I would like to book a table for two people tonight';
    expect(buildChain(long, DEFAULT_CONFIG).length).toBeLessThanOrEqual(
      DEFAULT_CONFIG.maxChainSteps,
    );
  });

  it('чунк ҳеҷ гоҳ тамоми ҷумла намешавад', () => {
    for (const t of ['The bill, please.', 'This is my mother.', 'I want soup.'])
      for (const c of buildChain(t, DEFAULT_CONFIG)) expect(c).not.toBe(t);
  });
});

describe('§2.4 buildSwaps', () => {
  it('намунаи ҳуҷҷат — калимаи ОХИРИН иваз мешавад', () => {
    expect(buildSwaps(sentence, ['Sitora', 'Karim'], DEFAULT_CONFIG)).toEqual([
      'My name is Sitora',
      'My name is Karim',
    ]);
  });

  it('камтар аз ду вариант — ҳеҷ swap', () => {
    expect(buildSwaps(sentence, ['Sitora'], DEFAULT_CONFIG)).toEqual([]);
  });
});

describe('§2.5 — chunk ва swap дар нақша', () => {
  it('ev=2: занҷир, худи ҷумла, санҷиш ва swap-ҳо', () => {
    const steps = generateSteps([item({ swaps: ['Sitora', 'Karim'] })], configForEv(2), {
      repeat: false,
    });
    expect(steps.map((s) => s.kind)).toEqual([
      'chunk', 'say', 'translate', 'swap', 'swap',
    ]);
    expect(steps.filter((s) => s.kind === 'swap').map((s) => s.target)).toEqual([
      'My name is Sitora',
      'My name is Karim',
    ]);
  });

  it('ev=2: swap слот дорад, chunk не', () => {
    const steps = generateSteps([item({ swaps: ['Sitora', 'Karim'] })], configForEv(2), {
      repeat: false,
    });
    expect(steps.find((s) => s.kind === 'swap')!.showSlots).toBe(true);
    expect(steps.find((s) => s.kind === 'chunk')!.showSlots).toBe(false);
  });

  it('ev=2: chainOverride-и дастӣ занҷири худкорро иваз мекунад', () => {
    const steps = generateSteps(
      [item({ chainOverride: ['Muhammad', 'is Muhammad'] })],
      configForEv(2),
      { repeat: false },
    );
    expect(steps.filter((s) => s.kind === 'chunk').map((s) => s.target)).toEqual([
      'Muhammad',
      'is Muhammad',
    ]);
  });

  it('ev=1: ҳамон воҳид ТАНҲО як translate медиҳад', () => {
    const steps = generateSteps([item({ swaps: ['Sitora', 'Karim'] })], configForEv(1), {
      repeat: false,
    });
    expect(steps.map((s) => s.kind)).toEqual(['translate']);
  });
});
