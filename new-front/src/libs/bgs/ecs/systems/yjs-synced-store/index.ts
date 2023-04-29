import { System } from '../../../../ecs/system';
import { initStore, store } from '../../../../../apps/main/store';
import {
  ReactGameMapComponentName,
  ReactHealthMeterComponentName,
  ReactHeroComponentName,
  ReactImageComponentName,
  ReactPositionComponentName,
  ReactScaleComponentName,
  ReactSizeComponentName,
} from '../../components';
import { Essence } from '../../../../ecs/essence';

export const YjsSyncedStoreToECSSystem = (): System<{}> => {
  return {
    run: async ({ essence }) => {
      const componentPoolsNames = Object.keys(essence.pools).filter(
        (key) =>
          key !== ReactPositionComponentName &&
          key !== ReactSizeComponentName &&
          key !== ReactScaleComponentName &&
          key !== ReactImageComponentName &&
          key !== ReactGameMapComponentName &&
          key !== ReactHeroComponentName &&
          key !== ReactHealthMeterComponentName
      );

      for (let i = 0; i < componentPoolsNames.length; i++) {
        const componentPoolsName = componentPoolsNames[i];

        // @ts-ignore
        const syncPool = Essence.getOrAddPool(essence, componentPoolsName);
        // @ts-ignore
        const componentPool = Essence.getOrAddPool(store, componentPoolsName as any);

        // @ts-ignore
        syncPool.name = componentPool.name;
        for (const componentPoolDataKey in componentPool.data) {
          // @ts-ignore
          const essenceComponent = componentPool.data[componentPoolDataKey];
          // @ts-ignore
          const storeComponent = syncPool.data[componentPoolDataKey];

          // @ts-ignore
          if (!storeComponent) {
            // @ts-ignore
            // syncPool.data[componentPoolDataKey] = essenceComponent
            // @ts-ignore
            syncPool.data[componentPoolDataKey] = JSON.parse(JSON.stringify(essenceComponent));

            console.log('YJS SETTED');
          } else {
            for (const essenceComponentDataKey in essenceComponent.data) {
              const essenceComponentData = essenceComponent.data[essenceComponentDataKey];
              const storeComponentData = storeComponent.data[essenceComponentDataKey];
              if (typeof essenceComponentData !== 'object') {
                if (essenceComponentData !== storeComponentData) {
                  storeComponent.data[essenceComponentDataKey] = essenceComponentData;
                }
              }
            }
          }
        }
      }
    },
  };
};

export const YjsSyncedStoreSystem = (): System<{}> => {
  return {
    init: async () => {
      initStore('91dd64b2-a908-4562-b6e2-eacb86548da0');
    },
    run: async ({ essence }) => {
      const componentPoolsNames = Object.keys(essence.pools).filter(
        (key) =>
          key !== ReactPositionComponentName &&
          key !== ReactSizeComponentName &&
          key !== ReactScaleComponentName &&
          key !== ReactImageComponentName &&
          key !== ReactGameMapComponentName &&
          key !== ReactHeroComponentName &&
          key !== ReactHealthMeterComponentName
      );

      for (let i = 0; i < componentPoolsNames.length; i++) {
        const componentPoolsName = componentPoolsNames[i];

        const syncPool = Essence.getOrAddPool(store, componentPoolsName as any);
        // @ts-ignore
        const componentPool = Essence.getOrAddPool(essence, componentPoolsName);

        syncPool.name = componentPool.name;
        for (const componentPoolDataKey in componentPool.data) {
          // @ts-ignore
          const essenceComponent = componentPool.data[componentPoolDataKey];
          // @ts-ignore
          const storeComponent = syncPool.data[componentPoolDataKey];

          // @ts-ignore
          if (!storeComponent) {
            // @ts-ignore
            syncPool.data[componentPoolDataKey] = essenceComponent;
            console.log('ECS SETTED');
          } else {
            for (const essenceComponentDataKey in essenceComponent.data) {
              const essenceComponentData = essenceComponent.data[essenceComponentDataKey];
              const storeComponentData = storeComponent.data[essenceComponentDataKey];
              if (typeof essenceComponentData !== 'object') {
                if (essenceComponentData !== storeComponentData) {
                  storeComponent.data[essenceComponentDataKey] = essenceComponentData;
                }
              }
            }
          }
        }
      }
    },
  };
};
