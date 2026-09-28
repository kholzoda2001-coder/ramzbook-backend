/**
 * Санҷиши бастаи гуфтор ПЕШ аз seed — бо ҳамон муҳаррик ва қоидаҳои сервер.
 *
 *   npx ts-node-transpile-only -O '{"module":"commonjs","moduleResolution":"node"}' prisma/_check-speaking-pack.ts <slug>…
 */
import { readFileSync } from 'fs';
import { generateSteps, configForEv, DEFAULT_CONFIG, asStage } from '../lib/speaking/engine';
import { validateLesson } from '../lib/speaking/validate';

let total = 0;
for (const slug of process.argv.slice(2)) {
  const j = JSON.parse(readFileSync(`content/speaking/${slug}.json`, 'utf8'));
  const cfg = { ...DEFAULT_CONFIG, lang: j.targetLanguage };
  const prev: any[] = [];
  let errs = 0;
  const warns: string[] = [];
  console.log(`\n══ ${slug} · ${j.category.titleTranslated} (order ${j.category.order})`);
  for (const L of j.lessons) {
    const items = L.items.map((x: any, i: number) => ({ id: `L${L.order}i${i}`, kind: x.kind, text: x.text, translation: x.translation, literal: x.literal, note: x.note, cue: x.cue, cueTranslation: x.cueTranslation, audioUrl: 'x', intent: x.intent ?? null, accepts: x.accepts ?? [], swaps: x.swaps ?? [] }));
    const issues = validateLesson({ id: 'L', items, stage: L.stage } as any, { targetScript: /[а-яё]/i, categoryTexts: new Set() } as any, cfg as any).filter((i: any) => i.code !== 'W_NO_AUDIO');
    const steps = generateSteps(items as any, configForEv(4, cfg as any), { repeat: false, stage: asStage(L.stage), review: prev.slice(-6), position: L.order } as any);
    prev.push(...items.filter((i: any) => i.kind === 'word' || i.kind === 'sentence'));
    console.log(`#${L.order + 1} ${L.stage.padEnd(9)} ${L.title}${L.mode ? ' [' + L.mode + ']' : ''} | ${steps.length} қадам: ${steps.map((s: any) => s.kind).join(',')}`);
    for (const i of issues as any[]) {
      if (i.severity === 'error') { errs++; console.log(`   ❌ ${i.code} ${i.message}`); }
      else warns.push(`#${L.order + 1} ${i.code} ${i.message}`);
    }
  }
  if (warns.length) console.log(`   ⚠️ ${warns.length} огоҳӣ:\n     ` + warns.join('\n     '));
  console.log(`   хато: ${errs}`);
  total += errs;
}
console.log(`\nҶАМЪ ХАТО: ${total}`);
process.exit(total ? 1 : 0);
