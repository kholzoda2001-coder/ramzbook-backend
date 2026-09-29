/**
 * «Сӯҳбат бо AI» over Gemini Live — flag, prompt, locked setup, limits. No network.
 */
import { describe, expect, it } from 'vitest';
import {
  CLOSING_SIGNAL,
  DEFAULT_LIVE_MODEL,
  RESUME_SIGNAL,
  START_SIGNAL,
  buildLivePrompt,
  buildLiveSetup,
  buildTokenRequest,
  clampReportedTurns,
  cleanResumeHandle,
  liveConfig,
  liveEnabledFor,
  reconnectAllowed,
} from '../live';

describe('liveConfig — feature flag', () => {
  it('is OFF by default, even with a key', () => {
    expect(liveConfig({ GEMINI_API_KEY: 'k' }).enabled).toBe(false);
  });
  it('is OFF when the flag is on but the key is missing', () => {
    expect(liveConfig({ GEMINI_LIVE_CONVERSATION_ENABLED: 'true' }).enabled).toBe(false);
  });
  it('is ON with flag + key; defaults model and English only', () => {
    const c = liveConfig({ GEMINI_LIVE_CONVERSATION_ENABLED: 'true', GEMINI_API_KEY: ' k ' });
    expect(c.enabled).toBe(true);
    expect(c.apiKey).toBe('k');
    expect(c.model).toBe(DEFAULT_LIVE_MODEL);
    expect(liveEnabledFor(c, 'en')).toBe(true);
    expect(liveEnabledFor(c, 'en-US')).toBe(true);
    expect(liveEnabledFor(c, 'ru')).toBe(false);
  });
  it('language list and model are configurable', () => {
    const c = liveConfig({
      GEMINI_LIVE_CONVERSATION_ENABLED: '1',
      GEMINI_API_KEY: 'k',
      GEMINI_LIVE_LANGS: 'en, RU',
      GEMINI_LIVE_MODEL: 'some-live-model',
    });
    expect(liveEnabledFor(c, 'ru')).toBe(true);
    expect(liveEnabledFor(c, 'de')).toBe(false);
    expect(c.model).toBe('some-live-model');
    expect(liveEnabledFor({ ...c, langs: ['*'] }, 'de')).toBe(true);
  });
});

describe('buildLivePrompt', () => {
  it('fills language, level, name and memory', () => {
    const p = buildLivePrompt({ language: 'English', level: 'A1', name: 'Karim', facts: ['works as a builder'] });
    expect(p).toContain('English conversation teacher');
    expect(p).toContain('CEFR A1');
    expect(p).toContain('by name (Karim)');
    expect(p).toContain('- works as a builder');
    expect(p).not.toMatch(/\{(language|level|greetName|memory)\}/);
  });
  it('explains every control signal the app sends', () => {
    const p = buildLivePrompt({ language: 'English' });
    for (const s of [START_SIGNAL, RESUME_SIGNAL, CLOSING_SIGNAL]) expect(p).toContain(s);
    expect(p).not.toContain('WHAT YOU REMEMBER');
  });
  it('an override replaces the default but keeps placeholders working', () => {
    expect(buildLivePrompt({ language: 'English', level: 'A2' }, 'Teach {language} at {level}.')).toBe(
      'Teach English at A2.',
    );
  });
});

describe('buildLiveSetup / buildTokenRequest — locked, single use', () => {
  const setup = buildLiveSetup({ model: 'gemini-3.8-live', voice: 'Puck', prompt: 'P' });
  it('audio out, both transcriptions, VAD, compression, resumption', () => {
    expect(setup.model).toBe('models/gemini-3.8-live');
    expect(setup).toMatchObject({
      generationConfig: { responseModalities: ['AUDIO'] },
      systemInstruction: { parts: [{ text: 'P' }] },
      inputAudioTranscription: {},
      outputAudioTranscription: {},
      realtimeInputConfig: { automaticActivityDetection: {} },
      contextWindowCompression: { slidingWindow: {} },
      sessionResumption: {},
    });
  });
  it('carries a resume handle when given', () => {
    const s = buildLiveSetup({ model: 'm', voice: 'v', prompt: 'p', resumeHandle: 'h1' });
    expect(s.sessionResumption).toEqual({ handle: 'h1' });
  });
  it('token: uses 1, 60 s to connect, expires with the plan, NO fieldMask (= all locked)', () => {
    const now = Date.UTC(2026, 8, 29, 12, 0, 0);
    const t = buildTokenRequest({ setup, now, sessionMinutes: 5 });
    expect(t.uses).toBe(1);
    expect(t.newSessionExpireTime).toBe('2026-09-29T12:01:00.000Z');
    expect(t.expireTime).toBe('2026-09-29T12:05:00.000Z');
    expect(t.bidiGenerateContentSetup).toBe(setup);
    expect(t).not.toHaveProperty('fieldMask');
  });
});

describe('limits', () => {
  it('cleanResumeHandle rejects junk', () => {
    expect(cleanResumeHandle('abc-123_x')).toBe('abc-123_x');
    expect(cleanResumeHandle('')).toBe('');
    expect(cleanResumeHandle(5)).toBe('');
    expect(cleanResumeHandle('a b')).toBe('');
    expect(cleanResumeHandle('x'.repeat(3000))).toBe('');
  });
  it('reconnect only within the session budget (+1 min grace)', () => {
    const start = new Date(0);
    expect(reconnectAllowed(start, 5 * 60_000, 5)).toBe(true);
    expect(reconnectAllowed(start, 6 * 60_000, 5)).toBe(true);
    expect(reconnectAllowed(start, 6 * 60_000 + 1, 5)).toBe(false);
  });
  it('reported turns: never down, capped by plan and by time', () => {
    const startedAt = new Date(0);
    const c = (reported: unknown, current = 0, now = 600_000, maxTurns = 12) =>
      clampReportedTurns({ reported, current, maxTurns, startedAt, now });
    expect(c(3)).toBe(3);
    expect(c(99)).toBe(12);
    expect(c(2, 5)).toBe(5);
    expect(c('7')).toBe(0);
    expect(c(NaN, 1)).toBe(1);
    expect(c(10, 0, 9_000)).toBe(3); // 9 s → at most 3 turns
    expect(c(1, 0, 500)).toBe(1); // the very first turn always fits
  });
});
