"""ТУРКӢ → тоҷикӣ, «Гуфтор» A1 — нишаи «Хизматрасонӣ» (`service`), 05.10.2026.

14 вазъият барои коргари тоҷик дар ошхона (lokanta), қаҳвахона ва мағозаи Туркия — ҳамон
тартиби русӣ/олмонӣ/арабӣ. Роҳи `service` = 6 вазъияти умумӣ (1, 2, 6, 10, 14, 16) + ин 14 → 20.

Қоидаҳо — `_tr_packs_lib.py`. Усто/мудир ба коргар — «sen», коргар ба мудир — «siz»/«abi»,
бо меҳмон — ҳамеша «siz». chunks ≤ 2 калима, sentences ≤ 4 («mi» калимаи ҷудо).

Аз ҷузвдони backend: python prisma/_tr-service-a1-packs.py
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _tr_packs_lib import *  # noqa: F401,F403

_s = s


def s(text, tr, note=None, cue=None, cue_tr=None, swaps=None):  # noqa: F811
    if not cue and not swaps and len(text.split()) == 1:
        return w(text.rstrip('.!'), tr.rstrip('.!'), note)
    return _s(text, tr, note, cue, cue_tr, swaps)


made = []
SV = ["service"]

# ═════════════════════ 3. Рӯзи аввал дар ошхона ═════════════════════
made.append(pack("kitchen_tr_tg", "Mutfakta ilk gün", "Рӯзи аввал дар ошхона", "👨‍🍳", 3, SV,
    "Рӯзи аввали кор дар ошхонаи тарабхона (lokanta). Ошпази калон ба шумо ошхона, яхдон ва ҷои "
    "либосро нишон медиҳад. Шумо мепурсед, ки чӣ кор кунед, ва дастурҳоро иҷро мекунед.",
    [
        ("Ошхона", [
            w("Mutfak", "ошхона", None),
            w("Buzdolabı", "яхдон", None),
            w("Tabak", "тақсимча", None),
            w("Bıçak", "корд", None),
            w("Önlük", "пешдоман", None),
            w("Bulaşık", "зарфҳои ифлос", None),
        ]),
        ("Салом, усто", [
            t("Merhaba! Yeni misin?", "Салом! Навӣ?", "Бигӯ: ҳа", "Evet.", "Ҳа.", ["Evet, yeniyim."]),
            t("Ben Mehmet, aşçıbaşı.", "Ман Меҳмет, ошпази калон.", "Бигӯ: шодам", "Memnun oldum.", "Шодам.",
              ["Merhaba, memnun oldum."]),
            t("Bu senin önlüğün.", "Ин пешдомани ту.", "Ташаккур гӯй", "Teşekkürler.", "Ташаккур.", ["Sağ olun abi."]),
        ]),
        ("Дастурҳо", [
            s("Bulaşık yıka", "Зарф бишӯй", None),
            w("Tabaklar", "тақсимчаҳо", None),
            w("Hemen", "ҳозир", None),
            s("Şimdi ne?", "Ҳоло чӣ?", None),
            s("Buzdolabında", "Дар яхдон", None),
            w("Bitti", "тамом шуд", None),
        ]),
        ("Чӣ кор кунам?", [
            t("Tabakları yıka.", "Тақсимчаҳоро бишӯй.", "Бигӯ: ҳозир", "Hemen!", "Ҳозир!", ["Tamam abi, hemen."]),
            t("Bitti mi?", "Тамом шуд?", "Бигӯ: ҳа, тамом", "Evet, bitti.", "Ҳа, тамом.", ["Bitti abi."]),
            t("Aferin!", "Офарин!", "Бипурс: ҳоло чӣ?", "Şimdi ne yapayım?", "Ҳоло чӣ кор кунам?", ["Şimdi ne?"]),
        ]),
        ("Ман навам", [
            s("Burada yeniyim.", "Ман ин ҷо навам.", None),
            s("Şimdi ne yapayım?", "Ҳоло чӣ кор кунам?", None),
            s("Tabaklar nerede?", "Тақсимчаҳо куҷоянд?", None),
            s("Buzdolabı nerede?", "Яхдон куҷост?", None),
            s("Gösterir misiniz?", "Нишон медиҳед?", None),
            s("Anladım abi.", "Фаҳмидам, ака.", None),
        ]),
        ("Ошхонаро нишон медиҳад", [
            t("Burası mutfak.", "Ин ҷо ошхона.", "Бипурс: яхдон куҷост?", "Buzdolabı nerede?", "Яхдон куҷост?",
              ["Buzdolabı?"]),
            t("Orada, solda.", "Он ҷо, тарафи чап.", "Бипурс: тақсимчаҳо куҷоянд?", "Tabaklar nerede?",
              "Тақсимчаҳо куҷоянд?", ["Ya tabaklar?"]),
            t("Yukarıda.", "Дар боло.", "Бигӯ: фаҳмидам, ташаккур", "Anladım, teşekkürler.", "Фаҳмидам, ташаккур.",
              ["Tamam, sağ olun."]),
        ]),
        ("Тоза ва бехатар", [
            s("Ellerini yıka.", "Дастҳоятро бишӯй.", None),
            s("Bıçak keskin.", "Корд тез аст.", None),
            s("Dikkat, sıcak!", "Эҳтиёт, гарм!", None),
            s("Yer ıslak.", "Фарш тар аст.", None),
            s("Çöp nerede?", "Партов куҷост?", None),
            s("Ellerimi yıkıyorum.", "Дастҳоямро мешӯям.", None),
        ]),
        ("Эҳтиёт!", [
            t("Dikkat! Bu sıcak!", "Эҳтиёт! Ин гарм аст!", "Бигӯ: хуб, ташаккур", "Tamam, teşekkürler!",
              "Хуб, ташаккур!", ["Sağ olun!"]),
            t("Önce ellerini yıka.", "Аввал дастҳоятро бишӯй.", "Бигӯ: хуб, ҳозир", "Tamam, hemen.", "Хуб, ҳозир.",
              ["Hemen abi."]),
            t("Çöp dışarıda.", "Партов берун аст.", "Бигӯ: фаҳмидам", "Anladım.", "Фаҳмидам.", ["Tamam, anladım."]),
        ]),
        ("Миссия: рӯзи аввал", [
            t("Merhaba! Yeni misin?", "Салом! Навӣ?", "Бигӯ: ҳа, ман ин ҷо навам", "Evet, burada yeniyim.",
              "Ҳа, ман ин ҷо навам.", ["Evet."]),
            t("Güzel. Bu senin önlüğün.", "Хуб. Ин пешдомани ту.", "Бипурс: ҳоло чӣ кор кунам?", "Şimdi ne yapayım?",
              "Ҳоло чӣ кор кунам?", ["Teşekkürler. Ne yapayım?"]),
            t("Tabakları yıka.", "Тақсимчаҳоро бишӯй.", "Бипурс: тақсимчаҳо куҷоянд?", "Tabaklar nerede?",
              "Тақсимчаҳо куҷоянд?", ["Nerede abi?"]),
            t("Orada, solda. Kolay gelsin!", "Он ҷо, тарафи чап. Кор осон шавад!", "Бигӯ: ҳозир", "Hemen!", "Ҳозир!",
              ["Sağ olun abi."]),
        ]),
    ]))

# ═════════════════════ 4. Пешвоз гирифтани меҳмон ═════════════════════
made.append(pack("host_tr_tg", "Misafir karşılama", "Пешвоз гирифтани меҳмон", "🙋", 4, SV,
    "Шумо дар дари тарабхона меҳмононро пешвоз мегиред: салом медиҳед, мепурсед, ки чанд нафаранд, "
    "мизро нишон медиҳед ва менюро медиҳед.",
    [
        ("Тарабхона", [
            w("Misafir", "меҳмон", None),
            w("Masa", "миз", None),
            w("Kişi", "нафар", None),
            w("Menü", "меню", None),
            w("Rezerve", "банд (фармоишшуда)", None),
            w("Dışarı", "берун", None),
        ]),
        ("Хуш омадед!", [
            t("İyi akşamlar!", "Шом ба хайр!", "Салом гӯй ва бигӯ: хуш омадед", "İyi akşamlar, hoş geldiniz!",
              "Шом ба хайр, хуш омадед!", ["Hoş geldiniz!"]),
            t("Bir masa lütfen.", "Як миз, лутфан.", "Бипурс: чанд нафар?", "Kaç kişisiniz?", "Чанд нафаред?",
              ["Kaç kişi?"]),
            t("İki kişiyiz.", "Ду нафарем.", "Бигӯ: марҳамат, аз ин ҷо", "Buyurun, buradan.", "Марҳамат, аз ин ҷо.",
              ["Buyurun."]),
        ]),
        ("Ибораҳо", [
            s("Hoş geldiniz", "Хуш омадед", None),
            s("Kaç kişi?", "Чанд нафар?", None),
            s("Bu masa", "Ин миз", None),
            s("Biraz bekleyin", "Каме интизор шавед", None),
            w("Menü", "меню", None),
            s("Yoksa dışarı?", "Ё берун?", None),
        ]),
        ("Дарун ё берун?", [
            t("Üç kişiyiz.", "Се нафарем.", "Бипурс: дарун ё берун?", "İçeri mi, dışarı mı?", "Дарун ё берун?",
              ["Dışarı mı?"]),
            t("Dışarı lütfen.", "Берун, лутфан.", "Бигӯ: ин миз, марҳамат", "Bu masa, buyurun.", "Ин миз, марҳамат.",
              ["Buyurun."]),
            t("Teşekkürler!", "Ташаккур!", "Бигӯ: мана меню", "Menü burada.", "Мана меню.", ["Buyurun menü."]),
        ]),
        ("Ҷумлаҳои пешвоз", [
            s("Rezervasyonunuz var mı?", "Фармоиш доред?", None),
            s("Buyurun, oturun.", "Марҳамат, шинед.", None),
            s("Masa boş.", "Миз холӣ аст.", None),
            s("Her yer dolu.", "Ҳама ҷо пур.", None),
            s("On dakika lütfen.", "Даҳ дақиқа, лутфан.", None),
            s("Menüyü getiriyorum.", "Менюро меорам.", None),
        ]),
        ("Фармоиш дорад?", [
            t("Merhaba, dört kişiyiz.", "Салом, чор нафарем.", "Бипурс: фармоиш доред?", "Rezervasyonunuz var mı?",
              "Фармоиш доред?", ["Rezervasyon var mı?"]),
            t("Hayır, yok.", "Не, нест.", "Бигӯ: миз холӣ аст", "Masa boş.", "Миз холӣ аст.", ["Sorun yok."]),
            t("Süper, teşekkürler!", "Олӣ, ташаккур!", "Бигӯ: марҳамат, шинед", "Buyurun, oturun.", "Марҳамат, шинед.",
              ["Buyurun."]),
        ]),
        ("Ҷой нест", [
            s("Maalesef her yer dolu.", "Афсӯс, ҳама ҷо пур.", None),
            s("Bekleyebilir misiniz?", "Интизор шуда метавонед?", None),
            s("Birazdan masa boşalır.", "Ба наздикӣ миз холӣ мешавад.", None),
            s("İsminiz lütfen?", "Номатон, лутфан?", None),
            s("Buyurun, gelin.", "Марҳамат, биёед.", None),
            s("Pardon, bir dakika.", "Бубахшед, як дақиқа.", None),
        ]),
        ("Интизорӣ", [
            t("İki kişilik masa lütfen.", "Миз барои ду нафар, лутфан.", "Бигӯ: афсӯс, ҳама ҷо пур",
              "Maalesef her yer dolu.", "Афсӯс, ҳама ҷо пур.", ["Her yer dolu."]),
            t("Ne kadar bekleriz?", "Чӣ қадар интизор шавем?", "Бигӯ: даҳ дақиқа", "On dakika.", "Даҳ дақиқа.",
              ["Yaklaşık on dakika."]),
            t("Tamam, bekleriz.", "Хуб, интизор мешавем.", "Бипурс: номатон, лутфан?", "İsminiz lütfen?",
              "Номатон, лутфан?", ["Adınız ne?"]),
        ]),
        ("Миссия: шоми серкор", [
            t("İyi akşamlar!", "Шом ба хайр!", "Салом гӯй ва бигӯ: хуш омадед", "İyi akşamlar, hoş geldiniz!",
              "Шом ба хайр, хуш омадед!", ["Hoş geldiniz!"]),
            t("İki kişilik masa.", "Миз барои ду нафар.", "Бипурс: дарун ё берун?", "İçeri mi, dışarı mı?",
              "Дарун ё берун?", ["İçeri mi?"]),
            t("İçeri lütfen.", "Дарун, лутфан.", "Бигӯ: ин миз, марҳамат", "Bu masa, buyurun.", "Ин миз, марҳамат.",
              ["Buyurun, oturun."]),
            t("Teşekkürler!", "Ташаккур!", "Бигӯ: мана меню", "Menü burada.", "Мана меню.", ["Buyurun menü."]),
        ]),
    ]))

# ═════════════════════ 5. Қабули фармоиш ═════════════════════
made.append(pack("take_order_tr_tg", "Sipariş almak", "Қабули фармоиш", "📝", 5, SV,
    "Шумо фармоиши меҳмонро мегиред: мепурсед, ки чӣ менӯшанд ва чӣ мехӯранд, такрор мекунед ва "
    "мегӯед, ки хӯрок кай тайёр мешавад.",
    [
        ("Меню", [
            w("Sipariş", "фармоиш", None),
            w("İçecek", "нӯшокӣ", None),
            w("Su", "об", None),
            w("Çay", "чой", None),
            w("Salata", "салат", None),
            w("Kebap", "кабоб", None),
        ]),
        ("Нӯшокӣ", [
            t("Merhaba, sipariş verebilir miyiz?", "Салом, фармоиш дода метавонем?", "Бипурс: чӣ менӯшед?",
              "Ne içersiniz?", "Чӣ менӯшед?", ["İçecek ne olsun?"]),
            t("İki su lütfen.", "Ду об, лутфан.", "Бигӯ: хуб", "Tabii.", "Албатта.", ["Tamam."]),
            t("Bir de çay.", "Ва як чой.", "Бигӯ: як чой, хуб", "Bir çay, tamam.", "Як чой, хуб.", ["Tamam."]),
        ]),
        ("Саволҳо", [
            s("Ne alırsınız?", "Чӣ мегиред?", None),
            s("İçecek olarak?", "Барои нӯшидан?", None),
            s("Yemek olarak?", "Барои хӯрдан?", None),
            s("Başka?", "Боз?", None),
            w("Hemen", "ҳозир", None),
            s("İyi seçim", "Интихоби хуб", None),
        ]),
        ("Хӯрок", [
            t("Bir kebap alayım.", "Як кабоб мегирам.", "Бигӯ: интихоби хуб", "İyi seçim.", "Интихоби хуб.",
              ["Tabii."]),
            t("Bir de salata.", "Ва як салат.", "Бипурс: боз чизе?", "Başka bir şey?", "Боз чизе?",
              ["Başka?"]),
            t("Hayır, teşekkürler.", "Не, ташаккур.", "Бигӯ: хуб, ҳозир", "Tamam, hemen.", "Хуб, ҳозир.",
              ["Hemen geliyor."]),
        ]),
        ("Фармоиш мегирам", [
            s("Ne içersiniz?", "Чӣ менӯшед?", None),
            s("Sipariş verecek misiniz?", "Фармоиш медиҳед?", None),
            s("Bir kebap, bir salata.", "Як кабоб, як салат.", None),
            s("On dakika sürer.", "Даҳ дақиқа мегирад.", None),
            s("Buzlu mu olsun?", "Бо ях бошад?", None),
            s("Hemen getiriyorum.", "Ҳозир меорам.", None),
        ]),
        ("Такрори фармоиш", [
            t("Bir kebap, bir su.", "Як кабоб, як об.", "Такрор кун: як кабоб, як об", "Bir kebap, bir su.",
              "Як кабоб, як об.", ["Tamam, bir kebap bir su."]),
            t("Evet, doğru.", "Ҳа, дуруст.", "Бигӯ: даҳ дақиқа мегирад", "On dakika sürer.", "Даҳ дақиқа мегирад.",
              ["On dakika."]),
            t("Sorun yok.", "Мушкил нест.", "Ташаккур гӯй", "Teşekkürler!", "Ташаккур!", ["Sağ olun."]),
        ]),
        ("Саволи меҳмон", [
            s("Bu ne?", "Ин чист?", None),
            s("Bu tavuk.", "Ин мурғ.", None),
            s("Acı mı?", "Тунд аст?", None),
            s("Hayır, acı değil.", "Не, тунд нест.", None),
            s("Bunu tavsiye ederim.", "Инро тавсия медиҳам.", None),
            s("Aşçıya soruyorum.", "Аз ошпаз мепурсам.", None),
        ]),
        ("Ин чист?", [
            t("Bu ne?", "Ин чист?", "Бигӯ: ин мурғ аст", "Bu tavuk.", "Ин мурғ.", ["Tavuk şiş."]),
            t("Acı mı?", "Тунд аст?", "Бигӯ: не, тунд нест", "Hayır, acı değil.", "Не, тунд нест.", ["Biraz."]),
            t("Tamam, bunu alayım.", "Хуб, инро мегирам.", "Бигӯ: интихоби хуб", "İyi seçim!", "Интихоби хуб!",
              ["Tabii!"]),
        ]),
        ("Миссия: мизи панҷ", [
            t("Merhaba, sipariş verebilir miyiz?", "Салом, фармоиш медиҳем?", "Бипурс: чӣ менӯшед?", "Ne içersiniz?",
              "Чӣ менӯшед?", ["İçecek ne olsun?"]),
            t("Bir su, bir çay.", "Як об, як чой.", "Бипурс: ва барои хӯрдан?", "Yemek olarak?", "Барои хӯрдан?",
              ["Ne yersiniz?"]),
            t("İki kebap lütfen.", "Ду кабоб, лутфан.", "Бипурс: боз чизе?", "Başka bir şey?", "Боз чизе?",
              ["Başka?"]),
            t("Hayır, bu kadar.", "Не, ҳамин.", "Бигӯ: хуб, даҳ дақиқа", "Tamam, on dakika.", "Хуб, даҳ дақиқа.",
              ["On dakika sürer."]),
        ]),
    ]))

# ═════════════════════ 7. Овардани хӯрок ═════════════════════
made.append(pack("serving_tr_tg", "Yemek servisi", "Овардани хӯрок", "🍽️", 7, SV,
    "Шумо хӯрокро ба миз меоред: мегӯед, ки кадом хӯрок аз кист, «афият бошад» мегӯед, мепурсед, "
    "ки хӯрок маъқул аст ва зарфҳои холиро мебаред.",
    [
        ("Миз", [
            w("Çatal", "чангча", None),
            w("Kaşık", "қошуқ", None),
            w("Bardak", "стакан", None),
            w("Peçete", "дастмолча", None),
            w("Sıcak", "гарм", None),
            w("Boş", "холӣ", None),
        ]),
        ("Хӯрок омад", [
            t("Bu bizim kebap mı?", "Ин кабоби мост?", "Бигӯ: ҳа, афият бошад", "Evet, afiyet olsun.",
              "Ҳа, ош шавад.", ["Evet, buyurun."]),
            t("Salata nerede?", "Салат куҷост?", "Бигӯ: ҳозир меорам", "Hemen getiriyorum.", "Ҳозир меорам.",
              ["Hemen geliyor."]),
            t("Teşekkürler!", "Ташаккур!", "Бигӯ: арзише надорад", "Rica ederim.", "Арзише надорад.", ["Buyurun."]),
        ]),
        ("Ибораҳо", [
            s("Kimin için?", "Барои кӣ?", None),
            s("Afiyet olsun!", "Ош шавад!", None),
            s("Dikkat, sıcak", "Эҳтиёт, гарм", None),
            s("Ekmek lazım?", "Нон лозим?", None),
            s("Beğendiniz mi?", "Маъқул шуд?", None),
            w("Buyurun", "марҳамат", None),
        ]),
        ("Барои кӣ?", [
            t("Buyurun, kebap.", "Марҳамат, кабоб.", "Бипурс: барои кӣ?", "Kimin için?", "Барои кӣ?",
              ["Kebap kimin?"]),
            t("Benim, teşekkürler.", "Барои ман, ташаккур.", "Бигӯ: эҳтиёт, гарм", "Dikkat, sıcak!", "Эҳтиёт, гарм!",
              ["Tabak sıcak."]),
            t("Sağ olun.", "Ташаккур.", "Бигӯ: ош шавад", "Afiyet olsun!", "Ош шавад!", ["Buyurun, afiyet olsun."]),
        ]),
        ("Дар сари миз", [
            s("Başka ne lazım?", "Боз чӣ лозим?", None),
            s("Çatal getiriyorum.", "Чангча меорам.", None),
            s("Her şey yolunda mı?", "Ҳама хуб аст?", None),
            s("Bunu alabilir miyim?", "Инро бардорам?", None),
            s("Tabak boş.", "Тақсимча холӣ.", None),
            s("Bir bardak su?", "Як стакан об?", None),
        ]),
        ("Ҳама хуб?", [
            t("Pardon!", "Бубахшед!", "Бипурс: боз чӣ лозим?", "Başka ne lazım?", "Боз чӣ лозим?",
              ["Buyurun?"]),
            t("Evet, bir çatal lütfen.", "Ҳа, як чангча, лутфан.", "Бигӯ: чангча меорам", "Çatal getiriyorum.",
              "Чангча меорам.", ["Hemen."]),
            t("Bir de ekmek.", "Ва нон ҳам.", "Бигӯ: албатта", "Tabii.", "Албатта.", ["Tamam."]),
        ]),
        ("Баъди хӯрок", [
            s("Beğendiniz mi?", "Маъқул шуд?", None),
            s("Tatlı ister misiniz?", "Ширинӣ мехоҳед?", None),
            s("Çay getireyim mi?", "Чой биёрам?", None),
            s("Masayı topluyorum.", "Мизро ҷамъ мекунам.", None),
            s("Buna sevindim.", "Аз ин шодам.", None),
            s("Başka bir arzunuz?", "Боз хоҳише доред?", None),
        ]),
        ("Ширинӣ?", [
            t("Bitti, teşekkürler.", "Тамом, ташаккур.", "Бипурс: маъқул шуд?", "Beğendiniz mi?", "Маъқул шуд?",
              ["Nasıldı?"]),
            t("Evet, çok güzeldi!", "Ҳа, хеле хуб буд!", "Бигӯ: аз ин шодам", "Buna sevindim.", "Аз ин шодам.",
              ["Afiyet olsun!"]),
            t("Evet.", "Ҳа.", "Бипурс: ширинӣ мехоҳед?", "Tatlı ister misiniz?", "Ширинӣ мехоҳед?",
              ["Çay getireyim mi?"]),
        ]),
        ("Миссия: мизи серкор", [
            t("Bu benim salatam mı?", "Ин салати ман аст?", "Бигӯ: ҳа, марҳамат", "Evet, buyurun.", "Ҳа, марҳамат.",
              ["Evet, afiyet olsun."]),
            t("Teşekkürler! Bir çatal daha lütfen.", "Ташаккур! Боз як чангча.", "Бигӯ: чангча меорам",
              "Çatal getiriyorum.", "Чангча меорам.", ["Hemen."]),
            t("Teşekkürler. Çok lezzetli.", "Ташаккур. Хеле бомаза.", "Бигӯ: аз ин шодам", "Buna sevindim.",
              "Аз ин шодам.", ["Afiyet olsun!"]),
            t("Bitti.", "Тамом.", "Бипурс: ширинӣ мехоҳед?", "Tatlı ister misiniz?", "Ширинӣ мехоҳед?",
              ["Çay getireyim mi?"]),
        ]),
    ]))

# ═════════════════════ 8. Ҳисоб ═════════════════════
made.append(pack("bill_tr_tg", "Hesap", "Ҳисоб дар тарабхона", "🧾", 8, SV,
    "Меҳмон ҳисобро мехоҳад: шумо ҳисобро меоред, нархро мегӯед, мепурсед, ки бо корт ё нақд, "
    "бақияро медиҳед ва ташаккур мегӯед.",
    [
        ("Ҳисоб", [
            w("Hesap", "ҳисоб", None),
            w("Nakit", "нақд", None),
            w("Kart", "корт", None),
            w("Para üstü", "бақия", None),
            w("Fiş", "чек", None),
            w("Bahşiş", "чойпулӣ", None),
        ]),
        ("Ҳисоб, лутфан", [
            t("Hesap lütfen.", "Ҳисоб, лутфан.", "Бигӯ: ҳозир", "Hemen.", "Ҳозир.", ["Hemen getiriyorum."]),
            t("Ne kadar?", "Чанд?", "Бигӯ: дусад лира", "İki yüz lira.", "Дусад лира.", ["Toplam iki yüz lira."]),
            t("Kartla lütfen.", "Бо корт, лутфан.", "Бигӯ: хуб", "Tabii.", "Албатта.", ["Tamam."]),
        ]),
        ("Пардохт", [
            s("Yoksa nakit?", "Ё нақд?", None),
            s("Yüz lira", "Сад лира", None),
            s("Fişiniz burada", "Чекатон ин ҷо", None),
            s("Üstü kalsın", "Бақия лозим нест", "Меҳмон мегӯяд."),
            s("Para üstünüz", "Бақияатон", None),
            s("Çok teşekkürler", "Ташаккури зиёд", None),
        ]),
        ("Якҷоя ё алоҳида?", [
            t("Ödeyebilir miyiz?", "Пардохт кунем?", "Бипурс: якҷоя ё алоҳида?", "Beraber mi, ayrı mı?",
              "Якҷоя ё алоҳида?", ["Ayrı mı?"]),
            t("Ayrı lütfen.", "Алоҳида, лутфан.", "Бипурс: бо корт ё нақд?", "Kartla mı, nakit mi?",
              "Бо корт ё нақд?", ["Nakit mi?"]),
            t("Nakit.", "Нақд.", "Бигӯ: хуб", "Tamam.", "Хуб.", ["Peki."]),
        ]),
        ("Ман ҳисоб меорам", [
            s("Hesabı getiriyorum.", "Ҳисобро меорам.", None),
            s("Toplam yüz elli lira.", "Ҳамагӣ саду панҷоҳ лира.", None),
            s("Para üstünüz burada.", "Бақияатон ин ҷо.", None),
            s("Kartınızı alabilir miyim?", "Кортатонро гирам?", None),
            s("Bahşiş için teşekkürler.", "Барои чойпулӣ ташаккур.", None),
            s("İyi akşamlar!", "Шоми хуш!", None),
        ]),
        ("Бақия", [
            t("İki yüz lira, buyurun.", "Дусад лира, марҳамат.", "Бигӯ: бақияатон ин ҷо", "Para üstünüz burada.",
              "Бақияатон ин ҷо.", ["Buyurun para üstü."]),
            t("Üstü kalsın.", "Бақия лозим нест.", "Барои чойпулӣ ташаккур гӯй", "Bahşiş için teşekkürler!",
              "Барои чойпулӣ ташаккур!", ["Çok teşekkürler!"]),
            t("Hoşça kalın!", "Хайр!", "Бигӯ: шоми хуш!", "İyi akşamlar!", "Шоми хуш!", ["Güle güle!"]),
        ]),
        ("Мушкили пардохт", [
            s("Kart geçmiyor.", "Корт намегузарад.", None),
            s("Bir daha deneyelim.", "Боз як бор санҷем.", None),
            s("Nakit var mı?", "Нақд ҳаст?", None),
            s("Şifrenizi girin lütfen.", "Рамзатонро дароред, лутфан.", None),
            s("Şimdi oldu.", "Ҳоло шуд.", None),
            s("Sorun değil.", "Мушкил нест.", None),
        ]),
        ("Корт намегузарад", [
            t("Kartım burada.", "Корти ман ин ҷо.", "Бигӯ: рамзатонро дароред, лутфан", "Şifrenizi girin lütfen.",
              "Рамзатонро дароред, лутфан.", ["Şifre lütfen."]),
            t("Tamam mı?", "Шуд?", "Бигӯ: корт намегузарад", "Kart geçmiyor.", "Корт намегузарад.",
              ["Maalesef geçmiyor."]),
            t("Aa! Nakit ödeyeyim.", "О! Нақд медиҳам.", "Бигӯ: мушкил нест", "Sorun değil.", "Мушкил нест.",
              ["Tamam."]),
        ]),
        ("Миссия: ҳисоби мизи ду", [
            t("Hesap lütfen.", "Ҳисоб, лутфан.", "Бипурс: якҷоя ё алоҳида?", "Beraber mi, ayrı mı?",
              "Якҷоя ё алоҳида?", ["Beraber mi?"]),
            t("Beraber.", "Якҷоя.", "Бигӯ: сесад лира", "Üç yüz lira.", "Сесад лира.", ["Toplam üç yüz lira."]),
            t("Kartla lütfen.", "Бо корт, лутфан.", "Бигӯ: рамзатонро дароред, лутфан", "Şifrenizi girin lütfen.",
              "Рамзатонро дароред, лутфан.", ["Şifre lütfen."]),
            t("Teşekkürler! Hoşça kalın!", "Ташаккур! Хайр!", "Бигӯ: шоми хуш!", "İyi akşamlar!", "Шоми хуш!",
              ["Güle güle!"]),
        ]),
    ]))

# ═════════════════════ 9. Шикояти меҳмон ═════════════════════
made.append(pack("complaint_tr_tg", "Memnun olmayan misafir", "Шикояти меҳмон", "😟", 9, SV,
    "Меҳмон норозӣ аст: хӯрок хунук ё нодуруст аст, ё дер омад. Шумо бубахшед мегӯед, онро иваз "
    "мекунед ва ба мудир хабар медиҳед.",
    [
        ("Мушкил", [
            w("Soğuk", "хунук", None),
            w("Yanlış", "нодуруст", None),
            w("Geç", "дер", None),
            w("Kirli", "ифлос", None),
            w("Özür", "бахшиш", None),
            w("Yeni", "нав", None),
        ]),
        ("Хӯрок хунук аст", [
            t("Pardon! Çorba soğuk.", "Бубахшед! Шӯрбо хунук аст.", "Бигӯ: бубахшед", "Özür dilerim!", "Бубахшед!",
              ["Kusura bakmayın."]),
            t("Yenisini istiyorum.", "Навашро мехоҳам.", "Бигӯ: ҳозир", "Hemen.", "Ҳозир.", ["Hemen getiriyorum."]),
            t("Teşekkürler.", "Ташаккур.", "Бигӯ: арзише надорад", "Rica ederim.", "Арзише надорад.", ["Buyurun."]),
        ]),
        ("Ибораҳо", [
            s("Kusura bakmayın", "Маъзур доред", None),
            s("Hemen değiştiriyorum", "Ҳозир иваз мекунам", None),
            s("Bir dakika", "Як дақиқа", None),
            s("Benim hatam", "Хатои ман", None),
            w("Müdür", "мудир", None),
            w("Tabii", "албатта", None),
        ]),
        ("Хӯроки нодуруст", [
            t("Bu yanlış. Ben tavuk istedim.", "Ин нодуруст. Ман мурғ хостам.", "Бигӯ: бубахшед, хатои ман",
              "Özür dilerim, benim hatam.", "Бубахшед, хатои ман.", ["Kusura bakmayın."]),
            t("Lütfen çabuk.", "Лутфан тезтар.", "Бигӯ: ҳозир иваз мекунам", "Hemen değiştiriyorum.",
              "Ҳозир иваз мекунам.", ["Hemen."]),
            t("Tamam.", "Хуб.", "Бигӯ: як дақиқа, лутфан", "Bir dakika lütfen.", "Як дақиқа, лутфан.", ["Bir dakika."]),
        ]),
        ("Ҷавоб ба шикоят", [
            s("Çok özür dilerim.", "Хеле бубахшед.", None),
            s("Yenisini getiriyorum.", "Навашро меорам.", None),
            s("Hemen olur.", "Ҳозир мешавад.", None),
            s("Müdürü çağırıyorum.", "Мудирро даъват мекунам.", None),
            s("Bardak kirli.", "Стакан ифлос аст.", None),
            s("Şimdi her şey tamam?", "Ҳоло ҳама хуб?", None),
        ]),
        ("Стакани ифлос", [
            t("Bardak kirli!", "Стакан ифлос аст!", "Бигӯ: хеле бубахшед", "Çok özür dilerim.", "Хеле бубахшед.",
              ["Kusura bakmayın!"]),
            t("Yenisi lütfen.", "Навашро, лутфан.", "Бигӯ: навашро меорам", "Yenisini getiriyorum.", "Навашро меорам.",
              ["Hemen."]),
            t("Teşekkürler.", "Ташаккур.", "Бипурс: ҳоло ҳама хуб?", "Şimdi her şey tamam?", "Ҳоло ҳама хуб?",
              ["Her şey tamam mı?"]),
        ]),
        ("Хеле дер", [
            s("Çok bekledik.", "Бисёр интизор шудем.", None),
            s("Biraz daha sürer.", "Боз каме мегирад.", None),
            s("Mutfak çok yoğun.", "Ошхона хеле серкор аст.", None),
            s("Bir çay ikram?", "Як чой ройгон?", None),
            s("Sabrınız için teşekkürler.", "Барои сабратон ташаккур.", None),
            s("Aşçıya soruyorum.", "Аз ошпаз мепурсам.", None),
        ]),
        ("Интизории дароз", [
            t("Çok bekledik!", "Бисёр интизор шудем!", "Бигӯ: бубахшед, ошхона серкор аст",
              "Özür dilerim, mutfak çok yoğun.", "Бубахшед, ошхона серкор аст.", ["Kusura bakmayın."]),
            t("Daha ne kadar?", "Боз чӣ қадар?", "Бигӯ: аз ошпаз мепурсам", "Aşçıya soruyorum.", "Аз ошпаз мепурсам.",
              ["Bir dakika, soruyorum."]),
            t("Tamam, teşekkürler.", "Хуб, ташаккур.", "Бигӯ: барои сабратон ташаккур", "Sabrınız için teşekkürler.",
              "Барои сабратон ташаккур.", ["Çok teşekkürler."]),
        ]),
        ("Миссия: меҳмони норозӣ", [
            t("Pardon! Bu yanlış!", "Бубахшед! Ин нодуруст!", "Бигӯ: хеле бубахшед", "Çok özür dilerim.",
              "Хеле бубахшед.", ["Kusura bakmayın!"]),
            t("Çorba da soğuk.", "Шӯрбо ҳам хунук.", "Бигӯ: навашро меорам", "Yenisini getiriyorum.",
              "Навашро меорам.", ["Hemen değiştiriyorum."]),
            t("Müdürle konuşmak istiyorum.", "Бо мудир гап задан мехоҳам.", "Бигӯ: мудирро даъват мекунам",
              "Müdürü çağırıyorum.", "Мудирро даъват мекунам.", ["Bir dakika, müdürü çağırıyorum."]),
            t("Teşekkürler.", "Ташаккур.", "Бигӯ: барои сабратон ташаккур", "Sabrınız için teşekkürler.",
              "Барои сабратон ташаккур.", ["Rica ederim."]),
        ]),
    ]))

# ═════════════════════ 11. Дар касса ═════════════════════
made.append(pack("cashier_tr_tg", "Kasada", "Дар касса", "💳", 11, SV,
    "Шумо дар кассаи мағоза (market) кор мекунед: салом медиҳед, нархро мегӯед, халта пешниҳод "
    "мекунед, пулро мегиред ва чек медиҳед.",
    [
        ("Касса", [
            w("Kasa", "касса", None),
            w("Poşet", "халта", None),
            w("Fiş", "чек", None),
            w("Fiyat", "нарх", None),
            w("Bozuk para", "пули майда", None),
            w("İndirim", "тахфиф", None),
        ]),
        ("Салом дар касса", [
            t("Merhaba!", "Салом!", "Салом гӯй", "Merhaba, hoş geldiniz!", "Салом, хуш омадед!", ["Merhaba!"]),
            t("Bunlar lütfen.", "Инҳо, лутфан.", "Бипурс: халта мехоҳед?", "Poşet ister misiniz?", "Халта мехоҳед?",
              ["Poşet?"]),
            t("Evet, lütfen.", "Ҳа, лутфан.", "Бигӯ: панҷоҳ лира", "Elli lira.", "Панҷоҳ лира.", ["Toplam elli lira."]),
        ]),
        ("Ибораҳо", [
            s("Poşet lazım?", "Халта лозим?", None),
            s("Fiş lazım?", "Чек лозим?", None),
            s("Kartla mı?", "Бо корт?", None),
            w("Buyurun", "марҳамат", None),
            s("İyi günler!", "Рӯзи хуш!", None),
            s("Sıradaki lütfen", "Навбатӣ, лутфан", None),
        ]),
        ("Чек мехоҳед?", [
            t("Kartla ödüyorum.", "Бо корт пардохт мекунам.", "Бигӯ: хуб, марҳамат", "Tamam, buyurun.",
              "Хуб, марҳамат.", ["Buyurun."]),
            t("Tamam mı?", "Шуд?", "Бипурс: чек лозим?", "Fiş lazım mı?", "Чек лозим?", ["Fiş ister misiniz?"]),
            t("Hayır, teşekkürler.", "Не, ташаккур.", "Бигӯ: рӯзи хуш!", "İyi günler!", "Рӯзи хуш!", ["Güle güle!"]),
        ]),
        ("Ман дар касса", [
            s("Toplam seksen lira.", "Ҳамагӣ ҳаштод лира.", None),
            s("Bozuk paranız var mı?", "Пули майда доред?", None),
            s("Fişiniz burada.", "Чекатон ин ҷо.", None),
            s("Poşet bir lira.", "Халта як лира.", None),
            s("Bu indirimde.", "Ин бо тахфиф аст.", None),
            s("Sıradaki lütfen!", "Навбатӣ, лутфан!", None),
        ]),
        ("Пули майда", [
            t("Buyurun, iki yüz lira.", "Марҳамат, дусад лира.", "Бипурс: пули майда доред?", "Bozuk paranız var mı?",
              "Пули майда доред?", ["Bozuk var mı?"]),
            t("Hayır, maalesef.", "Не, афсӯс.", "Бигӯ: мушкил нест", "Sorun değil.", "Мушкил нест.", ["Tamam."]),
            t("Teşekkürler.", "Ташаккур.", "Бигӯ: чекатон ин ҷо", "Fişiniz burada.", "Чекатон ин ҷо.",
              ["Buyurun fiş."]),
        ]),
        ("Нарх", [
            s("Bu ne kadar?", "Ин чанд пул?", None),
            s("Fiyat yanlış.", "Нарх нодуруст.", None),
            s("Müdüre soruyorum.", "Аз мудир мепурсам.", None),
            s("Bir dakika lütfen.", "Як дақиқа, лутфан.", None),
            s("Haklısınız.", "Ҳақ бо шумост.", None),
            s("Şimdi doğru.", "Ҳоло дуруст.", None),
        ]),
        ("Нарх нодуруст?", [
            t("Fiyat yanlış! Bu indirimde.", "Нарх нодуруст! Ин бо тахфиф аст.", "Бигӯ: як дақиқа, лутфан",
              "Bir dakika lütfen.", "Як дақиқа, лутфан.", ["Bir dakika."]),
            t("Yirmi lira, otuz değil!", "Бист лира, на сӣ!", "Бигӯ: ҳақ бо шумост", "Haklısınız.", "Ҳақ бо шумост.",
              ["Özür dilerim, haklısınız."]),
            t("Teşekkürler!", "Ташаккур!", "Бигӯ: ҳоло дуруст", "Şimdi doğru.", "Ҳоло дуруст.", ["Tamam, şimdi doğru."]),
        ]),
        ("Миссия: навбат дар касса", [
            t("Merhaba!", "Салом!", "Салом гӯй ва бипурс: халта мехоҳед?", "Merhaba! Poşet ister misiniz?",
              "Салом! Халта мехоҳед?", ["Poşet?"]),
            t("Hayır, teşekkürler. Ne kadar?", "Не, ташаккур. Чанд?", "Бигӯ: шаст лира", "Altmış lira.", "Шаст лира.",
              ["Toplam altmış lira."]),
            t("Kartla lütfen.", "Бо корт, лутфан.", "Бигӯ: хуб, марҳамат", "Tamam, buyurun.", "Хуб, марҳамат.",
              ["Buyurun."]),
            t("Teşekkürler! Hoşça kalın!", "Ташаккур! Хайр!", "Бигӯ: рӯзи хуш!", "İyi günler!", "Рӯзи хуш!",
              ["Güle güle!"]),
        ]),
    ]))

# ═════════════════════ 12. Мол дар рафҳо ═════════════════════
made.append(pack("shelves_tr_tg", "Rafları dizmek", "Мол дар рафҳо", "📦", 12, SV,
    "Шумо дар анбор ва толори мағоза кор мекунед: қуттиҳоро мекушоед, молро ба раф мегузоред, "
    "нарх мечаспонед ва мепурсед, ки чиз куҷо меравад.",
    [
        ("Анбор", [
            w("Raf", "раф", None),
            w("Koli", "қуттӣ", None),
            w("Depo", "анбор", None),
            w("Mal", "мол", None),
            w("Üst", "боло", None),
            w("Alt", "поён", None),
        ]),
        ("Кор дар анбор", [
            t("Mallar geldi.", "Мол омад.", "Бипурс: ба куҷо?", "Nereye koyayım?", "Ба куҷо гузорам?", ["Nereye?"]),
            t("Rafa lütfen.", "Ба раф, лутфан.", "Бипурс: боло ё поён?", "Üste mi, alta mı?", "Боло ё поён?",
              ["Üste mi?"]),
            t("Alta.", "Поён.", "Бигӯ: хуб", "Tamam.", "Хуб.", ["Peki abi."]),
        ]),
        ("Ибораҳо", [
            s("Rafa koy", "Ба раф бигузор", None),
            w("Koliyi", "қуттиро", None),
            s("En üste", "Ба болои боло", None),
            s("Depoda", "Дар анбор", None),
            s("Tamam abi", "Хуб, ака", None),
            s("Bitti bile", "Аллакай тамом", None),
        ]),
        ("Қуттӣ вазнин аст", [
            t("Koliyi al lütfen.", "Қуттиро гир, лутфан.", "Бигӯ: вазнин аст", "Çok ağır.", "Хеле вазнин.",
              ["Koli ağır."]),
            t("Ben yardım ederim.", "Ман ёрӣ медиҳам.", "Ташаккур гӯй", "Sağ ol abi!", "Ташаккур, ака!",
              ["Teşekkürler!"]),
            t("Depoya götür.", "Ба анбор бубар.", "Бигӯ: хуб", "Tamam.", "Хуб.", ["Hemen."]),
        ]),
        ("Кор бо мол", [
            s("Bu nereye gidiyor?", "Ин ба куҷо меравад?", None),
            s("Raf boş.", "Раф холӣ.", None),
            s("Depodan getiriyorum.", "Аз анбор меорам.", None),
            s("Fiyat etiketi yok.", "Нарх нест.", None),
            s("Etiketleri yapıştırıyorum.", "Нархҳоро мечаспонам.", None),
            s("Bu kırık.", "Ин шикаста.", None),
        ]),
        ("Раф холӣ", [
            t("Raf boş!", "Раф холӣ!", "Бигӯ: аз анбор меорам", "Depodan getiriyorum.", "Аз анбор меорам.",
              ["Hemen getiriyorum."]),
            t("Güzel. Ya etiketler?", "Хуб. Ва нархҳо?", "Бигӯ: нархҳоро мечаспонам", "Etiketleri yapıştırıyorum.",
              "Нархҳоро мечаспонам.", ["Onu da yaparım."]),
            t("Sağ ol!", "Ташаккур!", "Бигӯ: арзише надорад", "Rica ederim.", "Арзише надорад.", ["Ne demek abi."]),
        ]),
        ("Мушкил дар анбор", [
            s("Bir şişe kırık.", "Як шиша шикаста.", None),
            s("Tarihi geçmiş.", "Мӯҳлаташ гузаштааст.", None),
            s("Süt kalmadı.", "Шир намондааст.", None),
            s("Bunu ne yapayım?", "Бо ин чӣ кунам?", None),
            s("At gitsin.", "Парто.", None),
            s("Size haber veririm.", "Ба шумо хабар медиҳам.", None),
        ]),
        ("Мӯҳлат гузашт", [
            t("Ne oldu?", "Чӣ шуд?", "Бигӯ: мӯҳлаташ гузаштааст", "Tarihi geçmiş.", "Мӯҳлаташ гузаштааст.",
              ["Bunun tarihi geçmiş."]),
            t("Aa! Kaç tane?", "О! Чандто?", "Бигӯ: се", "Üç tane.", "Сето.", ["Üç."]),
            t("At gitsin.", "Парто.", "Бигӯ: хуб", "Tamam.", "Хуб.", ["Peki abi."]),
        ]),
        ("Миссия: мол омад", [
            t("Merhaba! Mallar geldi.", "Салом! Мол омад.", "Бипурс: ин ба куҷо меравад?", "Bu nereye gidiyor?",
              "Ин ба куҷо меравад?", ["Nereye koyayım?"]),
            t("Rafa, en üste.", "Ба раф, ба болои боло.", "Бигӯ: хуб, ака", "Tamam abi.", "Хуб, ака.", ["Peki."]),
            t("Her şey tamam mı?", "Ҳама хуб?", "Бигӯ: як шиша шикаста", "Bir şişe kırık.", "Як шиша шикаста.",
              ["Hayır, bir şişe kırık."]),
            t("Sorun değil. At gitsin.", "Мушкил нест. Парто.", "Бигӯ: хуб", "Tamam.", "Хуб.", ["Peki abi."]),
        ]),
    ]))

# ═════════════════════ 13. Ёрӣ ба харидор ═════════════════════
made.append(pack("shop_help_tr_tg", "Müşteriye yardım", "Ёрӣ ба харидор", "🛒", 13, SV,
    "Харидор чизе меҷӯяд: шумо мегӯед, ки он дар кадом раф аст, андоза ё ранги дигарро мепурсед ва "
    "агар набошад, мегӯед, ки кай меояд.",
    [
        ("Мағоза", [
            w("Müşteri", "харидор", None),
            w("Beden", "андоза", None),
            w("Renk", "ранг", None),
            w("Ucuz", "арзон", None),
            w("Pahalı", "қимат", None),
            w("Arkada", "дар қафо", None),
        ]),
        ("Ёрӣ диҳам?", [
            t("Pardon!", "Бубахшед!", "Бипурс: ёрӣ диҳам?", "Yardım edebilir miyim?", "Ёрӣ диҳам?", ["Buyurun?"]),
            t("Pirinç nerede?", "Биринҷ куҷост?", "Бигӯ: дар қафо, тарафи чап", "Arkada, solda.", "Дар қафо, тарафи чап.",
              ["Orada, arkada."]),
            t("Teşekkürler!", "Ташаккур!", "Бигӯ: арзише надорад", "Rica ederim.", "Арзише надорад.", ["Buyurun."]),
        ]),
        ("Ибораҳо", [
            s("Yardım lazım?", "Ёрӣ лозим?", None),
            s("Arkada, solda", "Дар қафо, чап", None),
            s("Hangi beden?", "Кадом андоза?", None),
            s("Hangi renk?", "Кадом ранг?", None),
            s("Maalesef yok", "Афсӯс, нест", None),
            s("Benimle gelin", "Бо ман биёед", None),
        ]),
        ("Андоза", [
            t("Bunun büyüğü var mı?", "Калонаш ҳаст?", "Бигӯ: як дақиқа", "Bir dakika.", "Як дақиқа.",
              ["Bakıyorum."]),
            t("Mavisi var mı?", "Кабудаш ҳаст?", "Бигӯ: афсӯс, нест", "Maalesef yok.", "Афсӯс, нест.",
              ["Sadece kırmızı var."]),
            t("Yazık.", "Ҳайф.", "Бигӯ: бубахшед", "Özür dilerim.", "Бубахшед.", ["Kusura bakmayın."]),
        ]),
        ("Ёрӣ ба харидор", [
            s("Ne arıyorsunuz?", "Чӣ меҷӯед?", None),
            s("Rafta var.", "Дар раф ҳаст.", None),
            s("Benimle gelin lütfen.", "Бо ман биёед, лутфан.", None),
            s("Bu daha ucuz.", "Ин арзонтар.", None),
            s("Bu ürün yok.", "Ин мол нест.", None),
            s("Yarın yenisi gelir.", "Фардо нав меояд.", None),
        ]),
        ("Ман меҷӯям…", [
            t("Merhaba! Süt arıyorum.", "Салом! Шир меҷӯям.", "Бигӯ: бо ман биёед, лутфан", "Benimle gelin lütfen.",
              "Бо ман биёед, лутфан.", ["Benimle gelin."]),
            t("Teşekkürler. Bu ucuz mu?", "Ташаккур. Ин арзон аст?", "Бигӯ: ин арзонтар", "Bu daha ucuz.",
              "Ин арзонтар.", ["Evet, bu ucuz."]),
            t("Süper, teşekkürler!", "Олӣ, ташаккур!", "Бигӯ: арзише надорад", "Rica ederim.", "Арзише надорад.",
              ["Buyurun."]),
        ]),
        ("Мол нест", [
            s("Maalesef bitti.", "Афсӯс, тамом шуд.", None),
            s("Yarın gelir.", "Фардо меояд.", None),
            s("Depoya soruyorum.", "Аз анбор мепурсам.", None),
            s("Bu da benzer.", "Ин ҳам монанд.", None),
            s("Bunu deneyin.", "Инро санҷед.", None),
            s("Rica ederim.", "Арзише надорад.", None),
        ]),
        ("Тамом шуд", [
            t("Ekmek nerede?", "Нон куҷост?", "Бигӯ: афсӯс, тамом шуд", "Maalesef bitti.", "Афсӯс, тамом шуд.",
              ["Ekmek bitti."]),
            t("Yarın var mı?", "Фардо ҳаст?", "Бигӯ: фардо меояд", "Yarın gelir.", "Фардо меояд.", ["Evet, yarın."]),
            t("Tamam, teşekkürler!", "Хуб, ташаккур!", "Бигӯ: арзише надорад", "Rica ederim.", "Арзише надорад.",
              ["Buyurun."]),
        ]),
        ("Миссия: харидори саросема", [
            t("Pardon! Pirinç arıyorum.", "Бубахшед! Биринҷ меҷӯям.", "Бигӯ: дар қафо, тарафи чап", "Arkada, solda.",
              "Дар қафо, тарафи чап.", ["Benimle gelin."]),
            t("Bu ucuz olan mı?", "Ин арзонаш аст?", "Бигӯ: ҳа, ин арзонтар", "Evet, bu daha ucuz.",
              "Ҳа, ин арзонтар.", ["Evet."]),
            t("Ekmek de var mı?", "Нон ҳам ҳаст?", "Бигӯ: афсӯс, тамом шуд", "Maalesef bitti.", "Афсӯс, тамом шуд.",
              ["Yarın gelir."]),
            t("Tamam, teşekkürler!", "Хуб, ташаккур!", "Бигӯ: арзише надорад", "Rica ederim.", "Арзише надорад.",
              ["İyi günler!"]),
        ]),
    ]))

# ═════════════════════ 15. Фармоиш бо телефон ═════════════════════
made.append(pack("phone_order_tr_tg", "Telefonla sipariş", "Фармоиш бо телефон", "📞", 15, SV,
    "Тарабхона хӯрок ба хона мефиристад (paket servis). Шумо занг қабул мекунед: фармоишро "
    "менависед, суроға ва телефонро мепурсед ва мегӯед, ки хӯрок кай мерасад.",
    [
        ("Телефон", [
            w("Telefon", "телефон", None),
            w("Adres", "суроға", None),
            w("Sokak", "кӯча", None),
            w("Mahalle", "маҳалла", None),
            w("Paket", "бо худ / расонидан", None),
            w("Teslimat", "расонидан", None),
        ]),
        ("Ало!", [
            t("Alo? Sipariş vermek istiyorum.", "Ало? Фармоиш додан мехоҳам.", "Бигӯ: албатта, чӣ мехоҳед?",
              "Tabii, ne istersiniz?", "Албатта, чӣ мехоҳед?", ["Buyurun, ne istersiniz?"]),
            t("İki dürüm lütfen.", "Ду дурум, лутфан.", "Бипурс: расонем ё меоед?", "Paket mi, gelip mi alacaksınız?",
              "Расонем ё меоед?", ["Paket mi?"]),
            t("Paket lütfen.", "Расонед, лутфан.", "Бигӯ: хуб", "Tamam.", "Хуб.", ["Peki."]),
        ]),
        ("Ибораҳо", [
            s("Adresiniz lütfen", "Суроғаатон, лутфан", None),
            s("Hangi mahalle?", "Кадом маҳалла?", None),
            s("Telefon numaranız?", "Рақами телефонатон?", None),
            s("Bir daha", "Боз як бор", None),
            s("Otuz dakika", "Сӣ дақиқа", None),
            s("Görüşmek üzere", "То дидан", None),
        ]),
        ("Суроға", [
            t("Esenyurt'ta oturuyorum.", "Дар Эсенюрт зиндагӣ мекунам.", "Бипурс: кадом кӯча?", "Hangi sokak?",
              "Кадом кӯча?", ["Sokak?"]),
            t("Gül Sokak, on iki.", "Кӯчаи Гул, дувоздаҳ.", "Бипурс: рақами телефонатон?", "Telefon numaranız?",
              "Рақами телефонатон?", ["Numaranız lütfen?"]),
            t("Sıfır beş yüz…", "Сифр панҷсад…", "Бигӯ: оҳиста, лутфан", "Yavaş lütfen.", "Оҳиста, лутфан.",
              ["Bir daha lütfen."]),
        ]),
        ("Фармоиш мегирам", [
            s("Adresiniz ne?", "Суроғаатон чист?", None),
            s("Yavaş lütfen.", "Оҳиста, лутфан.", None),
            s("Otuz dakika sürer.", "Сӣ дақиқа мегирад.", None),
            s("Nakit mi ödersiniz?", "Нақд медиҳед?", None),
            s("Siparişi tekrar ediyorum.", "Фармоишро такрор мекунам.", None),
            s("Sipariş için teşekkürler.", "Барои фармоиш ташаккур.", None),
        ]),
        ("Такрор", [
            t("Yani iki dürüm?", "Пас ду дурум?", "Бигӯ: фармоишро такрор мекунам", "Siparişi tekrar ediyorum.",
              "Фармоишро такрор мекунам.", ["Evet, tekrar ediyorum."]),
            t("Evet, bir de ayran.", "Ҳа, ва як айрон.", "Бигӯ: ду дурум ва айрон", "İki dürüm ve ayran.",
              "Ду дурум ва айрон.", ["Tamam, iki dürüm bir ayran."]),
            t("Doğru!", "Дуруст!", "Бигӯ: сӣ дақиқа мегирад", "Otuz dakika sürer.", "Сӣ дақиқа мегирад.",
              ["Otuz dakika."]),
        ]),
        ("Савол аз мизоҷ", [
            s("Ne kadar sürer?", "Чӣ қадар мегирад?", None),
            s("Helal mi?", "Ҳалол аст?", None),
            s("Etli mi?", "Бо гӯшт аст?", None),
            s("Hemen soruyorum.", "Ҳозир мепурсам.", None),
            s("Evet, helal.", "Ҳа, ҳалол.", None),
            s("Bugün yok maalesef.", "Имрӯз нест, афсӯс.", None),
        ]),
        ("Ҳалол?", [
            t("Et helal mi?", "Гӯшт ҳалол аст?", "Бигӯ: ҳозир мепурсам", "Hemen soruyorum.", "Ҳозир мепурсам.",
              ["Bir dakika, soruyorum."]),
            t("Ne dedi?", "Чӣ гуфт?", "Бигӯ: ҳа, ҳалол", "Evet, helal.", "Ҳа, ҳалол.", ["Evet, hepsi helal."]),
            t("Süper! Ne kadar sürer?", "Олӣ! Чӣ қадар мегирад?", "Бигӯ: сӣ дақиқа", "Otuz dakika.", "Сӣ дақиқа.",
              ["Otuz dakika sürer."]),
        ]),
        ("Миссия: занги фармоиш", [
            t("Alo? Sipariş vermek istiyorum.", "Ало? Фармоиш медиҳам.", "Бигӯ: албатта, чӣ мехоҳед?",
              "Tabii, ne istersiniz?", "Албатта, чӣ мехоҳед?", ["Buyurun?"]),
            t("Bir tavuk dürüm.", "Як дуруми мурғ.", "Бипурс: суроғаатон чист?", "Adresiniz ne?", "Суроғаатон чист?",
              ["Adres lütfen?"]),
            t("Gül Sokak, on iki.", "Кӯчаи Гул, дувоздаҳ.", "Бипурс: нақд медиҳед?", "Nakit mi ödersiniz?",
              "Нақд медиҳед?", ["Kartla mı, nakit mi?"]),
            t("Evet, nakit.", "Ҳа, нақд.", "Бигӯ: сӣ дақиқа, ташаккур", "Otuz dakika, teşekkürler.",
              "Сӣ дақиқа, ташаккур.", ["Sipariş için teşekkürler."]),
        ]),
    ], mission_mode="call"))

# ═════════════════════ 17. Тозакунӣ ва бастан ═════════════════════
made.append(pack("closing_tr_tg", "Temizlik ve kapanış", "Тозакунӣ ва бастан", "🧹", 17, SV,
    "Охири рӯз: мизҳоро тоза мекунед, фаршро мешӯед, партовро мебаред, чароғҳоро хомӯш мекунед ва "
    "ба мудир мегӯед, ки ҳама тайёр аст.",
    [
        ("Тозакунӣ", [
            w("Temizlik", "тозакунӣ", None),
            w("Yer", "фарш", None),
            w("Çöp", "партов", None),
            w("Işık", "чароғ", None),
            w("Kapı", "дар", None),
            w("Kapatmak", "бастан", None),
        ]),
        ("Вақти бастан", [
            t("Birazdan kapatıyoruz.", "Ба наздикӣ мебандем.", "Бипурс: чӣ кор кунам?", "Ne yapayım?", "Чӣ кор кунам?",
              ["Ne yapayım abi?"]),
            t("Masaları sil.", "Мизҳоро пок кун.", "Бигӯ: хуб", "Tamam.", "Хуб.", ["Peki."]),
            t("Sonra yeri.", "Баъд фаршро.", "Бигӯ: хуб, ака", "Tamam abi.", "Хуб, ака.", ["Peki."]),
        ]),
        ("Ибораҳо", [
            w("Masalar", "мизҳо", None),
            w("Yeri", "фаршро", None),
            s("Işıkları kapat", "Чароғҳоро хомӯш кун", None),
            s("Kapıyı kilitle", "Дарро қулф кун", None),
            s("Hepsi temiz", "Ҳама тоза", None),
            s("Yarın görüşürüz", "То фардо", None),
        ]),
        ("Ҳама тоза?", [
            t("Masalar temiz mi?", "Мизҳо тозаанд?", "Бигӯ: ҳа, ҳама ҷо тоза", "Evet, her yer temiz.",
              "Ҳа, ҳама ҷо тоза.", ["Evet."]),
            t("Ya çöp?", "Ва партов?", "Бигӯ: ҳозир", "Hemen.", "Ҳозир.", ["Şimdi atıyorum."]),
            t("Sağ ol!", "Ташаккур!", "Бигӯ: арзише надорад", "Rica ederim.", "Арзише надорад.", ["Ne demek abi."]),
        ]),
        ("Кор дар охири рӯз", [
            s("Mutfağı temizliyorum.", "Ошхонаро тоза мекунам.", None),
            s("Çöpü atıyorum.", "Партовро мепартоям.", None),
            s("Yer ıslak.", "Фарш тар аст.", None),
            s("Anahtar nerede?", "Калид куҷост?", None),
            s("Işıkları kapatıyorum.", "Чароғҳоро хомӯш мекунам.", None),
            s("Her şey hazır.", "Ҳама тайёр.", None),
        ]),
        ("Калид", [
            t("Bitti mi?", "Тамом шуд?", "Бигӯ: ҳа, ҳама тайёр", "Evet, her şey hazır.", "Ҳа, ҳама тайёр.",
              ["Bitti abi."]),
            t("Güzel. Kapıyı kilitle.", "Хуб. Дарро қулф кун.", "Бипурс: калид куҷост?", "Anahtar nerede?",
              "Калид куҷост?", ["Anahtar?"]),
            t("Burada.", "Ин ҷо.", "Ташаккур гӯй", "Teşekkürler.", "Ташаккур.", ["Sağ olun."]),
        ]),
        ("Хайрухуш", [
            s("Gidebilir miyim?", "Рафта метавонам?", None),
            s("Yarın saat sekizde.", "Фардо соати ҳашт.", None),
            s("İyi akşamlar!", "Шоми хуш!", None),
            s("Çok yoruldum.", "Хеле хаста шудам.", None),
            s("Bugün çok yoğundu.", "Имрӯз хеле серкор буд.", None),
            s("İyi geceler!", "Шаб ба хайр!", None),
        ]),
        ("Рафтан мумкин?", [
            t("Bugün iyi çalıştın!", "Имрӯз хуб кор кардӣ!", "Бипурс: рафта метавонам?", "Gidebilir miyim?",
              "Рафта метавонам?", ["Gideyim mi?"]),
            t("Tabii, git.", "Албатта, рав.", "Бигӯ: то фардо", "Yarın görüşürüz!", "То фардо!", ["Hoşça kalın!"]),
            t("Yarın sekizde.", "Фардо соати ҳашт.", "Бигӯ: шаб ба хайр!", "İyi geceler!", "Шаб ба хайр!",
              ["İyi akşamlar!"]),
        ]),
        ("Миссия: охири навбат", [
            t("Kapatıyoruz. Yardım eder misin?", "Мебандем. Ёрӣ медиҳӣ?", "Бигӯ: ҳа, чӣ кор кунам?",
              "Evet, ne yapayım?", "Ҳа, чӣ кор кунам?", ["Tabii abi."]),
            t("Mutfağı ve yeri temizle.", "Ошхона ва фаршро тоза кун.", "Бигӯ: хуб", "Tamam.", "Хуб.", ["Peki abi."]),
            t("Bitti mi?", "Тамом?", "Бигӯ: ҳа, ҳама тайёр", "Evet, her şey hazır.", "Ҳа, ҳама тайёр.",
              ["Her yer temiz."]),
            t("Sağ ol! Yarın görüşürüz!", "Ташаккур! То фардо!", "Бигӯ: шаб ба хайр!", "İyi geceler!",
              "Шаб ба хайр!", ["Yarın görüşürüz!"]),
        ]),
    ]))

# ═════════════════════ 18. Хӯрок ва аллергия ═════════════════════
made.append(pack("allergy_tr_tg", "Helal ve alerji", "Хӯрок ва аллергия", "🥜", 18, SV,
    "Меҳмон мепурсад, ки дар хӯрок чӣ ҳаст: гӯшти хук, чормағз, шир. Шумо аз ошпаз мепурсед ва "
    "дақиқ ҷавоб медиҳед, то меҳмон бемор нашавад.",
    [
        ("Таркиб", [
            w("Fındık", "фундуқ, чормағз", None),
            w("Süt", "шир", None),
            w("Yumurta", "тухм", None),
            w("Alerji", "аллергия", None),
            w("Domuz", "хук", None),
            w("Sebze", "сабзавот", None),
        ]),
        ("Аллергия дорам", [
            t("Alerjim var.", "Аллергия дорам.", "Бипурс: ба чӣ?", "Neye alerjiniz var?", "Ба чӣ аллергия доред?",
              ["Neye?"]),
            t("Fındığa.", "Ба фундуқ.", "Бигӯ: аз ошпаз мепурсам", "Aşçıya soruyorum.", "Аз ошпаз мепурсам.",
              ["Bir dakika, soruyorum."]),
            t("Teşekkürler.", "Ташаккур.", "Бигӯ: як дақиқа", "Bir dakika.", "Як дақиқа.", ["Bir dakika lütfen."]),
        ]),
        ("Ибораҳо", [
            w("Fındıksız", "бе фундуқ", None),
            w("Sütlü", "бо шир", None),
            s("Domuz yok", "Хук нест", None),
            s("Sadece sebze", "Танҳо сабзавот", None),
            s("Kesinlikle eminim", "Комилан мутмаинам", None),
            s("Aşçı diyor", "Ошпаз мегӯяд", None),
        ]),
        ("Гӯшти хук?", [
            t("İçinde domuz var mı?", "Дарунаш хук ҳаст?", "Бигӯ: не, хук нест", "Hayır, domuz yok.",
              "Не, хук нест.", ["Hayır, bu tavuk."]),
            t("Emin misiniz?", "Мутмаинед?", "Бигӯ: ҳа, комилан мутмаинам", "Evet, kesinlikle eminim.",
              "Ҳа, комилан мутмаинам.", ["Evet, eminim."]),
            t("Tamam, teşekkürler.", "Хуб, ташаккур.", "Бигӯ: арзише надорад", "Rica ederim.", "Арзише надорад.",
              ["Buyurun."]),
        ]),
        ("Аз ошпаз мепурсам", [
            s("Bu fındıksız mı?", "Ин бе фундуқ аст?", None),
            s("Bunda süt var.", "Дар ин шир ҳаст.", None),
            s("Bu etsiz.", "Ин бе гӯшт.", None),
            s("Bu dana eti.", "Ин гӯшти гов.", None),
            s("Bir daha soruyorum.", "Боз мепурсам.", None),
            s("Bunu önermiyorum.", "Инро тавсия намедиҳам.", None),
        ]),
        ("Ба ошпаз", [
            t("Evet? Ne var?", "Ҳа? Чӣ гап?", "Бипурс: ин бе фундуқ аст?", "Bu fındıksız mı?", "Ин бе фундуқ аст?",
              ["İçinde fındık var mı?"]),
            t("Hayır, fındık var.", "Не, фундуқ ҳаст.", "Бигӯ: меҳмон аллергия дорад", "Misafirin alerjisi var.",
              "Меҳмон аллергия дорад.", ["Alerjisi var."]),
            t("O zaman salata ver.", "Пас салат деҳ.", "Бигӯ: хуб, ташаккур", "Tamam, teşekkürler.", "Хуб, ташаккур.",
              ["Peki usta."]),
        ]),
        ("Ҷавоб ба меҳмон", [
            s("Maalesef fındık var.", "Афсӯс, фундуқ ҳаст.", None),
            s("Salata güzel.", "Салат хуб аст.", None),
            s("Sütsüz olur.", "Бе шир мешавад.", None),
            s("Bütün etler helal.", "Ҳамаи гӯштҳо ҳалол.", None),
            s("Listeyi getiriyorum.", "Рӯйхатро меорам.", None),
            s("Afiyet olsun!", "Ош шавад!", None),
        ]),
        ("Бехатар", [
            t("Ya tatlı?", "Ва ширинӣ?", "Бигӯ: афсӯс, фундуқ ҳаст", "Maalesef fındık var.", "Афсӯс, фундуқ ҳаст.",
              ["İçinde fındık var."]),
            t("Fındıksız ne var?", "Бе фундуқ чӣ ҳаст?", "Бигӯ: салат хуб аст", "Salata güzel.", "Салат хуб аст.",
              ["Salata var."]),
            t("Tamam, salata.", "Хуб, салат.", "Бигӯ: ош шавад!", "Afiyet olsun!", "Ош шавад!", ["Hemen geliyor."]),
        ]),
        ("Миссия: меҳмони эҳтиёткор", [
            t("Merhaba! Et helal mi?", "Салом! Гӯшт ҳалол аст?", "Бигӯ: ҳа, ҳамаи гӯштҳо ҳалол",
              "Evet, bütün etler helal.", "Ҳа, ҳамаи гӯштҳо ҳалол.", ["Evet, helal."]),
            t("Süte alerjim var.", "Ба шир аллергия дорам.", "Бигӯ: аз ошпаз мепурсам", "Aşçıya soruyorum.",
              "Аз ошпаз мепурсам.", ["Bir dakika, soruyorum."]),
            t("Ne dedi?", "Чӣ гуфт?", "Бигӯ: бе шир мешавад", "Sütsüz olur.", "Бе шир мешавад.", ["Olur, sütsüz."]),
            t("Süper, teşekkürler!", "Олӣ, ташаккур!", "Бигӯ: арзише надорад", "Rica ederim.", "Арзише надорад.",
              ["Afiyet olsun!"]),
        ]),
    ]))

# ═════════════════════ 19. Рӯзи серкор ═════════════════════
made.append(pack("rush_tr_tg", "Kafede yoğun saat", "Рӯзи серкор", "⏱️", 19, SV,
    "Дар қаҳвахона навбати дароз аст: шумо тез кор мекунед, ба меҳмонон мегӯед, ки интизор шаванд, "
    "аз ҳамкор ёрӣ мехоҳед ва ба мудир мегӯед, ки чизе тамом шуд.",
    [
        ("Серкор", [
            w("Hızlı", "тез", None),
            w("Beklemek", "интизор шудан", None),
            w("İş arkadaşı", "ҳамкор", None),
            w("Kalabalık", "серодам", None),
            w("Bardak", "стакан", None),
            w("Hemen", "ҳозир", None),
        ]),
        ("Навбат дароз", [
            t("Merhaba, bir kahve!", "Салом, як қаҳва!", "Бигӯ: як дақиқа, лутфан", "Bir dakika lütfen.",
              "Як дақиқа, лутфан.", ["Bir dakika."]),
            t("Çabuk lütfen!", "Тез, лутфан!", "Бигӯ: ҳозир", "Hemen!", "Ҳозир!", ["Hemen geliyor."]),
            t("Teşekkürler.", "Ташаккур.", "Бигӯ: марҳамат", "Buyurun.", "Марҳамат.", ["Buyurun kahveniz."]),
        ]),
        ("Ибораҳо", [
            s("Biraz bekleyin", "Каме интизор шавед", None),
            s("Hemen geliyor", "Ҳозир меояд", None),
            s("Paket mi?", "Барои бурдан?", None),
            s("Burada mı?", "Ин ҷо?", None),
            w("Sıradaki", "навбатӣ", None),
            s("Yardım et!", "Ёрӣ деҳ!", None),
        ]),
        ("Барои бурдан?", [
            t("Bir çay lütfen.", "Як чой, лутфан.", "Бипурс: ин ҷо ё барои бурдан?", "Burada mı, paket mi?",
              "Ин ҷо ё барои бурдан?", ["Paket mi?"]),
            t("Paket.", "Барои бурдан.", "Бигӯ: ҳозир меояд", "Hemen geliyor.", "Ҳозир меояд.", ["Hemen!"]),
            t("Teşekkürler!", "Ташаккур!", "Бигӯ: навбатӣ, лутфан", "Sıradaki lütfen!", "Навбатӣ, лутфан!",
              ["Sıradaki!"]),
        ]),
        ("Тез кор мекунам", [
            s("Bugün çok kalabalık.", "Имрӯз хеле серодам.", None),
            s("Biraz bekleyin lütfen.", "Каме интизор шавед, лутфан.", None),
            s("Bana yardım eder misin?", "Ба ман ёрӣ медиҳӣ?", None),
            s("Bardaklar bitti.", "Стаканҳо тамом шуданд.", None),
            s("Ben kahve yapıyorum.", "Ман қаҳва тайёр мекунам.", None),
            s("Sen kasaya bak.", "Ту ба касса бин.", None),
        ]),
        ("Бо ҳамкор", [
            t("Çok kalabalık!", "Хеле серодам!", "Бипурс: ба ман ёрӣ медиҳӣ?", "Bana yardım eder misin?",
              "Ба ман ёрӣ медиҳӣ?", ["Yardım et lütfen!"]),
            t("Tabii! Ne yapayım?", "Албатта! Чӣ кунам?", "Бигӯ: ту ба касса бин", "Sen kasaya bak.", "Ту ба касса бин.",
              ["Kasaya geç."]),
            t("Ya sen?", "Ва ту?", "Бигӯ: ман қаҳва тайёр мекунам", "Ben kahve yapıyorum.", "Ман қаҳва тайёр мекунам.",
              ["Ben kahve yaparım."]),
        ]),
        ("Чизе тамом шуд", [
            s("Süt bitti.", "Шир тамом шуд.", None),
            s("Bardak lazım.", "Стакан лозим.", None),
            s("Hemen getiriyorum.", "Ҳозир меорам.", None),
            s("Beş dakika sürer.", "Панҷ дақиқа мегирад.", None),
            s("Sabrınız için teşekkürler.", "Барои сабратон ташаккур.", None),
            s("Sıradaki lütfen!", "Навбатӣ, лутфан!", None),
        ]),
        ("Ба мудир", [
            t("Ne oldu?", "Чӣ шуд?", "Бигӯ: шир тамом шуд", "Süt bitti.", "Шир тамом шуд.", ["Süt kalmadı."]),
            t("Depoda var.", "Дар анбор ҳаст.", "Бигӯ: ҳозир меорам", "Hemen getiriyorum.", "Ҳозир меорам.",
              ["Hemen."]),
            t("Sağ ol, aferin!", "Ташаккур, офарин!", "Бигӯ: арзише надорад", "Rica ederim.", "Арзише надорад.",
              ["Ne demek."]),
        ]),
        ("Миссия: соати серкор", [
            t("İki kahve lütfen!", "Ду қаҳва, лутфан!", "Бипурс: барои бурдан?", "Paket mi?", "Барои бурдан?",
              ["Burada mı, paket mi?"]),
            t("Evet. Çabuk lütfen!", "Ҳа. Тез, лутфан!", "Бигӯ: каме интизор шавед, лутфан", "Biraz bekleyin lütfen.",
              "Каме интизор шавед, лутфан.", ["Bir dakika lütfen."]),
            t("Ne kadar?", "Чӣ қадар?", "Бигӯ: панҷ дақиқа", "Beş dakika.", "Панҷ дақиқа.", ["Beş dakika sürer."]),
            t("Tamam.", "Хуб.", "Бигӯ: барои сабратон ташаккур", "Sabrınız için teşekkürler.", "Барои сабратон ташаккур.",
              ["Teşekkürler!"]),
        ]),
    ]))

# ═════════════════════ 20. Ҷадвали кор ═════════════════════
made.append(pack("schedule_tr_tg", "Çalışma programı", "Ҷадвали кор", "🗓️", 20, SV,
    "Шумо ҷадвали корро бо мудир муҳокима мекунед: кадом рӯзҳо ва соатҳо кор мекунед, рӯзи "
    "истироҳат мепурсед ва навбатро бо ҳамкор иваз мекунед.",
    [
        ("Ҷадвал", [
            w("Program", "ҷадвал", None),
            w("Vardiya", "навбат (смена)", None),
            w("İzin", "рӯзи истироҳат", None),
            w("Hafta", "ҳафта", None),
            w("Pazar", "якшанбе", None),
            w("Değiştirmek", "иваз кардан", None),
        ]),
        ("Кай кор мекунам?", [
            t("Bu çalışma programı.", "Ин ҷадвали кор.", "Бипурс: ман кай кор мекунам?", "Ben ne zaman çalışıyorum?",
              "Ман кай кор мекунам?", ["Benim vardiyam ne zaman?"]),
            t("Pazartesi ve salı.", "Душанбе ва сешанбе.", "Бипурс: соати чанд?", "Saat kaçta?", "Соати чанд?",
              ["Kaçta?"]),
            t("Sekizden dörde.", "Аз ҳашт то чор.", "Бигӯ: хуб, ташаккур", "Tamam, teşekkürler.", "Хуб, ташаккур.",
              ["Peki, sağ olun."]),
        ]),
        ("Ибораҳо", [
            s("Sekizden", "Аз ҳашт", None),
            s("Dörde kadar", "То чор", None),
            s("Hafta sonu", "Охири ҳафта", None),
            s("Sabah vardiyası", "Навбати субҳ", None),
            s("Akşam vardiyası", "Навбати шом", None),
            s("Gelecek hafta", "Ҳафтаи оянда", None),
        ]),
        ("Рӯзи истироҳат", [
            t("Cumartesi çalışıyor musun?", "Шанбе кор мекунӣ?", "Бигӯ: не, истироҳат дорам", "Hayır, iznim var.",
              "Не, истироҳат дорам.", ["Hayır."]),
            t("Ya pazar?", "Ва якшанбе?", "Бигӯ: ҳа, навбати шом", "Evet, akşam vardiyası.", "Ҳа, навбати шом.",
              ["Evet, çalışıyorum."]),
            t("Tamam, teşekkürler.", "Хуб, ташаккур.", "Бигӯ: арзише надорад", "Rica ederim.", "Арзише надорад.",
              ["Ne demek."]),
        ]),
        ("Ҷадвали ман", [
            s("Pazartesi çalışıyorum.", "Душанбе кор мекунам.", None),
            s("Sabah vardiyasındayım.", "Ман навбати субҳ дорам.", None),
            s("Cuma gelemem.", "Ҷумъа омада наметавонам.", None),
            own("___ günü iznim var.", "Рӯзи ___ истироҳат дорам.", "Рӯзи истироҳати худро гӯед.",
                "Ne zaman iznin var?", "Кай истироҳат дорӣ?", "Рӯзи истироҳатро гӯед"),
            s("Değiştirebilir miyim?", "Иваз карда метавонам?", None),
            s("Kaç saat?", "Чанд соат?", None),
        ]),
        ("Ҷумъа наметавонам", [
            t("Cuma çalışıyorsun.", "Ҷумъа кор мекунӣ.", "Бигӯ: ҷумъа омада наметавонам", "Cuma gelemem.",
              "Ҷумъа омада наметавонам.", ["Cuma olmaz."]),
            t("Neden?", "Чаро?", "Бигӯ: намози ҷумъа", "Cuma namazı var.", "Намози ҷумъа ҳаст.",
              ["Cuma namazına gidiyorum."]),
            t("Tamam. Cumartesi olur mu?", "Хуб. Шанбе мешавад?", "Бигӯ: ҳа, шанбе мешавад", "Evet, cumartesi olur.",
              "Ҳа, шанбе мешавад.", ["Olur."]),
        ]),
        ("Иваз бо ҳамкор", [
            s("Vardiya değişelim mi?", "Навбатро иваз кунем?", None),
            s("Pazartesi iznin var.", "Душанбе истироҳат дорӣ.", None),
            s("Senin yerine çalışırım.", "Ба ҷои ту кор мекунам.", None),
            s("Müdüre sorarım.", "Аз мудир мепурсам.", None),
            s("Bu olur.", "Ин мешавад.", None),
            s("Sağ ol kardeşim!", "Ташаккур, бародар!", None),
        ]),
        ("Навбатро иваз кунем?", [
            t("Ne oldu?", "Чӣ шуд?", "Бипурс: навбатро иваз кунем?", "Vardiya değişelim mi?", "Навбатро иваз кунем?",
              ["Değişebilir miyiz?"]),
            t("Ne zaman?", "Кай?", "Бигӯ: рӯзи ҷумъа", "Cuma günü.", "Рӯзи ҷумъа.", ["Cuma."]),
            t("Tamam, olur.", "Хуб, мешавад.", "Бигӯ: ташаккур, бародар!", "Sağ ol kardeşim!", "Ташаккур, бародар!",
              ["Çok sağ ol!"]),
        ]),
        ("Миссия: ҷадвали ҳафта", [
            t("Merhaba! Yeni program burada.", "Салом! Ҷадвали нав ин ҷо.", "Бипурс: ман кай кор мекунам?",
              "Ben ne zaman çalışıyorum?", "Ман кай кор мекунам?", ["Benim vardiyam ne zaman?"]),
            t("Cuma ve cumartesi, akşam.", "Ҷумъа ва шанбе, шом.", "Бигӯ: ҷумъа омада наметавонам", "Cuma gelemem.",
              "Ҷумъа омада наметавонам.", ["Cuma olmaz."]),
            t("Hmm. Pazartesi olur mu?", "Ҳм. Душанбе мешавад?", "Бигӯ: ҳа, душанбе мешавад", "Evet, pazartesi olur.",
              "Ҳа, душанбе мешавад.", ["Olur."]),
            t("Tamam, pazartesi.", "Хуб, душанбе.", "Ташаккури зиёд гӯй", "Çok teşekkürler!", "Ташаккури зиёд!",
              ["Sağ olun!"]),
        ]),
    ]))

finish(made)
