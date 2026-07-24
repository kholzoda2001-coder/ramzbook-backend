// Хатари PICK барои ҲАР СЕ САТҲ: дарсҳое ки ду+ калимаи РАСМДОР доранд.
// Дар PICK вариантҳои нодуруст ТАНҲО аз ҳамон дарс мераванд — пас ду акси
// шабеҳ дар як дарс = саргумии кафолатнок.
import { SignJWT } from 'jose';
import { readFileSync } from 'fs';
import { execFileSync } from 'child_process';
const env=Object.fromEntries(readFileSync(new URL('../.env',import.meta.url),'utf8').split('\n').filter(l=>l.includes('=')&&!l.trim().startsWith('#')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const jwt=await new SignJWT({username:'admin',role:'admin'}).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('2h').sign(new TextEncoder().encode(env.JWT_SECRET));
const api=async p=>{for(let i=0;i<5;i++){try{const r=await fetch('https://admin.ramz.tj'+p,{headers:{Cookie:'admin_token='+jwt}});if(r.ok)return r.json();}catch(_){}await new Promise(s=>setTimeout(s,900*(i+1)));}throw new Error(p);};
const appNorm=w=>w.toLowerCase().trim().replace(/['’.,!?]/g,'').replace(/\s+/g,'_');

// ҳамаи расмҳои мавҷуда дар CDN
const tree=JSON.parse(execFileSync('curl',['-s','https://api.github.com/repos/kholzoda2001-coder/ramz-audio/git/trees/main?recursive=1'],{encoding:'utf8',maxBuffer:64*1024*1024}));
const have=new Set(tree.tree.filter(t=>t.path.startsWith('images/en/')).map(t=>t.path.slice('images/en/'.length).replace(/\.png$/,'')));
console.log('расмҳо дар CDN:',have.size,'\n');

for(const level of ['A1','A2','B1']){
  const {courses}=await api('/api/admin/courses?level='+level);
  const course=courses.find(c=>c.targetLanguage?.code==='en');
  if(!course){console.log(level+': курс нест');continue;}
  const {modules}=await api('/api/admin/modules?courseId='+course.id);
  const risky=[];
  for(const m of modules){
    const {lessons}=await api('/api/admin/lessons?moduleId='+m.id);
    for(const l of (lessons??[])){
      const {words}=await api('/api/admin/words?lessonId='+l.id+'&limit=500');
      // танҳо ИСМҲО бо расм (машқи pick танҳо барои исм/феъли расмшаванда)
      const withImg=(words??[]).filter(w=>{
        const k=appNorm(w.word);
        return have.has(k) && (w.partOfSpeech??'').toLowerCase()==='noun' && (w.emoji??'').trim();
      }).map(w=>w.word);
      if(withImg.length>1) risky.push('  '+l.title+' → '+withImg.join(', '));
    }
  }
  console.log('### '+level+' — дарсҳои дорои 2+ калимаи расмдор: '+risky.length);
  risky.forEach(r=>console.log(r));
  console.log('');
}
