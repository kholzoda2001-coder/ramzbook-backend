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
  // русӣ (2026-09-20): ҷонишин, бандак, пайвандак ва ҷузъи ибораи устувор
  'я','ты','вы','он','она','оно','мы','они','меня','тебя','вас','нас','мне',
  'тебе','вам','нам','ему','ей','им','себя','вами','нами',
  'есть','был','была','было','были','буду','будешь','будет','будем','будут',
  'и','а','но','или','если','потому','же','ли','бы','тоже','также','ведь',
  'зовут','пожаловать',
]);
/**
 * Калимаҳои хоси ЗАБОН. Барои забонҳои алифбои лотинӣ рӯйхати умумӣ кор
 * намекунад: `am`, `in`, `war`, `was` дар олмонӣ ва англисӣ ду чизи тамоман
 * гуногунанд (ниг. `LANG_LISTS` дар `engine.ts`).
 */
const DE_MID = new Set([
  'ich','du','er','sie','es','wir','ihr','man','mich','dich','ihn','uns','euch',
  'mir','dir','ihm','ihnen','bin','bist','ist','sind','seid','war','waren','sein',
  'habe','hast','hat','haben','kann','können','muss','möchte','möchten','wird',
  'und','aber','oder','dass','weil','wenn','denn','als','nicht','kein','nur',
  'auch','sehr','schon','noch','doch','mal','zu','heiße','heißen','heißt','geht',
]);
const DE_WH = new Set([
  'wie','was','wo','wann','warum','wer','wen','wem','woher','wohin','welche','welcher',
]);
const DE_GLUED = new Set([
  'in','im','an','am','auf','aus','mit','von','vom','zu','zum','zur','bei','beim',
  'für','über','unter','nach','vor','seit','ohne','um','durch','gegen','neben','wegen',
  'der','die','das','den','dem','des','ein','eine','einen','einem','einer','eines',
  'mein','meine','meinen','meinem','meiner','dein','deine','sein','seine','unser',
  'dieser','diese','dieses','diesen','diesem','alle','alles','viele','keine',
  'zwei','drei','vier','fünf','zehn','zwanzig','dreißig',
  'guten','gute','gutes','schönen','schöne','neue','neuen','große','kleine',
]);
const langSet = (lang: string, base: Set<string>, de: Set<string>) => (lang === 'de' ? de : base);

const WH = new Set(['what','which','how','where','who','whom','whose','why','when',
  'как','что','где','когда','почему','зачем','кто','куда','откуда','сколько',
  'какой','какая','какое','какие','чей','чья']);
const bare = (w: string) => w.toLowerCase().replace(/[^a-zßà-ɏа-џؠ-يٱ-ۓ가-힣]/g, '');
const W = (s: string) => s.trim().split(/\s+/).filter(Boolean);

interface Pack {
  slug: string;
  targetLanguage: string;
  lessons: { items: { kind: string; text: string; translation: string }[] }[];
}

interface Sentence {
  text: string;
  /** Рамзи забони омӯзиш — `buildChain` барои баъзе забонҳо рӯйхати худро дорад. */
  lang: string;
}

const sentences: Sentence[] = [];
{
  const seen = new Set<string>();
  for (const f of readdirSync(PACKS).filter((x) => x.endsWith('.json'))) {
    const pack: Pack = JSON.parse(readFileSync(path.join(PACKS, f), 'utf8'));
    for (const L of pack.lessons)
      for (const i of L.items) {
        const t = i.text.trim();
        if (i.kind !== 'word' && t && i.translation.trim() && !seen.has(t)) {
          seen.add(t);
          sentences.push({ text: t, lang: pack.targetLanguage });
        }
      }
  }
}

const cfgOf = (lang: string) => ({ ...DEFAULT_CONFIG, lang });
const chunks = sentences.flatMap((s) =>
  buildChain(s.text, cfgOf(s.lang)).map((c) => ({ parent: s.text, chunk: c, lang: s.lang })),
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
    const bad = chunks.filter((c) =>
      langSet(c.lang, MID_PHRASE, DE_MID).has(bare(W(c.chunk)[0])));
    expect(bad.map((c) => `${c.chunk} ← ${c.parent}`)).toEqual([]);
  });

  it('ҳеҷ чунк таркиби «калимаи саволӣ + …»-ро намешиканад', () => {
    const bad = chunks.filter((c) => {
      const w = W(c.parent);
      const k = w.length - W(c.chunk).length;
      return k > 0 && langSet(c.lang, WH, DE_WH).has(bare(w[k - 1]));
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
      // русӣ: пешоянд, соҳибият, ишора, адад ва сифатҳои сермаҳсул
      'в','во','на','с','со','из','от','до','для','по','за','к','ко','у','о','об',
      'при','над','под','без','про','через','около',
      'мой','моя','моё','мое','мои','моего','моему','моей','моим',
      'ваш','ваша','ваше','ваши','вашего','твой','твоя','твоё','твои',
      'наш','наша','наше','наши','его','её','ее','их',
      'этот','эта','это','эти','этом','тот','та','те','весь','вся','всё','всего','всем',
      'один','одна','одно','два','две','три','четыре','пять','шесть','семь',
      'восемь','девять','десять','двадцать','тридцать','сорок','пятьдесят','сто',
      'двое','трое',
      'добрый','доброе','добрая','доброго','спокойной','хороший','хорошая',
      'хорошее','хорошего','новый','новая','новое','новые','большой','большая',
      'маленький','молодой','красивый','первый','последний','русский',
      'таджикский','рабочий','главный','следующий','прошлый',
    ]);
    const bad = chunks.filter((c) => {
      const w = W(c.parent);
      const k = w.length - W(c.chunk).length;
      // Истиснои ягона: часпондан тамоми ҷумларо медод (ниг. `buildChain`).
      return k > 0 && langSet(c.lang, GLUED, DE_GLUED).has(bare(w[k - 1])) && k > 1;
    });
    expect(bad.map((c) => `${c.chunk} ← ${c.parent}`)).toEqual([]);
  });

  it('ҷумлаи ИНКОРӢ тамоман чунк намегирад', () => {
    // Занҷир аз охир бурида мешавад, пас инкор берун мемонад ва хонанда
    // порчаи МУҚОБИЛмаъноро бо овоз такрор мекунад: «eat meat.» пеш аз
    // «I don't eat meat.» (аудити 2026-09-06).
    const NEG = /\b(not|no|never|none|nothing|nobody|n't|cannot|nicht|kein|keine|nein)\b/i;
    const bad = chunks.filter((c) => NEG.test(c.parent));
    expect(bad.map((c) => `${c.chunk} ← ${c.parent}`)).toEqual([]);
  });

  it('намунаҳои дастии инкор', () => {
    for (const s of [
      "I don't eat meat.",
      'There is no hot water.',
      'The light does not work.',
      'No, thank you.',
      'I do not know this city.',
      // 2026-09-13: `bare()` пештар танҳо a–z мегузошт — инкори кириллӣ/арабӣ дида намешуд.
      'Нет, я не водитель.',
      'Я не знаю этот город.',
      'Извините, я не понимаю.',
      'Ich verstehe nicht.',
      'Ich habe keine Kinder.',
      'لَا أَتَكَلَّمُ العَرَبِيَّة.',
      'أَنَا لَسْتُ مِنْ مِصْر.',
    ]) {
      const lang = /[А-Яа-яЁё]/.test(s) ? 'ru'
        : /[\u0600-\u06FF]/.test(s) ? 'ar'
        : /\b(ich|nicht|keine)\b/i.test(s) ? 'de'
        : 'en';
      expect(buildChain(s, cfgOf(lang))).toEqual([]);
    }
  });

  it('ҳеҷ чунк ба тамоми ҷумла баробар нест', () => {
    const bad = chunks.filter((c) => c.chunk === c.parent);
    expect(bad.map((c) => c.parent)).toEqual([]);
  });

  it('пӯшиш аз 60% ҷумлаҳо кам нест', () => {
    const withChain = sentences.filter((s) => buildChain(s.text, cfgOf(s.lang)).length).length;
    expect(withChain / sentences.length).toBeGreaterThan(0.6);
  });
});
