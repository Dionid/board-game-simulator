import { UUID } from '../../../branded-types';
import { Component, Entity } from '../esc';
import { DraggableComponent, ImageComponent, PositionComponent, SizeComponent } from '../components';

export type GameMapComponent = Component<
  'GameMapComponent',
  {
    serverId: UUID;
    mapName: string;
  }
>;

export type GameMapEntity = Entity<
  'GameMapEntity',
  {
    GameMapComponent: GameMapComponent;
    PositionComponent: PositionComponent;
    ImageComponent: ImageComponent;
    SizeComponent: SizeComponent;
    DraggableComponent: DraggableComponent;
  }
>;

// export const GameMapEntity = {
// 	new: (url: string): GameMapEntity => {
// 		return {
// 			name: "GameMapEntity",
// 			id: EntityId.new(),
// 			components: {
// 				GameMapComponent: {
// 					name: "GameMapComponent",
// 					id: ComponentId.new(),
// 					data: {
// 						serverId: UUID.new(),
// 						mapName: "Some name"
// 					}
// 				},
// 				// ...
// 			}
// 		}
// 	}
// }
