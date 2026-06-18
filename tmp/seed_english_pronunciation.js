// seed_english_pronunciation.js — такмили талаффузи махсус барои тоҷикзабонҳо
// Модули M0 «Алифбо ва садоҳо»-и англисии A1.
const https = require('https');
const KEY = 'fed7e7577c761a598966f5a3f04a5b36fb3cea6fb4b6aca9a002a75f47a7f574d5fe49645fd78b75b3e53ff1fad892ad';
const MODULE_ID = 'cmptzxogo006srklmcgh01xw1'; // M0 Алифбо ва садоҳо
const TH_LESSON = 'cmq9n9brc002zwxy8mikx4okb'; // дарси мавҷудаи «Талаффуз: th, w ва v»

function api(method, p, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? Buffer.from(JSON.stringify(body), 'utf8') : null;
    const req = https.request({ hostname: 'admin.ramz.tj', path: p, method,
      headers: { 'x-admin-api-key': KEY, 'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': payload.length } : {}) } }, res => {
      let d = Buffer.alloc(0); res.on('data', c => d = Buffer.concat([d, c]));
      res.on('end', () => { try { resolve(JSON.parse(d.toString('utf8'))); } catch(e){ resolve(d.toString('utf8')); } });
    });
    req.on('error', reject); if (payload) req.write(payload); req.end();
  });
}

// Дарси 1 — th, w, v (бо ҷуфтҳои минималӣ)
const TH_WORDS = [
  { w:'think', t:'фикр кардан', e:'🤔', ipa:'/θɪŋk/', ex:'think ≠ sink', exT:'th: забон байни дандонҳо (на «с»)' },
  { w:'three', t:'се', e:'3️⃣', ipa:'/θriː/', ex:'three trees', exT:'th-и беовоз' },
  { w:'thank', t:'ташаккур', e:'🙏', ipa:'/θæŋk/', ex:'Thank you.', exT:'th: забон байни дандонҳо' },
  { w:'this', t:'ин', e:'👇', ipa:'/ðɪs/', ex:'this ≠ dis', exT:'th-и ОВОЗДОР (ларзиш)' },
  { w:'mother', t:'модар', e:'👩', ipa:'/ˈmʌðər/', ex:'my mother', exT:'th-и овоздор дар миён' },
  { w:'wet', t:'тар', e:'💧', ipa:'/wet/', ex:'wet ≠ vet', exT:'w: лабҳо мудаввар (мисли «у»)' },
  { w:'vet', t:'байтор (духтури ҳайвон)', e:'🐶', ipa:'/vet/', ex:'wet ≠ vet', exT:'v: лаб ба дандон' },
  { w:'west', t:'ғарб', e:'🧭', ipa:'/west/', ex:'west ≠ vest', exT:'w: лабҳо мудаввар' },
  { w:'very', t:'хеле', e:'⭐', ipa:'/ˈveri/', ex:'very good', exT:'v: лаб ба дандон (на «в»-и оддӣ)' },
  { w:'water', t:'об', e:'🚰', ipa:'/ˈwɔːtər/', ex:'cold water', exT:'w: лабҳо мудаввар' },
];

// Дарси 2 (нав) — i кӯтоҳ /ɪ/ ва ee дароз /iː/
const I_WORDS = [
  { w:'sit', t:'нишастан', e:'🪑', ipa:'/sɪt/', ex:'sit ≠ seat', exT:'i кӯтоҳ ва нарм' },
  { w:'seat', t:'ҷойи нишаст', e:'💺', ipa:'/siːt/', ex:'sit ≠ seat', exT:'ee дароз: «иии»' },
  { w:'ship', t:'киштӣ', e:'🚢', ipa:'/ʃɪp/', ex:'ship ≠ sheep', exT:'i кӯтоҳ' },
  { w:'sheep', t:'гӯсфанд', e:'🐑', ipa:'/ʃiːp/', ex:'ship ≠ sheep', exT:'ee дароз' },
  { w:'it', t:'он', e:'👉', ipa:'/ɪt/', ex:'it ≠ eat', exT:'i кӯтоҳ' },
  { w:'eat', t:'хӯрдан', e:'🍽️', ipa:'/iːt/', ex:'it ≠ eat', exT:'ee дароз' },
  { w:'live', t:'зиндагӣ кардан', e:'🏠', ipa:'/lɪv/', ex:'live ≠ leave', exT:'i кӯтоҳ' },
  { w:'leave', t:'тарк кардан', e:'🚪', ipa:'/liːv/', ex:'live ≠ leave', exT:'ee дароз' },
  { w:'this', t:'ин', e:'☝️', ipa:'/ðɪs/', ex:'this ≠ these', exT:'i кӯтоҳ (танҳо)' },
  { w:'these', t:'инҳо', e:'✌️', ipa:'/ðiːz/', ex:'this ≠ these', exT:'ee дароз (ҷамъ)' },
];

const mapWords = (list) => list.map((x, i) => ({
  word: x.w, translation: x.t, emoji: x.e, ipa: x.ipa,
  example: x.ex, exampleTrans: x.exT, difficulty: 1, order: i,
}));

async function run() {
  console.log('🗣️  Талаффузи махсус барои тоҷикзабонҳо (англисӣ A1, M0)\n');

  // 1) Дарси мавҷудаи th/w/v-ро бо ҷуфтҳои минималӣ такмил медиҳем
  const r1 = await api('POST', '/api/admin/words/bulk', { lessonId: TH_LESSON, mode: 'replace', words: mapWords(TH_WORDS) });
  console.log('  ✅ «Талаффуз: th, w ва v» — ' + (r1.count ?? TH_WORDS.length) + ' калима (бо ҷуфтҳо)');

  // 2) Дарси нав — i кӯтоҳ ва ee
  const lr = await api('POST', '/api/admin/lessons', {
    moduleId: MODULE_ID,
    title: 'Pronunciation: short i vs long ee',
    titleTranslated: 'Талаффуз: i кӯтоҳ ва ee',
    type: 'vocab', emoji: '🗣️', cefrLevel: 'A1', skillType: 'speaking',
    xpReward: 50, duration: 5, order: 4, isPremium: false, isActive: true,
  });
  if (!lr.lesson) { console.error('  ❌ Дарси нав: ' + JSON.stringify(lr)); return; }
  const r2 = await api('POST', '/api/admin/words/bulk', { lessonId: lr.lesson.id, mode: 'replace', words: mapWords(I_WORDS) });
  console.log('  ✅ «Талаффуз: i кӯтоҳ ва ee» (нав) — ' + (r2.count ?? I_WORDS.length) + ' калима');
  console.log('     lessonId: ' + lr.lesson.id);

  console.log('\n✅ Тамом! Акнун аудио лозим аст (барои калимаҳои нав).');
}
run().catch(e => { console.error('❌ ' + e.message); process.exit(1); });
