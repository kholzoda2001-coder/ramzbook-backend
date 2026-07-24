// Хатари ВОҚЕИИ PICK — бо ҳамон филтрҳое ки БАРНОМА истифода мебарад.
//
// Санҷиши пештара хом буд: «People → Man, Woman, Boy» нишон медод, ҳол он ки
// онҳо аллакай дар _kNonPicturableWords манъанд. Ин ҷо ҳар панҷ шарти барнома
// татбиқ мешавад, пас натиҷа маҳз он чизест ки хонанда мебинад.
import { SignJWT } from 'jose';
import { readFileSync } from 'fs';
import { execFileSync } from 'child_process';

const env=Object.fromEntries(readFileSync(new URL('../.env',import.meta.url),'utf8').split('\n').filter(l=>l.includes('=')&&!l.trim().startsWith('#')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const jwt=await new SignJWT({username:'admin',role:'admin'}).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('2h').sign(new TextEncoder().encode(env.JWT_SECRET));
const api=async p=>{for(let i=0;i<5;i++){try{const r=await fetch('https://admin.ramz.tj'+p,{headers:{Cookie:'admin_token='+jwt}});if(r.ok)return r.json();}catch(_){}await new Promise(s=>setTimeout(s,900*(i+1)));}throw new Error(p);};

const rules=JSON.parse(readFileSync(new URL('./_app-pick-rules.json',import.meta.url),'utf8'));
const NON=new Set(rules.nonPicturable);
const VERBS=new Set(rules.picturableVerbs);
const BLOCKED=new Set(rules.blockedEmojis.map(e=>e.replace(/️/g,'')));

// айнан _pickWordKey-и барнома
const pickKey=w=>w.toLowerCase().trim().replace(/['’.,!?]/g,'').replace(/\s+/g,'_');
const emojiKey=e=>(e||'').trim().replace(/️/g,'');

const tree=JSON.parse(execFileSync('curl',['-s','https://api.github.com/repos/kholzoda2001-coder/ramz-audio/git/trees/main?recursive=1'],{encoding:'utf8',maxBuffer:64*1024*1024}));
const have=new Set(tree.tree.filter(t=>t.path.startsWith('images/en/')).map(t=>t.path.slice('images/en/'.length).replace(/\.png$/,'')));

let grand=0;
for(const level of ['A1','A2','B1']){
  const {courses}=await api('/api/admin/courses?level='+level);
  const course=courses.find(c=>c.targetLanguage?.code==='en');
  if(!course)continue;
  const {modules}=await api('/api/admin/modules?courseId='+course.id);
  const out=[];
  for(const m of modules){
    const {lessons}=await api('/api/admin/lessons?moduleId='+m.id);
    for(const l of (lessons??[])){
      const {words}=await api('/api/admin/words?lessonId='+l.id+'&limit=500');
      const ws=words??[];
      // шумориши эмоҷӣ дар ҳамин дарс (шарти 5-уми барнома)
      const counts={};
      for(const w of ws){const e=emojiKey(w.emoji); if(e) counts[e]=(counts[e]||0)+1;}
      const pickable=ws.filter(w=>{
        const e=emojiKey(w.emoji); if(!e) return false;
        const k=pickKey(w.word);
        const pos=(w.partOfSpeech??'').toLowerCase();
        if(pos!=='noun' && !VERBS.has(k)) return false;   // _isPicturable
        if(BLOCKED.has(e)) return false;
        if(NON.has(k)) return false;
        if(counts[e]!==1) return false;                    // эмоҷӣ бояд ягона бошад
        return have.has(k);                                // расм воқеан ҳаст?
      }).map(w=>w.word);
      if(pickable.length>1) out.push('  '+l.title+' ('+pickable.length+'): '+pickable.join(', '));
    }
  }
  grand+=out.length;
  console.log('### '+level+' — дарсҳо бо 2+ расми ВОҚЕИИ PICK: '+out.length);
  out.forEach(x=>console.log(x));
  console.log('');
}
console.log('ҶАМЪ:',grand,'дарс барои санҷиши визуалӣ');
