export const MODULE = {
  order: 8,
  title: 'Şehir ve Yönler',
  titleTranslated: 'Шаҳр ва Самтҳо',
  emoji: '🏙️',
};

export const VOCAB = [
  {
    title: 'Şehirdeki Yerler 1', titleTranslated: 'Ҷойҳо дар шаҳр 1', emoji: '🏢',
    words: [
      { word: 'Şehir', existing: true, translation: 'Шаҳр', emoji: '🏙️', ipa: '/ʃɛhiɾ/',
        example: 'Şehir çok büyük.', exampleTrans: 'Шаҳр хеле калон аст.' },
      { word: 'Sokak', existing: true, translation: 'Кӯча', emoji: '🛣️', ipa: '/sokak/',
        example: 'Sokakta çocuklar oynuyor.', exampleTrans: 'Дар кӯча кӯдакон бозӣ мекунанд.' },
      { word: 'Cadde', existing: true, translation: 'Хиёбон', emoji: '🌆', ipa: '/dʒaddɛ/',
        example: 'Cadde çok kalabalık.', exampleTrans: 'Хиёбон хеле серодам аст.' },
      { word: 'Park', existing: true, translation: 'Парк (Боғ)', emoji: '🏞️', ipa: '/paɾk/',
        example: 'Parkta yürüyorum.', exampleTrans: 'Ман дар боғ қадам мезанам.' },
      { word: 'Meydan', existing: true, translation: 'Майдон', emoji: '⛲', ipa: '/mɛjdan/',
        example: 'Meydanda bir heykel var.', exampleTrans: 'Дар майдон як ҳайкал ҳаст.' },
    ],
  },
  {
    title: 'Şehirdeki Yerler 2', titleTranslated: 'Ҷойҳо дар шаҳр 2', emoji: '🏥',
    words: [
      { word: 'Okul', existing: true, translation: 'Мактаб', emoji: '🏫', ipa: '/okul/',
        example: 'Okul evimize yakın.', exampleTrans: 'Мактаб ба хонаи мо наздик аст.' },
      { word: 'Hastane', existing: true, translation: 'Беморхона', emoji: '🏥', ipa: '/hastanɛ/',
        example: 'Hastane şehir merkezinde.', exampleTrans: 'Беморхона дар маркази шаҳр аст.' },
      { word: 'Banka', existing: true, translation: 'Бонк', emoji: '🏦', ipa: '/banka/',
        example: 'Banka saat dokuzda açılıyor.', exampleTrans: 'Бонк соати нӯҳ кушода мешавад.' },
      { word: 'Market', existing: true, translation: 'Супермаркет', emoji: '🏪', ipa: '/maɾkɛt/',
        example: 'Markete gidiyorum.', exampleTrans: 'Ман ба супермаркет меравам.' },
      { word: 'Otel', existing: true, translation: 'Меҳмонхона', emoji: '🏨', ipa: '/otɛl/',
        example: 'Otel çok temiz.', exampleTrans: 'Меҳмонхона хеле тоза аст.' },
      { word: 'İstasyon', existing: true, translation: 'Истгоҳ (Вокзал)', emoji: '🚉', ipa: '/istasjon/',
        example: 'İstasyon uzak mı?', exampleTrans: 'Истгоҳ дур аст?' },
    ],
  },
  {
    title: 'Yönler', titleTranslated: 'Самтҳо', emoji: '🧭',
    words: [
      { word: 'Sağ', existing: true, translation: 'Рост', emoji: '➡️', ipa: '/sa./',
        example: 'Sağa dön lütfen.', exampleTrans: 'Лутфан ба рост гард.' },
      { word: 'Sol', existing: true, translation: 'Чап', emoji: '⬅️', ipa: '/sol/',
        example: 'Sola git.', exampleTrans: 'Ба чап рав.' },
      { word: 'İleri', existing: true, translation: 'Пеш (Рост)', emoji: '⬆️', ipa: '/ilɛɾi/',
        example: 'İleri git, sonra sağa dön.', exampleTrans: 'Ба пеш рав, баъд ба рост гард.' },
      { word: 'Geri', existing: true, translation: 'Қафо (Ақиб)', emoji: '⬇️', ipa: '/ɟɛɾi/',
        example: 'Biraz geri git.', exampleTrans: 'Каме ба ақиб рав.' },
      { word: 'Karşı', existing: true, translation: 'Рӯ ба рӯ', emoji: '↔️', ipa: '/kaɾʃɯ/',
        example: 'Banka okulun karşısında.', exampleTrans: 'Бонк дар рӯ ба рӯи мактаб аст.' },
    ],
  },
  {
    title: 'Ulaşım', titleTranslated: 'Нақлиёт', emoji: '🚌',
    words: [
      { word: 'Araba', existing: true, translation: 'Мошин', emoji: '🚗', ipa: '/aɾaba/',
        example: 'Arabam kırmızı.', exampleTrans: 'Мошини ман сурх аст.' },
      { word: 'Otobüs', existing: true, translation: 'Автобус', emoji: '🚌', ipa: '/otobys/',
        example: 'Otobüs geldi.', exampleTrans: 'Автобус омад.' },
      { word: 'Tren', existing: true, translation: 'Поезд', emoji: '🚆', ipa: '/tɾɛn/',
        example: 'Tren saat üçte kalkıyor.', exampleTrans: 'Поезд соати се ҳаракат мекунад.' },
      { word: 'Bisiklet', existing: true, translation: 'Дучарха', emoji: '🚲', ipa: '/bisiclɛt/',
        example: 'Bisiklet sürüyorum.', exampleTrans: 'Ман дучархаронӣ мекунам.' },
      { word: 'Taksi', existing: true, translation: 'Такси', emoji: '🚕', ipa: '/taksi/',
        example: 'Taksi çağırıyorum.', exampleTrans: 'Ман такси даъват мекунам.' },
          { word: 'Vapur', existing: true, translation: 'Киштӣ (паром)', emoji: '⛴️',
        example: 'Vapur ile gidiyorum.', exampleTrans: 'Ман бо киштӣ меравам.' },
      { word: 'Durak', existing: true, translation: 'Истгоҳ', emoji: '🚏',
        example: 'Durak burada.', exampleTrans: 'Истгоҳ ин ҷост.' },
],
  },
  {
    title: 'Fiiller', titleTranslated: 'Феълҳо', emoji: '🏃',
    words: [
      { word: 'Gitmek', existing: true, translation: 'Рафтан', emoji: '🚶', ipa: '/ɟitmɛc/',
        example: 'Okula gitmek istiyorum.', exampleTrans: 'Ман ба мактаб рафтан мехоҳам.' },
      { word: 'Gelmek', existing: true, translation: 'Омадан', emoji: '🏃', ipa: '/ɟɛlmɛc/',
        example: 'Yarın gelmek istiyorum.', exampleTrans: 'Ман пагоҳ омадан мехоҳам.' },
      { word: 'Dönmek', existing: true, translation: 'Гаштан (тоб хӯрдан)', emoji: '↪️', ipa: '/dœnmɛc/',
        example: 'Sağa dönmek lazım.', exampleTrans: 'Ба рост гаштан лозим аст.' },
      { word: 'Durmak', existing: true, translation: 'Истодан', emoji: '🛑', ipa: '/duɾmak/',
        example: 'Otobüs burada duruyor.', exampleTrans: 'Автобус дар ин ҷо меистад.' },
      { word: 'Geçmek', existing: true, translation: 'Гузаштан', emoji: '↔️', ipa: '/ɟɛtʃmɛc/',
        example: 'Caddeden geçiyorum.', exampleTrans: 'Ман аз хиёбон мегузарам.' },
    ],
  },
  {
    title: 'Soru ve Yer', titleTranslated: 'Савол ва Ҷой', emoji: '📍',
    words: [
      { word: 'Nereye?', existing: true, translation: 'Ба куҷо?', emoji: '❓', ipa: '/nɛɾɛjɛ/',
        example: 'Nereye gidiyorsun?', exampleTrans: 'Ту ба куҷо меравӣ?' },
      { word: 'Burada', existing: true, translation: 'Дар ин ҷо', emoji: '📍', ipa: '/buɾada/',
        example: 'Otobüs durağı burada.', exampleTrans: 'Истгоҳи автобус ин ҷост.' },
      { word: 'Orada', existing: true, translation: 'Дар он ҷо', emoji: '📌', ipa: '/oɾada/',
        example: 'Market orada.', exampleTrans: 'Супермаркет он ҷост.' },
      { word: 'Uzak', existing: true, translation: 'Дур', emoji: '🔭', ipa: '/uzak/',
        example: 'İstasyon çok uzak.', exampleTrans: 'Истгоҳ хеле дур аст.' },
      { word: 'Yakın', existing: true, translation: 'Наздик', emoji: '🔍', ipa: '/jakɯn/',
        example: 'Park eve yakın.', exampleTrans: 'Боғ ба хона наздик аст.' },
    ],
  },
  {
    title: 'Şehirdeki Yerler 3', titleTranslated: 'Ҷойҳои шаҳр 3', emoji: '🕌',
    words: [
      { word: 'Cami', existing: true, translation: 'Масҷид', emoji: '🕌',
        example: 'Cami meydanın yanında.', exampleTrans: 'Масҷид дар паҳлӯи майдон аст.' },
      { word: 'Müze', existing: true, translation: 'Осорхона', emoji: '🏛️',
        example: 'Müze pazartesi kapalı.', exampleTrans: 'Осорхона рӯзи душанбе баста аст.' },
      { word: 'Kütüphane', existing: true, translation: 'Китобхона', emoji: '📚',
        example: 'Kütüphanede ders çalışıyorum.', exampleTrans: 'Ман дар китобхона дарс мехонам.' },
      { word: 'Postane', existing: true, translation: 'Почта', emoji: '📮',
        example: 'Postane nerede?', exampleTrans: 'Почта куҷост?' },
      { word: 'Köprü', existing: true, translation: 'Купрук', emoji: '🌉',
        example: 'Köprü çok uzun.', exampleTrans: 'Купрук хеле дароз аст.' },
      { word: 'Kafe', existing: true, translation: 'Қаҳвахона', emoji: '☕',
        example: 'Kafede buluşalım.', exampleTrans: 'Биё дар қаҳвахона вохӯрем.' },
    ],
  },
];

export const GRAMMAR = [
  {
    lessonTitle: 'Yönelme Durumu (-a/-e)', lessonTitleTranslated: 'Пасванди самт (ба: -a/-e)',
    skillType: 'grammar', xpReward: 20, emoji: '➡️',
    title: 'Nereye? (-a, -e, -ya, -ye)', titleTranslated: 'Ба куҷо? (-a, -e, -ya, -ye)',
    explanation:
`Дар туркӣ барои гуфтани "ба" (самти ҳаракат) аз пасвандҳои **-a, -e** (ё **-ya, -ye** баъди садонок) истифода мешавад.

Қоидаи Ҳамоҳангӣ:
- **a, ı, o, u** -> **-a** (Okul**a** - Ба мактаб)
- **e, i, ö, ü** -> **-e** (Market**e** - Ба супермаркет)

Агар калима бо садонок тамом шавад, ҳарфи **y** илова мешавад:
- Banka -> Banka**ya** (Ба бонк)
- Hastane -> Hastane**ye** (Ба беморхона)

Мисолҳо:
- Ben okul**a** gidiyorum. (Ман **ба мактаб** меравам.)
- Otel**e** gidiyorum. (Ман **ба меҳмонхона** меравам.)`,
    rules: [
      { pattern: 'Kalın ünlü -> -a / -ya', note: 'Park -> Parka (Ба парк), Banka -> Bankaya (Ба бонк)' },
      { pattern: 'İnce ünlü -> -e / -ye', note: 'Ev -> Eve (Ба хона), Hastane -> Hastaneye (Ба беморхона)' },
    ],
    examples: [
      { sentence: 'Nereye gidiyorsun?', translation: 'Ба куҷо меравӣ?', highlight: 'Nereye' },
      { sentence: 'Okula gidiyorum.', translation: 'Ба мактаб меравам.', highlight: 'Okula' },
      { sentence: 'Hastaneye gidiyor.', translation: 'Вай ба беморхона меравад.', highlight: 'Hastaneye' },
      { sentence: 'Markete gel.', translation: 'Ба супермаркет биё.', highlight: 'Markete' },
    ],
    exercises: [
      { prompt: 'Ben park___ gidiyorum. (Ман ба парк меравам.)', promptTranslated: 'Ben park___ gidiyorum. (Ман ба парк меравам.)', answer: 'a', options: ['a', 'e', 'ya'], explanation: 'Park бо ҳамсадо ва a тамом мешавад -> -a (Parka).' },
      { prompt: 'Ahmet ev___ gidiyor. (Аҳмад ба хона меравад.)', promptTranslated: 'Ahmet ev___ gidiyor. (Аҳмад ба хона меравад.)', answer: 'e', options: ['e', 'a', 'ye'], explanation: 'Ev бо e меояд -> -e (Eve).' },
      { prompt: 'O banka___ gidiyor. (Вай ба бонк меравад.)', promptTranslated: 'O banka___ gidiyor. (Вай ба бонк меравад.)', answer: 'ya', options: ['ya', 'ye', 'a'], explanation: 'Banka бо садонок (a) тамом мешавад -> -ya (Bankaya).' },
          { prompt: 'Ben okul___ gidiyorum.', promptTranslated: 'Ман ба мактаб меравам.', answer: 'a', options: ['a', 'e', 'ya', 'ye'], explanation: 'Садоноки охирин «u» ғафс → -a.' },
      { prompt: 'O sinema___ gidiyor.', promptTranslated: 'Вай ба кино меравад.', answer: 'ya', options: ['ya', 'a', 'ye', 'e'], explanation: 'Калима бо садонок тамом мешавад → -ya.' },
      { prompt: 'Biz şehir___ gidiyoruz.', promptTranslated: 'Мо ба шаҳр меравем.', answer: 'e', options: ['e', 'a', 'ye', 'ya'], explanation: 'Садоноки охирин «i» тунук → -e.' },
],
  },
  {
    lessonTitle: 'Emir Kipi', lessonTitleTranslated: 'Сиғаи амрӣ',
    skillType: 'grammar', xpReward: 20, emoji: '🛑',
    title: 'Emir Vermek (Commands)', titleTranslated: 'Амр кардан (Фармон додан)',
    explanation:
`Барои роҳ нишон додан ба одамон дар кӯча, шумо аз Сиғаи Амрӣ (Emir Kipi) истифода мебаред.
Дар туркӣ, сохтани амр хеле осон аст: танҳо пасванди "-mak/-mek"-и феълро гиред!

- Gitmek (Рафтан) -> **Git** (Рав!)
- Gelmek (Омадан) -> **Gel** (Биё!)
- Dönmek (Гаштан) -> **Dön** (Тов хӯр!)
- Durmak (Истодан) -> **Dur** (Ист!)

Агар хоҳед, ки эҳтиромона (барои "Шумо") амр кунед, пасванди **-ın / -in** ё **-ınız / -iniz**-ро илова кунед:
- Git -> **Gidin** / **Gidiniz** (Равед)
- Dön -> **Dönün** / **Dönünüz** (Тов хӯред)`,
    rules: [
      { pattern: 'Fiil Kökü (Sen)', note: 'İleri git! (Ба пеш рав!)' },
      { pattern: 'Fiil Kökü + in/ün (Siz)', note: 'Sağa dönün. (Ба рост тов хӯред.)' },
    ],
    examples: [
      { sentence: 'Sağa dön!', translation: 'Ба рост тов хӯр!', highlight: 'dön' },
      { sentence: 'Lütfen sola dönün.', translation: 'Лутфан ба чап тов хӯред.', highlight: 'dönün' },
      { sentence: 'İleri git.', translation: 'Ба пеш рав.', highlight: 'git' },
      { sentence: 'Burada durun.', translation: 'Дар ин ҷо истед.', highlight: 'durun' },
    ],
    exercises: [
      { prompt: 'Sağa ___. (Ба рост тов хӯр.)', promptTranslated: 'Sağa ___. (Ба рост тов хӯр.)', answer: 'dön', options: ['dön', 'dönmek', 'dönüyor'], explanation: 'Амр барои "Ту" = dön.' },
      { prompt: 'Lütfen ileri ___. (Лутфан ба пеш равед.)', promptTranslated: 'Lütfen ileri ___. (Лутфан ба пеш равед.)', answer: 'gidin', options: ['gidin', 'git', 'gidecek'], explanation: 'Амри эҳтиромона (Siz) = gidin.' },
      { prompt: 'Burada ___. (Дар ин ҷо ист.)', promptTranslated: 'Burada ___. (Дар ин ҷо ист.)', answer: 'dur', options: ['dur', 'durun', 'durmak'], explanation: 'Амр барои "Ту" = dur.' },
          { prompt: 'Lütfen burada ___.', promptTranslated: 'Лутфан дар ин ҷо истед.', answer: 'durun', options: ['durun', 'dur', 'duruyor', 'durmak'], explanation: 'Шакли боадабона: -un.' },
      { prompt: 'Sola ___!', promptTranslated: 'Ба чап гард!', answer: 'dön', options: ['dön', 'dönün', 'dönüyor', 'dönmek'], explanation: 'Шакли «sen»: танҳо решаи феъл.' },
      { prompt: 'Kapıyı ___ lütfen.', promptTranslated: 'Лутфан дарро кушоед.', answer: 'açın', options: ['açın', 'aç', 'açıyor', 'açmak'], explanation: 'Барои «siz» — açın.' },
],
  },
  {
    lessonTitle: 'Ulaşım Araçları (İle)', lessonTitleTranslated: 'Воситаҳои нақлиёт (Бо)',
    skillType: 'grammar', xpReward: 20, emoji: '🚌',
    title: 'Araçlar ve "İle"', titleTranslated: 'Нақлиёт ва "Бо"',
    explanation:
`Барои гуфтани "Бо мошин рафтан" ё "Бо автобус омадан", дар туркӣ пасванди **-la / -le** ё калимаи **ile** (бо) истифода мешавад.

- Araba **ile** (Бо мошин) = Araba**yla**
- Otobüs **ile** (Бо автобус) = Otobüs**le**
- Tren **ile** (Бо поезд) = Tren**le**

Мисолҳо:
- Okula otobüs**le** gidiyorum. (Ба мактаб **бо** автобус меравам.)
- İşe araba**yla** gidiyorum. (Ба кор **бо** мошин меравам.)`,
    rules: [
      { pattern: 'Ünsüz harf + la/le', note: 'Otobüsle (Бо автобус)' },
      { pattern: 'Ünlü harf + yla/yle', note: 'Arabayla (Бо мошин), Taksiyle (Бо такси)' },
    ],
    examples: [
      { sentence: 'İşe trenle gidiyorum.', translation: 'Ба кор бо поезд меравам.', highlight: 'trenle' },
      { sentence: 'Otele taksiyle gidiyoruz.', translation: 'Ба меҳмонхона бо такси меравем.', highlight: 'taksiyle' },
      { sentence: 'Parka bisikletle gidiyor.', translation: 'Ба парк бо дучарха меравад.', highlight: 'bisikletle' },
    ],
    exercises: [
      { prompt: 'Tren___ gidiyorum. (Бо поезд меравам.)', promptTranslated: 'Tren___ gidiyorum. (Бо поезд меравам.)', answer: 'le', options: ['le', 'la', 'yle'], explanation: 'Tren бо ҳамсадо ва e тамом мешавад -> -le.' },
      { prompt: 'Taksi___ geliyorum. (Бо такси меоям.)', promptTranslated: 'Taksi___ geliyorum. (Бо такси меоям.)', answer: 'yle', options: ['yle', 'yla', 'le'], explanation: 'Taksi бо i (садонок) тамом мешавад -> -yle.' },
      { prompt: 'Okula otobüs___ gidiyorum. (Ба мактаб бо автобус меравам.)', promptTranslated: 'Okula otobüs___ gidiyorum. (Ба мактаб бо автобус меравам.)', answer: 'le', options: ['le', 'la', 'yle'], explanation: 'Otobüs бо s тамом мешавад -> -le.' },
          { prompt: 'Uçak___ gidiyorum.', promptTranslated: 'Ман бо ҳавопаймо меравам.', answer: 'la', options: ['la', 'le', 'yla', 'yle'], explanation: 'Садоноки охирин «a» ғафс → -la.' },
      { prompt: 'Metro___ geliyoruz.', promptTranslated: 'Мо бо метро меоем.', answer: 'yla', options: ['yla', 'la', 'yle', 'le'], explanation: 'Калима бо садонок → -yla.' },
      { prompt: 'Bisiklet___ gidiyor.', promptTranslated: 'Вай бо дучарха меравад.', answer: 'le', options: ['le', 'la', 'yle', 'yla'], explanation: 'Садоноки охирин «e» тунук → -le.' },
],
  },
  {
    lessonTitle: 'Nereden? (-dan, -den)', lessonTitleTranslated: 'Аз куҷо?',
    skillType: 'grammar', xpReward: 20, emoji: '↩️',
    title: 'Nereden? (-dan, -den, -tan, -ten)', titleTranslated: 'Аз куҷо? — бандаки -dan/-den',
    explanation:
`Се саволи ҷой дар туркӣ се бандаки гуногун доранд:

| савол | маъно | бандак | мисол |
|---|---|---|---|
| **Nerede?** | дар куҷо | -da / -de | okul**da** (дар мактаб) |
| **Nereye?** | ба куҷо | -a / -e | okul**a** (ба мактаб) |
| **Nereden?** | АЗ куҷо | -dan / -den | okul**dan** (аз мактаб) |

**Шакли бандак:**
- садоноки охирин ғафс (a, ı, o, u) → **-dan**: okul**dan**, ev… не, ev тунук аст
- садоноки охирин тунук (e, i, ö, ü) → **-den**: ev**den**, şehir**den**

**Доми дуюм — ҳамсадои сахт.** Агар калима бо **p, ç, t, k, s, ş, h, f** тамом
шавад, «d» ба «t» табдил меёбад:
> kitap → kitap**tan** · sokak → sokak**tan** · Taşkent → Taşkent**ten**

- Ben Tacikistan**dan** geliyorum. (Ман аз Тоҷикистон меоям.)
- Eve okul**dan** döndüm. (Ман аз мактаб ба хона баргаштам.)

Дар тоҷикӣ ҳамааш «аз» аст ва калима тағйир намеёбад — дар туркӣ бошад худи
калима бандак мегирад.`,
    rules: [
      { pattern: 'Ғафс → -dan · Тунук → -den', note: 'okuldan · evden.' },
      { pattern: 'Баъди p, ç, t, k, s, ş, h, f → -tan/-ten', note: 'kitaptan · sokaktan.' },
      { pattern: 'Nereden? = аз куҷо', note: 'Nereden geliyorsun? — Evden.' },
      { pattern: 'Се савол — се бандак', note: '-da (дар), -a (ба), -dan (аз).' },
    ],
    examples: [
      { sentence: 'Ben Tacikistandan geliyorum.', translation: 'Ман аз Тоҷикистон меоям.', highlight: 'dan' },
      { sentence: 'Okuldan eve gidiyorum.', translation: 'Ман аз мактаб ба хона меравам.', highlight: 'dan' },
      { sentence: 'Evden çıktım.', translation: 'Ман аз хона баромадам.', highlight: 'den' },
      { sentence: 'Nereden geliyorsun?', translation: 'Ту аз куҷо меоӣ?', highlight: 'Nereden' },
      { sentence: 'Kitaptan bir soru.', translation: 'Як савол аз китоб.', highlight: 'tan' },
      { sentence: 'Şehirden köye gittik.', translation: 'Мо аз шаҳр ба деҳа рафтем.', highlight: 'den' },
    ],
    exercises: [
      { prompt: 'okul + ___ (аз)', promptTranslated: 'аз мактаб', answer: 'dan', options: ['dan', 'den', 'tan', 'ten'], explanation: 'Садоноки охирин «u» ғафс аст → -dan.' },
      { prompt: 'ev + ___ (аз)', promptTranslated: 'аз хона', answer: 'den', options: ['den', 'dan', 'ten', 'tan'], explanation: 'Садоноки охирин «e» тунук аст → -den.' },
      { prompt: 'kitap + ___ (аз)', promptTranslated: 'аз китоб', answer: 'tan', options: ['tan', 'dan', 'ten', 'den'], explanation: 'Калима бо «p» тамом мешавад → d ба t мегузарад.' },
      { prompt: '___ geliyorsun?', promptTranslated: 'Ту аз куҷо меоӣ?', answer: 'Nereden', options: ['Nereden', 'Nereye', 'Nerede', 'Nasıl'], explanation: 'Nereden = аз куҷо.' },
      { prompt: 'Ben Tacikistan___ geliyorum.', promptTranslated: 'Ман аз Тоҷикистон меоям.', answer: 'dan', options: ['dan', 'den', 'da', 'a'], explanation: 'Садоноки охирин «a» → -dan.' },
      { prompt: 'Кадомаш «ДАР мактаб» аст?', promptTranslated: 'Кадомаш ҷойгиршавиро нишон медиҳад?', answer: 'okulda', options: ['okulda', 'okuldan', 'okula', 'okulun'], explanation: '-da = дар, -dan = аз, -a = ба.' },
    ],
  },
];

export const COMPREHENSIONS = [
  {
    slot: 'reading',
    lessonTitle: 'Şehirde Gezi', lessonTitleTranslated: 'Сайругашт дар шаҳр',
    skillType: 'reading', xpReward: 30,
    kind: 'reading', emoji: '🏙️',
    title: 'Şehirde Gezi', titleTranslated: 'Сайругашт дар шаҳр',
    passage: 'Ahmet bugün şehre iniyor. O önce bankaya gidiyor. Bankadan sonra parka yürüyor. Park çok güzel. Sonra otobüsle eve dönüyor.',
    passageTranslated: 'Аҳмад имрӯз ба шаҳр мефарояд. Вай аввал ба бонк меравад. Баъди бонк ба парк пиёда меравад. Парк хеле зебост. Баъд бо автобус ба хона бармегардад.',
    questions: [
      { question: 'Ahmet önce nereye gidiyor?', questionTranslated: 'Аҳмад аввал ба куҷо меравад?', options: ['Bankaya', 'Parka', 'Eve'], correctIndex: 0, explanation: 'Дар матн: O önce bankaya gidiyor.' },
      { question: 'Park nasıl?', questionTranslated: 'Парк чӣ гуна аст?', options: ['Çok güzel', 'Büyük', 'Uzak'], correctIndex: 0, explanation: 'Дар матн: Park çok güzel.' },
      { question: 'Ahmet eve nasıl dönüyor?', questionTranslated: 'Аҳмад ба хона чӣ гуна бармегардад?', options: ['Otobüsle', 'Taksiyle', 'Arabayla'], correctIndex: 0, explanation: 'Дар матн: Sonra otobüsle eve dönüyor.' },
          { question: 'Ahmet bankadan sonra nereye gidiyor?', questionTranslated: 'Аҳмад баъди бонк ба куҷо меравад?', options: ['Parka', 'Eve', 'Okula'], correctIndex: 0, explanation: 'Дар матн: Bankadan sonra parka yürüyor.' },
],
  },
  {
    slot: 'listening',
    lessonTitle: 'Dinleme: Yol Tarifi', lessonTitleTranslated: 'Гӯшкунӣ: Нишон додани роҳ',
    skillType: 'listening', xpReward: 30,
    kind: 'audio', emoji: '🎧',
    title: 'Banka Nerede?', titleTranslated: 'Бонк куҷост?',
    passage: 'Afedersiniz, banka nerede? Banka çok yakın. İleri gidin. Sonra sağa dönün. Banka okulun karşısında.',
    passageTranslated: 'Мебахшед, бонк дар куҷост? Бонк хеле наздик аст. Ба пеш равед. Баъд ба рост тов хӯред. Бонк рӯ ба рӯи мактаб аст.',
    questions: [
      { question: 'Banka uzak mı?', questionTranslated: 'Оё бонк дур аст?', options: ['Hayır, çok yakın', 'Evet, çok uzak', 'Bilinmiyor'], correctIndex: 0, explanation: 'Дар матн: Banka çok yakın.' },
      { question: 'Banka neyin karşısında?', questionTranslated: 'Бонк рӯ ба рӯи чӣ аст?', options: ['Okulun karşısında', 'Hastanenin karşısında', 'Marketin karşısında'], correctIndex: 0, explanation: 'Дар матн: Banka okulun karşısında.' },
          { question: 'İlk önce ne yapmak lazım?', questionTranslated: 'Аввал чӣ кор кардан лозим аст?', options: ['İleri gitmek', 'Sola dönmek', 'Durmak'], correctIndex: 0, explanation: 'Дар матн: İleri gidin.' },
      { question: 'Sonra nereye dönmek lazım?', questionTranslated: 'Баъд ба кадом тараф гаштан лозим аст?', options: ['Sağa', 'Sola', 'Geri'], correctIndex: 0, explanation: 'Дар матн: Sonra sağa dönün.' },
],
  },
  {
    slot: 'review',
    lessonTitle: 'Tekrar', lessonTitleTranslated: 'Такрори дарс',
    skillType: 'review', xpReward: 30,
    kind: 'reading', emoji: '🔄',
    title: 'Havalimanı', titleTranslated: 'Фурудгоҳ',
    passage: 'Yarın Ankara\'ya gidiyorum. Uçak saat onda. Havalimanına taksiyle gidiyorum. Uçak çok hızlı.',
    passageTranslated: 'Фардо ба Анкара меравам. Ҳавопаймо соати даҳ аст. Ба фурудгоҳ бо такси меравам. Ҳавопаймо хеле тез аст.',
    questions: [
      { question: 'Nereye gidiyor?', questionTranslated: 'Ба куҷо меравад?', options: ['Ankara\'ya', 'İstanbul\'a', 'İzmir\'e'], correctIndex: 0, explanation: 'Дар матн: Ankara\'ya gidiyorum.' },
      { question: 'Havalimanına nasıl gidiyor?', questionTranslated: 'Ба фурудгоҳ чӣ гуна меравад?', options: ['Taksiyle', 'Otobüsle', 'Metroyla'], correctIndex: 0, explanation: 'Дар матн: Havalimanına taksiyle gidiyorum.' },
          { question: 'Uçak saat kaçta?', questionTranslated: 'Ҳавопаймо соати чанд аст?', options: ['Onda', 'Dokuzda', 'On birde'], correctIndex: 0, explanation: 'Дар матн: Uçak saat onda.' },
      { question: 'Uçak nasıl?', questionTranslated: 'Ҳавопаймо чӣ гуна аст?', options: ['Çok hızlı', 'Çok yavaş', 'Çok eski'], correctIndex: 0, explanation: 'Дар матн: Uçak çok hızlı.' },
],
  },
  {
    slot: 'test',
    lessonTitle: 'Son Sınav', lessonTitleTranslated: 'Имтиҳони ниҳоӣ',
    skillType: 'test', xpReward: 50,
    kind: 'reading', emoji: '🎓',
    title: 'Yön Testi', titleTranslated: 'Санҷиши самт',
    passage: 'Okuldan çıkıyorum. Sola dönüyorum. İleri gidiyorum. Market sağda.',
    passageTranslated: 'Аз мактаб мебароям. Ба чап тов мехӯрам. Ба пеш меравам. Супермаркет дар тарафи рост аст.',
    questions: [
      { question: 'Okuldan sonra nereye dönüyor?', questionTranslated: 'Баъди мактаб ба куҷо тов мехӯрад?', options: ['Sola', 'Sağa', 'Geri'], correctIndex: 0, explanation: 'Дар матн: Sola dönüyorum.' },
      { question: 'Market nerede?', questionTranslated: 'Супермаркет дар куҷост?', options: ['Sağda', 'Solda', 'İleride'], correctIndex: 0, explanation: 'Дар матн: Market sağda.' },
          { question: 'O nereden çıkıyor?', questionTranslated: 'Ӯ аз куҷо мебарояд?', options: ['Okuldan', 'Evden', 'Marketten'], correctIndex: 0, explanation: 'Дар матн: Okuldan çıkıyorum.' },
      { question: 'Sola döndükten sonra ne yapıyor?', questionTranslated: 'Баъди ба чап гаштан чӣ мекунад?', options: ['İleri gidiyor', 'Geri dönüyor', 'Duruyor'], correctIndex: 0, explanation: 'Дар матн: İleri gidiyorum.' },
],
  },
];

export const DIALOGUE = {
  lessonTitle: 'Konuşma Pratiği', lessonTitleTranslated: 'Машқи гуфтугӯ',
  title: 'Yol Sormak', titleTranslated: 'Пурсидани роҳ',
  scenario: 'Sokakta birine hastanenin nerede olduğunu sormak.', emoji: '🗣️',
  lines: [
    { speaker: 'Turist', isUser: true, text: 'Afedersiniz, hastane nerede?', translation: 'Мебахшед, беморхона дар куҷост?' },
    { speaker: 'Yerli', text: 'Hastane mi? İleri gidin, sonra sola dönün.', translation: 'Беморхона? Ба пеш равед, баъд ба чап тов хӯред.' },
    { speaker: 'Turist', isUser: true, text: 'Uzak mı?', translation: 'Дур аст?' },
    { speaker: 'Yerli', text: 'Hayır, çok yakın. Yürüyerek beş dakika.', translation: 'Не, хеле наздик. Пиёда панҷ дақиқа.' },
    { speaker: 'Turist', isUser: true, text: 'Çok teşekkür ederim.', translation: 'Хеле ташаккур.' },
    { speaker: 'Yerli', text: 'Rica ederim, iyi günler.', translation: 'Қобили қабул нест, рӯзи хуб.' },
      { speaker: 'Turist', isUser: true, text: 'Otobüs durağı da yakın mı?', translation: 'Истгоҳи автобус ҳам наздик аст?' },
    { speaker: 'Yerli', text: 'Evet, caddenin karşısında.', translation: 'Бале, дар рӯ ба рӯи хиёбон.' },
    { speaker: 'Turist', isUser: true, text: 'Anladım, tekrar teşekkürler.', translation: 'Фаҳмидам, боз ташаккур.' },
],
};

export const WRITING = {
  title: 'Yazma Pratiği', titleTranslated: 'Машқи навиштан', emoji: '✍️',
  copyOf: ['Şehir', 'Okul', 'Gitmek', 'Sağ', 'Sol', 'Araba', 'Otobüs'],
};

export const ORDER = [
  'vocab:Şehirdeki Yerler 1',
  'vocab:Şehirdeki Yerler 2',
  'vocab:Yönler',
  'vocab:Ulaşım',
  'vocab:Fiiller',
  'vocab:Soru ve Yer',
  'vocab:Şehirdeki Yerler 3',
  'grammar:0',
  'grammar:1',
  'grammar:2',
  'grammar:3',
  'comprehension:reading',
  'comprehension:listening',
  'dialogue',
  'writing',
  'comprehension:review',
  'comprehension:test',
];
