import fs from 'fs';
let code = fs.readFileSync('prisma/_de-images.mjs', 'utf8');

const newPrompts = `
  'das Brot': ['a loaf of fresh crusty bread on a wooden cutting board', SCENE],
  'die Butter': ['a block of yellow butter on a small ceramic dish', SCENE],
  'der Käse': ['a piece of yellow cheese with holes on a wooden board', SCENE],
  'die Marmelade': ['a glass jar of red strawberry jam on a table', SCENE],
  'das Ei': ['a single brown chicken egg on a white plate', SCENE],
  'das Frühstück': ['a healthy breakfast table with bread, butter, eggs and coffee', SCENE],
  
  'der Apfel': ['a fresh red apple with a green leaf on a table', SCENE],
  'die Banane': ['a ripe yellow banana on a white table', SCENE],
  'die Orange': ['a round bright orange fruit on a wooden table', SCENE],
  'die Erdbeere': ['a fresh red strawberry on a white plate', SCENE],
  'die Traube': ['a bunch of fresh green grapes', SCENE],
  'das Obst': ['a bowl full of fresh fruits, apples, bananas, oranges', SCENE],
  
  'die Tomate': ['a fresh red tomato with water drops on it', SCENE],
  'die Kartoffel': ['a raw brown potato on a wooden table', SCENE],
  'die Zwiebel': ['a brown onion on a cutting board', SCENE],
  'der Salat': ['a bowl of fresh green salad with tomatoes', SCENE],
  'die Karotte': ['a fresh orange carrot with green top', SCENE],
  'das Gemüse': ['a basket full of fresh vegetables, tomatoes, carrots, onions', SCENE],
  
  'das Fleisch': ['a raw piece of red meat on a wooden cutting board', SCENE],
  'das Hähnchen': ['a roasted chicken on a plate', SCENE],
  'die Wurst': ['a grilled sausage on a white plate', SCENE],
  'der Fisch': ['a whole fresh fish on a plate with lemon', SCENE],
  'das Mittagessen': ['a hot plate of food for lunch on a table', SCENE],
  'das Abendessen': ['a cozy dinner table with warm food and candles', SCENE],
  
  'das Wasser': ['a clear glass of fresh water', SCENE],
  'der Kaffee': ['a white ceramic cup of hot coffee with latte art', SCENE],
  'der Tee': ['a warm cup of tea with a tea bag string', SCENE],
  'der Saft': ['a glass of fresh orange juice', SCENE],
  'die Milch': ['a glass of fresh white milk', SCENE],
  'das Getränk': ['a refreshing cold drink in a glass with ice', SCENE],
  
  'das Restaurant': ['the cozy interior of a modern restaurant with empty tables', SCENE],
  'die Speisekarte': ['an open restaurant menu on a wooden table', SCENE],
  'die Rechnung': ['a paper receipt on a small restaurant tray', SCENE],
  
  'der Teller': ['an empty white ceramic plate on a table', SCENE],
  'das Glas': ['an empty drinking glass on a table', SCENE],
  'die Tasse': ['an empty white coffee cup', SCENE],
  'das Messer': ['a silver dining knife on a white napkin', SCENE],
  'die Gabel': ['a silver dining fork on a white napkin', SCENE],
  'der Löffel': ['a silver dining spoon on a white napkin', SCENE],

  'das Haus': ['a beautiful modern two-story house with a small front yard', SCENE],
  'die Wohnung': ['a bright modern apartment interior with large windows', SCENE],
  'der Balkon': ['a cozy apartment balcony with some plants and a chair', SCENE],
  'der Garten': ['a green garden with grass, trees and bright sunlight', SCENE],
  'die Treppe': ['a wooden staircase inside a house', SCENE],
  
  'das Zimmer': ['a clean bright empty room with white walls', SCENE],
  'das Wohnzimmer': ['a cozy living room with a sofa, a rug and a coffee table', SCENE],
  'das Schlafzimmer': ['a cozy bedroom with a large comfortable bed and pillows', SCENE],
  'die Küche': ['a modern clean kitchen with white cabinets', SCENE],
  'das Badezimmer': ['a clean modern bathroom with a white bathtub and mirror', SCENE],
  'der Flur': ['a bright hallway in a house with a door and a shoe rack', SCENE],
  
  'das Bett': ['a large comfortable bed with white sheets and pillows', SCENE],
  'der Schrank': ['a tall wooden wardrobe closet in a bedroom', SCENE],
  'der Tisch': ['a simple wooden dining table', SCENE],
  'der Stuhl': ['a modern wooden dining chair', SCENE],
  'das Sofa': ['a comfortable grey sofa in a living room', SCENE],
  'die Möbel': ['a room filled with various modern furniture pieces', SCENE],
  
  'die Lampe': ['a modern floor lamp illuminating a cozy corner', SCENE],
  'der Teppich': ['a soft fluffy rug on a wooden floor', SCENE],
  'das Regal': ['a wooden bookshelf filled with books', SCENE],
  'der Spiegel': ['a large wall mirror in a room', SCENE],
  'das Bild': ['a framed painting hanging on a white wall', SCENE],
  'der Sessel': ['a comfortable reading armchair', SCENE],
  
  'der Fernseher': ['a large flat screen TV on a TV stand in a living room', SCENE],
  'der Kühlschrank': ['a modern silver refrigerator in a kitchen', SCENE],
  'die Waschmaschine': ['a white washing machine in a modern bathroom', SCENE],
  'das Fenster': ['a large open window showing daylight', SCENE],
  'die Tür': ['a closed white wooden interior door', SCENE],
  'der Schlüssel': ['a silver house key on a wooden table', SCENE],
`;

code = code.replace(/(const P = \{[\s\S]*?)(\};\n)/, '$1' + newPrompts + '$2');
fs.writeFileSync('prisma/_de-images.mjs', code);
