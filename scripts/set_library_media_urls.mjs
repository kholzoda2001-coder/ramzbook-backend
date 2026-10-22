// Файлҳои Китобхонаро аз `files.catbox.moe` (ҳоло кор намекунад) ба jsDelivr мегузаронад.
//
// Ҳар URL-и нав АВВАЛ санҷида мешавад (HEAD → 200); он чи дастнорас аст, ИВАЗ намешавад.
// Пешфарз — «санҷиш»: ҳеҷ чиз навишта намешавад. Барои навиштан `--apply`.
//
// Иҷро (дар папкаи ramzbook-backend; РАМЗ ҲАМИН ҷо, дар компютери шумо, мемонад):
//
//   санҷиши URL-ҳо бе логин:      node scripts/set_library_media_urls.mjs --check-only
//   пешнамоиши тағйирот:          ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/set_library_media_urls.mjs
//   навиштан:                     ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/set_library_media_urls.mjs --apply
//
// Ихтиёрӣ: BASE_URL (пешфарз https://admin.ramz.tj),
//          --korean=full|text  — кадом файли «2001 калимаи кореягӣ» гузошта шавад
//          (ҳарду дар ramz-audio ҳастанд; бе ин нишона ин воҳид гузашта мешавад).

const CDN = 'https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio@main/books/';

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n) => args.find((a) => a.startsWith(`${n}=`))?.split('=')[1];

const BASE = (process.env.BASE_URL || 'https://admin.ramz.tj').replace(/\/$/, '');
const apply = flag('--apply');
const checkOnly = flag('--check-only');

// id-и воҳид (аз /api/mobile/library) → файл дар ramz-audio/books.
const MAP = [
  { id: 'cmsaabuof00009r6p9xpy66zq', title: 'Оила — англисӣ', file: 'family_100_words.epub' },
  { id: 'cmsabcx3s001yoys57ovt1yen', title: 'Оила — русӣ', file: 'family_100_ru.epub' },
  { id: 'cmsabcy2n001zoys54eh4wrsu', title: 'Оила — немисӣ', file: 'family_100_de.epub' },
  { id: 'cmsabcz1d0020oys5cmaj5007', title: 'Оила — арабӣ', file: 'family_100_ar.epub' },
  { id: 'cmsabd0070021oys5aqb7qr6i', title: 'Оила — кореягӣ', file: 'family_100_ko.epub' },
  { id: 'cmtts3egc000afzxmbyzyrltg', title: 'Audio (аудио)', file: 'audio_en_7xvfyt.mp3' },
];
const korean = opt('--korean');
if (korean === 'full' || korean === 'text') {
  MAP.push({
    id: 'cmsxqq3ti0000s76s930n4lka',
    title: '2001 калимаи кореягӣ',
    file: korean === 'full' ? 'korean_2001.epub' : 'korean_2001_text.epub',
  });
}
// «100 муколамаи ҳаётӣ» (cmtww8qdt0000722wzkxogtg4): файл дар ramz-audio нест — гузашта мешавад.

async function exists(url) {
  try {
    const r = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(20000) });
    return r.ok;
  } catch {
    return false;
  }
}

console.log(`Сервер: ${BASE} · ${apply ? 'НАВИШТАН' : checkOnly ? 'танҳо санҷиши URL' : 'пешнамоиш (бе навиштан)'}\n`);

const ready = [];
for (const m of MAP) {
  const url = CDN + m.file;
  const ok = await exists(url);
  console.log(`${ok ? '✓' : '✗'} ${m.title.padEnd(24)} ${url}`);
  if (ok) ready.push({ ...m, url });
}
if (!korean) console.log('• «2001 калимаи кореягӣ»: гузашта шуд (--korean=full ё --korean=text нишон диҳед).');
console.log('• «100 муколамаи ҳаётӣ»: гузашта шуд (файл дар ramz-audio нест).\n');

if (checkOnly) process.exit(ready.length === MAP.length ? 0 : 1);

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
if (!email || !password) {
  console.error('ADMIN_EMAIL ва ADMIN_PASSWORD лозиманд (муҳити ҷорӣ, на дар код).');
  process.exit(2);
}

const login = await fetch(`${BASE}/api/admin/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
if (!login.ok) {
  console.error(`Вуруд ба админ нашуд (HTTP ${login.status}). Email/паролро санҷед.`);
  process.exit(3);
}
const cookie = (login.headers.getSetCookie?.() ?? [login.headers.get('set-cookie') ?? ''])
  .map((c) => c.split(';')[0])
  .join('; ');

let changed = 0;
for (const m of ready) {
  const cur = await fetch(`${BASE}/api/admin/library/${m.id}`, { headers: { cookie } });
  if (!cur.ok) {
    console.log(`✗ ${m.title}: воҳид ёфт нашуд (HTTP ${cur.status})`);
    continue;
  }
  const item = (await cur.json()).item;
  if (item.mediaUrl === m.url) {
    console.log(`= ${m.title}: аллакай дуруст аст`);
    continue;
  }
  console.log(`${apply ? '→' : '~'} ${m.title}\n    ${item.mediaUrl}\n    ${m.url}`);
  if (!apply) continue;
  // PUT-и қисмӣ: танҳо `mediaUrl`; саҳифаҳо (`pages`) намеоянд, пас дақиқан нигоҳ дошта мешаванд.
  const put = await fetch(`${BASE}/api/admin/library/${m.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', cookie },
    body: JSON.stringify({ mediaUrl: m.url }),
  });
  if (put.ok) changed++;
  else console.log(`   ✗ навишта нашуд (HTTP ${put.status})`);
}
console.log(apply ? `\nНавишта шуд: ${changed} аз ${ready.length}.` : '\nБе навиштан. Барои татбиқ: --apply');
