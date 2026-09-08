// Рақами WhatsApp-и дастгириро дар `AppSetting.login_settings` мегузорад.
//
// Ин ҳамон калидест, ки `/api/public/settings` ба барнома медиҳад ва саҳифаи
// админ `/admin/settings/login` онро таҳрир мекунад — пас баъди ин рақамро
// бе билди нав низ иваз кардан мумкин аст.
//
// Чаро дастӣ: аз ин мошин Prisma ба Neon намерасад. Ниг. [[ramz-db-scripts-local]].
//
//   node prisma/_set-whatsapp-number-http.mjs --dry
//   node prisma/_set-whatsapp-number-http.mjs
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);
const q = (t, p) => sql.query(t, p);

const DRY = process.argv.includes('--dry');
const KEY = 'login_settings';
const NUMBER = '+971508385259';

const rows = await q(`SELECT "valueJson" FROM "AppSetting" WHERE key = $1`, [KEY]);
if (!rows.length) { console.log(`Сатри «${KEY}» нест — аввал аз /admin/settings/login нигоҳ доред.`); process.exit(1); }

// Дигар майдонҳо (googleClientId, telegramBotToken) дар ҳамин JSON-анд —
// merge, на overwrite: вагарна логини Google меафтад.
const cfg = JSON.parse(rows[0].valueJson);
console.log(`ҳозир: ${cfg.whatsappSupportNumber}`);
if (cfg.whatsappSupportNumber === NUMBER) { console.log('Аллакай ҳамин аст, коре нест.'); process.exit(0); }
if (DRY) { console.log(`[--dry] → ${NUMBER}`); process.exit(0); }

cfg.whatsappSupportNumber = NUMBER;
await q(`UPDATE "AppSetting" SET "valueJson" = $1 WHERE key = $2`, [JSON.stringify(cfg), KEY]);

const [after] = await q(`SELECT "valueJson" FROM "AppSetting" WHERE key = $1`, [KEY]);
const now = JSON.parse(after.valueJson);
console.log(`шуд:   ${now.whatsappSupportNumber} · googleClientId ${now.googleClientId ? 'сиҳат' : 'ХОЛӢ (!)'}`);
