// Санҷиш: калиди расме ки БАРНОМА месозад бо номи файле ки ман бор кардам
// мувофиқ меояд? (барнома дефисро нигоҳ медорад, ман ба _ табдил медиҳам —
// агар фарқ бошад, расм намеояд ва хонанда эмоҷӣ мебинад.)
import { SignJWT } from 'jose';
import { readFileSync } from 'fs';
const env=Object.fromEntries(readFileSync(new URL('../.env',import.meta.url),'utf8').split('\n').filter(l=>l.includes('=')&&!l.trim().startsWith('#')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const jwt=await new SignJWT({username:'admin',role:'admin'}).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('2h').sign(new TextEncoder().encode(env.JWT_SECRET));
const api=async p=>{for(let i=0;i<5;i++){try{const r=await fetch('https://admin.ramz.tj'+p,{headers:{Cookie:'admin_token='+jwt}});if(r.ok)return r.json();}catch(_){}await new Promise(s=>setTimeout(s,900*(i+1)));}throw new Error(p);};

const appNorm=w=>w.toLowerCase().trim().replace(/['’.,!?]/g,'').replace(/\s+/g,'_');
const myNorm=w=>w.trim().toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'');

const keys=new Set(readFileSync(new URL('./_a2-img-urls.tsv',import.meta.url),'utf8')
  .split('\n').filter(Boolean).map(l=>l.split('\t')[0]));

const {courses}=await api('/api/admin/courses?level=A2');
const course=courses.find(c=>c.targetLanguage?.code==='en');
const {modules}=await api('/api/admin/modules?courseId='+course.id);
let diff=0, checked=0;
for(const m of modules){
  const {lessons}=await api('/api/admin/lessons?moduleId='+m.id);
  for(const l of (lessons??[])){
    const {words}=await api('/api/admin/words?lessonId='+l.id+'&limit=500');
    for(const w of (words??[])){
      const mn=myNorm(w.word);
      if(!keys.has(mn))continue;
      checked++;
      const a=appNorm(w.word);
      if(a!==mn){ console.log('ФАРҚ: "'+w.word+'" → барнома="'+a+'" файл="'+mn+'"'); diff++; }
    }
  }
}
console.log('санҷида: '+checked+' | фарқ: '+diff+(diff?' ⚠️ ин расмҳо намеоянд!':' → ҲАМА МУВОФИҚ ✓'));
