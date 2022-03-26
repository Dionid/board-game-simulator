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

export type EntityStorage<E extends Entity<any> = Entity<any>> = {
  entitiesById: {
    [key: string]: E | undefined;
  };
  entitiesByComponentName: {
    [key: string]: E[] | undefined;
  };
};

export const EntityStorage = {
  findByComponentName: (es: EntityStorage, componentName: string): Entity<any>[] | undefined => {
    return es.entitiesByComponentName[componentName];
  },
  addEntity: (es: EntityStorage, e: Entity<any>): EntityStorage => {
    const { entitiesByComponentName } = es;
    const componentNames = Object.keys(e.componentsByName);

    return {
      entitiesById: {
        ...es.entitiesById,
        [e.id]: e,
      },
      entitiesByComponentName: {
        ...es.entitiesByComponentName,
        ...componentNames.reduce<any>((acc, name) => {
          const comps = entitiesByComponentName[name];
          if (comps) {
            acc[name] = [...comps, e];
          } else {
            acc[name] = [e];
          }

          return acc;
        }, {}),
      },
    };
  },
};
