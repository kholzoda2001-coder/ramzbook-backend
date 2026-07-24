import { SignJWT } from 'jose';
import { readFileSync } from 'fs';
const env=Object.fromEntries(readFileSync(new URL('../.env',import.meta.url),'utf8').split('\n').filter(l=>l.includes('=')&&!l.trim().startsWith('#')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const jwt=await new SignJWT({username:'admin',role:'admin'}).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('2h').sign(new TextEncoder().encode(env.JWT_SECRET));
const api=async p=>{for(let i=0;i<5;i++){try{const r=await fetch('https://admin.ramz.tj'+p,{headers:{Cookie:'admin_token='+jwt}});if(r.ok)return r.json();}catch(_){}await new Promise(s=>setTimeout(s,900*(i+1)));}throw new Error(p);};
const {courses}=await api('/api/admin/courses?level=A2');
const course=courses.find(c=>c.targetLanguage?.code==='en');
const {modules}=await api('/api/admin/modules?courseId='+course.id);
for(const m of modules){
  const {lessons}=await api('/api/admin/lessons?moduleId='+m.id);
  for(const l of (lessons??[])){
    if((l._count?.words??0)===0){
      const comp=l.dialogueId?'dialogue':l.comprehensionId?'comprehension':l.grammarTopicId?'grammar':l.phraseCollectionId?'phrases':'НЕСТ';
      const flag = comp==='НЕСТ' ? '❌ВАЙРОН' : (l.type==='vocab' ? '⚠️type' : '✓');
      console.log(flag+' | '+l.title+' | type='+l.type+' comp='+comp);
    }
  }
}
