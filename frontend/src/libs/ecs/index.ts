import { UUID } from '../branded-types';

export type Component<N extends string> = {
  name: N;
};

export type Entity<C extends Component<any> = Component<any>> = {
  id: UUID;
  componentsList: C[];
  componentsByName: {
    [key in C['name']]?: C;
  };
};

export const Entity = {
  addComponent: <E extends Entity>(entity: E, component: E extends Entity<infer C> ? C : never): E => {
    return {
      ...entity,
      componentsByName: {
        ...entity.componentsByName,
        [component.name]: component,
      },
      componentsList: [...entity.componentsList.filter((comp) => comp.name !== component.name), component],
    };
  },
  removeComponentByName: <E extends Entity>(
    entity: E,
    componentName: E extends Entity<infer C> ? C['name'] : never
  ): E => {
    const { [componentName]: omit, ...rest } = entity.componentsByName;

    return {
      ...entity,
      componentsByName: rest,
      componentsList: [...entity.componentsList.filter((comp) => comp.name !== componentName)],
    };
  },
};

export type EntityStorage<E extends Entity<any>> = {
  entitiesById: {
    [key: string]: E;
  };
  entitiesByComponentName: {
    [key: string]: E[];
  };
};
