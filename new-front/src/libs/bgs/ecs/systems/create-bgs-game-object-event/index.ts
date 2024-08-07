import { Pool } from '../../../../ecs/component';
import { EntityId } from '../../../../ecs/entity';
import { Essence } from '../../../../ecs/essence';
import { System } from '../../../../ecs/system';
import { GameObjectComponent } from '../../components';
import { CreateBGCGameObjectEvent } from '../../events';

export const CreateBGCGameObjectEventSystem = (): System => {
  return ({ essence }) => {
    const events = Essence.getEvents(essence, CreateBGCGameObjectEvent);

    if (!events) {
      return;
    }

    const gameObjectP = Essence.getOrAddPool(essence, GameObjectComponent);

    for (const event of events) {
      const bgcGameObjectEntity = EntityId.new();

      // # Add GameObject Component
      Pool.add(gameObjectP, bgcGameObjectEntity, GameObjectComponent.new(true));

      for (const gameObjectComponent of event.payload.components) {
        const pool = Essence.getOrAddPoolByName(essence, gameObjectComponent.componentName);
        if (typeof gameObjectComponent.component === 'object') {
          // TODO: Remove JSON.parse(JSON.stringify()) after i get how to copy normally
          Pool.add(pool, bgcGameObjectEntity, JSON.parse(JSON.stringify(gameObjectComponent.component)));
        } else {
          // TODO: Remove JSON.parse(JSON.stringify()) after i get how to copy normally
          Pool.add(pool, bgcGameObjectEntity, gameObjectComponent.component);
        }
      }
    }
  };
};
