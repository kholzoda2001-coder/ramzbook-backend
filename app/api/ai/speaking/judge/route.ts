import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId, unauthorized } from '@/lib/auth';
import { loadAiSettingsConfig, resolveApiKey } from '@/lib/ai/ai-settings';
import { openAiChat } from '@/lib/ai/openai';
import {
  GEMINI_JUDGE_TIMEOUT_MS,
  GEMINI_OPENAI_BASE,
  geminiJudgeConfig,
  geminiSkipped,
  noteGeminiFailure,
  usableJudgeReply,
} from '@/lib/speaking/judge-gemini';
import {
  buildJudgeMessages,
  isReasoningModel,
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
    const gem = geminiJudgeConfig(process.env);
    // Тугмаи админ (`cfg.enabled`) ҳамеша ҳал мекунад; калиди Groq ё Gemini — яке кофӣ аст.
    if (!cfg.enabled || (!apiKey && !gem.enabled)) {
      return NextResponse.json({ ok: false, fix: '', reason: 'off' }, { status: 503 });
    }
    if (!spend(userId)) {
      return NextResponse.json({ ok: false, fix: '', reason: 'limit' }, { status: 429 });
    }

    const messages = buildJudgeMessages(input);
    let res: Awaited<ReturnType<typeof openAiChat>> | null = null;
    let via = 'primary';

    // 1) Gemini Flash-Lite — зуд (~0.7 с) ва ҳадди ҶУДО аз Groq. Ноком → 2).
    if (gem.enabled && !geminiSkipped(Date.now())) {
      const g = await openAiChat({
        apiKey: gem.apiKey,
        model: gem.model,
        baseUrl: GEMINI_OPENAI_BASE,
        messages,
        maxTokens: 300,
        temperature: 0,
        timeoutMs: GEMINI_JUDGE_TIMEOUT_MS,
      });
      if (g.ok && usableJudgeReply(g.reply)) {
        res = g;
        via = 'gemini';
      } else {
        noteGeminiFailure(g.status, Date.now());
        console.error(`[speaking/judge] gemini: ${g.status ?? '-'} ${g.ok ? 'unusable reply' : 'failed'} → захира`);
      }
    }

    // 2) Захира: провайдери танзимкардаи админ (Groq ва ғ.) — рафтори пештара.
    if (!res) {
      if (!apiKey) {
        return NextResponse.json({ ok: false, fix: '', reason: 'ai' }, { status: 502 });
      }
      const reasoning = isReasoningModel(cfg.model);
      const ask = (extra?: Record<string, unknown>) =>
        openAiChat({
          apiKey,
          model: cfg.model,
          baseUrl: cfg.baseUrl,
          messages,
          // Модели фикркунанда токенро ба фикр ҳам сарф мекунад (~30–130).
          maxTokens: reasoning ? 400 : 100,
          temperature: 0,
          timeoutMs: 4000,
          extra,
        });
      let r = await ask(reasoning ? { reasoning_effort: 'low' } : undefined);
      // Провайдере, ки `reasoning_effort`-ро намешиносад → бори дигар бе он.
      if (!r.ok && reasoning && r.status === 400) r = await ask();
      if (!r.ok || !r.reply) {
        console.error(`[speaking/judge] AI: ${r.status ?? '-'} ${r.error ?? 'empty'}`);
        return NextResponse.json({ ok: false, fix: '', reason: 'ai' }, { status: 502 });
      }
      res = r;
    }
    const verdict = parseJudgeReply(res.reply ?? '');
    console.log(`[speaking/judge] ${via} · ${verdict.ok ? 'ҚАБУЛ' : 'рад'} · ${input.language} · калима ${input.heard.trim().split(/\s+/).length}`);
    return NextResponse.json(verdict);
  } catch (e) {
    console.error('[speaking/judge] failed:', e);
    return NextResponse.json({ ok: false, fix: '', reason: 'error' }, { status: 500 });
  }
}
