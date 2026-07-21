import {SignJWT} from 'jose';
import {readFileSync,writeFileSync} from 'fs';
const env=Object.fromEntries(readFileSync(new URL('../.env',import.meta.url),'utf8').split('\n').filter(l=>l.includes('=')&&!l.trim().startsWith('#')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const t=await new SignJWT({username:'admin',role:'admin'}).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('2h').sign(new TextEncoder().encode(env.JWT_SECRET));
const H={'Content-Type':'application/json',Cookie:'admin_token='+t};
const j=async p=>(await fetch('https://admin.ramz.tj/api/mobile'+p)).json();
const a1=(await j('/courses?targetLanguageId=cmppaul1k0001xrdbc2woi3fj&nativeLanguageId=cmpk1cr9o0000bo0h1mheyoad')).courses.find(c=>c.level==='A1');
const les=a1.modules.find(m=>m.order===1).lessons.find(l=>l.title==='Personal Information');
let R=await j('/lessons/'+les.id); const L=R.lesson||R;
// «Profession» бо «Job» ҳаммаъно буд — ба «Salary» иваз мешавад.
const rec=(L.words||[]).find(x=>(x.word||'').toLowerCase()==='profession');
if(!rec){console.log('ёфт нашуд');process.exit(0);}
const CDN='https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio@main/audio/en';
const res=await fetch('https://admin.ramz.tj/api/admin/words/'+rec.id,{method:'PUT',headers:H,body:JSON.stringify({
  word:'Salary',translation:'Маош',emoji:'💰',partOfSpeech:'noun',ipaTajik:'селерӣ',
  example:'My salary is good.',exampleTrans:'Маоши ман хуб аст.',ipa:'',audioUrl:`${CDN}/${rec.id}.mp3`})});
console.log(res.ok?'✓ Profession → Salary':'✗ '+res.status);
writeFileSync(new URL('./_a1-fix-salary.json',import.meta.url),JSON.stringify([{id:rec.id,word:'Salary'}],null,1));
