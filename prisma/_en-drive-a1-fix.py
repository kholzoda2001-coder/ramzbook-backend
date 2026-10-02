"""«Ронандагӣ» (англисӣ) — ба A1-и қатъӣ (02.10.2026), аз рӯи `prisma/_en-a1-path-audit.mjs drive`.

Генератор аз шохаи `claude/nifty-albattani-6uijek` (30.09) пеш аз қоидаҳои қатъӣ
навишта шуда буд: 42 калимаи пешакӣ наомӯхта ва «I'll / won't / didn't» дар гуфтори
хонанда. Калимаҳои CEFR A1 (wrong, photo, check, hear, leave…) ба меъёри аудит
илова шуданд; инҳо содда карда мешаванд. Ҳар иваз бояд ҳамон шумора бор ёфт шавад.
"""
import io, sys

P = 'prisma/_en-drive-a1-packs.py'
s = io.open(P, encoding='utf-8').read()

def rep(old, new, n=1):
    global s
    c = s.count(old)
    if c != n:
        sys.exit(f'⛔ «{old[:80]}» {c} бор ёфт шуд, интизор {n}')
    s = s.replace(old, new)

# ── Мошини корӣ: «low» (A2), «automatic» (B1)
rep('s("This tire is low.", "Ин чарх паст аст.", "Яъне бодаш кам аст."),', 's("Check this tire.", "Ин чархро санҷед.", None),')
rep('"This tire is low.", "Ин чарх паст аст.", ["The tire is low.", "One tire is low."]),',
    '"Check this tire.", "Ин чархро санҷед.", ["This tire is low.", "The tire is bad."]),')
rep('"Бигӯ: ин чарх паст аст", "This tire is low.",\n              "Ин чарх паст аст.", ["The tire is low.", "One tire is low."]),',
    '"Бигӯ: ин чархро санҷед", "Check this tire.",\n              "Ин чархро санҷед.", ["This tire is low.", "The tire is bad."]),')
rep('s("Is it automatic?", "Автомат аст?", "Қуттии суръат — автомат ё механика."),', 's("Where are the keys?", "Калидҳо куҷоянд?", None),')
# ── Суроға ва роҳ: «terminal» (B1), «almost» (A2)
rep('"Okay, terminal two."', '"Okay, number two."', 2)
rep('"Хуб, терминали ду."', '"Хуб, рақами ду."', 2)
rep('"Бигӯ: хуб, терминали ду"', '"Бигӯ: хуб, рақами ду"', 2)
rep('s("We\'re almost there.", "Қариб расидем.", None),', 's("Two more minutes.", "Боз ду дақиқа.", None),')
rep('"Бигӯ: қариб расидем", "We\'re almost there.", "Қариб расидем.",', '"Бигӯ: боз ду дақиқа", "Two more minutes.", "Боз ду дақиқа.",')
# ── Бағоҷ: «I'll …», «fit» (A2)
rep('s("I\'ll help", "Ман ёрӣ медиҳам", None),', 's("Your bags", "Бағоҷатон", None),')
rep('["Let me help.", "I\'ll help you."]', '["I can help.", "I\'ll help you."]')
rep('["I\'ll help you.", "Let me help."]', '["I\'ll help you.", "I can help."]')
rep('"I\'ll help."', '"Let me help."', 1)
rep('"No problem. I\'ll help."', '"No problem. Let me help."')
rep('s("I\'ll open the trunk.", "Бағоҷдонро мекушоям.", None),', 's("Open the trunk?", "Бағоҷдонро кушоям?", None),')
rep('s("It doesn\'t fit.", "Ҷой намешавад.", None),', 's("It\'s too big.", "Хеле калон аст.", None),')
rep('"Yes, I\'ll open it.", "Ҳа, мекушоям."', '"Yes, I can open it.", "Ҳа, кушода метавонам."')
rep('s("I\'ll close it.", "Ман мепӯшам.", None),', 's("I can close it.", "Пӯшида метавонам.", None),')
rep('"Бигӯ: мушкил нест. Бағоҷдонро мекушоям", "No problem. I\'ll open the trunk.",\n              "Мушкил нест. Бағоҷдонро мекушоям."',
    '"Бигӯ: мушкил нест, кушода метавонам", "No problem. I can open it.",\n              "Мушкил нест. Кушода метавонам."')
# ── Пардохт: «smaller bill», «app», «already paid»
rep('s("A smaller bill?", "Пули майдатар?", None),', 's("Ten dollars, please.", "Даҳ доллар, лутфан.", None),')
rep('s("Pay in the app.", "Дар барнома пардохт кунед.", None),', 's("Pay by card?", "Бо корт пардохт?", None),')
rep('s("It\'s already paid.", "Аллакай пардохт шудааст.", None),', 's("No change? Okay.", "Бақия нест? Хуб.", None),')
# ── Сӯзишворӣ: «low», «restroom»
rep('s("My tire is low.", "Чархи ман паст аст.", None),', 's("My tire needs air.", "Чархам бод мехоҳад.", None),')
rep('"Where is the restroom?"', '"Where is the toilet?"', 1)
# ── Роҳбандӣ: «faster», «rush hour», «You'll», «boss», «worry»
rep('"Бигӯ: ҳа, тезтар", "Yes, faster.", "Ҳа, тезтар.",', '"Бигӯ: ҳа, тез аст", "Yes, it\'s fast.", "Ҳа, тез аст.",')
rep('s("It\'s rush hour.", "Вақти серодам аст.", "Субҳ ва бегоҳ, вақте ҳама ба кор мераванд."),', 's("Traffic is bad.", "Роҳ сахт банд аст.", None),')
rep('s("You\'ll be on time.", "Сари вақт мерасед.", None),', 's("We\'re not late.", "Мо дер намемонем.", None),')
rep('"I can\'t drive faster.", "Тезтар ронда наметавонам."', '"I can\'t go fast.", "Тез рафта наметавонам."', 2)
rep('"Бигӯ: тезтар ронда наметавонам"', '"Бигӯ: тез рафта наметавонам"')
rep('s("Call your boss?", "Ба сардоратон занг мезанед?", None),', 's("Call your friend?", "Ба дӯстатон занг мезанед?", None),')
rep('s("Don\'t worry.", "Хавотир нашавед.", None),', 's("It\'s okay.", "Ҳамааш хуб.", None),')
rep('"Бигӯ: боз панҷ дақиқа. Хавотир нашавед",\n              "Five more minutes. Don\'t worry.", "Боз панҷ дақиқа. Хавотир нашавед.",',
    '"Бигӯ: боз панҷ дақиқа. ҳамааш хуб",\n              "Five more minutes. It\'s okay.", "Боз панҷ дақиқа. Ҳамааш хуб.",')
rep('"Бигӯ: хавотир нашавед", "Don\'t worry.",\n              "Хавотир нашавед."', '"Бигӯ: ҳамааш хуб", "It\'s okay.",\n              "Ҳамааш хуб."')
# ── Расонидан: «nobody», «I'll …», «broken» (ба «Калимаҳо»), «item missing»
rep('s("Nobody is home.", "Касе дар хона нест.", None),', 's("No one is home.", "Касе дар хона нест.", None),')
rep('s("I\'ll leave it here.", "Ин ҷо мегузорам.", None),', 's("At the door?", "Назди дар?", None),')
rep('s("I\'ll send a photo.", "Акс мефиристам.", None),', 's("A photo, okay?", "Акс, хуб?", None),')
rep('"Okay. I\'ll send a photo.", "Хуб. Акс мефиристам."', '"Okay. I can send a photo.", "Хуб. Акс фиристода метавонам."')
rep('s("One item is missing.", "Як чиз нест.", None),', 's("Only two boxes?", "Танҳо ду қуттӣ?", None),')
rep('s("I\'ll call the store.", "Ба мағоза занг мезанам.", None),', 's("Call the store?", "Ба мағоза занг занам?", None),')
rep('"Sorry. I\'ll call the store.", "Бубахшед. Ба мағоза занг мезанам."', '"Sorry. I can call the store.", "Бубахшед. Ба мағоза занг зада метавонам."')
# «Door» дуюм (дарси «Калимаҳо»-и «Расонидан»; аввалӣ — «Гирифтани мусофир») → «Broken»
i1 = s.find('w("Door", "дар", None),')
i2 = s.find('w("Door", "дар", None),', i1 + 1)
if i1 < 0 or i2 < 0 or s.find('w("Door", "дар", None),', i2 + 1) >= 0:
    sys.exit('⛔ w("Door") ду бор бояд бошад')
s = s[:i2] + 'w("Broken", "шикаста", None),' + s[i2 + len('w("Door", "дар", None),'):]
# ── Занг ба мизоҷ: «I'll wait»
rep('"Okay, I\'ll wait."', '"Okay, I can wait."', 2)
rep('"Хуб, интизор мешавам."', '"Хуб, интизор шуда метавонам."', 2)
# ── Полиси роҳ: «didn't», «I'll be careful»
rep('s("I didn\'t know.", "Ман намедонистам.", None),', 's("I\'m very sorry.", "Хеле бубахшед.", None),')
rep('"Бигӯ: бубахшед, намедонистам",\n              "Sorry, I didn\'t know.", "Бубахшед, намедонистам.",',
    '"Бигӯ: бубахшед, ҷаноби афсар",\n              "Sorry, officer.", "Бубахшед, ҷаноби афсар.",')
rep('s("I\'ll be careful.", "Эҳтиёт мешавам.", None),', 's("Okay, I understand.", "Хуб, фаҳмидам.", None),')
rep('"Бигӯ: ҳа, эҳтиёт мешавам", "Yes, I\'ll be careful.",\n              "Ҳа, эҳтиёт мешавам."', '"Бигӯ: ҳа, фаҳмидам", "Yes, I understand.",\n              "Ҳа, фаҳмидам."')
rep('"Бигӯ: фаҳмидам. Эҳтиёт мешавам", "I understand. I\'ll be careful.", "Фаҳмидам. Эҳтиёт мешавам."',
    '"Бигӯ: фаҳмидам. бубахшед, ҷаноби афсар", "I understand. Sorry, officer.", "Фаҳмидам. Бубахшед, ҷаноби афсар."')
# ── Вайронӣ: «won't»
rep('"The car won\'t start."', '"The car doesn\'t start."', 2)
rep('["My car won\'t start.", "The car doesn\'t start."]', '["My car won\'t start.", "It doesn\'t start."]')
# ── Садама: «I'll take photos», «hit», «report», «neck»
rep('s("I\'ll take photos.", "Ман акс мегирам.", None),', 's("Take photos?", "Акс гирам?", None),')
rep('"Okay. I\'ll take photos.",\n              "Хуб. Ман акс мегирам."', '"Okay. I can take photos.",\n              "Хуб. Акс гирифта метавонам."')
rep('"Thanks. I\'ll take photos.", "Ташаккур. Ман акс мегирам."', '"Thanks. I can take photos.", "Ташаккур. Акс гирифта метавонам."')
rep('s("A car hit me.", "Мошин ба ман зад.", None),', 's("It\'s a small accident.", "Садамаи хурд аст.", None),')
rep('"Бигӯ: мошин ба ман зад", "A car hit me.",\n              "Мошин ба ман зад."', '"Бигӯ: садамаи хурд аст", "It\'s a small accident.",\n              "Садамаи хурд аст."')
rep('s("We need a report.", "Ба мо протокол лозим.", None),', 's("We need the police.", "Ба мо полис лозим.", None),')
rep('"Бигӯ: ҳа, ба мо протокол лозим",\n              "Yes, we need a report.", "Ҳа, ба мо протокол лозим."',
    '"Бигӯ: ҳа, ба мо полис лозим",\n              "Yes, we need the police.", "Ҳа, ба мо полис лозим."')
rep('s("My neck hurts.", "Гарданам дард мекунад.", None),', 's("My back hurts.", "Пуштам дард мекунад.", None),')
# ── Навбат: «payday», «boss» (дар роҳи ронандагӣ омӯхта нашудааст)
rep('s("When is payday?", "Рӯзи музд кай?", None),', 's("Pay on Friday?", "Музд ҷумъа?", None),')
rep('"Бипурс: рӯзи музд кай?", "When is payday?",', '"Бипурс: музд ҷумъа?", "Pay on Friday?",')
rep('"Thank you, boss.", "Ташаккур, сардор."', '"Thank you very much.", "Ташаккури зиёд."', 2)
rep('["Thanks, boss!", "Thank you very much."]', '["Thanks, boss!", "Thank you!"]')

io.open(P, 'w', encoding='utf-8', newline='').write(s)
print('✓', P)

# Даври 2 (дастӣ, sed): «Nobody is hurt.» → «No one is hurt.» (ҳама ҷо); EXTRA: let, needs.
# Даври 3 (дастӣ, sed): «It's a small accident.» → «It's an accident.» — порчаи «small accident.»
# артиклро аз ибора ҷудо мекард (тести chunk-quality).
