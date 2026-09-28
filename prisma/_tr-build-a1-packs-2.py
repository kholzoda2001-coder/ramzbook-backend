"""ТУРКӢ → тоҷикӣ, «Гуфтор» A1: роҳи «Сохтмон» — вазъиятҳои 11–20 (28.09.2026).

Идомаи `_tr-build-a1-packs.py` (қоидаҳо — `_tr_packs_lib.py`). Транскрипсия баъд:
`node prisma/_tr-fill-literal.mjs <slugs>`.

Аз ҷузвдони backend: python prisma/_tr-build-a1-packs-2.py
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _tr_packs_lib import *  # noqa: F401,F403

made = []
B = ["build"]

# ═════════════════════ 11. Мушкил дар кор ═════════════════════
made.append(pack("problem_tr_tg", "İşte sorunlar", "Мушкил дар кор", "⚠️", 11, B,
    "Чизе вайрон шуд, гум шуд ё шумо дер мондед. Мегӯед, ки чӣ шуд, узр мепурсед ва "
    "ба усто занг мезанед, ки имрӯз омада наметавонед.",
    [
        ("Мушкил", [
            w("Sorun", "мушкил", None),
            w("Bozuk", "вайрон", None),
            w("Elektrik", "барқ", None),
            w("Geç", "дер", None),
            w("Anahtar", "калид", None),
            w("Hasta", "бемор", None),
        ]),
        ("Чӣ шуд?", [
            t("Ne oldu?", "Чӣ шуд?", "Бигӯ: барқ нест", "Elektrik yok.", "Барқ нест.", ["Elektrik gitti."]),
            t("Matkap bozuk mu?", "Парма вайрон аст?", "Бигӯ: ҳа", "Evet.", "Ҳа.", ["Evet, bozuk."]),
            t("Neden geç kaldın?", "Чаро дер мондӣ?", "Бигӯ: автобус дер монд", "Otobüs geç kaldı.",
              "Автобус дер монд.", ["Otobüs gelmedi."]),
        ]),
        ("Суханҳои кӯтоҳ", [
            s("Özür dilerim", "Мебахшед (узр мехоҳам)", None),
            s("Geç kaldım", "Дер мондам", None),
            w("Kaybettim", "гум кардам", None),
            w("Bozuldu", "вайрон шуд", None),
            s("Su yok", "Об нест", None),
            w("Bilmiyorum", "намедонам", None),
        ]),
        ("Кулоҳ гум шуд", [
            t("Baretin nerede?", "Кулоҳат куҷост?", "Бигӯ: гум кардам", "Kaybettim.", "Гум кардам.",
              ["Baretimi kaybettim."]),
            t("Nasıl kaybettin?", "Чӣ хел гум кардӣ?", "Бигӯ: намедонам", "Bilmiyorum.", "Намедонам.", []),
            t("Depodan yenisini al.", "Аз анбор навашро гир.", "Бигӯ: ташаккур, усто", "Teşekkürler, usta.",
              "Ташаккур, усто.", ["Tamam, usta."]),
        ]),
        ("Чӣ вайрон шуд", [
            s("Özür dilerim, geç kaldım.", "Мебахшед, дер мондам.", None),
            s("Matkap bozuldu.", "Парма вайрон шуд.", None),
            s("Elektrik gitti.", "Барқ рафт.", None),
            s("Kablo koptu.", "Сим канда шуд.", None),
            s("Anahtarı kaybettim.", "Калидро гум кардам.", None),
            s("Şimdi ne yapayım?", "Ҳоло чӣ кор кунам?", None),
        ]),
        ("Муколама: парма", [
            t("Neden çalışmıyorsun?", "Чаро кор намекунӣ?", "Бигӯ: парма вайрон шуд", "Matkap bozuldu.",
              "Парма вайрон шуд.", ["Matkap bozuk."]),
            t("Kablo mu?", "Сим?", "Бигӯ: ҳа, сим канда шуд", "Evet, kablo koptu.", "Ҳа, сим канда шуд.",
              ["Evet."]),
            t("Tamam, elektrikçiyi çağırıyorum.", "Хуб, барқчиро ҷеғ мезанам.", "Бипурс: ҳоло чӣ кор кунам?",
              "Şimdi ne yapayım?", "Ҳоло чӣ кор кунам?", []),
        ]),
        ("Дер мемонам", [
            s("Bugün hastayım.", "Имрӯз беморам.", None),
            s("Gelemiyorum.", "Омада наметавонам.", None),
            s("Yarın gelirim.", "Фардо меоям.", None),
            s("Otobüs gelmedi.", "Автобус наомад.", None),
            s("Yirmi dakika geç kalacağım.", "Бист дақиқа дер мемонам.", None),
            s("Kusura bakmayın.", "Бубахшед (айб накунед).", None),
        ]),
        ("Муколама: дар роҳ", [
            t("Alo? Neredesin?", "Алло? Куҷоӣ?", "Бигӯ: автобус наомад", "Otobüs gelmedi.", "Автобус наомад.", []),
            t("Ne zaman gelirsin?", "Кай меоӣ?", "Бигӯ: бист дақиқа дер мемонам", "Yirmi dakika geç kalacağım.",
              "Бист дақиқа дер мемонам.", ["Yirmi dakika sonra."]),
            t("Tamam, çabuk gel.", "Хуб, зуд биё.", "Бигӯ: мебахшед", "Özür dilerim.", "Мебахшед.",
              ["Kusura bakmayın."]),
        ]),
        ("Миссия: занг — беморам", [
            t("Alo? Buyurun.", "Алло? Марҳамат.", "Салом гӯй ва бигӯ, ки беморӣ", "Merhaba usta, hastayım.",
              "Салом усто, беморам.", ["Usta, bugün hastayım."]),
            t("Geçmiş olsun. Neyin var?", "Шифо ёбӣ. Чӣ шудааст?", "Бигӯ: таб дорам", "Ateşim var.", "Таб дорам.",
              ["Çok ateşim var."]),
            t("Bugün gelemez misin?", "Имрӯз омада наметавонӣ?", "Бигӯ: не, омада наметавонам",
              "Hayır, gelemiyorum.", "Не, омада наметавонам.", ["Gelemiyorum."]),
            t("Tamam, dinlen. Yarın gel.", "Хуб, дам гир. Фардо биё.", "Бигӯ: хуб, фардо меоям",
              "Tamam, yarın gelirim.", "Хуб, фардо меоям.", ["Teşekkürler usta."]),
        ]),
    ], mission_mode="call"))

# ═════════════════════ 12. Музд ва вақти кор ═════════════════════
made.append(pack("pay_tr_tg", "Maaş ve mesai", "Музд ва вақти кор", "💵", 12, B,
    "Гап дар бораи пул: музд кай дода мешавад, пешпардохт, кори иловагӣ (fazla mesai) ва "
    "агар пул кам бошад — чӣ гуфтан лозим.",
    [
        ("Пул", [
            w("Maaş", "музд", None),
            w("Avans", "пешпардохт", None),
            w("Mesai", "вақти кор", "«Fazla mesai» — кори иловагӣ (соатҳои зиёдатӣ)."),
            w("Hafta", "ҳафта", None),
            w("Ay", "моҳ", None),
            w("Banka", "бонк", None),
        ]),
        ("Пулро гирифтӣ?", [
            t("Maaşını aldın mı?", "Музди худро гирифтӣ?", "Бигӯ: не", "Hayır.", "Не.", ["Hayır, almadım."]),
            t("Avans lazım mı?", "Пешпардохт лозим?", "Бигӯ: ҳа, лутфан", "Evet, lütfen.", "Ҳа, лутфан.", ["Evet."]),
            t("Banka hesabın var mı?", "Ҳисоби бонкӣ дорӣ?", "Бигӯ: ҳа", "Evet, var.", "Ҳа, дорам.", ["Evet."]),
        ]),
        ("Суханҳои кӯтоҳ", [
            s("Maaş günü", "рӯзи музд", None),
            s("Fazla mesai", "кори иловагӣ", None),
            s("Saat başı", "барои ҳар соат", None),
            w("Haftalık", "ҳафтаина", None),
            w("Aylık", "моҳона", None),
            s("Para eksik", "Пул кам аст", None),
        ]),
        ("Пул кам аст", [
            t("Sorun ne?", "Мушкил чист?", "Бигӯ: пул кам аст", "Para eksik.", "Пул кам аст.", ["Maaşım eksik."]),
            t("Ne kadar eksik?", "Чӣ қадар кам?", "Бигӯ: ду ҳазор лира", "İki bin lira.", "Ду ҳазор лира.", []),
            t("Tamam, bakarım.", "Хуб, мебинам.", "Бигӯ: ташаккур", "Teşekkürler.", "Ташаккур.", []),
        ]),
        ("Саволҳо дар бораи музд", [
            s("Maaş ne zaman?", "Музд кай?", None),
            s("Maaşım eksik.", "Музди ман кам.", None),
            s("Fazla mesai yaptım.", "Кори иловагӣ кардам.", None),
            s("Avans alabilir miyim?", "Пешпардохт гирифта метавонам?", None),
            s("Maaşı bankaya yatırın.", "Муздро ба бонк гузаронед.", None),
            s("Nakit istiyorum.", "Нақд мехоҳам.", None),
        ]),
        ("Муколама: кори иловагӣ", [
            t("Bu ay fazla mesai yaptın mı?", "Ин моҳ кори иловагӣ кардӣ?", "Бигӯ: ҳа, даҳ соат", "Evet, on saat.",
              "Ҳа, даҳ соат.", ["On saat yaptım."]),
            t("Tamam, on saat.", "Хуб, даҳ соат.", "Бипурс: музд кай?", "Maaş ne zaman?", "Музд кай?",
              ["Maaş ne zaman yatar?"]),
            t("Ayın beşinde.", "Панҷуми моҳ.", "Бигӯ: хуб, ташаккур", "Tamam, teşekkürler.", "Хуб, ташаккур.", []),
        ]),
        ("Соат ва суғурта", [
            s("Saat başı ne kadar?", "Барои ҳар соат чанд?", None),
            s("Günde on saat çalışıyorum.", "Дар рӯз даҳ соат кор мекунам.", None),
            s("Pazar günü tatil mi?", "Якшанбе истироҳат аст?", None),
            s("Bordro verir misiniz?", "Варақаи музд медиҳед?", "«Bordro» — варақаи ҳисоби музд."),
            s("Sigortam yatıyor mu?", "Суғуртаам пардохт мешавад?", None),
            s("Hesabı kontrol edelim.", "Ҳисобро санҷем.", None),
        ]),
        ("Муколама: соатҳо", [
            t("Günde kaç saat çalışıyorsun?", "Дар рӯз чанд соат кор мекунӣ?", "Бигӯ: даҳ соат", "On saat.",
              "Даҳ соат.", ["Günde on saat çalışıyorum."]),
            t("Pazar tatil.", "Якшанбе истироҳат.", "Бипурс: суғуртаам пардохт мешавад?", "Sigortam yatıyor mu?",
              "Суғуртаам пардохт мешавад?", []),
            t("Evet, her ay.", "Ҳа, ҳар моҳ.", "Бигӯ: хуб", "Tamam.", "Хуб.", ["Güzel."]),
        ]),
        ("Миссия: музд кам аст", [
            t("Buyurun, sorun ne?", "Марҳамат, мушкил чист?", "Бигӯ: музди ман кам", "Maaşım eksik.",
              "Музди ман кам.", ["Para eksik."]),
            t("Ne kadar eksik?", "Чӣ қадар кам?", "Бигӯ: се ҳазор лира", "Üç bin lira.", "Се ҳазор лира.", []),
            t("Fazla mesai yaptın mı?", "Кори иловагӣ кардӣ?", "Бигӯ: ҳа, понздаҳ соат", "Evet, on beş saat.",
              "Ҳа, понздаҳ соат.", ["Evet."]),
            t("Tamam, hesabı kontrol edelim.", "Хуб, ҳисобро месанҷем.", "Ташаккур гӯй", "Teşekkür ederim.",
              "Ташаккур.", ["Teşekkürler."]),
        ]),
    ]))

# ═════════════════════ 13. Роҳ то кор ═════════════════════
made.append(pack("commute_tr_tg", "İşe yolculuk", "Роҳ то кор", "🚌", 13, B,
    "Ба кор бо servis (автобуси ширкат), автобус, метро ё такси меравед. Мепурсед, ки "
    "кадом автобус, истгоҳ куҷост ва чанд пул мешавад.",
    [
        ("Нақлиёт", [
            w("Otobüs", "автобус", None),
            w("Metro", "метро", None),
            w("Durak", "истгоҳ", None),
            w("Servis", "автобуси корӣ", "Мошини ширкат, ки коргаронро ба объект мебарад."),
            w("Taksi", "такси", None),
            w("Kart", "корт (барои роҳ)", "Дар Истанбул — «İstanbulkart»."),
        ]),
        ("Бо чӣ меоӣ?", [
            t("Servis kaçta geliyor?", "Автобуси корӣ соати чанд меояд?", "Бигӯ: соати ҳафт", "Saat yedide.",
              "Соати ҳафт.", ["Yedide."]),
            t("Metroyla mı geliyorsun?", "Бо метро меоӣ?", "Бигӯ: не, бо автобус", "Hayır, otobüsle.",
              "Не, бо автобус.", ["Otobüsle geliyorum."]),
            t("Kartın var mı?", "Корт дорӣ?", "Бигӯ: ҳа", "Evet, var.", "Ҳа, дорам.", ["Evet."]),
        ]),
        ("Суханҳои кӯтоҳ", [
            s("Hangi otobüs?", "Кадом автобус?", None),
            s("Durak nerede?", "Истгоҳ куҷост?", None),
            s("Burada ineceğim", "Ин ҷо мефароям", None),
            w("Aktarma", "иваз кардан (дар роҳ)", None),
            s("Son durak", "истгоҳи охир", None),
            s("Çok kalabalık", "Хеле серодам", None),
        ]),
        ("Истгоҳ куҷост?", [
            t("Nereye gidiyorsunuz?", "Ба куҷо меравед?", "Бигӯ: ба Эсенюрт", "Esenyurt'a.", "Ба Эсенюрт.",
              ["Esenyurt'a gidiyorum."]),
            t("Otuz dört numara.", "Рақами сиву чор.", "Бипурс: истгоҳ куҷост?", "Durak nerede?", "Истгоҳ куҷост?",
              []),
            t("Karşıda.", "Дар он тараф.", "Бигӯ: ташаккур", "Teşekkürler.", "Ташаккур.", []),
        ]),
        ("Дар автобус", [
            s("Esenyurt'a gider mi?", "Ба Эсенюрт меравад?", "«mi» — ҷузъи савол, ҳамчун калимаи ҷудо ҳисоб мешавад."),
            s("Kartıma para yükledim.", "Ба кортам пул андохтам.", None),
            s("Burada iniyorum.", "Ин ҷо мефароям.", None),
            s("Servisi kaçırdım.", "Автобуси кориро аз даст додам.", None),
            s("Trafik çok yoğun.", "Роҳ хеле серодам.", None),
            s("Kaç durak var?", "Чанд истгоҳ ҳаст?", None),
        ]),
        ("Муколама: автобус", [
            t("Nereye?", "Ба куҷо?", "Бипурс: ин автобус ба Эсенюрт меравад?", "Bu otobüs Esenyurt'a gider mi?",
              "Ин автобус ба Эсенюрт меравад?", ["Esenyurt'a gider mi?"]),
            t("Evet, gider.", "Ҳа, меравад.", "Бипурс: чанд истгоҳ ҳаст?", "Kaç durak var?", "Чанд истгоҳ ҳаст?",
              []),
            t("On durak.", "Даҳ истгоҳ.", "Бигӯ: ташаккур", "Teşekkür ederim.", "Ташаккур.", ["Sağ olun."]),
        ]),
        ("Такси", [
            s("Taksi çağırır mısın?", "Такси ҷеғ мезанӣ?", None),
            s("Şantiyeye gidiyorum.", "Ба объект меравам.", None),
            s("Adres bu.", "Суроға ин.", None),
            s("Burada durun lütfen.", "Лутфан ин ҷо истед.", None),
            s("Ne kadar tutar?", "Чанд пул мешавад?", None),
            s("Yolda kaza var.", "Дар роҳ садама.", None),
        ]),
        ("Муколама: такси", [
            t("Nereye gidiyoruz?", "Ба куҷо меравем?", "Бигӯ: суроға ин", "Adres bu.", "Суроға ин.",
              ["Bu adres."]),
            t("Tamam. Geldik.", "Хуб. Расидем.", "Бигӯ: лутфан ин ҷо истед", "Burada durun lütfen.",
              "Лутфан ин ҷо истед.", ["Burada durun."]),
            t("Yüz elli lira.", "Саду панҷоҳ лира.", "Бигӯ: марҳамат", "Buyurun.", "Марҳамат.",
              ["Buyurun, teşekkürler."]),
        ]),
        ("Миссия: servis рафт", [
            t("Alo, neredesin? Servis gitti.", "Алло, куҷоӣ? Автобуси корӣ рафт.",
              "Бигӯ: автобуси кориро аз даст додам", "Servisi kaçırdım.", "Автобуси кориро аз даст додам.", []),
            t("Otobüsle gel.", "Бо автобус биё.", "Бипурс: кадом автобус?", "Hangi otobüs?", "Кадом автобус?", []),
            t("Yüz kırk iki numara.", "Рақами саду чилу ду.", "Бигӯ: хуб, ҳозир меоям", "Tamam, hemen geliyorum.",
              "Хуб, ҳозир меоям.", ["Tamam."]),
            t("Çabuk ol, iş başladı.", "Зуд шав, кор сар шуд.", "Бигӯ: роҳ хеле серодам", "Trafik çok yoğun.",
              "Роҳ хеле серодам.", ["Yolda kaza var."]),
        ]),
    ]))

# ═════════════════════ 14. Иҷораи хона (умумӣ) ═════════════════════
made.append(pack("rent_tr_tg", "Ev kiralama", "Иҷораи хона", "🏠", 14, [],
    "Хона ё ҳуҷра иҷора мегиред: нарх, гарав (depozito), пули барқу об. Баъд — агар чизе "
    "вайрон шавад, ба соҳибхона занг мезанед.",
    [
        ("Хона", [
            w("Ev", "хона", None),
            w("Oda", "ҳуҷра", None),
            w("Kira", "иҷорапулӣ", None),
            w("Depozito", "гарав", "Пуле, ки пеш аз даромадан медиҳед ва баъд бармегардад."),
            w("Ev sahibi", "соҳибхона", None),
            w("Mutfak", "ошхона (дар хона)", None),
        ]),
        ("Хона меҷӯед?", [
            t("Ev mi arıyorsunuz?", "Хона меҷӯед?", "Бигӯ, ки ҳа", "Evet.", "Ҳа.", ["Evet, ev arıyorum."]),
            t("Kaç kişisiniz?", "Чанд кас ҳастед?", "Бигӯ: се кас", "Üç kişi.", "Се кас.", ["Üç kişiyiz."]),
            t("Eşyalı olsun mu?", "Бо асбоб бошад?", "Бигӯ: ҳа, бо асбоб", "Evet, eşyalı.", "Ҳа, бо асбоб.", ["Eşyalı."]),
        ]),
        ("Суханҳои кӯтоҳ", [
            s("İki oda", "ду ҳуҷра", None),
            s("Aylık kira", "иҷораи моҳона", None),
            s("Faturalar dahil", "пули барқу об дохил", None),
            w("Eşyalı", "бо асбоб", None),
            s("Metroya yakın", "наздики метро", None),
            s("Sıcak su", "оби гарм", None),
        ]),
        ("Нарх", [
            t("Kira on beş bin lira.", "Иҷора понздаҳ ҳазор лира.", "Бипурс: пули барқу об дохил?",
              "Faturalar dahil mi?", "Пули барқу об дохил?", []),
            t("Hayır, dahil değil.", "Не, дохил нест.", "Бигӯ: хеле қимат", "Çok pahalı.", "Хеле қимат.", []),
            t("Ama metroya yakın.", "Вале наздики метро.", "Бигӯ: хуб, фикр мекунам", "Tamam, düşüneyim.",
              "Хуб, фикр кунам.", ["Tamam."]),
        ]),
        ("Саволҳо дар бораи хона", [
            s("Kira ne kadar?", "Иҷора чанд?", None),
            s("Depozito var mı?", "Гарав ҳаст?", None),
            s("Evi görebilir miyim?", "Хонаро дида метавонам?", None),
            s("Kaç oda var?", "Чанд ҳуҷра ҳаст?", None),
            s("Sıcak su var mı?", "Оби гарм ҳаст?", None),
            s("Ne zaman taşınabilirim?", "Кай кӯчида метавонам?", None),
        ]),
        ("Муколама: хонаро мебинем", [
            t("Evi görmek ister misiniz?", "Хонаро дидан мехоҳед?", "Бигӯ: ҳа, лутфан", "Evet, lütfen.",
              "Ҳа, лутфан.", []),
            t("Burası mutfak, burası oda.", "Ин ошхона, ин ҳуҷра.", "Бипурс: оби гарм ҳаст?", "Sıcak su var mı?",
              "Оби гарм ҳаст?", []),
            t("Evet, kombi var.", "Ҳа, гармкунак ҳаст.", "Бипурс: гарав ҳаст?", "Depozito var mı?", "Гарав ҳаст?",
              []),
        ]),
        ("Дар хона мушкил", [
            s("Musluk akıyor.", "Ҷӯмак об мечаконад.", None),
            s("Kombi çalışmıyor.", "Гармкунак кор намекунад.", "«Kombi» — дегчаи гармкунии хона."),
            s("Kirayı ödedim.", "Иҷораро пардохтам.", None),
            s("Sözleşme lazım.", "Шартнома лозим.", None),
            s("Anahtar kimde?", "Калид дар дасти кист?", None),
            s("Ev sahibini arayın.", "Ба соҳибхона занг занед.", None),
        ]),
        ("Муколама: гармкунак", [
            t("Alo, buyurun?", "Алло, марҳамат?", "Бигӯ: гармкунак кор намекунад", "Kombi çalışmıyor.",
              "Гармкунак кор намекунад.", ["Kombi bozuk."]),
            t("Ne zamandan beri?", "Аз кай?", "Бигӯ: аз дирӯз", "Dünden beri.", "Аз дирӯз.", []),
            t("Tamam, yarın usta gönderiyorum.", "Хуб, фардо усто мефиристам.", "Бигӯ: ташаккур", "Teşekkürler.",
              "Ташаккур.", ["Teşekkür ederim."]),
        ]),
        ("Миссия: занг барои хона", [
            t("Alo? Buyurun.", "Алло? Марҳамат.", "Бигӯ: салом, хона меҷӯям", "Merhaba, ev arıyorum.",
              "Салом, хона меҷӯям.", ["Ev arıyorum."]),
            t("İki odalı ev var.", "Хонаи дуҳуҷрагӣ ҳаст.", "Бипурс: иҷора чанд?", "Kira ne kadar?", "Иҷора чанд?",
              []),
            t("On iki bin lira.", "Дувоздаҳ ҳазор лира.", "Бипурс: хонаро дида метавонам?",
              "Evi görebilir miyim?", "Хонаро дида метавонам?", []),
            t("Tabii, yarın akşam gelin.", "Албатта, фардо бегоҳ биёед.", "Бигӯ: хуб, ташаккур",
              "Tamam, teşekkürler.", "Хуб, ташаккур.", ["Teşekkür ederim."]),
        ]),
    ], mission_mode="call"))

# ═════════════════════ 15. Занг ба бригадир ═════════════════════
made.append(pack("call_tr_tg", "Ustayı aramak", "Занг ба бригадир", "📞", 15, B,
    "Бо телефон бо усто гап мезанед: садо намеояд, дар роҳ мондед, суроға мехоҳед ё як "
    "рӯз рухсатӣ мепурсед. Миссия — занги воқеӣ.",
    [
        ("Телефон", [
            w("Alo", "алло", None),
            w("Telefon", "телефон", None),
            w("Mesaj", "паём", None),
            w("Numara", "рақам", None),
            w("Şarj", "заряд (батарея)", None),
            w("Sonra", "баъд", None),
        ]),
        ("Маро мешунавӣ?", [
            t("Alo? Kimsiniz?", "Алло? Шумо кистед?", "Бигӯ: коргари нав", "Yeni işçi.", "Коргари нав.",
              ["Ben yeni işçiyim."]),
            t("Beni duyuyor musun?", "Маро мешунавӣ?", "Бигӯ: ҳа, мешунавам", "Evet, duyuyorum.", "Ҳа, мешунавам.",
              ["Evet."]),
            t("Sonra ararım.", "Баъд занг мезанам.", "Бигӯ: хуб", "Tamam.", "Хуб.", ["Tamam, usta."]),
        ]),
        ("Суханҳои телефонӣ", [
            s("Sesiniz gelmiyor", "Садоятон намеояд", None),
            s("Tekrar arayın", "Боз занг занед", None),
            s("Mesaj atın", "Паём фиристед", None),
            s("Şarjım bitiyor", "Зарядам тамом мешавад", None),
            s("Bir dakika", "Як дақиқа", None),
            s("Müsait misiniz?", "Холӣ ҳастед?", None),
        ]),
        ("Садо намеояд", [
            t("Alo? Alo?", "Алло? Алло?", "Бигӯ: садоятон намеояд", "Sesiniz gelmiyor.", "Садоятон намеояд.",
              ["Duyamıyorum."]),
            t("Şimdi duyuyor musun?", "Ҳоло мешунавӣ?", "Бигӯ: ҳа, ҳоло хуб", "Evet, şimdi iyi.", "Ҳа, ҳоло хуб.",
              ["Evet."]),
            t("Tamam, dinle.", "Хуб, гӯш кун.", "Бигӯ: гӯш мекунам", "Dinliyorum.", "Гӯш мекунам.", ["Buyurun."]),
        ]),
        ("Дар роҳ", [
            s("Usta, müsait misiniz?", "Усто, холӣ ҳастед?", None),
            s("Yolda kaldım.", "Дар роҳ мондам.", None),
            s("Adresi mesaj atın.", "Суроғаро паём фиристед.", None),
            s("Numaram bu.", "Рақами ман ин.", None),
            s("Sizi sonra arayacağım.", "Шуморо баъд занг мезанам.", None),
            s("Şarjım bitiyor.", "Зарядам тамом мешавад.", None),
        ]),
        ("Муколама: суроға", [
            t("Alo, neredesin?", "Алло, куҷоӣ?", "Бигӯ: дар роҳ мондам", "Yolda kaldım.", "Дар роҳ мондам.",
              ["Yoldayım."]),
            t("Adresi biliyor musun?", "Суроғаро медонӣ?", "Бигӯ: не, суроғаро паём фиристед",
              "Hayır, adresi mesaj atın.", "Не, суроғаро паём фиристед.", ["Mesaj atın lütfen."]),
            t("Tamam, şimdi atıyorum.", "Хуб, ҳозир мефиристам.", "Бигӯ: ташаккур, усто", "Teşekkürler, usta.",
              "Ташаккур, усто.", []),
        ]),
        ("Рухсатӣ", [
            s("Yarın işe gelemiyorum.", "Фардо ба кор омада наметавонам.", None),
            s("Kızım hasta.", "Духтарам бемор аст.", None),
            s("Bir gün izin istiyorum.", "Як рӯз рухсатӣ мехоҳам.", None),
            s("Pazartesi gelirim.", "Душанбе меоям.", None),
            s("Mesajınızı aldım.", "Паёматонро гирифтам.", None),
            s("Tamam, anlaşıldı.", "Хуб, фаҳмо шуд.", None),
        ]),
        ("Муколама: рухсатӣ", [
            t("Alo, buyur?", "Алло, гӯй?", "Бигӯ: як рӯз рухсатӣ мехоҳам", "Bir gün izin istiyorum.",
              "Як рӯз рухсатӣ мехоҳам.", ["İzin istiyorum."]),
            t("Neden?", "Чаро?", "Бигӯ: духтарам бемор аст", "Kızım hasta.", "Духтарам бемор аст.", []),
            t("Geçmiş olsun. Tamam.", "Шифо ёбад. Хуб.", "Бигӯ: ташаккур, усто", "Teşekkürler, usta.",
              "Ташаккур, усто.", ["Sağ olun."]),
        ]),
        ("Миссия: занг ба усто", [
            t("Alo?", "Алло?", "Салом гӯй ва бипурс: холӣ ҳастед?", "Merhaba usta, müsait misiniz?",
              "Салом усто, холӣ ҳастед?", ["Usta, müsait misiniz?"]),
            t("Evet, söyle.", "Ҳа, гӯй.", "Бигӯ: фардо ба кор омада наметавонам", "Yarın işe gelemiyorum.",
              "Фардо ба кор омада наметавонам.", ["Yarın gelemiyorum."]),
            t("Ne oldu?", "Чӣ шуд?", "Бигӯ: духтарам бемор аст", "Kızım hasta.", "Духтарам бемор аст.", []),
            t("Tamam, pazartesi gel.", "Хуб, душанбе биё.", "Бигӯ: хуб, душанбе меоям", "Tamam, pazartesi gelirim.",
              "Хуб, душанбе меоям.", ["Teşekkürler."]),
        ]),
    ], mission_mode="call"))

# ═════════════════════ 16. Ҳуҷҷатҳо ва полис (умумӣ) ═════════════════════
made.append(pack("docs_tr_tg", "Belgeler ve polis", "Ҳуҷҷатҳо ва полис", "🪪", 16, [],
    "Полис ҳуҷҷат мепурсад ё шумо ба идораи муҳоҷират (Göç İdaresi) меравед. Шиноснома, "
    "иҷозати истиқомат (ikamet) ва иҷозати кор нишон медиҳед.",
    [
        ("Ҳуҷҷатҳо", [
            w("Pasaport", "шиноснома", None),
            w("Kimlik", "ҳуҷҷати шахсият", None),
            w("İkamet", "иҷозати истиқомат", "Корти истиқомати хориҷӣ дар Туркия."),
            w("Polis", "полис", None),
            w("Adres", "суроға", None),
            w("Form", "форма (варақа)", None),
        ]),
        ("Ҳуҷҷататон", [
            t("Kimliğiniz lütfen.", "Ҳуҷҷататон, лутфан.", "Бигӯ: марҳамат", "Buyurun.", "Марҳамат.", []),
            t("Türk müsünüz?", "Туркед?", "Бигӯ: не, тоҷикам", "Hayır, Tacikim.", "Не, тоҷикам.", ["Hayır."]),
            t("İkametiniz var mı?", "Иҷозати истиқомат доред?", "Бигӯ: ҳа", "Evet, var.", "Ҳа, дорам.", ["Evet."]),
        ]),
        ("Суханҳои кӯтоҳ", [
            s("Pasaportum burada", "Шиносномаам ин ҷо", None),
            s("Çalışma izni", "иҷозати кор", None),
            s("Ev adresim", "суроғаи хонаам", None),
            w("Anlamıyorum", "намефаҳмам", None),
            s("Tercüman lazım", "Тарҷумон лозим", None),
            s("Bir saniye", "Як сония", None),
        ]),
        ("Санҷиши ҳуҷҷат", [
            t("Pasaportunuz nerede?", "Шиносномаатон куҷост?", "Бигӯ: шиносномаам ин ҷо", "Pasaportum burada.",
              "Шиносномаам ин ҷо.", ["Burada, buyurun."]),
            t("Çalışma izniniz var mı?", "Иҷозати кор доред?", "Бигӯ: ҳа, ҳаст", "Evet, var.", "Ҳа, ҳаст.",
              ["Evet."]),
            t("Adresiniz ne?", "Суроғаатон чист?", "Бигӯ: як сония", "Bir saniye.", "Як сония.", ["Bir dakika."]),
        ]),
        ("Ман кистам", [
            s("Ben Tacikistan vatandaşıyım.", "Ман шаҳрванди Тоҷикистонам.", None),
            s("İkametim var.", "Иҷозати истиқомат дорам.", None),
            s("Pasaportum evde.", "Шиносномаам дар хона.", None),
            s("Türkçem az.", "Туркиам кам.", None),
            s("Tercüman istiyorum.", "Тарҷумон мехоҳам.", None),
            s("Konsolosluğu arayabilir miyim?", "Ба консулгарӣ занг зада метавонам?", None),
        ]),
        ("Муколама: полис", [
            t("Neden kimliğin yok?", "Чаро ҳуҷҷат надорӣ?", "Бигӯ: шиносномаам дар хона", "Pasaportum evde.",
              "Шиносномаам дар хона.", ["Evde."]),
            t("Nerede oturuyorsun?", "Дар куҷо зиндагӣ мекунӣ?", "Бигӯ: дар Эсенюрт", "Esenyurt'ta.",
              "Дар Эсенюрт.", ["Esenyurt'ta oturuyorum."]),
            t("Türkçe anlıyor musun?", "Туркӣ мефаҳмӣ?", "Бигӯ: каме", "Biraz.", "Каме.", ["Biraz anlıyorum."]),
        ]),
        ("Идораи муҳоҷират", [
            s("Randevum var.", "Навбат дорам.", None),
            s("Göç idaresi nerede?", "Идораи муҳоҷират куҷост?", None),
            s("Fotoğraf lazım mı?", "Акс лозим?", None),
            s("Hangi belgeler lazım?", "Кадом ҳуҷҷатҳо лозим?", None),
            s("Formu doldurdum.", "Формаро пур кардам.", None),
            s("Kaç gün sürer?", "Чанд рӯз мекашад?", None),
        ]),
        ("Муколама: навбат", [
            t("Buyurun, sıra numaranız?", "Марҳамат, рақами навбататон?", "Бигӯ: навбат дорам", "Randevum var.",
              "Навбат дорам.", []),
            t("Formu doldurdunuz mu?", "Формаро пур кардед?", "Бигӯ: ҳа, пур кардам", "Evet, doldurdum.",
              "Ҳа, пур кардам.", ["Evet."]),
            t("Tamam, iki fotoğraf da lazım.", "Хуб, ду акс ҳам лозим.", "Бипурс: чанд рӯз мекашад?",
              "Kaç gün sürer?", "Чанд рӯз мекашад?", []),
        ]),
        ("Миссия: санҷиши полис", [
            t("Merhaba. Kimlik kontrolü.", "Салом. Санҷиши ҳуҷҷат.", "Бигӯ: марҳамат, шиноснома",
              "Buyurun, pasaport.", "Марҳамат, шиноснома.", ["Buyurun."]),
            t("Nerelisiniz?", "Аз куҷоед?", "Бигӯ: аз Тоҷикистонам", "Tacikistanlıyım.", "Аз Тоҷикистонам.", []),
            t("İkametiniz var mı?", "Иҷозати истиқомат доред?", "Бигӯ: ҳа, ҳаст", "Evet, var.", "Ҳа, ҳаст.",
              ["Evet, ikametim var."]),
            t("Burada ne yapıyorsunuz?", "Ин ҷо чӣ кор мекунед?", "Касби худро гӯед", "Ben {job}.",
              "Ман {job_tg} ҳастам.", []),
        ]),
    ]))

# ═════════════════════ 17. Вагонча ва ҳамкорон ═════════════════════
made.append(pack("crew_tr_tg", "Konteynerde mola", "Вагонча ва ҳамкорон", "☕", 17, B,
    "Танаффус дар вагонча: чой, хӯрок ва гапи оддӣ бо ҳамкорон — оила, ватан, охири ҳафта.",
    [
        ("Танаффус", [
            w("Çay", "чой", None),
            w("Yemek", "хӯрок", None),
            w("Arkadaş", "дӯст, рафиқ", None),
            w("Aile", "оила", None),
            w("Memleket", "ватан, зодгоҳ", None),
            w("Tatil", "таътил, истироҳат", None),
        ]),
        ("Чой мехоҳӣ?", [
            t("Çay ister misin?", "Чой мехоҳӣ?", "Бигӯ: ҳа, лутфан", "Evet, lütfen.", "Ҳа, лутфан.", ["Olur."]),
            t("Şeker?", "Қанд?", "Бигӯ: не, ташаккур", "Hayır, teşekkürler.", "Не, ташаккур.", ["Şekersiz."]),
            t("Acıktın mı?", "Гурусна шудӣ?", "Бигӯ: ҳа, хеле", "Evet, çok.", "Ҳа, хеле.", ["Çok acıktım."]),
        ]),
        ("Суханҳои кӯтоҳ", [
            s("Afiyet olsun", "Ош шавад", "Пеш аз хӯрок ё баъд аз он мегӯянд."),
            s("Çok güzel", "Хеле хуб", None),
            s("Ailem Tacikistan'da", "Оилаам дар Тоҷикистон", None),
            s("Evli misin?", "Оиладорӣ?", None),
            s("Hadi gidelim", "Биё, равем", None),
            w("Yoruldum", "монда шудам", None),
        ]),
        ("Оила", [
            t("Afiyet olsun!", "Ош шавад!", "Бигӯ: ташаккур", "Teşekkürler.", "Ташаккур.", ["Sağ ol."]),
            t("Evli misin?", "Оиладорӣ?", "Бигӯ: ҳа", "Evet.", "Ҳа.", ["Evet, evliyim."]),
            t("Ailen nerede?", "Оилаат куҷост?", "Бигӯ: оилаам дар Тоҷикистон", "Ailem Tacikistan'da.",
              "Оилаам дар Тоҷикистон.", ["Tacikistan'da."]),
        ]),
        ("Дар бораи худам", [
            s("İki çocuğum var.", "Ду фарзанд дорам.", None),
            s("Memleketimi özledim.", "Ватанамро соғиндам.", None),
            s("Bu yemek çok güzel.", "Ин хӯрок хеле болаззат.", None),
            s("Tatilde eve gideceğim.", "Дар таътил ба хона меравам.", None),
            s("Hafta sonu ne yapıyorsun?", "Охири ҳафта чӣ кор мекунӣ?", None),
            s("Futbol oynar mısın?", "Футбол бозӣ мекунӣ?", None),
        ]),
        ("Муколама: фарзандон", [
            t("Kaç çocuğun var?", "Чанд фарзанд дорӣ?", "Бигӯ: ду фарзанд дорам", "İki çocuğum var.",
              "Ду фарзанд дорам.", ["İki."]),
            t("Onları özlüyor musun?", "Онҳоро соғинӣ?", "Бигӯ: ҳа, хеле", "Evet, çok.", "Ҳа, хеле.",
              ["Çok özlüyorum."]),
            t("Ne zaman gideceksin?", "Кай меравӣ?", "Бигӯ: дар таътил", "Tatilde.", "Дар таътил.",
              ["Tatilde gideceğim."]),
        ]),
        ("Гапи оддӣ", [
            s("Bugün çok yoruldum.", "Имрӯз хеле монда шудам.", None),
            s("Biraz dinlenelim.", "Каме дам гирем.", None),
            s("Çay demledim.", "Чой дам кардам.", None),
            s("Yarın kim çalışıyor?", "Фардо кӣ кор мекунад?", None),
            s("Sen nerelisin?", "Ту аз куҷоӣ?", None),
            s("Türkçen iyi.", "Туркиат хуб.", None),
        ]),
        ("Муколама: шиносоӣ", [
            t("Sen nerelisin?", "Ту аз куҷоӣ?", "Бигӯ: аз Тоҷикистонам", "Tacikistanlıyım.", "Аз Тоҷикистонам.",
              ["Tacikistan'dan."]),
            t("Türkçen iyi!", "Туркиат хуб!", "Бигӯ: ташаккур, каме медонам", "Teşekkürler, biraz biliyorum.",
              "Ташаккур, каме медонам.", ["Teşekkürler."]),
            t("Hafta sonu ne yapıyorsun?", "Охири ҳафта чӣ кор мекунӣ?", "Бигӯ: дам мегирам", "Dinleniyorum.",
              "Дам мегирам.", ["Evde dinleniyorum."]),
        ]),
        ("Миссия: танаффус", [
            t("Gel, çay içelim!", "Биё, чой нӯшем!", "Бигӯ: хуб, раҳмат", "Tamam, sağ ol.", "Хуб, раҳмат.",
              ["Olur, teşekkürler."]),
            t("Nasılsın? Yoruldun mu?", "Чӣ хелӣ? Монда шудӣ?", "Бигӯ: ҳа, хеле монда шудам", "Evet, çok yoruldum.",
              "Ҳа, хеле монда шудам.", ["Çok yoruldum."]),
            t("Ailen nasıl?", "Оилаат чӣ хел?", "Бигӯ: хуб, ташаккур", "İyi, teşekkürler.", "Хуб, ташаккур.",
              ["İyiler."]),
            t("Hadi, mola bitti.", "Хуб, танаффус тамом шуд.", "Бигӯ: биё, равем", "Hadi gidelim.", "Биё, равем.",
              ["Tamam, gidelim."]),
        ]),
    ]))

# ═════════════════════ 18. Либоси корӣ ═════════════════════
made.append(pack("gear_tr_tg", "İş kıyafeti", "Либоси корӣ", "🦺", 18, B,
    "Либос ва таҷҳизоти муҳофизатӣ: камзӯл, мӯза, айнак, ниқоб. Андозаро мегӯед, нав "
    "мехоҳед ва мефаҳмед, ки бе кулоҳ даромадан манъ аст.",
    [
        ("Либос", [
            w("Yelek", "камзӯли инъикоскунанда", None),
            w("Bot", "мӯзаи корӣ", None),
            w("Gözlük", "айнак", None),
            w("Maske", "ниқоб", None),
            w("Tulum", "комбинезон", None),
            w("Kulaklık", "гӯшпӯшак", None),
        ]),
        ("Камзӯлат куҷост?", [
            t("Yeleğin nerede?", "Камзӯлат куҷост?", "Бигӯ: дар вагонча", "Konteynerde.", "Дар вагонча.",
              ["Konteynerde kaldı."]),
            t("Gözlük tak!", "Айнак пӯш!", "Бигӯ: хуб", "Tamam.", "Хуб.", ["Tamam, takıyorum."]),
            t("Botların iyi mi?", "Мӯзаҳоят хубанд?", "Бигӯ: не, калон", "Hayır, büyük.", "Не, калон.",
              ["Büyük geliyor."]),
        ]),
        ("Суханҳои кӯтоҳ", [
            s("Yeni eldiven", "дастпӯшаки нав", None),
            s("Toz maskesi", "ниқоби чанг", None),
            w("Yırtıldı", "дарида шуд", None),
            s("Çok küçük", "Хеле хурд", None),
            s("Kulaklık tak", "Гӯшпӯшак пӯш", None),
            s("İş botu", "мӯзаи корӣ", None),
        ]),
        ("Нав лозим", [
            t("Ne lazım?", "Чӣ лозим?", "Бигӯ: дастпӯшаки нав", "Yeni eldiven.", "Дастпӯшаки нав.",
              ["Yeni eldiven lazım."]),
            t("Eskisi ne oldu?", "Кӯҳнааш чӣ шуд?", "Бигӯ: дарида шуд", "Yırtıldı.", "Дарида шуд.",
              ["Eldivenim yırtıldı."]),
            t("Al, bunlar yeni.", "Гир, инҳо нав.", "Бигӯ: ташаккур", "Teşekkürler.", "Ташаккур.", []),
        ]),
        ("Андоза ва вайронӣ", [
            s("Kırk iki numara giyiyorum.", "Рақами чилу ду мепӯшам.", None),
            s("Bu bot küçük.", "Ин мӯза хурд.", None),
            s("Toz maskesi lazım.", "Ниқоби чанг лозим.", None),
            s("Yeleğim yırtıldı.", "Камзӯлам дарида шуд.", None),
            s("Gözlüğüm kırıldı.", "Айнакам шикаст.", None),
            s("Yenisini alabilir miyim?", "Навашро гирифта метавонам?", None),
        ]),
        ("Муколама: мӯза", [
            t("Kaç numara giyiyorsun?", "Рақами чанд мепӯшӣ?", "Бигӯ: чилу ду", "Kırk iki.", "Чилу ду.",
              ["Kırk iki numara."]),
            t("Bu bot olur mu?", "Ин мӯза мешавад?", "Бигӯ: не, хурд", "Hayır, küçük.", "Не, хурд.",
              ["Küçük geldi."]),
            t("Tamam, kırk üç var.", "Хуб, чилу се ҳаст.", "Бигӯ: хуб, ташаккур", "Tamam, teşekkürler.",
              "Хуб, ташаккур.", []),
        ]),
        ("Қоидаҳо", [
            s("Burada gürültü çok.", "Ин ҷо садо зиёд.", None),
            s("Kulaklık lazım.", "Гӯшпӯшак лозим.", None),
            s("Baretsiz girmek yasak.", "Бе кулоҳ даромадан манъ.", None),
            s("Kıyafetim ıslandı.", "Либосам тар шуд.", None),
            s("Yedek tulum var mı?", "Комбинезони эҳтиётӣ ҳаст?", None),
            s("Yeleğini giy.", "Камзӯлатро пӯш.", None),
        ]),
        ("Муколама: гӯшпӯшак", [
            t("Neden kulaklığın yok?", "Чаро гӯшпӯшак надорӣ?", "Бигӯ: гӯшпӯшак лозим", "Kulaklık lazım.",
              "Гӯшпӯшак лозим.", ["Kulaklığım yok."]),
            t("Depoda var, al.", "Дар анбор ҳаст, гир.", "Бипурс: комбинезони эҳтиётӣ ҳаст?",
              "Yedek tulum var mı?", "Комбинезони эҳтиётӣ ҳаст?", []),
            t("Neden?", "Чаро?", "Бигӯ: либосам тар шуд", "Kıyafetim ıslandı.", "Либосам тар шуд.", []),
        ]),
        ("Миссия: дар дарвоза", [
            t("Dur! Baretin nerede?", "Ист! Кулоҳат куҷост?", "Бигӯ: мебахшед, дар вагонча",
              "Özür dilerim, konteynerde.", "Мебахшед, дар вагонча.", ["Konteynerde."]),
            t("Baretsiz girmek yasak!", "Бе кулоҳ даромадан манъ!", "Бигӯ: фаҳмидам, ҳозир меорам",
              "Anladım, hemen getiriyorum.", "Фаҳмидам, ҳозир меорам.", ["Hemen getiriyorum."]),
            t("Yeleğin de yok.", "Камзӯлат ҳам нест.", "Бигӯ: камзӯлам дарида шуд", "Yeleğim yırtıldı.",
              "Камзӯлам дарида шуд.", []),
            t("Depodan yenisini al.", "Аз анбор навашро гир.", "Бигӯ: хуб, усто", "Tamam, usta.", "Хуб, усто.",
              ["Teşekkürler usta."]),
        ]),
    ]))

# ═════════════════════ 19. Санҷиши кор ═════════════════════
made.append(pack("check_tr_tg", "İş kontrolü", "Санҷиши кор", "✅", 19, B,
    "Усто кори шуморо месанҷад. Мегӯед, ки тайёр аст ё каме монд, мепурсед, ки куҷо "
    "нодуруст аст, ва аз нав мекунед.",
    [
        ("Сифат", [
            w("Düz", "рост, ҳамвор", None),
            w("Eğri", "каҷ", None),
            w("Hazır", "тайёр", None),
            w("Doğru", "дуруст", None),
            w("Yanlış", "нодуруст", None),
            w("Tekrar", "боз, аз нав", None),
        ]),
        ("Тамом шуд?", [
            t("Bitti mi?", "Тамом шуд?", "Бигӯ: ҳа, тайёр", "Evet, hazır.", "Ҳа, тайёр.", ["Bitti."]),
            t("Bu duvar eğri.", "Ин девор каҷ.", "Бигӯ: мебахшед", "Özür dilerim.", "Мебахшед.", ["Pardon."]),
            t("Tekrar yap.", "Аз нав кун.", "Бигӯ: хуб", "Tamam.", "Хуб.", ["Tamam, usta."]),
        ]),
        ("Суханҳои кӯтоҳ", [
            s("Bakar mısınız?", "Нигоҳ мекунед?", None),
            s("Neresi yanlış?", "Куҷо нодуруст?", None),
            s("Az kaldı", "Каме монд", None),
            s("Şimdi düz", "Ҳоло рост", None),
            s("Yarın biter", "Фардо тамом мешавад", None),
            w("Aferin", "офарин", None),
        ]),
        ("Кай тамом мешавад?", [
            t("Duvar hazır mı?", "Девор тайёр?", "Бигӯ: каме монд", "Az kaldı.", "Каме монд.", ["Az kaldı, usta."]),
            t("Ne zaman biter?", "Кай тамом мешавад?", "Бигӯ: фардо тамом мешавад", "Yarın biter.",
              "Фардо тамом мешавад.", ["Yarın."]),
            t("Tamam. Su terazisi kullan.", "Хуб. Сатҳсанҷро истифода бар.", "Бигӯ: хуб", "Tamam.", "Хуб.",
              ["Tamam, usta."]),
        ]),
        ("Санҷед, лутфан", [
            s("Usta, bakar mısınız?", "Усто, нигоҳ мекунед?", None),
            s("İş hazır.", "Кор тайёр.", None),
            s("Burası doğru mu?", "Ин ҷо дуруст?", None),
            s("Tekrar yapıyorum.", "Аз нав мекунам.", None),
            s("Şimdi daha iyi.", "Ҳоло беҳтар.", None),
            s("Yarın bitireceğim.", "Фардо тамом мекунам.", None),
        ]),
        ("Муколама: кунҷ", [
            t("Bu kötü olmuş.", "Ин бад шудааст.", "Бипурс: куҷо нодуруст?", "Neresi yanlış?", "Куҷо нодуруст?",
              []),
            t("Köşe eğri.", "Кунҷ каҷ.", "Бигӯ: аз нав мекунам", "Tekrar yapıyorum.", "Аз нав мекунам.",
              ["Tamam, tekrar yaparım."]),
            t("Dikkatli ol.", "Эҳтиёткор бош.", "Бигӯ: хуб, усто", "Tamam, usta.", "Хуб, усто.", []),
        ]),
        ("Кори тайёр", [
            s("Fayanslar bitti.", "Кошинҳо тамом шуданд.", None),
            s("Boya kurudu mu?", "Ранг хушк шуд?", None),
            s("İkinci kat hazır.", "Ошёнаи дуюм тайёр.", None),
            s("Fotoğraf çektim.", "Акс гирифтам.", None),
            s("Temizlik yaptım.", "Тоза кардам.", None),
            s("Başka iş var mı?", "Кори дигар ҳаст?", None),
        ]),
        ("Муколама: ранг", [
            t("Boya nasıl?", "Ранг чӣ хел?", "Бигӯ: ҳоло беҳтар", "Şimdi daha iyi.", "Ҳоло беҳтар.", []),
            t("Aferin! Temizlik yaptın mı?", "Офарин! Тоза кардӣ?", "Бигӯ: ҳа, тоза кардам", "Evet, temizlik yaptım.",
              "Ҳа, тоза кардам.", ["Evet."]),
            t("Güzel.", "Хуб.", "Бипурс: кори дигар ҳаст?", "Başka iş var mı?", "Кори дигар ҳаст?", []),
        ]),
        ("Миссия: усто месанҷад", [
            t("Usta geldi. İş bitti mi?", "Усто омад. Кор тамом шуд?", "Бигӯ: ҳа, усто, нигоҳ мекунед?",
              "Evet usta, bakar mısınız?", "Ҳа усто, нигоҳ мекунед?", ["Evet, bitti."]),
            t("Bu köşe eğri.", "Ин кунҷ каҷ.", "Бигӯ: мебахшед, аз нав мекунам", "Özür dilerim, tekrar yapıyorum.",
              "Мебахшед, аз нав мекунам.", ["Tekrar yapıyorum."]),
            t("Ne zaman biter?", "Кай тамом мешавад?", "Бигӯ: баъд аз як соат", "Bir saat sonra.",
              "Баъд аз як соат.", ["Bir saatte biter."]),
            t("Tamam, sonra bana göster.", "Хуб, баъд ба ман нишон деҳ.", "Бигӯ: хуб, усто", "Tamam, usta.",
              "Хуб, усто.", []),
        ]),
    ]))

# ═════════════════════ 20. Соатҳо ва табел ═════════════════════
made.append(pack("hours_tr_tg", "Çalışma saatleri ve puantaj", "Соатҳо ва табел", "🕗", 20, B,
    "Кай сар мекунед ва кай тамом, чанд соат кор кардед ва оё номатон дар табел (puantaj) "
    "ҳаст. Инчунин рухсатӣ ва барвақт рафтан.",
    [
        ("Вақт", [
            w("Saat", "соат", None),
            w("Giriş", "омадан (ба кор)", None),
            w("Çıkış", "рафтан (аз кор)", None),
            w("Puantaj", "табел", "Дафтари ҳисоби рӯзҳо ва соатҳои кор."),
            w("Cumartesi", "шанбе", None),
            w("İzin", "рухсатӣ", None),
        ]),
        ("Соати чанд?", [
            t("Kaçta geldin?", "Соати чанд омадӣ?", "Бигӯ: соати ҳафт", "Saat yedide.", "Соати ҳафт.",
              ["Yedide."]),
            t("Kaçta çıkıyorsun?", "Соати чанд меравӣ?", "Бигӯ: соати шаш", "Saat altıda.", "Соати шаш.",
              ["Altıda."]),
            t("Cumartesi çalışıyor musun?", "Шанбе кор мекунӣ?", "Бигӯ: ҳа", "Evet.", "Ҳа.",
              ["Evet, çalışıyorum."]),
        ]),
        ("Суханҳои кӯтоҳ", [
            s("Sabah yedide", "Саҳар соати ҳафт", None),
            s("Akşam altıda", "Бегоҳ соати шаш", None),
            s("Yarım gün", "ним рӯз", None),
            s("Tam gün", "рӯзи пурра", None),
            s("İmza at", "Имзо кун", None),
            w("Pazartesi", "душанбе", None),
        ]),
        ("Табел", [
            t("Puantaja imza at.", "Дар табел имзо кун.", "Бигӯ: хуб", "Tamam.", "Хуб.", ["Tamam, usta."]),
            t("Dün kaç saat çalıştın?", "Дирӯз чанд соат кор кардӣ?", "Бигӯ: даҳ соат", "On saat.", "Даҳ соат.",
              ["On saat çalıştım."]),
            t("Yarım gün mü?", "Ним рӯз?", "Бигӯ: не, рӯзи пурра", "Hayır, tam gün.", "Не, рӯзи пурра.", []),
        ]),
        ("Рӯзи кор", [
            s("Sabah yedide başlıyoruz.", "Саҳар соати ҳафт сар мекунем.", None),
            s("Akşam altıda bitiyor.", "Бегоҳ соати шаш тамом мешавад.", None),
            s("Dün on saat çalıştım.", "Дирӯз даҳ соат кор кардам.", None),
            s("Puantajda adım yok.", "Дар табел номам нест.", None),
            s("Pazar izin var mı?", "Якшанбе рухсатӣ ҳаст?", None),
            s("Öğle arası bir saat.", "Танаффуси нисфирӯзӣ як соат.", None),
        ]),
        ("Муколама: номам нест", [
            t("Puantajı kontrol et.", "Табелро санҷ.", "Бигӯ: дар табел номам нест", "Puantajda adım yok.",
              "Дар табел номам нест.", ["Adım yok."]),
            t("Hangi gün?", "Кадом рӯз?", "Бигӯ: сешанбе", "Salı.", "Сешанбе.", ["Salı günü."]),
            t("Tamam, ekliyorum.", "Хуб, илова мекунам.", "Бигӯ: ташаккур", "Teşekkürler.", "Ташаккур.", []),
        ]),
        ("Ҳафта ва ид", [
            s("Altı gün çalıştım.", "Шаш рӯз кор кардам.", None),
            s("Cumartesi yarım gün.", "Шанбе ним рӯз.", None),
            s("Bayramda tatil mi?", "Дар ид истироҳат аст?", None),
            s("Gece mesaisi var mı?", "Кори шабона ҳаст?", None),
            s("Erken çıkabilir miyim?", "Барвақт рафта метавонам?", None),
            s("Doktora gideceğim.", "Ба духтур меравам.", None),
        ]),
        ("Муколама: ҳафта", [
            t("Bu hafta kaç gün çalıştın?", "Ин ҳафта чанд рӯз кор кардӣ?", "Бигӯ: шаш рӯз", "Altı gün.",
              "Шаш рӯз.", ["Altı gün çalıştım."]),
            t("Cumartesi de mi?", "Шанбе ҳам?", "Бигӯ: ҳа, шанбе ним рӯз", "Evet, cumartesi yarım gün.",
              "Ҳа, шанбе ним рӯз.", ["Yarım gün."]),
            t("Tamam, doğru.", "Хуб, дуруст.", "Бипурс: барвақт рафта метавонам?", "Erken çıkabilir miyim?",
              "Барвақт рафта метавонам?", []),
        ]),
        ("Миссия: кори шабона", [
            t("Günaydın! Kaçta geldin?", "Субҳ ба хайр! Соати чанд омадӣ?", "Бигӯ: соати ҳафт", "Saat yedide.",
              "Соати ҳафт.", ["Yedide geldim."]),
            t("Bugün gece mesaisi var.", "Имрӯз кори шабона ҳаст.", "Бипурс: соати чанд тамом мешавад?",
              "Kaçta bitiyor?", "Соати чанд тамом мешавад?", ["Saat kaçta bitiyor?"]),
            t("Saat on birde.", "Соати ёздаҳ.", "Бипурс: фардо барвақт рафта метавонам?",
              "Yarın erken çıkabilir miyim?", "Фардо барвақт рафта метавонам?", ["Erken çıkabilir miyim?"]),
            t("Olur, öğleden sonra çık.", "Мешавад, баъд аз нисфирӯзӣ рав.", "Бигӯ: ташаккур, усто",
              "Teşekkürler, usta.", "Ташаккур, усто.", ["Sağ olun."]),
        ]),
    ]))

finish(made)
