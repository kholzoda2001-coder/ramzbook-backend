// tts_pilot.js — исботи занҷир: OpenAI TTS → Vercel Blob → URL
const https = require('https');
const fs = require('fs');
const path = require('path');

// .env-ро дастӣ мехонем
const env = {};
for (const line of fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
  if (m) env[m[1]] = m[2];
}
// Калиди коршоянда аз DB (admin → AI settings) дар tmp/.ttskey; вагарна .env
let OPENAI_KEY = env.OPENAI_API_KEY;
try { OPENAI_KEY = fs.readFileSync(path.join(__dirname, '.ttskey'), 'utf8').trim() || OPENAI_KEY; } catch (_) {}
const BLOB_TOKEN = env.BLOB_READ_WRITE_TOKEN;

function openaiTTS(text, { model = 'gpt-4o-mini-tts', voice = 'nova' } = {}) {
  return new Promise((resolve, reject) => {
    const body = Buffer.from(JSON.stringify({
      model, voice, input: text, response_format: 'mp3',
    }), 'utf8');
    const req = https.request({
      hostname: 'api.openai.com', path: '/v1/audio/speech', method: 'POST',
      headers: { 'Authorization': 'Bearer ' + OPENAI_KEY, 'Content-Type': 'application/json', 'Content-Length': body.length },
    }, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        if (res.statusCode !== 200) return reject(new Error('OpenAI ' + res.statusCode + ': ' + buf.toString('utf8').slice(0, 300)));
        resolve(buf);
      });
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

async function run() {
  console.log('🎙️  OpenAI TTS pilot...');
  let mp3;
  try {
    mp3 = await openaiTTS('Спасибо', { model: 'gpt-4o-mini-tts', voice: 'nova' });
    console.log('   ✅ gpt-4o-mini-tts → ' + mp3.length + ' bytes MP3');
  } catch (e) {
    console.log('   ⚠️  gpt-4o-mini-tts нашуд: ' + e.message);
    console.log('   ↩️  кӯшиши tts-1-hd...');
    mp3 = await openaiTTS('Спасибо', { model: 'tts-1-hd', voice: 'nova' });
    console.log('   ✅ tts-1-hd → ' + mp3.length + ' bytes MP3');
  }

  // Ба Vercel Blob бор мекунем
  const { put } = require('@vercel/blob');
  const res = await put('audio/ru/pilot-spasibo.mp3', mp3, {
    access: 'public', token: BLOB_TOKEN, contentType: 'audio/mpeg',
    allowOverwrite: true,
  });
  console.log('   ✅ Blob URL: ' + res.url);

  // URL-ро санҷем (HTTP 200 + content-type)
  await new Promise((resolve) => {
    https.get(res.url, r => {
      console.log('   ✅ HTTP ' + r.statusCode + ' | ' + r.headers['content-type'] + ' | ' + r.headers['content-length'] + ' bytes');
      r.destroy(); resolve();
    });
  });
  console.log('\n🔗 Гӯш кунед: ' + res.url);
}
run().catch(e => { console.error('❌ ' + e.message); process.exit(1); });
