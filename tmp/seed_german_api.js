// seed_german_api.js — Забони олмонӣ A1 барои тоҷикзабонон
const https = require('https');

const API_KEY = 'fed7e7577c761a598966f5a3f04a5b36fb3cea6fb4b6aca9a002a75f47a7f574d5fe49645fd78b75b3e53ff1fad892ad';
const COURSE_ID = 'cmqk3iiuc0005qfwudzrz0uqr';

function api(method, path, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? Buffer.from(JSON.stringify(body), 'utf8') : null;
    const req = https.request({
      hostname: 'admin.ramz.tj', path, method,
      headers: {
        'x-admin-api-key': API_KEY,
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': payload.length } : {}),
      },
    }, res => {
      let d = Buffer.alloc(0);
      res.on('data', c => d = Buffer.concat([d, c]));
      res.on('end', () => { try { resolve(JSON.parse(d.toString('utf8'))); } catch(e) { reject(e); } });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

const MODULES = [
  // ── 1. Саломпурсӣ ─────────────────────────────────────────────────
  {
    title: 'Greetings', titleTranslated: 'Саломпурсӣ', emoji: '👋', color: '#2563EB',
    lessons: [
      {
        title: 'Begrüßung · Teil 1', titleTranslated: 'Саломпурсӣ · Қисми 1', emoji: '👋',
        words: [
          { w: 'Hallo', t: 'Салом', e: '👋', ipa: '/ˈhalo/', ex: 'Hallo! Wie geht es dir?', exT: 'Салом! Чӣ ҳол дорӣ?' },
          { w: 'Guten Morgen', t: 'Субҳ ба хайр', e: '🌅', ipa: '/ˈɡuːtən ˈmɔʁɡən/', ex: 'Guten Morgen, wie spät ist es?', exT: 'Субҳ ба хайр, соат чанд аст?' },
          { w: 'Guten Tag', t: 'Рӯзи нек', e: '☀️', ipa: '/ˈɡuːtən taːk/', ex: 'Guten Tag, Herr Müller!', exT: 'Рӯзи нек, ҷаноб Мюллер!' },
          { w: 'Guten Abend', t: 'Бегоҳ ба хайр', e: '🌆', ipa: '/ˈɡuːtən ˈaːbənt/', ex: 'Guten Abend, wie war dein Tag?', exT: 'Бегоҳ ба хайр, рӯзат чӣ хел гузашт?' },
          { w: 'Gute Nacht', t: 'Шаб ба хайр', e: '🌙', ipa: '/ˈɡuːtə naxt/', ex: 'Gute Nacht und schlaf gut!', exT: 'Шаб ба хайр ва хоби хуш!' },
          { w: 'Auf Wiedersehen', t: 'То дидор', e: '👋', ipa: '/aʊf ˈviːdɐˌzeːən/', ex: 'Auf Wiedersehen morgen!', exT: 'То дидор фардо!' },
          { w: 'Tschüss', t: 'Хайр (ғайрирасмӣ)', e: '✌️', ipa: '/tʃʏs/', ex: 'Tschüss, bis bald!', exT: 'Хайр, то зӯд!' },
          { w: 'Willkommen', t: 'Хуш омадед', e: '🎉', ipa: '/vɪlˈkɔmən/', ex: 'Willkommen in Deutschland!', exT: 'Хуш омадед ба Олмон!' },
        ],
      },
      {
        title: 'Begrüßung · Teil 2', titleTranslated: 'Саломпурсӣ · Қисми 2', emoji: '🤝',
        words: [
          { w: 'Wie geht es Ihnen', t: 'Чӣ ҳол доред (расмӣ)', e: '😊', ipa: '/viː ɡeːt ɛs ˈiːnən/', ex: 'Wie geht es Ihnen, Frau Schmidt?', exT: 'Чӣ ҳол доред, хонум Шмидт?' },
          { w: 'Wie geht es dir', t: 'Чӣ ҳол дорӣ (ғайрирасмӣ)', e: '😄', ipa: '/viː ɡeːt ɛs diːɐ/', ex: 'Hey, wie geht es dir heute?', exT: 'Эй, имрӯз чӣ ҳол дорӣ?' },
          { w: 'Gut, danke', t: 'Хуб, ташаккур', e: '👍', ipa: '/ɡuːt ˈdaŋkə/', ex: 'Gut, danke. Und Ihnen?', exT: 'Хуб, ташаккур. Ва шумо?' },
          { w: 'Danke', t: 'Ташаккур', e: '🙏', ipa: '/ˈdaŋkə/', ex: 'Danke schön!', exT: 'Хеле ташаккур!' },
          { w: 'Bitte', t: 'Хоҳиш мекунам / Марҳамат', e: '😊', ipa: '/ˈbɪtə/', ex: 'Bitte, kommen Sie herein.', exT: 'Марҳамат, даромед.' },
          { w: 'Entschuldigung', t: 'Бубахшед / Маафаш кунед', e: '😔', ipa: '/ɛntˈʃʊldɪɡʊŋ/', ex: 'Entschuldigung, wo ist der Bahnhof?', exT: 'Бубахшед, истгоҳи қитор куҷост?' },
          { w: 'Ja', t: 'Бале', e: '✅', ipa: '/jaː/', ex: 'Ja, natürlich!', exT: 'Бале, албатта!' },
          { w: 'Nein', t: 'Не', e: '❌', ipa: '/naɪ̯n/', ex: 'Nein, das stimmt nicht.', exT: 'Не, ин дуруст нест.' },
        ],
      },
    ],
  },

  // ── 2. Оила ───────────────────────────────────────────────────────
  {
    title: 'Family', titleTranslated: 'Оила', emoji: '👨‍👩‍👧‍👦', color: '#2563EB',
    lessons: [
      {
        title: 'Familie · Teil 1', titleTranslated: 'Оила · Қисми 1', emoji: '👨‍👩‍👧‍👦',
        words: [
          { w: 'die Mutter', t: 'Модар', e: '👩', ipa: '/diː ˈmʊtɐ/', ex: 'Meine Mutter ist Ärztin.', exT: 'Модарам духтур аст.' },
          { w: 'der Vater', t: 'Падар', e: '👨', ipa: '/deːɐ̯ ˈfaːtɐ/', ex: 'Mein Vater arbeitet viel.', exT: 'Падарам зиёд кор мекунад.' },
          { w: 'der Bruder', t: 'Бародар', e: '👦', ipa: '/deːɐ̯ ˈbʁuːdɐ/', ex: 'Ich habe einen Bruder.', exT: 'Ман як бародар дорам.' },
          { w: 'die Schwester', t: 'Хоҳар', e: '👧', ipa: '/diː ˈʃvɛstɐ/', ex: 'Meine Schwester ist jünger.', exT: 'Хоҳарам хурдтар аст.' },
          { w: 'die Großmutter', t: 'Модаркалон', e: '👵', ipa: '/diː ˈɡʁoːsˌmʊtɐ/', ex: 'Meine Großmutter kocht gut.', exT: 'Модаркалонам хуб мепазад.' },
          { w: 'der Großvater', t: 'Падаркалон', e: '👴', ipa: '/deːɐ̯ ˈɡʁoːsˌfaːtɐ/', ex: 'Mein Großvater ist 80 Jahre alt.', exT: 'Падаркалонам 80 сола аст.' },
          { w: 'das Kind', t: 'Кӯдак', e: '👶', ipa: '/das kɪnt/', ex: 'Das Kind spielt im Park.', exT: 'Кӯдак дар парк мебозад.' },
          { w: 'die Familie', t: 'Оила', e: '👨‍👩‍👧‍👦', ipa: '/diː faˈmiːliə/', ex: 'Meine Familie ist groß.', exT: 'Оилаи ман калон аст.' },
          { w: 'der Onkel', t: 'Амак', e: '🧔', ipa: '/deːɐ̯ ˈɔŋkəl/', ex: 'Mein Onkel wohnt in Berlin.', exT: 'Амакам дар Берлин зиндагӣ мекунад.' },
          { w: 'die Tante', t: 'Холаи модарӣ / Аммаи падарӣ', e: '👩‍🦳', ipa: '/diː ˈtantə/', ex: 'Meine Tante ist sehr nett.', exT: 'Холаи модариям хеле меҳрубон аст.' },
        ],
      },
      {
        title: 'Personalpronomen', titleTranslated: 'Ҷонишинҳои шахсӣ', emoji: '👤',
        words: [
          { w: 'ich', t: 'Ман', e: '👤', ipa: '/ɪç/', ex: 'Ich bin Student.', exT: 'Ман донишҷӯям.' },
          { w: 'du', t: 'Ту', e: '👉', ipa: '/duː/', ex: 'Du bist nett.', exT: 'Ту меҳрубонӣ.' },
          { w: 'er', t: 'Вай (мардона)', e: '👦', ipa: '/eːɐ̯/', ex: 'Er ist mein Freund.', exT: 'Вай дӯсти ман аст.' },
          { w: 'sie', t: 'Вай (занона) / Онҳо / Шумо', e: '👧', ipa: '/ziː/', ex: 'Sie ist sehr klug.', exT: 'Вай хеле зирак аст.' },
          { w: 'es', t: 'Он (бетараф)', e: '☝️', ipa: '/ɛs/', ex: 'Es ist kalt heute.', exT: 'Имрӯз сард аст.' },
          { w: 'wir', t: 'Мо', e: '👥', ipa: '/viːɐ̯/', ex: 'Wir lernen Deutsch.', exT: 'Мо олмонӣ меомӯзем.' },
          { w: 'ihr', t: 'Шумо (ғайрирасмӣ)', e: '👫', ipa: '/iːɐ̯/', ex: 'Ihr seid alle willkommen.', exT: 'Ҳамаи шумо хуш омадед.' },
          { w: 'Sie', t: 'Шумо (расмӣ)', e: '🎩', ipa: '/ziː/', ex: 'Wie heißen Sie bitte?', exT: 'Шумо, лутфан, чӣ ном доред?' },
        ],
      },
    ],
  },

  // ── 3. Рақамҳо ────────────────────────────────────────────────────
  {
    title: 'Numbers', titleTranslated: 'Рақамҳо', emoji: '🔢', color: '#2563EB',
    lessons: [
      {
        title: 'Zahlen 1–10', titleTranslated: 'Рақамҳо 1-10', emoji: '🔢',
        words: [
          { w: 'eins', t: 'Як', e: '1️⃣', ipa: '/aɪ̯ns/', ex: 'Ich habe eins.', exT: 'Ман якто дорам.' },
          { w: 'zwei', t: 'Ду', e: '2️⃣', ipa: '/tsvaɪ̯/', ex: 'Zwei Tassen Kaffee.', exT: 'Ду пиёла қаҳва.' },
          { w: 'drei', t: 'Се', e: '3️⃣', ipa: '/dʁaɪ̯/', ex: 'Drei Tage Urlaub.', exT: 'Се рӯз таътил.' },
          { w: 'vier', t: 'Чор', e: '4️⃣', ipa: '/fiːɐ̯/', ex: 'Vier Personen am Tisch.', exT: 'Чор нафар сари миз.' },
          { w: 'fünf', t: 'Панҷ', e: '5️⃣', ipa: '/fʏnf/', ex: 'Fünf Minuten bitte.', exT: 'Панҷ дақиқа илтимос.' },
          { w: 'sechs', t: 'Шаш', e: '6️⃣', ipa: '/zɛks/', ex: 'Sechs Stunden geschlafen.', exT: 'Шаш соат хобидам.' },
          { w: 'sieben', t: 'Ҳафт', e: '7️⃣', ipa: '/ˈziːbən/', ex: 'Sieben Tage die Woche.', exT: 'Ҳафт рӯзи ҳафта.' },
          { w: 'acht', t: 'Ҳашт', e: '8️⃣', ipa: '/axt/', ex: 'Acht Stunden Arbeit.', exT: 'Ҳашт соат кор.' },
          { w: 'neun', t: 'Нӯҳ', e: '9️⃣', ipa: '/nɔɪ̯n/', ex: 'Neun Euro kostet das.', exT: 'Ин нӯҳ евро арзиш дорад.' },
          { w: 'zehn', t: 'Даҳ', e: '🔟', ipa: '/tseːn/', ex: 'Zehn Euro bitte.', exT: 'Даҳ евро марҳамат.' },
        ],
      },
      {
        title: 'Zahlen 11–100', titleTranslated: 'Рақамҳо 11-100', emoji: '💯',
        words: [
          { w: 'elf', t: 'Ёздаҳ', e: '1️⃣1️⃣', ipa: '/ɛlf/', ex: 'Er ist elf Jahre alt.', exT: 'Ӯ ёздаҳ сола аст.' },
          { w: 'zwölf', t: 'Дувоздаҳ', e: '1️⃣2️⃣', ipa: '/tsvœlf/', ex: 'Zwölf Monate im Jahr.', exT: 'Дувоздаҳ моҳ дар сол.' },
          { w: 'zwanzig', t: 'Бист', e: '2️⃣0️⃣', ipa: '/ˈtsvantsɪç/', ex: 'Zwanzig Minuten.', exT: 'Бист дақиқа.' },
          { w: 'dreißig', t: 'Си', e: '3️⃣0️⃣', ipa: '/ˈdʁaɪ̯sɪç/', ex: 'Ich bin dreißig Jahre alt.', exT: 'Ман си сола ҳастам.' },
          { w: 'vierzig', t: 'Чил', e: '4️⃣0️⃣', ipa: '/ˈfɪʁtsɪç/', ex: 'Vierzig Euro.', exT: 'Чил евро.' },
          { w: 'fünfzig', t: 'Панҷоҳ', e: '5️⃣0️⃣', ipa: '/ˈfʏnftsɪç/', ex: 'Fünfzig Kilometer.', exT: 'Панҷоҳ километр.' },
          { w: 'sechzig', t: 'Шаст', e: '6️⃣0️⃣', ipa: '/ˈzɛçtsɪç/', ex: 'Sechzig Sekunden.', exT: 'Шаст сония.' },
          { w: 'siebzig', t: 'Ҳафтод', e: '7️⃣0️⃣', ipa: '/ˈziːptsɪç/', ex: 'Siebzig Jahre alt.', exT: 'Ҳафтод сола.' },
          { w: 'achtzig', t: 'Ҳаштод', e: '8️⃣0️⃣', ipa: '/ˈaxtsɪç/', ex: 'Achtzig Personen.', exT: 'Ҳаштод нафар.' },
          { w: 'hundert', t: 'Сад', e: '💯', ipa: '/ˈhʊndɐt/', ex: 'Hundert Euro bezahlt.', exT: 'Сад евро пардохтам.' },
        ],
      },
    ],
  },

  // ── 4. Рангҳо ва Сифатҳо ─────────────────────────────────────────
  {
    title: 'Colors & Adjectives', titleTranslated: 'Рангҳо ва Сифатҳо', emoji: '🎨', color: '#2563EB',
    lessons: [
      {
        title: 'Farben', titleTranslated: 'Рангҳо', emoji: '🎨',
        words: [
          { w: 'rot', t: 'Сурх', e: '🔴', ipa: '/ʁoːt/', ex: 'Eine rote Rose.', exT: 'Гули сурх.' },
          { w: 'blau', t: 'Кабуд', e: '🔵', ipa: '/blaʊ̯/', ex: 'Der Himmel ist blau.', exT: 'Осмон кабуд аст.' },
          { w: 'grün', t: 'Сабз', e: '🟢', ipa: '/ɡʁyːn/', ex: 'Das Gras ist grün.', exT: 'Алаф сабз аст.' },
          { w: 'gelb', t: 'Зард', e: '🟡', ipa: '/ɡɛlp/', ex: 'Die Sonne ist gelb.', exT: 'Офтоб зард аст.' },
          { w: 'weiß', t: 'Сафед', e: '⬜', ipa: '/vaɪ̯s/', ex: 'Weißer Schnee.', exT: 'Барфи сафед.' },
          { w: 'schwarz', t: 'Сиёҳ', e: '⬛', ipa: '/ʃvaʁts/', ex: 'Schwarze Nacht.', exT: 'Шаби сиёҳ.' },
          { w: 'orange', t: 'Норанҷӣ', e: '🟠', ipa: '/ɔˈʁaŋʒə/', ex: 'Eine orange Frucht.', exT: 'Мевои норанҷӣ.' },
          { w: 'lila', t: 'Бунафша', e: '🟣', ipa: '/ˈliːla/', ex: 'Ein lila Kleid.', exT: 'Либоси бунафша.' },
          { w: 'rosa', t: 'Гулобӣ', e: '🌸', ipa: '/ˈʁoːza/', ex: 'Rosafarbene Blume.', exT: 'Гули гулобӣ.' },
          { w: 'braun', t: 'Қаҳваранг', e: '🟫', ipa: '/bʁaʊ̯n/', ex: 'Braune Haare.', exT: 'Мӯйи қаҳваранг.' },
        ],
      },
      {
        title: 'Adjektive', titleTranslated: 'Сифатҳо', emoji: '✨',
        words: [
          { w: 'groß', t: 'Калон / Бузург', e: '🐘', ipa: '/ɡʁoːs/', ex: 'Ein großes Haus.', exT: 'Хонаи калон.' },
          { w: 'klein', t: 'Хурд / Майда', e: '🐭', ipa: '/klaɪ̯n/', ex: 'Ein kleines Kind.', exT: 'Кӯдаки хурд.' },
          { w: 'schön', t: 'Зебо / Хуб', e: '😍', ipa: '/ʃøːn/', ex: 'Eine schöne Stadt.', exT: 'Шаҳри зебо.' },
          { w: 'gut', t: 'Хуб', e: '👍', ipa: '/ɡuːt/', ex: 'Ein guter Mensch.', exT: 'Одами хуб.' },
          { w: 'schlecht', t: 'Бад', e: '👎', ipa: '/ʃlɛçt/', ex: 'Schlechtes Wetter.', exT: 'Обу ҳавои бад.' },
          { w: 'neu', t: 'Нав', e: '🆕', ipa: '/nɔɪ̯/', ex: 'Ein neues Telefon.', exT: 'Телефони нав.' },
          { w: 'alt', t: 'Кӯҳна / Пир', e: '⏳', ipa: '/alt/', ex: 'Ein altes Buch.', exT: 'Китоби кӯҳна.' },
          { w: 'lang', t: 'Дароз', e: '📏', ipa: '/laŋ/', ex: 'Ein langer Weg.', exT: 'Роҳи дароз.' },
          { w: 'kurz', t: 'Кӯтоҳ', e: '📐', ipa: '/kʊʁts/', ex: 'Eine kurze Reise.', exT: 'Сафари кӯтоҳ.' },
          { w: 'warm', t: 'Гарм', e: '🔥', ipa: '/vaʁm/', ex: 'Warmes Wetter.', exT: 'Ҳавои гарм.' },
        ],
      },
    ],
  },

  // ── 5. Вақт ──────────────────────────────────────────────────────
  {
    title: 'Time', titleTranslated: 'Вақт', emoji: '🕐', color: '#2563EB',
    lessons: [
      {
        title: 'Wochentage', titleTranslated: 'Рӯзҳои ҳафта', emoji: '📅',
        words: [
          { w: 'Montag', t: 'Душанбе', e: '📅', ipa: '/ˈmoːntaːk/', ex: 'Am Montag habe ich Unterricht.', exT: 'Душанбе дарс дорам.' },
          { w: 'Dienstag', t: 'Сешанбе', e: '📅', ipa: '/ˈdiːnstaːk/', ex: 'Dienstag ist mein freier Tag.', exT: 'Сешанбе рӯзи озоди ман аст.' },
          { w: 'Mittwoch', t: 'Чоршанбе', e: '📅', ipa: '/ˈmɪtvoːx/', ex: 'Mittwoch ist Mitte der Woche.', exT: 'Чоршанбе миёнаи ҳафта аст.' },
          { w: 'Donnerstag', t: 'Панҷшанбе', e: '📅', ipa: '/ˈdɔnɐstaːk/', ex: 'Am Donnerstag treffen wir uns.', exT: 'Панҷшанбе мо вохӯрем.' },
          { w: 'Freitag', t: 'Ҷумъа', e: '🎉', ipa: '/ˈfʁaɪ̯taːk/', ex: 'Der Freitag ist da!', exT: 'Ҷумъа омад!' },
          { w: 'Samstag', t: 'Шанбе', e: '🌟', ipa: '/ˈzamstaːk/', ex: 'Am Samstag schlafe ich aus.', exT: 'Шанбе хуб мехобам.' },
          { w: 'Sonntag', t: 'Якшанбе', e: '🌞', ipa: '/ˈzɔntaːk/', ex: 'Sonntag bin ich mit der Familie.', exT: 'Якшанбе бо оилаам ҳастам.' },
        ],
      },
      {
        title: 'Zeitausdrücke', titleTranslated: 'Ибораҳои вақт', emoji: '⏰',
        words: [
          { w: 'der Morgen', t: 'Субҳ', e: '🌅', ipa: '/deːɐ̯ ˈmɔʁɡən/', ex: 'Am Morgen trinke ich Tee.', exT: 'Субҳ чой менӯшам.' },
          { w: 'der Mittag', t: 'Нисфирӯзӣ', e: '🌤️', ipa: '/deːɐ̯ ˈmɪtaːk/', ex: 'Zu Mittag esse ich.', exT: 'Нисфирӯзӣ мехӯрам.' },
          { w: 'der Abend', t: 'Бегоҳ', e: '🌆', ipa: '/deːɐ̯ ˈaːbənt/', ex: 'Am Abend sehe ich fern.', exT: 'Бегоҳ телевизор мебинам.' },
          { w: 'die Nacht', t: 'Шаб', e: '🌙', ipa: '/diː naxt/', ex: 'In der Nacht schläft man.', exT: 'Шаб мехобанд.' },
          { w: 'heute', t: 'Имрӯз', e: '📆', ipa: '/ˈhɔɪ̯tə/', ex: 'Was machst du heute?', exT: 'Имрӯз чӣ мекунӣ?' },
          { w: 'morgen', t: 'Фардо', e: '🔜', ipa: '/ˈmɔʁɡən/', ex: 'Bis morgen!', exT: 'То фардо!' },
          { w: 'gestern', t: 'Дирӯз', e: '⏮️', ipa: '/ˈɡɛstɐn/', ex: 'Gestern war ich krank.', exT: 'Дирӯз ман бемор будам.' },
          { w: 'jetzt', t: 'Ҳозир', e: '⏰', ipa: '/jɛtst/', ex: 'Ich bin jetzt bereit.', exT: 'Ман ҳозир тайёрам.' },
        ],
      },
      {
        title: 'Monate', titleTranslated: 'Моҳҳо', emoji: '🗓️',
        words: [
          { w: 'Januar', t: 'Январ', e: '❄️', ipa: '/ˈjanuaːɐ̯/', ex: 'Januar ist kalt.', exT: 'Январ сард аст.' },
          { w: 'Februar', t: 'Феврал', e: '🌨️', ipa: '/ˈfeːbʁuaːɐ̯/', ex: 'Im Februar schneit es.', exT: 'Феврал барф меборад.' },
          { w: 'März', t: 'Март', e: '🌱', ipa: '/mɛʁts/', ex: 'Im März beginnt der Frühling.', exT: 'Март баҳор оғоз мешавад.' },
          { w: 'April', t: 'Апрел', e: '🌷', ipa: '/aˈpʁɪl/', ex: 'April, April!', exT: 'Апрел, апрел!' },
          { w: 'Mai', t: 'Май', e: '🌸', ipa: '/maɪ̯/', ex: 'Im Mai blühen Blumen.', exT: 'Май гулҳо мешукуфанд.' },
          { w: 'Juni', t: 'Июн', e: '☀️', ipa: '/ˈjuːni/', ex: 'Im Juni ist es warm.', exT: 'Июн гарм аст.' },
          { w: 'Juli', t: 'Июл', e: '🌞', ipa: '/ˈjuːli/', ex: 'Juli ist der heißeste Monat.', exT: 'Июл гармтарин моҳ аст.' },
          { w: 'August', t: 'Август', e: '🏖️', ipa: '/aʊ̯ˈɡʊst/', ex: 'Im August fahre ich in Urlaub.', exT: 'Август ба таътил мераввам.' },
          { w: 'September', t: 'Сентябр', e: '🍂', ipa: '/zɛpˈtɛmbɐ/', ex: 'Im September beginnt die Schule.', exT: 'Сентябр мактаб оғоз мешавад.' },
          { w: 'Oktober', t: 'Октябр', e: '🍁', ipa: '/ɔkˈtoːbɐ/', ex: 'Im Oktober wird es kühler.', exT: 'Октябр сардтар мешавад.' },
          { w: 'November', t: 'Ноябр', e: '🌧️', ipa: '/noˈvɛmbɐ/', ex: 'Im November regnet es viel.', exT: 'Ноябр зиёд борон меборад.' },
          { w: 'Dezember', t: 'Декабр', e: '🎄', ipa: '/deˈtsɛmbɐ/', ex: 'Dezember ist Weihnachtszeit.', exT: 'Декабр вақти Мавлуди Исо аст.' },
        ],
      },
    ],
  },

  // ── 6. Ғизо ва Нӯшокӣ ───────────────────────────────────────────
  {
    title: 'Food & Drink', titleTranslated: 'Ғизо ва Нӯшокӣ', emoji: '🍽️', color: '#2563EB',
    lessons: [
      {
        title: 'Essen', titleTranslated: 'Ғизоҳо', emoji: '🍽️',
        words: [
          { w: 'das Brot', t: 'Нон', e: '🍞', ipa: '/das bʁoːt/', ex: 'Frisches Brot kaufen.', exT: 'Нони тоза харидан.' },
          { w: 'das Fleisch', t: 'Гӯшт', e: '🥩', ipa: '/das flaɪ̯ʃ/', ex: 'Gegrilltes Fleisch.', exT: 'Гӯшти бирён.' },
          { w: 'das Hähnchen', t: 'Мурғ', e: '🍗', ipa: '/das ˈhɛːnçən/', ex: 'Gebratenes Hähnchen.', exT: 'Мурғи бирён.' },
          { w: 'der Fisch', t: 'Моҳӣ', e: '🐟', ipa: '/deːɐ̯ fɪʃ/', ex: 'Frischer Fisch.', exT: 'Моҳии тоза.' },
          { w: 'der Reis', t: 'Биринҷ / Ош', e: '🍚', ipa: '/deːɐ̯ ʁaɪ̯s/', ex: 'Reis mit Gemüse.', exT: 'Биринҷ бо сабзавот.' },
          { w: 'die Suppe', t: 'Шӯрбо', e: '🍲', ipa: '/diː ˈzʊpə/', ex: 'Heiße Suppe essen.', exT: 'Шӯрбои гарм хӯрдан.' },
          { w: 'der Salat', t: 'Салат', e: '🥗', ipa: '/deːɐ̯ zaˈlaːt/', ex: 'Frischer Salat.', exT: 'Салати тоза.' },
          { w: 'das Obst', t: 'Мева', e: '🍎', ipa: '/das oːpst/', ex: 'Frisches Obst essen.', exT: 'Мевои тоза хӯрдан.' },
          { w: 'das Gemüse', t: 'Сабзавот', e: '🥦', ipa: '/das ɡəˈmyːzə/', ex: 'Frisches Gemüse.', exT: 'Сабзавоти тоза.' },
          { w: 'der Käse', t: 'Панир', e: '🧀', ipa: '/deːɐ̯ ˈkɛːzə/', ex: 'Deutsches Käse.', exT: 'Панири олмонӣ.' },
        ],
      },
      {
        title: 'Getränke', titleTranslated: 'Нӯшокиҳо', emoji: '🥤',
        words: [
          { w: 'das Wasser', t: 'Об', e: '💧', ipa: '/das ˈvasɐ/', ex: 'Ein Glas Wasser bitte.', exT: 'Як пиёла об илтимос.' },
          { w: 'der Tee', t: 'Чой', e: '🍵', ipa: '/deːɐ̯ teː/', ex: 'Schwarzer Tee mit Milch.', exT: 'Чойи сиёҳ бо шир.' },
          { w: 'der Kaffee', t: 'Қаҳва', e: '☕', ipa: '/deːɐ̯ ˈkafe/', ex: 'Starker Kaffee.', exT: 'Қаҳвои қавӣ.' },
          { w: 'die Milch', t: 'Шир', e: '🥛', ipa: '/diː mɪlç/', ex: 'Warme Milch trinken.', exT: 'Шири гарм нӯшидан.' },
          { w: 'der Saft', t: 'Шарбат', e: '🧃', ipa: '/deːɐ̯ zaft/', ex: 'Frisch gepresster Saft.', exT: 'Шарбати тозафишурда.' },
          { w: 'das Bier', t: 'Пиво', e: '🍺', ipa: '/das biːɐ̯/', ex: 'Ein Bier bitte.', exT: 'Як пиво илтимос.' },
          { w: 'kalt', t: 'Сард', e: '🧊', ipa: '/kalt/', ex: 'Kaltes Wasser.', exT: 'Оби сард.' },
          { w: 'heiß', t: 'Гарм / Доғ', e: '🔥', ipa: '/haɪ̯s/', ex: 'Heißer Tee.', exT: 'Чойи доғ.' },
        ],
      },
    ],
  },

  // ── 7. Ҷойҳо ─────────────────────────────────────────────────────
  {
    title: 'Places', titleTranslated: 'Ҷойҳо', emoji: '🗺️', color: '#2563EB',
    lessons: [
      {
        title: 'Orte in der Stadt', titleTranslated: 'Ҷойҳои шаҳр', emoji: '🏙️',
        words: [
          { w: 'das Haus', t: 'Хона / Хонаи калон', e: '🏠', ipa: '/das haʊ̯s/', ex: 'Das Haus ist groß.', exT: 'Хона калон аст.' },
          { w: 'die Wohnung', t: 'Манзил / Хона', e: '🏢', ipa: '/diː ˈvoːnʊŋ/', ex: 'Meine Wohnung ist klein.', exT: 'Манзили ман хурд аст.' },
          { w: 'die Schule', t: 'Мактаб', e: '🏫', ipa: '/diː ˈʃuːlə/', ex: 'Die Schule beginnt um 8 Uhr.', exT: 'Мактаб соати 8 оғоз мешавад.' },
          { w: 'das Krankenhaus', t: 'Беморхона', e: '🏥', ipa: '/das ˈkʁaŋkənhaʊ̯s/', ex: 'Ins Krankenhaus gehen.', exT: 'Ба беморхона рафтан.' },
          { w: 'der Supermarkt', t: 'Дӯкони калон', e: '🛒', ipa: '/deːɐ̯ ˈzuːpɐˌmaʁkt/', ex: 'Im Supermarkt einkaufen.', exT: 'Дар дӯкони калон харидорӣ.' },
          { w: 'das Restaurant', t: 'Ресторан', e: '🍽️', ipa: '/das ʁɛstoˈʁɑ̃/', ex: 'Im Restaurant essen.', exT: 'Дар ресторан хӯрдан.' },
          { w: 'das Café', t: 'Кафе', e: '☕', ipa: '/das kaˈfeː/', ex: 'Im Café treffen.', exT: 'Дар кафе вохӯрдан.' },
          { w: 'der Park', t: 'Боғ / Парк', e: '🌳', ipa: '/deːɐ̯ paʁk/', ex: 'Im Park spazieren.', exT: 'Дар парк сайр кардан.' },
          { w: 'die Bank', t: 'Бонк', e: '🏦', ipa: '/diː baŋk/', ex: 'Zur Bank gehen.', exT: 'Ба бонк рафтан.' },
          { w: 'das Hotel', t: 'Меҳмонхона', e: '🏨', ipa: '/das hoˈtɛl/', ex: 'Im Hotel übernachten.', exT: 'Дар меҳмонхона монидан.' },
        ],
      },
      {
        title: 'Richtungen', titleTranslated: 'Самтҳо', emoji: '🧭',
        words: [
          { w: 'rechts', t: 'Рост', e: '➡️', ipa: '/ʁɛçts/', ex: 'Biegen Sie rechts ab.', exT: 'Ба рост гардед.' },
          { w: 'links', t: 'Чап', e: '⬅️', ipa: '/lɪŋks/', ex: 'Biegen Sie links ab.', exT: 'Ба чап гардед.' },
          { w: 'geradeaus', t: 'Рост / Мустақим', e: '⬆️', ipa: '/ɡəˈʁaːdəˌʔaʊ̯s/', ex: 'Gehen Sie geradeaus.', exT: 'Рост равед.' },
          { w: 'nah', t: 'Наздик', e: '📍', ipa: '/naː/', ex: 'Das ist nah.', exT: 'Ин наздик аст.' },
          { w: 'weit', t: 'Дур', e: '📌', ipa: '/vaɪ̯t/', ex: 'Es ist nicht weit.', exT: 'Ин дур нест.' },
          { w: 'gegenüber', t: 'Рӯбарӯ', e: '↔️', ipa: '/ˈɡeːɡənˌʔyːbɐ/', ex: 'Gegenüber dem Park.', exT: 'Рӯбарӯи парк.' },
          { w: 'oben', t: 'Боло', e: '⬆️', ipa: '/ˈoːbən/', ex: 'Die Wohnung ist oben.', exT: 'Манзил дар боло аст.' },
          { w: 'unten', t: 'Поён / Паст', e: '⬇️', ipa: '/ˈʊntən/', ex: 'Gehen Sie nach unten.', exT: 'Ба поён равед.' },
        ],
      },
    ],
  },

  // ── 8. Феълҳои асосӣ ─────────────────────────────────────────────
  {
    title: 'Basic Verbs', titleTranslated: 'Феълҳои асосӣ', emoji: '⚡', color: '#2563EB',
    lessons: [
      {
        title: 'Grundverben · Teil 1', titleTranslated: 'Феълҳои асосӣ · Қисми 1', emoji: '🏃',
        words: [
          { w: 'gehen', t: 'Рафтан (пиёда)', e: '🚶', ipa: '/ˈɡeːən/', ex: 'Ich gehe nach Hause.', exT: 'Ман ба хона мераввам.' },
          { w: 'kommen', t: 'Омадан', e: '🚶‍♂️', ipa: '/ˈkɔmən/', ex: 'Komm her bitte!', exT: 'Илтимос ин ҷо биё!' },
          { w: 'essen', t: 'Хӯрдан', e: '🍴', ipa: '/ˈɛsən/', ex: 'Ich esse gern Pizza.', exT: 'Ман пиццаро дӯст дорам.' },
          { w: 'trinken', t: 'Нӯшидан', e: '🥤', ipa: '/ˈtʁɪŋkən/', ex: 'Ich trinke Wasser.', exT: 'Ман об менӯшам.' },
          { w: 'schlafen', t: 'Хобидан', e: '😴', ipa: '/ˈʃlaːfən/', ex: 'Ich schlafe acht Stunden.', exT: 'Ман ҳашт соат мехобам.' },
          { w: 'aufstehen', t: 'Хестан', e: '🌅', ipa: '/ˈaʊ̯fˌʃteːən/', ex: 'Ich stehe um 7 auf.', exT: 'Ман соати 7 мехезам.' },
          { w: 'sitzen', t: 'Нишастан', e: '🪑', ipa: '/ˈzɪtsən/', ex: 'Bitte sitzen Sie.', exT: 'Лутфан нишинед.' },
          { w: 'arbeiten', t: 'Кор кардан', e: '💼', ipa: '/ˈaʁbaɪ̯tən/', ex: 'Ich arbeite viel.', exT: 'Ман зиёд кор мекунам.' },
        ],
      },
      {
        title: 'Grundverben · Teil 2', titleTranslated: 'Феълҳои асосӣ · Қисми 2', emoji: '📖',
        words: [
          { w: 'lesen', t: 'Хондан', e: '📖', ipa: '/ˈleːzən/', ex: 'Ich lese ein Buch.', exT: 'Ман китоб мехонам.' },
          { w: 'schreiben', t: 'Навиштан', e: '✍️', ipa: '/ˈʃʁaɪ̯bən/', ex: 'Ich schreibe einen Brief.', exT: 'Ман мактуб менависам.' },
          { w: 'sprechen', t: 'Гап задан', e: '💬', ipa: '/ˈʃpʁɛçən/', ex: 'Ich spreche Deutsch.', exT: 'Ман олмонӣ ҳарф мезанам.' },
          { w: 'hören', t: 'Шунидан', e: '👂', ipa: '/ˈhøːʁən/', ex: 'Ich höre Musik.', exT: 'Ман мусиқӣ мешунавам.' },
          { w: 'sehen', t: 'Дидан', e: '👁️', ipa: '/ˈzeːən/', ex: 'Ich sehe dich.', exT: 'Ман туро мебинам.' },
          { w: 'wissen', t: 'Донистан', e: '🧠', ipa: '/ˈvɪsən/', ex: 'Ich weiß es nicht.', exT: 'Ман намедонам.' },
          { w: 'wollen', t: 'Хостан', e: '🙋', ipa: '/ˈvɔlən/', ex: 'Ich will Wasser.', exT: 'Ман об мехоҳам.' },
          { w: 'lieben', t: 'Дӯст доштан / Муҳаббат', e: '❤️', ipa: '/ˈliːbən/', ex: 'Ich liebe dich.', exT: 'Ман туро дӯст дорам.' },
        ],
      },
    ],
  },

  // ── 9. Харидорӣ ──────────────────────────────────────────────────
  {
    title: 'Shopping', titleTranslated: 'Харидорӣ', emoji: '🛍️', color: '#2563EB',
    lessons: [
      {
        title: 'Einkaufen', titleTranslated: 'Харидорӣ', emoji: '🛒',
        words: [
          { w: 'kaufen', t: 'Харидан', e: '🛍️', ipa: '/ˈkaʊ̯fən/', ex: 'Ich kaufe Äpfel.', exT: 'Ман себ мехарам.' },
          { w: 'der Preis', t: 'Нарх / Баҳо', e: '🏷️', ipa: '/deːɐ̯ pʁaɪ̯s/', ex: 'Was ist der Preis?', exT: 'Нарх чанд аст?' },
          { w: 'teuer', t: 'Гарон', e: '💸', ipa: '/ˈtɔɪ̯ɐ/', ex: 'Das ist zu teuer.', exT: 'Ин хеле гарон аст.' },
          { w: 'billig', t: 'Арзон', e: '✅', ipa: '/ˈbɪlɪç/', ex: 'Sehr billig!', exT: 'Хеле арзон!' },
          { w: 'das Geld', t: 'Пул', e: '💵', ipa: '/das ɡɛlt/', ex: 'Ich habe kein Geld.', exT: 'Ман пул надорам.' },
          { w: 'der Rabatt', t: 'Тахфиф', e: '🏷️', ipa: '/deːɐ̯ ʁaˈbat/', ex: 'Gibt es Rabatt?', exT: 'Тахфиф ҳаст?' },
          { w: 'Wie viel kostet das', t: 'Ин чанд арзиш дорад', e: '❓', ipa: '/viː fiːl ˈkɔstət das/', ex: 'Wie viel kostet das bitte?', exT: 'Ин чанд арзиш дорад илтимос?' },
          { w: 'bezahlen', t: 'Пардохтан', e: '💳', ipa: '/bəˈtsaːlən/', ex: 'Kann ich mit Karte bezahlen?', exT: 'Ман бо кард пардохта метавонам?' },
        ],
      },
      {
        title: 'Kleidung', titleTranslated: 'Либос', emoji: '👗',
        words: [
          { w: 'das Hemd', t: 'Кӯйлак / Пираҳан', e: '👕', ipa: '/das hɛmt/', ex: 'Ein weißes Hemd.', exT: 'Кӯйлаки сафед.' },
          { w: 'die Hose', t: 'Шим', e: '👖', ipa: '/diː ˈhoːzə/', ex: 'Eine schwarze Hose.', exT: 'Шими сиёҳ.' },
          { w: 'das Kleid', t: 'Либос / Кӯйлак', e: '👗', ipa: '/das klaɪ̯t/', ex: 'Ein schönes Kleid.', exT: 'Либоси зебо.' },
          { w: 'die Schuhe', t: 'Пойафзол', e: '👟', ipa: '/diː ˈʃuːə/', ex: 'Neue Schuhe kaufen.', exT: 'Пойафзоли нав харидан.' },
          { w: 'die Tasche', t: 'Сумка', e: '👜', ipa: '/diː ˈtaʃə/', ex: 'Eine lederne Tasche.', exT: 'Сумкаи чармӣ.' },
          { w: 'die Jacke', t: 'Ҷакет', e: '🧥', ipa: '/diː ˈjakə/', ex: 'Eine warme Jacke.', exT: 'Ҷакети гарм.' },
          { w: 'die Größe', t: 'Андоза', e: '📏', ipa: '/diː ˈɡʁøːsə/', ex: 'Welche Größe haben Sie?', exT: 'Андозаи шумо чист?' },
          { w: 'anprobieren', t: 'Пӯшида санҷидан', e: '🔄', ipa: '/ˈanpʁoˌbiːʁən/', ex: 'Kann ich es anprobieren?', exT: 'Ман пӯшида санҷида метавонам?' },
        ],
      },
    ],
  },

  // ── 10. Гуфтугӯ ──────────────────────────────────────────────────
  {
    title: 'Conversations', titleTranslated: 'Гуфтугӯ', emoji: '💬', color: '#2563EB',
    lessons: [
      {
        title: 'Fragewörter', titleTranslated: 'Калимаҳои савол', emoji: '❓',
        words: [
          { w: 'Was', t: 'Чӣ', e: '❓', ipa: '/vas/', ex: 'Was ist das?', exT: 'Ин чист?' },
          { w: 'Wer', t: 'Кӣ', e: '👤', ipa: '/veːɐ̯/', ex: 'Wer bist du?', exT: 'Ту кӣ ҳастӣ?' },
          { w: 'Wo', t: 'Куҷо', e: '📍', ipa: '/voː/', ex: 'Wo wohnst du?', exT: 'Ту куҷо зиндагӣ мекунӣ?' },
          { w: 'Wann', t: 'Кай / Чӣ вақт', e: '⏰', ipa: '/van/', ex: 'Wann kommst du?', exT: 'Кай меояӣ?' },
          { w: 'Wie', t: 'Чӣ тавр / Чӣ гуна', e: '🤔', ipa: '/viː/', ex: 'Wie heißt du?', exT: 'Номат чист?' },
          { w: 'Warum', t: 'Чаро', e: '❔', ipa: '/vaˈʁʊm/', ex: 'Warum kommst du nicht?', exT: 'Чаро намеояӣ?' },
          { w: 'Wie viel', t: 'Чанд', e: '🔢', ipa: '/viː fiːl/', ex: 'Wie viel kostet das?', exT: 'Ин чанд арзиш дорад?' },
          { w: 'Welche', t: 'Кадом', e: '☝️', ipa: '/ˈvɛlçə/', ex: 'Welche Farbe magst du?', exT: 'Кадом рангро дӯст дорӣ?' },
        ],
      },
      {
        title: 'Alltagsausdrücke', titleTranslated: 'Ибораҳои ҳаррӯза', emoji: '🗣️',
        words: [
          { w: 'Okay', t: 'Хуб / Мувофиқ', e: '👌', ipa: '/oˈkeɪ̯/', ex: 'Okay, einverstanden!', exT: 'Хуб, розӣ ҳастам!' },
          { w: 'Natürlich', t: 'Албатта', e: '✅', ipa: '/naˈtyːʁlɪç/', ex: 'Natürlich, kein Problem!', exT: 'Албатта, мушкиле нест!' },
          { w: 'Ich verstehe nicht', t: 'Нафаҳмидам', e: '🤷', ipa: '/ɪç fɐˈʃteːə nɪçt/', ex: 'Ich verstehe nicht. Können Sie wiederholen?', exT: 'Нафаҳмидам. Такрор карда метавонед?' },
          { w: 'Können Sie helfen', t: 'Кӯмак карда метавонед', e: '🆘', ipa: '/ˈkœnən ziː ˈhɛlfən/', ex: 'Können Sie mir bitte helfen?', exT: 'Илтимос ба ман кӯмак карда метавонед?' },
          { w: 'Ich weiß nicht', t: 'Намедонам', e: '🤷', ipa: '/ɪç vaɪ̯s nɪçt/', ex: 'Ich weiß nicht, tut mir leid.', exT: 'Намедонам, маафаш кунед.' },
          { w: 'Viel Glück', t: 'Муваффақ бошед', e: '🍀', ipa: '/fiːl ɡlʏk/', ex: 'Viel Glück bei der Prüfung!', exT: 'Имтиҳонда муваффақ бошед!' },
          { w: 'Kein Problem', t: 'Мушкиле нест', e: '😊', ipa: '/kaɪ̯n pʁoˈbleːm/', ex: 'Kein Problem, gern!', exT: 'Мушкиле нест, бо камол!' },
          { w: 'Ich lerne Deutsch', t: 'Ман олмонӣ меомӯзам', e: '📚', ipa: '/ɪç ˈlɛʁnə dɔɪ̯tʃ/', ex: 'Ich lerne Deutsch seit einem Monat.', exT: 'Ман як моҳ аст олмонӣ меомӯзам.' },
        ],
      },
    ],
  },
];

async function run() {
  console.log('🇩🇪 Забони олмонӣ A1 — иловакунӣ ба база оғоз шуд...\n');

  let totalModules = 0, totalLessons = 0, totalWords = 0;

  for (let mi = 0; mi < MODULES.length; mi++) {
    const m = MODULES[mi];
    console.log(`\n📚 Модул ${mi + 1}/${MODULES.length}: ${m.titleTranslated}`);

    const modRes = await api('POST', '/api/admin/modules', {
      courseId: COURSE_ID,
      title: m.title,
      titleTranslated: m.titleTranslated,
      emoji: m.emoji,
      color: m.color,
      order: mi,
      isPremium: mi >= 5,
      isActive: true,
    });

    if (!modRes.module) {
      console.error('   ❌ Модул хато:', JSON.stringify(modRes));
      continue;
    }
    const moduleId = modRes.module.id;
    totalModules++;
    console.log(`   ✅ ID: ${moduleId}`);

    for (let li = 0; li < m.lessons.length; li++) {
      const l = m.lessons[li];
      const lessonRes = await api('POST', '/api/admin/lessons', {
        moduleId,
        title: l.title,
        titleTranslated: l.titleTranslated,
        type: 'vocab',
        emoji: l.emoji,
        cefrLevel: 'A1',
        skillType: 'vocab',
        xpReward: 60,
        duration: 5,
        order: li,
        isPremium: mi >= 5,
        isActive: true,
      });

      if (!lessonRes.lesson) {
        console.error(`   ❌ Дарс хато: ${JSON.stringify(lessonRes)}`);
        continue;
      }
      const lessonId = lessonRes.lesson.id;
      totalLessons++;

      const wordsRes = await api('POST', '/api/admin/words/bulk', {
        lessonId,
        words: l.words.map((w, wi) => ({
          word: w.w,
          translation: w.t,
          emoji: w.e,
          ipa: w.ipa,
          example: w.ex,
          exampleTrans: w.exT,
          difficulty: 1,
          order: wi,
        })),
      });
      const wCount = wordsRes.count ?? l.words.length;
      totalWords += wCount;
      console.log(`   📖 "${l.titleTranslated}" — ${wCount} калима`);
    }
  }

  console.log(`\n✅ Тамом шуд!`);
  console.log(`   Модулҳо: ${totalModules}`);
  console.log(`   Дарсҳо:  ${totalLessons}`);
  console.log(`   Калимаҳо: ${totalWords}`);
  console.log(`\n🔗 https://admin.ramz.tj/admin/courses/${COURSE_ID}`);
}

run().catch(console.error);
