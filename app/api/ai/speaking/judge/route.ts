import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId, unauthorized } from '@/lib/auth';
import { loadAiSettingsConfig, resolveApiKey } from '@/lib/ai/ai-settings';
import { openAiChat } from '@/lib/ai/openai';
import {
  buildJudgeMessages,
  judgeable,
  languageName,
  parseJudgeReply,
  type JudgeInput,
} from '@/lib/speaking/judge';

export const dynamic = 'force-dynamic';

/**
 * POST /api/ai/speaking/judge — «AI-довар» (қадами 7).
 *
 * Body: { language, cue, intent, answers[], heard }
 * Ҷавоб: { ok, fix } — `ok: false` ҳамеша бехатар аст (хонанда боз мегӯяд).
 *
 * Клиент инро ТАНҲО вақте мепурсад, ки муқоиса бо ҷавобҳои навиштаи
 * (`accepts`) маъноро наёфт — пас дархостҳо каманд ва ҳар кадом ҷавоби
 * воқеии хонанда аст.
 *
 * ⚠️ Хароҷот: ҳадди рӯзонаи ҳар корбар [DAILY_LIMIT] (дар хотираи инстанс —
 * тахминӣ, вале бо промпти ~150 токен ва Groq-и ройгон кифоя). Довар хомӯш /
 * калид нест → `503`, клиент ҳамон рафтори пештараро дорад.
 */
const DAILY_LIMIT = 80;
const used = new Map<string, { day: string; n: number }>();

function spend(userId: string): boolean {
  const day = new Date().toISOString().slice(0, 10);
  const u = used.get(userId);
  if (!u || u.day !== day) {
    used.set(userId, { day, n: 1 });
    return true;
  }
  if (u.n >= DAILY_LIMIT) return false;
  u.n++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    if (!userId) return unauthorized('Missing or invalid Bearer token.');

    const body = (await req.json().catch(() => ({}))) as Partial<JudgeInput>;
    const input: JudgeInput = {
      language: languageName(String(body.language ?? '').slice(0, 40)),
      cue: String(body.cue ?? ''),
      intent: String(body.intent ?? ''),
      answers: Array.isArray(body.answers)
        ? body.answers.filter((a): a is string => typeof a === 'string' && a.trim() !== '')
        : [],
      heard: String(body.heard ?? ''),
    };
    if (!judgeable(input)) {
      return NextResponse.json({ ok: false, fix: '', reason: 'invalid' }, { status: 400 });
    }

    const cfg = await loadAiSettingsConfig(prisma);
    const apiKey = resolveApiKey(cfg);
    if (!cfg.enabled || !apiKey) {
      return NextResponse.json({ ok: false, fix: '', reason: 'off' }, { status: 503 });
    }
    if (!spend(userId)) {
      return NextResponse.json({ ok: false, fix: '', reason: 'limit' }, { status: 429 });
    }

    const res = await openAiChat({
      apiKey,
      model: cfg.model,
      baseUrl: cfg.baseUrl,
      messages: buildJudgeMessages(input),
      maxTokens: 80,
      temperature: 0,
      timeoutMs: 4000,
    });
    if (!res.ok || !res.reply) {
      return NextResponse.json({ ok: false, fix: '', reason: 'ai' }, { status: 502 });
    }
    const verdict = parseJudgeReply(res.reply);
    console.log(`[speaking/judge] ${verdict.ok ? 'ҚАБУЛ' : 'рад'} · ${input.language} · калима ${input.heard.trim().split(/\s+/).length}`);
    return NextResponse.json(verdict);
  } catch (e) {
    console.error('[speaking/judge] failed:', e);
    return NextResponse.json({ ok: false, fix: '', reason: 'error' }, { status: 500 });
  }
}
