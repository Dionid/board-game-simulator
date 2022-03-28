import { UUID } from '../branded-types';
import { EntityId } from './entity';

export type ComponentId = UUID & { readonly ComponentId: unique symbol };
export const ComponentId = {
  ofString: (value: string): ComponentId => {
    return UUID.ofString(value) as ComponentId;
  },
  new: (): ComponentId => {
    return ComponentId.ofString(UUID.new());
  },
};

export type Component<N extends string, D extends Record<any, any>> = {
  name: N;
  id: ComponentId;
  data: D;
};

// COMPONENTS POOL

export type Pool<C extends Component<any, any> = Component<any, any>> = {
  name: C['name'];
  data: {
    [key: EntityId]: C | undefined;
  };
};

export const Pool = {
  get: <C extends Component<any, any>>(pool: Pool<C>, entityId: EntityId): C => {
    const comp = pool.data[entityId];
    if (!comp) {
      throw new Error(`...`);
    }
    return comp;
  },
  add: <C extends Component<any, any>>(pool: Pool<C>, entityId: EntityId, component: C): void => {
    pool.data[entityId] = component;
  },
  delete: <C extends Component<any, any>>(pool: Pool<C>, entityId: EntityId) => {
    const { [entityId]: omit, ...newData } = pool.data;
    pool.data = newData;
  },
};
