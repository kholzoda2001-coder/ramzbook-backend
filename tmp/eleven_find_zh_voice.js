// eleven_find_zh_voice.js — овози аслии хитоиро аз китобхона меёбад, илова ва месанҷад
const https = require('https');
const fs = require('fs');
const path = require('path');
const { put } = require('@vercel/blob');

const env = {};
for (const line of fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
  if (m) env[m[1]] = m[2];
}
const KEY = fs.readFileSync(path.join(__dirname, '.elevenkey'), 'utf8').trim();
const BLOB = env.BLOB_READ_WRITE_TOKEN;

function req(method, p, body, raw) {
  return new Promise((resolve, reject) => {
    const payload = body ? Buffer.from(JSON.stringify(body), 'utf8') : null;
    const r = https.request({ hostname: 'api.elevenlabs.io', path: p, method,
      headers: { 'xi-api-key': KEY, ...(payload ? { 'Content-Type': 'application/json', 'Content-Length': payload.length } : {}),
        ...(raw ? { 'Accept': 'audio/mpeg' } : {}) } }, res => {
      const chunks = []; res.on('data', c => chunks.push(c));
      res.on('end', () => { const buf = Buffer.concat(chunks);
        if (res.statusCode >= 300) return reject(new Error(method + ' ' + p + ' → ' + res.statusCode + ': ' + buf.toString('utf8').slice(0,200)));
        resolve(raw ? buf : JSON.parse(buf.toString('utf8'))); });
    });
    r.on('error', reject); if (payload) r.write(payload); r.end();
  });
}

async function run() {
  console.log('🔎 Ҷустуҷӯи овозҳои хитоӣ дар китобхона...\n');
  let data;
  try {
    data = await req('GET', '/v1/shared-voices?page_size=30&language=zh&gender=female');
  } catch (e) {
    console.log('⚠️ бо филтр нашуд (' + e.message + '), бе филтр кӯшиш...');
    data = await req('GET', '/v1/shared-voices?page_size=100');
  }
  let voices = (data.voices || []).filter(v =>
    /zh|chinese|mandarin/i.test((v.language || '') + ' ' + (v.accent || '') + ' ' + (v.name || '') + ' ' + JSON.stringify(v.verified_languages || [])));
  if (!voices.length) voices = data.voices || [];
  // занонаро авлавият медиҳем, баъд аз рӯи маъруфият
  voices.sort((a, b) => (b.cloned_by_count || b.usage_character_count_1y || 0) - (a.cloned_by_count || a.usage_character_count_1y || 0));
  console.log('Топ овозҳои хитоӣ:');
  for (const v of voices.slice(0, 6)) {
    console.log('  • ' + v.name + ' | lang:' + (v.language||'-') + ' | accent:' + (v.accent||'-') + ' | id:' + v.voice_id + ' | owner:' + (v.public_owner_id||v.owner_id||'-'));
  }
  const pick = voices.find(v => /female/i.test(v.gender||'')) || voices[0];
  if (!pick) { console.log('❌ Овози хитоӣ ёфт нашуд'); return; }
  console.log('\n✅ Интихоб: ' + pick.name + ' (' + pick.voice_id + ')');

  // илова кардан ба ҳисоб
  let useId = pick.voice_id;
  const owner = pick.public_owner_id || pick.owner_id;
  try {
    const added = await req('POST', '/v1/voices/add/' + owner + '/' + pick.voice_id, { new_name: 'ZH-' + (pick.name||'voice') });
    useId = added.voice_id || useId;
    console.log('✅ Илова шуд, voice_id-и нав: ' + useId);
  } catch (e) {
    console.log('⚠️ Илова нашуд (' + e.message + ') — кӯшиши истифодаи мустақим...');
  }

  // тест: 你好
  const body = Buffer.from(JSON.stringify({ text: '你好', model_id: 'eleven_multilingual_v2' }), 'utf8');
  const mp3 = await req('POST', '/v1/text-to-speech/' + useId, { text: '你好', model_id: 'eleven_multilingual_v2' }, true);
  const blob = await put('audio/test/zh-native-nihao.mp3', mp3, { access: 'public', token: BLOB, contentType: 'audio/mpeg', allowOverwrite: true });
  console.log('\n🔊 Намуна (你好) бо овози хитоӣ:\n   ' + blob.url);
  console.log('\n👉 VOICE_ID барои истифода: ' + useId);
  fs.writeFileSync(path.join(__dirname, '.zhvoice'), useId);
}
run().catch(e => { console.error('❌ ' + e.message); process.exit(1); });
