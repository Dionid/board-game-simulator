import { EntityId } from './entity';

export type Component = Record<any, any> | boolean | string | number | undefined;

export type ComponentFactory<Name extends string, C extends Component> = {
  name: Name;
  new: (component: C) => C;
};

export const ComponentFactory = <Name extends string, C extends Component>(name: Name): ComponentFactory<Name, C> => {
  return {
    name,
    new: (component: C) => {
      return component;
    },
  };
};

export type ComponentFromFactory<CF extends ComponentFactory<any, any>> = ReturnType<CF['new']>;

// COMPONENTS POOL

// QUESTION: Do i need to add name to Pool?
export type Pool<C extends Component> = {
  entityIds: EntityId[];
  components: Record<EntityId, C | undefined>;
};

export const Pool = {
  tryGet: <C extends Component>(pool: Pool<C>, entityId: EntityId): C | undefined => {
    return pool.components[entityId];
  },
  get: <C extends Component>(pool: Pool<C>, entityId: EntityId): C => {
    const comp = pool.components[entityId];
    if (!comp) {
      throw new Error(`Can't get comp by entityId ${entityId}`);
    }
    return comp;
  },
  add: <C extends Component>(pool: Pool<C>, entityId: EntityId, component: C): void => {
    pool.components[entityId] = component;
    pool.entityIds.push(entityId);
  },
  remove: <C extends Component>(pool: Pool<C>, entityId: EntityId) => {
    const { [entityId]: omit, ...newData } = pool.components;
    pool.components = newData;
    pool.entityIds.splice(pool.entityIds.indexOf(entityId), 1);
  },
};
