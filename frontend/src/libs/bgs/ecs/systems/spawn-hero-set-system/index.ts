import { System } from '../../../../ecs/system';
import { World } from '../../../../ecs/world';
import { ComponentId, Pool } from '../../../../ecs/component';
import { EntityId } from '../../../../ecs/entity';
import {
  SpawnCardEventComponent,
  SpawnDeckEventComponent,
  SpawnHealthMeterEventComponent,
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
    SpawnCardEventComponent: SpawnCardEventComponent;
    SpawnHealthMeterEventComponent: SpawnHealthMeterEventComponent;
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
      // const spawnCardEventComponentPool = World.getOrAddPool(world, 'SpawnCardEventComponent');
      const spawnHealthMeterEventComponentPool = World.getOrAddPool(world, 'SpawnHealthMeterEventComponent');

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

        heroSet.healthMeters.forEach((healthMeter) => {
          // . Create new sidekick component
          Pool.add(spawnHealthMeterEventComponentPool, EntityId.new(), {
            name: 'SpawnHealthMeterEventComponent',
            id: ComponentId.new(),
            data: {
              url: healthMeter.frontImageUrl,
              healthMeterId: healthMeter.id,
            },
          });
        });

        // // TODO. Remove after deck get card action
        // for (let i = 0; i < heroSet.cards[0].qty; i++) {
        //   Pool.add(spawnCardEventComponentPool, EntityId.new(), {
        //     name: 'SpawnCardEventComponent',
        //     id: ComponentId.new(),
        //     data: {
        //       url: heroSet.cards[0].frontImageUrl,
        //       cardId: heroSet.cards[0].id,
        //     },
        //   });
        // }
        // for (let i = 0; i < heroSet.cards[1].qty; i++) {
        //   Pool.add(spawnCardEventComponentPool, EntityId.new(), {
        //     name: 'SpawnCardEventComponent',
        //     id: ComponentId.new(),
        //     data: {
        //       url: heroSet.cards[1].frontImageUrl,
        //       cardId: heroSet.cards[1].id,
        //     },
        //   });
        // }

        // . Destroy event
        Pool.delete(spawnHeroSetComponentPool, entity);
      }
    },
  };
};
