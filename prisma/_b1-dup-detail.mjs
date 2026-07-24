import { SignJWT } from 'jose';
import { readFileSync } from 'fs';
const env=Object.fromEntries(readFileSync(new URL('../.env',import.meta.url),'utf8').split('\n').filter(l=>l.includes('=')&&!l.trim().startsWith('#')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const jwt=await new SignJWT({username:'admin',role:'admin'}).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('2h').sign(new TextEncoder().encode(env.JWT_SECRET));
const api=async p=>{for(let i=0;i<5;i++){try{const r=await fetch('https://admin.ramz.tj'+p,{headers:{Cookie:'admin_token='+jwt}});if(r.ok)return r.json();}catch(_){}await new Promise(s=>setTimeout(s,900*(i+1)));}throw new Error(p);};
const key=w=>(w||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'');
const {courses}=await api('/api/admin/courses?level=B1');
const course=courses.find(c=>c.targetLanguage?.code==='en');
const {modules}=await api('/api/admin/modules?courseId='+course.id);
let realCount=0;
for(const m of modules){
  const {lessons}=await api('/api/admin/lessons?moduleId='+m.id);
  const seen={};
  for(const l of (lessons??[])){
    const {words}=await api('/api/admin/words?lessonId='+l.id+'&limit=500');
    for(const w of (words??[])){ const k=key(w.word); (seen[k]||=[]).push(l.title); }
  }
  const real=Object.entries(seen).filter(([k,v])=>v.filter(x=>!/writing|навиштан/i.test(x)).length>1);
  if(real.length){ realCount+=real.length; console.log('### '+m.title); for(const [k,v] of real) console.log('  '+k+' → '+v.join(' | ')); }
}
console.log('\nТакрори ҲАҚИҚӢ (ғайри-Writing):', realCount);
