// Oʻzbekcha (uz) — ona tili / interfeys tili sifatida QOʻSHADI (2026-10-14).
//
// Nima qiladi (hammasi idempotent — qayta ishga tushirish xavfsiz):
//   1. `Language` qatori `uz`: nativeName «Oʻzbekcha», 🇺🇿, ttsLocale/sttLocale uz-UZ.
//      ⚠️ canBeNative = FALSE (yashirin) boʻlib yaratiladi. Sabab: eski ilova
//      versiyalarida strings_uz.dart YOʻQ — ularda «Oʻzbekcha»ni tanlagan
//      odam inglizcha interfeys oladi. Yangi ilova chiqqach /admin/languages
//      sahifasida «Faollashtirish» tugmasini bosing (yoki --native bilan).
//   2. `Achievement.nameTranslations/descriptionTranslations` ga `uz` kaliti
//      (faqat `uz` yoʻq yoki tojikcha nusxa boʻlgan joylarda).
//   3. Push kampaniyalar: tojikcha zanjirdan `uz` olib tashlanadi, ikkita oʻzbek
//      zanjiri (19:00 yumshoq, 22:00 kuchli) yaratiladi; boshqa kampaniyalarga
//      (Gapirish kuni, doʻst, tikish, win-back) `uz` matn qoʻshiladi.
//
// Prisma bu mashinadan Neon'ga yetmaydi — HTTP drayver, ниг. [[ramz-db-scripts-local]].
//
//   node prisma/add-uzbek-native-http.mjs --dry
//   node prisma/add-uzbek-native-http.mjs
//   node prisma/add-uzbek-native-http.mjs --native     # + canBeNative = true
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);
const DRY = process.argv.includes('--dry');
const NATIVE = process.argv.includes('--native');
const cuid = () => 'c' + [...crypto.getRandomValues(new Uint8Array(12))].map(b => b.toString(36).padStart(2, '0')).join('').slice(0, 24);
const say = (...a) => console.log(...a);

// ── 1. Language ─────────────────────────────────────────────────────────────
{
  const [row] = await sql.query(`SELECT id, "canBeNative" FROM "Language" WHERE code = 'uz'`);
  if (row) {
    say(`Language uz: bor (canBeNative=${row.canBeNative})`);
    if (NATIVE && !row.canBeNative) {
      say('  → canBeNative = true');
      if (!DRY) await sql.query(`UPDATE "Language" SET "canBeNative" = true WHERE code = 'uz'`);
    }
  } else {
    say(`Language uz: YOʻQ → yaratiladi (canBeNative=${NATIVE})`);
    if (!DRY) {
      await sql.query(
        `INSERT INTO "Language" (id, code, name, "nativeName", flag, "canBeNative", "canBeTarget", "order", "isActive",
                                 "ttsLocale", "sttLocale", direction, "hasIPA")
         VALUES ($1, 'uz', 'Uzbek', $2, '🇺🇿', $3, false, 7, true, 'uz-UZ', 'uz-UZ', 'ltr', false)`,
        [cuid(), 'Oʻzbekcha', NATIVE]);
    }
  }
}

// ── 2. Achievements ─────────────────────────────────────────────────────────
const ACH = {
  lessons_10:  ['Yangi boshlovchi', '10 ta darsni tugating'],
  lessons_50:  ['Barqaror',         '50 ta darsni tugating'],
  lessons_100: ['Ustoz',            '100 ta darsni tugating'],
  lessons_500: ['Muallim',          '500 ta darsni tugating'],
  premium:     ['Premium a’zo',     'Premium obunaga ega boʻling'],
  streak_3:    ['Yaxshi boshlanish','3 kun ketma-ket oʻrganing'],
  streak_7:    ['Bir hafta',        '7 kun ketma-ket oʻrganing'],
  streak_30:   ['Olov',             '30 kun ketma-ket oʻrganing'],
  streak_100:  ['Afsonaviy',        '100 kun ketma-ket oʻrganing'],
  streak_365:  ['Oltin yil',        '365 kun ketma-ket oʻrganing'],
  words_100:   ['Lugʻatdon',        '100 ta soʻz oʻrganing'],
  xp_1000:     ['Talaba',           '1000 ball toʻplang'],
  xp_5000:     ['Olim',             '5000 ball toʻplang'],
  xp_10000:    ['Donishmand',       '10000 ball toʻplang'],
  xp_50000:    ['Daho',             '50000 ball toʻplang'],
};
const CYR = /[А-Яа-яЁёӢӣӮӯҲҳҚқҒғҶҷ]/;
const BAD_DESC = /^Reach /;
{
  const rows = await sql.query(`SELECT code, "nameTranslations" n, "descriptionTranslations" d FROM "Achievement"`);
  let changed = 0;
  for (const r of rows) {
    const want = ACH[r.code];
    if (!want) continue;
    const n = { ...r.n }, d = { ...r.d };
    const nameBad = !n.uz || CYR.test(n.uz);
    const descBad = !d.uz || BAD_DESC.test(d.uz) || CYR.test(d.uz);
    if (!nameBad && !descBad) continue;
    if (nameBad) n.uz = want[0];
    if (descBad) d.uz = want[1];
    changed++;
    say(`Achievement ${r.code}: uz = «${n.uz}» / «${d.uz}»`);
    if (!DRY) {
      await sql.query(
        `UPDATE "Achievement" SET "nameTranslations" = $1::jsonb, "descriptionTranslations" = $2::jsonb WHERE code = $3`,
        [JSON.stringify(n), JSON.stringify(d), r.code]);
    }
  }
  say(`Achievement: ${changed} ta yangilandi`);
}

// ── 3. Push kampaniyalar ────────────────────────────────────────────────────
const SOFT_UZ = { title: '{name}, dars vaqti keldi 📚', body: 'Bugun hali oʻqimadingiz. {lesson} — atigi {minutes} daqiqa.' };
const HARD_UZ = { title: '🚨 {countdown} qoldi!', body: '⏳ {streak} kunlik streak’ingiz bugun kechasi yonib ketadi. 5 daqiqa yetarli: {lesson}.' };
const UZ_BY_NAME = {
  'Гуфтори рӯз 19:00': { title: '🗣 {name}, bugun buni ayting', body: '«{phrase}» ({phrase_tr}) — 3 daqiqa gapirish, va bu ibora sizniki.' },
  'Силсила бо дӯст 19:30': { title: 'Doʻstingiz kutmoqda 🤝', body: 'Umumiy streak’ingiz bugun uziladi. {countdown} qoldi — {lesson}.' },
  'Гарави алмос 20:15': { title: '💎 Tikkaningiz xavf ostida', body: '{name}, bugun oʻqimadingiz — {countdown} qoldi. Bitta dars va olmoslaringiz saqlanadi.' },
  'Win-back · 3 рӯз': { title: '{name}, {days_inactive} kundan beri yoʻqsiz 👀', body: '{lesson} sizni kutmoqda — atigi {minutes} daqiqa.' },
  'Win-back · 7 рӯз': { title: '{days_inactive} kun oʻtdi 📚', body: 'Til takrorlamasa tez unutiladi. Bugun 5 daqiqa yetarli — {lesson}.' },
  'Win-back · 14 рӯз': { title: 'Sizni sogʻindik, {name} 😔', body: '{days_inactive} kun boʻldi. Bugun 2 daqiqa ham yetarli — {lesson}.' },
  'Win-back · 30 рӯз': { title: 'Qaytib keling! 🎁', body: '{name}, {days_inactive} kun oʻtdi. Yuraklaringiz toʻla — qolgan joyingizdan davom eting.' },
};
{
  const rows = await sql.query(`SELECT * FROM "PushCampaign"`);
  const byName = new Map(rows.map(r => [r.name, r]));

  // 3a. Tojikcha zanjirdan uz olib tashlanadi.
  for (const name of ['Ёдрасони нарм 19:00 — тоҷикӣ', 'Огоҳии қавӣ 22:00 — тоҷикӣ']) {
    const r = byName.get(name);
    if (!r) { say(`Kampaniya YOʻQ: ${name}`); continue; }
    if ((r.langs ?? '').split(',').includes('uz')) {
      say(`Kampaniya «${name}»: langs ${r.langs} → tg,en`);
      if (!DRY) await sql.query(`UPDATE "PushCampaign" SET langs = 'tg,en', "updatedAt" = now() WHERE id = $1`, [r.id]);
    }
  }

  // 3b. Ikkita oʻzbek zanjiri (tojikchalarning nusxasi).
  for (const [srcName, newName, tx, prio] of [
    ['Ёдрасони нарм 19:00 — тоҷикӣ', 'Ёдрасони нарм 19:00 — ӯзбекӣ', SOFT_UZ, 12],
    ['Огоҳии қавӣ 22:00 — тоҷикӣ', 'Огоҳии қавӣ 22:00 — ӯзбекӣ', HARD_UZ, 22],
  ]) {
    if (byName.has(newName)) { say(`Kampaniya bor: ${newName}`); continue; }
    const src = byName.get(srcName);
    if (!src) { say(`Manba yoʻq: ${srcName}`); continue; }
    say(`Kampaniya yaratiladi: ${newName}`);
    if (DRY) continue;
    await sql.query(
      `INSERT INTO "PushCampaign"
         (id, name, kind, "isActive", hour, minute, "tzOffsetMin", weekdays, langs, tier, "studiedToday",
          "minStreak", "maxStreak", "minInactiveDays", "maxInactiveDays", levels, countries,
          "friendStreak", wager, speaking, texts, route, "countdownToHour", priority, "cooldownHours", "updatedAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'uz',$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20::jsonb,$21,$22,$23,$24, now())`,
      [cuid(), newName, src.kind, src.isActive, src.hour, src.minute, src.tzOffsetMin, src.weekdays, src.tier, src.studiedToday,
       src.minStreak, src.maxStreak, src.minInactiveDays, src.maxInactiveDays, src.levels, src.countries,
       src.friendStreak, src.wager, src.speaking, JSON.stringify({ uz: tx }), src.route, src.countdownToHour, prio, src.cooldownHours]);
  }

  // 3c. Qolganlarga uz matn.
  for (const [name, tx] of Object.entries(UZ_BY_NAME)) {
    const r = byName.get(name);
    if (!r) { say(`Kampaniya YOʻQ: ${name}`); continue; }
    if (r.texts?.uz) { say(`uz bor: ${name}`); continue; }
    say(`uz qoʻshiladi: ${name}`);
    if (!DRY) {
      await sql.query(`UPDATE "PushCampaign" SET texts = texts || $1::jsonb, "updatedAt" = now() WHERE id = $2`,
        [JSON.stringify({ uz: tx }), r.id]);
    }
  }
}

say(DRY ? '\n--dry: hech narsa yozilmadi.' : '\nTayyor.');
