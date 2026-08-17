// Расми олмониро аз расмҳои АЛЛАКАЙ МАВҶУДИ англисӣ месозад.
//
// Расми «падар» дар ҳама забон як хел аст — барои ҳар забон аз нав сохтан
// маъно надорад. Барнома расмро аз рӯи номи файл мегирад
// (`images/<lang>/<калид>.png`), пас кофист ҳамон файлро зери калиди олмонӣ
// гузорем: `images/en/father.png` → `images/de/der_vater.png`.
//
// Чаро ин нусхаи файл аст, на истиноди `images/en/...`: калид аз матни ХУДИ
// калима сохта мешавад ва барнома ҳамеша дар папкаи забони курс меҷӯяд —
// ин дар `course_roadmap_screen.dart` сахткод шудааст.
//
// Калимае ки ҷуфти англисӣ надорад (der Onkel, die Geschwister…) расм
// намегирад ва эмоҷии худро нигоҳ медорад — ин рафтори мӯътадили барнома аст.
//
//   node prisma/_de-images-reuse.mjs <роҳ ба images/de>
import { writeFileSync, mkdirSync, existsSync } from 'fs';

const OUT = process.argv[2];
if (!OUT) { console.error('Истифода: node prisma/_de-images-reuse.mjs <роҳ ба images/de>'); process.exit(1); }
const CDN = 'https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio@main/images/en';

// калимаи олмонӣ → номи файли англисӣ.
// Танҳо мувофиқати МАЪНОӢ — ҳеҷ ҷо расми нодуруст гузошта нашудааст.
const MAP = {
  // Модули 1
  'der Mann': 'man',
  'die Frau': 'woman',
  'der Freund': 'friend',
  'der Junge': 'boy',
  'das Mädchen': 'girl',
  // Модули 2
  'die Familie': 'family',
  'der Vater': 'father',
  'die Mutter': 'mother',
  'das Kind': 'child',
  'die Eltern': 'parents',
  'der Bruder': 'brother',
  'die Schwester': 'sister',
  'der Sohn': 'son',
  'die Tochter': 'daughter',
  'die Großmutter': 'grandmother',
  'der Großvater': 'grandfather',
  'die Großeltern': 'grandparent',
  'die Tante': 'aunt',
  'der Cousin': 'cousin',
  'die Person': 'person',
  'die Leute': 'group',
  // Модули 3. Худи рақамҳо расм намегиранд — онҳо исм нестанд, ва дар англисӣ
  // ҳам «one/two/ten» расм надоранд. Танҳо ашёи ҳақиқӣ расм мегирад.
  'die Uhr': 'clock',
  'das Telefon': 'phone',
  'der Geburtstag': 'birthday',
  // Модули 4. Ранг ва сифат расм намегиранд — исм нестанд, ва англисӣ ҳам
  // барои red/big/new расм надорад. Танҳо ашёе ки тавсиф мешавад.
  'das Auto': 'car',
  'der Tisch': 'table',
  'der Stuhl': 'chair',
  'die Blume': 'flower',
  'das Buch': 'book',
  // Модули 5. Рӯзи ҳафта, моҳ ва мафҳумҳои вақт (die Woche, die Zeit, der Tag)
  // расм намегиранд — англисӣ ҳам барои week/day/time расм надорад.
  'der Morgen': 'morning',
  'der Abend': 'evening',
  'die Nacht': 'night',
  'das Frühstück': 'breakfast',
  'das Mittagessen': 'lunch',
  'das Abendessen': 'dinner',
};

// Ҳамон нормализатсияе, ки барнома дорад (`_normImageKey`).
const key = w => w.toLowerCase().trim().replace(/['’.,!?]/g, '').replace(/\s+/g, '_');

mkdirSync(OUT, { recursive: true });
let ok = 0, fail = 0;
for (const [de, en] of Object.entries(MAP)) {
  const dest = `${OUT}/${key(de)}.png`;
  const res = await fetch(`${CDN}/${en}.png`);
  if (!res.ok) { console.log(`  ✗ ${de} ← ${en}.png: HTTP ${res.status}`); fail++; continue; }
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 5000) { console.log(`  ✗ ${de} ← ${en}.png: файли шубҳанок (${buf.length} b)`); fail++; continue; }
  writeFileSync(dest, buf);
  console.log(`  ✓ ${key(de)}.png ← en/${en}.png  (${(buf.length / 1024).toFixed(0)} KB)`);
  ok++;
}
console.log(`\nНусха шуд: ${ok} · ноком: ${fail}`);
if (!existsSync(OUT)) process.exit(1);
