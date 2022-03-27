import { World } from '../../ecs/world';
import { Ignitor } from '../../ecs/ignitor';
import {
  ImageComponent,
  PositionComponent,
  ReactGameMapComponent,
  ReactHeroComponent,
  ReactImageComponent,
  ReactPositionComponent,
  ReactSizeComponent,
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

  // REACT COMPONENTS
  ReactPositionComponent: ReactPositionComponent;
  ReactImageComponent: ReactImageComponent;
  ReactSizeComponent: ReactSizeComponent;
  ReactGameMapComponent: ReactGameMapComponent;
  ReactHeroComponent: ReactHeroComponent;
}>;

export type BgsIgnitor = Ignitor<BgsWorld>;
