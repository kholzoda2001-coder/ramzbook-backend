import { describe, it, expect } from 'vitest';

/**
 * M0a — тести бемаънӣ: танҳо тасдиқ мекунад, ки runner кор мекунад.
 *
 * Ин ҷо ҳеҷ мантиқи Speaking санҷида намешавад. Вазифааш ягона аст: пеш аз
 * оғози M0 маълум бошад, ки `npm test` воқеан иҷро мешавад ва alias-и `@/*`
 * аз `tsconfig.json` дар vitest низ кор мекунад (ниг. `vitest.config.ts`).
 */
describe('M0a · runner', () => {
  it('vitest иҷро мешавад', () => {
    expect(1 + 1).toBe(2);
  });

  it('alias-и «@» ба решаи backend ишора мекунад', async () => {
    // Модули бе Prisma ва бе I/O — танҳо санҷиши худи alias.
    const mod = await import('@/lib/ai/openai');
    expect(typeof mod.openAiChat).toBe('function');
  });
});
