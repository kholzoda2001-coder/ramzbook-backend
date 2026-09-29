import { describe, it, expect } from 'vitest';
import { buildChain, DEFAULT_CONFIG } from '@/lib/speaking/engine';
import { inTargetScript, scriptRules } from '@/lib/speaking/chat';

const cfg = { ...DEFAULT_CONFIG, lang: 'de', maxChainSteps: 3 };
const chain = (t: string) => buildChain(t, cfg);

describe('олмонӣ: порчабандӣ (29.09.2026)', () => {
  it('калимаи саволӣ («Wie viele») дар қафо намемонад', () => {
    for (const c of chain('Wie viele Säcke Zement?')) expect(c).not.toMatch(/^viele\b/);
    for (const c of chain('Wie viele Meter brauchst du?')) expect(c).not.toMatch(/^viele\b/);
  });

  it('порча ду ҷумларо намепайвандад', () => {
    for (const c of chain('Ich bin müde. Kann ich kurz sitzen?')) expect(c).not.toMatch(/\.\s/);
  });
});

describe('олмонӣ: чат', () => {
  it('умлаут ва ß хатти олмонӣ ҳисоб мешаванд', () => {
    expect(inTargetScript('Schön, dass du hier bist. Grüß dich!', 'de')).toBe(true);
    expect(scriptRules('German')).toMatch(/ß/);
  });
});
