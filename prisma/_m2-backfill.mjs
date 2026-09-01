/**
 * M2 — пур кардани майдонҳои нав пас аз `prisma db push`.
 *
 * Ду кор, ҳарду ҲАТМАН дар ҳамон қадами схема:
 *  1. `SpeakingItem.wordCount` — вагарна валидатори M3 ҳамаи воҳидҳоро
 *     «сифр калима» мешуморад ва ҳар қоидаи дарозӣ хато медиҳад;
 *  2. `Language.scriptPattern` барои en/ru/tg/de/ar.
 *
 * Идемпотент: такрор иҷро кардан бехатар аст.
 * Иҷро:  node prisma/_m2-backfill.mjs
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** Ҳамон ифодаи `splitWords` дар `lib/speaking/engine.ts`. */
const countWords = (t) => t.trim().split(/\s+/).filter(Boolean).length;

/**
 * Намунаҳои алифбо.
 *
 * ⚠️ `en`, `ru`, `tg` айнан аз §1-и спекси v2. `de` ва `ar` дар ҳуҷҷат
 * НАБУДАНД — аз рӯи ҳамон намуна сохта шуданд:
 *   de = лотинӣ + ÄÖÜäöüß
 *   ar = ҳарфҳои арабӣ + ҳаракатҳо + аломатҳои китобатии арабӣ (، ؛ ؟)
 */
const SCRIPTS = {
  en: "^[A-Za-z0-9 .,!?'\"()\\-–—:;]+$",
  ru: '^[А-Яа-яЁё0-9 .,!?"()\\-–—:;]+$',
  tg: '^[А-Яа-яЁёҒғҲҳҚқӢӣӮӯҶҷ0-9 .,!?"()\\-–—:;]+$',
  de: "^[A-Za-zÄÖÜäöüß0-9 .,!?'\"()\\-–—:;]+$",
  ar: '^[\\u0621-\\u064A\\u064B-\\u0652\\u0670\\u0671\\u06400-9 .,!?"()\\-–—:;،؛؟]+$',
};

async function main() {
  // ── 1. wordCount ───────────────────────────────────────────────────────
  const items = await prisma.speakingItem.findMany({
    select: { id: true, text: true, wordCount: true },
  });

  let changed = 0;
  for (const it of items) {
    const wc = countWords(it.text);
    if (it.wordCount !== wc) {
      await prisma.speakingItem.update({ where: { id: it.id }, data: { wordCount: wc } });
      changed++;
    }
  }
  console.log(`wordCount: ${items.length} воҳид дида шуд, ${changed} навсозӣ шуд`);

  const zero = await prisma.speakingItem.count({ where: { wordCount: 0 } });
  console.log(`wordCount = 0 боқӣ монд: ${zero}${zero === 0 ? '  ✅' : '  ❌'}`);

  // ── 2. scriptPattern ───────────────────────────────────────────────────
  for (const [code, pattern] of Object.entries(SCRIPTS)) {
    const r = await prisma.language.updateMany({ where: { code }, data: { scriptPattern: pattern } });
    console.log(`scriptPattern ${code}: ${r.count ? 'гузошта шуд' : 'ЗАБОН ЁФТ НАШУД'}`);
  }

  // ── Санҷиш: намунаҳо ба мазмуни ҲОЗИРА мувофиқанд? ────────────────────
  const langs = await prisma.language.findMany({
    where: { scriptPattern: { not: null } },
    select: { code: true, scriptPattern: true },
  });
  const byCode = Object.fromEntries(langs.map((l) => [l.code, new RegExp(l.scriptPattern)]));

  const rows = await prisma.speakingItem.findMany({
    select: {
      text: true,
      lesson: { select: { category: { select: { targetLanguage: { select: { code: true } } } } } },
    },
  });
  let bad = 0;
  for (const r of rows) {
    const code = r.lesson.category.targetLanguage.code;
    const re = byCode[code];
    if (re && !re.test(r.text.trim())) {
      if (bad < 5) console.log(`  ⚠️ [${code}] намуна намегирад: ${JSON.stringify(r.text)}`);
      bad++;
    }
  }
  console.log(`Санҷиши алифбо бар ${rows.length} воҳид: ${bad} номувофиқ`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
