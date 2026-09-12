// Аудио барои кортҳои бе овози Модули 10.
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs';
import { execFileSync } from 'child_process';
import { neon } from '@neondatabase/serverless';
const env = Object.fromEntries(readFileSync(new URL('../.env', import.meta.url),'utf8')
  .split('\n').filter((l)=>l.includes('=')&&!l.trim().startsWith('#'))
  .map((l)=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const sql = neon(env.DATABASE_URL);
const VOICE='ar-SA-ZariyahNeural', WORK='tmp/ar-m9-audio';
const REPO=`${process.env.TEMP}/ramz-audio-audio`.split(String.fromCharCode(92)).join('/');
const CDN='https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio';
const [c] = await sql.query(`SELECT c.id FROM "Course" c
  JOIN "Language" t ON t.id=c."targetLanguageId"
  JOIN "Language" n ON n.id=c."nativeLanguageId"
 WHERE t.code='ar' AND n.code='tg' AND c.level='A1'`);
const [m] = await sql.query(`SELECT id FROM "Module" WHERE "courseId"=$1 AND "order"=9`,[c.id]);
const ls = (await sql.query(`SELECT id FROM "Lesson" WHERE "moduleId"=$1 AND "isActive"`,[m.id])).map(x=>x.id);
const items = (await sql.query(
  `SELECT id, word AS txt FROM "Word" WHERE "lessonId"=ANY($1) AND ("audioUrl" IS NULL OR "audioUrl"='')`,[ls]))
  .map(r=>({...r, table:'Word'}));
console.log(`корти бе аудио: ${items.length}`);
for (const it of items) console.log('  '+it.txt);
if (!items.length) { console.log('Ҳама чиз аудио дорад.'); process.exit(0); }
if (process.argv.includes('--dry')) process.exit(0);
mkdirSync(WORK,{recursive:true});
writeFileSync(`${WORK}/items.json`, JSON.stringify(items.map(i=>({id:i.id,text:i.txt})),null,1));
console.log(execFileSync('python',['prisma/_ar-tts.py',WORK,`${WORK}/items.json`,VOICE],
  {encoding:'utf8',env:{...process.env,PYTHONUTF8:'1'}}).trim().split('\n').slice(-2).join('\n'));
const git=(a,cwd=REPO)=>execFileSync('git',a,{cwd,encoding:'utf8'}).trim();
let ok = existsSync(`${REPO}/.git/HEAD`) && existsSync(`${REPO}/.git/config`);
if (ok) { try { git(['rev-parse','--is-inside-work-tree']); } catch { ok=false; } }
if (!ok) {
  if (existsSync(REPO)) execFileSync('cmd',['/c','rmdir','/s','/q',REPO.split('/').join(String.fromCharCode(92))]);
  execFileSync('git',['clone','--depth','1','--filter=blob:none','--no-checkout',
    'https://github.com/kholzoda2001-coder/ramz-audio',REPO],{encoding:'utf8'});
  git(['sparse-checkout','set','audio/ar']); git(['checkout','main']);
} else { git(['fetch','--depth','1','origin','main']); git(['reset','--hard','origin/main']); }
for (const it of items) copyFileSync(`${WORK}/${it.id}.mp3`, `${REPO}/audio/ar/${it.id}.mp3`);
git(['add','audio/ar']);
if (git(['status','--porcelain']).trim()) {
  git(['-c','user.name=RAMZ Content','-c','user.email=help@ramz.tj','commit','-m',
    'Arabic A1 Module 10: audio for the relocated word سَيِّئ']);
  git(['push','origin','main']); console.log('push шуд');
}
const sha = git(['rev-parse','HEAD']);
for (const it of items) await sql.query(`UPDATE "Word" SET "audioUrl"=$1 WHERE id=$2`,
  [`${CDN}@${sha}/audio/ar/${it.id}.mp3`, it.id]);
console.log(`✓ ${items.length} истинод сабт шуд · ${sha.slice(0,7)}`);
