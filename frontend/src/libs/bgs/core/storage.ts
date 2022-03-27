import { CardEntity } from './entities/card';
import { DeckEntity } from './entities/deck';
import { GameMapEntity } from './entities/game-map';
import { ComponentId, EntityStorage } from './esc';

export type BgsEntityStorageEntity = GameMapEntity | DeckEntity | CardEntity;

export type BgsEntityStorage = {
  gameMapEntity: EntityStorage<GameMapEntity>;
  deckEntity: EntityStorage<DeckEntity>;
  cardEntity: EntityStorage<CardEntity>;
  byComponentName: {
    [key: string]: BgsEntityStorageEntity[] | undefined;
  };
  byComponentId: {
    [key: ComponentId]: BgsEntityStorageEntity | undefined;
  };
};
