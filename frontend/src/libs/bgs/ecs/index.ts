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
  SpawnCardEventComponentName,
  SpawnDeckEventComponent,
  SpawnDeckEventComponentName,
  SpawnGameMapEventComponent,
  SpawnGameMapEventComponentName,
  SpawnGameObjectEventComponent,
  SpawnHealthMeterEventComponent,
  SpawnHealthMeterEventComponentName,
  SpawnHeroEventComponent,
  SpawnHeroEventComponentName,
  SpawnHeroSetEventComponent,
  SpawnHeroSetEventComponentName,
  SpawnRuleCardEventComponent,
  SpawnRuleCardEventComponentName,
  SpawnSideKickEventComponent,
  SpawnSideKickEventComponentName,
  TakeCardFromDeckEventComponent,
  TakeCardFromDeckEventComponentName,
  ZoomInEventComponent,
  ZoomInEventComponentName,
  ZoomOutEventComponent,
  ZoomOutEventComponentName,
  PositionComponentName,
  SelectableComponentName,
  IsSelectedComponentName,
  DraggableComponentName,
  IsDraggingComponentName,
  LockableComponentName,
  IsLockedComponentName,
  DeletableComponentName,
  GameMapComponentName,
  HeroComponentName,
  SidekickComponentName,
  DeckComponentName,
  CardComponentName,
  RuleCardComponentName,
  HeroSetComponentName,
  HealthMeterComponentName,
  ImageComponentName,
  GameObjectComponentName,
  SpawnGameObjectEventComponentName,
  ReactPositionComponentName,
  ReactImageComponentName,
  ReactSizeComponentName,
  ReactGameMapComponentName,
  ReactHeroComponentName,
  FlippableComponentName,
  FlippableComponent,
  FlipEventComponentName,
  FlipEventComponent,
  ViewChangeableComponentName,
  ChangeViewEventComponentName,
  ViewChangeableComponent,
  ChangeViewEventComponent,
  HeroSetDeletableComponentName,
  HeroSetDeletableComponent,
  DeleteHeroSetEventComponentName,
  DeleteHeroSetEventComponent,
  DecrementCurrentHealthEventComponentName,
  IncrementCurrentHealthEventComponent,
  IncrementCurrentHealthEventComponentName,
  DecrementCurrentHealthEventComponent,
  ReactHealthMeterComponentName,
  ReactHealthMeterComponent,
  DepthComponentName,
  DepthComponent,
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
  [SizeComponentName]: SizeComponent;
  [ScaleComponentName]: ScaleComponent;
  [ImageComponentName]: ImageComponent;
  [PositionComponentName]: PositionComponent;
  [SelectableComponentName]: SelectableComponent;
  [IsSelectedComponentName]: IsSelectedComponent;
  [DraggableComponentName]: DraggableComponent;
  [IsDraggingComponentName]: IsDraggingComponent;
  [LockableComponentName]: LockableComponent;
  [IsLockedComponentName]: IsLockedComponent;
  [DeletableComponentName]: DeletableComponent;
  [DepthComponentName]: DepthComponent;

  [FlippableComponentName]: FlippableComponent;
  [ViewChangeableComponentName]: ViewChangeableComponent;
  [GameMapComponentName]: GameMapComponent;
  [HeroComponentName]: HeroComponent;
  [HeroSetDeletableComponentName]: HeroSetDeletableComponent;

  [SidekickComponentName]: SidekickComponent;
  [DeckComponentName]: DeckComponent;
  [CardComponentName]: CardComponent;
  [RuleCardComponentName]: RuleCardComponent;
  [HeroSetComponentName]: HeroSetComponent;
  [HealthMeterComponentName]: HealthMeterComponent;
  [DecrementCurrentHealthEventComponentName]: DecrementCurrentHealthEventComponent;
  [IncrementCurrentHealthEventComponentName]: IncrementCurrentHealthEventComponent;

  // . EVENTS

  [DeleteHeroSetEventComponentName]: DeleteHeroSetEventComponent;
  [FlipEventComponentName]: FlipEventComponent;
  [ChangeViewEventComponentName]: ChangeViewEventComponent;
  [ZoomInEventComponentName]: ZoomInEventComponent;
  [ZoomOutEventComponentName]: ZoomOutEventComponent;
  [SpawnGameMapEventComponentName]: SpawnGameMapEventComponent;
  [SpawnHeroEventComponentName]: SpawnHeroEventComponent;
  [SpawnSideKickEventComponentName]: SpawnSideKickEventComponent;
  [SpawnDeckEventComponentName]: SpawnDeckEventComponent;
  [SpawnCardEventComponentName]: SpawnCardEventComponent;
  [SpawnRuleCardEventComponentName]: SpawnRuleCardEventComponent;
  [SpawnHealthMeterEventComponentName]: SpawnHealthMeterEventComponent;
  [SpawnHeroSetEventComponentName]: SpawnHeroSetEventComponent;
  [TakeCardFromDeckEventComponentName]: TakeCardFromDeckEventComponent;

  [GameObjectComponentName]: GameObjectComponent;
  [SpawnGameObjectEventComponentName]: SpawnGameObjectEventComponent;

  // UI
  [PanModeComponentName]: PanModeComponent;

  // REACT COMPONENTS
  [ReactPositionComponentName]: ReactPositionComponent;
  [ReactImageComponentName]: ReactImageComponent;
  [ReactSizeComponentName]: ReactSizeComponent;
  [ReactGameMapComponentName]: ReactGameMapComponent;
  [ReactHeroComponentName]: ReactHeroComponent;
  [ReactScaleComponentName]: ReactScaleComponent;
  [ReactHealthMeterComponentName]: ReactHealthMeterComponent;
};

export type BgsWorld = World<BgsWorldComponents, BgsWorldCtx>;
