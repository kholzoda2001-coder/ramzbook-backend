import {SignJWT} from 'jose';
import {readFileSync,writeFileSync} from 'fs';
const env=Object.fromEntries(readFileSync('.env','utf8').split('\n').filter(l=>l.includes('=')&&!l.trim().startsWith('#')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const t=await new SignJWT({username:'admin',role:'admin'}).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('2h').sign(new TextEncoder().encode(env.JWT_SECRET));
const H={'Content-Type':'application/json',Cookie:'admin_token='+t};
const j=async p=>(await fetch('https://admin.ramz.tj/api/mobile'+p)).json();
const a1=(await j('/courses?targetLanguageId=cmppaul1k0001xrdbc2woi3fj&nativeLanguageId=cmpk1cr9o0000bo0h1mheyoad')).courses.find(c=>c.level==='A1');
const les=a1.modules.find(m=>m.order===1).lessons.find(l=>l.title==='Personal Information');
let R=await j('/lessons/'+les.id); const L=R.lesson||R;
// [кӯҳна] → [нав, тарҷума, эмоҷӣ, hissa, ipaTajik, мисол, тарҷума]
const FIX=[
 ['Name',    ['Full name','Ному насаб','🪪','noun','фул нейм','Write your full name.','Ному насабатонро нависед.']],
 ['Phone',   ['Passport','Шиноснома','📕','noun','паспорт','Show me your passport.','Шиносномаатонро нишон диҳед.']],
 ['Work',    ['Profession','Касб','🧑‍💼','noun','профешн','What is your profession?','Касби шумо чист?']],
 ['Doctor',  ['Company','Ширкат','🏢','noun','компанӣ','I work in a big company.','Ман дар ширкати калон кор мекунам.']],
 ['Teacher', ['Manager','Мудир','🧑‍💻','noun','менеҷер','He is a manager.','Вай мудир аст.']],
 ['Cook',    ['Builder','Бинокор','👷‍♂','noun','билдер','My brother is a builder.','Бародари ман бинокор аст.']],
 ['Nurse',   ['Seller','Фурӯшанда','🧑‍🌾','noun','селер','She is a seller.','Вай фурӯшанда аст.']],
];
const made=[];
for(const [old,[w,tr,emoji,pos,ipaTj,ex,exTr]] of FIX){
  const rec=(L.words||[]).find(x=>(x.word||'').toLowerCase()===old.toLowerCase());
  if(!rec){console.log('✗ '+old+' ёфт нашуд');continue;}
  const res=await fetch('https://admin.ramz.tj/api/admin/words/'+rec.id,{method:'PUT',headers:H,
    body:JSON.stringify({word:w,translation:tr,emoji,partOfSpeech:pos,ipaTajik:ipaTj,example:ex,exampleTrans:exTr,ipa:'',audioUrl:''})});
  if(res.ok){made.push({id:rec.id,word:w});console.log(`  ✓ ${old} → ${w}`);}
  else console.log(`  ✗ ${old}: ${res.status}`);
}
writeFileSync('prisma/_a1-fix7.json',JSON.stringify(made,null,1));
