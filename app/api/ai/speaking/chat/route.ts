import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId, unauthorized } from '@/lib/auth';
import { loadAiSettingsConfig, resolveApiKey } from '@/lib/ai/ai-settings';
import { openAiChat } from '@/lib/ai/openai';
import { translateTexts } from '@/lib/ai/translate';
import { synthesizeMp3 } from '@/lib/ai/tts';
import { isReasoningModel, languageName } from '@/lib/speaking/judge';
import {
  A1_TOPICS,
  CHAT_LEVEL,
  FREE_TURNS,
  freeTalkAllowed,
  PREMIUM_TURNS,
  TOPICS_AT_TURN,
  buildChatMessages,
  chatValid,
  learnerTurns,
  mergeMemory,
  parseChatReply,
  parseHints,
  replyProblem,
  retryNote,
  trimToOneQuestion,
  saysGoodbye,
  type ChatLine,
  type ChatMode,
} from '@/lib/speaking/chat';

export const dynamic = 'force-dynamic';

/**
 * POST /api/ai/speaking/chat — «Сӯҳбат бо AI» (27.09.2026).
 *
 * Body: { sessionId, langId, mode: 'turn' | 'hint', history: [{who: 'ai'|'me', text}] }
 *
 *   turn → { reply, replyTranslation, translationExact, audio, topics, fix,
 *            name, turn, maxTurns, done }
 *   hint → { hints: [{say, tg}], translationExact }
 *
 * Таърих ҳар бор аз клиент меояд; сервер хотира (ном, далелҳо) ва шумораи
 * навбатҳоро нигоҳ медорад. Ҳадди ройгон: [FREE_TALKS_TOTAL] суҳбат дар
 * умр ва [FREE_TURNS] навбат; Premium — [PREMIUM_TURNS] навбат, бемаҳдуд.
 */

const SESSION_RE = /^[a-zA-Z0-9-]{8,64}$/;

function parseHistory(v: unknown): ChatLine[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter(
      (l): l is { who: string; text: string } =>
        !!l && typeof l === 'object' &&
        typeof (l as { who?: unknown }).who === 'string' &&
        typeof (l as { text?: unknown }).text === 'string',
    )
    .map((l) => ({ who: l.who === 'ai' ? 'ai' : 'me', text: l.text }) as ChatLine);
}

export async function POST(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    if (!userId) return unauthorized('Missing or invalid Bearer token.');

    const body = (await req.json().catch(() => ({}))) as {
      sessionId?: unknown;
      langId?: unknown;
      mode?: unknown;
      history?: unknown;
    };
    const sessionId = typeof body.sessionId === 'string' ? body.sessionId.trim() : '';
    const langId = typeof body.langId === 'string' ? body.langId.trim() : '';
    const mode: ChatMode =
      body.mode === 'hint' ? 'hint' : body.mode === 'nudge' ? 'nudge' : 'turn';
    if (!SESSION_RE.test(sessionId) || !langId) {
      return NextResponse.json({ error: 'sessionId and langId are required.', reason: 'invalid' }, { status: 400 });
    }

    const [user, language] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { isPremium: true, nativeLang: true } }),
      prisma.language.findUnique({ where: { id: langId }, select: { code: true } }),
    ]);
    if (!user || !language) {
      return NextResponse.json({ error: 'Not found.', reason: 'invalid' }, { status: 404 });
    }

    // ── Сессия ва ҳадди ройгон ────────────────────────────────────────────
    let session = await prisma.speakingChatSession.findUnique({ where: { id: sessionId } });
    if (session && session.userId !== userId) {
      return NextResponse.json({ error: 'Foreign session.', reason: 'invalid' }, { status: 403 });
    }
    // Ройгон: [FREE_TALKS_TOTAL] суҳбат дар умр. Сессияе, ки хонанда дар он
    // ҳанӯз гап назадааст (`turns = 0`), ҳар бор санҷида мешавад.
    if (!user.isPremium && (session?.turns ?? 0) === 0) {
      const used = await prisma.speakingChatSession.count({
        where: { userId, turns: { gt: 0 }, id: { not: sessionId } },
      });
      if (!freeTalkAllowed(used, session?.turns ?? 0)) {
        return NextResponse.json({ error: 'Free talks used.', reason: 'limit' }, { status: 403 });
      }
    }
    if (!session) {
      session = await prisma.speakingChatSession.create({
        data: { id: sessionId, userId, languageId: langId },
      });
    }

    const maxTurns = user.isPremium ? PREMIUM_TURNS : FREE_TURNS;
    const history = parseHistory(body.history);
    if (!chatValid(history, mode, maxTurns)) {
      return NextResponse.json({ error: 'Invalid conversation.', reason: 'invalid' }, { status: 400 });
    }

    // ── Хонанда: хотира, ибораҳои омӯхта, сатҳ ───────────────────────────
    const [memRow, knownRows] = await Promise.all([
      prisma.speakingChatMemory.findUnique({ where: { userId } }),
      prisma.speakingItem.findMany({
        where: {
          kind: { in: ['word', 'sentence'] },
          lesson: { progress: { some: { userId } }, category: { targetLanguageId: langId } },
        },
        select: { text: true },
        orderBy: { id: 'desc' },
        take: 60,
      }),
    ]);
    const memory = { name: memRow?.name ?? '', facts: memRow?.facts ?? [] };
    const known = knownRows
      .map((r) => r.text.trim())
      .filter((t) => t && !t.includes('{') && !t.includes('___'));
    // Ҳамеша A1 — ниг. [CHAT_LEVEL]. Мавзӯи оғоз ҳар бор тасодуфӣ, то
    // «Как твой день?» ҳар суҳбат такрор нашавад.
    const level = CHAT_LEVEL;
    const openTopic = A1_TOPICS[Math.floor(Math.random() * A1_TOPICS.length)];
    const closing = mode === 'turn' && learnerTurns(history) >= maxTurns;

    const cfg = await loadAiSettingsConfig(prisma);
    const apiKey = resolveApiKey(cfg);
    if (!cfg.enabled || !apiKey) {
      return NextResponse.json({ error: 'AI is off.', reason: 'off' }, { status: 503 });
    }
    const reasoning = isReasoningModel(cfg.model);
    const messages = buildChatMessages(
      { language: languageName(language.code), level, memory, known, history, closing, openTopic },
      mode,
    );
    const ask = async (note?: string) => {
      const call = (extra?: Record<string, unknown>) =>
        openAiChat({
          apiKey,
          model: cfg.model,
          baseUrl: cfg.baseUrl,
          messages: note ? [...messages, { role: 'user', content: note }] : messages,
          maxTokens: reasoning ? 900 : 350,
          temperature: 0.7,
          timeoutMs: 9000,
          extra,
        });
      let res = await call(reasoning ? { reasoning_effort: 'low' } : undefined);
      if (!res.ok && reasoning && res.status === 400) res = await call();
      // Groq-и ройгон: 8000 токен/дақиқа барои ҲАМА — як бори дигар баъди таваққуф.
      if (!res.ok && res.status === 429) {
        await new Promise((r) => setTimeout(r, 1500));
        res = await call(reasoning ? { reasoning_effort: 'low' } : undefined);
      }
      return res;
    };
    const native = (user.nativeLang || 'tg').split('-')[0];
    const translate = native !== language.code.split('-')[0];

    // ── «Чӣ гӯям?» ───────────────────────────────────────────────────────
    if (mode === 'hint') {
      const res = await ask();
      const hints = res.ok && res.reply ? parseHints(res.reply) : [];
      if (!hints.length) {
        console.error(`[speaking/chat] hint: ${res.status ?? '-'} ${res.error ?? 'unparsable'}`);
        return NextResponse.json({ error: 'AI failed.', reason: 'ai' }, { status: 502 });
      }
      const tr = translate ? await translateTexts(hints.map((h) => h.say), native, language.code) : null;
      return NextResponse.json({
        hints: hints.map((h, k) => ({ say: h.say, tg: tr?.[k] || h.tg })),
        translationExact: !!tr,
      });
    }

    // ── Навбат (ва `nudge` — хонанда хомӯш монд) ──────────────────────────
    const noFix = history.length === 0 || mode === 'nudge';
    let res = await ask();
    let parsed = res.ok && res.reply ? parseChatReply(res.reply, noFix) : null;
    if (!parsed && res.ok) {
      res = await ask(); // JSON-и вайрон — як бори дигар
      parsed = res.ok && res.reply ? parseChatReply(res.reply, noFix) : null;
    }
    // Рамз бе савол ё бо саволи ТАКРОРӢ → як бори дигар бо дастури равшан.
    // Кӯшиши дуюм ҳам бад бошад — ҳамонро медиҳем (суҳбат беҳтар аз хато).
    const problem = parsed
      ? replyProblem(parsed.reply, history, {
          closing: mode === 'turn' && closing,
          goodbye: mode === 'turn' && parsed.goodbye,
        })
      : null;
    if (parsed && problem) {
      const again = await ask(retryNote(problem));
      const second = again.ok && again.reply ? parseChatReply(again.reply, noFix) : null;
      const secondProblem = second
        ? replyProblem(second.reply, history, { closing: false, goodbye: second.goodbye })
        : problem;
      console.log(`[speaking/chat] ${problem} → ${second ? secondProblem ?? 'ислоҳ шуд' : 'кӯшиши 2 нашуд'}`);
      // Кӯшиши дуюм танҳо вақте, ки беҳтар аст (ё ҳадди ақал на бадтар).
      if (second && (!secondProblem || secondProblem === problem || problem === 'repeat')) {
        parsed = second;
      }
    }
    // Захираи охирин: ду савол → танҳо аввалаш (A1).
    if (parsed && replyProblem(parsed.reply, history, { closing: false, goodbye: parsed.goodbye }) === 'many_questions') {
      parsed = { ...parsed, reply: trimToOneQuestion(parsed.reply) };
    }
    if (!parsed) {
      console.error(`[speaking/chat] AI: ${res.status ?? '-'} ${res.error ?? 'unparsable'}`);
      return NextResponse.json({ error: 'AI failed.', reason: 'ai' }, { status: 502 });
    }

    // Хотира: ном ва далелҳои нав.
    const merged = mergeMemory(memory, parsed);
    if (merged.name !== memory.name || merged.facts.length !== memory.facts.length) {
      await prisma.speakingChatMemory.upsert({
        where: { userId },
        create: { userId, name: merged.name, facts: merged.facts },
        update: { name: merged.name, facts: merged.facts },
      });
    }

    const lastMine = [...history].reverse().find((l) => l.who === 'me')?.text ?? '';
    const done =
      mode === 'turn' && (closing || parsed.goodbye || (!!lastMine && saysGoodbye(lastMine)));

    await prisma.speakingChatSession.update({
      where: { id: sessionId },
      data: { turns: learnerTurns(history), lastAt: new Date() },
    });

    // Тарҷума (Google) ва овоз (Google TTS) — баробар, то вақт кам равад.
    // Ҷумлаи Рамз бо забони омӯзиш аст; шарҳи ислоҳ ва номи мавзӯъҳо — англисӣ.
    const extras = [
      parsed.fix?.why ?? '',
      ...(learnerTurns(history) === TOPICS_AT_TURN ? parsed.topics.map((t) => t.labelEn) : []),
    ];
    const [replyTr, tr, audio] = await Promise.all([
      translate ? translateTexts([parsed.reply], native, language.code) : Promise.resolve(null),
      translate && extras.some(Boolean) ? translateTexts(extras, native, 'en') : Promise.resolve(null),
      synthesizeMp3(parsed.reply, language.code),
    ]);

    console.log(`[speaking/chat] ${language.code} · навбат ${learnerTurns(history)}/${maxTurns}${parsed.fix ? ' · ислоҳ' : ''}${done ? ' · тамом' : ''}${replyTr ? '' : ' · тарҷумаи модел'}${audio ? '' : ' · бе овоз'}`);
    // Мавзӯъ — ТАНҲО дар навбати муайян, ҳатто агар модел ҳар бор фиристад.
    const topics = learnerTurns(history) === TOPICS_AT_TURN ? parsed.topics : [];
    return NextResponse.json({
      reply: parsed.reply,
      replyTranslation: replyTr?.[0] || parsed.replyTg,
      translationExact: !!replyTr,
      audio,
      topics: topics.map((t, k) => ({ label: tr?.[1 + k] || t.label || t.labelEn, say: t.say })),
      // Шарҳ танҳо аз Google: тоҷикии модел боэътимод нест — беҳтар бе шарҳ.
      fix: parsed.fix
        ? { said: parsed.fix.said, better: parsed.fix.better, why: tr?.[0] ?? '' }
        : null,
      name: merged.name,
      turn: learnerTurns(history),
      maxTurns,
      done,
    });
  } catch (e) {
    console.error('[speaking/chat] failed:', e);
    return NextResponse.json({ error: 'Failed.', reason: 'error' }, { status: 500 });
  }
}
