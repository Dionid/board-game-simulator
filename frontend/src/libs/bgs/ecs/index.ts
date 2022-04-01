import { World } from '../../ecs/world';
import {
  BoardComponent,
  BoardComponentName,
  CameraComponent,
  CameraComponentName,
  CardComponent,
  DeckComponent,
  DeletableComponent,
  DraggableComponent,
  GameMapComponent,
  GameObjectComponent,
  HandComponent,
  HandComponentName,
  HealthMeterComponent,
  HeroComponent,
  HeroSetComponent,
  ImageComponent,
  IsDraggingComponent,
  IsLockedComponent,
  IsSelectedComponent,
  LockableComponent,
  OwnerComponent,
  OwnerComponentName,
  PanModeComponent,
  PanModeComponentName,
  PlayerComponent,
  PlayerComponentName,
  PositionComponent,
  ReactGameMapComponent,
  ReactHeroComponent,
  ReactImageComponent,
  ReactPositionComponent,
  ReactScaleComponent,
  ReactScaleComponentName,
  ReactSizeComponent,
  RuleCardComponent,
  ScaleComponent,
  ScaleComponentName,
  SelectableComponent,
  SidekickComponent,
  SizeComponent,
  SizeComponentName,
  SpawnCardEventComponent,
  SpawnDeckEventComponent,
  SpawnGameMapComponent,
  SpawnGameObjectEventComponent,
  SpawnHealthMeterEventComponent,
  SpawnHeroComponent,
  SpawnHeroSetComponent,
  SpawnRuleCardEventComponent,
  SpawnSideKickEventComponent,
  ZoomInEventComponent,
  ZoomInEventComponentName,
  ZoomOutEventComponent,
  ZoomOutEventComponentName,
} from './components';
import { HeroSets } from '../games/unmatched';

// REACT

// export type BgsWorld = World<>;

export type BgsWorldCtx = {
  heroSets: typeof HeroSets;
  forceUpdate: () => void;
};

export type BgsWorldComponents = {
  [PlayerComponentName]: PlayerComponent;
  [OwnerComponentName]: OwnerComponent;
  [CameraComponentName]: CameraComponent;
  [BoardComponentName]: BoardComponent;
  [HandComponentName]: HandComponent;

  // GAME
  ImageComponent: ImageComponent;
  PositionComponent: PositionComponent;
  [SizeComponentName]: SizeComponent;
  [ScaleComponentName]: ScaleComponent;
  SelectableComponent: SelectableComponent;
  IsSelectedComponent: IsSelectedComponent;
  DraggableComponent: DraggableComponent;
  IsDraggingComponent: IsDraggingComponent;
  LockableComponent: LockableComponent;
  IsLockedComponent: IsLockedComponent;
  DeletableComponent: DeletableComponent;

  GameMapComponent: GameMapComponent;
  HeroComponent: HeroComponent;
  SidekickComponent: SidekickComponent;
  DeckComponent: DeckComponent;
  CardComponent: CardComponent;
  RuleCardComponent: RuleCardComponent;
  HeroSetComponent: HeroSetComponent;
  HealthMeterComponent: HealthMeterComponent;

  // . EVENTS
  [ZoomInEventComponentName]: ZoomInEventComponent;
  [ZoomOutEventComponentName]: ZoomOutEventComponent;
  SpawnGameMapComponent: SpawnGameMapComponent;
  SpawnHeroComponent: SpawnHeroComponent;
  SpawnSideKickEventComponent: SpawnSideKickEventComponent;
  SpawnDeckEventComponent: SpawnDeckEventComponent;
  SpawnCardEventComponent: SpawnCardEventComponent;
  SpawnRuleCardEventComponent: SpawnRuleCardEventComponent;
  SpawnHealthMeterEventComponent: SpawnHealthMeterEventComponent;
  SpawnHeroSetComponent: SpawnHeroSetComponent;

  GameObjectComponent: GameObjectComponent;
  SpawnGameObjectEventComponent: SpawnGameObjectEventComponent;

  // UI
  [PanModeComponentName]: PanModeComponent;

  // REACT COMPONENTS
  ReactPositionComponent: ReactPositionComponent;
  ReactImageComponent: ReactImageComponent;
  ReactSizeComponent: ReactSizeComponent;
  ReactGameMapComponent: ReactGameMapComponent;
  ReactHeroComponent: ReactHeroComponent;
  [ReactScaleComponentName]: ReactScaleComponent;
};

export type BgsWorld = World<BgsWorldComponents, BgsWorldCtx>;
