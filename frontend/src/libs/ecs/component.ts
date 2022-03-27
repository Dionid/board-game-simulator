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

export type ComponentsPool<C extends Component<any, any> = Component<any, any>> = Readonly<{
  name: C['name'];
  byEntityId: Readonly<{
    [key: EntityId]: C;
  }>;
  byComponentId: Readonly<{
    [key: ComponentId]: EntityId;
  }>;
  components: C[];
}>;

export const ComponentsPool = {
  getByEntityId: <C extends Component<any, any>>(pool: ComponentsPool<C>, entityId: EntityId): C | undefined => {
    return pool.byEntityId[entityId];
  },
  add: <C extends Component<any, any>>(
    pool: ComponentsPool<C>,
    entityId: EntityId,
    component: C
  ): ComponentsPool<C> => {
    return {
      name: pool.name,
      byEntityId: {
        ...pool.byEntityId,
        [entityId]: component,
      },
      byComponentId: {
        ...pool.byComponentId,
        [component.id]: entityId,
      },
      components: [...pool.components.filter((c) => c.id !== component.id), component],
    };
  },
  default: <C extends Component<any, any>>(poolName: C['name']): ComponentsPool<C> => {
    return {
      name: poolName,
      byEntityId: {},
      byComponentId: {},
      components: [],
    };
  },
};
