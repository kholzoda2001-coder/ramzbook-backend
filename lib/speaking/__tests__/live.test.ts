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
  transcriptionLocale,
  clampReportedTurns,
  cleanResumeHandle,
  DAY_MS,
  dayStart,
  freeLimits,
  liveQuotaFor,
  grantFor,
  languageNote,
  levelRule,
  liveConfig,
  liveEnabledFor,
  liveLanguageName,
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
  it('is ON with flag + key; defaults to the model and EVERY learning language', () => {
    const c = liveConfig({ GEMINI_LIVE_CONVERSATION_ENABLED: 'true', GEMINI_API_KEY: ' k ' });
    expect(c.enabled).toBe(true);
    expect(c.apiKey).toBe('k');
    expect(c.model).toBe(DEFAULT_LIVE_MODEL);
    for (const code of ['en', 'en-US', 'ru', 'ar', 'ko', 'tr', 'de', 'fr', 'kk', 'uz', 'zh-CN']) {
      expect(liveEnabledFor(c, code)).toBe(true);
    }
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

describe('liveLanguageName — номи забон барои ҳар код', () => {
  it('забонҳои маълум ва бо минтақа', () => {
    expect(liveLanguageName('en')).toBe('English');
    expect(liveLanguageName('ru-RU')).toBe('Russian');
    expect(liveLanguageName('zh_CN')).toBe('Chinese');
    expect(liveLanguageName('tg')).toBe('Tajik');
  });
  it('забонҳое, ки дар рӯйхат нестанд, аз Intl (на код)', () => {
    expect(liveLanguageName('kk')).toBe('Kazakh');
    expect(liveLanguageName('uz')).toBe('Uzbek');
    expect(liveLanguageName('ky')).toBe('Kyrgyz');
  });
  it('код нодуруст ё холӣ — ҳеҷ гоҳ хато нест', () => {
    expect(liveLanguageName('')).toBe('English');
    expect(() => liveLanguageName('123')).not.toThrow();
    expect(liveLanguageName('xx')).toBe('xx');
  });
});

describe('languageNote / забони модарӣ', () => {
  it('услуби гуфтор: кореягӣ 해요체, олмонӣ «du», туркӣ «sen», арабӣ MSA; дигарон — ҳеҷ', () => {
    expect(languageNote('Korean')).toContain('해요체');
    expect(languageNote('German')).toContain('"du"');
    expect(languageNote('Turkish')).toContain('"sen"');
    expect(languageNote('Arabic')).toContain('Modern Standard Arabic');
    expect(languageNote('English')).toBe('');
    expect(languageNote('Russian')).toBe('');
  });
  it('ТАНҲО забони омӯзиш: хоҳиши «бо забони дигар гап зан» рад мешавад (11.10.2026)', () => {
    const p = buildLivePrompt({ language: 'English', native: 'Tajik' });
    expect(p).toContain('This conversation is ONLY in English');
    expect(p).toContain('NEVER switch');
    expect(p).toContain('Tajik, Russian, English or any other');
    expect(p).toContain('never speak a whole sentence in Tajik');
    // Пештар: «ONE short, simple sentence in {native}» — хонанда метавонист
    // тамоми суҳбатро ба забони дигар гардонад.
    expect(p).not.toContain('ONE short, simple sentence in');
  });
  it('мисли муаллим фаҳмонад — бо ҳамон забон; забони модарӣ танҳо ЯК калима', () => {
    const p = buildLivePrompt({ language: 'German', native: 'Russian' });
    expect(p).toContain('Explain like a good teacher, in German');
    expect(p).toContain('ONE key word in Russian (a single word, never a sentence)');
    expect(p).toContain('native language is Russian');
    expect(p).not.toContain('Tajik');
    expect(buildLivePrompt({ language: 'Korean' })).toContain('해요체');
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
  it('суҳбат КОМИЛАН озод: мавзӯъ, роҳ ва ниша таҳмил намешавад', () => {
    const p = buildLivePrompt({ language: 'English' });
    expect(p).toContain('completely FREE conversation');
    expect(p).toContain('ANY topic is welcome');
    expect(p).toContain('never steer them to a topic, a job, a course or a situation');
    expect(p).toContain('Stay on THEIR topic');
    // Ҳеҷ рӯйхати мавзӯъ (оилa, кор, футбол…) ва ҳеҷ ибораи курс дар промпт нест.
    for (const w of ['construction', 'cement', 'football', 'family', 'hobbies', 'daily routine']) {
      expect(p.toLowerCase()).not.toContain(w);
    }
    expect(p).not.toContain('already practised');
  });
  it('оғоз: бе ном — ном мепурсад, баъд ХОНАНДА мавзӯъро интихоб мекунад; бо ном — «чӣ гап занем?»', () => {
    const noName = buildLivePrompt({ language: 'English' });
    expect(noName).toContain("introduce yourself as Ramz and ask the learner's name");
    expect(noName).toContain('what they would like to talk about');
    expect(noName).toContain('Do NOT suggest a topic');
    const withName = buildLivePrompt({ language: 'English', name: 'Karim', facts: ['works as a builder'] });
    expect(withName).toContain('greet Karim by name and ask');
    expect(withName).toContain('What do you want to talk about?');
    expect(withName).toContain('- works as a builder');
    expect(withName).toContain('never steer the talk to it');
    expect(noName).not.toContain('WHAT YOU REMEMBER');
  });
  it('мавзӯъи нав танҳо аз хонанда меояд; хонанда гум шавад — осонтар, на мавзӯи нав', () => {
    const p = buildLivePrompt({ language: 'English' });
    expect(p).toContain('Change the topic only if THEY change it');
    expect(p).toContain('do not jump to a new topic');
  });
  it('ҳамаи сигналҳои идоракунӣ шарҳ дода шудаанд ва шаблон боқӣ намемонад', () => {
    const p = buildLivePrompt({ language: 'English', level: 'A2', name: 'Ali', facts: ['x'] });
    for (const s of [START_SIGNAL, RESUME_SIGNAL, CLOSING_SIGNAL]) expect(p).toContain(s);
    expect(p).not.toMatch(/\{(language|level|levelRule|startPlan|greetName|memory)\}/);
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
  it('матни хонанда ба забони КУРС баста аст (на тахмини худкор)', () => {
    const s = buildLiveSetup({ model: 'm', voice: 'v', prompt: 'p', langCode: 'en' });
    expect(s.inputAudioTranscription).toEqual({ languageCodes: ['en-US'] });
    expect(s.outputAudioTranscription).toEqual({});
    expect(transcriptionLocale('ru')).toBe('ru-RU');
    expect(transcriptionLocale('ko')).toBe('ko-KR');
    expect(transcriptionLocale('en-GB')).toBe('en-GB');
    expect(transcriptionLocale('fr')).toBe('fr');
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

// ── Лимитҳои дақиқа: ройгон 9 дақиқа дар умр + 3/рӯз; Premium 100/30 рӯз + 10/рӯз ──
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

describe('grantFor — ройгон: 9 дақиқа дар ТАМОМИ умр, на бештар аз 3 дақиқа дар рӯз', () => {
  it('корбари нав — рӯзи аввал 3 дақиқа (180 сония)', () => {
    expect(grantFor(freeLimits, [], T0)).toEqual({ ok: true, seconds: 180 });
  });
  it('имрӯз 3 дақиқа гап зад → day (фардо биёед), на free_used', () => {
    expect(grantFor(freeLimits, [done(180, 3600_000, 180)], T0)).toEqual({ ok: false, reason: 'day' });
  });
  it('3 рӯз × 3 дақиқа: рӯзи 2 ва 3 боз 180 сония; баъд free_used', () => {
    const d1 = done(180, 2 * DAY_MS, 180);
    expect(grantFor(freeLimits, [d1], T0)).toEqual({ ok: true, seconds: 180 });
    const d2 = done(180, DAY_MS + 3600_000, 180);
    expect(grantFor(freeLimits, [d1, d2], T0)).toEqual({ ok: true, seconds: 180 });
    const d3 = done(180, 3 * DAY_MS, 180);
    // 3 × 3 = 9 дақиқа ҷамъ шуд → ройгон тамом, ҳатто дар рӯзи нав.
    expect(grantFor(freeLimits, [d1, d2, d3], T0)).toEqual({ ok: false, reason: 'free_used' });
  });
  it('дақиқаҳо ҷамъ мешаванд, бе вобастагӣ ба вақт (ҳатто 1 сол пеш)', () => {
    // 100 + 120 сония пеш сарф шуд → ҳамагӣ 220 аз 540; ҳадди имрӯз 180.
    const rows = [done(100, 365 * DAY_MS, 180), done(120, 40 * DAY_MS, 180)];
    expect(grantFor(freeLimits, rows, T0)).toEqual({ ok: true, seconds: 180 });
  });
  it('умр наздик ба тамом: 8 дақиқа сарф шуд → ҳамагӣ 60 сония монд', () => {
    const rows = [done(180, 4 * DAY_MS, 180), done(180, 3 * DAY_MS, 180), done(120, 2 * DAY_MS, 180)];
    expect(grantFor(freeLimits, rows, T0)).toEqual({ ok: true, seconds: 60 });
  });
  it('аз ҳадди ақалл (60 с) камтар монд → free_used', () => {
    const rows = [done(180, 4 * DAY_MS, 180), done(180, 3 * DAY_MS, 180), done(121, 2 * DAY_MS, 180)];
    expect(grantFor(freeLimits, rows, T0)).toEqual({ ok: false, reason: 'free_used' });
  });
  it('рӯз — тақвимӣ (Душанбе): суҳбати дирӯз ҳадди имрӯзро намехӯрад', () => {
    const midnight = dayStart(T0);
    const now = midnight + 20 * 60_000; // 00:20
    const late = { liveGrantSeconds: 180, turns: 3, startedAt: new Date(midnight - 10 * 60_000), completedAt: new Date(midnight - 7 * 60_000) };
    const early = { liveGrantSeconds: 180, turns: 3, startedAt: new Date(midnight + 5 * 60_000), completedAt: new Date(midnight + 8 * 60_000) };
    expect(grantFor(freeLimits, [late], now)).toEqual({ ok: true, seconds: 180 });
    expect(grantFor(freeLimits, [early], now)).toEqual({ ok: false, reason: 'day' });
  });
  it('суҳбати бе гап ё чати кӯҳна дақиқаи ройгонро намехӯрад', () => {
    const rows: LiveUsageRow[] = [
      { liveGrantSeconds: 180, turns: 0, startedAt: at(1000), completedAt: null },
      { liveGrantSeconds: 0, turns: 9, startedAt: at(1000), completedAt: at(0) },
    ];
    expect(grantFor(freeLimits, rows, T0)).toEqual({ ok: true, seconds: 180 });
  });
});

describe('grantFor — Premium: 100 дақиқа/30 рӯз ва 10 дақиқа/рӯз (аз 00:00 Душанбе)', () => {
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
  it('ҳадди моҳ: 95 дақиқа дар 30 рӯз → 5 дақиқа мондааст (на 10)', () => {
    // 9 × 10 дақиқа + 5 дақиқа = 95 дақиқа → аз 100 ҳамагӣ 5 дақиқа мондааст.
    const rows = [2, 5, 8, 11, 14, 17, 20, 23, 26].map((d) => done(600, d * DAY_MS)).concat(done(300, 28 * DAY_MS));
    expect(grantFor(premiumLimits, rows, T0)).toEqual({ ok: true, seconds: 300 });
  });
  it('100 дақиқа тамом → month; суҳбати 31 рӯз пеш ҳисоб намешавад', () => {
    const ten = Array.from({ length: 10 }, (_, k) => done(600, (k + 2) * 2.5 * DAY_MS));
    expect(grantFor(premiumLimits, ten, T0)).toEqual({ ok: false, reason: 'month' });
    const old = [...ten.slice(0, 9), done(600, MONTH_MS + DAY_MS)];
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

describe('liveQuotaFor — корти «Бо Рамз гап занед»', () => {
  it('ройгони нав: рӯз 180, умр 540, дастрас 180', () => {
    expect(liveQuotaFor(freeLimits, [], T0)).toEqual({
      plan: 'free', dayLimit: 180, dayLeft: 180, totalLimit: 540, totalLeft: 540,
      totalKind: 'lifetime', availableSeconds: 180, blocked: null,
    });
  });
  it('имрӯз 2 дақиқа гап зад: рӯз 60 монд, дастрас 60', () => {
    const q = liveQuotaFor(freeLimits, [done(120, 3600_000, 180)], T0);
    expect(q.dayLeft).toBe(60);
    expect(q.totalLeft).toBe(420);
    expect(q.availableSeconds).toBe(60);
    expect(q.blocked).toBeNull();
  });
  it('имрӯз 3 дақиқа тамом → blocked day, умр ҳанӯз бор', () => {
    const q = liveQuotaFor(freeLimits, [done(180, 3600_000, 180)], T0);
    expect(q).toMatchObject({ dayLeft: 0, totalLeft: 360, availableSeconds: 0, blocked: 'day' });
  });
  it('9 дақиқа тамом → blocked free_used', () => {
    const rows = [done(180, 4 * DAY_MS, 180), done(180, 3 * DAY_MS, 180), done(180, 2 * DAY_MS, 180)];
    expect(liveQuotaFor(freeLimits, rows, T0)).toMatchObject({
      totalLeft: 0, availableSeconds: 0, blocked: 'free_used',
    });
  });
  it('Premium: рӯз 600, моҳ 6000', () => {
    expect(liveQuotaFor(premiumLimits, [], T0)).toMatchObject({
      plan: 'premium', dayLimit: 600, dayLeft: 600, totalLimit: 6000, totalLeft: 6000,
      totalKind: 'month', availableSeconds: 600, blocked: null,
    });
  });
  it('суҳбати бе гап (turns 0) ҳисоб намешавад', () => {
    const rows: LiveUsageRow[] = [{ liveGrantSeconds: 180, turns: 0, startedAt: at(1000), completedAt: null }];
    expect(liveQuotaFor(freeLimits, rows, T0).dayLeft).toBe(180);
  });
});
