import { Container } from 'pixi.js';
import { initGame, newGame } from '../../../libs/tengine/game';
import { registerSystem, setComponent, spawnEntity } from '../../../libs/tecs';
import { mapKeyboardInput, mapMouseInput } from '../../../libs/tengine/ecs';
import { Player } from './ecs';
import { drawViews } from 'libs/tengine/render';
import { rapierDrawDebugLines } from 'libs/tengine/rapier/debug';
// import RAPIER from '@dimforge/rapier2d';

export async function initRapierPongGame(parentElement: HTMLElement) {
  const game = newGame({
    canvas: {
      parentElement,
      resizeTo: window,
    },
  });

  const RAPIER = await import('@dimforge/rapier2d-compat');

  await RAPIER.init();

  const physicsWorld = new RAPIER.World(new RAPIER.Vector2(0.0, 0.0));

  // Create the ground
  // let groundColliderDesc = RAPIER.ColliderDesc.cuboid(10.0, 0.1);
  // physicsWorld.createCollider(groundColliderDesc);

  // Create a dynamic rigid-body.
  let rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic()
    .setTranslation(100, 100)
    .setRotation(Math.PI / 4);
  // .setCen(new RAPIER.Vector2(0.0, 0.0));
  let rigidBody = physicsWorld.createRigidBody(rigidBodyDesc);

  // Create a cuboid collider attached to the dynamic rigidBody.
  let colliderDesc = RAPIER.ColliderDesc.cuboid(50, 50).setTranslation(0.0, 0.0).setRotation(0);
  let collider = physicsWorld.createCollider(colliderDesc, rigidBody);

  // let colliderDesc2 = RAPIER.ColliderDesc.cuboid(50, 50).setTranslation(50.0, 50.0);
  // let collider2 = physicsWorld.createCollider(colliderDesc2, rigidBody);

  await initGame(game, {
    backgroundColor: 0x000000,
  });

  const map = {
    container: new Container({
      label: 'map',
    }),
  };

  game.world.container.addChild(map.container);

  // # Initial Game Objects
  const characterSize = {
    width: 50,
    height: 100,
  };

  // # Player
  const playerEntity = spawnEntity(game.essence);

  // # Game Object
  setComponent(game.essence, playerEntity, Player);
  // # Visuals
  // setComponent(game.essence, playerEntity, View, {
  //   offset: { x: 0, y: 0 },
  //   scale: { x: 1, y: 1 },
  //   rotation: 0,
  //   anchor: { x: 0.5, y: 0.5 },
  //   model: {
  //     type: 'graphics',
  //     color: 'blue',
  //     shape: {
  //       type: 'rectangle',
  //       size: {
  //         width: characterSize.width,
  //         height: characterSize.height,
  //       },
  //     },
  //   },
  // });

  // # Systems
  // ...
  // ## Input
  registerSystem(game.essence, mapKeyboardInput(game));
  registerSystem(game.essence, mapMouseInput(game, map));

  // ## Game logic
  // registerSystem(game.essence, accelerateByArrows(game, playerEntity));

  // ## Collision & Physics
  registerSystem(game.essence, (world) => {
    physicsWorld.step();

    let position = rigidBody.translation();
    console.log('Rigid-body position: ', position.x, position.y);

    let colliderPosition = collider.translation();
    console.log('Collider position: ', colliderPosition.x, colliderPosition.y);

    debugger;

    // let colliderPosition2 = collider2.translation();
    // console.log('Collider 2 position: ', colliderPosition2.x, colliderPosition2.y);
  });

  // ## Render
  registerSystem(game.essence, drawViews(game));
  registerSystem(game.essence, rapierDrawDebugLines(map, physicsWorld));

  return game;
}
