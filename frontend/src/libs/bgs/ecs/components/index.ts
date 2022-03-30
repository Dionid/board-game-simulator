import { Component } from '../../../ecs/component';
import { ReactComponent } from '../../../ecs/react';
import { UUID } from '../../../branded-types';
import { CardId, DeckId, HealthMeterId, HeroId, MapId, RuleCardId, SetId, SidekickId } from '../../games/unmatched';
import { Size, Square, Vector2, Vector3 } from '../../../math';

// . BOARD

export const BoardComponentName = 'BoardComponent' as const;
export type BoardComponent = Component<typeof BoardComponentName, Size>;

// . CAMERA

export const CameraComponentName = 'CameraComponent' as const;
export type CameraComponent = Component<typeof CameraComponentName, {}>;

// . INPUT

export type HandComponent = Component<
  'HandComponent',
  {
    current: Vector2 & {
      down: boolean;
    };
    previous: Vector2 & {
      down: boolean;
    };
  }
>;

// . ACCESS

export const PlayerComponentName = 'PlayerComponent' as const;
export type PlayerComponent = Component<
  typeof PlayerComponentName,
  {
    id: UUID;
  }
>;

export type OwnerComponent = Component<'OwnerComponent', {}>;

// . GAME OBJECT

export type GameObjectComponent = Component<'GameObjectComponent', {}>;

export const PositionComponentName = 'PositionComponent';
export type PositionComponent = Component<typeof PositionComponentName, Vector3>;

export type ImageComponent = Component<
  'ImageComponent',
  {
    url: string;
  }
>;

export const SizeComponentName = 'SizeComponent';
export type SizeComponent = Component<typeof SizeComponentName, Size>;

export type SelectableComponent = Component<'SelectableComponent', {}>;

export type IsSelectedComponent = Component<'IsSelectedComponent', {}>;

export type LockableComponent = Component<'LockableComponent', {}>;

export type IsLockedComponent = Component<'IsLockedComponent', {}>;

export type DraggableComponent = Component<'DraggableComponent', {}>;

export type IsDraggingComponent = Component<'IsDraggingComponent', {}>;

export type DeletableComponent = Component<'DeletableComponent', {}>;

// .. SPAWN EVENTS

export type SpawnGameObjectEventComponent = Component<
  'SpawnGameObjectEventComponent',
  Square & {
    draggable: boolean;
    selectable: boolean;
    lockable: boolean;
    imageUrl: string;
    deletable: boolean;
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

export type CardComponent = Component<
  'CardComponent',
  {
    cardId: CardId;
  }
>;

export type RuleCardComponent = Component<
  'RuleCardComponent',
  {
    ruleCardId: RuleCardId;
  }
>;

export type HealthMeterComponent = Component<
  'HealthMeterComponent',
  {
    healthMeterId: HealthMeterId;
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

export type SpawnCardEventComponent = Component<
  'SpawnCardEventComponent',
  {
    url: string;
    cardId: CardId;
  }
>;

export type SpawnRuleCardEventComponent = Component<
  'SpawnRuleCardEventComponent',
  {
    url: string;
    ruleCardId: RuleCardId;
  }
>;

export type SpawnHealthMeterEventComponent = Component<
  'SpawnHealthMeterEventComponent',
  {
    url: string;
    healthMeterId: HealthMeterId;
  }
>;

export type SpawnHeroSetComponent = Component<
  'SpawnHeroSetComponent',
  {
    setId: SetId;
  }
>;

// . REACT COMPONENTS

export type ReactPositionComponentData = Vector2;
export type ReactPositionComponent = ReactComponent<'ReactPositionComponent', ReactPositionComponentData>;

export type ReactSizeComponentData = Size;
export type ReactSizeComponent = ReactComponent<'ReactSizeComponent', ReactSizeComponentData>;

export type ReactImageComponentData = { url: string };
export type ReactImageComponent = ReactComponent<'ReactImageComponent', ReactImageComponentData>;

export type ReactGameMapComponent = Component<'ReactGameMapComponent', {}>;
export type ReactHeroComponent = Component<'ReactHeroComponent', {}>;
