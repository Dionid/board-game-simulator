import { UUID } from '../../../branded-types';
import { DraggableComponent, ImageComponent, PositionComponent, SizeComponent } from '../components';
import { Component, Entity } from '../esc';

export type CardComponent = Component<
  'CardComponent',
  {
    serverId: UUID;
  }
>;

export type CardEntity = Entity<
  'CardEntity',
  {
    CardComponent: CardComponent;
    PositionComponent: PositionComponent;
    ImageComponent: ImageComponent;
    SizeComponent: SizeComponent;
    DraggableComponent: DraggableComponent;
  }
>;
