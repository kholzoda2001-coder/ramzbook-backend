/**
 * Ҳисоби МАНЪШУДА (`User.isActive = false`).
 *
 * ── Чаро ин файл пайдо шуд ─────────────────────────────────────────────────
 * Дар панели админ сутуни «Вазъ» ҳамеша «Фаъол» менавишт ва майдони
 * `isActive` дар ҲЕҶ ҶОИ вуруд санҷида намешуд. Яъне тугмаи «манъ кардан»
 * танҳо як байрақи ороишӣ мебуд: корбари «манъшуда» барномаро мисли пештара
 * истифода мекард. Манъ бояд ВОҚЕӢ бошад, вагарна ба он бовар кардан мумкин
 * нест.
 *
 * Манъ дар ҳамаи чор нуқтаи додани токен санҷида мешавад: вуруд бо парол,
 * вуруд бо Google/Telegram, тасдиқи OTP ва `refresh`. Маҳз `refresh` ҷаласаи
 * ҚАБЛАН кушодашударо мекушад — токени дастрасӣ мӯҳлати кӯтоҳ дорад ва баъди
 * он барнома маҷбур мешавад refresh кунад.
 */

export const BLOCKED_ERROR = 'Ҳисоби шумо манъ шудааст. Бо дастгирӣ тамос гиред.';

/** Ҷавоби ягона барои ҳисоби манъшуда. */
export function blockedResponse(headers?: Record<string, string>): Response {
  return Response.json(
    { error: BLOCKED_ERROR, code: 'account_blocked' },
    { status: 403, ...(headers ? { headers } : {}) },
  );
}

/** `true` = ҳисоб манъ аст. `undefined`/`null` ҳамчун ФАЪОЛ ҳисоб мешавад. */
export function isBlocked(u: { isActive?: boolean | null } | null | undefined): boolean {
  return !!u && u.isActive === false;
}
