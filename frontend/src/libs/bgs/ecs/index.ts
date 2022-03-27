import { World } from '../../ecs/world';
import { Ignitor } from '../../ecs/ignitor';
import {
  DraggableComponent,
  ImageComponent,
  IsDraggingComponent,
  IsSelectedComponent,
  PositionComponent,
  ReactGameMapComponent,
  ReactHeroComponent,
  ReactImageComponent,
  ReactPositionComponent,
  ReactSizeComponent,
  SelectableComponent,
  SizeComponent,
  SpawnGameMapComponent,
  SpawnHeroComponent,
} from './components';

// REACT

export type BgsWorld = World<{
  // GAME
  SpawnGameMapComponent: SpawnGameMapComponent;
  SpawnHeroComponent: SpawnHeroComponent;
  ImageComponent: ImageComponent;
  PositionComponent: PositionComponent;
  SizeComponent: SizeComponent;
  SelectableComponent: SelectableComponent;
  IsSelectedComponent: IsSelectedComponent;
  DraggableComponent: DraggableComponent;
  IsDraggingComponent: IsDraggingComponent;

  // REACT COMPONENTS
  ReactPositionComponent: ReactPositionComponent;
  ReactImageComponent: ReactImageComponent;
  ReactSizeComponent: ReactSizeComponent;
  ReactGameMapComponent: ReactGameMapComponent;
  ReactHeroComponent: ReactHeroComponent;
}>;

export type BgsIgnitor = Ignitor<BgsWorld>;
