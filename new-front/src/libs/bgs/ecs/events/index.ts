import { EventFactory } from '../../../ecs/event';

export const ZoomOutEvent = EventFactory<'ZoomOutEvent', undefined>('ZoomOutEvent');
export const ZoomInEvent = EventFactory<'ZoomInEvent', undefined>('ZoomInEvent');
