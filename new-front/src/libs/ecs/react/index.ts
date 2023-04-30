import { useEffect, useState } from 'react';
import { Essence } from '../essence';
import { ComponentId, Pool } from '../component';
import { World } from '../world';
import { EntityId } from '../entity';
import { ReactComponent, ReactComponentFactory } from './components';

export const useEcsComponent = <S extends Record<any, any>, CN extends string, Ctx extends Record<any, any>>(
  world: World<Ctx>,
  entity: EntityId,
  initialState: S,
  componentFactory: ReactComponentFactory<any, any>
): S => {
  const [state, setState] = useState<S>(initialState);

  useEffect(() => {
    const reactCompPool = Essence.getOrAddPool(world.essence, componentFactory);
    const comp = Pool.tryGet(reactCompPool, entity);

    if (!comp) {
      try {
        Pool.add<ReactComponent<CN, S>>(reactCompPool, entity, {
          id: ComponentId.new(),
          name: componentFactory.name,
          props: {
            state,
            setState,
          },
        });
      } catch (e) {
        console.log(e, comp, entity, reactCompPool, componentFactory);
        console.log(reactCompPool.data[entity]);
      }
    }
  }, []);

  useEffect(() => {
    const reactCompPool = Essence.getOrAddPool(world.essence, componentFactory);
    const comp = Pool.tryGet<ReactComponent<CN, S>>(reactCompPool, entity);
    console.log('comp', comp);
    if (comp) {
      // . This hack is needed if we have different components, who are using one ReactComponent (like Minimap and GameStage)
      const oldSetState = comp.props.setState;
      comp.props.setState = (val: S) => {
        oldSetState(val);
        setState(val);
      };
    }
  }, [setState]);

  useEffect(() => {
    const reactCompPool = Essence.getOrAddPool(world.essence, componentFactory);
    const comp = Pool.tryGet<ReactComponent<CN, S>>(reactCompPool, entity);
    if (comp) {
      comp.props.state = state;
    }
  }, [state]);

  // console.log("useEcsComponent", state)

  return state;
};
