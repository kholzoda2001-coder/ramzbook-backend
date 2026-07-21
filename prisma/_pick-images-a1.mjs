// Расми машқи «pick» барои A1 — рӯйхати ҚАТЪӢ интихобшуда.
//
// Қоидаи асосӣ (аз тестер): расм танҳо вақте кӯмак мекунад, ки калимаро БЕ
// ШУБҲА нишон диҳад. Агар як сурат ба ду калимаи ҳамин курс мувофиқ ояд,
// хонанда саргум мешавад — чунин калима расм НАМЕГИРАД, эмоҷӣ мемонад.
//
// Аз ин рӯ хориҷ карда шуданд:
//   • ОДАМОН ва ХЕШУТАБОР — сурати як мард ҳамзамон "man/adult/father/uncle"
//     аст. (Ҳатто 5 сурати мавҷуда — man/woman/boy/girl/friend — маҳз ҳамин
//     хатогӣ буданд.) Ҳамчунин касбҳо: doctor≈nurse, teacher≈student.
//   • РАҚАМҲО — сурати "шаш" вуҷуд надорад; эмоҷии 6️⃣ беҳтарин аст.
//   • КИШВАР/ЗАБОН — парчам аллакай ҷавоби дуруст; манзара норавшан аст.
//   • МАФҲУМҲОИ АБСТРАКТӢ — Color, Corner, Music, Game, Call, Examine.
//   • ВАҚТИ ХӮРОК — Breakfast/Lunch/Dinner/Meal/Snack: як табақи хӯрок кадомаш?
//   • ФАСЛҲО — Winter≈Snow, Summer≈Beach, Spring≈Flower.
//   • ҶУФТҲОИ ОМЕХТА — Home≈House, Cash≈Money≈Dollar, Store≈Supermarket,
//     Medicine≈Tablet, Box≈Package, Sea≈Lake, Wolf≈Dog, Cap≈Hat, Shirt≈T-Shirt,
//     Train Station≈Subway, Hospital≈Clinic, Sky≈Cloud, Animal/Pet/Bird/Room
//     (умумӣ, на мушаххас).

export const A1_PICK = {
  'M5 Мева': ['lemon', 'peach', 'grapes', 'strawberry', 'watermelon', 'banana', 'pineapple', 'mango', 'apple'],
  'M5 Сабзавот': ['potato', 'tomato', 'cucumber', 'cabbage', 'pepper', 'corn', 'lettuce', 'onion', 'carrot', 'garlic'],
  'M5 Нӯшокӣ': ['tea', 'water', 'ice', 'lemonade', 'juice', 'milk'],
  'M5 Хӯрок': ['meat', 'rice', 'cheese', 'soup', 'butter', 'pasta', 'bread', 'egg', 'chicken', 'fish'],
  'M6 Ҳуҷраҳо': ['living_room', 'dining_room', 'bathroom', 'kitchen', 'bedroom', 'hallway'],
  'M6 Мебел': ['bed', 'window', 'shelf', 'chair', 'television', 'wardrobe', 'mirror', 'door', 'table', 'sofa', 'desk', 'closet'],
  'M6 Ашёи хонагӣ': ['phone', 'computer', 'pen', 'pencil', 'picture', 'plant', 'key', 'house', 'garage', 'garden'],
  'M7 Харид': ['receipt', 'shopping_cart', 'basket', 'box', 'bottle'],
  'M8 Ҷойҳо': ['school', 'mosque', 'hotel', 'restaurant', 'hospital', 'pharmacy', 'bakery', 'museum',
               'stadium', 'post_office', 'police_station', 'mall', 'park', 'cinema', 'bank', 'cafe', 'zoo', 'supermarket'],
  'M8 Нақлиёт': ['taxi', 'airplane', 'bus_stop', 'bus', 'bicycle', 'car', 'boat', 'train', 'ticket'],
  'M9 Либос': ['socks', 'cap', 'shirt', 'suit', 'tie', 'dress', 'boots', 'gloves', 'shorts', 'belt',
               'coat', 'sweater', 'shoes', 'pants'],
  'M9 Лавозимот': ['bag', 'wallet', 'umbrella', 'ring', 'necklace', 'scarf', 'backpack', 'earrings'],
  'M10 Узвҳои бадан': ['tooth', 'ear', 'foot', 'mouth', 'arm', 'eye', 'leg', 'nose', 'hand'],
  'M10 Дорухона': ['drops', 'cream', 'mask', 'thermometer', 'syrup', 'tablet', 'ambulance'],
  'M11 Обу ҳаво': ['cloud', 'rain', 'sun', 'snow'],
  'M11 Ҳайвоноти хонагӣ': ['duck', 'sheep', 'cat', 'donkey', 'goat', 'horse', 'cow', 'farm', 'dog'],
  'M11 Ҳайвоноти ваҳшӣ': ['elephant', 'bear', 'monkey', 'rabbit', 'camel', 'snake', 'mouse', 'lion'],
  'M11 Табиат': ['flower', 'grass', 'stone', 'mountain', 'beach', 'sea', 'moon', 'tree'],
  'M11 Мактаб': ['classroom'],
};

// Тавзеҳи сурат барои калимаҳое ки бе он норавшан мебуданд.
export const HINT = {
  water: 'a clear glass of plain drinking water',
  ice: 'a small pile of clear ice cubes',
  tea: 'a glass cup of hot black tea',
  lemonade: 'a tall glass of pale yellow lemonade with a lemon slice',
  pepper: 'a fresh green bell pepper',
  corn: 'a fresh yellow corn cob',
  meat: 'a raw red cut of beef on a board',
  butter: 'a block of yellow butter',
  shelf: 'a wooden wall shelf with a few books',
  closet: 'an open clothes closet with hanging garments',
  picture: 'a framed picture hanging on a wall',
  box: 'a plain closed cardboard box',
  bottle: 'a plastic water bottle',
  receipt: 'a paper shop receipt',
  farm: 'a farm yard with a barn and fields',
  stone: 'a single grey rock on the ground',
  arm: 'a human arm, bare, from shoulder to wrist',
  hand: 'an open human hand, palm facing camera',
  foot: 'a bare human foot',
  cap: 'a baseball cap',
  shirt: 'a button-up collared dress shirt',
  suit: "a men's formal two-piece suit",
  belt: 'a leather trouser belt',
  drops: 'a small bottle of eye drops',
  cream: 'a tube of medical skin cream',
  syrup: 'a bottle of liquid cough syrup with a spoon',
  tablet: 'a blister pack of white medicine pills',
  mask: 'a disposable medical face mask',
  sun: 'the bright sun in a clear blue sky',
  cloud: 'a single white fluffy cloud in a blue sky',
  rain: 'heavy rain falling, raindrops on a window',
  snow: 'fresh white snow covering the ground',
  sea: 'the open sea with waves, no beach in view',
  beach: 'a sandy beach with the sea behind',
  grass: 'a close view of green grass',
  moon: 'the full moon in a dark night sky',
  classroom: 'an empty school classroom with desks and a board',
  bus_stop: 'a street bus stop with a shelter and sign',
  post_office: 'a post office building entrance',
  police_station: 'a police station building entrance',
  living_room: 'a furnished living room with a sofa',
  dining_room: 'a dining room with a table and chairs',
  hallway: 'an indoor house hallway corridor',
};
