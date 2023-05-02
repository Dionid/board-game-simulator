import { ComponentFactory, ComponentFromFactory, Pool } from './component';
import { Event, EventFactory, EventFromFactory, EventsRecord } from './event';
import { EntityId } from './entity';
import { TypedObject } from '../typed-object';

export type EssencePools<CF extends ComponentFactory<any, any>[]> = {
  pools: {
    [K in CF[number]['name']]?: Pool<ComponentFromFactory<CF[number]>>;
  };
};

export type EssenceEvents<EL extends Event<any, any>[]> = {
  events: Partial<{
    pending: EventsRecord<EL>;
    active: EventsRecord<EL>;
  }>;
};

export type Essence<CF extends ComponentFactory<any, any>[], EL extends Event<any, any>[]> = EssencePools<CF> &
  EssenceEvents<EL>;

export const Essence = {
  getPool: <CF extends ComponentFactory<any, any>>(
    essence: EssencePools<any>,
    componentFactory: CF
  ): Pool<ComponentFromFactory<CF>> | undefined => {
    return essence.pools[componentFactory.name];
  },

  addPool: <CF extends ComponentFactory<any, any>>(
    essence: EssencePools<[CF]>,
    poolName: CF['name'],
    pool: Pool<ComponentFromFactory<CF>>
  ): void => {
    essence.pools[poolName] = pool;
  },

  getOrAddPoolByName: <CF extends ComponentFactory<any, any>>(
    essence: EssencePools<[CF]>,
    poolName: CF['name']
  ): Pool<ComponentFromFactory<CF>> => {
    const pool = essence.pools[poolName];

    if (!pool) {
      Essence.addPool(essence, poolName, { components: {}, entityIds: [] });

      return Essence.getOrAddPoolByName(essence, poolName);
    }

    return pool;
  },

  getOrAddPool: <CF extends ComponentFactory<any, any>>(
    essence: EssencePools<any>,
    componentFactory: CF
  ): Pool<ComponentFromFactory<CF>> => {
    return Essence.getOrAddPoolByName(essence, componentFactory.name);
  },

  getEntitiesByComponents: <CFL extends ComponentFactory<string, any>[]>(
    essence: EssencePools<CFL>,
    componentFactories: CFL
  ): EntityId[] => {
    const pools: Pool<any>[] = [];

    for (let i = 0; i < componentFactories.length; i++) {
      const compName = componentFactories[i].name as CFL[number]['name'];
      const pool = essence.pools[compName];

      if (!pool) {
        return [];
      }

      pools.push(pool);
    }

    const entityIds: Record<EntityId, boolean> = {};

    for (let i = 0; i < pools.length; i++) {
      const pool = pools[i];

      // # On first iteration we extract entities
      if (i === 0) {
        const ids = pool.entityIds;
        for (let j = 0; j < ids.length; j++) {
          const id = ids[j];
          entityIds[id] = true;
        }
        continue;
      }

      // # On second and further iterations we filter entities
      const ids = TypedObject.keys(entityIds);
      for (let j = 0; j < ids.length; j++) {
        const id = ids[j];
        if (!pool.components[id]) {
          delete entityIds[id];
        }
      }
    }

    return TypedObject.keys(entityIds);
  },

  destroyEntity: (essence: EssencePools<any>, entityId: EntityId): void => {
    Object.keys(essence.pools).forEach((rPoolName) => {
      const poolName = rPoolName as keyof typeof essence.pools;

      const pool = essence.pools[poolName];

      if (!pool) {
        return;
      }

      if (pool.components[entityId]) {
        Pool.remove(pool, entityId);
      }
    });
  },

  // # EVENTS

  getEvents: <EF extends EventFactory<any, any>>(
    essence: EssenceEvents<any>,
    eventFactory: EF
  ): Array<EventFromFactory<EF>> | undefined => {
    return essence.events.active![eventFactory.name];
  },

  addEvent: <E extends Event<any, any>>(
    essence: EssenceEvents<Event<any, any>[]>,
    event: E,
    options?: {
      immediately?: boolean;
    }
  ): void => {
    let eventList: EventsRecord<Event<any, any>[]>;

    if (options?.immediately) {
      eventList = essence.events.active!;
    } else {
      eventList = essence.events.pending!;
    }

    const map = eventList[event.name];

    if (map) {
      map.push(event);
    } else {
      eventList[event.name] = [event];
    }
  },

  flushEvents: (essence: EssenceEvents<Event<any, any>[]>): void => {
    for (const pendingEventKeys of Object.keys(essence.events.pending!)) {
      const pendingEvents = essence.events.pending![pendingEventKeys]!;
      const activeEvents = essence.events.active![pendingEventKeys];

      if (activeEvents) {
        // essence.events.active![pendingEventKeys] = activeEvents.concat(pendingEvents);
        for (const event of pendingEvents) {
          activeEvents.push(JSON.parse(JSON.stringify(event)));
        }
      } else {
        essence.events.active![pendingEventKeys] = [];
        for (const event of pendingEvents) {
          // TODO: Remove JSON.parse(JSON.stringify()) after i get how to copy normally
          essence.events.active![pendingEventKeys]!.push(JSON.parse(JSON.stringify(event)));
        }
      }
    }

    essence.events.pending! = {};
  },

  clearEvents: (essence: EssenceEvents<Event<any, any>[]>): void => {
    for (const eventName of Object.keys(essence.events.active!)) {
      const eventList = essence.events.active![eventName];

      if (!eventList) {
        return;
      }

      const newEventsList = [];

      for (const event of eventList) {
        if (event.liveFor) {
          event.liveFor -= 1;
          if (event.liveFor > 0) {
            newEventsList.push(event);
          }
        }
      }

      if (newEventsList.length !== eventList.length) {
        essence.events.active![eventName] = newEventsList;
      }
    }
  },
};
