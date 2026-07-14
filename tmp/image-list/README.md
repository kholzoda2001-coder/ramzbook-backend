# RAMZ — рӯйхати расмҳои луғат (A1 + A2)

## Хулоса
- **433 расм** бояд кашида шавад → рӯйхат дар `images-draw.tsv`
- **154 калимаи абстракт** расм намехоҳанд (эмодзӣ мемонанд) → `images-skip.tsv`
- Ном: ҳар файл = **номи калима** (мас. `apple.png`, `bus_stop.png`). Ҳамин ном лозим — тағйир надиҳед.
- Формат: **PNG**, мураббаъ **1024×1024**, заминаи **сафеди тоза**.
- Ҳамаро дар **як папка** гузоред, баъд ба ман диҳед — ман ба лоиҳа мепайвандам.

## УСЛУБ (барои ҲАР расм якхела — ин муҳимтарин аст)

Ба агент ин промпти собитро диҳед, ва танҳо қисми `Draw:` -ро иваз кунед:

```
STYLE (identical for every image): 3D rendered icon, soft matte clay / plastic
look, one single object centered in frame, front 3/4 view, rounded friendly
shapes, vibrant but soft pastel-ish colors, smooth soft studio lighting, one
subtle soft shadow directly beneath the object, pure plain WHITE background
(#FFFFFF). Absolutely NO face, NO eyes, NO mouth, NO smile on objects/food/
animals (animals shown in natural neutral pose, no cartoon face). NO text, NO
letters, NO numbers, NO logos, NO watermark, no extra props, no decoration,
no border. Square 1:1, 1024x1024. Keep the SAME style across the whole set.

Draw: <ENGLISH WORD> (<кӯтоҳ тавзеҳи тоҷикӣ>)
```

### Мисол
```
Draw: Apple (себ — як себи сурх бо барг)
Draw: Bus stop (истгоҳи автобус — тахтаи истгоҳ)
Draw: Bicycle (дучарха)
```

## Қоидаҳои муҳим
1. **Бе чеҳра** — на себ, на мошин, на офтоб чашму даҳон надошта бошад. Ҳайвон дар ҳолати табиӣ (бе чеҳраи мультфилмӣ).
2. **Танҳо ЯК ашё** — фон холӣ, бе манзара, бе одам дар паси он.
3. **Бе матн/ҳарф/рақам** дар расм.
4. **Заминаи сафед** — ҳамеша якхела (#FFFFFF).
5. **Услуби ягона** — агар мумкин бошад, ҳамон модел/танзимоти агентро барои ҳама 433 нигоҳ доред, то якранг бошанд.

## Файлҳо дар ин папка
| Файл | Чист |
|------|------|
| `images-draw.tsv` | 433 калима барои расм (filename, english, tajik, level) |
| `images-skip.tsv` | 154 калимаи абстракт (расм намехоҳанд) |
| `words-draw.json` | ҳамон 433 дар JSON (барои автоматизатсия) |
| `image_manifest.json` | рӯйхати номҳо — ман инро ба app мегузорам |
