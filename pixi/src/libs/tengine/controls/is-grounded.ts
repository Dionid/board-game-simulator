import {
  newSchema,
  newTag,
  number,
  removeComponent,
  setComponent,
  System,
  tryComponent,
} from 'libs/tecs';
import { Collider, collisionEndedTopic, collisionStartedTopic } from '../collision';

export const Ground = newTag('Ground');
export const GroundDetection = newTag('GroundDetection');

export const IsGrounded = newSchema(
  {
    entity: number,
    collider: Collider,
  },
  {
    name: 'IsGrounded',
  }
);

export const COLLIDER_GROUND_DETECTOR_TAG = 'ground-detector-collider';

export function isGrounded(): System {
  return ({ essence }) => {
    // # Add IsGrounded component
    for (const event of collisionStartedTopic) {
      const { a, b } = event;

      const aIsGroundDetectorCollider = a.collider.tags.some(
        (t) => t === COLLIDER_GROUND_DETECTOR_TAG
      );
      const bIsGroundDetectorCollider = b.collider.tags.some(
        (t) => t === COLLIDER_GROUND_DETECTOR_TAG
      );

      // # If both are not ground detector, skip
      if (!aIsGroundDetectorCollider && !bIsGroundDetectorCollider) {
        continue;
      }

      // # We can't check for having IsGrounded, because we will not be able
      // to reset to new ground from previous ground
      //   const aIsGrounded = tryComponent(a.archetype, a.entity, IsGrounded);
      //   const bIsGrounded = tryComponent(b.archetype, b.entity, IsGrounded);

      //   // # If already grounded, skip
      //   if (aIsGrounded || bIsGrounded) {
      //     continue;
      //   }

      const aGroundDetection = tryComponent(a.archetype, a.entity, GroundDetection);
      const bGroundDetection = tryComponent(b.archetype, b.entity, GroundDetection);

      // # If non has ground detection or both has ground detection, skip
      if ((!aGroundDetection && !bGroundDetection) || (aGroundDetection && bGroundDetection)) {
        continue;
      }

      const aGround = tryComponent(a.archetype, a.entity, Ground);
      const bGround = tryComponent(b.archetype, b.entity, Ground);

      // # If both are ground or both are not ground, skip
      if ((aGround && bGround) || (!aGround && !bGround)) {
        continue;
      }

      const groundDetection = aGroundDetection ? a : b;
      const ground = aGround ? a : b;

      console.log('Adding is grounded');

      setComponent(essence, groundDetection.entity, IsGrounded, {
        entity: ground.entity,
        collider: ground.collider,
      });
    }

    // # Remove IsGrounded component
    for (const event of collisionEndedTopic) {
      const { a, b } = event;

      const aIsGrounded = tryComponent(a.archetype, a.entity, IsGrounded);
      const bIsGrounded = tryComponent(b.archetype, b.entity, IsGrounded);

      // # If not already grounded, skip
      if (!aIsGrounded && !bIsGrounded) {
        continue;
      }

      const isGroundedComponent = aIsGrounded ?? bIsGrounded;

      if (!isGroundedComponent) {
        continue;
      }

      const aGround = tryComponent(a.archetype, a.entity, Ground);
      const bGround = tryComponent(b.archetype, b.entity, Ground);

      // # If both are ground or both are not ground, skip
      if ((aGround && bGround) || (!aGround && !bGround)) {
        continue;
      }

      const isGroundedCollision = aIsGrounded ? a : b;
      const ground = aGround ? a : b;

      // # If not grounded to the same entity, skip
      if (isGroundedComponent.entity !== ground.entity) {
        continue;
      }

      console.log('Removing is grounded');

      // # Remove IsGrounded component
      removeComponent(essence, isGroundedCollision.entity, IsGrounded);
    }
  };
}
