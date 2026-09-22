export const COMPREHENSIONS = [
  {
    slot: 'reading',
    skillType: 'reading',
    xpReward: 20,
    kind: 'text',
    emoji: '📖',
    lessonTitle: 'Ein Ausflug',
    lessonTitleTranslated: 'Саёҳат',
    title: 'Ein Ausflug in die Natur',
    titleTranslated: 'Саёҳат ба табиат',
    passage: 'Letztes Wochenende war das Wetter sehr schön. Die Sonne hat geschienen und es war warm. Meine Familie und ich sind in den Wald gefahren. Wir haben große Bäume und schöne Blumen gesehen. Mein Hund ist im Wald gelaufen und war sehr glücklich. Wir haben ein Picknick gemacht und leckeres Essen gegessen. Am Nachmittag sind wir wieder nach Hause gefahren. Ich war am Abend sehr müde, aber es war ein toller Tag.',
    passageTranslated: 'Истироҳати гузашта обу ҳаво хеле зебо буд. Офтоб медурахшид ва ҳаво гарм буд. Оилаи ман ва ман ба ҷангал рафтем. Мо дарахтони калон ва гулҳои зеборо дидем. Саги ман дар ҷангал давид ва хеле хушбахт буд. Мо пикник кардем ва хӯроки бомазза хӯрдем. Баъд аз нисфирӯзӣ мо дубора ба хона рафтем. Ман бегоҳ хеле хаста будам, аммо ин як рӯзи олӣ буд.',
    questions: [
      {
        question: 'Wie war das Wetter am Wochenende?',
        questionTranslated: 'Обу ҳаво дар рӯзҳои истироҳат чӣ гуна буд?',
        options: ['Es hat geregnet.', 'Es war schön und warm.', 'Es hat geschneit.'],
        answer: 'Es war schön und warm.'
      },
      {
        question: 'Wohin ist die Familie gefahren?',
        questionTranslated: 'Оила ба куҷо рафт?',
        options: ['In die Stadt.', 'In den Wald.', 'Ans Meer.'],
        answer: 'In den Wald.'
      },
      {
        question: 'Was hat die Familie gemacht?',
        questionTranslated: 'Оила чӣ кор кард?',
        options: ['Sie haben ein Picknick gemacht.', 'Sie haben ferngesehen.', 'Sie haben eingekauft.'],
        answer: 'Sie haben ein Picknick gemacht.'
      },
      {
        question: 'Wer war sehr glücklich?',
        questionTranslated: 'Кӣ хеле хушбахт буд?',
        options: ['Die Katze.', 'Der Hund.', 'Der Vogel.'],
        answer: 'Der Hund.'
      },
      {
        question: 'Wie hat sich die Person am Abend gefühlt?',
        questionTranslated: 'Шахс бегоҳ худро чӣ гуна ҳис кард?',
        options: ['Sie war wütend.', 'Sie war traurig.', 'Sie war müde.'],
        answer: 'Sie war müde.'
      }
    ]
  },
  {
    slot: 'listening',
    skillType: 'listening',
    xpReward: 20,
    kind: 'audio',
    emoji: '🎧',
    lessonTitle: 'Wetterbericht',
    lessonTitleTranslated: 'Маълумот дар бораи обу ҳаво',
    title: 'Das Wetter für morgen',
    titleTranslated: 'Обу ҳаво барои фардо',
    passage: 'Guten Morgen! Hier ist das Wetter für morgen. Im Norden regnet es viel und es ist kalt. Bringen Sie einen Regenschirm mit! Im Süden scheint die Sonne und es ist sehr warm, perfekt für einen Ausflug. Im Westen gibt es starken Wind und im Osten schneit es ein bisschen am Abend. Bitte fahren Sie vorsichtig!',
    passageTranslated: 'Субҳ ба хайр! Ин маълумот дар бораи обу ҳаво барои фардост. Дар шимол борони зиёд меборад ва хунук аст. Бо худ чатр гиред! Дар ҷануб офтоб медурахшад ва ҳаво хеле гарм аст, ки барои саёҳат беҳтарин аст. Дар ғарб шамоли сахт мевазад ва дар шарқ бегоҳӣ каме барф меборад. Лутфан, боэҳтиёт мошин ронед!',
    questions: [
      {
        question: 'Wie ist das Wetter im Norden?',
        questionTranslated: 'Обу ҳаво дар шимол чӣ гуна аст?',
        options: ['Es regnet und ist kalt.', 'Es schneit.', 'Die Sonne scheint.'],
        answer: 'Es regnet und ist kalt.'
      },
      {
        question: 'Wo scheint die Sonne?',
        questionTranslated: 'Офтоб дар куҷо медурахшад?',
        options: ['Im Westen.', 'Im Süden.', 'Im Osten.'],
        answer: 'Im Süden.'
      },
      {
        question: 'Was passiert im Westen?',
        questionTranslated: 'Дар ғарб чӣ мешавад?',
        options: ['Es ist sehr warm.', 'Es schneit.', 'Es gibt starken Wind.'],
        answer: 'Es gibt starken Wind.'
      },
      {
        question: 'Wann schneit es im Osten?',
        questionTranslated: 'Дар шарқ кай барф меборад?',
        options: ['Am Morgen.', 'Am Nachmittag.', 'Am Abend.'],
        answer: 'Am Abend.'
      }
    ]
  }
];
