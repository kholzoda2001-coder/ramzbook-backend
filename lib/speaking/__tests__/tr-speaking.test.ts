import { describe, it, expect } from 'vitest';
import { buildChain, DEFAULT_CONFIG } from '@/lib/speaking/engine';
import { saysGoodbye, inTargetScript, scriptRules } from '@/lib/speaking/chat';

const cfg = { ...DEFAULT_CONFIG, lang: 'tr', maxChainSteps: 3 };
const chain = (t: string) => buildChain(t, cfg);

describe('туркӣ: порчабандӣ (28.09.2026)', () => {
  it('порча аз пасоянд / ҷузъи савол / değil сар намешавад', () => {
    for (const c of [
      ...chain('Bunu senin için yaptım.'),
      ...chain('Sen de Türk müsün?'),
      ...chain('Ben burada öğrenci değilim.'),
      ...chain('Yarın ben de geliyorum.'),
    ]) {
      expect(c).not.toMatch(/^(için|müsün|değilim|de)\b/);
    }
  });

  it('рақам ва муайянкунанда аз исм ҷудо намешаванд', () => {
    for (const c of chain('Bana on iki metre kablo lazım.')) expect(c).not.toMatch(/^(iki|metre)\b/);
    for (const c of chain('Usta, bu kablo çok uzun.')) expect(c).not.toMatch(/^kablo\b/);
    for (const c of chain('Lütfen iki kilo çimento getir.')) expect(c).not.toMatch(/^kilo\b/); // «çimento getir.» — порчаи дуруст
  });

  it('рақам, тартибӣ ва исми мураккаб бурида намешаванд (аудити 20 бастаи туркӣ)', () => {
    const bad: Record<string, RegExp> = {
      'Kırk iki numara.': /^iki numara/,
      'On saat çalıştım.': /^saat/,
      'Yüz on iki arayın!': /^iki/,
      'Dördüncü katta çalışıyorum.': /^katta/,
      'Bir buçuk metre.': /^buçuk/,
      'El arabası nerede?': /^arabası/,
      'Toz maskesi lazım.': /^maskesi/,
      'Öğle yemeği kaçta?': /^yemeği/,
      'İlk yardım çantası nerede?': /^çantası/,
      'Daha ucuz var mı?': /^var mı/,
      'Yardım eder misin?': /^eder/,
    };
    for (const [t, re] of Object.entries(bad)) for (const c of chain(t)) expect(c, t).not.toMatch(re);
    // порчаи хуб боқӣ мемонад
    expect(chain('Sabah yedide başlıyoruz.')).toContain('yedide başlıyoruz.');
    expect(chain('Özür dilerim, geç kaldım.')).toContain('geç kaldım.');
  });

  it('калимаи саволӣ дар қафо намемонад', () => {
    for (const c of chain('Ne zaman işe başlıyoruz?')) expect(c).not.toMatch(/^zaman\b/);
  });

  it('порча аз калимаи охири ибора сар намешавад ва ду ҷумларо намепайвандад', () => {
    for (const c of chain('Tamam usta, hemen geliyorum.')) expect(c).not.toMatch(/,/);
    for (const c of chain('Çok yoruldum. Biraz dinlenebilir miyim?')) expect(c).not.toMatch(/\./);
  });
});

describe('туркӣ: чат', () => {
  it('хайрухуш, ҳатто бо ҳарфи калони İ', () => {
    expect(saysGoodbye('Tamam, görüşürüz!')).toBe(true);
    expect(saysGoodbye('İyi geceler!')).toBe(true);
    expect(saysGoodbye('Güle güle.')).toBe(true);
    expect(saysGoodbye('İyi günler, nasılsın?')).toBe(false);
  });
  it('хати туркӣ лотинӣ аст; қоидаҳои чат', () => {
    expect(inTargetScript('Merhaba! Nasılsın?', 'tr')).toBe(true);
    expect(inTargetScript('Привет! Как дела?', 'tr')).toBe(false);
    expect(scriptRules('Turkish')).toMatch(/ç ğ ı İ ö ş ü/);
  });
});
