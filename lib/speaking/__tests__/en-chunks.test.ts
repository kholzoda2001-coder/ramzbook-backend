import { describe, it, expect } from 'vitest';
import { buildChain, DEFAULT_CONFIG } from '@/lib/speaking/engine';

const cfg = { ...DEFAULT_CONFIG, lang: 'en', maxChainSteps: 3 };
const chain = (t: string) => buildChain(t, cfg);

describe('англисӣ: порча ду ҷумларо намепайвандад (02.10.2026)', () => {
  it('«Like this? Okay?», «I\'m late. Sorry.», «Hello, Anna! Sorry.» — бе порчаи бемаъно', () => {
    for (const t of ['Like this? Okay?', "I'm late. Sorry.", 'Hello, Anna! Sorry.', "Here's your coffee. Enjoy!"]) {
      for (const c of chain(t)) expect(c, t).not.toMatch(/[.!?] \S/);
    }
  });

  it('порчаи одатӣ боқӣ мемонад', () => {
    expect(chain('Where is the manager?').length).toBeGreaterThan(0);
    expect(chain("I'm coming. The bus is late.")).toContain('The bus is late.');
  });
});
