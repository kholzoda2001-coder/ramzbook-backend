// Ислоҳи боги `isUser` дар муколамаҳои АНГЛИСӢ.
//
// ЧАРО: дар `DialogueRolePlayScreen` микрофон танҳо дар сатрҳои `isUser`
// мебарояд — сатри ҳамсуҳбатро барнома худаш бо TTS мехонад. Дар schema
// `isUser Boolean @default(false)`, ва скриптҳои `create-module-5..10.mjs`
// (модулҳои A1 5–10) ин майдонро УМУМАН нагузоштаанд. Дар натиҷа ҳамаи
// сатрҳо «ҳамсуҳбат» шуданд: хонанда танҳо «Баъдӣ →»-ро пахш мекард ва дар
// охир «Дақиқии талаффуз: 100%» мегирифт — барои сухане, ки ҳеҷ гоҳ нагуфта
// буд. Ниг. `System_Bug_Audit.md`, банди 1.
//
// ⚠️ ЧАРО ФИЛТРИ СОДДА «speaker IN (...)» ХАТАРНОК АСТ:
// як ном дар ду муколама ду нақши МУХОЛИФ дошта метавонад. Дар «Asking For
// Directions» (A1) хонанда худи Tourist аст — роҳ мепурсад. Дар «Бубахшед,
// дар куҷост...?» (A2) баръакс: хонанда «You» аст ва роҳ НИШОН МЕДИҲАД,
// Tourist ҳамсуҳбат аст. `UPDATE ... WHERE speaker='Tourist'` дуюмиро вайрон
// мекунад — ҳар ду тарафро «ман» мекунад ва хонанда бояд тамоми муколамаро
// худаш гӯяд.
//
// ҚОИДАИ БЕХАТАР (пешфарз):
//   • Муколама ЯГОН сатри «ман» надорад → ҳамаи сатрҳои `USER_SPEAKERS`
//     «ман» мешаванд (маҳз боги create-module-5..10).
//   • Муколама аллакай сатри «ман» дорад → ТАНҲО сатрҳои ҳамон гӯянда, ки
//     аллакай «ман» аст, дуруст мешаванд (ислоҳи номувофиқатии парокандаа).
//     Гӯяндаи дигар ламс НАМЕШАВАД — нақшҳо аллакай таъин шудаанд.
//
// ИҶРО:
//   node prisma/fix-english-dialogues-isuser.mjs --dry        # танҳо нишон медиҳад
//   node prisma/fix-english-dialogues-isuser.mjs              # тағйир медиҳад
//   node prisma/fix-english-dialogues-isuser.mjs --force-all  # филтри содда (хатарнок)
//
// Идемпотент аст: танҳо сатрҳои `isUser = false` интихоб мешаванд.
//
// ДУ ДРАЙВЕР: асосан Prisma (`updateMany`). Агар Prisma ба порти 5432
// нарасад (дар баъзе шабакаҳо TCP баста аст — маҳз барои ҳамин
// `_ar-dialogue-isuser.mjs` низ бо HTTP навишта шудааст), скрипт худкор ба
// драйвери HTTP-и Neon мегузарад. Мантиқи интихоб дар ҳар ду ЯКХЕЛА аст:
// он дар `selectLinesToFix()` як маротиба навишта шудааст.

import { readFileSync, realpathSync } from 'fs';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const DRY = process.argv.includes('--dry');
const FORCE_ALL = process.argv.includes('--force-all');

/// Гӯяндаҳое, ки нақши ХОНАНДА-ро мебозанд — вақте ки муколама ҳанӯз ягон
/// сатри «ман» надорад. Мизоҷ дар тарабхона/мағоза, сайёҳе ки роҳ мепурсад,
/// «You» дар скриптҳои навтар, шогирд дар муколамаи синф.
///
/// `Umar` (2026-08-21): аудити баъдиислоҳӣ нишон дод, ки рӯйхати аввала
/// муколамаи A1 M5-ро ХОМӮШОНА мепартояд — гӯяндагонаш бо НОМ навишта шудаанд
/// («Ali»/«Umar»), на бо нақш. Азбаски `selectLinesToFix` танҳо вақте ба план
/// илова мекунад, ки `pick.length > 0` бошад, чунин муколама на хато медод, на
/// ислоҳ мешуд. Ҷавобдиҳанда хонанда аст:
///   «Ali: Hi, Umar! What time do you wake up?» → «Umar: I wake up at seven…»
const USER_SPEAKERS = ['Customer', 'Tourist', 'You', 'Student', 'Umar'];

/// ⚠️ ГӮЯНДАҲОИ НОМУАЙЯН — override аз рӯи УНВОНИ муколама.
///
/// «A»/«B» ном нест, балки тамға аст: дар ду муколамаи гуногун ду нақши
/// МУХОЛИФ дорад. Илова кардани `'B'` ба `USER_SPEAKERS` маҳз ҳамон хатареро
/// бармегардонад, ки сарлавҳаи ин файл огоҳ мекунад:
///   • «Home Conversation» (A1 M7): «A: Where is the book?» → «B: It is on the
///     table.» — ҷавобдиҳанда **B** хонанда аст.
///   • «Asking For Directions» (A1 M9, варианти `create-module-9.mjs`):
///     «A: Excuse me, where is the hospital?» → «B: Go straight.» — ин ҷо
///     баръакс: **A** роҳ мепурсад, яъне **A** хонанда аст, B сокини маҳаллӣ.
/// Як рӯйхати умумӣ ҳар дуро дуруст карда наметавонад, пас нақш аз рӯи унвон
/// таъин мешавад. Унвонҳо аз ҳарду скрипти M9 якхелаанд, пас ин override
/// новобаста аз он ки кадом вариант дар база аст, дуруст кор мекунад.
const USER_SPEAKER_OVERRIDES = {
  'Home Conversation': ['B'],
  'Asking For Directions': ['Tourist', 'A'],
};

/// Гӯяндаҳои «ман» барои як муколама: override (агар бошад), вагарна рӯйхати умумӣ.
/// ⚠️ Калидҳои USER_SPEAKER_OVERRIDES унвони АНГЛИСӢ мебошанд, вале драйверҳо
/// дар `title` унвони тоҷикиро мегузоранд (агар бошад) — пас муқоиса бо
/// `title` танҳо ҲЕҶ ГОҲ мутобиқат намекард ва override хомӯш буд. Ҳарду
/// санҷида мешаванд.
export function userSpeakersFor(dialogue) {
  for (const key of [dialogue.titleEn, dialogue.title]) {
    const hit = USER_SPEAKER_OVERRIDES[String(key ?? '').trim()];
    if (hit) return hit;
  }
  return USER_SPEAKERS;
}

// ───────────────────────── мантиқи интихоб (пок) ─────────────────────────

/// Барои ҳар муколама қарор мекунад, кадом сатрҳо «ман» шаванд.
/// Ба база даст намерасонад — санҷиданаш осон.
/// Бармегардонад `{ plan, unmatched }`.
/// `unmatched` — муколамаҳое, ки ягон сатри «ман» надоранд ВА ягон гӯяндаашон
/// ба рӯйхат мувофиқ намеояд. Пештар онҳо ХОМӮШОНА мепариданд (маҳз ҳамин
/// тавр A1 M5 ва M7 дар даври аввал ислоҳ нашуданд) — ҳоло огоҳӣ дода мешавад.
export function selectLinesToFix(dialogues, { forceAll = false } = {}) {
  const plan = [];
  const unmatched = [];
  for (const d of dialogues) {
    const alreadyUser = new Set(d.lines.filter((l) => l.isUser).map((l) => l.speaker));
    let pick;
    let reason;
    // Рӯйхати гӯяндаҳои «ман» барои маҳз ҲАМИН муколама (ниг. USER_SPEAKER_OVERRIDES).
    const speakers = userSpeakersFor(d);
    if (forceAll) {
      pick = d.lines.filter((l) => !l.isUser && speakers.includes(l.speaker));
      reason = '--force-all: филтри содда аз рӯи ном';
    } else if (alreadyUser.size === 0) {
      pick = d.lines.filter((l) => !l.isUser && speakers.includes(l.speaker));
      reason = 'ягон сатри «ман» надошт → нақш аз рӯи USER_SPEAKERS';
    } else {
      // Нақш аллакай таъин шудааст — танҳо сатрҳои ҲАМОН гӯяндаро дуруст мекунем.
      pick = d.lines.filter((l) => !l.isUser && alreadyUser.has(l.speaker));
      reason = `нақш аллакай «${[...alreadyUser].join('/')}» аст → танҳо ислоҳи парокандаа`;
    }
    if (pick.length) {
      plan.push({ dialogue: d, lines: pick, reason });
    } else if (alreadyUser.size === 0 && d.lines.length) {
      // Ягон нақш таъин нашуд ва ягон гӯянда мувофиқ наомад → микрофон дар ин
      // муколама ҲЕҶ ГОҲ намебарояд. Ин бояд дида шавад, на хомӯш гузарад.
      unmatched.push({
        dialogue: d,
        speakers: [...new Set(d.lines.map((l) => l.speaker))],
      });
    }
  }
  return { plan, unmatched };
}

// ──────────────────────────────── драйверҳо ────────────────────────────────

/// Танҳо курсҳои англисӣ. Бе ин филтр муколамаҳои арабӣ, олмонӣ ва русӣ низ
/// ламс мешуданд — дар онҳо нақшҳо бо усули дигар таъин шудаанд.
const EN_DIALOGUE = { course: { targetLanguage: { code: 'en' } } };

function prismaDriver() {
  const prisma = new PrismaClient();
  return {
    name: 'Prisma',
    async loadDialogues() {
      const rows = await prisma.dialogue.findMany({
        where: EN_DIALOGUE,
        select: {
          id: true, title: true, titleTranslated: true, cefrLevel: true,
          lines: {
            select: { id: true, speaker: true, isUser: true, order: true, text: true },
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      });
      // `title` — барои НИШОН ДОДАН (тоҷикӣ, агар бошад); `titleEn` — унвони
      // англисӣ, ки калиди USER_SPEAKER_OVERRIDES маҳз ҳамон аст.
      return rows.map((d) => ({ ...d, titleEn: d.title, title: d.titleTranslated || d.title }));
    },
    async markLines(ids) {
      const res = await prisma.dialogueLine.updateMany({
        where: { id: { in: ids }, isUser: false },
        data: { isUser: true },
      });
      return res.count;
    },
    async touchContentVersion() {
      await prisma.appSetting.updateMany({
        where: { key: 'content_version' }, data: { updatedAt: new Date() },
      });
    },
    close: () => prisma.$disconnect(),
  };
}

function neonDriver(sql) {
  const q = (t, p) => sql.query(t, p);
  return {
    name: 'Neon HTTP',
    async loadDialogues() {
      const ds = await q(`
        SELECT d.id, d.title, d."titleTranslated" tt, d."cefrLevel" cefr
          FROM "Dialogue" d
          JOIN "Course"   c ON c.id = d."courseId"
          JOIN "Language" t ON t.id = c."targetLanguageId"
         WHERE t.code = 'en'
         ORDER BY d."order"`);
      const ls = await q(`
        SELECT l.id, l."dialogueId" did, l.speaker, l."isUser", l."order", l.text
          FROM "DialogueLine" l
          JOIN "Dialogue"  d ON d.id = l."dialogueId"
          JOIN "Course"    c ON c.id = d."courseId"
          JOIN "Language"  t ON t.id = c."targetLanguageId"
         WHERE t.code = 'en'
         ORDER BY l."order"`);
      const byId = new Map(ds.map((d) => [d.id, {
        id: d.id, titleEn: d.title, title: d.tt || d.title, cefrLevel: d.cefr, lines: [],
      }]));
      for (const l of ls) {
        byId.get(l.did)?.lines.push({
          id: l.id, speaker: l.speaker, isUser: l.isUser, order: l.order, text: l.text,
        });
      }
      return [...byId.values()];
    },
    async markLines(ids) {
      const r = await q(
        `UPDATE "DialogueLine" SET "isUser" = true WHERE id = ANY($1) AND "isUser" = false`,
        [ids],
      );
      return r.rowCount ?? ids.length;
    },
    async touchContentVersion() {
      await q(`UPDATE "AppSetting" SET "updatedAt" = NOW() WHERE key = 'content_version'`);
    },
    close: async () => {},
  };
}

/// Prisma-ро месанҷад; агар ба сервер нарасад — ба HTTP мегузарад.
async function pickDriver() {
  const p = prismaDriver();
  try {
    await p.loadDialogues();
    return p;
  } catch (e) {
    await p.close().catch(() => {});
    const unreachable = /Can't reach database server|connection pool|P1001|ECONNREFUSED|ETIMEDOUT/i;
    if (!unreachable.test(String(e?.message ?? e))) throw e;
    console.log('⚠️  Prisma ба порти 5432 нарасид — драйвери HTTP-и Neon истифода мешавад.\n');
    const { neon } = await import('@neondatabase/serverless');
    const env = Object.fromEntries(
      readFileSync(new URL('../.env', import.meta.url), 'utf8')
        .split('\n')
        .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
        .map((l) => {
          const i = l.indexOf('=');
          return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')];
        }),
    );
    return neonDriver(neon(env.DATABASE_URL));
  }
}

// ──────────────────────────────── асосӣ ────────────────────────────────

async function main() {
  console.log(DRY ? '=== DRY RUN — ҳеҷ чиз навишта намешавад ===' : '=== ИҶРО ===');
  if (FORCE_ALL) console.log('⚠️  --force-all: филтри содда — нақшҳои дурустро вайрон карда метавонад!');
  console.log(`Гӯяндаҳои «ман»: ${USER_SPEAKERS.join(', ')}\n`);

  const db = await pickDriver();
  try {
    const dialogues = await db.loadDialogues();
    const noUserLine = dialogues.filter((d) => !d.lines.some((l) => l.isUser));
    console.log(`Драйвер: ${db.name}`);
    console.log(`Муколамаҳои англисӣ: ${dialogues.length}`);
    console.log(`Аз онҳо БЕ ягон сатри «ман»: ${noUserLine.length}`);
    for (const d of noUserLine) {
      const speakers = [...new Set(d.lines.map((l) => l.speaker))];
      const fixable = speakers.some((s) => userSpeakersFor(d).includes(s));
      console.log(`  ${fixable ? '✅' : '⚠️ '} «${d.title}» [${d.cefrLevel ?? '—'}] — ${speakers.join(' / ')}`);
    }

    const { plan, unmatched } = selectLinesToFix(dialogues, { forceAll: FORCE_ALL });
    if (unmatched.length) {
      console.log(`\n⚠️  ${unmatched.length} муколама бе нақш монд — гӯяндаашон дар рӯйхат нест:`);
      for (const u of unmatched) {
        console.log(`     «${u.dialogue.title}» [${u.dialogue.cefrLevel ?? '—'}] — ${u.speakers.join(' / ')}`);
      }
      console.log('     → ба USER_SPEAKERS ё USER_SPEAKER_OVERRIDES илова кунед.');
    }
    const ids = plan.flatMap((p) => p.lines.map((l) => l.id));
    console.log(`\nНақшаи ислоҳ: ${ids.length} сатр дар ${plan.length} муколама`);
    for (const p of plan) {
      console.log(`\n  «${p.dialogue.title}» [${p.dialogue.cefrLevel ?? '—'}]`);
      console.log(`    сабаб: ${p.reason}`);
      for (const l of p.lines) console.log(`    ${l.order}. [${l.speaker}] ${l.text}`);
    }

    let changed = 0;
    if (DRY) {
      console.log('\n[--dry] ҳеҷ чиз навишта нашуд.');
    } else if (ids.length) {
      changed = await db.markLines(ids);
      console.log(`\n✅ ${changed} сатр «ман» шуд.`);
      // Кэши мобилӣ (Hive/SWR) то тағйир ёфтани `content_version` мазмуни
      // кӯҳнаро нигоҳ медорад — вагарна хонанда ислоҳро намебинад.
      await db.touchContentVersion();
      console.log('content_version ламс шуд — кэши мобилӣ нав мешавад.');
    } else {
      console.log('\nҲеҷ сатри ислоҳталаб нест.');
    }

    // ── Худсанҷӣ ──
    const after = await db.loadDialogues();
    const stillEmpty = after.filter((d) => !d.lines.some((l) => l.isUser));
    const bothSides = after.filter((d) => {
      const spk = new Set(d.lines.map((l) => l.speaker));
      const usr = new Set(d.lines.filter((l) => l.isUser).map((l) => l.speaker));
      return spk.size > 1 && usr.size === spk.size; // ҳама гӯяндаҳо «ман» — хато
    });

    console.log('\n=== ХУЛОСА ===');
    console.log(JSON.stringify({
      dryRun: DRY, forceAll: FORCE_ALL, driver: db.name,
      dialoguesTotal: dialogues.length,
      dialoguesWithoutUserLineBefore: noUserLine.length,
      linesPlanned: ids.length,
      linesUpdated: changed,
      dialoguesUnmatchedBySpeakerList: unmatched.length,
      dialoguesWithoutUserLineAfter: stillEmpty.length,
      dialoguesWhereEverySpeakerIsUser: bothSides.length,
    }, null, 2));

    if (stillEmpty.length) {
      console.log(`\n⚠️  ${stillEmpty.length} муколама ҳанӯз бе сатри «ман» — номи гӯяндаро ба USER_SPEAKERS илова кунед:`);
      for (const d of stillEmpty) {
        console.log(`   • «${d.title}» — ${[...new Set(d.lines.map((l) => l.speaker))].join(' / ')}`);
      }
    }
    if (bothSides.length) {
      console.log(`\n🚨 ${bothSides.length} муколама ҳама гӯяндаҳояшон «ман»-анд — хонанда бояд ҳар ду тарафро гӯяд:`);
      for (const d of bothSides) console.log(`   • «${d.title}»`);
    }
    if (!stillEmpty.length && !bothSides.length) {
      console.log('\n🎉 Ҳамаи муколамаҳои англисӣ нақши дурусти «ман» доранд.');
    }
  } finally {
    await db.close().catch(() => {});
  }
}

// Танҳо ҳангоми иҷрои МУСТАҚИМ кор мекунад. Бе ин, ҳар `import` аз ин файл
// (масалан барои санҷиши `selectLinesToFix`) тамоми скриптро дар реҷаи
// НАВИШТАН ба база мепаронд — `--dry` дар `process.argv` набуд.
const invokedDirectly = process.argv[1] &&
  realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1]);

if (invokedDirectly) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
