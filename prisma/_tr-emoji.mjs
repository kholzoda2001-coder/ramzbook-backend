// Эмоҷии ҳар калимаи туркӣ — дуруст ва дар як дарс ЯГОНА.
//
// Ду мушкил ислоҳ мешавад:
//  1. 68 калима умуман эмоҷӣ надоштанд. Агар калима расм надошта бошад (ё исм
//     набошад), корт тамоман холӣ мемонад.
//  2. Дар як дарс чанд калима ЯК эмоҷӣ доштанд. Дар машқи «интихоб» хонанда
//     маҳз ба расм нигоҳ мекунад — ду корти якхела ӯро боварӣ медиҳад, ки ин
//     калимаҳо ҳаммаъноянд. Бадтаринаш М6 буд: «Yatak» (кати хоб) эмоҷии
//     курсӣ 🪑 дошт, ва «Büyük/Küçük» ҳарду фил 🐘.
//
// Ҳам файли мазмун, ҳам база навсозӣ мешавад — вагарна билди навбатӣ бармегардонад.
//
//   node prisma/_tr-emoji.mjs [--apply]
import { readFileSync, writeFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')
    .filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sql = neon(env.DATABASE_URL);
const q = (t, p) => (p ? sql.query(t, p) : sql.query(t));
const COURSE = 'cmqdgwx740002c7nfgyzaaj8v';
const APPLY = process.argv.includes('--apply');

const EMOJI = {
  // ── M0: саломпурсӣ, муаррифӣ ──
  'Merhaba': '👋', 'Hoş geldin': '🤗', 'Görüşmek üzere': '🙌', 'Hoşça kal': '🚪',
  'Evet': '✅', 'Hayır': '❌', 'Teşekkür ederim': '💐', 'Afedersiniz': '🙇',
  'Ben (öğrenci)yim': '🎓', 'Ad': '🏷️', 'Kim': '🧐', 'Ne': '🤔',
  'Adam': '👨', 'Oğlan': '👦', 'Kız': '👧',
  'Günaydın': '🌅', 'İyi günler': '☀️', 'İyi akşamlar': '🌇', 'İyi geceler': '🌙',
  'Nasılsın?': '💬', 'Çok iyi': '👍', 'De / Da': '➕',
  'Benim adım': '📛', 'Tanışmak': '🤝', 'Soyad': '📇', 'Senin adın ne?': '🙋‍♂️',
  // ── M1: оила ──
  'Aile': '👪', 'Anne': '👩', 'Baba': '👨‍🦱', 'Ebeveynler': '👫',
  'Erkek kardeş': '👦', 'Kız kardeş': '👧', 'Kardeşler': '🧒🧒',
  'Dede': '👴', 'Nine': '👵', 'Amca': '🧔', 'Dayı': '🧑', 'Hala': '👩‍🦰', 'Teyze': '👩‍🦱',
  'Kuzen': '🧑‍🤝‍🧑', 'Evli': '💍', 'Bekar': '🙋',
  'Benim bir erkek kardeşim var': '🗣️', 'Benim kardeşim yok': '🚫',
  'Ben': '🙋', 'Sen': '👉', 'O': '👤', 'Biz': '👥', 'Siz': '🫵', 'Onlar': '👨‍👩‍👧‍👦',
  'Çocuk': '🧒', 'Torun': '🧸',
  // ── M2: рақамҳо ──
  'Bir': '1️⃣', 'İki': '2️⃣', 'Üç': '3️⃣',
  'On bir': '1️⃣1️⃣', 'On iki': '1️⃣2️⃣', 'On üç': '1️⃣3️⃣', 'On dört': '1️⃣4️⃣', 'On beş': '1️⃣5️⃣',
  'Otuz': '3️⃣0️⃣', 'Kırk': '4️⃣0️⃣', 'Elli': '5️⃣0️⃣', 'Altmış': '6️⃣0️⃣',
  'Yetmiş': '7️⃣0️⃣', 'Seksen': '8️⃣0️⃣', 'Doksan': '9️⃣0️⃣',
  'Yüz': '💯', 'Bin': '🔢', 'Sayı': '🧮', 'Numara': '☎️',
  'İki yüz': '2️⃣0️⃣0️⃣', 'Beş yüz': '5️⃣0️⃣0️⃣', 'İki bin': '2️⃣0️⃣0️⃣0️⃣',
  // ── M3: ранг ва сифат ──
  'Büyük': '🐘', 'Küçük': '🐁', 'İyi': '👍', 'Kötü': '👎',
  // ── M4: вақт ──
  'Sabah': '🌅', 'Akşam': '🌆', 'Gece': '🌃', 'Gün': '📅',
  // ── M5: хӯрок ──
  'İçecek': '🍹', 'Su': '💧',
  // ── M6: хона ──
  'Oda': '🚪', 'Salon': '🛋️', 'Mutfak': '🍳',
  'Mobilya': '🗄️', 'Koltuk': '🛋️', 'Yatak': '🛏️', 'Masa': '🪑', 'Sandalye': '💺',
  'Televizyon': '📺', 'Pencere': '🪟',
  // ── M7: либос ва харид ──
  'Kıyafet': '🧺', 'Elbise': '👗', 'Pantolon': '👖', 'Ayakkabı': '👟',
  'Bere': '🧶', 'Atkı': '🧣', 'Pahalı': '💸', 'Ucuz': '🪙',
  'Ne kadar?': '❓', 'İndirim': '🏷️',
  // ── M8: шаҳр ──
  'Sokak': '🛣️', 'Cadde': '🌆', 'Gitmek': '🚶', 'Geçmek': '↔️',
  // ── M9: касб ──
  'Meslek': '💼', 'Öğretmen': '🧑‍🏫', 'Doktor': '🩺', 'İş': '🧑‍💻', 'Ofis': '🏢',
  // ── M10: хобби ──
  'Hobi': '🎯', 'Okumak': '📖',
  // ── M11: бадан ва саломатӣ ──
  'Baş': '🙂', 'Göz': '👁️', 'Hasta': '🤒', 'Ağrı': '💢', 'İlaç': '💊', 'Hap': '🟡',
  // ── M12: сафар ──
  'Pasaport': '🛂', 'Vize': '📑', 'Ülke': '🌍', 'Harita': '🗺️',
  // ── M13: гузашта ──
  'Önce': '⏮️', 'O zaman': '⏳', 'Tarih': '📆', 'Evvelki gün': '🗓️',
};

// ── Санҷиш: як эмоҷӣ ба ду калимаи ЯК дарс наафтад ──────────────────────────
const ws = await q(
  `SELECT w.id, w.word, w.translation, w.emoji, l.id lid, l.title lt, l."skillType" st, m."order" mo
   FROM "Word" w JOIN "Lesson" l ON w."lessonId"=l.id JOIN "Module" m ON l."moduleId"=m.id
   WHERE m."courseId"=$1 ORDER BY m."order", l."order", w."order"`, [COURSE]);

const next = w => EMOJI[w.word] ?? w.emoji;
const byLesson = {};
ws.forEach(w => { (byLesson[w.lid] = byLesson[w.lid] || []).push(w); });
const clashes = [];
for (const list of Object.values(byLesson)) {
  if (list[0].st !== 'vocab') continue;
  const seen = {};
  for (const w of list) {
    const e = next(w);
    if (!e) continue;
    (seen[e] = seen[e] || []).push(w);
  }
  for (const [e, wl] of Object.entries(seen)) {
    if (wl.length > 1) clashes.push(`M${list[0].mo} «${list[0].lt}» ${e}: ${wl.map(x => x.word).join(', ')}`);
  }
}
const missing = ws.filter(w => !next(w));
const plan = ws.filter(w => EMOJI[w.word] && w.emoji !== EMOJI[w.word]);

console.log(`калимаҳо: ${ws.length} · тағйир: ${plan.length} · бе эмоҷӣ баъд аз ислоҳ: ${missing.length} · бархӯрд: ${clashes.length}`);
clashes.forEach(c => console.log('  ⚠ ' + c));
missing.slice(0, 20).forEach(w => console.log(`  ✗ ${w.word} = ${w.translation}`));
if (!APPLY) { console.log('\n(нақша) --apply'); process.exit(clashes.length || missing.length ? 1 : 0); }
if (clashes.length || missing.length) { console.error('⛔ аввал бархӯрд/холигиро ҳал кунед'); process.exit(1); }

// ── 1. Файлҳои мазмун ───────────────────────────────────────────────────────
let touched = 0;
for (let n = 1; n <= 15; n++) {
  const p = new URL(`./_tr-m${n}-content.mjs`, import.meta.url);
  let s;
  try { s = readFileSync(p, 'utf8'); } catch { continue; }
  const before = s;
  s = s.replace(/\{ word: '((?:[^'\\]|\\.)*)',([^}]*)\}/g, (m, word, body) => {
    const e = EMOJI[word];
    if (!e) return m;
    if (/emoji: '[^']*'/.test(body)) return `{ word: '${word}',${body.replace(/emoji: '[^']*'/, `emoji: '${e}'`)}}`;
    return `{ word: '${word}', emoji: '${e}',${body}}`;
  });
  if (s !== before) { writeFileSync(p, s); touched++; }
}
console.log(`✓ файлҳои мазмун: ${touched}`);

// ── 2. База ─────────────────────────────────────────────────────────────────
for (let i = 0; i < plan.length; i += 100) {
  const chunk = plan.slice(i, i + 100);
  const values = chunk.map((_, k) => `($${k * 2 + 1}, $${k * 2 + 2})`).join(',');
  await q(`UPDATE "Word" t SET emoji = v.e FROM (VALUES ${values}) AS v(id, e) WHERE t.id = v.id`,
    chunk.flatMap(w => [w.id, EMOJI[w.word]]));
}
await q(`UPDATE "Module" SET "contentVersion" = "contentVersion" + 1 WHERE "courseId"=$1`, [COURSE]);
await q(`UPDATE "AppSetting" SET "updatedAt" = NOW() WHERE key='content_version'`);
console.log(`✓ база: ${plan.length} калима`);
