"""ОЛМОНӢ → тоҷикӣ, «Гуфтор» A1 — нишаи «Таҳсил» (`study`), 04.10.2026.

11 вазъият барои донишҷӯи тоҷик дар Олмон — ҳамон тартиби русӣ/англисӣ: омадан, идораи
донишгоҳ, хобгоҳ (Wohnheim), дар дарс, ҷадвал, китобхона, ҳамкурсон, ёрӣ пурсидан,
имтиҳон, ошхонаи донишгоҳ (Mensa), бонк ва стипендия.

Роҳи `study` = 5 вазъияти умумӣ (1 салом, 6 духтур, 10 бозор, 14 иҷора, 16 ҳуҷҷат)
+ ин 11 → 16 вазъият (`order`: 2–5, 7–9, 11–13, 15).

Қоидаҳо — `_de_packs_lib.py`: рақам бо ҳарф; бо муаллим ва кормандон — «Sie», бо
ҳамкурс — «du». Транскрипсия баъд: `node prisma/_de-fill-literal.mjs <slugs>`.

Аз ҷузвдони backend: python prisma/_de-study-a1-packs.py
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _de_packs_lib import *  # noqa: F401,F403

made = []
S = ["study"]

# ═════════════════════ 2. Омадан барои таҳсил ═════════════════════
made.append(pack("arrive_de_tg", "Ankunft zum Studium", "Омадан барои таҳсил", "✈️", 2, S,
    "Шумо барои таҳсил ба Олмон омадед. Дар фурудгоҳ мегӯед, ки донишҷӯед ва дар кадом "
    "донишгоҳ мехонед, визаро нишон медиҳед ва бо такси ба хобгоҳ меравед.",
    [
        ("Фурудгоҳ", [
            w("Student", "донишҷӯ", "Зан: «Studentin»."),
            w("Universität", "донишгоҳ", "Кӯтоҳ: «Uni»."),
            w("Visum", "виза", None),
            w("Studium", "таҳсил", None),
            w("Koffer", "ҷомадон", None),
            w("Wohnheim", "хобгоҳ (ётоқ)", "Хобгоҳи донишҷӯён."),
        ]),
        ("Назорати шиноснома", [
            t("Warum sind Sie hier?", "Чаро ин ҷо омадед?", "Бигӯ: барои таҳсил", "Zum Studium.", "Барои таҳсил.",
              ["Ich studiere hier.", "Studium."], "Кӯтоҳ ҷавоб диҳед."),
            t("Sind Sie Student?", "Шумо донишҷӯед?", "Бигӯ: ҳа", "Ja.", "Ҳа.", ["Ja, ich bin Student.", "Ja, Studentin."]),
            t("Was ist im Koffer?", "Дар ҷомадон чӣ ҳаст?", "Бигӯ: либос", "Kleidung.", "Либос.",
              ["Meine Kleidung.", "Nur Kleidung."]),
        ]),
        ("Виза", [
            s("Mein Visum", "Визаи ман", None),
            s("Ein Jahr", "Як сол", None),
            s("Welche Uni?", "Кадом донишгоҳ?", None),
            s("Zum Wohnheim", "Ба хобгоҳ", None),
            w("Taxi", "такси", None),
            s("Hier, bitte", "Мана, марҳамат", None),
        ]),
        ("Виза, лутфан", [
            t("Ihr Visum, bitte.", "Визаатон, лутфан.", "Бигӯ: мана, марҳамат", "Hier, bitte.", "Мана, марҳамат.",
              ["Hier ist mein Visum.", "Bitte."]),
            t("Wie lange bleiben Sie?", "Чӣ қадар мемонед?", "Бигӯ: як сол", "Ein Jahr.", "Як сол.",
              ["Ein Jahr, zum Studium.", "Für ein Jahr."]),
            t("Willkommen in Deutschland!", "Ба Олмон хуш омадед!", "Ташаккур гӯй", "Danke.", "Ташаккур.",
              ["Danke schön.", "Vielen Dank!"]),
        ]),
        ("Ман донишҷӯям", [
            s("Ich bin Student.", "Ман донишҷӯ ҳастам.", "Зан мегӯяд: «Ich bin Studentin»."),
            s("Ich studiere hier.", "Ман ин ҷо мехонам.", None),
            own("Ich studiere in ___.", "Ман дар ___ мехонам.", "Номи шаҳр ё донишгоҳи худро гӯед.",
                "Wo studieren Sie?", "Шумо дар куҷо мехонед?", "Номи шаҳр ё донишгоҳро гӯед"),
            s("Wo ist der Ausgang?", "Баромадгоҳ куҷост?", None),
            s("Ich brauche ein Taxi.", "Ба ман такси лозим.", None),
            s("Das ist mein Koffer.", "Ин ҷомадони ман.", None),
        ]),
        ("Мақсади омадан", [
            t("Guten Tag. Warum kommen Sie?", "Рӯз ба хайр. Чаро меоед?", "Бигӯ: ман ин ҷо мехонам",
              "Ich studiere hier.", "Ман ин ҷо мехонам.", ["Zum Studium.", "Ich bin Student."]),
            t("Wo studieren Sie?", "Дар куҷо мехонед?", "Бигӯ: дар донишгоҳ", "An der Uni.", "Дар донишгоҳ.",
              ["An der Universität.", "In Berlin."]),
            t("Gut. Willkommen!", "Хуб. Хуш омадед!", "Ташаккур гӯй", "Danke!", "Ташаккур!", ["Danke schön!"]),
        ]),
        ("Такси", [
            s("Wo ist das Taxi?", "Такси куҷост?", None),
            s("Zum Wohnheim, bitte.", "Ба хобгоҳ, лутфан.", None),
            s("Was kostet das?", "Ин чанд пул?", None),
            s("Hier ist die Adresse.", "Ана суроға.", None),
            s("Mein Koffer ist weg.", "Ҷомадонам гум шуд.", None),
            s("Helfen Sie mir, bitte.", "Ба ман ёрӣ диҳед, лутфан.", None),
        ]),
        ("Ба хобгоҳ", [
            t("Taxi? Wohin?", "Такси? Ба куҷо?", "Бигӯ: ба хобгоҳ, лутфан", "Zum Wohnheim, bitte.",
              "Ба хобгоҳ, лутфан.", ["Zum Wohnheim.", "Hier ist die Adresse."]),
            t("Gut. Steigen Sie ein.", "Хуб. Шинед.", "Бипурс: чанд пул?", "Was kostet das?", "Чанд пул?",
              ["Wie viel kostet das?", "Wie viel?"]),
            t("Dreißig Euro.", "Сӣ евро.", "Бигӯ: хуб, ташаккур", "Gut, danke.", "Хуб, ташаккур.", ["Okay, danke."]),
        ]),
        ("Миссия: фурудгоҳ", [
            t("Ihren Pass, bitte. Warum kommen Sie?", "Шиносномаатон, лутфан. Чаро меоед?",
              "Бигӯ: ман ин ҷо мехонам", "Ich studiere hier.", "Ман ин ҷо мехонам.", ["Zum Studium."]),
            t("Welche Universität?", "Кадом донишгоҳ?", "Бигӯ: донишгоҳ дар Берлин", "Die Uni in Berlin.",
              "Донишгоҳ дар Берлин.", ["Universität Berlin.", "In Berlin."]),
            t("Haben Sie ein Visum?", "Виза доред?", "Бигӯ: ҳа, мана визаам", "Ja, hier ist mein Visum.",
              "Ҳа, мана визаам.", ["Ja, hier.", "Ja, bitte."]),
            t("Alles gut. Willkommen!", "Ҳама дуруст. Хуш омадед!", "Ташаккури зиёд гӯй", "Vielen Dank!",
              "Ташаккури зиёд!", ["Danke schön!", "Danke!"]),
        ]),
    ]))

# ═════════════════════ 3. Идораи донишгоҳ ═════════════════════
made.append(pack("register_de_tg", "Im Studienbüro", "Идораи донишгоҳ", "🏫", 3, S,
    "Шумо ба идораи донишгоҳ меравед: мегӯед, ки донишҷӯи нав ҳастед, факултетро мегӯед, "
    "формаро пур мекунед, акс ва нусхаи шиносномаро медиҳед ва мепурсед, ки корти донишҷӯӣ "
    "кай тайёр мешавад.",
    [
        ("Идора", [
            w("Büro", "идора", None),
            w("Formular", "форма, варақа", None),
            w("Foto", "акс", None),
            w("Kopie", "нусха", None),
            w("Ausweis", "корт, ҳуҷҷат", "«Studentenausweis» — корти донишҷӯӣ."),
            w("Fach", "факултет, ихтисос", "Чизе ки мехонед: Deutsch, Informatik…"),
        ]),
        ("Донишҷӯи нав", [
            t("Hallo! Was möchten Sie?", "Салом! Чӣ мехоҳед?", "Бигӯ: ман донишҷӯи нав ҳастам",
              "Ich bin neu hier.", "Ман ин ҷо нав ҳастам.", ["Ich bin ein neuer Student.", "Ich bin neu."]),
            t("Welches Fach?", "Кадом ихтисос?", "Бигӯ: забони олмонӣ", "Deutsch.", "Забони олмонӣ.",
              ["Informatik.", "Ich studiere Deutsch."]),
            t("Füllen Sie das Formular aus.", "Формаро пур кунед.", "Бигӯ: хуб", "Okay.", "Хуб.", ["Gut.", "Ja, gut."]),
        ]),
        ("Ҳуҷҷатҳо", [
            s("Erstes Semester", "Семестри аввал", None),
            s("Zwei Fotos", "Ду акс", None),
            s("Eine Kopie", "Як нусха", None),
            s("Ihr Name?", "Номатон?", None),
            w("Pass", "шиноснома", None),
            w("Fertig", "тайёр", None),
        ]),
        ("Акс лозим", [
            t("Wie ist Ihr Name?", "Номатон чист?", "Бигӯ: Раҳимов", "Rahimov.", "Раҳимов.",
              ["Mein Name ist Rahimov.", "Ich heiße Rahimov."]),
            t("Wir brauchen Fotos.", "Ба мо акс лозим.", "Бипурс: чандто?", "Wie viele?", "Чандто?",
              ["Wie viele Fotos?"]),
            t("Zwei Fotos und eine Kopie.", "Ду акс ва як нусха.", "Бигӯ: мана, марҳамат", "Hier, bitte.",
              "Мана, марҳамат.", ["Bitte schön.", "Hier sind sie."]),
        ]),
        ("Форма", [
            s("Ich bin neu hier.", "Ман ин ҷо нав ҳастам.", None),
            s("Ich studiere Informatik.", "Ман информатика мехонам.", None),
            own("Mein Fach ist ___.", "Ихтисоси ман ___.", "Ихтисоси худро гӯед.",
                "Was studieren Sie?", "Шумо чӣ мехонед?", "Ихтисоси худро гӯед"),
            s("Wo ist das Formular?", "Форма куҷост?", None),
            s("Hier ist mein Pass.", "Мана шиносномаам.", None),
            s("Ich habe zwei Fotos.", "Ман ду акс дорам.", None),
        ]),
        ("Ҳуҷҷатҳо, лутфан", [
            t("Ihren Pass, bitte.", "Шиносномаатон, лутфан.", "Бигӯ: мана шиносномаам", "Hier ist mein Pass.",
              "Мана шиносномаам.", ["Hier, bitte.", "Bitte schön."]),
            t("Haben Sie Fotos?", "Акс доред?", "Бигӯ: ҳа, ду акс", "Ja, zwei Fotos.", "Ҳа, ду акс.",
              ["Ja, ich habe zwei Fotos.", "Ja."]),
            t("Und eine Kopie vom Pass?", "Ва нусхаи шиноснома?", "Бигӯ: ҳа, мана", "Ja, hier.", "Ҳа, мана.",
              ["Ja, hier ist die Kopie.", "Hier, bitte."]),
        ]),
        ("Корти донишҷӯӣ", [
            s("Wann ist er fertig?", "Кай тайёр мешавад?", "«er» — Ausweis."),
            s("Mein Studentenausweis", "Корти донишҷӯии ман", None),
            s("Bis Freitag?", "То ҷумъа?", None),
            s("Noch eine Frage.", "Боз як савол.", None),
            s("Wo ist Raum zehn?", "Ҳуҷраи даҳ куҷост?", None),
            s("Danke für die Hilfe.", "Барои ёрӣ ташаккур.", None),
        ]),
        ("Кай тайёр?", [
            t("Gut, alles ist da.", "Хуб, ҳама ҳаст.", "Бипурс: корт кай тайёр мешавад?", "Wann ist der Ausweis fertig?",
              "Корт кай тайёр мешавад?", ["Wann ist er fertig?", "Wann?"]),
            t("Am Freitag.", "Рӯзи ҷумъа.", "Бигӯ: хуб, ташаккур", "Gut, danke.", "Хуб, ташаккур.",
              ["Okay, danke.", "Danke schön."]),
            t("Noch Fragen?", "Боз савол ҳаст?", "Бигӯ: не, ташаккур", "Nein, danke.", "Не, ташаккур.",
              ["Nein, alles gut.", "Nein."]),
        ]),
        ("Миссия: сабти ном", [
            t("Guten Tag! Kann ich helfen?", "Рӯз ба хайр! Ёрӣ диҳам?", "Бигӯ: ман донишҷӯи нав ҳастам",
              "Ich bin neu hier.", "Ман ин ҷо нав ҳастам.", ["Ich bin ein neuer Student.", "Ja, ich bin neu."]),
            t("Was studieren Sie?", "Чӣ мехонед?", "Бигӯ: информатика", "Informatik.", "Информатика.",
              ["Ich studiere Informatik.", "Deutsch."]),
            t("Haben Sie Fotos und eine Kopie?", "Акс ва нусха доред?", "Бигӯ: ҳа, мана", "Ja, hier, bitte.",
              "Ҳа, мана, марҳамат.", ["Ja, hier.", "Ja."]),
            t("Gut. Der Ausweis ist am Freitag fertig.", "Хуб. Корт рӯзи ҷумъа тайёр.", "Ташаккур гӯй ва хайр",
              "Danke! Tschüss!", "Ташаккур! Хайр!", ["Vielen Dank!", "Danke schön, auf Wiedersehen!"]),
        ]),
    ]))

# ═════════════════════ 4. Хобгоҳ ═════════════════════
made.append(pack("dorm_de_tg", "Im Wohnheim", "Хобгоҳ", "🛏️", 4, S,
    "Шумо ба хобгоҳи донишҷӯён (Wohnheim) меоед: калидро мегиред, ҳуҷра ва ошхонаро мепурсед, "
    "бо ҳамҳуҷра шинос мешавед ва мегӯед, ки чизе кор намекунад.",
    [
        ("Ҳуҷра", [
            w("Zimmer", "ҳуҷра", None),
            w("Schlüssel", "калид", None),
            w("Küche", "ошхона", None),
            w("Bad", "ҳаммом", None),
            w("Bett", "кат", None),
            w("Stock", "ошёна", "«Im zweiten Stock» — дар ошёнаи дуюм."),
        ]),
        ("Калид", [
            t("Hallo! Sind Sie neu?", "Салом! Шумо навед?", "Бигӯ: ҳа", "Ja.", "Ҳа.", ["Ja, ich bin neu."]),
            t("Wie ist Ihr Name?", "Номатон чист?", "Бигӯ: Ҳасанов", "Hasanov.", "Ҳасанов.",
              ["Mein Name ist Hasanov.", "Ich heiße Hasanov."]),
            t("Hier ist der Schlüssel.", "Мана калид.", "Ташаккур гӯй", "Danke.", "Ташаккур.", ["Danke schön."]),
        ]),
        ("Дар хобгоҳ", [
            s("Mein Zimmer", "Ҳуҷраи ман", None),
            s("Welcher Stock?", "Кадом ошёна?", None),
            s("Die Küche", "Ошхона", None),
            s("Das Bad", "Ҳаммом", None),
            w("Mitbewohner", "ҳамҳуҷра", "Зан: «Mitbewohnerin»."),
            w("Kaputt", "вайрон", None),
        ]),
        ("Ҳуҷраи ман куҷост?", [
            t("Zimmer zwölf.", "Ҳуҷраи дувоздаҳ.", "Бипурс: кадом ошёна?", "Welcher Stock?", "Кадом ошёна?",
              ["In welchem Stock?"]),
            t("Im zweiten Stock.", "Дар ошёнаи дуюм.", "Бипурс: ошхона куҷост?", "Wo ist die Küche?",
              "Ошхона куҷост?", ["Und die Küche?"]),
            t("Die Küche ist hier.", "Ошхона ин ҷост.", "Бигӯ: хуб, ташаккур", "Gut, danke.", "Хуб, ташаккур.",
              ["Okay, danke.", "Danke schön."]),
        ]),
        ("Ҳамҳуҷра", [
            s("Ich bin dein Mitbewohner.", "Ман ҳамҳуҷраи ту ҳастам.", "Зан: «deine Mitbewohnerin»."),
            s("Ich heiße Ali.", "Номи ман Алӣ.", None),
            s("Woher kommst du?", "Ту аз куҷоӣ?", None),
            s("Ich komme aus Tadschikistan.", "Ман аз Тоҷикистонам.", None),
            s("Das ist mein Bett.", "Ин кати ман.", None),
            s("Ist das frei?", "Ин холӣ аст?", None),
        ]),
        ("Шиносоӣ бо ҳамҳуҷра", [
            t("Hallo! Ich bin Max. Und du?", "Салом! Ман Макс. Ту чӣ?", "Номи худро гӯй: Алӣ", "Ich heiße Ali.",
              "Номи ман Алӣ.", ["Ich bin Ali.", "Ali."]),
            t("Woher kommst du?", "Аз куҷоӣ?", "Бигӯ: аз Тоҷикистон", "Aus Tadschikistan.", "Аз Тоҷикистон.",
              ["Ich komme aus Tadschikistan."]),
            t("Das Bett hier ist frei.", "Ин кат холӣ аст.", "Бигӯ: хуб, ташаккур", "Gut, danke.", "Хуб, ташаккур.",
              ["Super, danke.", "Danke."]),
        ]),
        ("Чизе кор намекунад", [
            s("Das Licht ist kaputt.", "Чароғ вайрон аст.", None),
            s("Die Dusche ist kaputt.", "Душ вайрон аст.", None),
            s("Es gibt kein Wasser.", "Об нест.", None),
            s("Kein Internet.", "Интернет нест.", None),
            s("Wann kommt jemand?", "Кай касе меояд?", None),
            s("Mein Zimmer ist kalt.", "Ҳуҷраам хунук аст.", None),
        ]),
        ("Ба мудири хобгоҳ", [
            t("Ja, bitte?", "Ҳа, лутфан?", "Бигӯ: душ вайрон аст", "Die Dusche ist kaputt.", "Душ вайрон аст.",
              ["Die Dusche geht nicht.", "Kaputt, die Dusche."]),
            t("Welches Zimmer?", "Кадом ҳуҷра?", "Бигӯ: ҳуҷраи дувоздаҳ", "Zimmer zwölf.", "Ҳуҷраи дувоздаҳ.",
              ["Zwölf."]),
            t("Morgen kommt jemand.", "Фардо касе меояд.", "Бигӯ: хуб, ташаккур", "Gut, danke.", "Хуб, ташаккур.",
              ["Okay, danke schön."]),
        ]),
        ("Миссия: рӯзи аввал дар хобгоҳ", [
            t("Hallo! Sind Sie Herr Hasanov?", "Салом! Шумо ҷаноби Ҳасанов?", "Бигӯ: ҳа", "Ja, das bin ich.",
              "Ҳа, ман ҳамонам.", ["Ja.", "Ja, genau."]),
            t("Hier ist der Schlüssel. Zimmer zwölf.", "Мана калид. Ҳуҷраи дувоздаҳ.", "Бипурс: кадом ошёна?",
              "Welcher Stock?", "Кадом ошёна?", ["In welchem Stock?"]),
            t("Im zweiten Stock. Noch Fragen?", "Дар ошёнаи дуюм. Боз савол?", "Бипурс: ошхона куҷост?",
              "Wo ist die Küche?", "Ошхона куҷост?", ["Und die Küche?"]),
            t("Neben dem Bad. Viel Glück!", "Паҳлӯи ҳаммом. Барори кор!", "Ташаккур гӯй", "Vielen Dank!",
              "Ташаккури зиёд!", ["Danke schön!", "Danke!"]),
        ]),
    ]))

# ═════════════════════ 5. Дар дарс ═════════════════════
made.append(pack("class_de_tg", "Im Unterricht", "Дар дарс", "📚", 5, S,
    "Шумо дар дарс ҳастед: салом медиҳед, мегӯед, ки нафаҳмидед, хоҳиш мекунед, ки оҳиста гап "
    "зананд ё такрор кунанд, ва мепурсед, ки калима чӣ маъно дорад.",
    [
        ("Синф", [
            w("Lehrer", "муаллим", "Зан: «Lehrerin»."),
            w("Buch", "китоб", None),
            w("Heft", "дафтар", None),
            w("Stift", "ручка", None),
            w("Seite", "саҳифа", None),
            w("Frage", "савол", None),
        ]),
        ("Оғози дарс", [
            t("Guten Morgen!", "Субҳ ба хайр!", "Салом гӯй", "Guten Morgen!", "Субҳ ба хайр!", ["Morgen!", "Hallo!"]),
            t("Ist Ali da?", "Алӣ ҳаст?", "Бигӯ: ҳа, ман ин ҷо", "Ja, hier.", "Ҳа, ин ҷо.", ["Ja.", "Hier!"]),
            t("Öffnen Sie das Buch.", "Китобро кушоед.", "Бипурс: кадом саҳифа?", "Welche Seite?", "Кадом саҳифа?",
              ["Seite?"]),
        ]),
        ("Нафаҳмидам", [
            s("Noch einmal", "Боз як бор", None),
            s("Bitte langsam", "Оҳиста, лутфан", None),
            s("Ich verstehe", "Ман мефаҳмам", None),
            s("Nicht verstanden", "Нафаҳмидам", None),
            s("Welche Seite?", "Кадом саҳифа?", None),
            s("Eine Frage", "Як савол", None),
        ]),
        ("Оҳиста, лутфан", [
            t("Lesen Sie Seite zehn.", "Саҳифаи даҳро хонед.", "Бигӯ: оҳиста, лутфан", "Bitte langsam.",
              "Оҳиста, лутфан.", ["Langsam, bitte.", "Bitte etwas langsamer."]),
            t("Seite zehn. Verstehen Sie?", "Саҳифаи даҳ. Мефаҳмед?", "Бигӯ: ҳа, мефаҳмам", "Ja, ich verstehe.",
              "Ҳа, мефаҳмам.", ["Ja.", "Ja, danke."]),
            t("Gut. Wer liest?", "Хуб. Кӣ мехонад?", "Бигӯ: ман", "Ich.", "Ман.", ["Ich lese.", "Ich, bitte."]),
        ]),
        ("Саволҳо дар дарс", [
            s("Ich verstehe nicht.", "Ман намефаҳмам.", None),
            s("Noch einmal, bitte.", "Боз як бор, лутфан.", None),
            s("Was heißt das?", "Ин чӣ маъно дорад?", None),
            s("Ich habe eine Frage.", "Ман як савол дорам.", None),
            s("Wie schreibt man das?", "Инро чӣ тавр менависанд?", None),
            s("Ich habe kein Buch.", "Ман китоб надорам.", None),
        ]),
        ("Калимаи нав", [
            t("Das Wort heißt Hausaufgabe.", "Калима «вазифаи хонагӣ» аст.", "Бипурс: ин чӣ маъно дорад?",
              "Was heißt das?", "Ин чӣ маъно дорад?", ["Was bedeutet das?", "Was heißt Hausaufgabe?"]),
            t("Arbeit für zu Hause.", "Кор барои хона.", "Бигӯ: ҳа, мефаҳмам", "Ah, ich verstehe.", "А, мефаҳмам.",
              ["Ja, verstanden.", "Danke, ich verstehe."]),
            t("Gut. Noch Fragen?", "Хуб. Боз савол?", "Бигӯ: не, ташаккур", "Nein, danke.", "Не, ташаккур.",
              ["Nein.", "Alles klar, danke."]),
        ]),
        ("Ёрӣ дар синф", [
            s("Hast du einen Stift?", "Ручка дорӣ?", None),
            s("Ich habe es vergessen.", "Ман фаромӯш кардам.", None),
            s("Ich bin spät, Entschuldigung.", "Дер кардам, мебахшед.", None),
            s("Darf ich rein?", "Даромада метавонам?", None),
            s("Darf ich fragen?", "Пурсам мешавад?", None),
            s("Bis morgen!", "То фардо!", None),
        ]),
        ("Дер кардам", [
            t("Ja? Kommen Sie rein.", "Ҳа? Дароед.", "Бигӯ: мебахшед, дер кардам", "Entschuldigung, ich bin spät.",
              "Мебахшед, дер кардам.", ["Entschuldigung!", "Sorry, ich bin spät."]),
            t("Kein Problem. Setzen Sie sich.", "Мушкил нест. Шинед.", "Ташаккур гӯй", "Danke.", "Ташаккур.",
              ["Danke schön."]),
            t("Wir sind auf Seite zehn.", "Мо дар саҳифаи даҳ ҳастем.", "Бигӯ: хуб", "Okay.", "Хуб.",
              ["Gut, danke.", "Seite zehn, okay."]),
        ]),
        ("Миссия: дарси аввал", [
            t("Guten Morgen! Wie heißen Sie?", "Субҳ ба хайр! Номатон чист?", "Номи худро гӯй: Алӣ", "Ich heiße Ali.",
              "Номи ман Алӣ.", ["Mein Name ist Ali.", "Ali."]),
            t("Haben Sie ein Buch?", "Китоб доред?", "Бигӯ: не, китоб надорам", "Nein, ich habe kein Buch.",
              "Не, китоб надорам.", ["Nein, leider nicht.", "Nein."]),
            t("Kein Problem. Lesen Sie mit Max.", "Мушкил нест. Бо Макс хонед.", "Бигӯ: хуб, ташаккур",
              "Gut, danke.", "Хуб, ташаккур.", ["Okay, danke."]),
            t("Seite zwölf, bitte.", "Саҳифаи дувоздаҳ, лутфан.", "Бигӯ: боз як бор, лутфан", "Noch einmal, bitte.",
              "Боз як бор, лутфан.", ["Welche Seite?", "Bitte noch einmal."]),
        ]),
    ]))

# ═════════════════════ 7. Ҷадвали дарсҳо ═════════════════════
made.append(pack("timetable_de_tg", "Der Stundenplan", "Ҷадвали дарсҳо", "🗓️", 7, S,
    "Шумо ҷадвали дарсҳоро меомӯзед: рӯзҳои ҳафта, вақти дарс, кадом ҳуҷра ва кадом муаллим. "
    "Аз ҳамкурс мепурсед, ки фардо дарс ҳаст ё не.",
    [
        ("Рӯзҳо", [
            w("Montag", "душанбе", None),
            w("Dienstag", "сешанбе", None),
            w("Mittwoch", "чоршанбе", None),
            w("Donnerstag", "панҷшанбе", None),
            w("Freitag", "ҷумъа", None),
            w("Stundenplan", "ҷадвали дарсҳо", None),
        ]),
        ("Кай дарс?", [
            t("Hast du heute Unterricht?", "Имрӯз дарс дорӣ?", "Бигӯ: ҳа", "Ja.", "Ҳа.", ["Ja, heute.", "Ja, ich habe Unterricht."]),
            t("Wann?", "Кай?", "Бигӯ: соати нӯҳ", "Um neun Uhr.", "Соати нӯҳ.", ["Um neun.", "Neun Uhr."]),
            t("Und morgen?", "Ва фардо?", "Бигӯ: не", "Nein.", "Не.", ["Morgen nicht.", "Nein, morgen frei."]),
        ]),
        ("Вақт", [
            s("Um neun", "Соати нӯҳ", None),
            s("Um zehn", "Соати даҳ", None),
            s("Heute frei", "Имрӯз дам", None),
            s("Welcher Raum?", "Кадом ҳуҷра?", None),
            s("Jeden Montag", "Ҳар душанбе", None),
            s("Am Freitag", "Рӯзи ҷумъа", None),
        ]),
        ("Дарс дар кадом ҳуҷра?", [
            t("Deutsch ist um zehn.", "Олмонӣ соати даҳ.", "Бипурс: кадом ҳуҷра?", "Welcher Raum?", "Кадом ҳуҷра?",
              ["In welchem Raum?", "Wo?"]),
            t("Raum zwanzig.", "Ҳуҷраи бист.", "Бипурс: кадом рӯз?", "Welcher Tag?", "Кадом рӯз?", ["Wann?"]),
            t("Jeden Montag.", "Ҳар душанбе.", "Бигӯ: хуб, ташаккур", "Gut, danke.", "Хуб, ташаккур.", ["Danke."]),
        ]),
        ("Ҷадвали ман", [
            s("Montags habe ich Deutsch.", "Душанбеҳо олмонӣ дорам.", None),
            s("Deutsch ist um neun.", "Олмонӣ соати нӯҳ аст.", None),
            s("Freitags bin ich frei.", "Ҷумъаҳо ман озодам.", None),
            own("Mein Unterricht ist am ___.", "Дарси ман рӯзи ___ аст.", "Рӯзи дарси худро гӯед.",
                "Wann hast du Unterricht?", "Кай дарс дорӣ?", "Рӯзи дарсатонро гӯед"),
            s("Wer ist der Lehrer?", "Муаллим кист?", None),
            s("Wo ist Raum zwanzig?", "Ҳуҷраи бист куҷост?", None),
        ]),
        ("Ҷадвал куҷост?", [
            t("Hast du den Stundenplan?", "Ҷадвалро дорӣ?", "Бигӯ: не, надорам", "Nein, ich habe ihn nicht.",
              "Не, надорам.", ["Nein.", "Nein, leider nicht."]),
            t("Er ist im Internet.", "Он дар интернет аст.", "Бигӯ: хуб, ташаккур", "Gut, danke.", "Хуб, ташаккур.",
              ["Ah, danke!", "Okay, danke."]),
            t("Wir haben am Montag Deutsch.", "Рӯзи душанбе олмонӣ дорем.", "Бипурс: соати чанд?", "Um wie viel Uhr?",
              "Соати чанд?", ["Wann?", "Um wie viel?"]),
        ]),
        ("Тағйир дар ҷадвал", [
            s("Heute kein Unterricht?", "Имрӯз дарс нест?", None),
            s("Der Lehrer ist krank.", "Муаллим бемор аст.", None),
            s("Der Raum ist neu.", "Ҳуҷра нав аст.", None),
            s("Bis wann?", "То кай?", None),
            s("Ich komme morgen.", "Ман фардо меоям.", None),
            s("Danke für die Info.", "Барои хабар ташаккур.", None),
        ]),
        ("Дарс нест", [
            t("Heute ist kein Unterricht.", "Имрӯз дарс нест.", "Бипурс: чаро?", "Warum?", "Чаро?", ["Warum nicht?"]),
            t("Der Lehrer ist krank.", "Муаллим бемор аст.", "Бипурс: ва фардо?", "Und morgen?", "Ва фардо?",
              ["Morgen auch nicht?"]),
            t("Morgen um neun, wie immer.", "Фардо соати нӯҳ, мисли ҳамеша.", "Бигӯ: хуб, ташаккур",
              "Gut, danke für die Info.", "Хуб, барои хабар ташаккур.", ["Okay, danke.", "Danke."]),
        ]),
        ("Миссия: ҳафтаи нав", [
            t("Hallo! Hast du morgen Unterricht?", "Салом! Фардо дарс дорӣ?", "Бигӯ: ҳа, соати нӯҳ",
              "Ja, um neun Uhr.", "Ҳа, соати нӯҳ.", ["Ja, um neun.", "Ja."]),
            t("Welcher Raum?", "Кадом ҳуҷра?", "Бигӯ: ҳуҷраи бист", "Raum zwanzig.", "Ҳуҷраи бист.",
              ["Zwanzig.", "In Raum zwanzig."]),
            t("Und am Freitag?", "Ва рӯзи ҷумъа?", "Бигӯ: рӯзи ҷумъа ман озодам", "Am Freitag bin ich frei.",
              "Рӯзи ҷумъа ман озодам.", ["Freitag ist frei.", "Frei."]),
            t("Super! Bis morgen!", "Олӣ! То фардо!", "Бигӯ: то фардо", "Bis morgen!", "То фардо!", ["Tschüss!"]),
        ]),
    ]))

# ═════════════════════ 8. Дар китобхона ═════════════════════
made.append(pack("library_de_tg", "In der Bibliothek", "Дар китобхона", "📖", 8, S,
    "Шумо ба китобхона меравед: китоб меҷӯед, мепурсед, ки онро ба хона гирифтан мумкин аст, "
    "то кай бояд баргардонед ва Wi-Fi чӣ тавр кор мекунад.",
    [
        ("Китобхона", [
            w("Bibliothek", "китобхона", None),
            w("Ausleihen", "(китоб) гирифтан", "Барои муддате гирифтан."),
            w("Zurück", "ба қафо, баргардонидан", None),
            w("Leise", "оҳиста, бесадо", None),
            w("Platz", "ҷой", None),
            w("Kopieren", "нусха гирифтан", None),
        ]),
        ("Китоб меҷӯям", [
            t("Hallo! Was suchen Sie?", "Салом! Чӣ меҷӯед?", "Бигӯ: як китоб", "Ein Buch.", "Як китоб.",
              ["Ich suche ein Buch.", "Ein Buch, bitte."]),
            t("Welches Buch?", "Кадом китоб?", "Бигӯ: китоби олмонӣ", "Ein Deutschbuch.", "Китоби олмонӣ.",
              ["Ein Buch für Deutsch."]),
            t("Es ist dort.", "Он дар он ҷост.", "Ташаккур гӯй", "Danke.", "Ташаккур.", ["Danke schön."]),
        ]),
        ("Қоидаҳо", [
            s("Bitte leise", "Оҳиста, лутфан", None),
            s("Zwei Wochen", "Ду ҳафта", None),
            s("Mein Ausweis", "Корти ман", None),
            s("Ein Platz", "Як ҷой", None),
            w("Passwort", "рамз (парол)", None),
            s("Bis Montag", "То душанбе", None),
        ]),
        ("Ба хона гирифтан", [
            t("Möchten Sie das Buch ausleihen?", "Китобро гирифтан мехоҳед?", "Бигӯ: ҳа, лутфан", "Ja, bitte.",
              "Ҳа, лутфан.", ["Ja.", "Ja, gerne."]),
            t("Ihren Ausweis, bitte.", "Кортатон, лутфан.", "Бигӯ: мана", "Hier, bitte.", "Мана, марҳамат.",
              ["Bitte schön."]),
            t("Zwei Wochen.", "Ду ҳафта.", "Бигӯ: хуб, ташаккур", "Gut, danke.", "Хуб, ташаккур.", ["Okay, danke."]),
        ]),
        ("Саволҳо дар китобхона", [
            s("Wo sind die Bücher?", "Китобҳо куҷоянд?", None),
            s("Kann ich das ausleihen?", "Инро гирифта метавонам?", None),
            s("Bis wann?", "То кай?", None),
            s("Wo kann ich kopieren?", "Дар куҷо нусха гирам?", None),
            s("Ist hier frei?", "Ин ҷо холист?", None),
            s("Wie ist das Passwort?", "Рамз чист?", None),
        ]),
        ("Wi-Fi", [
            t("Ja, bitte?", "Ҳа, лутфан?", "Бипурс: рамзи Wi-Fi чист?", "Wie ist das Passwort?", "Рамз чист?",
              ["Das Passwort, bitte?", "Wie ist das Passwort für das Internet?"]),
            t("Es ist auf dem Ausweis.", "Он дар корт аст.", "Бигӯ: ташаккур", "Danke.", "Ташаккур.",
              ["Ah, danke!", "Danke schön."]),
            t("Bitte leise hier.", "Ин ҷо оҳиста, лутфан.", "Бигӯ: бубахшед", "Entschuldigung.", "Бубахшед.",
              ["Sorry.", "Ja, Entschuldigung."]),
        ]),
        ("Баргардонидан", [
            s("Ich bringe es zurück.", "Ман онро бармегардонам.", None),
            s("Das ist zu spät.", "Ин дер шуд.", None),
            s("Wie viel kostet das?", "Ин чанд пул аст?", None),
            s("Noch eine Woche, bitte.", "Боз як ҳафта, лутфан.", None),
            s("Ich brauche das Buch.", "Ба ман ин китоб лозим.", None),
            s("Die Bibliothek ist zu.", "Китобхона баста аст.", None),
        ]),
        ("Китоб дер монд", [
            t("Das Buch ist eine Woche zu spät.", "Китоб як ҳафта дер монд.", "Бигӯ: мебахшед", "Entschuldigung.",
              "Мебахшед.", ["Oh, Entschuldigung.", "Sorry."]),
            t("Das kostet zwei Euro.", "Ин ду евро аст.", "Бигӯ: хуб, мана", "Okay, hier.", "Хуб, мана.",
              ["Hier, bitte.", "Gut."]),
            t("Danke. Noch etwas?", "Ташаккур. Боз чизе?", "Бигӯ: не, ташаккур", "Nein, danke.", "Не, ташаккур.",
              ["Nein.", "Nein, alles gut."]),
        ]),
        ("Миссия: китоб гирифтан", [
            t("Guten Tag! Kann ich helfen?", "Рӯз ба хайр! Ёрӣ диҳам?", "Бигӯ: як китоб меҷӯям", "Ich suche ein Buch.",
              "Ман як китоб меҷӯям.", ["Ein Buch, bitte.", "Ja, ein Buch."]),
            t("Hier ist es. Möchten Sie es ausleihen?", "Мана он. Гирифтан мехоҳед?", "Бигӯ: ҳа, лутфан",
              "Ja, bitte.", "Ҳа, лутфан.", ["Ja.", "Ja, gerne."]),
            t("Ihren Ausweis, bitte.", "Кортатон, лутфан.", "Бигӯ: мана", "Hier, bitte.", "Мана, марҳамат.",
              ["Bitte schön."]),
            t("Gut. Zwei Wochen.", "Хуб. Ду ҳафта.", "Бипурс: то кай?", "Bis wann?", "То кай?",
              ["Bis wann, bitte?", "Bis Montag?"]),
        ]),
    ]))

# ═════════════════════ 9. Ҳамкурсон ═════════════════════
made.append(pack("classmates_de_tg", "Kommilitonen", "Ҳамкурсон", "👫", 9, S,
    "Бо ҳамкурсон шинос мешавед: мепурсед, ки аз куҷоянд ва чӣ мехонанд, рақами телефонро "
    "мубодила мекунед ва якҷоя ба қаҳвахона ё ба омӯзиш даъват мекунед.",
    [
        ("Ҳамкурсон", [
            w("Freund", "дӯст", "Зан: «Freundin»."),
            w("Zusammen", "якҷоя", None),
            w("Nummer", "рақам", None),
            w("Kaffee", "қаҳва", None),
            w("Lernen", "омӯхтан, дарс тайёр кардан", None),
            w("Gruppe", "гурӯҳ", None),
        ]),
        ("Шиносоӣ", [
            t("Hallo! Bist du neu?", "Салом! Навӣ?", "Бигӯ: ҳа", "Ja.", "Ҳа.", ["Ja, ich bin neu."]),
            t("Ich bin Lena. Und du?", "Ман Лена. Ту чӣ?", "Номи худро гӯй: Алӣ", "Ich bin Ali.", "Ман Алӣ.",
              ["Ich heiße Ali.", "Ali."]),
            t("Freut mich!", "Шодам!", "Бигӯ: ман ҳам", "Mich auch.", "Ман ҳам.", ["Freut mich auch."]),
        ]),
        ("Саволҳо", [
            s("Aus Tadschikistan", "Аз Тоҷикистон", None),
            s("Welches Fach?", "Кадом ихтисос?", None),
            s("Deine Nummer?", "Рақамат?", None),
            w("Gerne", "бо хурсандӣ", None),
            s("Leider nicht", "Мутаассифона, не", None),
            s("Bis später", "То баъд", None),
        ]),
        ("Аз куҷоӣ?", [
            t("Woher kommst du?", "Аз куҷоӣ?", "Бигӯ: аз Тоҷикистон", "Aus Tadschikistan.", "Аз Тоҷикистон.",
              ["Ich komme aus Tadschikistan."]),
            t("Toll! Was studierst du?", "Олӣ! Чӣ мехонӣ?", "Бигӯ: информатика", "Informatik.", "Информатика.",
              ["Ich studiere Informatik.", "Deutsch."]),
            t("Ich auch!", "Ман ҳам!", "Бигӯ: олӣ!", "Super!", "Олӣ!", ["Toll!", "Cool!"]),
        ]),
        ("Дар бораи ман", [
            s("Ich wohne im Wohnheim.", "Ман дар хобгоҳ зиндагӣ мекунам.", None),
            s("Ich lerne viel.", "Ман бисёр мехонам.", None),
            s("Ich spreche etwas Deutsch.", "Каме олмонӣ гап мезанам.", None),
            own("Ich studiere ___.", "Ман ___ мехонам.", "Ихтисоси худро гӯед.",
                "Was studierst du?", "Чӣ мехонӣ?", "Ихтисоси худро гӯед"),
            s("Hast du Zeit?", "Вақт дорӣ?", None),
            s("Lernen wir zusammen?", "Якҷоя мехонем?", None),
        ]),
        ("Рақами телефон", [
            t("Hast du WhatsApp?", "WhatsApp дорӣ?", "Бигӯ: ҳа", "Ja.", "Ҳа.", ["Ja, klar.", "Ja, ich habe WhatsApp."]),
            t("Gib mir deine Nummer.", "Рақаматро деҳ.", "Бигӯ: мана, марҳамат", "Hier, bitte.", "Мана, марҳамат.",
              ["Klar, hier.", "Ja, gerne."]),
            t("Danke! Ich schreibe dir.", "Ташаккур! Ба ту менависам.", "Бигӯ: хуб", "Gut.", "Хуб.",
              ["Okay!", "Super!"]),
        ]),
        ("Даъват", [
            s("Gehen wir Kaffee trinken?", "Қаҳва нӯшем?", None),
            s("Heute habe ich Zeit.", "Имрӯз вақт дорам.", None),
            s("Heute geht es nicht.", "Имрӯз намешавад.", None),
            s("Vielleicht morgen.", "Шояд фардо.", None),
            s("Wo treffen wir uns?", "Дар куҷо вомехӯрем?", None),
            s("Vor der Bibliothek.", "Назди китобхона.", None),
        ]),
        ("Қаҳва нӯшем?", [
            t("Gehen wir Kaffee trinken?", "Қаҳва нӯшем?", "Бигӯ: бо хурсандӣ!", "Gerne!", "Бо хурсандӣ!",
              ["Ja, gerne!", "Ja, gute Idee."]),
            t("Wann hast du Zeit?", "Кай вақт дорӣ?", "Бигӯ: баъди дарс", "Nach dem Unterricht.", "Баъди дарс.",
              ["Um zwei Uhr.", "Heute Nachmittag."]),
            t("Gut, vor der Bibliothek.", "Хуб, назди китобхона.", "Бигӯ: то баъд", "Bis später!", "То баъд!",
              ["Okay, bis dann!", "Tschüss!"]),
        ]),
        ("Миссия: дӯсти нав", [
            t("Hallo! Wie heißt du?", "Салом! Номат чист?", "Номи худро гӯй: Алӣ", "Ich heiße Ali.", "Номи ман Алӣ.",
              ["Ich bin Ali.", "Ali."]),
            t("Woher kommst du?", "Аз куҷоӣ?", "Бигӯ: аз Тоҷикистон", "Ich komme aus Tadschikistan.",
              "Ман аз Тоҷикистонам.", ["Aus Tadschikistan."]),
            t("Lernen wir zusammen?", "Якҷоя мехонем?", "Бигӯ: бо хурсандӣ!", "Ja, gerne!", "Ҳа, бо хурсандӣ!",
              ["Gerne!", "Ja, gute Idee!"]),
            t("Gib mir deine Nummer.", "Рақаматро деҳ.", "Бигӯ: мана, марҳамат", "Hier, bitte.", "Мана, марҳамат.",
              ["Klar, hier.", "Ja, gerne."]),
        ]),
    ]))

# ═════════════════════ 11. Ёрӣ пурсидан ═════════════════════
made.append(pack("help_de_tg", "Um Hilfe bitten", "Ёрӣ пурсидан", "🙋", 11, S,
    "Шумо чизеро намедонед: роҳро мепурсед, хоҳиш мекунед, ки дар вазифа ёрӣ диҳанд, бо "
    "муаллим вохӯрӣ мепурсед ва ташаккур мегӯед.",
    [
        ("Ёрӣ", [
            w("Hilfe", "ёрӣ", None),
            w("Problem", "мушкил", None),
            w("Aufgabe", "вазифа, машқ", None),
            w("Sprechstunde", "вақти қабули муаллим", None),
            w("Schwer", "душвор", None),
            w("Einfach", "осон", None),
        ]),
        ("Роҳ гум кардам", [
            t("Kann ich helfen?", "Ёрӣ диҳам?", "Бигӯ: ҳа, лутфан", "Ja, bitte.", "Ҳа, лутфан.", ["Ja, danke.", "Ja."]),
            t("Was suchen Sie?", "Чӣ меҷӯед?", "Бигӯ: ҳуҷраи бист", "Raum zwanzig.", "Ҳуҷраи бист.",
              ["Ich suche Raum zwanzig."]),
            t("Da links.", "Он ҷо, ба чап.", "Ташаккур гӯй", "Danke!", "Ташаккур!", ["Vielen Dank!"]),
        ]),
        ("Хоҳиш", [
            s("Hilfe, bitte", "Ёрӣ, лутфан", None),
            s("Kein Problem", "Мушкил нест", None),
            s("Zu schwer", "Хеле душвор", None),
            s("Einen Moment", "Як лаҳза", None),
            w("Natürlich", "албатта", None),
            s("Vielen Dank", "Ташаккури зиёд", None),
        ]),
        ("Вазифа душвор аст", [
            t("Hast du die Aufgabe?", "Вазифаро кардӣ?", "Бигӯ: не, хеле душвор", "Nein, zu schwer.",
              "Не, хеле душвор.", ["Nein, sie ist schwer.", "Nein."]),
            t("Ich helfe dir.", "Ба ту ёрӣ медиҳам.", "Бигӯ: ташаккури зиёд", "Vielen Dank!", "Ташаккури зиёд!",
              ["Danke!", "Danke schön!"]),
            t("Kein Problem.", "Мушкил нест.", "Бигӯ: ту хеле меҳрубонӣ", "Du bist sehr nett.", "Ту хеле меҳрубонӣ.",
              ["Super, danke.", "Danke."]),
        ]),
        ("Ман ёрӣ лозим", [
            s("Ich brauche Hilfe.", "Ба ман ёрӣ лозим.", None),
            s("Die Aufgabe ist schwer.", "Вазифа душвор аст.", None),
            s("Können Sie mir helfen?", "Ба ман ёрӣ дода метавонед?", "Ба муаллим («Sie»)."),
            s("Wann ist die Sprechstunde?", "Вақти қабул кай аст?", None),
            s("Ich habe ein Problem.", "Ман як мушкил дорам.", None),
            s("Jetzt ist es klar.", "Ҳоло фаҳмо шуд.", None),
        ]),
        ("Назди муаллим", [
            t("Ja, bitte?", "Ҳа, лутфан?", "Бигӯ: ман ёрӣ лозим", "Ich brauche Hilfe.", "Ба ман ёрӣ лозим.",
              ["Können Sie mir helfen?", "Ich habe ein Problem."]),
            t("Was ist das Problem?", "Мушкил чист?", "Бигӯ: вазифаро намефаҳмам", "Ich verstehe die Aufgabe nicht.",
              "Вазифаро намефаҳмам.", ["Die Aufgabe ist schwer.", "Ich verstehe nicht."]),
            t("Kommen Sie am Montag.", "Рӯзи душанбе биёед.", "Бипурс: соати чанд?", "Um wie viel Uhr?",
              "Соати чанд?", ["Wann genau?", "Um wie viel?"]),
        ]),
        ("Ташаккур", [
            s("Danke für die Hilfe.", "Барои ёрӣ ташаккур.", None),
            s("Das ist sehr nett.", "Ин хеле хуб аст.", None),
            s("Jetzt verstehe ich.", "Ҳоло мефаҳмам.", None),
            s("Ich helfe dir auch.", "Ман ҳам ба ту ёрӣ медиҳам.", None),
            s("Gern geschehen.", "Арзише надорад.", "Ҷавоб ба «Danke»."),
            s("Bis Montag!", "То душанбе!", None),
        ]),
        ("Ҳоло фаҳмо шуд", [
            t("Ist es jetzt klar?", "Ҳоло фаҳмо шуд?", "Бигӯ: ҳа, ҳоло мефаҳмам", "Ja, jetzt verstehe ich.",
              "Ҳа, ҳоло мефаҳмам.", ["Ja, klar.", "Ja, danke."]),
            t("Super!", "Олӣ!", "Барои ёрӣ ташаккур гӯй", "Danke für die Hilfe.", "Барои ёрӣ ташаккур.",
              ["Vielen Dank!", "Danke schön."]),
            t("Gern geschehen.", "Арзише надорад.", "Бигӯ: то душанбе", "Bis Montag!", "То душанбе!", ["Tschüss!"]),
        ]),
        ("Миссия: вазифаи душвор", [
            t("Hallo! Wie geht's?", "Салом! Чӣ хел?", "Бигӯ: як мушкил дорам", "Ich habe ein Problem.",
              "Як мушкил дорам.", ["Nicht gut, ich habe ein Problem."]),
            t("Was ist los?", "Чӣ шуд?", "Бигӯ: вазифаро намефаҳмам", "Ich verstehe die Aufgabe nicht.",
              "Вазифаро намефаҳмам.", ["Die Aufgabe ist zu schwer."]),
            t("Ich helfe dir. Schau mal.", "Ёрӣ медиҳам. Нигоҳ кун.", "Бигӯ: ҳоло мефаҳмам", "Jetzt verstehe ich.",
              "Ҳоло мефаҳмам.", ["Ah, jetzt ist es klar."]),
            t("Gut!", "Хуб!", "Барои ёрӣ ташаккур гӯй", "Danke für die Hilfe!", "Барои ёрӣ ташаккур!",
              ["Vielen Dank!", "Danke!"]),
        ]),
    ]))

# ═════════════════════ 12. Вазифа ва имтиҳон ═════════════════════
made.append(pack("exams_de_tg", "Aufgaben und Prüfungen", "Вазифа ва имтиҳон", "📝", 12, S,
    "Вақти имтиҳон: мепурсед, ки имтиҳон кай ва дар куҷост, чӣ лозим аст, баҳои худро мефаҳмед "
    "ва бо ҳамкурс гап мезанед.",
    [
        ("Имтиҳон", [
            w("Prüfung", "имтиҳон", None),
            w("Test", "тест", None),
            w("Note", "баҳо", "Дар Олмон 1 — беҳтарин, 5 — бад."),
            w("Bestanden", "гузашт (имтиҳон)", None),
            w("Hausaufgabe", "вазифаи хонагӣ", None),
            w("Wichtig", "муҳим", None),
        ]),
        ("Имтиҳон кай?", [
            t("Die Prüfung ist bald.", "Имтиҳон наздик аст.", "Бипурс: кай?", "Wann?", "Кай?", ["Wann ist die Prüfung?"]),
            t("Am Freitag.", "Рӯзи ҷумъа.", "Бипурс: соати чанд?", "Um wie viel Uhr?", "Соати чанд?", ["Wann genau?"]),
            t("Um zehn Uhr.", "Соати даҳ.", "Бигӯ: хуб, ташаккур", "Gut, danke.", "Хуб, ташаккур.", ["Okay, danke."]),
        ]),
        ("Тайёрӣ", [
            s("Am Freitag", "Рӯзи ҷумъа", None),
            s("Welcher Raum?", "Кадом ҳуҷра?", None),
            s("Zwei Stunden", "Ду соат", None),
            s("Ich lerne", "Ман мехонам", None),
            s("Viel Glück!", "Барори кор!", None),
            s("Gute Note", "Баҳои хуб", None),
        ]),
        ("Чӣ лозим?", [
            t("Hast du Fragen zur Prüfung?", "Дар бораи имтиҳон савол дорӣ?", "Бипурс: кадом ҳуҷра?",
              "Welcher Raum?", "Кадом ҳуҷра?", ["In welchem Raum?", "Wo ist die Prüfung?"]),
            t("Raum zwanzig.", "Ҳуҷраи бист.", "Бипурс: чанд соат?", "Wie lange?", "Чӣ қадар давом мекунад?",
              ["Wie viele Stunden?"]),
            t("Zwei Stunden.", "Ду соат.", "Бигӯ: хуб, ташаккур", "Gut, danke.", "Хуб, ташаккур.", ["Danke."]),
        ]),
        ("Ман тайёрам", [
            s("Ich lerne für morgen.", "Барои фардо мехонам.", None),
            s("Die Prüfung ist schwer.", "Имтиҳон душвор аст.", None),
            s("Ich habe keine Zeit.", "Ман вақт надорам.", None),
            s("Brauche ich ein Buch?", "Ба ман китоб лозим?", None),
            s("Ich bin fertig.", "Ман тайёрам (тамом кардам).", None),
            s("Wo ist meine Hausaufgabe?", "Вазифаи хонагии ман куҷост?", None),
        ]),
        ("Вазифаи хонагӣ", [
            t("Wo ist Ihre Hausaufgabe?", "Вазифаи хонагиатон куҷост?", "Бигӯ: мана", "Hier, bitte.", "Мана, марҳамат.",
              ["Hier ist sie.", "Bitte schön."]),
            t("Gut. Und Ihr Test?", "Хуб. Ва тестатон?", "Бигӯ: ман тамом кардам", "Ich bin fertig.",
              "Ман тамом кардам.", ["Fertig.", "Er ist fertig."]),
            t("Sehr gut!", "Хеле хуб!", "Ташаккур гӯй", "Danke!", "Ташаккур!", ["Danke schön."]),
        ]),
        ("Баҳо", [
            s("Welche Note habe ich?", "Ман чӣ баҳо дорам?", None),
            s("Ich habe bestanden!", "Ман гузаштам!", None),
            s("Nicht bestanden.", "Нагузаштам.", None),
            s("Noch eine Prüfung?", "Боз як имтиҳон?", None),
            s("Ich bin froh.", "Ман шодам.", None),
            s("Das ist gut.", "Ин хуб аст.", None),
        ]),
        ("Натиҷа", [
            t("Die Noten sind da.", "Баҳоҳо омаданд.", "Бипурс: ман чӣ баҳо дорам?", "Welche Note habe ich?",
              "Ман чӣ баҳо дорам?", ["Meine Note?", "Was ist meine Note?"]),
            t("Eine Zwei. Sie haben bestanden.", "Ду. Шумо гузаштед.", "Бигӯ: ман шодам!", "Ich bin froh!",
              "Ман шодам!", ["Super!", "Toll, danke!"]),
            t("Gut gemacht!", "Офарин!", "Ташаккур гӯй", "Vielen Dank!", "Ташаккури зиёд!", ["Danke!"]),
        ]),
        ("Миссия: имтиҳон", [
            t("Hallo! Lernst du für die Prüfung?", "Салом! Барои имтиҳон мехонӣ?", "Бигӯ: ҳа, бисёр мехонам",
              "Ja, ich lerne viel.", "Ҳа, бисёр мехонам.", ["Ja.", "Ja, sehr viel."]),
            t("Wann ist die Prüfung?", "Имтиҳон кай аст?", "Бигӯ: рӯзи ҷумъа", "Am Freitag.", "Рӯзи ҷумъа.",
              ["Freitag um zehn.", "Am Freitag um zehn Uhr."]),
            t("Ist sie schwer?", "Душвор аст?", "Бигӯ: ҳа, душвор", "Ja, sie ist schwer.", "Ҳа, душвор аст.",
              ["Ja, schwer.", "Ein bisschen."]),
            t("Viel Glück!", "Барори кор!", "Ташаккур гӯй", "Danke!", "Ташаккур!", ["Danke schön!", "Dir auch!"]),
        ]),
    ]))

# ═════════════════════ 13. Ошхонаи донишгоҳ (Mensa) ═════════════════════
made.append(pack("cafe_de_tg", "In der Mensa", "Ошхонаи донишгоҳ", "🥪", 13, S,
    "Шумо дар ошхонаи донишгоҳ (Mensa) хӯрок мегиред: мепурсед, ки имрӯз чӣ ҳаст, гӯшти хук "
    "дорад ё не, нарх чанд аст ва бо корти донишҷӯӣ пардохт мекунед.",
    [
        ("Хӯрок", [
            w("Mensa", "ошхонаи донишгоҳ", None),
            w("Essen", "хӯрок", None),
            w("Suppe", "шӯрбо", None),
            w("Reis", "биринҷ", None),
            w("Hähnchen", "мурғ", None),
            w("Schwein", "хук", "«Schweinefleisch» — гӯшти хук."),
        ]),
        ("Имрӯз чӣ ҳаст?", [
            t("Hallo! Was möchtest du?", "Салом! Чӣ мехоҳӣ?", "Бипурс: имрӯз чӣ ҳаст?", "Was gibt es heute?",
              "Имрӯз чӣ ҳаст?", ["Was gibt es?", "Was ist heute?"]),
            t("Suppe und Hähnchen.", "Шӯрбо ва мурғ.", "Бигӯ: мурғ, лутфан", "Hähnchen, bitte.", "Мурғ, лутфан.",
              ["Das Hähnchen, bitte.", "Hähnchen."]),
            t("Mit Reis?", "Бо биринҷ?", "Бигӯ: ҳа, лутфан", "Ja, bitte.", "Ҳа, лутфан.", ["Ja.", "Gerne."]),
        ]),
        ("Фармоиш", [
            s("Mit Reis", "Бо биринҷ", None),
            s("Ohne Fleisch", "Бе гӯшт", None),
            s("Kein Schwein", "Гӯшти хук не", None),
            s("Ein Wasser", "Як об", None),
            s("Mit Karte", "Бо корт", None),
            s("Guten Appetit!", "Ош шавад!", None),
        ]),
        ("Гӯшти хук?", [
            t("Heute gibt es Schnitzel.", "Имрӯз шнитсел ҳаст.", "Бипурс: аз гӯшти хук аст?", "Ist das Schwein?",
              "Ин гӯшти хук аст?", ["Ist das Schweinefleisch?", "Mit Schwein?"]),
            t("Ja, das ist Schwein.", "Ҳа, ин гӯшти хук аст.", "Бигӯ: не, ташаккур. Шӯрбо, лутфан",
              "Nein, danke. Suppe, bitte.", "Не, ташаккур. Шӯрбо, лутфан.", ["Dann die Suppe, bitte."]),
            t("Gerne. Hier, bitte.", "Бо хурсандӣ. Мана.", "Ташаккур гӯй", "Danke.", "Ташаккур.", ["Danke schön."]),
        ]),
        ("Ман мехоҳам…", [
            s("Ich esse kein Schwein.", "Ман гӯшти хук намехӯрам.", None),
            s("Ich möchte die Suppe.", "Ман шӯрбо мехоҳам.", None),
            s("Ist das ohne Fleisch?", "Ин бе гӯшт аст?", None),
            s("Was kostet das?", "Ин чанд пул аст?", None),
            s("Ich zahle mit Karte.", "Бо корт пардохт мекунам.", None),
            s("Das schmeckt gut.", "Ин бомаза аст.", None),
        ]),
        ("Дар касса", [
            t("Suppe und Wasser?", "Шӯрбо ва об?", "Бигӯ: ҳа", "Ja.", "Ҳа.", ["Ja, genau.", "Ja, bitte."]),
            t("Das macht drei Euro.", "Се евро мешавад.", "Бигӯ: бо корт пардохт мекунам", "Ich zahle mit Karte.",
              "Бо корт пардохт мекунам.", ["Mit Karte, bitte.", "Karte, bitte."]),
            t("Danke. Guten Appetit!", "Ташаккур. Ош шавад!", "Ташаккур гӯй", "Danke!", "Ташаккур!", ["Danke schön!"]),
        ]),
        ("Дар сари миз", [
            s("Ist hier frei?", "Ин ҷо холист?", None),
            s("Setz dich!", "Шин!", None),
            s("Wie ist das Essen?", "Хӯрок чӣ хел?", None),
            s("Sehr lecker!", "Хеле бомаза!", None),
            s("Ich habe Hunger.", "Ман гурусна ҳастам.", None),
            s("Ich bin satt.", "Ман сер шудам.", None),
        ]),
        ("Ҷой холист?", [
            t("Ja, bitte?", "Ҳа?", "Бипурс: ин ҷо холист?", "Ist hier frei?", "Ин ҷо холист?",
              ["Ist der Platz frei?", "Darf ich?"]),
            t("Ja, setz dich!", "Ҳа, шин!", "Ташаккур гӯй", "Danke!", "Ташаккур!", ["Danke schön."]),
            t("Wie ist die Suppe?", "Шӯрбо чӣ хел?", "Бигӯ: хеле бомаза", "Sehr lecker!", "Хеле бомаза!",
              ["Lecker!", "Gut, danke."]),
        ]),
        ("Миссия: хӯроки нисфирӯзӣ", [
            t("Hallo! Was möchtest du?", "Салом! Чӣ мехоҳӣ?", "Бипурс: ин гӯшти хук аст?", "Ist das Schwein?",
              "Ин гӯшти хук аст?", ["Ist das Schweinefleisch?"]),
            t("Nein, das ist Hähnchen.", "Не, ин мурғ аст.", "Бигӯ: мурғ бо биринҷ, лутфан", "Hähnchen mit Reis, bitte.",
              "Мурғ бо биринҷ, лутфан.", ["Hähnchen, bitte.", "Das Hähnchen mit Reis."]),
            t("Und zu trinken?", "Ва нӯшокӣ?", "Бигӯ: як об", "Ein Wasser, bitte.", "Як об, лутфан.",
              ["Wasser.", "Ein Wasser."]),
            t("Vier Euro, bitte.", "Чор евро, лутфан.", "Бигӯ: бо корт", "Mit Karte, bitte.", "Бо корт, лутфан.",
              ["Ich zahle mit Karte.", "Karte."]),
        ]),
    ]))

# ═════════════════════ 15. Бонк ва стипендия ═════════════════════
made.append(pack("bank_de_tg", "Bank und Stipendium", "Бонк ва стипендия", "🏦", 15, S,
    "Шумо ба бонк меравед: ҳисоб (Konto) мекушоед, ҳуҷҷатҳоро медиҳед, корти бонкӣ мегиред ва "
    "мепурсед, ки стипендия кай меояд.",
    [
        ("Бонк", [
            w("Bank", "бонк", None),
            w("Konto", "ҳисоб (дар бонк)", None),
            w("Karte", "корт", None),
            w("Geld", "пул", None),
            w("Stipendium", "стипендия", None),
            w("Termin", "вақти қабул", None),
        ]),
        ("Ҳисоб кушодан", [
            t("Guten Tag! Was kann ich tun?", "Рӯз ба хайр! Чӣ хизмат?", "Бигӯ: ман ҳисоб лозим", "Ich brauche ein Konto.",
              "Ба ман ҳисоб лозим.", ["Ein Konto, bitte.", "Ich möchte ein Konto."]),
            t("Haben Sie einen Termin?", "Вақти қабул доред?", "Бигӯ: не", "Nein.", "Не.", ["Nein, leider nicht."]),
            t("Kein Problem. Bitte warten Sie.", "Мушкил нест. Лутфан интизор шавед.", "Бигӯ: хуб", "Okay.", "Хуб.",
              ["Gut, danke.", "Danke."]),
        ]),
        ("Ҳуҷҷатҳо", [
            s("Mein Pass", "Шиносномаи ман", None),
            s("Meine Adresse", "Суроғаи ман", None),
            s("Ein Konto", "Як ҳисоб", None),
            s("Die Karte", "Корт", None),
            w("Unterschrift", "имзо", None),
            s("Hier unterschreiben", "Ин ҷо имзо кунед", None),
        ]),
        ("Шиноснома ва суроға", [
            t("Ihren Pass, bitte.", "Шиносномаатон, лутфан.", "Бигӯ: мана", "Hier, bitte.", "Мана, марҳамат.",
              ["Hier ist mein Pass."]),
            t("Und Ihre Adresse?", "Ва суроғаатон?", "Бигӯ: хобгоҳ, Berliner Straße", "Wohnheim, Berliner Straße.",
              "Хобгоҳ, кӯчаи Берлин.", ["Ich wohne im Wohnheim.", "Berliner Straße."]),
            t("Bitte hier unterschreiben.", "Лутфан ин ҷо имзо кунед.", "Бигӯ: хуб", "Okay.", "Хуб.",
              ["Hier?", "Gut."]),
        ]),
        ("Саволҳо дар бонк", [
            s("Ich möchte ein Konto.", "Ман ҳисоб мехоҳам.", None),
            s("Kostet das Konto Geld?", "Ҳисоб пул мехоҳад?", None),
            s("Wann kommt die Karte?", "Корт кай меояд?", None),
            s("Ich bin Student.", "Ман донишҷӯ ҳастам.", None),
            s("Wo ist ein Geldautomat?", "Банкомат куҷост?", None),
            s("Ich verstehe das nicht.", "Инро намефаҳмам.", None),
        ]),
        ("Корт", [
            t("Fertig! Ihr Konto ist da.", "Тайёр! Ҳисобатон кушода шуд.", "Бипурс: корт кай меояд?",
              "Wann kommt die Karte?", "Корт кай меояд?", ["Und die Karte?", "Wann ist die Karte da?"]),
            t("In einer Woche, per Post.", "Баъди як ҳафта, бо почта.", "Бигӯ: хуб, ташаккур", "Gut, danke.",
              "Хуб, ташаккур.", ["Okay, danke."]),
            t("Für Studenten ist es frei.", "Барои донишҷӯён ройгон аст.", "Бигӯ: олӣ!", "Super!", "Олӣ!",
              ["Toll, danke!", "Sehr gut!"]),
        ]),
        ("Стипендия", [
            s("Wann kommt das Stipendium?", "Стипендия кай меояд?", None),
            s("Jeden Monat.", "Ҳар моҳ.", None),
            s("Das Geld kommt nicht.", "Пул намеояд.", None),
            s("Ich möchte Geld abheben.", "Ман пул гирифтан мехоҳам.", None),
            s("Ich möchte Geld schicken.", "Ман пул фиристодан мехоҳам.", None),
            s("Nach Tadschikistan.", "Ба Тоҷикистон.", None),
        ]),
        ("Пул наомад", [
            t("Was ist das Problem?", "Мушкил чист?", "Бигӯ: стипендия наомадааст", "Das Stipendium ist nicht da.",
              "Стипендия наомадааст.", ["Das Geld ist nicht da.", "Kein Geld."]),
            t("Wann kommt es normal?", "Одатан кай меояд?", "Бигӯ: дар аввали моҳ", "Am Anfang vom Monat.",
              "Дар аввали моҳ.", ["Jeden Monat am Anfang.", "Am ersten."]),
            t("Ich prüfe das. Moment.", "Месанҷам. Як лаҳза.", "Бигӯ: ташаккур", "Danke.", "Ташаккур.",
              ["Danke schön.", "Okay, danke."]),
        ]),
        ("Миссия: ҳисоби нав", [
            t("Guten Tag! Wie kann ich helfen?", "Рӯз ба хайр! Чӣ ёрӣ диҳам?", "Бигӯ: ман ҳисоб мехоҳам",
              "Ich möchte ein Konto.", "Ман ҳисоб мехоҳам.", ["Ich brauche ein Konto.", "Ein Konto, bitte."]),
            t("Sind Sie Student?", "Шумо донишҷӯед?", "Бигӯ: ҳа, ман донишҷӯ ҳастам", "Ja, ich bin Student.",
              "Ҳа, ман донишҷӯ ҳастам.", ["Ja.", "Ja, Studentin."]),
            t("Ihren Pass, bitte.", "Шиносномаатон, лутфан.", "Бигӯ: мана", "Hier, bitte.", "Мана, марҳамат.",
              ["Hier ist mein Pass.", "Bitte schön."]),
            t("Danke. Die Karte kommt per Post.", "Ташаккур. Корт бо почта меояд.", "Бипурс: кай?", "Wann?", "Кай?",
              ["Wann kommt sie?", "Wann genau?"]),
        ]),
    ]))

finish(made)
