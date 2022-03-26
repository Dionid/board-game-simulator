import { Entity, EntityStorage } from '../ecs';
import { UUID } from '../branded-types';

export type PositionComponent = {
  name: 'PositionComponent';
  x: number;
  y: number;
  z: number;
  locked: boolean;
};

export type ImageComponent = {
  name: 'ImageComponent';
  url: string;
};

export type SizeComponent = {
  name: 'SizeComponent';
  width: number;
  height: number;
};

// . GAME MAP

export type GameMapComponent = {
  name: 'GameMapComponent';
  serverId: UUID;
  mapName: string;
};

export type GameBoardEntityComponents = GameMapComponent | PositionComponent | ImageComponent | SizeComponent;
export type GameBoardEntity = Entity<GameBoardEntityComponents>;

export const GameBoardEntity = {
  empty: (): GameBoardEntity => {
    return {
      id: UUID.new(),
      componentsList: [],
      componentsByName: {},
    };
  },
  new: (url: string): GameBoardEntity => {
    let entity = GameBoardEntity.empty();

    entity = Entity.addComponent(entity, {
      name: 'GameMapComponent',
      serverId: UUID.new(),
      mapName: 'First map',
    });
    entity = Entity.addComponent(entity, {
      name: 'PositionComponent',
      x: 100,
      y: 100,
      z: 0,
      locked: false,
    });
    entity = Entity.addComponent(entity, {
      name: 'ImageComponent',
      url,
    });
    entity = Entity.addComponent(entity, {
      name: 'SizeComponent',
      width: 700,
      height: 450,
    });

    return entity;
  },
};

// . CARD

export type CardComponent = {
  name: 'CardComponent';
  serverId: UUID;
};

export type CardEntityComponents = CardComponent | PositionComponent | ImageComponent;
export type CardEntity = Entity<CardEntityComponents>;

// . CARD

export type DeckComponent = {
  name: 'DeckComponent';
  serverId: UUID;
  deckName: string;
  cardsByEntityId: {
    [key: UUID]: CardEntity;
  };
};

export type DeckEntityComponents = DeckComponent | PositionComponent | ImageComponent;
export type DeckEntity = Entity<DeckEntityComponents>;

export type BgsEntities = DeckEntity | CardEntity | GameBoardEntity;
export type BgsEntityStorage = EntityStorage<BgsEntities>;
