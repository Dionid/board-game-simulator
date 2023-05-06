var __read =
  (this && this.__read) ||
  function (o, n) {
    var m = typeof Symbol === 'function' && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o),
      r,
      ar = [],
      e;
    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    } catch (error) {
      e = { error: error };
    } finally {
      try {
        if (r && !r.done && (m = i['return'])) m.call(i);
      } finally {
        if (e) throw e.error;
      }
    }
    return ar;
  };
var _a;
import { UUID } from '../../../branded-types';
export var MapId = {
  ofString: function (value) {
    return UUID.ofString(value);
  },
  new: function () {
    return MapId.ofString(UUID.new());
  },
};
export var SidekickId = {
  ofString: function (value) {
    return UUID.ofString(value);
  },
  new: function () {
    return SidekickId.ofString(UUID.new());
  },
};
export var HeroId = {
  ofString: function (value) {
    return UUID.ofString(value);
  },
  new: function () {
    return HeroId.ofString(UUID.new());
  },
};
export var RuleCardId = {
  ofString: function (value) {
    return UUID.ofString(value);
  },
  new: function () {
    return RuleCardId.ofString(UUID.new());
  },
};
export var HealthMeterId = {
  ofString: function (value) {
    return UUID.ofString(value);
  },
  new: function () {
    return HealthMeterId.ofString(UUID.new());
  },
};
export var CardId = {
  ofString: function (value) {
    return UUID.ofString(value);
  },
  new: function () {
    return CardId.ofString(UUID.new());
  },
};
export var DeckId = {
  ofString: function (value) {
    return UUID.ofString(value);
  },
  new: function () {
    return DeckId.ofString(UUID.new());
  },
};
export var Deck = {
  shuffle: function (deck) {
    var _a;
    var cards = deck.cards;
    for (var i = cards.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      (_a = __read([cards[j], cards[i]], 2)), (cards[i] = _a[0]), (cards[j] = _a[1]);
    }
  },
};
export var SetId = {
  ofString: function (value) {
    return UUID.ofString(value);
  },
  new: function () {
    return SetId.ofString(UUID.new());
  },
};
var LamdielCards = [
  {
    id: CardId.ofString('ecc54a26-c7c3-4487-be9a-a4658cd5a1d1'),
    name: 'Ambush',
    frontImageUrl: '/hero-sets/lamdiel/deck/Ambush.png',
    backImageUrl: '/hero-sets/lamdiel/deck-front-image.png',
    qty: 3,
  },
  {
    id: CardId.ofString('4b742ff5-a511-4c20-8fc8-f9f232fb9393'),
    name: 'Corrupt the future',
    frontImageUrl: '/hero-sets/lamdiel/deck/CORRUPT the future.png',
    backImageUrl: '/hero-sets/lamdiel/deck-front-image.png',
    qty: 2,
  },
  {
    id: CardId.ofString('a32d8176-e24f-4f5f-bd46-bf486507dee8'),
    name: "Don't lie to me",
    frontImageUrl: "/hero-sets/lamdiel/deck/Don't LIE TO ME.svg",
    backImageUrl: '/hero-sets/lamdiel/deck-front-image.png',
    qty: 3,
  },
  {
    id: CardId.ofString('18808b75-8877-4134-99ff-1ff81478733a'),
    name: "I'm not existed",
    frontImageUrl: "/hero-sets/lamdiel/deck/I'm NOT EXISTED.svg",
    backImageUrl: '/hero-sets/lamdiel/deck-front-image.png',
    qty: 2,
  },
  {
    id: CardId.ofString('59d69efe-db9b-4ce4-a635-fa53db1b3acd'),
    name: 'Madness',
    frontImageUrl: '/hero-sets/lamdiel/deck/Madness.png',
    backImageUrl: '/hero-sets/lamdiel/deck-front-image.png',
    qty: 2,
  },
  {
    id: CardId.ofString('aa998da5-a252-48df-b64a-311417a69333'),
    name: 'Open your mind',
    frontImageUrl: '/hero-sets/lamdiel/deck/Open your mind.png',
    backImageUrl: '/hero-sets/lamdiel/deck-front-image.png',
    qty: 3,
  },
  {
    id: CardId.ofString('dedff34f-9c5f-4713-933f-4c0a1f1e4d26'),
    name: 'Triple layer of fear',
    frontImageUrl: '/hero-sets/lamdiel/deck/TRIPLE LAYER OF FEAR.png',
    backImageUrl: '/hero-sets/lamdiel/deck-front-image.png',
    qty: 2,
  },
  {
    id: CardId.ofString('2301816a-d34d-499c-8e6d-0a62d8aa095c'),
    name: 'Vampire kiss',
    frontImageUrl: '/hero-sets/lamdiel/deck/VAMPIRE KISS.png',
    backImageUrl: '/hero-sets/lamdiel/deck-front-image.png',
    qty: 3,
  },
  {
    id: CardId.ofString('6a823a07-cbea-40fb-9640-59a79bad13da'),
    name: 'We are the same',
    frontImageUrl: '/hero-sets/lamdiel/deck/We are the same.png',
    backImageUrl: '/hero-sets/lamdiel/deck-front-image.png',
    qty: 2,
  },
  {
    id: CardId.ofString('22fb091a-36ad-4013-8efe-ede50e7b1890'),
    name: 'Who am I?',
    frontImageUrl: '/hero-sets/lamdiel/deck/Who AM I?.png',
    backImageUrl: '/hero-sets/lamdiel/deck-front-image.png',
    qty: 3,
  },
  {
    id: CardId.ofString('c33c2543-79ca-4b2f-960f-9f90602338ab'),
    name: 'You are not existed',
    frontImageUrl: '/hero-sets/lamdiel/deck/You are not existed.png',
    backImageUrl: '/hero-sets/lamdiel/deck-front-image.png',
    qty: 2,
  },
  {
    id: CardId.ofString('b15fd08f-1499-48a3-ad06-94a4818d0883'),
    name: 'Prediction',
    frontImageUrl: '/hero-sets/lamdiel/deck/prediction.png',
    backImageUrl: '/hero-sets/lamdiel/deck-front-image.png',
    qty: 1,
  },
  {
    id: CardId.ofString('7a6aef33-3f36-4e0b-920d-ff1161f643c3'),
    name: 'You imagined it',
    frontImageUrl: '/hero-sets/lamdiel/deck/you imagined it.png',
    backImageUrl: '/hero-sets/lamdiel/deck-front-image.png',
    qty: 2,
  },
];
export var LamdielHeroSet = {
  id: SetId.ofString('c720d8f8-3393-44e0-86b1-595b4d47bfb1'),
  name: 'Lamdiel (Malkavian) (VTMB)',
  heroes: [
    {
      id: HeroId.ofString('ed185079-11a8-4cbd-b94e-c8d1ceeb985b'),
      name: 'Lamdiel',
      views: [{ url: '/hero-sets/lamdiel/hero-front-image.png' }, { url: '/hero-sets/lamdiel/hero-front-image.png' }],
      qty: 1,
    },
  ],
  sidekicks: [
    {
      id: SidekickId.ofString('15ad2da8-e752-4d7a-992a-2bdf5a04a50f'),
      name: 'Illusion',
      views: [{ url: '/hero-sets/lamdiel/hero-front-image.png' }, { url: '/hero-sets/lamdiel/hero-front-image.png' }],
      qty: 4,
    },
  ],
  extraCards: [],
  healthMeters: [
    {
      id: HealthMeterId.ofString('6e6cbf65-8258-4e0c-9f24-16c23d2fac65'),
      maxValue: 15,
      frontImageUrl: '/hero-sets/lamdiel/health-meter-front-image.png',
      backImageUrl: '/hero-sets/lamdiel/health-meter-front-image.png',
    },
  ],
  ruleCards: [
    {
      id: RuleCardId.ofString('20a0bf9a-1bb5-4683-88f3-0ee066752ff4'),
      frontImageUrl: '/hero-sets/lamdiel/characters/Lamdiel.png',
      backImageUrl: '/hero-sets/lamdiel/deck-front-image.png',
    },
    {
      id: RuleCardId.ofString('1134ef7f-fb81-4264-8c15-adba8f84220f'),
      frontImageUrl: '/hero-sets/lamdiel/rules/Rule card 1.png',
      backImageUrl: '/hero-sets/lamdiel/deck-front-image.png',
    },
    {
      id: RuleCardId.ofString('6418e51b-3869-496c-91f6-c0fc62b98adb'),
      frontImageUrl: '/hero-sets/lamdiel/rules/Rule card 2.png',
      backImageUrl: '/hero-sets/lamdiel/deck-front-image.png',
    },
    {
      id: RuleCardId.ofString('1756fe22-ffe2-46dc-9564-6b6c30e40c67'),
      frontImageUrl: '/hero-sets/lamdiel/rules/Rule card 3.png',
      backImageUrl: '/hero-sets/lamdiel/deck-front-image.png',
    },
    {
      id: RuleCardId.ofString('22c0429a-2072-48bd-bafc-14a6f58e062b'),
      frontImageUrl: '/hero-sets/lamdiel/rules/Rule card 4.png',
      backImageUrl: '/hero-sets/lamdiel/deck-front-image.png',
    },
    {
      id: RuleCardId.ofString('25255ece-8e22-4c32-9721-4c41031756bc'),
      frontImageUrl: '/hero-sets/lamdiel/rules/Rule card 5.png',
      backImageUrl: '/hero-sets/lamdiel/deck-front-image.png',
    },
  ],
  cards: LamdielCards,
  decks: [
    {
      id: DeckId.ofString('e8787182-c89d-4a11-9e48-22acfe96ce0a'),
      frontImageUrl: '/hero-sets/lamdiel/deck-front-image.png',
      cardIds: LamdielCards.map(function (card) {
        return card.id;
      }),
    },
  ],
};
// DEKU
var DekuCards = [
  {
    id: CardId.ofString('867e90cd-c757-4855-be51-36da33970b0f'),
    name: 'Controlled Smash',
    frontImageUrl: '/hero-sets/deku/deck/Controlled Smash.png',
    backImageUrl: '/hero-sets/deku/deck-front-image.png',
    qty: 2,
  },
  {
    id: CardId.ofString('5e91a1ff-34a9-42b9-a820-a3db13694a9c'),
    name: 'Delaware Detroit Smash',
    frontImageUrl: '/hero-sets/deku/deck/Delaware Detroit Smash.png',
    backImageUrl: '/hero-sets/deku/deck-front-image.png',
    qty: 2,
  },
  {
    id: CardId.ofString('1f30b5b7-46d9-44b5-809b-14cd9bff778a'),
    name: 'Delaware Smash',
    frontImageUrl: '/hero-sets/deku/deck/Delaware Smash.png',
    backImageUrl: '/hero-sets/deku/deck-front-image.png',
    qty: 2,
  },
  {
    id: CardId.ofString('2afe96f3-e4d6-419a-ad6a-fc966d7ab3bb'),
    name: 'Detroit Smash',
    frontImageUrl: '/hero-sets/deku/deck/Detroit Smash.png',
    backImageUrl: '/hero-sets/deku/deck-front-image.png',
    qty: 2,
  },
  {
    id: CardId.ofString('957baffb-f569-4ebb-84e2-a6187fee6787'),
    name: 'Feint',
    frontImageUrl: '/hero-sets/deku/deck/Feint.png',
    backImageUrl: '/hero-sets/deku/deck-front-image.png',
    qty: 3,
  },
  {
    id: CardId.ofString('f3ccb855-b60f-4c80-8e85-3407e76c400b'),
    name: 'Heroic Grit',
    frontImageUrl: '/hero-sets/deku/deck/Heroic Grit.png',
    backImageUrl: '/hero-sets/deku/deck-front-image.png',
    qty: 3,
  },
  {
    id: CardId.ofString('feb71b5b-ce58-409f-b126-b1a2c5af27b0'),
    name: 'Heroic Spirit',
    frontImageUrl: '/hero-sets/deku/deck/Heroic Spirit.png',
    backImageUrl: '/hero-sets/deku/deck-front-image.png',
    qty: 2,
  },
  {
    id: CardId.ofString('de40a645-eeb6-4ea1-8239-d7c7a8cba828'),
    name: 'Heroic Struggle',
    frontImageUrl: '/hero-sets/deku/deck/Heroic Struggle.png',
    backImageUrl: '/hero-sets/deku/deck-front-image.png',
    qty: 3,
  },
  {
    id: CardId.ofString('39b4e4c5-7ef3-4edf-a099-74dc884ece41'),
    name: 'Jet Set Run',
    frontImageUrl: '/hero-sets/deku/deck/Jet Set Run.png',
    backImageUrl: '/hero-sets/deku/deck-front-image.png',
    qty: 2,
  },
  {
    id: CardId.ofString('bebc4605-7291-4004-8fd3-7d991913a396'),
    name: 'Momentous Shift',
    frontImageUrl: '/hero-sets/deku/deck/Momentous Shift.png',
    backImageUrl: '/hero-sets/deku/deck-front-image.png',
    qty: 2,
  },
  {
    id: CardId.ofString('8c395dee-0f78-4298-959a-bf755a4811b6'),
    name: 'Plus Ultra',
    frontImageUrl: '/hero-sets/deku/deck/Plus Ultra.png',
    backImageUrl: '/hero-sets/deku/deck-front-image.png',
    qty: 2,
  },
  {
    id: CardId.ofString('6b6a817b-2d04-4aba-a638-2ed45cf81ea3'),
    name: 'Shoot Style',
    frontImageUrl: '/hero-sets/deku/deck/Shoot Style.png',
    backImageUrl: '/hero-sets/deku/deck-front-image.png',
    qty: 2,
  },
  {
    id: CardId.ofString('ecee361c-7896-495e-886a-85206fa9791b'),
    name: 'Skirmish',
    frontImageUrl: '/hero-sets/deku/deck/Skirmish.png',
    backImageUrl: '/hero-sets/deku/deck-front-image.png',
    qty: 2,
  },
];
export var DekuHeroSet = {
  id: SetId.ofString('4fb0503c-7266-4cce-a65e-214661188b37'),
  name: 'Deku',
  heroes: [
    {
      id: HeroId.ofString('1cab25fa-e29f-43fe-84d0-adf787589fe5'),
      name: 'Deku',
      views: [{ url: '/hero-sets/deku/hero-front-image.png' }],
      qty: 1,
    },
  ],
  sidekicks: [],
  extraCards: [],
  healthMeters: [
    {
      id: HealthMeterId.ofString('a59652ab-a4fb-49cf-8d8d-dd31223bc000'),
      maxValue: 14,
      frontImageUrl: '/hero-sets/deku/health-meter-front-image.png',
      backImageUrl: '/hero-sets/deku/health-meter-front-image.png',
    },
  ],
  ruleCards: [
    {
      id: RuleCardId.ofString('3d95497c-6143-4f0c-b952-7e94c052aa11'),
      frontImageUrl: '/hero-sets/deku/characters/Deku.png',
      backImageUrl: '/hero-sets/deku/deck-front-image.png',
    },
    {
      id: RuleCardId.ofString('d2dd2f67-5007-4c8f-b11a-84dfd05835b8'),
      frontImageUrl: '/hero-sets/deku/rules/Rule card 1.png',
      backImageUrl: '/hero-sets/deku/deck-front-image.png',
    },
  ],
  cards: DekuCards,
  decks: [
    {
      id: DeckId.ofString('aff8de89-8c93-4fae-8969-b839da72c09e'),
      frontImageUrl: '/hero-sets/deku/deck-front-image.png',
      cardIds: DekuCards.map(function (card) {
        return card.id;
      }),
    },
  ],
};
export var HeroSets = ((_a = {}), (_a[LamdielHeroSet.id] = LamdielHeroSet), (_a[DekuHeroSet.id] = DekuHeroSet), _a);
