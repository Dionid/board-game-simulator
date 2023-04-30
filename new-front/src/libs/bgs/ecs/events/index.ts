import { Component } from '../../../ecs/component';
import { EventFactory } from '../../../ecs/event';

export const ZoomOutEvent = EventFactory<'ZoomOut', undefined>('ZoomOut');
export const ZoomInEvent = EventFactory<'ZoomIn', undefined>('ZoomIn');

export const CreateBGCGameObjectEvent = EventFactory<
  'CreateBGCGameObject',
  {
    components: {
      componentName: string;
      component: Component<any, any>;
    }[];
  }
>('CreateBGCGameObject');
