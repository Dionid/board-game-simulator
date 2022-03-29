export const LamdielUMDBData = {
  hero: {
    name: 'Lamdiel',
    isRanged: true,
    hp: 15,
    move: 2,
    specialAbility: 'You are starting with 1 illusion on field.\n\nChoose one mental disorder (MD).\n',
  },
  sidekick: {
    name: 'Illusion',
    isRanged: true,
    hp: null,
    quantity: 2,
    quote: null,
  },
  appearance: {
    borderColour: '#4919b8',
    cardbackUrl: 'https://i.playground.ru/i/news/60889/icon.jpg?600xauto',
    highlightColour: '#a071e5',
    isPNP: false,
    patternName: 'Jigsaw',
  },
  cards: [
    {
      title: 'VAMPIRE KISS',
      type: 'versatile',
      characterName: 'ANY',
      value: 3,
      boost: 3,
      basicText: 'Cannot be canceled',
      immediateText: '',
      duringText: 'For each damage dealt, restore 1 heath.',
      afterText: '',
      imageUrl: '',
      quantity: 3,
    },
    {
      title: 'TRIPLE LAYER OF FEAR',
      type: 'defence',
      characterName: 'ANY',
      value: 0,
      boost: 3,
      basicText: '',
      immediateText:
        'If printed attack value x3 is bigger your health, than ignore attack card value and effect. If not, take x3 damage.',
      duringText: '',
      afterText: '',
      imageUrl: '',
      quantity: 2,
    },
    {
      title: 'Madness',
      type: 'scheme',
      characterName: 'ANY',
      value: null,
      boost: 2,
      basicText:
        "Choose opponent and he must attack his alias or himself. If he can't or wont, you can discard 2 cards from his hand.",
      immediateText: null,
      duringText: null,
      afterText: null,
      imageUrl: '',
      quantity: 2,
    },
    {
      title: 'You are not existed',
      type: 'versatile',
      characterName: 'ANY',
      value: 3,
      boost: 2,
      basicText: '',
      immediateText: '',
      duringText: '',
      afterText:
        'If you won, take your opponent of board till his end of the turn. After that opponent may appear in zone he disappeared.\n',
      imageUrl: '',
      quantity: 2,
    },
    {
      title: 'Who AM I?',
      type: 'scheme',
      characterName: 'ANY',
      value: null,
      boost: 1,
      basicText: 'Create 1 illusion near you or illusion. You can swap places with it.',
      immediateText: null,
      duringText: null,
      afterText: null,
      imageUrl: '',
      quantity: 3,
    },
    {
      title: "I'm NOT EXISTED",
      type: 'versatile',
      characterName: 'ANY',
      value: 3,
      boost: 1,
      basicText: '',
      immediateText: '',
      duringText:
        'remove yourself from board, till next turn. Return near yourself oillusions or in zone you disappeared. ',
      afterText: '',
      imageUrl: '',
      quantity: 2,
    },
    {
      title: 'you imagined it',
      type: 'defence',
      characterName: 'ANY',
      value: 2,
      boost: 1,
      basicText: '',
      immediateText: 'swap places with illusion, now illusion is defender.',
      duringText: '',
      afterText: '',
      imageUrl: '',
      quantity: 2,
    },
    {
      title: 'We are the same',
      type: 'attack',
      characterName: 'ANY',
      value: 6,
      boost: 1,
      basicText: '',
      immediateText: '',
      duringText: 'You can remove any amount illusions from map. Add +3 for each illusion removed',
      afterText: '',
      imageUrl: '',
      quantity: 2,
    },
    {
      title: 'Open your mind',
      type: 'scheme',
      characterName: 'ANY',
      value: null,
      boost: 1,
      basicText: 'Opponent must discard card or you can look at them',
      immediateText: null,
      duringText: null,
      afterText: null,
      imageUrl: '',
      quantity: 3,
    },
    {
      title: "Don't LIE TO ME",
      type: 'defence',
      characterName: 'ANY',
      value: 3,
      boost: 1,
      basicText:
        'Play this card open. Opponent must say the value of his card and you must guess if he is lying or not. If you guessed correctly, than his card value and effect are ignored.',
      immediateText: '',
      duringText: '',
      afterText: '',
      imageUrl: '',
      quantity: 3,
    },
    {
      title: 'CORRUPT the future',
      type: 'versatile',
      characterName: 'ANY',
      value: 4,
      boost: 2,
      basicText: '',
      immediateText: '',
      duringText: '',
      afterText:
        'If you won, look at 3 cards from opponent deck, discard one and place other two on top of it in any order.',
      imageUrl: '',
      quantity: 2,
    },
    {
      title: 'prediction',
      type: 'defence',
      characterName: 'ANY',
      value: 0,
      boost: 1,
      basicText: '',
      immediateText:
        'You can change this card to any other defense or hybrid card from your hand. Return this card in your hand.',
      duringText: '',
      afterText: '',
      imageUrl: '',
      quantity: 1,
    },
    {
      title: 'Ambush',
      type: 'attack',
      characterName: 'ANY',
      value: 2,
      boost: 1,
      basicText: '',
      immediateText: '',
      duringText: "Your opponent discards 1 random card. Add its BOOST value to this card's attack value.",
      afterText: '',
      imageUrl: '',
      quantity: 3,
    },
  ],
  ruleCards: [
    {
      content:
        "You can place illusion instead of yourself on starting cell.\n\nIllusions can't attack.\n\nYou or illusions can swap places with other illusions, if you are adjacented to them (not an action).\n",
      title: 'Illusions',
    },
    {
      content: '-1 to value of opponent defence card for each illusion in opponent zone.',
      title: 'MD: PARANOIA',
    },
    {
      content: 'If there is no illusions gain +1 action.',
      title: 'MD: HyperActivity',
    },
    {
      content: 'If there is no illusions gain +1 movement.',
      title: 'MD: Hysteria',
    },
    {
      content: 'Start with 2 illusions and max pool is 4 illusions.',
      title: 'MD: SPLIT',
    },
  ],
  extraCharacters: [],
};

const DekuUBDBData = {
  name: '',
  hero: {
    name: 'Deku',
    isRanged: false,
    hp: 14,
    move: 3,
    specialAbility:
      'When you place your attack card, you may SMASH it. When you SMASH an attack, increase your card’s value by 3 and gain 1 INJURY after the attack.\n',
  },
  sidekick: {
    name: 'Sidekick',
    isRanged: false,
    hp: null,
    quantity: 0,
    quote: '"Go beyond. PLUS ULTRA!"\n                                                        -All Might\n\n',
  },
  appearance: {
    borderColour: '#588787',
    cardbackUrl: 'https://i.imgur.com/XRQgioY.jpg',
    highlightColour: '#67daa1',
    isPNP: false,
    patternName: '',
  },
  cards: [
    {
      title: 'Controlled Smash',
      type: 'attack',
      characterName: 'DEKU',
      value: 3,
      boost: 2,
      basicText: '',
      immediateText: '',
      duringText:
        'If you declared a SMASH for this attack you may increase its value by 2 instead of 3. If you do, do not gain 1 INJURY.',
      afterText: '',
      imageUrl: 'https://i.imgur.com/M742Q6m.jpg',
      quantity: 2,
    },
    {
      title: 'Heroic Struggle',
      type: 'attack',
      characterName: 'DEKU',
      value: 4,
      boost: 2,
      basicText: '',
      immediateText: '',
      duringText: '',
      afterText: 'If you won the combat, draw 2 cards. If you lost the combat, discard 1 card.',
      imageUrl: 'https://i.imgur.com/gZFLUi4.png',
      quantity: 3,
    },
    {
      title: 'Heroic Grit',
      type: 'versatile',
      characterName: 'DEKU',
      value: 3,
      boost: 2,
      basicText: '',
      immediateText: '',
      duringText: '',
      afterText: 'If you lost the combat, draw 1 card.',
      imageUrl: 'https://i.imgur.com/lVDZvEn.jpg',
      quantity: 3,
    },
    {
      title: 'Heroic Spirit',
      type: 'defence',
      characterName: 'DEKU',
      value: 1,
      boost: 2,
      basicText: '',
      immediateText: '',
      duringText: "Increase this card's value by 1 for each INJURY you have.",
      afterText: 'Draw 1 card and Deku recovers 1 health.',
      imageUrl: 'https://i.imgur.com/87bfiRW.jpg',
      quantity: 2,
    },
    {
      title: 'Shoot Style',
      type: 'versatile',
      characterName: 'DEKU',
      value: 3,
      boost: 2,
      basicText: '',
      immediateText: '',
      duringText: '',
      afterText:
        'Move Deku up to 2 spaces. He may move through opposing fighters. Deal 1 damage to each opposing fighter adjacent to Deku.',
      imageUrl: 'https://i.imgur.com/RN6XZMk.png',
      quantity: 3,
    },
    {
      title: 'Jet Set Run',
      type: 'scheme',
      characterName: 'DEKU',
      value: null,
      boost: 3,
      basicText: 'Move Deku up to 5 spaces. He may move through opposing fighters. ',
      immediateText: null,
      duringText: null,
      afterText: null,
      imageUrl: 'https://i.imgur.com/2rorIYl.jpg',
      quantity: 2,
    },
    {
      title: 'Plus Ultra',
      type: 'scheme',
      characterName: 'DEKU',
      value: null,
      boost: 1,
      basicText:
        'Gain each effect in order if you have at least that many INJURY:\n4) Deku recovers 2 health.\n3) Lose 1 INJURY.\n2) Gain 1 action.\n1) Draw 1 card.',
      immediateText: null,
      duringText: null,
      afterText: null,
      imageUrl: 'https://i.imgur.com/VUPbcem.jpg',
      quantity: 2,
    },
    {
      title: 'Delaware Smash',
      type: 'scheme',
      characterName: 'DEKU',
      value: null,
      boost: 2,
      basicText: 'Choose 1 of Deku’s zones. Deal 2 damage to each opposing fighter in that zone. Deku takes 1 damage.',
      immediateText: null,
      duringText: null,
      afterText: null,
      imageUrl: 'https://i.imgur.com/zDVRXV1.jpg',
      quantity: 2,
    },
    {
      title: 'Detroit Smash',
      type: 'attack',
      characterName: 'DEKU',
      value: 6,
      boost: 3,
      basicText: 'This card’s effects cannot be canceled.',
      immediateText: '',
      duringText: 'If your opponent played a card, they may BOOST it.',
      afterText: 'Move the opposing fighter up to 5 spaces.',
      imageUrl: 'https://i.imgur.com/ZtcbTkZ.png',
      quantity: 2,
    },
    {
      title: 'Delaware Detroit Smash',
      type: 'attack',
      characterName: 'DEKU',
      value: 4,
      boost: 3,
      basicText: '',
      immediateText: '',
      duringText: "You may discard 1 card to ignore Deku's Set Backs.",
      afterText: 'Move the opposing fighter up to 5 spaces. ',
      imageUrl: 'https://i.imgur.com/GX9uU6w.gif',
      quantity: 2,
    },
    {
      title: 'Feint',
      type: 'versatile',
      characterName: 'DEKU',
      value: 2,
      boost: 2,
      basicText: '',
      immediateText: "Cancel all effects on your opponent's card.",
      duringText: '',
      afterText: '',
      imageUrl: 'https://i.imgur.com/V4Ncul2.png',
      quantity: 3,
    },
    {
      title: 'Momentous Shift',
      type: 'versatile',
      characterName: 'DEKU',
      value: 3,
      boost: 1,
      basicText: '',
      immediateText: '',
      duringText: "If your fighter started this turn in a different space, this card's value is 5 instead.",
      afterText: '',
      imageUrl: 'https://i.imgur.com/kLc0Rjz.jpg',
      quantity: 2,
    },
    {
      title: 'Skirmish',
      type: 'versatile',
      characterName: 'DEKU',
      value: 4,
      boost: 1,
      basicText: '',
      immediateText: '',
      duringText: '',
      afterText: 'If you won the combat, choose one of the fighters in the combat and move them up to 2 spaces.',
      imageUrl: 'https://i.imgur.com/rMISQbP.png',
      quantity: 2,
    },
  ],
  ruleCards: [
    {
      content:
        'Deku receives Set Backs based on how much INJURY he has gained. \n1: -1 Attack.\n2: -1 Attack and -1 MOVE.\n3: -2 Attack, -1 MOVE and -1 Defense.\n4: -2 Attack, -2 MOVE, -1 Defense.\n5: Deku is defeated.\n',
      title: 'Injury Set Backs',
    },
  ],
  extraCharacters: [],
};

export const UMDB = {
  BA_w: LamdielUMDBData,
  vrKW: DekuUBDBData,
};
