/**
 * SMS-и «3 рӯз нест» — ҲАМЕША як SMS.
 *
 * Матни кириллӣ дар UCS-2 аст: 1 SMS = 70 аломат; аз он зиёд — ду SMS ва ду
 * баробар қимат. Бинобар ин ном ба 10 ҳарф бурида мешавад, то ҳатто дарозтарин
 * матн (бо номи 10-ҳарфа) ≤ 64 аломат монад.
 */
export type SmsLang = 'tg' | 'ru' | 'uz' | 'en';

const TEXT: Record<SmsLang, (name: string) => string> = {
  tg: (n) => `${n}, 3 рӯз шуд! 5 дақиқа дарс — RamzGo шуморо интизор аст`,
  ru: (n) => `${n}, вас не было 3 дня! 5 минут урока — RamzGo ждёт вас`,
  uz: (n) => `${n}, 3 kun boʻldi! 5 daqiqa dars — RamzGo sizni kutmoqda`,
  en: (n) => `${n}, 3 days! Just 5 minutes of RamzGo is enough today`,
};

const FALLBACK: Record<SmsLang, string> = { tg: 'Салом', ru: 'Здравствуйте', uz: 'Salom', en: 'Hi' };

/** `name` ихтиёрӣ: бе ном матн бо «Салом» оғоз мешавад. */
export function winbackDay3Sms(lang: SmsLang = 'tg', name?: string): string {
  const first = (name ?? '').trim().split(/\s+/)[0]?.slice(0, 10);
  return (TEXT[lang] ?? TEXT.tg)(first || FALLBACK[lang] || FALLBACK.tg);
}
