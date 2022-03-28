import { System } from '../../../../ecs/system';
import { World } from '../../../../ecs/world';
import { ComponentId, Pool } from '../../../../ecs/component';
import { EntityId } from '../../../../ecs/entity';
import {
  SpawnDeckEventComponent,
  SpawnHeroComponent,
  SpawnHeroSetComponent,
  SpawnSideKickEventComponent,
} from '../../components';
import { HeroSets } from '../../../games/unmatched';

export const SpawnHeroSetSystem = (): System<
  {
    SpawnHeroSetComponent: SpawnHeroSetComponent;
    SpawnHeroComponent: SpawnHeroComponent;
    SpawnSideKickEventComponent: SpawnSideKickEventComponent;
    SpawnDeckEventComponent: SpawnDeckEventComponent;
  },
  {
    heroSets: HeroSets;
  }
> => {
  return {
    run: async ({ world, ctx }) => {
      const entities = World.filter(world, ['SpawnHeroSetComponent']);
      if (entities.length === 0) {
        return;
      }

      const spawnHeroSetComponentPool = World.getOrAddPool(world, 'SpawnHeroSetComponent');
      const spawnHeroComponentPool = World.getOrAddPool(world, 'SpawnHeroComponent');
      const spawnSidekickEventComponentPool = World.getOrAddPool(world, 'SpawnSideKickEventComponent');
      const spawnDeckEventComponentPool = World.getOrAddPool(world, 'SpawnDeckEventComponent');

      const heroSets = ctx.heroSets;

      for (const entity of entities) {
        const spawnComponent = Pool.get(spawnHeroSetComponentPool, entity);

        const heroSet = heroSets[spawnComponent.data.setId];

        heroSet.heroes.forEach((hero) => {
          for (let i = 0; i < hero.qty; i++) {
            // . Create new hero component
            Pool.add(spawnHeroComponentPool, EntityId.new(), {
              name: 'SpawnHeroComponent',
              id: ComponentId.new(),
              data: {
                url: hero.frontImageUrl,
                heroId: hero.id,
              },
            });
          }
        });

        heroSet.sidekicks.forEach((sidekick) => {
          for (let i = 0; i < sidekick.qty; i++) {
            // . Create new sidekick component
            Pool.add(spawnSidekickEventComponentPool, EntityId.new(), {
              name: 'SidekickEventComponent',
              id: ComponentId.new(),
              data: {
                url: sidekick.frontImageUrl,
                sidekickId: sidekick.id,
              },
            });
          }
        });

        heroSet.decks.forEach((deck) => {
          // . Create new sidekick component
          Pool.add(spawnDeckEventComponentPool, EntityId.new(), {
            name: 'SpawnDeckEventComponent',
            id: ComponentId.new(),
            data: {
              url: deck.frontImageUrl,
              deckId: deck.id,
            },
          });
        });

        // . Destroy event
        Pool.delete(spawnHeroSetComponentPool, entity);
      }
    },
  };
};
