// Аудити A1-и як роҳи гуфтори РУСӢ аз рӯи JSON (пеш аз seed) — 03.10.2026.
//
//   node prisma/_ru-a1-path-audit.mjs <goal> [--verbose]   (build | study | service | drive | life)
//
// Ҳамон мантиқи `_en-a1-path-audit.mjs`: роҳ = вазъиятҳои goals=[] + <goal>, бо тартиби order.
//  ❌ калимаи берун аз A1, ки дар ҷумлаи хонанда ПЕШ аз дарси «Калимаҳо»/«Ибораҳо»-и роҳ меояд;
//  ⚠ грамматикаи болотар аз A1 (ТРКИ-элементарный): сифати феълӣ/феъли ҳолӣ, «бы», «который».
// Меъёри A1: калимаҳои курси русии A1 аз база + калимаҳои хизматӣ. Русӣ сарфу наҳви бой дорад →
// муқоиса бо РЕША (пасвандҳо бурида мешаванд; реша ≥ 3 ҳарф). Exit 1 агар ❌ бошад.
import { readFileSync, readdirSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const goal = process.argv[2];
const VERBOSE = process.argv.includes('--verbose');
if (!goal) throw new Error('Истифода: node prisma/_ru-a1-path-audit.mjs <goal>');
const env = Object.fromEntries(readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')
  .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
  .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sql = neon(env.DATABASE_URL);

const toks = (s) => (s.toLowerCase().replace(/ё/g, 'е').match(/[а-я]+(?:-[а-я]+)?/g) ?? []);
const ENDINGS = ['ами', 'ями', 'ого', 'его', 'ему', 'ому', 'ыми', 'ими', 'ешь', 'ишь', 'ете', 'ите', 'ают', 'яют', 'уют',
  'ая', 'яя', 'ое', 'ее', 'ые', 'ие', 'ой', 'ей', 'ий', 'ый', 'ую', 'юю', 'ом', 'ем', 'ам', 'ям', 'ах', 'ях', 'ов', 'ев',
  'ть', 'ла', 'ли', 'ло', 'ет', 'ит', 'ут', 'ют', 'ат', 'ят', 'им', 'ся', 'сь', 'у', 'ю', 'а', 'я', 'о', 'е', 'ы', 'и', 'ь', 'й', 'л'];
const stem = (w) => {
  let x = w.replace(/(ся|сь)$/, '');
  for (const e of ENDINGS) if (x.length - e.length >= 3 && x.endsWith(e)) { x = x.slice(0, -e.length); break; }
  return x;
};
// Реша мувофиқ: баробар, ё яке пешванди дигар (≥ 4 ҳарф) — «хочу/хотеть» ба ин намедарояд, пас
// феълҳои беқоидаи A1 дар рӯйхати хизматӣ ҳастанд.
const known = new Set();
const match = (w) => {
  const s = stem(w);
  if (known.has(s) || known.has(w)) return true;
  for (const k of knownStems) if (k.length >= 4 && s.length >= 4 && (k.startsWith(s) || s.startsWith(k))) return true;
  return false;
};
let knownStems = [];

const course = await sql.query(`
  SELECT w.word, w.example FROM "Word" w JOIN "Lesson" l ON l.id=w."lessonId" JOIN "Module" m ON m.id=l."moduleId"
  JOIN "Course" c ON c.id=m."courseId" JOIN "Language" lt ON lt.id=c."targetLanguageId"
  WHERE lt.code='ru' AND c.level='A1'`);
const A1 = new Set();
for (const r of course) for (const t of [...toks(r.word), ...toks(r.example ?? '')]) { A1.add(t); A1.add(stem(t)); }
// Калимаҳои хизматӣ ва феълҳои беқоидаи A1 (ҷонишин, пешоянд, пайвандак, адад, саволӣ).
('я ты он она оно мы вы они меня тебя его ее нас вас их мне тебе ему ей нам вам им мой моя мое мои твой твоя ваш ваша наш наша ' +
 'свой свою этот эта это эти тот та те в во на с со из от до для по за к ко у о об при без через под над и а но или да нет не ни ' +
 'же ли бы вот там тут здесь где куда откуда когда как что кто чей почему зачем сколько какой какая какое какие который ' +
 'один одна одно два две три четыре пять шесть семь восемь девять десять двадцать тридцать сорок пятьдесят сто тысяча ' +
 'первый второй третий все всё весь вся очень тоже уже еще ещё сейчас теперь потом сегодня завтра вчера утром вечером ' +
 'днем ночью можно нельзя надо нужно хорошо плохо спасибо пожалуйста извините здравствуйте привет пока ' +
 'быть есть был была было были буду будет хочу хочешь хочет хотим хотите хотят могу можешь может можем можете могут ' +
 'иду идешь идет идем идете идут еду едешь едет едем едете едут даю дает дайте ем ешь ест едим пью пьет ' +
 'знаю знаешь знает понимаю понимаете говорю говорите работаю работает живу живешь живет люблю любит').split(' ')
  .forEach((w) => { A1.add(w); A1.add(stem(w)); });
// Лексикаи маъмули A1 (ТРКИ-элементарный), ки дар курси мо калима нест: феълҳо (шакли асосӣ —
// шаклҳои дигар бо реша мувофиқ меоянд), зарф, исмҳои ҳаррӯза.
('прийти приду придти приехать приезжать понятно отлично лучше так раз позвонить звонить номер ничего немного вместе ' +
 'туалет сказать скажите принести поставить попробовать пробовать подождать повторить осторожно оставить нормально ' +
 'конечно закончить забыть забыл день дня дней дать дай давай брать беру взять возьмите возьми удачи туда трудно ' +
 'стоять срочно секунда секунду сесть сел сделать делать свободен свободно свежий сахар спросить смочь сумка ' +
 'проблема проверить приехал праздник правильный потерять помочь положить поехать поехали поговорить подарок пицца ' +
 'официант отправить оплатить заплатить платить оплата опоздать опаздывать остановка остановиться отдохнуть острый ' +
 'неделя начальник наверху наверное лифт конец кабинет искать интернет иди идти значит занято зал зайти заболеть ' +
 'ждать жду ждем душ долго документы доехать дальше давно вкусный вкусно включить выключить выйти выход вперед ' +
 'войти вещи бесплатно буквы алло шумно тише торт видеть вижу встреча встретиться дружить никто никого кому мной ' +
 'собой чем чего что-то чье спать стоять нравиться понравилось рубль рублей двести триста четвертый быстро быстрее ' +
 'проходите проходить заводится уйти убрать мусор опыт слышно аппетит аппетита порядок порядке двое ' +
 'положите позвоните подождите повторите вызовите скажите проверьте попробуйте заполнить эту смогу спрошу сумок спят фото пути начинать начать раньше ищете ищу страшного пожаловать волнуйтесь забудьте отправьте остановок таблеток вилку воздух мыть помыть сзади занятия зарядка громко много поедем ехать слева справа отправлю уходить помойте').split(' ')
  .forEach((w) => { A1.add(w); A1.add(stem(w)); });
// Номҳои хос: шаҳр, кӯча, одам, мошин.
'москва москве ленина анна рахимов тойота плов плове'.split(' ').forEach((w) => { A1.add(w); A1.add(stem(w)); });
A1.forEach((w) => known.add(w));
knownStems = [...known];
const isA1 = (w) => match(w);

const packs = readdirSync('content/speaking').filter((f) => f.endsWith('_ru_tg.json'))
  .map((f) => JSON.parse(readFileSync(`content/speaking/${f}`, 'utf8')))
  .filter((p) => Array.isArray(p.category.goals) && p.lessons.some((L) => L.stage)
    && (p.category.goals.length === 0 || p.category.goals.includes(goal)))
  .sort((a, b) => a.category.order - b.category.order);
console.log(`роҳи «${goal}»: ${packs.length} вазъият`);

const GRAM = {
  'сифати феълӣ/феъли ҳолӣ': /[а-я]{2,}(ющ|ящ|вш| емы|имы)[а-я]*\b/i,
  'бы (шартӣ)': /(^|\s)бы(\s|[.,!?]|$)/i,
  // «Который час?» — ибораи тайёри A1 («Соат чанд?»), на ҷумлаи пайваст.
  'который': /(^|\s)котор[а-я]+(?![а-я])(?! час)/i,
};
const taught = new Set();
const teach = (w) => { taught.add(w); taught.add(stem(w)); };
const taughtOk = (w) => taught.has(w) || taught.has(stem(w))
  || [...taught].some((k) => k.length >= 4 && stem(w).length >= 4 && (k.startsWith(stem(w)) || stem(w).startsWith(k)));
let bad = 0;
const sayLens = [], hearLens = [];
for (const p of packs) {
  const cat = `#${p.category.order} ${p.category.titleTranslated}`;
  for (const L of p.lessons) {
    for (const it of L.items) {
      const say = (it.text ?? '').replace('{job}', '').replace('___', '');
      if (say) sayLens.push(toks(say).length);
      if (it.cue) hearLens.push(toks(it.cue).length);
      if (it.kind === 'word' || L.stage === 'chunks' || L.stage === 'words') { toks(say).forEach(teach); continue; }
      for (const [g, re] of Object.entries(GRAM)) if (re.test(say)) console.log(`  ⚠ ${g} · ${cat} · «${say}»`);
      const miss = toks(say).filter((w) => !isA1(w) && !taughtOk(w));
      if (miss.length) { bad++; console.log(`  ❌ наомӯхта [${miss.join(', ')}] · ${cat} · L${L.order} «${say}»`); }
      toks(say).forEach(teach);
    }
  }
}
const st = (a) => { a.sort((x, y) => x - y); return `миёна ${(a.reduce((s, x) => s + x, 0) / a.length).toFixed(1)} · max ${a.at(-1)} · >8: ${a.filter((x) => x > 8).length}`; };
console.log(`\nдарозӣ: хонанда ${st(sayLens)} | ҳамсуҳбат ${st(hearLens)}`);
console.log(`калимаи пешакӣ наомӯхта: ${bad}`);
process.exit(bad ? 1 : 0);
