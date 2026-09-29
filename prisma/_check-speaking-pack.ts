/**
 * Санҷиши бастаи гуфтор ПЕШ аз seed — бо ҳамон муҳаррик ва қоидаҳои сервер.
 *
 *   npx ts-node-transpile-only -O '{"module":"commonjs","moduleResolution":"node"}' prisma/_check-speaking-pack.ts <slug>…
 */
import { readFileSync } from 'fs';
import { generateSteps, configForEv, DEFAULT_CONFIG, asStage } from '../lib/speaking/engine';
import { validateLesson } from '../lib/speaking/validate';

// Ҳар забон ҶУДО: ҳарфи ҳадаф ва талабот ба транскрипсияи тоҷикӣ (`literal`).
// Англисӣ: транскрипсия ҲАТМӢ (хонандаи тоҷик ҳарфи лотиниро душвор мехонад);
// русӣ: лозим нест (қарори корбар, 12.09.2026). Арабӣ ва кореягӣ: ҲАТМӢ — алифбо
// ношинос (кореягӣ аз `_ko-tajik.mjs` — ҳамон хониши курс ва алифбо). Туркӣ: ҲАТМӢ, аз
// `_tr-tajik.mjs` (ҳамон хониши корти калимаи курс).
const SCRIPT: Record<string, RegExp> = { ru: /[а-яё]/i, en: /[a-z]/i, ar: /[\u0621-\u064A]/, ko: /[\uAC00-\uD7A3]/, tr: /[a-zçğıöşü]/i, de: /[a-zäöüß]/i };
const NEEDS_LITERAL: Record<string, boolean> = { ru: false, en: true, ar: true, ko: true, tr: true, de: true };

// ── Арабӣ (28.09.2026) ────────────────────────────────────────────────────
// Хонандаи A1-и тоҷик арабии БЕ ҳаракатро хонда наметавонад → ҳар калимаи
// ≥2-ҳарфа ақаллан як ҳаракат (َ ُ ِ ْ ّ ً ٌ ٍ) дорад. Аломатҳо — арабӣ: ؟ ، ؛
const AR_WORD = /[\u0621-\u064A\u0671][\u0621-\u0652\u0670\u0671]*/g;
const AR_MARK = /[\u064B-\u0652]/;
function arabicProblems(label: string, t: string | null | undefined): string[] {
  if (!t || !/[\u0621-\u064A]/.test(t)) return [];
  const out: string[] = [];
  const bare = (t.match(AR_WORD) ?? []).filter((w) => w.replace(/[\u064B-\u0652\u0670]/g, '').length >= 2 && !AR_MARK.test(w));
  if (bare.length) out.push(`NO_HARAKAT ${label} «${t}»: ${bare.join(' ')}`);
  if (/[?,;]/.test(t)) out.push(`LATIN_PUNCT ${label} «${t}» — ؟ ، ؛ лозим`);
  return out;
}
let total = 0;
for (const slug of process.argv.slice(2)) {
  const j = JSON.parse(readFileSync(`content/speaking/${slug}.json`, 'utf8'));
  const cfg = { ...DEFAULT_CONFIG, lang: j.targetLanguage };
  const script = SCRIPT[j.targetLanguage];
  if (!script) throw new Error(`забони «${j.targetLanguage}» дар SCRIPT нест`);
  const prev: any[] = [];
  let errs = 0;
  const warns: string[] = [];
  console.log(`\n══ ${slug} · ${j.category.titleTranslated} (order ${j.category.order})`);
  for (const L of j.lessons) {
    const items = L.items.map((x: any, i: number) => ({ id: `L${L.order}i${i}`, kind: x.kind, text: x.text, translation: x.translation, literal: x.literal, note: x.note, cue: x.cue, cueTranslation: x.cueTranslation, audioUrl: 'x', intent: x.intent ?? null, accepts: x.accepts ?? [], swaps: x.swaps ?? [] }));
    const issues = validateLesson({ id: 'L', items, stage: L.stage } as any, { targetScript: script, categoryTexts: new Set() } as any, cfg as any).filter((i: any) => i.code !== 'W_NO_AUDIO');
    const steps = generateSteps(items as any, configForEv(4, cfg as any), { repeat: false, stage: asStage(L.stage), review: prev.slice(-6), position: L.order } as any);
    prev.push(...items.filter((i: any) => i.kind === 'word' || i.kind === 'sentence'));
    // Транскрипсия барои ҲАР чизе, ки хонанда мегӯяд (на танҳо калима).
    if (NEEDS_LITERAL[j.targetLanguage]) {
      for (const it of L.items as any[]) {
        // «{job}» — транскрипсия қасдан нест (барнома `translit`-ро иваз намекунад).
        if (!it.literal?.trim()) { if (!String(it.text).includes('{')) { errs++; console.log(`   ❌ NO_LITERAL «${it.text}»`); } }
        // Транскрипсия ҳарфи тоҷикӣ бошад, на лотинӣ.
        else if (/[a-zçğıöşüâîûäß]/i.test(it.literal)) { errs++; console.log(`   ❌ LITERAL_LATIN «${it.text}» → «${it.literal}»`); }
        else if (/[\u0600-\u06FF\uAC00-\uD7A3\u3130-\u318F]/.test(it.literal)) { errs++; console.log(`   ❌ LITERAL_SCRIPT «${it.text}» → «${it.literal}»`); }
      }
    }
    if (j.targetLanguage === 'ar') {
      for (const it of L.items as any[]) {
        const probs = [
          ...arabicProblems('text', it.text),
          ...arabicProblems('cue', it.cue),
          ...((it.accepts ?? []) as string[]).flatMap((a) => arabicProblems('accepts', a)),
          ...((it.swaps ?? []) as string[]).flatMap((w) => arabicProblems('swaps', String(w).split('|')[0])),
        ];
        for (const m of probs) { errs++; console.log(`   ❌ ${m}`); }
      }
    }
    console.log(`#${L.order + 1} ${(L.stage ?? '-').padEnd(9)} ${L.title}${L.mode ? ' [' + L.mode + ']' : ''} | ${steps.length} қадам: ${steps.map((s: any) => s.kind).join(',')}`);
    for (const i of issues as any[]) {
      const hard = i.severity === 'error' || (i.code === 'W_NO_LITERAL' && NEEDS_LITERAL[j.targetLanguage]);
      if (hard) { errs++; console.log(`   ❌ ${i.code} ${i.message}`); }
      else warns.push(`#${L.order + 1} ${i.code} ${i.message}`);
    }
  }
  if (warns.length) console.log(`   ⚠️ ${warns.length} огоҳӣ:\n     ` + warns.join('\n     '));
  console.log(`   хато: ${errs}`);
  total += errs;
}
console.log(`\nҶАМЪ ХАТО: ${total}`);
process.exit(total ? 1 : 0);
