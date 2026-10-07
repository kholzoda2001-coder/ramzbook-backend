// Навиштани URL-и клипҳои АЗ НАВ сабтшудаи гуфтори русӣ (02.10.2026): баъди push-и ramz-audio.
//   node prisma/_ru-speaking-regen-apply.mjs
// Коммити HEAD-и ramz-audio-ро мехонад; ҳар файл: CDN 200 + md5 = маҳаллӣ → UPDATE (ҳатто агар майдон пур бошад).
import { readFileSync } from 'fs';
import { createHash } from 'crypto';
import { execSync } from 'child_process';
import { neon } from '@neondatabase/serverless';
const REPO='C:/Users/ASUS1/Desktop/RAMZ/ramz-audio';
const env = Object.fromEntries(readFileSync('C:/Users/ASUS1/Desktop/RAMZ/backend/.env','utf8').split('\n').filter(l=>l.includes('=')&&!l.trim().startsWith('#')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')]}));
const sql = neon(env.DATABASE_URL);
const SHA = execSync('git rev-parse HEAD',{cwd:REPO}).toString().trim();
const ahead = execSync('git rev-list --count origin/main..HEAD',{cwd:REPO}).toString().trim();
if (ahead!=='0') { console.log('⛔ коммит ҳанӯз push нашудааст (ahead '+ahead+') — аввал: git push origin HEAD'); process.exit(1); }
const KEYS = execSync(`git show --name-only --format= ${SHA}`,{cwd:REPO}).toString().split('\n').filter(l=>/^audio\/ru\/[^/]+\.mp3$/.test(l)).map(l=>l.slice(9,-4));
let n=0;
for (const k of KEYS) {
  const url=`https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio@${SHA}/audio/ru/${k}.mp3`;
  const r=await fetch(url); if(!r.ok){ console.log('⛔ CDN',r.status,k); process.exit(1); }
  const a=createHash('md5').update(Buffer.from(await r.arrayBuffer())).digest('hex');
  const b=createHash('md5').update(readFileSync(`${REPO}/audio/ru/${k}.mp3`)).digest('hex');
  if(a!==b){ console.log('⛔ md5',k); process.exit(1); }
  const col = k.endsWith('_cue') ? 'cueAudioUrl' : 'audioUrl'; const id=k.replace(/_cue$/,'');
  await sql.query(`UPDATE "SpeakingItem" SET "${col}"=$1 WHERE id=$2`,[url,id]);
  const [row]=await sql.query(`SELECT "${col}" u FROM "SpeakingItem" WHERE id=$1`,[id]); if(row?.u===url) n++;
}
await sql.query(`INSERT INTO "AppSetting" (key,"valueJson","updatedAt") VALUES ('content_version','"1"',NOW()) ON CONFLICT (key) DO UPDATE SET "updatedAt"=NOW()`);
console.log(`✅ ${n}/${KEYS.length} URL ба ${SHA.slice(0,8)} навишта шуд; content_version ламс шуд`);
