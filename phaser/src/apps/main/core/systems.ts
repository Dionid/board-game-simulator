// export const Clicked = (): System => {
//   return ({ world, deltaFrameTime }) => {
//     for (const event of clicked) {
//       const entity = spawnEntity(world);

//       const circle = new Graphics().circle(0, 0, 50).fill('red');
//       setComponent(world, entity, View);
//       setComponent(world, entity, pGraphics, { value: circle });
//       setComponent(world, entity, Position, { x: event.position.x, y: event.position.y });
//       setComponent(world, entity, Color, { value: 'red' });

//       circle.eventMode = 'static';
//       circle.on('pointerover', () => {
//         Topic.emit(viewEvents, { type: 'pointerOver', entity });
//       });
//     }
//   };
// };

// export const Draw = (world: World, ): System => {
//   const query = registerQuery(world, drawQuery);

//   return ({ world, deltaFrameTime }) => {
//     for (const archetype of query.archetypes) {
//       const positionT = table(archetype, Position);
//       const graphicsT = tryTable(archetype, pGraphics);
//       const colorT = tryTable(archetype, Color);

//       for (let i = 0, l = archetype.entities.length; i < l; i++) {
//         if (graphicsT) {
//           const graphics = graphicsT[i].value;

//           graphics.clear();
//           graphics.circle(positionT[i].x, positionT[i].y, 50);

//           if (colorT) {
//             graphics.fill(colorT[i].value);
//           }

//           if (graphics.parent === null) {
//             app.stage.addChild(graphics);
//           }
//         }
//       }
//     }

//     app.render();
//   };
// };

export type T = {};
