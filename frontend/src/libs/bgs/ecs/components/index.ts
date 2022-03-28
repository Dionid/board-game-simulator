import { Component } from '../../../ecs/component';
import { ReactComponent } from '../../../ecs/react';
import { UUID } from '../../../branded-types';
import { DeckId, HeroId, MapId, SetId, SidekickId } from '../../games/unmatched';

// . INPUT

export type HandComponent = Component<
  'HandComponent',
  {
    current: {
      x: number;
      y: number;
      down: boolean;
    };
    previous: {
      x: number;
      y: number;
      down: boolean;
    };
  }
>;

// . ACCESS

export type PlayerComponent = Component<
  'PlayerComponent',
  {
    id: UUID;
  }
>;

export type OwnerComponent = Component<'OwnerComponent', {}>;

// . GAME OBJECT

export type GameObjectComponent = Component<'GameObjectComponent', {}>;

export type PositionComponent = Component<
  'PositionComponent',
  {
    x: number;
    y: number;
    z: number;
  }
>;

export type ImageComponent = Component<
  'ImageComponent',
  {
    url: string;
  }
>;

export type SizeComponent = Component<
  'SizeComponent',
  {
    width: number;
    height: number;
  }
>;

export type SelectableComponent = Component<'SelectableComponent', {}>;

export type IsSelectedComponent = Component<'IsSelectedComponent', {}>;

export type LockableComponent = Component<'LockableComponent', {}>;

export type IsLockedComponent = Component<'IsLockedComponent', {}>;

export type DraggableComponent = Component<'DraggableComponent', {}>;

export type IsDraggingComponent = Component<'IsDraggingComponent', {}>;

// .. SPAWN EVENTS

export type SpawnGameObjectEventComponent = Component<
  'SpawnGameObjectEventComponent',
  {
    x: number;
    y: number;
    width: number;
    height: number;
    draggable: boolean;
    selectable: boolean;
    imageUrl: string;
  }
>;

// . UNMATCHED COMPONENTS

export type GameMapComponent = Component<
  'GameMapComponent',
  {
    mapId: MapId;
  }
>;

export type HeroComponent = Component<
  'HeroComponent',
  {
    heroId: HeroId;
  }
>;

export type SidekickComponent = Component<
  'SidekickComponent',
  {
    sidekickId: SidekickId;
  }
>;

export type DeckComponent = Component<
  'DeckComponent',
  {
    deckId: DeckId;
  }
>;

export type HeroSetComponent = Component<
  'HeroSetComponent',
  {
    setId: SetId;
  }
>;

// .. SPAWN EVENTS

export type SpawnGameMapComponent = Component<
  'SpawnGameMapComponent',
  {
    url: string;
    mapId: MapId;
  }
>;

export type SpawnHeroComponent = Component<
  'SpawnHeroComponent',
  {
    url: string;
    heroId: HeroId;
  }
>;

export type SpawnSideKickEventComponent = Component<
  'SpawnSideKickEventComponent',
  {
    url: string;
    sidekickId: SidekickId;
  }
>;

export type SpawnDeckEventComponent = Component<
  'SpawnDeckEventComponent',
  {
    url: string;
    deckId: DeckId;
  }
>;

export type SpawnHeroSetComponent = Component<
  'SpawnHeroSetComponent',
  {
    setId: SetId;
  }
>;

// . REACT COMPONENTS

export type ReactPositionComponentData = { x: number; y: number };
export type ReactPositionComponent = ReactComponent<'ReactPositionComponent', ReactPositionComponentData>;

export type ReactSizeComponentData = { width: number; height: number };
export type ReactSizeComponent = ReactComponent<'ReactSizeComponent', ReactSizeComponentData>;

export type ReactImageComponentData = { url: string };
export type ReactImageComponent = ReactComponent<'ReactImageComponent', ReactImageComponentData>;

export type ReactGameMapComponent = Component<'ReactGameMapComponent', {}>;
export type ReactHeroComponent = Component<'ReactHeroComponent', {}>;
