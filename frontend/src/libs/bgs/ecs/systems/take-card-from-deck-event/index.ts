import {
  DeckComponent,
  DeckComponentName,
  PositionComponent,
  PositionComponentName,
  SizeComponent,
  SizeComponentName,
  SpawnCardEventComponent,
  SpawnCardEventComponentName,
  TakeCardFromDeckEventComponent,
  TakeCardFromDeckEventComponentName,
} from '../../components';
import { System } from '../../../../ecs/system';
import { Essence } from '../../../../ecs/essence';
import { ComponentId, Pool } from '../../../../ecs/component';
import { EntityId } from '../../../../ecs/entity';

export const TakeCardFromDeckEventSystem = (): System<{
  [TakeCardFromDeckEventComponentName]: TakeCardFromDeckEventComponent;
  [DeckComponentName]: DeckComponent;
  [SpawnCardEventComponentName]: SpawnCardEventComponent;
  [PositionComponentName]: PositionComponent;
  [SizeComponentName]: SizeComponent;
}> => {
  return {
    run: async ({ essence }) => {
      const entities = Essence.filter(essence, [TakeCardFromDeckEventComponentName]);
      if (entities.length === 0) {
        return;
      }

      const deckCP = Essence.getOrAddPool(essence, DeckComponentName);
      const takeCardFromDeckEventCP = Essence.getOrAddPool(essence, TakeCardFromDeckEventComponentName);
      const spawnCardEventCP = Essence.getOrAddPool(essence, SpawnCardEventComponentName);
      const positionCP = Essence.getOrAddPool(essence, PositionComponentName);
      const sizeCP = Essence.getOrAddPool(essence, SizeComponentName);

      entities.forEach((entity) => {
        const eventC = Pool.get(takeCardFromDeckEventCP, entity);
        const deckC = Pool.get(deckCP, eventC.data.deckIdEntity);
        const deckPosition = Pool.get(positionCP, eventC.data.deckIdEntity);
        const deckSize = Pool.get(sizeCP, eventC.data.deckIdEntity);

        // . Get 1 card
        const card = deckC.data.cards.pop();

        if (!card) {
          throw new Error(`No card found in deck`);
        }

        // . Create card on deck
        Pool.add(spawnCardEventCP, EntityId.new(), {
          id: ComponentId.new(),
          name: SpawnCardEventComponentName,
          data: {
            url: card.frontImageUrl,
            cardId: card.id,
            x: deckPosition.data.x,
            y: deckPosition.data.y + deckSize.data.height + 20,
          },
        });

        if (deckC.data.cards.length === 0) {
          Essence.destroyEntity(essence, eventC.data.deckIdEntity);
        }

        Pool.delete(takeCardFromDeckEventCP, entity);
      });
    },
  };
};
