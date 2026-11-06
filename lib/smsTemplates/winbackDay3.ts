/**
 * SMS-и «3 рӯз нест». Кӯтоҳ нигоҳ дошта мешавад: матни кириллӣ дар UCS-2 аст,
 * яъне 1 SMS = 70 аломат; дарозтар 2 SMS ҳисоб мешавад (ду баробар қимат).
 */
export type SmsLang = 'tg' | 'ru' | 'uz' | 'en';

const TEXT: Record<SmsLang, string> = {
  tg: 'RamzGo: 3 рӯз дарс нахондед. Имрӯз 5 дақиқа кофист!',
  ru: 'RamzGo: вы не занимались 3 дня. Сегодня хватит 5 минут!',
  uz: 'RamzGo: 3 kundan beri oʻqimadingiz. Bugun 5 daqiqa yetarli!',
  en: 'RamzGo: 3 days without a lesson. Just 5 minutes today!',
};

export function winbackDay3Sms(lang: SmsLang = 'tg'): string {
  return TEXT[lang] ?? TEXT.tg;
}
