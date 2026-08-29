// Shared text-normalization helpers for the A1 P0 audit fix.
// ⚠️ Ҳар калимаи бо ҳарфи КАЛОН, ки дар ин рӯйхат НЕСТ, аз тарафи `fixEnglish`
// ба ҳарфи хурд гардонда мешавад. Яъне исми хоси нонавишта ВАЙРОН мешавад:
// «In France» → «In france». Рӯйхати зерин аз мазмуни ВОҚЕИИ курс гирифта
// шудааст (калимаҳои бо ҳарфи калон дар МИЁНИ ҷумла, ки ин ҷо набуданд).
// Ҳангоми илова кардани мазмуни нав ин рӯйхатро низ нав кунед.
export const EN_PROPER = new Set([
  'Ali','Sara','Umar','Karim','Anna','America','England','Russia','Dubai','Dushanbe',
  'Tajikistan','UAE','Uae','Somoni','English','Russian','Tajik',
  'January','February','March','April','May','June','July','August','September','October','November','December',
  'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday',
  // ── Номҳои шахс, ки дар курс истифода мешаванд ──
  'Farrukh','Malika','Aziz','Sam','Rustam','Bek','Farhod','Sardor','Jamshed',
  'Karimov','Karimova','Sabina','Dilnoza','Sarah','Mark','Madina','Lola','Alex',
  'Chris','Nilufar','Omar','Tom','Nigora','Aziza','Anvar','Bahrom','Jamila',
  'Sammy','Amir','Shakespeare',
  // ── Ҷуғрофия ва миллат ──
  'London','Paris','Rome','Moscow','Berlin','Madrid','Tokyo','Beijing','Istanbul',
  'Tehran','Khujand','Kulob','Bokhtar','France','Italy','Germany','Spain','China',
  'Japan','India','Turkey','Iran','Egypt','Canada','Brazil','Australia','Korea',
  'French','Italian','German','Spanish','Chinese','Japanese','Turkish','Arabic',
  'Persian','Uzbek','Kyrgyz','Amazon',
  // ── Астрономия ва ҷашн ──
  // ЭҲТИЁТ: 'Moon' ва 'Sun' қасдан НЕСТАНД — дар матни оддӣ «the moon is
  // bright» бо ҳарфи ХУРД дуруст аст, ва илова кардани онҳо «moon» → «Moon»
  // мекард (дар дархости озмоишӣ дида шуд).
  'Earth','Mars','Navruz',
]);
// Ҳамон хатари EN_PROPER — исми хоси нонавишта хурд карда мешавад
// («Лондон» → «лондон»). Рӯйхат аз мазмуни ВОҚЕИИ курс гирифта шудааст.
// «Тақрибан» ва «Модули» қасдан НЕСТАНД: онҳо исми хос нестанд, балки
// нишонаи ҲАМОН боги Title-Case мебошанд, ки ин скрипт ислоҳ мекунад.
export const TJ_PROPER = new Set([
  'Алӣ','Сара','Умар','Карим','Анна','Амрико','Англия','Русия','Дубай','Душанбе','Тоҷикистон','Сомонӣ',
  // ── Номҳои шахс ──
  'Бек','Фаррух','Сэм','Каримов','Каримова','Анвар','Сабина','Азиз','Алекс',
  'Крис','Малика','Рустам','Мадина','Нилуфар','Лола','Дилноза','Фарҳод',
  'Сардор','Ҷамшед','Нигора','Азиза','Баҳром','Ҷамила','Амир','Умеда',
  // ── Ҷуғрофия ва астрономия ──
  'Лондон','Париж','Рим','Маскав','Берлин','Токио','Истанбул','Хуҷанд','Кӯлоб',
  'Бохтар','Фаронса','Итолиё','Олмон','Испания','Хитой','Ҷопон','Ҳиндустон',
  'Туркия','Эрон','Миср','Канада','Австралия','Замин','Миррих','Наврӯз',
]);

function canonProper(w){
  const map = {'uae':'UAE','english':'English','russian':'Russian','tajik':'Tajik','somoni':'Somoni'};
  const lw = w.toLowerCase();
  if(map[lw]) return map[lw];
  return w.charAt(0).toUpperCase()+w.slice(1).toLowerCase();
}

export function fixEnglish(s){
  if(!s) return s;
  const parts = s.split(/(\s+)/);
  let atSentenceStart = true; // first word, and any word after . ! ?
  // Баъди нохунаки пӯшидаи нақли қавл маълум НЕСТ, ки ҷумлаи нав сар мешавад
  // ё не: «"How much is this bread?" my mother asks.» — «my» бояд хурд монад,
  // вале «"Hello." The man left.» — «The» бояд калон монад. Дар ин ҳолат
  // ягон тағйир намекунем: ҳарду хатои эҳтимолиро пешгирӣ мекунад.
  let afterQuotedSentence = false;
  return parts.map(tok=>{
    if(/^\s+$/.test(tok)) return tok;
    const m = tok.match(/^([^A-Za-z]*)([A-Za-z'’-]+)?([^A-Za-z]*)$/);
    if(!m || !m[2]){
      // punctuation-only token: it may itself close a sentence
      if(/[.!?]/.test(tok)){ atSentenceStart = true; afterQuotedSentence = false; }
      return tok;
    }
    let [ ,pre, word, post ] = m;
    const ambiguous = afterQuotedSentence;
    afterQuotedSentence = false;
    // Калимае, ки нохунакро МЕКУШОЯД, оғози нақли қавл аст → ҳарфи калон.
    const opensQuote = /["'«“‘]/.test(pre);
    const bare = word.replace(/['’-].*$/,'');
    const isProper = EN_PROPER.has(word) || EN_PROPER.has(bare) ||
                     EN_PROPER.has(word.charAt(0).toUpperCase()+word.slice(1).toLowerCase());
    const isI = /^I$/.test(word) || /^I['’]/.test(word);
    const isAcronym = word===word.toUpperCase() && word.length>=2 && word.length<=3 && word!=='AN';
    if(ambiguous){
      // Баъди «…?"» — ҳолати номаълум: калимаро ҳамон тавр мегузорем.
    } else if(atSentenceStart || opensQuote){
      if(isProper) word = canonProper(word);
      else if(isAcronym){ /* keep */ }
      else word = word.charAt(0).toUpperCase()+word.slice(1).toLowerCase();
    } else if(isI){
      word = 'I'+word.slice(1).toLowerCase();
    } else if(isProper){
      word = canonProper(word);
    } else if(isAcronym){ /* keep OK, TV */ }
    else { word = word.toLowerCase(); }
    // the next word starts a new sentence if this token ends with . ! ?
    // …магар он ки баъди аломат нохунаки пӯшида ояд («bread?"») — он ҷо
    // ҷумлаи нав ё нақли қавл буданаш маълум нест, пас ҳолати «номаълум».
    const endsSentence = /[.!?]/.test(post);
    const quotedEnd = /[.!?][^A-Za-z]*["'»”’]/.test(post);
    atSentenceStart = endsSentence && !quotedEnd;
    afterQuotedSentence = endsSentence && quotedEnd;
    return pre+word+post;
  }).join('');
}

// ⚠️ БОГИ ТАЪМИРШУДА: ин функсия пештар ҳудуди ҷумларо УМУМАН намедонист —
// танҳо калимаи АВВАЛИ тамоми сатрро калон мекард ва боқии ҳамаро хурд.
// Барои як ҷумлаи кӯтоҳ («тарҷумаи мисол») ин кор мекард, вале дар матни
// бисёрҷумлаӣ ҳар оғози ҷумларо вайрон мекард:
//   «Ин оилаи ман аст. Ман калон дорам.» → «… аст. ман калон дорам.»
// Дар дархости озмоишӣ ҲАМАИ 48 матни тоҷикии хониш тағйир меёфт. Акнун
// мантиқ айнан мисли `fixEnglish` аст: ҳудуди ҷумла ҳисоб карда мешавад.
export function fixTajik(s){
  if(!s) return s;
  const parts = s.split(/(\s+)/);
  let atSentenceStart = true;
  let afterQuotedSentence = false;
  return parts.map(tok=>{
    if(/^\s+$/.test(tok)) return tok;
    const m = tok.match(/^([^\p{L}]*)(\p{L}[\p{L}'’ʼ-]*)?([^\p{L}]*)$/u);
    if(!m||!m[2]){
      if(/[.!?]/.test(tok)){ atSentenceStart = true; afterQuotedSentence = false; }
      return tok;
    }
    let [ ,pre,word,post ] = m;
    const ambiguous = afterQuotedSentence;
    afterQuotedSentence = false;
    const opensQuote = /["'«“‘]/.test(pre);
    const proper = TJ_PROPER.has(word) || TJ_PROPER.has(word.charAt(0).toUpperCase()+word.slice(1));
    if(ambiguous){
      // Баъди «…?"» — маълум нест, ҷумлаи нав аст ё нақли қавл. Даст намерасонем.
    } else if(atSentenceStart || opensQuote){
      word = word.charAt(0).toUpperCase() + (proper ? word.slice(1) : word.slice(1).toLowerCase());
    } else if(proper){
      word = word.charAt(0).toUpperCase()+word.slice(1);
    } else {
      word = word.toLowerCase();
    }
    const endsSentence = /[.!?]/.test(post);
    const quotedEnd = /[.!?][^\p{L}]*["'»”’]/u.test(post);
    atSentenceStart = endsSentence && !quotedEnd;
    afterQuotedSentence = endsSentence && quotedEnd;
    return pre+word+post;
  }).join('');
}

export function fixIpa(s){ return s? s.toLowerCase() : s; }
