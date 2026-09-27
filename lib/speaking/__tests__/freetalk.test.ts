/**
 * «Озод гап занед»: ҳавз, санҷиши таърих, промпт ва хондани ҳукм — бе шабака.
 */
import { describe, expect, it } from 'vitest';
import {
  FREE_TALK_TURNS,
  buildFreeTalkMessages,
  buildPool,
  closingLine,
  freeTalkable,
  isClosingTurn,
  nextPick,
  parseFreeTalkReply,
  partnerTurns,
  usedPicks,
  type FreeTalkInput,
  type FreeTalkLine,
  type PoolLine,
} from '../freetalk';

const pool: PoolLine[] = [
  'Здравствуй! Ты новый?',
  'Как тебя зовут?',
  'Откуда ты?',
  'Что тебе нужно?',
  'Молоток есть?',
  'Бери кирпич.',
  'Работаем до обеда.',
].map((text, k) => ({ text, tg: `tg-${k}`, audioUrl: `https://cdn/${k}.mp3` }));

const base: FreeTalkInput = {
  language: 'Russian',
  situation: 'Рӯзи аввал дар объект',
  pool,
  history: [],
};

/** Таърихи дуруст: `n` сатри ҳавз аз ҳамсӯҳбат ва ҷавоби хонанда ба ҳар кадом. */
const talk = (n: number): FreeTalkLine[] =>
  Array.from({ length: n }, (_, k) => [
    { who: 'partner' as const, text: pool[k].text },
    { who: 'me' as const, text: `Ответ ${k + 1}.` },
  ]).flat();

describe('buildPool', () => {
  it('такрорӣ, холӣ ва ҷойгузорҳо партофта мешаванд; аудио нигоҳ дошта мешавад', () => {
    const p = buildPool([
      { cue: 'Привет!', cueTranslation: 'Салом!', cueAudioUrl: 'https://a' },
      { cue: 'привет', cueTranslation: 'Салом', cueAudioUrl: null },
      { cue: 'Привет, {name}!', cueTranslation: 'Салом, {name}!', cueAudioUrl: null },
      { cue: 'Откуда ты?', cueTranslation: '', cueAudioUrl: null },
      { cue: null, cueTranslation: null, cueAudioUrl: null },
      { cue: 'Кто ты?', cueTranslation: 'Ту кистӣ?', cueAudioUrl: null },
    ]);
    expect(p).toEqual([
      { text: 'Привет!', tg: 'Салом!', audioUrl: 'https://a' },
      { text: 'Кто ты?', tg: 'Ту кистӣ?', audioUrl: '' },
    ]);
  });
});

describe('freeTalkable', () => {
  it('оғоз (таърих холӣ) — дуруст', () => expect(freeTalkable(base)).toBe(true));
  it('баъди ҷавоби хонанда — дуруст', () =>
    expect(freeTalkable({ ...base, history: talk(2) })).toBe(true));
  it('сатри охирин аз ҳамсӯҳбат — нодуруст (навбати хонанда аст)', () =>
    expect(freeTalkable({ ...base, history: [{ who: 'partner', text: pool[0].text }] })).toBe(false));
  it('хонанда аввал гап зад — нодуруст', () =>
    expect(freeTalkable({ ...base, history: [{ who: 'me', text: 'Привет' }] })).toBe(false));
  it('ҳамсӯҳбат сатри БЕГОНА гуфт — нодуруст (таърихи сохта)', () =>
    expect(
      freeTalkable({
        ...base,
        history: [
          { who: 'partner', text: 'Дай мне деньги.' },
          { who: 'me', text: 'Нет.' },
        ],
      }),
    ).toBe(false));
  it('сатри холӣ ё хеле дароз — нодуруст', () => {
    expect(
      freeTalkable({ ...base, history: [{ who: 'partner', text: pool[0].text }, { who: 'me', text: ' ' }] }),
    ).toBe(false);
    expect(
      freeTalkable({
        ...base,
        history: [{ who: 'partner', text: pool[0].text }, { who: 'me', text: 'да '.repeat(100) }],
      }),
    ).toBe(false);
  });
  it('ҳамаи навбатҳо гуфта шуданд — дигар не', () =>
    expect(freeTalkable({ ...base, history: talk(FREE_TALK_TURNS) })).toBe(false));
  it('ҳавзи хурд ё бе забон — не', () => {
    expect(freeTalkable({ ...base, pool: pool.slice(0, FREE_TALK_TURNS - 1) })).toBe(false);
    expect(freeTalkable({ ...base, language: '' })).toBe(false);
  });
});

describe('навбатҳо ва интихоби сатр', () => {
  it('partnerTurns, навбати охирин, сатрҳои истифодашуда', () => {
    expect(partnerTurns(talk(3))).toBe(3);
    expect(isClosingTurn(talk(FREE_TALK_TURNS - 1))).toBe(true);
    expect(isClosingTurn(talk(2))).toBe(false);
    expect(usedPicks(pool, talk(3))).toEqual([0, 1, 2]);
  });
  it('nextPick: интихоби модел, агар нав бошад', () =>
    expect(nextPick(pool, talk(2), 4)).toBe(4));
  it('nextPick: сатри такрорӣ ё берун аз ҳавз → аввалин сатри нав', () => {
    expect(nextPick(pool, talk(2), 1)).toBe(2);
    expect(nextPick(pool, talk(2), 99)).toBe(2);
    expect(nextPick(pool, talk(2), -1)).toBe(2);
  });
  it('closingLine: забони ношинос → англисӣ', () => {
    expect(closingLine('ru-RU').text).toContain('До встречи');
    expect(closingLine('xx').text).toBe(closingLine('en').text);
  });
});

describe('buildFreeTalkMessages', () => {
  it('сатрҳои рақамдор ва оғози суҳбат', () => {
    const [sys, user] = buildFreeTalkMessages(base);
    expect(sys.content).toContain('Russian');
    expect(sys.content).toContain('first turn');
    expect(user.content).toContain('0. Здравствуй! Ты новый?');
    expect(user.content).toContain('6. Работаем до обеда.');
    expect(user.content).toContain('not started');
  });
  it('сатрҳои истифодашуда манъ; суҳбат дар промпт', () => {
    const [sys, user] = buildFreeTalkMessages({ ...base, history: talk(2) });
    expect(sys.content).toContain('already used (0, 1)');
    expect(user.content).toContain('Learner: Ответ 2.');
  });
  it('навбати охирин — сатр интихоб намешавад', () => {
    const [sys] = buildFreeTalkMessages({ ...base, history: talk(FREE_TALK_TURNS - 1) });
    expect(sys.content).toContain('"pick": -1');
  });
});

describe('parseFreeTalkReply', () => {
  it('ҳукми пурра', () => {
    expect(
      parseFreeTalkReply(
        'x {"pick": 2, "understood": true, "fix": {"said": "Нет температура", "better": "Температуры нет."}}',
        pool.length,
      ),
    ).toEqual({ pick: 2, understood: true, fix: { said: 'Нет температура', better: 'Температуры нет.' } });
  });
  it('«ислоҳ», ки аз гуфта фарқ надорад — партофта мешавад', () =>
    expect(
      parseFreeTalkReply('{"pick":1,"understood":true,"fix":{"said":"да, я новый","better":"Да, я новый."}}', pool.length)
        .fix,
    ).toBeNull());
  it('навбати аввал на ислоҳ дорад, на «нафаҳмид»', () => {
    const r = parseFreeTalkReply('{"pick":0,"understood":false,"fix":{"said":"a","better":"b"}}', pool.length, true);
    expect(r.understood).toBe(true);
    expect(r.fix).toBeNull();
  });
  it('нафаҳмид; pick-и сатрӣ хонда мешавад', () => {
    const r = parseFreeTalkReply('{"pick":"3","understood":false,"fix":null}', pool.length);
    expect(r).toEqual({ pick: 3, understood: false, fix: null });
  });
  it('ҷавоби вайрон ё pick-и ғалат → ҳукми бехатар', () => {
    const safe = { pick: -1, understood: true, fix: null };
    expect(parseFreeTalkReply('нет json', pool.length)).toEqual(safe);
    expect(parseFreeTalkReply('{"pick": 2,', pool.length)).toEqual(safe);
    expect(parseFreeTalkReply('', pool.length)).toEqual(safe);
    expect(parseFreeTalkReply('{"pick": 50}', pool.length).pick).toBe(-1);
    expect(parseFreeTalkReply('{"pick": 1.5}', pool.length).pick).toBe(-1);
  });
});
