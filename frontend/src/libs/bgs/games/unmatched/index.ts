import { UUID } from '../../../branded-types';

export type MapId = UUID & { readonly MapId: unique symbol };
export const MapId = {
  ofString: (value: string): MapId => {
    return UUID.ofString(value) as MapId;
  },
  new: (): MapId => {
    return MapId.ofString(UUID.new());
  },
};

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

export type RuleCardId = UUID & { readonly RuleCardId: unique symbol };
export const RuleCardId = {
  ofString: (value: string): RuleCardId => {
    return UUID.ofString(value) as RuleCardId;
  },
  new: (): RuleCardId => {
    return RuleCardId.ofString(UUID.new());
  },
};

export type HealthMeterId = UUID & { readonly HealthMeterId: unique symbol };
export const HealthMeterId = {
  ofString: (value: string): HealthMeterId => {
    return UUID.ofString(value) as HealthMeterId;
  },
  new: (): HealthMeterId => {
    return HealthMeterId.ofString(UUID.new());
  },
};

export type CardId = UUID & { readonly CardId: unique symbol };
export const CardId = {
  ofString: (value: string): CardId => {
    return UUID.ofString(value) as CardId;
  },
  new: (): CardId => {
    return CardId.ofString(UUID.new());
  },
};

export type DeckId = UUID & { readonly DeckId: unique symbol };
export const DeckId = {
  ofString: (value: string): DeckId => {
    return UUID.ofString(value) as DeckId;
  },
  new: (): DeckId => {
    return DeckId.ofString(UUID.new());
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

const LambdielCards = [
  {
    id: CardId.ofString('ecc54a26-c7c3-4487-be9a-a4658cd5a1d1'),
    name: 'Ambush',
    frontImageUrl:
      'https://2.downloader.disk.yandex.ru/preview/12ea610ca08cf54cb6dddfe490e322317e7b5adcf3e3d7c4badb327bf7768f8e/inf/wQL9iujvlwx4C2uaWvn7dB3jOfmKQgpShDHXBbi_IxlI2I3s2vZ56f10DZ8FC6WE1VZeXUHz-sYE2xE1K-Iadg%3D%3D?uid=59003057&filename=Ambush.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=59003057&tknv=v2&size=2878x1592',
    backImageUrl:
      'https://3.downloader.disk.yandex.ru/preview/b32f55435469dadca59166f79441fa0ac08bee8d00c4bf00a6c7f13467f84aa8/inf/sY9v8fd19q6mgAlsGvQ8kGIK3OUp1KGBZRTVnHUAo32xQ3QrK6lQtL2o3JPyFsXq1NYM0ri-zgZ0PpL9my_RIg%3D%3D?uid=59003057&filename=Screenshot%202022-03-28%20at%2023.40.51.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=59003057&tknv=v2&size=2878x1478',
    qty: 3,
  },
  {
    id: CardId.ofString('4b742ff5-a511-4c20-8fc8-f9f232fb9393'),
    name: 'Corrupt the future',
    frontImageUrl:
      'https://2.downloader.disk.yandex.ru/preview/b5d55687511dcd4d7ab975156195cb3c99765733618aadb6f539291213d1f675/inf/omlSk9A6Y8zLMhu2Cc3Qa6I1M02nI8fxe2INfzx6zMv89esQq9DGc48s2PGYxnFAnNvPlavbfWfEzgTeyXac0A%3D%3D?uid=59003057&filename=CORRUPT%20the%20future.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=59003057&tknv=v2&size=2878x1592',
    backImageUrl:
      'https://3.downloader.disk.yandex.ru/preview/b32f55435469dadca59166f79441fa0ac08bee8d00c4bf00a6c7f13467f84aa8/inf/sY9v8fd19q6mgAlsGvQ8kGIK3OUp1KGBZRTVnHUAo32xQ3QrK6lQtL2o3JPyFsXq1NYM0ri-zgZ0PpL9my_RIg%3D%3D?uid=59003057&filename=Screenshot%202022-03-28%20at%2023.40.51.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=59003057&tknv=v2&size=2878x1478',
    qty: 2,
  },
  {
    id: CardId.ofString('a32d8176-e24f-4f5f-bd46-bf486507dee8'),
    name: "Don't lie to me",
    frontImageUrl:
      'https://4.downloader.disk.yandex.ru/preview/c2c90a93add9c9f57eea00b00bf47907437f5814ede4a533f3283963072bbe20/inf/bznSbXbC1P5dii9-ymwiIqI1M02nI8fxe2INfzx6zMvwQulnIqrypFI1ZMPJdlMNOu-Nt-k34n2bs4vDsV_smA%3D%3D?uid=59003057&filename=Don%27t%20LIE%20TO%20ME.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=59003057&tknv=v2&size=2878x1592',
    backImageUrl:
      'https://3.downloader.disk.yandex.ru/preview/b32f55435469dadca59166f79441fa0ac08bee8d00c4bf00a6c7f13467f84aa8/inf/sY9v8fd19q6mgAlsGvQ8kGIK3OUp1KGBZRTVnHUAo32xQ3QrK6lQtL2o3JPyFsXq1NYM0ri-zgZ0PpL9my_RIg%3D%3D?uid=59003057&filename=Screenshot%202022-03-28%20at%2023.40.51.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=59003057&tknv=v2&size=2878x1478',
    qty: 3,
  },
  {
    id: CardId.ofString('18808b75-8877-4134-99ff-1ff81478733a'),
    name: "I'm not existed",
    frontImageUrl:
      'https://1.downloader.disk.yandex.ru/preview/bb81bb424b2f6ef0521c2ce560dd26e6aff6479a5594e9b994c99f7b7a98b3b0/inf/km9gddgtJKrkXAFH8uO27R3jOfmKQgpShDHXBbi_IxkaDi-oHXB4dQPd-3TrxFpm2wc6w5jLsK5Dy8tgKpnm0g%3D%3D?uid=59003057&filename=I%27m%20NOT%20EXISTED.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=59003057&tknv=v2&size=2878x1592',
    backImageUrl:
      'https://3.downloader.disk.yandex.ru/preview/b32f55435469dadca59166f79441fa0ac08bee8d00c4bf00a6c7f13467f84aa8/inf/sY9v8fd19q6mgAlsGvQ8kGIK3OUp1KGBZRTVnHUAo32xQ3QrK6lQtL2o3JPyFsXq1NYM0ri-zgZ0PpL9my_RIg%3D%3D?uid=59003057&filename=Screenshot%202022-03-28%20at%2023.40.51.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=59003057&tknv=v2&size=2878x1478',
    qty: 2,
  },
  {
    id: CardId.ofString('59d69efe-db9b-4ce4-a635-fa53db1b3acd'),
    name: 'Madness',
    frontImageUrl:
      'https://3.downloader.disk.yandex.ru/preview/7dbf9a9251a7fb4b7cf66307c7e0958ca7ea4c3ed08263e333f64ef33488ac29/inf/Roqc6wyZlO3X07R7mhj5bDJpv_gB5J16N5tnFjVdE9qXdal27TqpL0DSPr9U5sikq-RM0yPwQzG7NMy-Rk68FQ%3D%3D?uid=59003057&filename=Madness.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=59003057&tknv=v2&size=2878x1592',
    backImageUrl:
      'https://3.downloader.disk.yandex.ru/preview/b32f55435469dadca59166f79441fa0ac08bee8d00c4bf00a6c7f13467f84aa8/inf/sY9v8fd19q6mgAlsGvQ8kGIK3OUp1KGBZRTVnHUAo32xQ3QrK6lQtL2o3JPyFsXq1NYM0ri-zgZ0PpL9my_RIg%3D%3D?uid=59003057&filename=Screenshot%202022-03-28%20at%2023.40.51.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=59003057&tknv=v2&size=2878x1478',
    qty: 2,
  },
  {
    id: CardId.ofString('aa998da5-a252-48df-b64a-311417a69333'),
    name: 'Open your mind',
    frontImageUrl:
      'https://2.downloader.disk.yandex.ru/preview/7a483e5b93c9904920002d4fb6e88c0cfad8d4f4e7f2581600469a277f6b8714/inf/odGDenQm_STZxJ2mb4U8d6I1M02nI8fxe2INfzx6zMslvnE4j7GN6TNL3sUIgfVzPwMik-_XJ217v4pyihb9uQ%3D%3D?uid=59003057&filename=Open%20your%20mind.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=59003057&tknv=v2&size=2878x1592',
    backImageUrl:
      'https://3.downloader.disk.yandex.ru/preview/b32f55435469dadca59166f79441fa0ac08bee8d00c4bf00a6c7f13467f84aa8/inf/sY9v8fd19q6mgAlsGvQ8kGIK3OUp1KGBZRTVnHUAo32xQ3QrK6lQtL2o3JPyFsXq1NYM0ri-zgZ0PpL9my_RIg%3D%3D?uid=59003057&filename=Screenshot%202022-03-28%20at%2023.40.51.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=59003057&tknv=v2&size=2878x1478',
    qty: 3,
  },
  {
    id: CardId.ofString('dedff34f-9c5f-4713-933f-4c0a1f1e4d26'),
    name: 'Triple layer of fear',
    frontImageUrl:
      'https://1.downloader.disk.yandex.ru/preview/0fad28c3b4d6892a61391da71a8021a2514611d87d332ca02497e2378b425ab0/inf/nnYrnK2JpW-Fev2-b3xVbh3jOfmKQgpShDHXBbi_IxlzsRHOU6aKo0V2NFAlFhiTvK5siT5pFDvGoXZ8CDT4Aw%3D%3D?uid=59003057&filename=TRIPLE%20LAYER%20OF%20FEAR.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=59003057&tknv=v2&size=2878x1592',
    backImageUrl:
      'https://3.downloader.disk.yandex.ru/preview/b32f55435469dadca59166f79441fa0ac08bee8d00c4bf00a6c7f13467f84aa8/inf/sY9v8fd19q6mgAlsGvQ8kGIK3OUp1KGBZRTVnHUAo32xQ3QrK6lQtL2o3JPyFsXq1NYM0ri-zgZ0PpL9my_RIg%3D%3D?uid=59003057&filename=Screenshot%202022-03-28%20at%2023.40.51.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=59003057&tknv=v2&size=2878x1478',
    qty: 2,
  },
  {
    id: CardId.ofString('2301816a-d34d-499c-8e6d-0a62d8aa095c'),
    name: 'Vampire kiss',
    frontImageUrl:
      'https://1.downloader.disk.yandex.ru/preview/89f0f0462fc72fa5832407c5ba4bbe320b5853e3b656aa6ca1c2c907452b8441/inf/-ScAGk-zMx2I90eRktfT7aI1M02nI8fxe2INfzx6zMtPNoL-mT5kKgjNdf25ykA3s6vx4SSVdCXVEU3oW5ESCw%3D%3D?uid=59003057&filename=VAMPIRE%20KISS.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=59003057&tknv=v2&size=2878x1592',
    backImageUrl:
      'https://3.downloader.disk.yandex.ru/preview/b32f55435469dadca59166f79441fa0ac08bee8d00c4bf00a6c7f13467f84aa8/inf/sY9v8fd19q6mgAlsGvQ8kGIK3OUp1KGBZRTVnHUAo32xQ3QrK6lQtL2o3JPyFsXq1NYM0ri-zgZ0PpL9my_RIg%3D%3D?uid=59003057&filename=Screenshot%202022-03-28%20at%2023.40.51.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=59003057&tknv=v2&size=2878x1478',
    qty: 3,
  },
  {
    id: CardId.ofString('6a823a07-cbea-40fb-9640-59a79bad13da'),
    name: 'We are the same',
    frontImageUrl:
      'https://1.downloader.disk.yandex.ru/preview/6475166c207c958483f1525ef642e02f71a51526cab55098c91d46b324e23d72/inf/NMWT9zC78TIPB4YIMGQC9KI1M02nI8fxe2INfzx6zMsQQMinLCPNB0JZLmfFeQNgVsesrUkvCXIZXqSdiU_78A%3D%3D?uid=59003057&filename=We%20are%20the%20same.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=59003057&tknv=v2&size=2878x1592',
    backImageUrl:
      'https://3.downloader.disk.yandex.ru/preview/b32f55435469dadca59166f79441fa0ac08bee8d00c4bf00a6c7f13467f84aa8/inf/sY9v8fd19q6mgAlsGvQ8kGIK3OUp1KGBZRTVnHUAo32xQ3QrK6lQtL2o3JPyFsXq1NYM0ri-zgZ0PpL9my_RIg%3D%3D?uid=59003057&filename=Screenshot%202022-03-28%20at%2023.40.51.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=59003057&tknv=v2&size=2878x1478',
    qty: 2,
  },
  {
    id: CardId.ofString('22fb091a-36ad-4013-8efe-ede50e7b1890'),
    name: 'Who am I?',
    frontImageUrl:
      'https://4.downloader.disk.yandex.ru/preview/26429685f68511673582b1df6a28295689d8ff0ef30ab5042ca6d1d0cbe990c4/inf/iON8hQCL_U1jjadQ5ig6Zx3jOfmKQgpShDHXBbi_IxlCrxPalY_eG6bE1U8S9DYr59XoWQIBfrf7lbetdmgx_A%3D%3D?uid=59003057&filename=Who%20AM%20I%3F.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=59003057&tknv=v2&size=2878x1592',
    backImageUrl:
      'https://3.downloader.disk.yandex.ru/preview/b32f55435469dadca59166f79441fa0ac08bee8d00c4bf00a6c7f13467f84aa8/inf/sY9v8fd19q6mgAlsGvQ8kGIK3OUp1KGBZRTVnHUAo32xQ3QrK6lQtL2o3JPyFsXq1NYM0ri-zgZ0PpL9my_RIg%3D%3D?uid=59003057&filename=Screenshot%202022-03-28%20at%2023.40.51.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=59003057&tknv=v2&size=2878x1478',
    qty: 3,
  },
  {
    id: CardId.ofString('c33c2543-79ca-4b2f-960f-9f90602338ab'),
    name: 'You are not existed',
    frontImageUrl:
      'https://2.downloader.disk.yandex.ru/preview/7b5a6626379470d573de87ed113e157b091470203c98cb47942797d4c089f098/inf/swRUES3GIcgW8VsRQFCKGqI1M02nI8fxe2INfzx6zMtCbhSaHpKcPKePYZ4nBqXR8okU1vpzz5tw6zRovsWcZA%3D%3D?uid=59003057&filename=You%20are%20not%20existed.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=59003057&tknv=v2&size=2878x1592',
    backImageUrl:
      'https://3.downloader.disk.yandex.ru/preview/b32f55435469dadca59166f79441fa0ac08bee8d00c4bf00a6c7f13467f84aa8/inf/sY9v8fd19q6mgAlsGvQ8kGIK3OUp1KGBZRTVnHUAo32xQ3QrK6lQtL2o3JPyFsXq1NYM0ri-zgZ0PpL9my_RIg%3D%3D?uid=59003057&filename=Screenshot%202022-03-28%20at%2023.40.51.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=59003057&tknv=v2&size=2878x1478',
    qty: 2,
  },
  {
    id: CardId.ofString('b15fd08f-1499-48a3-ad06-94a4818d0883'),
    name: 'Prediction',
    frontImageUrl:
      'https://2.downloader.disk.yandex.ru/preview/8f3e4d1d959e35efebfc48380fc9edb5a590d8357a1a3b597e7d2d510f5ca2d9/inf/2x7rdAiKLNC4ihBFqSFNjh3jOfmKQgpShDHXBbi_IxmBIGmhMrN3lOnxSrooBNVAcgJTs_OVKkkK917964C5hQ%3D%3D?uid=59003057&filename=prediction.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=59003057&tknv=v2&size=2878x1592',
    backImageUrl:
      'https://3.downloader.disk.yandex.ru/preview/b32f55435469dadca59166f79441fa0ac08bee8d00c4bf00a6c7f13467f84aa8/inf/sY9v8fd19q6mgAlsGvQ8kGIK3OUp1KGBZRTVnHUAo32xQ3QrK6lQtL2o3JPyFsXq1NYM0ri-zgZ0PpL9my_RIg%3D%3D?uid=59003057&filename=Screenshot%202022-03-28%20at%2023.40.51.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=59003057&tknv=v2&size=2878x1478',
    qty: 1,
  },
  {
    id: CardId.ofString('7a6aef33-3f36-4e0b-920d-ff1161f643c3'),
    name: 'You imagined it',
    frontImageUrl:
      'https://1.downloader.disk.yandex.ru/preview/5079cc25b62a42475d93f0b938b488cfebac4cff8aca831508edfb3ecff1aa1c/inf/Ry3cENGn3nc9gDA0wmXvhaI1M02nI8fxe2INfzx6zMuElq8g7COHtLoyRtKK-_fLgA4AMxZDc_3iVGvaV2HAsQ%3D%3D?uid=59003057&filename=you%20imagined%20it.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=59003057&tknv=v2&size=2878x1592',
    backImageUrl:
      'https://3.downloader.disk.yandex.ru/preview/b32f55435469dadca59166f79441fa0ac08bee8d00c4bf00a6c7f13467f84aa8/inf/sY9v8fd19q6mgAlsGvQ8kGIK3OUp1KGBZRTVnHUAo32xQ3QrK6lQtL2o3JPyFsXq1NYM0ri-zgZ0PpL9my_RIg%3D%3D?uid=59003057&filename=Screenshot%202022-03-28%20at%2023.40.51.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=59003057&tknv=v2&size=2878x1478',
    qty: 2,
  },
];

export const LambdielHeroSet = {
  id: SetId.ofString('c720d8f8-3393-44e0-86b1-595b4d47bfb1'),
  name: 'Lamdiel (Malkavian) (VTMB)',
  heroes: [
    {
      id: HeroId.ofString('ed185079-11a8-4cbd-b94e-c8d1ceeb985b'),
      name: 'Lamdiel',
      frontImageUrl:
        'https://1.downloader.disk.yandex.ru/preview/37390fb98a64f2f98082c32fd132f4ab4c897b5ccd4d10b4dc68046facc0adf3/inf/KAEda6woVVVeLHoolibA7Vd3t7TVYISu9rngedVYTdTwSBs90oNow4xR4VgdExdt9J7L-zJOP7Km-j5ic924SQ%3D%3D?uid=59003057&filename=Screenshot%202022-03-29%20at%2001.36.09.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=59003057&tknv=v2&size=2878x1592',
      backImageUrl:
        'https://1.downloader.disk.yandex.ru/preview/37390fb98a64f2f98082c32fd132f4ab4c897b5ccd4d10b4dc68046facc0adf3/inf/KAEda6woVVVeLHoolibA7Vd3t7TVYISu9rngedVYTdTwSBs90oNow4xR4VgdExdt9J7L-zJOP7Km-j5ic924SQ%3D%3D?uid=59003057&filename=Screenshot%202022-03-29%20at%2001.36.09.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=59003057&tknv=v2&size=2878x1592',
      qty: 1,
    },
  ],
  sidekicks: [
    {
      id: SidekickId.ofString('15ad2da8-e752-4d7a-992a-2bdf5a04a50f'),
      name: 'Illusion',
      frontImageUrl:
        'https://1.downloader.disk.yandex.ru/preview/37390fb98a64f2f98082c32fd132f4ab4c897b5ccd4d10b4dc68046facc0adf3/inf/KAEda6woVVVeLHoolibA7Vd3t7TVYISu9rngedVYTdTwSBs90oNow4xR4VgdExdt9J7L-zJOP7Km-j5ic924SQ%3D%3D?uid=59003057&filename=Screenshot%202022-03-29%20at%2001.36.09.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=59003057&tknv=v2&size=2878x1592',
      backImageUrl:
        'https://1.downloader.disk.yandex.ru/preview/37390fb98a64f2f98082c32fd132f4ab4c897b5ccd4d10b4dc68046facc0adf3/inf/KAEda6woVVVeLHoolibA7Vd3t7TVYISu9rngedVYTdTwSBs90oNow4xR4VgdExdt9J7L-zJOP7Km-j5ic924SQ%3D%3D?uid=59003057&filename=Screenshot%202022-03-29%20at%2001.36.09.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=59003057&tknv=v2&size=2878x1592',
      qty: 4,
    },
  ],
  extraCards: [],
  healthMeters: [
    {
      id: HealthMeterId.ofString('6e6cbf65-8258-4e0c-9f24-16c23d2fac65'),
      maxValue: 15,
      frontImageUrl:
        'https://1.downloader.disk.yandex.ru/preview/6d015a6bc8387cf00708a42bdbf18f09de8233d82f5ea80b20d05daf85a1a96d/inf/mtLG3-4v8KsjMTLuY917am6T0cxJlNOF5iM_WxFTaoxmkmmRc9VWW0dtof-TaM84W6Nunxb_LB4bAfsB1BqORA%3D%3D?uid=59003057&filename=Screenshot%202022-03-28%20at%2023.23.24.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=59003057&tknv=v2&size=2878x1592',
      backImageUrl:
        'https://downloader.disk.yandex.ru/preview/eaaf6f0f97eb29498dde09218a2cfa33cde5379be35ea6868120f1c83602ff66/6242518d/mtLG3-4v8KsjMTLuY917am6T0cxJlNOF5iM_WxFTaoxmkmmRc9VWW0dtof-TaM84W6Nunxb_LB4bAfsB1BqORA%3D%3D?uid=0&filename=Screenshot%202022-03-28%20at%2023.23.24.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=0&tknv=v2&size=2048x2048',
    },
  ],
  ruleCards: [
    {
      id: RuleCardId.ofString('1134ef7f-fb81-4264-8c15-adba8f84220f'),
      frontImageUrl:
        'https://3.downloader.disk.yandex.ru/preview/4911f7fc7b1f1ad2457012286ce16ee2a4988d7af1e70ee09d1a35324c8596f2/inf/-GkHOwSrDNw2T0qk5fuUGR3jOfmKQgpShDHXBbi_IxkQcc6RBXlNWC06_moLXUbkIYuV3NHbiY1Q3IDumQJjvA%3D%3D?uid=59003057&filename=Lamdiel.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=59003057&tknv=v2&size=2878x1592',
      backImageUrl:
        'https://3.downloader.disk.yandex.ru/preview/b32f55435469dadca59166f79441fa0ac08bee8d00c4bf00a6c7f13467f84aa8/inf/sY9v8fd19q6mgAlsGvQ8kGIK3OUp1KGBZRTVnHUAo32xQ3QrK6lQtL2o3JPyFsXq1NYM0ri-zgZ0PpL9my_RIg%3D%3D?uid=59003057&filename=Screenshot%202022-03-28%20at%2023.40.51.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=59003057&tknv=v2&size=2878x1478',
    },
    {
      id: RuleCardId.ofString('20a0bf9a-1bb5-4683-88f3-0ee066752ff4'),
      frontImageUrl:
        'https://1.downloader.disk.yandex.ru/preview/0149fef157ca48d47a5d05314f01c541597a80eb13739b797d19c1d2a9683e4c/inf/O-tfprUB3MoGiCojj1di1TJpv_gB5J16N5tnFjVdE9pAy4StzVGm7H6vxzEu1UFAREqmtIEmxFEZS6IwSz9rpQ%3D%3D?uid=59003057&filename=Rule%20card%201.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=59003057&tknv=v2&size=2878x1592',
      backImageUrl:
        'https://3.downloader.disk.yandex.ru/preview/b32f55435469dadca59166f79441fa0ac08bee8d00c4bf00a6c7f13467f84aa8/inf/sY9v8fd19q6mgAlsGvQ8kGIK3OUp1KGBZRTVnHUAo32xQ3QrK6lQtL2o3JPyFsXq1NYM0ri-zgZ0PpL9my_RIg%3D%3D?uid=59003057&filename=Screenshot%202022-03-28%20at%2023.40.51.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=59003057&tknv=v2&size=2878x1478',
    },
    {
      id: RuleCardId.ofString('6418e51b-3869-496c-91f6-c0fc62b98adb'),
      frontImageUrl:
        'https://3.downloader.disk.yandex.ru/preview/81af1b99912875b51173a915b16fb7f90b2c83331147f53ca72c3fd00d4bd218/inf/KNiSX5pO6y_-mBYIc1rrHKI1M02nI8fxe2INfzx6zMsFPK1ySF6LXeBmPQoow4MSH_OZFbpk-BD9cc-Ex6hTCg%3D%3D?uid=59003057&filename=Rule%20card%202.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=59003057&tknv=v2&size=2878x1592',
      backImageUrl:
        'https://3.downloader.disk.yandex.ru/preview/b32f55435469dadca59166f79441fa0ac08bee8d00c4bf00a6c7f13467f84aa8/inf/sY9v8fd19q6mgAlsGvQ8kGIK3OUp1KGBZRTVnHUAo32xQ3QrK6lQtL2o3JPyFsXq1NYM0ri-zgZ0PpL9my_RIg%3D%3D?uid=59003057&filename=Screenshot%202022-03-28%20at%2023.40.51.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=59003057&tknv=v2&size=2878x1478',
    },
    {
      id: RuleCardId.ofString('1756fe22-ffe2-46dc-9564-6b6c30e40c67'),
      frontImageUrl:
        'https://3.downloader.disk.yandex.ru/preview/0d96a1add84f6c54119aa7e7d31b23f5959f1f92bfb9deb69131a08376a328a4/inf/Sm0JwpamTZ4rjqprFN9yMaI1M02nI8fxe2INfzx6zMtNDy_8NGyeHZJcNpXP5F80QUX37XfGdOCmYvL0H_if9A%3D%3D?uid=59003057&filename=Rule%20card%203.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=59003057&tknv=v2&size=2878x1592',
      backImageUrl:
        'https://3.downloader.disk.yandex.ru/preview/b32f55435469dadca59166f79441fa0ac08bee8d00c4bf00a6c7f13467f84aa8/inf/sY9v8fd19q6mgAlsGvQ8kGIK3OUp1KGBZRTVnHUAo32xQ3QrK6lQtL2o3JPyFsXq1NYM0ri-zgZ0PpL9my_RIg%3D%3D?uid=59003057&filename=Screenshot%202022-03-28%20at%2023.40.51.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=59003057&tknv=v2&size=2878x1478',
    },
    {
      id: RuleCardId.ofString('22c0429a-2072-48bd-bafc-14a6f58e062b'),
      frontImageUrl:
        'https://1.downloader.disk.yandex.ru/preview/d5fee79498f5a6e2a0e5ca3b31d124303d1fdff5e2cfc1b7d8f9aaf6416f5468/inf/eKwl0y__qKdn4vOVPjzeCzJpv_gB5J16N5tnFjVdE9pRJlEVGokXMlEZxwKoEUGU-IhYRn2S5moBKYHJSD4e8A%3D%3D?uid=59003057&filename=Rule%20card%204.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=59003057&tknv=v2&size=2878x1592',
      backImageUrl:
        'https://3.downloader.disk.yandex.ru/preview/b32f55435469dadca59166f79441fa0ac08bee8d00c4bf00a6c7f13467f84aa8/inf/sY9v8fd19q6mgAlsGvQ8kGIK3OUp1KGBZRTVnHUAo32xQ3QrK6lQtL2o3JPyFsXq1NYM0ri-zgZ0PpL9my_RIg%3D%3D?uid=59003057&filename=Screenshot%202022-03-28%20at%2023.40.51.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=59003057&tknv=v2&size=2878x1478',
    },
    {
      id: RuleCardId.ofString('25255ece-8e22-4c32-9721-4c41031756bc'),
      frontImageUrl:
        'https://2.downloader.disk.yandex.ru/preview/1ae314f5a8194e2d2eba0adac5a98d9271d9ebab8ad40dc508d131a3d77c8a85/inf/WiPRemDhrqkdCDWcftO3gDJpv_gB5J16N5tnFjVdE9o7S7i-E4WY8oAQRiKaddlfvBSDafjFRMzpQsf48m19Og%3D%3D?uid=59003057&filename=Rule%20card%205.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=59003057&tknv=v2&size=2878x1592',
      backImageUrl:
        'https://3.downloader.disk.yandex.ru/preview/b32f55435469dadca59166f79441fa0ac08bee8d00c4bf00a6c7f13467f84aa8/inf/sY9v8fd19q6mgAlsGvQ8kGIK3OUp1KGBZRTVnHUAo32xQ3QrK6lQtL2o3JPyFsXq1NYM0ri-zgZ0PpL9my_RIg%3D%3D?uid=59003057&filename=Screenshot%202022-03-28%20at%2023.40.51.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=59003057&tknv=v2&size=2878x1478',
    },
  ],
  cards: LambdielCards,
  decks: [
    {
      id: DeckId.ofString('e8787182-c89d-4a11-9e48-22acfe96ce0a'),
      frontImageUrl:
        'https://3.downloader.disk.yandex.ru/preview/b32f55435469dadca59166f79441fa0ac08bee8d00c4bf00a6c7f13467f84aa8/inf/sY9v8fd19q6mgAlsGvQ8kGIK3OUp1KGBZRTVnHUAo32xQ3QrK6lQtL2o3JPyFsXq1NYM0ri-zgZ0PpL9my_RIg%3D%3D?uid=59003057&filename=Screenshot%202022-03-28%20at%2023.40.51.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=59003057&tknv=v2&size=2878x1478',
      cardIds: LambdielCards.map((card) => card.id),
    },
  ],
};

export const HeroSets = {
  [LambdielHeroSet.id]: LambdielHeroSet,
};

export type HeroSets = typeof HeroSets;
