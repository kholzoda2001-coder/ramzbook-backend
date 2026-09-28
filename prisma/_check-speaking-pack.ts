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
// русӣ: лозим нест (қарори корбар, 12.09.2026).
const SCRIPT: Record<string, RegExp> = { ru: /[а-яё]/i, en: /[a-z]/i };
const NEEDS_LITERAL: Record<string, boolean> = { ru: false, en: true };
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
        else if (/[a-z]/i.test(it.literal)) { errs++; console.log(`   ❌ LITERAL_LATIN «${it.text}» → «${it.literal}»`); }
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
