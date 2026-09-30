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
  DAY_MS,
  dayStart,
  freeLimits,
  grantFor,
  levelRule,
  liveConfig,
  liveEnabledFor,
  MIN_GRANT_SECONDS,
  normalizeLevel,
  MONTH_MS,
  premiumLimits,
  reconnectSeconds,
  usedSeconds,
  type LiveUsageRow,
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

describe('normalizeLevel / levelRule', () => {
  it('A1 — пешфарз ва барои ҳар чизи номаълум', () => {
    for (const v of ['A1', 'a1', undefined, null, '', 'zzz', 5]) expect(normalizeLevel(v)).toBe('A1');
  });
  it('A2, ва B1 = B1 ва болотар', () => {
    expect(normalizeLevel('A2')).toBe('A2');
    for (const v of ['B1', 'B2', 'C1', 'c2']) expect(normalizeLevel(v)).toBe('B1');
  });
  it('A1 — ҷумлаҳои хеле кӯтоҳ (≤ 2 ҷумла, ≤ 8 калима, як савол); A2 ва B1 озодтар', () => {
    expect(levelRule('A1')).toMatch(/at most 2 sentences.*at most 8 words/);
    expect(levelRule('A1')).toContain('one easy question at a time');
    expect(levelRule('A2')).toContain('A2');
    expect(levelRule('B1')).toContain('B1');
    expect(levelRule('A1')).not.toEqual(levelRule('A2'));
  });
});

describe('buildLivePrompt', () => {
  it('сатҳи A1 — қоидаҳои A1 дар промпт; бе сатҳ ҳам A1', () => {
    for (const p of [buildLivePrompt({ language: 'English', level: 'A1' }), buildLivePrompt({ language: 'English' })]) {
      expect(p).toContain('English teacher');
      expect(p).toContain(levelRule('A1'));
      expect(p).not.toContain('The learner is A2');
    }
  });
  it('сатҳи A2 ва B1 — қоидаи худашон', () => {
    expect(buildLivePrompt({ language: 'English', level: 'A2' })).toContain(levelRule('A2'));
    expect(buildLivePrompt({ language: 'English', level: 'C1' })).toContain(levelRule('B1'));
  });
  it('қоидаҳои суҳбат: ҷавоб → як савол, такрор нест, осонтар кардан', () => {
    const p = buildLivePrompt({ language: 'English' });
    expect(p).toContain('exactly ONE easy follow-up question');
    expect(p).toContain('Never ask the same or a similar question twice');
    expect(p).toContain('Cats or dogs?');
    expect(p).toContain('Oh, you went yesterday!');
  });
  it('ном ва хотира: бо ном салом медиҳад; бе ном — ном мепурсад', () => {
    const withName = buildLivePrompt({ language: 'English', name: 'Karim', facts: ['works as a builder'], openTopic: 'food' });
    expect(withName).toContain('greet Karim by name and ask ONE easy question about food');
    expect(withName).toContain('- works as a builder');
    const noName = buildLivePrompt({ language: 'English' });
    expect(noName).toContain("introduce yourself as Ramz and ask the learner's name");
    expect(noName).not.toContain('WHAT YOU REMEMBER');
  });
  it('калимаҳои омӯхта: то 30, бе шаблон; бе онҳо сатр нест', () => {
    const many = Array.from({ length: 50 }, (_, k) => `word${k}`);
    const p = buildLivePrompt({ language: 'English', known: ['Where is the cement?', 'I am a {job}', 'fill ___', ...many] });
    expect(p).toContain('"Where is the cement?"');
    // Ду шаблон («{job}», «___») аввал партофта мешавад, баъд 30-то мемонад:
    // «Where is the cement?» + word0…word28.
    expect(p).toContain('"word28"');
    expect(p).not.toContain('"word29"');
    expect(p).not.toContain('{job}');
    expect(buildLivePrompt({ language: 'English' })).not.toContain('already practised');
  });
  it('ҳамаи сигналҳои идоракунӣ шарҳ дода шудаанд ва шаблон боқӣ намемонад', () => {
    const p = buildLivePrompt({ language: 'English', level: 'A2', name: 'Ali', known: ['hello'], facts: ['x'] });
    for (const s of [START_SIGNAL, RESUME_SIGNAL, CLOSING_SIGNAL]) expect(p).toContain(s);
    expect(p).not.toMatch(/\{(language|level|levelRule|known|startPlan|greetName|memory)\}/);
  });
  it('override шаблонҳоро пур мекунад', () => {
    expect(buildLivePrompt({ language: 'English', level: 'A2' }, 'Teach {language} at {level}.')).toBe('Teach English at A2.');
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
    const t = buildTokenRequest({ setup, now, sessionSeconds: 300 });
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

// ── Лимитҳои дақиқа: ройгон 5 дақиқа дар умр; Premium 60/30 рӯз + 10/24 соат ──
const T0 = Date.UTC(2026, 8, 30, 12, 0, 0);
const at = (msAgo: number) => new Date(T0 - msAgo);
/** Суҳбати тамомшуда: [sec] сония гап зад, [agoMs] пеш оғоз шуд. */
const done = (sec: number, agoMs: number, grant = 600): LiveUsageRow => ({
  liveGrantSeconds: grant,
  turns: 3,
  startedAt: at(agoMs),
  completedAt: new Date(T0 - agoMs + sec * 1000),
});

describe('usedSeconds', () => {
  it('чати кӯҳна (grant 0) ва суҳбати бе гап — 0', () => {
    expect(usedSeconds({ liveGrantSeconds: 0, turns: 5, startedAt: at(1000), completedAt: at(0) })).toBe(0);
    expect(usedSeconds({ liveGrantSeconds: 300, turns: 0, startedAt: at(1000), completedAt: null })).toBe(0);
  });
  it('тамомшуда — фосилаи воқеӣ, то ҳадди grant', () => {
    expect(usedSeconds(done(90, 0))).toBe(90);
    expect(usedSeconds(done(9999, 0, 300))).toBe(300);
  });
  it('нотамом (барнома кушта шуд, вале гап зад) — grant-и пурра', () => {
    expect(usedSeconds({ liveGrantSeconds: 300, turns: 2, startedAt: at(5000), completedAt: null })).toBe(300);
  });
});

describe('grantFor — ройгон: 5 дақиқа дар ТАМОМИ умр', () => {
  it('корбари нав — 300 сония', () => {
    expect(grantFor(freeLimits, [], T0)).toEqual({ ok: true, seconds: 300 });
  });
  it('дақиқаҳо ҷамъ мешаванд, бе вобастагӣ ба вақт (ҳатто 1 сол пеш)', () => {
    const rows = [done(100, 365 * DAY_MS, 300), done(120, 40 * DAY_MS, 300)];
    expect(grantFor(freeLimits, rows, T0)).toEqual({ ok: true, seconds: 80 });
  });
  it('5 дақиқа тамом → free_used', () => {
    expect(grantFor(freeLimits, [done(300, 10 * DAY_MS, 300)], T0)).toEqual({ ok: false, reason: 'free_used' });
  });
  it('аз ҳадди ақалл (60 с) камтар монд → free_used', () => {
    expect(grantFor(freeLimits, [done(300 - (MIN_GRANT_SECONDS - 1), 1000, 300)], T0)).toEqual({
      ok: false,
      reason: 'free_used',
    });
  });
  it('суҳбати бе гап ё чати кӯҳна дақиқаи ройгонро намехӯрад', () => {
    const rows: LiveUsageRow[] = [
      { liveGrantSeconds: 300, turns: 0, startedAt: at(1000), completedAt: null },
      { liveGrantSeconds: 0, turns: 9, startedAt: at(1000), completedAt: at(0) },
    ];
    expect(grantFor(freeLimits, rows, T0)).toEqual({ ok: true, seconds: 300 });
  });
});

describe('grantFor — Premium: 60 дақиқа/30 рӯз ва 10 дақиқа/рӯз (аз 00:00 Душанбе)', () => {
  it('корбари нав — 10 дақиқа (ҳадди рӯз)', () => {
    expect(grantFor(premiumLimits, [], T0)).toEqual({ ok: true, seconds: 600 });
  });
  it('ҳадди рӯз: имрӯз 7 дақиқа сарф шуд → 3 дақиқа мондааст', () => {
    expect(grantFor(premiumLimits, [done(420, 2 * 3600_000)], T0)).toEqual({ ok: true, seconds: 180 });
  });
  it('10 дақиқаи имрӯз тамом → day; рӯзи оянда боз кушода', () => {
    expect(grantFor(premiumLimits, [done(600, 3600_000)], T0)).toEqual({ ok: false, reason: 'day' });
    expect(grantFor(premiumLimits, [done(600, DAY_MS + 60_000)], T0)).toEqual({ ok: true, seconds: 600 });
  });
  it('рӯз — тақвимӣ: 23:50-и дирӯз ҳисоб намешавад, 00:05–00:15-и имрӯз (10 дақиқа) ҳисоб мешавад', () => {
    const midnight = dayStart(T0); // 00:00 Душанбе имрӯз
    const now = midnight + 20 * 60_000; // 00:20
    const late = { liveGrantSeconds: 600, turns: 3, startedAt: new Date(midnight - 10 * 60_000), completedAt: new Date(midnight) };
    const early = { liveGrantSeconds: 600, turns: 3, startedAt: new Date(midnight + 5 * 60_000), completedAt: new Date(midnight + 15 * 60_000) };
    expect(grantFor(premiumLimits, [late], now)).toEqual({ ok: true, seconds: 600 });
    expect(grantFor(premiumLimits, [early], now)).toEqual({ ok: false, reason: 'day' });
    expect(dayStart(T0 + 1)).toBe(midnight);
  });
  it('ҳадди моҳ: 55 дақиқа дар 30 рӯз → 5 дақиқа мондааст (на 10)', () => {
    // 5 × 10 дақиқа + 5 дақиқа = 55 дақиқа → аз 60 ҳамагӣ 5 дақиқа мондааст.
    const rows = [done(600, 2 * DAY_MS), done(600, 5 * DAY_MS), done(600, 9 * DAY_MS), done(600, 12 * DAY_MS),
      done(600, 15 * DAY_MS), done(300, 20 * DAY_MS)];
    expect(grantFor(premiumLimits, rows, T0)).toEqual({ ok: true, seconds: 300 });
  });
  it('60 дақиқа тамом → month; суҳбати 31 рӯз пеш ҳисоб намешавад', () => {
    const six = Array.from({ length: 6 }, (_, k) => done(600, (k + 2) * 3 * DAY_MS));
    expect(grantFor(premiumLimits, six, T0)).toEqual({ ok: false, reason: 'month' });
    const old = [...six.slice(0, 5), done(600, MONTH_MS + DAY_MS)];
    expect(grantFor(premiumLimits, old, T0)).toEqual({ ok: true, seconds: 600 });
  });
});

describe('reconnectSeconds', () => {
  it('то охири вақти додашуда; охирин 20 сония — не', () => {
    const start = new Date(T0 - 100_000);
    expect(reconnectSeconds(start, 300, T0)).toBe(200);
    expect(reconnectSeconds(start, 300, T0 + 190_000)).toBe(0); // 10 с мондааст < 20
    expect(reconnectSeconds(start, 100, T0)).toBe(0);
  });
});
