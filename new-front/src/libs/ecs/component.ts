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

export type Component<Name extends string, Props extends Record<any, any> | boolean | string | number | undefined> = {
  name: Name;
  id: ComponentId;
  props: Props;
};

export type ComponentFactory<
  Name extends string,
  Props extends Record<any, any> | boolean | string | number | undefined
> = {
  name: Name;
  new: (d: Props) => Component<Name, Props>;
};

export const ComponentFactory = <
  Name extends string,
  Props extends Record<any, any> | boolean | string | number | undefined
>(
  name: Name
) => {
  return {
    name,
    new: (props: Props) => {
      return {
        name,
        id: ComponentId.new(),
        props,
      };
    },
  };
};

export type ComponentFromFactory<CF extends ComponentFactory<any, any>> = ReturnType<CF['new']>;

// COMPONENTS POOL

export type Pool<C extends Component<any, any> = Component<any, any>> = {
  name: C['name'];
  data: {
    [key: EntityId]: C | undefined;
  };
};

export const Pool = {
  tryGet: <C extends Component<any, any>>(pool: Pool<C>, entityId: EntityId): C | undefined => {
    return pool.data[entityId];
  },
  get: <C extends Component<any, any>>(pool: Pool<C>, entityId: EntityId): C => {
    const comp = pool.data[entityId];
    if (!comp) {
      throw new Error(`Can't get comp by entityId ${entityId} in ${pool.name}`);
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
