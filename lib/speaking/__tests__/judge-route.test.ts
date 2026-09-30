/**
 * POST /api/ai/speaking/judge — Gemini аввал, Groq захира. Провайдерҳо қалбакӣ.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/prisma', () => ({ prisma: {} }));
vi.mock('@/lib/auth', () => ({
  requireUserId: () => 'u1',
  unauthorized: () => new Response('no', { status: 401 }),
}));
const settings = { enabled: true, apiKey: 'groq-key', model: 'llama-x', baseUrl: 'https://api.groq.test/openai/v1' };
vi.mock('@/lib/ai/ai-settings', () => ({
  loadAiSettingsConfig: async () => settings,
  resolveApiKey: (c: { apiKey: string }) => c.apiKey,
}));

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/ai/speaking/judge/route';
import { resetGeminiBreaker } from '../judge-gemini';

const GEMINI = 'generativelanguage.googleapis.com';
const GROQ = 'api.groq.test';
const reply = (text: string, status = 200) =>
  new Response(JSON.stringify(status === 200 ? { choices: [{ message: { content: text } }] } : { error: { message: 'x' } }), { status });

let calls: string[];
let handler: (url: string) => Response | Promise<Response>;

function req(heard = 'Меня Рустам зовут') {
  return new NextRequest('http://x/api/ai/speaking/judge', {
    method: 'POST',
    body: JSON.stringify({ language: 'ru', cue: 'Как вас зовут?', intent: 'Ном', answers: ['Меня зовут Рустам'], heard }),
  });
}

beforeEach(() => {
  calls = [];
  resetGeminiBreaker();
  settings.enabled = true;
  vi.stubEnv('GEMINI_API_KEY', 'gem-key');
  vi.stubEnv('GEMINI_JUDGE_ENABLED', '');
  vi.stubGlobal('fetch', async (url: string) => {
    calls.push(url.includes(GEMINI) ? 'gemini' : url.includes(GROQ) ? 'groq' : url);
    return handler(url);
  });
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'log').mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('judge route', () => {
  it('Gemini кор мекунад → ҷавоб аз Gemini, Groq даъват намешавад', async () => {
    handler = () => reply('{"ok": true, "fix": "Меня зовут Рустам"}');
    const r = await POST(req());
    expect(await r.json()).toEqual({ ok: true, fix: 'Меня зовут Рустам' });
    expect(calls).toEqual(['gemini']);
  });

  it('Gemini 429 → ҳамон дархост аз Groq ҷавоб мегирад; баъд 30 с Gemini намепурсад', async () => {
    handler = (u) => (u.includes(GEMINI) ? reply('', 429) : reply('{"ok": true, "fix": ""}'));
    expect((await (await POST(req())).json()).ok).toBe(true);
    expect(calls).toEqual(['gemini', 'groq']);
    calls.length = 0;
    expect((await (await POST(req())).json()).ok).toBe(true);
    expect(calls).toEqual(['groq']); // қатъкунак: Gemini партофта шуд
  });

  it('Gemini ҷавоби нохонда дод → захира, на «рад»', async () => {
    handler = (u) => (u.includes(GEMINI) ? reply('Sure, that is fine!') : reply('{"ok": true, "fix": ""}'));
    expect((await (await POST(req())).json()).ok).toBe(true);
    expect(calls).toEqual(['gemini', 'groq']);
  });

  it('Gemini «рад» мегӯяд — ин ҳукми қатъӣ аст, Groq-ро пурсида наметавонем (рад мемонад)', async () => {
    handler = () => reply('{"ok": false, "fix": "x"}');
    expect((await (await POST(req('Я люблю футбол'))).json()).ok).toBe(false);
    expect(calls).toEqual(['gemini']);
  });

  it('ҳарду ноком → 502 (рафтори пештара; клиент «боз гӯед»)', async () => {
    handler = () => reply('', 500);
    const r = await POST(req());
    expect(r.status).toBe(502);
    expect(calls).toEqual(['gemini', 'groq']);
  });

  it('бе калиди Gemini — танҳо Groq, ҳамон рафтори пештара', async () => {
    vi.stubEnv('GEMINI_API_KEY', '');
    handler = () => reply('{"ok": true, "fix": ""}');
    expect((await (await POST(req())).json()).ok).toBe(true);
    expect(calls).toEqual(['groq']);
  });

  it('тугмаи `GEMINI_JUDGE_ENABLED=false` — Gemini даъват намешавад', async () => {
    vi.stubEnv('GEMINI_JUDGE_ENABLED', 'false');
    handler = () => reply('{"ok": true, "fix": ""}');
    await POST(req());
    expect(calls).toEqual(['groq']);
  });

  it('тугмаи админ хомӯш → 503, ба ҳеҷ провайдер намеравад', async () => {
    settings.enabled = false;
    handler = () => reply('{"ok": true, "fix": ""}');
    expect((await POST(req())).status).toBe(503);
    expect(calls).toEqual([]);
  });

  it('калиди Groq нест, вале Gemini ҳаст → Gemini кор мекунад', async () => {
    const keep = settings.apiKey;
    settings.apiKey = '';
    handler = () => reply('{"ok": true, "fix": ""}');
    expect((await (await POST(req())).json()).ok).toBe(true);
    expect(calls).toEqual(['gemini']);
    settings.apiKey = keep;
  });
});
