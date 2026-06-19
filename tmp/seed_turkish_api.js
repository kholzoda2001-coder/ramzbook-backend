// seed_turkish_api.js — Иловакунии курси туркӣ A1 ба база тавассути API
// Иҷро: node tmp/seed_turkish_api.js

const https = require('https');

const API_KEY = 'fed7e7577c761a598966f5a3f04a5b36fb3cea6fb4b6aca9a002a75f47a7f574d5fe49645fd78b75b3e53ff1fad892ad';
const BASE_HOST = 'admin.ramz.tj';
const TR_ID = 'cmqdgus870000c7nfz5z16xbx';  // Turkish language ID (аллакай сохта шудааст)
const TG_ID = 'cmpk1cr9o0000bo0h1mheyoad';  // Tajik language ID
const COURSE_ID = 'cmqk3ihwf0001qfwu8520a5vo'; // Course ID (аллакай сохта шудааст)

function apiCall(method, path, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      hostname: BASE_HOST,
      path,
      method,
      headers: {
        'x-admin-api-key': API_KEY,
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload, 'utf8') } : {}),
      },
    };
    const req = https.request(options, (res) => {
      let data = Buffer.alloc(0);
      res.on('data', (chunk) => { data = Buffer.concat([data, chunk]); });
      res.on('end', () => {
        try {
          const text = data.toString('utf8');
          resolve(JSON.parse(text));
        } catch (e) {
          reject(new Error('Parse error: ' + data.toString('utf8').slice(0, 200)));
        }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload, 'utf8');
    req.end();
  });
}

// ── Маводи A1 ───────────────────────────────────────────────────────────────
const MODULES = [
  {
    title: 'Greetings', titleTranslated: 'Саломпурсӣ', emoji: '👋', color: '#E11D48',
    lessons: [
      {
        title: 'Selamlaşma · Part 1', titleTranslated: 'Саломпурсӣ · Қисми 1', emoji: '👋',
        words: [
          { w: 'Merhaba', t: 'Салом', e: '👋', ipa: '/mer.ha.ba/', ex: 'Merhaba! Nasılsın?', exT: 'Салом! Чӣ ҳол?' },
          { w: 'Günaydın', t: 'Субҳ ба хайр', e: '🌅', ipa: '/ɡy.naj.dɯn/', ex: 'Günaydın! İyi sabahlar.', exT: 'Субҳ ба хайр! Субҳи нек.' },
          { w: 'İyi günler', t: 'Рӯзи нек', e: '☀️', ipa: '/i.ji ɡyn.ler/', ex: 'İyi günler, nasıl gidiyor?', exT: 'Рӯзи нек, чӣ хел?' },
          { w: 'İyi akşamlar', t: 'Бегоҳ ба хайр', e: '🌆', ipa: '/i.ji ak.ʃam.lar/', ex: 'İyi akşamlar efendim.', exT: 'Бегоҳ ба хайр ҷаноб.' },
          { w: 'İyi geceler', t: 'Шаб ба хайр', e: '🌙', ipa: '/i.ji ɡe.dʒe.ler/', ex: 'İyi geceler, iyi uyku!', exT: 'Шаб ба хайр, хоби хуш!' },
          { w: 'Hoş geldiniz', t: 'Хуш омадед', e: '🏠', ipa: '/hoʃ ɡel.di.niz/', ex: 'Hoş geldiniz, buyurun.', exT: 'Хуш омадед, марҳамат.' },
          { w: 'Görüşürüz', t: 'То дидор', e: '👋', ipa: '/ɡø.ry.ʃy.ryz/', ex: 'Görüşürüz yarın!', exT: 'То дидор фардо!' },
          { w: 'Teşekkürler', t: 'Ташаккур', e: '🙏', ipa: '/te.ʃek.kyr.ler/', ex: 'Teşekkürler, çok iyisin.', exT: 'Ташаккур, хеле хубӣ.' },
        ],
      },
      {
        title: 'Selamlaşma · Part 2', titleTranslated: 'Саломпурсӣ · Қисми 2', emoji: '🤝',
        words: [
          { w: 'Nasılsın', t: 'Чӣ ҳол дорӣ', e: '😊', ipa: '/na.sɯl.sɯn/', ex: 'Nasılsın bu aralar?', exT: 'Ин рӯзҳо чӣ ҳол?' },
          { w: 'İyiyim', t: 'Хубам', e: '👍', ipa: '/i.ji.jim/', ex: 'İyiyim, teşekkür ederim.', exT: 'Хубам, ташаккур.' },
          { w: 'Rica ederim', t: 'Хоҳиш мекунам', e: '😌', ipa: '/ri.dʒa e.de.rim/', ex: 'Rica ederim, bir şey değil.', exT: 'Хоҳиш мекунам, ҳеҷ чиз.' },
          { w: 'Adınız ne', t: 'Номатон чист', e: '📛', ipa: '/a.dɯ.nɯz ne/', ex: 'Adınız ne, efendim?', exT: 'Номатон чист ҷаноб?' },
          { w: 'Benim adım', t: 'Номи ман', e: '🏷️', ipa: '/be.nim a.dɯm/', ex: 'Benim adım Rustam.', exT: 'Номи ман Рустам.' },
          { w: 'Memnun oldum', t: 'Хурсанд шудам', e: '🤝', ipa: '/mem.nun ol.dum/', ex: 'Memnun oldum, tanışalım.', exT: 'Хурсанд шудам, шинос шавем.' },
          { w: 'Evet', t: 'Бале', e: '✅', ipa: '/e.vet/', ex: 'Evet, anlıyorum.', exT: 'Бале, мефаҳмам.' },
          { w: 'Hayır', t: 'Не', e: '❌', ipa: '/ha.jɯr/', ex: 'Hayır, teşekkürler.', exT: 'Не, ташаккур.' },
        ],
      },
    ],
  },
  {
    title: 'Family', titleTranslated: 'Оила', emoji: '👨‍👩‍👧‍👦', color: '#E11D48',
    lessons: [
      {
        title: 'Aile · Part 1', titleTranslated: 'Оила · Қисми 1', emoji: '👨‍👩‍👧‍👦',
        words: [
          { w: 'Anne', t: 'Модар', e: '👩', ipa: '/an.ne/', ex: 'Annem çok güzel.', exT: 'Модарам хеле зебост.' },
          { w: 'Baba', t: 'Падар', e: '👨', ipa: '/ba.ba/', ex: 'Babam işte çalışıyor.', exT: 'Падарам дар кор кор мекунад.' },
          { w: 'Kardeş', t: 'Бародар/Хоҳар', e: '👫', ipa: '/kar.deʃ/', ex: 'Bir kardeşim var.', exT: 'Як бародарам ҳаст.' },
          { w: 'Abla', t: 'Хоҳари калон', e: '👩‍🦱', ipa: '/ab.la/', ex: 'Ablam öğretmen.', exT: 'Хоҳари калонам муаллим аст.' },
          { w: 'Abi', t: 'Бародари калон', e: '👦', ipa: '/a.bi/', ex: "Abim İstanbul'da yaşıyor.", exT: 'Бародари калонам дар Истанбул зиндагӣ мекунад.' },
          { w: 'Çocuk', t: 'Кӯдак', e: '👶', ipa: '/tʃo.dʒuk/', ex: 'İki çocuğum var.', exT: 'Ду кӯдакам ҳаст.' },
          { w: 'Büyükanne', t: 'Модаркалон', e: '👵', ipa: '/by.jyk.an.ne/', ex: 'Büyükannem 70 yaşında.', exT: 'Модаркалонам 70 сола аст.' },
          { w: 'Büyükbaba', t: 'Падаркалон', e: '👴', ipa: '/by.jyk.ba.ba/', ex: 'Büyükbabam çok bilge.', exT: 'Падаркалонам хеле доно аст.' },
        ],
      },
      {
        title: 'Zamirler', titleTranslated: 'Ҷонишинҳо', emoji: '👤',
        words: [
          { w: 'Ben', t: 'Ман', e: '👤', ipa: '/ben/', ex: 'Ben öğrenciyim.', exT: 'Ман донишҷӯям.' },
          { w: 'Sen', t: 'Ту', e: '👉', ipa: '/sen/', ex: 'Sen nerelisin?', exT: 'Ту аз куҷоӣ?' },
          { w: 'O', t: 'Вай / Ӯ', e: '🫵', ipa: '/o/', ex: 'O çok akıllı.', exT: 'Ӯ хеле зирак аст.' },
          { w: 'Biz', t: 'Мо', e: '👥', ipa: '/biz/', ex: 'Biz Tacikistanlıyız.', exT: 'Мо тоҷикистонӣ ҳастем.' },
          { w: 'Siz', t: 'Шумо', e: '👨‍👩‍👧', ipa: '/siz/', ex: 'Siz nerede oturuyorsunuz?', exT: 'Шумо куҷо зиндагӣ мекунед?' },
          { w: 'Onlar', t: 'Онҳо', e: '👨‍👩‍👧‍👦', ipa: '/on.lar/', ex: "Onlar Türkiye'de.", exT: 'Онҳо дар Туркия ҳастанд.' },
          { w: 'Bu', t: 'Ин', e: '☝️', ipa: '/bu/', ex: 'Bu ne?', exT: 'Ин чист?' },
          { w: 'Şu', t: 'Он', e: '👆', ipa: '/ʃu/', ex: 'Şu kalem benim.', exT: 'Он қалам мали ман аст.' },
        ],
      },
    ],
  },
  {
    title: 'Numbers', titleTranslated: 'Рақамҳо', emoji: '🔢', color: '#E11D48',
    lessons: [
      {
        title: 'Sayılar 1–10', titleTranslated: 'Рақамҳо 1-10', emoji: '🔢',
        words: [
          { w: 'Bir', t: 'Як', e: '1️⃣', ipa: '/bir/', ex: 'Bir elma istiyorum.', exT: 'Ман як себ мехоҳам.' },
          { w: 'İki', t: 'Ду', e: '2️⃣', ipa: '/i.ki/', ex: 'İki bardak su.', exT: 'Ду пиёла об.' },
          { w: 'Üç', t: 'Се', e: '3️⃣', ipa: '/ytʃ/', ex: 'Üç gün sonra.', exT: 'Се рӯз пас.' },
          { w: 'Dört', t: 'Чор', e: '4️⃣', ipa: '/dørt/', ex: 'Dört kişilik masa.', exT: 'Миз барои чор нафар.' },
          { w: 'Beş', t: 'Панҷ', e: '5️⃣', ipa: '/beʃ/', ex: 'Beş dakika bekle.', exT: 'Панҷ дақиқа интизор шав.' },
          { w: 'Altı', t: 'Шаш', e: '6️⃣', ipa: '/al.tɯ/', ex: 'Altı saat uyudum.', exT: 'Шаш соат хобидам.' },
          { w: 'Yedi', t: 'Ҳафт', e: '7️⃣', ipa: '/je.di/', ex: 'Yedi gün tatilim var.', exT: 'Ман ҳафт рӯз таътил дорам.' },
          { w: 'Sekiz', t: 'Ҳашт', e: '8️⃣', ipa: '/se.kiz/', ex: 'Sekiz saat çalıştım.', exT: 'Ҳашт соат кор кардам.' },
          { w: 'Dokuz', t: 'Нӯҳ', e: '9️⃣', ipa: '/do.kuz/', ex: 'Dokuz numara ayakkabı.', exT: 'Пойафзоли рақами нӯҳ.' },
          { w: 'On', t: 'Даҳ', e: '🔟', ipa: '/on/', ex: 'On lira lütfen.', exT: 'Марҳамат даҳ лира.' },
        ],
      },
      {
        title: 'Sayılar 11–100', titleTranslated: 'Рақамҳо 11-100', emoji: '💯',
        words: [
          { w: 'On bir', t: 'Ёздаҳ', e: '1️⃣1️⃣', ipa: '/on bir/', ex: 'On bir yaşındayım.', exT: 'Ман ёздаҳ сола ҳастам.' },
          { w: 'Yirmi', t: 'Бист', e: '2️⃣0️⃣', ipa: '/jir.mi/', ex: 'Yirmi dakika.', exT: 'Бист дақиқа.' },
          { w: 'Otuz', t: 'Си', e: '3️⃣0️⃣', ipa: '/o.tuz/', ex: 'Otuz yaşındayım.', exT: 'Ман си сола ҳастам.' },
          { w: 'Kırk', t: 'Чил', e: '4️⃣0️⃣', ipa: '/kɯrk/', ex: 'Kırk lira.', exT: 'Чил лира.' },
          { w: 'Elli', t: 'Панҷоҳ', e: '5️⃣0️⃣', ipa: '/el.li/', ex: 'Elli kilometre.', exT: 'Панҷоҳ километр.' },
          { w: 'Altmış', t: 'Шаст', e: '6️⃣0️⃣', ipa: '/alt.mɯʃ/', ex: 'Altmış saniye.', exT: 'Шаст сония.' },
          { w: 'Yetmiş', t: 'Ҳафтод', e: '7️⃣0️⃣', ipa: '/jet.miʃ/', ex: 'Yetmiş yıl önce.', exT: 'Ҳафтод сол пеш.' },
          { w: 'Seksen', t: 'Ҳаштод', e: '8️⃣0️⃣', ipa: '/sek.sen/', ex: 'Seksen kişi.', exT: 'Ҳаштод нафар.' },
          { w: 'Doksan', t: 'Навад', e: '9️⃣0️⃣', ipa: '/dok.san/', ex: 'Doksan gün.', exT: 'Навад рӯз.' },
          { w: 'Yüz', t: 'Сад', e: '💯', ipa: '/jyz/', ex: 'Yüz lira ödedim.', exT: 'Ман сад лира пардохтам.' },
        ],
      },
    ],
  },
  {
    title: 'Colors & Adjectives', titleTranslated: 'Рангҳо ва Сифатҳо', emoji: '🎨', color: '#E11D48',
    lessons: [
      {
        title: 'Renkler', titleTranslated: 'Рангҳо', emoji: '🎨',
        words: [
          { w: 'Kırmızı', t: 'Сурх', e: '🔴', ipa: '/kɯr.mɯ.zɯ/', ex: 'Kırmızı gül.', exT: 'Гули сурх.' },
          { w: 'Mavi', t: 'Кабуд', e: '🔵', ipa: '/ma.vi/', ex: 'Gökyüzü mavi.', exT: 'Осмон кабуд аст.' },
          { w: 'Yeşil', t: 'Сабз', e: '🟢', ipa: '/je.ʃil/', ex: 'Ağaçlar yeşil.', exT: 'Дарахтон сабзанд.' },
          { w: 'Sarı', t: 'Зард', e: '🟡', ipa: '/sa.rɯ/', ex: 'Güneş sarı.', exT: 'Офтоб зард аст.' },
          { w: 'Beyaz', t: 'Сафед', e: '⬜', ipa: '/be.jaz/', ex: 'Kar beyaz.', exT: 'Барф сафед аст.' },
          { w: 'Siyah', t: 'Сиёҳ', e: '⬛', ipa: '/si.jah/', ex: 'Gece siyah.', exT: 'Шаб сиёҳ аст.' },
          { w: 'Turuncu', t: 'Норанҷӣ', e: '🟠', ipa: '/tu.run.dʒu/', ex: 'Portakal turuncu.', exT: 'Норинҷ норанҷӣ аст.' },
          { w: 'Mor', t: 'Бунафша', e: '🟣', ipa: '/mor/', ex: 'Leylak mor.', exT: 'Ёсуман бунафша аст.' },
          { w: 'Pembe', t: 'Гулобӣ', e: '🌸', ipa: '/pem.be/', ex: 'Pembe elbise.', exT: 'Либоси гулобӣ.' },
          { w: 'Kahverengi', t: 'Қаҳваранг', e: '🟫', ipa: '/kah.ve.ren.ɡi/', ex: 'Saçları kahverengi.', exT: 'Мӯяшон қаҳваранг аст.' },
        ],
      },
      {
        title: 'Sıfatlar', titleTranslated: 'Сифатҳо', emoji: '✨',
        words: [
          { w: 'Büyük', t: 'Калон / Бузург', e: '🐘', ipa: '/by.jyk/', ex: 'Büyük ev.', exT: 'Хонаи калон.' },
          { w: 'Küçük', t: 'Хурд / Майда', e: '🐭', ipa: '/ky.tʃyk/', ex: 'Küçük kuş.', exT: 'Паррандаи хурд.' },
          { w: 'Güzel', t: 'Зебо / Хуб', e: '😍', ipa: '/ɡy.zel/', ex: 'Güzel şehir.', exT: 'Шаҳри зебо.' },
          { w: 'İyi', t: 'Хуб', e: '👍', ipa: '/i.ji/', ex: 'İyi bir insan.', exT: 'Одами хуб.' },
          { w: 'Kötü', t: 'Бад', e: '👎', ipa: '/kø.ty/', ex: 'Kötü hava.', exT: 'Обу ҳавои бад.' },
          { w: 'Yeni', t: 'Нав', e: '🆕', ipa: '/je.ni/', ex: 'Yeni telefon.', exT: 'Телефони нав.' },
          { w: 'Eski', t: 'Кӯҳна', e: '⏳', ipa: '/es.ki/', ex: 'Eski kitap.', exT: 'Китоби кӯҳна.' },
          { w: 'Uzun', t: 'Дароз', e: '📏', ipa: '/u.zun/', ex: 'Uzun boylu adam.', exT: 'Марди бақадди дароз.' },
          { w: 'Kısa', t: 'Кӯтоҳ', e: '📐', ipa: '/kɯ.sa/', ex: 'Kısa yol.', exT: 'Роҳи кӯтоҳ.' },
          { w: 'Sıcak', t: 'Гарм', e: '🔥', ipa: '/sɯ.dʒak/', ex: 'Hava sıcak.', exT: 'Ҳаво гарм аст.' },
        ],
      },
    ],
  },
  {
    title: 'Time', titleTranslated: 'Вақт', emoji: '🕐', color: '#E11D48',
    lessons: [
      {
        title: 'Günler', titleTranslated: 'Рӯзҳои ҳафта', emoji: '📅',
        words: [
          { w: 'Pazartesi', t: 'Душанбе', e: '📅', ipa: '/pa.zar.te.si/', ex: 'Pazartesi çalışıyorum.', exT: 'Душанбе кор мекунам.' },
          { w: 'Salı', t: 'Сешанбе', e: '📅', ipa: '/sa.lɯ/', ex: 'Salı dersi var.', exT: 'Сешанбе дарс ҳаст.' },
          { w: 'Çarşamba', t: 'Чоршанбе', e: '📅', ipa: '/tʃar.ʃam.ba/', ex: 'Çarşamba toplantı.', exT: 'Чоршанбе маҷлис аст.' },
          { w: 'Perşembe', t: 'Панҷшанбе', e: '📅', ipa: '/per.ʃem.be/', ex: 'Perşembe tatil yok.', exT: 'Панҷшанбе таътил нест.' },
          { w: 'Cuma', t: 'Ҷумъа', e: '🕌', ipa: '/dʒu.ma/', ex: 'Cuma namazı.', exT: 'Намози ҷумъа.' },
          { w: 'Cumartesi', t: 'Шанбе', e: '🎉', ipa: '/dʒu.mar.te.si/', ex: 'Cumartesi dinleniyorum.', exT: 'Шанбе истироҳат мекунам.' },
          { w: 'Pazar', t: 'Якшанбе', e: '🌞', ipa: '/pa.zar/', ex: 'Pazar ailemle.', exT: 'Якшанбе бо оилаам.' },
        ],
      },
      {
        title: 'Zaman İfadeleri', titleTranslated: 'Ибораҳои вақт', emoji: '⏰',
        words: [
          { w: 'Sabah', t: 'Субҳ', e: '🌅', ipa: '/sa.bah/', ex: 'Sabah erkenden.', exT: 'Субҳи барвақт.' },
          { w: 'Öğle', t: 'Нисфирӯзӣ', e: '🌤️', ipa: '/øj.le/', ex: 'Öğle yemeği.', exT: 'Хӯроки нисфирӯзӣ.' },
          { w: 'Akşam', t: 'Бегоҳ', e: '🌆', ipa: '/ak.ʃam/', ex: 'Akşam eve gel.', exT: 'Бегоҳ ба хона биё.' },
          { w: 'Gece', t: 'Шаб', e: '🌙', ipa: '/ɡe.dʒe/', ex: 'Gece çalışıyorum.', exT: 'Шаб кор мекунам.' },
          { w: 'Bugün', t: 'Имрӯз', e: '📆', ipa: '/bu.ɡyn/', ex: 'Bugün ne var?', exT: 'Имрӯз чӣ ҳаст?' },
          { w: 'Yarın', t: 'Фардо', e: '🔜', ipa: '/ja.rɯn/', ex: 'Yarın görüşürüz.', exT: 'Фардо мебинем.' },
          { w: 'Dün', t: 'Дирӯз', e: '⏮️', ipa: '/dyn/', ex: 'Dün sinemaya gittim.', exT: 'Дирӯз ба кино рафтам.' },
          { w: 'Şimdi', t: 'Ҳозир', e: '⏰', ipa: '/ʃim.di/', ex: 'Şimdi hazırım.', exT: 'Ҳозир тайёрам.' },
        ],
      },
    ],
  },
  {
    title: 'Food & Drink', titleTranslated: 'Ғизо ва Нӯшокӣ', emoji: '🍽️', color: '#E11D48',
    lessons: [
      {
        title: 'Yiyecekler', titleTranslated: 'Ғизоҳо', emoji: '🍽️',
        words: [
          { w: 'Ekmek', t: 'Нон', e: '🍞', ipa: '/ek.mek/', ex: 'Taze ekmek.', exT: 'Нони тоза.' },
          { w: 'Et', t: 'Гӯшт', e: '🥩', ipa: '/et/', ex: 'Izgara et.', exT: 'Гӯшти бирён.' },
          { w: 'Tavuk', t: 'Мурғ', e: '🍗', ipa: '/ta.vuk/', ex: 'Tavuk çorbası.', exT: 'Шӯрбои мурғ.' },
          { w: 'Balık', t: 'Моҳӣ', e: '🐟', ipa: '/ba.lɯk/', ex: 'Taze balık.', exT: 'Моҳии тоза.' },
          { w: 'Pilav', t: 'Биринҷ / Ош', e: '🍚', ipa: '/pi.lav/', ex: 'Türk pilavı.', exT: 'Оши туркӣ.' },
          { w: 'Çorba', t: 'Шӯрбо', e: '🍲', ipa: '/tʃor.ba/', ex: 'Mercimek çorbası.', exT: 'Шӯрбои наск.' },
          { w: 'Meyve', t: 'Мева', e: '🍎', ipa: '/mej.ve/', ex: 'Taze meyve.', exT: 'Мевои тоза.' },
          { w: 'Sebze', t: 'Сабзавот', e: '🥦', ipa: '/seb.ze/', ex: 'Taze sebze.', exT: 'Сабзавоти тоза.' },
          { w: 'Peynir', t: 'Панир', e: '🧀', ipa: '/pej.nir/', ex: 'Beyaz peynir.', exT: 'Панири сафед.' },
          { w: 'Yumurta', t: 'Тухм', e: '🥚', ipa: '/ju.mur.ta/', ex: 'Sahanda yumurta.', exT: 'Тухми бирён.' },
        ],
      },
      {
        title: 'İçecekler', titleTranslated: 'Нӯшокиҳо', emoji: '🥤',
        words: [
          { w: 'Su', t: 'Об', e: '💧', ipa: '/su/', ex: 'Bir bardak su.', exT: 'Як пиёла об.' },
          { w: 'Çay', t: 'Чой', e: '🍵', ipa: '/tʃaj/', ex: 'Türk çayı.', exT: 'Чойи туркӣ.' },
          { w: 'Kahve', t: 'Қаҳва', e: '☕', ipa: '/kah.ve/', ex: 'Türk kahvesi.', exT: 'Қаҳваи туркӣ.' },
          { w: 'Süt', t: 'Шир', e: '🥛', ipa: '/syt/', ex: 'Sıcak süt.', exT: 'Шири гарм.' },
          { w: 'Meyve suyu', t: 'Шарбати мева', e: '🧃', ipa: '/mej.ve su.ju/', ex: 'Portakal suyu.', exT: 'Шарбати норинҷ.' },
          { w: 'Ayran', t: 'Дӯғ', e: '🥛', ipa: '/aj.ran/', ex: 'Soğuk ayran.', exT: 'Дӯғи сард.' },
          { w: 'Soğuk', t: 'Сард', e: '🧊', ipa: '/so.ɣuk/', ex: 'Soğuk su.', exT: 'Оби сард.' },
          { w: 'Sıcak', t: 'Гарм', e: '🔥', ipa: '/sɯ.dʒak/', ex: 'Sıcak çay.', exT: 'Чойи гарм.' },
        ],
      },
    ],
  },
  {
    title: 'Places', titleTranslated: 'Ҷойҳо', emoji: '🗺️', color: '#E11D48',
    lessons: [
      {
        title: 'Şehirdeki Yerler', titleTranslated: 'Ҷойҳои шаҳр', emoji: '🏙️',
        words: [
          { w: 'Ev', t: 'Хона', e: '🏠', ipa: '/ev/', ex: 'Eve gidiyorum.', exT: 'Ба хона мераввам.' },
          { w: 'Okul', t: 'Мактаб', e: '🏫', ipa: '/o.kul/', ex: 'Okula geç kaldım.', exT: 'Ба мактаб дер мондам.' },
          { w: 'Hastane', t: 'Беморхона', e: '🏥', ipa: '/has.ta.ne/', ex: 'Hastaneye gidiyorum.', exT: 'Ба беморхона мераввам.' },
          { w: 'Market', t: 'Дӯкон', e: '🛒', ipa: '/mar.ket/', ex: 'Marketten alışveriş.', exT: 'Аз дӯкон харидорӣ.' },
          { w: 'Restoran', t: 'Ресторан', e: '🍽️', ipa: '/res.to.ran/', ex: 'Restoranda yemek yedik.', exT: 'Дар ресторан хӯрдем.' },
          { w: 'Kafe', t: 'Кафе', e: '☕', ipa: '/ka.fe/', ex: 'Kafede buluşalım.', exT: 'Дар кафе вохӯрем.' },
          { w: 'Park', t: 'Боғ / Парк', e: '🌳', ipa: '/park/', ex: 'Parkta yürüyüş.', exT: 'Дар парк сайр.' },
          { w: 'Banka', t: 'Бонк', e: '🏦', ipa: '/ban.ka/', ex: 'Bankaya para yatırdım.', exT: 'Ба бонк пул гузоштам.' },
          { w: 'Otel', t: 'Меҳмонхона', e: '🏨', ipa: '/o.tel/', ex: 'Otelde kalıyorum.', exT: 'Дар меҳмонхона ҳастам.' },
          { w: 'Havalimanı', t: 'Фурудгоҳ', e: '✈️', ipa: '/ha.va.li.ma.nɯ/', ex: 'Havalimanına gidiyorum.', exT: 'Ба фурудгоҳ мераввам.' },
        ],
      },
      {
        title: 'Yönler', titleTranslated: 'Самтҳо', emoji: '🧭',
        words: [
          { w: 'Sağ', t: 'Рост', e: '➡️', ipa: '/saɣ/', ex: 'Sağa dönün.', exT: 'Ба рост гардед.' },
          { w: 'Sol', t: 'Чап', e: '⬅️', ipa: '/sol/', ex: 'Sola gidin.', exT: 'Ба чап равед.' },
          { w: 'Düz', t: 'Мустақим', e: '⬆️', ipa: '/dyz/', ex: 'Düz gidin.', exT: 'Рост равед.' },
          { w: 'Yakın', t: 'Наздик', e: '📍', ipa: '/ja.kɯn/', ex: 'Çok yakın.', exT: 'Хеле наздик.' },
          { w: 'Uzak', t: 'Дур', e: '📌', ipa: '/u.zak/', ex: 'Biraz uzak.', exT: 'Андаке дур.' },
          { w: 'Karşı', t: 'Рӯбарӯ', e: '↔️', ipa: '/kar.ʃɯ/', ex: 'Karşı tarafta.', exT: 'Тарафи рӯбарӯ.' },
          { w: 'Yukarı', t: 'Боло', e: '⬆️', ipa: '/ju.ka.rɯ/', ex: 'Yukarı çıkın.', exT: 'Боло баромед.' },
          { w: 'Aşağı', t: 'Поён', e: '⬇️', ipa: '/a.ʃa.ɣɯ/', ex: 'Aşağı inin.', exT: 'Поён фуромед.' },
        ],
      },
    ],
  },
  {
    title: 'Basic Verbs', titleTranslated: 'Феълҳои асосӣ', emoji: '⚡', color: '#E11D48',
    lessons: [
      {
        title: 'Temel Fiiller · Part 1', titleTranslated: 'Феълҳои асосӣ · Қисми 1', emoji: '🏃',
        words: [
          { w: 'Gitmek', t: 'Рафтан', e: '🚶', ipa: '/ɡit.mek/', ex: 'Eve gidiyorum.', exT: 'Ба хона мераввам.' },
          { w: 'Gelmek', t: 'Омадан', e: '🚶‍♂️', ipa: '/ɡel.mek/', ex: 'Buraya gel.', exT: 'Ин ҷо биё.' },
          { w: 'Yemek', t: 'Хӯрдан', e: '🍴', ipa: '/je.mek/', ex: 'Yemek yiyorum.', exT: 'Хӯрок мехӯрам.' },
          { w: 'İçmek', t: 'Нӯшидан', e: '🥤', ipa: '/itʃ.mek/', ex: 'Su içiyorum.', exT: 'Об менӯшам.' },
          { w: 'Uyumak', t: 'Хобидан', e: '😴', ipa: '/u.ju.mak/', ex: 'Erken uyuyorum.', exT: 'Барвақт мехобам.' },
          { w: 'Kalkmak', t: 'Хестан', e: '🌅', ipa: '/kalk.mak/', ex: 'Sabah kalkıyorum.', exT: 'Субҳ мехезам.' },
          { w: 'Oturmak', t: 'Нишастан', e: '🪑', ipa: '/o.tur.mak/', ex: 'Sandalyeye oturuyorum.', exT: 'Ба курсӣ менишинам.' },
          { w: 'Çalışmak', t: 'Кор кардан', e: '💼', ipa: '/tʃa.lɯʃ.mak/', ex: 'Çok çalışıyorum.', exT: 'Зиёд кор мекунам.' },
        ],
      },
      {
        title: 'Temel Fiiller · Part 2', titleTranslated: 'Феълҳои асосӣ · Қисми 2', emoji: '📖',
        words: [
          { w: 'Okumak', t: 'Хондан', e: '📖', ipa: '/o.ku.mak/', ex: 'Kitap okuyorum.', exT: 'Китоб мехонам.' },
          { w: 'Yazmak', t: 'Навиштан', e: '✍️', ipa: '/jaz.mak/', ex: 'Mektup yazıyorum.', exT: 'Мактуб менависам.' },
          { w: 'Konuşmak', t: 'Гап задан', e: '💬', ipa: '/ko.nuʃ.mak/', ex: 'Türkçe konuşuyorum.', exT: 'Туркӣ ҳарф мезанам.' },
          { w: 'Dinlemek', t: 'Гӯш додан', e: '👂', ipa: '/din.le.mek/', ex: 'Müzik dinliyorum.', exT: 'Мусиқӣ мешунавам.' },
          { w: 'Görmek', t: 'Дидан', e: '👁️', ipa: '/ɡør.mek/', ex: 'Seni görüyorum.', exT: 'Туро мебинам.' },
          { w: 'Bilmek', t: 'Донистан', e: '🧠', ipa: '/bil.mek/', ex: 'Türkçe biliyorum.', exT: 'Туркӣ медонам.' },
          { w: 'İstemek', t: 'Хостан', e: '🙋', ipa: '/is.te.mek/', ex: 'Su istiyorum.', exT: 'Об мехоҳам.' },
          { w: 'Sevmek', t: 'Дӯст доштан', e: '❤️', ipa: '/sev.mek/', ex: 'Seni seviyorum.', exT: 'Туро дӯст дорам.' },
        ],
      },
    ],
  },
  {
    title: 'Shopping', titleTranslated: 'Харидорӣ', emoji: '🛍️', color: '#E11D48',
    lessons: [
      {
        title: 'Alışveriş', titleTranslated: 'Харидорӣ', emoji: '🛒',
        words: [
          { w: 'Almak', t: 'Харидан', e: '🛍️', ipa: '/al.mak/', ex: 'Elma alıyorum.', exT: 'Себ мехарам.' },
          { w: 'Fiyat', t: 'Нарх / Баҳо', e: '🏷️', ipa: '/fi.jat/', ex: 'Fiyatı ne kadar?', exT: 'Нарх чанд?' },
          { w: 'Pahalı', t: 'Гарон', e: '💸', ipa: '/pa.ha.lɯ/', ex: 'Çok pahalı.', exT: 'Хеле гарон аст.' },
          { w: 'Ucuz', t: 'Арзон', e: '✅', ipa: '/u.dʒuz/', ex: 'Çok ucuz.', exT: 'Хеле арзон аст.' },
          { w: 'Para', t: 'Пул', e: '💵', ipa: '/pa.ra/', ex: 'Param yok.', exT: 'Пул надорам.' },
          { w: 'İndirim', t: 'Тахфиф', e: '🏷️', ipa: '/in.di.rim/', ex: 'İndirim var mı?', exT: 'Тахфиф ҳаст?' },
          { w: 'Kaç lira', t: 'Чанд лира', e: '❓', ipa: '/katʃ li.ra/', ex: 'Bu kaç lira?', exT: 'Ин чанд лира?' },
          { w: 'Teşekkürler', t: 'Ташаккур', e: '🙏', ipa: '/te.ʃek.kyr.ler/', ex: 'Teşekkürler, güle güle.', exT: 'Ташаккур, хайр.' },
        ],
      },
    ],
  },
  {
    title: 'Conversations', titleTranslated: 'Гуфтугӯ', emoji: '💬', color: '#E11D48',
    lessons: [
      {
        title: 'Soru Kelimeleri', titleTranslated: 'Калимаҳои савол', emoji: '❓',
        words: [
          { w: 'Ne', t: 'Чӣ', e: '❓', ipa: '/ne/', ex: 'Bu ne?', exT: 'Ин чист?' },
          { w: 'Kim', t: 'Кӣ', e: '👤', ipa: '/kim/', ex: 'Bu kim?', exT: 'Ин кӣ аст?' },
          { w: 'Nerede', t: 'Куҷо', e: '📍', ipa: '/ne.re.de/', ex: 'Neredesin?', exT: 'Куҷоӣ?' },
          { w: 'Ne zaman', t: 'Кай / Чӣ вақт', e: '⏰', ipa: '/ne za.man/', ex: 'Ne zaman geleceksin?', exT: 'Кай меояӣ?' },
          { w: 'Nasıl', t: 'Чӣ тавр', e: '🤔', ipa: '/na.sɯl/', ex: 'Nasılsın?', exT: 'Чӣ ҳол дорӣ?' },
          { w: 'Neden', t: 'Чаро', e: '❔', ipa: '/ne.den/', ex: 'Neden gelmedin?', exT: 'Чаро наомадӣ?' },
          { w: 'Kaç', t: 'Чанд', e: '🔢', ipa: '/katʃ/', ex: 'Kaç yaşındasın?', exT: 'Чанд сола ҳастӣ?' },
          { w: 'Hangi', t: 'Кадом', e: '☝️', ipa: '/han.ɡi/', ex: 'Hangi kitap?', exT: 'Кадом китоб?' },
        ],
      },
      {
        title: 'Günlük İfadeler', titleTranslated: 'Ибораҳои ҳаррӯза', emoji: '🗣️',
        words: [
          { w: 'Tamam', t: 'Хуб / Мувофиқ', e: '👌', ipa: '/ta.mam/', ex: 'Tamam, anlaştık.', exT: 'Хуб, розӣ шудем.' },
          { w: 'Lütfen', t: 'Марҳамат / Илтимос', e: '🙏', ipa: '/lyt.fen/', ex: 'Lütfen yardım et.', exT: 'Илтимос кӯмак кун.' },
          { w: 'Özür dilerim', t: 'Маафаш кунед', e: '😔', ipa: '/ø.zyr di.le.rim/', ex: 'Özür dilerim, geç kaldım.', exT: 'Маафаш кунед, дер мондам.' },
          { w: 'Anlamadım', t: 'Нафаҳмидам', e: '🤷', ipa: '/an.la.ma.dɯm/', ex: 'Anlamadım, tekrar söyler misiniz?', exT: 'Нафаҳмидам, такрор мекунед?' },
          { w: 'Yardım eder misiniz', t: 'Кӯмак карда метавонед', e: '🆘', ipa: '/jar.dɯm e.der mi.si.niz/', ex: 'Yardım eder misiniz lütfen?', exT: 'Илтимос кӯмак карда метавонед?' },
          { w: 'Tabii', t: 'Албатта', e: '✅', ipa: '/ta.bi.i/', ex: 'Tabii, buyurun.', exT: 'Албатта, марҳамат.' },
          { w: 'Bilmiyorum', t: 'Намедонам', e: '🤷', ipa: '/bil.mi.jo.rum/', ex: 'Bilmiyorum, özür dilerim.', exT: 'Намедонам, маафаш кунед.' },
          { w: 'İyi şanslar', t: 'Муваффақ бошед', e: '🍀', ipa: '/i.ji ʃans.lar/', ex: 'İyi şanslar sınavda!', exT: 'Имтиҳонда муваффақ бошед!' },
        ],
      },
    ],
  },
];

async function run() {
  console.log('🇹🇷 Забони туркӣ A1 — иловакунӣ ба база оғоз шуд...\n');

  // 1. Забони туркиро навсозӣ кун (nativeName ва flag дурустро бигузор)
  console.log('1️⃣  Забони туркиро навсозӣ мекунам...');
  const langUpdate = await apiCall('PUT', `/api/admin/languages/${TR_ID}`, {
    nativeName: 'Türkçe',
    flag: '🇹🇷',
    badge: 'LIVE',
  });
  console.log('   ✅ Забон навсозӣ шуд:', JSON.stringify(langUpdate).slice(0,80));

  // 2. Курсро навсозӣ кун
  console.log('2️⃣  Курси A1-ро навсозӣ мекунам...');
  const courseUpdate = await apiCall('PUT', `/api/admin/courses/${COURSE_ID}`, {
    title: 'Забони туркӣ — A1',
    description: 'Асосҳои забони туркӣ барои тоҷикзабонон',
    emoji: '🇹🇷',
  });
  console.log('   ✅ Курс навсозӣ шуд:', JSON.stringify(courseUpdate).slice(0,80));

  // 3. Модулҳо, дарсҳо ва калимаҳо
  let totalModules = 0, totalLessons = 0, totalWords = 0;

  for (let mi = 0; mi < MODULES.length; mi++) {
    const m = MODULES[mi];
    console.log(`\n📚 Модул ${mi + 1}/${MODULES.length}: ${m.titleTranslated}`);

    const modRes = await apiCall('POST', '/api/admin/modules', {
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
    console.log(`   ✅ Модул сохта шуд: ${moduleId}`);

    for (let li = 0; li < m.lessons.length; li++) {
      const l = m.lessons[li];
      const lessonRes = await apiCall('POST', '/api/admin/lessons', {
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

      // Калимаҳо (bulk)
      const wordsRes = await apiCall('POST', '/api/admin/words/bulk', {
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
      console.log(`   📖 Дарс: "${l.titleTranslated}" — ${wCount} калима`);
    }
  }

  console.log(`\n✅ Тамом шуд!`);
  console.log(`   Модулҳо: ${totalModules}`);
  console.log(`   Дарсҳо: ${totalLessons}`);
  console.log(`   Калимаҳо: ${totalWords}`);
  console.log(`\n🔗 Курс дар: https://admin.ramz.tj/admin/courses/${COURSE_ID}`);
}

run().catch(console.error);
