import {
  DeckComponent,
  DeckComponentName,
  HeroSetComponent,
  HeroSetComponentName,
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
  [HeroSetComponentName]: HeroSetComponent;
}> => {
  return {
    run: async ({ essence }) => {
      const entities = Essence.getEntitiesByComponents(essence, [TakeCardFromDeckEventComponentName]);
      if (entities.length === 0) {
        return;
      }

      const deckCP = Essence.getOrAddPool(essence, DeckComponentName);
      const takeCardFromDeckEventCP = Essence.getOrAddPool(essence, TakeCardFromDeckEventComponentName);
      const spawnCardEventCP = Essence.getOrAddPool(essence, SpawnCardEventComponentName);
      const positionCP = Essence.getOrAddPool(essence, PositionComponentName);
      const sizeCP = Essence.getOrAddPool(essence, SizeComponentName);
      const heroSetCP = Essence.getOrAddPool(essence, HeroSetComponentName);

      entities.forEach((entity) => {
        const eventC = Pool.get(takeCardFromDeckEventCP, entity);

        const { deckEntityId } = eventC.data;
        const deckC = Pool.get(deckCP, deckEntityId);
        const deckPosition = Pool.get(positionCP, deckEntityId);
        const deckSize = Pool.get(sizeCP, deckEntityId);
        const heroSetC = Pool.get(heroSetCP, deckC.data.heroSetEntityId);

        // . Get 1 card
        const card = deckC.data.cards.pop();

        if (!card) {
          throw new Error(`No card found in deck`);
        }

        // . Create card on deck
        const cardEntityId = EntityId.new();
        Pool.add(spawnCardEventCP, cardEntityId, {
          id: ComponentId.new(),
          name: SpawnCardEventComponentName,
          data: {
            heroSetEntityId: deckC.data.heroSetEntityId,
            frontSideUrl: card.frontImageUrl,
            backSideUrl: card.backImageUrl,
            cardId: card.id,
            x: deckPosition.data.x,
            y: deckPosition.data.y + deckSize.data.height + 20,
            deckEntityId,
            card,
          },
        });

        if (deckC.data.cards.length === 0) {
          Essence.destroyEntity(essence, deckEntityId);
        }

        heroSetC.data.boundedEntityIds.push(cardEntityId);

        Pool.delete(takeCardFromDeckEventCP, entity);
      });
    },
  };
};
