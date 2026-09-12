import { connect } from './_ru-fix-lib.mjs';
const sql = connect();
const API = 'https://admin.ramz.tj/api/mobile';
const [ru] = await sql`SELECT id FROM "Language" WHERE code='ru'`;
const [tg] = await sql`SELECT id FROM "Language" WHERE code='tg'`;
const cj = await (await fetch(`${API}/courses?targetLanguageId=${ru.id}&nativeLanguageId=${tg.id}`)).json();
const courses = cj.courses ?? cj;
const a1 = courses.find((c) => c.level === 'A1');
const m1 = a1.modules[0];
console.log('module keys:', Object.keys(m1).join(','), '| contentVersion=', m1.contentVersion, '| lessons=', m1.lessons.length);
console.log('lesson[0] keys:', Object.keys(m1.lessons[0]).join(','));
for (const i of [7, 9, 10, 13]) {
  const r = await fetch(`${API}/lessons/${m1.lessons[i].id}`);
  const j = await r.json();
  const L = j.lesson ?? j;
  const comp = L.component ?? j.component;
  console.log(`\n#${i} HTTP ${r.status} top=${Object.keys(j).join(',')} lessonKeys=${Object.keys(L).join(',')}`);
  if (comp) console.log('  component keys:', Object.keys(comp).join(','), '| type=', comp.type);
  if (comp?.rules) console.log('  rules:', comp.rules.map((x) => x.pattern).join(' | '));
  if (comp?.questions) console.log('  q[0]:', JSON.stringify(comp.questions[0]).slice(0, 200));
  if (comp?.lines) console.log('  line[0]:', JSON.stringify(comp.lines[0]).slice(0, 200));
}
