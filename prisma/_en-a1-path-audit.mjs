// Аудити A1-и як роҳи гуфтори англисӣ аз рӯи JSON (пеш аз seed) — 02.10.2026.
//
//   node prisma/_en-a1-path-audit.mjs <goal>        (build | study | service)
//
// Роҳ = вазъиятҳои goals=[] + вазъиятҳое, ки <goal>-ро доранд, бо тартиби `order`.
// Месанҷад: (1) дарозии гуфтори хонанда ва ҳамсуҳбат; (2) грамматикаи болотар аз A1
// дар гуфтори хонанда; (3) калимаи берун аз A1, ки дар ҷумла ПЕШ аз дарси «Калимаҳо»/
// «Ибораҳо»-и роҳ меояд. Меъёри A1: калимаҳои курси англисии A1 аз база + рӯйхати
// калимаҳои хизматӣ. Exit 1 агар (2) ё (3) ёфт шавад.
import { readFileSync, readdirSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const goal = process.argv[2];
if (!goal) throw new Error('Истифода: node prisma/_en-a1-path-audit.mjs <goal>');
const env = Object.fromEntries(readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')
  .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
  .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sql = neon(env.DATABASE_URL);
const toks = (s) => (s.toLowerCase().replace(/[’']/g, "'").match(/[a-z]+(?:'[a-z]+)?/g) ?? []);
const lem = (w) => [w, w.replace(/'s$/, ''), w.replace(/n't$/, ''), w.replace(/'ll$/, ''), w.replace(/'m$/, ''), w.replace(/'re$/, ''),
  w.replace(/ies$/, 'y'), w.replace(/es$/, ''), w.replace(/s$/, ''), w.replace(/ing$/, ''), w.replace(/ing$/, 'e'), w.replace(/ed$/, ''), w.replace(/d$/, '')];

const course = await sql.query(`
  SELECT w.word, w.example FROM "Word" w JOIN "Lesson" l ON l.id=w."lessonId" JOIN "Module" m ON m.id=l."moduleId"
  JOIN "Course" c ON c.id=m."courseId" JOIN "Language" lt ON lt.id=c."targetLanguageId"
  WHERE lt.code='en' AND c.level='A1'`);
const A1 = new Set();
for (const r of course) for (const t of [...toks(r.word), ...toks(r.example ?? '')]) A1.add(t);
// Калимаҳои хизматӣ ва A1-и маъмул (CEFR A1), ки дар курси мо калима нестанд.
('a an the i you he she it we they me him her us them my your his its our their this that these those is am are be do does ' +
 'not no yes and or but to of in on at for from with by up here there what where when who how which why one two three four ' +
 'five six seven eight nine ten eleven twelve twenty thirty forty fifty hundred first second third can let ok okay please ' +
 'thank thanks sorry hello hi bye today tomorrow now again give more late understand problem number too start say all some ' +
 'fine still everything anything else great sure oh hey so any get got go come know want need like have see look take put ' +
 'help work new good very much many next right left near far back home day week month year time hour minute').split(' ').forEach((w) => A1.add(w));
// CEFR A1 (Oxford 3000, A1), ки дар рӯйхати курси мо калима нестанд: was/were — гузаштаи be (A1).
("meet toilet done can't tonight repeat another enjoy finish finished quickly together mean spell until about " +
 "was were wasn't i'd").split(' ').forEach((w) => A1.add(w));
// Номҳои хос: одамон, кӯча, донишгоҳ, хӯрок, кишвар.
'anna main state plov tajikistan mexico poland'.split(' ').forEach((w) => A1.add(w));
const isA1 = (w) => lem(w).some((l) => A1.has(l));

const packs = readdirSync('content/speaking').filter((f) => f.endsWith('_en_tg.json'))
  .map((f) => JSON.parse(readFileSync(`content/speaking/${f}`, 'utf8')))
  .filter((p) => Array.isArray(p.category.goals) && p.lessons.some((L) => L.stage)
    && (p.category.goals.length === 0 || p.category.goals.includes(goal)))
  .sort((a, b) => a.category.order - b.category.order);
console.log(`роҳи «${goal}»: ${packs.length} вазъият — ${packs.map((p) => `#${p.category.order} ${p.category.titleTranslated}`).join(', ')}`);

const PAST = /\b(went|came|saw|made|took|gave|said|told|ate|drank|bought|broke|fell|forgot|found|felt|left|lost|met|paid|sent|slept|spoke|stood|thought|wrote|knew|began|did|had|was|were|[a-z]{3,}ed)\b/i;
// left — тараф, hundred — шумора, finished — сифат («Finished.» = тайёр).
const NOT_PAST = /\b(need|tired|closed|bored|interested|married|red|bed|speed|left|hundred|finished)\b/i;
const GRAM = {
  'Present Perfect': /\b(have|has|'ve)\s+(been|gone|done|seen|worked|lived|finished|had|got)\b/i,
  'will/won\'t': /\b(will|won't|'ll)\b/i,
  'could/would/should/must': /\b(could|would|'d|should|must)\b/i,
  'if': /\bif\b/i,
  'муқоиса': /\b\w+er than\b|\bmore \w+ than\b/i,
};
const taught = new Set();
// Ибораи якпорчае, ки дар «Калимаҳо»/«Ибораҳо» омӯхта шуд («I passed», «Got it»), огоҳӣ намедиҳад.
const taughtPhrases = new Set();
const norm = (x) => x.toLowerCase().replace(/[^a-z' ]/g, '').trim();
let bad = 0;
const sayLens = [], hearLens = [];
for (const p of packs) {
  const cat = `#${p.category.order} ${p.category.titleTranslated}`;
  for (const L of p.lessons) {
    for (const it of L.items) {
      const say = (it.text ?? '').replace('{job}', '').replace('___', '');
      const cue = it.cue ?? '';
      if (say) sayLens.push(toks(say).length);
      if (cue) hearLens.push(toks(cue).length);
      if (it.kind === 'word' || L.stage === 'chunks' || L.stage === 'words') {
        toks(say).forEach((w) => lem(w).forEach((l) => taught.add(l)));
        taughtPhrases.add(norm(say));
        continue;
      }
      const chunk = [...taughtPhrases].some((ph) => ph.includes(' ') && norm(say).includes(ph));
      // (2) грамматика
      const pastHit = say.match(PAST);
      if (pastHit && !chunk && !/^got\b|\bgot it\b/i.test(say.toLowerCase()) && !NOT_PAST.test(pastHit[0])
        && !/^(was|wasn't|were)$/i.test(pastHit[0])) {
        console.log(`  ⚠ гузашта · ${cat} · «${say}»`);
      }
      // «I'd like» — ибораи хушмуомилаи A1, на грамматикаи would.
      for (const [g, re] of Object.entries(GRAM)) if (re.test(say.replace(/\bI'd like\b/gi, ''))) console.log(`  ⚠ ${g} · ${cat} · «${say}»`);
      // (3) калимаи пешакӣ наомӯхта
      const miss = toks(say).filter((w) => !isA1(w) && !lem(w).some((l) => taught.has(l)));
      if (miss.length) { bad++; console.log(`  ❌ наомӯхта [${miss.join(', ')}] · ${cat} · L${L.order} «${say}»`); }
      toks(say).forEach((w) => lem(w).forEach((l) => taught.add(l)));
    }
  }
}
const st = (a) => { a.sort((x, y) => x - y); return `миёна ${(a.reduce((s, x) => s + x, 0) / a.length).toFixed(1)} · max ${a.at(-1)} · >8: ${a.filter((x) => x > 8).length}`; };
console.log(`\nдарозӣ: хонанда ${st(sayLens)} | ҳамсуҳбат ${st(hearLens)}`);
console.log(`калимаи пешакӣ наомӯхта: ${bad}`);
process.exit(bad ? 1 : 0);
