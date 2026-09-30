/**
 * Довари «Гуфтор»: Gemini аввал, Groq захира — конфиг ва «қатъкунак». Бе шабака.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_GEMINI_JUDGE_MODEL,
  geminiJudgeConfig,
  geminiSkipped,
  noteGeminiFailure,
  resetGeminiBreaker,
  skipMsFor,
  usableJudgeReply,
} from '../judge-gemini';
import { parseJudgeReply } from '../judge';

describe('geminiJudgeConfig', () => {
  it('бе калид — хомӯш (рафтори пештара)', () => {
    expect(geminiJudgeConfig({}).enabled).toBe(false);
    expect(geminiJudgeConfig({ GEMINI_API_KEY: '  ' }).enabled).toBe(false);
  });
  it('бо калид — фаъол, модели пешфарз', () => {
    const c = geminiJudgeConfig({ GEMINI_API_KEY: ' k ' });
    expect(c).toEqual({ enabled: true, apiKey: 'k', model: DEFAULT_GEMINI_JUDGE_MODEL });
  });
  it('тугмаи `GEMINI_JUDGE_ENABLED=false|0` онро хомӯш мекунад; модел иваз мешавад', () => {
    expect(geminiJudgeConfig({ GEMINI_API_KEY: 'k', GEMINI_JUDGE_ENABLED: 'false' }).enabled).toBe(false);
    expect(geminiJudgeConfig({ GEMINI_API_KEY: 'k', GEMINI_JUDGE_ENABLED: '0' }).enabled).toBe(false);
    expect(geminiJudgeConfig({ GEMINI_API_KEY: 'k', GEMINI_JUDGE_ENABLED: 'true', GEMINI_JUDGE_MODEL: 'm2' }).model).toBe('m2');
  });
});

describe('«қатъкунак»', () => {
  beforeEach(resetGeminiBreaker);
  it('пеш аз хато — ҳеҷ гоҳ намепаррад', () => {
    expect(geminiSkipped(1_000)).toBe(false);
  });
  it('429 → 30 с, 5xx/таймаут → 15 с, калид/модел (401/403/404) → 10 дақиқа', () => {
    expect(skipMsFor(429)).toBe(30_000);
    expect(skipMsFor(500)).toBe(15_000);
    expect(skipMsFor(undefined)).toBe(15_000);
    for (const s of [401, 403, 404]) expect(skipMsFor(s)).toBe(600_000);
  });
  it('баъди хато то ҳадди вақт мепарад, баъд боз кӯшиш мекунад', () => {
    noteGeminiFailure(429, 10_000);
    expect(geminiSkipped(10_001)).toBe(true);
    expect(geminiSkipped(39_999)).toBe(true);
    expect(geminiSkipped(40_000)).toBe(false);
  });
  it('хатои дарозтар аз кӯтоҳтар ғолиб аст, ва кӯтоҳ дарозро кӯтоҳ намекунад', () => {
    noteGeminiFailure(404, 0);
    noteGeminiFailure(429, 1_000); // 31 000 < 600 000
    expect(geminiSkipped(500_000)).toBe(true);
    expect(geminiSkipped(600_000)).toBe(false);
  });
});

describe('usableJudgeReply — ҷавоби нохонда ба захира меравад, на ба «рад»', () => {
  it('JSON-и дуруст', () => {
    expect(usableJudgeReply('{"ok": true, "fix": "x"}')).toBe(true);
    expect(usableJudgeReply('```json\n{"ok": false, "fix": ""}\n```')).toBe(true);
    expect(usableJudgeReply('{"ok": "true"}')).toBe(true);
  });
  it('холӣ, матн, JSON-и вайрон, ё бе `ok` — нохонда', () => {
    for (const r of [undefined, '', 'Sure!', '{oops', '{"fix": "x"}', '{"ok": 1}']) {
      expect(usableJudgeReply(r)).toBe(false);
    }
  });
  it('бо парсери мавҷуда мувофиқ: ҳар чизи хондашаванда ҳамон натиҷаро медиҳад', () => {
    expect(parseJudgeReply('{"ok": true, "fix": "Меня зовут Рустам"}').ok).toBe(true);
    expect(parseJudgeReply('{"ok": false, "fix": ""}').ok).toBe(false);
  });
});
