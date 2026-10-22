import { describe, expect, it } from 'vitest';
import {
  androidIntentUrl,
  appDeepLink,
  escapeHtml,
  pickLandingLang,
  playStoreUrl,
  renderItemLandingHtml,
  renderNotFoundHtml,
} from '@/lib/library/landing';

describe('playStoreUrl', () => {
  it('referrer як бор URL-коддор: item=<id>&src=share', () => {
    const u = playStoreUrl('abc123');
    expect(u).toBe(
      'https://play.google.com/store/apps/details?id=com.ramzbook.tj&referrer=item%3Dabc123%26src%3Dshare',
    );
    // Баъди декод кардани referrer ҳамон «item=...&src=...» мебарояд.
    const ref = new URL(u).searchParams.get('referrer');
    expect(ref).toBe('item=abc123&src=share');
  });

  it('бе id — бе referrer', () => {
    expect(playStoreUrl()).toBe('https://play.google.com/store/apps/details?id=com.ramzbook.tj');
  });
});

describe('deep link ва intent', () => {
  it('ramz://library/<id>', () => {
    expect(appDeepLink('x1')).toBe('ramz://library/x1');
  });

  it('Android intent бо fallback ба Play (бо referrer)', () => {
    const i = androidIntentUrl('x1');
    expect(i.startsWith('intent://library/x1#Intent;scheme=ramz;package=com.ramzbook.tj;')).toBe(true);
    expect(i).toContain('S.browser_fallback_url=' + encodeURIComponent(playStoreUrl('x1')));
    expect(i.endsWith(';end')).toBe(true);
  });
});

describe('pickLandingLang', () => {
  it('Accept-Language; пешфарз тоҷикӣ', () => {
    expect(pickLandingLang('ru-RU,ru;q=0.9')).toBe('ru');
    expect(pickLandingLang('en-US,en;q=0.9')).toBe('en');
    expect(pickLandingLang('tg')).toBe('tg');
    expect(pickLandingLang('uz-UZ,uz;q=0.9')).toBe('tg');
    expect(pickLandingLang(null)).toBe('tg');
    expect(pickLandingLang('')).toBe('tg');
  });

  it('?l= афзалият дорад', () => {
    expect(pickLandingLang('ru', 'en')).toBe('en');
    expect(pickLandingLang('ru', 'xx')).toBe('ru');
  });
});

describe('renderItemLandingHtml', () => {
  const item = {
    id: 'cmv71d',
    type: 'audio',
    title: '2001 Аудиёҳои забони англисӣ',
    author: 'RAMZ ACADEMY',
    description: 'Аудио барои омӯзиши калимаҳо',
    coverUrl: 'https://cdn.test/c.jpg',
    priceTjs: 99,
    durationMin: 45,
  };

  it('унвон, муаллиф, нарх, давомнокӣ, Open Graph', () => {
    const h = renderItemLandingHtml(item, 'tg');
    expect(h).toContain('<title>2001 Аудиёҳои забони англисӣ · RAMZ</title>');
    expect(h).toContain('RAMZ ACADEMY');
    expect(h).toContain('99 смн');
    expect(h).toContain('45 дақ');
    expect(h).toContain('Аудиокитоб');
    expect(h).toContain('<meta property="og:title" content="2001 Аудиёҳои забони англисӣ">');
    expect(h).toContain('<meta property="og:image" content="https://cdn.test/c.jpg">');
    expect(h).toContain('Қисми ройгон бе ворид шудан');
  });

  it('ду тугма: барнома (deep link + intent) ва Google Play бо referrer', () => {
    const h = renderItemLandingHtml(item);
    expect(h).toContain('href="ramz://library/cmv71d"');
    expect(h).toContain('data-intent="intent://library/cmv71d#Intent;scheme=ramz;');
    expect(h).toContain('referrer=item%3Dcmv71d%26src%3Dshare');
    expect(h).toContain('Дар барнома кушоед');
    expect(h).toContain('Аз Google Play зеркашӣ кунед');
  });

  it('ҳеҷ савол/форма/забон-интихоб нест', () => {
    const h = renderItemLandingHtml(item);
    expect(h).not.toMatch(/<form|<select|<input|type="password"/i);
  });

  it('забони русӣ ва англисӣ', () => {
    expect(renderItemLandingHtml(item, 'ru')).toContain('Открыть в приложении');
    expect(renderItemLandingHtml(item, 'en')).toContain('99 TJS');
  });

  it('XSS: унвон ва муаллиф escape мешаванд', () => {
    const h = renderItemLandingHtml(
      { ...item, title: '<script>alert(1)</script>', author: '"><img src=x onerror=1>', description: '<b>x</b>' },
    );
    expect(h).not.toContain('<script>alert(1)</script>');
    expect(h).not.toContain('<img src=x onerror=1>');
    expect(h).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('бе ковер — эмоҷии навъ; бе нарх — чипи нарх нест', () => {
    const h = renderItemLandingHtml({ ...item, coverUrl: null, priceTjs: null });
    expect(h).toContain('🎧');
    expect(h).not.toContain('og:image');
    expect(h).not.toContain('смн');
  });

  it('escapeHtml', () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe('&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
  });
});

describe('renderNotFoundHtml', () => {
  it('Play бе referrer-и воҳид', () => {
    const h = renderNotFoundHtml('tg');
    expect(h).toContain('Ин маҳсулот ёфт нашуд');
    expect(h).toContain('id=com.ramzbook.tj');
    expect(h).not.toContain('referrer=');
  });
});
