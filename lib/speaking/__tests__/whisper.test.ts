import { describe, expect, it } from 'vitest';
import {
  WhisperError,
  isHallucinatedSegment,
  parseWhisperMode,
  textFromWhisper,
  transcribeWithWhisper,
  whisperConfig,
  whisperLanguage,
} from '../whisper';

describe('whisper: режим', () => {
  it('пешфарз on; танҳо "off" хомӯш мекунад; хароб JSON — on', () => {
    expect(parseWhisperMode(null)).toBe('on');
    expect(parseWhisperMode('{"azure":"off"}')).toBe('on');
    expect(parseWhisperMode('{"whisper":"off"}')).toBe('off');
    expect(parseWhisperMode('{"whisper":"on","azure":"off"}')).toBe('on');
    expect(parseWhisperMode('not json')).toBe('on');
  });
});

describe('whisper: конфиг', () => {
  it('калид бе env/админ нест → хомӯш', () => {
    expect(whisperConfig({}).enabled).toBe(false);
  });
  it('GROQ_API_KEY аввал', () => {
    const c = whisperConfig({ GROQ_API_KEY: ' k ' }, { apiKey: 'x', baseUrl: 'https://api.groq.com/openai/v1' });
    expect(c.apiKey).toBe('k');
    expect(c.enabled).toBe(true);
  });
  it('калиди админ танҳо агар Groq бошад (Gemini/OpenAI ба Groq намеравад)', () => {
    expect(whisperConfig({}, { apiKey: 'g', baseUrl: 'https://api.groq.com/openai/v1' }).apiKey).toBe('g');
    expect(whisperConfig({}, { apiKey: 'g', baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai' }).enabled).toBe(false);
    expect(whisperConfig({}, { apiKey: 'g', baseUrl: '' }).enabled).toBe(false);
  });
});

describe('whisper: забон', () => {
  it('локал → ISO-639-1', () => {
    expect(whisperLanguage('en-US')).toBe('en');
    expect(whisperLanguage('ru_RU')).toBe('ru');
    expect(whisperLanguage('zh-CN')).toBe('zh');
    expect(whisperLanguage('')).toBeUndefined();
    expect(whisperLanguage(undefined)).toBeUndefined();
  });
});

describe('whisper: ҳалюсинатсия', () => {
  it('танҳо вақте ки ҳарду нишона бад бошанд', () => {
    expect(isHallucinatedSegment({ no_speech_prob: 0.9, avg_logprob: -1.5 })).toBe(true);
    // овози паст вале дуруст: no_speech баланд, logprob хуб → нигоҳ дошта мешавад
    expect(isHallucinatedSegment({ no_speech_prob: 0.9, avg_logprob: -0.3 })).toBe(false);
    expect(isHallucinatedSegment({ no_speech_prob: 0.1, avg_logprob: -1.5 })).toBe(false);
    expect(isHallucinatedSegment({})).toBe(false);
  });
  it('матн: сегментҳои бад партофта мешаванд, бе сегмент — text', () => {
    expect(
      textFromWhisper({
        text: 'I am fine. Thank you.',
        segments: [
          { text: ' I am fine.', no_speech_prob: 0.05, avg_logprob: -0.2 },
          { text: ' Thank you.', no_speech_prob: 0.95, avg_logprob: -1.8 },
        ],
      }),
    ).toBe('I am fine.');
    expect(textFromWhisper({ text: ' hello ' })).toBe('hello');
    expect(textFromWhisper({})).toBe('');
  });
});

describe('whisper: даъват', () => {
  const cfg = whisperConfig({ GROQ_API_KEY: 'k' });
  it('форма: модел, забон, БЕ prompt', async () => {
    let form: FormData | undefined;
    const fake = (async (_u: unknown, init: RequestInit) => {
      form = init.body as FormData;
      return new Response(JSON.stringify({ text: 'hi', language: 'en', segments: [] }), { status: 200 });
    }) as unknown as typeof fetch;
    const r = await transcribeWithWhisper({ audio: Buffer.from([1, 2, 3]), locale: 'en-US', config: cfg, fetchImpl: fake });
    expect(r.text).toBe('hi');
    expect(form!.get('model')).toBe('whisper-large-v3-turbo');
    expect(form!.get('language')).toBe('en');
    expect(form!.has('prompt')).toBe(false);
  });
  it('401 → WhisperError(401)', async () => {
    const fake = (async () => new Response('no', { status: 401 })) as unknown as typeof fetch;
    await expect(
      transcribeWithWhisper({ audio: Buffer.from([1]), config: cfg, fetchImpl: fake }),
    ).rejects.toMatchObject({ status: 401 });
    expect(new WhisperError(1, 'x')).toBeInstanceOf(Error);
  });
});
