import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  generateSteps,
  toEngineItem,
  DEFAULT_CONFIG,
  type EngineItem,
} from '@/lib/speaking/engine';

/**
 * ТАРТИБИ қадамҳо — снапшоти танҳо `[kind, itemId]`.
 *
 * Мазмуни қадам ин ҷо санҷида НАМЕШАВАД: он кори
 * `wire-contract.test.ts` аст. Ин файл ФРИЗЗ мешавад ва ҳар вақте ки
 * қадаме тартибро қасдан иваз мекунад, аз нав фризз карда мешавад
 * (бо шарҳ дар commit).
 *
 * Вуруд — танҳо `__fixtures__/`: ҳеҷ база, ҳеҷ бастаи JSON, ҳеҷ
 * баровардани сатр аз манбаъ.
 */

const F = path.join(import.meta.dirname, '__fixtures__');

interface Fixture {
  file: string;
  repeat: boolean;
  contentSource: string;
  items: number;
}

const index: Fixture[] = JSON.parse(readFileSync(path.join(F, 'index.json'), 'utf8'));

export function orderOf(fx: Fixture): string[] {
  const items: EngineItem[] = JSON.parse(readFileSync(path.join(F, fx.file), 'utf8'));
  return generateSteps(items.map(toEngineItem), DEFAULT_CONFIG, {
    repeat: fx.repeat,
  }).map((s, i) => `${String(i + 1).padStart(2)}. ${s.kind.padEnd(9)} ${s.itemId}`);
}

describe('тартиби қадамҳо', () => {
  it('ҳамаи 6 fixture ҳастанд', () => {
    expect(index).toHaveLength(6);
  });

  for (const fx of index) {
    it(fx.file, () => {
      expect(orderOf(fx)).toMatchSnapshot();
    });
  }
});
