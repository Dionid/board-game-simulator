import { World } from '../../ecs/world';
import { Ignitor } from '../../ecs/ignitor';
import {
  ImageComponent,
  PositionComponent,
  ReactGameMapComponent,
  ReactImageComponent,
  ReactPositionComponent,
  ReactSizeComponent,
  SizeComponent,
  SpawnGameMapComponent,
} from './components';

// REACT

export type BgsWorld = World<{
  ReactGameMapComponent: ReactGameMapComponent;
  SpawnGameMapComponent: SpawnGameMapComponent;
  ImageComponent: ImageComponent;
  PositionComponent: PositionComponent;
  SizeComponent: SizeComponent;
  // REACT
  ReactPositionComponent: ReactPositionComponent;
  ReactImageComponent: ReactImageComponent;
  ReactSizeComponent: ReactSizeComponent;
}>;

export type BgsIgnitor = Ignitor<BgsWorld>;
