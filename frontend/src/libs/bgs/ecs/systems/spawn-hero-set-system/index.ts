import { System } from '../../../../ecs/system';
import { Essence } from '../../../../ecs/essence';
import { ComponentId, Pool } from '../../../../ecs/component';
import { EntityId } from '../../../../ecs/entity';
import {
  CameraComponent,
  CameraComponentName,
  HeroSetComponent,
  HeroSetComponentName,
  PlayerComponent,
  PlayerComponentName,
  PositionComponent,
  PositionComponentName,
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
    [PlayerComponentName]: PlayerComponent;
    [CameraComponentName]: CameraComponent;
    [PositionComponentName]: PositionComponent;
    [HeroSetComponentName]: HeroSetComponent;
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
      const spawnRuleCardEventComponentPool = Essence.getOrAddPool(essence, SpawnRuleCardEventComponentName);
      const spawnHealthMeterEventComponentPool = Essence.getOrAddPool(essence, SpawnHealthMeterEventComponentName);
      const heroSetCP = Essence.getOrAddPool(essence, HeroSetComponentName);

      const heroSets = ctx.heroSets;

      const playerCameraEntityId = Essence.filter(essence, [PlayerComponentName, CameraComponentName])[0];
      const positionCP = Essence.getOrAddPool(essence, PositionComponentName);
      const cameraPositionC = Pool.get(positionCP, playerCameraEntityId);

      for (const entity of entities) {
        const boundedEntityIds: EntityId[] = [];
        const heroSetEntityId = EntityId.new();
        const spawnComponent = Pool.get(spawnHeroSetComponentPool, entity);

        const x = spawnComponent.data.x + cameraPositionC.data.x;
        const y = spawnComponent.data.y + cameraPositionC.data.y;

        const heroSet = heroSets[spawnComponent.data.setId];

        heroSet.heroes.forEach((hero) => {
          for (let i = 0; i < hero.qty; i++) {
            const heroEntityId = EntityId.new();
            boundedEntityIds.push(heroEntityId);
            // . Create new hero component
            Pool.add(spawnHeroComponentPool, heroEntityId, {
              name: SpawnHeroEventComponentName,
              id: ComponentId.new(),
              data: {
                heroSetEntityId,
                views: hero.views,
                heroId: hero.id,
                x,
                y,
              },
            });
          }
        });

        heroSet.sidekicks.forEach((sidekick) => {
          for (let i = 0; i < sidekick.qty; i++) {
            const sideKickEntityId = EntityId.new();
            boundedEntityIds.push(sideKickEntityId);
            // . Create new sidekick component
            Pool.add(spawnSidekickEventComponentPool, sideKickEntityId, {
              name: SpawnSideKickEventComponentName,
              id: ComponentId.new(),
              data: {
                heroSetEntityId,
                views: sidekick.views,
                sidekickId: sidekick.id,
                x,
                y,
              },
            });
          }
        });

        heroSet.decks.forEach((deck) => {
          // . Create new sidekick component
          const deckEntityId = EntityId.new();
          boundedEntityIds.push(deckEntityId);
          Pool.add(spawnDeckEventComponentPool, deckEntityId, {
            name: SpawnDeckEventComponentName,
            id: ComponentId.new(),
            data: {
              heroSetEntityId,
              url: deck.frontImageUrl,
              setId: spawnComponent.data.setId,
              deckId: deck.id,
              x,
              y,
            },
          });
        });

        heroSet.healthMeters.forEach((healthMeter) => {
          // . Create new health meter component
          const healthMeterEntityId = EntityId.new();
          boundedEntityIds.push(healthMeterEntityId);
          Pool.add(spawnHealthMeterEventComponentPool, healthMeterEntityId, {
            name: SpawnHealthMeterEventComponentName,
            id: ComponentId.new(),
            data: {
              heroSetEntityId,
              url: healthMeter.frontImageUrl,
              healthMeterId: healthMeter.id,
              x,
              y,
            },
          });
        });

        heroSet.ruleCards.forEach((ruleCard) => {
          // . Create new ruleCard component
          const ruleCardEntityId = EntityId.new();
          boundedEntityIds.push(ruleCardEntityId);
          Pool.add(spawnRuleCardEventComponentPool, ruleCardEntityId, {
            name: SpawnRuleCardEventComponentName,
            id: ComponentId.new(),
            data: {
              heroSetEntityId,
              url: ruleCard.frontImageUrl,
              ruleCardId: ruleCard.id,
              x,
              y,
            },
          });
        });

        Pool.add(heroSetCP, heroSetEntityId, {
          id: ComponentId.new(),
          name: HeroSetComponentName,
          data: {
            boundedEntityIds,
          },
        });

        // . Destroy event
        Pool.delete(spawnHeroSetComponentPool, entity);
      }
    },
  };
};
