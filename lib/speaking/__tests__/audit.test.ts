import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { DEFAULT_CONFIG, type EngineItem } from '@/lib/speaking/engine';
import { validateLesson, type Issue } from '@/lib/speaking/validate';

/**
 * `npm run speaking:audit` — валидатор бар ҳамаи 7 бастаи JSON ва бар
 * базаи ҶОРӢ.
 *
 * ⚠️ Ин тест ҲЕҶ ЧИЗРО НАМЕШИКАНАД: вазифааш ҲИСОБОТ аст. Хатоҳо дар
 * қадами 4 (B1) дар худи файлҳои JSON ислоҳ мешаванд. Агар ин ҷо
 * `expect(errors).toBe(0)` мебуд, аввалин иҷро сурх мешуд ва ҳеҷ
 * маълумоте намедод.
 */

const ROOT = path.resolve(import.meta.dirname, '../../..');
const PACKS = path.join(ROOT, 'content/speaking');

/** Намунаҳо — ҳамон қиматҳое, ки `prisma/_m2-backfill.mjs` менависад. */
const SCRIPTS: Record<string, string> = {
  en: "^[A-Za-z0-9 .,!?'\"()\\-–—:;]+$",
  ru: '^[А-Яа-яЁё0-9 .,!?"()\\-–—:;]+$',
  tg: '^[А-Яа-яЁёҒғҲҳҚқӢӣӮӯҶҷ0-9 .,!?"()\\-–—:;]+$',
  de: "^[A-Za-zÄÖÜäöüß0-9 .,!?'\"()\\-–—:;]+$",
  ar: '^[\\u0621-\\u064A\\u064B-\\u0652\\u0670\\u0671\\u06400-9 .,!?"()\\-–—:;،؛؟]+$',
};

interface PackItem {
  order: number;
  kind: string;
  text: string;
  translation: string;
  literal: string | null;
  note: string | null;
  cue: string | null;
  cueTranslation: string | null;
}

interface Pack {
  slug: string;
  targetLanguage: string;
  nativeLanguage: string;
  category: { title: string; titleTranslated: string; emoji: string };
  lessons: { order: number; title: string | null; items: PackItem[] }[];
}

const toEngine = (i: PackItem, id: string): EngineItem => ({
  id,
  kind: i.kind === 'word' ? 'word' : 'sentence',
  text: i.text,
  translation: i.translation,
  literal: i.literal ?? null,
  note: i.note ?? null,
  cue: i.cue ?? null,
  cueTranslation: i.cueTranslation ?? null,
  audioUrl: null,
  chainOverride: [],
  swaps: [],
});

describe('speaking:audit', () => {
  it('ҳисобот бар ҳамаи бастаҳои JSON', () => {
    const files = readdirSync(PACKS).filter((f) => f.endsWith('.json')).sort();
    const rows: string[] = [];
    const detail: string[] = [];
    let totErr = 0;
    let totWarn = 0;

    for (const f of files) {
      const pack: Pack = JSON.parse(readFileSync(path.join(PACKS, f), 'utf8'));
      const re = SCRIPTS[pack.targetLanguage] ? new RegExp(SCRIPTS[pack.targetLanguage]) : null;

      // Матнҳои ҳамаи дарсҳо — барои `W_DUP_IN_CATEGORY`.
      const all = new Map<string, number>();
      for (const L of pack.lessons)
        for (const i of L.items) {
          const k = i.text.trim().toLowerCase();
          all.set(k, (all.get(k) ?? 0) + 1);
        }

      const codes = new Map<string, number>();
      let err = 0;
      let warn = 0;

      for (const L of pack.lessons) {
        const own = new Set(L.items.map((i) => i.text.trim().toLowerCase()));
        // «Дар боби дигар» = матн дар боб бештар аз як бор ва берун аз ин дарс.
        const others = new Set(
          Array.from(all.entries())
            .filter(([k, n]) => n > 1 && own.has(k))
            .map(([k]) => k),
        );

        const issues: Issue[] = validateLesson(
          {
            id: `${pack.slug}:L${L.order}`,
            items: L.items.map((i) => toEngine(i, `${pack.slug}:L${L.order}:I${i.order}`)),
          },
          { targetScript: re, categoryTexts: others },
          DEFAULT_CONFIG,
        );

        for (const is of issues) {
          codes.set(is.code, (codes.get(is.code) ?? 0) + 1);
          if (is.severity === 'error') {
            err++;
            detail.push(`  [${pack.slug} · дарси ${L.order}] ${is.code}: ${is.message}`);
          } else warn++;
        }
      }

      totErr += err;
      totWarn += warn;
      const top = Array.from(codes.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([c, n]) => `${c}×${n}`)
        .join(' ');
      rows.push(`${pack.slug.padEnd(24)} ${String(err).padStart(5)} ${String(warn).padStart(7)}  ${top}`);
    }

    const report = [
      '',
      '════════ ҲИСОБОТИ ВАЛИДАТОР — бастаҳои JSON ════════',
      `${'Баста'.padEnd(24)} ${'error'.padStart(5)} ${'warning'.padStart(7)}  Кодҳои асосӣ`,
      '─'.repeat(78),
      ...rows,
      '─'.repeat(78),
      `${'ҶАМЪ'.padEnd(24)} ${String(totErr).padStart(5)} ${String(totWarn).padStart(7)}`,
      '',
      totErr ? '──── Ҳар ERROR ────' : '✅ Ягон error нест.',
      ...detail,
      '',
    ].join('\n');

    console.log(report);
    writeFileSync(path.join(ROOT, 'speaking-audit-report.txt'), report, 'utf8');

    expect(files.length).toBeGreaterThan(0);
  });
});
