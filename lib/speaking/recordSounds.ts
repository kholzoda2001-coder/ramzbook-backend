import { prisma } from '@/lib/prisma';
import { rollWeek, addHit, type SoundHit, type SoundRow } from './sounds';

/**
 * Кӯшишҳои садоро аз як дарс ба база менависад.
 *
 * ⚠️ Мантиқ ин ҷо, НА дар роут: файли роути Next.js набояд ғайр аз
 * ҳендлерҳо чизе содир кунад — вагарна билд хато медиҳад. Ҳамон қоидае,
 * ки `speakingMistakes.ts` риоя мекунад.
 *
 * ⚠️ Ин функсия ҲЕҶ ГОҲ намепартояд: ҳисоботи садо чизи ёрирасон аст ва
 * набояд анҷоми дарсро вайрон кунад. Хато танҳо ба лог меравад.
 */
export async function recordSounds({
  userId,
  languageId,
  hits,
}: {
  userId: string;
  languageId: string;
  hits: SoundHit[];
}): Promise<void> {
  if (!languageId || hits.length === 0) return;

  // Кӯшишҳо аз рӯи фонема ҷамъ мешаванд — то ба ҷои 40 навиштан 5 бор
  // нависем. Як дарс ҳамагӣ чанд фонемаи гуногун дорад.
  const byPhoneme = new Map<string, SoundHit[]>();
  for (const h of hits) {
    const key = (h.phoneme ?? '').trim().toLowerCase();
    // Хол берун аз 0–100 — маълумоти вайрон, ҳисобро вайрон мекунад.
    if (!key || !Number.isFinite(h.score) || h.score < 0 || h.score > 100) {
      continue;
    }
    const list = byPhoneme.get(key);
    if (list) list.push({ ...h, phoneme: key });
    else byPhoneme.set(key, [{ ...h, phoneme: key }]);
  }
  if (byPhoneme.size === 0) return;

  const now = new Date();

  try {
    const existing = await prisma.speakingSound.findMany({
      where: {
        userId,
        languageId,
        phoneme: { in: Array.from(byPhoneme.keys()) },
      },
    });
    const byKey = new Map(existing.map((r) => [r.phoneme, r]));

    for (const [phoneme, list] of Array.from(byPhoneme.entries())) {
      const found = byKey.get(phoneme);
      let row: SoundRow = found
        ? {
            phoneme,
            curAttempts: found.curAttempts,
            curSum: found.curSum,
            curStart: found.curStart,
            prevAttempts: found.prevAttempts,
            prevSum: found.prevSum,
            examples: found.examples,
          }
        : {
            phoneme,
            curAttempts: 0,
            curSum: 0,
            curStart: now,
            prevAttempts: 0,
            prevSum: 0,
            examples: [],
          };

      // Аввал гардиши ҳафта, БАЪД иловаи кӯшишҳо — вагарна холи нав ба
      // сатили ҳафтаи кӯҳна меафтод.
      row = rollWeek(row, now);
      for (const h of list) row = addHit(row, h);

      await prisma.speakingSound.upsert({
        where: {
          userId_languageId_phoneme: { userId, languageId, phoneme },
        },
        create: {
          userId,
          languageId,
          phoneme,
          curAttempts: row.curAttempts,
          curSum: row.curSum,
          curStart: row.curStart,
          prevAttempts: row.prevAttempts,
          prevSum: row.prevSum,
          examples: row.examples,
          lastAt: now,
        },
        update: {
          curAttempts: row.curAttempts,
          curSum: row.curSum,
          curStart: row.curStart,
          prevAttempts: row.prevAttempts,
          prevSum: row.prevSum,
          examples: row.examples,
          lastAt: now,
        },
      });
    }
  } catch (err) {
    // Ҷадвал ҳанӯз сохта нашуда (SQL иҷро нашуд) ё хатои шабака — дарс
    // бояд ба ҳар ҳол тамом шавад.
    console.error('[speaking/sounds] сабт нашуд:', err);
  }
}

/** Бадани дархостро ба рӯйхати кӯшишҳо табдил медиҳад. */
export function parseSoundHits(raw: unknown): SoundHit[] {
  if (!Array.isArray(raw)) return [];
  const out: SoundHit[] = [];
  // Сақф: як дарс ~145 кӯшиш дорад; бештар аз ин маънои дархости сохта аст.
  for (const e of raw.slice(0, 400)) {
    if (!e || typeof e !== 'object') continue;
    const o = e as Record<string, unknown>;
    // `trim`: Azure барои `ko-KR`, `ru-RU`, `ar-SA` фонемаҳоро БЕ НОМ медиҳад
    // (санҷиши зинда, 2026-09-12) — сатри холӣ ё фосила «садо» нест ва ҳисоботро
    // бо сатри беном вайрон мекард. Ҳамон қоидаи клиент (`_collectSounds`).
    const phoneme = typeof o.phoneme === 'string' ? o.phoneme.trim() : '';
    const score = typeof o.score === 'number' ? o.score : NaN;
    const word = typeof o.word === 'string' ? o.word : undefined;
    if (!phoneme || !Number.isFinite(score)) continue;
    out.push({ phoneme, score, word });
  }
  return out;
}
