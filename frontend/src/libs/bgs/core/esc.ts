import { UUID } from '../../branded-types';

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

export type EntityId = UUID & { readonly EntityId: unique symbol };
export const EntityId = {
  ofString: (value: string): EntityId => {
    return UUID.ofString(value) as EntityId;
  },
  new: (): EntityId => {
    return EntityId.ofString(UUID.new());
  },
};

export type Entity<N, C extends Record<string, Component<any, any>>> = {
  name: N;
  id: EntityId;
  components: C;
};

export type EntityStorage<E extends Entity<any, any>> = {
  byId: {
    [key: EntityId]: E | undefined;
  };
  allIds: EntityId[];
  byComponentName: {
    [key: string]: E[] | undefined;
  };
  byComponentId: {
    [key: ComponentId]: E | undefined;
  };
};
