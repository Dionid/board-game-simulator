import { Component } from '../../../ecs/component';
import { ReactComponent } from '../../../ecs/react';
import { UUID } from '../../../branded-types';
import {
  Card,
  CardId,
  Deck,
  DeckId,
  HealthMeterId,
  HeroId,
  MapId,
  RuleCardId,
  SetId,
  SidekickId,
} from '../../games/unmatched';
import { Size, Square, Vector2, Vector3 } from '../../../math';
import { EntityId } from '../../../ecs/entity';

// . BOARD

export const BoardComponentName = 'BoardComponent' as const;
export type BoardComponent = Component<typeof BoardComponentName, Size>;

// . CAMERA

export const CameraComponentName = 'CameraComponent' as const;
export type CameraComponent = Component<typeof CameraComponentName, {}>;

// . INPUT

export const HandComponentName = 'HandComponent' as const;
export type HandComponent = Component<
  typeof HandComponentName,
  {
    onBoardPosition: {
      current: Vector2;
      previous: Vector2;
    };
    onCameraPosition: {
      current: Vector2;
      previous: Vector2;
    };
    click: {
      current: {
        down: boolean;
      };
      previous: {
        down: boolean;
      };
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

export const OwnerComponentName = 'OwnerComponent';
export type OwnerComponent = Component<typeof OwnerComponentName, {}>;

// . GAME OBJECT

export const GameObjectComponentName = 'GameObjectComponent';
export type GameObjectComponent = Component<typeof GameObjectComponentName, {}>;

export const PositionComponentName = 'PositionComponent';
export type PositionComponent = Component<typeof PositionComponentName, Vector3>;

export const ImageComponentName = 'ImageComponent';
export type ImageComponent = Component<
  typeof ImageComponentName,
  {
    url: string;
  }
>;

export const SizeComponentName = 'SizeComponent';
export type SizeComponent = Component<typeof SizeComponentName, Size>;

export const SelectableComponentName = 'SelectableComponent';
export type SelectableComponent = Component<typeof SelectableComponentName, {}>;

export const IsSelectedComponentName = 'IsSelectedComponent';
export type IsSelectedComponent = Component<typeof IsSelectedComponentName, {}>;

export const LockableComponentName = 'LockableComponent';
export type LockableComponent = Component<typeof LockableComponentName, {}>;

export const IsLockedComponentName = 'IsLockedComponent';
export type IsLockedComponent = Component<typeof IsLockedComponentName, {}>;

export const DraggableComponentName = 'DraggableComponent';
export type DraggableComponent = Component<typeof DraggableComponentName, {}>;

export const IsDraggingComponentName = 'IsDraggingComponent';
export type IsDraggingComponent = Component<typeof IsDraggingComponentName, {}>;

export const DeletableComponentName = 'DeletableComponent';
export type DeletableComponent = Component<typeof DeletableComponentName, {}>;

export const ScaleComponentName = 'ScaleComponent';
export type ScaleComponent = Component<typeof ScaleComponentName, Vector2>;

// .. SPAWN EVENTS

export const SpawnGameObjectEventComponentName = 'SpawnGameObjectEventComponent';
export type SpawnGameObjectEventComponent = Component<
  typeof SpawnGameObjectEventComponentName,
  Square & {
    draggable: boolean;
    selectable: boolean;
    lockable: boolean;
    imageUrl: string;
    deletable: boolean;
  }
>;

// .. Events

export const ZoomInEventComponentName = 'ZoomInEventComponent';
export type ZoomInEventComponent = Component<typeof ZoomInEventComponentName, {}>;

export const ZoomOutEventComponentName = 'ZoomOutEventComponent';
export type ZoomOutEventComponent = Component<typeof ZoomOutEventComponentName, {}>;

export const FlippableComponentName = 'FlippableComponent';
export type FlippableComponent = Component<
  typeof FlippableComponentName,
  {
    currentSide: 'front' | 'back';
    front: {
      url: string;
    };
    back: {
      url: string;
    };
  }
>;

export const FlipEventComponentName = 'FlipEventComponent';
export type FlipEventComponent = Component<
  typeof FlipEventComponentName,
  {
    entityId: EntityId;
  }
>;

export const ViewChangeableComponentName = 'ViewChangeableComponent';
export type ViewChangeableComponent = Component<
  typeof ViewChangeableComponentName,
  {
    current: number;
    views: { url: string }[];
  }
>;

export const ChangeViewEventComponentName = 'ChangeViewEventComponent';
export type ChangeViewEventComponent = Component<
  typeof ChangeViewEventComponentName,
  {
    entityId: EntityId;
  }
>;

// . UNMATCHED COMPONENTS

export const HeroSetDeletableComponentName = 'HeroSetDeletableComponent';
export type HeroSetDeletableComponent = Component<
  typeof HeroSetDeletableComponentName,
  {
    setEntityId: EntityId;
  }
>;

export const DeleteHeroSetEventComponentName = 'DeleteHeroSetEventComponent';
export type DeleteHeroSetEventComponent = Component<
  typeof DeleteHeroSetEventComponentName,
  {
    setEntityId: EntityId;
  }
>;

export const GameMapComponentName = 'GameMapComponent';
export type GameMapComponent = Component<
  typeof GameMapComponentName,
  {
    mapId: MapId;
  }
>;

export const HeroComponentName = 'HeroComponent';
export type HeroComponent = Component<
  typeof HeroComponentName,
  {
    heroSetEntityId: EntityId;
    heroId: HeroId;
  }
>;

export const SidekickComponentName = 'SidekickComponent';
export type SidekickComponent = Component<
  typeof SidekickComponentName,
  {
    heroSetEntityId: EntityId;
    sidekickId: SidekickId;
  }
>;

export const DeckComponentName = 'DeckComponent';
export type DeckComponent = Component<
  typeof DeckComponentName,
  Deck & {
    heroSetEntityId: EntityId;
  }
>;

export const CardComponentName = 'CardComponent';
export type CardComponent = Component<
  typeof CardComponentName,
  {
    heroSetEntityId: EntityId;
    cardId: CardId;
    deckEntityId: EntityId;
    card: Card;
  }
>;

export const RuleCardComponentName = 'RuleCardComponent';
export type RuleCardComponent = Component<
  typeof RuleCardComponentName,
  {
    heroSetEntityId: EntityId;
    ruleCardId: RuleCardId;
  }
>;

export const HealthMeterComponentName = 'HealthMeterComponent';
export type HealthMeterComponent = Component<
  typeof HealthMeterComponentName,
  {
    heroSetEntityId: EntityId;
    healthMeterId: HealthMeterId;
    maxHealth: number;
    currentHealth: number;
  }
>;

export const HeroSetComponentName = 'HeroSetComponent';
export type HeroSetComponent = Component<
  typeof HeroSetComponentName,
  {
    boundedEntityIds: EntityId[];
  }
>;

// .. SPAWN EVENTS

export const SpawnGameMapEventComponentName = 'SpawnGameMapEventComponent';
export type SpawnGameMapEventComponent = Component<
  typeof SpawnGameMapEventComponentName,
  {
    url: string;
    mapId: MapId;
    x: number;
    y: number;
  }
>;

export const SpawnHeroEventComponentName = 'SpawnHeroEventComponent';
export type SpawnHeroEventComponent = Component<
  typeof SpawnHeroEventComponentName,
  {
    heroSetEntityId: EntityId;
    heroId: HeroId;
    x: number;
    y: number;
    views: { url: string }[];
  }
>;

export const SpawnSideKickEventComponentName = 'SpawnSideKickEventComponent';
export type SpawnSideKickEventComponent = Component<
  typeof SpawnSideKickEventComponentName,
  {
    heroSetEntityId: EntityId;
    views: { url: string }[];
    sidekickId: SidekickId;
    x: number;
    y: number;
  }
>;

export const SpawnDeckEventComponentName = 'SpawnDeckEventComponent';
export type SpawnDeckEventComponent = Component<
  typeof SpawnDeckEventComponentName,
  {
    heroSetEntityId: EntityId;
    url: string;
    setId: SetId;
    deckId: DeckId;
    x: number;
    y: number;
  }
>;

export const SpawnCardEventComponentName = 'SpawnCardEventComponent';
export type SpawnCardEventComponent = Component<
  typeof SpawnCardEventComponentName,
  {
    heroSetEntityId: EntityId;
    frontSideUrl: string;
    backSideUrl: string;
    cardId: CardId;
    x: number;
    y: number;
    deckEntityId: EntityId;
    card: Card;
  }
>;

export const SpawnRuleCardEventComponentName = 'SpawnRuleCardEventComponent';
export type SpawnRuleCardEventComponent = Component<
  typeof SpawnRuleCardEventComponentName,
  {
    heroSetEntityId: EntityId;
    url: string;
    ruleCardId: RuleCardId;
    x: number;
    y: number;
  }
>;

export const SpawnHealthMeterEventComponentName = 'SpawnHealthMeterEventComponent';
export type SpawnHealthMeterEventComponent = Component<
  typeof SpawnHealthMeterEventComponentName,
  {
    heroSetEntityId: EntityId;
    url: string;
    healthMeterId: HealthMeterId;
    maxValue: number;
    x: number;
    y: number;
  }
>;

export const SpawnHeroSetEventComponentName = 'SpawnHeroSetEventComponent';
export type SpawnHeroSetEventComponent = Component<
  typeof SpawnHeroSetEventComponentName,
  {
    setId: SetId;
    x: number;
    y: number;
  }
>;

export const TakeCardFromDeckEventComponentName = 'TakeCardFromDeckEventComponent';
export type TakeCardFromDeckEventComponent = Component<
  typeof TakeCardFromDeckEventComponentName,
  {
    deckEntityId: EntityId;
  }
>;

// . UI

export const PanModeComponentName = 'PanModeComponent';
export type PanModeComponent = Component<typeof PanModeComponentName, Record<any, any>>;

// .. REACT COMPONENTS

export const ReactPositionComponentName = 'ReactPositionComponent';
export type ReactPositionComponentData = Vector2;
export type ReactPositionComponent = ReactComponent<typeof ReactPositionComponentName, ReactPositionComponentData>;

export const ReactSizeComponentName = 'ReactSizeComponent';
export type ReactSizeComponentData = Size;
export type ReactSizeComponent = ReactComponent<typeof ReactSizeComponentName, ReactSizeComponentData>;

export const ReactScaleComponentName = 'ReactScaleComponent';
export type ReactScaleComponentData = Vector2;
export type ReactScaleComponent = ReactComponent<typeof ReactScaleComponentName, ReactScaleComponentData>;

export const ReactImageComponentName = 'ReactImageComponent';
export type ReactImageComponentData = { url: string };
export type ReactImageComponent = ReactComponent<typeof ReactImageComponentName, ReactImageComponentData>;

export const ReactGameMapComponentName = 'ReactGameMapComponent';
export type ReactGameMapComponent = Component<typeof ReactGameMapComponentName, {}>;
export const ReactHeroComponentName = 'ReactHeroComponent';
export type ReactHeroComponent = Component<typeof ReactHeroComponentName, {}>;
