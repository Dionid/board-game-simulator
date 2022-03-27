import { useEffect, useState } from 'react';
import { World } from '../world';
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

export const useEcsComponent = <S, CR extends Record<CN, ReactComponent<CN, S>>, CN extends keyof CR & string>(
  entity: EntityId,
  initialState: S,
  componentName: CN,
  ignitor: Ignitor<World<CR>>
): S => {
  const [state, setState] = useState<S>(initialState);

  useEffect(() => {
    const reactCompPool = World.getOrAddPool(ignitor.world, componentName);
    Pool.add<ReactComponent<CN, S>>(reactCompPool, entity, {
      id: ComponentId.new(),
      name: componentName,
      data: {
        state,
        setState,
      },
    });
  }, [state]);

  return state;
};
