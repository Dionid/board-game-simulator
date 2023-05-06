var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
var __read =
  (this && this.__read) ||
  function (o, n) {
    var m = typeof Symbol === 'function' && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o),
      r,
      ar = [],
      e;
    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    } catch (error) {
      e = { error: error };
    } finally {
      try {
        if (r && !r.done && (m = i['return'])) m.call(i);
      } finally {
        if (e) throw e.error;
      }
    }
    return ar;
  };
var __values =
  (this && this.__values) ||
  function (o) {
    var s = typeof Symbol === 'function' && Symbol.iterator,
      m = s && o[s],
      i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === 'number')
      return {
        next: function () {
          if (o && i >= o.length) o = void 0;
          return { value: o && o[i++], done: !o };
        },
      };
    throw new TypeError(s ? 'Object is not iterable.' : 'Symbol.iterator is not defined.');
  };
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import Menu from '@mui/material/Menu';
import React from 'react';
import { Essence } from '../../libs/ecs/essence';
import { CreateBGCGameObjectEvent } from '../../libs/bgs/ecs/events';
import {
  DeletableComponent,
  DepthComponent,
  FingerComponent,
  GameObjectComponent,
  ImageComponent,
} from '../../libs/bgs/ecs/components';
import { PositionComponent } from '../../libs/bgs/ecs/components';
import { SizeComponent } from '../../libs/bgs/ecs/components';
import { PersonAdd } from '@mui/icons-material';
import { MenuItem, ListItemIcon } from '@mui/material';
import { v4 } from 'uuid';
import { Pool } from '../../libs/ecs/component';
export var ContextMenu = function (props) {
  var children = props.children,
    world = props.world,
    cameraEntity = props.cameraEntity,
    playerEntity = props.playerEntity;
  // CONTEXT MENU
  var _a = __read(React.useState(null), 2),
    contextMenu = _a[0],
    setContextMenu = _a[1];
  var handleContextMenu = function (event) {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            x: event.clientX - 2,
            y: event.clientY - 4,
          }
        : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
          // Other native context menus might behave different.
          // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
          null
    );
  };
  var handleClose = function () {
    setContextMenu(null);
  };
  var spawnMap = function () {
    if (!contextMenu) {
      throw new Error('Context menu must be not emtpy');
    }
    var depthCP = Essence.getOrAddPool(world.essence, DepthComponent);
    var positionCP = Essence.getOrAddPool(world.essence, PositionComponent);
    var cameraPositionC = Pool.get(positionCP, cameraEntity);
    var gameObjectsDepthC = Pool.get(depthCP, playerEntity);
    var size = {
      width: 750,
      height: 500,
    };
    var position = {
      x: contextMenu.x + cameraPositionC.x - size.width / 2,
      y: contextMenu.y + cameraPositionC.y - size.height / 2,
      z: ++gameObjectsDepthC.highest,
    };
    Essence.addEvent(
      world.essence,
      CreateBGCGameObjectEvent.new({
        components: [
          {
            componentName: ImageComponent.name,
            component: ImageComponent.new({
              url: '/maps/soho.png',
            }),
          },
          {
            componentName: PositionComponent.name,
            component: PositionComponent.new(position),
          },
          {
            componentName: SizeComponent.name,
            component: SizeComponent.new(size),
          },
          {
            componentName: DeletableComponent.name,
            component: DeletableComponent.new(true),
          },
        ],
      })
    );
    handleClose();
  };
  // const spawnHeroSet = (setId: SetId) => {
  //   if (!contextMenu) {
  //     throw new Error(`Context menu must be not emtpy`);
  //   }
  //   const spawnHeroSetComponentPool = Essence.getOrAddPool(world.essence, SpawnHeroSetEventComponentName);
  //   Pool.add(spawnHeroSetComponentPool, EntityId.new(), {
  //     name: SpawnHeroSetEventComponentName,
  //     id: ComponentId.new(),
  //     data: {
  //       setId,
  //       x: contextMenu.x,
  //       y: contextMenu.y,
  //     },
  //   });
  //   handleClose();
  // };
  var contextMenuActions = function () {
    var e_1, _a;
    var actions = [];
    var emptyActions = [
      _jsxs(
        MenuItem,
        __assign(
          { onClick: spawnMap },
          { children: [_jsx(ListItemIcon, { children: _jsx(PersonAdd, { fontSize: 'small' }) }), 'Add Soho map'] }
        ),
        v4()
      ),
      // Object.keys(heroSets).map((id) => {
      //   return (
      //     <MenuItem key={id} onClick={() => spawnHeroSet(id as SetId)}>
      //       <ListItemIcon>
      //         <PersonAdd fontSize="small" />
      //       </ListItemIcon>
      //       Add {heroSets[id].name} Hero Set
      //     </MenuItem>
      //   );
      // }),
    ];
    if (!contextMenu) {
      return emptyActions;
    }
    var gos = Essence.getEntitiesByComponents(world.essence, [GameObjectComponent, PositionComponent, SizeComponent]);
    var positionCP = Essence.getOrAddPool(world.essence, PositionComponent);
    var sizeCP = Essence.getOrAddPool(world.essence, SizeComponent);
    var fingerPool = Essence.getOrAddPool(world.essence, FingerComponent);
    var playerFinger = Pool.get(fingerPool, playerEntity);
    var maximalZ = -1;
    var targetEntity = undefined;
    try {
      for (var gos_1 = __values(gos), gos_1_1 = gos_1.next(); !gos_1_1.done; gos_1_1 = gos_1.next()) {
        var entity = gos_1_1.value;
        var positionC = Pool.get(positionCP, entity);
        var sizeC = Pool.get(sizeCP, entity);
        if (
          positionC.x <= playerFinger.onBoardPosition.current.x &&
          positionC.x + sizeC.width >= playerFinger.onBoardPosition.current.x &&
          positionC.y <= playerFinger.onBoardPosition.current.y &&
          positionC.y + sizeC.height >= playerFinger.onBoardPosition.current.y
        ) {
          if (positionC.z > maximalZ) {
            targetEntity = entity;
          }
        }
      }
    } catch (e_1_1) {
      e_1 = { error: e_1_1 };
    } finally {
      try {
        if (gos_1_1 && !gos_1_1.done && (_a = gos_1.return)) _a.call(gos_1);
      } finally {
        if (e_1) throw e_1.error;
      }
    }
    // debugger
    if (!targetEntity) {
      return emptyActions;
    }
    // # From now on there is target entity
    var deletableCP = Essence.getOrAddPool(world.essence, DeletableComponent);
    if (Pool.tryGet(deletableCP, targetEntity)) {
      // . DELETE BUTTON
      actions.push(
        _jsx(
          MenuItem,
          __assign(
            {
              onClick: function () {
                if (!targetEntity) {
                  return;
                }
                handleClose();
                Essence.destroyEntity(world.essence, targetEntity);
              },
            },
            { children: 'Delete' }
          ),
          targetEntity + ':delete_button'
        )
      );
    }
    //   // . DECK ACTIONS
    //   const deckComponentPool = Essence.getOrAddPool(world.essence, DeckComponentName);
    //   const deckComponent = Pool.tryGet(deckComponentPool, maxZPositionEntity);
    //   if (deckComponent) {
    //     actions.push(
    //       <MenuItem
    //         key={maxZPositionEntity + ':deck:take_card'}
    //         onClick={() => {
    //           handleClose();
    //           const takeCardFromDeckEventCP = Essence.getOrAddPool(world.essence, TakeCardFromDeckEventComponentName);
    //           Pool.add(takeCardFromDeckEventCP, EntityId.new(), {
    //             id: ComponentId.new(),
    //             name: TakeCardFromDeckEventComponentName,
    //             data: {
    //               deckEntityId: maxZPositionEntity,
    //             },
    //           });
    //         }}
    //       >
    //         Take 1 card
    //       </MenuItem>
    //     );
    //     actions.push(
    //       <MenuItem
    //         key={maxZPositionEntity + ':deck:shuffle'}
    //         onClick={() => {
    //           handleClose();
    //           // TODO. Move to system
    //           Deck.shuffle(deckComponent.data);
    //         }}
    //       >
    //         Shuffle
    //       </MenuItem>
    //     );
    //   }
    //   // . CARD ACTIONS
    //   const cardComponentPool = Essence.getOrAddPool(world.essence, CardComponentName);
    //   const cardComponent = Pool.tryGet(cardComponentPool, maxZPositionEntity);
    //   if (cardComponent) {
    //     const deck = Pool.tryGet(deckComponentPool, cardComponent.data.deckEntityId);
    //     if (deck) {
    //       actions.push(
    //         <MenuItem
    //           key={maxZPositionEntity + ':deck:take_card'}
    //           onClick={() => {
    //             handleClose();
    //             deck.data.cards.push(cardComponent.data.card);
    //             Essence.destroyEntity(world.essence, maxZPositionEntity);
    //             world.ctx.forceUpdate();
    //           }}
    //         >
    //           Put on deck
    //         </MenuItem>
    //       );
    //     }
    //   }
    //   // . FLIPPABLE
    //   const flippablePool = Essence.getOrAddPool(world.essence, FlippableComponentName);
    //   const flippable = Pool.tryGet(flippablePool, maxZPositionEntity);
    //   if (flippable) {
    //     actions.push(
    //       <MenuItem
    //         key={maxZPositionEntity + ':flip'}
    //         onClick={() => {
    //           handleClose();
    //           const flipEventCP = Essence.getOrAddPool(world.essence, FlipEventComponentName);
    //           Pool.add(flipEventCP, EntityId.new(), {
    //             id: ComponentId.new(),
    //             name: FlipEventComponentName,
    //             data: {
    //               entityId: maxZPositionEntity,
    //             },
    //           });
    //         }}
    //       >
    //         Flip
    //       </MenuItem>
    //     );
    //   }
    //   // . VIEW CHANGEABLE
    //   const viewChangablePool = Essence.getOrAddPool(world.essence, ViewChangeableComponentName);
    //   const viewChangable = Pool.tryGet(viewChangablePool, maxZPositionEntity);
    //   if (viewChangable) {
    //     actions.push(
    //       <MenuItem
    //         key={maxZPositionEntity + ':flip'}
    //         onClick={() => {
    //           handleClose();
    //           const changeViewEventCP = Essence.getOrAddPool(world.essence, ChangeViewEventComponentName);
    //           Pool.add(changeViewEventCP, EntityId.new(), {
    //             id: ComponentId.new(),
    //             name: ChangeViewEventComponentName,
    //             data: {
    //               entityId: maxZPositionEntity,
    //             },
    //           });
    //         }}
    //       >
    //         Change view
    //       </MenuItem>
    //     );
    //   }
    //   // . DELETE HERO SET
    //   const heroSetDeletablePool = Essence.getOrAddPool(world.essence, HeroSetDeletableComponentName);
    //   const heroSetDeletable = Pool.tryGet(heroSetDeletablePool, maxZPositionEntity);
    //   if (heroSetDeletable) {
    //     actions.push(
    //       <MenuItem
    //         key={maxZPositionEntity + ':heroSetDeletable'}
    //         onClick={() => {
    //           handleClose();
    //           const deleteHeroSetCP = Essence.getOrAddPool(world.essence, DeleteHeroSetEventComponentName);
    //           Pool.add(deleteHeroSetCP, EntityId.new(), {
    //             id: ComponentId.new(),
    //             name: DeleteHeroSetEventComponentName,
    //             data: {
    //               setEntityId: heroSetDeletable?.data.setEntityId,
    //             },
    //           });
    //         }}
    //       >
    //         Delete hero set
    //       </MenuItem>
    //     );
    //   }
    //   // . (UN)LOCK BUTTON
    //   const lockableComponentPool = Essence.getOrAddPool(world.essence, LockableComponentName);
    //   const lockableComponent = Pool.tryGet(lockableComponentPool, maxZPositionEntity);
    //   if (lockableComponent) {
    //     const isLockedComponentPool = Essence.getOrAddPool(world.essence, IsLockedComponentName);
    //     const isLockedComponent = Pool.tryGet(isLockedComponentPool, maxZPositionEntity);
    //     if (isLockedComponent) {
    //       actions.push(
    //         <MenuItem
    //           key={maxZPositionEntity + ':lock_button'}
    //           onClick={() => {
    //             handleClose();
    //             Pool.delete(isLockedComponentPool, maxZPositionEntity);
    //           }}
    //         >
    //           Unlock
    //         </MenuItem>
    //       );
    //     } else {
    //       actions.push(
    //         <MenuItem
    //           key={maxZPositionEntity + ':lock_button'}
    //           onClick={() => {
    //             handleClose();
    //             Pool.add(isLockedComponentPool, maxZPositionEntity, {
    //               id: ComponentId.new(),
    //               name: 'IsLockedComponent',
    //               data: {},
    //             });
    //           }}
    //         >
    //           Lock
    //         </MenuItem>
    //       );
    //     }
    //   }
    // }
    return actions;
  };
  return _jsxs(
    'div',
    __assign(
      { onContextMenu: handleContextMenu },
      {
        children: [
          children,
          _jsx(
            Menu,
            __assign(
              {
                open: contextMenu !== null,
                onClose: handleClose,
                anchorReference: 'anchorPosition',
                anchorPosition: contextMenu !== null ? { top: contextMenu.y, left: contextMenu.x } : undefined,
              },
              { children: contextMenuActions() }
            )
          ),
        ],
      }
    )
  );
};
