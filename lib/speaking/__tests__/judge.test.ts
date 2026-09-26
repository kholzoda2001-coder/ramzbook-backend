/**
 * AI-довар (қадами 7): промпт ва хондани ҷавоб — бе шабака.
 */
import { describe, expect, it } from 'vitest';
import { buildJudgeMessages, isReasoningModel, judgeable, languageName, parseJudgeReply, type JudgeInput } from '../judge';

const base: JudgeInput = {
  language: 'Russian',
  cue: 'Что вас беспокоит?',
  intent: 'Бигӯед, ки саратон дард мекунад',
  answers: ['Голова болит.', 'У меня болит голова.'],
  heard: 'голова сильно трещит',
};

describe('judgeable', () => {
  it('дархости муқаррарӣ', () => expect(judgeable(base)).toBe(true));
  it('сукут / аломат — не', () => {
    expect(judgeable({ ...base, heard: '' })).toBe(false);
    expect(judgeable({ ...base, heard: ' . ' })).toBe(false);
  });
  it('дароз ё бе намуна — не', () => {
    expect(judgeable({ ...base, heard: 'слово '.repeat(25) })).toBe(false);
    expect(judgeable({ ...base, answers: [] })).toBe(false);
    expect(judgeable({ ...base, language: '' })).toBe(false);
  });
  it('на ният ва на cue — чизе барои довар нест', () => {
    expect(judgeable({ ...base, intent: '', cue: '' })).toBe(false);
  });
});

describe('buildJudgeMessages', () => {
  it('ҳамаи қисмҳо дар промпт, JSON талаб мешавад', () => {
    const [sys, user] = buildJudgeMessages(base);
    expect(sys.role).toBe('system');
    expect(sys.content).toContain('JSON only');
    expect(sys.content).toContain('communication, not perfect grammar');
    expect(sys.content).toContain('Russian');
    expect(user.content).toContain('Partner said: "Что вас беспокоит?"');
    expect(user.content).toContain('Бигӯед, ки саратон дард мекунад');
    expect(user.content).toContain('"Голова болит."');
    expect(user.content).toContain('Learner said (speech-to-text): "голова сильно трещит"');
  });
  it('бе cue — «хонанда оғоз мекунад»', () => {
    const [, user] = buildJudgeMessages({ ...base, cue: '' });
    expect(user.content).toContain('starts the conversation');
  });
});

describe('parseJudgeReply', () => {
  it('JSON-и тоза ва JSON дар байни матн', () => {
    expect(parseJudgeReply('{"ok": true, "fix": "Голова болит."}')).toEqual({ ok: true, fix: 'Голова болит.' });
    expect(parseJudgeReply('Sure! ```json\n{"ok":false,"fix":"У меня болит голова."}\n```')).toEqual({
      ok: false,
      fix: 'У меня болит голова.',
    });
  });
  it('ношинос → рад (бехатар)', () => {
    expect(parseJudgeReply('yes')).toEqual({ ok: false, fix: '' });
    expect(parseJudgeReply('{ok: yes}')).toEqual({ ok: false, fix: '' });
    expect(parseJudgeReply('{"ok": "maybe"}').ok).toBe(false);
  });
});

describe('languageName', () => {
  it('код → ном, номи пурра бетағйир', () => {
    expect(languageName('ru-RU')).toBe('Russian');
    expect(languageName('ko')).toBe('Korean');
    expect(languageName('Russian')).toBe('Russian');
  });
});

describe('isReasoningModel', () => {
  it('модели фикркунанда ва оддӣ', () => {
    expect(isReasoningModel('openai/gpt-oss-120b')).toBe(true);
    expect(isReasoningModel('o3-mini')).toBe(true);
    expect(isReasoningModel('gpt-4o-mini')).toBe(false);
    expect(isReasoningModel('llama-3.3-70b-versatile')).toBe(false);
    expect(isReasoningModel('gemini-2.0-flash')).toBe(false);
  });
});
