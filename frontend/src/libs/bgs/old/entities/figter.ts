import { Component, ComponentId, Entity, EntityId } from '../esc';
import { UUID } from '../../../branded-types';
import { DraggableComponent, ImageComponent, PositionComponent, SizeComponent } from '../components';

export type FighterComponent = Component<
  'FighterComponent',
  {
    serverId: UUID;
    name: string;
  }
>;

export type FighterEntity = Entity<
  'FighterEntity',
  {
    FighterComponent: FighterComponent;
    PositionComponent: PositionComponent;
    ImageComponent: ImageComponent;
    SizeComponent: SizeComponent;
    DraggableComponent: DraggableComponent;
  }
>;

export const FighterEntity = {
  new: (url: string): FighterEntity => {
    return {
      id: EntityId.new(),
      name: 'FighterEntity',
      components: {
        FighterComponent: {
          name: 'FighterComponent',
          id: ComponentId.new(),
          data: {
            serverId: UUID.new(),
            name: 'Some map',
          },
        },
        PositionComponent: PositionComponent.new(ComponentId.new(), 100, 100, 0),
        ImageComponent: {
          name: 'ImageComponent',
          id: ComponentId.new(),
          data: {
            url,
          },
        },
        SizeComponent: {
          name: 'SizeComponent',
          id: ComponentId.new(),
          data: {
            width: 60,
            height: 100,
          },
        },
        DraggableComponent: {
          name: 'DraggableComponent',
          id: ComponentId.new(),
          data: {
            draggable: true,
            isDragging: false,
          },
        },
      },
    };
  },
};
