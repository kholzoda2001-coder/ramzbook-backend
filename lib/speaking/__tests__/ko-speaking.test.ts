import { describe, it, expect } from 'vitest';
import { buildChain, DEFAULT_CONFIG } from '@/lib/speaking/engine';
import { buildChatMessages, saysGoodbye, scriptRules, type ChatInput } from '@/lib/speaking/chat';
import { closingLine } from '@/lib/speaking/freetalk';

/**
 * «Гуфтор»-и КОРЕЯГӢ (28.09.2026): порчаҳо, чат ва видоъ.
 * Пасвандҳо ба калима часпидаанд; хатари порча — муайянкунандае, ки ҷудо
 * навишта мешавад (이/그/저, 몇, шумораи корейӣ пеш аз шумора).
 */
const ko = { ...DEFAULT_CONFIG, lang: 'ko', maxChainSteps: 3 };
const starts = (s: string, w: string) => buildChain(s, ko).some((x) => x.startsWith(w));

describe('порчаи кореягӣ', () => {
  it('шумора аз шумораи худ канда намешавад', () => {
    expect(starts('사과 세 개 주세요.', '개')).toBe(false);
    expect(buildChain('사과 세 개 주세요.', ko)).toContain('세 개 주세요.');
  });

  it('ишора ва саволӣ бо исм мемонанд', () => {
    expect(starts('저는 이 공장에서 일해요.', '공장에서')).toBe(false);
    expect(starts('지금 몇 시예요?', '시예요?')).toBe(false);
  });

  it('порчаи табиӣ: объект + феъл', () => {
    expect(buildChain('저는 헬멧을 써요.', ko)).toContain('헬멧을 써요.');
  });

  it('исми вобаста ва шумора аз калимаи худ канда намешаванд (мазмуни воқеӣ)', () => {
    expect(starts('확인해 주실 수 있어요?', '수')).toBe(false);
    expect(starts('좀 늦을 것 같아요.', '것')).toBe(false);
    expect(buildChain('좀 늦을 것 같아요.', ko)).toContain('늦을 것 같아요.');
    expect(starts('일곱 시까지 갈게요.', '시까지')).toBe(false);
    expect(starts('월급이 십만 원 적어요.', '원')).toBe(false);
    expect(starts('저기, 사다리 옆에 있어요.', '옆에')).toBe(false);
    expect(buildChain('한 시간 늦어요.', ko)).toEqual([]); // «한» + «시간» = тамоми ҷумла
  });

  it('муайянкунанда ва «-하고» бо исм мемонанд', () => {
    expect(buildChain('좋은 하루 보내세요.', ko)).toEqual([]);
    expect(buildChain('시원한 물 주세요.', ko)).toEqual([]);
    expect(starts('빵하고 우유 주세요.', '우유')).toBe(false);
  });

  it('порча ду ҷумларо намепайвандад', () => {
    expect(buildChain('네, 빨리 가 주세요. 늦었어요.', ko).some((x) => x.includes('. '))).toBe(false);
    expect(starts('사람이 넘어졌어요! 도와주세요!', '넘어졌어요!')).toBe(false);
  });

  it('қоидаҳои кореягӣ ба англисӣ таъсир намерасонанд', () => {
    const en = { ...DEFAULT_CONFIG, lang: 'en' };
    expect(buildChain('Give me two boxes, please.', en)).toEqual(buildChain('Give me two boxes, please.', DEFAULT_CONFIG));
  });
});

describe('Рамз бо кореягӣ', () => {
  const base: ChatInput = { language: 'Korean', level: 'A1', memory: { name: '', facts: [] }, known: [], history: [], closing: false };

  it('сатҳи 해요체 ва STT-и бе фосила «хато» нест', () => {
    const [sys] = buildChatMessages(base, 'turn');
    expect(sys.content).toMatch(/해요체/);
    expect(sys.content).toMatch(/never treat spacing/);
    expect(scriptRules('Russian')).toBe('');
  });

  it('хайрухуши кореягӣ', () => {
    expect(saysGoodbye('안녕히 계세요')).toBe(true);
    expect(saysGoodbye('네, 또 만나요')).toBe(true);
    expect(saysGoodbye('저는 공장에서 일해요')).toBe(false);
  });

  it('видоъи суҳбати озод бо кореягӣ, на англисӣ', () => {
    expect(closingLine('ko-KR').text).toMatch(/[가-힣]/);
  });
});
