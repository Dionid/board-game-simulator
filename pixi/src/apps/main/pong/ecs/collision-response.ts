import { componentByEntity, registerTopic, System } from '../../../../libs/tecs';
import { willCollideTopic } from '../../../../libs/tengine/collision';
import { Acceleration, Position, Velocity } from '../../../../libs/tengine/ecs';
import { Game } from '../../../../libs/tengine/game';

export type T = {};

// export const responseToCollision = (game: Game): System => {
//   const { essence } = game;
//   registerTopic(essence, collidingTopic);

//   return () => {
//     for (const collisionEvent of collidingTopic) {
//       const { a, b } = collisionEvent;

//       const aAcceleration = componentByEntity(essence, a, Acceleration);
//       const aVelocity = componentByEntity(essence, a, Velocity);
//       const aPosition = componentByEntity(essence, a, Position);

//       const bAcceleration = componentByEntity(essence, b, Acceleration);
//       const bVelocity = componentByEntity(essence, b, Velocity);
//       const bPosition = componentByEntity(essence, b, Position);

//       if (!aAcceleration || !bAcceleration || !aVelocity || !bVelocity || !aPosition || !bPosition) {
//         continue;
//       }

//       aAcceleration.x *= -1;
//       aAcceleration.y *= -1;
//       bAcceleration.x *= -1;
//       bAcceleration.y *= -1;

//       aVelocity.x = 0;
//       aVelocity.y = 0;
//       bVelocity.x = 0;
//       bVelocity.y = 0;

//       aPosition.x -= 1;
//       //   aPosition.y += 10;

//       //   bPosition.x += 10;
//       //   bPosition.y += 10;
//     }
//   };
// };

// export const responseToCollision = (game: Game): System => {
//   const { essence } = game;
//   registerTopic(essence, willCollideTopic);

//   let collisionStartedEventsList: CollidingEvent[] = [];

//   let step = 0;

//   return ({ deltaTime }) => {
//     const temp: CollidingEvent[] = [];

//     for (const event of collidingTopic) {
//       if (
//         !collisionStartedEventsList.some((e) => {
//           return (e.a === event.a && e.b === event.b) || (e.a === event.b && e.b === event.a);
//         })
//       ) {
//         temp.push(event);
//         step = 0;
//       }
//     }

//     for (const event of temp) {
//       //   debugger;
//       const { a, b } = event;

//       const aAcceleration = componentByEntity(essence, a, Acceleration);
//       const aVelocity = componentByEntity(essence, a, Velocity);
//       const aPosition = componentByEntity(essence, a, Position);

//       const bAcceleration = componentByEntity(essence, b, Acceleration);
//       const bVelocity = componentByEntity(essence, b, Velocity);
//       const bPosition = componentByEntity(essence, b, Position);

//       if (!aAcceleration || !bAcceleration || !aVelocity || !bVelocity || !aPosition || !bPosition) {
//         continue;
//       }

//       aAcceleration.x *= -1;
//       aAcceleration.y *= -1;
//       bAcceleration.x *= -1;
//       bAcceleration.y *= -1;

//       aVelocity.x = 0;
//       aVelocity.y = 0;
//       bVelocity.x = 0;
//       bVelocity.y = 0;
//     }

//     //   collisionStartedEventsList = collisionStartedEventsList.filter((event) => {
//     //     return temp.some((e) => {
//     //       return (e.a === event.a && e.b === event.b) || (e.a === event.b && e.b === event.a);
//     //     });
//     //   });

//     if (step % 5 === 0) {
//       collisionStartedEventsList = [];
//     }

//     for (const event of temp) {
//       collisionStartedEventsList.push(event);
//     }

//     step++;
//   };
// };
