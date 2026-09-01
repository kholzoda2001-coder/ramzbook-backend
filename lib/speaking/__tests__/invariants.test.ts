import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  generateSteps,
  toEngineItem,
  DEFAULT_CONFIG,
  configForEv,
  type EngineItem,
  type Step,
} from '@/lib/speaking/engine';

/**
 * Инвариантҳои §2.7 — қоидаҳое, ки муҳаррик ҳеҷ гоҳ вайрон карда
 * наметавонад, новобаста аз вуруд.
 *
 * M1 танҳо 1 ва 2-ро талаб мекунад. Боқимонда (3–7) дар қадамҳои
 * баъдӣ фаъол мешаванд.
 */

const F = path.join(import.meta.dirname, '__fixtures__');

interface Fixture {
  file: string;
  repeat: boolean;
  contentSource: string;
  items: number;
}

const index: Fixture[] = JSON.parse(readFileSync(path.join(F, 'index.json'), 'utf8'));

function stepsOf(fx: Fixture): Step[] {
  const items: EngineItem[] = JSON.parse(readFileSync(path.join(F, fx.file), 'utf8'));
  return generateSteps(items.map(toEngineItem), DEFAULT_CONFIG, { repeat: fx.repeat });
}

describe('§2.7 инв.1 — ҳеҷ ду қадами пайдарпай ҳамон itemId надоранд', () => {
  for (const fx of index) {
    it(fx.file, () => {
      const steps = stepsOf(fx);
      const clashes: string[] = [];
      for (let i = 1; i < steps.length; i++) {
        // Истиснои ягона: `chunk`-ҳои паси ҳам (M5).
        const bothChunks = steps[i].kind === 'chunk' && steps[i - 1].kind === 'chunk';
        if (steps[i].itemId === steps[i - 1].itemId && !bothChunks) {
          clashes.push(
            `қадами ${i}→${i + 1}: ${steps[i - 1].kind} → ${steps[i].kind} (${steps[i].itemId})`,
          );
        }
      }
      expect(clashes).toEqual([]);
    });
  }
});

describe('§2.7 инв.2 — translate/recall/swap камаш gap қадам пас аз say-и ҳамон воҳид', () => {
  for (const fx of index) {
    it(fx.file, () => {
      const steps = stepsOf(fx);
      const sayAt = new Map<string, number>();
      steps.forEach((s, i) => {
        if (s.kind === 'say' && !sayAt.has(s.itemId)) sayAt.set(s.itemId, i);
      });

      const tooClose: string[] = [];
      steps.forEach((s, i) => {
        if (s.kind !== 'translate' && s.kind !== 'recall' && s.kind !== 'swap') return;
        const at = sayAt.get(s.itemId);
        // Воҳиде, ки умуман `say` надорад (ҷумлаи кӯтоҳ) — қоида дахл надорад.
        if (at === undefined) return;
        if (i - at < DEFAULT_CONFIG.gap) {
          tooClose.push(`${s.itemId}: say@${at} → ${s.kind}@${i} (фосила ${i - at})`);
        }
      });
      expect(tooClose).toEqual([]);
    });
  }
});

describe('M1 танҳо ТАРТИБро иваз мекунад, на мазмунро', () => {
  for (const fx of index) {
    it(`${fx.file} · маҷмӯи қадамҳо бо baseline-и M0 баробар`, () => {
      const base = JSON.parse(
        readFileSync(
          path.join(
            import.meta.dirname,
            '__snapshots__',
            'baseline',
            fx.file.replace('.input.json', '.json'),
          ),
          'utf8',
        ),
      );
      const norm = (xs: { kind: string; itemId: string }[]) =>
        xs.map((x) => `${x.kind}|${x.itemId}`).sort();

      expect(norm(stepsOf(fx))).toEqual(norm(base.output.exercises));
    });
  }
});

describe('§2.7 инв.7 — ҳар chunk.target суффикси матни воҳиди худ аст', () => {
  for (const fx of index) {
    it(`${fx.file} (ev=2)`, () => {
      const items: EngineItem[] = JSON.parse(readFileSync(path.join(F, fx.file), 'utf8'));
      const byId = new Map(items.map((i) => [i.id, i.text.trim()]));
      const steps = generateSteps(items.map(toEngineItem), configForEv(2), {
        repeat: fx.repeat,
      });

      const chunks = steps.filter((s) => s.kind === 'chunk');
      const bad = chunks.filter((s) => !byId.get(s.itemId)?.endsWith(s.target));
      expect(bad.map((s) => `${s.itemId}: «${s.target}»`)).toEqual([]);

      // ⚠️ Дарозии ҷумла ДИГАР мавҷудияти чункро кафолат намедиҳад:
      // алгоритм марзи таркибро талаб мекунад ва агар ягон буриши тоза
      // набошад, занҷир НЕСТ (қасдан — чунки бад аз набудан бадтар аст).
      // Дарси танҳо-калима бошад ҳеҷ гоҳ chunk надорад.
      const hasSentence = items.some((i) => i.kind !== 'word');
      if (!hasSentence) expect(chunks.length).toBe(0);
    });
  }
});

describe('§10.2 — гейти версия', () => {
  for (const fx of index) {
    it(`${fx.file} · ev=1 ҳеҷ chunk/swap намедиҳад`, () => {
      const items: EngineItem[] = JSON.parse(readFileSync(path.join(F, fx.file), 'utf8'));
      const kinds = new Set(
        generateSteps(items.map(toEngineItem), configForEv(1), { repeat: fx.repeat })
          .map((s) => s.kind),
      );
      expect(kinds.has('chunk')).toBe(false);
      expect(kinds.has('swap')).toBe(false);
    });
  }

  it('ev=1 хуруҷи он бо DEFAULT_CONFIG айнан баробар аст (M1 бетағйир)', () => {
    for (const fx of index) {
      const items: EngineItem[] = JSON.parse(readFileSync(path.join(F, fx.file), 'utf8'));
      const a = generateSteps(items.map(toEngineItem), DEFAULT_CONFIG, { repeat: fx.repeat });
      const b = generateSteps(items.map(toEngineItem), configForEv(1), { repeat: fx.repeat });
      expect(JSON.stringify(b)).toBe(JSON.stringify(a));
    }
  });
});
