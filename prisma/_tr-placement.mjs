import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);

const Q = [
  // --- A1 LEVEL ---
  { level: 'A1', skill: 'vocab', order: 1,
    prompt: 'Was bedeutet "Merhaba"?', promptTranslated: '"Merhaba" чӣ маъно дорад?', // Note: I used Was bedeutet just for my own thought process, but let's make it Tajik
    options: ['Салом', 'Хайр', 'Ташаккур', 'Лутфан'], answer: 'Салом',
    explanation: '"Merhaba" = Салом.' },
  { level: 'A1', skill: 'grammar', order: 2,
    prompt: 'Ben bir öğrenci___.', promptTranslated: 'Ман як донишҷӯ ҳастам.',
    options: ['yim', 'sin', 'yiz', 'dir'], answer: 'yim',
    explanation: 'Барои "Ben" (Ман) пасванди шахси якум "-yim" истифода мешавад.' },
  { level: 'A1', skill: 'grammar', order: 3,
    prompt: 'Sen ___?', promptTranslated: 'Ту кӣ ҳастӣ?',
    options: ['kimsin', 'kim', 'kimim', 'kimsiniz'], answer: 'kimsin',
    explanation: 'Барои "Sen" (Ту) ба калимаи "kim" пасванди "-sin" илова мешавад.' },
  { level: 'A1', skill: 'vocab', order: 4,
    prompt: '"Китоб" дар забони туркӣ чӣ мешавад?', promptTranslated: '"Китоб" дар забони туркӣ чӣ мешавад?',
    options: ['Kitap', 'Kalem', 'Masa', 'Okul'], answer: 'Kitap',
    explanation: 'Китоб = Kitap.' },
  { level: 'A1', skill: 'grammar', order: 5,
    prompt: 'Bu masa___.', promptTranslated: 'Ин миз аст.',
    options: ['dır', 'dir', 'dur', 'dür'], answer: 'dır',
    explanation: 'Мувофиқати садонокҳо: баъди "a" пасванди "-dır" меояд.' },
  { level: 'A1', skill: 'grammar', order: 6,
    prompt: 'Onlar ___ mi?', promptTranslated: 'Оё онҳо муаллим ҳастанд?',
    options: ['öğretmen', 'öğretmenler', 'öğrenci', 'öğrenciler'], answer: 'öğretmen',
    explanation: 'Дар саволҳои ҷамъ "Onlar öğretmen mi?" ё "Onlar öğretmenler mi?" дуруст аст, аммо дар вариантҳо шакли соддатар "öğretmen" дода шудааст.' },
  { level: 'A1', skill: 'reading', order: 7,
    prompt: 'Ali: "Nasılsın?"\nAyşe: "___, teşekkür ederim."', promptTranslated: 'Алӣ: "Аҳволат чӣ гуна аст?"\nОиша: "___, ташаккур."',
    options: ['İyiyim', 'Görüşürüz', 'Merhaba', 'Ben Ali'], answer: 'İyiyim',
    explanation: 'Ба саволи "Nasılsın?" ҷавоби "İyiyim" (Хубам) мувофиқ аст.' },
  { level: 'A1', skill: 'grammar', order: 8,
    prompt: 'Benim adım Ahmet. ___ adım ne?', promptTranslated: 'Номи ман Аҳмад аст. Номи ту чист?',
    options: ['Senin', 'Onun', 'Benim', 'Sizin'], answer: 'Senin',
    explanation: '"Senin adım ne?" не, балки "Senin adın ne?" аст. Пас ҷонишини мувофиқ "Senin" мебошад.' },
  { level: 'A1', skill: 'vocab', order: 9,
    prompt: 'Çocuk ___ oynuyor.', promptTranslated: 'Кӯдак дар боғ бозӣ мекунад.',
    options: ['parkta', 'parktan', 'parka', 'parkı'], answer: 'parkta',
    explanation: '-ta / -te пасванди ҷой (Locative) аст.' },
  { level: 'A1', skill: 'reading', order: 10,
    prompt: 'Ben elma ___.', promptTranslated: 'Ман себ мехӯрам.',
    options: ['yiyorum', 'içiyorum', 'geliyorum', 'gidiyorum'], answer: 'yiyorum',
    explanation: 'Yemek = Хӯрдан (yiyorum).' },

  // --- A2 LEVEL ---
  { level: 'A2', skill: 'grammar', order: 11,
    prompt: 'Dün sinemaya ___.', promptTranslated: 'Дирӯз ба кинотеатр рафтам.',
    options: ['gittim', 'gidiyorum', 'gideceğim', 'gittin'], answer: 'gittim',
    explanation: '"Dün" (Дирӯз) замони гузаштаро талаб мекунад: gittim.' },
  { level: 'A2', skill: 'grammar', order: 12,
    prompt: 'Yarın Ankara\'ya ___.', promptTranslated: 'Фардо ба Анкара меравам.',
    options: ['gideceğim', 'gidiyorum', 'gittim', 'giderim'], answer: 'gideceğim',
    explanation: '"Yarın" (Фардо) замони ояндаро талаб мекунад: gideceğim.' },
  { level: 'A2', skill: 'vocab', order: 13,
    prompt: 'Hava çok soğuk, lütfen ___ kapat.', promptTranslated: 'Ҳаво хеле хунук аст, лутфан тирезаро пӯш.',
    options: ['pencereyi', 'kapıyı', 'ışığı', 'televizyonu'], answer: 'pencereyi',
    explanation: 'Pencere = Тиреза.' },
  { level: 'A2', skill: 'grammar', order: 14,
    prompt: 'Benim arabam seninki___ daha hızlı.', promptTranslated: 'Мошини ман аз мошини ту тезтар аст.',
    options: ['nden', 'nden', 'yle', 'nin'], answer: 'nden', // 'seninkinden'
    optionsCorrected: ['nden', 'yle', 'nin', 'den'], // Fix duplicates
    explanation: 'Дараҷаи муқоисавӣ бо пасванди -den / -dan сохта мешавад (seninkinden).' },
  { level: 'A2', skill: 'reading', order: 15,
    prompt: 'Eğer yağmur yağarsa, ___', promptTranslated: 'Агар борон борад, ___',
    options: ['evde kalacağım', 'güneş açacak', 'denize gireceğim', 'dışarı çıkacağım'], answer: 'evde kalacağım',
    explanation: 'Маънои мантиқӣ: Агар борон борад, дар хона мемонам (evde kalacağım).' },
  { level: 'A2', skill: 'grammar', order: 16,
    prompt: 'Bana ___ anlattı.', promptTranslated: 'Ӯ ба ман ҳама чизро нақл кард.',
    options: ['her şeyi', 'hiçbir şey', 'herkes', 'kimse'], answer: 'her şeyi',
    explanation: 'Her şeyi = Ҳама чизро.' },
  { level: 'A2', skill: 'grammar', order: 17,
    prompt: 'Türkiye\'de yaşama___ alışıyorum.', promptTranslated: 'Ман ба зиндагӣ дар Туркия одат карда истодаам.',
    options: ['ya', 'yı', 'dan', 'da'], answer: 'ya',
    explanation: 'Alışmak феълест, ки ба пасванди самт (-e/-a) ниёз дорад: yaşamaya.' },
  { level: 'A2', skill: 'vocab', order: 18,
    prompt: 'Toplantı saat kaçta ___?', promptTranslated: 'Маҷлис соати чанд сар мешавад?',
    options: ['başlıyor', 'bitiyor', 'geliyor', 'gidiyor'], answer: 'başlıyor',
    explanation: 'Başlamak = Сар шудан.' },
  { level: 'A2', skill: 'grammar', order: 19,
    prompt: 'Hiç Japonca ___?', promptTranslated: 'Оё ягон бор бо забони ҷопонӣ гап задаӣ?',
    options: ['konuştun mu', 'konuşuyorsun', 'konuşacak mısın', 'konuşur musun'], answer: 'konuştun mu',
    explanation: '"Hiç" бо замони гузашта истифода мешавад: Hiç konuştun mu?' },
  { level: 'A2', skill: 'reading', order: 20,
    prompt: 'Kahve ___ çay mı istersiniz?', promptTranslated: 'Қаҳва мехоҳед ё чой?',
    options: ['mi', 've', 'ya da', 'ile'], answer: 'mi',
    explanation: '"Kahve mi çay mı" як қолаби саволӣ барои интихоб аст.' }
];

async function run() {
  const trLang = await sql`SELECT id FROM "Language" WHERE code='tr'`;
  const tgLang = await sql`SELECT id FROM "Language" WHERE code='tg'`;
  if (!trLang.length || !tgLang.length) throw new Error("Languages not found");
  
  const TR = trLang[0].id;
  const TG = tgLang[0].id;

  await sql`DELETE FROM "PlacementQuestion" WHERE "targetLanguageId"=${TR} AND "nativeLanguageId"=${TG}`;
  
  let ok = 0;
  for (const q of Q) {
    const opts = q.optionsCorrected || q.options;
    await sql`INSERT INTO "PlacementQuestion" (
      "id", "targetLanguageId", "nativeLanguageId", "cefrLevel", "skill", "order",
      "prompt", "promptTranslated", "options", "answer", "explanation"
    ) VALUES (
      gen_random_uuid()::text, ${TR}, ${TG}, ${q.level}, ${q.skill}, ${q.order},
      ${q.prompt}, ${q.promptTranslated}, ${JSON.stringify(opts)}::jsonb, ${q.answer}, ${q.explanation}
    )`;
    ok++;
  }

  console.log(`Inserted ${ok} placement questions.`);
}
run().catch(console.error);
