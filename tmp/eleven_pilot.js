// eleven_pilot.js — намунаи ElevenLabs: «Спасибо» бо Flash ва Multilingual v2
const https = require('https');
const fs = require('fs');
const path = require('path');
const { put } = require('@vercel/blob');

const env = {};
for (const line of fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
  if (m) env[m[1]] = m[2];
}
const ELEVEN_KEY = fs.readFileSync(path.join(__dirname, '.elevenkey'), 'utf8').trim();
const BLOB_TOKEN = env.BLOB_READ_WRITE_TOKEN;

function getJSON(p) {
  return new Promise((resolve, reject) => {
    https.get({ hostname: 'api.elevenlabs.io', path: p, headers: { 'xi-api-key': ELEVEN_KEY } }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch(e){ reject(new Error(d.slice(0,200))); } });
    }).on('error', reject);
  });
}

function tts(text, voiceId, modelId) {
  return new Promise((resolve, reject) => {
    const body = Buffer.from(JSON.stringify({ text, model_id: modelId }), 'utf8');
    const req = https.request({
      hostname: 'api.elevenlabs.io',
      path: '/v1/text-to-speech/' + voiceId,
      method: 'POST',
      headers: { 'xi-api-key': ELEVEN_KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg', 'Content-Length': body.length },
    }, res => {
      const chunks = []; res.on('data', c => chunks.push(c));
      res.on('end', () => { const buf = Buffer.concat(chunks);
        if (res.statusCode !== 200) return reject(new Error('EL ' + res.statusCode + ': ' + buf.toString('utf8').slice(0,300)));
        resolve(buf); });
    });
    req.on('error', reject); req.write(body); req.end();
  });
}

async function run() {
  console.log('🎙️  ElevenLabs pilot...\n');

  // Овозҳои тайёри ElevenLabs (ID-и устувор). Sarah — занонаи ором ва равшан.
  const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Sarah
  console.log('Овоз: Sarah (' + VOICE_ID + ')\n');

  for (const [label, model] of [['flash', 'eleven_flash_v2_5'], ['multi', 'eleven_multilingual_v2']]) {
    try {
      const mp3 = await tts('Спасибо', VOICE_ID, model);
      const blob = await put('audio/test/eleven-spasibo-' + label + '.mp3', mp3, {
        access: 'public', token: BLOB_TOKEN, contentType: 'audio/mpeg', allowOverwrite: true });
      console.log('✅ ' + model + ' (' + mp3.length + ' bytes)\n   ' + blob.url + '\n');
    } catch (e) {
      console.log('❌ ' + model + ': ' + e.message + '\n');
    }
  }
}
run().catch(e => { console.error('❌ ' + e.message); process.exit(1); });
