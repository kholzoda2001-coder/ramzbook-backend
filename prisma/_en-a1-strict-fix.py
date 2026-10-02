"""Ислоҳи A1-и роҳҳои англисии «Сохтмон» ва «Таҳсил» (02.10.2026).

Аудити A1 нишон дод: дар гуфтори хонанда чанд ибораи A2+ бе омӯзиши пешакӣ
(«per hour», «It's a deal», «I'm off», «first aid», «napkins», «seat», «due»,
«since», «I did my best»), замони гузашта дар табел ва саволи Present Perfect
(«How long have you worked here?») буданд; Truck, Pork ва PIN дар ҷумла пеш аз
дарси «Калимаҳо» меомаданд. Ин скрипт генераторҳоро ислоҳ мекунад; баъд онҳоро
иҷро кунед ва `prisma/_en-a1-sync-db.mjs` тағйирро ба база мебарад (БЕ seed —
прогресси хонандагон ва аудиои ибораҳои бетағйир мемонанд).

Ҳар иваз бояд маҳз ҳамон шумора бор ёфт шавад — вагарна скрипт қатъ мешавад.
"""
import io, sys

def apply(path, reps):
    s = io.open(path, encoding='utf-8').read()
    for old, new, n in reps:
        c = s.count(old)
        if c != n:
            sys.exit(f'⛔ {path}: «{old[:70]}» {c} бор ёфт шуд, интизор {n}')
        s = s.replace(old, new)
    io.open(path, 'w', encoding='utf-8', newline='').write(s)
    print(f'✓ {path}: {len(reps)} иваз')

BUILD = 'prisma/_en-build-a1-packs.py'
MORE = 'prisma/_en-a1-more-packs.py'

apply(BUILD, [
    # ── Кор ёфтан + Музд: «per» (A2) → «an hour» ──
    ('s("How much per hour?", "Соате чанд пул?", "«Per hour» — дар як соат."),',
     's("How much an hour?", "Соате чанд пул?", "«An hour» — дар як соат."),', 1),
    ('s("How much per hour?", "Соате чанд пул?", None),',
     's("How much an hour?", "Соате чанд пул?", None),', 1),
    ('"How much per hour?", "Соате чанд пул?", ["How much?", "How much an hour?"]),',
     '"How much an hour?", "Соате чанд пул?", ["How much?", "How much per hour?"]),', 1),
    # ── Музд: «I'm off», «It's a deal» ──
    ('s("Tomorrow I\'m off.", "Фардо ман кор надорам.", None),',
     's("I don\'t work tomorrow.", "Фардо кор намекунам.", None),', 1),
    ('t("Can you work on Sunday?", "Якшанбе кор карда метавонӣ?", "Бигӯ: фардо кор надорам",\n'
     '              "Tomorrow I\'m off.", "Фардо ман кор надорам.", ["I\'m off tomorrow.", "Sorry, I can\'t."]),',
     't("Can you work on Sunday?", "Якшанбе кор карда метавонӣ?", "Бигӯ: фардо кор намекунам",\n'
     '              "I don\'t work tomorrow.", "Фардо кор намекунам.", ["Sorry, I can\'t.", "Tomorrow I\'m off."]),', 1),
    ('s("It\'s a deal.", "Хуб, розӣ.", None),', 's("That\'s fine.", "Майлаш.", None),', 1),
    ('t("Forty dollars.", "Чил доллар.", "Бигӯ: хуб, розӣ", "Okay, it\'s a deal.", "Хуб, розӣ.",\n'
     '              ["It\'s a deal.", "Okay, deal."]),',
     't("Forty dollars.", "Чил доллар.", "Бигӯ: хуб, майлаш", "Okay, that\'s fine.", "Хуб, майлаш.",\n'
     '              ["That\'s fine.", "Okay, it\'s a deal."]),', 1),
    # ── Назди духтур: «since» (A2) → «Two days» ──
    ('w("Yesterday", "дирӯз", None),\n            s("Since yesterday.", "Аз дирӯз.", None),',
     'w("Day", "рӯз", None),\n            s("Two days.", "Ду рӯз.", None),', 1),
    ('t("Since when?", "Аз кай?", "Бигӯ: аз дирӯз", "Since yesterday.", "Аз дирӯз.",\n'
     '              ["Yesterday.", "From yesterday."]),',
     't("How long?", "Чанд вақт?", "Бигӯ: ду рӯз", "Two days.", "Ду рӯз.",\n'
     '              ["Since yesterday.", "Two days now."]),', 1),
    # ── Ҷой дар объект: «Truck» ба дарси «Калимаҳо» ──
    ('w("Right", "рост", "«On the right» — аз тарафи рост."),\n            w("There", "он ҷо", None),\n        ]),',
     'w("Right", "рост", "«On the right» — аз тарафи рост."),\n            w("There", "он ҷо", None),\n'
     '            w("Truck", "мошини боркаш", None),\n        ]),', 1),
    # ── Бехатарӣ: «first aid», «fell» → «Call the boss!», «A man is hurt» ──
    ('s("Where\'s the first aid?", "Қуттии ёрии аввалия куҷост?", None),\n            s("A man fell.", "Одаме афтод.", None),',
     's("Call the boss!", "Бригадирро ҷеғ зан!", None),\n            s("A man is hurt.", "Одаме захмӣ шуд.", None),', 1),
    ('t("Nine one one. What\'s your emergency?", "Наҳ-як-як. Чӣ ҳодиса рӯй дод?", "Бигӯ: одаме афтод",\n'
     '              "A man fell.", "Одаме афтод.", ["A man fell down.", "Someone fell."]),',
     't("Nine one one. What\'s your emergency?", "Наҳ-як-як. Чӣ ҳодиса рӯй дод?", "Бигӯ: одаме захмӣ шуд",\n'
     '              "A man is hurt.", "Одаме захмӣ шуд.", ["A man fell.", "Someone is hurt."]),', 1),
    ('t("What happened?", "Чӣ шуд?", "Бигӯ: одаме афтод, ёрии таъҷилӣ ҷеғ зан",\n'
     '              "A man fell. Call an ambulance!", "Одаме афтод. Ёрии таъҷилӣ ҷеғ зан!",\n'
     '              ["A man fell! Call an ambulance!", "Call an ambulance!"]),',
     't("What happened?", "Чӣ шуд?", "Бигӯ: одаме захмӣ шуд, ёрии таъҷилӣ ҷеғ зан",\n'
     '              "A man is hurt. Call an ambulance!", "Одаме захмӣ шуд. Ёрии таъҷилӣ ҷеғ зан!",\n'
     '              ["A man fell. Call an ambulance!", "Call an ambulance!"]),', 1),
    # ── Мушкил дар кор: «fault» (A2) → «Not me» ──
    ('s("It\'s not my fault.", "Гуноҳи ман нест.", None),', 's("Not me.", "Ман не.", "«Not me» — ман не (кори ман нест)."),', 1),
    ('"Бигӯ: гуноҳи ман нест",\n              "It\'s not my fault.", "Гуноҳи ман нест.", ["Not me.", "It\'s not my fault, really."]),',
     '"Бигӯ: ман не",\n              "Not me.", "Ман не.", ["It\'s not me.", "It\'s not my fault."]),', 1),
    ('t("Again? Did you break it?", "Боз? Ту шикастӣ?", "Бигӯ: не, гуноҳи ман нест",\n'
     '              "No, it\'s not my fault.", "Не, гуноҳи ман нест.", ["It\'s not my fault.", "No, not me."]),',
     't("Again? Did you break it?", "Боз? Ту шикастӣ?", "Бигӯ: не, ман не",\n'
     '              "No, not me.", "Не, ман не.", ["Not me.", "No, it\'s not my fault."]),', 1),
    # ── Роҳ то кор + Занг: «I'm on my way» → «I'm coming» ──
    ('s("I\'m on my way.", "Ман дар роҳам.", None),', 's("I\'m coming.", "Ҳозир меоям.", None),', 2),
    ('"Бигӯ: дар роҳам, роҳ банд аст", "I\'m on my way. Lots of traffic.",\n'
     '              "Ман дар роҳам. Роҳ сахт банд.", ["I\'m on the bus. Traffic.", "On my way, lots of traffic."]),',
     '"Бигӯ: ҳозир меоям, роҳ банд аст", "I\'m coming. Lots of traffic.",\n'
     '              "Ҳозир меоям. Роҳ сахт банд.", ["I\'m on the bus. Traffic.", "I\'m on my way. Lots of traffic."]),', 1),
    ('"Бигӯ: дар роҳам, автобус дер кард",\n'
     '              "I\'m on my way. The bus is late.", "Дар роҳам. Автобус дер кард.",\n'
     '              ["On my way. The bus is late.", "The bus is late. I\'m coming."]),',
     '"Бигӯ: ҳозир меоям, автобус дер кард",\n'
     '              "I\'m coming. The bus is late.", "Ҳозир меоям. Автобус дер кард.",\n'
     '              ["The bus is late. I\'m coming.", "I\'m on my way. The bus is late."]),', 1),
    # ── Вагонча: «How long have you worked here?» (Present Perfect) → «Are you new here?» ──
    ('s("For one year.", "Як сол боз.", None),', 's("No, I\'m not new.", "Не, ман нав нестам.", None),', 1),
    ('t("How long have you worked here?", "Кайҳо ин ҷо кор мекунӣ?", "Бигӯ: як сол боз",\n'
     '              "For one year.", "Як сол боз.", ["One year.", "About a year."]),',
     't("Are you new here?", "Ту ин ҷо навӣ?", "Бигӯ: не, ман нав нестам",\n'
     '              "No, I\'m not new.", "Не, ман нав нестам.", ["No.", "No, one year here."]),', 1),
    ('t("I\'m from Poland. How long have you worked here?", "Ман аз Лаҳистон. Кайҳо ин ҷо кор мекунӣ?",\n'
     '              "Бигӯ: як сол боз", "For one year.", "Як сол боз.", ["One year.", "About a year."]),',
     't("I\'m from Poland. Are you new here?", "Ман аз Лаҳистон. Ту ин ҷо навӣ?",\n'
     '              "Бигӯ: не, ман нав нестам", "No, I\'m not new.", "Не, ман нав нестам.", ["No.", "No, one year here."]),', 1),
])

apply(MORE, [
    # ── Соатҳо ва табел: замони гузашта → ҳозира (кори ҳаррӯза) ──
    ('s("I started at seven.", "Соати ҳафт сар кардам.", None, swaps=["seven|ҳафт", "eight|ҳашт"]),',
     's("I start at seven.", "Ман соати ҳафт сар мекунам.", None, swaps=["seven|ҳафт", "eight|ҳашт"]),', 1),
    ('s("I finished at five.", "Соати панҷ тамом кардам.", None, swaps=["five|панҷ", "six|шаш"]),',
     's("I finish at five.", "Ман соати панҷ тамом мекунам.", None, swaps=["five|панҷ", "six|шаш"]),', 1),
    ('s("I worked eight hours.", "Ҳашт соат кор кардам.", None),',
     's("I work eight hours.", "Ман ҳашт соат кор мекунам.", None),', 1),
    ('t("Why? When did you start?", "Чаро? Кай сар кардӣ?", "Бигӯ: соати ҳафт сар кардам",\n'
     '              "I started at seven.", "Соати ҳафт сар кардам.", ["At seven.", "Seven."]),',
     't("Why? When do you start?", "Чаро? Кай сар мекунӣ?", "Бигӯ: соати ҳафт сар мекунам",\n'
     '              "I start at seven.", "Ман соати ҳафт сар мекунам.", ["At seven.", "I started at seven."]),', 1),
    ('t("And you finished at...?", "Ва тамом кардӣ соати...?", "Бигӯ: соати панҷ тамом кардам",\n'
     '              "I finished at five.", "Соати панҷ тамом кардам.", ["At five.", "Five."]),',
     't("And when do you finish?", "Ва кай тамом мекунӣ?", "Бигӯ: соати панҷ тамом мекунам",\n'
     '              "I finish at five.", "Ман соати панҷ тамом мекунам.", ["At five.", "I finished at five."]),', 1),
    ('s("I worked on Saturday.", "Шанбе кор кардам.", None),\n            s("I had no break.", "Танаффус надоштам.", None),',
     's("I work on Saturday.", "Ман шанбе кор мекунам.", None),\n            s("No break today.", "Имрӯз танаффус набуд.", None),', 1),
    ('t("Okay, I see. I\'ll fix it.", "Хуб, фаҳмидам. Ислоҳ мекунам.", "Бигӯ: инчунин шанбе кор кардам",\n'
     '              "I also worked on Saturday.", "Ман шанбе ҳам кор кардам.", ["I worked on Saturday too.", "And Saturday."]),',
     't("Okay, I see. I\'ll fix it.", "Хуб, фаҳмидам. Ислоҳ мекунам.", "Бигӯ: ман шанбе ҳам кор мекунам",\n'
     '              "I work on Saturday too.", "Ман шанбе ҳам кор мекунам.", ["And Saturday.", "I also worked on Saturday."]),', 1),
    ('t("And your break?", "Танаффусат чӣ?", "Бигӯ: танаффус надоштам", "I had no break.", "Танаффус надоштам.",\n'
     '              ["No break.", "I didn\'t have a break."]),',
     't("And your break?", "Танаффусат чӣ?", "Бигӯ: имрӯз танаффус набуд", "No break today.", "Имрӯз танаффус набуд.",\n'
     '              ["No break.", "I had no break."]),', 1),
    ('t("Okay. What time did you start?", "Хуб. Соати чанд сар кардӣ?", "Бигӯ: соати ҳафт сар кардам",\n'
     '              "I started at seven.", "Соати ҳафт сар кардам.", ["At seven.", "Seven."]),',
     't("Okay. What time do you start?", "Хуб. Соати чанд сар мекунӣ?", "Бигӯ: соати ҳафт сар мекунам",\n'
     '              "I start at seven.", "Ман соати ҳафт сар мекунам.", ["At seven.", "I started at seven."]),', 1),
    # ── Ҷадвали дарсҳо: пассив «is cancelled» пеш аз калимаи «Cancelled» ──
    ('s("The class is cancelled.", "Дарс бекор шуд.", None),', 's("No class today.", "Имрӯз дарс нест.", None),', 1),
    # ── Китобхона: «due» (B1) ──
    ('s("When is it due?", "То кай баргардонам?", "«Due» — мӯҳлати баргардондан."),',
     's("Until when?", "То кай?", "Мӯҳлати баргардондани китобро мепурсад."),', 1),
    # ── Ҳамсинфон + Ошхона: «seat» → «Can I sit here?» ──
    ('s("Can I sit here?", "Ин ҷо нишаста метавонам?", None),\n            s("Is this seat free?", "Ин ҷо холист?", None),',
     's("Can I sit here?", "Ин ҷо нишаста метавонам?", None),\n            s("Sit with me.", "Бо ман шин.", None),', 1),
    ('t("Hi!", "Салом!", "Бипурс: ин ҷо холист?", "Is this seat free?", "Ин ҷо холист?",\n'
     '              ["Can I sit here?", "Is it free?"]),',
     't("Hi!", "Салом!", "Бипурс: ин ҷо нишаста метавонам?", "Can I sit here?", "Ин ҷо нишаста метавонам?",\n'
     '              ["Is this seat free?", "Can I sit here, please?"]),', 1),
    ('s("Where are the napkins?", "Дастмолҳо куҷоянд?", None),\n            s("It\'s very good.", "Хеле бомаза.", None),\n'
     '            s("Is this seat free?", "Ин ҷо холист?", None),',
     's("Where is the water?", "Об куҷост?", None),\n            s("It\'s very good.", "Хеле бомаза.", None),\n'
     '            s("Can I sit here?", "Ин ҷо нишаста метавонам?", None),', 1),
    # ── Ошхона: «Pork» ба дарси «Калимаҳо» ──
    ('w("Juice", "шарбат", None),', 'w("Juice", "шарбат", None),\n            w("Pork", "гӯшти хук", "Агар гӯшти хук намехӯред — инро донед."),', 1),
    # ── Вазифа ва имтиҳон: «I did my best» (идиома) → «It was difficult» ──
    ('s("I did my best.", "Кӯшиши худро кардам.", None),', 's("It was difficult.", "Душвор буд.", None),', 1),
    ('t("Good. Grades on Monday.", "Хуб. Баҳоҳо рӯзи душанбе.", "Бигӯ: хуб, кӯшиши худро кардам",\n'
     '              "Okay. I did my best.", "Хуб. Кӯшиши худро кардам.", ["I did my best.", "Okay, thanks."]),',
     't("Good. Grades on Monday.", "Хуб. Баҳоҳо рӯзи душанбе.", "Бигӯ: хуб, душвор буд",\n'
     '              "Okay. It was difficult.", "Хуб. Душвор буд.", ["It was difficult.", "Okay, thanks."]),', 1),
    # ── Бонк: «per month» → «a month»; «PIN» ба дарси «Калимаҳо» ──
    ('s("How much per month?", "Дар як моҳ чанд?", None),', 's("How much a month?", "Дар як моҳ чанд?", None),', 1),
    ('"Yes. How much per month?", "Ҳа. Дар як моҳ чанд?", ["Yes, please. How much?", "How much per month?"]),',
     '"Yes. How much a month?", "Ҳа. Дар як моҳ чанд?", ["Yes, please. How much?", "How much per month?"]),', 1),
    ('w("Money", "пул", None),\n', 'w("Money", "пул", None),\n            w("PIN", "рамзи корт", "PIN — рамзи чаҳоррақамаи корт."),\n', 1),
])
