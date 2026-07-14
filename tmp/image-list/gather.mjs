import { writeFileSync } from 'fs';

const BASE = 'https://admin.ramz.tj/api/mobile';
const TG = 'cmpk1cr9o0000bo0h1mheyoad';
const EN = 'cmppaul1k0001xrdbc2woi3fj';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function api(p) {
  for (let a = 0; a < 6; a++) {
    try { const r = await fetch(BASE + p); if (r.ok) return r.json(); throw 0; }
    catch (e) { if (a === 5) throw e; await sleep(2000); }
  }
}

// Mirrors _kPickBlockedEmojis in unit_lesson_screen.dart (VS16 stripped).
const BLOCK = new Set(['🌆','🌇','🌃','🏙','🌉','🗺','📍','🏞','🌐','🌍','🌎','🌏','🏢','📅','📆','🗓','⏰','⏳','🕰','⌚','🕐','⏱','⏮','⏯','⏸','▶','◀','💤','👤','👥','🧑','🗣','🎂','🎉','🎊','🎁','🎈','🎀','🏆','🥇','🥈','🥉','🎗','📝','📛','🔢','📋','📄','📃','📚','📖','❓','✨','⭐','🌟','🆕','🔤','💭','📊','📈','📉','⚖','🎲','🔁','🔂','🔄','➕','➖','🟰','🔊','📢','🔔','💡','🎯','🆗','✅','❌','↔','⬆','⬇','⏭','🔙','💯','🔥']);
const stripVS = (s) => (s || '').trim().replace(/️/g, '');
const isFlag = (s) => { for (const ch of (s || '')) { const cp = ch.codePointAt(0); if (cp >= 0x1F1E6 && cp <= 0x1F1FF) return true; } return false; };
const isKeycap = (s) => /[0-9#*]️?⃣/.test(s || '');
const norm = (w) => w.toLowerCase().trim().replace(/['’.,!?]/g, '').replace(/\s+/g, '_');

// Abstract nouns, adjectives, directions, symptoms, generic roles and
// commerce concepts whose picture is ambiguous in the `pick` exercise — these
// keep their emoji instead of getting an AI image.
const SKIP = new Set([
  // adjectives / states
  'good','healthy','ill','sick','tired','cold',
  // directions
  'left','right',
  // weather / air abstract (concrete stays: rain,snow,cloud,sun,moon,rainbow,lightning,thunder,ice)
  'air','breeze','wind','weather','shower','climate',
  // time abstract (concrete seasons stay)
  'afternoon','morning','night','future',
  // symptoms / feelings (concrete stays: pill,bandage,plaster,medicine,injection,syrup,thermometer,mask)
  'ache','headache','toothache','stomachache','cough','fever','flu','bruise','cramp',
  'migraine','pain','hurt','injury','wound','stress','nap','smile','rest','sling',
  // money / commerce abstract (concrete stays: coin,cash,money,banknote,wallet,purse,card,credit_card,dollar)
  'bargain','brand','charity','currency','debt','discount','fare','fee','income','loan',
  'offer','payment','price','product','refund','salary','sale','savings','service','tip',
  'wage','deposit','invoice','bill','cheque','voucher',
  // abstract concepts
  'accident','achievement','ambition','arrival','birth','childhood','comedy','community',
  'contact','culture','custom','customs','danger','decision','departure','diet','direction',
  'distance','dose','election','emergency','energy','fact','firm','fitness','flight','freedom',
  'goal','government','graduation','guarantee','half','help','heritage','holiday','housework',
  'issue','journey','junction','link','mess','message','nation','network','nutrition',
  'opportunity','owner','pollution','project','quantity','queue','size','strength','task',
  'temperature','tradition','traffic','treatment','trip','wellbeing','emoji','order',
  // generic / ambiguous roles (iconic ones stay: doctor,nurse,teacher,chef,waiter,student,farm)
  'amateur','audience','boss','colleague','counter','crew','customer','employee','immigrant',
  'manager','member','stranger','volunteer','citizen','coach','guide','referee','fan',
  'journalist','reporter','accountant','architect','engineer','plumber','grocer','cashier',
  'tourist','surgeon','pharmacist','driver',
]);

console.log('Ҷамъоварӣ аз API...');
const courses = (await api(`/courses?targetLanguageId=${EN}&nativeLanguageId=${TG}`)).courses;
const byWord = new Map();
let totalNouns = 0, blocked = 0, flags = 0, nonNoun = 0;
const seenId = new Set();
for (const c of courses) {
  if (!['A1', 'A2'].includes(c.level)) continue;
  for (const m of (c.modules || [])) {
    for (const stub of (m.lessons || [])) {
      let L; try { L = await api(`/lessons/${stub.id}`); } catch { continue; }
      const les = L.lesson || L;
      for (const w of (les.words || [])) {
        if (!w.id || seenId.has(w.id)) continue; seenId.add(w.id);
        const word = (w.word || '').trim(); if (!word) continue;
        if ((w.partOfSpeech || '').trim().toLowerCase() !== 'noun') { nonNoun++; continue; }
        totalNouns++;
        const e = stripVS(w.emoji);
        if (isFlag(w.emoji)) { flags++; continue; }
        if (isKeycap(w.emoji)) { continue; }
        if (!e || BLOCK.has(e)) { blocked++; continue; }
        const key = norm(word);
        if (!byWord.has(key)) byWord.set(key, { english: word, tajik: w.translation || '', emoji: w.emoji || '', levels: new Set() });
        byWord.get(key).levels.add(c.level);
      }
    }
  }
}
const all = [...byWord.entries()].sort((a, b) => a[0].localeCompare(b[0]));
const draw = all.filter(([k]) => !SKIP.has(k));
const skip = all.filter(([k]) => SKIP.has(k));
console.log('НАТИҶА:');
console.log('  Ҳамаи исмҳо (noun):', totalNouns);
console.log('  Парчам — эмодзӣ монад:', flags);
console.log('  Блокшуда (абстракт/симбол):', blocked);
console.log('  Калимаҳои ягона:', all.length);
console.log('  → РАСМ мекашем (мушаххас):', draw.length);
console.log('  → эмодзӣ мемонад (абстракт):', skip.length);

const toTsv = (list) => 'filename\tenglish\ttajik\temoji\tlevel\n' +
  list.map(([k, v]) => `${k}.png\t${v.english}\t${v.tajik}\t${v.emoji}\t${[...v.levels].join('/')}`).join('\n') + '\n';
writeFileSync(new URL('./images-draw.tsv', import.meta.url), toTsv(draw));
writeFileSync(new URL('./images-skip.tsv', import.meta.url), toTsv(skip));
writeFileSync(new URL('./words-draw.json', import.meta.url), JSON.stringify(draw.map(([k, v]) => ({ filename: k + '.png', english: v.english, tajik: v.tajik })), null, 2));
// bundled app manifest: normalized english words that WILL have an image
writeFileSync(new URL('./image_manifest.json', import.meta.url), JSON.stringify(draw.map(([k]) => k).sort()));
console.log('\nФайлҳо: images-draw.tsv, images-skip.tsv, words-draw.json, image_manifest.json');
