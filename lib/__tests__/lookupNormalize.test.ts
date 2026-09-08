import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Тозакунии калима пеш аз ҷустуҷӯ — маҳз ҳамон намуна, ки роут истифода
 * мебарад.
 *
 * ── Боге, ки ин тест абадӣ мебандад ────────────────────────────────────────
 * Намунаи пештара чунин буд:
 *
 *     /^[^0-9A-Za-zЀ-ӿ'-]+|[^0-9A-Za-zЀ-ӿ'-]+$/g
 *
 * яъне «ҳар чизе, ки рақам, лотинӣ ё кириллӣ НЕСТ»-ро аз канорҳо мебурид.
 * Дар калимаи кореягӣ, арабӣ, чинӣ, японӣ, ибрӣ ё тайландӣ ҳеҷ яке аз онҳо
 * нест — пас ТАМОМИ калима «партов» ҳисоб мешуд:
 *
 *     «가세요» → ""  →  {"error":"word is required"}
 *
 * Хонанда китоби кореягиро мекушод, ба калима мезад, варақа мебаромад — ва
 * ХОЛӢ мемонд. Ҳеҷ хато, ҳеҷ огоҳӣ, ҳеҷ сатр дар лог.
 *
 * ⚠️ Тест намунаро аз ХУДИ РОУТ мехонад, на нусхаи худро дорад. Вагарна он
 * метавонист сабз монад, дар ҳоле ки роут аллакай чизи дигар мекунад.
 */
function normalizeFromRoute(): (s: string) => string {
  const file = path.join(
    process.cwd(),
    'app/api/mobile/lookup/route.ts',
  );
  const src = fs.readFileSync(file, 'utf8');
  const start = src.indexOf('new RegExp(', src.indexOf('const EDGE_JUNK ='));
  expect(start).toBeGreaterThan(-1);
  const end = src.indexOf(');', start) + 1;
  // eslint-disable-next-line no-eval
  const re = eval(src.slice(start, end)) as RegExp;
  return (raw: string) => raw.trim().replace(re, '').slice(0, 48);
}

const normalize = normalizeFromRoute();

describe('калима дар ҲАР хат зинда мемонад', () => {
  // 🔴 Ҳар яке аз инҳо пештар ба сатри ХОЛӢ табдил мешуд.
  const words: Array<[string, string]> = [
    ['кореягӣ', '가세요'],
    ['кореягӣ', '안녕히'],
    ['кореягӣ', '미안합니다'],
    ['арабӣ', 'مرحبا'],
    ['чинӣ', '你好'],
    ['японӣ', 'こんにちは'],
    ['ибрӣ', 'שלום'],
    ['тайландӣ', 'สวัสดี'],
    ['ҳиндӣ', 'हिन्दी'],
    ['юнонӣ', 'γεια'],
  ];

  for (const [lang, w] of words) {
    it(`${lang}: «${w}» бетағйир мемонад`, () => {
      expect(normalize(w)).toBe(w);
    });
  }
});

describe('хатҳое, ки пештар ҳам кор мекарданд', () => {
  it('лотинӣ ва кириллӣ', () => {
    expect(normalize('Home')).toBe('Home');
    expect(normalize('салом')).toBe('салом');
  });

  it('ҳарфҳои P, S, Z, C бурида НАМЕШАВАНД', () => {
    // ⚠️ Доми навбатии ҳамин ислоҳ: агар бэкслеш дар сатр гум шавад,
    // намуна ба `[p{P}p{S}p{Z}p{C}]` табдил меёбад ва маҳз ин ҳарфҳоро аз
    // канорҳо мебурад. «Sun» → «un».
    expect(normalize('Sun')).toBe('Sun');
    expect(normalize('Zebra')).toBe('Zebra');
    expect(normalize('Pop')).toBe('Pop');
    expect(normalize('Class')).toBe('Class');
  });
});

describe('аломати канорӣ бурида мешавад', () => {
  it('нохунак ва нуқта', () => {
    expect(normalize('«салом»')).toBe('салом');
    expect(normalize('...word!')).toBe('word');
    expect(normalize('“Hello”')).toBe('Hello');
    expect(normalize('(note)')).toBe('note');
  });

  it('апостроф ва дефиси ДОХИЛӢ мемонанд', () => {
    expect(normalize("don't")).toBe("don't");
    expect(normalize('well-known')).toBe('well-known');
  });

  it('фосила бурида мешавад', () => {
    expect(normalize('  water  ')).toBe('water');
  });
});

describe('ҳадҳо', () => {
  it('сатри холӣ холӣ мемонад', () => {
    expect(normalize('')).toBe('');
    expect(normalize('   ')).toBe('');
  });

  it('танҳо аломат холӣ мешавад', () => {
    // Ин ДУРУСТ аст: «...» калима нест ва роут `word is required` медиҳад.
    expect(normalize('...')).toBe('');
    expect(normalize('«»')).toBe('');
  });

  it('дарозӣ дар 48 ҳарф бурида мешавад', () => {
    expect(normalize('a'.repeat(80))).toHaveLength(48);
  });
});
