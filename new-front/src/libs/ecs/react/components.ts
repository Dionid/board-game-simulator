import { Vector2, Size } from '../../math';
import { Component, ComponentId } from '../component';

export type ReactComponent<Name extends string, State extends Record<any, any>> = Component<
  Name,
  {
    state: State;
    setState: (value: State) => void;
  }
>;

export type ReactComponentFactory<Name extends string, State extends Record<any, any>> = {
  name: Name;
  new: (props: { state: State; setState: (value: State) => void }) => ReactComponent<Name, State>;
};

export const ReactComponentFactory = <Name extends string, State extends Record<any, any>>(name: Name) => {
  return {
    name,
    new: (props: { state: State; setState: (value: State) => void }) => {
      return {
        name,
        id: ComponentId.new(),
        props,
      };
    },
  };
};

export const ReactPositionComponent = ReactComponentFactory<'ReactPositionComponent', Vector2>(
  'ReactPositionComponent'
);
export const ReactSizeComponent = ReactComponentFactory<'ReactSizeComponent', Size>('ReactSizeComponent');
