/**
 * САНҶИШ: филтри забони қуттии «Фикри хонандагон».
 *
 * Иҷро:
 *   cd backend && npx ts-node --compiler-options '{"module":"commonjs","target":"es2019"}' scripts/test-inbox-lang.ts
 *
 * Базаи ҳақиқӣ ЛОЗИМ НЕСТ — функсияҳо танҳо ба «луғати забонҳо» такя мекунанд,
 * ва он ин ҷо дастӣ сохта мешавад.
 *
 * ЧАРО МАҲЗ ИН СЕ ДОМ САНҶИДА МЕШАВАНД:
 *
 *   1. Сатрҳои КӮҲНАи `Feedback.targetLang` `cuid` доранд, на код. Агар
 *      `toLangCode` онҳоро накушояд, филтр таърихи фикрҳоро гум мекунад ва
 *      панел «cmq7…» ҳамчун забон нишон медиҳад.
 *
 *   2. `"tg-en"` бо ЯКУМ дефис шикастан хатост: коди забон метавонад худаш
 *      дефис дошта бошад (`pt-br`). Ҷои шикаст бояд бо луғат санҷида шавад.
 *
 *   3. `WHERE targetLang IN (…)` бояд ҲАМ кодро, ҲАМ `cuid`-ро дар бар гирад
 *      — вагарна филтр танҳо сатрҳои нави пас аз 2026-08-30-ро мебинад.
 */
import {
  langFilterValues,
  splitCoursePair,
  toLangCode,
  type LangDirectory,
} from '../lib/inbox';

// ── Луғати сохта ───────────────────────────────────────────────────────────
const LANGS = [
  { id: 'cmq_tg', code: 'tg', name: 'Tajik', nativeName: 'Тоҷикӣ', flag: '🇹🇯' },
  { id: 'cmq_en', code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { id: 'cmq_ru', code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { id: 'cmq_ar', code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { id: 'cmq_ptbr', code: 'pt-br', name: 'Portuguese (BR)', nativeName: 'Português', flag: '🇧🇷' },
];

const dir: LangDirectory = { codeById: {}, byCode: {}, codes: [] };
LANGS.forEach((l) => {
  dir.codeById[l.id] = l.code;
  dir.byCode[l.code] = l;
  dir.codes.push(l.code);
});

// ── Ҳарнеси хурд ───────────────────────────────────────────────────────────
let failed = 0;
function eq(label: string, got: unknown, want: unknown) {
  const g = JSON.stringify(got);
  const w = JSON.stringify(want);
  if (g === w) {
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.log(`  ✗ ${label}\n      интизор: ${w}\n      гирифт : ${g}`);
  }
}

console.log('\n1. toLangCode — cuid, код, номаълум');
eq('cuid-и кӯҳна кушода мешавад', toLangCode('cmq_en', dir), 'en');
eq('коди тайёр ҳамон мемонад', toLangCode('en', dir), 'en');
eq('ҳарфи калон хурд мешавад', toLangCode('EN', dir), 'en');
eq('фазои изофӣ бурида мешавад', toLangCode('  ru  ', dir), 'ru');
eq('коди номаълум → null (на коди сохта)', toLangCode('zz', dir), null);
eq('cuid-и номаълум → null', toLangCode('cmq_nope', dir), null);
eq('холӣ → null', toLangCode('', dir), null);
eq('null → null', toLangCode(null, dir), null);

console.log('\n2. splitCoursePair — "модарӣ-омӯзишӣ"');
eq('ҷуфти оддӣ', splitCoursePair('tg-en', dir), { native: 'tg', target: 'en' });
eq('ҳарфи калон', splitCoursePair('TG-AR', dir), { native: 'tg', target: 'ar' });
eq(
  'коди дефисдор дар РОСТ намешиканад',
  splitCoursePair('tg-pt-br', dir),
  { native: 'tg', target: 'pt-br' },
);
eq(
  'коди дефисдор дар ЧАП намешиканад',
  splitCoursePair('pt-br-en', dir),
  { native: 'pt-br', target: 'en' },
);
eq('нимаи гумшуда — забони омӯзишӣ ба ҳар ҳол меояд',
  splitCoursePair('-en', dir), { native: null, target: 'en' });
eq('холӣ', splitCoursePair('', dir), { native: null, target: null });
eq('танҳо дефис', splitCoursePair('-', dir), { native: null, target: null });
eq('null', splitCoursePair(null, dir), { native: null, target: null });
eq('забони номаълум → null, на сатри хом',
  splitCoursePair('xx-yy', dir), { native: null, target: null });

console.log('\n3. langFilterValues — филтр бояд таърихро ҳам бинад');
eq('код + cuid', langFilterValues('en', dir), ['en', 'cmq_en']);
eq('ҳарфи калон ҳам кор мекунад', langFilterValues('EN', dir), ['en', 'cmq_en']);
eq('коди номаълум — танҳо худаш', langFilterValues('zz', dir), ['zz']);

console.log(
  failed === 0
    ? '\n✅ ҲАМА ГУЗАШТ\n'
    : `\n❌ ${failed} санҷиш нашуд\n`,
);
process.exit(failed === 0 ? 0 : 1);
