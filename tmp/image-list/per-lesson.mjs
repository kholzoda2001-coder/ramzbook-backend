import { writeFileSync } from 'fs';
const BASE='https://admin.ramz.tj/api/mobile';
const TG='cmpk1cr9o0000bo0h1mheyoad', EN='cmppaul1k0001xrdbc2woi3fj';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function api(p){for(let a=0;a<6;a++){try{const r=await fetch(BASE+p);if(r.ok)return r.json();throw 0;}catch(e){if(a===5)throw e;await sleep(1500);}}}
const BLOCK=new Set(['🌆','🌇','🌃','🏙','🌉','🗺','📍','🏞','🌐','🌍','🌎','🌏','🏢','📅','📆','🗓','⏰','⏳','🕰','⌚','🕐','⏱','⏮','⏯','⏸','▶','◀','💤','👤','👥','🧑','🗣','🎂','🎉','🎊','🎁','🎈','🎀','🏆','🥇','🥈','🥉','🎗','📝','📛','🔢','📋','📄','📃','📚','📖','❓','✨','⭐','🌟','🆕','🔤','💭','📊','📈','📉','⚖','🎲','🔁','🔂','🔄','➕','➖','🟰','🔊','📢','🔔','💡','🎯','🆗','✅','❌','↔','⬆','⬇','⏭','🔙','💯','🔥']);
const SKIP=new Set(['good','healthy','ill','sick','tired','cold','left','right','air','breeze','wind','weather','shower','climate','afternoon','morning','night','future','ache','headache','toothache','stomachache','cough','fever','flu','bruise','cramp','migraine','pain','hurt','injury','wound','stress','nap','smile','rest','sling','bargain','brand','charity','currency','debt','discount','fare','fee','income','loan','offer','payment','price','product','refund','salary','sale','savings','service','tip','wage','deposit','invoice','bill','cheque','voucher','accident','achievement','ambition','arrival','birth','childhood','comedy','community','contact','culture','custom','danger','decision','departure','diet','direction','distance','dose','election','emergency','energy','fact','firm','fitness','flight','freedom','goal','government','graduation','guarantee','half','help','heritage','holiday','housework','issue','journey','junction','link','mess','message','nation','network','nutrition','opportunity','owner','pollution','project','quantity','queue','size','strength','task','temperature','tradition','traffic','treatment','trip','wellbeing','emoji','order','amateur','audience','boss','colleague','counter','crew','customer','employee','immigrant','manager','member','stranger','volunteer','citizen','coach','guide','referee','fan','journalist','reporter','accountant','architect','engineer','plumber','grocer','cashier','tourist','surgeon','pharmacist','driver']);
const key=e=>(e||'').trim().replace(/️/g,'');
const isFlag=s=>{for(const ch of(s||'')){const cp=ch.codePointAt(0);if(cp>=0x1F1E6&&cp<=0x1F1FF)return true;}return false;};
const isKeycap=s=>/[0-9#*]️?⃣/.test(s||'');
const norm=w=>w.toLowerCase().trim().replace(/['’.,!?]/g,'').replace(/\s+/g,'_');
function draws(w){const e=key(w.emoji);if(!e)return false;if((w.partOfSpeech||'').toLowerCase()!=='noun')return false;if(isFlag(w.emoji)||isKeycap(w.emoji))return false;if(BLOCK.has(e))return false;if(SKIP.has(norm(w.word)))return false;return true;}

const courses=(await api(`/courses?targetLanguageId=${EN}&nativeLanguageId=${TG}`)).courses;
const seenImg=new Set(); // word already assigned an image (make once)
const lines=[];
let totalNew=0;
for(const level of ['A1','A2']){
  const course=courses.find(c=>c.level===level);
  if(!course)continue;
  lines.push(`\n══════════ ${level} ══════════`);
  for(const m of course.modules){
    let mHeaderShown=false;
    for(const stub of (m.lessons||[])){
      const L=await api('/lessons/'+stub.id);const les=L.lesson||L;
      const words=(les.words||[]).filter(draws);
      if(!words.length)continue;
      if(!mHeaderShown){lines.push(`\n▌${m.title}`);mHeaderShown=true;}
      const parts=words.map(w=>{const k=norm(w.word);const isNew=!seenImg.has(k);if(isNew){seenImg.add(k);totalNew++;}return isNew?w.word:`${w.word}*`;});
      lines.push(`   ${les.title}: ${parts.join(', ')}`);
    }
  }
}
lines.push(`\n* = расмаш дар дарси пешин сохта шуд (такрор лозим нест)`);
lines.push(`\nҲАМА расмҳои ягона (нав): ${totalNew}`);
const out=lines.join('\n');
writeFileSync(new URL('./per-lesson.txt',import.meta.url),out);
console.log(out);
