// Расмҳои вайрони Модули 3-ро МУВАҚҚАТАН дастнорас мекунад.
//
// Барнома манифест надорад (ниг. `_imageUrlFor` дар course_roadmap_screen.dart):
// URL-ро аз матни калима месозад ва агар файл 404 диҳад, худаш ба ЭМОҶӢ
// бармегардад. Пас кофист файл дар `images/ar/` набошад.
//
// Файлҳо НЕСТ КАРДА НАМЕШАВАНД — ба `images/_off/ar/` кӯчонида мешаванд, то
// баргардонидан як `git mv`-и баръакс бошад.
//
//   node prisma/_ar-m3-imgoff.mjs --dry
//   node prisma/_ar-m3-imgoff.mjs --on     ← баргардонидан
import { existsSync, mkdirSync, renameSync } from 'fs';
import { execFileSync } from 'child_process';

const DRY = process.argv.includes('--dry');
const BACK = process.argv.includes('--on');
const REPO = `${process.env.TEMP}/ramz-audio-img`.split('\\').join('/');
const CDN = 'https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio@main/images/ar';

// `رضيع` (Навзод) ин ҷо НЕСТ: худи расмаш хуб аст. Мушкил дар он буд, ки
// `طفل` (Кӯдак) АЙНАН ҲАМОН файлро нишон медод — пас танҳо `طفل` бардошта
// мешавад ва расми хуб ба Навзод мемонад.
const FILES = [
  ['الأسرة.png',   'Оила — чор калонсоли ҷомаи якранг дар ҷангал, бе кӯдак'],
  ['الوالدان.png', 'Волидон — як мард ва кӯдак, на падару модар'],
  ['العمة.png',    'Хола/Амма — ду зани мулоида, рӯй нимтамом'],
  ['الجدان.png',   'Бобо ва бибӣ — танҳо бибӣ ва кӯдак'],
  ['توأم.png',     'Дугоникҳо — рӯйҳои вайроншакл'],
  ['فريق.png',     'Даста — рӯйҳои каҷ, матни бемаънӣ рӯи либос'],
  ['مجموعة.png',   'Гурӯҳ — рӯй торику вайрон, пойҳо ғайритабиӣ'],
  ['طفل.png',      'Кӯдак — байт ба байт ҳамон файли Навзод'],
];

const git = (a, cwd = REPO) => execFileSync('git', a, { cwd, encoding: 'utf8' }).trim();
let ok = existsSync(`${REPO}/.git/HEAD`) && existsSync(`${REPO}/.git/config`);
if (ok) { try { git(['rev-parse', '--is-inside-work-tree']); } catch { ok = false; } }
if (!ok) {
  if (existsSync(REPO)) execFileSync('cmd', ['/c', 'rmdir', '/s', '/q', REPO.split('/').join('\\')]);
  execFileSync('git', ['clone', '--depth', '1', '--filter=blob:none', '--no-checkout',
    'https://github.com/kholzoda2001-coder/ramz-audio', REPO], { encoding: 'utf8' });
  git(['sparse-checkout', 'set', 'images/ar', 'images/_off']);
  git(['checkout', 'main']);
} else {
  git(['sparse-checkout', 'set', 'images/ar', 'images/_off']);
  git(['fetch', '--depth', '1', 'origin', 'main']);
  git(['reset', '--hard', 'origin/main']);
}

const LIVE = `${REPO}/images/ar`;
const OFF = `${REPO}/images/_off/ar`;
mkdirSync(OFF, { recursive: true });
let moved = 0;
for (const [f, why] of FILES) {
  const from = BACK ? `${OFF}/${f}` : `${LIVE}/${f}`;
  const to = BACK ? `${LIVE}/${f}` : `${OFF}/${f}`;
  if (!existsSync(from)) { console.log(`  · ${f} — ҷои интизор нест`); continue; }
  console.log(`  ${DRY ? '[dry] ' : '✓ '}${BACK ? 'баргашт' : 'бардошта шуд'}: ${f}  (${why})`);
  if (!DRY) renameSync(from, to);
  moved++;
}
if (DRY || !moved) { console.log(`\n${DRY ? '[dry] ' : ''}${moved} файл.`); process.exit(0); }

git(['add', 'images']);
if (!git(['status', '--porcelain']).trim()) console.log('\nтағйирот нест');
else {
  git(['-c', 'user.name=RAMZ Content', '-c', 'user.email=help@ramz.tj', 'commit', '-m',
    BACK ? 'Arabic images: restore Module 3 pictures'
         : 'Arabic Module 3: park 8 broken pictures so the app falls back to emoji']);
  git(['push', 'origin', 'main']);
  console.log('\npush шуд · ' + git(['rev-parse', '--short', 'HEAD']));
}

// jsDelivr шохаи `@main`-ро кэш мекунад — бе тозакунӣ расми кӯҳна соатҳо
// боқӣ мемонад. Ин эндпоинт кэши ҳар як файлро дарҳол бекор мекунад.
console.log('\n== Тозакунии кэши jsDelivr ==');
for (const [f] of FILES) {
  const url = `https://purge.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio@main/images/ar/${encodeURIComponent(f)}`;
  try {
    const r = await fetch(url);
    console.log(`  ${r.ok ? '✓' : '✗'} ${f}  ${r.status}`);
  } catch (e) { console.log(`  ✗ ${f}  ${e.message}`); }
}

console.log('\n== Санҷиш: акнун чӣ бармегардонад? ==');
let g = 0;
for (const [f] of FILES) {
  const r = await fetch(`${CDN}/${encodeURIComponent(f)}`, { method: 'GET' });
  const want = BACK ? r.ok : !r.ok;
  if (want) g++;
  console.log(`  ${want ? '✓' : '✗'} ${f}  HTTP ${r.status}${want ? (BACK ? ' — расм баргашт' : ' — эмоҷӣ нишон дода мешавад') : ' — ҲОЛО ҲАМ КӮҲНА'}`);
}
console.log(`\n${g}/${FILES.length} дуруст.`);
