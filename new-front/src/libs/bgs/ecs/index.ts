import { EntityId } from '../../ecs/entity';
import { World } from '../../ecs/world';
import { Size } from '../../math';
import { HeroSets } from '../games/unmatched';

export type BgsWorldCtx = {
  heroSets: typeof HeroSets;
  playerEntity: EntityId;
  cameraEntity: EntityId;
  boardSize: Size;
};

export type BgsWorld = World<BgsWorldCtx>;
