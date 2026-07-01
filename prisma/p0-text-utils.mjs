// Shared text-normalization helpers for the A1 P0 audit fix.
export const EN_PROPER = new Set([
  'Ali','Sara','Umar','Karim','Anna','America','England','Russia','Dubai','Dushanbe',
  'Tajikistan','UAE','Uae','Somoni','English','Russian','Tajik',
  'January','February','March','April','May','June','July','August','September','October','November','December',
  'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'
]);
export const TJ_PROPER = new Set([
  'Алӣ','Сара','Умар','Карим','Анна','Амрико','Англия','Русия','Дубай','Душанбе','Тоҷикистон','Сомонӣ'
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
  return parts.map(tok=>{
    if(/^\s+$/.test(tok)) return tok;
    const m = tok.match(/^([^A-Za-z]*)([A-Za-z'’-]+)?([^A-Za-z]*)$/);
    if(!m || !m[2]){
      // punctuation-only token: it may itself close a sentence
      if(/[.!?]/.test(tok)) atSentenceStart = true;
      return tok;
    }
    let [ ,pre, word, post ] = m;
    const bare = word.replace(/['’-].*$/,'');
    const isProper = EN_PROPER.has(word) || EN_PROPER.has(bare) ||
                     EN_PROPER.has(word.charAt(0).toUpperCase()+word.slice(1).toLowerCase());
    const isI = /^I$/.test(word) || /^I['’]/.test(word);
    const isAcronym = word===word.toUpperCase() && word.length>=2 && word.length<=3 && word!=='AN';
    if(atSentenceStart){
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
    atSentenceStart = /[.!?]/.test(post);
    return pre+word+post;
  }).join('');
}

export function fixTajik(s){
  if(!s) return s;
  const parts = s.split(/(\s+)/);
  let first=false;
  return parts.map(tok=>{
    if(/^\s+$/.test(tok)) return tok;
    const m = tok.match(/^([^\p{L}]*)(\p{L}[\p{L}'’ʼ-]*)?([^\p{L}]*)$/u);
    if(!m||!m[2]) return tok;
    let [ ,pre,word,post ] = m;
    const proper = TJ_PROPER.has(word) || TJ_PROPER.has(word.charAt(0).toUpperCase()+word.slice(1));
    if(!first){ first=true; word = proper ? word.charAt(0).toUpperCase()+word.slice(1) : word.charAt(0).toUpperCase()+word.slice(1).toLowerCase(); }
    else if(proper){ word = word.charAt(0).toUpperCase()+word.slice(1); }
    else { word = word.toLowerCase(); }
    return pre+word+post;
  }).join('');
}

export function fixIpa(s){ return s? s.toLowerCase() : s; }
