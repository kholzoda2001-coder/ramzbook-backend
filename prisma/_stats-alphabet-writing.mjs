// Хониши омор барои қарори «навиштани алифбо» (танҳо SELECT).
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';
const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);
const q = (t) => sql.query(t);
const show = (title, rows) => { console.log('\n=== ' + title); console.table(rows); };

show('Забонҳо', await q(`
  SELECT l.code, l.name, l."isActive", l."canBeTarget", l."canBeNative", l.direction,
    (SELECT count(*) FROM "AlphabetLetter" a WHERE a."targetLanguageId"=l.id) AS letters,
    (SELECT count(*) FROM "AlphabetRule" r WHERE r."targetLanguageId"=l.id) AS rules,
    (SELECT count(*) FROM "AlphabetLetter" a WHERE a."targetLanguageId"=l.id AND coalesce(a."audioUrl",'')<>'') AS letter_audio
  FROM "Language" l ORDER BY l.order`));

show('Курсҳо', await q(`
  SELECT t.code AS target, n.code AS native, c.level, c."isActive",
    (SELECT count(*) FROM "Module" m WHERE m."courseId"=c.id) AS modules
  FROM "Course" c JOIN "Language" t ON t.id=c."targetLanguageId" JOIN "Language" n ON n.id=c."nativeLanguageId"
  ORDER BY t.code, c.level`));

show('Корбарон — умумӣ', await q(`
  SELECT count(*) AS users,
    count(*) FILTER (WHERE "lastActiveAt" > now() - interval '30 days') AS active_30d,
    count(*) FILTER (WHERE "lastActiveAt" > now() - interval '7 days')  AS active_7d,
    count(*) FILTER (WHERE "createdAt"    > now() - interval '30 days') AS new_30d,
    count(*) FILTER (WHERE "totalXp" > 0) AS with_xp
  FROM "User"`));

show('Забони омӯзиш (User.targetLang)', await q(`
  SELECT coalesce("targetLang",'(нест)') AS lang, count(*) AS users,
    count(*) FILTER (WHERE "lastActiveAt" > now() - interval '30 days') AS active_30d
  FROM "User" GROUP BY 1 ORDER BY users DESC`));

show('UserLanguage', await q(`
  SELECT l.code, count(*) AS rows, count(*) FILTER (WHERE ul."isCurrent") AS current,
    round(avg(ul.xp)) AS avg_xp
  FROM "UserLanguage" ul JOIN "Language" l ON l.id=ul."languageId" GROUP BY l.code ORDER BY rows DESC`));

show('Забони модарӣ / UI', await q(`
  SELECT "nativeLang", count(*) AS users FROM "User" GROUP BY 1 ORDER BY 2 DESC`));

show('Мамлакат', await q(`
  SELECT coalesce(country,'(нест)') AS country, count(*) AS users FROM "User" GROUP BY 1 ORDER BY 2 DESC LIMIT 10`));

show('Прогресси дарс аз рӯи забон', await q(`
  SELECT t.code AS target, count(DISTINCT p."userId") AS learners, count(*) AS lessons_done
  FROM "UserProgress" p JOIN "Lesson" ls ON ls.id=p."lessonId" JOIN "Module" m ON m.id=ls."moduleId"
  JOIN "Course" c ON c.id=m."courseId" JOIN "Language" t ON t.id=c."targetLanguageId"
  WHERE p."isCompleted" GROUP BY 1 ORDER BY learners DESC`));
