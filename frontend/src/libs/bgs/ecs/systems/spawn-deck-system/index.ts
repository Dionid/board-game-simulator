import { System } from '../../../../ecs/system';
import { Essence } from '../../../../ecs/essence';
import { ComponentId, Pool } from '../../../../ecs/component';
import {
  CameraComponent,
  CameraComponentName,
  DeckComponent,
  DeckComponentName,
  PlayerComponent,
  PlayerComponentName,
  PositionComponent,
  PositionComponentName,
  SizeComponent,
  SizeComponentName,
  SpawnDeckEventComponent,
  SpawnDeckEventComponentName,
  SpawnGameObjectEventComponent,
  SpawnGameObjectEventComponentName,
} from '../../components';
import { Size } from '../../../../math';
import { Card, Deck, HeroSets } from '../../../games/unmatched';

export const SpawnDeckEventSystem = (): System<
  {
    [SpawnDeckEventComponentName]: SpawnDeckEventComponent;
    [DeckComponentName]: DeckComponent;
    [SpawnGameObjectEventComponentName]: SpawnGameObjectEventComponent;
    [CameraComponentName]: CameraComponent;
    [PlayerComponentName]: PlayerComponent;
    [PositionComponentName]: PositionComponent;
    [SizeComponentName]: SizeComponent;
  },
  {
    heroSets: HeroSets;
  }
> => {
  return {
    run: async ({ essence, ctx }) => {
      const entities = Essence.filter(essence, [SpawnDeckEventComponentName]);
      if (entities.length === 0) {
        return;
      }

      const spawnDeckComponentPool = Essence.getOrAddPool(essence, SpawnDeckEventComponentName);
      const deckComponentPool = Essence.getOrAddPool(essence, DeckComponentName);
      const spawnGameObjectComponentPool = Essence.getOrAddPool(essence, SpawnGameObjectEventComponentName);

      for (const deckEntity of entities) {
        const spawnComponent = Pool.get(spawnDeckComponentPool, deckEntity);

        // TODO. Think about entity id: must be new or the same
        // . Create deck spawn event
        const size: Size = {
          width: 100,
          height: 140,
        };
        Pool.add(spawnGameObjectComponentPool, deckEntity, {
          id: ComponentId.new(),
          name: SpawnGameObjectEventComponentName,
          data: {
            imageUrl: spawnComponent.data.url,
            draggable: true,
            selectable: true,
            lockable: true,
            deletable: false,
            dynamicDepth: true,
            x: spawnComponent.data.x - size.width / 2,
            y: spawnComponent.data.y - size.height / 2,
            ...size,
          },
        });

        const heroSets = ctx.heroSets;
        const herSetCards = heroSets[spawnComponent.data.setId].cards;

        const cards: Card[] = [];

        for (let i = 0; i < herSetCards.length; i++) {
          const cardTemplate = herSetCards[i];
          for (let j = 0; j < cardTemplate.qty; j++) {
            cards.push(cardTemplate);
          }
        }
        const deck = {
          id: spawnComponent.data.deckId,
          cards,
        };
        Deck.shuffle(deck);
        Pool.add(deckComponentPool, deckEntity, {
          id: ComponentId.new(),
          name: DeckComponentName,
          data: {
            ...deck,
            heroSetEntityId: spawnComponent.data.heroSetEntityId,
          },
        });

        // Destroy event
        Pool.delete(spawnDeckComponentPool, deckEntity);
      }
    },
  };
};
