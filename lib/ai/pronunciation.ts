/**
 * Баҳодиҳии ТАЛАФФУЗ — Azure Speech Pronunciation Assessment.
 *
 * ── Чаро хидмати ҷудо, дар ҳоле ки мо аллакай STT дорем ────────────────────
 *
 * Муҳаррики ҳозираи барнома (`speech_to_text` → Android `SpeechRecognizer`)
 * **диктовка** аст: он садоро ба МАТН табдил медиҳад. Мо аз ҳамон матн
 * тахмин мекунем, ки талаффуз дуруст буд ё не — тамоми қабати фонетикӣ дар
 * `frontend/lib/services/phonetics.dart` маҳз ҳамин тахмин аст.
 *
 * Ин тахмин сақф дорад: агар муҳаррик «thi» нависад, мо намедонем, ки
 * хонанда `/t/`-ро дуруст гуфту садоноки дигар дод, ё баръакс. Ҷавоби
 * ВОҚЕӢ танҳо аз баҳодиҳии ФОНЕМА мебарояд.
 *
 * Azure ягона хидмати маъмулест, ки инро ҳамчун API медиҳад: барои ҳар
 * калима ва ҳар фонема хол (0..100), плюс равонӣ ва пуррагӣ.
 *
 * ── Ин ҷараёни ҳозираро ИВАЗ НАМЕКУНАД ─────────────────────────────────────
 *
 * Дар Android микрофон ИСТИСНОӢ аст: ҳамзамон `SpeechRecognizer` кор кунад
 * ва мо WAV сабт кунем — намешавад. Пас ин хидмат ТАНҲО дар лаҳзаи алоҳида
 * («Талаффузи маро санҷ») даъват мешавад, вақте микрофон озод аст. Гардиши
 * реалтайми «гуфтам — сабз шуд» даст намехӯрад.
 *
 * ── Калид ──────────────────────────────────────────────────────────────────
 *
 * `AZURE_SPEECH_KEY` + `AZURE_SPEECH_REGION` дар муҳити Vercel.
 * Агар онҳо набошанд, функсия `null` бармегардонад — ва роҳ (endpoint)
 * ба барнома «хомӯш» мегӯяд, то тугма умуман нишон дода нашавад.
 * ⚠️ Калид ҲЕҶ ГОҲ ба барнома намеравад: аудио аз мизоҷ ба сервери МО
 * меояд, сервер ба Azure муроҷиат мекунад.
 */

export type PhonemeScore = {
  phoneme: string;
  score: number;
};

export type WordScore = {
  word: string;
  score: number;
  /** `None` | `Mispronunciation` | `Omission` | `Insertion` */
  errorType: string;
  phonemes: PhonemeScore[];
};

export type PronunciationResult = {
  /** 0..100 — то чӣ андоза ба талаффузи бумӣ наздик аст. */
  accuracy: number;
  /** 0..100 — равонӣ: таваққуфҳо, суръат. */
  fluency: number;
  /** 0..100 — чанд фоизи матни ҳадаф воқеан гуфта шуд. */
  completeness: number;
  /** Холи умумии Azure. */
  overall: number;
  /** Он чи муҳаррик шунид — барои ташхис. */
  recognized: string;
  words: WordScore[];
};

/** Хидмат танзим шудааст? Роҳ аз рӯи ин ҷавоб тугмаро хомӯш мекунад. */
export function isPronunciationConfigured(): boolean {
  return Boolean(process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION);
}

/**
 * Хол барои як ибора.
 *
 * [audio] — WAV 16 kHz mono PCM (маҳз ҳамин формат: Azure REST дигарашро
 * бе конвертатсия қабул намекунад).
 * [reference] — матни ҲАДАФ, ки хонанда бояд гуфта бошад.
 * [locale] — `en-US`, `ru-RU`, … (BCP-47).
 *
 * `null` = хидмат танзим нашудааст. Хато = `throw`.
 */
export async function assessPronunciation({
  audio,
  reference,
  locale,
}: {
  audio: Buffer;
  reference: string;
  locale: string;
}): Promise<PronunciationResult | null> {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  if (!key || !region) return null;

  // Танзимоти баҳодиҳӣ ҳамчун сарлавҳаи base64 — ҳамон тавре ки REST-и
  // Azure талаб мекунад.
  const params = Buffer.from(
    JSON.stringify({
      ReferenceText: reference,
      GradingSystem: 'HundredMark',
      Granularity: 'Phoneme',
      // ⚠️ Бе ин Azure сохтори калима/фонемаро мефиристад, вале блоки
      // холро НЕ — ва ҳама холҳо 0 мешаванд (санҷиши воқеӣ, 2026-09-03:
      // «I am hungry» дуруст шунида шуд, accuracy=0). `Basic` танҳо
      // дақиқиро медиҳад; ба мо равонӣ ва пуррагӣ ҳам лозим аст.
      Dimension: 'Comprehensive',
      // ⚠️ `EnableMiscue: true` — Azure калимаи ПАРТОФТА ва ИЛОВАГИРО низ
      // нишон медиҳад. Бе он хонанда метавонист нимаи ҷумларо гӯяду холи
      // баланд гирад — маҳз ҳамон боге, ки мо дар муҳаррики худамон дошем.
      EnableMiscue: true,
    }),
    'utf8',
  ).toString('base64');

  const url =
    `https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1` +
    `?language=${encodeURIComponent(locale)}&format=detailed`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': key,
      'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000',
      'Pronunciation-Assessment': params,
      Accept: 'application/json',
    },
    body: new Uint8Array(audio),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Azure ${res.status}: ${body.slice(0, 200)}`);
  }

  const json = (await res.json()) as AzureResponse;
  const best = json.NBest?.[0];
  if (!best) {
    // Azure садоро гуфтор нашумурд. Ин хатои хонанда НЕСТ — шояд микрофон
    // ё гавғо. Даъваткунанда инро аз холи 0 фарқ карда метавонад.
    throw new Error('no-speech');
  }

  return {
    accuracy: score(best, 'AccuracyScore'),
    fluency: score(best, 'FluencyScore'),
    completeness: score(best, 'CompletenessScore'),
    overall: score(best, 'PronScore'),
    recognized: best.Display ?? best.Lexical ?? '',
    words: (best.Words ?? []).map((w) => ({
      word: w.Word,
      score: score(w, 'AccuracyScore'),
      errorType:
        w.ErrorType ?? w.PronunciationAssessment?.ErrorType ?? 'None',
      phonemes: (w.Phonemes ?? []).map((p) => ({
        phoneme: p.Phoneme,
        score: score(p, 'AccuracyScore'),
      })),
    })),
  };
}

/**
 * Як холро мехонад — аз ҲАР ДУ шакли ҷавоби Azure.
 *
 * 🔴 Санҷиши воқеӣ (2026-09-03): REST холҳоро ҲАМВОР мефиристад —
 * `NBest[0].AccuracyScore`, `Words[i].AccuracyScore` — на дар дохили объекти
 * `PronunciationAssessment`, ки SDK-ҳо ва аксари намунаҳои ҳуҷҷатҳо нишон
 * медиҳанд. Мо танҳо шакли лонадорро мехондем, пас ҳар хол `undefined` мешуд
 * ва `?? 0` онро ба 0 табдил медод: ҷавоб «I am hungry» — дуруст, accuracy 0.
 * Хол воқеан 97 буд.
 *
 * Ҳарду шакл хонда мешавад, то ин бог ҳангоми тағйири версияи API барнагардад.
 */
function score(
  node: { PronunciationAssessment?: AzureAssessment } & AzureAssessment,
  field: keyof AzureAssessment,
): number {
  const flat = node[field];
  if (typeof flat === 'number') return flat;
  const nested = node.PronunciationAssessment?.[field];
  return typeof nested === 'number' ? nested : 0;
}

// ── Шакли ҷавоби Azure (танҳо он майдонҳое, ки мо мехонем) ─────────────────

type AzureAssessment = {
  AccuracyScore?: number;
  FluencyScore?: number;
  CompletenessScore?: number;
  PronScore?: number;
  ErrorType?: string;
};

type AzureResponse = {
  NBest?: Array<
    {
      Display?: string;
      Lexical?: string;
      PronunciationAssessment?: AzureAssessment;
      Words?: Array<
        {
          Word: string;
          PronunciationAssessment?: AzureAssessment;
          Phonemes?: Array<
            { Phoneme: string; PronunciationAssessment?: AzureAssessment } &
              AzureAssessment
          >;
        } & AzureAssessment
      >;
    } & AzureAssessment
  >;
};
