"""ТУРКӢ → тоҷикӣ, «Гуфтор» A1 — нишаи «Таҳсил» (`study`), 05.10.2026.

11 вазъият барои донишҷӯи тоҷик дар Туркия — ҳамон тартиби русӣ/олмонӣ/арабӣ: омадан,
идораи донишгоҳ (öğrenci işleri), хобгоҳ (yurt), дарс, ҷадвал, китобхона, ҳамкурсон, ёрӣ,
имтиҳон, ошхонаи донишгоҳ (yemekhane), бонк ва стипендия (burs).

Роҳи `study` = 5 вазъияти умумӣ (1, 6, 10, 14, 16) + ин 11 → 16 вазъият.
Қоидаҳо — `_tr_packs_lib.py`: рақам бо ҳарф, ҳарфҳои туркӣ, «mi» калимаи ҷудо (sentences ≤ 4,
chunks ≤ 2). Бо муаллим ва кормандон — «siz», бо ҳамкурс — «sen».
Транскрипсия баъд: `node prisma/_tr-fill-literal.mjs <slugs>`.

Аз ҷузвдони backend: python prisma/_tr-study-a1-packs.py
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _tr_packs_lib import *  # noqa: F401,F403

_s = s


def s(text, tr, note=None, cue=None, cue_tr=None, swaps=None):  # noqa: F811
    """Ибораи ЯК калима бе cue → навъи «калима»."""
    if not cue and not swaps and len(text.split()) == 1:
        return w(text.rstrip('.!'), tr.rstrip('.!'), note)
    return _s(text, tr, note, cue, cue_tr, swaps)


made = []
S = ["study"]

# ═════════════════════ 2. Омадан барои таҳсил ═════════════════════
made.append(pack("arrive_tr_tg", "Okumaya geliş", "Омадан барои таҳсил", "✈️", 2, S,
    "Шумо барои таҳсил ба Туркия омадед. Дар фурудгоҳ мегӯед, ки донишҷӯед ва дар кадом "
    "донишгоҳ мехонед, визаро нишон медиҳед ва бо такси ба хобгоҳ меравед.",
    [
        ("Фурудгоҳ", [
            w("Öğrenci", "донишҷӯ", None),
            w("Üniversite", "донишгоҳ", None),
            w("Vize", "виза", None),
            w("Okul", "мактаб, донишгоҳ", None),
            w("Bavul", "ҷомадон", None),
            w("Yurt", "хобгоҳ (ётоқ)", None),
        ]),
        ("Назорати шиноснома", [
            t("Neden geldiniz?", "Чаро омадед?", "Бигӯ: барои таҳсил", "Okumak için.", "Барои таҳсил.",
              ["Okumaya geldim.", "Öğrenciyim."], "Кӯтоҳ ҷавоб диҳед."),
            t("Öğrenci misiniz?", "Шумо донишҷӯед?", "Бигӯ: ҳа", "Evet.", "Ҳа.", ["Evet, öğrenciyim."]),
            t("Bavulda ne var?", "Дар ҷомадон чӣ ҳаст?", "Бигӯ: либос", "Kıyafet.", "Либос.",
              ["Sadece kıyafet."]),
        ]),
        ("Виза", [
            s("Öğrenci vizesi", "Визаи донишҷӯӣ", None),
            s("Bir yıl", "Як сол", None),
            s("Hangi üniversite?", "Кадом донишгоҳ?", None),
            s("Yurda lütfen", "Ба хобгоҳ, лутфан", None),
            w("Taksi", "такси", None),
            s("Buyurun, pasaport", "Марҳамат, шиноснома", None),
        ]),
        ("Виза, лутфан", [
            t("Vizeniz lütfen.", "Визаатон, лутфан.", "Бигӯ: марҳамат", "Buyurun.", "Марҳамат.",
              ["Buyurun, vizem."]),
            t("Ne kadar kalacaksınız?", "Чӣ қадар мемонед?", "Бигӯ: як сол", "Bir yıl.", "Як сол.", ["Bir yıl kalacağım."]),
            t("Hoş geldiniz!", "Хуш омадед!", "Ташаккур гӯй", "Teşekkür ederim.", "Ташаккур.", ["Teşekkürler!"]),
        ]),
        ("Ман донишҷӯям", [
            s("Ben öğrenciyim.", "Ман донишҷӯ ҳастам.", None),
            s("Okumaya geldim.", "Барои таҳсил омадам.", None),
            own("___ okuyorum.", "Дар ___ мехонам.", "Номи донишгоҳ ё шаҳрро гӯед: «İstanbul'da okuyorum».",
                "Nerede okuyorsunuz?", "Дар куҷо мехонед?", "Номи шаҳр ё донишгоҳро гӯед"),
            s("Çıkış nerede?", "Баромадгоҳ куҷост?", None),
            s("Taksi lazım.", "Такси лозим.", None),
            s("Bu benim bavulum.", "Ин ҷомадони ман.", None),
        ]),
        ("Мақсади омадан", [
            t("Merhaba. Neden geldiniz?", "Салом. Чаро омадед?", "Бигӯ: барои таҳсил омадам", "Okumaya geldim.",
              "Барои таҳсил омадам.", ["Okumak için."]),
            t("Hangi üniversitede?", "Дар кадом донишгоҳ?", "Бигӯ: дар Донишгоҳи Истанбул", "İstanbul Üniversitesinde.",
              "Дар Донишгоҳи Истанбул.", ["İstanbul Üniversitesi."]),
            t("Hoş geldiniz!", "Хуш омадед!", "Ташаккур гӯй", "Teşekkürler!", "Ташаккур!", ["Teşekkür ederim."]),
        ]),
        ("Такси", [
            s("Taksi nerede?", "Такси куҷост?", None),
            s("Yurda gidiyorum.", "Ба хобгоҳ меравам.", None),
            s("Ne kadar tutar?", "Чанд пул мешавад?", None),
            s("Adres bu.", "Суроға ин.", None),
            s("Bavulum kayboldu.", "Ҷомадонам гум шуд.", None),
            s("Yardım eder misiniz?", "Ёрӣ медиҳед?", None),
        ]),
        ("Ба хобгоҳ", [
            t("Taksi mi? Nereye?", "Такси? Ба куҷо?", "Бигӯ: ба хобгоҳ, лутфан", "Yurda lütfen.", "Ба хобгоҳ, лутфан.",
              ["Öğrenci yurduna."]),
            t("Tamam. Buyurun.", "Хуб. Марҳамат.", "Бипурс: чанд пул мешавад?", "Ne kadar tutar?", "Чанд пул мешавад?",
              ["Ne kadar?"]),
            t("Yüz elli lira.", "Саду панҷоҳ лира.", "Бигӯ: хуб, ташаккур", "Tamam, teşekkürler.", "Хуб, ташаккур.",
              ["Tamam."]),
        ]),
        ("Миссия: фурудгоҳ", [
            t("Pasaport lütfen. Neden geldiniz?", "Шиноснома, лутфан. Чаро омадед?", "Бигӯ: барои таҳсил омадам",
              "Okumaya geldim.", "Барои таҳсил омадам.", ["Okumak için."]),
            t("Hangi üniversite?", "Кадом донишгоҳ?", "Бигӯ: Донишгоҳи Истанбул", "İstanbul Üniversitesi.",
              "Донишгоҳи Истанбул.", ["İstanbul'da okuyorum."]),
            t("Vizeniz var mı?", "Виза доред?", "Бигӯ: ҳа, марҳамат", "Evet, buyurun.", "Ҳа, марҳамат.", ["Evet, var."]),
            t("Tamam. Hoş geldiniz!", "Хуб. Хуш омадед!", "Ташаккури зиёд гӯй", "Çok teşekkür ederim!",
              "Ташаккури зиёд!", ["Teşekkürler!"]),
        ]),
    ]))

# ═════════════════════ 3. Идораи донишгоҳ ═════════════════════
made.append(pack("register_tr_tg", "Öğrenci işlerinde", "Идораи донишгоҳ", "🏫", 3, S,
    "Шумо ба идораи корҳои донишҷӯён (öğrenci işleri) меравед: мегӯед, ки донишҷӯи нав ҳастед, "
    "ихтисосро мегӯед, формаро пур мекунед, акс медиҳед ва мепурсед, ки корт кай тайёр мешавад.",
    [
        ("Идора", [
            w("Ofis", "идора", None),
            w("Form", "форма, варақа", None),
            w("Fotoğraf", "акс", None),
            w("Fotokopi", "нусха", None),
            w("Kart", "корт", None),
            w("Bölüm", "факултет, ихтисос", None),
        ]),
        ("Донишҷӯи нав", [
            t("Merhaba! Ne istiyorsunuz?", "Салом! Чӣ мехоҳед?", "Бигӯ: ман донишҷӯи нав ҳастам", "Yeni öğrenciyim.",
              "Ман донишҷӯи нав ҳастам.", ["Ben yeni öğrenciyim."]),
            t("Hangi bölüm?", "Кадом ихтисос?", "Бигӯ: забони туркӣ", "Türkçe.", "Забони туркӣ.",
              ["Türk dili.", "İktisat."]),
            t("Bu formu doldurun.", "Ин формаро пур кунед.", "Бигӯ: хуб", "Tamam.", "Хуб.", ["Peki."]),
        ]),
        ("Ҳуҷҷатҳо", [
            s("Yeni öğrenci", "Донишҷӯи нав", None),
            s("İki fotoğraf", "Ду акс", None),
            s("Pasaport fotokopisi", "Нусхаи шиноснома", None),
            s("Adınız ne?", "Номатон чист?", None),
            w("Pasaport", "шиноснома", None),
            w("Hazır", "тайёр", None),
        ]),
        ("Акс лозим", [
            t("Adınız ne?", "Номатон чист?", "Бигӯ: Раҳимов", "Rahimov.", "Раҳимов.", ["Adım Rahimov."]),
            t("Fotoğraf lazım.", "Акс лозим.", "Бипурс: чандто?", "Kaç tane?", "Чандто?", ["Kaç fotoğraf?"]),
            t("İki fotoğraf ve fotokopi.", "Ду акс ва нусха.", "Бигӯ: марҳамат", "Buyurun.", "Марҳамат.",
              ["Buyurun, burada."]),
        ]),
        ("Форма", [
            s("Ben yeniyim.", "Ман навам.", None),
            s("Türkçe okuyorum.", "Туркӣ мехонам.", None),
            own("Bölümüm ___.", "Ихтисоси ман ___.", "Ихтисоси худро гӯед.",
                "Ne okuyorsunuz?", "Чӣ мехонед?", "Ихтисоси худро гӯед"),
            s("Form nerede?", "Форма куҷост?", None),
            s("Pasaportum burada.", "Шиносномаам ин ҷост.", None),
            s("İki fotoğrafım var.", "Ду акс дорам.", None),
        ]),
        ("Ҳуҷҷатҳо, лутфан", [
            t("Pasaportunuz lütfen.", "Шиносномаатон, лутфан.", "Бигӯ: марҳамат", "Buyurun.", "Марҳамат.",
              ["Pasaportum burada."]),
            t("Fotoğraf var mı?", "Акс ҳаст?", "Бигӯ: ҳа, ду акс", "Evet, iki fotoğraf.", "Ҳа, ду акс.",
              ["Evet, iki fotoğrafım var."]),
            t("Fotokopi de var mı?", "Нусха ҳам ҳаст?", "Бигӯ: ҳа, марҳамат", "Evet, buyurun.", "Ҳа, марҳамат.", ["Evet."]),
        ]),
        ("Корти донишҷӯӣ", [
            s("Ne zaman hazır?", "Кай тайёр?", None),
            s("Öğrenci kartı", "Корти донишҷӯӣ", None),
            s("Cuma günü mü?", "Рӯзи ҷумъа?", None),
            s("Bir sorum var.", "Як савол дорам.", None),
            s("Sınıf nerede?", "Синфхона куҷост?", None),
            s("Yardım için teşekkürler.", "Барои ёрӣ ташаккур.", None),
        ]),
        ("Кай тайёр?", [
            t("Her şey tamam.", "Ҳама чиз дуруст.", "Бипурс: корт кай тайёр мешавад?", "Kart ne zaman hazır?",
              "Корт кай тайёр мешавад?", ["Ne zaman hazır?"]),
            t("Cuma günü.", "Рӯзи ҷумъа.", "Бигӯ: хуб, ташаккур", "Tamam, teşekkürler.", "Хуб, ташаккур.",
              ["Teşekkür ederim."]),
            t("Başka sorunuz var mı?", "Боз савол доред?", "Бигӯ: не, ташаккур", "Hayır, teşekkürler.", "Не, ташаккур.",
              ["Yok, teşekkürler."]),
        ]),
        ("Миссия: сабти ном", [
            t("Merhaba! Nasıl yardım edebilirim?", "Салом! Чӣ ёрӣ диҳам?", "Бигӯ: ман донишҷӯи нав ҳастам",
              "Yeni öğrenciyim.", "Ман донишҷӯи нав ҳастам.", ["Ben yeni öğrenciyim."]),
            t("Ne okuyorsunuz?", "Чӣ мехонед?", "Бигӯ: туркӣ", "Türkçe okuyorum.", "Туркӣ мехонам.", ["Türkçe."]),
            t("Fotoğraf ve fotokopi var mı?", "Акс ва нусха ҳаст?", "Бигӯ: ҳа, марҳамат", "Evet, buyurun.",
              "Ҳа, марҳамат.", ["Evet, var."]),
            t("Kart cuma günü hazır.", "Корт рӯзи ҷумъа тайёр.", "Ташаккур гӯй ва хайрухуш кун",
              "Teşekkürler, iyi günler!", "Ташаккур, рӯзи хуш!", ["Çok teşekkür ederim."]),
        ]),
    ]))

# ═════════════════════ 4. Хобгоҳ ═════════════════════
made.append(pack("dorm_tr_tg", "Öğrenci yurdunda", "Хобгоҳ", "🛏️", 4, S,
    "Шумо ба хобгоҳи донишҷӯён (yurt) меоед: калидро мегиред, ҳуҷра ва ошхонаро мепурсед, бо "
    "ҳамҳуҷра шинос мешавед ва мегӯед, ки чизе кор намекунад.",
    [
        ("Ҳуҷра", [
            w("Oda", "ҳуҷра", None),
            w("Anahtar", "калид", None),
            w("Mutfak", "ошхона", None),
            w("Banyo", "ҳаммом", None),
            w("Yatak", "кат", None),
            w("Kat", "ошёна", None),
        ]),
        ("Калид", [
            t("Merhaba! Yeni misiniz?", "Салом! Шумо навед?", "Бигӯ: ҳа", "Evet.", "Ҳа.", ["Evet, yeniyim."]),
            t("Adınız ne?", "Номатон чист?", "Бигӯ: Ҳасанов", "Hasanov.", "Ҳасанов.", ["Adım Hasanov."]),
            t("Bu sizin anahtarınız.", "Ин калиди шумо.", "Ташаккур гӯй", "Teşekkürler.", "Ташаккур.",
              ["Teşekkür ederim."]),
        ]),
        ("Дар хобгоҳ", [
            w("Odam", "ҳуҷраи ман", None),
            s("Hangi kat?", "Кадом ошёна?", None),
            w("Mutfak", "ошхона", None),
            s("Oda arkadaşı", "Ҳамҳуҷра", None),
            w("Bozuk", "вайрон", None),
            s("Sıcak su", "Оби гарм", None),
        ]),
        ("Ҳуҷраам куҷост?", [
            t("Oda on iki.", "Ҳуҷраи дувоздаҳ.", "Бипурс: кадом ошёна?", "Hangi kat?", "Кадом ошёна?",
              ["Kaçıncı kat?"]),
            t("İkinci kat.", "Ошёнаи дуюм.", "Бипурс: ошхона куҷост?", "Mutfak nerede?", "Ошхона куҷост?",
              ["Mutfak nerede acaba?"]),
            t("Mutfak burada.", "Ошхона ин ҷост.", "Бигӯ: хуб, ташаккур", "Tamam, teşekkürler.", "Хуб, ташаккур.",
              ["Teşekkürler."]),
        ]),
        ("Ҳамҳуҷра", [
            s("Ben oda arkadaşınım.", "Ман ҳамҳуҷраи ту ҳастам.", None),
            s("Benim adım Ali.", "Номи ман Алӣ.", None),
            s("Nerelisin?", "Аз куҷоӣ?", None),
            s("Tacikistanlıyım.", "Ман аз Тоҷикистонам.", None),
            s("Bu benim yatağım.", "Ин кати ман.", None),
            s("Bu boş mu?", "Ин холӣ аст?", None),
        ]),
        ("Шиносоӣ бо ҳамҳуҷра", [
            t("Selam! Ben Emre. Sen?", "Салом! Ман Эмре. Ту?", "Номи худро гӯй: Алӣ", "Ben Ali.", "Ман Алӣ.",
              ["Benim adım Ali."]),
            t("Nerelisin?", "Аз куҷоӣ?", "Бигӯ: аз Тоҷикистон", "Tacikistanlıyım.", "Ман аз Тоҷикистонам.",
              ["Tacikistan'dan."]),
            t("Bu yatak boş.", "Ин кат холӣ аст.", "Бигӯ: хуб, ташаккур", "Tamam, teşekkürler.", "Хуб, ташаккур.",
              ["Sağ ol."]),
        ]),
        ("Чизе кор намекунад", [
            s("Işık çalışmıyor.", "Чароғ кор намекунад.", None),
            s("Duş bozuk.", "Душ вайрон аст.", None),
            s("Sıcak su yok.", "Оби гарм нест.", None),
            s("İnternet yok.", "Интернет нест.", None),
            s("Usta ne zaman gelir?", "Усто кай меояд?", None),
            s("Oda çok soğuk.", "Ҳуҷра хеле хунук аст.", None),
        ]),
        ("Ба мудири хобгоҳ", [
            t("Buyurun?", "Марҳамат?", "Бигӯ: душ вайрон аст", "Duş bozuk.", "Душ вайрон аст.",
              ["Duş çalışmıyor."]),
            t("Hangi oda?", "Кадом ҳуҷра?", "Бигӯ: ҳуҷраи дувоздаҳ", "Oda on iki.", "Ҳуҷраи дувоздаҳ.", ["On iki."]),
            t("Yarın usta gelir.", "Фардо усто меояд.", "Бигӯ: хуб, ташаккур", "Tamam, teşekkürler.", "Хуб, ташаккур.",
              ["Teşekkür ederim."]),
        ]),
        ("Миссия: рӯзи аввал дар хобгоҳ", [
            t("Merhaba! Hasanov siz misiniz?", "Салом! Шумо Ҳасановед?", "Бигӯ: ҳа, ман", "Evet, benim.", "Ҳа, ман.",
              ["Evet."]),
            t("Anahtarınız burada. Oda on iki.", "Калидатон ин ҷо. Ҳуҷраи дувоздаҳ.", "Бипурс: кадом ошёна?",
              "Hangi kat?", "Кадом ошёна?", ["Kaçıncı kat?"]),
            t("İkinci kat. Başka soru?", "Ошёнаи дуюм. Боз савол?", "Бипурс: ошхона куҷост?", "Mutfak nerede?",
              "Ошхона куҷост?", ["Mutfak nerede acaba?"]),
            t("Banyonun yanında. Kolay gelsin!", "Паҳлӯи ҳаммом. Кор осон шавад!", "Ташаккури зиёд гӯй",
              "Çok teşekkürler!", "Ташаккури зиёд!", ["Teşekkür ederim!"]),
        ]),
    ]))

# ═════════════════════ 5. Дар дарс ═════════════════════
made.append(pack("class_tr_tg", "Derste", "Дар дарс", "📚", 5, S,
    "Шумо дар дарс ҳастед: салом медиҳед, мегӯед, ки нафаҳмидед, хоҳиш мекунед, ки оҳиста гап "
    "зананд ё такрор кунанд, ва мепурсед, ки калима чӣ маъно дорад.",
    [
        ("Синф", [
            w("Hoca", "муаллим", "Дар донишгоҳ муаллимро «hocam» мегӯянд."),
            w("Kitap", "китоб", None),
            w("Defter", "дафтар", None),
            w("Kalem", "қалам", None),
            w("Sayfa", "саҳифа", None),
            w("Soru", "савол", None),
        ]),
        ("Оғози дарс", [
            t("Günaydın!", "Субҳ ба хайр!", "Салом гӯй", "Günaydın hocam!", "Субҳ ба хайр, устод!", ["Günaydın!"]),
            t("Ali burada mı?", "Алӣ ин ҷост?", "Бигӯ: ҳа, ман ин ҷо", "Evet, buradayım.", "Ҳа, ин ҷоям.", ["Burada!"]),
            t("Kitabı açın.", "Китобро кушоед.", "Бипурс: кадом саҳифа?", "Hangi sayfa?", "Кадом саҳифа?",
              ["Kaçıncı sayfa?"]),
        ]),
        ("Нафаҳмидам", [
            s("Bir daha", "Боз як бор", None),
            s("Yavaş lütfen", "Оҳиста, лутфан", None),
            w("Anladım", "фаҳмидам", None),
            w("Anlamadım", "нафаҳмидам", None),
            s("Hangi sayfa?", "Кадом саҳифа?", None),
            s("Bir soru", "Як савол", None),
        ]),
        ("Оҳиста, лутфан", [
            t("On sayfayı okuyun.", "Саҳифаи даҳро хонед.", "Бигӯ: оҳиста, лутфан", "Yavaş lütfen.", "Оҳиста, лутфан.",
              ["Daha yavaş lütfen."]),
            t("Sayfa on. Anladınız mı?", "Саҳифаи даҳ. Фаҳмидед?", "Бигӯ: ҳа, фаҳмидам", "Evet, anladım.",
              "Ҳа, фаҳмидам.", ["Anladım."]),
            t("Kim okuyacak?", "Кӣ мехонад?", "Бигӯ: ман", "Ben.", "Ман.", ["Ben okurum."]),
        ]),
        ("Саволҳо дар дарс", [
            s("Anlamıyorum.", "Намефаҳмам.", None),
            s("Bir daha lütfen.", "Боз як бор, лутфан.", None),
            s("Bu ne demek?", "Ин чӣ маъно дорад?", None),
            s("Bir sorum var.", "Як савол дорам.", None),
            s("Nasıl yazılır?", "Чӣ хел навишта мешавад?", None),
            s("Kitabım yok.", "Китоб надорам.", None),
        ]),
        ("Калимаи нав", [
            t("Bu kelime ödev.", "Ин калима «ödev» аст.", "Бипурс: ин чӣ маъно дорад?", "Bu ne demek?",
              "Ин чӣ маъно дорад?", ["Ödev ne demek?"]),
            t("Evde yapılan iş.", "Коре, ки дар хона мекунанд.", "Бигӯ: фаҳмидам", "Anladım.", "Фаҳмидам.",
              ["Tamam, anladım."]),
            t("Sorunuz var mı?", "Савол доред?", "Бигӯ: не, ташаккур", "Hayır, teşekkürler.", "Не, ташаккур.",
              ["Yok hocam."]),
        ]),
        ("Ёрӣ дар синф", [
            s("Kalemin var mı?", "Қалам дорӣ?", None),
            s("Kitabımı unuttum.", "Китобамро фаромӯш кардам.", None),
            s("Özür dilerim, geciktim.", "Бубахшед, дер кардам.", None),
            s("Girebilir miyim?", "Даромада метавонам?", None),
            s("Sorabilir miyim?", "Пурсида метавонам?", None),
            s("Yarın görüşürüz!", "То фардо!", None),
        ]),
        ("Дер кардам", [
            t("Evet? Gelin.", "Ҳа? Дароед.", "Бигӯ: бубахшед, дер кардам", "Özür dilerim, geciktim.",
              "Бубахшед, дер кардам.", ["Pardon, geciktim."]),
            t("Sorun değil. Oturun.", "Мушкил нест. Шинед.", "Ташаккур гӯй", "Teşekkürler.", "Ташаккур.",
              ["Teşekkür ederim hocam."]),
            t("Sayfa ondayız.", "Мо дар саҳифаи даҳем.", "Бигӯ: хуб", "Tamam.", "Хуб.", ["Peki."]),
        ]),
        ("Миссия: дарси аввал", [
            t("Günaydın! Adınız ne?", "Субҳ ба хайр! Номатон чист?", "Номи худро гӯй: Алӣ", "Adım Ali.", "Номи ман Алӣ.",
              ["Ben Ali."]),
            t("Kitabınız var mı?", "Китоб доред?", "Бигӯ: не, китоб надорам", "Hayır, kitabım yok.", "Не, китоб надорам.",
              ["Yok."]),
            t("Sorun değil. Emre ile okuyun.", "Мушкил нест. Бо Эмре хонед.", "Бигӯ: хуб, ташаккур",
              "Tamam, teşekkürler.", "Хуб, ташаккур.", ["Teşekkür ederim."]),
            t("Sayfa on iki.", "Саҳифаи дувоздаҳ.", "Бигӯ: боз як бор, лутфан", "Bir daha lütfen.",
              "Боз як бор, лутфан.", ["Hangi sayfa?"]),
        ]),
    ]))

# ═════════════════════ 7. Ҷадвали дарсҳо ═════════════════════
made.append(pack("timetable_tr_tg", "Ders programı", "Ҷадвали дарсҳо", "🗓️", 7, S,
    "Шумо ҷадвали дарсҳоро меомӯзед: рӯзҳои ҳафта, вақти дарс, кадом синфхона. Аз ҳамкурс "
    "мепурсед, ки фардо дарс ҳаст ё не.",
    [
        ("Рӯзҳо", [
            w("Pazartesi", "душанбе", None),
            w("Salı", "сешанбе", None),
            w("Çarşamba", "чоршанбе", None),
            w("Perşembe", "панҷшанбе", None),
            w("Cuma", "ҷумъа", None),
            w("Program", "ҷадвал", None),
        ]),
        ("Кай дарс?", [
            t("Bugün dersin var mı?", "Имрӯз дарс дорӣ?", "Бигӯ: ҳа", "Evet.", "Ҳа.", ["Evet, var."]),
            t("Saat kaçta?", "Соати чанд?", "Бигӯ: соати нӯҳ", "Saat dokuzda.", "Соати нӯҳ.", ["Dokuzda."]),
            t("Yarın?", "Фардо?", "Бигӯ: не", "Hayır.", "Не.", ["Yarın yok."]),
        ]),
        ("Вақт", [
            s("Saat dokuzda", "Соати нӯҳ", None),
            s("Saat onda", "Соати даҳ", None),
            s("Bugün tatil", "Имрӯз дам", None),
            s("Hangi sınıf?", "Кадом синфхона?", None),
            s("Her pazartesi", "Ҳар душанбе", None),
            s("Cuma günü", "Рӯзи ҷумъа", None),
        ]),
        ("Дар кадом синфхона?", [
            t("Türkçe saat onda.", "Туркӣ соати даҳ.", "Бипурс: кадом синфхона?", "Hangi sınıf?", "Кадом синфхона?",
              ["Hangi sınıfta?"]),
            t("Yirmi numara.", "Рақами бист.", "Бипурс: кадом рӯз?", "Hangi gün?", "Кадом рӯз?", ["Ne zaman?"]),
            t("Her pazartesi.", "Ҳар душанбе.", "Бигӯ: хуб, ташаккур", "Tamam, teşekkürler.", "Хуб, ташаккур.",
              ["Sağ ol."]),
        ]),
        ("Ҷадвали ман", [
            s("Pazartesi Türkçe var.", "Душанбе туркӣ ҳаст.", None),
            s("Ders dokuzda başlıyor.", "Дарс соати нӯҳ сар мешавад.", None),
            s("Cuma günü boşum.", "Ҷумъа озодам.", None),
            own("Dersim ___ günü.", "Дарси ман рӯзи ___.", "Рӯзи дарси худро гӯед.",
                "Dersin ne zaman?", "Дарсат кай?", "Рӯзи дарсатонро гӯед"),
            s("Hoca kim?", "Муаллим кист?", None),
            s("Sınıf nerede?", "Синфхона куҷост?", None),
        ]),
        ("Ҷадвал куҷост?", [
            t("Programın var mı?", "Ҷадвал дорӣ?", "Бигӯ: не", "Hayır.", "Не.", ["Yok."]),
            t("İnternette var.", "Дар интернет ҳаст.", "Бигӯ: хуб, ташаккур", "Tamam, teşekkürler.", "Хуб, ташаккур.",
              ["Sağ ol."]),
            t("Pazartesi Türkçe var.", "Душанбе туркӣ ҳаст.", "Бипурс: соати чанд?", "Saat kaçta?", "Соати чанд?",
              ["Ne zaman?"]),
        ]),
        ("Тағйир дар ҷадвал", [
            s("Bugün ders yok mu?", "Имрӯз дарс нест?", None),
            s("Hoca hasta.", "Муаллим бемор аст.", None),
            s("Sınıf değişti.", "Синфхона иваз шуд.", None),
            s("Ne zamana kadar?", "То кай?", None),
            s("Yarın gelirim.", "Фардо меоям.", None),
            s("Haber için teşekkürler.", "Барои хабар ташаккур.", None),
        ]),
        ("Дарс нест", [
            t("Bugün ders yok.", "Имрӯз дарс нест.", "Бипурс: чаро?", "Neden?", "Чаро?", ["Niye?"]),
            t("Hoca hasta.", "Муаллим бемор аст.", "Бипурс: ва фардо?", "Ya yarın?", "Ва фардо?", ["Yarın da mı?"]),
            t("Yarın dokuzda, her zamanki gibi.", "Фардо соати нӯҳ, мисли ҳамеша.", "Бигӯ: барои хабар ташаккур",
              "Haber için teşekkürler.", "Барои хабар ташаккур.", ["Sağ ol."]),
        ]),
        ("Миссия: ҳафтаи нав", [
            t("Selam! Yarın dersin var mı?", "Салом! Фардо дарс дорӣ?", "Бигӯ: ҳа, соати нӯҳ", "Evet, saat dokuzda.",
              "Ҳа, соати нӯҳ.", ["Evet, var."]),
            t("Hangi sınıf?", "Кадом синфхона?", "Бигӯ: рақами бист", "Yirmi numara.", "Рақами бист.", ["Yirmi."]),
            t("Cuma günü?", "Рӯзи ҷумъа?", "Бигӯ: ҷумъа озодам", "Cuma günü boşum.", "Ҷумъа озодам.", ["Cuma boşum."]),
            t("Süper! Yarın görüşürüz!", "Олӣ! То фардо!", "Бигӯ: то фардо", "Yarın görüşürüz!", "То фардо!",
              ["Görüşürüz!"]),
        ]),
    ]))

# ═════════════════════ 8. Дар китобхона ═════════════════════
made.append(pack("library_tr_tg", "Kütüphanede", "Дар китобхона", "📖", 8, S,
    "Шумо ба китобхона меравед: китоб меҷӯед, мепурсед, ки онро ба хона гирифтан мумкин аст, "
    "то кай бояд баргардонед ва рамзи Wi-Fi чист.",
    [
        ("Китобхона", [
            w("Kütüphane", "китобхона", None),
            w("Ödünç", "ба қарз (муваққатӣ)", None),
            w("İade", "баргардонидан", None),
            w("Sessiz", "ором, бесадо", None),
            w("Yer", "ҷой", None),
            w("Şifre", "рамз", None),
        ]),
        ("Китоб меҷӯям", [
            t("Merhaba! Ne arıyorsunuz?", "Салом! Чӣ меҷӯед?", "Бигӯ: як китоб", "Bir kitap.", "Як китоб.",
              ["Bir kitap arıyorum."]),
            t("Hangi kitap?", "Кадом китоб?", "Бигӯ: китоби туркӣ", "Türkçe kitabı.", "Китоби туркӣ.",
              ["Türkçe için kitap."]),
            t("Orada.", "Он ҷо.", "Ташаккур гӯй", "Teşekkürler.", "Ташаккур.", ["Teşekkür ederim."]),
        ]),
        ("Қоидаҳо", [
            s("Sessiz lütfen", "Ором, лутфан", None),
            s("İki hafta", "Ду ҳафта", None),
            s("Öğrenci kartım", "Корти донишҷӯиам", None),
            s("Boş yer", "Ҷои холӣ", None),
            s("İnternet şifresi", "Рамзи интернет", None),
            s("Pazartesiye kadar", "То душанбе", None),
        ]),
        ("Ба хона гирифтан", [
            t("Kitabı ödünç almak ister misiniz?", "Китобро гирифтан мехоҳед?", "Бигӯ: ҳа, лутфан", "Evet, lütfen.",
              "Ҳа, лутфан.", ["Evet."]),
            t("Kartınız lütfen.", "Кортатон, лутфан.", "Бигӯ: марҳамат", "Buyurun.", "Марҳамат.", ["Buyurun, kartım."]),
            t("İki hafta.", "Ду ҳафта.", "Бигӯ: хуб, ташаккур", "Tamam, teşekkürler.", "Хуб, ташаккур.", ["Tamam."]),
        ]),
        ("Саволҳо дар китобхона", [
            s("Kitaplar nerede?", "Китобҳо куҷоянд?", None),
            s("Bunu alabilir miyim?", "Инро гирифта метавонам?", None),
            s("Ne zamana kadar?", "То кай?", None),
            s("Fotokopi nerede?", "Нусхабардорӣ куҷост?", None),
            s("Burası boş mu?", "Ин ҷо холист?", None),
            s("Şifre ne?", "Рамз чист?", None),
        ]),
        ("Wi-Fi", [
            t("Buyurun?", "Марҳамат?", "Бипурс: рамзи интернет чист?", "İnternet şifresi ne?", "Рамзи интернет чист?",
              ["Şifre ne?"]),
            t("Kartın arkasında.", "Дар пушти корт.", "Ташаккур гӯй", "Teşekkürler.", "Ташаккур.", ["Sağ olun."]),
            t("Burada sessiz lütfen.", "Ин ҷо ором, лутфан.", "Бигӯ: бубахшед", "Özür dilerim.", "Бубахшед.",
              ["Pardon."]),
        ]),
        ("Баргардонидан", [
            s("Kitabı iade ediyorum.", "Китобро бармегардонам.", None),
            s("Kitap gecikti.", "Китоб дер монд.", None),
            s("Ceza ne kadar?", "Ҷарима чанд?", None),
            s("Bir hafta daha.", "Боз як ҳафта.", None),
            s("Bu kitap lazım.", "Ин китоб лозим.", None),
            s("Kütüphane kapalı.", "Китобхона баста аст.", None),
        ]),
        ("Китоб дер монд", [
            t("Kitap bir hafta gecikti.", "Китоб як ҳафта дер монд.", "Бигӯ: бубахшед", "Özür dilerim.", "Бубахшед.",
              ["Çok özür dilerim."]),
            t("Ceza on lira.", "Ҷарима даҳ лира.", "Бигӯ: хуб, марҳамат", "Tamam, buyurun.", "Хуб, марҳамат.",
              ["Buyurun."]),
            t("Teşekkürler. Başka?", "Ташаккур. Боз?", "Бигӯ: не, ташаккур", "Hayır, teşekkürler.", "Не, ташаккур.",
              ["Yok, sağ olun."]),
        ]),
        ("Миссия: китоб гирифтан", [
            t("Merhaba! Yardım edebilir miyim?", "Салом! Ёрӣ диҳам?", "Бигӯ: як китоб меҷӯям", "Bir kitap arıyorum.",
              "Як китоб меҷӯям.", ["Kitap arıyorum."]),
            t("İşte. Ödünç almak ister misiniz?", "Мана. Гирифтан мехоҳед?", "Бигӯ: ҳа, лутфан", "Evet, lütfen.",
              "Ҳа, лутфан.", ["Evet."]),
            t("Kartınız lütfen.", "Кортатон, лутфан.", "Бигӯ: марҳамат", "Buyurun.", "Марҳамат.", ["Buyurun, kartım."]),
            t("Tamam. İki hafta.", "Хуб. Ду ҳафта.", "Бипурс: то кай?", "Ne zamana kadar?", "То кай?",
              ["Hangi güne kadar?"]),
        ]),
    ]))

# ═════════════════════ 9. Ҳамкурсон ═════════════════════
made.append(pack("classmates_tr_tg", "Sınıf arkadaşları", "Ҳамкурсон", "👫", 9, S,
    "Бо ҳамкурсон шинос мешавед: мепурсед, ки аз куҷоянд ва чӣ мехонанд, рақами телефонро "
    "иваз мекунед ва якҷоя ба чой ё ба дарс тайёрӣ даъват мекунед.",
    [
        ("Ҳамкурсон", [
            w("Arkadaş", "дӯст", None),
            w("Beraber", "якҷоя", None),
            w("Numara", "рақам", None),
            w("Çay", "чой", None),
            w("Çalışmak", "дарс тайёр кардан, кор кардан", None),
            w("Grup", "гурӯҳ", None),
        ]),
        ("Шиносоӣ", [
            t("Selam! Yeni misin?", "Салом! Навӣ?", "Бигӯ: ҳа", "Evet.", "Ҳа.", ["Evet, yeniyim."]),
            t("Ben Zeynep. Sen?", "Ман Зейнеп. Ту?", "Номи худро гӯй: Алӣ", "Ben Ali.", "Ман Алӣ.", ["Adım Ali."]),
            t("Memnun oldum!", "Шодам!", "Бигӯ: ман ҳам", "Ben de.", "Ман ҳам.", ["Ben de memnun oldum."]),
        ]),
        ("Саволҳо", [
            s("Tacikistan'dan", "Аз Тоҷикистон", None),
            s("Hangi bölüm?", "Кадом ихтисос?", None),
            s("Numaran ne?", "Рақамат чист?", None),
            w("Memnuniyetle", "бо камоли майл", None),
            s("Maalesef olmaz", "Афсӯс, намешавад", None),
            s("Sonra görüşürüz", "Баъд мебинем", None),
        ]),
        ("Аз куҷоӣ?", [
            t("Nerelisin?", "Аз куҷоӣ?", "Бигӯ: аз Тоҷикистон", "Tacikistanlıyım.", "Ман аз Тоҷикистонам.",
              ["Tacikistan'dan."]),
            t("Ne güzel! Ne okuyorsun?", "Чӣ хуб! Чӣ мехонӣ?", "Бигӯ: туркӣ", "Türkçe.", "Туркӣ.",
              ["Türkçe okuyorum."]),
            t("Ben de!", "Ман ҳам!", "Бигӯ: олӣ!", "Süper!", "Олӣ!", ["Harika!"]),
        ]),
        ("Дар бораи ман", [
            s("Yurtta kalıyorum.", "Дар хобгоҳ зиндагӣ мекунам.", None),
            s("Çok çalışıyorum.", "Бисёр мехонам.", None),
            s("Biraz Türkçe biliyorum.", "Каме туркӣ медонам.", None),
            own("___ okuyorum.", "Ман ___ мехонам.", "Ихтисоси худро гӯед.",
                "Ne okuyorsun?", "Чӣ мехонӣ?", "Ихтисоси худро гӯед"),
            s("Vaktin var mı?", "Вақт дорӣ?", None),
            s("Beraber çalışalım mı?", "Якҷоя мехонем?", None),
        ]),
        ("Рақами телефон", [
            t("WhatsApp'ın var mı?", "WhatsApp дорӣ?", "Бигӯ: ҳа", "Evet.", "Ҳа.", ["Evet, var."]),
            t("Numaranı verir misin?", "Рақаматро медиҳӣ?", "Бигӯ: бо камоли майл", "Memnuniyetle.",
              "Бо камоли майл.", ["Tabii, buyur."]),
            t("Sağ ol! Sana yazarım.", "Ташаккур! Ба ту менависам.", "Бигӯ: хуб", "Tamam.", "Хуб.", ["Olur."]),
        ]),
        ("Даъват", [
            s("Çay içelim mi?", "Чой нӯшем?", None),
            s("Bugün vaktim var.", "Имрӯз вақт дорам.", None),
            s("Bugün olmaz.", "Имрӯз намешавад.", None),
            s("Belki yarın.", "Шояд фардо.", None),
            s("Nerede buluşalım?", "Куҷо вохӯрем?", None),
            s("Kütüphanenin önünde.", "Назди китобхона.", None),
        ]),
        ("Чой нӯшем?", [
            t("Çay içelim mi?", "Чой нӯшем?", "Бигӯ: бо камоли майл", "Memnuniyetle!", "Бо камоли майл!",
              ["Olur!", "İyi fikir."]),
            t("Ne zaman vaktin var?", "Кай вақт дорӣ?", "Бигӯ: баъди дарс", "Dersten sonra.", "Баъди дарс.",
              ["Saat ikide."]),
            t("Tamam, kütüphanenin önünde.", "Хуб, назди китобхона.", "Бигӯ: баъд мебинем", "Sonra görüşürüz!",
              "Баъд мебинем!", ["Görüşürüz!"]),
        ]),
        ("Миссия: дӯсти нав", [
            t("Selam! Adın ne?", "Салом! Номат чист?", "Номи худро гӯй: Алӣ", "Adım Ali.", "Номи ман Алӣ.",
              ["Ben Ali."]),
            t("Nerelisin?", "Аз куҷоӣ?", "Бигӯ: аз Тоҷикистон", "Tacikistanlıyım.", "Ман аз Тоҷикистонам.",
              ["Tacikistan'dan."]),
            t("Beraber çalışalım mı?", "Якҷоя мехонем?", "Бигӯ: бо камоли майл", "Memnuniyetle!", "Бо камоли майл!",
              ["Olur!"]),
            t("Numaranı verir misin?", "Рақаматро медиҳӣ?", "Бигӯ: албатта, марҳамат", "Tabii, buyur.",
              "Албатта, марҳамат.", ["Memnuniyetle."]),
        ]),
    ]))

# ═════════════════════ 11. Ёрӣ пурсидан ═════════════════════
made.append(pack("help_tr_tg", "Yardım istemek", "Ёрӣ пурсидан", "🙋", 11, S,
    "Шумо чизеро намедонед: роҳро мепурсед, хоҳиш мекунед, ки дар вазифа ёрӣ диҳанд, вақти "
    "қабули муаллимро мепурсед ва ташаккур мегӯед.",
    [
        ("Ёрӣ", [
            w("Yardım", "ёрӣ", None),
            w("Sorun", "мушкил", None),
            w("Ödev", "вазифаи хонагӣ", None),
            w("Randevu", "вақти қабул", None),
            w("Zor", "душвор", None),
            w("Kolay", "осон", None),
        ]),
        ("Роҳ гум кардам", [
            t("Yardım edeyim mi?", "Ёрӣ диҳам?", "Бигӯ: ҳа, лутфан", "Evet, lütfen.", "Ҳа, лутфан.", ["Evet."]),
            t("Ne arıyorsun?", "Чӣ меҷӯӣ?", "Бигӯ: синфхонаи бист", "Yirmi numaralı sınıf.", "Синфхонаи бист.",
              ["Sınıf yirmi."]),
            t("Orada, solda.", "Он ҷо, тарафи чап.", "Ташаккур гӯй", "Teşekkürler!", "Ташаккур!", ["Sağ ol!"]),
        ]),
        ("Хоҳиш", [
            s("Yardım lütfen", "Ёрӣ, лутфан", None),
            s("Sorun yok", "Мушкил нест", None),
            s("Çok zor", "Хеле душвор", None),
            s("Bir dakika", "Як дақиқа", None),
            w("Tabii", "албатта", None),
            s("Çok teşekkürler", "Ташаккури зиёд", None),
        ]),
        ("Вазифа душвор аст", [
            t("Ödevi yaptın mı?", "Вазифаро кардӣ?", "Бигӯ: не, хеле душвор", "Hayır, çok zor.", "Не, хеле душвор.",
              ["Hayır."]),
            t("Ben yardım ederim.", "Ман ёрӣ медиҳам.", "Ташаккури зиёд гӯй", "Çok teşekkürler!", "Ташаккури зиёд!",
              ["Sağ ol!"]),
            t("Sorun değil.", "Мушкил нест.", "Бигӯ: ту хеле меҳрубонӣ", "Çok naziksin.", "Ту хеле меҳрубонӣ.",
              ["Sağ ol."]),
        ]),
        ("Ба ман ёрӣ лозим", [
            s("Yardıma ihtiyacım var.", "Ба ман ёрӣ лозим.", None),
            s("Ödevi anlamıyorum.", "Вазифаро намефаҳмам.", None),
            s("Bana yardım eder misiniz?", "Ба ман ёрӣ медиҳед?", None),
            s("Ne zaman müsaitsiniz?", "Кай озодед?", None),
            s("Bir sorunum var.", "Як мушкил дорам.", None),
            s("Şimdi anladım.", "Ҳоло фаҳмидам.", None),
        ]),
        ("Назди муаллим", [
            t("Buyurun?", "Марҳамат?", "Бигӯ: ба ман ёрӣ лозим", "Yardıma ihtiyacım var.", "Ба ман ёрӣ лозим.",
              ["Bir sorunum var."]),
            t("Sorun ne?", "Мушкил чист?", "Бигӯ: вазифаро намефаҳмам", "Ödevi anlamıyorum.", "Вазифаро намефаҳмам.",
              ["Ödev çok zor."]),
            t("Pazartesi gelin.", "Душанбе биёед.", "Бипурс: соати чанд?", "Saat kaçta?", "Соати чанд?",
              ["Ne zaman?"]),
        ]),
        ("Ташаккур", [
            s("Yardım için teşekkürler.", "Барои ёрӣ ташаккур.", None),
            s("Çok naziksiniz.", "Шумо хеле меҳрубонед.", None),
            s("Şimdi anlıyorum.", "Ҳоло мефаҳмам.", None),
            s("Ben de yardım ederim.", "Ман ҳам ёрӣ медиҳам.", None),
            s("Rica ederim.", "Арзише надорад.", None),
            s("Pazartesi görüşürüz!", "То душанбе!", None),
        ]),
        ("Ҳоло фаҳмо шуд", [
            t("Şimdi anladın mı?", "Ҳоло фаҳмидӣ?", "Бигӯ: ҳа, ҳоло мефаҳмам", "Evet, şimdi anlıyorum.",
              "Ҳа, ҳоло мефаҳмам.", ["Evet, anladım."]),
            t("Süper!", "Олӣ!", "Барои ёрӣ ташаккур гӯй", "Yardım için teşekkürler.", "Барои ёрӣ ташаккур.",
              ["Çok teşekkürler!"]),
            t("Rica ederim.", "Арзише надорад.", "Бигӯ: то душанбе", "Pazartesi görüşürüz!", "То душанбе!",
              ["Görüşürüz!"]),
        ]),
        ("Миссия: вазифаи душвор", [
            t("Selam! Nasılsın?", "Салом! Чӣ хел?", "Бигӯ: як мушкил дорам", "Bir sorunum var.", "Як мушкил дорам.",
              ["İyi değilim, sorunum var."]),
            t("Ne oldu?", "Чӣ шуд?", "Бигӯ: вазифаро намефаҳмам", "Ödevi anlamıyorum.", "Вазифаро намефаҳмам.",
              ["Ödev çok zor."]),
            t("Yardım ederim. Bak.", "Ёрӣ медиҳам. Нигоҳ кун.", "Бигӯ: ҳоло фаҳмидам", "Şimdi anladım.",
              "Ҳоло фаҳмидам.", ["Şimdi anlıyorum."]),
            t("Güzel!", "Хуб!", "Барои ёрӣ ташаккур гӯй", "Yardım için teşekkürler!", "Барои ёрӣ ташаккур!",
              ["Çok teşekkürler!"]),
        ]),
    ]))

# ═════════════════════ 12. Вазифа ва имтиҳон ═════════════════════
made.append(pack("exams_tr_tg", "Ödevler ve sınavlar", "Вазифа ва имтиҳон", "📝", 12, S,
    "Вақти имтиҳон: мепурсед, ки имтиҳон кай ва дар куҷост, чӣ лозим, баҳоатонро мефаҳмед ва "
    "бо ҳамкурс гап мезанед.",
    [
        ("Имтиҳон", [
            w("Sınav", "имтиҳон", None),
            w("Test", "тест", None),
            w("Not", "баҳо", None),
            w("Geçtim", "гузаштам", None),
            w("Ödev", "вазифа", None),
            w("Önemli", "муҳим", None),
        ]),
        ("Имтиҳон кай?", [
            t("Sınav yakında.", "Имтиҳон наздик аст.", "Бипурс: кай?", "Ne zaman?", "Кай?", ["Sınav ne zaman?"]),
            t("Cuma günü.", "Рӯзи ҷумъа.", "Бипурс: соати чанд?", "Saat kaçta?", "Соати чанд?", ["Kaçta?"]),
            t("Saat onda.", "Соати даҳ.", "Бигӯ: хуб, ташаккур", "Tamam, teşekkürler.", "Хуб, ташаккур.", ["Sağ ol."]),
        ]),
        ("Тайёрӣ", [
            s("Cuma günü", "Рӯзи ҷумъа", None),
            s("Hangi sınıf?", "Кадом синфхона?", None),
            s("İki saat", "Ду соат", None),
            s("Ders çalışıyorum", "Дарс тайёр мекунам", None),
            s("Başarılar!", "Барори кор!", None),
            s("İyi not", "Баҳои хуб", None),
        ]),
        ("Чӣ лозим?", [
            t("Sınav hakkında soru var mı?", "Дар бораи имтиҳон савол ҳаст?", "Бипурс: кадом синфхона?",
              "Hangi sınıf?", "Кадом синфхона?", ["Hangi sınıfta?"]),
            t("Yirmi numara.", "Рақами бист.", "Бипурс: чанд соат?", "Kaç saat?", "Чанд соат?", ["Ne kadar sürer?"]),
            t("İki saat.", "Ду соат.", "Бигӯ: хуб, ташаккур", "Tamam, teşekkürler.", "Хуб, ташаккур.", ["Sağ olun."]),
        ]),
        ("Ман тайёрам", [
            s("Sınava çalışıyorum.", "Барои имтиҳон тайёрӣ мебинам.", None),
            s("Sınav zor.", "Имтиҳон душвор аст.", None),
            s("Vaktim yok.", "Вақт надорам.", None),
            s("Kitap lazım mı?", "Китоб лозим аст?", None),
            s("Hazırım.", "Тайёрам.", None),
            s("Ödevim nerede?", "Вазифаам куҷост?", None),
        ]),
        ("Вазифаи хонагӣ", [
            t("Ödevin nerede?", "Вазифаат куҷост?", "Бигӯ: марҳамат", "Buyurun.", "Марҳамат.", ["Burada hocam."]),
            t("Güzel. Ya test?", "Хуб. Ва тест?", "Бигӯ: тайёрам", "Hazırım.", "Тайёрам.", ["Hazır."]),
            t("Çok iyi!", "Хеле хуб!", "Ташаккур гӯй", "Teşekkürler.", "Ташаккур.", ["Teşekkür ederim hocam."]),
        ]),
        ("Баҳо", [
            s("Notum ne?", "Баҳоам чӣ?", None),
            s("Sınavı geçtim!", "Имтиҳонро супоридам!", None),
            s("Geçemedim.", "Нагузаштам.", None),
            s("Başka sınav var mı?", "Боз имтиҳон ҳаст?", None),
            s("Çok mutluyum.", "Хеле хурсандам.", None),
            s("Bu iyi.", "Ин хуб аст.", None),
        ]),
        ("Натиҷа", [
            t("Notlar açıklandı.", "Баҳоҳо эълон шуд.", "Бипурс: баҳоам чӣ?", "Notum ne?", "Баҳоам чӣ?",
              ["Benim notum ne?"]),
            t("Seksen beş. Geçtin.", "Ҳаштоду панҷ. Гузаштӣ.", "Бигӯ: хеле хурсандам!", "Çok mutluyum!",
              "Хеле хурсандам!", ["Harika!"]),
            t("Tebrikler!", "Табрик!", "Ташаккури зиёд гӯй", "Çok teşekkürler!", "Ташаккури зиёд!", ["Sağ olun!"]),
        ]),
        ("Миссия: имтиҳон", [
            t("Selam! Sınava çalışıyor musun?", "Салом! Барои имтиҳон тайёрӣ мебинӣ?", "Бигӯ: ҳа, бисёр",
              "Evet, çok çalışıyorum.", "Ҳа, бисёр тайёрӣ мебинам.", ["Evet."]),
            t("Sınav ne zaman?", "Имтиҳон кай аст?", "Бигӯ: рӯзи ҷумъа", "Cuma günü.", "Рӯзи ҷумъа.",
              ["Cuma saat onda."]),
            t("Zor mu?", "Душвор аст?", "Бигӯ: ҳа, душвор", "Evet, zor.", "Ҳа, душвор.", ["Biraz."]),
            t("Başarılar!", "Барори кор!", "Ташаккур гӯй", "Teşekkürler!", "Ташаккур!", ["Sana da!"]),
        ]),
    ]))

# ═════════════════════ 13. Ошхонаи донишгоҳ ═════════════════════
made.append(pack("cafe_tr_tg", "Yemekhanede", "Ошхонаи донишгоҳ", "🥪", 13, S,
    "Шумо дар ошхонаи донишгоҳ (yemekhane) хӯрок мегиред: мепурсед, ки имрӯз чӣ ҳаст, гӯшти хук "
    "надорад ва бо корти донишҷӯӣ пардохт мекунед.",
    [
        ("Хӯрок", [
            w("Yemek", "хӯрок", None),
            w("Çorba", "шӯрбо", None),
            w("Pilav", "палав, биринҷ", None),
            w("Tavuk", "мурғ", None),
            w("Et", "гӯшт", None),
            w("Ayran", "айрон", None),
        ]),
        ("Имрӯз чӣ ҳаст?", [
            t("Buyurun, ne alırsınız?", "Марҳамат, чӣ мегиред?", "Бипурс: имрӯз чӣ ҳаст?", "Bugün ne var?",
              "Имрӯз чӣ ҳаст?", ["Ne var bugün?"]),
            t("Çorba ve tavuk.", "Шӯрбо ва мурғ.", "Бигӯ: мурғ, лутфан", "Tavuk lütfen.", "Мурғ, лутфан.",
              ["Tavuk alayım."]),
            t("Pilavlı mı?", "Бо палав?", "Бигӯ: ҳа, лутфан", "Evet, lütfen.", "Ҳа, лутфан.", ["Evet."]),
        ]),
        ("Фармоиш", [
            s("Pilavla", "Бо палав", None),
            s("Etsiz", "Бе гӯшт", None),
            s("Bir ayran", "Як айрон", None),
            s("Bir su", "Як об", None),
            s("Kartla", "Бо корт", None),
            s("Afiyet olsun!", "Ош шавад!", None),
        ]),
        ("Нӯшокӣ", [
            t("İçecek?", "Нӯшокӣ?", "Бигӯ: як айрон", "Bir ayran.", "Як айрон.", ["Ayran lütfen."]),
            t("Başka?", "Боз?", "Бигӯ: не, ташаккур", "Hayır, teşekkürler.", "Не, ташаккур.", ["Yok, sağ olun."]),
            t("Afiyet olsun!", "Ош шавад!", "Ташаккур гӯй", "Teşekkürler.", "Ташаккур.", ["Sağ olun."]),
        ]),
        ("Ман мехоҳам…", [
            s("Çorba istiyorum.", "Шӯрбо мехоҳам.", None),
            s("Bu etli mi?", "Ин бо гӯшт аст?", None),
            s("Bu ne kadar?", "Ин чанд пул?", None),
            s("Kartla ödüyorum.", "Бо корт пардохт мекунам.", None),
            s("Çok lezzetli.", "Хеле бомаза.", None),
            s("Ekmek alabilir miyim?", "Нон гирифта метавонам?", None),
        ]),
        ("Дар касса", [
            t("Tavuk ve ayran mı?", "Мурғ ва айрон?", "Бигӯ: ҳа", "Evet.", "Ҳа.", ["Evet, doğru."]),
            t("Yirmi lira.", "Бист лира.", "Бигӯ: бо корт пардохт мекунам", "Kartla ödüyorum.",
              "Бо корт пардохт мекунам.", ["Kartla."]),
            t("Teşekkürler. Afiyet olsun!", "Ташаккур. Ош шавад!", "Ташаккур гӯй", "Sağ olun!", "Ташаккур!",
              ["Teşekkürler!"]),
        ]),
        ("Дар сари миз", [
            s("Burası boş mu?", "Ин ҷо холист?", None),
            s("Buyur otur.", "Марҳамат, шин.", None),
            s("Yemek nasıl?", "Хӯрок чӣ хел?", None),
            s("Çok güzel!", "Хеле хуб!", None),
            s("Çok açım.", "Хеле гуруснаам.", None),
            s("Doydum.", "Сер шудам.", None),
        ]),
        ("Ҷой холист?", [
            t("Evet?", "Ҳа?", "Бипурс: ин ҷо холист?", "Burası boş mu?", "Ин ҷо холист?", ["Boş mu?"]),
            t("Evet, buyur otur!", "Ҳа, марҳамат, шин!", "Ташаккур гӯй", "Sağ ol!", "Ташаккур!", ["Teşekkürler."]),
            t("Çorba nasıl?", "Шӯрбо чӣ хел?", "Бигӯ: хеле бомаза", "Çok lezzetli!", "Хеле бомаза!", ["Güzel!"]),
        ]),
        ("Миссия: хӯроки нисфирӯзӣ", [
            t("Buyurun, ne alırsınız?", "Марҳамат, чӣ мегиред?", "Бипурс: ин бо гӯшт аст?", "Bu etli mi?",
              "Ин бо гӯшт аст?", ["Et var mı?"]),
            t("Hayır, bu tavuk.", "Не, ин мурғ.", "Бигӯ: мурғ бо палав, лутфан", "Tavuk pilav lütfen.",
              "Мурғ бо палав, лутфан.", ["Tavuk lütfen."]),
            t("İçecek?", "Нӯшокӣ?", "Бигӯ: як об", "Bir su.", "Як об.", ["Su lütfen."]),
            t("Yirmi beş lira.", "Бисту панҷ лира.", "Бигӯ: бо корт", "Kartla.", "Бо корт.", ["Kartla ödüyorum."]),
        ]),
    ]))

# ═════════════════════ 15. Бонк ва стипендия ═════════════════════
made.append(pack("bank_tr_tg", "Banka ve burs", "Бонк ва стипендия", "🏦", 15, S,
    "Шумо ба бонк меравед: ҳисоб мекушоед, ҳуҷҷатҳоро медиҳед, корти бонкӣ мегиред ва мепурсед, "
    "ки стипендия (burs) кай меояд.",
    [
        ("Бонк", [
            w("Banka", "бонк", None),
            w("Hesap", "ҳисоб", None),
            w("Kart", "корт", None),
            w("Para", "пул", None),
            w("Burs", "стипендия", None),
            w("Bankamatik", "банкомат", None),
        ]),
        ("Ҳисоб кушодан", [
            t("Merhaba! Nasıl yardım edebilirim?", "Салом! Чӣ ёрӣ диҳам?", "Бигӯ: ҳисоб мехоҳам",
              "Hesap açmak istiyorum.", "Ҳисоб кушодан мехоҳам.", ["Hesap lazım."]),
            t("Sıra numaranız var mı?", "Рақами навбат доред?", "Бигӯ: не", "Hayır.", "Не.", ["Yok."]),
            t("Lütfen numara alın.", "Лутфан рақам гиред.", "Бигӯ: хуб", "Tamam.", "Хуб.", ["Peki."]),
        ]),
        ("Ҳуҷҷатҳо", [
            w("Pasaportum", "шиносномаи ман", None),
            w("Adresim", "суроғаи ман", None),
            s("Yeni hesap", "Ҳисоби нав", None),
            s("Banka kartı", "Корти бонкӣ", None),
            w("İmza", "имзо", None),
            s("Buraya imza", "Ин ҷо имзо", None),
        ]),
        ("Шиноснома ва суроға", [
            t("Pasaportunuz lütfen.", "Шиносномаатон, лутфан.", "Бигӯ: марҳамат", "Buyurun.", "Марҳамат.",
              ["Pasaportum burada."]),
            t("Adresiniz?", "Суроғаатон?", "Бигӯ: хобгоҳи донишҷӯён", "Öğrenci yurdu.", "Хобгоҳи донишҷӯён.",
              ["Yurtta kalıyorum."]),
            t("Buraya imza lütfen.", "Ин ҷо имзо, лутфан.", "Бигӯ: хуб", "Tamam.", "Хуб.", ["Buraya mı?"]),
        ]),
        ("Саволҳо дар бонк", [
            s("Hesap açmak istiyorum.", "Ҳисоб кушодан мехоҳам.", None),
            s("Hesap ücretli mi?", "Ҳисоб пулӣ аст?", None),
            s("Kart ne zaman gelir?", "Корт кай меояд?", None),
            s("Ben öğrenciyim.", "Ман донишҷӯ ҳастам.", None),
            s("Bankamatik nerede?", "Банкомат куҷост?", None),
            s("Bunu anlamadım.", "Инро нафаҳмидам.", None),
        ]),
        ("Корт", [
            t("Tamam! Hesabınız hazır.", "Хуб! Ҳисобатон тайёр.", "Бипурс: корт кай меояд?", "Kart ne zaman gelir?",
              "Корт кай меояд?", ["Ya kart?"]),
            t("Bir hafta sonra.", "Баъди як ҳафта.", "Бигӯ: хуб, ташаккур", "Tamam, teşekkürler.", "Хуб, ташаккур.",
              ["Teşekkür ederim."]),
            t("Öğrenciler için ücretsiz.", "Барои донишҷӯён ройгон.", "Бигӯ: олӣ!", "Harika!", "Олӣ!", ["Süper!"]),
        ]),
        ("Стипендия", [
            s("Burs ne zaman gelir?", "Стипендия кай меояд?", None),
            s("Her ay.", "Ҳар моҳ.", None),
            s("Para gelmedi.", "Пул наомад.", None),
            s("Para çekmek istiyorum.", "Пул гирифтан мехоҳам.", None),
            s("Para göndermek istiyorum.", "Пул фиристодан мехоҳам.", None),
            s("Tacikistan'a.", "Ба Тоҷикистон.", None),
        ]),
        ("Пул наомад", [
            t("Sorun ne?", "Мушкил чист?", "Бигӯ: стипендия наомад", "Burs gelmedi.", "Стипендия наомад.",
              ["Para gelmedi."]),
            t("Normalde ne zaman gelir?", "Одатан кай меояд?", "Бигӯ: дар аввали моҳ", "Ayın başında.",
              "Дар аввали моҳ.", ["Her ayın başında."]),
            t("Kontrol ediyorum. Bir dakika.", "Месанҷам. Як дақиқа.", "Ташаккур гӯй", "Teşekkürler.", "Ташаккур.",
              ["Sağ olun."]),
        ]),
        ("Миссия: ҳисоби нав", [
            t("Merhaba! Nasıl yardım edebilirim?", "Салом! Чӣ ёрӣ диҳам?", "Бигӯ: ҳисоб кушодан мехоҳам",
              "Hesap açmak istiyorum.", "Ҳисоб кушодан мехоҳам.", ["Hesap lazım."]),
            t("Öğrenci misiniz?", "Донишҷӯед?", "Бигӯ: ҳа, ман донишҷӯ ҳастам", "Evet, öğrenciyim.",
              "Ҳа, ман донишҷӯ ҳастам.", ["Evet."]),
            t("Pasaportunuz lütfen.", "Шиносномаатон, лутфан.", "Бигӯ: марҳамат", "Buyurun.", "Марҳамат.",
              ["Pasaportum burada."]),
            t("Teşekkürler. Kart bir hafta sonra gelir.", "Ташаккур. Корт баъди як ҳафта меояд.", "Бигӯ: хуб, ташаккур",
              "Tamam, teşekkürler.", "Хуб, ташаккур.", ["Çok teşekkür ederim."]),
        ]),
    ]))

finish(made)
