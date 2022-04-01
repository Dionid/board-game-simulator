import { useEffect, useState } from 'react';
import { Essence } from '../world';
import { Component, ComponentId, Pool } from '../component';
import { Ignitor } from '../ignitor';
import { EntityId } from '../entity';

export type ReactComponent<N extends string, D extends Record<any, any>> = Component<
  N,
  {
    state: D;
    setState: (position: D) => void;
  }
>;

export const useEcsComponent = <
  S,
  CR extends Record<CN, ReactComponent<CN, S>>,
  CN extends keyof CR & string,
  Ctx extends Record<any, any>
>(
  entity: EntityId,
  initialState: S,
  componentName: CN,
  ignitor: Ignitor<CR, Ctx>
): S => {
  const [state, setState] = useState<S>(initialState);

  useEffect(() => {
    const reactCompPool = Essence.getOrAddPool(ignitor.essence, componentName);
    const comp = Pool.tryGet(reactCompPool, entity);
    if (!comp) {
      Pool.add<ReactComponent<CN, S>>(reactCompPool, entity, {
        id: ComponentId.new(),
        name: componentName,
        data: {
          state,
          setState,
        },
      });
    }
  }, []);

  useEffect(() => {
    const reactCompPool = Essence.getOrAddPool(ignitor.essence, componentName);
    const comp = Pool.tryGet(reactCompPool, entity);
    if (comp) {
      // . This hack is needed if we have different components, who are using one ReactComponent (like Minimap and GameStage)
      const oldSetState = comp.data.setState;
      comp.data.setState = (val: S) => {
        oldSetState(val);
        setState(val);
      };
    }
  }, [setState]);

  useEffect(() => {
    const reactCompPool = Essence.getOrAddPool(ignitor.essence, componentName);
    const comp = Pool.tryGet(reactCompPool, entity);
    if (comp) {
      comp.data.state = state;
    }
  }, [state]);

  // console.log("useEcsComponent", state)

  return state;
};
