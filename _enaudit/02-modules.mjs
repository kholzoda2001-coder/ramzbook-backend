import { q } from './db.mjs';
const langs = await q(`select id, code, name, "canBeTarget", "isActive" from "Language" order by code`);
console.log('LANGUAGES:'); langs.forEach(l=>console.log(' ', l.code, l.id, l.name, 'target='+l.canBeTarget, 'active='+l.isActive));
const en = langs.find(l=>l.code==='en');
const courses = await q(`select c.id, c.level, c.title, c.order, c."isActive", tl.code as target, nl.code as native
  from "Course" c join "Language" tl on tl.id=c."targetLanguageId" join "Language" nl on nl.id=c."nativeLanguageId"
  where c."targetLanguageId"=$1 order by c.order`, [en.id]);
console.log('\nENGLISH COURSES:');
for (const c of courses) {
  const mods = await q(`select id, "order", title, "titleTranslated", "isActive" from "Module" where "courseId"=$1 order by "order"`, [c.id]);
  console.log(` ${c.level} ${c.target}->${c.native} id=${c.id} active=${c.isActive} modules=${mods.length}`);
  for (const m of mods.slice(0,3)) {
    const cnt = await q(`select count(*)::int n from "Lesson" where "moduleId"=$1`, [m.id]);
    console.log(`    #${m.order} ${m.title} | ${m.titleTranslated} id=${m.id} active=${m.isActive} lessons=${cnt[0].n}`);
  }
}
