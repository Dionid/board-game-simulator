import { System } from '../../../../ecs/system';
import { World } from '../../../../ecs/world';
import { ComponentId, Pool } from '../../../../ecs/component';
import { EntityId } from '../../../../ecs/entity';
import { SpawnHeroComponent, SpawnHeroSetComponent } from '../../components';

export const SpawnHeroSetSystem = (): System<{
  SpawnHeroSetComponent: SpawnHeroSetComponent;
  SpawnHeroComponent: SpawnHeroComponent;
}> => {
  return {
    run: async ({ world }) => {
      const entities = World.filter(world, ['SpawnHeroSetComponent']);
      if (entities.length === 0) {
        return;
      }

      const spawnHeroSetComponentPool = World.getOrAddPool(world, 'SpawnHeroSetComponent');
      const spawnHeroComponentPool = World.getOrAddPool(world, 'SpawnHeroComponent');

      for (const entity of entities) {
        // const spawnComponent = Pool.get(spawnHeroSetComponentPool, entity);

        // . Create new hero component
        Pool.add(spawnHeroComponentPool, EntityId.new(), {
          name: 'SpawnHeroComponent',
          id: ComponentId.new(),
          data: {
            url: 'https://downloader.disk.yandex.ru/preview/161897aa02b8194c76d656eef6457102eb834eaf8f5ae87bd6a187bb82cdb4fd/623f6aaa/UD-u8vK1z1fLXA14AVIV7W9G13sooEQOAswJRV651SmGSoZFp5wTl-y7PHaF0ne9Z3yDPVHa8Xri9lPONPSPaA%3D%3D?uid=0&filename=Screenshot%202022-03-26%20at%2018.33.34.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=0&tknv=v2&size=2048x2048',
          },
        });

        // . Destroy event
        Pool.delete(spawnHeroSetComponentPool, entity);
      }
    },
  };
};
