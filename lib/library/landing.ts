/**
 * Саҳифаи ПАЙВАНДИ воҳиди Китобхона: `GET /l/<id>`.
 *
 * Корбар аз паёми WhatsApp/Telegram ин пайвандро мекушояд. Ду ҳолат:
 *  • барнома насб аст → тугмаи «Дар барнома кушоед» (`ramz://library/<id>`, бо
 *    `intent://` дар Android) ҳамон воҳидро мекушояд;
 *  • барнома насб нест → тугмаи Google Play бо `referrer=item=<id>`: баъди насб
 *    барнома онро мехонад ва ҳамон воҳидро бе ЯГОН савол (на забон, на ҳадаф)
 *    мекушояд.
 *
 * Саҳифа ҳеҷ чиз намепурсад. Забони матн аз `Accept-Language` меояд (пешфарз —
 * тоҷикӣ). Ин ҷо ЯГОН шабака/пойгоҳ нест: функсияҳои пок — то санҷида шаванд.
 */

export const ANDROID_PACKAGE = 'com.ramzbook.tj';
export const APP_SCHEME = 'ramz';

export type LandingLang = 'tg' | 'ru' | 'en';

export interface LandingItem {
  id: string;
  type: string;
  title: string;
  author?: string | null;
  description?: string | null;
  coverUrl?: string | null;
  priceTjs?: number | null;
  durationMin?: number | null;
}

const T: Record<LandingLang, Record<string, string>> = {
  tg: {
    tagline: 'RAMZ — омӯзиши забон',
    openApp: 'Дар барнома кушоед',
    getApp: 'Аз Google Play зеркашӣ кунед',
    book: 'Китоб',
    audio: 'Аудиокитоб',
    video: 'Видео',
    template: 'Шаблон',
    free: 'Қисми ройгон бе ворид шудан',
    price: '{n} смн',
    notFound: 'Ин маҳсулот ёфт нашуд',
    notFoundSub: 'Шояд он аз Китобхона бардошта шуда бошад. Барномаро кушоед ва Китобхонаро бинед.',
    min: '{n} дақ',
  },
  ru: {
    tagline: 'RAMZ — изучение языков',
    openApp: 'Открыть в приложении',
    getApp: 'Скачать в Google Play',
    book: 'Книга',
    audio: 'Аудиокнига',
    video: 'Видео',
    template: 'Шаблон',
    free: 'Бесплатная часть — без входа',
    price: '{n} смн',
    notFound: 'Материал не найден',
    notFoundSub: 'Возможно, он удалён из библиотеки. Откройте приложение и посмотрите библиотеку.',
    min: '{n} мин',
  },
  en: {
    tagline: 'RAMZ — language learning',
    openApp: 'Open in the app',
    getApp: 'Get it on Google Play',
    book: 'Book',
    audio: 'Audiobook',
    video: 'Video',
    template: 'Template',
    free: 'Free part — no sign-in needed',
    price: '{n} TJS',
    notFound: 'Item not found',
    notFoundSub: 'It may have been removed from the library. Open the app to browse the library.',
    min: '{n} min',
  },
};

/** Забон аз `Accept-Language` (ё `?l=`): tg | ru | en; пешфарз — тоҷикӣ. */
export function pickLandingLang(acceptLanguage?: string | null, override?: string | null): LandingLang {
  const norm = (s: string) => s.trim().toLowerCase().slice(0, 2);
  const o = override ? norm(override) : '';
  if (o === 'tg' || o === 'ru' || o === 'en') return o;
  for (const part of (acceptLanguage ?? '').split(',')) {
    const code = norm(part.split(';')[0] ?? '');
    if (code === 'tg' || code === 'ru' || code === 'en') return code;
    // Узбекӣ ва дигарон — пешфарз тоҷикӣ (забони асосии барнома).
  }
  return 'tg';
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Пайванди Google Play. `referrer` БОЯД як бор URL-коддор шавад:
 * `referrer=item%3D<id>%26src%3Dshare`. Баъди насб барнома онро аз Play
 * Install Referrer мехонад.
 */
export function playStoreUrl(itemId?: string): string {
  const base = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;
  if (!itemId) return base;
  return `${base}&referrer=${encodeURIComponent(`item=${itemId}&src=share`)}`;
}

/** `ramz://library/<id>` — дар барнома ҳамон воҳидро мекушояд. */
export function appDeepLink(itemId: string): string {
  return `${APP_SCHEME}://library/${encodeURIComponent(itemId)}`;
}

/**
 * Android: `intent://` — агар барнома насб бошад, онро мекушояд; вагарна
 * браузер ба `S.browser_fallback_url` (Google Play бо referrer) меравад.
 */
export function androidIntentUrl(itemId: string): string {
  const fallback = encodeURIComponent(playStoreUrl(itemId));
  return (
    `intent://library/${encodeURIComponent(itemId)}#Intent;scheme=${APP_SCHEME};` +
    `package=${ANDROID_PACKAGE};S.browser_fallback_url=${fallback};end`
  );
}

function fmt(tpl: string, n: string | number): string {
  return tpl.replace('{n}', String(n));
}

const PAGE_CSS = `
*{box-sizing:border-box}body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#0b0d1a;color:#fff;
display:flex;min-height:100vh;align-items:center;justify-content:center;padding:20px}
.card{width:100%;max-width:420px;text-align:center}
.brand{font-size:13px;letter-spacing:.14em;opacity:.7;margin-bottom:18px}
.cover{width:220px;height:220px;border-radius:22px;margin:0 auto 20px;background:linear-gradient(155deg,#c4573a,#4a1d2a);
display:flex;align-items:center;justify-content:center;font-size:72px;box-shadow:0 20px 50px rgba(196,87,58,.3);overflow:hidden}
.cover img{width:100%;height:100%;object-fit:cover}
.kind{display:inline-block;font-size:12px;font-weight:800;letter-spacing:.08em;color:#f08c6e;margin-bottom:6px;text-transform:uppercase}
h1{font-size:24px;line-height:1.25;margin:0 0 6px}.by{opacity:.7;margin:0 0 12px}
.meta{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:0 0 22px}
.chip{background:#1b1f36;border-radius:99px;padding:6px 12px;font-size:13px}
.btn{display:block;text-decoration:none;border-radius:16px;padding:16px;font-weight:800;font-size:16px;margin-top:12px}
.primary{background:#f1c04b;color:#2a1c05}.secondary{background:#1b1f36;color:#fff}
.note{opacity:.55;font-size:12px;margin-top:18px}`;

const KIND_EMOJI: Record<string, string> = { audio: '🎧', video: '🎬', book: '📖', template: '📝' };

/** Саҳифаи пурраи воҳид (бо тегҳои Open Graph барои WhatsApp/Telegram). */
export function renderItemLandingHtml(item: LandingItem, lang: LandingLang = 'tg'): string {
  const t = T[lang];
  const kind = t[item.type] ?? t.book;
  const title = escapeHtml(item.title);
  const author = item.author ? escapeHtml(item.author) : '';
  const desc = escapeHtml(
    (item.description?.trim() || `${kind} · ${t.tagline}`).replace(/\s+/g, ' ').slice(0, 160),
  );
  const chips: string[] = [];
  if (item.durationMin && item.durationMin > 0) chips.push(fmt(t.min, item.durationMin));
  if ((item.priceTjs ?? 0) > 0) {
    const n = Number.isInteger(item.priceTjs) ? String(item.priceTjs) : (item.priceTjs as number).toFixed(2);
    chips.push(fmt(t.price, n));
  }
  chips.push(t.free);

  const cover = item.coverUrl
    ? `<img src="${escapeHtml(item.coverUrl)}" alt="">`
    : (KIND_EMOJI[item.type] ?? '📖');
  const play = escapeHtml(playStoreUrl(item.id));
  const intent = escapeHtml(androidIntentUrl(item.id));
  const deep = escapeHtml(appDeepLink(item.id));

  return `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} · RAMZ</title>
<meta name="description" content="${desc}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="RAMZ">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
${item.coverUrl ? `<meta property="og:image" content="${escapeHtml(item.coverUrl)}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<style>${PAGE_CSS}</style></head>
<body><main class="card">
<div class="brand">RAMZ</div>
<div class="cover">${cover}</div>
<span class="kind">${escapeHtml(kind)}</span>
<h1>${title}</h1>
${author ? `<p class="by">${author}</p>` : ''}
<div class="meta">${chips.map((c) => `<span class="chip">${escapeHtml(c)}</span>`).join('')}</div>
<a class="btn primary" id="open" href="${deep}" data-intent="${intent}">${escapeHtml(t.openApp)}</a>
<a class="btn secondary" href="${play}">${escapeHtml(t.getApp)}</a>
<p class="note">${escapeHtml(t.tagline)}</p>
</main>
<script>
(function(){var a=document.getElementById('open');
if(/android/i.test(navigator.userAgent)){a.href=a.getAttribute('data-intent');}
else{a.style.display='none';}})();
</script></body></html>`;
}

/** Саҳифаи «ёфт нашуд»: боз ҳам Google Play (бе referrer-и воҳид). */
export function renderNotFoundHtml(lang: LandingLang = 'tg'): string {
  const t = T[lang];
  return `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>RAMZ</title><style>${PAGE_CSS}</style></head>
<body><main class="card"><div class="brand">RAMZ</div>
<h1>${escapeHtml(t.notFound)}</h1><p class="by">${escapeHtml(t.notFoundSub)}</p>
<a class="btn primary" href="${escapeHtml(playStoreUrl())}">${escapeHtml(t.getApp)}</a>
</main></body></html>`;
}
