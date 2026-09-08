/**
 * Санҷиши номи намоишии корбар — дар САРҲАДИ сервер, пеш аз навишта шудан.
 *
 * ── Чаро ин файл ҳаст ──────────────────────────────────────────────────────
 * `PATCH /api/mobile/auth/profile` ва `POST /api/mobile/auth/register` танҳо
 * `length >= 2`-ро месанҷиданд. Дар натиҷа дар продакшн 41 ҳисоб пайдо шуд,
 * ки дар майдони НОМ як почта нигоҳ медоранд (роботи pre-launch-и Google онро
 * ба майдон менавишт). Ҳимоя пеш аз ин дар ҷои НОДУРУСТ буд — дар
 * `lib/pushMessages.ts` ҳангоми ФИРИСТОДАНИ огоҳӣ, яъне маълумоти вайрон
 * аллакай дар база буд ва ҳар мизоҷи дигар (рейтинг, профили ҷамъиятӣ, админ)
 * онро мебурд.
 *
 * ⚠️ Қоида ҚАСДАН танҳо ЯК чизро рад мекунад — почтаро. Номи рақамдор
 * (`Izatullo 71`, `malaev.m7`, `1234`) дар продакшн ба хонандагони ВОҚЕӢ ва
 * фаъол тааллуқ дорад; рад кардани онҳо касеро дар экрани «Профилро пур кун»
 * гир мемонд. Беҳтар аст, ки як боги хурд бимонад, назар ба он ки хонандаи
 * ҳақиқӣ ба барнома дохил шуда натавонад.
 */

export type DisplayNameProblem = 'short' | 'email';

export type DisplayNameCheck =
  | { ok: true; name: string }
  | { ok: false; problem: DisplayNameProblem; message: string };

/** Ҳадди ақали дарозӣ — ҳамон 2-и қаблӣ, то рафтори мавҷуда тағйир наёбад. */
export const MIN_NAME_LENGTH = 2;

export function checkDisplayName(raw: string | null | undefined): DisplayNameCheck {
  const name = (raw ?? '').trim();

  if (name.length < MIN_NAME_LENGTH) {
    return {
      ok: false,
      problem: 'short',
      message: `Ном бояд ақаллан ${MIN_NAME_LENGTH} ҳарф бошад.`,
    };
  }

  if (name.includes('@')) {
    return {
      ok: false,
      problem: 'email',
      message: 'Ба ҷои почта номи худро нависед — он ба хонандагони дигар намоён мешавад.',
    };
  }

  return { ok: true, name };
}
