// Муколамаҳои A2: сатр доранд? Аудио доранд?
import { SignJWT } from 'jose';
import { readFileSync } from 'fs';
const env=Object.fromEntries(readFileSync(new URL('../.env',import.meta.url),'utf8').split('\n').filter(l=>l.includes('=')&&!l.trim().startsWith('#')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const jwt=await new SignJWT({username:'admin',role:'admin'}).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('2h').sign(new TextEncoder().encode(env.JWT_SECRET));
const api=async p=>{for(let i=0;i<5;i++){try{const r=await fetch('https://admin.ramz.tj'+p,{headers:{Cookie:'admin_token='+jwt}});if(r.ok)return r.json();}catch(_){}await new Promise(s=>setTimeout(s,900*(i+1)));}throw new Error(p);};
const {courses}=await api('/api/admin/courses?level=B1');
const course=courses.find(c=>c.targetLanguage?.code==='en');
const {modules}=await api('/api/admin/modules?courseId='+course.id);
let dlg=0,dlgEmpty=0,comp=0,compEmpty=0,gram=0,gramEmpty=0;
const problems=[];
for(const m of modules){
  const {lessons}=await api('/api/admin/lessons?moduleId='+m.id);
  for(const l of (lessons??[])){
    if(l.dialogueId){
      const d=await api('/api/mobile/lessons/'+l.id);
      const lines=d?.component?.lines?.length ?? 0;
      dlg++; if(lines===0){dlgEmpty++;problems.push('МУКОЛАМАИ ХОЛӢ: '+l.title);}
    } else if(l.comprehensionId){
      const d=await api('/api/mobile/lessons/'+l.id);
      const q=d?.component?.exercises?.length ?? d?.component?.questions?.length ?? 0;
      comp++; if(q===0){compEmpty++;problems.push('ТЕСТИ ХОЛӢ: '+l.title);}
    } else if(l.grammarTopicId){
      const d=await api('/api/mobile/lessons/'+l.id);
      const ex=d?.component?.exercises?.length ?? 0;
      const body=(d?.component?.content??d?.component?.explanation??'').length;
      gram++; if(ex===0&&body<20){gramEmpty++;problems.push('ГРАММАТИКАИ ХОЛӢ: '+l.title);}
    }
  }
}
console.log('Муколама: '+dlg+' (холӣ: '+dlgEmpty+')');
console.log('Тест/фаҳмиш: '+comp+' (холӣ: '+compEmpty+')');
console.log('Грамматика: '+gram+' (холӣ: '+gramEmpty+')');
if(problems.length){console.log('\n⚠️ МУШКИЛҲО:');problems.forEach(p=>console.log('  '+p));}
else console.log('\n✓ ҳамаи компонентҳо мазмун доранд');
