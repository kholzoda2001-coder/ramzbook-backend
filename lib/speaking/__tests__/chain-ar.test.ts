import { describe, it, expect } from 'vitest';
import { buildChain, DEFAULT_CONFIG } from '@/lib/speaking/engine';

/**
 * Порчаҳои АРАБӢ (28.09.2026). Хатти арабӣ аз рост ба чап аст, вале порча
 * ҳамон тавр СУФФИКСИ ҷумла мемонад — яъне охири ҷумла (тарафи ЧАПи экран).
 * Се доми хоси арабӣ:
 *   1) пешоянд/ишора/нидо/адад бе исми баъдӣ маъно надорад → ба порча кашида мешавад;
 *   2) сифат баъди исм меояд → порча аз сифат сар намешавад;
 *   3) инкор → занҷир нест (ҳамон қоидаи умумӣ).
 */
// 3 қадам — то ҲАМАИ номзадҳо санҷида шаванд (пешфарз танҳо кӯтоҳтаринро мегирад).
const ar = { ...DEFAULT_CONFIG, lang: 'ar', maxChainSteps: 3 };

describe('буриши ҷумлаи арабӣ', () => {
  it('пешоянд бо исми худ мемонад', () => {
    const c = buildChain('عِنْدِي أَلَمٌ فِي الْبَطْنِ.', ar);
    expect(c).toContain('فِي الْبَطْنِ.');
    expect(c.every((x) => !x.startsWith('الْبَطْنِ'))).toBe(true);
  });

  it('нидо «يَا» аз исм канда намешавад', () => {
    const c = buildChain('شُكْرًا جَزِيلًا يَا أُسْتَاذُ.', ar);
    expect(c).toContain('يَا أُسْتَاذُ.');
  });

  it('сифат аз исм канда намешавад — ال + ال', () => {
    const c = buildChain('أُرِيدُ الشَّايَ الْأَخْضَرَ مِنْ فَضْلِكَ.', ar);
    expect(c.some((x) => x.startsWith('الْأَخْضَرَ'))).toBe(false);
    expect(c).toContain('الشَّايَ الْأَخْضَرَ مِنْ فَضْلِكَ.');
  });

  it('сифат аз исм канда намешавад — танвин + танвин', () => {
    const c = buildChain('فُرْصَةٌ سَعِيدَةٌ يَا صَدِيقِي.', ar);
    expect(c.some((x) => x.startsWith('سَعِيدَةٌ'))).toBe(false);
    expect(c).toContain('يَا صَدِيقِي.');
  });

  it('адад бо маъдуди худ', () => {
    const c = buildChain('أَعْمَلُ هُنَا مُنْذُ خَمْسَةِ أَيَّامٍ.', ar);
    expect(c.every((x) => !x.startsWith('أَيَّامٍ'))).toBe(true);
    expect(c.every((x) => !x.startsWith('خَمْسَةِ'))).toBe(true); // «мунзу» ҳам кашида мешавад
    expect(c).toContain('مُنْذُ خَمْسَةِ أَيَّامٍ.');
  });

  it('инкор — занҷир нест', () => {
    expect(buildChain('لَا أَفْهَمُ هَذِهِ الْكَلِمَةَ.', ar)).toEqual([]);
    expect(buildChain('أَنَا لَسْتُ مِنْ مِصْرَ.', ar)).toEqual([]);
  });

  it('қоидаҳои арабӣ ба англисӣ таъсир намерасонанд', () => {
    const en = { ...DEFAULT_CONFIG, lang: 'en' };
    expect(buildChain('I want the green tea, please.', en))
      .toEqual(buildChain('I want the green tea, please.', { ...DEFAULT_CONFIG }));
  });
});
