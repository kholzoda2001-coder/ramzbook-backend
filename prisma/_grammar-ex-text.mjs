// Ҷумлаи ДУРУСТИ машқи грамматика — матне, ки барои аудиои машқ сабт мешавад.
//
// Хонанда баъди «Санҷиш» тугмаи 🔊 / 🐢-ро пахш карда ҷавоби дурустро дар
// ҷумлаи пурра мешунавад (ҳамон қоидаи дарсҳо, ниг. `BottomCheckBar.audioWord`).
// Машқ дар база ҷумлаи тайёр надорад — он аз `prompt` + `answer` сохта мешавад:
//
//   «Ali is a boy. ___ is my friend.» + «He»  → «Ali is a boy. He is my friend.»
//   «أَنَا ___ .» + «رَجُلٌ (раҷулун — мард)»   → «أَنَا رَجُلٌ.»
//   «Савол: ___ you like coffee?» + «Do»       → «Do you like coffee?»
//   «"I am tired." -> He said he ___ tired.»   → «He said he was tired.»
//   «21 = ___» + «einundzwanzig»               → «einundzwanzig»
//   «Калимаи «молоко» чӣ хел хонда мешавад?» + «/малако/» → «молоко»
//
// ҚОИДАИ АСОСӢ: беҳтар аудио НАБОШАД, аз он ки овози хориҷӣ матни тоҷикиро
// бихонад ё ҷумлаи ҒАЛАТро ҳамчун намуна гӯяд. Барои ҳамин ҳар натиҷа аз
// санҷиши ниҳоӣ мегузарад ва ҳолати шубҳанок `{ text: null, reason }` медиҳад —
// дар он сурат барнома тугмаро умуман нишон намедиҳад.
//
// Забон-агностик: танҳо ҷадвали `SCRIPT` ба забон вобаста аст.

const BLANK = /_{2,}/g;
const TAJIK_LETTERS = /[ӣӯҳҷқғӢӮҲҶҚҒ]/;
const CYRILLIC = /[А-Яа-яЁё]/;
/** Ҳарфи хати забони ОМӮХТАНӢ — ҷумла бояд ақаллан яктоашро дошта бошад. */
const SCRIPT = {
  en: /[A-Za-z]/,
  de: /[A-Za-zÄÖÜäöüß]/,
  fr: /[A-Za-zÀ-ÿ]/,
  es: /[A-Za-zÀ-ÿ]/,
  tr: /[A-Za-zÇĞİÖŞÜçğıöşü]/,
  ru: /[А-Яа-яЁё]/,
  ar: /[؀-ۿ]/,
  ko: /[가-힣]/,
  zh: /[一-鿿]/,
  ja: /[぀-ヿ一-鿿]/,
};
/** Нишонаҳои тоҷикии бе ҳарфи махсус — дар ҷавоби «кадом ҷинс?» ва ғ. (курси русӣ). */
const TAJIK_LABELS = /^(занона|мардона|миёна|ҷамъ|танҳо)$/i;
/** Саволе, ки ҷумлаи ҒАЛАТро меҷӯяд: ҷавоби он намунаи дуруст НЕСТ. */
const ASKS_FOR_WRONG = /нодуруст|incorrect|\bwrong\b|неправильн|falsch/i;

const tidy = (s) =>
  s
    .replace(/\s*\([^)]*\)/g, '') // тавзеҳи дохили қавс: «(аз они ман)», «(not)»
    .replace(/[«»"“”]/g, '')
    .replace(/\s+([.,!?;:،؟])/g, '$1') // «أَنَا رَجُلٌ .» → «أَنَا رَجُلٌ.»
    .replace(/\s{2,}/g, ' ')
    .trim();

/** Ҷавобро ба пораҳо барои якчанд ҷои холӣ тақсим мекунад. */
function pieces(answer, n) {
  for (const sep of [/\s*\/\s*/, /\s*(?:…|\.{3})\s*/]) {
    const p = answer.split(sep).map((x) => x.trim()).filter(Boolean);
    if (p.length === n) return p;
  }
  const w = answer.split(/\s+/).filter(Boolean);
  return w.length === n ? w : null;
}

/** Қисми ҷумларо, ки ҷои холиро дорад, аз тамғаҳо ҷудо мекунад. */
function focus(prompt) {
  let p = prompt;
  // «"I am tired." -> He said he ___ tired.», «طالبة ← ___» — танҳо тарафи ҷавоб.
  const arrow = p.split(/\s*(?:->|→|←)\s*/);
  if (arrow.length === 2) {
    const side = arrow.find((s) => /_{2,}/.test(s));
    if (side) p = side;
  }
  // «Савол: ___ …», «알리: "저는 ___ 있어요."», «Пур кунед: …» — тамға партофта мешавад.
  // Вақти «8:30» тамға нест (ду тарафи «:» рақам).
  const m = p.match(/^(.*?[^\d\s]|[^\d:]*)\s*:\s+(.*)$/);
  if (m && /_{2,}/.test(m[2]) && !/_{2,}/.test(m[1])) p = m[2];
  return p;
}

/**
 * @param {{type:string,prompt:string,answer:string}} ex
 * @param {string} lang Language.code-и забони омӯхтанӣ
 * @returns {{text: string|null, reason: string}}
 */
export function exerciseSentence(ex, lang) {
  const script = SCRIPT[lang];
  if (!script) return { text: null, reason: `забони «${lang}» дар SCRIPT нест` };
  const prompt = (ex.prompt ?? '').trim();
  const answer = (ex.answer ?? '').trim();
  if (!answer) return { text: null, reason: 'ҷавоб холӣ' };
  if (ASKS_FOR_WRONG.test(prompt)) return { text: null, reason: 'савол ҷумлаи ғалатро меҷӯяд' };

  let text;
  const ans = tidy(answer);
  if (['reorder', 'transform', 'error_correction'].includes(ex.type)) {
    text = ans;
  } else {
    const p = focus(prompt);
    const n = (p.match(BLANK) ?? []).length;
    if (n === 0) {
      // «Калимаи «молоко» чӣ хел хонда мешавад?» → «/малако/»: хониш, на калима —
      // худи калимаи дохили нохунак гуфта мешавад.
      if (/^\/.*\/$/.test(answer)) {
        const q = prompt.match(/«([^»]+)»/);
        text = q ? q[1] : '';
      } else text = ans;
    } else {
      const parts = n === 1 ? [ans] : pieces(ans, n);
      if (!parts) return { text: null, reason: `${n} ҷои холӣ, ҷавоб тақсим намешавад` };
      let i = 0;
      text = p.replace(BLANK, () => parts[i++]);
      // «21 = ___», «einundzwanzig = ___», «저의 형 = ___ 형»: тарафе, ки ҷавобро дорад;
      // агар он ҳарф надошта бошад («= 010») — тарафи дигар.
      const eq = text.split(/\s+=\s+/);
      if (eq.length === 2) {
        const right = tidy(eq[1]), left = tidy(eq[0].replace(/^[^:]*:\s*/, ''));
        text = script.test(right) ? right : left;
        // «8:30 = Es ist halb neun.» → чап рақам аст, рост ҷумла.
      }
    }
    text = tidy(text);
  }

  if (!text) return { text: null, reason: 'матн холӣ' };
  if (/_{2,}/.test(text)) return { text: null, reason: 'ҷои холӣ монд' };
  if (TAJIK_LETTERS.test(text) || (lang !== 'ru' && CYRILLIC.test(text)))
    return { text: null, reason: 'матни тоҷикӣ дар ҷумла' };
  if (TAJIK_LABELS.test(text)) return { text: null, reason: 'нишонаи тоҷикӣ, на калимаи забон' };
  if (!script.test(text)) return { text: null, reason: 'ҳарфи забон нест (танҳо рақам/аломат)' };
  if (text.length > 240) return { text: null, reason: 'хеле дароз' };
  return { text, reason: 'ok' };
}

// ── Санҷиши худӣ: `node prisma/_grammar-ex-text.mjs` ─────────────────────────
const CASES = [
  [['choose', 'Ali is a boy. ___ is my friend.', 'He'], 'en', 'Ali is a boy. He is my friend.'],
  [['choose', 'أَنَا ___ .', 'رَجُلٌ (раҷулун — мард)'], 'ar', 'أَنَا رَجُلٌ.'],
  [['choose', 'This is ___ book. (аз они ман)', 'my'], 'en', 'This is my book.'],
  [['choose', 'Савол: ___ you like coffee?', 'Do'], 'en', 'Do you like coffee?'],
  [['choose', 'Инкор: ___ беги!', 'Не'], 'ru', 'Не беги!'],
  [['choose', '___ — врач. (зан)', 'Она'], 'ru', 'Она — врач.'],
  [['choose', '알리: "저는 ___ 있어요."', '누나가'], 'ko', '저는 누나가 있어요.'],
  [['choose', '저는 알리___.', '입니다'], 'ko', '저는 알리입니다.'],
  [['choose', '8:30 = Es ist ___.', 'halb neun'], 'de', 'Es ist halb neun.'],
  [['choose', '21 = ___', 'einundzwanzig'], 'de', 'einundzwanzig'],
  [['choose', 'einundzwanzig = ___', '21'], 'de', 'einundzwanzig'],
  [['choose', '저의 형 = ___ 형', '제'], 'ko', '제 형'],
  [['choose', '전화번호: 공일공 = ___', '010'], 'ko', '공일공'],
  [['choose', 'Zum Lehrer sagt man: Wie heißen ___?', 'Sie'], 'de', 'Wie heißen Sie?'],
  [['choose', '"I am tired." -> He said he ___ tired.', 'was'], 'en', 'He said he was tired.'],
  [['choose', '“Close the door.” → She told me ___ the door.', 'to close'], 'en', 'She told me to close the door.'],
  [['fill_blank', "He said that he ___ (бозӣ мекард) tennis.", 'played'], 'en', 'He said that he played tennis.'],
  [['choose', 'The medicine ___ already ___ tested.', 'has / been'], 'en', 'The medicine has already been tested.'],
  [['fill_blank', '___ ___ the TV, I want to watch the news. (фаъол кардан)', 'Turn on'], 'en', 'Turn on the TV, I want to watch the news.'],
  [['fill_blank', 'البَنْطَالُ ___ وَالتَّنُّورَةُ ___. (Шим сабз аст ва доман сабз аст.)', 'أَخْضَرُ … خَضْرَاءُ'], 'ar', 'البَنْطَالُ أَخْضَرُ وَالتَّنُّورَةُ خَضْرَاءُ.'],
  [['choose', 'هذا كتاب___. (аз они ман)', 'ي'], 'ar', 'هذا كتابي.'],
  [['choose', 'طالبة ← ___', 'طالبات'], 'ar', 'طالبات'],
  [['choose', 'Калимаи «молоко» чӣ хел хонда мешавад?', '/малако/'], 'ru', 'молоко'],
  [['choose', 'Книга — кадом ҷинс?', 'Занона'], 'ru', null],
  [['choose', 'Кадоми ин ҷумлаҳо НОДУРУСТ аст?', 'كَمْ كُتُباً عِنْدَكَ؟'], 'ar', null],
  [['choose', 'Фарқи يُمْكِنُ ва يَسْتَطِيعُ дар чист?', 'يُمْكِنُ беshахсист, يَسْتَطِيعُ дар бораи лиёқати шахс'], 'ar', null],
  [['choose', '«Пиёлаи чой» кадомаш дуруст аст?', 'كُوبُ شَايٍ'], 'ar', 'كُوبُ شَايٍ'],
  [['reorder', 'Ҷумла созед', 'I am a student.'], 'en', 'I am a student.'],
  [['choose', 'Ба русӣ «Оё ту чойро дӯст медорӣ?» чӣ гуна мешавад?', 'Ты любишь чай?'], 'ru', 'Ты любишь чай?'],
];

if (import.meta.url === `file:///${process.argv[1]?.replace(/\\/g, '/')}` || process.argv[1]?.endsWith('_grammar-ex-text.mjs')) {
  let bad = 0;
  for (const [[type, prompt, answer], lang, want] of CASES) {
    const got = exerciseSentence({ type, prompt, answer }, lang);
    if (got.text !== want) {
      bad++;
      console.log(`✗ ${lang} «${prompt}» + «${answer}»\n    интизор: ${want}\n    гирифт : ${got.text} (${got.reason})`);
    }
  }
  console.log(bad ? `\n${bad}/${CASES.length} ноком` : `✓ ${CASES.length}/${CASES.length}`);
  process.exit(bad ? 1 : 0);
}
