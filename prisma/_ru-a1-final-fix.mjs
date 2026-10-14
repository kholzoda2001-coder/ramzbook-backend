// RU · A1 · аудити ниҳоӣ (14.10.2026) — ислоҳи МАЗМУНИ матнӣ (бе аудио/акс).
//
// Аз хондани ҳамаи 683 калима, 270 машқи грамматика, 52 матн, 17 муколама ва 30 саволи
// сатҳсанҷӣ. Ҳар тағйир ИДЕМПОТЕНТ аст (дубора иҷро = «аллакай нав»).
// ⚠️ IPA/транскрипсия барои русӣ ҚАСДАН илова НАМЕШАВАД (қарори корбар, 12.09 ва 14.10.2026).
//
//   node prisma/_ru-a1-final-fix.mjs            # dry-run
//   node prisma/_ru-a1-final-fix.mjs --apply
import { connect, COURSE_RU_A1, APPLY, banner, done } from './_ru-fix-lib.mjs';

const sql = connect();
banner('RU · A1 — аудити ниҳоӣ: ислоҳи матн');

let changed = 0, already = 0;
const touchedModules = new Set();

const JSONCOLS = new Set(['options']);
async function setRow(table, id, want, label, moduleId) {
  const cols = Object.keys(want);
  const sel = `SELECT ${cols.map((c) => `"${c}"`).join(',')} FROM "${table}" WHERE id=$1`;
  const r = await sql.query(sel, [id]);
  if (r.length !== 1) throw new Error(`${table} ${id}: ${r.length} сатр`);
  const same = (row, c) => JSON.stringify(row[c]) === JSON.stringify(want[c]);
  if (cols.every((c) => same(r[0], c))) { already++; return; }
  console.log(`  • ${label}`);
  for (const c of cols) if (!same(r[0], c)) console.log(`      ${c}: ${JSON.stringify(r[0][c])}\n         → ${JSON.stringify(want[c])}`);
  changed++;
  if (moduleId) touchedModules.add(moduleId);
  if (!APPLY) return;
  const sets = cols.map((c, i) => `"${c}"=$${i + 2}${JSONCOLS.has(c) ? '::jsonb' : ''}`).join(', ');
  await sql.query(`UPDATE "${table}" SET ${sets} WHERE id=$1`, [id, ...cols.map((c) => (JSONCOLS.has(c) ? JSON.stringify(want[c]) : want[c]))]);
  const [a] = await sql.query(sel, [id]);
  if (!cols.every((c) => same(a, c))) throw new Error(`ТАСДИҚ НАШУД: ${label}`);
}

const mods = await sql`SELECT id,"order",title FROM "Module" WHERE "courseId"=${COURSE_RU_A1} ORDER BY "order"`;
if (mods.length !== 12) throw new Error(`12 модул интизор буд, ${mods.length}`);
const modAt = (n) => mods[n].id;

// ═══ 1 · калимаҳо (ҳамаи сатрҳои ҳамин калима дар курс, аз ҷумла нусхаи «Практика письма») ═══
console.log('── калимаҳо ──');
const words = await sql`SELECT w.id,w.word,w.translation,w.example,w."exampleTrans",w.emoji,l."moduleId" mid,l."order" lo
  FROM "Word" w JOIN "Lesson" l ON l.id=w."lessonId" JOIN "Module" m ON m.id=l."moduleId"
  WHERE m."courseId"=${COURSE_RU_A1}`;
if (words.length !== 683) throw new Error(`683 калима интизор буд, ${words.length}`);
const WORDS = [
  // хатои русӣ: «Большая еда» — чунин намегӯянд
  { w: 'Еда', set: { example: 'Еда на столе.', exampleTrans: 'Хӯрок дар болои миз аст.' } },
  // «Я хочу перекус» — «перекусить» мегӯянд; феъли «хотеть» бо исм сохти нодуруст
  { w: 'Перекус', set: { example: 'Это мой перекус.', exampleTrans: 'Ин ғизои сабуки ман аст.' } },
  // «Ошхонаи хӯрокхӯрӣ» бо «Кухня»=«Ошхона» омехта мешуд
  { w: 'Столовая', set: { translation: 'Толори хӯрокхӯрӣ', exampleTrans: 'Мо дар толори хӯрокхӯрӣ хӯрок мехӯрем.' } },
  // эмоҷии 🧸 (хирси бозича) барои «Полка»
  { w: 'Полка', set: { emoji: '📚' } },
  // «курта» дар курс = рубашка; «Платье» → «пироҳан» (мисли М9 «Платье красивое → Пироҳан зебо аст»)
  { w: 'Платье', set: { translation: 'Пироҳан', exampleTrans: 'Он пироҳан зебост.' } },
  // тарҷумаи калима «қатора», мисол «поезд»
  { w: 'Вокзал', set: { exampleTrans: 'Вокзал дар куҷост?' } },
  // «Дорухонадор» ≈ «Дорухона» (сатр бо -хона омехта мешуд); мисол аллакай «Дорусоз» буд
  { w: 'Фармацевт', set: { translation: 'Дорусоз' } },
  // калимаи сарлавҳа «Бинт», мисол «бандина» + «ман … лозим дорам» (нодуруст)
  { w: 'Бинт', set: { exampleTrans: 'Ба ман бинт лозим аст.' } },
  // «Злой» = хашмгин; «асабонӣ» = асабӣ (маънои дигар)
  { w: 'Злой', set: { translation: 'Хашмгин', exampleTrans: 'Ӯ ҳоло хашмгин аст.' } },
  // «Гостиная» = «Меҳмонхона» (ҳуҷра) — «Отель» ҳамон тарҷумаро мегирифт
  { w: 'Отель', set: { translation: 'Меҳмонсарой', exampleTrans: 'Бонк дар наздикии меҳмонсарой аст.' } },
  // ҳарфи хурд дар аввали тарҷума (ҳама дигар калимаҳо бо калон)
  { w: 'Жить', set: { translation: 'Зиндагӣ кардан' } },
  { w: 'Здесь', set: { translation: 'Ин ҷо' } },
  { w: 'Говорить', set: { translation: 'Гап задан' } },
  // «Ҷиянам» ва «Ҷияни ман» — ду шакл дар ду калимаи ҳамҷуфт
  { w: 'Племянник', set: { exampleTrans: 'Ҷияни ман ҷавон аст.' } },
];
for (const it of WORDS) {
  const rows = words.filter((x) => x.word === it.w);
  if (!rows.length) throw new Error(`калима нест: ${it.w}`);
  for (const r of rows) await setRow('Word', r.id, it.set, `«${it.w}» (Д${r.lo + 1})`, r.mid);
}

// ═══ 2 · матнҳои фаҳмиш ═══
console.log('\n── матнҳои фаҳмиш ──');
const lessons = await sql`SELECT l.id,l."order",l.title,l."titleTranslated" tt,l."comprehensionId" cid,l."moduleId" mid
  FROM "Lesson" l JOIN "Module" m ON m.id=l."moduleId" WHERE m."courseId"=${COURSE_RU_A1}`;
const lesAt = (mo, lo) => {
  const r = lessons.filter((l) => l.mid === modAt(mo) && l.order === lo);
  if (r.length !== 1) throw new Error(`дарс M${mo}·Д${lo}: ${r.length}`);
  return r[0];
};

// M9·Д12 «Чтение: Моя семья» дар модули либос: матн дар бораи либоси оила аст
{
  const l = lesAt(9, 12);
  if (!l.cid) throw new Error('M9·Д12 матн надорад');
  await setRow('Lesson', l.id, { title: 'Чтение: Одежда моей семьи', titleTranslated: 'Хониш: либоси оилаи ман' }, 'M9·Д12 унвони дарс', l.mid);
  await setRow('ComprehensionExercise', l.cid, { title: 'Чтение: Одежда моей семьи', titleTranslated: 'Хониш: либоси оилаи ман' }, 'M9·Д12 унвони матн', l.mid);
}
// M10·Д10: «Фармацевт» → «Дорусоз» (ҳамон тарҷумаи калима)
{
  const l = lesAt(10, 10);
  const [c] = await sql`SELECT "passageTranslated" p FROM "ComprehensionExercise" WHERE id=${l.cid}`;
  const next = c.p.replace('Дорухонадор мегӯяд', 'Дорусоз мегӯяд');
  await setRow('ComprehensionExercise', l.cid, { passageTranslated: next }, 'M10·Д10 тарҷумаи матн', l.mid);
}
// M10·Д15 (имтиҳон): тавзеҳ «Теперь» мегӯяд, матн «Сейчас»
{
  const l = lesAt(10, 15);
  const qs = await sql`SELECT id,explanation FROM "ComprehensionQuestion" WHERE "exerciseId"=${l.cid}`;
  const q = qs.filter((x) => x.explanation.includes('Теперь она здорова'));
  if (q.length > 1) throw new Error('якчанд тавзеҳи «Теперь»');
  for (const x of q) await setRow('ComprehensionQuestion', x.id, { explanation: x.explanation.replace('Теперь она здорова', 'Сейчас она здорова') }, 'M10·Д15 тавзеҳи саволи «Сара сейчас…»', l.mid);
}

// ═══ 3 · грамматика ═══
console.log('\n── грамматика ──');
const topics = await sql`SELECT id,title FROM "GrammarTopic" WHERE "courseId"=${COURSE_RU_A1}`;
const gl = await sql`SELECT l."grammarTopicId" tid,l."moduleId" mid FROM "Lesson" l JOIN "Module" m ON m.id=l."moduleId" WHERE m."courseId"=${COURSE_RU_A1} AND l."grammarTopicId" IS NOT NULL`;
const linkedTopic = (title) => {
  const t = topics.filter((x) => x.title === title && gl.some((g) => g.tid === x.id));
  if (t.length !== 1) throw new Error(`мавзӯи пайваст «${title}»: ${t.length}`);
  return { id: t[0].id, mid: gl.find((g) => g.tid === t[0].id).mid };
};
// Пешванд(ҳо): ҳам матни кӯҳна, ҳам нав — то скрипт идемпотент бошад.
const exOf = async (tid, ...starts) => {
  const all = await sql`SELECT id,prompt,"promptTranslated" pt,answer,explanation FROM "GrammarExercise" WHERE "topicId"=${tid}`;
  const r = all.filter((x) => starts.some((s) => x.prompt.startsWith(s)));
  if (r.length !== 1) throw new Error(`машқ «${starts.join(' | ')}»: ${r.length}`);
  return r[0];
};

// «Ба савол гузаронед» бо тағйири шахс ва партофтани «немного» — дастур чунин намегуфт
{
  const t = linkedTopic('Немного / несколько');
  const e = await exOf(t.id, 'Ба савол гузаронед: У меня есть немного хлеба');
  await setRow('GrammarExercise', e.id, { promptTranslated: 'Савол ба «ту»: меня → тебя; «немного» лозим нест.' }, 'Немного/несколько · transform', t.mid);
}
// «Танҳо ? илова кун» — баҳогузорӣ нишонаҳоро мебарад → холи ройгон. Ҷавоб ҳамон, аудио дуруст.
{
  const t = linkedTopic('Вопросительная интонация');
  const e1 = await exOf(t.id, 'Ба саволӣ гузаронед: Ты любишь чай.', 'Ислоҳ кунед: Что ты любишь чай?');
  await setRow('GrammarExercise', e1.id, {
    prompt: 'Ислоҳ кунед: Что ты любишь чай?',
    promptTranslated: 'Калимаи иловагӣ нодуруст аст.',
    explanation: 'Дар русӣ «Что»/«Оё» лозим нест — танҳо оҳанг: Ты любишь чай?',
  }, 'Вопросительная интонация · transform 1', t.mid);
  const e2 = await exOf(t.id, 'Ба саволӣ гузаронед: Она живёт в Душанбе.', 'Ислоҳ кунед: Что она живёт в Душанбе?');
  await setRow('GrammarExercise', e2.id, {
    prompt: 'Ислоҳ кунед: Что она живёт в Душанбе?',
    promptTranslated: 'Калимаи иловагӣ нодуруст аст.',
    explanation: 'Дар русӣ «Что»/«Оё» лозим нест — танҳо оҳанг: Она живёт в Душанбе?',
  }, 'Вопросительная интонация · transform 2', t.mid);
}

// ═══ 4 · сатҳсанҷӣ ═══
console.log('\n── сатҳсанҷӣ ──');
{
  const q = await sql`SELECT id,prompt,"promptTranslated" pt FROM "PlacementQuestion" WHERE prompt LIKE '«Духтар» (фарзанди духтар)%' OR prompt = '«Духтарча» ба русӣ?'`;
  if (q.length !== 1) throw new Error(`саволи «Духтар»: ${q.length}`);
  // «фарзанди духтар» = «дочь», вале вариант «девочка» ва тавзеҳ «девочка = духтарча» → мувофиқат нест
  await setRow('PlacementQuestion', q[0].id, {
    prompt: '«Духтарча» ба русӣ?',
    promptTranslated: '«Духтарча» ба русӣ чӣ мешавад?',
  }, 'Сатҳсанҷӣ: «Духтар»→«Духтарча»', null);
}

// ═══ 5 · «Пас аз ин бахш … метавонед» (canDoStatement) ═══
console.log('\n── canDoStatement ──');
const CAN_DO = [
  'Пас аз ин бахш салом дода, худатонро муаррифӣ карда, номи касро пурсида ва ташаккур гуфта метавонед.',
  'Пас аз ин бахш синну сол, кишвар, шаҳр, забонҳо ва касби худро гуфта, аз дигарон пурсида метавонед.',
  'Пас аз ин бахш дар бораи оилаи худ нақл карда, аъзои онро тасвир карда ва «у меня есть» гуфта метавонед.',
  'Пас аз ин бахш рақамҳоро то 100 гуфта, рӯзҳои ҳафта, моҳҳо ва вақти соатро номбар карда метавонед.',
  'Пас аз ин бахш дар бораи корҳои рӯзонаи худ нақл карда, аз дигарон пурсида ва гуфта метавонед, ки чӣ кор карда метавонед.',
  'Пас аз ин бахш хӯрок ва нӯшокиро номбар карда, дар тарабхона фармоиш дода ва гуфта метавонед, ки чиро дӯст медоред.',
  'Пас аз ин бахш хонаи худро тасвир карда, ҳуҷраю ашёро номбар карда ва гуфта метавонед, ки чизе дар куҷост.',
  'Пас аз ин бахш дар мағоза нархро пурсида, миқдорро гуфта ва пардохт карда метавонед.',
  'Пас аз ин бахш роҳро пурсида, самтро фаҳмида ва ба сайёҳ роҳ нишон дода метавонед.',
  'Пас аз ин бахш рангу либосро тавсиф карда, гуфта метавонед, ки чӣ мепӯшед ва дар мағоза либос интихоб карда метавонед.',
  'Пас аз ин бахш узви дардкунандаро гуфта, назди духтур ва дар дорухона шикоят карда ва дар ҳолати фавқулодда кӯмак пурсида метавонед.',
  'Пас аз ин бахш обу ҳаво, ҳайвонот ва табиатро тасвир карда, дар бораи мактаб нақл карда ва ҳиссиёти худро гуфта метавонед.',
];
for (let i = 0; i < 12; i++) await setRow('Module', mods[i].id, { canDoStatement: CAN_DO[i] }, `M${i} «${mods[i].title}»`, mods[i].id);

// ═══ 6 · версияи мазмун ═══
if (APPLY && touchedModules.size) {
  for (const mid of touchedModules) await sql.query(`UPDATE "Module" SET "contentVersion"="contentVersion"+1 WHERE id=$1`, [mid]);
  const [g] = await sql`SELECT "valueJson" v FROM "AppSetting" WHERE key='content_version'`;
  const next = String(Number(String(g?.v ?? '0').replace(/"/g, '')) + 1);
  if (g) await sql`UPDATE "AppSetting" SET "valueJson"=${next}, "updatedAt"=now() WHERE key='content_version'`;
  else await sql`INSERT INTO "AppSetting" (key,"valueJson") VALUES ('content_version',${next})`;
  console.log(`\ncontentVersion боло рафт: ${touchedModules.size} модул; глобалӣ → ${next}`);
}
done(changed, `аллакай нав: ${already}`);
