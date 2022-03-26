import { Entity } from '../ecs';
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
  width: number;
  height: number;
};

// . GAME MAP

export type GameMapComponent = {
  name: 'GameMapComponent';
  serverId: UUID;
  mapName: string;
};

export type GameBoardEntityComponents = GameMapComponent | PositionComponent | ImageComponent;
export type GameBoardEntity = Entity<GameBoardEntityComponents>;

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

// const gbe: GameBoardEntity = {
// 	id: UUID.new(),
// 	componentsList: [],
// 	componentsByName: {}
// }
//
// Entity.addComponent(gbe, {
// 	name: "GameMapComponent",
// })
// Entity.addComponent(gbe, {
// 	name: "PositionComponent",
// 	x: 10,
// 	y: 10,
// 	z: 0,
// 	locked: false,
// })
