// A2 расмҳо — ~193 расми расмшаванда (Pollinations FLUX, ройгон). Танҳо TSV.
import { readFileSync, writeFileSync } from 'fs';
const j = JSON.parse(readFileSync(new URL('./_a2-categorize2.json', import.meta.url), 'utf8'));
const c = j.cat;
const norm = w => w.trim().toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'');

const OBJ='professional realistic photograph, single real object, DSLR, soft studio light, plain neutral light grey background, centered, sharp focus, high detail, no text, no watermark, no logo, no illustration, no cartoon, photorealistic, ';
const SCENE='professional realistic photograph, DSLR, natural daylight, sharp focus, photorealistic, no readable text, all signs blank, no watermark, no logo, no cartoon, ';
const PERSON='professional realistic portrait photograph, DSLR, soft natural light, plain neutral background, sharp focus, photorealistic, no text, no watermark, ';

// калимаҳое ки расми тоза намешаванд — дур
const DROP=new Set(['Half','Piece','Bunch','Dozen','Spoonful','Litre','Carton','Packet','Jar','Loaf','Future','Fan','Amateur','Channel','Nap','Evening walk','Sightseeing','Customs','Skin','Muscle','Member','Staff','Client','Passenger','Passengers','Crew','Owner','Boss','Immigrant','Citizen','Volunteer','Reporter','Border','Continent','Capital','Region','Ward','Floor','Reception','Gate','Terminal','Instrument','Device']);

// промпти махсус барои калимаҳое ки шаблони умумӣ хуб намедиҳад
const SPECIAL={
  // касбҳо (портрет бо аломати касб)
  lawyer:['a lawyer in a formal suit holding legal documents',PERSON],
  accountant:['an accountant working with a calculator and financial papers',PERSON],
  journalist:['a journalist holding a microphone and notepad',PERSON],
  architect:['an architect looking at building blueprints at a desk',PERSON],
  electrician:['an electrician in a hard hat working on electrical wires',PERSON],
  plumber:['a plumber fixing pipes with a wrench under a sink',PERSON],
  waiter:['a waiter in uniform carrying a tray of food in a restaurant',PERSON],
  chef:['a chef in a white uniform and hat cooking in a kitchen',PERSON],
  surgeon:['a surgeon in scrubs and mask in an operating room',PERSON],
  referee:['a football referee in black uniform holding a whistle and card',PERSON],
  coach:['a sports coach with a whistle instructing on a field',PERSON],
  guide:['a tour guide holding a small flag leading tourists',PERSON],
  tourist:['a happy tourist with a camera and backpack sightseeing',PERSON],
  couple:['a happy young couple standing together',PERSON],
  twin:['two identical twin children standing side by side',PERSON],
  champion:['a sports champion holding a gold trophy, celebrating',PERSON],
  // ҷойҳо (саҳна)
  town_hall:['a grand historic town hall building exterior',SCENE],
  salon:['interior of a modern hair salon with styling chairs and mirrors',SCENE],
  grocer:['a small greengrocer shop front with fruit and vegetable crates',SCENE],
  bookshop:['interior of a cozy bookshop with shelves full of books',SCENE],
  car_park:['a multi-storey car park full of parked cars',SCENE],
  square:['a wide open city square with paving and buildings around',SCENE],
  gallery:['interior of an art gallery with framed paintings on white walls',SCENE],
  kiosk:['a small street newspaper and snacks kiosk stand',SCENE],
  chemist:['a pharmacy chemist shop interior with shelves of medicine',SCENE],
  petrol_station:['a petrol gas station with fuel pumps',SCENE],
  tower:['a tall stone tower structure against the sky',SCENE],
  palace:['a grand ornate royal palace building exterior',SCENE],
  skyscraper:['a tall modern glass skyscraper against blue sky',SCENE],
  monument:['a large stone historic monument in a plaza',SCENE],
  fountain:['an ornate water fountain in a city square',OBJ],
  statue:['a bronze statue of a person on a stone pedestal',OBJ],
  factory:['an industrial factory building with chimneys, exterior',SCENE],
  castle:['a medieval stone castle with towers on a hill',SCENE],
  harbour:['a harbour with boats moored and calm water',SCENE],
  crossing:['a pedestrian zebra crossing on a city street',SCENE],
  roundabout:['an aerial view of a road roundabout with cars',SCENE],
  pavement:['a clean city sidewalk pavement along a street',SCENE],
  junction:['a road junction where several streets meet, aerial',SCENE],
  valley:['a green valley between two mountains',SCENE],
  desert:['a vast sandy desert with dunes under blue sky',SCENE],
  waterfall:['a tall waterfall cascading over rocks into a pool',SCENE],
  cave:['the entrance of a rocky cave',SCENE],
  cliff:['a steep rocky sea cliff by the ocean',SCENE],
  field:['a wide green open grassy field under blue sky',SCENE],
  stream:['a small clear stream flowing over rocks in a forest',SCENE],
  nest:['a bird nest with eggs on a tree branch',OBJ],
  // феълҳо (амал)
  comb:['a person combing their hair with a comb',PERSON],
  shave:['a man shaving his face with a razor',PERSON],
  iron:['a person ironing a shirt with a steam iron',PERSON],
  sweep:['a person sweeping the floor with a broom',PERSON],
  dust:['a person dusting furniture with a cloth',PERSON],
  vacuum:['a person vacuuming the carpet with a vacuum cleaner',PERSON],
  mop:['a person mopping the floor with a mop',PERSON],
  jog:['a person jogging outdoors on a path',PERSON],
  stretch:['a person stretching their arms exercising',PERSON],
  boil:['water boiling in a pot on a stove',OBJ],
  fry:['food frying in a frying pan on a stove',OBJ],
  bake:['bread baking in an open oven',OBJ],
  roast:['a roast chicken cooking in an oven',OBJ],
  chop:['a person chopping vegetables on a cutting board with a knife',OBJ],
  peel:['a person peeling a potato with a peeler',OBJ],
  slice:['a person slicing bread with a knife on a board',OBJ],
  stir:['a person stirring soup in a pot with a wooden spoon',OBJ],
  pour:['pouring water from a jug into a glass',OBJ],
  sunbathe:['a person sunbathing on a beach towel in the sun',PERSON],
  hike:['a hiker walking on a mountain trail with a backpack',PERSON],
  camp:['a camping tent set up in a forest clearing',SCENE],
  dive:['a scuba diver swimming underwater in blue sea',PERSON],
  // бадан
  beard:['a close up of a man with a full beard',PERSON],
  moustache:['a close up of a man with a moustache',PERSON],
  shoulder:['a close up of a human shoulder',OBJ],
  knee:['a close up of a human knee',OBJ],
  ankle:['a close up of a human ankle and foot',OBJ],
  elbow:['a close up of a human elbow, bent arm',OBJ],
  wrist:['a close up of a human wrist and hand',OBJ],
  chest:['a human upper chest torso',OBJ],
  throat:['a close up of a persons neck and throat',OBJ],
  chin:['a close up of a human chin and jaw',OBJ],
  forehead:['a close up of a human forehead and eyebrows',OBJ],
  // касалӣ/аломат
  bruise:['a purple bruise on human skin',OBJ],
  wound:['a small cut wound on skin with a bandage nearby',OBJ],
  sling:['an arm in a medical support sling',PERSON],
  ointment:['a tube of medical ointment cream',OBJ],
  injection:['a medical syringe injection needle',OBJ],
  // хӯрок/компонент
  flour:['a pile of white flour with a wooden scoop',OBJ],
  oil:['a glass bottle of cooking oil',OBJ],
  yeast:['a small pile of dry baking yeast granules',OBJ],
  sauce:['a bowl of red tomato sauce',OBJ],
  ginger:['a fresh ginger root',OBJ],
  spice:['several small piles of colorful ground spices',OBJ],
  honey:['a jar of golden honey with a honey dipper',OBJ],
  dough:['a ball of raw bread dough on a floured surface',OBJ],
  herb:['a bunch of fresh green herbs',OBJ],
  vinegar:['a glass bottle of vinegar',OBJ],
  starter:['a small appetizer starter dish on a plate',OBJ],
  dessert:['a sweet dessert cake slice on a plate',OBJ],
  dish:['a full plate of cooked food, a main dish',OBJ],
  branch:['a tree branch with green leaves',OBJ],
  root:['plant roots with soil',OBJ],
  seed:['a small pile of plant seeds',OBJ],
  insect:['a close up macro of a colorful insect on a leaf',OBJ],
  butterfly:['a colorful butterfly on a flower',OBJ],
  bee:['a honeybee on a yellow flower',OBJ],
  feather:['a single bird feather',OBJ],
};

// шаблони умумӣ барои объектҳои содда
const GENERIC_OBJ={
  alarm:'an alarm clock', towel:'a folded bath towel', toothbrush:'a single toothbrush',
  soap:'a bar of soap', shampoo:'a bottle of shampoo', bin:'a rubbish bin',
  candle:'a lit candle', blanket:'a folded soft blanket', vitamin:'a bottle of vitamin pills',
  fridge:'a modern refrigerator', oven:'a kitchen oven', stove:'a kitchen stove with burners',
  kettle:'an electric kettle', saucepan:'a metal saucepan with a lid',
  frying_pan:'a black frying pan', bowl:'a ceramic bowl', jug:'a glass water jug',
  tray:'a serving tray', flight:'an airplane flying in the sky',
  luggage:'a stack of travel luggage suitcases', suitcase:'a travel suitcase',
  handbag:'a leather handbag', visa:'a passport with a visa stamp page',
  luggage_claim:'an airport luggage claim carousel with bags',
  boarding_pass:'an airplane boarding pass ticket', lift:'an open elevator lift',
  pillow:'a soft white pillow', souvenir:'small travel souvenir gifts',
  postcard:'a travel postcard', signpost:'a wooden directional signpost',
  traffic_lights:'a traffic light showing red', underground:'an underground metro train',
  tram:'a city tram on rails', ticket_machine:'a ticket vending machine',
  motorway:'a wide multi-lane motorway highway', printer:'an office printer',
  painting:'a framed painting on an easel', drawing:'a pencil drawing on paper',
  chess:'a chess board with pieces', cards:'a fan of playing cards',
  cartoon:'a colorful cartoon drawing on a screen', novel:'an open novel book',
  magazine:'a glossy magazine', basketball:'an orange basketball',
  volleyball:'a white volleyball', boxing:'red boxing gloves',
  skiing:'skis and ski poles on snow', skating:'a pair of ice skates',
  climbing:'rock climbing equipment and rope', wrestling:'a wrestling mat arena',
  gymnastics:'gymnastics rings in a gym', guitar:'an acoustic guitar',
  piano:'a grand piano', drums:'a drum kit set', violin:'a violin with a bow',
  theatre:'an empty theatre stage with red curtains', puzzle:'a jigsaw puzzle pieces',
  laptop:'an open laptop computer', screen:'a computer monitor screen',
  keyboard:'a computer keyboard', charger:'a phone charger cable and plug',
  battery:'a set of batteries', headphones:'a pair of headphones',
  speaker:'a bluetooth speaker', webcam:'a webcam camera', cable:'coiled electric cables',
  thunder:'a dramatic thunderstorm cloud', lightning:'a lightning bolt in a dark sky',
  rainbow:'a colorful rainbow over a green field', shower:'rain shower falling',
  breeze:'grass and trees gently blowing in a breeze',
  rubbish:'a pile of garbage rubbish bags', plastic:'plastic bottles and waste',
  planet:'planet Earth in space', wedding:'a wedding ceremony with bride and groom',
  birth:'a newborn baby in a blanket', graduation:'a graduate in cap and gown',
  ceremony:'a formal ceremony with an audience', cheque:'a blank bank cheque',
  banknote:'a stack of paper banknotes', purse:'a small coin purse',
  queue:'a line of people queuing', trolley:'a shopping trolley cart',
  label:'a blank price label tag', counter:'a shop checkout counter',
  voucher:'a discount voucher coupon', gardening:'gardening tools and plants in soil',
  fishing:'a fishing rod by a lake', knitting:'knitting needles with wool yarn',
  cooking:'cooking pots on a stove with steam', cycling:'a bicycle on a road',
  recipe:'an open recipe book with a dish', sunset:'a beautiful orange sunset over the sea',
  photography:'a professional camera on a tripod',
};

const rows=[]; let seed=5000; const skipped=[];
const seen=new Set();
function add(word, prompt, style){
  const k=norm(word);
  if(seen.has(k))return; seen.add(k);
  const full=style+prompt;
  const url=`https://image.pollinations.ai/prompt/${encodeURIComponent(full)}?width=1024&height=1024&nologo=true&seed=${seed++}&model=flux`;
  rows.push(`${k}\t${url}`);
}
const all=[...c.concrete_noun,...c.people_job,...c.place,...c.animal_food,...c.body,...c.verb];
for(const word of all){
  if(DROP.has(word))continue;
  const k=norm(word);
  if(SPECIAL[k]){ add(word,SPECIAL[k][0],SPECIAL[k][1]); continue; }
  if(GENERIC_OBJ[k]){ add(word,'a real '+GENERIC_OBJ[k],OBJ); continue; }
  skipped.push(word);
}
writeFileSync(new URL('./_a2-img-urls.tsv',import.meta.url),rows.join('\n')+'\n');
console.log('TSV тайёр:',rows.length,'расм');
if(skipped.length)console.log('\nбе промпт ('+skipped.length+'):',skipped.join(', '));
