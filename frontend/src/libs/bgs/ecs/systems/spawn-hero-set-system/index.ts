import { System } from '../../../../ecs/system';
import { Essence } from '../../../../ecs/essence';
import { ComponentId, Pool } from '../../../../ecs/component';
import { EntityId } from '../../../../ecs/entity';
import {
  SpawnCardEventComponent,
  SpawnCardEventComponentName,
  SpawnDeckEventComponent,
  SpawnDeckEventComponentName,
  SpawnHealthMeterEventComponent,
  SpawnHealthMeterEventComponentName,
  SpawnHeroEventComponent,
  SpawnHeroEventComponentName,
  SpawnHeroSetEventComponent,
  SpawnHeroSetEventComponentName,
  SpawnRuleCardEventComponent,
  SpawnRuleCardEventComponentName,
  SpawnSideKickEventComponent,
  SpawnSideKickEventComponentName,
} from '../../components';
import { HeroSets } from '../../../games/unmatched';

export const SpawnHeroSetSystem = (): System<
  {
    [SpawnHeroSetEventComponentName]: SpawnHeroSetEventComponent;
    [SpawnHeroEventComponentName]: SpawnHeroEventComponent;
    [SpawnSideKickEventComponentName]: SpawnSideKickEventComponent;
    [SpawnDeckEventComponentName]: SpawnDeckEventComponent;
    [SpawnCardEventComponentName]: SpawnCardEventComponent;
    [SpawnHealthMeterEventComponentName]: SpawnHealthMeterEventComponent;
    [SpawnRuleCardEventComponentName]: SpawnRuleCardEventComponent;
  },
  {
    heroSets: HeroSets;
  }
> => {
  return {
    run: async ({ essence, ctx }) => {
      const entities = Essence.filter(essence, [SpawnHeroSetEventComponentName]);
      if (entities.length === 0) {
        return;
      }

      const spawnHeroSetComponentPool = Essence.getOrAddPool(essence, SpawnHeroSetEventComponentName);
      const spawnHeroComponentPool = Essence.getOrAddPool(essence, SpawnHeroEventComponentName);
      const spawnSidekickEventComponentPool = Essence.getOrAddPool(essence, SpawnSideKickEventComponentName);
      const spawnDeckEventComponentPool = Essence.getOrAddPool(essence, SpawnDeckEventComponentName);
      // const spawnCardEventComponentPool = Essence.getOrAddPool(essence, SpawnCardEventComponentName');
      const spawnRuleCardEventComponentPool = Essence.getOrAddPool(essence, SpawnRuleCardEventComponentName);
      const spawnHealthMeterEventComponentPool = Essence.getOrAddPool(essence, SpawnHealthMeterEventComponentName);

      const heroSets = ctx.heroSets;

      for (const entity of entities) {
        const spawnComponent = Pool.get(spawnHeroSetComponentPool, entity);

        const heroSet = heroSets[spawnComponent.data.setId];

        heroSet.heroes.forEach((hero) => {
          for (let i = 0; i < hero.qty; i++) {
            // . Create new hero component
            Pool.add(spawnHeroComponentPool, EntityId.new(), {
              name: SpawnHeroEventComponentName,
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
              name: SpawnSideKickEventComponentName,
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
            name: SpawnDeckEventComponentName,
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
            name: SpawnHealthMeterEventComponentName,
            id: ComponentId.new(),
            data: {
              url: healthMeter.frontImageUrl,
              healthMeterId: healthMeter.id,
            },
          });
        });

        heroSet.ruleCards.forEach((ruleCard) => {
          // . Create new sidekick component
          Pool.add(spawnRuleCardEventComponentPool, EntityId.new(), {
            name: SpawnRuleCardEventComponentName,
            id: ComponentId.new(),
            data: {
              url: ruleCard.frontImageUrl,
              ruleCardId: ruleCard.id,
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
