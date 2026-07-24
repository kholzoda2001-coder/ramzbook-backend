// Категоризатори дақиқи A2 — исмҳои МУШАХХАС (расмшаванда) ҷудо аз абстракт.
// A2 бештар абстракт аст, пас аз рӯи partOfSpeech + рӯйхати абстракт филтр мекунем.
import { SignJWT } from 'jose';
import { readFileSync, writeFileSync } from 'fs';
import { execFileSync } from 'child_process';
const env=Object.fromEntries(readFileSync(new URL('../.env',import.meta.url),'utf8').split('\n').filter(l=>l.includes('=')&&!l.trim().startsWith('#')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const jwt=await new SignJWT({username:'admin',role:'admin'}).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('2h').sign(new TextEncoder().encode(env.JWT_SECRET));
const api=async p=>{for(let i=0;i<5;i++){try{const r=await fetch('https://admin.ramz.tj'+p,{headers:{Cookie:'admin_token='+jwt}});if(r.ok)return r.json();}catch(_){}await new Promise(s=>setTimeout(s,900*(i+1)));}throw new Error(p);};
const key=w=>(w||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'');

const {courses}=await api('/api/admin/courses?level=A2');
const course=courses.find(c=>c.targetLanguage?.code==='en');
const {modules}=await api('/api/admin/modules?courseId='+course.id);
const words=[];
for(const m of modules){
  const {lessons}=await api('/api/admin/lessons?moduleId='+m.id);
  for(const l of (lessons??[])){
    const {words:ws}=await api('/api/admin/words?lessonId='+l.id+'&limit=500');
    for(const w of (ws??[])) words.push({module:m.title,word:w.word,pos:(w.partOfSpeech??'').toLowerCase(),emoji:w.emoji??'',key:key(w.word)});
  }
}
const tree=JSON.parse(execFileSync('curl',['-s','https://api.github.com/repos/kholzoda2001-coder/ramz-audio/git/trees/main?recursive=1'],{encoding:'utf8',maxBuffer:64*1024*1024}));
const have=new Set(tree.tree.filter(t=>t.path.startsWith('images/en/')).map(t=>t.path.slice('images/en/'.length).replace(/\.png$/,'')));

// Феълҳои расмшаванда (амали дидашаванда)
const VERB_OK=/^(jog|stretch|boil|fry|bake|roast|chop|peel|slice|stir|pour|swim|climb|ski|skate|box|cook|dive|hike|camp|sunbathe|comb|shave|sweep|dust|mop|vacuum|iron|paint|draw|knit|fish|cycle)$/i;
// Исмҳои АБСТРАКТ (расм намешавад — мафҳум/ҳиссиёт/вақт/сифат-исм)
const ABSTRACT_NOUN=/^(story|adventure|memory|childhood|event|moment|past|dream|habit|routine|schedule|energy|chore|mess|housework|laundry|spare time|screen time|series|diary|success|goal|ambition|wish|purpose|motivation|chance|opportunity|decision|experience|achievement|freedom|justice|law|duty|culture|tradition|custom|heritage|society|community|population|nation|region|government|election|vote|protest|campaign|charity|issue|fact|truth|rumour|headline|article|announcement|advertisement|broadcast|news|budget|discount|debt|savings|loan|fee|tip|wage|income|payment|currency|worth|service|bill|invoice|deposit|order|refund|guarantee|bargain|offer|brand|deal|career|meeting|interview|deadline|shift|contract|task|project|report|document|presentation|client|staff|firm|departure|arrival|delay|booking|reservation|view|distance|route|fare|traffic|rush hour|journey|tour|trip|holiday|departure|delay|fitness|strength|wellbeing|stress|nutrition|diet|weight|treatment|checkup|dose|injury|cure|health|environment|climate|pollution|waste|fuel|nature|hobby|festival|concert|comedy|choir|audience|stage|series|podcast|network|account|password|website|link|notification|post|comment|message|social media|video call|update|download|upload|search|contact|emoji|delight|feeling|emotion|mood)$/i;

const cat={concrete_noun:[],people_job:[],place:[],animal_food:[],body:[],verb:[],abstract:[],adjective:[],adverb:[],has_image:[]};
const PEOPLE=/^(lawyer|accountant|journalist|architect|electrician|plumber|waiter|chef|surgeon|coach|referee|guide|tourist|passenger|crew|reporter|volunteer|citizen|immigrant|employee|boss|owner|member|champion|couple|twin|staff|client)$/i;
const PLACE=/^(town hall|salon|grocer|bookshop|car park|square|gallery|kiosk|chemist|petrol station|tower|palace|skyscraper|monument|fountain|statue|factory|castle|harbour|junction|roundabout|pavement|crossing|terminal|gate|reception|floor|valley|desert|waterfall|cave|cliff|field|stream|nest|border|continent|capital|ward)$/i;
const ANIMAL_FOOD=/^(insect|butterfly|bee|feather|branch|root|seed|flour|oil|yeast|sauce|ginger|spice|honey|dough|herb|vinegar|starter|dessert|dish|carton|packet|loaf|jar|bunch|piece|dozen|spoonful|litre)$/i;
const BODY=/^(shoulder|knee|ankle|elbow|wrist|chest|throat|chin|forehead|skin|muscle|beard|moustache)$/i;
const ADJ=/(ed|ing|ful|less|ous|ive|able|ible|al|ic|y)$/i; // тахминӣ

for(const w of words){
  if(have.has(w.key)){cat.has_image.push(w.word);continue;}
  const x=w.word;
  if(w.pos==='verb'||VERB_OK.test(x)){ (VERB_OK.test(x)?cat.verb:cat.abstract).push(x); continue; }
  if(w.pos==='adjective'){ cat.adjective.push(x); continue; }
  if(w.pos==='adverb'){ cat.adverb.push(x); continue; }
  if(PEOPLE.test(x)){cat.people_job.push(x);continue;}
  if(PLACE.test(x)){cat.place.push(x);continue;}
  if(ANIMAL_FOOD.test(x)){cat.animal_food.push(x);continue;}
  if(BODY.test(x)){cat.body.push(x);continue;}
  if(ABSTRACT_NOUN.test(x)){cat.abstract.push(x);continue;}
  if(w.pos==='noun'){cat.concrete_noun.push(x);continue;}
  cat.abstract.push(x);
}
const u=a=>[...new Set(a)];
for(const k in cat) cat[k]=u(cat[k]);
const photo=[...cat.concrete_noun,...cat.people_job,...cat.place,...cat.animal_food,...cat.body,...cat.verb];
console.log('A2:', words.length,'калима');
console.log('  ✅ расм дорад:', cat.has_image.length);
console.log('  🎯 РАСМШАВАНДА:', photo.length, '=');
console.log('     объект:',cat.concrete_noun.length,'| одам/касб:',cat.people_job.length,'| ҷой:',cat.place.length,'| ҳайвон/хӯрок:',cat.animal_food.length,'| бадан:',cat.body.length,'| феъл:',cat.verb.length);
console.log('  ❌ расм НЕ: абстракт',cat.abstract.length,'| сифат',cat.adjective.length,'| зарф',cat.adverb.length);
console.log('\n— ОБЪЕКТ —\n', cat.concrete_noun.join(', '));
console.log('\n— ОДАМ/КАСБ —\n', cat.people_job.join(', '));
console.log('\n— ҶОЙ —\n', cat.place.join(', '));
console.log('\n— ҲАЙВОН/ХӮРОК —\n', cat.animal_food.join(', '));
console.log('\n— БАДАН —\n', cat.body.join(', '));
console.log('\n— ФЕЪЛ —\n', cat.verb.join(', '));
writeFileSync(new URL('./_a2-categorize2.json',import.meta.url),JSON.stringify({photo,cat},null,2));
