import { Ignitor } from '../../ecs/ignitor';
import {
  DeckComponent,
  DraggableComponent,
  GameMapComponent,
  GameObjectComponent,
  HeroComponent,
  HeroSetComponent,
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
  SidekickComponent,
  SizeComponent,
  SpawnGameMapComponent,
  SpawnGameObjectEventComponent,
  SpawnHeroComponent,
  SpawnHeroSetComponent,
  SpawnSideKickEventComponent,
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

  GameMapComponent: GameMapComponent;
  HeroComponent: HeroComponent;
  SidekickComponent: SidekickComponent;
  DeckComponent: DeckComponent;
  HeroSetComponent: HeroSetComponent;

  SpawnGameMapComponent: SpawnGameMapComponent;
  SpawnHeroComponent: SpawnHeroComponent;
  SpawnHeroSetComponent: SpawnHeroSetComponent;
  SpawnSideKickEventComponent: SpawnSideKickEventComponent;

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
