// Тақсими ҳамаи калимаҳои A1 ба гурӯҳҳо — то бидонем кадом расм шуда метавонад.
// Танҳо МЕХОНАД.
import { SignJWT } from 'jose';
import { readFileSync, writeFileSync } from 'fs';
import { execFileSync } from 'child_process';

const env = Object.fromEntries(readFileSync(new URL('../.env', import.meta.url),'utf8')
  .split('\n').filter(l=>l.includes('=')&&!l.trim().startsWith('#'))
  .map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const jwt=await new SignJWT({username:'admin',role:'admin'}).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('2h').sign(new TextEncoder().encode(env.JWT_SECRET));
const api=async p=>{for(let i=0;i<5;i++){try{const r=await fetch('https://admin.ramz.tj'+p,{headers:{Cookie:'admin_token='+jwt}});if(r.ok)return r.json();}catch(_){}await new Promise(s=>setTimeout(s,900*(i+1)));}throw new Error(p);};
const key=w=>(w||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'');

const {courses}=await api('/api/admin/courses?level=A1');
const course=courses.find(c=>c.targetLanguage?.code==='en');
const {modules}=await api('/api/admin/modules?courseId='+course.id);
modules.sort((a,b)=>(a.order??0)-(b.order??0));

const words=[];
for(const m of modules){
  const {lessons}=await api('/api/admin/lessons?moduleId='+m.id);
  for(const l of (lessons??[])){
    const {words:ws}=await api('/api/admin/words?lessonId='+l.id+'&limit=500');
    for(const w of (ws??[])) words.push({module:m.title,lesson:l.title,id:w.id,
      word:w.word,pos:(w.partOfSpeech??'').toLowerCase(),emoji:w.emoji??'',key:key(w.word)});
  }
}

// расмҳои мавҷуда дар CDN
const tree=JSON.parse(execFileSync('curl',['-s','https://api.github.com/repos/kholzoda2001-coder/ramz-audio/git/trees/main?recursive=1'],{encoding:'utf8',maxBuffer:64*1024*1024}));
const have=new Set(tree.tree.filter(t=>t.path.startsWith('images/en/')).map(t=>t.path.slice('images/en/'.length).replace(/\.png$/,'')));

// калимаҳое ки РАСМИ ВОҚЕӢ надоранд/бемаъно (аз рӯи маъно)
const NUMBERS=/^(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|first|second|third|o.?clock)$/i;
const FUNCTION=/^(i|you|he|she|it|we|they|is|am|are|be|a|an|the|this|that|these|those|my|your|his|her|our|their|and|or|but|not|no|yes|to|of|in|on|at|from|with|for|do|does|have|has|can|will|hello|hi|bye|goodbye|please|thanks|thank you|you.?re welcome|sorry|excuse me|ok|okay|maybe|very|too|also|here|there|now|today|tomorrow|yesterday|good|bad|welcome|question|answer|word|name|full name|surname)$/i;

const cat={has_image:[],picturable_missing:[],number:[],function_word:[],
  abstract_or_place:[]};
const ABSTRACT=/^(love|music|game|call|colour|color|corner|examine|feeling|happy|sad|angry|tired|help|emergency|danger|safe|accident|health|healthy|sick|ill|pain|life|time|age|price|quality|quantity|size|direction|location|place|language|english|tajik|russian|country|city|world|nature|weather|sale|list)$/i;
const PLACE_NAME=/^(tajikistan|uae|america|england|russia|dushanbe|dubai|london|britain)$/i;

for(const w of words){
  if(have.has(w.key)) cat.has_image.push(w);
  else if(NUMBERS.test(w.word)) cat.number.push(w);
  else if(FUNCTION.test(w.word)) cat.function_word.push(w);
  else if(ABSTRACT.test(w.word)||PLACE_NAME.test(w.word)) cat.abstract_or_place.push(w);
  else cat.picturable_missing.push(w);
}

console.log('Ҳамагӣ калима:',words.length);
console.log('  ✅ аллакай расм дорад:      ',cat.has_image.length);
console.log('  🎨 расмшаванда, вале нест:  ',cat.picturable_missing.length);
console.log('  🔢 рақам (расм нашуд):      ',cat.number.length);
console.log('  🔤 калимаи хидматӣ/грамматикӣ:',cat.function_word.length);
console.log('  💭 абстракт/номи ҷуғрофӣ:   ',cat.abstract_or_place.length);

console.log('\n— РАСМШАВАНДА, ВАЛЕ НЕСТ ('+cat.picturable_missing.length+') —');
console.log(cat.picturable_missing.map(w=>w.word).join(', '));

writeFileSync(new URL('./_a1-categorize.json',import.meta.url),JSON.stringify(cat,null,2));
console.log('\n→ _a1-categorize.json');
