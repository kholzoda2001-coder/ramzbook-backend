// ДЕТЕКТОРИ «БАНД МОНДАН» — ҷустуҷӯи ҳолатҳое, ки хонанда дарсро ТАМОМ КАРДА
// НАМЕТАВОНАД (на «душвор», балки ғайриимкон).
//
//   node prisma/_stuck-detector.mjs            # ҳамаи курсҳои фаъол
//   node prisma/_stuck-detector.mjs --first    # танҳо се модули аввал
//
// Ҳар шарт аз рафтори ВОҚЕИИ муҳаррик гирифта шудааст
// (`frontend/lib/screens/unit_lesson_screen.dart` + `utils/match_boards.dart`):
//
//  ① ҶАВОБИ ХОЛӢ — калима ё тарҷумаи холӣ: машқ ҷавоби дуруст надорад.
//  ② ДУ КАЛИМАИ ЯКХЕЛА дар як дарс — дар машқи «интихоб» ду тугмаи айнан як хел.
//  ③ БОЗИИ МАЧ ҚУЛФ — як маъно бештар аз шумораи тахтаҳо такрор шавад,
//     `matchBoards` онҳоро ҷудо карда наметавонад ва ба тақсими кӯҳна бармегардад:
//     ду плитка бо ҳамон маъно дар ЯК тахта → ҷавоби дуруст рад мешавад.
//  ④ САВОЛИ БЕҶАВОБ — `correctIndex` берун аз доираи вариантҳо.
//  ⑤ ВАРИАНТҲОИ ТАКРОРӢ дар савол — ду ҷавоби якхела, яке «нодуруст».
//  ⑥ МАШҚИ ГРАММАТИКА бе ҷавоб дар вариантҳо.
//  ⑦ ДАРСИ ХОЛӢ — дарси луғат бе ягон калима.
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
const FIRST_ONLY = process.argv.includes('--first');

/** Ҳамон `_normBase` -и муҳаррик: хурдҳарф + қавсайн партофта мешавад. */
const normBase = (s) => (s ?? '').toLowerCase().replace(/\(.*\)/g, '').trim();

/**
 * ҲАДДИ БОЛОИИ шумораи тахтаҳо, на тақсими кӯҳна.
 *
 * ⚠️ Хатои аввалини ман: тақсими КӮҲНАРО (порчаҳои 5-та) ҳисоб мекардам ва
 * дарси 1-и англисиро «қулф» эълон кардам. Дар асл `matchBoards` ҳангоми
 * бархӯрд шумораи тахтаҳоро БОЛО мебардорад
 * (`for (boardCount = legacy.length; boardCount * 2 <= n; boardCount++)`),
 * пас «Салом»/«Салом (ғайрирасмӣ)» ба ду тахтаи алоҳида мераванд.
 * Қулфи ҲАҚИҚӢ танҳо вақте мешавад, ки як маъно аз `floor(n/2)` бештар
 * такрор шавад — он гоҳ ҳатто ҳадди болоии тахтаҳо кофӣ нест.
 */
function maxBoards(n) {
  return Math.max(1, Math.floor(n / 2));
}

const courses = await p.course.findMany({
  where: { isActive: true, targetLanguage: { isActive: true } },
  select: {
    level: true,
    targetLanguage: { select: { code: true } },
    modules: {
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: {
        order: true, titleTranslated: true,
        lessons: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
          select: {
            id: true, order: true, titleTranslated: true, skillType: true,
            words: { select: { word: true, translation: true } },
            comprehension: {
              select: { questions: { select: { question: true, options: true, correctIndex: true } } },
            },
            grammarTopic: {
              select: { exercises: { select: { prompt: true, answer: true, options: true, type: true } } },
            },
          },
        },
      },
    },
  },
});

const problems = [];
const add = (sev, lang, level, m, l, title, kind, detail) =>
  problems.push({ sev, lang, level, m: m + 1, l: l + 1, title, kind, detail });

for (const c of courses) {
  const lang = c.targetLanguage.code;
  for (const m of c.modules) {
    if (FIRST_ONLY && m.order > 2) continue;
    for (const le of m.lessons) {
      const t = (le.titleTranslated ?? '').slice(0, 28);
      const words = le.words ?? [];

      // ① ҷавоби холӣ
      for (const w of words) {
        if (!(w.word ?? '').trim() || !(w.translation ?? '').trim()) {
          add('🔴', lang, c.level, m.order, le.order, t, 'ҶАВОБИ ХОЛӢ',
              `«${w.word}» / «${w.translation}»`);
        }
      }

      // ② ду калимаи якхела
      // ⚠️ Хатои сеюми ман: ин ҷо хурдҳарф мекардам ва олмонии
      // «sie» (вай/онҳо) ↔ «Sie» (Шумо расмӣ)-ро ҳамчун қулф эълон кардам.
      // Дар экран онҳо ДУ сатри гуногунанд ва маҳз ҳамин фарқ мавзӯи дарс
      // аст. Қулфи ҳақиқӣ танҳо такрори АЙНАН якхела аст; фарқи ҳарфи калон
      // огоҳии мулоим мегирад.
      const byWord = new Map();
      const byWordLower = new Map();
      for (const w of words) {
        const k = (w.word ?? '').trim();
        if (!k) continue;
        byWord.set(k, (byWord.get(k) ?? 0) + 1);
        const lk = k.toLowerCase();
        byWordLower.set(lk, (byWordLower.get(lk) ?? 0) + 1);
      }
      for (const [k, n] of byWord) {
        if (n > 1) add('🔴', lang, c.level, m.order, le.order, t, 'КАЛИМАИ ТАКРОРӢ', `«${k}» ×${n}`);
      }
      for (const [k, n] of byWordLower) {
        if (n > 1 && !Array.from(byWord.entries()).some(([w2, n2]) => n2 > 1 && w2.toLowerCase() === k)) {
          add('🟠', lang, c.level, m.order, le.order, t, 'фарқ танҳо дар ҳарфи калон', `«${k}» ×${n}`);
        }
      }

      // ③ бозии мач қулф
      if (words.length >= 2) {
        const meaning = new Map();
        for (const w of words) {
          const k = normBase(w.translation);
          if (!k) continue;
          meaning.set(k, (meaning.get(k) ?? 0) + 1);
        }
        const boards = maxBoards(words.length);
        for (const [k, n] of meaning) {
          if (n > boards) {
            add('🔴', lang, c.level, m.order, le.order, t, 'МАЧ ҚУЛФ',
                `маънои «${k}» ${n} бор, вале ҳамагӣ ${boards} тахта`);
          } else if (n > 1) {
            add('🟠', lang, c.level, m.order, le.order, t, 'маънои такрорӣ',
                `«${k}» ×${n} (тахтаҳо: ${boards})`);
          }
        }
      }

      // ④⑤ саволҳои матн
      for (const q of le.comprehension?.questions ?? []) {
        const opts = Array.isArray(q.options) ? q.options : [];
        if (opts.length < 2) {
          add('🔴', lang, c.level, m.order, le.order, t, 'САВОЛИ БЕ ВАРИАНТ', q.question.slice(0, 40));
        } else if (q.correctIndex < 0 || q.correctIndex >= opts.length) {
          add('🔴', lang, c.level, m.order, le.order, t, 'САВОЛИ БЕҶАВОБ',
              `correctIndex=${q.correctIndex}, вариантҳо=${opts.length} · ${q.question.slice(0, 32)}`);
        }
        const seen = new Set();
        for (const o of opts) {
          const k = String(o).trim().toLowerCase();
          if (seen.has(k)) {
            add('🔴', lang, c.level, m.order, le.order, t, 'ВАРИАНТИ ТАКРОРӢ',
                `«${o}» · ${q.question.slice(0, 32)}`);
            break;
          }
          seen.add(k);
        }
      }

      // ⑥ машқи грамматика
      for (const ex of le.grammarTopic?.exercises ?? []) {
        // ⚠️ Хатои аввалини ман: ҳар навъро як хел месанҷидам ва 191 «хато»
        // ёфтам — ҳамаашон `reorder` буданд, ки дар онҳо вариантҳо ПЛИТКАҲОИ
        // ҷумла ва ҷавоб ҷумлаи ҷамъшуда аст. Танҳо `choose` талаб мекунад, ки
        // ҷавоб яке аз вариантҳо бошад.
        if (ex.type !== 'choose') continue;
        const opts = Array.isArray(ex.options) ? ex.options.map((o) => String(o).trim()) : [];
        if (opts.length === 0) continue;
        const ans = String(ex.answer ?? '').trim();
        if (!ans) {
          add('🔴', lang, c.level, m.order, le.order, t, 'ГРАММАТИКА БЕ ҶАВОБ', ex.prompt.slice(0, 40));
        } else if (!opts.some((o) => o.toLowerCase() === ans.toLowerCase())) {
          add('🔴', lang, c.level, m.order, le.order, t, 'ҶАВОБ ДАР ВАРИАНТҲО НЕСТ',
              `ҷавоб «${ans}» ∉ [${opts.join(', ').slice(0, 50)}]`);
        }
      }

      // ⑦ дарси луғати холӣ
      const skill = (le.skillType ?? '').toLowerCase();
      if ((skill === 'vocab' || skill === 'vocabulary' || skill === 'writing') && words.length === 0) {
        add('🔴', lang, c.level, m.order, le.order, t, 'ДАРСИ ХОЛӢ', `skillType=${le.skillType}`);
      }
    }
  }
}

const hard = problems.filter((x) => x.sev === '🔴');
const soft = problems.filter((x) => x.sev === '🟠');
console.log(`\n🔴 БАНДКУНАНДА: ${hard.length}   🟠 хатарнок: ${soft.length}\n`);

const show = (list, limit) => {
  const byKind = {};
  for (const x of list) (byKind[x.kind] ??= []).push(x);
  for (const [kind, rows] of Object.entries(byKind).sort((a, b) => b[1].length - a[1].length)) {
    console.log(`\n── ${kind} (${rows.length})`);
    rows.sort((a, b) => a.lang.localeCompare(b.lang) || a.level.localeCompare(b.level) || a.m - b.m || a.l - b.l);
    for (const x of rows.slice(0, limit)) {
      console.log(`   ${x.lang} ${x.level} М${x.m}·Д${x.l}  ${x.title.padEnd(28)} ${x.detail}`);
    }
    if (rows.length > limit) console.log(`   … ва боз ${rows.length - limit}`);
  }
};
show(hard, 25);
if (process.argv.includes('--soft')) show(soft, 15);

await p.$disconnect();
