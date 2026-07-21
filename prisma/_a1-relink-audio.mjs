// audioUrl-и калимаҳои иваз-шударо дар база барқарор мекунад.
// Ҳангоми иваз ман audioUrl:'' гузошта будам; барнома ба конвенсияи CDN
// (audio/en/{id}.mp3) бармегардад ва кор мекунад, вале майдони база холӣ
// мемонад — ин дар аудит ҳамчун «бе аудио» намоён мешавад ва барои
// prefetch-и офлайн (ки аз ҳамин майдон мехонад) зарар аст.
import {SignJWT} from 'jose';
import {readFileSync} from 'fs';
const env=Object.fromEntries(readFileSync(new URL('../.env',import.meta.url),'utf8').split('\n').filter(l=>l.includes('=')&&!l.trim().startsWith('#')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const t=await new SignJWT({username:'admin',role:'admin'}).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('2h').sign(new TextEncoder().encode(env.JWT_SECRET));
const H={'Content-Type':'application/json',Cookie:'admin_token='+t};
const CDN='https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio@main/audio/en';
const ids=new Set();
for(const f of ['_a1-dedupe-new.json','_a1-fix-one.json','_a1-fix7.json']){
  try{ for(const w of JSON.parse(readFileSync(new URL('./'+f,import.meta.url),'utf8'))) ids.add(w.id); }catch{}
}
let ok=0,fail=0;
for(const id of ids){
  const res=await fetch('https://admin.ramz.tj/api/admin/words/'+id,{method:'PUT',headers:H,
    body:JSON.stringify({audioUrl:`${CDN}/${id}.mp3`})});
  res.ok?ok++:fail++;
}
console.log(`audioUrl барқарор шуд: ${ok} | хато: ${fail}`);
