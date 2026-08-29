// ─────────────────────────────────────────────────────────────────────────────
// 04 — Эмоҷиҳои ягона барои Модули 4 (рақамҳо, рӯзҳо, моҳҳо)
//
// ЧАРО. Эмоҷӣ дар СЕ ҷо нишон дода мешавад: корти «Калимаи нав», машқи
// ҳиҷҷӣ (`ExSpell`) ва плиткаҳои «Ҷуфт кардан». Дар Модули 4 панҷ дарс як
// эмоҷиро ба ҲАМАИ калимаҳои худ медиҳанд:
//
//   Д4  🔢 → Sixteen, Seventeen, Eighteen, Nineteen
//   Д5  🔢 → Thirty … One Hundred (8 калима)
//   Д6  📅 → ҳамаи 7 рӯзи ҳафта
//   Д7  🗓 → January … June
//   Д8  📅 → July … December
//
// Барои хонандае, ки ба расм такя мекунад (персонаи Даврон), тамоми модул
// «кӯр» аст. Дар аудити «Фарзона» маҳз M4 сеюмин ҷои гумшавии дил буд (39).
//
// ⚠️ ТАҒЙИРИ ҶУФТИ ДАР DART. Эмоҷии ЯГОНА машқи «Ин чист?»-ро (`ExPick`)
//    фаъол мекунад: шарти он `emojiCounts[emoji] == 1` аст. Барои РАҚАМҲО ин
//    хатар надорад (`partOfSpeech = 'numeral'`, ва `_isPicturable` танҳо
//    исмро мегузаронад), вале рӯзҳо ва моҳҳо дар база ИСМанд — яъне баъди ин
//    скрипт барнома метавонад 🌛-ро нишон диҳад ва пурсад «ин кадом калима
//    аст?», ки ҷавобаш «Monday» бошад. Ин гумроҳкунанда аст.
//
//    Бинобар ин ба `_kNonPicturableWords` дар `unit_lesson_screen.dart`
//    рӯзҳои ҳафта ва моҳҳо илова карда шуданд. Ду тағйир бояд ЯКҶОЯ раванд.
//
// Иҷро:  node 04-emojis-m4.mjs           (dry-run)
//        node 04-emojis-m4.mjs --apply
// ─────────────────────────────────────────────────────────────────────────────
import { connect, loadCourse, loc, Changes } from './_lib.mjs';

const EMOJI = {
  // ── Рақамҳо: клавиши рақамӣ, ҳамон услубе, ки Д1–Д3 аллакай доранд ───────
  'sixteen': '1️⃣6️⃣', 'seventeen': '1️⃣7️⃣', 'eighteen': '1️⃣8️⃣', 'nineteen': '1️⃣9️⃣',
  'thirty': '3️⃣0️⃣', 'forty': '4️⃣0️⃣', 'fifty': '5️⃣0️⃣', 'sixty': '6️⃣0️⃣',
  'seventy': '7️⃣0️⃣', 'eighty': '8️⃣0️⃣', 'ninety': '9️⃣0️⃣', 'one hundred': '💯',

  // ── Рӯзҳои ҳафта: лангари визуалии ягона ─────────────────────────────────
  // Аз эмоҷиҳои Д9 (☀️ Afternoon, 🌙 Night, 🌆 Evening, 🌅 Morning) қасдан
  // ҷудо интихоб шуданд, то дар доираи як модул такрор нашаванд.
  'monday': '🌛',     // Mon ← moon
  'tuesday': '🔥',
  'wednesday': '🐪',  // «hump day» — миёнаи ҳафта
  'thursday': '⚡',
  'friday': '🕌',     // ҷумъа
  'saturday': '🛒',
  'sunday': '🌞',     // Sun ← sunday

  // ── Моҳҳо: лангари фаслӣ/фарҳангӣ ────────────────────────────────────────
  'january': '❄️',
  'february': '🧥',
  'march': '🌷',      // Наврӯз — 21 март
  'april': '🌧️',
  'may': '🌸',
  'june': '🌻',
  'july': '🏖️',
  'august': '🍉',
  'september': '🎒',  // мисоли ҳамон корт: "School starts in September"
  'october': '🍂',
  'november': '🌫️',
  'december': '⛄',
};

const sql = connect();
const modules = await loadCourse(sql);
const ch = new Changes('04 — Эмоҷиҳои ягона (Модули 4)');

for (const mod of modules) {
  for (const L of mod.lessons) {
    for (const w of L.words) {
      const want = EMOJI[w.word.trim().toLowerCase()];
      if (!want) continue;
      ch.add({
        table: 'Word', id: w.id, field: 'emoji',
        from: w.emoji, to: want, where: `${loc(mod, L)} · «${w.word}»`,
      });
    }
  }
}

ch.print();

// ── Санҷиш: баъди ислоҳ дар ҳар дарс эмоҷии такрорӣ мемонад? ──────────────
console.log('\n  Санҷиши баъдӣ — эмоҷии такрорӣ дар дохили як дарс:');
let dup = 0;
for (const mod of modules) {
  for (const L of mod.lessons) {
    const cnt = {};
    for (const w of L.words) {
      const e = (EMOJI[w.word.trim().toLowerCase()] ?? w.emoji ?? '').trim();
      if (e) (cnt[e] ??= []).push(w.word);
    }
    for (const [e, ws] of Object.entries(cnt)) {
      if (ws.length > 1) { dup++; console.log(`    ${loc(mod, L)}  ${e} → ${ws.join(', ')}`); }
    }
  }
}
if (!dup) console.log('    ✓ дар Модули 4 такрор намонд');
else console.log(`    ⚠️  ${dup} такрор дар дигар модулҳо боқӣ монд (доираи ин скрипт нест)`);

ch.writeSql(new URL('./out/04-emojis-m4.sql', import.meta.url).pathname.replace(/^\//, ''));
await ch.apply(sql);
