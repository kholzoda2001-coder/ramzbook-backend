const KEY = process.env.ADMIN_API_KEY;
const EXERCISE_ID = 'cmqpfwefu000npxxbltlznzmu'; // Module 3 "Такрори Модул" review

const newQuestions = [
  {
    question: "What does 'Daughter' mean?",
    questionTranslated: "«Daughter» чӣ маъно дорад?",
    options: ["Писар", "Духтар", "Кӯдак"],
    correctIndex: 1,
    order: 2,
  },
  {
    question: "Translate 'Оила':",
    questionTranslated: "Тарҷума кунед: «Оила»",
    options: ["Family", "Friend", "Group"],
    correctIndex: 0,
    order: 3,
  },
  {
    question: "What does 'Cousin' mean?",
    questionTranslated: "«Cousin» чӣ маъно дорад?",
    options: ["Ҷиян", "Хола", "Амакбача / Холабача"],
    correctIndex: 2,
    order: 4,
  },
  {
    question: "Translate 'Бегона':",
    questionTranslated: "Тарҷума кунед: «Бегона»",
    options: ["Person", "Stranger", "Group"],
    correctIndex: 1,
    order: 5,
  },
  {
    question: "What does 'Elderly' mean?",
    questionTranslated: "«Elderly» чӣ маъно дорад?",
    options: ["Наврас", "Калонсол", "Куҳансол"],
    correctIndex: 2,
    order: 6,
  },
];

async function main() {
  if (!KEY) throw new Error('ADMIN_API_KEY not set in env');
  for (const q of newQuestions) {
    const res = await fetch('https://admin.ramz.tj/api/admin/comprehensions/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-api-key': KEY },
      body: JSON.stringify({ exerciseId: EXERCISE_ID, ...q }),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error('FAILED:', q.question, data);
    } else {
      console.log('Added:', q.question, '->', data.question?.id);
    }
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
