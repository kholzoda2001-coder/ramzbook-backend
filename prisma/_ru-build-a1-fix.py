"""«Сохтмон» (русӣ) — ба A1-и қатъӣ (03.10.2026), аз рӯи `prisma/_ru-a1-path-audit.mjs build`.

Калимаҳои касбӣ, ки дар ҷумла пеш аз омӯзиш меомаданд (патент, бригадир), ба дарси
«Калимаҳо» мегузаранд (ба ҷои калимаи A1-и маълум); дигарҳо ба A1 содда мешаванд.
Бастаҳои job/safety/pay/rent генератор надоранд (scratchpad, 26.09) — танҳо JSON.
"""
from _speaking_fix_lib import fix_text, replace_word

B = 'prisma/_ru-build-a1-packs.py'
M = 'prisma/_ru-a1-more-packs.py'

# Кор ёфтан: «Патент» ба «Калимаҳо» (ба ҷои «Есть»)
if "--r2" not in __import__("sys").argv: replace_word('job_ru_tg', 'Есть', 'Патент', 'патент (иҷозати кор)', 'Ҳуҷҷати асосии муҳоҷир барои кор.')
# Бригадир мегӯяд: «Бригадир» ба «Калимаҳо» (ба ҷои «Сейчас» — калимаи A1)
if "--r2" not in __import__("sys").argv: replace_word('foreman_ru_tg', 'Сейчас', 'Бригадир', 'бригадир', None, gen=B)
# Бехатарӣ
if "--r2" not in __import__("sys").argv: fix_text('safety_ru_tg', 'Где аптечка?', 'Где врач?', 'Духтур куҷост?')
if "--r2" not in __import__("sys").argv: fix_text('safety_ru_tg', 'Человек упал.', 'Человеку плохо.', 'Одам худро бад ҳис мекунад.')
# Мушкил дар кор
if "--r2" not in __import__("sys").argv: fix_text('problem_ru_tg', 'Я не виноват.', 'Это не я.', 'Ин ман нестам.', gen=B)
# Музд
if "--r2" not in __import__("sys").argv: fix_text('pay_ru_tg', 'Хорошо, договорились.', 'Хорошо, давайте.', 'Хуб, майлаш.')
# Иҷора
if "--r2" not in __import__("sys").argv: fix_text('rent_ru_tg', 'Коммуналка включена?', 'Свет и вода тоже?', 'Барқ ва об ҳам дохил аст?')
# Либоси корӣ
if "--r2" not in __import__("sys").argv: fix_text('gear_ru_tg', 'В бытовке.', 'Там.', 'Он ҷо.', gen=M)
if "--r2" not in __import__("sys").argv: fix_text('gear_ru_tg', 'Нужна маска от пыли.', 'Нужна маска.', 'Ниқоб лозим.', gen=M)
if "--r2" not in __import__("sys").argv: fix_text('gear_ru_tg', 'Одежда промокла.', 'Одежда грязная.', 'Либос чиркин аст.', gen=M)
if "--r2" not in __import__("sys").argv: fix_text('gear_ru_tg', 'Есть запасная роба?', 'Есть другая одежда?', 'Либоси дигар ҳаст?', gen=M)
# Санҷиши кор
if "--r2" not in __import__("sys").argv: fix_text('check_ru_tg', 'Краска высохла?', 'Это готово?', 'Ин тайёр аст?', gen=M)
# Соатҳо
if "--r2" not in __import__("sys").argv: fix_text('hours_ru_tg', 'Можно уйти пораньше?', 'Можно уйти раньше?', 'Барвақттар рафтан мумкин?', gen=M)
print('✓ сохтмон')

# ── Даври 2 (иҷро: python prisma/_ru-build-a1-fix.py --r2)
import sys as _s
if '--r2' in _s.argv:
    fix_text('problem_ru_tg', 'Нет, я не виноват.', 'Нет, это не я.', 'Не, ин ман нестам.', gen=B)
    fix_text('gear_ru_tg', 'Извините, в бытовке.', 'Извините, она там.', 'Бубахшед, вай он ҷост.', gen=M)
    fix_text('hours_ru_tg', 'А завтра можно уйти пораньше?', 'А завтра можно раньше?', 'Фардо барвақттар мумкин?', gen=M)
