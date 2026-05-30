/**
 * Demo seed — English → Tajik (A1)
 * Adds one new module with 7 fully-populated lessons (one per skill type).
 * Safe to run multiple times — checks for existing demo module first.
 */
const { PrismaClient } = require('C:/Users/ASUS1/Desktop/RAMZ/backend/node_modules/@prisma/client');
const p = new PrismaClient();

const COURSE_ID    = 'cmppavfld0003xrdbn6pjph8n';
const TARGET_ID    = 'cmppaul1k0001xrdbc2woi3fj'; // en
const NATIVE_ID    = 'cmpk1cr9o0000bo0h1mheyoad'; // tg

async function main() {
  console.log('🌱 Demo seed starting…');

  // ── Guard: skip if already seeded ──────────────────────────────────────────
  const exists = await p.module.findFirst({ where: { courseId: COURSE_ID, title: 'Greeting & Daily Life' } });
  if (exists) { console.log('⚠️  Demo module already exists — skipping.'); return; }

  // ══════════════════════════════════════════════════════════════════════════
  // 1. GRAMMAR TOPIC  (created before the lesson that references it)
  // ══════════════════════════════════════════════════════════════════════════
  const grammar = await p.grammarTopic.create({
    data: {
      courseId: COURSE_ID,
      cefrLevel: 'A1',
      title: 'Verb "To Be"',
      titleTranslated: 'Феъли «To Be» (будан)',
      explanation: `## To Be — феъли «будан»\n\nФеъли **to be** яке аз муҳимтарин феълҳои забони англисӣ аст.\n\n| Шахс | Шакл | Мисол |\n|------|------|-------|\n| I | **am** | I am a student. |\n| You | **are** | You are my friend. |\n| He/She/It | **is** | She is a teacher. |\n| We/They | **are** | They are happy. |\n\n**Шакли кӯтоҳ:** I'm · You're · He's · She's · It's · We're · They're`,
      emoji: '🔤',
      order: 1,
      isActive: true,
      examples: {
        create: [
          { sentence: 'I am a student.', translation: 'Ман донишҷӯ ҳастам.', highlight: 'am', order: 1 },
          { sentence: 'She is a doctor.', translation: 'Вай духтур аст.', highlight: 'is', order: 2 },
          { sentence: 'They are friends.', translation: 'Онҳо дӯстон ҳастанд.', highlight: 'are', order: 3 },
          { sentence: 'We are happy.', translation: 'Мо хушбахт ҳастем.', highlight: 'are', order: 4 },
        ],
      },
      rules: {
        create: [
          { pattern: 'I + am + ...', note: 'Барои шахси аввали танҳо «am» истифода мешавад.', order: 1 },
          { pattern: 'He / She / It + is + ...', note: 'Барои шахси сеюми танҳо «is» истифода мешавад.', order: 2 },
          { pattern: 'You / We / They + are + ...', note: 'Барои шахси дуюм ва ҷамъ «are» истифода мешавад.', order: 3 },
        ],
      },
      exercises: {
        create: [
          { type: 'choose', prompt: 'I ___ a student.', promptTranslated: 'Ман донишҷӯ ___.', answer: 'am', options: ['am', 'is', 'are', 'be'], explanation: 'Бо «I» ҳамеша «am» истифода мешавад.', order: 1 },
          { type: 'choose', prompt: 'She ___ a teacher.', promptTranslated: 'Вай муаллима ___.', answer: 'is', options: ['am', 'is', 'are', 'be'], explanation: 'Бо «She» ҳамеша «is» истифода мешавад.', order: 2 },
          { type: 'fill_blank', prompt: 'They ___ friends.', promptTranslated: 'Онҳо дӯстон ___.', answer: 'are', explanation: 'Бо «They» «are» истифода мешавад.', order: 3 },
          { type: 'choose', prompt: 'We ___ happy today.', promptTranslated: 'Мо имрӯз хушбахт ___.', answer: 'are', options: ['am', 'is', 'are', 'were'], order: 4 },
        ],
      },
    },
  });
  console.log('✅ Grammar topic:', grammar.id);

  // ══════════════════════════════════════════════════════════════════════════
  // 2. PHRASE COLLECTION
  // ══════════════════════════════════════════════════════════════════════════
  const phraseCol = await p.phraseCollection.create({
    data: {
      courseId: COURSE_ID,
      cefrLevel: 'A1',
      category: 'greetings',
      title: 'Everyday Greetings',
      titleTranslated: 'Саломҳои ҳаррӯза',
      emoji: '👋',
      order: 1,
      isActive: true,
      phrases: {
        create: [
          { text: 'Good morning!', translation: 'Субҳ ба хайр!', literal: 'Саҳари нек!', order: 1 },
          { text: 'Good afternoon!', translation: 'Рӯз ба хайр!', order: 2 },
          { text: 'Good evening!', translation: 'Шом ба хайр!', order: 3 },
          { text: 'Good night!', translation: 'Шаб ба хайр!', order: 4 },
          { text: 'How are you?', translation: 'Шумо чӣ хел ҳастед?', literal: 'Ҳоли шумо чӣ тавр аст?', order: 5 },
          { text: "I'm fine, thank you.", translation: 'Ман хубам, раҳмат.', order: 6 },
          { text: 'Nice to meet you!', translation: 'Аз шиносоӣ хурсандам!', order: 7 },
          { text: 'See you later!', translation: 'То дидан!', literal: 'Баъдтар мебинем!', order: 8 },
          { text: 'Take care!', translation: 'Эҳтиёт бошед!', order: 9 },
          { text: 'Have a great day!', translation: 'Рӯзи хубе дошта бошед!', order: 10 },
        ],
      },
    },
  });
  console.log('✅ Phrase collection:', phraseCol.id);

  // ══════════════════════════════════════════════════════════════════════════
  // 3. DIALOGUE
  // ══════════════════════════════════════════════════════════════════════════
  const dialogue = await p.dialogue.create({
    data: {
      courseId: COURSE_ID,
      cefrLevel: 'A1',
      title: 'First Meeting',
      titleTranslated: 'Аввалин мулоқот',
      scenario: 'Ду нафар дар муассиса бори аввал мулоқот мекунанд.',
      emoji: '🤝',
      order: 1,
      isActive: true,
      lines: {
        create: [
          { speaker: 'Alex', text: 'Hello! My name is Alex. What is your name?', translation: 'Салом! Номи ман Алекс аст. Номи шумо чӣ?', isUser: false, order: 1 },
          { speaker: 'You', text: 'Hi, Alex! My name is Daria. Nice to meet you!', translation: 'Салом, Алекс! Номи ман Дария аст. Аз шиносоӣ хурсандам!', isUser: true, order: 2 },
          { speaker: 'Alex', text: 'Nice to meet you too, Daria! Are you a student here?', translation: 'Аз шиносоӣ ман ҳам хурсандам, Дария! Шумо дар ин ҷо донишҷӯ ҳастед?', isUser: false, order: 3 },
          { speaker: 'You', text: 'Yes, I am a first-year student. And you?', translation: 'Бале, ман донишҷӯи курси аввал ҳастам. Шумо чӣ?', isUser: true, order: 4 },
          { speaker: 'Alex', text: "I'm a teacher. I teach English here.", translation: 'Ман муаллим ҳастам. Ман дар ин ҷо забони англисӣ меомӯзонам.', isUser: false, order: 5 },
          { speaker: 'You', text: 'Oh, wonderful! I love English!', translation: 'Оҳ, олӣ! Ман забони англисиро дӯст дорам!', isUser: true, order: 6 },
          { speaker: 'Alex', text: 'Great! See you in class. Goodbye!', translation: 'Хуб! Дар дарс мебинем. Хайр!', isUser: false, order: 7 },
          { speaker: 'You', text: 'Goodbye, Alex! See you later!', translation: 'Хайр, Алекс! То дидан!', isUser: true, order: 8 },
        ],
      },
    },
  });
  console.log('✅ Dialogue:', dialogue.id);

  // ══════════════════════════════════════════════════════════════════════════
  // 4. COMPREHENSION (reading)
  // ══════════════════════════════════════════════════════════════════════════
  const comprehension = await p.comprehensionExercise.create({
    data: {
      courseId: COURSE_ID,
      cefrLevel: 'A1',
      kind: 'reading',
      title: 'My Family',
      titleTranslated: 'Оилаи ман',
      passage: `My name is Sara. I am from Dushanbe. I am a student at the university.\n\nI have a small family. My father is a doctor. His name is Karim. My mother is a teacher. Her name is Lola. I have one brother. His name is Rustam. He is fifteen years old.\n\nWe live in a nice apartment. Our apartment has three rooms. I love my family very much!`,
      passageTranslated: 'Номи ман Сара аст. Ман аз Душанбе ҳастам. Ман донишҷӯи донишгоҳ ҳастам. Ман оилаи хурд дорам...',
      emoji: '📖',
      order: 1,
      isActive: true,
      questions: {
        create: [
          { question: 'Where is Sara from?', questionTranslated: 'Сара аз куҷо аст?', options: ['London', 'Dushanbe', 'Moscow', 'Tashkent'], correctIndex: 1, explanation: 'Матн мегӯяд: «I am from Dushanbe».', order: 1 },
          { question: "What is Sara's father's job?", questionTranslated: 'Падари Сара чӣ кор мекунад?', options: ['Teacher', 'Engineer', 'Doctor', 'Driver'], correctIndex: 2, explanation: '«My father is a doctor.»', order: 2 },
          { question: "What is the mother's name?", questionTranslated: 'Модари Сара чӣ ном дорад?', options: ['Sara', 'Lola', 'Rustam', 'Karim'], correctIndex: 1, explanation: '«My mother... Her name is Lola.»', order: 3 },
          { question: 'How many rooms does their apartment have?', questionTranslated: 'Хонаи онҳо чанд ҳуҷра дорад?', options: ['Two', 'Three', 'Four', 'Five'], correctIndex: 1, explanation: '«Our apartment has three rooms.»', order: 4 },
          { question: "How old is Sara's brother?", questionTranslated: 'Бародари Сара чанд сола аст?', options: ['Ten', 'Twelve', 'Fifteen', 'Twenty'], correctIndex: 2, explanation: '«He is fifteen years old.»', order: 5 },
        ],
      },
    },
  });
  console.log('✅ Comprehension:', comprehension.id);

  // ══════════════════════════════════════════════════════════════════════════
  // 5. MODULE + ALL 7 LESSONS
  // ══════════════════════════════════════════════════════════════════════════
  const module = await p.module.create({
    data: {
      courseId: COURSE_ID,
      title: 'Greeting & Daily Life',
      titleTranslated: 'Салом ва Ҳаёти Рӯзмарра',
      emoji: '🌟',
      color: '#14B8A6',
      order: 2,
      isActive: true,
      lessons: {
        create: [
          // ── 1. VOCAB ──────────────────────────────────────────────────────
          {
            title: 'Basic Greetings',
            titleTranslated: 'Саломҳои асосӣ',
            skillType: 'vocab',
            emoji: '👋',
            cefrLevel: 'A1',
            xpReward: 60,
            order: 1,
            isActive: true,
            words: {
              create: [
                { word: 'hello', translation: 'салом', emoji: '👋', ipa: '/həˈloʊ/', example: 'Hello, how are you?', exampleTrans: 'Салом, чӣ хел ҳастед?', difficulty: 1, order: 1 },
                { word: 'goodbye', translation: 'хайр / худоҳофиз', emoji: '👋', ipa: '/ˌɡʊdˈbaɪ/', example: 'Goodbye, see you tomorrow!', exampleTrans: 'Хайр, пагоҳ мебинем!', difficulty: 1, order: 2 },
                { word: 'please', translation: 'лутфан', emoji: '🙏', ipa: '/pliːz/', example: 'Please help me.', exampleTrans: 'Лутфан ба ман кӯмак кунед.', difficulty: 1, order: 3 },
                { word: 'thank you', translation: 'раҳмат / ташаккур', emoji: '😊', ipa: '/ˈθæŋk juː/', example: 'Thank you very much!', exampleTrans: 'Хеле раҳмат!', difficulty: 1, order: 4 },
                { word: 'sorry', translation: 'бубахшед / маъзур', emoji: '😔', ipa: '/ˈsɒri/', example: "I'm sorry for being late.", exampleTrans: 'Бубахшед, дер омадам.', difficulty: 1, order: 5 },
                { word: 'yes', translation: 'бале / ҳа', emoji: '✅', ipa: '/jes/', example: 'Yes, I understand.', exampleTrans: 'Бале, ман мефаҳмам.', difficulty: 1, order: 6 },
                { word: 'no', translation: 'не / нест', emoji: '❌', ipa: '/nəʊ/', example: "No, I don't know.", exampleTrans: 'Не, ман намедонам.', difficulty: 1, order: 7 },
                { word: 'name', translation: 'ном', emoji: '📛', ipa: '/neɪm/', example: 'My name is Sara.', exampleTrans: 'Номи ман Сара аст.', difficulty: 1, order: 8 },
                { word: 'friend', translation: 'дӯст', emoji: '🤝', ipa: '/frend/', example: 'She is my best friend.', exampleTrans: 'Вай беҳтарин дӯсти ман аст.', difficulty: 2, order: 9 },
                { word: 'welcome', translation: 'хуш омадед', emoji: '🎉', ipa: '/ˈwelkəm/', example: 'Welcome to our school!', exampleTrans: 'Ба мактаби мо хуш омадед!', difficulty: 2, order: 10 },
              ],
            },
          },
          // ── 2. GRAMMAR ────────────────────────────────────────────────────
          {
            title: 'To Be',
            titleTranslated: 'Феъли «To Be»',
            skillType: 'grammar',
            emoji: '🔤',
            cefrLevel: 'A1',
            xpReward: 70,
            order: 2,
            isActive: true,
            grammarTopicId: grammar.id,
          },
          // ── 3. PHRASES ────────────────────────────────────────────────────
          {
            title: 'Everyday Phrases',
            titleTranslated: 'Ибораҳои рӯзмарра',
            skillType: 'vocab',  // phrases shown as vocab in player
            emoji: '💬',
            cefrLevel: 'A1',
            xpReward: 60,
            order: 3,
            isActive: true,
            phraseCollectionId: phraseCol.id,
          },
          // ── 4. DIALOGUE ───────────────────────────────────────────────────
          {
            title: 'First Meeting',
            titleTranslated: 'Аввалин мулоқот',
            skillType: 'reading',  // dialogue shown via reading/dialogue player
            emoji: '🎙️',
            cefrLevel: 'A1',
            xpReward: 70,
            order: 4,
            isActive: true,
            dialogueId: dialogue.id,
          },
          // ── 5. READING (COMPREHENSION) ────────────────────────────────────
          {
            title: 'Reading: My Family',
            titleTranslated: 'Хониш: Оилаи ман',
            skillType: 'reading',
            emoji: '📖',
            cefrLevel: 'A1',
            xpReward: 80,
            order: 5,
            isActive: true,
            comprehensionId: comprehension.id,
          },
          // ── 6. LISTENING ─────────────────────────────────────────────────
          {
            title: 'Listen & Choose',
            titleTranslated: 'Шунавоӣ ва интихоб',
            skillType: 'listening',
            emoji: '🎧',
            cefrLevel: 'A1',
            xpReward: 70,
            order: 6,
            isActive: true,
            words: {
              create: [
                { word: 'apple', translation: 'себ', emoji: '🍎', ipa: '/ˈæpəl/', difficulty: 1, order: 1 },
                { word: 'water', translation: 'об', emoji: '💧', ipa: '/ˈwɔːtər/', difficulty: 1, order: 2 },
                { word: 'book', translation: 'китоб', emoji: '📚', ipa: '/bʊk/', difficulty: 1, order: 3 },
                { word: 'school', translation: 'мактаб', emoji: '🏫', ipa: '/skuːl/', difficulty: 1, order: 4 },
                { word: 'house', translation: 'хона', emoji: '🏠', ipa: '/haʊs/', difficulty: 1, order: 5 },
                { word: 'car', translation: 'мошин', emoji: '🚗', ipa: '/kɑːr/', difficulty: 1, order: 6 },
                { word: 'sun', translation: 'офтоб', emoji: '☀️', ipa: '/sʌn/', difficulty: 1, order: 7 },
                { word: 'dog', translation: 'саг', emoji: '🐕', ipa: '/dɒɡ/', difficulty: 1, order: 8 },
              ],
            },
          },
          // ── 7. SPEAKING ───────────────────────────────────────────────────
          {
            title: 'Speak Out Loud',
            titleTranslated: 'Баланд гӯй',
            skillType: 'speaking',
            emoji: '🎤',
            cefrLevel: 'A1',
            xpReward: 80,
            order: 7,
            isActive: true,
            words: {
              create: [
                { word: 'Hello, my name is...', translation: 'Салом, номи ман...', emoji: '👋', difficulty: 1, order: 1 },
                { word: 'I am a student.', translation: 'Ман донишҷӯ ҳастам.', emoji: '🎓', difficulty: 1, order: 2 },
                { word: 'I am from Tajikistan.', translation: 'Ман аз Тоҷикистон ҳастам.', emoji: '🇹🇯', difficulty: 1, order: 3 },
                { word: 'Nice to meet you.', translation: 'Аз шиносоӣ хурсандам.', emoji: '🤝', difficulty: 1, order: 4 },
                { word: 'I love learning English.', translation: 'Ман омӯзиши забони англисиро дӯст дорам.', emoji: '❤️', difficulty: 2, order: 5 },
                { word: 'How are you today?', translation: 'Имрӯз чӣ хел ҳастед?', emoji: '😊', difficulty: 1, order: 6 },
              ],
            },
          },
        ],
      },
    },
    include: { lessons: true },
  });
  console.log('✅ Module created:', module.id, '— lessons:', module.lessons.length);

  // ══════════════════════════════════════════════════════════════════════════
  // 6. PLACEMENT QUESTIONS (A1 + A2 level, 5 each)
  // ══════════════════════════════════════════════════════════════════════════
  await p.placementQuestion.createMany({
    data: [
      // A1
      { targetLanguageId: TARGET_ID, nativeLanguageId: NATIVE_ID, cefrLevel: 'A1', skill: 'grammar', prompt: 'I ___ a student.', promptTranslated: 'Ман донишҷӯ ___.', options: ['am', 'is', 'are', 'be'], answer: 'am', explanation: 'Бо «I» ҳамеша «am» истифода мешавад.', order: 1 },
      { targetLanguageId: TARGET_ID, nativeLanguageId: NATIVE_ID, cefrLevel: 'A1', skill: 'vocab', prompt: 'What is the English word for «китоб»?', promptTranslated: '«Китоб» ба забони англисӣ чӣ мешавад?', options: ['car', 'book', 'school', 'house'], answer: 'book', explanation: '«Book» = китоб.', order: 2 },
      { targetLanguageId: TARGET_ID, nativeLanguageId: NATIVE_ID, cefrLevel: 'A1', skill: 'grammar', prompt: 'She ___ a teacher.', promptTranslated: 'Вай муаллима ___.', options: ['am', 'is', 'are', 'be'], answer: 'is', explanation: 'Бо «She» «is» истифода мешавад.', order: 3 },
      { targetLanguageId: TARGET_ID, nativeLanguageId: NATIVE_ID, cefrLevel: 'A1', skill: 'vocab', prompt: 'What does "hello" mean?', promptTranslated: '«Hello» чӣ маъно дорад?', options: ['хайр', 'раҳмат', 'салом', 'лутфан'], answer: 'салом', explanation: '«Hello» = салом.', order: 4 },
      { targetLanguageId: TARGET_ID, nativeLanguageId: NATIVE_ID, cefrLevel: 'A1', skill: 'grammar', prompt: 'They ___ happy.', promptTranslated: 'Онҳо хушбахт ___.', options: ['am', 'is', 'are', 'was'], answer: 'are', explanation: 'Бо «They» «are» истифода мешавад.', order: 5 },
      // A2
      { targetLanguageId: TARGET_ID, nativeLanguageId: NATIVE_ID, cefrLevel: 'A2', skill: 'grammar', prompt: 'I ___ to school every day.', promptTranslated: 'Ман ҳар рӯз ба мактаб ___.', options: ['go', 'goes', 'going', 'went'], answer: 'go', explanation: 'Present Simple бо «I» — шакли асосии феъл.', order: 6 },
      { targetLanguageId: TARGET_ID, nativeLanguageId: NATIVE_ID, cefrLevel: 'A2', skill: 'grammar', prompt: 'She ___ coffee every morning.', promptTranslated: 'Вай ҳар субҳ қаҳва ___.', options: ['drink', 'drinks', 'drinking', 'drank'], answer: 'drinks', explanation: 'Present Simple, шахси сеюми танҳо — «drinks».', order: 7 },
      { targetLanguageId: TARGET_ID, nativeLanguageId: NATIVE_ID, cefrLevel: 'A2', skill: 'vocab', prompt: 'Choose the correct meaning of "beautiful".', promptTranslated: '«Beautiful» чӣ маъно дорад?', options: ['бад', 'зебо / қашанг', 'калон', 'тез'], answer: 'зебо / қашанг', explanation: '«Beautiful» = зебо, қашанг.', order: 8 },
      { targetLanguageId: TARGET_ID, nativeLanguageId: NATIVE_ID, cefrLevel: 'A2', skill: 'grammar', prompt: 'We ___ a movie last night.', promptTranslated: 'Мо дирӯз шаб филм ___.', options: ['watch', 'watches', 'watched', 'watching'], answer: 'watched', explanation: 'Past Simple — «watched» (феъли мунтазам).', order: 9 },
      { targetLanguageId: TARGET_ID, nativeLanguageId: NATIVE_ID, cefrLevel: 'A2', skill: 'vocab', prompt: 'What is the opposite of "hot"?', promptTranslated: 'Муқобили «hot» чист?', options: ['warm', 'cold', 'cool', 'dark'], answer: 'cold', explanation: '«Hot» (гарм) — муқобилаш «cold» (хунук).', order: 10 },
    ],
  });
  console.log('✅ Placement questions: 10 added (A1×5 + A2×5)');

  // ══════════════════════════════════════════════════════════════════════════
  // Summary
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n🎉 Seed complete! Summary:');
  console.log('  Module   :', module.id);
  console.log('  Lessons  :', module.lessons.length, '(vocab × 2, grammar, phrases, reading × 2, listening, speaking)');
  console.log('  Grammar  : 1 topic, 4 examples, 3 rules, 4 exercises');
  console.log('  Phrases  : 1 collection, 10 phrases');
  console.log('  Dialogue : 1 dialogue, 8 lines');
  console.log('  Reading  : 1 comprehension, 5 questions');
  console.log('  Placement: 10 questions (A1 × 5, A2 × 5)');
}

main()
  .catch(e => { console.error('❌ Seed failed:', e.message); process.exit(1); })
  .finally(() => p.$disconnect());
