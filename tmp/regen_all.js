// regen_all.js — аудиоро аз нав месозад, ба диск захира мекунад, audioUrl → jsDelivr
const https = require('https');
const fs = require('fs');
const path = require('path');

const GH_USER = 'kholzoda2001-coder';
const REPO = 'ramz-audio';
const OUT = path.join(__dirname, 'audio_repo', 'audio');
const jsd = (lang, id) => `https://cdn.jsdelivr.net/gh/${GH_USER}/${REPO}@main/audio/${lang}/${id}.mp3`;

const OPENAI_KEY = fs.readFileSync(path.join(__dirname, '.ttskey'), 'utf8').trim();
const ELEVEN_KEY = fs.readFileSync(path.join(__dirname, '.elevenkey'), 'utf8').trim();
const ADMIN_KEY = 'fed7e7577c761a598966f5a3f04a5b36fb3cea6fb4b6aca9a002a75f47a7f574d5fe49645fd78b75b3e53ff1fad892ad';
const EL_VOICE = 'EXAVITQu4vr4xnSDxMaL'; // Sarah

function adminApi(method, p, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? Buffer.from(JSON.stringify(body), 'utf8') : null;
    const req = https.request({ hostname: 'admin.ramz.tj', path: p, method,
      headers: { 'x-admin-api-key': ADMIN_KEY, 'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': payload.length } : {}) } }, res => {
      let d = Buffer.alloc(0); res.on('data', c => d = Buffer.concat([d, c]));
      res.on('end', () => { try { resolve(JSON.parse(d.toString('utf8'))); } catch(e){ resolve(d.toString('utf8')); } });
    });
    req.on('error', reject); if (payload) req.write(payload); req.end();
  });
}
function openaiTTS(text) {
  return new Promise((resolve, reject) => {
    const body = Buffer.from(JSON.stringify({ model:'gpt-4o-mini-tts', voice:'nova', input:text, response_format:'mp3' }), 'utf8');
    const req = https.request({ hostname:'api.openai.com', path:'/v1/audio/speech', method:'POST',
      headers:{'Authorization':'Bearer '+OPENAI_KEY,'Content-Type':'application/json','Content-Length':body.length} }, res => {
      const c=[]; res.on('data',x=>c.push(x)); res.on('end',()=>{const b=Buffer.concat(c);
        if(res.statusCode!==200)return reject(new Error('OAI '+res.statusCode+':'+b.toString().slice(0,100))); resolve(b);}); });
    req.on('error',reject); req.write(body); req.end();
  });
}
function elevenTTS(text) {
  return new Promise((resolve, reject) => {
    const body = Buffer.from(JSON.stringify({ text, model_id:'eleven_multilingual_v2' }), 'utf8');
    const req = https.request({ hostname:'api.elevenlabs.io', path:'/v1/text-to-speech/'+EL_VOICE, method:'POST',
      headers:{'xi-api-key':ELEVEN_KEY,'Content-Type':'application/json','Accept':'audio/mpeg','Content-Length':body.length} }, res => {
      const c=[]; res.on('data',x=>c.push(x)); res.on('end',()=>{const b=Buffer.concat(c);
        if(res.statusCode!==200)return reject(new Error('EL '+res.statusCode+':'+b.toString().slice(0,100))); resolve(b);}); });
    req.on('error',reject); req.write(body); req.end();
  });
}

const enClean = t => (t||'').replace(/\([^)]*\)/g,' ').replace(/[→/]/g,', ').replace(/…/g,' ').replace(/\s+/g,' ').trim();
const ruClean = t => (t||'').replace(/\s*→\s*/g,', ').replace(/\s*\/\s*/g,', ').replace(/\s+/g,' ').trim();
const hanziOnly = t => { const m=(t||'').match(/[㐀-鿿　-〿＀-￯]/g); return m?m.join('').trim():''; };

const CONFIGS = [
  { lang:'en', course:'cmppavfld0003xrdbn6pjph8n', provider:'openai', clean:enClean },
  { lang:'ru', course:'cmq95o7ic0001qsy5l76202bw', provider:'eleven', clean:ruClean },
  { lang:'zh', course:'cmqdse32u0002p7emutt88ngv', provider:'eleven', clean:hanziOnly },
];

async function collectWords(course) {
  const out=[]; const mods=await adminApi('GET','/api/admin/modules?courseId='+course);
  for(const m of (mods.modules||mods)){ const les=await adminApi('GET','/api/admin/lessons?moduleId='+m.id);
    for(const l of (les.lessons||les)){ const w=await adminApi('GET','/api/admin/words?lessonId='+l.id);
      for(const x of (w.words||w)) out.push(x); } }
  return out;
}

async function doLang(cfg) {
  console.log('\n=== ' + cfg.lang.toUpperCase() + ' (' + cfg.provider + ') ===');
  const words = await collectWords(cfg.course);
  const targets = words.map(x=>({...x,_t:cfg.clean(x.word)})).filter(x=>x._t);
  console.log(targets.length + ' калима барои аудио');
  const dir = path.join(OUT, cfg.lang);
  const CONC = cfg.provider==='eleven'?2:4;
  const stats={ok:0,err:0}; let i=0,stop=false;
  async function worker(){ while(i<targets.length&&!stop){ const w=targets[i++];
    try{ const mp3 = cfg.provider==='openai'? await openaiTTS(w._t): await elevenTTS(w._t);
      fs.writeFileSync(path.join(dir, w.id+'.mp3'), mp3);
      await adminApi('PUT','/api/admin/words/'+w.id,{audioUrl:jsd(cfg.lang,w.id)});
      stats.ok++; if(stats.ok%50===0)console.log('  … '+stats.ok+'/'+targets.length);
    }catch(e){ stats.err++; if(/401|quota|credit|429/i.test(e.message)){console.log('  ⚠️ лимит: '+e.message);stop=true;} else console.log('  ❌ '+w._t.slice(0,12)+': '+e.message); } } }
  await Promise.all(Array.from({length:CONC},worker));
  console.log('  ✅ '+cfg.lang+': сохта '+stats.ok+' | хато '+stats.err+(stop?' | ҚАТЪ (лимит)':''));
}

async function run() {
  console.log('🔁 Аз нав сохтани аудио → диск + audioUrl(jsDelivr)');
  for(const cfg of CONFIGS) await doLang(cfg);
  console.log('\n✅ Тамом! Файлҳо дар tmp/audio_repo/. Акнун git push лозим.');
}
run().catch(e=>{console.error('❌ '+e.message);process.exit(1);});
