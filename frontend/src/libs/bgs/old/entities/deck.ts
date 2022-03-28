import { UUID } from '../../../branded-types';
import { DraggableComponent, ImageComponent, SizeComponent } from '../components';
import { PositionComponent } from '../components';
import { Component, Entity } from '../esc';

export type DeckComponent = Component<
  'DeckComponent',
  {
    serverId: UUID;
    deckName: string;
    cards: UUID[];
  }
>;

export type DeckEntity = Entity<
  'DeckEntity',
  {
    DeckComponent: DeckComponent;
    PositionComponent: PositionComponent;
    ImageComponent: ImageComponent;
    SizeComponent: SizeComponent;
    DraggableComponent: DraggableComponent;
  }
>;
