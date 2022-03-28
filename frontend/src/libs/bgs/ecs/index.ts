import { Ignitor } from '../../ecs/ignitor';
import {
  DraggableComponent,
  GameObjectComponent,
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
  SpawnGameObjectEventComponent,
  SpawnHeroComponent,
  SpawnHeroSetComponent,
} from './components';
import { HeroSets } from '../games/unmatched';

// REACT

// export type BgsWorld = World<>;

export type BgsIgnitorCtx = {
  heroSets: typeof HeroSets;
};

export type BgsIgnitorComponents = {
  // GAME
  ImageComponent: ImageComponent;
  PositionComponent: PositionComponent;
  SizeComponent: SizeComponent;
  SelectableComponent: SelectableComponent;
  IsSelectedComponent: IsSelectedComponent;
  DraggableComponent: DraggableComponent;
  IsDraggingComponent: IsDraggingComponent;

  SpawnGameMapComponent: SpawnGameMapComponent;
  SpawnHeroComponent: SpawnHeroComponent;
  SpawnHeroSetComponent: SpawnHeroSetComponent;

  GameObjectComponent: GameObjectComponent;
  SpawnGameObjectEventComponent: SpawnGameObjectEventComponent;

  // REACT COMPONENTS
  ReactPositionComponent: ReactPositionComponent;
  ReactImageComponent: ReactImageComponent;
  ReactSizeComponent: ReactSizeComponent;
  ReactGameMapComponent: ReactGameMapComponent;
  ReactHeroComponent: ReactHeroComponent;
};

export type BgsIgnitor = Ignitor<BgsIgnitorComponents, BgsIgnitorCtx>;
