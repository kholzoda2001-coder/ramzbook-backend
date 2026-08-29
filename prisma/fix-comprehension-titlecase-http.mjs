// Ислоҳи Title-Case дар матн ва саволҳои машқҳои хониш/шунавоӣ — тавассути
// драйвери HTTP-и Neon.
//
// ЧАРО ИН ФАЙЛ ВУҶУД ДОРАД
// ────────────────────────
// Мантиқи ислоҳ аллакай дар `p0-phase3-normalize.mjs`, банди «G2» навишта ва
// санҷида шудааст. Вале он скрипт `PrismaClient`-ро истифода мебарад, ки ба
// Neon тавассути TCP:5432 пайваст мешавад — ва аз баъзе шабакаҳо (аз ҷумла
// мошини корӣ, ки аудит дар он гузаронда шуд) ин порт БАСТА аст:
//
//   PrismaClientInitializationError: Can't reach database server at
//   ep-silent-bar-…-pooler.c-4.eu-central-1.aws.neon.tech:5432
//
// Дар натиҷа банди G2 навишта шуд, вале ба продакшн НАРАСИД: аудити
// 2026-08-21 чор саволи то ҳол Title-Case-ро дар Модулҳои 9, 10 ва 11 ёфт.
// Драйвери `@neondatabase/serverless` бо HTTPS кор мекунад ва аз ҳамон
// мошин бе мушкилӣ мерасад — маҳз бо он ҳамаи санҷишҳои аудит гузаронда шуданд.
//
// ⚠️ ДОИРАИ АМАЛ ТАНГ АСТ. Ин порт ТАНҲО банди G2-ро такрор мекунад
// (`ComprehensionExercise` + `ComprehensionQuestion`). Бандҳои дигари
// `p0-phase3-normalize.mjs` — нест кардани такрорҳои грамматика/луғат,
// тағйири XP, ислоҳи IPA ва сатрҳои муколама — қасдан ИН ҶО НЕСТАНД: онҳо
// доираи хеле васеътар доранд ва барои бастани ин нуқс лозим нестанд.
//
// `fixEnglish` / `fixTajik` аз ҳамон `p0-text-utils.mjs` ворид мешаванд, на
// нусхабардорӣ — вагарна ду мантиқ бо мурури вақт аз ҳам дур мешуданд.
//
// ⚠️⚠️ МАТНҲОИ ПУРРА (`passage` / `passageTranslated`) ПЕШФАРЗ ДАСТ НАМЕХӮРАНД.
//
// Санҷиши хушк дар маълумоти воқеӣ (2026-08-21) нишон дод, ки нимаи «матн»-и
// банди G2 се ислоҳи дуруст ва ЧОР ХАРОБКУНӢ меорад:
//
//   ❌ «Рӯзҳои душанбе ва чоршанбе…»  → «Рӯзҳои Душанбе…»   (M4, Sam’s Day)
//   ❌ «Имрӯз душанбе аст.»            → «Имрӯз Душанбе аст.» (M4, ду ҷо)
//   ❌ «Ин дӯсти ман Том аст.»         → «…дӯсти ман том аст.» (M1)
//
// САБАБ: `TJ_PROPER` калимаи «Душанбе»-ро ҳамчун исми ХОС (шаҳр) дорад, вале
// дар тоҷикӣ «душанбе» ҲАМЗАМОН рӯзи ҳафта аст. `fixTajik` бо
// `TJ_PROPER.has(capitalize(word))` ҳарду шаклро як хел мебинад ва рӯзи
// ҳафтаро маҷбуран ба номи ШАҲР табдил медиҳад. Баръакс, «Том» дар рӯйхат
// НЕСТ, пас номи одам хурд карда мешавад.
//
// Ин ду ҳолатро РӮЙХАТИ КАЛИМА ҲАЛ КАРДА НАМЕТАВОНАД: «душанбе» ва «Душанбе»
// айнан як сатранд ва танҳо КОНТЕКСТ онҳоро ҷудо мекунад («дар Душанбе» =
// шаҳр, «Имрӯз душанбе аст» = рӯз). Ҳар ду вариант дар курс истифода мешаванд.
//
// Аз ин рӯ нимаи матн танҳо бо парчами ошкорои `--passages` кор мекунад ва то
// ислоҳи контекст-огоҳ набояд иҷро шавад. ⚠️ ҲАМИН ХАТАР ба худи
// `p0-phase3-normalize.mjs` низ дахл дорад — иҷрои он дар ҳолати ҳозира
// ҳамин чор харобкуниро меорад.
//
// ИСТИФОДА
// ────────
//   node prisma/fix-comprehension-titlecase-http.mjs            # dry-run
//   node prisma/fix-comprehension-titlecase-http.mjs --apply    # навиштан
//   node prisma/fix-comprehension-titlecase-http.mjs --apply --all-courses
//   node prisma/fix-comprehension-titlecase-http.mjs --passages # ⚠️ ниг. боло
//
// Пешфарз танҳо курси Англисӣ A1 (en → tg). Скрипт ИДЕМПОТЕНТ аст: сатре, ки
// аллакай дуруст аст, тағйир намеёбад ва такрор кардани он бехатар аст.
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';
import { fixEnglish, fixTajik } from './p0-text-utils.mjs';

const APPLY = process.argv.includes('--apply');
const ALL_COURSES = process.argv.includes('--all-courses');
/// ⚠️ Нимаи «матни пурра» — пешфарз ХОМӮШ. Ниг. огоҳии сарлавҳаи файл.
const PASSAGES = process.argv.includes('--passages');

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')];
    }),
);
const sql = neon(env.DATABASE_URL);
const q = (text, params) => sql.query(text, params);

// ─────────────────── қоидаҳо (айнан аз банди G2) ───────────────────

const hasCyrillic = (s) => /[Ѐ-ӿ]/.test(s);

/// ⚠️ САТРҲОИ КӮТОҲ БОЯД МУҲОФИЗАТ ШАВАНД. `fixEnglish` ҷумла-огоҳ аст: он
/// он чизеро, ки оғози ҷумла мешуморад, ба ҳарфи калон мебарорад. Дар матни
/// пурра ин дуруст аст, вале дар сатри кӯтоҳ санҷиши хушк дар маълумоти
/// ВОҚЕИИ A1 нишон дод, ки он матни ДУРУСТРО вайрон мекунад:
///   вариантҳо ["has","am","have"]      → ["Has","Am","Have"]  (машқи холипуркунӣ!)
///   савол "'Хоҳар' in English is:"     → "'Хоҳар' In English is:"
///   савол "Complete: This is ___"      → "Complete: this is ___"
/// Пас сатри кӯтоҳ ТАНҲО вақте дигар мешавад, ки он воқеан Title-Case бошад —
/// ҳар калимаи алифбоӣ бо ҳарфи калон ва 2+ калима. Маҳз ҳамин нуқс аст, ки
/// ин скрипт барои он навишта шудааст, ва гвардия кафолат медиҳад, ки гузариш
/// ҳеҷ гоҳ матни дурустро бадтар карда наметавонад.
const isTitleCased = (s) => {
  const toks = String(s)
    .replace(/[?.!,;:'"()]/g, '')
    .split(/\s+/)
    .filter((t) => /[A-Za-z]/.test(t));
  return toks.length >= 2 && toks.every((t) => /^[A-Z]/.test(t));
};

const fixShortEnglish = (s) => (isTitleCased(s) ? fixEnglish(s) : s);

// Варианти ҷавоб метавонад ба ҳар ду забон бошад — масалан ["Лутфан","Ташаккур"]
// дар паҳлӯи ["Breakfast","Dinner"] — пас ҳар сатр аз рӯи ХАТИ худаш равона
// мешавад, на аз рӯи забони сутун.
const fixOption = (s) => (hasCyrillic(s) ? fixTajik(s) : fixShortEnglish(s));

// ─────────────────────────── иҷро ───────────────────────────

async function main() {
  console.log(APPLY ? '=== APPLY ===' : '=== DRY RUN (барои навиштан --apply илова кунед) ===');

  let courses;
  if (ALL_COURSES) {
    courses = await q(`SELECT id, level FROM "Course" ORDER BY level`);
  } else {
    courses = await q(
      `SELECT c.id, c.level FROM "Course" c
         JOIN "Language" t ON t.id = c."targetLanguageId"
         JOIN "Language" n ON n.id = c."nativeLanguageId"
        WHERE t.code = 'en' AND n.code = 'tg' AND c.level = 'A1'`,
    );
  }
  if (!courses.length) {
    console.log('⚠ курс ёфт нашуд');
    return;
  }

  let passFix = 0, passTjFix = 0, qFix = 0, optFix = 0;

  for (const course of courses) {
    // МЕТАВОНАД ТАҒЙИР НАШАВАД: `title` / `titleTranslated` — инҳо сарлавҳаанд
    // («Module Review», «Final Exam»), ки дар онҳо Title Case ДУРУСТ аст.
    const exs = await q(
      `SELECT id, passage, "passageTranslated" FROM "ComprehensionExercise" WHERE "courseId" = $1`,
      [course.id],
    );

    for (const ex of exs) {
      // ⚠️ Танҳо бо `--passages`. Сабаб дар сарлавҳаи файл — «душанбе»/«Душанбе».
      if (PASSAGES) {
        const sets = [];
        const vals = [];
        if (ex.passage) {
          const np = fixEnglish(ex.passage);
          if (np !== ex.passage) {
            vals.push(np);
            sets.push(`passage = $${vals.length}`);
            passFix++;
          }
        }
        if (ex.passageTranslated) {
          const npt = fixTajik(ex.passageTranslated);
          if (npt !== ex.passageTranslated) {
            vals.push(npt);
            sets.push(`"passageTranslated" = $${vals.length}`);
            passTjFix++;
          }
        }
        if (sets.length && APPLY) {
          vals.push(ex.id);
          await q(`UPDATE "ComprehensionExercise" SET ${sets.join(', ')} WHERE id = $${vals.length}`, vals);
        }
      }

      // МЕТАВОНАД ТАҒЙИР НАШАВАД: `explanation` ва `questionTranslated`. Онҳо
      // расман бо забони модарианд, вале дар амал матни ОМЕХТА доранд — «Бо
      // I → have got.», «Хоҳар = Sister.» — ва `fixTajik` ҳар калимаи
      // нашинохтаро хурд мекунад, пас санҷиши хушк «Бо I»-ро ба «Бо i» табдил
      // дод. Нуқси воқеии онҳо (ҳарфи калони оғозӣ) масъалаи ДИГАР аст.
      const qs = await q(
        `SELECT id, question, options FROM "ComprehensionQuestion" WHERE "exerciseId" = $1`,
        [ex.id],
      );

      for (const row of qs) {
        const sets2 = [];
        const vals2 = [];

        const nq = fixShortEnglish(row.question);
        if (nq !== row.question) {
          vals2.push(nq);
          sets2.push(`question = $${vals2.length}`);
          qFix++;
          console.log(`  савол: "${row.question}"\n       → "${nq}"`);
        }

        // `options` — jsonb (string[]). ТАРТИБ ҲЕҶ ГОҲ тағйир намеёбад:
        // `correctIndex` ба ҳамин рӯйхат ишора мекунад, пас ҷойивазкунӣ
        // калиди ҷавобро хомӯшона вайрон мекард.
        const opts = Array.isArray(row.options) ? row.options : null;
        if (opts) {
          const no = opts.map((o) => (typeof o === 'string' ? fixOption(o) : o));
          if (JSON.stringify(no) !== JSON.stringify(opts)) {
            vals2.push(JSON.stringify(no));
            sets2.push(`options = $${vals2.length}::jsonb`);
            optFix++;
            console.log(`  вариантҳо: ${JSON.stringify(opts)}\n           → ${JSON.stringify(no)}`);
          }
        }

        if (sets2.length && APPLY) {
          vals2.push(row.id);
          await q(`UPDATE "ComprehensionQuestion" SET ${sets2.join(', ')} WHERE id = $${vals2.length}`, vals2);
        }
      }
    }
  }

  console.log('\n=== ҶАМЪБАСТ ===');
  console.log(
    JSON.stringify(
      {
        mode: APPLY ? 'applied' : 'dry-run',
        courses: courses.length,
        passages: PASSAGES ? passFix : 'skipped (--passages хомӯш)',
        passagesTajik: PASSAGES ? passTjFix : 'skipped (--passages хомӯш)',
        questions: qFix,
        options: optFix,
      },
      null,
      2,
    ),
  );
  if (!APPLY && passFix + passTjFix + qFix + optFix > 0) {
    console.log('\nБарои навиштан: node prisma/fix-comprehension-titlecase-http.mjs --apply');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
