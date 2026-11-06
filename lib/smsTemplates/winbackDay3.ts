/**
 * SMS-и «3 рӯз нест».
 *
 * Тақсими SMS: матни кириллӣ дар UCS-2 аст — 1 SMS = 70 аломат; агар дарозтар
 * бошад, ҳар қисм 67 аломат ва алоҳида ҳисоб мешавад. Ҳадафи мо ≤ 134 аломат
 * (2 SMS), то матн гарм ва пурра бошад, вале нарх аз ду баробар зиёд нашавад.
 */
export type SmsLang = 'tg' | 'ru' | 'uz' | 'en';

const TEXT: Record<SmsLang, (name: string) => string> = {
  tg: (n) => `${n}, 3 рӯз шуд RamzGo-ро накушодаед. Ҳамагӣ 5 дақиқа — ва омӯзиши шумо давом мекунад. Мунтазири шумо ҳастем!`,
  ru: (n) => `${n}, вас не было в RamzGo 3 дня. Всего 5 минут — и ваше обучение продолжится. Мы вас ждём!`,
  uz: (n) => `${n}, 3 kundan beri RamzGo’ga kirmadingiz. Atigi 5 daqiqa — va oʻrganish davom etadi. Sizni kutamiz!`,
  en: (n) => `${n}, it’s been 3 days since you opened RamzGo. Just 5 minutes keeps your learning going. We’re waiting for you!`,
};

/** `name` ихтиёрӣ: бе ном матн бо «Салом» оғоз мешавад. Номи хеле дароз бурида мешавад. */
export function winbackDay3Sms(lang: SmsLang = 'tg', name?: string): string {
  const fallback: Record<SmsLang, string> = { tg: 'Салом', ru: 'Здравствуйте', uz: 'Salom', en: 'Hi' };
  const first = (name ?? '').trim().split(/\s+/)[0]?.slice(0, 14);
  return (TEXT[lang] ?? TEXT.tg)(first || fallback[lang] || fallback.tg);
}
