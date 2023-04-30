import Menu from '@mui/material/Menu';
import React, { FC } from 'react';
import { BgsWorld } from '../../libs/bgs/ecs';
import { Essence } from '../../libs/ecs/essence';
import { CreateBGCGameObjectEvent } from '../../libs/bgs/ecs/events';
import { ImageComponent } from '../../libs/bgs/ecs/components';
import { PositionComponent } from '../../libs/bgs/ecs/components';
import { SizeComponent } from '../../libs/bgs/ecs/components';
import { PersonAdd } from '@mui/icons-material';
import { MenuItem, ListItemIcon } from '@mui/material';
import { v4 } from 'uuid';
import { Pool } from '../../libs/ecs/component';
import { EntityId } from '../../libs/ecs/entity';

export const ContextMenu: FC<{ world: BgsWorld; cameraEntity: EntityId }> = (props) => {
  const { children, world, cameraEntity } = props;

  // CONTEXT MENU
  const [contextMenu, setContextMenu] = React.useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleContextMenu = (event: React.MouseEvent) => {
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

  const handleClose = () => {
    setContextMenu(null);
  };

  const spawnMap = () => {
    if (!contextMenu) {
      throw new Error(`Context menu must be not emtpy`);
    }

    const positionCP = Essence.getOrAddPool(world.essence, PositionComponent);
    const cameraPositionC = Pool.get(positionCP, cameraEntity);

    const size = {
      width: 750,
      height: 500,
    };
    const position = {
      x: contextMenu.x + cameraPositionC.props.x - size.width / 2,
      y: contextMenu.y + cameraPositionC.props.y - size.height / 2,
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

  const contextMenuActions = () => {
    // const actions: JSX.Element[] = [];

    const emptyActions = [
      <MenuItem key={v4()} onClick={spawnMap}>
        <ListItemIcon>
          <PersonAdd fontSize="small" />
        </ListItemIcon>
        Add Soho map
      </MenuItem>,
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

    return emptyActions;

    // if (!contextMenu) {
    //   return emptyActions;
    // }

    // const positionEntities = Essence.filter(world.essence, [
    //   'GameObjectComponent',
    //   'PositionComponent',
    //   'SizeComponent',
    // ]);
    // const positionComponentPool = Essence.getOrAddPool(world.essence, PositionComponentName);
    // const sizeComponentPool = Essence.getOrAddPool(world.essence, SizeComponentName);

    // const playerMouseEntities = Essence.filter(world.essence, [PlayerComponentName, HandComponentName]);
    // const handPool = Essence.getOrAddPool(world.essence, HandComponentName);
    // const playerMouseComponent = Pool.get(handPool, playerMouseEntities[0]);

    // const mouseOnEntities: EntityId[] = [];

    // positionEntities.forEach((entity) => {
    //   const positionComponent = Pool.get(positionComponentPool, entity);
    //   const sizeComponent = Pool.get(sizeComponentPool, entity);
    //   // . Is inside object zone, including camera position
    //   if (
    //     Square.isInside(
    //       { ...positionComponent.data, ...sizeComponent.data },
    //       playerMouseComponent.data.onBoardPosition.current
    //     )
    //   ) {
    //     mouseOnEntities.push(entity);
    //   }
    // });

    // if (mouseOnEntities.length === 0) {
    //   return emptyActions;
    // }

    // // TODO. REFACTORE TO SINGLETON
    // const depthCP = Essence.getOrAddPool(world.essence, DepthComponentName);
    // const depthE = Object.keys(depthCP.data).map((entity) => entity)[0] as EntityId;
    // const depthC = Pool.get(depthCP, depthE);

    // const filtered = depthC.data.list.filter((id) => mouseOnEntities.includes(id));

    // const maxZPositionEntity = filtered[filtered.length - 1];

    // if (maxZPositionEntity) {
    //   const deletableCP = Essence.getOrAddPool(world.essence, DeletableComponentName);
    //   if (Pool.tryGet(deletableCP, maxZPositionEntity)) {
    //     // . DELETE BUTTON
    //     actions.push(
    //       <MenuItem
    //         key={maxZPositionEntity + ':delete_button'}
    //         onClick={() => {
    //           handleClose();
    //           Essence.destroyEntity(world.essence, maxZPositionEntity);
    //           world.ctx.forceUpdate();
    //         }}
    //       >
    //         Delete
    //       </MenuItem>
    //     );
    //   }

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

    // return actions;
  };

  return (
    <div onContextMenu={handleContextMenu}>
      {children}
      <Menu
        open={contextMenu !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={contextMenu !== null ? { top: contextMenu.y, left: contextMenu.x } : undefined}
      >
        {contextMenuActions()}
      </Menu>
    </div>
  );
};
