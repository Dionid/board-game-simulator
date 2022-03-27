import { World } from '../../ecs/world';
import { Ignitor } from '../../ecs/ignitor';
import {
  ImageComponent,
  PositionComponent,
  ReactGameMapComponent,
  ReactImageComponent,
  ReactPositionComponent,
  SpawnGameMapComponent,
} from './components';

// REACT

export type BgsWorld = World<{
  ReactGameMapComponent: ReactGameMapComponent;
  SpawnGameMapComponent: SpawnGameMapComponent;
  ImageComponent: ImageComponent;
  PositionComponent: PositionComponent;
  ReactPositionComponent: ReactPositionComponent;
  ReactImageComponent: ReactImageComponent;
}>;

export type BgsIgnitor = Ignitor<BgsWorld>;
