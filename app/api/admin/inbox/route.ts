/**
 * GET /api/admin/inbox — ЯК рӯйхат барои ҳамаи он чи хонанда мефиристад.
 *
 * Ду манбаъ дар як ҷараён: `Feedback` (баҳо + матн) ва `ContentReport`
 * (хатои мазмун, ки дар дохили дарс байрақ зада шудааст). Ниг. `lib/inbox.ts`.
 *
 * Параметрҳо:
 *   type=all|feedback|report
 *   nativeLang=tg           коди забони МОДАРӢ
 *   targetLang=en           коди забони ОМӮЗИШӢ
 *   status=new|fixed|rejected|all   (танҳо ба гузоришҳо дахл дорад)
 *   rating=1..5             (танҳо ба фикрҳо)
 *   unreadOnly=1            (танҳо ба фикрҳо)
 *   q=матн                  ҷустуҷӯ дар матн/пешниҳод/калима
 *   from=ISO&to=ISO         фосилаи сана
 *   skip=0&take=50
 *
 * ⚠️ ГУРӮҲБАНДИИ ГУЗОРИШҲО нигоҳ дошта мешавад: як сатр = як ҷуфти
 * `contentId + field`, на як гузориш. Ҳашт хонанда, ки ҳамон тарҷумаро
 * гузориш додаанд, як сатранд ва як бор ҳал мешаванд.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  langFilterValues,
  loadLanguageDirectory,
  splitCoursePair,
  toLangCode,
  type LangDirectory,
} from '@/lib/inbox';

export const dynamic = 'force-dynamic';

/**
 * Ҳадди сатрҳое, ки барои ЯК саҳифа хонда мешаванд.
 *
 * Ду манбаъ дар хотира ҳамҷоя ва аз нав тартиб дода мешаванд — бе ин
 * саҳифабандии дуруст ғайриимкон аст (сатри 51-уми ҷараёни умумӣ метавонад
 * сатри 3-юми ҷадвали дуюм бошад). Дар ин миқёс — фикрҳои дастии одам —
 * ҳадди 3000 кифоя мекунад; агар рӯзе пур шавад, ҷавоб `truncated: true`
 * медиҳад ва панел инро нишон медиҳад.
 */
const MAX_SCAN = 3000;

type ReportRow = {
  id: string;
  userId: string;
  lessonId: string;
  moduleId: string | null;
  contentId: string;
  exerciseType: string;
  field: string;
  value: string;
  reason: string;
  suggestion: string | null;
  status: string;
  rewarded: boolean;
  course: string | null;
  uiLanguage: string | null;
  appVersion: string | null;
  createdAt: Date;
  user: { id: string; name: string; nativeLang: string; targetLang: string | null } | null;
};

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const type = (sp.get('type') || 'all').toLowerCase();
    const wantFeedback = type === 'all' || type === 'feedback';
    const wantReports = type === 'all' || type === 'report';

    const take = Math.min(200, Math.max(1, Number(sp.get('take')) || 50));
    const skip = Math.max(0, Number(sp.get('skip')) || 0);
    const q = (sp.get('q') ?? '').trim();
    const rating = sp.get('rating') ? Number(sp.get('rating')) : null;
    const unreadOnly = sp.get('unreadOnly') === '1';
    const status = (sp.get('status') || 'all').toLowerCase();
    const nativeLang = (sp.get('nativeLang') || '').trim().toLowerCase() || null;
    const targetLang = (sp.get('targetLang') || '').trim().toLowerCase() || null;

    const from = parseDate(sp.get('from'));
    const to = parseDate(sp.get('to'));
    const createdAt =
      from || to ? { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } : undefined;

    const dir = await loadLanguageDirectory(prisma);

    const [feedbackItems, reportItems, facets, globals] = await Promise.all([
      wantFeedback
        ? loadFeedback(dir, { q, rating, unreadOnly, nativeLang, targetLang, createdAt })
        : Promise.resolve([] as InboxItem[]),
      wantReports
        ? loadReports(dir, { q, status, nativeLang, targetLang, createdAt })
        : Promise.resolve([] as InboxItem[]),
      loadFacets(dir),
      loadGlobals(),
    ]);

    const merged = feedbackItems.concat(reportItems);
    // Ҷараёни ягона — навтарин болотар. Барои гурӯҳи гузоришҳо «сана» =
    // ОХИРИН гузориш: гурӯҳе, ки имрӯз боз шикоят гирифт, набояд поён монад.
    merged.sort((a, b) => +new Date(b.sortAt) - +new Date(a.sortAt));

    const ratings: number[] = [];
    feedbackItems.forEach((i) => {
      if (i.kind === 'feedback') ratings.push(i.rating);
    });

    return NextResponse.json({
      items: merged.slice(skip, skip + take),
      total: merged.length,
      counts: {
        feedback: feedbackItems.length,
        reports: reportItems.length,
        reportsRaw: reportItems.reduce(
          (n, i) => n + (i.kind === 'report' ? i.reportCount : 0),
          0,
        ),
      },
      averageRating: ratings.length
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : null,
      ...globals,
      facets,
      truncated: feedbackItems.length >= MAX_SCAN || reportItems.length >= MAX_SCAN,
    });
  } catch (err: any) {
    console.error('[admin/inbox GET]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}

function parseDate(v: string | null): Date | undefined {
  if (!v) return undefined;
  const d = new Date(v);
  return Number.isNaN(+d) ? undefined : d;
}

// ── Намудҳои ҷараён ────────────────────────────────────────────────────────

interface Common {
  id: string;
  sortAt: string;
  createdAt: string;
  nativeLang: string | null;
  targetLang: string | null;
}

export type InboxItem =
  | (Common & {
      kind: 'feedback';
      rating: number;
      message: string | null;
      source: string;
      lessonsCompleted: number;
      level: string | null;
      platform: string | null;
      isRead: boolean;
      rowId: string;
      user: { id: string; name: string; email: string | null; phone: string | null } | null;
    })
  | (Common & {
      kind: 'report';
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
      suggestions: { text: string; at: string }[];
      firstAt: string;
      lastAt: string;
      course: string | null;
      appVersions: string[];
      level: string | null;
      context: {
        word: string;
        translation: string;
        lessonTitle: string | null;
        moduleTitle: string | null;
      } | null;
    });

// ── Фикрҳо ─────────────────────────────────────────────────────────────────

async function loadFeedback(
  dir: LangDirectory,
  f: {
    q: string;
    rating: number | null;
    unreadOnly: boolean;
    nativeLang: string | null;
    targetLang: string | null;
    createdAt: any;
  },
): Promise<InboxItem[]> {
  // Забон дар SQL филтр мешавад — вале бо ҲАР ДУ шакл (код ва `cuid`-и
  // кӯҳна), вагарна сатрҳои то 2026-08-30 аз филтр меафтоданд.
  const where: any = {
    ...(f.rating && f.rating >= 1 && f.rating <= 5 ? { rating: f.rating } : {}),
    ...(f.unreadOnly ? { isRead: false } : {}),
    ...(f.q ? { message: { contains: f.q, mode: 'insensitive' as const } } : {}),
    ...(f.createdAt ? { createdAt: f.createdAt } : {}),
    ...(f.nativeLang ? { nativeLang: { in: langFilterValues(f.nativeLang, dir) } } : {}),
    ...(f.targetLang ? { targetLang: { in: langFilterValues(f.targetLang, dir) } } : {}),
  };

  const rows = await prisma.feedback.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: MAX_SCAN,
    include: { user: { select: { id: true, name: true, email: true, phone: true } } },
  });

  return rows.map((r) => ({
    kind: 'feedback' as const,
    id: `feedback:${r.id}`,
    rowId: r.id,
    sortAt: r.createdAt.toISOString(),
    createdAt: r.createdAt.toISOString(),
    nativeLang: toLangCode(r.nativeLang, dir),
    targetLang: toLangCode(r.targetLang, dir),
    rating: r.rating,
    message: r.message,
    source: r.source,
    lessonsCompleted: r.lessonsCompleted,
    level: r.level,
    platform: r.platform,
    isRead: r.isRead,
    user: r.user,
  }));
}

// ── Гузоришҳои хатои мазмун ────────────────────────────────────────────────

async function loadReports(
  dir: LangDirectory,
  f: {
    q: string;
    status: string;
    nativeLang: string | null;
    targetLang: string | null;
    createdAt: any;
  },
): Promise<InboxItem[]> {
  const rows = (await prisma.contentReport.findMany({
    where: {
      ...(f.status === 'all' ? {} : { status: f.status }),
      ...(f.createdAt ? { createdAt: f.createdAt } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: MAX_SCAN,
    select: {
      id: true, userId: true, lessonId: true, moduleId: true, contentId: true,
      exerciseType: true, field: true, value: true, reason: true, suggestion: true,
      status: true, rewarded: true, course: true, uiLanguage: true, appVersion: true,
      createdAt: true,
      user: { select: { id: true, name: true, nativeLang: true, targetLang: true } },
    },
  })) as ReportRow[];

  if (rows.length === 0) return [];

  // ── Калимаҳо: қимати ҶОРӢ, контекст ва — муҳимтар — ҶУФТИ ЗАБОН ─────────
  // Ҷуфти забон аз КУРС гирифта мешавад, на аз сатри клиент: сатри `course`
  // метавонад холӣ, кӯҳна ё ним бошад, вале `Word → Lesson → Module → Course`
  // ҳамеша ҳақиқати база аст.
  const seen: Record<string, true> = {};
  const wordIds: string[] = [];
  rows.forEach((r) => {
    if (!seen[r.contentId]) {
      seen[r.contentId] = true;
      wordIds.push(r.contentId);
    }
  });

  const words = await prisma.word.findMany({
    where: { id: { in: wordIds } },
    select: {
      id: true, word: true, translation: true, ipa: true, ipaTajik: true,
      example: true, exampleTrans: true, audioUrl: true, emoji: true,
      lesson: {
        select: {
          id: true, title: true, titleTranslated: true,
          module: {
            select: {
              id: true, title: true, titleTranslated: true,
              course: {
                select: {
                  level: true,
                  nativeLanguage: { select: { code: true } },
                  targetLanguage: { select: { code: true } },
                },
              },
            },
          },
        },
      },
    },
  });
  const wordById: Record<string, (typeof words)[number]> = {};
  words.forEach((w) => {
    wordById[w.id] = w;
  });

  type Group = {
    contentId: string; field: string; status: string; lessonId: string;
    moduleId: string | null; exerciseTypes: string[]; reportedValue: string;
    reportCount: number; rewardedCount: number; reasons: Record<string, number>;
    suggestions: { text: string; at: string }[]; firstAt: Date; lastAt: Date;
    course: string | null; appVersions: string[]; users: Record<string, true>;
    /** Забон аз сатри клиент — резерв, вақте калима дар база ёфт нашуд. */
    fallbackNative: string | null; fallbackTarget: string | null;
  };

  const groups: Record<string, Group> = {};
  rows.forEach((r) => {
    const key = `${r.contentId}::${r.field}::${r.status}`;
    let g = groups[key];
    if (!g) {
      const pair = splitCoursePair(r.course, dir);
      g = {
        contentId: r.contentId, field: r.field, status: r.status,
        lessonId: r.lessonId, moduleId: r.moduleId, exerciseTypes: [],
        reportedValue: r.value, reportCount: 0, rewardedCount: 0, reasons: {},
        suggestions: [], firstAt: r.createdAt, lastAt: r.createdAt,
        course: r.course, appVersions: [], users: {},
        fallbackNative: pair.native ?? toLangCode(r.user?.nativeLang, dir),
        fallbackTarget: pair.target ?? toLangCode(r.user?.targetLang, dir),
      };
      groups[key] = g;
    }
    g.reportCount++;
    g.users[r.userId] = true;
    if (r.rewarded) g.rewardedCount++;
    g.reasons[r.reason] = (g.reasons[r.reason] ?? 0) + 1;
    if (r.suggestion) g.suggestions.push({ text: r.suggestion, at: r.createdAt.toISOString() });
    if (g.exerciseTypes.indexOf(r.exerciseType) < 0) g.exerciseTypes.push(r.exerciseType);
    if (r.appVersion && g.appVersions.indexOf(r.appVersion) < 0) g.appVersions.push(r.appVersion);
    if (r.createdAt < g.firstAt) g.firstAt = r.createdAt;
    if (r.createdAt > g.lastAt) g.lastAt = r.createdAt;
  });

  const ql = f.q.toLowerCase();
  const out: InboxItem[] = [];

  Object.keys(groups).forEach((key) => {
    const g = groups[key];
    const w = wordById[g.contentId];
    const course = w?.lesson?.module?.course;

    const native = course?.nativeLanguage?.code?.toLowerCase() ?? g.fallbackNative;
    const target = course?.targetLanguage?.code?.toLowerCase() ?? g.fallbackTarget;

    if (f.nativeLang && native !== f.nativeLang) return;
    if (f.targetLang && target !== f.targetLang) return;

    if (ql) {
      const haystack = [
        g.reportedValue,
        w?.word ?? '',
        w?.translation ?? '',
        g.suggestions.map((s) => s.text).join(' '),
      ]
        .join(' ')
        .toLowerCase();
      if (haystack.indexOf(ql) < 0) return;
    }

    out.push({
      kind: 'report',
      id: `report:${g.contentId}::${g.field}::${g.status}`,
      sortAt: g.lastAt.toISOString(),
      createdAt: g.firstAt.toISOString(),
      nativeLang: native,
      targetLang: target,
      contentId: g.contentId,
      field: g.field,
      status: g.status,
      lessonId: g.lessonId,
      moduleId: g.moduleId,
      exerciseTypes: g.exerciseTypes,
      reportedValue: g.reportedValue,
      currentValue: currentValueOf(w, g.field),
      reportCount: g.reportCount,
      userCount: Object.keys(g.users).length,
      rewardedCount: g.rewardedCount,
      reasons: g.reasons,
      suggestions: g.suggestions,
      firstAt: g.firstAt.toISOString(),
      lastAt: g.lastAt.toISOString(),
      course: g.course,
      appVersions: g.appVersions,
      level: course?.level ?? null,
      context: w
        ? {
            word: w.word,
            translation: w.translation,
            lessonTitle: w.lesson?.titleTranslated || w.lesson?.title || null,
            moduleTitle: w.lesson?.module?.titleTranslated || w.lesson?.module?.title || null,
          }
        : null,
    });
  });

  return out;
}

/** Калиди майдон → сутуни воқеии база. */
function currentValueOf(w: any, field: string): string | null {
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
}

// ── Рӯйхати забонҳо барои филтр ────────────────────────────────────────────

/**
 * Кадом ҷуфтҳои забон воқеан дар қуттӣ ҳастанд.
 *
 * ⚠️ Аз ҲАМАИ маълумот ҳисоб мешавад, на аз натиҷаи филтри ҷорӣ: рӯйхати
 * афтанда набояд ҳангоми интихоби як забон холӣ шавад — вагарна баргаштан
 * ғайриимкон мебуд.
 */
async function loadFacets(dir: LangDirectory) {
  const [fb, reports] = await Promise.all([
    prisma.feedback.groupBy({
      by: ['nativeLang', 'targetLang'],
      _count: { _all: true },
    }),
    prisma.contentReport.findMany({
      select: {
        contentId: true,
        course: true,
        user: { select: { nativeLang: true, targetLang: true } },
      },
      take: MAX_SCAN,
    }),
  ]);

  // ⚠️ ҲАМОН манбаи ҳақиқат, ки рӯйхат истифода мебарад — курси худи калима.
  // Агар ин ҷо сатри `course`-и клиент гирифта мешуд, рақами дар рӯйхати
  // афтанда бо шумораи сатрҳои воқеӣ мувофиқ намеомад ва панел «дурӯғ»
  // менамуд.
  const seenIds: Record<string, true> = {};
  const ids: string[] = [];
  reports.forEach((r) => {
    if (!seenIds[r.contentId]) {
      seenIds[r.contentId] = true;
      ids.push(r.contentId);
    }
  });
  const pairByContentId: Record<string, { n: string | null; t: string | null }> = {};
  if (ids.length > 0) {
    const words = await prisma.word.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        lesson: {
          select: {
            module: {
              select: {
                course: {
                  select: {
                    nativeLanguage: { select: { code: true } },
                    targetLanguage: { select: { code: true } },
                  },
                },
              },
            },
          },
        },
      },
    });
    words.forEach((w) => {
      const c = w.lesson?.module?.course;
      if (!c) return;
      pairByContentId[w.id] = {
        n: c.nativeLanguage?.code?.toLowerCase() ?? null,
        t: c.targetLanguage?.code?.toLowerCase() ?? null,
      };
    });
  }

  const native: Record<string, number> = {};
  const target: Record<string, number> = {};
  const pairs: Record<string, number> = {};

  const bump = (n: string | null, t: string | null, by: number) => {
    if (n) native[n] = (native[n] ?? 0) + by;
    if (t) target[t] = (target[t] ?? 0) + by;
    if (n || t) {
      const k = `${n ?? '?'}|${t ?? '?'}`;
      pairs[k] = (pairs[k] ?? 0) + by;
    }
  };

  fb.forEach((row: any) => {
    bump(toLangCode(row.nativeLang, dir), toLangCode(row.targetLang, dir), row._count._all);
  });

  reports.forEach((r) => {
    const known = pairByContentId[r.contentId];
    const fallback = splitCoursePair(r.course, dir);
    bump(
      known?.n ?? fallback.native ?? toLangCode(r.user?.nativeLang, dir),
      known?.t ?? fallback.target ?? toLangCode(r.user?.targetLang, dir),
      1,
    );
  });

  const list = (m: Record<string, number>) =>
    Object.keys(m)
      .map((code) => ({
        code,
        count: m[code],
        name: dir.byCode[code]?.name ?? code,
        nativeName: dir.byCode[code]?.nativeName ?? code,
        flag: dir.byCode[code]?.flag ?? '🌐',
      }))
      .sort((a, b) => b.count - a.count);

  return {
    native: list(native),
    target: list(target),
    pairs: Object.keys(pairs)
      .map((k) => {
        const parts = k.split('|');
        return { native: parts[0], target: parts[1], count: pairs[k] };
      })
      .sort((a, b) => b.count - a.count),
  };
}

/** Рақамҳое, ки аз филтр вобаста НЕСТАНД — «чӣ қадар кор мондааст». */
async function loadGlobals() {
  const [unreadFeedback, openReports, feedbackAll, reportsAll] = await Promise.all([
    prisma.feedback.count({ where: { isRead: false } }),
    prisma.contentReport.count({ where: { status: 'new' } }),
    prisma.feedback.count(),
    prisma.contentReport.count(),
  ]);
  return { unreadFeedback, openReports, feedbackAll, reportsAll };
}
