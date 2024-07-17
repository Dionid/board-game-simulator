import { ComponentFactory } from '../../../ecs/component';
import { UUID } from '../../../branded-types';
import { Size, Vector2, Vector3 } from '../../../math';

// # PLAYERS

export const PlayerComponent = ComponentFactory<
  'PlayerComponent',
  {
    id: string;
  }
>('PlayerComponent');

/**
  @desc Give us a way to understand what our player owns (like cards)
**/
export const OwnerComponent = ComponentFactory<
  'OwnerComponent',
  {
    playerId: string;
  }
>('OwnerComponent');

// # Input

export const FingerComponent = ComponentFactory<
  'FingerComponent',
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
>('FingerComponent');

// # CAMERA

export const CameraComponent = ComponentFactory<'CameraComponent', boolean>('CameraComponent');

export const PanModeComponent = ComponentFactory<
  'PanModeComponent',
  {
    activated: boolean;
  }
>('PanModeComponent');

// # GEOMETRY

export const PositionComponent = ComponentFactory<'PositionComponent', Vector3>('PositionComponent');
export const SizeComponent = ComponentFactory<'SizeComponent', Size>('SizeComponent');
export const ScaleComponent = ComponentFactory<'ScaleComponent', Vector2>('ScaleComponent');

// . GAME OBJECT

export const GameObjectComponent = ComponentFactory<'GameObject', boolean>('GameObject');

export const DepthComponent = ComponentFactory<
  'DepthComponent',
  {
    highest: number;
  }
>('DepthComponent');

export const ImageComponent = ComponentFactory<
  'ImageComponent',
  {
    url: string;
  }
>('ImageComponent');

export const MultipleImagesComponent = ComponentFactory<
  'MultipleImagesComponent',
  {
    current: number;
    images: string[];
  }
>('MultipleImagesComponent');

export const GroupComponent = ComponentFactory<
  'GroupComponent',
  {
    id: UUID;
  }
>('GroupComponent');

// export const DynamicDepthComponentName = 'DynamicDepthComponent';
// export type DynamicDepthComponent = Component<typeof DynamicDepthComponentName, {}>;

// export const DepthComponentName = 'DepthComponent';
// export type DepthComponent = Component<
//   typeof DepthComponentName,
//   {
//     list: EntityId[];
//   }
// >;

// # ACTIONS ON GO

export const SelectableComponent = ComponentFactory<'SelectableComponent', boolean>('SelectableComponent');
export const IsSelectedComponent = ComponentFactory<'IsSelectedComponent', boolean>('IsSelectedComponent');
export const LockableComponent = ComponentFactory<'LockableComponent', boolean>('LockableComponent');
export const IsLockedComponent = ComponentFactory<'IsLockedComponent', boolean>('IsLockedComponent');
export const DraggableComponent = ComponentFactory<'DraggableComponent', boolean>('DraggableComponent');
export const IsDraggingComponent = ComponentFactory<'IsDraggingComponent', boolean>('IsDraggingComponent');
export const DeletableComponent = ComponentFactory<'DeletableComponent', boolean>('DeletableComponent');

// # BOARD GAME SPECIFICS

// ## CARDS

// export const DeckComponent = ComponentFactory<
//   "DeckComponent",
//   {
//     id: UUID;
//     cards: Card[];
//   }
// >("DeckComponent");

// export const CardComponent = ComponentFactory<
//   "CardComponent",
//   {
//     // heroSetEntityId: EntityId;
//     // cardId: UUID;
//     // deckEntityId: EntityId;
//     // card: Card;
//   }
// >("CardComponent");

export const FlippableComponent = ComponentFactory<
  'FlippableComponent',
  {
    currentSide: 'front' | 'back';
    front: {
      url: string;
    };
    back: {
      url: string;
    };
  }
>('FlippableComponent');

export const CounterComponent = ComponentFactory<
  'CounterComponent',
  {
    min: number;
    max: number;
    current: number;
  }
>('CounterComponent');

// // .. SPAWN EVENTS

// export const SpawnGameObjectEventComponentName = 'SpawnGameObjectEventComponent';
// export type SpawnGameObjectEventComponent = Component<
//   typeof SpawnGameObjectEventComponentName,
//   Square & {
//     draggable: boolean;
//     selectable: boolean;
//     lockable: boolean;
//     imageUrl: string;
//     deletable: boolean;
//     dynamicDepth: boolean;
//   }
// >;

// // .. Events

// export const ZoomInEventComponentName = 'ZoomInEventComponent';
// export type ZoomInEventComponent = Component<typeof ZoomInEventComponentName, {}>;

// export const ZoomOutEventComponentName = 'ZoomOutEventComponent';
// export type ZoomOutEventComponent = Component<typeof ZoomOutEventComponentName, {}>;

// export const FlipEventComponentName = 'FlipEventComponent';
// export type FlipEventComponent = Component<
//   typeof FlipEventComponentName,
//   {
//     entityId: EntityId;
//   }
// >;

// export const ViewChangeableComponentName = 'ViewChangeableComponent';
// export type ViewChangeableComponent = Component<
//   typeof ViewChangeableComponentName,
//   {
//     current: number;
//     views: { url: string }[];
//   }
// >;

// export const ChangeViewEventComponentName = 'ChangeViewEventComponent';
// export type ChangeViewEventComponent = Component<
//   typeof ChangeViewEventComponentName,
//   {
//     entityId: EntityId;
//   }
// >;

// // . UNMATCHED COMPONENTS

// export const HeroSetDeletableComponentName = 'HeroSetDeletableComponent';
// export type HeroSetDeletableComponent = Component<
//   typeof HeroSetDeletableComponentName,
//   {
//     setEntityId: EntityId;
//   }
// >;

// export const DeleteHeroSetEventComponentName = 'DeleteHeroSetEventComponent';
// export type DeleteHeroSetEventComponent = Component<
//   typeof DeleteHeroSetEventComponentName,
//   {
//     setEntityId: EntityId;
//   }
// >;

// export const GameMapComponentName = 'GameMapComponent';
// export type GameMapComponent = Component<
//   typeof GameMapComponentName,
//   {
//     mapId: MapId;
//   }
// >;

// export const HeroComponentName = 'HeroComponent';
// export type HeroComponent = Component<
//   typeof HeroComponentName,
//   {
//     heroSetEntityId: EntityId;
//     heroId: HeroId;
//   }
// >;

// export const SidekickComponentName = 'SidekickComponent';
// export type SidekickComponent = Component<
//   typeof SidekickComponentName,
//   {
//     heroSetEntityId: EntityId;
//     sidekickId: SidekickId;
//   }
// >;

// export const DeckComponentName = 'DeckComponent';
// export type DeckComponent = Component<
//   typeof DeckComponentName,
//   Deck & {
//     heroSetEntityId: EntityId;
//   }
// >;

// export const CardComponentName = 'CardComponent';
// export type CardComponent = Component<
//   typeof CardComponentName,
//   {
//     heroSetEntityId: EntityId;
//     cardId: CardId;
//     deckEntityId: EntityId;
//     card: Card;
//   }
// >;

// export const RuleCardComponentName = 'RuleCardComponent';
// export type RuleCardComponent = Component<
//   typeof RuleCardComponentName,
//   {
//     heroSetEntityId: EntityId;
//     ruleCardId: RuleCardId;
//   }
// >;

// export const HealthMeterComponentName = 'HealthMeterComponent';
// export type HealthMeterComponent = Component<
//   typeof HealthMeterComponentName,
//   {
//     heroSetEntityId: EntityId;
//     healthMeterId: HealthMeterId;
//     maxHealth: number;
//     currentHealth: number;
//   }
// >;

// export const DecrementCurrentHealthEventComponentName = 'DecrementCurrentHealthEventComponent';
// export type DecrementCurrentHealthEventComponent = Component<
//   typeof DecrementCurrentHealthEventComponentName,
//   {
//     healthMeterEntityId: EntityId;
//   }
// >;

// export const IncrementCurrentHealthEventComponentName = 'IncrementCurrentHealthEventComponent';
// export type IncrementCurrentHealthEventComponent = Component<
//   typeof IncrementCurrentHealthEventComponentName,
//   {
//     healthMeterEntityId: EntityId;
//   }
// >;

// export const HeroSetComponentName = 'HeroSetComponent';
// export type HeroSetComponent = Component<
//   typeof HeroSetComponentName,
//   {
//     boundedEntityIds: EntityId[];
//   }
// >;

// // .. SPAWN EVENTS

// export const SpawnGameMapEventComponentName = 'SpawnGameMapEventComponent';
// export type SpawnGameMapEventComponent = Component<
//   typeof SpawnGameMapEventComponentName,
//   {
//     url: string;
//     mapId: MapId;
//     x: number;
//     y: number;
//   }
// >;

// export const SpawnHeroEventComponentName = 'SpawnHeroEventComponent';
// export type SpawnHeroEventComponent = Component<
//   typeof SpawnHeroEventComponentName,
//   {
//     heroSetEntityId: EntityId;
//     heroId: HeroId;
//     x: number;
//     y: number;
//     views: { url: string }[];
//   }
// >;

// export const SpawnSideKickEventComponentName = 'SpawnSideKickEventComponent';
// export type SpawnSideKickEventComponent = Component<
//   typeof SpawnSideKickEventComponentName,
//   {
//     heroSetEntityId: EntityId;
//     views: { url: string }[];
//     sidekickId: SidekickId;
//     x: number;
//     y: number;
//   }
// >;

// export const SpawnDeckEventComponentName = 'SpawnDeckEventComponent';
// export type SpawnDeckEventComponent = Component<
//   typeof SpawnDeckEventComponentName,
//   {
//     heroSetEntityId: EntityId;
//     url: string;
//     setId: SetId;
//     deckId: DeckId;
//     x: number;
//     y: number;
//   }
// >;

// export const SpawnCardEventComponentName = 'SpawnCardEventComponent';
// export type SpawnCardEventComponent = Component<
//   typeof SpawnCardEventComponentName,
//   {
//     heroSetEntityId: EntityId;
//     frontSideUrl: string;
//     backSideUrl: string;
//     cardId: CardId;
//     x: number;
//     y: number;
//     deckEntityId: EntityId;
//     card: Card;
//   }
// >;

// export const SpawnRuleCardEventComponentName = 'SpawnRuleCardEventComponent';
// export type SpawnRuleCardEventComponent = Component<
//   typeof SpawnRuleCardEventComponentName,
//   {
//     heroSetEntityId: EntityId;
//     url: string;
//     ruleCardId: RuleCardId;
//     x: number;
//     y: number;
//   }
// >;

// export const SpawnHealthMeterEventComponentName = 'SpawnHealthMeterEventComponent';
// export type SpawnHealthMeterEventComponent = Component<
//   typeof SpawnHealthMeterEventComponentName,
//   {
//     heroSetEntityId: EntityId;
//     url: string;
//     healthMeterId: HealthMeterId;
//     maxValue: number;
//     x: number;
//     y: number;
//   }
// >;

// export const SpawnHeroSetEventComponentName = 'SpawnHeroSetEventComponent';
// export type SpawnHeroSetEventComponent = Component<
//   typeof SpawnHeroSetEventComponentName,
//   {
//     setId: SetId;
//     x: number;
//     y: number;
//   }
// >;

// export const TakeCardFromDeckEventComponentName = 'TakeCardFromDeckEventComponent';
// export type TakeCardFromDeckEventComponent = Component<
//   typeof TakeCardFromDeckEventComponentName,
//   {
//     deckEntityId: EntityId;
//   }
// >;

// // . UI

// export const PanModeComponentName = 'PanModeComponent';
// export type PanModeComponent = Component<typeof PanModeComponentName, Record<any, any>>;

// // .. REACT COMPONENTS

// export const ReactPositionComponentName = 'ReactPositionComponent';
// export type ReactPositionComponentData = Vector2;
// export type ReactPositionComponent = ReactComponent<typeof ReactPositionComponentName, ReactPositionComponentData>;

// export const ReactSizeComponentName = 'ReactSizeComponent';
// export type ReactSizeComponentData = Size;
// export type ReactSizeComponent = ReactComponent<typeof ReactSizeComponentName, ReactSizeComponentData>;

// export const ReactScaleComponentName = 'ReactScaleComponent';
// export type ReactScaleComponentData = Vector2;
// export type ReactScaleComponent = ReactComponent<typeof ReactScaleComponentName, ReactScaleComponentData>;

// export const ReactImageComponentName = 'ReactImageComponent';
// export type ReactImageComponentData = { url: string };
// export type ReactImageComponent = ReactComponent<typeof ReactImageComponentName, ReactImageComponentData>;

// export const ReactGameMapComponentName = 'ReactGameMapComponent';
// export type ReactGameMapComponent = ReactComponent<typeof ReactGameMapComponentName, {}>;

// export const ReactHeroComponentName = 'ReactHeroComponent';
// export type ReactHeroComponent = ReactComponent<typeof ReactHeroComponentName, {}>;

// export const ReactHealthMeterComponentName = 'ReactHealthMeterComponent';
// export type ReactHealthMeterComponentData = { current: number };
// export type ReactHealthMeterComponent = ReactComponent<
//   typeof ReactHealthMeterComponentName,
//   ReactHealthMeterComponentData
// >;
