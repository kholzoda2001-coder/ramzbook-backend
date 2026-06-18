import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

// ─── Забони туркӣ A1 барои тоҷикзабонон (CEFR A1 — байналмилалӣ) ───
// Сохтор: 10 модул → 2-3 дарс → 8-10 калима
// Ҳар дарс: калима туркӣ (w), тарҷумаи тоҷикӣ (t), emoji (e),
//            талаффуз (ipa), ҷумлаи намуна туркӣ (ex), тарҷумаи ҷумла (exT)

const TR_A1 = {
  level: 'A1',
  title: 'Забони туркӣ — A1',
  description: 'Асосҳои забони туркӣ барои тоҷикзабонон',
  emoji: '🇹🇷',
  color: '#E11D48',

  modules: [
    // ── Модул 1: Саломпурсӣ ────────────────────────────────────────────
    {
      title: 'Greetings',
      titleTranslated: 'Саломпурсӣ',
      emoji: '👋',
      lessons: [
        {
          title: 'Selamlaşma · Part 1',
          titleTranslated: 'Саломпурсӣ · Қисми 1',
          type: 'vocab',
          emoji: '👋',
          words: [
            { w: 'Merhaba', t: 'Салом', e: '👋', ipa: '/mer.ha.ba/', ex: 'Merhaba! Nasılsın?', exT: 'Салом! Чӣ ҳол?' },
            { w: 'Günaydın', t: 'Субҳ ба хайр', e: '🌅', ipa: '/ɡy.naj.dɯn/', ex: 'Günaydın! İyi sabahlar.', exT: 'Субҳ ба хайр! Субҳи нек.' },
            { w: 'İyi günler', t: 'Рӯзи нек', e: '☀️', ipa: '/i.ji ɡyn.ler/', ex: 'İyi günler, nasıl gidiyor?', exT: 'Рӯзи нек, чӣ хел?' },
            { w: 'İyi akşamlar', t: 'Бегоҳ ба хайр', e: '🌆', ipa: '/i.ji ak.ʃam.lar/', ex: 'İyi akşamlar efendim.', exT: 'Бегоҳ ба хайр ҷаноб.' },
            { w: 'İyi geceler', t: 'Шаб ба хайр', e: '🌙', ipa: '/i.ji ɡe.dʒe.ler/', ex: 'İyi geceler, iyi uyku!', exT: 'Шаб ба хайр, хоби хуш!' },
            { w: 'Hoş geldiniz', t: 'Хуш омадед', e: '🏠', ipa: '/hoʃ ɡel.di.niz/', ex: 'Hoş geldiniz, buyurun.', exT: 'Хуш омадед, марҳамат.' },
            { w: 'Hoş bulduk', t: 'Хуш ёфтем', e: '😊', ipa: '/hoʃ bul.duk/', ex: 'Hoş bulduk, teşekkürler.', exT: 'Хуш ёфтем, ташаккур.' },
            { w: 'Görüşürüz', t: 'То дидор', e: '👋', ipa: '/ɡø.ry.ʃy.ryz/', ex: 'Görüşürüz yarın!', exT: 'То дидор фардо!' },
          ],
        },
        {
          title: 'Selamlaşma · Part 2',
          titleTranslated: 'Саломпурсӣ · Қисми 2',
          type: 'vocab',
          emoji: '🤝',
          words: [
            { w: 'Nasılsın', t: 'Чӣ ҳол дорӣ', e: '😊', ipa: '/na.sɯl.sɯn/', ex: 'Nasılsın bu aralar?', exT: 'Ин рӯзҳо чӣ ҳол?' },
            { w: 'İyiyim', t: 'Хубам', e: '👍', ipa: '/i.ji.jim/', ex: 'İyiyim, teşekkür ederim.', exT: 'Хубам, ташаккур.' },
            { w: 'Teşekkürler', t: 'Ташаккур', e: '🙏', ipa: '/te.ʃek.kyr.ler/', ex: 'Teşekkürler, çok iyisin.', exT: 'Ташаккур, хеле хубӣ.' },
            { w: 'Rica ederim', t: 'Хоҳиш мекунам', e: '😌', ipa: '/ri.dʒa e.de.rim/', ex: 'Rica ederim, bir şey değil.', exT: 'Хоҳиш мекунам, ҳеҷ чиз.' },
            { w: 'Adınız ne', t: 'Номатон чист', e: '📛', ipa: '/a.dɯ.nɯz ne/', ex: 'Adınız ne, efendim?', exT: 'Номатон чист ҷаноб?' },
            { w: 'Benim adım', t: 'Номи ман', e: '🏷️', ipa: '/be.nim a.dɯm/', ex: 'Benim adım Rustam.', exT: 'Номи ман Рустам.' },
            { w: 'Memnun oldum', t: 'Хурсанд шудам', e: '🤝', ipa: '/mem.nun ol.dum/', ex: 'Memnun oldum, tanışalım.', exT: 'Хурсанд шудам, шинос шавем.' },
            { w: 'Ben de', t: 'Ман ҳам', e: '😊', ipa: '/ben de/', ex: 'Ben de memnun oldum.', exT: 'Ман ҳам хурсанд шудам.' },
          ],
        },
      ],
    },

    // ── Модул 2: Ман ва оила ────────────────────────────────────────────
    {
      title: 'Family',
      titleTranslated: 'Оила',
      emoji: '👨‍👩‍👧‍👦',
      lessons: [
        {
          title: 'Aile · Part 1',
          titleTranslated: 'Оила · Қисми 1',
          type: 'vocab',
          emoji: '👨‍👩‍👧‍👦',
          words: [
            { w: 'Anne', t: 'Модар', e: '👩', ipa: '/an.ne/', ex: 'Annem çok güzel.', exT: 'Модарам хеле зебост.' },
            { w: 'Baba', t: 'Падар', e: '👨', ipa: '/ba.ba/', ex: 'Babam işte çalışıyor.', exT: 'Падарам дар кор кор мекунад.' },
            { w: 'Kardeş', t: 'Бародар/Хоҳар', e: '👫', ipa: '/kar.deʃ/', ex: 'Bir kardeşim var.', exT: 'Як бародарам ҳаст.' },
            { w: 'Abla', t: 'Хоҳари калон', e: '👩‍🦱', ipa: '/ab.la/', ex: 'Ablam öğretmen.', exT: 'Хоҳари калонам муаллим аст.' },
            { w: 'Abi', t: 'Бародари калон', e: '👦', ipa: '/a.bi/', ex: 'Abim İstanbul\'da yaşıyor.', exT: 'Бародари калонам дар Истанбул зиндагӣ мекунад.' },
            { w: 'Çocuk', t: 'Кӯдак', e: '👶', ipa: '/tʃo.dʒuk/', ex: 'İki çocuğum var.', exT: 'Ду кӯдакам ҳаст.' },
            { w: 'Büyükanne', t: 'Модаркалон', e: '👵', ipa: '/by.jyk.an.ne/', ex: 'Büyükannem 70 yaşında.', exT: 'Модаркалонам 70 сола аст.' },
            { w: 'Büyükbaba', t: 'Падаркалон', e: '👴', ipa: '/by.jyk.ba.ba/', ex: 'Büyükbabam çok bilge.', exT: 'Падаркалонам хеле доно аст.' },
            { w: 'Amca', t: 'Амак', e: '🧔', ipa: '/am.dʒa/', ex: 'Amcam doktor.', exT: 'Амакам духтур аст.' },
            { w: 'Teyze', t: 'Холаи модарӣ', e: '👩‍🦳', ipa: '/tej.ze/', ex: 'Teyzem bizi sevuyor.', exT: 'Холаи модарии ман моро дӯст медорад.' },
          ],
        },
        {
          title: 'Zamirler (Pronouns)',
          titleTranslated: 'Ҷонишинҳо',
          type: 'vocab',
          emoji: '👤',
          words: [
            { w: 'Ben', t: 'Ман', e: '👤', ipa: '/ben/', ex: 'Ben öğrenciyim.', exT: 'Ман донишҷӯям.' },
            { w: 'Sen', t: 'Ту', e: '👉', ipa: '/sen/', ex: 'Sen nerelisin?', exT: 'Ту аз куҷоӣ?' },
            { w: 'O', t: 'Вай / Ӯ', e: '🫵', ipa: '/o/', ex: 'O çok akıllı.', exT: 'Ӯ хеле зирак аст.' },
            { w: 'Biz', t: 'Мо', e: '👥', ipa: '/biz/', ex: 'Biz Tacikistanlıyız.', exT: 'Мо тоҷикистонӣ ҳастем.' },
            { w: 'Siz', t: 'Шумо', e: '👨‍👩‍👧', ipa: '/siz/', ex: 'Siz nerede oturuyorsunuz?', exT: 'Шумо куҷо зиндагӣ мекунед?' },
            { w: 'Onlar', t: 'Онҳо', e: '👨‍👩‍👧‍👦', ipa: '/on.lar/', ex: 'Onlar Türkiye\'de.', exT: 'Онҳо дар Туркия ҳастанд.' },
            { w: 'Bu', t: 'Ин', e: '☝️', ipa: '/bu/', ex: 'Bu ne?', exT: 'Ин чист?' },
            { w: 'Şu', t: 'Он (наздик)', e: '👆', ipa: '/ʃu/', ex: 'Şu kalem benim.', exT: 'Он қалам мол и ман аст.' },
          ],
        },
      ],
    },

    // ── Модул 3: Рақамҳо ──────────────────────────────────────────────
    {
      title: 'Numbers',
      titleTranslated: 'Рақамҳо',
      emoji: '🔢',
      lessons: [
        {
          title: 'Sayılar 1–10',
          titleTranslated: 'Рақамҳо 1-10',
          type: 'vocab',
          emoji: '🔢',
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
          title: 'Sayılar 11–100',
          titleTranslated: 'Рақамҳо 11-100',
          type: 'vocab',
          emoji: '💯',
          words: [
            { w: 'On bir', t: 'Ёздаҳ', e: '🔢', ipa: '/on bir/', ex: 'On bir yaşındayım.', exT: 'Ман ёздаҳ сола ҳастам.' },
            { w: 'Yirmi', t: 'Бист', e: '2️⃣0️⃣', ipa: '/jir.mi/', ex: 'Yirmi dakika.', exT: 'Бист дақиқа.' },
            { w: 'Otuz', t: 'Си', e: '3️⃣0️⃣', ipa: '/o.tuz/', ex: 'Otuz yaşındayım.', exT: 'Ман си сола ҳастам.' },
            { w: 'Kırk', t: 'Чил', e: '4️⃣0️⃣', ipa: '/kɯrk/', ex: 'Kırk lira.', exT: 'Чил лира.' },
            { w: 'Elli', t: 'Панҷоҳ', e: '5️⃣0️⃣', ipa: '/el.li/', ex: 'Elli kilometre.', exT: 'Панҷоҳ километр.' },
            { w: 'Altmış', t: 'Шаст', e: '6️⃣0️⃣', ipa: '/alt.mɯʃ/', ex: 'Altmış saniye bir dakika.', exT: 'Шаст сония як дақиқа аст.' },
            { w: 'Yetmiş', t: 'Ҳафтод', e: '7️⃣0️⃣', ipa: '/jet.miʃ/', ex: 'Yetmiş yıl önce.', exT: 'Ҳафтод сол пеш.' },
            { w: 'Seksen', t: 'Ҳаштод', e: '8️⃣0️⃣', ipa: '/sek.sen/', ex: 'Seksen kişi.', exT: 'Ҳаштод нафар.' },
            { w: 'Doksan', t: 'Навад', e: '9️⃣0️⃣', ipa: '/dok.san/', ex: 'Doksan gün.', exT: 'Навад рӯз.' },
            { w: 'Yüz', t: 'Сад', e: '💯', ipa: '/jyz/', ex: 'Yüz lira ödedim.', exT: 'Ман сад лира пардохтам.' },
          ],
        },
      ],
    },

    // ── Модул 4: Рангҳо ва сифатҳо ────────────────────────────────────
    {
      title: 'Colors & Adjectives',
      titleTranslated: 'Рангҳо ва сифатҳо',
      emoji: '🎨',
      lessons: [
        {
          title: 'Renkler',
          titleTranslated: 'Рангҳо',
          type: 'vocab',
          emoji: '🎨',
          words: [
            { w: 'Kırmızı', t: 'Сурх', e: '🔴', ipa: '/kɯr.mɯ.zɯ/', ex: 'Kırmızı gül.', exT: 'Гули сурх.' },
            { w: 'Mavi', t: 'Кабуд', e: '🔵', ipa: '/ma.vi/', ex: 'Gökyüzü mavi.', exT: 'Осмон кабуд аст.' },
            { w: 'Yeşil', t: 'Сабз', e: '🟢', ipa: '/je.ʃil/', ex: 'Ağaçlar yeşil.', exT: 'Дарахтон сабзанд.' },
            { w: 'Sarı', t: 'Зард', e: '🟡', ipa: '/sa.rɯ/', ex: 'Güneş sarı.', exT: 'Офтоб зард аст.' },
            { w: 'Beyaz', t: 'Сафед', e: '⬜', ipa: '/be.jaz/', ex: 'Kar beyaz.', exT: 'Барф сафед аст.' },
            { w: 'Siyah', t: 'Сиёҳ', e: '⬛', ipa: '/si.jah/', ex: 'Gece siyah.', exT: 'Шаб сиёҳ аст.' },
            { w: 'Turuncu', t: 'Норанҷӣ', e: '🟠', ipa: '/tu.run.dʒu/', ex: 'Portakal turuncu.', exT: 'Норинҷ норанҷӣ аст.' },
            { w: 'Mor', t: 'Бунафша', e: '🟣', ipa: '/mor/', ex: 'Leylak moru sever.', exT: 'Ёсуман рангро дӯст дорад.' },
            { w: 'Pembe', t: 'Гулобӣ', e: '🌸', ipa: '/pem.be/', ex: 'Pembe elbise.', exT: 'Либоси гулобӣ.' },
            { w: 'Kahverengi', t: 'Қаҳваранг', e: '🟫', ipa: '/kah.ve.ren.ɡi/', ex: 'Saçları kahverengi.', exT: 'Мӯяшон қаҳваранг аст.' },
          ],
        },
        {
          title: 'Sıfatlar (Adjectives)',
          titleTranslated: 'Сифатҳо',
          type: 'vocab',
          emoji: '✨',
          words: [
            { w: 'Büyük', t: 'Калон / Бузург', e: '🐘', ipa: '/by.jyk/', ex: 'Büyük ev.', exT: 'Хонаи калон.' },
            { w: 'Küçük', t: 'Хурд / Майда', e: '🐭', ipa: '/ky.tʃyk/', ex: 'Küçük kuş.', exT: 'Паррандаи хурд.' },
            { w: 'Güzel', t: 'Зебо / Хуб', e: '😍', ipa: '/ɡy.zel/', ex: 'Güzel şehir.', exT: 'Шаҳри зебо.' },
            { w: 'Çirkin', t: 'Бадсурат', e: '😞', ipa: '/tʃir.kin/', ex: 'Çok çirkin değil.', exT: 'Он қадар ҳам бадсурат нест.' },
            { w: 'İyi', t: 'Хуб', e: '👍', ipa: '/i.ji/', ex: 'İyi bir insan.', exT: 'Одами хуб.' },
            { w: 'Kötü', t: 'Бад', e: '👎', ipa: '/kø.ty/', ex: 'Kötü hava.', exT: 'Обу ҳавои бад.' },
            { w: 'Yeni', t: 'Нав', e: '🆕', ipa: '/je.ni/', ex: 'Yeni telefon.', exT: 'Телефони нав.' },
            { w: 'Eski', t: 'Кӯҳна', e: '⏳', ipa: '/es.ki/', ex: 'Eski kitap.', exT: 'Китоби кӯҳна.' },
            { w: 'Uzun', t: 'Дароз', e: '📏', ipa: '/u.zun/', ex: 'Uzun boylu adam.', exT: 'Марди бақадди дароз.' },
            { w: 'Kısa', t: 'Кӯтоҳ', e: '📐', ipa: '/kɯ.sa/', ex: 'Kısa yol.', exT: 'Роҳи кӯтоҳ.' },
          ],
        },
      ],
    },

    // ── Модул 5: Вақт ─────────────────────────────────────────────────
    {
      title: 'Time',
      titleTranslated: 'Вақт',
      emoji: '🕐',
      lessons: [
        {
          title: 'Günler (Days of the Week)',
          titleTranslated: 'Рӯзҳои ҳафта',
          type: 'vocab',
          emoji: '📅',
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
          title: 'Aylar (Months)',
          titleTranslated: 'Моҳҳо',
          type: 'vocab',
          emoji: '🗓️',
          words: [
            { w: 'Ocak', t: 'Январ', e: '❄️', ipa: '/o.dʒak/', ex: 'Ocak soğuk.', exT: 'Январ сард аст.' },
            { w: 'Şubat', t: 'Феврал', e: '🌨️', ipa: '/ʃu.bat/', ex: 'Şubatta kar yağıyor.', exT: 'Феврал барф меборад.' },
            { w: 'Mart', t: 'Март', e: '🌱', ipa: '/mart/', ex: 'Mart bahar ayı.', exT: 'Март моҳи баҳор аст.' },
            { w: 'Nisan', t: 'Апрел', e: '🌷', ipa: '/ni.san/', ex: 'Nisan yağmurlu.', exT: 'Апрел борониест.' },
            { w: 'Mayıs', t: 'Май', e: '🌸', ipa: '/ma.jɯs/', ex: 'Mayıs çok güzel.', exT: 'Май хеле зебост.' },
            { w: 'Haziran', t: 'Июн', e: '☀️', ipa: '/ha.zi.ran/', ex: 'Haziranda tatil.', exT: 'Июн таътил аст.' },
            { w: 'Temmuz', t: 'Июл', e: '🌞', ipa: '/tem.muz/', ex: 'Temmuz çok sıcak.', exT: 'Июл хеле гарм аст.' },
            { w: 'Ağustos', t: 'Август', e: '🏖️', ipa: '/a.ɣus.tos/', ex: 'Ağustosta deniz.', exT: 'Август баҳр.' },
            { w: 'Eylül', t: 'Сентябр', e: '🍂', ipa: '/ej.lyl/', ex: 'Eylül okul başlıyor.', exT: 'Сентябр мактаб оғоз мешавад.' },
            { w: 'Ekim', t: 'Октябр', e: '🍁', ipa: '/e.kim/', ex: 'Ekim soğuyor.', exT: 'Октябр сард мешавад.' },
            { w: 'Kasım', t: 'Ноябр', e: '🌧️', ipa: '/ka.sɯm/', ex: 'Kasım yağmurlu.', exT: 'Ноябр борониест.' },
            { w: 'Aralık', t: 'Декабр', e: '🎄', ipa: '/a.ra.lɯk/', ex: 'Aralık kış ayı.', exT: 'Декабр моҳи зимистон аст.' },
          ],
        },
        {
          title: 'Zaman İfadeleri (Time Expressions)',
          titleTranslated: 'Ибораҳои вақт',
          type: 'vocab',
          emoji: '⏰',
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

    // ── Модул 6: Ғизо ва нӯшокӣ ─────────────────────────────────────
    {
      title: 'Food & Drink',
      titleTranslated: 'Ғизо ва Нӯшокӣ',
      emoji: '🍽️',
      lessons: [
        {
          title: 'Yiyecekler (Food)',
          titleTranslated: 'Ғизоҳо',
          type: 'vocab',
          emoji: '🍽️',
          words: [
            { w: 'Ekmek', t: 'Нон', e: '🍞', ipa: '/ek.mek/', ex: 'Taze ekmek.', exT: 'Нони тоза.' },
            { w: 'Et', t: 'Гӯшт', e: '🥩', ipa: '/et/', ex: 'Izgara et.', exT: 'Гӯшти бирён.' },
            { w: 'Tavuk', t: 'Мурғ', e: '🍗', ipa: '/ta.vuk/', ex: 'Tavuk çorbası.', exT: 'Шӯрбои мурғ.' },
            { w: 'Balık', t: 'Моҳӣ', e: '🐟', ipa: '/ba.lɯk/', ex: 'Taze balık.', exT: 'Моҳии тоза.' },
            { w: 'Pilav', t: 'Биринҷ / Ош', e: '🍚', ipa: '/pi.lav/', ex: 'Türk pilavı.', exT: 'Оши туркӣ.' },
            { w: 'Çorba', t: 'Шӯрбо', e: '🍲', ipa: '/tʃor.ba/', ex: 'Mercimek çorbası.', exT: 'Шӯрбои наск.' },
            { w: 'Salata', t: 'Салат', e: '🥗', ipa: '/sa.la.ta/', ex: 'Taze salata.', exT: 'Салати тоза.' },
            { w: 'Meyve', t: 'Мева', e: '🍎', ipa: '/mej.ve/', ex: 'Mevsim meyvesi.', exT: 'Мевай мавсимӣ.' },
            { w: 'Sebze', t: 'Сабзавот', e: '🥦', ipa: '/seb.ze/', ex: 'Taze sebze.', exT: 'Сабзавоти тоза.' },
            { w: 'Peynir', t: 'Панир', e: '🧀', ipa: '/pej.nir/', ex: 'Beyaz peynir.', exT: 'Панири сафед.' },
          ],
        },
        {
          title: 'İçecekler (Drinks)',
          titleTranslated: 'Нӯшокиҳо',
          type: 'vocab',
          emoji: '🥤',
          words: [
            { w: 'Su', t: 'Об', e: '💧', ipa: '/su/', ex: 'Bir bardak su.', exT: 'Як пиёла об.' },
            { w: 'Çay', t: 'Чой', e: '🍵', ipa: '/tʃaj/', ex: 'Türk çayı.', exT: 'Чойи туркӣ.' },
            { w: 'Kahve', t: 'Қаҳва', e: '☕', ipa: '/kah.ve/', ex: 'Türk kahvesi.', exT: 'Қаҳваи туркӣ.' },
            { w: 'Süt', t: 'Шир', e: '🥛', ipa: '/syt/', ex: 'Sıcak süt.', exT: 'Шири гарм.' },
            { w: 'Meyve suyu', t: 'Шарбати мева', e: '🧃', ipa: '/mej.ve su.ju/', ex: 'Portakal suyu.', exT: 'Шарбати норинҷ.' },
            { w: 'Ayran', t: 'Дӯғ', e: '🥛', ipa: '/aj.ran/', ex: 'Soğuk ayran.', exT: 'Дӯғи сард.' },
            { w: 'Kola', t: 'Кола', e: '🥤', ipa: '/ko.la/', ex: 'Soğuk kola.', exT: 'Колаи сард.' },
            { w: 'Bira', t: 'Пиво', e: '🍺', ipa: '/bi.ra/', ex: 'Soğuk bira.', exT: 'Пивои сард.' },
          ],
        },
      ],
    },

    // ── Модул 7: Ҷойҳо ──────────────────────────────────────────────
    {
      title: 'Places',
      titleTranslated: 'Ҷойҳо',
      emoji: '🗺️',
      lessons: [
        {
          title: 'Şehirdeki Yerler (Places in City)',
          titleTranslated: 'Ҷойҳои шаҳр',
          type: 'vocab',
          emoji: '🏙️',
          words: [
            { w: 'Ev', t: 'Хона', e: '🏠', ipa: '/ev/', ex: 'Eve gidiyorum.', exT: 'Ба хона мераввам.' },
            { w: 'Okul', t: 'Мактаб', e: '🏫', ipa: '/o.kul/', ex: 'Okula geç kaldım.', exT: 'Ба мактаб дер мондам.' },
            { w: 'Hastane', t: 'Беморхона', e: '🏥', ipa: '/has.ta.ne/', ex: 'Hastaneye gidiyorum.', exT: 'Ба беморхона мераввам.' },
            { w: 'Market', t: 'Дӯкон / Бозор', e: '🛒', ipa: '/mar.ket/', ex: 'Marketten alışveriş.', exT: 'Аз дӯкон харидорӣ.' },
            { w: 'Restoran', t: 'Ресторан', e: '🍽️', ipa: '/res.to.ran/', ex: 'Restoranda yemek yedik.', exT: 'Дар ресторан хӯрдем.' },
            { w: 'Kafe', t: 'Кафе', e: '☕', ipa: '/ka.fe/', ex: 'Kafede buluşalım.', exT: 'Дар кафе вохӯрем.' },
            { w: 'Park', t: 'Боғ / Парк', e: '🌳', ipa: '/park/', ex: 'Parkta yürüyüş.', exT: 'Дар парк сайр.' },
            { w: 'Banka', t: 'Бонк', e: '🏦', ipa: '/ban.ka/', ex: 'Bankaya para yatırdım.', exT: 'Ба бонк пул гузоштам.' },
            { w: 'Otel', t: 'Меҳмонхона', e: '🏨', ipa: '/o.tel/', ex: 'Otelde kalıyorum.', exT: 'Дар меҳмонхона ҳастам.' },
            { w: 'Havalimanı', t: 'Фурудгоҳ', e: '✈️', ipa: '/ha.va.li.ma.nɯ/', ex: 'Havalimanına gidiyorum.', exT: 'Ба фурудгоҳ мераввам.' },
          ],
        },
        {
          title: 'Yönler (Directions)',
          titleTranslated: 'Самтҳо',
          type: 'vocab',
          emoji: '🧭',
          words: [
            { w: 'Sağ', t: 'Рост', e: '➡️', ipa: '/saɣ/', ex: 'Sağa dönün.', exT: 'Ба рост гардед.' },
            { w: 'Sol', t: 'Чап', e: '⬅️', ipa: '/sol/', ex: 'Sola gidin.', exT: 'Ба чап равед.' },
            { w: 'Düz', t: 'Рост / Мустақим', e: '⬆️', ipa: '/dyz/', ex: 'Düz gidin.', exT: 'Рост равед.' },
            { w: 'Yakın', t: 'Наздик', e: '📍', ipa: '/ja.kɯn/', ex: 'Çok yakın.', exT: 'Хеле наздик.' },
            { w: 'Uzak', t: 'Дур', e: '📌', ipa: '/u.zak/', ex: 'Biraz uzak.', exT: 'Андаке дур.' },
            { w: 'Karşı', t: 'Рӯбарӯ', e: '↔️', ipa: '/kar.ʃɯ/', ex: 'Karşı tarafta.', exT: 'Тарафи рӯбарӯ.' },
            { w: 'Yukarı', t: 'Боло', e: '⬆️', ipa: '/ju.ka.rɯ/', ex: 'Yukarı çıkın.', exT: 'Боло баромед.' },
            { w: 'Aşağı', t: 'Поён / Паст', e: '⬇️', ipa: '/a.ʃa.ɣɯ/', ex: 'Aşağı inin.', exT: 'Поён фуромед.' },
          ],
        },
      ],
    },

    // ── Модул 8: Феълҳои асосӣ ──────────────────────────────────────
    {
      title: 'Basic Verbs',
      titleTranslated: 'Феълҳои асосӣ',
      emoji: '⚡',
      lessons: [
        {
          title: 'Temel Fiiller · Part 1',
          titleTranslated: 'Феълҳои асосӣ · Қисми 1',
          type: 'vocab',
          emoji: '🏃',
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
          title: 'Temel Fiiller · Part 2',
          titleTranslated: 'Феълҳои асосӣ · Қисми 2',
          type: 'vocab',
          emoji: '📖',
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

    // ── Модул 9: Харидорӣ ─────────────────────────────────────────────
    {
      title: 'Shopping',
      titleTranslated: 'Харидорӣ',
      emoji: '🛍️',
      lessons: [
        {
          title: 'Alışveriş · Part 1',
          titleTranslated: 'Харидорӣ · Қисми 1',
          type: 'vocab',
          emoji: '🛒',
          words: [
            { w: 'Almak', t: 'Харидан / Гирифтан', e: '🛍️', ipa: '/al.mak/', ex: 'Elma alıyorum.', exT: 'Себ мехарам.' },
            { w: 'Satmak', t: 'Фурӯхтан', e: '💰', ipa: '/sat.mak/', ex: 'Araba satıyorum.', exT: 'Мошин мефурӯшам.' },
            { w: 'Fiyat', t: 'Нарх / Баҳо', e: '🏷️', ipa: '/fi.jat/', ex: 'Fiyatı ne kadar?', exT: 'Нарх чанд?' },
            { w: 'Pahalı', t: 'Гарон', e: '💸', ipa: '/pa.ha.lɯ/', ex: 'Çok pahalı.', exT: 'Хеле гарон аст.' },
            { w: 'Ucuz', t: 'Арзон', e: '✅', ipa: '/u.dʒuz/', ex: 'Çok ucuz.', exT: 'Хеле арзон аст.' },
            { w: 'Para', t: 'Пул', e: '💵', ipa: '/pa.ra/', ex: 'Param yok.', exT: 'Пул надорам.' },
            { w: 'Kaç lira', t: 'Чанд лира', e: '❓', ipa: '/katʃ li.ra/', ex: 'Bu kaç lira?', exT: 'Ин чанд лира?' },
            { w: 'İndirim', t: 'Тахфиф', e: '🏷️', ipa: '/in.di.rim/', ex: 'İndirim var mı?', exT: 'Тахфиф ҳаст?' },
          ],
        },
        {
          title: 'Kıyafetler (Clothes)',
          titleTranslated: 'Либос',
          type: 'vocab',
          emoji: '👗',
          words: [
            { w: 'Gömlek', t: 'Кӯйлак', e: '👕', ipa: '/ɡøm.lek/', ex: 'Beyaz gömlek.', exT: 'Кӯйлаки сафед.' },
            { w: 'Pantolon', t: 'Шим', e: '👖', ipa: '/pan.to.lon/', ex: 'Siyah pantolon.', exT: 'Шими сиёҳ.' },
            { w: 'Elbise', t: 'Либос / Кӯйлак', e: '👗', ipa: '/el.bi.se/', ex: 'Güzel elbise.', exT: 'Либоси зебо.' },
            { w: 'Ayakkabı', t: 'Пойафзол', e: '👟', ipa: '/a.jak.ka.bɯ/', ex: 'Yeni ayakkabı.', exT: 'Пойафзоли нав.' },
            { w: 'Çanta', t: 'Сумка / Халта', e: '👜', ipa: '/tʃan.ta/', ex: 'Deri çanta.', exT: 'Сумкаи чарм.' },
            { w: 'Ceket', t: 'Ҷакет / Пальто', e: '🧥', ipa: '/dʒe.ket/', ex: 'Siyah ceket.', exT: 'Ҷакети сиёҳ.' },
            { w: 'Beden', t: 'Андоза', e: '📏', ipa: '/be.den/', ex: 'Bedenim ne?', exT: 'Андозаи ман чист?' },
            { w: 'Deneyebilir miyim', t: 'Пӯшиб кӯрасам бӯладими', e: '🔄', ipa: '/de.ne.je.bi.lir mi.jim/', ex: 'Deneyebilir miyim?', exT: 'Пӯшиб кӯрасам бӯладими?' },
          ],
        },
      ],
    },

    // ── Модул 10: Гуфтугӯ — Саволу ҷавоб ───────────────────────────
    {
      title: 'Conversations',
      titleTranslated: 'Гуфтугӯ',
      emoji: '💬',
      lessons: [
        {
          title: 'Soru Kelimeleri (Question Words)',
          titleTranslated: 'Калимаҳои савол',
          type: 'vocab',
          emoji: '❓',
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
          title: 'Günlük İfadeler (Daily Phrases)',
          titleTranslated: 'Ибораҳои ҳаррӯза',
          type: 'vocab',
          emoji: '🗣️',
          words: [
            { w: 'Evet', t: 'Бале / Ҳа', e: '✅', ipa: '/e.vet/', ex: 'Evet, anlıyorum.', exT: 'Бале, мефаҳмам.' },
            { w: 'Hayır', t: 'Не / Не-хайр', e: '❌', ipa: '/ha.jɯr/', ex: 'Hayır, teşekkürler.', exT: 'Не, ташаккур.' },
            { w: 'Tamam', t: 'Хуб / Мувофиқ', e: '👌', ipa: '/ta.mam/', ex: 'Tamam, anlaştık.', exT: 'Хуб, розӣ шудем.' },
            { w: 'Lütfen', t: 'Марҳамат / Илтимос', e: '🙏', ipa: '/lyt.fen/', ex: 'Lütfen yardım et.', exT: 'Илтимос кӯмак кун.' },
            { w: 'Özür dilerim', t: 'Маафаш кунед', e: '😔', ipa: '/ø.zyr di.le.rim/', ex: 'Özür dilerim, geç kaldım.', exT: 'Маафаш кунед, дер мондам.' },
            { w: 'Anlamadım', t: 'Нафаҳмидам', e: '🤷', ipa: '/an.la.ma.dɯm/', ex: 'Anlamadım, tekrar eder misiniz?', exT: 'Нафаҳмидам, такрор мекунед?' },
            { w: 'Türkçe bilmiyorum', t: 'Туркӣ намедонам', e: '😅', ipa: '/tyrk.tʃe bil.mi.jo.rum/', ex: 'Türkçe bilmiyorum, İngilizce?', exT: 'Туркӣ намедонам, Инглисӣ?' },
            { w: 'Yardım eder misiniz', t: 'Кӯмак карда метавонед', e: '🆘', ipa: '/jar.dɯm e.der mi.si.niz/', ex: 'Yardım eder misiniz lütfen?', exT: 'Илтимос кӯмак карда метавонед?' },
          ],
        },
      ],
    },
  ],

  // ── Грамматикаи A1 ─────────────────────────────────────────────────
  grammarTopics: [
    {
      title: 'Türkçede Fiil Çekimi — Geniş Zaman',
      titleTranslated: 'Зами ҳозираи пайваста (-iyor)',
      emoji: '⚡',
      explanation: `## Замони ҳозираи пайваста (-iyor)
Дар забони туркӣ барои нишон додани корҳое ки ҳозир анҷом меёбанд, пасванди **-iyor** истифода мешавад.

**Сохтор:** Феъл + -iyor + ҷонишин

| Феъл | Банд | Маъно |
|------|------|-------|
| gitmek (рафтан) | gidiyorum | ман мераввам |
| gelmek (омадан) | geliyorum | ман меоям |
| yemek (хӯрдан) | yiyorum | ман мехӯрам |

**Мисол:** Ben okula **gidiyorum**. — Ман ба мактаб мераввам.`,
      examples: [
        { sentence: 'Ben okula gidiyorum.', translation: 'Ман ба мактаб мераввам.', highlight: 'gidiyorum' },
        { sentence: 'Sen ne yiyorsun?', translation: 'Ту чӣ мехӯрӣ?', highlight: 'yiyorsun' },
        { sentence: 'O çay içiyor.', translation: 'Ӯ чой менӯшад.', highlight: 'içiyor' },
        { sentence: 'Biz Türkçe öğreniyoruz.', translation: 'Мо туркӣ меомӯзем.', highlight: 'öğreniyoruz' },
      ],
      rules: [
        { pattern: 'gitmek → gidi + yor + um = gidiyorum', note: 'Пасванди -iyor баъд аз реша мепайвандад. Агар охири реша садонок бошад, -y- миёнравӣ мекунад.' },
        { pattern: 'Ben → -yorum / -orum / -üyorum / -uyorum', note: 'Чор шакли аввалшахс вобаста ба қонуни сохтори овозии туркӣ (vowel harmony) ивазмешавад.' },
      ],
      exercises: [
        { type: 'fill_blank', prompt: 'Ben eve ___ (gitmek).', promptTranslated: 'Ман ба хона ___', answer: 'gidiyorum', explanation: 'Феъли gitmek дар замони ҳозира барои "ben" = gidiyorum.' },
        { type: 'choose', prompt: 'O çay ___', promptTranslated: 'Ӯ чой ___', answer: 'içiyor', options: ['içiyor', 'içiyorum', 'içiyoruz', 'içiyorsun'], explanation: 'O (вай) — шахси сеюм, феъл без пасванди шахс: içiyor.' },
        { type: 'fill_blank', prompt: 'Biz Türkçe ___ (öğrenmek).', promptTranslated: 'Мо туркӣ ___', answer: 'öğreniyoruz', explanation: '"Biz" — мо, пасванд -iz мешавад: öğreniyoruz.' },
      ],
    },
    {
      title: 'Türkçede Soru Cümlesi',
      titleTranslated: 'Ҷумлаи савол дар забони туркӣ',
      emoji: '❓',
      explanation: `## Ҷумлаи савол дар забони туркӣ
Дар туркӣ барои савол кардан **-mi / -mı / -mu / -mü** (mi-particle) ба охири феъл мепайвандад.

**Сохтор:** Ҷумла + мы?

**Мисолҳо:**
- Türksün. (Ту туркӣ ҳастӣ.) → Türk **müsün**? (Оё ту туркӣ ҳастӣ?)
- Geliyor. (Меояд.) → Geliyor **mu**? (Оё меояд?)`,
      examples: [
        { sentence: 'Türkçe biliyor musun?', translation: 'Оё туркӣ медонӣ?', highlight: 'musun' },
        { sentence: 'Eve geliyor musunuz?', translation: 'Оё ба хона меоед?', highlight: 'musunuz' },
        { sentence: 'Çay içiyor mu?', translation: 'Оё чой менӯшад?', highlight: 'mu' },
      ],
      rules: [
        { pattern: 'Феъл + mu/mü/mı/mi + шахс?', note: 'Қонуни сохтори овозии туркӣ: баъд аз "o, u" → mu; баъд аз "ö, ü" → mü; баъд аз "a, ı" → mı; баъд аз "e, i" → mi.' },
      ],
      exercises: [
        { type: 'choose', prompt: 'Türkçe biliyor ___?', promptTranslated: 'Оё туркӣ медонӣ?', answer: 'musun', options: ['musun', 'misin', 'mısın', 'müsün'], explanation: '"biliyor" охираш "o" дорад → "mu" + "sun" = musun.' },
      ],
    },
    {
      title: 'Türkçede "var" ve "yok" — To Have',
      titleTranslated: '"Вор" ва "Йок" — Доштан ва Надоштан',
      emoji: '✅',
      explanation: `## "Var" ва "Yok" — доштан ва надоштан
Дар туркӣ барои нишон додани мавҷудият **var** (ҳаст/дорам) ва **yok** (нест/надорам) истифода мешавад.

**Сохтор:** [Чиз] + var/yok.

- Param **var**. — Пул дорам.
- Param **yok**. — Пул надорам.
- Vaktim **var**. — Вақт дорам.`,
      examples: [
        { sentence: 'Param var.', translation: 'Пул дорам.', highlight: 'var' },
        { sentence: 'Zamanım yok.', translation: 'Вақт надорам.', highlight: 'yok' },
        { sentence: 'Bir kardeşim var.', translation: 'Як бродари дорам.', highlight: 'var' },
        { sentence: 'Arabam yok.', translation: 'Мошин надорам.', highlight: 'yok' },
      ],
      rules: [
        { pattern: '[Чиз + пасванди соҳибӣ] + var/yok', note: 'Барои "ман": -im/-ım/-üm/-um; барои "ту": -in/-ın/-ün/-un ба охири исм мепайвандад.' },
      ],
      exercises: [
        { type: 'fill_blank', prompt: 'Param ___ (мул надорам).', promptTranslated: 'Пул надорам.', answer: 'yok', explanation: '"Надорам" = yok дар туркӣ.' },
        { type: 'choose', prompt: 'Bir kardeşim ___ (ман як бродар дорам).', promptTranslated: 'Ман як бродар дорам.', answer: 'var', options: ['var', 'yok', 'değil', 'ama'], explanation: '"Дорам" = var дар туркӣ.' },
      ],
    },
  ],

  // ── Диалогҳои A1 ─────────────────────────────────────────────────
  dialogues: [
    {
      title: 'İlk Tanışma — Аввалин шинос шудан',
      titleTranslated: 'Аввалин вохӯрӣ',
      emoji: '🤝',
      scenario: 'Ду нафар дар мактаб якдигарро мешиносанд.',
      lines: [
        { speaker: 'Rustam', text: 'Merhaba! Ben Rustam.', translation: 'Салом! Ман Рустамам.', isUser: true },
        { speaker: 'Ayşe', text: 'Merhaba! Ben Ayşe. Memnun oldum.', translation: 'Салом! Ман Айшеам. Хурсанд шудам.' },
        { speaker: 'Rustam', text: 'Ben de memnun oldum. Nerelisin?', translation: 'Ман ҳам хурсанд шудам. Аз куҷоӣ?', isUser: true },
        { speaker: 'Ayşe', text: 'İstanbulluyum. Sen?', translation: 'Ман Истанбулӣ ҳастам. Ту-чӣ?' },
        { speaker: 'Rustam', text: 'Ben Tacikistanlıyım. Tacik\'im.', translation: 'Ман Тоҷикистонӣ ҳастам. Тоҷикам.', isUser: true },
        { speaker: 'Ayşe', text: 'Harika! Türkçen çok iyi.', translation: 'Аҷоиб! Туркии ту хеле хуб аст.' },
        { speaker: 'Rustam', text: 'Teşekkürler! Öğreniyorum.', translation: 'Ташаккур! Дорам меомӯзам.', isUser: true },
      ],
    },
    {
      title: 'Kafede — Дар кафе',
      titleTranslated: 'Дар кафе',
      emoji: '☕',
      scenario: 'Муштарӣ дар кафе фармоиш медиҳад.',
      lines: [
        { speaker: 'Garson', text: 'Buyurun, ne alırsınız?', translation: 'Марҳамат, чӣ мехоҳед?' },
        { speaker: 'Müşteri', text: 'Bir çay lütfen.', translation: 'Як чой илтимос.', isUser: true },
        { speaker: 'Garson', text: 'Tabii. Başka bir şey?', translation: 'Албатта. Дигар чизе?' },
        { speaker: 'Müşteri', text: 'Bir de simit, lütfen.', translation: 'Як дона ҳам симит илтимос.', isUser: true },
        { speaker: 'Garson', text: 'Tamam, hemen getiriyorum.', translation: 'Хуб, ҳозир меорам.' },
        { speaker: 'Müşteri', text: 'Ne kadar?', translation: 'Чанд?', isUser: true },
        { speaker: 'Garson', text: 'Elli lira oldu.', translation: 'Панҷоҳ лира шуд.' },
        { speaker: 'Müşteri', text: 'Buyrun. Teşekkürler!', translation: 'Мегиред. Ташаккур!', isUser: true },
      ],
    },
    {
      title: 'Yol Tarifi — Йӯл нишон додан',
      titleTranslated: 'Роҳ пурсидан',
      emoji: '🗺️',
      scenario: 'Туристе дар кӯча роҳ мепурсад.',
      lines: [
        { speaker: 'Turist', text: 'Özür dilerim, hastane nerede?', translation: 'Маафаш кунед, беморхона куҷост?', isUser: true },
        { speaker: 'Yerli', text: 'Düz gidin, sonra sola dönün.', translation: 'Рост равед, баъд ба чап гардед.' },
        { speaker: 'Turist', text: 'Uzak mı?', translation: 'Дур аст?', isUser: true },
        { speaker: 'Yerli', text: 'Hayır, beş dakika yürüyüş.', translation: 'Не, панҷ дақиқа пиёдагардӣ.' },
        { speaker: 'Turist', text: 'Teşekkür ederim!', translation: 'Ташаккур!', isUser: true },
        { speaker: 'Yerli', text: 'Rica ederim, iyi günler!', translation: 'Хоҳиш мекунам, рӯзи нек!' },
      ],
    },
  ],

  // ── Маҷмӯаи ибораҳо ─────────────────────────────────────────────
  phraseCollections: [
    {
      category: 'greetings',
      title: 'Selamlama ve Vedalaşma',
      titleTranslated: 'Саломпурсӣ ва хайрбодӣ',
      emoji: '👋',
      phrases: [
        { text: 'Merhaba, nasılsınız?', translation: 'Салом, чӣ ҳол?', note: 'Расмӣ (formal)' },
        { text: 'İyi günler dilerim.', translation: 'Рӯзи нек орзу мекунам.', note: 'Хайрбодии расмӣ' },
        { text: 'Görüşmek üzere!', translation: 'То дидор!', note: 'Ҳаррӯзаи ғайрирасмӣ' },
        { text: 'Kendinize iyi bakın!', translation: 'Худро нигоҳ доред!', note: 'Гарму самимӣ' },
        { text: 'Çok memnun oldum.', translation: 'Хеле хурсанд шудам.', note: 'Баъд аз шиносоӣ' },
      ],
    },
    {
      category: 'travel',
      title: 'Seyahatte Kullanılan İfadeler',
      titleTranslated: 'Ибораҳои сафар',
      emoji: '✈️',
      phrases: [
        { text: 'Bilet almak istiyorum.', translation: 'Чипта харидан мехоҳам.', note: 'Дар нӯқтаи фурӯши чиптаҳо' },
        { text: 'Otel nerede?', translation: 'Меҳмонхона куҷост?', note: 'Вақти пурсидани самт' },
        { text: 'Taşkent\'e gitmek istiyorum.', translation: 'Ба Тошканд рафтан мехоҳам.', literal: 'Тошканд-га кетмоқчиман' },
        { text: 'Bagajım kayboldu.', translation: 'Чамадонам гум шуд.' },
        { text: 'Yardım edin lütfen!', translation: 'Кӯмак кунед илтимос!', note: 'Фавқулодда' },
      ],
    },
    {
      category: 'emergency',
      title: 'Acil Durum İfadeleri',
      titleTranslated: 'Ибораҳои фавқулодда',
      emoji: '🆘',
      phrases: [
        { text: 'İmdat! Yardım!', translation: 'Кӯмак! Ёрӣ!', note: 'Хатари фавқулодда' },
        { text: 'Ambulans çağırın!', translation: 'Амбуланс хонед!' },
        { text: 'Polis istiyorum.', translation: 'Полис мехоҳам.' },
        { text: 'Kayboldum.', translation: 'Гум шудам.', note: 'Вақти гум шудан' },
        { text: 'Türkçe bilmiyorum.', translation: 'Туркӣ намедонам.', note: 'Барои тавзеҳ' },
      ],
    },
  ],

  // ── Саволҳои ҷойгузинӣ (Placement Test A1) ──────────────────────
  placementQuestions: [
    { cefrLevel: 'A1', skill: 'vocab', prompt: 'Türkçede "Günaydın" ne anlama gelir?', promptTranslated: '"Günaydın" ба тоҷикӣ чӣ маъно дорад?', options: ['Шаб ба хайр', 'Субҳ ба хайр', 'Хайр', 'Хуш омадед'], answer: 'Субҳ ба хайр', explanation: '"Günaydın" — субҳ ба хайр. Günay = рӯзи нек, dın = овоз.' },
    { cefrLevel: 'A1', skill: 'vocab', prompt: '"Bir, iki, üç" — bu sayılar hangi sıradadir?', promptTranslated: '"Бир, ики, üч" — ин рақамҳо кадом тартиб аст?', options: ['1, 2, 3', '2, 3, 4', '1, 3, 5', '3, 2, 1'], answer: '1, 2, 3', explanation: 'Bir=1, iki=2, üç=3.' },
    { cefrLevel: 'A1', skill: 'grammar', prompt: 'Boşluğu doldurun: Ben okula ___ (gitmek, geniş zaman).', promptTranslated: 'Ҷойи холиро пур кунед: Ман ба мактаб ___', options: ['gidiyor', 'gidiyorum', 'gidiyorsun', 'gidiyoruz'], answer: 'gidiyorum', explanation: 'Барои "Ben" (ман) феъл пасванди -orum/-um/yorum мегирад.' },
    { cefrLevel: 'A1', skill: 'vocab', prompt: 'Ailede "anne" kime denir?', promptTranslated: 'Дар оила "anne" ба кӣ гуфта мешавад?', options: ['Падар', 'Модар', 'Хоҳар', 'Бародар'], answer: 'Модар', explanation: '"Anne" = модар.' },
    { cefrLevel: 'A1', skill: 'grammar', prompt: '"Var" ve "Yok" ne anlama gelir?', promptTranslated: '"Var" ва "Yok" чӣ маъно доранд?', options: ['Бале / Не', 'Дорам / Надорам', 'Меоям / Мераввам', 'Калон / Хурд'], answer: 'Дорам / Надорам', explanation: '"Var" = ҳаст/дорам, "Yok" = нест/надорам.' },
    { cefrLevel: 'A1', skill: 'vocab', prompt: 'Türkçede "kırmızı" hangi renk?', promptTranslated: 'Дар туркӣ "kırmızı" кадом ранг аст?', options: ['Кабуд', 'Сурх', 'Сабз', 'Зард'], answer: 'Сурх', explanation: '"Kırmızı" = сурх.' },
    { cefrLevel: 'A1', skill: 'grammar', prompt: 'Soru eki hangisi doğru? "Türkçe biliyor ___?"', promptTranslated: 'Пасванди савол кадом дуруст аст?', options: ['mı', 'mu', 'musun', 'misin'], answer: 'musun', explanation: '"Biliyor musun?" — барои ту (sen). "O/u" пас аз "biliyor" → "mu" + "sun" = musun.' },
    { cefrLevel: 'A1', skill: 'vocab', prompt: '"Bugün" ne demek?', promptTranslated: '"Bugün" чӣ маъно дорад?', options: ['Дирӯз', 'Фардо', 'Имрӯз', 'Ҳафта'], answer: 'Имрӯз', explanation: '"Bugün" = имрӯз.' },
    { cefrLevel: 'A1', skill: 'vocab', prompt: 'Türkçede içecek olarak "çay" nedir?', promptTranslated: '"Çay" дар туркӣ чист?', options: ['Қаҳва', 'Шир', 'Чой', 'Об'], answer: 'Чой', explanation: '"Çay" = чой.' },
    { cefrLevel: 'A1', skill: 'grammar', prompt: '"Anlamadım" ne anlama gelir?', promptTranslated: '"Anlamadım" чӣ маъно дорад?', options: ['Нафаҳмидам', 'Рафтам', 'Хондам', 'Гӯш кардам'], answer: 'Нафаҳмидам', explanation: '"Anlamadım" = нафаҳмидам (anla- = фаҳмидан, -madım = нафаҳмидам).' },
  ],
};

/**
 * POST /api/admin/seed-turkish
 * Seeds a complete Turkish A1 course (target=Turkish, native=Tajik).
 * Safe to re-run: deletes existing content for this pair+level before inserting.
 */
export async function POST() {
  try {
    // 1. Забонҳо — upsert
    const [trLang, tgLang] = await Promise.all([
      prisma.language.upsert({
        where: { code: 'tr' },
        create: {
          code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷',
          canBeNative: false, canBeTarget: true,
          badge: 'LIVE', learnerCount: '88M', order: 6, isActive: true,
          ttsLocale: 'tr-TR', sttLocale: 'tr-TR', direction: 'ltr', hasIPA: true,
        },
        update: { badge: 'LIVE', isActive: true, ttsLocale: 'tr-TR', sttLocale: 'tr-TR' },
      }),
      prisma.language.upsert({
        where: { code: 'tg' },
        create: {
          code: 'tg', name: 'Tajik', nativeName: 'Тоҷикӣ', flag: '🇹🇯',
          canBeNative: true, canBeTarget: false,
          badge: null, learnerCount: '8.2M', order: 1, isActive: true,
          ttsLocale: 'tg-TJ', sttLocale: 'tg-TJ', direction: 'ltr', hasIPA: false,
        },
        update: { canBeNative: true, isActive: true },
      }),
    ]);

    // 2. Курси мавҷударо нест кун (cascade)
    await prisma.course.deleteMany({
      where: { targetLanguageId: trLang.id, nativeLanguageId: tgLang.id, level: 'A1' },
    });

    // 3. Курс эҷод кун
    const course = await prisma.course.create({
      data: {
        targetLanguageId: trLang.id,
        nativeLanguageId: tgLang.id,
        level: TR_A1.level,
        title: TR_A1.title,
        description: TR_A1.description,
        emoji: TR_A1.emoji,
        color: TR_A1.color,
        order: 0,
        isActive: true,
      },
    });

    let modules = 0, lessons = 0, words = 0;

    // 4. Модулҳо → Дарсҳо → Калимаҳо
    for (let mi = 0; mi < TR_A1.modules.length; mi++) {
      const m = TR_A1.modules[mi];
      const mod = await prisma.module.create({
        data: {
          courseId: course.id,
          title: m.title,
          titleTranslated: m.titleTranslated,
          emoji: m.emoji,
          color: TR_A1.color,
          order: mi,
          isPremium: mi >= 5,
          isActive: true,
        },
      });
      modules++;

      for (let li = 0; li < m.lessons.length; li++) {
        const l = m.lessons[li];
        const lesson = await prisma.lesson.create({
          data: {
            moduleId: mod.id,
            title: l.title,
            titleTranslated: l.titleTranslated,
            type: l.type,
            emoji: l.emoji,
            cefrLevel: 'A1',
            skillType: 'vocab',
            xpReward: 60,
            duration: 5,
            order: li,
            isPremium: mi >= 5,
            isActive: true,
          },
        });
        lessons++;

        await prisma.word.createMany({
          data: l.words.map((w: any, wi: number) => ({
            lessonId: lesson.id,
            word: w.w,
            translation: w.t,
            emoji: w.e ?? null,
            ipa: w.ipa ?? null,
            example: w.ex ?? null,
            exampleTrans: w.exT ?? null,
            difficulty: 1,
            frequencyRank: mi * 100 + li * 10 + wi,
            order: wi,
          })),
        });
        words += l.words.length;
      }
    }

    // 5. Грамматика
    let grammarTopics = 0;
    for (let gi = 0; gi < TR_A1.grammarTopics.length; gi++) {
      const gt = TR_A1.grammarTopics[gi];
      const topic = await prisma.grammarTopic.create({
        data: {
          courseId: course.id,
          cefrLevel: 'A1',
          title: gt.title,
          titleTranslated: gt.titleTranslated,
          explanation: gt.explanation,
          emoji: gt.emoji,
          order: gi,
          isPremium: false,
          isActive: true,
        },
      });
      grammarTopics++;

      if (gt.examples?.length) {
        await prisma.grammarExample.createMany({
          data: gt.examples.map((ex: any, i: number) => ({
            topicId: topic.id,
            sentence: ex.sentence,
            translation: ex.translation,
            highlight: ex.highlight ?? null,
            order: i,
          })),
        });
      }
      if (gt.rules?.length) {
        await prisma.grammarRule.createMany({
          data: gt.rules.map((r: any, i: number) => ({
            topicId: topic.id,
            pattern: r.pattern,
            note: r.note ?? null,
            order: i,
          })),
        });
      }
      if (gt.exercises?.length) {
        await prisma.grammarExercise.createMany({
          data: gt.exercises.map((ex: any, i: number) => ({
            topicId: topic.id,
            type: ex.type,
            prompt: ex.prompt,
            promptTranslated: ex.promptTranslated ?? null,
            answer: ex.answer,
            options: ex.options ?? null,
            explanation: ex.explanation ?? null,
            order: i,
          })),
        });
      }
    }

    // 6. Диалогҳо
    let dialoguesCount = 0;
    for (let di = 0; di < TR_A1.dialogues.length; di++) {
      const d = TR_A1.dialogues[di];
      const dialogue = await prisma.dialogue.create({
        data: {
          courseId: course.id,
          cefrLevel: 'A1',
          title: d.title,
          titleTranslated: d.titleTranslated,
          scenario: d.scenario,
          emoji: d.emoji,
          order: di,
          isPremium: false,
          isActive: true,
        },
      });
      dialoguesCount++;

      await prisma.dialogueLine.createMany({
        data: d.lines.map((line: any, i: number) => ({
          dialogueId: dialogue.id,
          speaker: line.speaker,
          text: line.text,
          translation: line.translation,
          isUser: line.isUser ?? false,
          order: i,
        })),
      });
    }

    // 7. Маҷмӯаи ибораҳо
    let phraseCollections = 0;
    for (let pi = 0; pi < TR_A1.phraseCollections.length; pi++) {
      const pc = TR_A1.phraseCollections[pi];
      const collection = await prisma.phraseCollection.create({
        data: {
          courseId: course.id,
          cefrLevel: 'A1',
          category: pc.category,
          title: pc.title,
          titleTranslated: pc.titleTranslated,
          emoji: pc.emoji,
          order: pi,
          isPremium: false,
          isActive: true,
        },
      });
      phraseCollections++;

      await prisma.phrase.createMany({
        data: pc.phrases.map((ph: any, i: number) => ({
          collectionId: collection.id,
          text: ph.text,
          translation: ph.translation,
          literal: ph.literal ?? null,
          note: ph.note ?? null,
          order: i,
        })),
      });
    }

    // 8. Саволҳои ҷойгузинӣ (placement test A1)
    for (const pq of TR_A1.placementQuestions) {
      await prisma.placementQuestion.create({
        data: {
          targetLanguageId: trLang.id,
          nativeLanguageId: tgLang.id,
          cefrLevel: pq.cefrLevel,
          skill: pq.skill,
          prompt: pq.prompt,
          promptTranslated: pq.promptTranslated,
          options: pq.options,
          answer: pq.answer,
          explanation: pq.explanation,
          isActive: true,
        },
      });
    }

    // 9. CEFR A1 descriptor (can-do statement)
    const existingDescriptor = await prisma.cefrDescriptor.findFirst({
      where: { targetLanguageId: trLang.id, nativeLanguageId: tgLang.id, cefrLevel: 'A1', skill: 'overall' },
    });
    if (!existingDescriptor) {
      await prisma.cefrDescriptor.create({
        data: {
          targetLanguageId: trLang.id,
          nativeLanguageId: tgLang.id,
          cefrLevel: 'A1',
          skill: 'overall',
          canDo: 'Ман метавонам ибораҳои аввалин ва ибораҳои хеле оддиро дар бораи одамон ва ҷойҳо дарк кунам ва истифода барам. Метавонам худамро муаррифӣ кунам, саволҳои оддӣ бипурсам ва ба онҳо ҷавоб диҳам.',
          order: 0,
        },
      });
    }

    return NextResponse.json({
      success: true,
      language: 'Turkish (tr) → Tajik (tg)',
      level: 'A1',
      course: course.id,
      modules,
      lessons,
      words,
      grammarTopics,
      dialogues: dialoguesCount,
      phraseCollections,
      placementQuestions: TR_A1.placementQuestions.length,
    });
  } catch (err: any) {
    console.error('[seed-turkish]', err);
    return NextResponse.json({ error: err?.message ?? 'Seed Turkish A1 failed' }, { status: 500 });
  }
}
