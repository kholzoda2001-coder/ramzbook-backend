"""Ислоҳи A1, даври 2 (02.10.2026) — аз рӯи `prisma/_en-a1-path-audit.mjs`.

Аудити роҳ (калимаи нав ПЕШ аз омӯзиш, грамматикаи гуфтори хонанда) дар ҳар се
роҳ («Сохтмон», «Таҳсил», «Хизматрасонӣ») боқимондаҳоро ёфт:
  • замони гузашта бо феъли A2 дар гуфтори хонанда: did, forgot, lost, missed,
    finished → замони ҳозира ё «I'm done» / «Sorry, no book»;
  • «I'll …» → «I can …» ё ибораи ҳозира; «I call tonight»/«I call the manager»
    (ғалат дар англисӣ) → «I can call tonight» / «The manager is coming»;
  • «We're out of cement» (идиомаи A2) → «No more cement»;
  • «Can I print this?» → «Can I use it?»;
  • «SIM» дар муколама пеш аз дарси ибораҳо → калимаи «SIM» ба ҷои «Phone».
«was» (гузаштаи be) — A1, бетағйир. «I passed», «Got it» — ибораи омӯхташуда.
"""
import io, sys

def apply(path, reps):
    s = io.open(path, encoding='utf-8').read()
    for old, new, n in reps:
        c = s.count(old)
        if c != n:
            sys.exit(f'⛔ {path}: «{old[:80]}» {c} бор ёфт шуд, интизор {n}')
        s = s.replace(old, new)
    io.open(path, 'w', encoding='utf-8', newline='').write(s)
    print(f'✓ {path}: {len(reps)} иваз')

BUILD = 'prisma/_en-build-a1-packs.py'
MORE = 'prisma/_en-a1-more-packs.py'
SERV = 'prisma/_en-service-a1-packs.py'

apply(BUILD, [
    # Бригадир: «I did it» → «I'm done»
    ('s("I did it.", "Ман кардам.", None),', 's("I\'m done.", "Ман тамом кардам.", None),', 1),
    ('"Бигӯ, ки кардӣ ва бипурс: баъд чӣ?",\n              "I did it. What\'s next?", "Ман кардам. Баъд чӣ?", ["Done. What\'s next?", "It\'s done. What\'s next?"]),',
     '"Бигӯ, ки тамом кардӣ ва бипурс: баъд чӣ?",\n              "I\'m done. What\'s next?", "Тамом кардам. Баъд чӣ?", ["Done. What\'s next?", "I did it. What\'s next?"]),', 1),
    # Мушкил: «We're out of cement» → «No more cement»
    ('s("We\'re out of cement.", "Семент тамом шуд.", "«We\'re out of …» — … тамом шуд.",',
     's("No more cement.", "Семент дигар нест.", None,', 1),
    ('t("Why are you standing there?", "Чаро он ҷо истодаӣ?", "Бигӯ: семент тамом шуд",\n'
     '              "We\'re out of cement.", "Семент тамом шуд.", ["No cement.", "The cement is gone."]),',
     't("Why are you standing there?", "Чаро он ҷо истодаӣ?", "Бигӯ: семент дигар нест",\n'
     '              "No more cement.", "Семент дигар нест.", ["No cement.", "We\'re out of cement."]),', 1),
    # Иҷора: «I'll take it» → «I want it»
    ('s("I\'ll take it.", "Мегирам.", None),', 's("I want it.", "Инро мехоҳам.", None),', 1),
    ('"Бигӯ: ҳа, мегирам", "Yes, I\'ll take it.", "Ҳа, мегирам.",\n              ["I\'ll take it.", "Yes, I like it."]),',
     '"Бигӯ: ҳа, инро мехоҳам", "Yes, I want it.", "Ҳа, инро мехоҳам.",\n              ["I\'ll take it.", "Yes, I like it."]),', 1),
    # Занг ба бригадир: «I'll …»
    ('s("I\'ll be late.", "Дер мемонам.", None),', 's("I\'m at home.", "Ман дар хонаам.", None),', 1),
    ('t("I see. Tomorrow?", "Фаҳмо. Фардо?", "Бигӯ: ҳа, фардо меоям",\n'
     '              "Yes, I\'ll come tomorrow.", "Ҳа, фардо меоям.", ["Yes, tomorrow.", "Tomorrow, yes."]),',
     't("I see. Tomorrow?", "Фаҳмо. Фардо?", "Бигӯ: ҳа, фардо омада метавонам",\n'
     '              "Yes, I can come tomorrow.", "Ҳа, фардо омада метавонам.", ["Yes, tomorrow.", "I\'ll come tomorrow."]),', 1),
    ('s("I\'ll call tonight.", "Бегоҳ занг мезанам.", None),', 's("I can call tonight.", "Бегоҳ занг зада метавонам.", None),', 1),
    ('"Бигӯ: хуб, занг мезанам", "Okay, I\'ll call.", "Хуб, занг мезанам.", ["I\'ll call.", "Okay."]),',
     '"Бигӯ: хуб, занг зада метавонам", "Okay, I can call.", "Хуб, занг зада метавонам.", ["I\'ll call.", "Okay."]),', 1),
    ('"Бигӯ: хуб, бегоҳ занг мезанам",\n              "Okay, I\'ll call tonight.", "Хуб, бегоҳ занг мезанам.", ["I\'ll call tonight.", "Okay, thank you."]),',
     '"Бигӯ: хуб, бегоҳ занг зада метавонам",\n              "Okay, I can call tonight.", "Хуб, бегоҳ занг зада метавонам.", ["I\'ll call tonight.", "Okay, thank you."]),', 1),
])

apply(MORE, [
    # Либоси корӣ
    ('"Бигӯ: бубахшед, ҳозир мепӯшам",\n              "Sorry. I\'ll put it on.", "Бубахшед. Ҳозир мепӯшам.", ["Sorry, one moment.", "Sorry, I\'ll put it on now."]),',
     '"Бигӯ: бубахшед. як лаҳза",\n              "Sorry. One moment.", "Бубахшед. Як лаҳза.", ["Sorry, I\'ll put it on.", "One moment, please."]),', 1),
    # Санҷиши кор: «I'll do it again» → «I can redo it»
    ('s("I\'ll do it again.", "Аз нав мекунам.", None),', 's("I can redo it.", "Аз нав карда метавонам.", None),', 1),
    ('"Бигӯ: аз нав мекунам",\n              "I\'ll do it again.", "Аз нав мекунам.", ["Okay, I\'ll redo it.", "Sorry, I\'ll do it again."]),',
     '"Бигӯ: аз нав карда метавонам",\n              "I can redo it.", "Аз нав карда метавонам.", ["Okay, I\'ll redo it.", "Sorry, I\'ll do it again."]),', 1),
    ('"Бигӯ: бубахшед, аз нав мекунам",\n              "Sorry. I\'ll do it again.", "Бубахшед. Аз нав мекунам.", ["I\'ll do it again.", "Sorry, I\'ll redo it."]),',
     '"Бигӯ: бубахшед, аз нав карда метавонам",\n              "Sorry. I can redo it.", "Бубахшед. Аз нав карда метавонам.", ["I\'ll do it again.", "Sorry, I\'ll redo it."]),', 1),
    # Табел: «I forgot to sign» → «I can sign now»
    ('s("I forgot to sign.", "Имзо гузоштанро фаромӯш кардам.", None),', 's("I can sign now.", "Ҳозир имзо мекунам.", None),', 1),
    ('"Бигӯ: не, фаромӯш кардам",\n              "No, I forgot to sign.", "Не, имзо гузоштанро фаромӯш кардам.", ["No, I forgot.", "Sorry, I forgot."]),',
     '"Бигӯ: не. ҳозир имзо мекунам",\n              "No. I can sign now.", "Не. Ҳозир имзо мекунам.", ["No, I forgot.", "Sorry, I forgot."]),', 1),
    # Хобгоҳ: «I lost my key» → «Where is my key?»
    ('s("I lost my key.", "Калидамро гум кардам.", None),', 's("Where is my key?", "Калидам куҷост?", None),', 1),
    # Дар дарс: «I forgot my book», «I finished it»
    ('s("I forgot my book.", "Китобамро фаромӯш кардам.", None),', 's("Sorry, no book.", "Бубахшед, китоб надорам.", None),', 1),
    ('"Бигӯ: китобамро фаромӯш кардам",\n              "I forgot my book.", "Китобамро фаромӯш кардам.", ["I forgot it.", "Sorry, I forgot my book."]),',
     '"Бигӯ: бубахшед, китоб надорам",\n              "Sorry, no book.", "Бубахшед, китоб надорам.", ["I forgot my book.", "Sorry, I don\'t have it."]),', 1),
    ('s("I finished it.", "Тамомаш кардам.", None),', 's("It\'s ready.", "Тайёр аст.", None),', 1),
    # Китобхона: «print» (A2)
    ('s("Can I print this?", "Инро чоп карда метавонам?", None),', 's("Can I use it?", "Истифода бурда метавонам?", None),', 1),
    # Ёрӣ пурсидан: «missed», «did»
    ('w("Missed", "аз даст додам", None),\n            s("I missed the class.", "Дарсро аз даст додам.", None),\n'
     '            s("What did I miss?", "Чиро аз даст додам?", None),',
     'w("Yesterday", "дирӯз", None),\n            s("I wasn\'t in class.", "Дар дарс набудам.", None),\n'
     '            s("What\'s the homework?", "Вазифа чист?", None),', 1),
    ('"Бигӯ: ҳа ва бипурс чиро аз даст додам",\n              "Yes. What did I miss?", "Ҳа. Чиро аз даст додам?", ["Yes, thanks. What did I miss?", "What did I miss?"]),',
     '"Бигӯ: ҳа ва бипурс: вазифа чист?",\n              "Yes. What\'s the homework?", "Ҳа. Вазифа чист?", ["Yes, thanks. What did I miss?", "What did I miss?"]),', 1),
    ('"Бигӯ: дарсро аз даст додам, бемор будам", "I missed the class. I was sick.",\n'
     '              "Дарсро аз даст додам. Бемор будам.", ["I was sick. I missed the class.", "I missed the class."]),',
     '"Бигӯ: дар дарс набудам, бемор будам", "I wasn\'t in class. I was sick.",\n'
     '              "Дар дарс набудам. Бемор будам.", ["I was sick. I missed the class.", "I missed the class."]),', 1),
    # Вазифа ва имтиҳон: «I finished the test» → «I'm done»
    ('s("I finished the test.", "Санҷишро тамом кардам.", None),', 's("I\'m done.", "Ман тамом кардам.", None),', 1),
    ('"Бигӯ: санҷишро тамом кардам", "I finished the test.",\n              "Санҷишро тамом кардам.", ["I finished.", "Done. I finished."]),',
     '"Бигӯ: тамом кардам", "I\'m done.",\n              "Ман тамом кардам.", ["I finished.", "I finished the test."]),', 1),
    ('"Бигӯ: ҳа, санҷишро тамом кардам",\n              "Yes, I finished the test.", "Ҳа, санҷишро тамом кардам.", ["Yes, I finished.", "Yes."]),',
     '"Бигӯ: ҳа, тамом кардам",\n              "Yes, I\'m done.", "Ҳа, тамом кардам.", ["Yes, I finished.", "Yes."]),', 1),
    # Бонк: «I'll take it», «I forgot my PIN», «SIM» пеш аз ибораҳо
    ('"Бигӯ: хуб, мегирам", "Okay, I\'ll take it.",\n              "Хуб, мегирам.", ["I\'ll take it.", "Okay."]),',
     '"Бигӯ: хуб, инро мехоҳам", "Okay, I want it.",\n              "Хуб, инро мехоҳам.", ["I\'ll take it.", "Okay."]),', 1),
    ('s("I forgot my PIN.", "Рамзамро фаромӯш кардам.", "PIN — рамзи корт."),',
     's("My PIN doesn\'t work.", "Рамзам кор намекунад.", "PIN — рамзи корт."),', 1),
    ('"Бигӯ: рамзамро фаромӯш кардам",\n              "I forgot my PIN.", "Рамзамро фаромӯш кардам.", ["I forgot it.", "No, I forgot my PIN."]),',
     '"Бигӯ: рамзам кор намекунад",\n              "My PIN doesn\'t work.", "Рамзам кор намекунад.", ["I forgot my PIN.", "It doesn\'t work."]),', 1),
    ('w("Phone", "телефон", None),\n            w("Money", "пул", None),',
     'w("SIM", "SIM-корт", "Корти хурди рақами телефон."),\n            w("Money", "пул", None),', 1),
])

apply(SERV, [
    ('["Okay, I wait.", "Sure."]', '["Okay, I can wait.", "Sure."]', 1),
    ('s("I call tonight.", "Бегоҳ занг мезанам.", None),', 's("I can call tonight.", "Бегоҳ занг зада метавонам.", None),', 1),
    ('"Бигӯ: хуб, бегоҳ занг мезанам",\n              "Okay, I call tonight.", "Хуб, бегоҳ занг мезанам.", ["I\'ll call tonight.", "Okay."]),',
     '"Бигӯ: хуб, бегоҳ занг зада метавонам",\n              "Okay, I can call tonight.", "Хуб, бегоҳ занг зада метавонам.", ["I\'ll call tonight.", "Okay."]),', 1),
    ('"Бигӯ: хуб, бегоҳ занг мезанам",\n              "Okay, I call tonight.", "Хуб, бегоҳ занг мезанам.", ["I\'ll call tonight.", "Okay, thank you."]),',
     '"Бигӯ: хуб, бегоҳ занг зада метавонам",\n              "Okay, I can call tonight.", "Хуб, бегоҳ занг зада метавонам.", ["I\'ll call tonight.", "Okay, thank you."]),', 1),
    ('s("I call the manager.", "Мудирро ҷеғ мезанам.", None),', 's("The manager is coming.", "Мудир ҳозир меояд.", None),', 1),
    ('"Бигӯ: лутфан, интизор шавед. мудирро ҷеғ мезанам",\n              "Please wait. I call the manager.", "Лутфан, интизор шавед. Мудирро ҷеғ мезанам.",',
     '"Бигӯ: лутфан, интизор шавед. мудир ҳозир меояд",\n              "Please wait. The manager is coming.", "Лутфан, интизор шавед. Мудир ҳозир меояд.",', 1),
])

# Даври 2б (02.10.2026): «boss» дар «Ҷой дар объект» пеш аз омӯзиш → калимаи «Boss»
# ба ҷои «There» (there — A1); «One moment» дар «Либоси корӣ» (дар роҳи сохтмон
# омӯхта нашудааст) → «Right now». Ин ду иваз дастӣ (sed/Edit) иҷро шуданд.
