"""«Ҳаёти рӯзмарра» (англисӣ) — ба A1-и қатъӣ (03.10.2026), аз рӯи `prisma/_en-a1-path-audit.mjs life`.

Генератор аз шохаи `claude/nifty-albattani-6uijek` (42e16a3): 39 калимаи пешакӣ
наомӯхта, замони гузашта ва «I'll» дар гуфтори хонанда. Калимаҳои CEFR A1 (shower,
excuse, tell, little, message, before, outside, just, center, careful, perfect,
someone) ба меъёри аудит илова шуданд; инҳо содда ё ба дарси «Калимаҳо» бурда шуданд.

`fix(old, new, tg)` — ҳар ҷое, ки «old» ҳамчун МАТН (s/w ё ҷавоби t) омадааст: матн,
тарҷума ва нияти «Бигӯ/Бипурс: …» нав мешаванд. Дар `accepts` «old» ҳамчун ҷавоби
қабулшаванда мемонад. Ҳар иваз бояд ақаллан як бор ёфт шавад.
"""
import io, re, sys

P = 'prisma/_en-life-a1-packs.py'
s = io.open(P, encoding='utf-8').read()

def intent_for(tg, old_intent):
    verb = 'Бипурс' if old_intent.startswith('Бипурс') else 'Бигӯ'
    body = tg.rstrip('.!?')
    return f'{verb}: {body[0].lower() + body[1:]}'

def fix(old, new, tg):
    global s
    n = 0
    # s(...)/w(...): матн + тарҷума
    pat = re.compile(r'\b([sw])\("' + re.escape(old) + r'", "[^"]*"')
    s, k = pat.subn(lambda m: f'{m.group(1)}("{new}", "{tg}"', s); n += k
    # t(cue, cue_tr, intent, text, tr, …)
    pat = re.compile(r'(t\(\s*"[^"]*",\s*"[^"]*",\s*)"([^"]*)",(\s*)"' + re.escape(old) + r'",(\s*)"[^"]*"')
    s, k = pat.subn(lambda m: f'{m.group(1)}"{intent_for(tg, m.group(2))}",{m.group(3)}"{new}",{m.group(4)}"{tg}"', s); n += k
    if n == 0:
        sys.exit(f'⛔ «{old}» ёфт нашуд')
    print(f'  {n}× «{old}» → «{new}»')

def rep(old, new, cnt=1):
    global s
    c = s.count(old)
    if c != cnt:
        sys.exit(f'⛔ «{old[:70]}» {c} бор, интизор {cnt}')
    s = s.replace(old, new)

# Фурудгоҳ
fix("I lost my bag.", "Where is my bag?", "Халтаи ман куҷост?")
fix("My flight is delayed.", "My flight is late.", "Парвози ман дер мекунад.")
# Меҳмонхона: «Reservation» ба ҷои «Night» (Two nights — ибора), «Checkout»/«Elevator» ба ибораҳо
rep('w("Night", ', 'w("Reservation", ')
fix("Room five", "Checkout time", "Вақти баромадан")
fix("Room key", "The elevator", "Лифт")
fix("It's too noisy.", "Can I change rooms?", "Ҳуҷраро иваз карда метавонам?")
# Нақлиёт
fix("Does it go downtown?", "Does it go there?", "Ба он ҷо меравад?")
fix("I missed my stop.", "Not my stop!", "Истгоҳи ман нест!")
# Қаҳвахона
fix("Where is the restroom?", "Where is the toilet?", "Ҳоҷатхона куҷост?")
# Супермаркет
fix("I forgot milk.", "I need milk.", "Ба ман шир лозим.")
fix("One moment, please.", "Wait, please.", "Лутфан, сабр кунед.")
fix("One moment. I forgot milk.", "Wait, please. I need milk.", "Лутфан, сабр кунед. Ба ман шир лозим.")
# Телефон: «SIM» ба ҷои «Battery» дар «Калимаҳо» (Low battery — ибора)
rep('w("Battery", ', 'w("SIM", ')
fix("Okay, I'll take it.", "Okay, I want it.", "Хуб, инро мехоҳам.")
fix("Okay, I'll take that.", "Okay, I want that.", "Хуб, онро мехоҳам.")
fix("Can I charge here?", "A charger, please?", "Пуркунак, лутфан?")
fix("Can I top up?", "More data, please.", "Интернети бештар, лутфан.")
fix("Add ten dollars.", "Ten dollars, please.", "Даҳ доллар, лутфан.")
# Пул
fix("My card is stuck.", "The ATM doesn't work.", "Банкомат кор намекунад.")
fix("Please count it.", "Is it all here?", "Ҳамааш ҳаст?")
# Почта
fix("Clothes and gifts.", "Clothes and books.", "Либос ва китоб.")
fix("Can I track it?", "When does it arrive?", "Кай мерасад?")
fix("It's fragile.", "It's glass.", "Шиша аст.")
# Ҳамсояҳо
fix("Can I borrow this?", "Can I take this?", "Инро гирифта метавонам?")
fix("I'll return it tomorrow.", "Back tomorrow, okay?", "Фардо бармегардонам, хуб?")
# Гум шудам
fix("Excuse me, sir.", "Excuse me, please.", "Бубахшед, лутфан.")
fix("My phone is dead.", "My phone doesn't work.", "Телефонам кор намекунад.")
fix("I'm lost. My phone is dead.", "I'm lost. My phone doesn't work.", "Роҳро гум кардам. Телефонам кор намекунад.")
# Вақти холӣ
fix("I stayed home.", "I was at home.", "Дар хона будам.")
# Занги фаврӣ
fix("Please be quick.", "Please come fast.", "Лутфан, зуд биёед.")
fix("Someone took my bag.", "A thief! My bag!", "Дузд! Халтаи ман!")
fix("A man fell.", "A man is hurt.", "Одаме захмӣ шуд.")
fix("Help! A man fell.", "Help! A man is hurt.", "Ёрӣ диҳед! Одаме захмӣ шуд.")
fix("He fell", "He's hurt", "Ӯ захмӣ шуд")
# Сартарошхона
fix("Shorter, please.", "Short, please.", "Кӯтоҳ, лутфан.")
fix("Here is a tip.", "This is for you.", "Ин барои шумо.")
fix("I'll come again.", "See you again.", "То боз дидор.")

io.open(P, 'w', encoding='utf-8', newline='').write(s)
print('✓', P)

# ── Даври 2: ибораҳои таркибӣ дар муколама/миссия ва транскрипсия
s = io.open(P, encoding='utf-8').read()
fix("It's fragile. Please be careful.", "It's glass. Please be careful.", "Шиша аст. Лутфан, эҳтиёт кунед.")
fix("Yes. Can I borrow this?", "Yes. Can I take this?", "Ҳа. Инро гирифта метавонам?")
fix("Yes. My phone is dead.", "Yes. My phone doesn't work.", "Ҳа. Телефонам кор намекунад.")
fix("Okay. Please be quick.", "Okay. Please come fast.", "Хуб. Лутфан, зуд биёед.")
fix("Here. And here is a tip.", "Here. And this is for you.", "Ана. Ва ин барои шумо.")
fix("Okay. It's fragile.", "Okay. It's glass.", "Хуб. Шиша аст.")
rep("EXTRA.update({", "EXTRA.update({\n    'books': 'букс', \"he's\": 'ҳиз', 'rooms': 'румз',")
io.open(P, 'w', encoding='utf-8', newline='').write(s)
print('✓ даври 2')
