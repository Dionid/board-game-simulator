import { UUID } from '../../../branded-types';

export type SidekickId = UUID & { readonly SidekickId: unique symbol };
export const SidekickId = {
  ofString: (value: string): SidekickId => {
    return UUID.ofString(value) as SidekickId;
  },
  new: (): SidekickId => {
    return SidekickId.ofString(UUID.new());
  },
};

export type HeroId = UUID & { readonly HeroId: unique symbol };
export const HeroId = {
  ofString: (value: string): HeroId => {
    return UUID.ofString(value) as HeroId;
  },
  new: (): HeroId => {
    return HeroId.ofString(UUID.new());
  },
};

export type SetId = UUID & { readonly SetId: unique symbol };
export const SetId = {
  ofString: (value: string): SetId => {
    return UUID.ofString(value) as SetId;
  },
  new: (): SetId => {
    return SetId.ofString(UUID.new());
  },
};

export const LambdielHeroSet = {
  id: SetId.ofString('c720d8f8-3393-44e0-86b1-595b4d47bfb1'),
  hero: {
    id: HeroId.ofString('539e6e60-e435-4ab3-a704-2838a327bf5f'),
    name: 'Lamdiel',
    isRanged: true,
    hp: 15,
    move: 2,
    specialAbility: 'You are starting with 1 illusion on field.\n\nChoose one mental disorder (MD).\n',
  },
  sidekick: {
    id: SidekickId.ofString('21acf4a2-4def-427b-930e-913f21aac5b6'),
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

export const HeroesSets = {
  [LambdielHeroSet.id]: LambdielHeroSet,
};
