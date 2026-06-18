// tts_russian_all.js — барои ҳамаи калимаҳои курси русӣ аудиои табиӣ (nova)
// OpenAI gpt-4o-mini-tts → Vercel Blob → PUT audioUrl
const https = require('https');
const fs = require('fs');
const path = require('path');
const { put } = require('@vercel/blob');

const COURSE_ID = 'cmq95o7ic0001qsy5l76202bw';
const VOICE = 'nova';
const MODEL = 'gpt-4o-mini-tts';
const CONCURRENCY = 4;

// .env + калиди коршоянда
const env = {};
for (const line of fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
  if (m) env[m[1]] = m[2];
}
const OPENAI_KEY = fs.readFileSync(path.join(__dirname, '.ttskey'), 'utf8').trim();
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

function tts(text) {
  return new Promise((resolve, reject) => {
    const body = Buffer.from(JSON.stringify({ model: MODEL, voice: VOICE, input: text, response_format: 'mp3' }), 'utf8');
    const req = https.request({ hostname: 'api.openai.com', path: '/v1/audio/speech', method: 'POST',
      headers: { 'Authorization': 'Bearer ' + OPENAI_KEY, 'Content-Type': 'application/json', 'Content-Length': body.length } }, res => {
      const chunks = []; res.on('data', c => chunks.push(c));
      res.on('end', () => { const buf = Buffer.concat(chunks);
        if (res.statusCode !== 200) return reject(new Error('OpenAI ' + res.statusCode + ': ' + buf.toString('utf8').slice(0, 200)));
        resolve(buf); });
    });
    req.on('error', reject); req.write(body); req.end();
  });
}

// Матни хониш: «→» ва «/»-ро ба фосила/вергул табдил медиҳем, то табиӣ хонад
function clean(t) {
  return t.replace(/\s*→\s*/g, ', ').replace(/\s*\/\s*/g, ', ').replace(/\s+/g, ' ').trim();
}

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

async function processOne(word, idx, total, stats) {
  const text = clean(word.word || '');
  if (!text) { stats.skip++; return; }
  if (word.audioUrl && word.audioUrl.includes('blob.vercel-storage.com')) { stats.have++; return; }
  try {
    const mp3 = await tts(text);
    const blob = await put('audio/ru/' + word.id + '.mp3', mp3, {
      access: 'public', token: BLOB_TOKEN, contentType: 'audio/mpeg', allowOverwrite: true });
    const r = await adminApi('PUT', '/api/admin/words/' + word.id, { audioUrl: blob.url });
    if (r.success || r.word) { stats.ok++; }
    else { stats.err++; console.log('  ⚠️ PUT: ' + JSON.stringify(r).slice(0,120)); }
    if (stats.ok % 25 === 0) console.log('  … ' + (stats.ok) + '/' + total + ' тайёр');
  } catch (e) {
    stats.err++;
    console.log('  ❌ "' + text.slice(0,20) + '": ' + e.message);
  }
}

async function run() {
  console.log('🎙️  Аудиои табиӣ барои курси русӣ (овоз: ' + VOICE + ')\n');
  const words = await collectWords();
  console.log('📋 Ҳамагӣ ' + words.length + ' калима ёфт шуд. Оғоз...\n');

  const stats = { ok: 0, err: 0, skip: 0, have: 0 };
  let i = 0;
  async function worker() {
    while (i < words.length) { const idx = i++; await processOne(words[idx], idx, words.length, stats); }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  console.log('\n✅ Тамом!');
  console.log('   Аудио сохта шуд: ' + stats.ok);
  console.log('   Аллакай дошт:    ' + stats.have);
  console.log('   Холӣ (партофта): ' + stats.skip);
  console.log('   Хато:            ' + stats.err);
}
run().catch(e => { console.error('❌ ' + e.message); process.exit(1); });
