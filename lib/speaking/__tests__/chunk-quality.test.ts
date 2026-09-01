import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { buildChain, DEFAULT_CONFIG } from '@/lib/speaking/engine';

/**
 * Сифати чунк бар ТАМОМИ мазмуни мавҷуд.
 *
 * ЧАРО ин ҷудо аз `builders.test.ts`: он ҷо намунаҳои дастӣ ҳастанд ва
 * танҳо он чизеро месанҷанд, ки ман пешакӣ фикр кардаам. Ин файл
 * алгоритмро бар ҳамаи 150 ҷумлаи воқеӣ мегузаронад — маҳз ҳамин
 * буд, ки хатогии аввалро ошкор кард (43% чунки бемаънӣ).
 *
 * Агар бастаи нав илова шавад ва алгоритм дар он бад бурад, ин тест
 * фавран сурх мешавад.
 */

const PACKS = path.resolve(import.meta.dirname, '../../../content/speaking');

/** Оғозҳое, ки таркибро мешикананд (пешоянд, ёридиҳанда, пайвандак, ҳиссача). */
const MID_PHRASE = new Set([
  'to','of','in','on','at','for','with','from','by','about','into','onto','over',
  'under','near','between','through','during','after','before','without','within',
  'across','behind','beside','around','than',
  'am','is','are','was','were','be','been','being','do','does','did','have','has',
  'had','will','would','shall','should','can','could','may','might','must',
  'and','or','but','so','because','if','while','although','though','as',
  'much','many','more','most','not','nt','too','very','just','only','also',
]);
const WH = new Set(['what','which','how','where','who','whom','whose','why','when']);
const bare = (w: string) => w.toLowerCase().replace(/[^a-z]/g, '');
const W = (s: string) => s.trim().split(/\s+/).filter(Boolean);

interface Pack {
  slug: string;
  lessons: { items: { kind: string; text: string; translation: string }[] }[];
}

const sentences: string[] = [];
{
  const seen = new Set<string>();
  for (const f of readdirSync(PACKS).filter((x) => x.endsWith('.json'))) {
    const pack: Pack = JSON.parse(readFileSync(path.join(PACKS, f), 'utf8'));
    for (const L of pack.lessons)
      for (const i of L.items) {
        const t = i.text.trim();
        if (i.kind !== 'word' && t && i.translation.trim() && !seen.has(t)) {
          seen.add(t);
          sentences.push(t);
        }
      }
  }
}

const chunks = sentences.flatMap((s) =>
  buildChain(s, DEFAULT_CONFIG).map((c) => ({ parent: s, chunk: c })),
);

describe('сифати чунк бар тамоми мазмун', () => {
  it('мазмун ёфт шуд', () => {
    expect(sentences.length).toBeGreaterThan(100);
    expect(chunks.length).toBeGreaterThan(50);
  });

  it('ҳар чунк СУФФИКСИ ҷумлаи худ аст (§2.7 инв.7)', () => {
    const bad = chunks.filter((c) => !c.parent.endsWith(c.chunk));
    expect(bad.map((c) => `${c.chunk} ← ${c.parent}`)).toEqual([]);
  });

  it('ҳеҷ чунк камтар аз 2 калима надорад', () => {
    const bad = chunks.filter((c) => W(c.chunk).length < 2);
    expect(bad.map((c) => `${c.chunk} ← ${c.parent}`)).toEqual([]);
  });

  it('ҳеҷ чунк дар МОБАЙНИ таркиб сар намешавад', () => {
    const bad = chunks.filter((c) => MID_PHRASE.has(bare(W(c.chunk)[0])));
    expect(bad.map((c) => `${c.chunk} ← ${c.parent}`)).toEqual([]);
  });

  it('ҳеҷ чунк таркиби «калимаи саволӣ + …»-ро намешиканад', () => {
    const bad = chunks.filter((c) => {
      const w = W(c.parent);
      const k = w.length - W(c.chunk).length;
      return k > 0 && WH.has(bare(w[k - 1]));
    });
    expect(bad.map((c) => `${c.chunk} ← ${c.parent}`)).toEqual([]);
  });

  it('ҳеҷ чунк муайянкунанда ё ададро аз исми худ намеканад', () => {
    const GLUED = new Set([
      'one','two','three','four','five','six','seven','eight','nine','ten',
      'eleven','twelve','twenty','thirty','forty','fifty','hundred',
      'a','an','the','my','your','his','her','its','our','their',
      'this','that','these','those','some','any','no','another','other',
      'every','each','both','several','few','little','all',
    ]);
    const bad = chunks.filter((c) => {
      const w = W(c.parent);
      const k = w.length - W(c.chunk).length;
      // Истиснои ягона: часпондан тамоми ҷумларо медод (ниг. `buildChain`).
      return k > 0 && GLUED.has(bare(w[k - 1])) && k > 1;
    });
    expect(bad.map((c) => `${c.chunk} ← ${c.parent}`)).toEqual([]);
  });

  it('ҳеҷ чунк ба тамоми ҷумла баробар нест', () => {
    const bad = chunks.filter((c) => c.chunk === c.parent);
    expect(bad.map((c) => c.parent)).toEqual([]);
  });

  it('пӯшиш аз 60% ҷумлаҳо кам нест', () => {
    const withChain = sentences.filter((s) => buildChain(s, DEFAULT_CONFIG).length).length;
    expect(withChain / sentences.length).toBeGreaterThan(0.6);
  });
});
