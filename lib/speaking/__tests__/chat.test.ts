/**
 * «Сӯҳбат бо AI»: таърих, промпт, хондани ҷавоб ва хотира — бе шабака.
 */
import { describe, expect, it } from 'vitest';
import {
  A1_TOPICS,
  CHAT_LEVEL,
  FREE_TALKS_TOTAL,
  askedQuestions,
  replyProblem,
  sameQuestion,
  trimToOneQuestion,
  FREE_TURNS,
  freeTalkAllowed,
  freeTalksLeft,
  MAX_FACTS,
  buildChatMessages,
  chatValid,
  learnerTurns,
  mergeMemory,
  parseChatReply,
  parseHints,
  saysGoodbye,
  type ChatInput,
  type ChatLine,
} from '../chat';

const base: ChatInput = {
  language: 'Russian',
  level: 'A1',
  memory: { name: '', facts: [] },
  known: ['Меня зовут Алишер.', 'Я строитель.'],
  history: [],
  closing: false,
};

const talk = (n: number): ChatLine[] =>
  Array.from({ length: n }, (_, k) => [
    { who: 'ai' as const, text: `Вопрос ${k}?` },
    { who: 'me' as const, text: `Ответ ${k}.` },
  ]).flat();

describe('chatValid', () => {
  it('оғоз ва навбати муқаррарӣ', () => {
    expect(chatValid([], 'turn', FREE_TURNS)).toBe(true);
    expect(chatValid(talk(3), 'turn', FREE_TURNS)).toBe(true);
  });
  it('хонанда аввал ё ду сатри паиҳам — не', () => {
    expect(chatValid([{ who: 'me', text: 'Привет' }], 'turn', FREE_TURNS)).toBe(false);
    expect(chatValid([...talk(1), { who: 'me', text: 'и ещё' }], 'turn', FREE_TURNS)).toBe(false);
  });
  it('turn: сатри охирин бояд аз хонанда бошад; hint: аз Рамз', () => {
    const h: ChatLine[] = [...talk(1), { who: 'ai', text: 'А ты?' }];
    expect(chatValid(h, 'turn', FREE_TURNS)).toBe(false);
    expect(chatValid(h, 'hint', FREE_TURNS)).toBe(true);
    expect(chatValid([], 'hint', FREE_TURNS)).toBe(false);
  });
  it('аз ҳадди навбат зиёд — не', () => {
    expect(chatValid(talk(FREE_TURNS), 'turn', FREE_TURNS)).toBe(true);
    expect(chatValid(talk(FREE_TURNS + 1), 'turn', FREE_TURNS)).toBe(false);
  });
  it('сатри холӣ ё дароз — не', () => {
    expect(chatValid([{ who: 'ai', text: 'А?' }, { who: 'me', text: ' ' }], 'turn', 5)).toBe(false);
    expect(chatValid([{ who: 'ai', text: 'А?' }, { who: 'me', text: 'а'.repeat(300) }], 'turn', 5)).toBe(false);
  });
  it('learnerTurns', () => expect(learnerTurns(talk(4))).toBe(4));
});

describe('buildChatMessages', () => {
  it('бори аввал, ном номаълум — худро шинос кун ва номро пурс', () => {
    const [sys, user] = buildChatMessages(base, 'turn');
    expect(sys.content).toContain('introduce yourself as Ramz');
    expect(sys.content).toContain("don't know the learner's name");
    expect(sys.content).toContain('A1');
    expect(sys.content).toContain('"Я строитель."');
    expect(user.content).toContain('opened the chat');
  });
  it('бори дигар — бо ном ва хотира сар мекунад', () => {
    const [sys] = buildChatMessages(
      { ...base, memory: { name: 'Алишер', facts: ['works on a construction site'] } },
      'turn',
    );
    expect(sys.content).toContain('greet Алишер by name');
    expect(sys.content).toContain('works on a construction site');
    expect(sys.content).not.toContain('ask the learner');
  });
  it('навбат: мавзӯъ, хайрухуш, ислоҳ дар промпт; таърих бо ном', () => {
    const [sys, user] = buildChatMessages(
      { ...base, memory: { name: 'Алишер', facts: [] }, history: talk(2) },
      'turn',
    );
    expect(sys.content).toContain('offer 2-3 conversation topics');
    const [later] = buildChatMessages({ ...base, memory: { name: 'Алишер', facts: [] }, history: talk(3) }, 'turn');
    expect(later.content).toContain('"topics" must be []');
    expect(sys.content).toContain('"goodbye": true');
    expect(sys.content).toContain('"fix"');
    expect(user.content).toContain('Алишер (speech-to-text): Ответ 1.');
  });
  it('охири вақт — хайрухуш бе савол', () => {
    const [sys] = buildChatMessages({ ...base, history: talk(3), closing: true }, 'turn');
    expect(sys.content).toContain('Time is up');
  });
  it('«Чӣ гӯям?» — се ҷавоб', () => {
    const [sys] = buildChatMessages({ ...base, history: [{ who: 'ai', text: 'Откуда ты?' }] }, 'hint');
    expect(sys.content).toContain('Suggest 3');
    expect(sys.content).toContain('"hints"');
  });
});

describe('parseChatReply', () => {
  it('ҷавоби пурра', () => {
    const r = parseChatReply(
      'x {"reply":"Очень приятно, Алишер! Ты работаешь?","reply_tg":"Хеле шодам!","topics":[{"label_en":"Work","label_tg":"Кор","say":"О работе"}],"fix":{"said":"Меня звать Алишер","better":"Меня зовут Алишер.","why_en":"Use зовут"},"name":"Алишер","remember":["name is Alisher"],"goodbye":false}',
    );
    expect(r).toMatchObject({
      reply: 'Очень приятно, Алишер! Ты работаешь?',
      replyTg: 'Хеле шодам!',
      topics: [{ label: 'Кор', labelEn: 'Work', say: 'О работе' }],
      fix: { said: 'Меня звать Алишер', better: 'Меня зовут Алишер.', why: 'Use зовут' },
      name: 'Алишер',
      remember: ['name is Alisher'],
      goodbye: false,
    });
  });
  it('ном ҷумла бошад — рад', () => {
    expect(parseChatReply('{"reply":"Ок","name":"меня зовут Алишер"}')?.name).toBe('');
    expect(parseChatReply('{"reply":"Ок","name":"Фирдавс"}')?.name).toBe('Фирдавс');
  });
  it('навбати аввал ислоҳ надорад; «ислоҳ»-и якхела партофта мешавад', () => {
    expect(parseChatReply('{"reply":"Привет!","fix":{"said":"a","better":"b"}}', true)?.fix).toBeNull();
    expect(parseChatReply('{"reply":"Ок","fix":{"said":"да, я","better":"Да, я."}}')?.fix).toBeNull();
  });
  it('бе сатр ё JSON-и вайрон → null', () => {
    expect(parseChatReply('{"reply":""}')).toBeNull();
    expect(parseChatReply('нет')).toBeNull();
  });
});

describe('parseHints', () => {
  it('се ҷавоб, бе такрор', () => {
    expect(
      parseHints('{"hints":[{"say":"Я строитель.","tg":"Ман бинокорам."},{"say":"я строитель","tg":"x"},{"say":"Я работаю в Москве.","tg":"y"}]}'),
    ).toEqual([
      { say: 'Я строитель.', tg: 'Ман бинокорам.' },
      { say: 'Я работаю в Москве.', tg: 'y' },
    ]);
    expect(parseHints('вайрон')).toEqual([]);
  });
});

describe('хотира ва хайрухуш', () => {
  it('mergeMemory: ном ва далелҳои нав бе такрор, ҳадди далел', () => {
    const m = mergeMemory(
      { name: '', facts: ['lives in Moscow'] },
      { name: 'Алишер', remember: ['Lives in Moscow.', 'has two kids', "Learner's name is Alisher"] },
    );
    expect(m).toEqual({ name: 'Алишер', facts: ['lives in Moscow', 'has two kids'] });
    const many = mergeMemory(
      { name: 'A', facts: Array.from({ length: MAX_FACTS }, (_, i) => `fact ${i}`) },
      { name: '', remember: ['new fact'] },
    );
    expect(many.facts).toHaveLength(MAX_FACTS);
    expect(many.facts.at(-1)).toBe('new fact');
    expect(many.name).toBe('A');
  });
  it('saysGoodbye', () => {
    expect(saysGoodbye('Ну ладно, пока!')).toBe(true);
    expect(saysGoodbye('До свидания')).toBe(true);
    expect(saysGoodbye('Хватит.')).toBe(true);
    expect(saysGoodbye('Пока, до завтра')).toBe(true);
    expect(saysGoodbye('Я работаю пока здесь')).toBe(false);
    expect(saysGoodbye('Я строитель')).toBe(false);
  });
});

describe('ҳадди ройгон: 3 суҳбат дар умр (27.09.2026)', () => {
  it('се суҳбат, баъд — не', () => {
    expect(FREE_TALKS_TOTAL).toBe(3);
    expect(freeTalkAllowed(0, 0)).toBe(true);
    expect(freeTalkAllowed(2, 0)).toBe(true);
    expect(freeTalkAllowed(3, 0)).toBe(false);
  });

  it('суҳбати САРШУДА то охир идома меёбад, ҳатто агар ҳад расида бошад', () => {
    expect(freeTalkAllowed(3, 1)).toBe(true);
    expect(freeTalkAllowed(9, 5)).toBe(true);
  });

  it('боқимонда ҳеҷ гоҳ манфӣ нест', () => {
    expect(freeTalksLeft(0)).toBe(3);
    expect(freeTalksLeft(2)).toBe(1);
    expect(freeTalksLeft(7)).toBe(0);
  });
});

describe('Рамз — устоди озод, A1, бе такрор (28.09.2026)', () => {
  const sys = (msgs: { content: string }[]) => msgs[0].content;
  const talk: ChatLine[] = [
    { who: 'ai', text: 'Привет, Алишер! Что ты любишь есть?' },
    { who: 'me', text: 'Я люблю плов' },
  ];

  it('сатҳ ҳамеша A1; ниша дар промпт нест', () => {
    expect(CHAT_LEVEL).toBe('A1');
    const s = sys(buildChatMessages({ ...base, history: talk }, 'turn'));
    expect(s).not.toMatch(/construction|driving/);
    expect(A1_TOPICS).not.toContain('work');
  });

  // Корбар (29.09.2026): «комилан озод… ҳар дафъа tea or coffee мепурсад».
  it('суҳбати ОЗОД: мавзӯъ аз хонанда, ба саволаш ҷавоб, бе «tea or coffee»', () => {
    const s = sys(buildChatMessages({ ...base, history: talk }, 'turn'));
    expect(s).toMatch(/The LEARNER decides what to talk about/);
    expect(s).toMatch(/ANSWER it first/);
    expect(s).toMatch(/about the SAME thing the learner is talking about/);
    expect(s).not.toMatch(/then move to a NEW everyday topic/);
    for (const mode of ['turn', 'nudge', 'hint'] as const) {
      expect(sys(buildChatMessages({ ...base, history: talk }, mode))).not.toMatch(/\btea\b|coffee/i);
    }
    expect(A1_TOPICS).not.toContain('drinks');
  });

  it('саволҳои пешина ба модел мераванд — «такрор накун»', () => {
    const s = sys(buildChatMessages({ ...base, history: talk }, 'turn'));
    expect(s).toContain('Что ты любишь есть?');
    expect(s).toMatch(/NEVER ask the same or a similar question again/);
    expect(s).toMatch(/must END with exactly one question/);
    expect(askedQuestions(talk)).toEqual(['Привет, Алишер! Что ты любишь есть?']);
  });

  it('оғоз бо мавзӯи додашуда (ҳар бор дигар)', () => {
    const s = sys(
      buildChatMessages({ ...base, memory: { name: 'Алишер', facts: [] }, openTopic: 'weather' }, 'turn'),
    );
    expect(s).toMatch(/ask ONE easy question about weather/);
  });

  it('nudge: хонанда хомӯш → ҲАМОН савол осонтар, на мавзӯи тасодуфӣ', () => {
    const h: ChatLine[] = [{ who: 'ai', text: 'Что ты делаешь в выходные?' }];
    expect(chatValid(h, 'nudge', FREE_TURNS)).toBe(true);
    const s = sys(buildChatMessages({ ...base, history: h }, 'nudge'));
    expect(s).toMatch(/stayed SILENT/);
    expect(s).toMatch(/ask your LAST question again in a much easier way/);
    expect(s).toMatch(/never jump to a random new topic/);
    expect(s).toContain('Что ты делаешь в выходные?');
  });

  it('таърих: Рамз то 2 бор пай дар пай (савол + nudge), на 3; хонанда ҳеҷ гоҳ 2 бор', () => {
    const a = (t: string): ChatLine => ({ who: 'ai', text: t });
    const m = (t: string): ChatLine => ({ who: 'me', text: t });
    expect(chatValid([a('Q?'), a('Чай или кофе?'), m('Чай')], 'turn', FREE_TURNS)).toBe(true);
    expect(chatValid([a('Q?'), a('Чай?'), a('Кофе?'), m('Чай')], 'turn', FREE_TURNS)).toBe(false);
    expect(chatValid([a('Q?'), m('да'), m('нет')], 'turn', FREE_TURNS)).toBe(false);
    // nudge-и дуюм пай дар пай ҷоиз нест — клиент ба таваққуф мегузарад.
    expect(chatValid([a('Q?'), a('Чай?')], 'nudge', FREE_TURNS)).toBe(false);
    expect(chatValid([m('салом')], 'turn', FREE_TURNS)).toBe(false);
  });

  it('replyProblem: бе савол ё саволи такрорӣ → кӯшиши дуюм', () => {
    const opts = { closing: false, goodbye: false };
    expect(replyProblem('Понятно, яблоки не нужны.', talk, opts)).toBe('no_question');
    expect(replyProblem('Плов — вкусно! А что ты любишь есть?', talk, opts)).toBe('repeat');
    expect(replyProblem('Плов — вкусно! Ты любишь чай?', talk, opts)).toBeNull();
    expect(replyProblem('Ты любишь еду? Что ты ешь обычно?', talk, opts)).toBe('many_questions');
    // Хайрухуш савол намехоҳад.
    expect(replyProblem('До встречи, Алишер!', talk, { closing: true, goodbye: false })).toBeNull();
    expect(replyProblem('Пока!', talk, { closing: false, goodbye: true })).toBeNull();
  });

  it('sameQuestion: ҳамон савол бо сухани дигар дар аввал', () => {
    expect(sameQuestion('Хорошо. Что ты ищешь?', 'Понятно! Что ты ищешь?')).toBe(true);
    expect(sameQuestion('Где ты живёшь?', 'Где работает твой брат?')).toBe(false);
    expect(sameQuestion('Спасибо.', 'Спасибо.')).toBe(false); // савол нест
  });
});

describe('trimToOneQuestion', () => {
  it('танҳо саволи аввал мемонад', () => {
    expect(trimToOneQuestion('Погода хорошая? Какой сегодня день?')).toBe('Погода хорошая?');
    expect(trimToOneQuestion('Плов вкусный! Ты любишь чай? А кофе?')).toBe('Плов вкусный! Ты любишь чай?');
    expect(trimToOneQuestion('До встречи!')).toBe('До встречи!');
  });
});
