import { q } from './db.mjs';
const ids = ['cmsd0vurx000d10cp6e8xfeaa','cmr4vksjr0007g4jr3dqmir6y','cmskcyote000jevc45xdi65he','cmqngcvuj0013ee51awqtol03'];
const r = await q(`select l.title, ce.kind, ce.title as ctitle, ce."audioUrl" is not null as audio, length(ce.passage) plen from "Lesson" l join "ComprehensionExercise" ce on ce.id=l."comprehensionId" where l.id = any($1)`, [ids]);
console.table(r);
const w = await q(`select count(*)::int total, count(ipa)::int with_ipa, count("ipaTajik")::int with_ipatj, count("audioUrl")::int with_audio from "Word" w join "Lesson" l on l.id=w."lessonId" where l."moduleId"='cmqngcvui0001ee513prbg336'`);
console.log('Words in module:', w[0]);
const sample = await q(`select word, translation, ipa, "ipaTajik", example from "Word" w join "Lesson" l on l.id=w."lessonId" where l."moduleId"='cmqngcvui0001ee513prbg336' order by l."order", w."order" limit 4`);
console.table(sample);
