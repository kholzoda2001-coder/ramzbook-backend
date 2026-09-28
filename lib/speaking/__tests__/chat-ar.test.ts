import { describe, it, expect } from 'vitest';
import {
  buildChatMessages,
  fixKeepsMeaning,
  parseChatReply,
  replyProblem,
  tidyArabicMarks,
  sameQuestion,
  saysGoodbye,
  scriptRules,
  trimToOneQuestion,
  type ChatInput,
} from '@/lib/speaking/chat';
import { buildFreeTalkMessages, closingLine } from '@/lib/speaking/freetalk';

/**
 * Рамз ва суҳбати озод бо АРАБӢ (28.09.2026).
 *
 * Муҳофизони чат саволро аз рӯи `?` меёфтанд — дар арабӣ «؟» аст, пас ҳар
 * ҷавоби арабӣ «бесавол» мебаромад ва роут онро бефоида аз нав мепурсид.
 */
const ar: ChatInput = {
  language: 'Arabic',
  level: 'A1',
  memory: { name: '', facts: [] },
  known: [],
  history: [],
  closing: false,
};

describe('аломати савол «؟»', () => {
  it('ҷавоби арабӣ бо як савол қабул аст', () => {
    expect(replyProblem('جَمِيلٌ! مِنْ أَيْنَ أَنْتَ؟', [], { closing: false, goodbye: false })).toBeNull();
  });

  it('бе савол ва ду савол — ҳамон қоидаҳо', () => {
    expect(replyProblem('جَمِيلٌ جِدًّا.', [], { closing: false, goodbye: false })).toBe('no_question');
    expect(replyProblem('هَلْ تُحِبُّ الشَّايَ؟ مَاذَا تَشْرَبُ؟', [], { closing: false, goodbye: false }))
      .toBe('many_questions');
  });

  it('танҳо саволи аввал мемонад', () => {
    expect(trimToOneQuestion('هَلْ تُحِبُّ الشَّايَ؟ مَاذَا تَشْرَبُ؟')).toBe('هَلْ تُحِبُّ الشَّايَ؟');
  });

  it('ҳамон савол бо ҳаракоти дигар — такрор аст', () => {
    expect(sameQuestion('حَسَنًا. مِنْ أَيْنَ أَنْتَ؟', 'من أين أنت؟')).toBe(true);
    expect(sameQuestion('مِنْ أَيْنَ أَنْتَ؟', 'مَاذَا تَأْكُلُ؟')).toBe(false);
  });
});

describe('хайрухуши арабӣ', () => {
  it('бо ва бе ҳамза, бо ва бе ҳаракат', () => {
    expect(saysGoodbye('مع السلامة')).toBe(true);
    expect(saysGoodbye('شكرا، إِلَى اللِّقَاءِ')).toBe(true);
    expect(saysGoodbye('الى اللقاء')).toBe(true);
    expect(saysGoodbye('أنا من طاجيكستان')).toBe(false);
  });
});

describe('қоидаҳои хати арабӣ дар промпт', () => {
  it('арабӣ: ҳаракоти пурра + эъроб хато нест', () => {
    const [sys] = buildChatMessages(ar, 'turn');
    expect(sys.content).toMatch(/FULL diacritics/);
    expect(sys.content).toMatch(/never treat missing diacritics/);
    const [hint] = buildChatMessages({ ...ar, history: [{ who: 'ai', text: 'مَا اسْمُكَ؟' }] }, 'hint');
    expect(hint.content).toMatch(/FULL diacritics/);
  });

  it('забонҳои дигар — промпт бетағйир (бе фосилаи дукарата)', () => {
    expect(scriptRules('English')).toBe('');
    expect(scriptRules('Russian')).toBe('');
    const [sys] = buildChatMessages({ ...ar, language: 'Russian' }, 'turn');
    expect(sys.content).not.toMatch(/diacritics/);
    expect(sys.content).not.toMatch(/ {2}/);
  });

  it('суҳбати озод: қоида барои арабӣ, видоъ бо арабӣ', () => {
    const pool = Array.from({ length: 8 }, (_, k) => ({ text: `سَطْرٌ ${k}`, tg: `сатр ${k}`, audioUrl: '' }));
    const [sys] = buildFreeTalkMessages({ language: 'Arabic', situation: 'Шиносоӣ', pool, history: [] });
    expect(sys.content).toMatch(/never treat missing diacritics/);
    expect(closingLine('ar').text).toMatch(/[؀-ۿ]/);
    expect(closingLine('ar-SA').text).toBe(closingLine('ar').text);
  });
});

describe('муҳофизони ҷавоби модел (санҷиши зинда 28.09.2026)', () => {
  it('ҳаракати овезон пас аз ؟ партофта мешавад, ҳаракати дуруст мемонад', () => {
    expect(tidyArabicMarks('هَلْ الطَّقْسُ جَمِيلٌ؟ْ')).toBe('هَلْ الطَّقْسُ جَمِيلٌ؟');
    expect(tidyArabicMarks('شُكْرًا جَزِيلًا')).toBe('شُكْرًا جَزِيلًا');
    expect(tidyArabicMarks('الشَّايَ')).toBe('الشَّايَ'); // шадда + фатҳа
    expect(tidyArabicMarks('Hello? Как дела?')).toBe('Hello? Как дела?');
  });

  it('«ислоҳ», ки ҷавобро иваз мекунад, рад мешавад', () => {
    expect(fixKeepsMeaning('أحب البلوف', 'أُحِبُّ اللَّوْنَ الأَزْرَقَ')).toBe(false);
    const r = parseChatReply(JSON.stringify({
      reply: 'جَيِّدٌ! مَا فَاكِهَتُكَ الْمُفَضَّلَةُ؟',
      reply_tg: 'Хуб! Меваи дӯстдоштаат чист?',
      fix: { said: 'أحب البلوف', better: 'أُحِبُّ اللَّوْنَ الأَزْرَقَ', why_en: 'answer the question' },
    }));
    expect(r?.fix).toBeNull();
  });

  it('ислоҳи ВОҚЕӢ дар ҳама забон мемонад', () => {
    expect(fixKeepsMeaning('I has brother', 'I have a brother')).toBe(true);
    expect(fixKeepsMeaning('Я любит плов', 'Я люблю плов')).toBe(true);
    expect(fixKeepsMeaning('У меня брат', 'У меня есть брат')).toBe(true);
    expect(fixKeepsMeaning('Чай', 'Я люблю чай.')).toBe(true); // якқалима — ҳамеша
    expect(fixKeepsMeaning('انا احب شاي', 'أَنَا أُحِبُّ الشَّايَ')).toBe(true);
  });
});

describe('видоъи суҳбати озод — скрипти аудио бо сервер мувофиқ', () => {
  it('матни `closing` дар `_speaking-real-audio-lang.mjs` = `CLOSING_LINES[lang].text`', async () => {
    const { readFileSync } = await import('node:fs');
    const path = await import('node:path');
    const src = readFileSync(path.resolve(import.meta.dirname, '../../../prisma/_speaking-real-audio-lang.mjs'), 'utf8');
    for (const lang of ['ru', 'en', 'ar', 'ko']) {
      const m = new RegExp(String.raw`\n  ${lang}: \{[\s\S]*?closing: '([^']+)'`).exec(src);
      expect(m?.[1], lang).toBe(closingLine(lang).text);
    }
  });
});
