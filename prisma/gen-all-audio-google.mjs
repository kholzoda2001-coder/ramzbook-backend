import { neon } from '@neondatabase/serverless';
import { writeFileSync, existsSync, readFileSync } from 'fs';
import { execSync } from 'child_process';

// ─────────────────────────────────────────────────────────────────────────────
// Тавлиди аудио бо Google Cloud Text-to-Speech.
//
// Фарқ аз `gen-all-audio-http.mjs`: он OpenAI-ро истифода мебарад (овози
// `nova` — ҳамон ки A1 ва A2 доранд), ин Google-ро (`en-US-Neural2-F`).
// Сабаб: кредити OpenAI тамом шуд, ва лимити ройгони Google барои ҳаҷми мо
// 200 баробар зиёд аст.
//
// ЧАРО Neural2-F, на Studio ё Chirp3-HD:
//  • 92% -и мазмун калимаи АЛОҲИДА аст, на ҷумла. Овозҳои `Studio` барои
//    матни дароз сохта шудаанд ва ба калимаи танҳо оҳанги аҷиб медиҳанд;
//  • барои навомӯз РАВШАНӢ аз «табиӣ» муҳимтар аст — `Chirp3-HD` садоҳоро
//    мепайвандад, ки такрор карданро душвор мекунад;
//  • `Neural2` калонтарин лимити ройгонро дорад;
//  • занона аст — ҳамчун `nova`, пас фарқи байни сатҳҳо камтарин мешавад.
//
// База тавассути HTTP-и Neon кор мекунад: дар ин шабака порти 5432 бурида
// мешавад ва эндпоинти `-pooler` timeout медиҳад.
//
//   node prisma/gen-all-audio-google.mjs <роҳ ба ramz-audio/audio/en>
// ─────────────────────────────────────────────────────────────────────────────

const AUDIO_DIR = process.argv[2];
if (!AUDIO_DIR) throw new Error('Истифода: node gen-all-audio-google.mjs <ramz-audio/audio/en>');
const REPO = AUDIO_DIR.replace(/[\\/]audio[\\/]en$/, '');

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8');

const KEY = process.env.GOOGLE_TTS_KEY
  || (env.match(/GOOGLE_TTS_KEY\s*=\s*"?([^"\n\r]+)"?/) || [])[1];
if (!KEY) throw new Error('GOOGLE_TTS_KEY нест (env ё .env)');

const raw = (env.match(/^\s*DATABASE_URL\s*=\s*"([^"]+)"/m) || [])[1];
if (!raw) throw new Error('DATABASE_URL дар .env ёфт нашуд');
const sql = neon(raw
  .replace('-pooler.', '.')
  .replace(/[?&](pgbouncer|connection_limit|pool_timeout|connect_timeout)=[^&]*/g, ''));

const VOICE = 'en-US-Neural2-F';
const CDN = (id) => `https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio@main/audio/en/${id}.mp3`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const TABLE = {
  word: 'Word',
  grammarExample: 'GrammarExample',
  dialogueLine: 'DialogueLine',
  comprehensionExercise: 'ComprehensionExercise',
};

async function tts(text) {
  for (let a = 0; a < 6; a++) {
    try {
      const res = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: { text },
            voice: { languageCode: 'en-US', name: VOICE },
            // `MP3` бо суръати оддӣ — ҳамон формате, ки файлҳои мавҷуда доранд,
            // пас плеери барнома ягон тағйир намехоҳад.
            audioConfig: { audioEncoding: 'MP3' },
          }),
        },
      );
      if (res.status === 429 || res.status >= 500) {
        const body = await res.text();
        // Лимити ройгон тамом шуд — такрор БЕҲУДА аст. Бе ин санҷиш скрипт
        // 6 бор такрор мекунад, `undefined` бармегардонад ва хатои
        // гумроҳкунандаи «data argument must be Buffer» медиҳад.
        if (/quota|billing|exceeded/i.test(body)) {
          throw new Error(`GOOGLE_QUOTA: ${body.slice(0, 200)}`);
        }
        await sleep(2000 * (a + 1));
        continue;
      }
      if (!res.ok) throw new Error(`TTS ${res.status}: ${(await res.text()).slice(0, 140)}`);
      const { audioContent } = await res.json();
      if (!audioContent) throw new Error('ҷавоб бе audioContent');
      return Buffer.from(audioContent, 'base64');
    } catch (e) {
      if (String(e.message).startsWith('GOOGLE_QUOTA')) throw e;
      if (a === 5) throw e;
      await sleep(1500);
    }
  }
  throw new Error('TTS: ҳамаи кӯшишҳо ноком (429/5xx)');
}

async function pool(list, n, worker) {
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (i < list.length) { const idx = i++; await worker(list[idx]); }
  }));
}

async function main() {
  if (!existsSync('tmp/audio-items.json')) {
    throw new Error('tmp/audio-items.json нест — аввал gen-audio-fetch-http.mjs');
  }
  const valid = JSON.parse(readFileSync('tmp/audio-items.json', 'utf8'))
    .filter((it) => (it.text || '').trim().length > 0);
  const byModel = valid.reduce((a, it) => ((a[it.model] = (a[it.model] || 0) + 1), a), {});
  console.log(`Барои тавлид: ${valid.length} айтем ${JSON.stringify(byModel)} · овоз: ${VOICE}`);

  let gen = 0, skip = 0, fail = 0;
  const done = [];
  let quotaDead = null;
  // 6 паралел: Google лимити дархост дар як сония дорад, ва 6 бехатар аст.
  await pool(valid, 6, async (it) => {
    if (quotaDead) return;
    const path = `${AUDIO_DIR}/${it.id}.mp3`;
    if (existsSync(path)) { skip++; done.push(it); return; }
    try {
      const buf = await tts(it.text.trim());
      writeFileSync(path, buf);
      gen++; done.push(it);
      if (gen % 50 === 0) console.log(`  ...тавлид ${gen}/${valid.length}`);
    } catch (e) {
      const msg = e.message || '';
      if (msg.startsWith('GOOGLE_QUOTA')) { quotaDead = msg; return; }
      fail++;
      console.log(`  ❌ ${it.id} (${it.model}): ${msg.slice(0, 90)}`);
    }
  });

  if (quotaDead) {
    console.log('\n🛑 ТАВАҚҚУФ: лимити Google тамом шудааст.');
    console.log(`   ${quotaDead.replace('GOOGLE_QUOTA: ', '').slice(0, 200)}`);
    console.log(`   Тавлидшуда: ${gen} файл — нигоҳ дошта мешаванд, такрор resumable аст.`);
    if (gen === 0) process.exit(1);
  }
  console.log(`Файлҳо: ${gen} нав, ${skip} мавҷуд, ${fail} ноком`);
  writeFileSync('tmp/audio-done.json', JSON.stringify(done));

  if (gen > 0) {
    console.log('git push ramz-audio...');
    try {
      execSync('git add audio/en', { cwd: REPO, stdio: 'inherit' });
      execSync(
        'git -c user.email="255218020+kholzoda2001-coder@users.noreply.github.com" '
        + `-c user.name="kholzoda2001-coder" commit -m "Add B1 English audio (Google ${VOICE})"`,
        { cwd: REPO, stdio: 'inherit' },
      );
      execSync('git push origin HEAD', { cwd: REPO, stdio: 'inherit' });
      console.log('✅ push шуд');
    } catch (e) { console.log('⚠️ git:', (e.message || '').slice(0, 150)); }
  }

  console.log('DB навсозӣ...');
  let upd = 0;
  for (const [model, table] of Object.entries(TABLE)) {
    const ids = done.filter((it) => it.model === model).map((it) => it.id);
    if (!ids.length) continue;
    for (let i = 0; i < ids.length; i += 200) {
      const idChunk = ids.slice(i, i + 200);
      const urlChunk = idChunk.map((id) => CDN(id));
      try {
        await sql.query(
          `UPDATE "${table}" AS t SET "audioUrl" = v.url
             FROM (SELECT UNNEST($1::text[]) AS id, UNNEST($2::text[]) AS url) AS v
            WHERE t.id = v.id`,
          [idChunk, urlChunk],
        );
        upd += idChunk.length;
        console.log(`  ...${table}: ${upd}`);
      } catch (e) { console.log(`  ⚠️ ${table} @${i}: ${(e.message || '').slice(0, 90)}`); }
    }
  }

  // Барномаҳо кэши мазмунро аз рӯи `updatedAt`-и ҳамин сатр нав мекунанд —
  // бе ин хонандагон аудиои навро то тамом шудани TTL намебинанд.
  try {
    await sql.query(
      `UPDATE "AppSetting" SET "valueJson" = $1, "updatedAt" = NOW() WHERE key = $2`,
      [JSON.stringify(String(Date.now())), 'content_version'],
    );
    console.log('✅ content_version нав шуд');
  } catch (e) { console.log('⚠️ content_version:', (e.message || '').slice(0, 90)); }

  console.log(`\n✅ ТАМОМ: ${gen} тавлид, ${upd} дар база навсозӣ шуд.`);
}

main().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
