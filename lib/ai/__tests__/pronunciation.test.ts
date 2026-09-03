import { afterEach, describe, expect, it, vi } from 'vitest';

import { assessPronunciation } from '../pronunciation';

/**
 * 🔴 ЧАРО ин файл ҳаст (2026-09-03).
 *
 * Роҳи баҳодиҳии талаффуз 200 медод, Azure «I am hungry»-ро ДУРУСТ мешунид —
 * ва ҳама холҳо 0 буданд. Се маротиба деплой кардам ва дархостро «ислоҳ»
 * кардам, дар ҳоле ки мушкил дар ХОНДАНИ ҷавоб буд: Azure холҳоро ҲАМВОР
 * мефиристад (`Words[i].AccuracyScore`), мо бошем онҳоро дар дохили
 * `PronunciationAssessment` меҷустем. `?? 0` набудани майдонро ба «холи 0»
 * табдил медод — яъне хонандаи хубталаффуз 0 мегирифт.
 *
 * Ҷавоби поён НУСХАИ ВОҚЕИИ Azure аст (аз санҷиши зинда гирифта шуд), на
 * тахмини ман. Маҳз барои ҳамин ин тест арзиш дорад.
 */
const realAzureFlat = {
  RecognitionStatus: 'Success',
  DisplayText: 'I am hungry.',
  NBest: [
    {
      Lexical: 'i am hungry',
      Display: 'I am hungry.',
      AccuracyScore: 97,
      FluencyScore: 100,
      CompletenessScore: 100,
      PronScore: 98.2,
      Words: [
        {
          Word: 'i',
          AccuracyScore: 97,
          ErrorType: 'None',
          Phonemes: [{ Phoneme: 'ay', AccuracyScore: 97 }],
        },
        {
          Word: 'hungry',
          AccuracyScore: 94,
          ErrorType: 'None',
          Phonemes: [
            { Phoneme: 'h', AccuracyScore: 100 },
            { Phoneme: 'iy', AccuracyScore: 78 },
          ],
        },
      ],
    },
  ],
};

/** Шакли ЛОНАДОР — SDK ва аксари намунаҳои ҳуҷҷатҳо ҳаминро медиҳанд. */
const nested = {
  RecognitionStatus: 'Success',
  NBest: [
    {
      Display: 'I am hungry.',
      PronunciationAssessment: {
        AccuracyScore: 97,
        FluencyScore: 100,
        CompletenessScore: 100,
        PronScore: 98.2,
      },
      Words: [
        {
          Word: 'i',
          PronunciationAssessment: { AccuracyScore: 97, ErrorType: 'None' },
          Phonemes: [
            { Phoneme: 'ay', PronunciationAssessment: { AccuracyScore: 97 } },
          ],
        },
      ],
    },
  ],
};

function mockAzure(body: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify(body), { status: 200 })),
  );
}

const call = () =>
  assessPronunciation({
    audio: Buffer.from([1, 2, 3]),
    reference: 'I am hungry',
    locale: 'en-US',
  });

describe('assessPronunciation', () => {
  const prev = { ...process.env };

  afterEach(() => {
    vi.unstubAllGlobals();
    process.env = { ...prev };
  });

  it('холҳоро аз шакли ҲАМВОР мехонад (ҳамон чизе ки REST воқеан медиҳад)', async () => {
    process.env.AZURE_SPEECH_KEY = 'k';
    process.env.AZURE_SPEECH_REGION = 'r';
    mockAzure(realAzureFlat);

    const r = await call();

    expect(r).not.toBeNull();
    expect(r!.accuracy).toBe(97);
    expect(r!.fluency).toBe(100);
    expect(r!.completeness).toBe(100);
    expect(r!.overall).toBe(98.2);
    expect(r!.recognized).toBe('I am hungry.');

    // Маҳз ҳамин ҷо бог зиндагӣ мекард: калима ва фонема.
    expect(r!.words.map((w) => w.score)).toEqual([97, 94]);
    expect(r!.words[1].phonemes.map((p) => p.score)).toEqual([100, 78]);
    expect(r!.words[0].errorType).toBe('None');
  });

  it('шакли ЛОНАДОРро низ мефаҳмад — версияи API набояд холҳоро куштан', async () => {
    process.env.AZURE_SPEECH_KEY = 'k';
    process.env.AZURE_SPEECH_REGION = 'r';
    mockAzure(nested);

    const r = await call();

    expect(r!.accuracy).toBe(97);
    expect(r!.overall).toBe(98.2);
    expect(r!.words[0].score).toBe(97);
    expect(r!.words[0].phonemes[0].score).toBe(97);
  });

  it('бе калид `null` — роҳ 503 медиҳад ва тугма пинҳон мемонад', async () => {
    delete process.env.AZURE_SPEECH_KEY;
    delete process.env.AZURE_SPEECH_REGION;
    expect(await call()).toBeNull();
  });

  it('гуфтор нашунид — `no-speech`, на холи 0', async () => {
    process.env.AZURE_SPEECH_KEY = 'k';
    process.env.AZURE_SPEECH_REGION = 'r';
    mockAzure({ RecognitionStatus: 'NoMatch', NBest: [] });

    await expect(call()).rejects.toThrow('no-speech');
  });
});
