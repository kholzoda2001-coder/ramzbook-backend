// Танҳо хониш: кадом калимаҳо (дар ҳама курсҳо) аз ин 6 акси images/ru/* истифода мебаранд.
import { connect } from './_ru-fix-lib.mjs';
const sql = connect();
const KEYS = ['семья', 'тётя', 'команда', 'близнецы', 'родители', 'бабушка_и_дедушка'];
const rows = await sql`SELECT w.word, w.translation, l."order" lo, l."skillType" st, m."order" mo, t.code tc, c.level
  FROM "Word" w JOIN "Lesson" l ON l.id=w."lessonId" JOIN "Module" m ON m.id=l."moduleId" JOIN "Course" c ON c.id=m."courseId" JOIN "Language" t ON t.id=c."targetLanguageId"
  WHERE t.code='ru'`;
const key = (w) => w.toLowerCase().trim().replace(/['’.,!?]/g, '').replace(/\s+/g, '_');
for (const k of KEYS) {
  const hits = rows.filter((r) => key(r.word) === k);
  console.log(`${k.padEnd(20)} ${hits.map((h) => `${h.tc} ${h.level} М${h.mo + 1}·Д${h.lo + 1}(${h.st}) «${h.word}»`).join(' · ') || '—'}`);
}
