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

// TODO. fix types on CN
export const useEcsComponent = <S, CR extends Record<CN, ReactComponent<CN, S>>, CN extends keyof CR & string>(
  entity: EntityId,
  initialState: S,
  componentName: CN,
  ignitor: Ignitor<World<CR>>,
  setIgnitor: (i: Ignitor) => void
): S => {
  const [state, setState] = useState<S>(initialState);

  useEffect(() => {
    const reactComp = World.getOrAddPool(ignitor.world, componentName);
    Pool.add<ReactComponent<CN, S>>(reactComp, entity, {
      id: ComponentId.new(),
      name: componentName,
      data: {
        state,
        setState,
      },
    });
    (async () => {
      console.log('REFRESH');
      await Ignitor.run(ignitor);
      setIgnitor({ ...ignitor });
    })();
  }, []);

  return state;
};
