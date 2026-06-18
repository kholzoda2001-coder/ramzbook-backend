// eleven_russian_all.js — ҳамаи калимаҳои русиро бо ElevenLabs аз нав месозад
// Овоз: Sarah | Модел: Multilingual v2 (агар ба квотаи ройгон ҷой шавад), вагарна Flash
const https = require('https');
const fs = require('fs');
const path = require('path');
const { put } = require('@vercel/blob');

const COURSE_ID = 'cmq95o7ic0001qsy5l76202bw';
const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Sarah — касбӣ, ором, равшан
const FREE_BUDGET = 9700; // эҳтиёти квотаи ройгон (10,000)
const CONCURRENCY = 2;    // ройгон → 2 дархости ҳамзамон

const env = {};
for (const line of fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
  if (m) env[m[1]] = m[2];
}
const ELEVEN_KEY = fs.readFileSync(path.join(__dirname, '.elevenkey'), 'utf8').trim();
const BLOB_TOKEN = env.BLOB_READ_WRITE_TOKEN;
const ADMIN_KEY = 'fed7e7577c761a598966f5a3f04a5b36fb3cea6fb4b6aca9a002a75f47a7f574d5fe49645fd78b75b3e53ff1fad892ad';

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

function tts(text, model) {
  return new Promise((resolve, reject) => {
    const body = Buffer.from(JSON.stringify({ text, model_id: model }), 'utf8');
    const req = https.request({ hostname: 'api.elevenlabs.io', path: '/v1/text-to-speech/' + VOICE_ID,
      method: 'POST', headers: { 'xi-api-key': ELEVEN_KEY, 'Content-Type': 'application/json',
        'Accept': 'audio/mpeg', 'Content-Length': body.length } }, res => {
      const chunks = []; res.on('data', c => chunks.push(c));
      res.on('end', () => { const buf = Buffer.concat(chunks);
        if (res.statusCode !== 200) return reject(new Error('EL ' + res.statusCode + ': ' + buf.toString('utf8').slice(0,150)));
        resolve(buf); });
    });
    req.on('error', reject); req.write(body); req.end();
  });
}

const clean = t => (t || '').replace(/\s*→\s*/g, ', ').replace(/\s*\/\s*/g, ', ').replace(/\s+/g, ' ').trim();

async function collectWords() {
  const out = [];
  const mods = await adminApi('GET', '/api/admin/modules?courseId=' + COURSE_ID);
  for (const m of (mods.modules || mods)) {
    const les = await adminApi('GET', '/api/admin/lessons?moduleId=' + m.id);
    for (const l of (les.lessons || les)) {
      const w = await adminApi('GET', '/api/admin/words?lessonId=' + l.id);
      for (const x of (w.words || w)) out.push(x);
    }
  }
  return out;
}

async function run() {
  console.log('🇷🇺 ElevenLabs барои курси русӣ (овоз: Sarah)\n');
  const words = await collectWords();
  const totalChars = words.reduce((s, x) => s + clean(x.word).length, 0);
  const MODEL = totalChars <= FREE_BUDGET ? 'eleven_multilingual_v2' : 'eleven_flash_v2_5';
  console.log('📋 ' + words.length + ' калима, ~' + totalChars + ' ҳарф');
  console.log('🎚️  Модел: ' + MODEL + (MODEL.includes('flash') ? ' (барои ҷой шудан ба ройгон)' : ' (сифати олӣ)') + '\n');

  const stats = { ok: 0, err: 0, skip: 0 };
  let i = 0, stop = false;
  async function worker() {
    while (i < words.length && !stop) {
      const word = words[i++];
      const text = clean(word.word);
      if (!text) { stats.skip++; continue; }
      try {
        const mp3 = await tts(text, MODEL);
        const blob = await put('audio/ru/' + word.id + '.mp3', mp3, {
          access: 'public', token: BLOB_TOKEN, contentType: 'audio/mpeg', allowOverwrite: true });
        await adminApi('PUT', '/api/admin/words/' + word.id, { audioUrl: blob.url });
        stats.ok++;
        if (stats.ok % 25 === 0) console.log('  … ' + stats.ok + '/' + words.length);
      } catch (e) {
        stats.err++;
        if (/401|quota|credit|429/i.test(e.message)) {
          console.log('  ⚠️ Квота/маҳдудият: ' + e.message);
          stop = true; // эҳтимол квота тамом шуд
        } else {
          console.log('  ❌ "' + text.slice(0,15) + '": ' + e.message);
        }
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  console.log('\n' + (stop ? '⏸️ Қатъ шуд (эҳтимол квота)' : '✅ Тамом!'));
  console.log('   Сохта шуд: ' + stats.ok + ' / ' + words.length);
  console.log('   Хато: ' + stats.err + ' | Партофта: ' + stats.skip);
}
run().catch(e => { console.error('❌ ' + e.message); process.exit(1); });
