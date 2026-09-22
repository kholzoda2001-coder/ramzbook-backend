const fs = require('fs');
let code = fs.readFileSync('prisma/_de-images.mjs', 'utf8');

const additional = `
  'der Körper': ['a full human body silhouette, anatomical model, medical style', SCENE],
  'der Kopf': ['a human head in profile, detailed drawing', SCENE],
  'das Gesicht': ['a human face looking forward', SCENE],
  'das Auge': ['a close up of a human eye with blue iris', SCENE],
  'das Ohr': ['a close up of a human ear', SCENE],
  'die Nase': ['a close up of a human nose', SCENE],
  'der Mund': ['a close up of a human mouth with lips', SCENE],
  'der Zahn': ['a single clean white tooth, medical style', SCENE],
  'der Hals': ['a human neck and throat area', SCENE],
  'der Rücken': ['a human back, anatomical drawing', SCENE],
  'der Bauch': ['a human stomach area, midriff', SCENE],
  'der Arm': ['a human arm showing muscles', SCENE],
  'die Hand': ['a human hand with five fingers open', SCENE],
  'der Finger': ['a close up of a single human pointing finger', SCENE],
  'das Bein': ['a human leg, standing', SCENE],
  'der Fuß': ['a human foot, bare', SCENE],
  'die Gesundheit': ['a glowing green cross symbol with a heart, health concept', SCENE],
  'die Schmerzen': ['a person holding their head in pain, red glowing pain area', SCENE],
  'das Fieber': ['a thermometer showing high temperature next to a sweating face', SCENE],
  'der Husten': ['a person coughing into their hand, illustration', SCENE],
  'der Schnupfen': ['a person blowing their nose into a tissue', SCENE],
  'der Arzt': ['a male doctor in a white coat with a stethoscope', SCENE],
  'die Ärztin': ['a female doctor in a white coat with a stethoscope', SCENE],
  'die Apotheke': ['a pharmacy building with a green cross sign', SCENE],
  'das Medikament': ['a bottle of medicine and some pills', SCENE],
  'die Tablette': ['a white round pill on a blue background', SCENE],
  'der Termin': ['a calendar page with a red circle on a date, appointment', SCENE],
`;

code = code.replace(/const P = \{/, 'const P = {' + additional);
fs.writeFileSync('prisma/_de-images.mjs', code);
