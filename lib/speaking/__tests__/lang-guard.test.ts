import { describe, it, expect } from 'vitest';
import { inTargetScript, replyProblem, retryNote } from '@/lib/speaking/chat';

/**
 * Муҳофизи забон (28.09.2026, саволи корбар): хонандаи курси англисӣ набояд аз
 * Рамз ҷавоби русӣ гирад. Санҷиши зинда нишон дод, ки модел ҳатто ба «говори
 * по-русски» бо англисӣ ҷавоб медиҳад — ин тест кафолатро аз модел ба сервер мегузаронад.
 */
describe('ҷавоб бо хати забони омӯзиш', () => {
  it('англисӣ (ва ҳар забони лотинӣ): кириллӣ, арабӣ, ҳангул — не', () => {
    expect(inTargetScript('Nice to meet you! Where are you from?', 'en')).toBe(true);
    expect(inTargetScript('Хорошо! Откуда вы?', 'en')).toBe(false);
    expect(inTargetScript('Nice! Ты откуда?', 'en-US')).toBe(false);
    expect(inTargetScript('Merhaba! Nasılsın?', 'tr')).toBe(true);
    expect(inTargetScript('Guten Tag!', 'de')).toBe(true);
  });

  it('русӣ: кириллӣ, вале на тоҷикӣ', () => {
    expect(inTargetScript('Привет! Как дела?', 'ru')).toBe(true);
    expect(inTargetScript('Салом! Корҳо чӣ хел?', 'ru')).toBe(false); // ӣ — тоҷикӣ
    expect(inTargetScript('Hello! How are you?', 'ru')).toBe(false);
  });

  it('арабӣ ва кореягӣ: хати худ; номи лотинӣ монеа нест', () => {
    expect(inTargetScript('مَرْحَبًا! كَيْفَ حَالُكَ؟', 'ar')).toBe(true);
    expect(inTargetScript('Привет!', 'ar')).toBe(false);
    expect(inTargetScript('안녕하세요! 저는 Ramz예요.', 'ko')).toBe(true);
    expect(inTargetScript('Как дела?', 'ko-KR')).toBe(false);
    expect(inTargetScript('Hello, how are you?', 'ko')).toBe(false);
  });

  it('`replyProblem`: забони нодуруст пеш аз ҳама, ҳатто дар хайрухуш', () => {
    const opts = { closing: false, goodbye: false, lang: 'en' };
    expect(replyProblem('Хорошо. Откуда вы?', [], opts)).toBe('wrong_language');
    expect(replyProblem('Пока!', [], { ...opts, goodbye: true })).toBe('wrong_language');
    expect(replyProblem('Great! Where do you work?', [], opts)).toBeNull();
    // Бе `lang` — рафтори пештара (барои забонҳои дигари даъваткунанда).
    expect(replyProblem('Хорошо. Откуда вы?', [], { closing: false, goodbye: false })).toBeNull();
    expect(retryNote('wrong_language')).toMatch(/ONLY in the language of this lesson/);
  });
});
