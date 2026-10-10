/**
 * Калиди «муҳаррики нутқи гуфтор» — дар СЕРВЕР, на дар барнома (10.10.2026).
 *
 * Сабаб: 05.10.2026 озмоиши ройгони Azure тамом шуд ва ҳар дархости токен 401
 * мегирифт. Барнома онро «шабака бад» мефаҳмид ва ҳар машқ аввал Azure-ро
 * меозмуд → хонанда «муҳаррик кор намекунад»-ро медид. Қарори корбар: то
 * пардохти Azure гуфтор бо муҳаррики ТЕЛЕФОН (ройгон) кор кунад, ва рӯзе ки
 * Azure боз пардохт шавад, БЕ билди нав ва бе Play Store ба он баргардад.
 *
 * Пас ҳамаи қарор ин ҷост. Барнома танҳо ба ҷавоби `/speech/token` нигоҳ
 * мекунад: токен → Azure; **503** → муҳаррики телефон то охири ҷаласа.
 *
 * Режимҳо (`AppSetting` `speech_engine`, `{"azure": "..."}`):
 *   • `auto` (пешфарз) — Azure-ро мепурсем; агар ҳисоб мурда бошад (401/403)
 *     → 503. Баъди upgrade-и Azure худ ба худ бармегардад, ҳеҷ коре лозим нест.
 *   • `off`  — Azure умуман пурсида намешавад (мас. барои сарфаи пул).
 *   • `on`   — ҳамон `auto` (номи равшан барои админ).
 *
 * Ивазкунӣ бе deploy: `node prisma/_speech-engine.mjs off|auto`.
 */
import type { PrismaClient } from '@prisma/client';

export const SPEECH_ENGINE_KEY = 'speech_engine';

export type AzureMode = 'auto' | 'on' | 'off';

export function parseAzureMode(valueJson: string | null | undefined): AzureMode {
  if (!valueJson) return 'auto';
  try {
    const v = (JSON.parse(valueJson) as { azure?: unknown }).azure;
    return v === 'off' || v === 'on' ? v : 'auto';
  } catch {
    return 'auto';
  }
}

/** Хатои база набояд гуфторро бикушад — дар шубҳа `auto`. */
export async function loadAzureMode(prisma: PrismaClient): Promise<AzureMode> {
  try {
    const row = await prisma.appSetting.findUnique({ where: { key: SPEECH_ENGINE_KEY } });
    return parseAzureMode(row?.valueJson);
  } catch {
    return 'auto';
  }
}

/**
 * Azure ҷавоби «ҳисоб/калид мурда» дод? 401 = калид ё обуна нодуруст
 * (озмоиш тамом шуд), 403 = квота тамом / ресурс хомӯш. Ин нокомии
 * МУВАҚҚАТӢ нест — барнома бояд то охири ҷаласа ба телефон гузарад (503).
 * 5xx ва шабака — муваққатианд (502, барнома дафъаи дигар боз мепурсад).
 */
export function isAzureAccountDead(status: number): boolean {
  return status === 401 || status === 403;
}
