/**
 * Email-и «3 рӯз нест» (win-back) — ҳамтои push-и «{name}, 3 рӯз нест 👀».
 * Тоза: танҳо сатри HTML месозад, ҳеҷ чизро намефиристад (ниг. sendWinbackDay3Email дар lib/mailer.ts).
 */

export type WinbackLang = 'tg' | 'ru' | 'uz' | 'en';

export const APP_STORE_URL = 'https://play.google.com/store/apps/details?id=com.ramzbook.tj';

type Copy = {
  subject: string;
  preheader: string;
  hello: string;
  title: string;
  body: string;
  tip: string;
  cta: string;
  ignore: string;
  unsubscribe: string;
};

const COPY: Record<WinbackLang, Copy> = {
  tg: {
    subject: '{name}, 3 рӯз нест 👀 — дарси шумо интизор аст',
    preheader: 'Ҳамагӣ 5 дақиқа — ва силсилаи омӯзиши шумо аз сари нав сар мешавад.',
    hello: 'Салом, {name}!',
    title: '3 рӯз шуд, ки шуморо надидаем',
    body: 'Забон бе такрор зуд фаромӯш мешавад, аммо баргаштан осон аст. Дарси навбатии шумо омода аст ва танҳо 5 дақиқа мегирад.',
    tip: 'Маслиҳат: ҳар рӯз ҳатто 5 дақиқа аз ҳафтае як соат беҳтар аст.',
    cta: 'Давом додани дарс',
    ignore: 'Агар шумо ин паёмро намехостед, онро нодида гиред.',
    unsubscribe: 'Аз паёмҳои ёдрасонӣ баромадан',
  },
  ru: {
    subject: '{name}, вас не было 3 дня 👀 — урок ждёт',
    preheader: 'Всего 5 минут — и ваш путь в изучении языка продолжится.',
    hello: 'Здравствуйте, {name}!',
    title: 'Вас не было 3 дня',
    body: 'Язык без повторения быстро забывается, но вернуться легко. Следующий урок уже готов и займёт всего 5 минут.',
    tip: 'Совет: 5 минут каждый день лучше, чем час раз в неделю.',
    cta: 'Продолжить урок',
    ignore: 'Если это письмо вам не нужно, просто проигнорируйте его.',
    unsubscribe: 'Отписаться от напоминаний',
  },
  uz: {
    subject: '{name}, 3 kundan beri yoʻqsiz 👀 — darsingiz kutmoqda',
    preheader: 'Atigi 5 daqiqa — va oʻrganish yoʻlingiz davom etadi.',
    hello: 'Salom, {name}!',
    title: 'Sizni 3 kundan beri koʻrmadik',
    body: 'Til takrorlamasa tez unutiladi, lekin qaytish oson. Keyingi darsingiz tayyor va atigi 5 daqiqa oladi.',
    tip: 'Maslahat: har kuni 5 daqiqa haftada bir soatdan yaxshiroq.',
    cta: 'Darsni davom ettirish',
    ignore: 'Agar bu xat sizga kerak boʻlmasa, e’tibor bermang.',
    unsubscribe: 'Eslatmalardan chiqish',
  },
  en: {
    subject: '{name}, it has been 3 days 👀 — your lesson is waiting',
    preheader: 'Just 5 minutes — and your learning streak starts again.',
    hello: 'Hi {name},',
    title: 'We haven’t seen you for 3 days',
    body: 'A language fades without practice, but coming back is easy. Your next lesson is ready and takes just 5 minutes.',
    tip: 'Tip: five minutes every day beats one hour once a week.',
    cta: 'Continue my lesson',
    ignore: 'If you didn’t want this email, you can safely ignore it.',
    unsubscribe: 'Unsubscribe from reminders',
  },
};

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function winbackDay3Email(params: {
  name: string;
  lang?: WinbackLang;
  /** Ҳатмӣ барои маркетинг: пайванде, ки корбарро аз рӯйхат мебарорад. */
  unsubscribeUrl?: string;
  appUrl?: string;
}): { subject: string; html: string } {
  const c = COPY[params.lang ?? 'tg'] ?? COPY.tg;
  const name = esc(params.name?.trim() || '');
  const fill = (t: string) => t.replace('{name}', name || '').replace(/\s+,/, ',').replace(/^,\s*/, '');
  const url = params.appUrl ?? APP_STORE_URL;
  const year = new Date().getFullYear();
  const font = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif";

  const unsub = params.unsubscribeUrl
    ? `<br/><a href="${esc(params.unsubscribeUrl)}" style="color:#9AA1C0;text-decoration:underline;">${c.unsubscribe}</a>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="${params.lang ?? 'tg'}">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="color-scheme" content="light"/>
<title>RamzGo</title>
</head>
<body style="margin:0;padding:0;background:#F3F1EA;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(c.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3F1EA;padding:32px 12px;">
  <tr><td align="center">
    <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="width:100%;max-width:480px;background:#FFFFFF;border-radius:24px;overflow:hidden;font-family:${font};">
      <tr>
        <td align="center" style="background:#1A1A2E;padding:30px 24px 26px;">
          <div style="display:inline-block;width:52px;height:52px;line-height:52px;border-radius:15px;background:#C89B3C;color:#1A1A2E;font-size:26px;font-weight:900;text-align:center;">R</div>
          <div style="margin-top:12px;color:#FFFFFF;font-size:24px;font-weight:800;letter-spacing:0.5px;">RamzGo</div>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding:34px 30px 6px;">
          <div style="font-size:44px;line-height:1;">👀</div>
          <div style="margin-top:14px;color:#9AA1C0;font-size:14px;">${fill(c.hello)}</div>
          <div style="margin-top:6px;color:#0F1533;font-size:22px;font-weight:800;line-height:1.3;">${c.title}</div>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding:14px 34px 4px;">
          <div style="color:#5A628A;font-size:15px;line-height:1.7;">${c.body}</div>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding:24px 30px 8px;">
          <a href="${esc(url)}" style="display:inline-block;background:#1A1A2E;color:#FFFFFF;text-decoration:none;font-size:16px;font-weight:700;padding:16px 38px;border-radius:14px;border-bottom:3px solid #C89B3C;">${c.cta} &rarr;</a>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding:22px 30px 6px;">
          <div style="display:inline-block;background:#FBF5E6;color:#7A5A12;font-size:13px;line-height:1.6;padding:12px 16px;border-radius:12px;">${c.tip}</div>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding:20px 32px 30px;color:#9AA1C0;font-size:12px;line-height:1.7;">${c.ignore}${unsub}</td>
      </tr>
      <tr>
        <td align="center" style="background:#FAFAFC;border-top:1px solid #EDEDF2;padding:16px 24px;color:#9AA1C0;font-size:12px;">© ${year} RamzGo</td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

  return { subject: fill(c.subject), html };
}
