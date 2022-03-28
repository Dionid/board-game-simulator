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

export const Component = {
  update: <N extends string, D extends Record<any, any>>(
    component: Component<N, D>,
    newData: Partial<D>
  ): Component<N, D> => {
    return {
      ...component,
      data: {
        ...component.data,
        ...newData,
      },
    };
  },
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

export const Entity = {
  update: <N, C extends Record<string, Component<any, any>>, K extends keyof C>(
    entity: Entity<N, C>,
    component: C[K]
  ): Entity<N, C> => {
    return {
      ...entity,
      components: {
        ...entity.components,
        [component.name]: component,
      },
    };
  },
  updateComponent: <N, C extends Record<string, Component<any, any>>, K extends keyof C>(
    entity: Entity<N, C>,
    component: C[K]
  ): Record<string, Component<any, any>> => {
    return {
      ...entity.components,
      [component.name]: component,
    };
  },
  updateComponents: <N, C extends Record<string, Component<any, any>>>(
    entity: Entity<N, C>,
    components: Partial<C>
  ): Record<string, Component<any, any>> => {
    return {
      ...entity.components,
      ...components,
    };
  },
};

export type EntityStorage<E extends Entity<any, any>> = {
  byId: {
    [key: EntityId]: E | undefined;
  };
  allIds: EntityId[];
  // byComponentName: {
  //   [key: string]: E[] | undefined;
  // };
  // byComponentId: {
  //   [key: ComponentId]: E | undefined;
  // };
};
