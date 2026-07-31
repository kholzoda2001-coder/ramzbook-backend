/**
 * Admin: one-click demo content for the library.
 *
 * Why an endpoint and not a script: the developer machine cannot reach Neon
 * (port 5432 is blocked on that network), but this route runs on Vercel, which
 * can. Pressing the button in /admin/library is the only path that works from
 * there.
 *
 * Idempotent — an item whose title already exists is skipped, so pressing the
 * button twice never duplicates a shelf.
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type SeedPage = { title: string; content: string };
type SeedItem = {
  type: 'book' | 'audio' | 'video' | 'template';
  title: string;
  author: string;
  description: string;
  level?: string;
  targetLang?: string;
  mediaUrl?: string;
  durationMin?: number;
  rating?: number;
  order: number;
  pages?: SeedPage[];
};

const SEED: SeedItem[] = [
  {
    type: 'book',
    title: 'Англисӣ барои сафар',
    author: 'RAMZ Academy',
    description: 'Ибораҳои зарурӣ барои фурудгоҳ, меҳмонхона, тарабхона ва кӯча. Ҳар ибора бо талаффуз ва тарҷумаи тоҷикӣ.',
    level: 'A1',
    targetLang: 'en',
    rating: 4.8,
    order: 1,
    pages: [
      {
        title: 'Дар фурудгоҳ',
        content:
          'Дар фурудгоҳ шумо ҳамеша ҳамин чанд ибораро мешунавед ва мегӯед.\n\n' +
          '• Where is the check-in desk? — Мизи бақайдгирӣ куҷост?\n' +
          '• Here is my passport. — Ин шиносномаи ман.\n' +
          '• I have one suitcase. — Ман як ҷомадон дорам.\n' +
          '• Which gate is my flight? — Парвози ман аз кадом дарвоза аст?\n' +
          '• Is the flight on time? — Парвоз саривақт аст?\n\n' +
          'Маслиҳат: калимаи «please» (лутфан) ҳар дархостро хушмуомилатар мекунад:\n' +
          '«One coffee, please.» — «Як қаҳва, лутфан.»',
      },
      {
        title: 'Дар меҳмонхона',
        content:
          'Ҳангоми ба меҳмонхона расидан:\n\n' +
          '• I have a reservation. — Ман ҷойи фармоишӣ дорам.\n' +
          '• My name is Farhod. — Номи ман Фарҳод.\n' +
          '• A room for two nights, please. — Як ҳуҷра барои ду шаб, лутфан.\n' +
          '• What time is breakfast? — Наҳорӣ соати чанд аст?\n' +
          '• Is Wi-Fi free? — Wi-Fi ройгон аст?\n\n' +
          'Агар чизе нафаҳмидед, натарсед бигӯед:\n' +
          '«Sorry, could you repeat that?» — «Бубахшед, метавонед такрор кунед?»',
      },
      {
        title: 'Дар тарабхона',
        content:
          'Фармоиш додан осон аст — се қолаби асосӣ:\n\n' +
          '• I would like… — Ман мехостам…\n' +
          '  «I would like a tea, please.» — «Ман як чой мехостам, лутфан.»\n' +
          '• Can I have…? — Метавонам … гирам?\n' +
          '  «Can I have the menu?» — «Метавонам менюро гирам?»\n' +
          '• The bill, please. — Ҳисоб, лутфан.\n\n' +
          'Калимаҳои муфид: water (об), bread (нон), meat (гӯшт), rice (биринҷ), salad (хӯриш).',
      },
      {
        title: 'Роҳро пурсидан',
        content:
          'Вақте роҳро гум кардед:\n\n' +
          '• Excuse me, where is the bus station? — Бубахшед, истгоҳи автобус куҷост?\n' +
          '• How can I get to the centre? — Чӣ тавр ба марказ равам?\n' +
          '• Is it far from here? — Аз ин ҷо дур аст?\n' +
          '• How much is a ticket? — Чипта чанд пул аст?\n\n' +
          'Ҷавобҳои маъмул:\n' +
          'go straight (рост равед), turn left (ба чап гардед), turn right (ба рост гардед), ' +
          'it is near (наздик аст).',
      },
      {
        title: 'Ҳолатҳои фавқулода',
        content:
          'Ин ибораҳоро аз ёд кунед — умед аст ҳеҷ гоҳ лозим нашаванд.\n\n' +
          '• Help! — Кумак!\n' +
          '• I need a doctor. — Ба ман духтур лозим аст.\n' +
          '• Call the police, please. — Лутфан, полисро занг занед.\n' +
          '• I lost my passport. — Ман шиносномаамро гум кардам.\n' +
          '• I don’t feel well. — Ман худро хуб ҳис намекунам.\n\n' +
          'Рақами ёрии таъҷилӣ дар аксари кишварҳои Аврупо — 112.',
      },
    ],
  },
  {
    type: 'book',
    title: '100 калимаи аввалини англисӣ',
    author: 'RAMZ Academy',
    description: 'Калимаҳое ки аз ҳама бештар истифода мешаванд, аз рӯи мавзӯъ гурӯҳбандӣ шудаанд. Оғози беҳтарин барои сатҳи сифр.',
    level: 'A1',
    targetLang: 'en',
    rating: 4.9,
    order: 2,
    pages: [
      {
        title: 'Одамон ва оила',
        content:
          'mother — модар\nfather — падар\nbrother — бародар\nsister — хоҳар\n' +
          'son — писар\ndaughter — духтар\nfriend — дӯст\nchild — кӯдак\n' +
          'man — мард\nwoman — зан\nfamily — оила\nname — ном\n\n' +
          'Ҷумлаи намуна: «This is my sister.» — «Ин хоҳари ман.»',
      },
      {
        title: 'Хона ва ашё',
        content:
          'house — хона\nroom — ҳуҷра\ndoor — дар\nwindow — тиреза\n' +
          'table — миз\nchair — курсӣ\nbed — кат\nbook — китоб\n' +
          'phone — телефон\nkey — калид\nwater — об\nfood — хӯрок\n\n' +
          'Ҷумлаи намуна: «The book is on the table.» — «Китоб дар болои миз аст.»',
      },
      {
        title: 'Феълҳои асосӣ',
        content:
          'be — будан\nhave — доштан\ndo — кардан\ngo — рафтан\n' +
          'come — омадан\nsee — дидан\nknow — донистан\nwant — хостан\n' +
          'give — додан\ntake — гирифтан\nsay — гуфтан\neat — хӯрдан\n\n' +
          'Ҳамин 12 феъл қариб нисфи гуфтугӯи ҳаррӯзаро мепӯшонанд.',
      },
      {
        title: 'Рақамҳо ва вақт',
        content:
          'one 1, two 2, three 3, four 4, five 5\nsix 6, seven 7, eight 8, nine 9, ten 10\n\n' +
          'today — имрӯз\ntomorrow — фардо\nyesterday — дирӯз\n' +
          'morning — субҳ\nevening — бегоҳ\nnight — шаб\nweek — ҳафта\nyear — сол\n\n' +
          'Ҷумлаи намуна: «I have two brothers.» — «Ман ду бародар дорам.»',
      },
      {
        title: 'Сифатҳои муфид',
        content:
          'good — хуб\nbad — бад\nbig — калон\nsmall — хурд\n' +
          'new — нав\nold — кӯҳна / пир\nhot — гарм\ncold — хунук\n' +
          'easy — осон\ndifficult — душвор\nbeautiful — зебо\nexpensive — қиммат\n\n' +
          'Ҷумлаи намуна: «English is not difficult.» — «Англисӣ душвор нест.»',
      },
    ],
  },
  {
    type: 'book',
    title: 'Present Simple — замони ҳозираи оддӣ',
    author: 'RAMZ Academy',
    description: 'Аввалин ва муҳимтарин замони англисӣ. Бо мисолҳои содда ва хатоҳои маъмул.',
    level: 'A2',
    targetLang: 'en',
    rating: 4.7,
    order: 3,
    pages: [
      {
        title: 'Кай истифода мешавад',
        content:
          'Present Simple барои ин ҳолатҳо кор меояд:\n\n' +
          '1. Амали такроршаванда (ҳар рӯз, ҳар ҳафта):\n' +
          '   «I go to work every day.» — «Ман ҳар рӯз ба кор меравам.»\n\n' +
          '2. Далели доимӣ:\n' +
          '   «Water boils at 100 degrees.» — «Об дар 100 дараҷа меҷӯшад.»\n\n' +
          '3. Ҷадвал ва барнома:\n' +
          '   «The train leaves at 7.» — «Қатора соати 7 мебарояд.»',
      },
      {
        title: 'Сохти ҷумла',
        content:
          'ТАСДИҚӢ:\nI / You / We / They + феъл\n«I work.» «They live in Dushanbe.»\n\n' +
          'He / She / It + феъл + **-s**\n«He works.» «She lives in Dushanbe.»\n\n' +
          'ИНКОРӢ:\n«I do not (don’t) work.»\n«He does not (doesn’t) work.»\n\n' +
          'САВОЛӢ:\n«Do you work?»\n«Does he work?»',
      },
      {
        title: 'Ҳарфи -s: қоидаи муҳим',
        content:
          'Танҳо бо he / she / it ҳарфи -s илова мешавад:\n\n' +
          'work → works\nplay → plays\nread → reads\n\n' +
          'Агар феъл бо -s, -sh, -ch, -x, -o тамом шавад → -es:\n' +
          'go → goes\nwatch → watches\nfinish → finishes\n\n' +
          'Агар бо ҳамсадо + y тамом шавад → y ба -ies иваз мешавад:\n' +
          'study → studies\ntry → tries',
      },
      {
        title: 'Се хатои маъмул',
        content:
          '❌ «He work every day.»\n✅ «He works every day.»\n' +
          '(бо he/she/it ҳатман -s)\n\n' +
          '❌ «He doesn’t works.»\n✅ «He doesn’t work.»\n' +
          '(баъди does/doesn’t феъл БЕ -s мемонад)\n\n' +
          '❌ «Do he work?»\n✅ «Does he work?»\n\n' +
          'Ҳамин се қоидаро дуруст кунед — 80% хатоҳо нест мешаванд.',
      },
    ],
  },
  {
    type: 'book',
    title: 'Муколамаҳои корӣ',
    author: 'RAMZ Academy',
    description: 'Забони англисӣ дар муҳити корӣ: вохӯрӣ, почтаи электронӣ, гуфтугӯи телефонӣ ва мусоҳибаи корӣ.',
    level: 'B1',
    targetLang: 'en',
    rating: 4.6,
    order: 4,
    pages: [
      {
        title: 'Шиносоӣ ва вохӯрӣ',
        content:
          'A: Good morning. I’m Farhod from RAMZ.\n' +
          'B: Nice to meet you, Farhod. I’m Sarah.\n' +
          'A: Nice to meet you too. Thank you for your time.\n\n' +
          'Тарҷума:\n' +
          '— Субҳ ба хайр. Ман Фарҳод аз RAMZ.\n' +
          '— Аз шиносоӣ шодам, Фарҳод. Ман Сара.\n' +
          '— Ман ҳам шодам. Ташаккур барои вақтатон.\n\n' +
          'Маслиҳат: дар муҳити корӣ ба ҷои «Hi» беҳтар «Good morning / Good afternoon».',
      },
      {
        title: 'Почтаи электронии корӣ',
        content:
          'Сохти оддии як мактуб:\n\n' +
          'Dear Ms. Smith,\n\n' +
          'I hope this email finds you well.\n' +
          'I am writing regarding our meeting on Monday.\n' +
          'Could you please confirm the time?\n\n' +
          'Best regards,\nFarhod\n\n' +
          'Ибораҳои муфид:\n' +
          '• Please find attached… — Лутфан замимаро бинед…\n' +
          '• Looking forward to your reply. — Мунтазири ҷавобатон.\n' +
          '• Thank you in advance. — Пешакӣ ташаккур.',
      },
      {
        title: 'Гуфтугӯи телефонӣ',
        content:
          '• Hello, this is Farhod speaking. — Салом, Фарҳод дар алоқа.\n' +
          '• Could I speak to Mr. Brown? — Метавонам бо ҷаноби Браун гап занам?\n' +
          '• Hold on a moment, please. — Як лаҳза интизор шавед, лутфан.\n' +
          '• Sorry, the line is bad. — Бубахшед, алоқа бад аст.\n' +
          '• Can I call you back? — Метавонам баъдтар занг занам?\n\n' +
          'Агар нафаҳмидед: «Could you speak more slowly, please?»',
      },
      {
        title: 'Мусоҳибаи корӣ',
        content:
          'Саволҳои маъмул ва тарзи ҷавоб:\n\n' +
          '• Tell me about yourself. — Дар бораи худ нақл кунед.\n' +
          '  «I have three years of experience in…»\n\n' +
          '• What are your strengths? — Тарафҳои қавии шумо?\n' +
          '  «I am organised and I learn quickly.»\n\n' +
          '• Why do you want this job? — Чаро ин корро мехоҳед?\n' +
          '  «Because I want to grow in this field.»\n\n' +
          'Маслиҳат: ҷавоби кӯтоҳ ва мушаххас аз ҷавоби дароз беҳтар аст.',
      },
    ],
  },
  {
    type: 'book',
    title: 'Феълҳои номунтазам',
    author: 'RAMZ Academy',
    description: 'Ҷадвали феълҳои номунтазами англисӣ бо тарҷумаи тоҷикӣ — он чизе ки ҳатман аз ёд кардан лозим аст.',
    level: 'A2',
    targetLang: 'en',
    rating: 4.5,
    order: 5,
    pages: [
      {
        title: 'Чаро «номунтазам»?',
        content:
          'Аксари феълҳо дар замони гузашта -ed мегиранд:\n' +
          'work → worked, play → played\n\n' +
          'Вале як гурӯҳи феълҳо ин қоидаро риоя намекунанд:\n' +
          'go → went (НЕ «goed»)\nsee → saw (НЕ «seed»)\n\n' +
          'Инҳо «феълҳои номунтазам» ном доранд. Роҳи ягона — аз ёд кардан. ' +
          'Хушбахтона, дар гуфтугӯи ҳаррӯза ~50 феъл кофист.',
      },
      {
        title: '15 феъли аз ҳама муҳим',
        content:
          'be — was/were — been — будан\n' +
          'have — had — had — доштан\n' +
          'do — did — done — кардан\n' +
          'go — went — gone — рафтан\n' +
          'come — came — come — омадан\n' +
          'see — saw — seen — дидан\n' +
          'take — took — taken — гирифтан\n' +
          'give — gave — given — додан\n' +
          'make — made — made — сохтан\n' +
          'know — knew — known — донистан\n' +
          'say — said — said — гуфтан\n' +
          'get — got — got — гирифтан\n' +
          'find — found — found — ёфтан\n' +
          'think — thought — thought — фикр кардан\n' +
          'tell — told — told — нақл кардан',
      },
      {
        title: 'Феълҳои ҳаррӯза',
        content:
          'eat — ate — eaten — хӯрдан\n' +
          'drink — drank — drunk — нӯшидан\n' +
          'sleep — slept — slept — хобидан\n' +
          'write — wrote — written — навиштан\n' +
          'read — read — read — хондан\n' +
          'speak — spoke — spoken — гап задан\n' +
          'buy — bought — bought — харидан\n' +
          'sell — sold — sold — фурӯхтан\n' +
          'run — ran — run — давидан\n' +
          'sit — sat — sat — нишастан\n\n' +
          'Диққат: «read» дар навишт тағйир намеёбад, вале талаффузаш дигар мешавад.',
      },
      {
        title: 'Чӣ тавр зудтар аз ёд кунем',
        content:
          '1. Аз рӯи гурӯҳ ёд кунед, на алифбо:\n' +
          '   • Ҳамон шакл: cut — cut — cut, put — put — put\n' +
          '   • i → a → u: begin — began — begun, drink — drank — drunk\n\n' +
          '2. Ҳар феълро дар ҷумла ёд кунед, на танҳо:\n' +
          '   «I went to school.» аз «go — went» беҳтар дар хотир мемонад.\n\n' +
          '3. Рӯзе 5 феъл — на 50. Дар як моҳ 150 феъл мешавад.',
      },
    ],
  },
  {
    type: 'template',
    title: 'Шаблони мактуби корӣ',
    author: 'RAMZ Academy',
    description: 'Қолабҳои тайёр барои мактубҳои корӣ — танҳо номҳоро иваз кунед.',
    level: 'B1',
    targetLang: 'en',
    order: 6,
    pages: [
      {
        title: 'Дархости вохӯрӣ',
        content:
          'Subject: Meeting request\n\n' +
          'Dear [Name],\n\n' +
          'I would like to arrange a meeting to discuss [topic].\n' +
          'Would [day] at [time] be convenient for you?\n\n' +
          'Please let me know if another time works better.\n\n' +
          'Best regards,\n[Your name]',
      },
      {
        title: 'Ҷавоб ба пешниҳод',
        content:
          'Subject: Re: Your proposal\n\n' +
          'Dear [Name],\n\n' +
          'Thank you for your proposal. I have reviewed it carefully.\n' +
          'I would like to clarify one point: [question].\n\n' +
          'Looking forward to your reply.\n\n' +
          'Best regards,\n[Your name]',
      },
      {
        title: 'Узрхоҳӣ барои таъхир',
        content:
          'Subject: Apology for the delay\n\n' +
          'Dear [Name],\n\n' +
          'I apologise for the delay in my reply.\n' +
          'I will send you [document] by [date].\n\n' +
          'Thank you for your patience.\n\n' +
          'Best regards,\n[Your name]',
      },
    ],
  },
  {
    type: 'audio',
    title: 'Афсонаҳои Эзоп (аудио, англисӣ)',
    author: 'LibriVox — мулки умум',
    description:
      'ДЕМО. Афсонаҳои кӯтоҳи Эзоп бо талаффузи возеҳи англисӣ — барои машқи гӯш кардан. ' +
      'Ин сабт мулки умум (public domain) аст ва барои намоиш гузошта шудааст; онро бо сабти худатон иваз карда метавонед.',
    level: 'A2',
    targetLang: 'en',
    mediaUrl: 'https://archive.org/download/aesop_fables_volume_one_librivox/fables_01_01_aesop_64kb.mp3',
    durationMin: 4,
    rating: 4.4,
    order: 1,
  },
  {
    type: 'video',
    title: 'Видеои намунавӣ (демо)',
    author: 'Blender Foundation — CC BY',
    description:
      'ДЕМО. Видеои кушоди литсензиядор, танҳо барои санҷиши кор кардани бахши видео. ' +
      'Онро бо видео-дарси худатон иваз кунед (масалан ҳаволаи YouTube).',
    targetLang: 'en',
    mediaUrl: 'https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4',
    durationMin: 10,
    order: 1,
  },
];

export async function POST(_req: NextRequest) {
  try {
    const existing = await prisma.libraryItem.findMany({ select: { title: true } });
    const have = new Set(existing.map((e) => e.title));

    let created = 0;
    let skipped = 0;

    for (const item of SEED) {
      if (have.has(item.title)) {
        skipped++;
        continue;
      }
      const { pages, ...rest } = item;
      await prisma.libraryItem.create({
        data: {
          ...rest,
          isActive: true,
          isPremium: false,
          ...(pages?.length
            ? {
                pages: {
                  create: pages.map((p, i) => ({ order: i, title: p.title, content: p.content })),
                },
              }
            : {}),
        },
      });
      created++;
    }

    return Response.json({ ok: true, created, skipped, total: SEED.length });
  } catch (e) {
    console.error('[admin/library/seed]', e);
    return Response.json({ error: 'Seed failed' }, { status: 500 });
  }
}
