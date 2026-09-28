import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId, unauthorized } from '@/lib/auth';
import { loadAiSettingsConfig, resolveApiKey } from '@/lib/ai/ai-settings';
import { openAiChat } from '@/lib/ai/openai';
import { isReasoningModel, languageName } from '@/lib/speaking/judge';
import {
  FREE_TALK_TURNS,
  buildFreeTalkMessages,
  buildPool,
  closingLine,
  freeTalkable,
  isClosingTurn,
  nextPick,
  parseFreeTalkReply,
  partnerTurns,
  type FreeTalkInput,
  type FreeTalkLine,
} from '@/lib/speaking/freetalk';
import { inTargetScript } from '@/lib/speaking/chat';

export const dynamic = 'force-dynamic';

/**
 * POST /api/ai/speaking/freetalk — «Озод гап занед» (27.09.2026).
 *
 * Body: { categoryId? | lessonId?, history: [{who, text}] }
 * Ҷавоб: { reply, replyTranslation, replyAudioUrl, understood, fix, turn,
 *          maxTurns, done }
 *
 * Ҳамсӯҳбат ТАНҲО сатрҳои тасдиқшудаи ҳамин вазъиятро мегӯяд (тарҷума ва
 * аудио аз база); AI сатрро интихоб мекунад ва ҷавоби озоди хонандаро
 * мефаҳмад — сабаб дар `lib/speaking/freetalk.ts`.
 *
 * Ҳар дархост = як навбати ҳамсӯҳбат. Таърих ҲАР БОР аз клиент меояд
 * (сервер ҳолат нигоҳ намедорад) — вале бо `freeTalkable` санҷида мешавад.
 *
 * ⚠️ Гейт: танҳо баъди МИССИЯи ҳамин вазъият. Суҳбати озод мукофоти
 * тамом кардани вазъият аст ва бе калимаҳои он навомӯз ҳеҷ чиз гуфта
 * наметавонад. Миссия худаш премиум аст, пас ин ҷо қоидаи дигар лозим нест.
 *
 * ⚠️ Хароҷот: [DAILY_LIMIT] навбат дар рӯз (~10 суҳбат), дар хотираи
 * инстанс — ҳамон модели `/judge`.
 */
const DAILY_LIMIT = 60;
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

function parseHistory(v: unknown): FreeTalkLine[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter(
      (l): l is { who: string; text: string } =>
        !!l && typeof l === 'object' &&
        typeof (l as { who?: unknown }).who === 'string' &&
        typeof (l as { text?: unknown }).text === 'string',
    )
    .map((l) => ({ who: l.who === 'partner' ? 'partner' : 'me', text: l.text }) as FreeTalkLine);
}

export async function POST(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    if (!userId) return unauthorized('Missing or invalid Bearer token.');

    const body = (await req.json().catch(() => ({}))) as {
      categoryId?: unknown;
      lessonId?: unknown;
      history?: unknown;
    };
    const lessonId = typeof body.lessonId === 'string' ? body.lessonId.trim() : '';
    let categoryId = typeof body.categoryId === 'string' ? body.categoryId.trim() : '';
    if (!categoryId && lessonId) {
      const l = await prisma.speakingLesson.findUnique({
        where: { id: lessonId },
        select: { categoryId: true },
      });
      categoryId = l?.categoryId ?? '';
    }
    if (!categoryId) {
      return NextResponse.json({ error: 'categoryId is required.' }, { status: 400 });
    }

    const category = await prisma.speakingCategory.findUnique({
      where: { id: categoryId },
      select: {
        titleTranslated: true,
        targetLanguage: { select: { code: true } },
        lessons: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            stage: true,
            items: {
              orderBy: { order: 'asc' },
              select: {
                cue: true,
                cueTranslation: true,
                cueAudioUrl: true,
              },
            },
          },
        },
      },
    });
    if (!category) {
      return NextResponse.json({ error: 'Situation not found.' }, { status: 404 });
    }

    // ── Гейт: миссия гузашта шуд ──────────────────────────────────────────
    const missions = category.lessons.filter((l) => l.stage === 'mission');
    const passed = missions.length
      ? await prisma.speakingProgress.count({
          where: { userId, lessonId: { in: missions.map((l) => l.id) } },
        })
      : 0;
    if (passed === 0) {
      return NextResponse.json(
        { error: 'Finish the mission first.', reason: 'mission' },
        { status: 403 },
      );
    }

    // Сатрҳои ҳамсӯҳбат — аз ҳамаи нишастҳо, бо тартиби дарсҳо.
    const pool = buildPool(category.lessons.flatMap((l) => l.items));

    const history = parseHistory(body.history);
    const input: FreeTalkInput = {
      language: languageName(category.targetLanguage.code),
      situation: category.titleTranslated,
      pool,
      history,
    };
    if (!freeTalkable(input)) {
      return NextResponse.json({ error: 'Invalid conversation.', reason: 'invalid' }, { status: 400 });
    }

    const cfg = await loadAiSettingsConfig(prisma);
    const apiKey = resolveApiKey(cfg);
    if (!cfg.enabled || !apiKey) {
      return NextResponse.json({ error: 'AI is off.', reason: 'off' }, { status: 503 });
    }
    if (!spend(userId)) {
      return NextResponse.json({ error: 'Daily limit.', reason: 'limit' }, { status: 429 });
    }

    const reasoning = isReasoningModel(cfg.model);
    const ask = (extra?: Record<string, unknown>) =>
      openAiChat({
        apiKey,
        model: cfg.model,
        baseUrl: cfg.baseUrl,
        messages: buildFreeTalkMessages(input),
        maxTokens: reasoning ? 600 : 150,
        temperature: 0.4,
        timeoutMs: 9000,
        extra,
      });
    let res = await ask(reasoning ? { reasoning_effort: 'low' } : undefined);
    if (!res.ok && reasoning && res.status === 400) res = await ask();
    // ⚠️ AI нашуд (Groq-и ройгон: 8000 токен/дақиқа барои ҲАМА — `429`) →
    // суҳбат НАМЕКАНАД: сатри навбатии ҳавз бо тартиби дарсҳо, бе ислоҳ.
    // Хонанда ҳамсӯҳбатро мешунавад ва гап мезанад; танҳо интихоби «оқилона»
    // ва санҷиши грамматика барои ҳамин навбат нест.
    const aiOk = res.ok && !!res.reply;
    if (!aiOk) {
      console.error(`[speaking/freetalk] AI: ${res.status ?? '-'} ${res.error ?? 'empty'} → сатри пайдарпай`);
    }
    const verdict = parseFreeTalkReply(aiOk ? res.reply! : '', pool.length, history.length === 0);
    // Ислоҳи «беҳтар» бо забони ДИГАР (модел гоҳ бо забони хонанда ҷавоб медиҳад) — нест.
    if (verdict.fix && !inTargetScript(verdict.fix.better, category.targetLanguage.code)) verdict.fix = null;

    // Навбати охирин — видоъ; дигарон — сатри ҳавз (интихоби модел ё
    // аввалин сатри нав, агар модел ғалат кард).
    const done = isClosingTurn(history);
    const line = done
      ? closingLine(category.targetLanguage.code)
      : pool[nextPick(pool, history, verdict.pick)];

    const turn = partnerTurns(history) + 1;
    console.log(`[speaking/freetalk] ${input.language} · навбат ${turn}/${FREE_TALK_TURNS} · сатр ${verdict.pick}${verdict.fix ? ' · ислоҳ' : ''}${verdict.understood ? '' : ' · нафаҳмид'}`);
    return NextResponse.json({
      reply: line.text,
      replyTranslation: line.tg,
      replyAudioUrl: line.audioUrl,
      understood: verdict.understood,
      fix: verdict.fix,
      turn,
      maxTurns: FREE_TALK_TURNS,
      done,
      aiOk,
    });
  } catch (e) {
    console.error('[speaking/freetalk] failed:', e);
    return NextResponse.json({ error: 'Failed.', reason: 'error' }, { status: 500 });
  }
}
