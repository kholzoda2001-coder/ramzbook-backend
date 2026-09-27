/**
 * «Сӯҳбат бо AI»: таърих, промпт, хондани ҷавоб ва хотира — бе шабака.
 */
import { describe, expect, it } from 'vitest';
import {
  FREE_TURNS,
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
