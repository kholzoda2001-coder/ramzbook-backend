// Санҷиши ШАРТНОМАИ сервер, ки нардбони мутобиқшаванда ба он такя мекунад.
//
// Барнома ҷавобҳои дурустро намедонад, пас баъди ҳар блоки сатҳ аз сервер
// мепурсад «ин сатҳ гузашт?» ва ҷавобро аз `breakdown[].passed` мегирад.
// Агар ин майдон ё маънои он тағйир ёбад, санҷиш хомӯшона вайрон мешавад:
// хонанда ё дар A1 мемонад, ё бе асос ба B2 бароварда мешавад.
//
//   node prisma/_check-placement-ladder.mjs
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }),
);
const sql = neon(env.DATABASE_URL);
const API = 'https://admin.ramz.tj/api/mobile/placement';

const [tg] = await sql.query(`SELECT id FROM "Language" WHERE code='tg'`);
const [en] = await sql.query(`SELECT id FROM "Language" WHERE code='en'`);

const rows = await sql.query(
  `SELECT id, "cefrLevel", answer FROM "PlacementQuestion"
    WHERE "targetLanguageId"=$1 AND "nativeLanguageId"=$2 AND "isActive" AND "cefrLevel"='A1'
    ORDER BY "order"`,
  [en.id, tg.id],
);
console.log(`Саволҳои A1: ${rows.length}`);

async function grade(answers, probe) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      targetLanguageId: en.id,
      nativeLanguageId: tg.id,
      answers,
      ...(probe ? { probe: true } : {}),
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return res.json();
}

// 1. Ҳама дуруст → сатҳ бояд ГУЗАРАД.
const allRight = rows.map((q) => ({ questionId: q.id, selected: q.answer }));
const good = await grade(allRight, true);
const a1good = (good.breakdown ?? []).find((b) => b.level === 'A1');
console.log('\n1) 10/10 дуруст →', {
  level: good.level,
  passed: a1good?.passed,
  correct: `${a1good?.correct}/${a1good?.total}`,
  threshold: good.passThreshold,
  saved: good.saved,
});

// 2. Ду хато → бо ҳадди 0.85 (9 аз 10) сатҳ бояд НАГУЗАРАД.
const twoWrong = rows.map((q, i) => ({
  questionId: q.id,
  selected: i < 2 ? `__ҷавоби-нодуруст-${i}` : q.answer,
}));
const bad = await grade(twoWrong, true);
const a1bad = (bad.breakdown ?? []).find((b) => b.level === 'A1');
console.log('2) 8/10 дуруст  →', {
  level: bad.level,
  passed: a1bad?.passed,
  correct: `${a1bad?.correct}/${a1bad?.total}`,
  saved: bad.saved,
});

const ok =
  a1good?.passed === true &&
  a1bad?.passed === false &&
  good.saved !== true &&
  bad.saved !== true;
console.log(`\n${ok ? '✅' : '❌'} Шартнома: breakdown[].passed ҳамон чизест, ки нардбон интизор аст.`);
process.exit(ok ? 0 : 1);
