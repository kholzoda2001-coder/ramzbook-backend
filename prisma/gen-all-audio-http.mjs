import { neon } from '@neondatabase/serverless';
import { writeFileSync, existsSync, readFileSync } from 'fs';
import { execSync } from 'child_process';

// ─────────────────────────────────────────────────────────────────────────────
// Ҳамон кори `gen-all-audio.mjs` — TTS-и студиявӣ (OpenAI gpt-4o-mini-tts,
// овози "nova", айнан ҳамон ки дарсҳои A1 доранд) → файлҳо дар
// ramz-audio/audio/en/{id}.mp3 → push ба GitHub → jsDelivr → audioUrl дар база.
//
// ФАРҚ: қабати база тавассути драйвери HTTP-и Neon кор мекунад, на Prisma.
// Сабаб: дар ин шабака порти 5432 бурида мешавад (TCP пайваст мешавад, вале
// сӯҳбати Postgres анҷом намеёбад), ва илова бар он эндпоинти `-pooler` низ
// timeout медиҳад. Хости МУСТАҚИМ бо HTTPS бенуқсон кор мекунад.
//
// Resumable: файлҳои мавҷударо мегузарад, пас такрор кардан бехатар аст.
//
//   node prisma/gen-all-audio-http.mjs <роҳ ба ramz-audio/audio/en>
// ─────────────────────────────────────────────────────────────────────────────

const AUDIO_DIR = process.argv[2];
if (!AUDIO_DIR) throw new Error('Истифода: node gen-all-audio-http.mjs <ramz-audio/audio/en>');
const REPO = AUDIO_DIR.replace(/[\\/]audio[\\/]en$/, '');

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8');

let KEY = process.env.OPENAI_API_KEY;
if (!KEY) KEY = (env.match(/OPENAI_API_KEY\s*=\s*"?([^"\n\r]+)"?/) || [])[1];
if (!KEY) throw new Error('OPENAI_API_KEY нест (env ё .env)');

const raw = (env.match(/^\s*DATABASE_URL\s*=\s*"([^"]+)"/m) || [])[1];
if (!raw) throw new Error('DATABASE_URL дар .env ёфт нашуд');
const dbUrl = raw
  .replace('-pooler.', '.')
  .replace(/[?&](pgbouncer|connection_limit|pool_timeout|connect_timeout)=[^&]*/g, '');
const sql = neon(dbUrl);

const CDN = (id) => `https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio@main/audio/en/${id}.mp3`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Модел → ҷадвал. Дар схема `@@map` нест, пас ном = номи модел.
const TABLE = {
  word: 'Word',
  grammarExample: 'GrammarExample',
  dialogueLine: 'DialogueLine',
  comprehensionExercise: 'ComprehensionExercise',
};

async function tts(text) {
  for (let a = 0; a < 6; a++) {
    try {
      const res = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o-mini-tts',
          voice: 'nova',
          input: text,
          response_format: 'mp3',
        }),
      });
      if (res.status === 429 || res.status >= 500) {
        const body = await res.text();
        // 429 ДУ маънои тамоман гуногун дорад: «хеле зуд мефиристӣ»
        // (такрор кардан кӯмак мекунад) ва «пул тамом шуд» (такрор
        // БЕҲУДА аст). Дуюмро фавран мепартоем — вагарна скрипт 6 бор
        // такрор мекунад, `undefined` бармегардонад ва хатои
        // гумроҳкунандаи «data argument must be Buffer» медиҳад.
        // Маҳз ҳамин сабаби воқеиро пинҳон мекард.
        if (/insufficient_quota|credit_balance_exhausted|billing/i.test(body)) {
          throw new Error(`OPENAI_QUOTA: ${body.slice(0, 160)}`);
        }
        await sleep(3000 * (a + 1));
        continue;
      }
      if (!res.ok) throw new Error(`TTS ${res.status}: ${(await res.text()).slice(0, 120)}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (e) {
      if (String(e.message).startsWith('OPENAI_QUOTA')) throw e; // такрор бемаъно
      if (a === 5) throw e;
      await sleep(2000);
    }
  }
  // Ҳамаи кӯшишҳо бо `continue` тамом шуданд — БЕ ин сатр функсия
  // хомӯшона `undefined` бармегардонд.
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
  console.log(`Барои тавлид: ${valid.length} айтем ${JSON.stringify(byModel)}`);

  // ── Марҳилаи 1: TTS → mp3 (resumable, 4 паралел) ──
  let gen = 0, skip = 0, fail = 0;
  const done = [];
  // Агар кредит тамом шавад, ҲАМАИ дархостҳои боқимонда низ ноком
  // мешаванд — беҳуда 474 хатои якхела чоп кардан лозим нест.
  let quotaDead = null;
  await pool(valid, 4, async (it) => {
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
      if (msg.startsWith('OPENAI_QUOTA')) { quotaDead = msg; return; }
      fail++;
      console.log(`  ❌ ${it.id} (${it.model}): ${msg.slice(0, 80)}`);
    }
  });
  if (quotaDead) {
    console.log('\n🛑 ТАВАҚҚУФ: кредити OpenAI тамом шудааст.');
    console.log(`   ${quotaDead.replace('OPENAI_QUOTA: ', '').slice(0, 200)}`);
    console.log('   Пул илова кунед: https://platform.openai.com/settings/organization/billing');
    console.log(`   Тавлидшуда то ин лаҳза: ${gen} файл — онҳо нигоҳ дошта мешаванд.`);
    console.log('   Баъди пур кардани ҳисоб ҳамин фармонро такрор кунед — resumable аст.');
    if (gen === 0) process.exit(1); // чизе насохт → push/DB бемаъно
  }
  console.log(`Файлҳо: ${gen} нав, ${skip} мавҷуд, ${fail} ноком`);
  writeFileSync('tmp/audio-done.json', JSON.stringify(done));

  // ── Марҳилаи 2: commit + push ба репои аудио ──
  if (done.length) {
    console.log('git push ramz-audio...');
    try {
      execSync('git add audio/en', { cwd: REPO, stdio: 'inherit' });
      execSync(
        'git -c user.email="255218020+kholzoda2001-coder@users.noreply.github.com" '
        + '-c user.name="kholzoda2001-coder" commit -m "Add English studio audio (nova) — A1/A2/B1"',
        { cwd: REPO, stdio: 'inherit' },
      );
      execSync('git push origin HEAD', { cwd: REPO, stdio: 'inherit' });
      console.log('✅ push шуд');
    } catch (e) { console.log('⚠️ git:', (e.message || '').slice(0, 150)); }
  }

  // ── Марҳилаи 3: audioUrl дар база ──
  //
  // Як дархост барои ҳар ҷадвал бо `= ANY($1)` — на 474 дархости алоҳида.
  // Драйвери HTTP ҳар дархостро ҷудо мефиристад, пас кам будани онҳо муҳим.
  console.log('DB навсозӣ...');
  let upd = 0;
  for (const [model, table] of Object.entries(TABLE)) {
    const ids = done.filter((it) => it.model === model).map((it) => it.id);
    if (!ids.length) continue;
    // Дар як дархост: ҳар сатр URL-и худро аз рӯи id мегирад.
    const urls = ids.map((id) => CDN(id));
    for (let i = 0; i < ids.length; i += 200) {
      const idChunk = ids.slice(i, i + 200);
      const urlChunk = urls.slice(i, i + 200);
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

  // Барномаҳо кэши мазмунро аз рӯи ҳамин рақам нав мекунанд — бе ин
  // хонандагон то тамом шудани TTL аудиои навро намебинанд.
  try {
    await sql.query(
      `UPDATE "AppSetting" SET "valueJson" = $1 WHERE key = $2`,
      [JSON.stringify(String(Date.now())), 'content_version'],
    );
    console.log('✅ content_version нав шуд');
  } catch (e) { console.log('⚠️ content_version:', (e.message || '').slice(0, 90)); }

  console.log(`✅ ТАМОМ: ${gen} тавлид, ${upd} дар база навсозӣ шуд.`);
}

main().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
