import { Ignitor } from '../../ecs/ignitor';
import {
  CardComponent,
  DeckComponent,
  DraggableComponent,
  GameMapComponent,
  GameObjectComponent,
  HealthMeterComponent,
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
  RuleCardComponent,
  SelectableComponent,
  SidekickComponent,
  SizeComponent,
  SpawnCardEventComponent,
  SpawnDeckEventComponent,
  SpawnGameMapComponent,
  SpawnGameObjectEventComponent,
  SpawnHealthMeterEventComponent,
  SpawnHeroComponent,
  SpawnHeroSetComponent,
  SpawnRuleCardEventComponent,
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
  CardComponent: CardComponent;
  RuleCardComponent: RuleCardComponent;
  HeroSetComponent: HeroSetComponent;
  HealthMeterComponent: HealthMeterComponent;

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

  // REACT COMPONENTS
  ReactPositionComponent: ReactPositionComponent;
  ReactImageComponent: ReactImageComponent;
  ReactSizeComponent: ReactSizeComponent;
  ReactGameMapComponent: ReactGameMapComponent;
  ReactHeroComponent: ReactHeroComponent;
};

export type BgsIgnitor = Ignitor<BgsIgnitorComponents, BgsIgnitorCtx>;
