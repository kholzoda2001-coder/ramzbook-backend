import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/reports?status=new
 *
 * Гузоришҳо ГУРӮҲБАНДӢ шуда бармегарданд — як сатр ба ҳар
 * `contentId + field`, на як сатр ба ҳар гузориш.
 *
 * ЧАРО: ҳашт хонанда метавонанд ҲАМОН як тарҷумаи хаторо гузориш диҳанд.
 * Ҳашт сатри ҷудогона маънои ҳашт бор ҳал кардани як чизро дошт. Ин ҷо онҳо
 * як сатранд ва як бор ҳал мешаванд.
 *
 * Ҳар гурӯҳ медиҳад:
 *   • майдон (`field`) ва қимати ҶОРИИ он аз базаи мазмун;
 *   • чанд корбар гузориш додааст;
 *   • тақсимоти сабабҳо;
 *   • ҳамаи пешниҳодҳо (`suggestion`).
 */
export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get('status') || 'new';

    const rows = await prisma.contentReport.findMany({
      where: status === 'all' ? {} : { status },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userId: true,
        lessonId: true,
        moduleId: true,
        contentId: true,
        exerciseType: true,
        field: true,
        value: true,
        reason: true,
        suggestion: true,
        status: true,
        rewarded: true,
        course: true,
        uiLanguage: true,
        appVersion: true,
        createdAt: true,
      },
    });

    // ── Гурӯҳбандӣ ────────────────────────────────────────────────────────
    type Group = {
      contentId: string;
      field: string;
      status: string;
      lessonId: string;
      moduleId: string | null;
      exerciseTypes: string[];
      reportedValue: string;
      currentValue: string | null;
      reportCount: number;
      userCount: number;
      rewardedCount: number;
      reasons: Record<string, number>;
      suggestions: { text: string; at: Date }[];
      firstAt: Date;
      lastAt: Date;
      course: string | null;
      reportIds: string[];
    };

    // Объекти оддӣ, на `Map` — tsconfig ба ES5 нишон гирифтааст.
    const groups: Record<string, Group> = {};
    for (const r of rows) {
      const key = `${r.contentId}::${r.field}::${r.status}`;
      let g = groups[key];
      if (!g) {
        g = {
          contentId: r.contentId,
          field: r.field,
          status: r.status,
          lessonId: r.lessonId,
          moduleId: r.moduleId,
          exerciseTypes: [],
          reportedValue: r.value,
          currentValue: null,
          reportCount: 0,
          userCount: 0,
          rewardedCount: 0,
          reasons: {},
          suggestions: [],
          firstAt: r.createdAt,
          lastAt: r.createdAt,
          course: r.course,
          reportIds: [],
        };
        groups[key] = g;
      }
      g.reportCount++;
      g.reportIds.push(r.id);
      if (r.rewarded) g.rewardedCount++;
      g.reasons[r.reason] = (g.reasons[r.reason] ?? 0) + 1;
      if (r.suggestion) g.suggestions.push({ text: r.suggestion, at: r.createdAt });
      if (!g.exerciseTypes.includes(r.exerciseType)) g.exerciseTypes.push(r.exerciseType);
      if (r.createdAt < g.firstAt) g.firstAt = r.createdAt;
      if (r.createdAt > g.lastAt) g.lastAt = r.createdAt;
    }

    // Корбарони ЯГОНА дар ҳар гурӯҳ — «чанд нафар» на «чанд сатр».
    const usersByKey: Record<string, Record<string, true>> = {};
    rows.forEach((r) => {
      const key = `${r.contentId}::${r.field}::${r.status}`;
      (usersByKey[key] ??= {})[r.userId] = true;
    });
    Object.keys(groups).forEach((key) => {
      groups[key].userCount = Object.keys(usersByKey[key] ?? {}).length;
    });

    // ── Қимати ҶОРӢ аз базаи мазмун ───────────────────────────────────────
    // Панел бояд нишон диҳад, ки ҳоло дар база ЧӢ ҳаст — на танҳо он чи
    // хонанда моҳи пеш дида буд. Агар онҳо фарқ кунанд, хато аллакай
    // ислоҳ шудааст ва гурӯҳро танҳо бастан лозим аст.
    const seenIds: Record<string, true> = {};
    const wordIds = Object.keys(groups)
      .map((k) => groups[k].contentId)
      .filter((id) => (seenIds[id] ? false : (seenIds[id] = true)));
    const words = wordIds.length
      ? await prisma.word.findMany({
          where: { id: { in: wordIds } },
          select: {
            id: true, word: true, translation: true, ipa: true, ipaTajik: true,
            example: true, exampleTrans: true, audioUrl: true, emoji: true,
            lesson: {
              select: {
                id: true, title: true, titleTranslated: true,
                module: { select: { id: true, title: true, titleTranslated: true } },
              },
            },
          },
        })
      : [];
    const wordById: Record<string, (typeof words)[number]> = {};
    words.forEach((w) => {
      wordById[w.id] = w;
    });

    // ── Ҳамон чиз барои бахши ГУФТОР ──────────────────────────────────────
    //
    // Гузоришҳои спикинг `SpeakingItem.id` мебаранд, на `Word.id` — он ҷо
    // занҷири мазмуни ХУДАШ ҳаст (SpeakingCategory → SpeakingLesson →
    // SpeakingItem). Бе ин ҷустуҷӯ панел барои онҳо на «ҳоло дар база» ва на
    // контекст нишон намедод: як сатри `cmq…` бе ҳеҷ маъно.
    //
    // Танҳо id-ҳое пурсида мешаванд, ки дар калимаҳо ЁФТ НАШУДАНД — яъне
    // барои курси роҳнамо ягон дархости изофӣ намеравад.
    const speakingIds = wordIds.filter((id) => !wordById[id]);
    const speakingItems = speakingIds.length
      ? await prisma.speakingItem.findMany({
          where: { id: { in: speakingIds } },
          select: {
            id: true, text: true, translation: true, literal: true,
            note: true, audioUrl: true, cue: true, cueTranslation: true,
            lesson: {
              select: {
                id: true, title: true,
                category: { select: { id: true, titleTranslated: true } },
              },
            },
          },
        })
      : [];
    const speakingById: Record<string, (typeof speakingItems)[number]> = {};
    speakingItems.forEach((i) => {
      speakingById[i.id] = i;
    });

    /** Калиди майдон → сутуни воқеии база. */
    const currentValueOf = (contentId: string, field: string): string | null => {
      const sp = speakingById[contentId];
      if (sp) {
        switch (field) {
          case 'word_target': return sp.text;
          case 'word_native': return sp.translation;
          // Дар спикинг транслитератсия дар `literal` нигоҳ дошта мешавад.
          case 'ipa_native': return sp.literal;
          case 'note': return sp.note;
          case 'audio': return sp.audioUrl;
          case 'cue_target': return sp.cue;
          case 'cue_native': return sp.cueTranslation;
          default: return null;
        }
      }

      const w = wordById[contentId];
      if (!w) return null;
      switch (field) {
        case 'word_target': return w.word;
        case 'word_native': return w.translation;
        case 'ipa': return w.ipa;
        case 'ipa_native': return w.ipaTajik;
        case 'example_target': return w.example;
        case 'example_native': return w.exampleTrans;
        case 'audio': return w.audioUrl;
        case 'emoji': return w.emoji;
        default: return null; // option_N / image_N — аз калима нестанд
      }
    };

    const out = Object.keys(groups).map((k) => {
      const g = groups[k];
      const w = wordById[g.contentId];
      const si = speakingById[g.contentId];
      return {
        ...g,
        currentValue: currentValueOf(g.contentId, g.field),
        // Контексти хонданӣ барои панел — бе ин админ намедонад, ки
        // «cmq…» кадом калима аст.
        context: w
          ? {
              word: w.word,
              translation: w.translation,
              lessonTitle: w.lesson?.titleTranslated || w.lesson?.title || null,
              moduleTitle:
                w.lesson?.module?.titleTranslated || w.lesson?.module?.title || null,
            }
          : si
            ? {
                word: si.text,
                translation: si.translation,
                lessonTitle: si.lesson?.title || null,
                // «Боб»-и спикинг ҷои «бахш»-и роҳнаморо мегирад: панел
                // ҳамон сатрро мекашад ва тағйири UI лозим нест.
                moduleTitle: si.lesson?.category?.titleTranslated || null,
              }
            : null,
      };
    });

    // Гурӯҳи серхонанда — болотар.
    out.sort((a, b) => b.userCount - a.userCount || +b.lastAt - +a.lastAt);

    return NextResponse.json({ groups: out, totalReports: rows.length });
  } catch (err: any) {
    console.error('[admin/reports GET]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
