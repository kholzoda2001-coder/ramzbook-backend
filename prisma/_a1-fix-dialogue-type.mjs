// Ду дарси муколама type='vocab' доранд — бояд 'dialogue' бошад (мисли ҳамтоҳошон).
// Барнома аз рӯи FK (component) route мекунад, пас ин танҳо тозагӣ аст, вале
// дар админ ва ҳар коде ки type-ро мехонад, дуруст мешавад.
import { SignJWT } from 'jose';
import { readFileSync } from 'fs';
const env=Object.fromEntries(readFileSync(new URL('../.env',import.meta.url),'utf8').split('\n').filter(l=>l.includes('=')&&!l.trim().startsWith('#')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const jwt=await new SignJWT({username:'admin',role:'admin'}).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('2h').sign(new TextEncoder().encode(env.JWT_SECRET));
const api=async p=>{for(let i=0;i<5;i++){try{const r=await fetch('https://admin.ramz.tj'+p,{headers:{Cookie:'admin_token='+jwt}});if(r.ok)return r.json();}catch(_){}await new Promise(s=>setTimeout(s,900*(i+1)));}throw new Error(p);};

const {courses}=await api('/api/admin/courses?level=A1');
const course=courses.find(c=>c.targetLanguage?.code==='en');
const {modules}=await api('/api/admin/modules?courseId='+course.id);
const targets=[];
for(const m of modules){
  const {lessons}=await api('/api/admin/lessons?moduleId='+m.id);
  for(const l of (lessons??[])){
    // Дарси муколама (dialogueId дорад) вале type != dialogue
    if(l.dialogueId && l.type!=='dialogue') targets.push({id:l.id,title:l.title,type:l.type});
  }
}
console.log('Дарсҳои ислоҳшаванда:', targets.length);
for(const t of targets){
  const r=await fetch('https://admin.ramz.tj/api/admin/lessons/'+t.id,{method:'PUT',
    headers:{'Content-Type':'application/json',Cookie:'admin_token='+jwt},
    body:JSON.stringify({type:'dialogue'})});
  console.log((r.ok?'  ✓ ':'  ✗ ')+t.title+' ('+t.type+'→dialogue)'+(r.ok?'':' '+r.status));
}
