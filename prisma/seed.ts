/**
 * prisma/seed.ts  —  SQLite edition
 *
 * All JSON fields (alphabet, page content) are stored as JSON strings.
 * Run with:  npm run db:seed
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const j = (v: unknown) => JSON.stringify(v);

async function main() {
  console.log('🌱  Starting database seed…');

  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.userProgress.deleteMany();
  await prisma.page.deleteMany();
  await prisma.module.deleteMany();
  await prisma.product.deleteMany();
  console.log('🧹  Cleared existing data.');

  const demoPasswordHash = await bcrypt.hash('demo12345', 10);
  await prisma.user.create({
    data: {
      id: 'demo-user-pro',
      email: 'demo@ramz.app',
      name: 'Demo User',
      passwordHash: demoPasswordHash,
      isActive: true,
    },
  });
  console.log('✅  Created demo user: demo@ramz.app / demo12345');

  // ─── 1. English for Tajiks (featured book — full content) ─────────────────
  const englishBook = await prisma.product.create({
    data: {
      id: 'ramz-english-1',
      title: 'Забони Англисӣ барои Тоҷикон',
      author: 'RAMZ Academy',
      coverUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800',
      rating: 4.9,
      isFree: false,
      isActive: true,
      category: 'Забонҳо',
      description: 'Курси пурраи омӯзиши забони англисӣ бо усули нав ва интерактивӣ.',
      preface: `Хонандаи азиз,

Хуш омадед ба курси "Забони Англисӣ барои Тоҷикон"!

Ин китоб барои шумо тартиб дода шудааст, то забони англисиро дар кӯтоҳтарин муддат ва бо осонтарин роҳ биомӯзед. Мо усулҳои навини педагогикии ҷаҳониро истифода бурдаем.

Ҳар мавзӯъ аз се қисм иборат аст:
• Луғатҳои нав (калимаҳои асосӣ)
• Тасвирҳо ва мисолҳо
• Тест барои санҷиши дониш

Дар ҳар рӯз 15-20 дақиқа вақт ҷудо кунед ва дар муддати 3 моҳ ба сатҳи А2 мерасед.

Муаллиф,
RAMZ Academy`,
      alphabet: j([
        { letter: 'A a', hint: 'А - монанди «алиф»' },
        { letter: 'B b', hint: 'Б - монанди «бо»' },
        { letter: 'C c', hint: 'К ё С - монанди «кот»' },
        { letter: 'D d', hint: 'Д - монанди «дол»' },
        { letter: 'E e', hint: 'Э/И - монанди «эгг»' },
        { letter: 'F f', hint: 'Ф - монанди «фиш»' },
        { letter: 'G g', hint: 'Г - монанди «го»' },
        { letter: 'H h', hint: 'Ҳ - монанди «ҳэт»' },
        { letter: 'I i', hint: 'АЙ - монанди «ай»' },
        { letter: 'J j', hint: 'Ҷ - монанди «ҷэм»' },
        { letter: 'K k', hint: 'К - монанди «ки»' },
        { letter: 'L l', hint: 'Л - монанди «лейк»' },
        { letter: 'M m', hint: 'М - монанди «мэн»' },
        { letter: 'N n', hint: 'Н - монанди «найт»' },
        { letter: 'O o', hint: 'О/А - монанди «он»' },
        { letter: 'P p', hint: 'П - монанди «пэрк»' },
        { letter: 'Q q', hint: 'КВ - монанди «квин»' },
        { letter: 'R r', hint: 'Р - монанди «ран»' },
        { letter: 'S s', hint: 'С - монанди «сан»' },
        { letter: 'T t', hint: 'Т - монанди «три»' },
        { letter: 'U u', hint: 'А/У - монанди «ап»' },
        { letter: 'V v', hint: 'В - монанди «вэн»' },
        { letter: 'W w', hint: 'У - монанди «уотэр»' },
        { letter: 'X x', hint: 'КС/З - монанди «бокс»' },
        { letter: 'Y y', hint: 'Й - монанди «йес»' },
        { letter: 'Z z', hint: 'З - монанди «зиро»' },
      ]),
      guide: `Роҳнамо барои навомӯзон

Барои истифодаи беҳтар аз ин курс, ин панҷ қоидаро риоя кунед:

1. Ҳар рӯз 15-20 дақиқа вақт ҷудо кунед
   Мунтазамӣ аз ҳаҷм муҳимтар аст.

2. Овозро баланд бихонед
   Ҳар калимаро 3 бор баланд талаффуз кунед.

3. Кортҳои хотираро истифода баред
   Пас аз ҳар мавзӯъ, калимаҳоро такрор кунед.

4. Тестро ҳатман гузаред
   Агар 80% дуруст ҷавоб диҳед, ба мавзӯи навӣ гузаред.

5. Тарсед надошта бошед
   Хатогӣ қисми омӯзиш аст!

Муваффақ бошед! 🎯`,
    },
  });

  // ── Module 1: Greetings ────────────────────────────────────────────────────
  const greetingsModule = await prisma.module.create({
    data: { id: 'mod-greetings', productId: englishBook.id, title: 'Мавзӯи 1: Саломутобиат', orderIndex: 0, isFreePreview: true },
  });
  await prisma.page.createMany({
    data: [
      {
        moduleId: greetingsModule.id,
        pageType: 'VOCAB',
        orderIndex: 0,
        content: j({ words: [
          { id: 'w1',  originalWord: 'Hello',             transcription: '/həˈloʊ/',             pronunciation: 'хэ-ЛОУ',              translation: 'Салом',                    audioUrl: '' },
          { id: 'w2',  originalWord: 'Goodbye',           transcription: '/ˌɡʊdˈbaɪ/',           pronunciation: 'гуд-БАЙ',             translation: 'Хайр / Худоҳофиз',         audioUrl: '' },
          { id: 'w3',  originalWord: 'Thank you',         transcription: '/ˈθæŋk juː/',          pronunciation: 'ТХЭНК ю',             translation: 'Ташаккур',                 audioUrl: '' },
          { id: 'w4',  originalWord: 'Please',            transcription: '/pliːz/',               pronunciation: 'ПЛИЗ',                 translation: 'Лутфан / Хоҳиш мекунам',   audioUrl: '' },
          { id: 'w5',  originalWord: 'Yes',               transcription: '/jɛs/',                 pronunciation: 'ЙЭС',                  translation: 'Бале / Ҳа',               audioUrl: '' },
          { id: 'w6',  originalWord: 'No',                transcription: '/noʊ/',                 pronunciation: 'НОУ',                  translation: 'Не / Hayр',               audioUrl: '' },
          { id: 'w7',  originalWord: 'Good morning',      transcription: '/ɡʊd ˈmɔːrnɪŋ/',      pronunciation: 'гуд МОР-нинг',        translation: 'Субҳ бахайр',              audioUrl: '' },
          { id: 'w8',  originalWord: 'Good evening',      transcription: '/ɡʊd ˈiːvnɪŋ/',       pronunciation: 'гуд ИВ-нинг',         translation: 'Шом бахайр',               audioUrl: '' },
          { id: 'w9',  originalWord: 'Good night',        transcription: '/ɡʊd naɪt/',           pronunciation: 'гуд НАЙТ',            translation: 'Шаби хуш',                 audioUrl: '' },
          { id: 'w10', originalWord: 'How are you?',      transcription: '/haʊ ɑːr juː/',        pronunciation: 'хау АР ю?',           translation: 'Шумо чӣ хел?',            audioUrl: '' },
          { id: 'w11', originalWord: "I'm fine",          transcription: '/aɪm faɪn/',           pronunciation: 'айм ФАЙН',            translation: 'Ман хубам',               audioUrl: '' },
          { id: 'w12', originalWord: 'My name is...',     transcription: '/maɪ neɪm ɪz/',        pronunciation: 'май НЕЙМ из',         translation: 'Номи ман...',             audioUrl: '' },
          { id: 'w13', originalWord: 'Nice to meet you',  transcription: '/naɪs tə miːt juː/',   pronunciation: 'найс то МИТ ю',       translation: 'Хурсандам аз шиносоӣ',    audioUrl: '' },
          { id: 'w14', originalWord: 'Sorry',             transcription: '/ˈsɒri/',               pronunciation: 'СО-ри',               translation: 'Бубахшед / Узр',          audioUrl: '' },
          { id: 'w15', originalWord: 'Excuse me',         transcription: '/ɪkˈskjuːz miː/',      pronunciation: 'икс-КЮЗ ми',         translation: 'Мебахшед',                 audioUrl: '' },
          { id: 'w16', originalWord: 'Welcome',           transcription: '/ˈwɛlkəm/',            pronunciation: 'УЭЛ-кэм',            translation: 'Хуш омадед',              audioUrl: '' },
          { id: 'w17', originalWord: 'See you later',     transcription: '/siː juː ˈleɪtər/',    pronunciation: 'си ю ЛЭЙ-тер',       translation: 'То боздид',               audioUrl: '' },
          { id: 'w18', originalWord: 'How old are you?',  transcription: '/haʊ oʊld ɑːr juː/',  pronunciation: 'хау оулд АР ю?',     translation: 'Шумо чанд сол доред?',    audioUrl: '' },
          { id: 'w19', originalWord: 'Where are you from?', transcription: '/wɛr ɑːr juː frʌm/', pronunciation: 'уэр АР ю фрАМ?',   translation: 'Шумо аз куҷо ҳастед?',   audioUrl: '' },
          { id: 'w20', originalWord: "I don't understand", transcription: '/aɪ doʊnt ˌʌndərˈstænd/', pronunciation: 'ай доунт ан-дер-СТЭНД', translation: 'Ман намефаҳмам', audioUrl: '' },
        ]}),
      },
      {
        moduleId: greetingsModule.id,
        pageType: 'QUIZ',
        orderIndex: 1,
        content: j({ questions: [
          { id: 'q1-1', question: '"Hello" тоҷикӣ чист?',              options: ['Салом', 'Хайр', 'Ташаккур', 'Бале'],                    correctAnswerIndex: 0 },
          { id: 'q1-2', question: '"Thank you" тоҷикӣ чист?',          options: ['Лутфан', 'Ташаккур', 'Не', 'Бубахшед'],                  correctAnswerIndex: 1 },
          { id: 'q1-3', question: '"Good morning" тоҷикӣ чист?',       options: ['Шом бахайр', 'Шаби хуш', 'Субҳ бахайр', 'Хайр'],        correctAnswerIndex: 2 },
          { id: 'q1-4', question: '"Yes" тоҷикӣ чист?',                options: ['Не', 'Хубам', 'Лутфан', 'Бале'],                         correctAnswerIndex: 3 },
          { id: 'q1-5', question: '"Хурсандам аз шиносоӣ" инглисӣ чист?', options: ['Sorry', 'Please', 'Nice to meet you', 'Excuse me'],   correctAnswerIndex: 2 },
        ]}),
      },
    ],
  });

  // ── Module 2: Numbers & Colors ─────────────────────────────────────────────
  const numbersModule = await prisma.module.create({
    data: { id: 'mod-numbers', productId: englishBook.id, title: 'Мавзӯи 2: Рақамҳо ва Рангҳо', orderIndex: 1, isFreePreview: false },
  });
  await prisma.page.createMany({
    data: [
      {
        moduleId: numbersModule.id,
        pageType: 'VOCAB',
        orderIndex: 0,
        content: j({ words: [
          { id: 'w21', originalWord: 'One',   transcription: '/wʌn/',    pronunciation: 'УАН',    translation: 'Як',              audioUrl: '' },
          { id: 'w22', originalWord: 'Two',   transcription: '/tuː/',    pronunciation: 'ТУ',     translation: 'Ду',              audioUrl: '' },
          { id: 'w23', originalWord: 'Three', transcription: '/θriː/',   pronunciation: 'ТХРИ',   translation: 'Се',              audioUrl: '' },
          { id: 'w24', originalWord: 'Four',  transcription: '/fɔːr/',   pronunciation: 'ФОР',    translation: 'Чор',             audioUrl: '' },
          { id: 'w25', originalWord: 'Five',  transcription: '/faɪv/',   pronunciation: 'ФАЙВ',   translation: 'Панҷ',            audioUrl: '' },
          { id: 'w26', originalWord: 'Six',   transcription: '/sɪks/',   pronunciation: 'СИКС',   translation: 'Шаш',             audioUrl: '' },
          { id: 'w27', originalWord: 'Seven', transcription: '/ˈsɛvən/', pronunciation: 'СЕВ-эн', translation: 'Ҳафт',            audioUrl: '' },
          { id: 'w28', originalWord: 'Eight', transcription: '/eɪt/',    pronunciation: 'ЭЙТ',    translation: 'Ҳашт',            audioUrl: '' },
          { id: 'w29', originalWord: 'Nine',  transcription: '/naɪn/',   pronunciation: 'НАЙН',   translation: 'Нӯҳ',             audioUrl: '' },
          { id: 'w30', originalWord: 'Ten',   transcription: '/tɛn/',    pronunciation: 'ТЭН',    translation: 'Даҳ',             audioUrl: '' },
          { id: 'w31', originalWord: 'Red',   transcription: '/rɛd/',    pronunciation: 'РЭД',    translation: 'Сурх / Қирмизӣ', audioUrl: '' },
          { id: 'w32', originalWord: 'Blue',  transcription: '/bluː/',   pronunciation: 'БЛУ',    translation: 'Кабуд / Осмонӣ', audioUrl: '' },
          { id: 'w33', originalWord: 'Green', transcription: '/ɡriːn/',  pronunciation: 'ГРИН',   translation: 'Сабз',            audioUrl: '' },
          { id: 'w34', originalWord: 'Black', transcription: '/blæk/',   pronunciation: 'БЛЭК',   translation: 'Сиёҳ',            audioUrl: '' },
          { id: 'w35', originalWord: 'White', transcription: '/waɪt/',   pronunciation: 'УАЙТ',   translation: 'Сафед',           audioUrl: '' },
        ]}),
      },
      {
        moduleId: numbersModule.id,
        pageType: 'QUIZ',
        orderIndex: 1,
        content: j({ questions: [
          { id: 'q2-1', question: '"Five" тоҷикӣ чист?',   options: ['Чор', 'Панҷ', 'Шаш', 'Ҳафт'],        correctAnswerIndex: 1 },
          { id: 'q2-2', question: '"Ten" тоҷикӣ чист?',    options: ['Нӯҳ', 'Ҳашт', 'Даҳ', 'Ҳазор'],       correctAnswerIndex: 2 },
          { id: 'q2-3', question: '"Red" тоҷикӣ чист?',    options: ['Сурх', 'Кабуд', 'Сабз', 'Сиёҳ'],     correctAnswerIndex: 0 },
          { id: 'q2-4', question: '"Сабз" инглисӣ чист?',  options: ['Blue', 'Black', 'White', 'Green'],    correctAnswerIndex: 3 },
          { id: 'q2-5', question: '"Seven" тоҷикӣ чист?',  options: ['Шаш', 'Ҳафт', 'Ҳашт', 'Нӯҳ'],        correctAnswerIndex: 1 },
        ]}),
      },
    ],
  });

  // ── Module 3: Food & Drinks ────────────────────────────────────────────────
  const foodModule = await prisma.module.create({
    data: { id: 'mod-food', productId: englishBook.id, title: 'Мавзӯи 3: Хӯрок ва Нӯшокӣ', orderIndex: 2, isFreePreview: false },
  });
  await prisma.page.createMany({
    data: [
      {
        moduleId: foodModule.id,
        pageType: 'VOCAB',
        orderIndex: 0,
        content: j({ words: [
          { id: 'w41', originalWord: 'Water',     transcription: '/ˈwɔːtər/',  pronunciation: 'УО-тер',   translation: 'Об',             audioUrl: '' },
          { id: 'w42', originalWord: 'Bread',     transcription: '/brɛd/',      pronunciation: 'БРЭД',     translation: 'Нон',            audioUrl: '' },
          { id: 'w43', originalWord: 'Milk',      transcription: '/mɪlk/',      pronunciation: 'МИЛК',     translation: 'Шир',            audioUrl: '' },
          { id: 'w44', originalWord: 'Rice',      transcription: '/raɪs/',      pronunciation: 'РАЙС',     translation: 'Биринҷ / Шолӣ', audioUrl: '' },
          { id: 'w45', originalWord: 'Egg',       transcription: '/ɛɡ/',         pronunciation: 'ЭГГ',      translation: 'Тухм',           audioUrl: '' },
          { id: 'w46', originalWord: 'Meat',      transcription: '/miːt/',      pronunciation: 'МИТ',      translation: 'Гӯшт',           audioUrl: '' },
          { id: 'w47', originalWord: 'Tea',       transcription: '/tiː/',        pronunciation: 'ТИ',       translation: 'Чой',            audioUrl: '' },
          { id: 'w48', originalWord: 'Coffee',    transcription: '/ˈkɒfi/',     pronunciation: 'КО-фи',    translation: 'Қаҳва',          audioUrl: '' },
          { id: 'w49', originalWord: 'Sugar',     transcription: '/ˈʃʊɡər/',    pronunciation: 'ШУ-гер',   translation: 'Қанд / Шакар',  audioUrl: '' },
          { id: 'w50', originalWord: 'Salt',      transcription: '/sɔːlt/',     pronunciation: 'СОЛТ',     translation: 'Намак',          audioUrl: '' },
          { id: 'w51', originalWord: 'Apple',     transcription: '/ˈæpəl/',     pronunciation: 'ЭП-эл',    translation: 'Себ',            audioUrl: '' },
          { id: 'w52', originalWord: 'Orange',    transcription: '/ˈɒrɪndʒ/',   pronunciation: 'О-ринҷ',   translation: 'Афлесун',        audioUrl: '' },
          { id: 'w53', originalWord: 'Chicken',   transcription: '/ˈtʃɪkɪn/',   pronunciation: 'ЧИ-кин',   translation: 'Мурғ',           audioUrl: '' },
          { id: 'w54', originalWord: 'Fish',      transcription: '/fɪʃ/',        pronunciation: 'ФИШ',      translation: 'Моҳӣ',           audioUrl: '' },
          { id: 'w55', originalWord: 'Vegetable', transcription: '/ˈvɛdʒtəbl/', pronunciation: 'ВЭЧ-тэбл', translation: 'Сабзавот',       audioUrl: '' },
        ]}),
      },
      {
        moduleId: foodModule.id,
        pageType: 'QUIZ',
        orderIndex: 1,
        content: j({ questions: [
          { id: 'q3-1', question: '"Water" тоҷикӣ чист?',  options: ['Нон', 'Шир', 'Об', 'Чой'],               correctAnswerIndex: 2 },
          { id: 'q3-2', question: '"Bread" тоҷикӣ чист?',  options: ['Нон', 'Биринҷ', 'Гӯшт', 'Тухм'],        correctAnswerIndex: 0 },
          { id: 'q3-3', question: '"Tea" тоҷикӣ чист?',    options: ['Қаҳва', 'Об', 'Чой', 'Шир'],             correctAnswerIndex: 2 },
          { id: 'q3-4', question: '"Себ" инглисӣ чист?',   options: ['Orange', 'Fish', 'Apple', 'Egg'],        correctAnswerIndex: 2 },
          { id: 'q3-5', question: '"Salt" тоҷикӣ чист?',   options: ['Қанд', 'Сабзавот', 'Афлесун', 'Намак'],  correctAnswerIndex: 3 },
          { id: 'q3-6', question: '"Мурғ" инглисӣ чист?',  options: ['Fish', 'Chicken', 'Meat', 'Egg'],        correctAnswerIndex: 1 },
        ]}),
      },
    ],
  });
  console.log(`✅  Created: "${englishBook.title}" with 3 modules.`);

  // ─── 2. Trending / Popular books ──────────────────────────────────────────
  await prisma.product.createMany({
    data: [
      { id: 'book-1', title: 'Тоҷикон',           author: 'Бобоҷон Ғафуров', coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800', rating: 4.9, category: 'Илмӣ',    description: 'Таърихи пурарзиши халқи тоҷик аз қадимтарин давраҳо.',         preface: 'Ин китоб дар бораи таърихи қадимаи халқи тоҷик нақл мекунад...', alphabet: j([{letter:'А',hint:'A like Apple'},{letter:'Б',hint:'B like Ball'},{letter:'В',hint:'V like Van'}]), guide: 'Барои омӯзиши беҳтар, ҳар рӯз 15 дақиқа вақт ҷудо кунед.', isFree: false, isActive: true },
      { id: 'book-2', title: 'Milk and Honey',     author: 'Rupi Kaur',       coverUrl: 'https://images.unsplash.com/photo-1474932430478-3a7fb0142a11?q=80&w=800', rating: 4.8, category: 'Бадеӣ',   description: 'Шеърҳои шунидании муосир аз Рупи Каур.',                        isFree: false, isActive: true },
      { id: 'book-3', title: 'The Alchemist',      author: 'Paulo Coelho',    coverUrl: 'https://images.unsplash.com/photo-1543004218-2bc350731653?q=80&w=800', rating: 4.7, category: 'Бадеӣ',   description: 'Достони ҷустуҷӯи хушбахтӣ аз Пауло Коэлло.',                   isFree: false, isActive: true },
    ],
  });
  console.log('✅  Created 3 trending books.');

  // ─── 3. New Releases ──────────────────────────────────────────────────────
  await prisma.product.createMany({
    data: [
      { id: 'book-4', title: 'Овора',               author: 'Содиқ Ҳидоят',  coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800', rating: 4.5, category: 'Бадеӣ',    description: 'Романи маъруфи Содиқ Ҳидоят.',                                  isFree: false, isActive: true },
      { id: 'book-5', title: 'Ҷалолиддини Румӣ',   author: 'Мавлоно',        coverUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=800', rating: 5.0, category: 'Бадеӣ',    description: 'Ғазалиёт ва маснавии Мавлоно Ҷалолиддини Румӣ.',               isFree: false, isActive: true },
      { id: 'book-6', title: 'Сиёсатнома',          author: 'Низом-ул-мулк', coverUrl: 'https://images.unsplash.com/photo-1532012197367-2836914906f9?q=80&w=800', rating: 4.9, category: 'Илмӣ',     description: 'Асари классикии Низом-ул-мулк дар бораи давлатдорӣ.',           isFree: false, isActive: true },
      { id: 'book-7', title: 'Трейдинг аз сифр',   author: 'RAMZ Academy',   coverUrl: 'https://images.unsplash.com/photo-1611974717482-482ab912accf?q=80&w=800', rating: 4.9, category: 'Трейдинг', description: 'Дастури ҳамаҷонибаи аввалин қадамҳо дар трейдинг.',              isFree: false, isActive: true },
    ],
  });
  console.log('✅  Created 4 new release books.');

  // ─── 4. Demo user progress ────────────────────────────────────────────────
  await prisma.userProgress.createMany({
    data: [
      { userId: 'demo-user-pro', productId: 'ramz-english-1', lastReadPageIndex: 4,  isPurchased: true },
      { userId: 'demo-user-pro', productId: 'book-1',          lastReadPageIndex: 3,  isPurchased: true },
      { userId: 'demo-user-pro', productId: 'book-2',          lastReadPageIndex: 1,  isPurchased: true },
      { userId: 'demo-user-pro', productId: 'book-5',          lastReadPageIndex: 12, isPurchased: true },
    ],
  });
  console.log('✅  Created demo user progress.');

  console.log('\n🎉  Seed complete! Database is ready.');
}

main()
  .catch((e) => { console.error('❌  Seed failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
