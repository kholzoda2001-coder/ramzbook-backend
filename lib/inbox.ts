/**
 * «Фикри хонандагон» — ЯК қуттии воридотӣ барои ҳар чизе, ки хонанда ба мо
 * мефиристад.
 *
 * ДУ манбаи гуногун ин ҷо ба ЯК рӯйхат меоянд:
 *   • `Feedback`      — баҳо (1..5) + матн: «маъқул шуд», шикоят, таклиф;
 *   • `ContentReport` — хатои МАЗМУН, ки хонанда дар дохили дарс байрақ мезанад.
 *
 * ЧАРО ЯК ҶО. Барои соҳиби маҳсулот ҳар ду як савол доранд: «хонанда аз чӣ
 * норозӣ аст ва дар кадом ҶУФТИ ЗАБОН?». Ду панели ҷудогона ин саволро ду бор
 * мепурсид ва ҳеҷ гоҳ ҷавоби умумӣ намедод.
 *
 * ⚠️ АСОСИ ФИЛТР — КОДИ забон (`tg`, `en`), на `Language.id`.
 * Клиенти кӯҳна дар `Feedback.targetLang` `cuid` мефиристод; гузоришҳо бошанд
 * сатри `course: "tg-en"` доранд. Ҳар се шакл ин ҷо ба як код оварда мешаванд,
 * вагарна филтр дар ним маълумот кор мекард.
 */

import type { PrismaClient } from '@prisma/client';

/** Забонҳо кам ва қариб доимӣ — як дархост дар як дақиқа кифоя аст. */
const DIRECTORY_TTL_MS = 60_000;

export interface LangInfo {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export interface LangDirectory {
  /** `Language.id` → код. Калиди кушодани сатрҳои кӯҳна. */
  codeById: Record<string, string>;
  byCode: Record<string, LangInfo>;
  /** Ҳамаи кодҳои маълум — барои шикастани `"tg-en"` бехато. */
  codes: string[];
}

let cached: { at: number; dir: LangDirectory } | null = null;

export async function loadLanguageDirectory(prisma: PrismaClient): Promise<LangDirectory> {
  if (cached && Date.now() - cached.at < DIRECTORY_TTL_MS) return cached.dir;

  const rows = await prisma.language.findMany({
    select: { id: true, code: true, name: true, nativeName: true, flag: true },
  });

  const dir: LangDirectory = { codeById: {}, byCode: {}, codes: [] };
  rows.forEach((r) => {
    const code = (r.code || '').toLowerCase();
    if (!code) return;
    dir.codeById[r.id] = code;
    dir.byCode[code] = { id: r.id, code, name: r.name, nativeName: r.nativeName, flag: r.flag };
    dir.codes.push(code);
  });

  cached = { at: Date.now(), dir };
  return dir;
}

/** Танҳо барои тестҳо — кэшро мепартояд. */
export function resetLanguageDirectoryCache(): void {
  cached = null;
}

/**
 * Ҳар шакл → код.
 *
 * `cuid` (сатри кӯҳна) → код; код → ҳамон код; чизи номаълум → `null`,
 * то дар филтр ҳамчун «нест» бошад, на ҳамчун коди сохта.
 */
export function toLangCode(value: string | null | undefined, dir: LangDirectory): string | null {
  if (!value) return null;
  const raw = value.trim();
  if (!raw) return null;
  const byId = dir.codeById[raw];
  if (byId) return byId;
  const lower = raw.toLowerCase();
  return dir.byCode[lower] ? lower : null;
}

/**
 * `"tg-en"` → `{ native: 'tg', target: 'en' }`.
 *
 * ⚠️ ШИКАСТАНИ СОДДА бо якум `-` ХАТОСТ: коди забон метавонад худаш дефис
 * дошта бошад (`pt-br`). Пас ҳамаи ҷойҳои шикаст санҷида мешаванд ва танҳо
 * онеро мегирем, ки ҲАР ДУ нимааш коди МАЪЛУМ бошад.
 */
export function splitCoursePair(
  course: string | null | undefined,
  dir: LangDirectory,
): { native: string | null; target: string | null } {
  const raw = (course ?? '').trim().toLowerCase();
  if (!raw || raw === '-') return { native: null, target: null };

  for (let i = 1; i < raw.length; i++) {
    if (raw[i] !== '-') continue;
    const a = raw.slice(0, i);
    const b = raw.slice(i + 1);
    if (dir.byCode[a] && dir.byCode[b]) return { native: a, target: b };
  }

  // Ним-маълумот низ арзиш дорад: `"-en"` (забони модарӣ гум шуд) ҳадди ақал
  // забони омӯзиширо медиҳад.
  const parts = raw.split('-');
  const native = parts[0] && dir.byCode[parts[0]] ? parts[0] : null;
  const tail = parts.slice(1).join('-');
  const target = tail && dir.byCode[tail] ? tail : null;
  return { native, target };
}

/**
 * Қиматҳое, ки дар база метавонанд ҳамин забонро ифода кунанд.
 *
 * Барои `WHERE targetLang IN (…)`: сатрҳои нав кодро нигоҳ медоранд, кӯҳнаҳо
 * — `cuid`. Бе ҳар ду филтр таърихро гум мекард.
 */
export function langFilterValues(code: string, dir: LangDirectory): string[] {
  const lower = code.toLowerCase();
  const info = dir.byCode[lower];
  const out = [lower];
  if (info && info.id !== lower) out.push(info.id);
  return out;
}

/** Тамға барои панел: «🇬🇧 English». Коди номаълум ҳам бояд намоён бошад. */
export function langLabel(code: string | null, dir: LangDirectory): string {
  if (!code) return '—';
  const info = dir.byCode[code];
  return info ? `${info.flag} ${info.name}` : code;
}
